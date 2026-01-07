---
title: "RAG Day 3: 임베딩과 벡터 데이터베이스 - 텍스트를 숫자로 변환하기"
slug: "rag-day3-embedding-vectordb"
excerpt: "RAG 시스템의 핵심인 임베딩과 벡터 데이터베이스를 알아봅니다. Voyage AI로 텍스트를 벡터로 변환하고, Supabase Vector와 pgvector로 벡터 데이터베이스를 구축합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "임베딩"
  - "벡터 데이터베이스"
  - "Supabase"
  - "Voyage AI"
  - "pgvector"
language: "ko"
---

## TL;DR

- **임베딩**은 텍스트를 숫자 벡터로 변환하는 과정으로, RAG 시스템의 검색 품질을 결정
- **벡터 데이터베이스**는 임베딩 벡터를 저장하고 유사도 검색을 수행하는 특수 데이터베이스
- **Voyage AI**는 검색 최적화된 임베딩 모델로, OpenAI 대비 우수한 검색 성능 제공
- **Supabase Vector**와 **pgvector**로 PostgreSQL 기반 벡터 데이터베이스 구축
- **배치 처리**와 **중복 감지**로 효율적인 인덱싱 파이프라인 구현
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. 임베딩이란? 텍스트를 숫자로 변환하기

### 1.1 왜 임베딩이 필요한가?

컴퓨터는 텍스트를 직접 비교할 수 없습니다. "사과"와 "애플"이 같은 의미인지, "은행"이 금융기관인지 나무인지 알 수 없죠. **임베딩**은 텍스트를 숫자 벡터로 변환하여 의미적 유사성을 계산할 수 있게 합니다.

```typescript
// 임베딩의 기본 개념
const text = "RAG 시스템은 검색과 생성을 결합합니다";

// 임베딩 모델을 통해 벡터로 변환
const vector = await embedder.embed(text);
// 결과: [0.023, -0.041, 0.089, ...] (1024차원 등)

// 유사한 의미의 텍스트는 비슷한 벡터를 가짐
const similar = "RAG는 retrieval과 generation을 합친 기술이다";
const similarVector = await embedder.embed(similar);

// 코사인 유사도로 비교
const similarity = cosineSimilarity(vector, similarVector);
// 결과: 0.92 (매우 유사)
```

### 1.2 임베딩 모델 비교

RAG 시스템에서 **임베딩** 모델 선택은 검색 품질에 직접적인 영향을 미칩니다. 주요 **벡터 데이터베이스** 호환 임베딩 모델을 비교해봅니다.

| 모델 | 차원 | 특징 | 가격 (1M 토큰) |
|------|------|------|----------------|
| **Voyage AI voyage-3** | 1024 | 검색 최적화, 다국어 지원 | $0.06 |
| OpenAI text-embedding-3-large | 3072 | 범용성, 높은 차원 | $0.13 |
| Cohere embed-v3 | 1024 | 다국어, 압축 지원 | $0.10 |
| OpenAI text-embedding-3-small | 1536 | 저비용, 적당한 성능 | $0.02 |

**Voyage AI**를 선택한 이유:
1. 검색(retrieval) 태스크에 최적화된 **임베딩** 모델
2. 한국어 포함 다국어 지원
3. 합리적인 가격
4. RAG 시스템에 특화된 성능

### 1.3 Voyage AI 설정

**Voyage AI**를 사용하여 **임베딩**을 생성하는 방법입니다.

```typescript
// src/rag/embedders/voyage-embedder.ts
import Anthropic from '@anthropic-ai/sdk';

export interface EmbedderConfig {
  model: string;
  inputType: 'query' | 'document';
}

export class VoyageEmbedder {
  private client: Anthropic;
  private model: string;
  private inputType: 'query' | 'document';

  constructor(config: EmbedderConfig = {
    model: 'voyage-3',
    inputType: 'document'
  }) {
    this.client = new Anthropic();
    this.model = config.model;
    this.inputType = config.inputType;
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1,
      messages: [{ role: 'user', content: text }],
    });

    // Voyage AI는 별도 API 사용
    const voyageResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        input_type: this.inputType,
      }),
    });

    const data = await voyageResponse.json();
    return data.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        input_type: this.inputType,
      }),
    });

    const data = await response.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  }
}
```

**임베딩** 모델의 `input_type` 파라미터:
- `document`: 인덱싱할 문서용 (저장 시)
- `query`: 검색 쿼리용 (검색 시)

이 구분이 **벡터 데이터베이스** 검색 성능을 향상시킵니다.

---

## 2. 벡터 데이터베이스 이해하기

### 2.1 벡터 데이터베이스란?

**벡터 데이터베이스**는 고차원 벡터를 저장하고 유사도 기반 검색을 수행하는 특수 데이터베이스입니다. **Voyage AI**와 같은 임베딩 모델로 생성한 벡터를 **pgvector** 같은 확장을 통해 저장합니다. 기존 SQL 데이터베이스의 `WHERE` 조건 대신, "가장 유사한 N개"를 찾습니다.

```
전통적 DB: SELECT * FROM docs WHERE category = 'tech'
벡터 DB:   SELECT * FROM docs ORDER BY similarity(embedding, query_vector) LIMIT 10
```

### 2.2 벡터 데이터베이스 종류 비교

| 데이터베이스 | 특징 | 장점 | 단점 |
|-------------|------|------|------|
| **Supabase Vector** | PostgreSQL + pgvector | 익숙한 SQL, 무료 티어 | 대규모 시 성능 |
| Pinecone | 완전 관리형 | 확장성, 성능 | 비용, 벤더 종속 |
| Chroma | 로컬 우선 | 간단, 무료 | 프로덕션 한계 |
| Weaviate | GraphQL 지원 | 유연성 | 복잡성 |
| Qdrant | Rust 기반 | 빠른 성능 | 생태계 |

이 시리즈에서는 **Supabase Vector**와 **pgvector**를 사용합니다. **Voyage AI** 임베딩과 조합하면 강력한 RAG 검색 시스템을 구축할 수 있습니다:
- PostgreSQL 기반으로 익숙한 SQL 사용
- 무료 티어로 **pgvector** 시작 가능
- 메타데이터 필터링 용이
- SQL과 벡터 검색 결합
- **Voyage AI** 임베딩과 최적 호환

### 2.3 pgvector 소개

**pgvector**는 PostgreSQL 확장으로, 벡터 데이터 타입과 유사도 검색 연산자를 제공합니다.

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 벡터 컬럼이 있는 테이블 생성
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1024),  -- 1024차원 벡터
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 벡터 인덱스 생성 (IVFFlat)
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**pgvector**의 거리 연산자:
- `<->`: L2 거리 (유클리드)
- `<#>`: 내적 (음수)
- `<=>`: 코사인 거리 (1 - 유사도)

---

## 3. Supabase Vector 설정

### 3.1 Supabase 프로젝트 생성

**Supabase**는 오픈소스 Firebase 대안으로, **벡터 데이터베이스** 기능을 제공합니다. **Voyage AI** 임베딩을 저장하고 검색하기에 최적입니다.

1. [supabase.com](https://supabase.com)에서 계정 생성
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 복사

```bash
# .env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 데이터베이스 스키마 설정

**Supabase** SQL 에디터에서 실행:

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 문서 청크 테이블
CREATE TABLE document_chunks (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB DEFAULT '{}',
  source TEXT,
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 벡터 검색용 인덱스
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 메타데이터 검색용 인덱스
CREATE INDEX document_chunks_metadata_idx ON document_chunks
USING gin (metadata);

-- 소스별 검색용 인덱스
CREATE INDEX document_chunks_source_idx ON document_chunks (source);

-- 유사도 검색 함수
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1024),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  source TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    dc.source,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.metadata @> filter
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 3.3 Supabase 클라이언트 구현

**Supabase**와 연동하는 **벡터 데이터베이스** 클라이언트:

```typescript
// src/rag/stores/supabase-store.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface DocumentRecord {
  id?: number;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  source: string;
  chunk_index: number;
}

export interface SearchResult {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  source: string;
  similarity: number;
}

export class SupabaseVectorStore {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async upsert(documents: DocumentRecord[]): Promise<void> {
    const { error } = await this.client
      .from('document_chunks')
      .upsert(
        documents.map(doc => ({
          content: doc.content,
          embedding: doc.embedding,
          metadata: doc.metadata,
          source: doc.source,
          chunk_index: doc.chunk_index,
        })),
        { onConflict: 'source,chunk_index' }
      );

    if (error) {
      throw new Error(`Supabase upsert error: ${error.message}`);
    }

    console.log(`✅ ${documents.length}개 문서 저장 완료`);
  }

  async search(
    queryEmbedding: number[],
    options: {
      topK?: number;
      filter?: Record<string, unknown>;
    } = {}
  ): Promise<SearchResult[]> {
    const { topK = 5, filter = {} } = options;

    const { data, error } = await this.client.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter: filter,
    });

    if (error) {
      throw new Error(`Supabase search error: ${error.message}`);
    }

    return data as SearchResult[];
  }

  async deleteBySource(source: string): Promise<void> {
    const { error } = await this.client
      .from('document_chunks')
      .delete()
      .eq('source', source);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    console.log(`🗑️ 소스 "${source}" 문서 삭제 완료`);
  }

  async count(): Promise<number> {
    const { count, error } = await this.client
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Supabase count error: ${error.message}`);
    }

    return count || 0;
  }
}
```

---

## 4. 인덱싱 파이프라인 구축

### 4.1 전체 파이프라인 아키텍처

**임베딩**과 **벡터 데이터베이스**를 결합한 완전한 인덱싱 파이프라인:

```
문서 → 청킹 → 임베딩 → 벡터 DB 저장
  ↓       ↓        ↓          ↓
 PDF    RecursiveChunker  VoyageAI  Supabase
 MD     FixedSizeChunker  OpenAI    Pinecone
 Web                      Cohere    Chroma
```

### 4.2 인덱싱 파이프라인 구현

Day 2의 청킹과 오늘의 **임베딩**, **벡터 데이터베이스**를 통합:

```typescript
// src/rag/pipeline/indexing-pipeline.ts
import { DocumentLoader } from '../loaders/document-loader';
import { RecursiveChunker } from '../chunkers/recursive-chunker';
import { VoyageEmbedder } from '../embedders/voyage-embedder';
import { SupabaseVectorStore, DocumentRecord } from '../stores/supabase-store';

export interface IndexingConfig {
  chunkSize: number;
  chunkOverlap: number;
  batchSize: number;
}

export class IndexingPipeline {
  private loader: DocumentLoader;
  private chunker: RecursiveChunker;
  private embedder: VoyageEmbedder;
  private store: SupabaseVectorStore;
  private batchSize: number;

  constructor(config: IndexingConfig = {
    chunkSize: 512,
    chunkOverlap: 50,
    batchSize: 100
  }) {
    this.loader = new DocumentLoader();
    this.chunker = new RecursiveChunker(config.chunkSize);
    this.embedder = new VoyageEmbedder({ model: 'voyage-3', inputType: 'document' });
    this.store = new SupabaseVectorStore();
    this.batchSize = config.batchSize;
  }

  async index(sources: string[]): Promise<void> {
    console.log(`📚 인덱싱 시작: ${sources.length}개 소스`);

    for (const source of sources) {
      await this.indexSource(source);
    }

    const totalCount = await this.store.count();
    console.log(`\n✅ 인덱싱 완료! 총 ${totalCount}개 청크 저장됨`);
  }

  private async indexSource(source: string): Promise<void> {
    console.log(`\n📄 처리 중: ${source}`);

    // 1. 문서 로드
    const documents = await this.loader.load(source);
    console.log(`  → ${documents.length}개 문서 로드`);

    // 2. 청킹
    const allChunks: Array<{ content: string; metadata: Record<string, unknown> }> = [];
    for (const doc of documents) {
      const chunks = this.chunker.chunk(doc);
      allChunks.push(...chunks);
    }
    console.log(`  → ${allChunks.length}개 청크 생성`);

    // 3. 배치로 임베딩 및 저장
    for (let i = 0; i < allChunks.length; i += this.batchSize) {
      const batch = allChunks.slice(i, i + this.batchSize);
      const contents = batch.map(c => c.content);

      // 임베딩 생성
      const embeddings = await this.embedder.embedBatch(contents);

      // 저장용 레코드 생성
      const records: DocumentRecord[] = batch.map((chunk, idx) => ({
        content: chunk.content,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
        source: source,
        chunk_index: i + idx,
      }));

      // 벡터 DB에 저장
      await this.store.upsert(records);

      console.log(`  → 배치 ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(allChunks.length / this.batchSize)} 완료`);
    }
  }
}
```

### 4.3 배치 처리 최적화

대량의 문서를 처리할 때 **배치 처리**가 필수입니다:

```typescript
// src/rag/utils/batch-processor.ts
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
  options: {
    onProgress?: (completed: number, total: number) => void;
    delayMs?: number;
  } = {}
): Promise<R[]> {
  const { onProgress, delayMs = 100 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length);
    }

    // Rate limiting
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
```

### 4.4 중복 감지 및 처리

동일한 문서를 다시 인덱싱할 때 **중복**을 처리하는 방법:

```typescript
// src/rag/utils/deduplication.ts
import crypto from 'crypto';

export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export class DeduplicationManager {
  private seenHashes: Set<string> = new Set();

  isDuplicate(content: string): boolean {
    const hash = generateContentHash(content);
    if (this.seenHashes.has(hash)) {
      return true;
    }
    this.seenHashes.add(hash);
    return false;
  }

  reset(): void {
    this.seenHashes.clear();
  }
}
```

**Supabase**에서 중복 처리:

```sql
-- 소스와 청크 인덱스로 유니크 제약
ALTER TABLE document_chunks
ADD CONSTRAINT unique_source_chunk
UNIQUE (source, chunk_index);
```

---

## 5. 실습: 완전한 인덱싱 예제

### 5.1 프로젝트 설정

```bash
# 필요한 패키지 설치
npm install @supabase/supabase-js dotenv

# 환경 변수 설정
echo "VOYAGE_API_KEY=your-voyage-key" >> .env
echo "SUPABASE_URL=https://xxx.supabase.co" >> .env
echo "SUPABASE_SERVICE_KEY=your-service-key" >> .env
```

### 5.2 사용 예제

```typescript
// examples/day3-indexing-demo.ts
import { IndexingPipeline } from '../src/rag/pipeline/indexing-pipeline';
import { VoyageEmbedder } from '../src/rag/embedders/voyage-embedder';
import { SupabaseVectorStore } from '../src/rag/stores/supabase-store';
import 'dotenv/config';

async function main() {
  // 1. 인덱싱 파이프라인으로 문서 저장
  const pipeline = new IndexingPipeline({
    chunkSize: 512,
    chunkOverlap: 50,
    batchSize: 50,
  });

  await pipeline.index([
    './documents/company-policy.pdf',
    './documents/product-guide.md',
  ]);

  // 2. 검색 테스트
  const embedder = new VoyageEmbedder({
    model: 'voyage-3',
    inputType: 'query',  // 검색용
  });
  const store = new SupabaseVectorStore();

  const query = "휴가 정책에 대해 알려주세요";
  const queryEmbedding = await embedder.embed(query);

  const results = await store.search(queryEmbedding, {
    topK: 5,
    filter: { category: 'HR' },
  });

  console.log('\n🔍 검색 결과:');
  results.forEach((result, i) => {
    console.log(`\n[${i + 1}] 유사도: ${result.similarity.toFixed(3)}`);
    console.log(`    소스: ${result.source}`);
    console.log(`    내용: ${result.content.slice(0, 100)}...`);
  });
}

main().catch(console.error);
```

### 5.3 실행 결과

```
📚 인덱싱 시작: 2개 소스

📄 처리 중: ./documents/company-policy.pdf
  → 15개 문서 로드
  → 45개 청크 생성
  → 배치 1/1 완료

📄 처리 중: ./documents/product-guide.md
  → 8개 문서 로드
  → 24개 청크 생성
  → 배치 1/1 완료

✅ 인덱싱 완료! 총 69개 청크 저장됨

🔍 검색 결과:

[1] 유사도: 0.892
    소스: ./documents/company-policy.pdf
    내용: 연차 휴가는 입사 1년 후부터 15일이 부여되며, 근속 연수에 따라 추가됩니다...

[2] 유사도: 0.845
    소스: ./documents/company-policy.pdf
    내용: 병가는 진단서 제출 시 연간 30일까지 사용 가능합니다...
```

---

## 6. 임베딩 품질 평가

### 6.1 검색 품질 테스트

**임베딩** 모델과 **벡터 데이터베이스** 설정이 잘 되었는지 확인하는 방법:

```typescript
// src/rag/utils/embedding-evaluator.ts
interface EvaluationPair {
  query: string;
  expectedContent: string;  // 검색되어야 하는 내용의 일부
}

export async function evaluateSearchQuality(
  embedder: VoyageEmbedder,
  store: SupabaseVectorStore,
  testPairs: EvaluationPair[]
): Promise<{ accuracy: number; results: Array<{ query: string; found: boolean }> }> {
  const results: Array<{ query: string; found: boolean }> = [];

  for (const pair of testPairs) {
    const queryEmbedding = await embedder.embed(pair.query);
    const searchResults = await store.search(queryEmbedding, { topK: 3 });

    const found = searchResults.some(r =>
      r.content.toLowerCase().includes(pair.expectedContent.toLowerCase())
    );

    results.push({ query: pair.query, found });
  }

  const accuracy = results.filter(r => r.found).length / results.length;

  return { accuracy, results };
}

// 사용 예시
const evaluation = await evaluateSearchQuality(embedder, store, [
  { query: "휴가는 며칠?", expectedContent: "15일" },
  { query: "병가 사용법", expectedContent: "진단서" },
  { query: "재택근무 가능?", expectedContent: "재택" },
]);

console.log(`검색 정확도: ${(evaluation.accuracy * 100).toFixed(1)}%`);
```

### 6.2 임베딩 시각화

고차원 **임베딩**을 2D로 시각화하여 클러스터링 확인:

```typescript
// t-SNE나 UMAP으로 차원 축소 후 시각화
// 실제 구현은 Python이 더 적합 (sklearn, plotly)

// TypeScript에서는 간단한 유사도 매트릭스 생성
function createSimilarityMatrix(embeddings: number[][]): number[][] {
  const n = embeddings.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = cosineSimilarity(embeddings[i], embeddings[j]);
    }
  }

  return matrix;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

---

## 7. 성능 최적화 팁

### 7.1 임베딩 캐싱

동일한 텍스트에 대한 **임베딩** 재생성 방지:

```typescript
// src/rag/cache/embedding-cache.ts
import crypto from 'crypto';

export class EmbeddingCache {
  private cache: Map<string, number[]> = new Map();

  private getKey(text: string, model: string): string {
    const hash = crypto.createHash('md5').update(text).digest('hex');
    return `${model}:${hash}`;
  }

  get(text: string, model: string): number[] | undefined {
    return this.cache.get(this.getKey(text, model));
  }

  set(text: string, model: string, embedding: number[]): void {
    this.cache.set(this.getKey(text, model), embedding);
  }

  has(text: string, model: string): boolean {
    return this.cache.has(this.getKey(text, model));
  }
}
```

### 7.2 벡터 인덱스 튜닝

**pgvector**의 IVFFlat 인덱스 최적화:

```sql
-- 데이터 양에 따른 lists 파라미터 조정
-- 규칙: lists = sqrt(row_count)

-- 1만 행: lists = 100
-- 10만 행: lists = 316
-- 100만 행: lists = 1000

-- 인덱스 재생성
DROP INDEX IF EXISTS document_chunks_embedding_idx;
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 316);  -- 10만 행 기준

-- 검색 시 probes 파라미터 조정 (정확도 vs 속도)
SET ivfflat.probes = 10;  -- 기본값 1, 높을수록 정확하지만 느림
```

### 7.3 벡터 데이터베이스 모니터링

```sql
-- 테이블 크기 확인
SELECT
  pg_size_pretty(pg_total_relation_size('document_chunks')) as total_size,
  pg_size_pretty(pg_relation_size('document_chunks')) as table_size,
  pg_size_pretty(pg_indexes_size('document_chunks')) as indexes_size;

-- 인덱스 사용률 확인
SELECT
  indexrelname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND relname = 'document_chunks';
```

---

## 8. 정리 및 다음 편 예고

### 핵심 내용 정리

오늘 배운 내용:

1. **임베딩**은 텍스트를 숫자 벡터로 변환하는 핵심 기술
2. **Voyage AI**는 검색에 최적화된 **임베딩** 모델
3. **벡터 데이터베이스**로 유사도 기반 검색 수행
4. **Supabase Vector**와 **pgvector**로 PostgreSQL 기반 구축
5. **배치 처리**와 **중복 감지**로 효율적 인덱싱

### Day 4 예고: 검색 최적화와 리랭킹

다음 편에서는 검색 품질을 높이는 방법을 다룹니다:

- 시맨틱 검색 vs 키워드 검색 vs 하이브리드 검색
- top-k, 유사도 임계값 튜닝
- 리랭킹(Reranking)으로 검색 정확도 향상
- Cohere Rerank 통합

**전체 코드는 GitHub에서 확인하세요:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- **Day 3: 임베딩과 벡터 데이터베이스** (현재 글)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)
