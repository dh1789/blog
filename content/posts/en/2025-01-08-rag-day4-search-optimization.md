---
title: 'RAG Day 4: Search Optimization and Reranking Guide'
slug: rag-day4-search-optimization-en
excerpt: >-
  Boost your RAG system's search accuracy with hybrid retrieval strategies.
  Compare semantic, keyword, and hybrid search methods, then apply reranking
  techniques to surface the most relevant documents every time.
status: publish
categories:
  - RAG
  - AI Development
tags:
  - RAG
  - Semantic Search
  - Hybrid Search
  - Reranking
  - Search Optimization
  - BM25
language: en
---

## TL;DR

- **Semantic search** finds documents based on meaning but struggles with exact keyword matching
- **Keyword search (BM25)** excels at precise term matching but can't understand synonyms or context
- **Hybrid search** combines both approaches to significantly improve search quality
- **Reranking** reorders search results to surface the most relevant documents
- Search parameter tuning optimizes RAG system performance
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

> 💡 **Why I wrote this article**
>
> Adapting to a new environment without proper documentation or guides was challenging. I wasted time repeatedly solving the same problems and searching for information that someone already knew. I'm writing this series to help others avoid these repetitive struggles and to deepen my own understanding through the process of organizing this knowledge.

---

## 1. The Core Challenge of RAG Search

### 1.1 Why Search Matters

In RAG systems, **search optimization** is the key factor that determines answer quality. No matter how powerful your LLM is, retrieving the wrong documents leads to wrong answers.

```typescript
// Search quality determines RAG quality
const query = "How to use type guards in TypeScript";

// Poor search results -> Poor answers
const badResults = ["JavaScript basics", "Python type hints"];

// Good search results -> Good answers
const goodResults = [
  "TypeScript type guard patterns",
  "Implementing custom type guards"
];
```

### 1.2 Limitations of Semantic Search

The **semantic search** we implemented in Day 3 finds documents based on meaning. However, it has several limitations:

```typescript
// Example of semantic search limitations
const query = "RFC 2119 MUST keyword";

// Semantic search results - semantically similar documents
const semanticResults = [
  "Standard document writing guidelines",  // Relevance: Medium
  "How to define mandatory requirements",   // Relevance: Medium
  "Documentation best practices"            // Relevance: Low
];

// The document we actually want
const expectedResult = "RFC 2119 Standard Keyword Definitions - MUST, SHOULD, MAY";
```

Problems with **semantic search**:
- May miss exact keywords (RFC 2119)
- Vulnerable to proper nouns and abbreviations
- Difficulty recognizing new terms or domain-specific terminology

---

## 2. Comparing Search Approaches

> 💪 **To be honest...**
>
> When I first studied search optimization, I struggled because the concepts weren't clear in my mind. BM25, TF-IDF, semantic search, reranking... There were many terms, but I couldn't grasp how they differed or when to use each one. Eventually, I understood them one by one by writing code and comparing results. In this article, I'll share the areas where I struggled.

### 2.1 Keyword Search (BM25)

**BM25** is a traditional keyword-based search algorithm. It forms the foundation of **search optimization**.

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

    // Tokenize and index documents
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
    // Tokenization for Korean + English
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }
}
```

Advantages of **BM25**:
- Precise keyword matching
- Fast search speed
- Higher weight for rare terms

### 2.2 Semantic Search Implementation

**Semantic search** finds semantically related documents based on vector similarity.

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
    // Convert query to vector
    const queryVector = await this.embedder.embed(query, 'query');

    // Vector similarity search
    const results = await this.vectorStore.search(queryVector, topK);

    return results.map(result => ({
      document: result.document,
      score: result.similarity,
      method: 'semantic' as const
    }));
  }
}
```

### 2.3 Hybrid Search

**Hybrid search** combines **BM25** and **semantic search**. It leverages the strengths of both approaches to achieve **search optimization**.

```typescript
// src/rag/retrievers/hybrid-retriever.ts
export interface HybridConfig {
  semanticWeight: number;  // Semantic search weight (0-1)
  bm25Weight: number;      // BM25 weight (0-1)
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
    // Run both searches in parallel
    const [semanticResults, bm25Results] = await Promise.all([
      this.semanticRetriever.search(query, this.config.topK * 2),
      this.bm25Retriever.search(query, this.config.topK * 2)
    ]);

    // Fuse results
    if (this.config.fusionMethod === 'rrf') {
      return this.reciprocalRankFusion(semanticResults, bm25Results);
    }

    return this.weightedFusion(semanticResults, bm25Results);
  }

  // Reciprocal Rank Fusion - rank-based fusion
  private reciprocalRankFusion(
    semanticResults: SearchResult[],
    bm25Results: SearchResult[]
  ): SearchResult[] {
    const k = 60; // RRF constant
    const scores = new Map<string, number>();

    // Calculate scores for semantic search results
    semanticResults.forEach((result, rank) => {
      const docId = result.document.id;
      const rrfScore = 1 / (k + rank + 1);
      scores.set(docId, (scores.get(docId) || 0) + rrfScore * this.config.semanticWeight);
    });

    // Add BM25 result scores
    bm25Results.forEach((result, rank) => {
      const docId = result.document.id;
      const rrfScore = 1 / (k + rank + 1);
      scores.set(docId, (scores.get(docId) || 0) + rrfScore * this.config.bm25Weight);
    });

    // Sort by score
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

  // Weighted fusion
  private weightedFusion(
    semanticResults: SearchResult[],
    bm25Results: SearchResult[]
  ): SearchResult[] {
    const scores = new Map<string, { score: number; document: Document }>();

    // Normalize scores and apply weights
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

## 3. Search Parameter Tuning

### 3.1 Top-K Configuration

In **search optimization**, the top-k value determines the number of search results.

```typescript
// Top-k configuration guide
interface TopKConfig {
  // General Q&A
  simple: 3,

  // Complex questions
  complex: 5,

  // Comprehensive analysis
  comprehensive: 10,

  // With reranking (search more, then filter)
  withReranking: 20
}

// Dynamic top-k determination
function determineTopK(query: string): number {
  const complexity = analyzeQueryComplexity(query);

  if (complexity.isMultiHop) return 10;
  if (complexity.requiresComparison) return 8;
  if (complexity.isFactual) return 3;

  return 5; // Default
}
```

### 3.2 Similarity Threshold

Filter out results with low similarity:

```typescript
// src/rag/retrievers/filtered-retriever.ts
export class FilteredRetriever {
  constructor(
    private retriever: HybridRetriever,
    private minScore: number = 0.7
  ) {}

  async search(query: string, topK: number): Promise<SearchResult[]> {
    const results = await this.retriever.search(query);

    // Return only results above threshold
    const filtered = results.filter(r => r.score >= this.minScore);

    // Ensure minimum number of results
    if (filtered.length < 2 && results.length >= 2) {
      return results.slice(0, 2);
    }

    return filtered.slice(0, topK);
  }
}
```

### 3.3 Metadata Filtering

Apply metadata-based filtering for **search optimization**:

```typescript
// Metadata filter definition
interface MetadataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}

// Apply metadata filter in Supabase
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

  // Apply filters
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

// Usage example
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

## 4. Improving Search Quality with Reranking

### 4.1 Why Reranking is Needed

Reorder initial search results with a more sophisticated model. **Reranking** significantly improves search quality.

```typescript
// Comparison before and after reranking
const query = "TypeScript generic type inference";

// Initial search results (semantic search)
const initialResults = [
  { title: "TypeScript basic types", score: 0.85 },
  { title: "Generic programming concepts", score: 0.83 },
  { title: "Advanced TypeScript generic type inference", score: 0.81 },  // Most relevant
  { title: "Type system comparison", score: 0.80 }
];

// Results after reranking
const rerankedResults = [
  { title: "Advanced TypeScript generic type inference", score: 0.95 },  // Moved to #1
  { title: "Generic programming concepts", score: 0.78 },
  { title: "TypeScript basic types", score: 0.65 },
  { title: "Type system comparison", score: 0.45 }
];
```

### 4.2 Cohere Rerank Implementation

Use the Cohere Rerank API for **reranking**:

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

### 4.3 Cross-Encoder Reranking

**Reranking** using a Cross-Encoder model that runs locally:

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
    // Create query-document pairs
    const pairs = documents.map(doc => ({
      text: query,
      text_pair: doc.document.content.slice(0, 512) // Token limit
    }));

    // Calculate relevance scores
    const scores = await Promise.all(
      pairs.map(async pair => {
        const result = await this.model(pair.text, { text_pair: pair.text_pair });
        return result[0].score;
      })
    );

    // Sort by score
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

### 4.4 Integrating Reranking Pipeline

Integrate **reranking** into the complete search pipeline:

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
    // Step 1: Extract candidates with hybrid search
    const candidates = await this.retriever.search(query);
    console.log(`[Search] ${candidates.length} candidate documents retrieved`);

    // Step 2: Reorder with reranking
    const reranked = await this.reranker.rerank(
      query,
      candidates,
      this.config.finalTopK * 2
    );
    console.log(`[Reranking] Top ${reranked.length} documents reordered`);

    // Step 3: Threshold filtering
    const filtered = reranked.filter(
      r => r.score >= this.config.minScoreThreshold
    );

    return filtered.slice(0, this.config.finalTopK);
  }
}

// Usage example
const pipeline = new RerankingPipeline(
  hybridRetriever,
  cohereReranker,
  {
    initialTopK: 20,    // Initial search: 20
    finalTopK: 5,       // Final results: 5
    minScoreThreshold: 0.5
  }
);
```

---

## 5. Evaluating Search Performance

### 5.1 Evaluation Metrics

Metrics for measuring **search optimization** results:

```typescript
// src/rag/evaluation/metrics.ts
export interface EvaluationMetrics {
  // Precision@K: Ratio of relevant documents in top K
  precisionAtK: number;

  // Recall@K: Ratio of relevant documents included in top K
  recallAtK: number;

  // MRR: Mean reciprocal rank of first relevant document
  mrr: number;

  // NDCG: Relevance score considering ranking
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

  // NDCG calculation
  const ndcg = calculateNDCG(results, relevantDocIds, k);

  return { precisionAtK, recallAtK, mrr, ndcg };
}
```

### 5.2 A/B Testing

Compare the effectiveness of **hybrid search** and **reranking**:

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
    // Search with each method
    const semanticResults = await retrievers.semantic.search(query, 5);
    const hybridResults = await retrievers.hybrid.search(query);
    const rerankingResults = await retrievers.reranking.search(query);

    // Calculate metrics
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

### 5.3 Performance Comparison Results

Example of actual test results:

| Method | Precision@5 | MRR | Response Time |
|--------|-------------|-----|---------------|
| Semantic Search | 0.65 | 0.72 | 120ms |
| **Hybrid Search** | 0.78 | 0.85 | 180ms |
| **Hybrid + Reranking** | 0.89 | 0.94 | 350ms |

Combining **hybrid search** with **reranking** significantly improves search quality.

---

## 6. Practical Application Tips

> 🛠️ **How I plan to apply this**
>
> Our team has accumulated issue histories, cautions, and other information that needs to be remembered scattered across various places—Slack, Notion, Confluence, even personal notes. I plan to build a RAG system for this information to create a tool that quickly finds relevant documents when someone asks, "I think I've seen this error before." Hybrid search was essential because it needs to handle both error codes (exact matching) and error situation descriptions (semantic matching) simultaneously.

### 6.1 Search Method Selection Guide

```typescript
// Select search method based on context
function selectRetriever(context: QueryContext): Retriever {
  // Exact term search (code names, API names, etc.)
  if (context.hasExactTerms) {
    return bm25Retriever;
  }

  // Conceptual questions
  if (context.isConceptual) {
    return semanticRetriever;
  }

  // Complex questions - hybrid + reranking
  return rerankingPipeline;
}
```

### 6.2 Cost Optimization

Optimization considering **reranking** API costs:

```typescript
// Conditional reranking
async function smartRerank(
  query: string,
  results: SearchResult[]
): Promise<SearchResult[]> {
  // Skip reranking if top result score is high enough
  if (results[0]?.score > 0.9 && results[1]?.score < 0.7) {
    console.log('[Optimization] Clear result, skipping reranking');
    return results;
  }

  // Perform reranking if top results have similar scores
  const topScoreGap = results[0]?.score - results[4]?.score;
  if (topScoreGap < 0.1) {
    console.log('[Optimization] Small score difference, performing reranking');
    return await reranker.rerank(query, results, 5);
  }

  return results;
}
```

---

## 7. Complete Code Integration

### 7.1 Final Search System

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

    // Hybrid search
    let results = await this.hybridRetriever.search(query);

    // Apply metadata filters
    if (filters.length > 0) {
      results = this.applyFilters(results, filters);
    }

    // Reranking
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

## Conclusion

In Day 4, we covered **search optimization** for RAG systems:

1. Limitations of **semantic search** and the need for **BM25** keyword search
2. Combining the strengths of both approaches with **hybrid search**
3. Improving search result quality with **reranking**
4. Search parameter tuning and performance evaluation

In Day 5, we'll explore how to pass retrieved documents to Claude to generate answers.

---

## Series Navigation

- [Day 1: RAG Concepts and Architecture](/en/rag-day1-introduction)
- [Day 2: Document Processing and Chunking Strategies](/en/rag-day2-document-processing)
- [Day 3: Embeddings and Vector Databases](/en/rag-day3-embedding-vectordb)
- **Day 4: Search Optimization and Reranking** (Current)
- [Day 5: Claude Integration and Answer Generation](/en/rag-day5-claude-integration)
- [Day 6: Production Deployment and Optimization](/en/rag-day6-production)
