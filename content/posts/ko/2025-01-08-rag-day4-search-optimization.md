---
title: "RAG Day 4: 검색 최적화와 리랭킹 - 관련 문서 정확히 찾기"
slug: "rag-day4-search-optimization"
excerpt: "RAG 시스템의 검색 품질을 높이는 방법을 알아봅니다. 시맨틱 검색, 키워드 검색, 하이브리드 검색을 비교하고 리랭킹으로 검색 결과를 개선합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "시맨틱 검색"
  - "하이브리드 검색"
  - "리랭킹"
  - "검색 최적화"
  - "BM25"
language: "ko"
---

## TL;DR

- **시맨틱 검색**은 의미 기반으로 문서를 찾지만, 정확한 키워드 매칭에 약함
- **키워드 검색(BM25)**은 정확한 용어 매칭에 강하지만, 동의어나 문맥 이해 불가
- **하이브리드 검색**은 두 방식을 결합해 검색 품질을 크게 향상
- **리랭킹**은 검색 결과를 재정렬해 가장 관련성 높은 문서를 상위로
- 검색 파라미터 튜닝으로 RAG 시스템 성능 최적화
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. RAG 검색의 핵심 과제

### 1.1 검색이 왜 중요한가?

RAG 시스템에서 **검색 최적화**는 답변 품질을 결정하는 핵심 요소입니다. 아무리 좋은 LLM을 사용해도 잘못된 문서를 검색하면 잘못된 답변이 나옵니다.

```typescript
// 검색 품질이 RAG 품질을 결정
const query = "TypeScript에서 타입 가드 사용법";

// 나쁜 검색 결과 -> 나쁜 답변
const badResults = ["JavaScript 기초", "Python 타입 힌트"];

// 좋은 검색 결과 -> 좋은 답변
const goodResults = [
  "TypeScript 타입 가드 패턴",
  "사용자 정의 타입 가드 구현"
];
```

### 1.2 시맨틱 검색의 한계

Day 3에서 구현한 **시맨틱 검색**은 의미 기반으로 문서를 찾습니다. 하지만 몇 가지 한계가 있습니다:

```typescript
// 시맨틱 검색의 한계 예시
const query = "RFC 2119 MUST 키워드";

// 시맨틱 검색 결과 - 의미적으로 유사한 문서
const semanticResults = [
  "표준 문서 작성 가이드라인",  // 관련성: 중간
  "필수 요구사항 정의 방법",    // 관련성: 중간
  "문서화 모범 사례"           // 관련성: 낮음
];

// 실제로 원하는 문서
const expectedResult = "RFC 2119 표준 키워드 정의 - MUST, SHOULD, MAY";
```

**시맨틱 검색**의 문제점:
- 정확한 키워드(RFC 2119)를 놓칠 수 있음
- 고유명사, 약어에 취약
- 최신 용어나 도메인 특수 용어 인식 어려움

---

## 2. 검색 방식 비교

### 2.1 키워드 검색 (BM25)

**BM25**는 전통적인 키워드 기반 검색 알고리즘입니다. **검색 최적화**의 기본이 되는 방식입니다.

```typescript
// src/rag/retrievers/bm25-retriever.ts
import { BM25 } from 'bm25-ts';

export class BM25Retriever {
  private index: BM25;
  private documents: Document[];

  constructor() {
    this.index = new BM25();
    this.documents = [];
  }

  async index(documents: Document[]): Promise<void> {
    this.documents = documents;

    // 문서를 토큰화하여 인덱싱
    const tokenizedDocs = documents.map(doc =>
      this.tokenize(doc.content)
    );

    this.index.addDocuments(tokenizedDocs);
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    const tokens = this.tokenize(query);
    const scores = this.index.search(tokens);

    return scores
      .map((score, idx) => ({
        document: this.documents[idx],
        score,
        method: 'bm25' as const
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private tokenize(text: string): string[] {
    // 한국어 + 영어 토큰화
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }
}
```

**BM25**의 장점:
- 정확한 키워드 매칭
- 빠른 검색 속도
- 희귀 용어에 높은 가중치

### 2.2 시맨틱 검색 구현

**시맨틱 검색**은 벡터 유사도를 기반으로 의미적으로 관련된 문서를 찾습니다.

```typescript
// src/rag/retrievers/semantic-retriever.ts
import { SupabaseVectorStore } from '../stores/supabase-store';
import { VoyageEmbedder } from '../embedders/voyage-embedder';

export class SemanticRetriever {
  constructor(
    private vectorStore: SupabaseVectorStore,
    private embedder: VoyageEmbedder
  ) {}

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    // 쿼리를 벡터로 변환
    const queryVector = await this.embedder.embed(query, 'query');

    // 벡터 유사도 검색
    const results = await this.vectorStore.search(queryVector, topK);

    return results.map(result => ({
      document: result.document,
      score: result.similarity,
      method: 'semantic' as const
    }));
  }
}
```

### 2.3 하이브리드 검색

**하이브리드 검색**은 **BM25**와 **시맨틱 검색**을 결합합니다. 두 방식의 장점을 모두 활용해 **검색 최적화**를 달성합니다.

```typescript
// src/rag/retrievers/hybrid-retriever.ts
export interface HybridConfig {
  semanticWeight: number;  // 시맨틱 검색 가중치 (0-1)
  bm25Weight: number;      // BM25 가중치 (0-1)
  topK: number;
  fusionMethod: 'rrf' | 'weighted';
}

export class HybridRetriever {
  constructor(
    private semanticRetriever: SemanticRetriever,
    private bm25Retriever: BM25Retriever,
    private config: HybridConfig
  ) {}

  async search(query: string): Promise<SearchResult[]> {
    // 두 검색을 병렬로 실행
    const [semanticResults, bm25Results] = await Promise.all([
      this.semanticRetriever.search(query, this.config.topK * 2),
      this.bm25Retriever.search(query, this.config.topK * 2)
    ]);

    // 결과 융합
    if (this.config.fusionMethod === 'rrf') {
      return this.reciprocalRankFusion(semanticResults, bm25Results);
    }

    return this.weightedFusion(semanticResults, bm25Results);
  }

  // Reciprocal Rank Fusion - 순위 기반 융합
  private reciprocalRankFusion(
    semanticResults: SearchResult[],
    bm25Results: SearchResult[]
  ): SearchResult[] {
    const k = 60; // RRF 상수
    const scores = new Map<string, number>();

    // 시맨틱 검색 결과 점수 계산
    semanticResults.forEach((result, rank) => {
      const docId = result.document.id;
      const rrfScore = 1 / (k + rank + 1);
      scores.set(docId, (scores.get(docId) || 0) + rrfScore * this.config.semanticWeight);
    });

    // BM25 결과 점수 추가
    bm25Results.forEach((result, rank) => {
      const docId = result.document.id;
      const rrfScore = 1 / (k + rank + 1);
      scores.set(docId, (scores.get(docId) || 0) + rrfScore * this.config.bm25Weight);
    });

    // 점수순 정렬
    const allDocs = new Map([
      ...semanticResults.map(r => [r.document.id, r.document]),
      ...bm25Results.map(r => [r.document.id, r.document])
    ]);

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.topK)
      .map(([docId, score]) => ({
        document: allDocs.get(docId)!,
        score,
        method: 'hybrid' as const
      }));
  }

  // 가중치 기반 융합
  private weightedFusion(
    semanticResults: SearchResult[],
    bm25Results: SearchResult[]
  ): SearchResult[] {
    const scores = new Map<string, { score: number; document: Document }>();

    // 점수 정규화 및 가중치 적용
    const maxSemantic = Math.max(...semanticResults.map(r => r.score));
    const maxBm25 = Math.max(...bm25Results.map(r => r.score));

    semanticResults.forEach(result => {
      const normalizedScore = result.score / maxSemantic;
      const weightedScore = normalizedScore * this.config.semanticWeight;
      scores.set(result.document.id, {
        score: weightedScore,
        document: result.document
      });
    });

    bm25Results.forEach(result => {
      const normalizedScore = result.score / maxBm25;
      const weightedScore = normalizedScore * this.config.bm25Weight;
      const existing = scores.get(result.document.id);

      if (existing) {
        existing.score += weightedScore;
      } else {
        scores.set(result.document.id, {
          score: weightedScore,
          document: result.document
        });
      }
    });

    return Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topK)
      .map(item => ({
        document: item.document,
        score: item.score,
        method: 'hybrid' as const
      }));
  }
}
```

---

## 3. 검색 파라미터 튜닝

### 3.1 Top-K 설정

**검색 최적화**에서 top-k 값은 검색 결과 수를 결정합니다.

```typescript
// top-k 설정 가이드
interface TopKConfig {
  // 일반적인 Q&A
  simple: 3,

  // 복잡한 질문
  complex: 5,

  // 종합적인 분석
  comprehensive: 10,

  // 리랭킹 사용 시 (더 많이 검색 후 필터링)
  withReranking: 20
}

// 동적 top-k 결정
function determineTopK(query: string): number {
  const complexity = analyzeQueryComplexity(query);

  if (complexity.isMultiHop) return 10;
  if (complexity.requiresComparison) return 8;
  if (complexity.isFactual) return 3;

  return 5; // 기본값
}
```

### 3.2 유사도 임계값

낮은 유사도의 결과를 필터링합니다:

```typescript
// src/rag/retrievers/filtered-retriever.ts
export class FilteredRetriever {
  constructor(
    private retriever: HybridRetriever,
    private minScore: number = 0.7
  ) {}

  async search(query: string, topK: number): Promise<SearchResult[]> {
    const results = await this.retriever.search(query);

    // 임계값 이상의 결과만 반환
    const filtered = results.filter(r => r.score >= this.minScore);

    // 결과가 너무 적으면 최소 개수 보장
    if (filtered.length < 2 && results.length >= 2) {
      return results.slice(0, 2);
    }

    return filtered.slice(0, topK);
  }
}
```

### 3.3 메타데이터 필터링

**검색 최적화**를 위해 메타데이터 기반 필터링을 적용합니다:

```typescript
// 메타데이터 필터 정의
interface MetadataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}

// Supabase에서 메타데이터 필터 적용
async function searchWithFilter(
  queryVector: number[],
  filters: MetadataFilter[],
  topK: number
): Promise<SearchResult[]> {
  let query = supabase
    .rpc('match_documents', {
      query_embedding: queryVector,
      match_count: topK
    });

  // 필터 적용
  filters.forEach(filter => {
    switch (filter.operator) {
      case 'eq':
        query = query.eq(`metadata->>${filter.field}`, filter.value);
        break;
      case 'contains':
        query = query.contains('metadata', { [filter.field]: filter.value });
        break;
      case 'in':
        query = query.in(`metadata->>${filter.field}`, filter.value);
        break;
    }
  });

  const { data, error } = await query;
  return data || [];
}

// 사용 예시
const results = await searchWithFilter(
  queryVector,
  [
    { field: 'category', operator: 'eq', value: 'typescript' },
    { field: 'date', operator: 'gt', value: '2024-01-01' }
  ],
  10
);
```

---

## 4. 리랭킹으로 검색 품질 향상

### 4.1 리랭킹이 필요한 이유

초기 검색 결과를 더 정교한 모델로 재정렬합니다. **리랭킹**은 검색 품질을 크게 향상시킵니다.

```typescript
// 리랭킹 전후 비교
const query = "TypeScript 제네릭 타입 추론";

// 초기 검색 결과 (시맨틱 검색)
const initialResults = [
  { title: "TypeScript 기초 타입", score: 0.85 },
  { title: "제네릭 프로그래밍 개념", score: 0.83 },
  { title: "TypeScript 제네릭 타입 추론 심화", score: 0.81 },  // 가장 관련성 높음
  { title: "타입 시스템 비교", score: 0.80 }
];

// 리랭킹 후 결과
const rerankedResults = [
  { title: "TypeScript 제네릭 타입 추론 심화", score: 0.95 },  // 1위로 상승
  { title: "제네릭 프로그래밍 개념", score: 0.78 },
  { title: "TypeScript 기초 타입", score: 0.65 },
  { title: "타입 시스템 비교", score: 0.45 }
];
```

### 4.2 Cohere Rerank 구현

**리랭킹**을 위해 Cohere Rerank API를 사용합니다:

```typescript
// src/rag/rerankers/cohere-reranker.ts
import { CohereClient } from 'cohere-ai';

export class CohereReranker {
  private client: CohereClient;

  constructor(apiKey: string) {
    this.client = new CohereClient({ token: apiKey });
  }

  async rerank(
    query: string,
    documents: SearchResult[],
    topK: number = 5
  ): Promise<SearchResult[]> {
    if (documents.length === 0) return [];

    const response = await this.client.rerank({
      model: 'rerank-multilingual-v3.0',
      query,
      documents: documents.map(d => d.document.content),
      topN: topK,
      returnDocuments: false
    });

    return response.results.map(result => ({
      document: documents[result.index].document,
      score: result.relevanceScore,
      method: 'reranked' as const
    }));
  }
}
```

### 4.3 Cross-Encoder 리랭킹

로컬에서 실행 가능한 Cross-Encoder 모델을 사용한 **리랭킹**:

```typescript
// src/rag/rerankers/cross-encoder-reranker.ts
import { pipeline } from '@xenova/transformers';

export class CrossEncoderReranker {
  private model: any;
  private modelName = 'cross-encoder/ms-marco-MiniLM-L-6-v2';

  async initialize(): Promise<void> {
    this.model = await pipeline(
      'text-classification',
      this.modelName
    );
  }

  async rerank(
    query: string,
    documents: SearchResult[],
    topK: number = 5
  ): Promise<SearchResult[]> {
    // 쿼리-문서 쌍 생성
    const pairs = documents.map(doc => ({
      text: query,
      text_pair: doc.document.content.slice(0, 512) // 토큰 제한
    }));

    // 관련성 점수 계산
    const scores = await Promise.all(
      pairs.map(async pair => {
        const result = await this.model(pair.text, { text_pair: pair.text_pair });
        return result[0].score;
      })
    );

    // 점수순 정렬
    return documents
      .map((doc, idx) => ({
        ...doc,
        score: scores[idx],
        method: 'cross-encoder' as const
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
```

### 4.4 리랭킹 파이프라인 통합

전체 검색 파이프라인에 **리랭킹**을 통합합니다:

```typescript
// src/rag/retrievers/reranking-pipeline.ts
export class RerankingPipeline {
  constructor(
    private retriever: HybridRetriever,
    private reranker: CohereReranker,
    private config: {
      initialTopK: number;
      finalTopK: number;
      minScoreThreshold: number;
    }
  ) {}

  async search(query: string): Promise<SearchResult[]> {
    // 1단계: 하이브리드 검색으로 후보 추출
    const candidates = await this.retriever.search(query);
    console.log(`[검색] ${candidates.length}개 후보 문서 검색됨`);

    // 2단계: 리랭킹으로 재정렬
    const reranked = await this.reranker.rerank(
      query,
      candidates,
      this.config.finalTopK * 2
    );
    console.log(`[리랭킹] 상위 ${reranked.length}개 문서 재정렬됨`);

    // 3단계: 임계값 필터링
    const filtered = reranked.filter(
      r => r.score >= this.config.minScoreThreshold
    );

    return filtered.slice(0, this.config.finalTopK);
  }
}

// 사용 예시
const pipeline = new RerankingPipeline(
  hybridRetriever,
  cohereReranker,
  {
    initialTopK: 20,    // 초기 검색: 20개
    finalTopK: 5,       // 최종 결과: 5개
    minScoreThreshold: 0.5
  }
);
```

---

## 5. 검색 성능 평가

### 5.1 평가 지표

**검색 최적화** 결과를 측정하기 위한 지표들:

```typescript
// src/rag/evaluation/metrics.ts
export interface EvaluationMetrics {
  // Precision@K: 상위 K개 중 관련 문서 비율
  precisionAtK: number;

  // Recall@K: 전체 관련 문서 중 상위 K개에 포함된 비율
  recallAtK: number;

  // MRR: 첫 번째 관련 문서의 순위 역수 평균
  mrr: number;

  // NDCG: 순위를 고려한 관련성 점수
  ndcg: number;
}

export function calculateMetrics(
  results: SearchResult[],
  relevantDocIds: Set<string>,
  k: number
): EvaluationMetrics {
  const topK = results.slice(0, k);

  // Precision@K
  const relevantInTopK = topK.filter(r =>
    relevantDocIds.has(r.document.id)
  ).length;
  const precisionAtK = relevantInTopK / k;

  // Recall@K
  const recallAtK = relevantInTopK / relevantDocIds.size;

  // MRR
  const firstRelevantRank = results.findIndex(r =>
    relevantDocIds.has(r.document.id)
  );
  const mrr = firstRelevantRank >= 0 ? 1 / (firstRelevantRank + 1) : 0;

  // NDCG 계산
  const ndcg = calculateNDCG(results, relevantDocIds, k);

  return { precisionAtK, recallAtK, mrr, ndcg };
}
```

### 5.2 A/B 테스트

**하이브리드 검색**과 **리랭킹** 효과를 비교합니다:

```typescript
// src/rag/evaluation/ab-test.ts
export async function runABTest(
  queries: TestQuery[],
  retrievers: {
    semantic: SemanticRetriever;
    hybrid: HybridRetriever;
    reranking: RerankingPipeline;
  }
): Promise<ABTestResults> {
  const results = {
    semantic: { precisionSum: 0, mrrSum: 0 },
    hybrid: { precisionSum: 0, mrrSum: 0 },
    reranking: { precisionSum: 0, mrrSum: 0 }
  };

  for (const { query, relevantDocs } of queries) {
    // 각 방식으로 검색
    const semanticResults = await retrievers.semantic.search(query, 5);
    const hybridResults = await retrievers.hybrid.search(query);
    const rerankingResults = await retrievers.reranking.search(query);

    // 메트릭 계산
    const relevantSet = new Set(relevantDocs);

    const semanticMetrics = calculateMetrics(semanticResults, relevantSet, 5);
    const hybridMetrics = calculateMetrics(hybridResults, relevantSet, 5);
    const rerankingMetrics = calculateMetrics(rerankingResults, relevantSet, 5);

    results.semantic.precisionSum += semanticMetrics.precisionAtK;
    results.semantic.mrrSum += semanticMetrics.mrr;
    results.hybrid.precisionSum += hybridMetrics.precisionAtK;
    results.hybrid.mrrSum += hybridMetrics.mrr;
    results.reranking.precisionSum += rerankingMetrics.precisionAtK;
    results.reranking.mrrSum += rerankingMetrics.mrr;
  }

  const n = queries.length;
  return {
    semantic: {
      avgPrecision: results.semantic.precisionSum / n,
      avgMRR: results.semantic.mrrSum / n
    },
    hybrid: {
      avgPrecision: results.hybrid.precisionSum / n,
      avgMRR: results.hybrid.mrrSum / n
    },
    reranking: {
      avgPrecision: results.reranking.precisionSum / n,
      avgMRR: results.reranking.mrrSum / n
    }
  };
}
```

### 5.3 성능 비교 결과

실제 테스트 결과 예시:

| 방식 | Precision@5 | MRR | 응답 시간 |
|------|-------------|-----|-----------|
| 시맨틱 검색 | 0.65 | 0.72 | 120ms |
| **하이브리드 검색** | 0.78 | 0.85 | 180ms |
| **하이브리드 + 리랭킹** | 0.89 | 0.94 | 350ms |

**하이브리드 검색**과 **리랭킹**을 결합하면 검색 품질이 크게 향상됩니다.

---

## 6. 실전 적용 팁

### 6.1 검색 방식 선택 가이드

```typescript
// 상황별 검색 방식 선택
function selectRetriever(context: QueryContext): Retriever {
  // 정확한 용어 검색 (코드명, API 이름 등)
  if (context.hasExactTerms) {
    return bm25Retriever;
  }

  // 개념적 질문
  if (context.isConceptual) {
    return semanticRetriever;
  }

  // 복합적 질문 - 하이브리드 + 리랭킹
  return rerankingPipeline;
}
```

### 6.2 비용 최적화

**리랭킹** API 비용을 고려한 최적화:

```typescript
// 조건부 리랭킹
async function smartRerank(
  query: string,
  results: SearchResult[]
): Promise<SearchResult[]> {
  // 상위 결과 점수가 충분히 높으면 리랭킹 스킵
  if (results[0]?.score > 0.9 && results[1]?.score < 0.7) {
    console.log('[최적화] 명확한 결과, 리랭킹 스킵');
    return results;
  }

  // 상위 결과들의 점수가 비슷하면 리랭킹 수행
  const topScoreGap = results[0]?.score - results[4]?.score;
  if (topScoreGap < 0.1) {
    console.log('[최적화] 점수 차이 작음, 리랭킹 수행');
    return await reranker.rerank(query, results, 5);
  }

  return results;
}
```

---

## 7. 전체 코드 통합

### 7.1 최종 검색 시스템

```typescript
// src/rag/search-system.ts
export class RAGSearchSystem {
  private semanticRetriever: SemanticRetriever;
  private bm25Retriever: BM25Retriever;
  private hybridRetriever: HybridRetriever;
  private reranker: CohereReranker;

  constructor(config: SearchSystemConfig) {
    this.semanticRetriever = new SemanticRetriever(
      config.vectorStore,
      config.embedder
    );
    this.bm25Retriever = new BM25Retriever();
    this.hybridRetriever = new HybridRetriever(
      this.semanticRetriever,
      this.bm25Retriever,
      {
        semanticWeight: 0.7,
        bm25Weight: 0.3,
        topK: 20,
        fusionMethod: 'rrf'
      }
    );
    this.reranker = new CohereReranker(config.cohereApiKey);
  }

  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      topK = 5,
      useReranking = true,
      filters = []
    } = options;

    // 하이브리드 검색
    let results = await this.hybridRetriever.search(query);

    // 메타데이터 필터 적용
    if (filters.length > 0) {
      results = this.applyFilters(results, filters);
    }

    // 리랭킹
    if (useReranking && results.length > topK) {
      results = await this.reranker.rerank(query, results, topK);
    }

    return results.slice(0, topK);
  }

  private applyFilters(
    results: SearchResult[],
    filters: MetadataFilter[]
  ): SearchResult[] {
    return results.filter(result =>
      filters.every(filter =>
        this.matchFilter(result.document.metadata, filter)
      )
    );
  }

  private matchFilter(metadata: any, filter: MetadataFilter): boolean {
    const value = metadata[filter.field];
    switch (filter.operator) {
      case 'eq': return value === filter.value;
      case 'ne': return value !== filter.value;
      case 'contains': return value?.includes(filter.value);
      case 'in': return filter.value.includes(value);
      default: return true;
    }
  }
}
```

---

## 마무리

Day 4에서는 RAG 시스템의 **검색 최적화**를 다뤘습니다:

1. **시맨틱 검색**의 한계와 **BM25** 키워드 검색의 필요성
2. **하이브리드 검색**으로 두 방식의 장점 결합
3. **리랭킹**으로 검색 결과 품질 향상
4. 검색 파라미터 튜닝과 성능 평가

Day 5에서는 검색된 문서를 Claude에게 전달하여 답변을 생성하는 방법을 알아봅니다.

---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- **Day 4: 검색 최적화와 리랭킹** (현재 글)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)
