---
title: "RAG Day 3: Embeddings and Vector Databases - Converting Text to Numbers"
slug: "rag-day3-embedding-vectordb"
excerpt: "Learn about embeddings and vector databases, the core of RAG systems. Convert text to vectors with Voyage AI and build a vector database with Supabase Vector and pgvector."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "embeddings"
  - "vector database"
  - "Supabase"
  - "Voyage AI"
  - "pgvector"
language: "en"
---

## TL;DR

- **Embeddings** convert text into numerical vectors, determining the search quality of RAG systems
- **Vector databases** are specialized databases that store embedding vectors and perform similarity searches
- **Voyage AI** is a search-optimized embedding model with superior retrieval performance compared to OpenAI
- Build a PostgreSQL-based vector database with **Supabase Vector** and **pgvector**
- Implement efficient indexing pipelines with **batch processing** and **deduplication**
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. What are Embeddings? Converting Text to Numbers

### 1.1 Why Do We Need Embeddings?

Computers cannot directly compare text. They cannot tell if "apple" and "pomme" mean the same thing, or whether "bank" refers to a financial institution or a riverbank. **Embeddings** convert text into numerical vectors, enabling semantic similarity calculations.

```typescript
// Basic concept of embeddings
const text = "RAG systems combine retrieval and generation";

// Convert to vector through embedding model
const vector = await embedder.embed(text);
// Result: [0.023, -0.041, 0.089, ...] (1024 dimensions, etc.)

// Similar meaning texts have similar vectors
const similar = "RAG is a technology that combines retrieval and generation";
const similarVector = await embedder.embed(similar);

// Compare with cosine similarity
const similarity = cosineSimilarity(vector, similarVector);
// Result: 0.92 (very similar)
```

### 1.2 Comparing Embedding Models

In RAG systems, **embedding** model selection directly affects search quality. Let's compare major **vector database** compatible embedding models.

| Model | Dimensions | Features | Price (1M tokens) |
|-------|------------|----------|-------------------|
| **Voyage AI voyage-3** | 1024 | Search-optimized, multilingual | $0.06 |
| OpenAI text-embedding-3-large | 3072 | Versatile, high dimensions | $0.13 |
| Cohere embed-v3 | 1024 | Multilingual, compression support | $0.10 |
| OpenAI text-embedding-3-small | 1536 | Low cost, decent performance | $0.02 |

**Why we chose Voyage AI:**
1. **Embedding** model optimized for retrieval tasks
2. Multilingual support including Korean
3. Reasonable pricing
4. Performance specialized for RAG systems

### 1.3 Voyage AI Setup

Here's how to generate **embeddings** using **Voyage AI**.

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

    // Voyage AI uses separate API
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

**Embedding** model `input_type` parameter:
- `document`: For documents to be indexed (when storing)
- `query`: For search queries (when searching)

This distinction improves **vector database** search performance.

---

## 2. Understanding Vector Databases

### 2.1 What is a Vector Database?

A **vector database** is a specialized database that stores high-dimensional vectors and performs similarity-based searches. Vectors generated by embedding models like **Voyage AI** are stored through extensions like **pgvector**. Instead of traditional SQL `WHERE` conditions, it finds "the N most similar items."

```
Traditional DB: SELECT * FROM docs WHERE category = 'tech'
Vector DB:      SELECT * FROM docs ORDER BY similarity(embedding, query_vector) LIMIT 10
```

### 2.2 Comparing Vector Databases

| Database | Features | Pros | Cons |
|----------|----------|------|------|
| **Supabase Vector** | PostgreSQL + pgvector | Familiar SQL, free tier | Performance at scale |
| Pinecone | Fully managed | Scalability, performance | Cost, vendor lock-in |
| Chroma | Local-first | Simple, free | Production limitations |
| Weaviate | GraphQL support | Flexibility | Complexity |
| Qdrant | Rust-based | Fast performance | Ecosystem |

In this series, we use **Supabase Vector** and **pgvector**. Combined with **Voyage AI** embeddings, you can build a powerful RAG search system:
- Familiar SQL with PostgreSQL base
- Start with **pgvector** on free tier
- Easy metadata filtering
- Combine SQL and vector search
- Optimal compatibility with **Voyage AI** embeddings

### 2.3 Introduction to pgvector

**pgvector** is a PostgreSQL extension that provides vector data types and similarity search operators.

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1024),  -- 1024-dimensional vector
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector index (IVFFlat)
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**pgvector** distance operators:
- `<->`: L2 distance (Euclidean)
- `<#>`: Inner product (negative)
- `<=>`: Cosine distance (1 - similarity)

---

## 3. Supabase Vector Setup

### 3.1 Creating a Supabase Project

**Supabase** is an open-source Firebase alternative that provides **vector database** functionality. It's optimal for storing and searching **Voyage AI** embeddings.

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and API key

```bash
# .env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Database Schema Setup

Execute in **Supabase** SQL editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table
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

-- Index for vector search
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for metadata search
CREATE INDEX document_chunks_metadata_idx ON document_chunks
USING gin (metadata);

-- Index for source search
CREATE INDEX document_chunks_source_idx ON document_chunks (source);

-- Similarity search function
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

### 3.3 Supabase Client Implementation

**Vector database** client integrated with **Supabase**:

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

    console.log(`✅ ${documents.length} documents saved`);
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

    console.log(`🗑️ Documents from source "${source}" deleted`);
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

## 4. Building the Indexing Pipeline

### 4.1 Overall Pipeline Architecture

Complete indexing pipeline combining **embeddings** and **vector database**:

```
Document → Chunking → Embedding → Vector DB Storage
   ↓          ↓          ↓            ↓
  PDF   RecursiveChunker  VoyageAI   Supabase
  MD    FixedSizeChunker  OpenAI     Pinecone
  Web                     Cohere     Chroma
```

### 4.2 Indexing Pipeline Implementation

Integrating Day 2's chunking with today's **embeddings** and **vector database**:

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
    console.log(`📚 Starting indexing: ${sources.length} sources`);

    for (const source of sources) {
      await this.indexSource(source);
    }

    const totalCount = await this.store.count();
    console.log(`\n✅ Indexing complete! Total ${totalCount} chunks stored`);
  }

  private async indexSource(source: string): Promise<void> {
    console.log(`\n📄 Processing: ${source}`);

    // 1. Load documents
    const documents = await this.loader.load(source);
    console.log(`  → ${documents.length} documents loaded`);

    // 2. Chunking
    const allChunks: Array<{ content: string; metadata: Record<string, unknown> }> = [];
    for (const doc of documents) {
      const chunks = this.chunker.chunk(doc);
      allChunks.push(...chunks);
    }
    console.log(`  → ${allChunks.length} chunks created`);

    // 3. Batch embedding and storage
    for (let i = 0; i < allChunks.length; i += this.batchSize) {
      const batch = allChunks.slice(i, i + this.batchSize);
      const contents = batch.map(c => c.content);

      // Generate embeddings
      const embeddings = await this.embedder.embedBatch(contents);

      // Create records for storage
      const records: DocumentRecord[] = batch.map((chunk, idx) => ({
        content: chunk.content,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
        source: source,
        chunk_index: i + idx,
      }));

      // Store in vector DB
      await this.store.upsert(records);

      console.log(`  → Batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(allChunks.length / this.batchSize)} complete`);
    }
  }
}
```

### 4.3 Batch Processing Optimization

**Batch processing** is essential when processing large volumes of documents:

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

### 4.4 Deduplication

How to handle **duplicates** when re-indexing the same documents:

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

Handling duplicates in **Supabase**:

```sql
-- Unique constraint on source and chunk index
ALTER TABLE document_chunks
ADD CONSTRAINT unique_source_chunk
UNIQUE (source, chunk_index);
```

---

## 5. Hands-on: Complete Indexing Example

### 5.1 Project Setup

```bash
# Install required packages
npm install @supabase/supabase-js dotenv

# Set environment variables
echo "VOYAGE_API_KEY=your-voyage-key" >> .env
echo "SUPABASE_URL=https://xxx.supabase.co" >> .env
echo "SUPABASE_SERVICE_KEY=your-service-key" >> .env
```

### 5.2 Usage Example

```typescript
// examples/day3-indexing-demo.ts
import { IndexingPipeline } from '../src/rag/pipeline/indexing-pipeline';
import { VoyageEmbedder } from '../src/rag/embedders/voyage-embedder';
import { SupabaseVectorStore } from '../src/rag/stores/supabase-store';
import 'dotenv/config';

async function main() {
  // 1. Store documents with indexing pipeline
  const pipeline = new IndexingPipeline({
    chunkSize: 512,
    chunkOverlap: 50,
    batchSize: 50,
  });

  await pipeline.index([
    './documents/company-policy.pdf',
    './documents/product-guide.md',
  ]);

  // 2. Test search
  const embedder = new VoyageEmbedder({
    model: 'voyage-3',
    inputType: 'query',  // For search
  });
  const store = new SupabaseVectorStore();

  const query = "Tell me about the vacation policy";
  const queryEmbedding = await embedder.embed(query);

  const results = await store.search(queryEmbedding, {
    topK: 5,
    filter: { category: 'HR' },
  });

  console.log('\n🔍 Search results:');
  results.forEach((result, i) => {
    console.log(`\n[${i + 1}] Similarity: ${result.similarity.toFixed(3)}`);
    console.log(`    Source: ${result.source}`);
    console.log(`    Content: ${result.content.slice(0, 100)}...`);
  });
}

main().catch(console.error);
```

### 5.3 Execution Results

```
📚 Starting indexing: 2 sources

📄 Processing: ./documents/company-policy.pdf
  → 15 documents loaded
  → 45 chunks created
  → Batch 1/1 complete

📄 Processing: ./documents/product-guide.md
  → 8 documents loaded
  → 24 chunks created
  → Batch 1/1 complete

✅ Indexing complete! Total 69 chunks stored

🔍 Search results:

[1] Similarity: 0.892
    Source: ./documents/company-policy.pdf
    Content: Annual leave is granted 15 days after one year of employment, with additional days based on tenure...

[2] Similarity: 0.845
    Source: ./documents/company-policy.pdf
    Content: Sick leave is available up to 30 days per year with medical certificate submission...
```

---

## 6. Evaluating Embedding Quality

### 6.1 Search Quality Testing

How to verify that **embedding** model and **vector database** setup is working correctly:

```typescript
// src/rag/utils/embedding-evaluator.ts
interface EvaluationPair {
  query: string;
  expectedContent: string;  // Part of content that should be retrieved
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

// Usage example
const evaluation = await evaluateSearchQuality(embedder, store, [
  { query: "How many vacation days?", expectedContent: "15 days" },
  { query: "How to use sick leave", expectedContent: "certificate" },
  { query: "Remote work available?", expectedContent: "remote" },
]);

console.log(`Search accuracy: ${(evaluation.accuracy * 100).toFixed(1)}%`);
```

### 6.2 Embedding Visualization

Visualize high-dimensional **embeddings** in 2D to check clustering:

```typescript
// Dimension reduction and visualization with t-SNE or UMAP
// Actual implementation is better suited for Python (sklearn, plotly)

// In TypeScript, create a simple similarity matrix
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

## 7. Performance Optimization Tips

### 7.1 Embedding Caching

Prevent **embedding** regeneration for identical text:

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

### 7.2 Vector Index Tuning

Optimizing **pgvector**'s IVFFlat index:

```sql
-- Adjust lists parameter based on data volume
-- Rule: lists = sqrt(row_count)

-- 10K rows: lists = 100
-- 100K rows: lists = 316
-- 1M rows: lists = 1000

-- Recreate index
DROP INDEX IF EXISTS document_chunks_embedding_idx;
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 316);  -- Based on 100K rows

-- Adjust probes parameter during search (accuracy vs speed)
SET ivfflat.probes = 10;  -- Default 1, higher is more accurate but slower
```

### 7.3 Vector Database Monitoring

```sql
-- Check table size
SELECT
  pg_size_pretty(pg_total_relation_size('document_chunks')) as total_size,
  pg_size_pretty(pg_relation_size('document_chunks')) as table_size,
  pg_size_pretty(pg_indexes_size('document_chunks')) as indexes_size;

-- Check index usage
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

## 8. Summary and Next Episode Preview

### Key Takeaways

What we learned today:

1. **Embeddings** are the core technology for converting text to numerical vectors
2. **Voyage AI** is an **embedding** model optimized for search
3. **Vector databases** perform similarity-based searches
4. Build PostgreSQL-based systems with **Supabase Vector** and **pgvector**
5. Efficient indexing with **batch processing** and **deduplication**

### Day 4 Preview: Search Optimization and Reranking

In the next episode, we'll cover how to improve search quality:

- Semantic search vs keyword search vs hybrid search
- Tuning top-k and similarity thresholds
- Improving search accuracy with reranking
- Cohere Rerank integration

**Check out the full code on GitHub:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

---

## Series Navigation

- [Day 1: RAG Concepts and Architecture](/en/rag-day1-introduction)
- [Day 2: Document Processing and Chunking Strategies](/en/rag-day2-document-processing)
- **Day 3: Embeddings and Vector Databases** (Current)
- [Day 4: Search Optimization and Reranking](/en/rag-day4-search-optimization)
- [Day 5: Claude Integration and Answer Generation](/en/rag-day5-claude-integration)
- [Day 6: Production Deployment and Optimization](/en/rag-day6-production)
