---
title: "RAG Day 6: 프로덕션 배포와 최적화 - 실서비스 준비"
slug: "rag-day6-production"
excerpt: "RAG 시스템을 프로덕션에 배포하기 위한 RAG 평가 지표, 비용 최적화, 모니터링 방법을 알아봅니다. 실서비스 준비를 위한 완벽 가이드입니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "프로덕션 배포"
  - "비용 최적화"
  - "RAG 평가"
  - "모니터링"
language: "ko"
---

드디어 RAG 시리즈의 마지막 날입니다. 지금까지 임베딩, 벡터 DB, 검색 최적화를 배웠다면, 오늘은 실서비스 운영에 필요한 **RAG 평가**와 **모니터링** 전략을 다룹니다. 프로덕션 배포를 위해 비용 최적화와 안정적인 모니터링 시스템 구축이 핵심입니다.

## TL;DR

- **RAG 평가**는 정확도, 관련성, 충실도 3가지 핵심 지표로 측정
- **비용 최적화**는 임베딩 캐싱과 모델 선택이 핵심 전략
- **프로덕션 배포**에서 에러 처리와 모니터링은 필수 요소
- **모니터링** 시스템으로 RAG 평가를 자동화하고 품질 지속 관리
- **로깅과 메트릭**으로 프로덕션 배포 후 운영 안정성 확보

---

> 💡 저는 새로운 업무를 수행하는 분들이 조금 더 소프트 랜딩할 수 있도록 도와주는 챗봇으로 이 시스템을 활용하려고 합니다.
> 회사 내부 문서를 기반으로 신입 직원의 온보딩을 돕는 것이 목표입니다. 이를 위해 프로덕션 배포와 비용 최적화, 그리고 지속적인 모니터링이 매우 중요했습니다.

---

## 1. RAG 평가 지표

### 1.1 핵심 평가 지표

RAG 시스템의 품질을 측정하는 3가지 핵심 지표입니다:

```typescript
interface RAGEvaluationMetrics {
  // 1. 정확도 (Accuracy): 답변이 질문에 맞는가?
  accuracy: number;

  // 2. 관련성 (Relevance): 검색된 문서가 질문과 관련 있는가?
  relevance: number;

  // 3. 충실도 (Faithfulness): 답변이 문서 내용에 충실한가?
  faithfulness: number;
}

// RAG 평가 점수 계산
function calculateRAGScore(metrics: RAGEvaluationMetrics): number {
  const weights = {
    accuracy: 0.4,
    relevance: 0.3,
    faithfulness: 0.3,
  };

  return (
    metrics.accuracy * weights.accuracy +
    metrics.relevance * weights.relevance +
    metrics.faithfulness * weights.faithfulness
  );
}
```

### 1.2 RAG 평가 구현

```typescript
interface EvaluationCase {
  question: string;
  expectedAnswer: string;
  relevantDocIds: string[];
}

class RAGEvaluator {
  private rag: RAGGenerator;
  private testCases: EvaluationCase[];

  constructor(rag: RAGGenerator, testCases: EvaluationCase[]) {
    this.rag = rag;
    this.testCases = testCases;
  }

  async evaluate(): Promise<RAGEvaluationMetrics> {
    const results = await Promise.all(
      this.testCases.map(tc => this.evaluateCase(tc))
    );

    // 평균 점수 계산
    return {
      accuracy: this.average(results.map(r => r.accuracy)),
      relevance: this.average(results.map(r => r.relevance)),
      faithfulness: this.average(results.map(r => r.faithfulness)),
    };
  }

  private async evaluateCase(testCase: EvaluationCase) {
    const result = await this.rag.generate(testCase.question, []);

    return {
      accuracy: this.scoreAccuracy(result.content, testCase.expectedAnswer),
      relevance: this.scoreRelevance(result.citations, testCase.relevantDocIds),
      faithfulness: this.scoreFaithfulness(result.content, result.citations),
    };
  }

  private scoreAccuracy(answer: string, expected: string): number {
    // 의미적 유사도 계산 (실제로는 임베딩 비교 사용)
    const commonWords = this.getCommonWords(answer, expected);
    const totalWords = new Set([...answer.split(' '), ...expected.split(' ')]).size;
    return commonWords / totalWords;
  }

  private scoreRelevance(citations: Citation[], expectedDocIds: string[]): number {
    if (expectedDocIds.length === 0) return 1;
    const citedIds = citations.map(c => c.source);
    const matches = citedIds.filter(id => expectedDocIds.includes(id));
    return matches.length / expectedDocIds.length;
  }

  private scoreFaithfulness(answer: string, citations: Citation[]): number {
    // 답변에 출처가 있는지 확인
    if (citations.length === 0) return 0;
    const hasCitations = answer.includes('[문서');
    return hasCitations ? 1 : 0.5;
  }

  private getCommonWords(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    return [...wordsA].filter(w => wordsB.has(w)).length;
  }

  private average(nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
}
```

### 1.3 테스트 데이터셋 구축

프로덕션 배포 전 반드시 테스트 데이터셋을 구축해야 합니다:

```typescript
// 테스트 케이스 예시
const testCases: EvaluationCase[] = [
  {
    question: '휴가 신청은 어떻게 하나요?',
    expectedAnswer: 'HR 시스템에서 휴가 신청 메뉴를 통해 신청합니다.',
    relevantDocIds: ['hr-policy.md', 'leave-guide.md'],
  },
  {
    question: '신입 교육 일정은 어떻게 되나요?',
    expectedAnswer: '입사 첫 주에 오리엔테이션이 진행됩니다.',
    relevantDocIds: ['onboarding-guide.md'],
  },
  {
    question: '코드 리뷰 절차는?',
    expectedAnswer: 'PR 생성 후 최소 1명의 승인이 필요합니다.',
    relevantDocIds: ['dev-guide.md', 'code-review.md'],
  },
];

// RAG 평가 실행
async function runEvaluation() {
  const rag = new RAGGenerator({ anthropicApiKey: process.env.ANTHROPIC_API_KEY! });
  const evaluator = new RAGEvaluator(rag, testCases);

  const metrics = await evaluator.evaluate();

  console.log('=== RAG 평가 결과 ===');
  console.log(`정확도: ${(metrics.accuracy * 100).toFixed(1)}%`);
  console.log(`관련성: ${(metrics.relevance * 100).toFixed(1)}%`);
  console.log(`충실도: ${(metrics.faithfulness * 100).toFixed(1)}%`);
  console.log(`종합 점수: ${(calculateRAGScore(metrics) * 100).toFixed(1)}%`);
}
```

---

## 2. 비용 최적화

프로덕션 배포에서 비용 최적화는 지속 가능한 서비스 운영의 핵심입니다. 모니터링을 통해 비용을 추적하고 최적화 포인트를 찾아야 합니다.

### 2.1 비용 구조 이해

비용 최적화를 위해 먼저 시스템의 비용 구조를 이해해야 합니다:

```typescript
interface CostBreakdown {
  embedding: number;    // 임베딩 API 비용
  vectorStorage: number; // 벡터 DB 저장 비용
  llmGeneration: number; // LLM 답변 생성 비용
  total: number;
}

function estimateMonthlyCost(
  documentsCount: number,
  queriesPerDay: number
): CostBreakdown {
  // Voyage AI 임베딩: $0.10 / 1M tokens
  const avgTokensPerDoc = 500;
  const embeddingCost = (documentsCount * avgTokensPerDoc / 1_000_000) * 0.10;

  // Supabase: 무료 티어 또는 $25/month
  const vectorStorageCost = documentsCount > 500_000 ? 25 : 0;

  // Claude Sonnet: $3 / 1M input, $15 / 1M output
  const avgInputTokens = 2000; // 컨텍스트 포함
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
```

### 2.2 임베딩 캐싱

비용 최적화의 핵심은 임베딩 캐싱입니다:

```typescript
interface CacheEntry {
  embedding: number[];
  timestamp: number;
  ttl: number;
}

class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 10000, defaultTTL = 86400000) { // 24시간
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  private getKey(text: string): string {
    // 간단한 해시 (실제로는 crypto.createHash 사용)
    return Buffer.from(text).toString('base64').slice(0, 32);
  }

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

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // 실제 구현 시 히트/미스 추적 필요
    };
  }
}

// 캐싱이 적용된 임베딩 함수
class CachedEmbedder {
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

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
}
```

### 2.3 모델 선택 전략

비용 최적화를 위한 모델 선택 전략입니다:

```typescript
interface ModelConfig {
  name: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
}

const MODELS: Record<string, ModelConfig> = {
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

// 용도별 모델 선택
function selectModel(useCase: 'simple' | 'complex' | 'critical'): ModelConfig {
  switch (useCase) {
    case 'simple':
      // 단순 질문: Haiku (비용 최적화)
      return MODELS['claude-3-haiku'];
    case 'complex':
      // 복잡한 분석: Sonnet (균형)
      return MODELS['claude-sonnet-4'];
    case 'critical':
      // 중요 결정: Opus (최고 품질)
      return MODELS['claude-opus-4'];
  }
}
```

---

## 3. 프로덕션 배포

프로덕션 배포는 개발 환경에서 실서비스로 전환하는 핵심 단계입니다. 안정적인 프로덕션 배포를 위해 API 서버 구축, 에러 처리, 모니터링 시스템이 필요합니다.

### 3.1 API 서버 구축

프로덕션 배포를 위한 Express 기반 API 서버입니다:

```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// 보안 미들웨어
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// Rate limiting (비용 최적화 및 보안)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 20, // 분당 20요청
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// RAG 인스턴스
const rag = new RAGGenerator({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
});

// 메트릭 수집
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  avgResponseTime: 0,
  responseTimes: [] as number[],
};

// RAG 질의 엔드포인트
app.post('/api/query', async (req, res) => {
  const startTime = Date.now();
  metrics.totalRequests++;

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid question' });
    }

    // 검색 (실제로는 벡터 DB에서)
    const documents = await searchDocuments(question);

    // 답변 생성
    const answer = await rag.generate(question, documents);

    // 메트릭 업데이트
    const responseTime = Date.now() - startTime;
    metrics.successfulRequests++;
    metrics.responseTimes.push(responseTime);
    metrics.avgResponseTime = average(metrics.responseTimes);

    res.json({
      answer: answer.content,
      citations: answer.citations,
      metadata: {
        responseTime,
        documentsUsed: answer.metadata.documentsUsed,
      },
    });
  } catch (error) {
    metrics.failedRequests++;

    console.error('RAG query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    metrics: {
      totalRequests: metrics.totalRequests,
      successRate: metrics.totalRequests > 0
        ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(1) + '%'
        : 'N/A',
      avgResponseTime: metrics.avgResponseTime.toFixed(0) + 'ms',
    },
  });
});

// 메트릭 엔드포인트
app.get('/api/metrics', (req, res) => {
  res.json(metrics);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RAG API server running on port ${PORT}`);
});
```

### 3.2 에러 처리

프로덕션 배포에서 안정적인 에러 처리는 필수입니다:

```typescript
// 커스텀 에러 클래스
class RAGError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'RAGError';
  }
}

// 에러 타입 정의
const RAGErrors = {
  EMBEDDING_FAILED: (msg: string) =>
    new RAGError(msg, 'EMBEDDING_FAILED', 503, true),
  SEARCH_FAILED: (msg: string) =>
    new RAGError(msg, 'SEARCH_FAILED', 503, true),
  GENERATION_FAILED: (msg: string) =>
    new RAGError(msg, 'GENERATION_FAILED', 503, true),
  RATE_LIMITED: () =>
    new RAGError('Rate limit exceeded', 'RATE_LIMITED', 429, true),
  INVALID_INPUT: (msg: string) =>
    new RAGError(msg, 'INVALID_INPUT', 400, false),
};

// 재시도 로직
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러인지 확인
      if (error instanceof RAGError && !error.retryable) {
        throw error;
      }

      // Rate limit인 경우 더 오래 대기
      const waitTime = error instanceof RAGError && error.code === 'RATE_LIMITED'
        ? delay * attempt * 2
        : delay * attempt;

      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      await sleep(waitTime);
    }
  }

  throw lastError;
}

// 안전한 RAG 질의
async function safeQuery(
  rag: RAGGenerator,
  question: string,
  documents: Document[]
): Promise<FormattedAnswer | null> {
  try {
    return await withRetry(
      () => rag.generate(question, documents),
      3,
      1000
    );
  } catch (error) {
    if (error instanceof RAGError) {
      console.error(`RAG Error [${error.code}]: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}
```

### 3.3 모니터링 및 로깅

프로덕션 배포 후 모니터링은 시스템 안정성의 핵심입니다:

```typescript
import winston from 'winston';

// 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 프로덕션이 아닌 경우 콘솔 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// RAG 요청 로깅
interface RAGLogEntry {
  requestId: string;
  question: string;
  documentsRetrieved: number;
  responseTime: number;
  success: boolean;
  error?: string;
  citations: number;
}

function logRAGRequest(entry: RAGLogEntry) {
  logger.info('RAG Request', entry);
}

// 메트릭 수집기
class MetricsCollector {
  private metrics = {
    requests: {
      total: 0,
      success: 0,
      failed: 0,
    },
    latency: {
      p50: 0,
      p95: 0,
      p99: 0,
    },
    cache: {
      hits: 0,
      misses: 0,
    },
  };

  private latencies: number[] = [];

  recordRequest(success: boolean, latency: number) {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.failed++;
    }

    this.latencies.push(latency);
    this.updateLatencyPercentiles();
  }

  recordCacheHit(hit: boolean) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
  }

  private updateLatencyPercentiles() {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.latency.p50 = sorted[Math.floor(len * 0.5)] || 0;
    this.metrics.latency.p95 = sorted[Math.floor(len * 0.95)] || 0;
    this.metrics.latency.p99 = sorted[Math.floor(len * 0.99)] || 0;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests.total > 0
        ? this.metrics.requests.success / this.metrics.requests.total
        : 0,
      cacheHitRate: (this.metrics.cache.hits + this.metrics.cache.misses) > 0
        ? this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)
        : 0,
    };
  }
}

// 알림 시스템
interface Alert {
  level: 'warning' | 'critical';
  message: string;
  timestamp: Date;
}

class AlertManager {
  private alerts: Alert[] = [];
  private thresholds = {
    errorRate: 0.1,      // 10% 에러율
    latencyP95: 5000,    // 5초
    cacheHitRate: 0.5,   // 50% 미만
  };

  checkMetrics(metrics: ReturnType<MetricsCollector['getMetrics']>) {
    // 에러율 체크
    const errorRate = 1 - metrics.successRate;
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert('critical', `High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    // 지연 시간 체크
    if (metrics.latency.p95 > this.thresholds.latencyP95) {
      this.addAlert('warning', `High latency P95: ${metrics.latency.p95}ms`);
    }

    // 캐시 히트율 체크
    if (metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      this.addAlert('warning', `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    }
  }

  private addAlert(level: Alert['level'], message: string) {
    const alert = { level, message, timestamp: new Date() };
    this.alerts.push(alert);
    logger.warn('Alert triggered', alert);

    // 실제로는 Slack, PagerDuty 등으로 알림 전송
    this.sendNotification(alert);
  }

  private sendNotification(alert: Alert) {
    // Slack webhook, email 등으로 알림 전송
    console.log(`[ALERT] ${alert.level.toUpperCase()}: ${alert.message}`);
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }
}
```

---

## 4. 완전한 프로덕션 RAG 시스템

### 4.1 통합 구현

프로덕션 배포를 위한 완전한 RAG 시스템입니다:

```typescript
interface ProductionRAGConfig {
  anthropicApiKey: string;
  embeddingApiKey: string;
  vectorDbUrl: string;
  cacheSize?: number;
  maxRetries?: number;
  model?: string;
}

class ProductionRAG {
  private rag: RAGGenerator;
  private embedder: CachedEmbedder;
  private metrics: MetricsCollector;
  private alertManager: AlertManager;

  constructor(config: ProductionRAGConfig) {
    this.rag = new RAGGenerator({
      anthropicApiKey: config.anthropicApiKey,
      model: config.model || 'claude-sonnet-4-20250514',
    });

    this.embedder = new CachedEmbedder(
      async (text) => this.callEmbeddingAPI(text, config.embeddingApiKey),
      config.cacheSize || 10000
    );

    this.metrics = new MetricsCollector();
    this.alertManager = new AlertManager();
  }

  async query(question: string): Promise<FormattedAnswer | null> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 1. 질문 임베딩 (캐싱 적용)
      const queryEmbedding = await this.embedder.embed(question);

      // 2. 벡터 검색
      const documents = await this.vectorSearch(queryEmbedding);

      // 3. 답변 생성 (재시도 로직 적용)
      const answer = await withRetry(
        () => this.rag.generate(question, documents),
        3,
        1000
      );

      // 4. 메트릭 기록
      const latency = Date.now() - startTime;
      this.metrics.recordRequest(true, latency);

      logRAGRequest({
        requestId,
        question,
        documentsRetrieved: documents.length,
        responseTime: latency,
        success: true,
        citations: answer.citations.length,
      });

      return answer;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.recordRequest(false, latency);

      logRAGRequest({
        requestId,
        question,
        documentsRetrieved: 0,
        responseTime: latency,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        citations: 0,
      });

      // 알림 체크
      this.alertManager.checkMetrics(this.metrics.getMetrics());

      return null;
    }
  }

  getMetrics() {
    return this.metrics.getMetrics();
  }

  private async callEmbeddingAPI(text: string, apiKey: string): Promise<number[]> {
    // Voyage AI 임베딩 API 호출
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'voyage-3',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async vectorSearch(embedding: number[]): Promise<Document[]> {
    // 실제로는 Supabase/Pinecone 등에서 검색
    return [];
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
```

### 4.2 사용 예제

```typescript
// 프로덕션 RAG 시스템 초기화
const productionRAG = new ProductionRAG({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  embeddingApiKey: process.env.VOYAGE_API_KEY!,
  vectorDbUrl: process.env.SUPABASE_URL!,
  cacheSize: 10000,
  model: 'claude-sonnet-4-20250514',
});

// API 서버에서 사용
app.post('/api/query', async (req, res) => {
  const { question } = req.body;

  const answer = await productionRAG.query(question);

  if (answer) {
    res.json({ success: true, answer });
  } else {
    res.status(500).json({ success: false, error: 'Failed to generate answer' });
  }
});

// 주기적 모니터링
setInterval(() => {
  const metrics = productionRAG.getMetrics();
  console.log('=== RAG System Metrics ===');
  console.log(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
  console.log(`Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`Latency P95: ${metrics.latency.p95}ms`);
}, 60000); // 1분마다
```

---

## 마무리

이번 시리즈를 통해 RAG 시스템의 전체 구축 과정을 다뤘습니다:

1. **Day 1**: RAG 개념과 아키텍처
2. **Day 2**: 문서 처리와 청킹 전략
3. **Day 3**: 임베딩과 벡터 데이터베이스
4. **Day 4**: 검색 최적화와 리랭킹
5. **Day 5**: Claude 통합과 답변 생성
6. **Day 6**: 프로덕션 배포와 비용 최적화

프로덕션 배포에서 가장 중요한 것은:
- **RAG 평가**로 품질 지속 관리
- **비용 최적화**로 지속 가능한 운영
- **모니터링**으로 안정적인 서비스

이제 여러분만의 RAG 시스템을 구축하고 프로덕션에 배포할 준비가 되었습니다!

---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- **Day 6: 프로덕션 배포와 최적화** (현재 글)
