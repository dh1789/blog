---
title: "RAG Day 2: Document Processing and Chunking Strategies for Effective Text Splitting"
slug: "rag-day2-document-processing-en"
excerpt: "Learn the essential first step of RAG systems: document processing and chunking strategies. Build a RAG preprocessing pipeline with PDF parsing, markdown processing, and text splitting techniques in TypeScript."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Document Processing"
  - "Chunking"
  - "Text Splitting"
  - "PDF Parsing"
  - "TypeScript"
language: "en"
---

> 🌐 **Translation**: This post was translated from [Korean original](/ko/rag-day2-document-processing).

## TL;DR

- **Document Processing** is the first step in RAG systems, converting various file formats to text
- **Chunking** is the process of **text splitting** long documents into search-optimized smaller pieces
- Support for various Document Processing methods: **PDF parsing**, markdown processing, web crawling
- **Text splitting** chunk size and overlap settings significantly impact RAG search quality
- RAG preprocessing pipeline manages **PDF parsing** results and metadata for improved search accuracy
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. Why Document Processing Matters in RAG

### Garbage In, Garbage Out

RAG system performance ultimately depends on input data quality. No matter how good your embedding model and LLM are, if **Document Processing** isn't done properly, search quality suffers.

This was a real problem I encountered when first building a RAG system. I extracted text via **PDF parsing**, but tables and image captions got mixed up. Naturally, search results were a mess too.

### Goals of Document Processing

The objectives to achieve in the Document Processing stage are clear:

1. **Clean text extraction**: Remove noise, organize formatting
2. **Proper text splitting**: **Chunking** optimized for search
3. **Metadata preservation**: Maintain source, title, section information
4. **Structure utilization**: Reflect paragraph, heading, list structure

This article covers document loading and chunking strategies, the core of RAG preprocessing pipelines.

---

## 2. Document Loading: Handling Various Formats

### 2.1 PDF Parsing

PDF is the most common document format in enterprise environments. **PDF parsing** is trickier than you might think.

```typescript
// src/rag/loaders/pdf-loader.ts
import pdf from 'pdf-parse';
import fs from 'fs/promises';

export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    page?: number;
    title?: string;
    [key: string]: unknown;
  };
}

export class PDFLoader {
  async load(filePath: string): Promise<DocumentChunk[]> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    // Document processing by page
    const chunks: DocumentChunk[] = [];
    const pages = data.text.split('\f'); // Page separator

    for (let i = 0; i < pages.length; i++) {
      const pageContent = pages[i].trim();
      if (pageContent.length > 0) {
        chunks.push({
          content: this.cleanText(pageContent),
          metadata: {
            source: filePath,
            page: i + 1,
            totalPages: pages.length,
          },
        });
      }
    }

    console.log(`📄 PDF parsing complete: ${chunks.length} pages`);
    return chunks;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Remove consecutive spaces
      .replace(/[^\S\r\n]+/g, ' ')    // Clean tabs, etc.
      .trim();
  }
}
```

**PDF parsing** considerations:

| Problem | Solution |
|---------|----------|
| Table corruption | Use table-specific extraction library (tabula-py) |
| Image caption mixing | Position-based filtering |
| Multi-column layout | Use layout analysis tools |
| Scanned PDFs | OCR processing (tesseract) |

### 2.2 Markdown Processing

Markdown has clear structure, making Document Processing relatively easy. Using heading structure enables meaningful **text splitting**.

```typescript
// src/rag/loaders/markdown-loader.ts
import matter from 'gray-matter';
import fs from 'fs/promises';

export class MarkdownLoader {
  async load(filePath: string): Promise<DocumentChunk[]> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Split sections by heading
    const sections = this.splitByHeadings(content);
    const chunks: DocumentChunk[] = [];

    for (const section of sections) {
      if (section.content.trim().length > 0) {
        chunks.push({
          content: section.content,
          metadata: {
            source: filePath,
            title: frontmatter.title || '',
            section: section.heading,
            ...frontmatter,
          },
        });
      }
    }

    console.log(`📝 Markdown processing complete: ${chunks.length} sections`);
    return chunks;
  }

  private splitByHeadings(content: string): Array<{heading: string; content: string}> {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const sections: Array<{heading: string; content: string}> = [];

    let lastIndex = 0;
    let lastHeading = 'Introduction';
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      if (lastIndex < match.index) {
        const sectionContent = content.slice(lastIndex, match.index).trim();
        if (sectionContent) {
          sections.push({ heading: lastHeading, content: sectionContent });
        }
      }
      lastHeading = match[2];
      lastIndex = match.index + match[0].length;
    }

    // Last section
    const remaining = content.slice(lastIndex).trim();
    if (remaining) {
      sections.push({ heading: lastHeading, content: remaining });
    }

    return sections;
  }
}
```

### 2.3 Web Page Crawling

Web documents are also important data sources for RAG systems. From a Document Processing perspective, HTML cleanup is key.

```typescript
// src/rag/loaders/web-loader.ts
import { JSDOM } from 'jsdom';

export class WebLoader {
  async load(url: string): Promise<DocumentChunk[]> {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unnecessary elements
    const elementsToRemove = ['script', 'style', 'nav', 'footer', 'aside'];
    for (const selector of elementsToRemove) {
      document.querySelectorAll(selector).forEach(el => el.remove());
    }

    // Extract main text
    const mainContent = document.querySelector('main, article, .content')
      || document.body;
    const text = mainContent.textContent || '';

    const cleanedText = this.cleanWebText(text);

    console.log(`🌐 Web page loading complete: ${url}`);

    return [{
      content: cleanedText,
      metadata: {
        source: url,
        title: document.title,
        type: 'webpage',
      },
    }];
  }

  private cleanWebText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
```

### 2.4 Unified Document Loader

Integrating multiple formats into a single interface makes the RAG preprocessing pipeline clean.

```typescript
// src/rag/loaders/document-loader.ts
import path from 'path';
import { PDFLoader } from './pdf-loader';
import { MarkdownLoader } from './markdown-loader';
import { WebLoader } from './web-loader';

export class DocumentLoader {
  private pdfLoader = new PDFLoader();
  private markdownLoader = new MarkdownLoader();
  private webLoader = new WebLoader();

  async load(source: string): Promise<DocumentChunk[]> {
    // If URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return this.webLoader.load(source);
    }

    // Determine by file extension
    const ext = path.extname(source).toLowerCase();

    switch (ext) {
      case '.pdf':
        return this.pdfLoader.load(source);
      case '.md':
      case '.markdown':
        return this.markdownLoader.load(source);
      case '.txt':
        return this.loadTextFile(source);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  private async loadTextFile(filePath: string): Promise<DocumentChunk[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    return [{
      content,
      metadata: { source: filePath },
    }];
  }
}
```

---

## 3. Chunking Strategies: The Art of Text Splitting

### 3.1 Why is Chunking Needed?

**Chunking** is the most important RAG preprocessing step. Embedding long documents as-is causes several problems:

1. **Embedding model limits**: Most have 8K token limits
2. **Meaning dilution**: Long text vectors get averaged, reducing search accuracy
3. **Context waste**: Passing unnecessary content to LLM

Proper **text splitting** determines search quality.

### 3.2 Fixed-Size Chunking

The simplest **chunking** approach. Split by fixed character or token count.

```typescript
// src/rag/chunkers/fixed-size-chunker.ts
export interface ChunkerConfig {
  chunkSize: number;      // Chunk size (characters)
  chunkOverlap: number;   // Overlap size
}

export class FixedSizeChunker {
  private config: ChunkerConfig;

  constructor(config: ChunkerConfig = { chunkSize: 1000, chunkOverlap: 200 }) {
    this.config = config;
  }

  chunk(document: DocumentChunk): DocumentChunk[] {
    const { content, metadata } = document;
    const { chunkSize, chunkOverlap } = this.config;

    if (content.length <= chunkSize) {
      return [document];
    }

    const chunks: DocumentChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkContent = content.slice(start, end);

      chunks.push({
        content: chunkContent,
        metadata: {
          ...metadata,
          chunkIndex,
          chunkTotal: Math.ceil(content.length / (chunkSize - chunkOverlap)),
        },
      });

      start += chunkSize - chunkOverlap;
      chunkIndex++;
    }

    console.log(`✂️ Fixed-size chunking: ${chunks.length} chunks created`);
    return chunks;
  }
}
```

**Importance of overlap**: **Text splitting** without overlap causes sentence cutting issues. Appropriate overlap (usually 10-20%) preserves context.

### 3.3 Semantic Chunking

A more sophisticated Document Processing approach. Respects paragraph and sentence boundaries.

```typescript
// src/rag/chunkers/semantic-chunker.ts
export class SemanticChunker {
  private maxChunkSize: number;
  private minChunkSize: number;

  constructor(maxChunkSize = 1000, minChunkSize = 100) {
    this.maxChunkSize = maxChunkSize;
    this.minChunkSize = minChunkSize;
  }

  chunk(document: DocumentChunk): DocumentChunk[] {
    const { content, metadata } = document;

    // First split by paragraph
    const paragraphs = content.split(/\n\n+/);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // If current chunk + new paragraph exceeds max size
      if (currentChunk.length + trimmedParagraph.length > this.maxChunkSize) {
        // Save current chunk
        if (currentChunk.length >= this.minChunkSize) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: { ...metadata, chunkIndex: chunkIndex++ },
          });
        }
        currentChunk = trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    }

    // Last chunk
    if (currentChunk.length >= this.minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { ...metadata, chunkIndex: chunkIndex++ },
      });
    }

    console.log(`📐 Semantic chunking: ${chunks.length} chunks created`);
    return chunks;
  }
}
```

### 3.4 Recursive Chunking

The most sophisticated **chunking** approach. Applies multiple separators hierarchically for **text splitting**.

```typescript
// src/rag/chunkers/recursive-chunker.ts
export class RecursiveChunker {
  private maxChunkSize: number;
  private separators: string[];

  constructor(
    maxChunkSize = 1000,
    separators = ['\n\n', '\n', '. ', ' ', '']
  ) {
    this.maxChunkSize = maxChunkSize;
    this.separators = separators;
  }

  chunk(document: DocumentChunk): DocumentChunk[] {
    const chunks = this.splitText(document.content, 0);
    return chunks.map((content, index) => ({
      content,
      metadata: { ...document.metadata, chunkIndex: index },
    }));
  }

  private splitText(text: string, separatorIndex: number): string[] {
    if (text.length <= this.maxChunkSize) {
      return [text];
    }

    if (separatorIndex >= this.separators.length) {
      // All separators exhausted, force split
      return this.forceSplit(text);
    }

    const separator = this.separators[separatorIndex];
    const parts = text.split(separator);
    const result: string[] = [];
    let current = '';

    for (const part of parts) {
      const combined = current
        ? current + separator + part
        : part;

      if (combined.length <= this.maxChunkSize) {
        current = combined;
      } else {
        if (current) {
          result.push(...this.splitText(current, separatorIndex + 1));
        }
        current = part;
      }
    }

    if (current) {
      result.push(...this.splitText(current, separatorIndex + 1));
    }

    console.log(`🔄 Recursive chunking (level ${separatorIndex}): ${result.length}`);
    return result;
  }

  private forceSplit(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.maxChunkSize) {
      chunks.push(text.slice(i, i + this.maxChunkSize));
    }
    return chunks;
  }
}
```

### 3.5 Chunking Strategy Comparison

Let's compare the pros and cons of each **chunking** strategy.

| Strategy | Pros | Cons | Suitable For |
|----------|------|------|--------------|
| Fixed-size | Simple implementation, predictable | Possible context breaks | Uniform text |
| Semantic | Excellent context preservation | Uneven chunk sizes | Documents with clear paragraph structure |
| Recursive | Flexible and sophisticated | Complex implementation | Various document formats |

**Practical recommendation**: In most cases, recursive **chunking** shows the best results. For markdown documents, semantic **chunking** is also effective.

---

## 4. Chunk Size Optimization

### 4.1 512 vs 1024 Tokens

Document Processing and **chunking** most debated topic. How should you set chunk size?

```typescript
// Chunk size experiment code
const testChunkSizes = [256, 512, 1024, 2048];

for (const size of testChunkSizes) {
  const chunker = new RecursiveChunker(size);
  const chunks = chunker.chunk(document);

  console.log(`Chunk size ${size}: ${chunks.length} chunks`);
  console.log(`Average chunk length: ${chunks.reduce((acc, c) => acc + c.content.length, 0) / chunks.length}`);
}
```

Chunk size characteristics from a RAG preprocessing perspective:

| Chunk Size | Characteristics | Suitable Question Types |
|------------|----------------|------------------------|
| 256 tokens | Very specific, many chunks | Fact-based questions |
| 512 tokens | Balanced choice | General Q&A |
| 1024 tokens | More context | Summary, comparison questions |
| 2048 tokens | When long context needed | Complex analysis |

### 4.2 Finding Optimal Values Through Experimentation

In Document Processing, optimal chunk size varies by data and use case. Experimentation is essential.

```typescript
// src/rag/utils/chunk-optimizer.ts
export class ChunkOptimizer {
  async findOptimalSize(
    documents: DocumentChunk[],
    testQueries: string[],
    searchFunction: (query: string, chunkSize: number) => Promise<number>
  ): Promise<number> {
    const chunkSizes = [256, 512, 768, 1024];
    const results: Map<number, number> = new Map();

    for (const size of chunkSizes) {
      let totalRelevance = 0;

      for (const query of testQueries) {
        const relevance = await searchFunction(query, size);
        totalRelevance += relevance;
      }

      const avgRelevance = totalRelevance / testQueries.length;
      results.set(size, avgRelevance);
      console.log(`Chunk size ${size}: avg relevance ${avgRelevance.toFixed(3)}`);
    }

    // Return size with highest relevance
    const optimal = [...results.entries()].sort((a, b) => b[1] - a[1])[0][0];
    console.log(`✅ Optimal chunk size: ${optimal}`);
    return optimal;
  }
}
```

In my experience, for Document Processing of technical documentation, 512-768 tokens worked well, while legal documents and contracts performed better with 1024 tokens.

---

## 5. Metadata Management

### 5.1 Why is Metadata Important?

In Document Processing and RAG preprocessing, metadata significantly improves search quality. **Chunking** without metadata means:

- Unknown source
- No filtering search possible
- Hierarchy information lost

### 5.2 Essential Metadata Fields

```typescript
interface ChunkMetadata {
  // Required fields
  source: string;           // Original file path or URL
  chunkIndex: number;       // Chunk order

  // Recommended fields
  title?: string;           // Document title
  section?: string;         // Section title
  page?: number;            // Page number (PDF)

  // Filtering fields
  category?: string;        // Category
  tags?: string[];          // Tags
  date?: string;            // Creation date

  // Hierarchy structure
  parentId?: string;        // Parent chunk ID
  level?: number;           // Heading level
}
```

### 5.3 Metadata Usage Example

When Document Processing with good metadata setup, filtering during search becomes possible.

```typescript
// Metadata-based filtered search
async function searchWithFilter(
  query: string,
  filter: { category?: string; dateFrom?: string }
) {
  const results = await vectorStore.search(query, {
    topK: 10,
    filter: {
      category: filter.category,
      date: { $gte: filter.dateFrom },
    },
  });

  return results;
}

// Usage example
const results = await searchWithFilter(
  'vacation policy',
  { category: 'HR', dateFrom: '2024-01-01' }
);
```

---

## 6. Complete Document Processing Pipeline

### 6.1 Pipeline Integration

Integrate all components we've built into a single RAG preprocessing pipeline.

```typescript
// src/rag/pipeline/ingestion-pipeline.ts
import { DocumentLoader } from '../loaders/document-loader';
import { RecursiveChunker } from '../chunkers/recursive-chunker';

export interface IngestionConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export class IngestionPipeline {
  private loader: DocumentLoader;
  private chunker: RecursiveChunker;

  constructor(config: IngestionConfig = { chunkSize: 512, chunkOverlap: 50 }) {
    this.loader = new DocumentLoader();
    this.chunker = new RecursiveChunker(config.chunkSize, config.separators);
  }

  async process(sources: string[]): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];

    for (const source of sources) {
      console.log(`📥 Document processing start: ${source}`);

      // 1. Document loading
      const documents = await this.loader.load(source);

      // 2. Chunking
      for (const doc of documents) {
        const chunks = this.chunker.chunk(doc);
        allChunks.push(...chunks);
      }
    }

    console.log(`\n✅ All document processing complete`);
    console.log(`   - Sources processed: ${sources.length}`);
    console.log(`   - Chunks generated: ${allChunks.length}`);

    return allChunks;
  }
}
```

### 6.2 Usage Example

```typescript
// examples/day2-document-processing.ts
import { IngestionPipeline } from '../src/rag/pipeline/ingestion-pipeline';

async function main() {
  const pipeline = new IngestionPipeline({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  // Document processing from various sources
  const chunks = await pipeline.process([
    './documents/company-policy.pdf',
    './documents/product-guide.md',
    'https://docs.example.com/api-reference',
  ]);

  // Check results
  console.log('\n📊 Chunking result sample:');
  console.log('---');
  console.log(chunks[0].content.slice(0, 200) + '...');
  console.log('Metadata:', chunks[0].metadata);
}

main().catch(console.error);
```

Execution output:

```
📥 Document processing start: ./documents/company-policy.pdf
📄 PDF parsing complete: 15 pages
🔄 Recursive chunking (level 0): 45

📥 Document processing start: ./documents/product-guide.md
📝 Markdown processing complete: 8 sections
🔄 Recursive chunking (level 0): 12

📥 Document processing start: https://docs.example.com/api-reference
🌐 Web page loading complete
🔄 Recursive chunking (level 0): 20

✅ All document processing complete
   - Sources processed: 3
   - Chunks generated: 77
```

---

## 7. Practical Tips: Improving Document Processing Quality

Here are practical tips for effective Document Processing.

### 7.1 Text Normalization

After **PDF parsing**, normalization is essential. Ensure clean data before **text splitting**.

```typescript
function normalizeText(text: string): string {
  return text
    // Unicode normalization
    .normalize('NFC')
    // Remove consecutive spaces
    .replace(/\s+/g, ' ')
    // Convert special quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Normalize hyphens
    .replace(/[‐‑‒–—―]/g, '-')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .trim();
}
```

### 7.2 Noise Filtering

During Document Processing and **PDF parsing**, remove unnecessary content. Too much noise degrades **text splitting** quality.

```typescript
function filterNoise(chunks: DocumentChunk[]): DocumentChunk[] {
  return chunks.filter(chunk => {
    const content = chunk.content;

    // Remove too short chunks
    if (content.length < 50) return false;

    // Remove mostly numeric chunks (page numbers, etc.)
    const numericRatio = (content.match(/\d/g)?.length || 0) / content.length;
    if (numericRatio > 0.5) return false;

    // Remove repetitive patterns (headers/footers)
    if (/^\s*(page|Page)\s*\d+\s*$/i.test(content)) return false;

    return true;
  });
}
```

### 7.3 Chunk Quality Validation

Validate quality after Document Processing and **text splitting**.

```typescript
function validateChunks(chunks: DocumentChunk[]): void {
  const stats = {
    total: chunks.length,
    tooShort: 0,
    tooLong: 0,
    noMetadata: 0,
  };

  for (const chunk of chunks) {
    if (chunk.content.length < 100) stats.tooShort++;
    if (chunk.content.length > 2000) stats.tooLong++;
    if (!chunk.metadata.source) stats.noMetadata++;
  }

  console.log('📊 Chunk quality report:');
  console.log(`   Total chunks: ${stats.total}`);
  console.log(`   Too short (<100): ${stats.tooShort}`);
  console.log(`   Too long (>2000): ${stats.tooLong}`);
  console.log(`   Missing metadata: ${stats.noMetadata}`);
}
```

---

## 8. Conclusion and Next Preview

Today we explored Document Processing and **chunking** strategies, the first step of RAG systems.

### Key Points

1. Document Processing is the foundation of RAG quality - **PDF parsing**, markdown, web crawling support
2. **Chunking** determines search quality - fixed-size, semantic, recursive strategies
3. Preserve context with overlap during **text splitting**
4. Metadata enables filtered search and source tracking
5. RAG preprocessing pipeline integrates all components

### Day 3 Preview: Embeddings and Vector Database

Next, we'll cover converting chunks to vectors and storing them:

- Embedding model comparison (OpenAI, Voyage AI, Cohere)
- Supabase Vector setup and pgvector basics
- Complete batch embedding and indexing pipeline

**Check out the full code on GitHub:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

---

## Series Navigation

- [Day 1: RAG Concepts and Architecture](/en/rag-day1-introduction-en)
- **Day 2: Document Processing and Chunking Strategies** (Current)
- [Day 3: Embeddings and Vector Database](/en/rag-day3-embedding-vectordb-en)
- [Day 4: Search Optimization and Reranking](/en/rag-day4-search-optimization-en)
- [Day 5: Claude Integration and Answer Generation](/en/rag-day5-claude-integration-en)
- [Day 6: Production Deployment and Optimization](/en/rag-day6-production-en)
