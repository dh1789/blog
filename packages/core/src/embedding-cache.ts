/**
 * 임베딩 캐시 및 비용 최적화 모듈
 *
 * RAG 시스템의 비용을 최적화하기 위한 캐싱 시스템과 모델 선택 전략을 제공합니다.
 * - 임베딩 캐싱으로 API 호출 절감
 * - 용도별 모델 선택으로 비용/품질 균형
 * - 비용 예측 도구
 */

/**
 * 캐시 엔트리 인터페이스
 */
export interface CacheEntry {
  embedding: number[];
  timestamp: number;
  ttl: number;
}

/**
 * 비용 구조 인터페이스
 */
export interface CostBreakdown {
  embedding: number;
  vectorStorage: number;
  llmGeneration: number;
  total: number;
}

/**
 * 모델 설정 인터페이스
 */
export interface ModelConfig {
  name: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
}

/**
 * 사용 가능한 모델 목록
 */
export const MODELS: Record<string, ModelConfig> = {
  'claude-3-haiku': {
    name: 'claude-3-haiku-20240307',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxTokens: 200000,
    speed: 'fast',
    quality: 'medium',
  },
  'claude-sonnet-4': {
    name: 'claude-sonnet-4-20250514',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    maxTokens: 200000,
    speed: 'medium',
    quality: 'high',
  },
  'claude-opus-4': {
    name: 'claude-opus-4-20250514',
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    maxTokens: 200000,
    speed: 'slow',
    quality: 'high',
  },
};

/**
 * 임베딩 캐시 클래스
 */
export class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 10000, defaultTTL = 86400000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 텍스트에서 캐시 키 생성
   */
  private getKey(text: string): string {
    // 간단한 Base64 해시 (프로덕션에서는 crypto.createHash 권장)
    return Buffer.from(text).toString('base64').slice(0, 32);
  }

  /**
   * 캐시에서 임베딩 조회
   */
  get(text: string): number[] | null {
    const key = this.getKey(text);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.embedding;
  }

  /**
   * 캐시에 임베딩 저장
   */
  set(text: string, embedding: number[], ttl = this.defaultTTL): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const key = this.getKey(text);
    this.cache.set(key, {
      embedding,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 가장 오래된 항목 제거
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 캐시 통계 반환
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

/**
 * 캐싱이 적용된 임베더 클래스
 */
export class CachedEmbedder {
  private cache: EmbeddingCache;
  private embedder: (text: string) => Promise<number[]>;
  private hits = 0;
  private misses = 0;

  constructor(
    embedder: (text: string) => Promise<number[]>,
    cacheSize = 10000
  ) {
    this.cache = new EmbeddingCache(cacheSize);
    this.embedder = embedder;
  }

  /**
   * 임베딩 생성 (캐시 우선)
   */
  async embed(text: string): Promise<number[]> {
    // 캐시 확인
    const cached = this.cache.get(text);
    if (cached) {
      this.hits++;
      return cached;
    }

    // 캐시 미스 - API 호출
    this.misses++;
    const embedding = await this.embedder(text);
    this.cache.set(text, embedding);

    return embedding;
  }

  /**
   * 캐시 히트율 반환
   */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
}

/**
 * 월간 비용 예측
 *
 * @param documentsCount - 문서 수
 * @param queriesPerDay - 일일 쿼리 수
 * @returns 비용 구조
 */
export function estimateMonthlyCost(
  documentsCount: number,
  queriesPerDay: number
): CostBreakdown {
  // Voyage AI 임베딩: $0.10 / 1M tokens
  const avgTokensPerDoc = 500;
  const embeddingCost = (documentsCount * avgTokensPerDoc / 1_000_000) * 0.10;

  // Supabase: 무료 티어 또는 $25/month
  const vectorStorageCost = documentsCount > 500_000 ? 25 : 0;

  // Claude Sonnet: $3 / 1M input, $15 / 1M output
  const avgInputTokens = 2000;
  const avgOutputTokens = 500;
  const monthlyQueries = queriesPerDay * 30;
  const llmCost =
    (monthlyQueries * avgInputTokens / 1_000_000) * 3 +
    (monthlyQueries * avgOutputTokens / 1_000_000) * 15;

  return {
    embedding: embeddingCost,
    vectorStorage: vectorStorageCost,
    llmGeneration: llmCost,
    total: embeddingCost + vectorStorageCost + llmCost,
  };
}

/**
 * 용도별 모델 선택
 *
 * @param useCase - 사용 용도
 * @returns 적절한 모델 설정
 */
export function selectModel(useCase: 'simple' | 'complex' | 'critical'): ModelConfig {
  switch (useCase) {
    case 'simple':
      return MODELS['claude-3-haiku'];
    case 'complex':
      return MODELS['claude-sonnet-4'];
    case 'critical':
      return MODELS['claude-opus-4'];
  }
}
