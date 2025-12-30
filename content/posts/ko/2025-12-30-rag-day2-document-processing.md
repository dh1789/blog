---
title: "RAG Day 2: 문서 처리와 청킹 전략 - 효과적인 텍스트 분할"
slug: "rag-day2-document-processing"
excerpt: "RAG 시스템의 첫 단계인 문서 처리와 청킹 전략을 알아봅니다. PDF 파싱, 마크다운 처리, 텍스트 분할 기법으로 RAG 전처리 파이프라인을 구축하고 검색 품질을 높이는 방법을 TypeScript로 구현합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "문서 처리"
  - "청킹"
  - "텍스트 분할"
  - "PDF 파싱"
  - "Document Processing"
language: "ko"
---

## TL;DR

- **문서 처리**(Document Processing)는 RAG 시스템의 첫 단계로, 다양한 형식의 파일을 텍스트로 변환
- **청킹**(Chunking)은 긴 문서를 검색에 적합한 작은 조각으로 **텍스트 분할**하는 과정
- **PDF 파싱**, 마크다운 처리, 웹 크롤링 등 다양한 Document Processing 방법 지원
- **텍스트 분할** 시 청크 크기와 오버랩 설정이 RAG 검색 품질에 큰 영향
- **RAG 전처리** 파이프라인으로 **PDF 파싱** 결과와 메타데이터를 함께 관리해 검색 정확도 향상
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. RAG에서 문서 처리가 중요한 이유

### 쓰레기가 들어가면 쓰레기가 나온다

RAG 시스템의 성능은 결국 입력 데이터의 품질에 달려 있습니다. 아무리 좋은 임베딩 모델과 LLM을 사용해도, **문서 처리**(Document Processing)가 제대로 되지 않으면 검색 품질이 떨어집니다.

실제로 제가 처음 RAG 시스템을 구축할 때 겪었던 문제입니다. **PDF 파싱**으로 텍스트를 추출했는데, 표와 이미지 캡션이 뒤섞여서 엉망이 됐습니다. 당연히 검색 결과도 엉망이었습니다.

### 문서 처리의 목표

**Document Processing** 단계에서 달성해야 할 목표는 명확합니다:

1. **깨끗한 텍스트 추출**: 노이즈 제거, 포맷 정리
2. **적절한 크기로 텍스트 분할**: 검색에 최적화된 **청킹**
3. **메타데이터 보존**: 출처, 제목, 섹션 정보 유지
4. **구조 정보 활용**: 문단, 헤딩, 리스트 구조 반영

이 글에서는 **RAG 전처리** 파이프라인의 핵심인 문서 로딩과 청킹 전략을 상세히 다룹니다.

---

## 2. 문서 로딩: 다양한 형식 처리하기

### 2.1 PDF 파싱

기업 환경에서 가장 많이 다루는 문서 형식이 PDF입니다. **PDF 파싱**은 생각보다 까다롭습니다.

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

    // 페이지별로 문서 처리
    const chunks: DocumentChunk[] = [];
    const pages = data.text.split('\f'); // 페이지 구분자

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

    console.log(`📄 PDF 파싱 완료: ${chunks.length}개 페이지`);
    return chunks;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // 연속 공백 제거
      .replace(/[^\S\r\n]+/g, ' ')    // 탭 등 정리
      .trim();
  }
}
```

**PDF 파싱** 시 주의할 점:

| 문제 | 해결 방법 |
|------|----------|
| 표가 깨짐 | 표 전용 추출 라이브러리 사용 (tabula-py) |
| 이미지 캡션 혼입 | 위치 기반 필터링 |
| 다단 레이아웃 | 레이아웃 분석 도구 활용 |
| 스캔 PDF | OCR 처리 (tesseract) |

### 2.2 마크다운 처리

마크다운은 구조가 명확해서 **문서 처리**가 비교적 쉽습니다. 헤딩 구조를 활용하면 의미 있는 **텍스트 분할**이 가능합니다.

```typescript
// src/rag/loaders/markdown-loader.ts
import matter from 'gray-matter';
import fs from 'fs/promises';

export class MarkdownLoader {
  async load(filePath: string): Promise<DocumentChunk[]> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // 헤딩 기준으로 섹션 분리
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

    console.log(`📝 마크다운 처리 완료: ${chunks.length}개 섹션`);
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

    // 마지막 섹션
    const remaining = content.slice(lastIndex).trim();
    if (remaining) {
      sections.push({ heading: lastHeading, content: remaining });
    }

    return sections;
  }
}
```

### 2.3 웹 페이지 크롤링

웹 문서도 RAG 시스템의 중요한 데이터 소스입니다. **Document Processing** 관점에서 HTML 정리가 핵심입니다.

```typescript
// src/rag/loaders/web-loader.ts
import { JSDOM } from 'jsdom';

export class WebLoader {
  async load(url: string): Promise<DocumentChunk[]> {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 불필요한 요소 제거
    const elementsToRemove = ['script', 'style', 'nav', 'footer', 'aside'];
    for (const selector of elementsToRemove) {
      document.querySelectorAll(selector).forEach(el => el.remove());
    }

    // 본문 텍스트 추출
    const mainContent = document.querySelector('main, article, .content')
      || document.body;
    const text = mainContent.textContent || '';

    const cleanedText = this.cleanWebText(text);

    console.log(`🌐 웹 페이지 로딩 완료: ${url}`);

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

### 2.4 통합 문서 로더

여러 형식을 하나의 인터페이스로 통합하면 **RAG 전처리** 파이프라인이 깔끔해집니다.

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
    // URL인 경우
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return this.webLoader.load(source);
    }

    // 파일 확장자로 판단
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
        throw new Error(`지원하지 않는 파일 형식: ${ext}`);
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

## 3. 청킹 전략: 텍스트 분할의 기술

### 3.1 왜 청킹이 필요한가?

**청킹**은 RAG 시스템에서 가장 중요한 **RAG 전처리** 단계입니다. 긴 문서를 그대로 임베딩하면 여러 문제가 발생합니다:

1. **임베딩 모델 제한**: 대부분 8K 토큰 제한
2. **의미 희석**: 긴 텍스트는 벡터가 평균화되어 검색 정확도 저하
3. **컨텍스트 낭비**: LLM에 불필요한 내용까지 전달

적절한 **텍스트 분할**은 검색 품질을 결정합니다.

### 3.2 고정 크기 청킹

가장 단순한 **청킹** 방식입니다. 일정한 문자 수나 토큰 수로 분할합니다.

```typescript
// src/rag/chunkers/fixed-size-chunker.ts
export interface ChunkerConfig {
  chunkSize: number;      // 청크 크기 (문자 수)
  chunkOverlap: number;   // 오버랩 크기
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

    console.log(`✂️ 고정 크기 청킹: ${chunks.length}개 청크 생성`);
    return chunks;
  }
}
```

**오버랩의 중요성**: 오버랩 없이 **텍스트 분할**하면 문장이 잘리는 문제가 생깁니다. 적절한 오버랩(보통 10-20%)으로 문맥을 보존합니다.

### 3.3 의미 기반 청킹

**Document Processing**에서 더 정교한 방식입니다. 문단이나 문장 경계를 존중합니다.

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

    // 문단 단위로 먼저 분리
    const paragraphs = content.split(/\n\n+/);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // 현재 청크 + 새 문단이 최대 크기 초과하면
      if (currentChunk.length + trimmedParagraph.length > this.maxChunkSize) {
        // 현재 청크 저장
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

    // 마지막 청크
    if (currentChunk.length >= this.minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { ...metadata, chunkIndex: chunkIndex++ },
      });
    }

    console.log(`📐 의미 기반 청킹: ${chunks.length}개 청크 생성`);
    return chunks;
  }
}
```

### 3.4 재귀적 청킹

가장 세련된 **청킹** 방식입니다. 여러 구분자를 계층적으로 적용해 **텍스트 분할**합니다.

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
      // 모든 구분자 소진, 강제 분할
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

    console.log(`🔄 재귀적 청킹 (레벨 ${separatorIndex}): ${result.length}개`);
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

### 3.5 청킹 전략 비교

각 **청킹** 전략의 장단점을 비교해봅시다.

| 전략 | 장점 | 단점 | 적합한 상황 |
|-----|------|------|------------|
| 고정 크기 | 구현 간단, 예측 가능 | 문맥 단절 가능 | 균일한 텍스트 |
| 의미 기반 | 문맥 보존 우수 | 청크 크기 불균일 | 문단 구조 명확한 문서 |
| 재귀적 | 유연하고 정교함 | 구현 복잡 | 다양한 문서 형식 |

**실무 권장**: 대부분의 경우 재귀적 **청킹**이 가장 좋은 결과를 보입니다. 마크다운 문서라면 의미 기반 **청킹**도 효과적입니다.

---

## 4. 청크 크기 최적화

### 4.1 512 vs 1024 토큰

Document Processing과 **청킹**에서 가장 많이 논쟁되는 주제입니다. 청크 크기를 어떻게 설정해야 할까요?

```typescript
// 청크 크기 실험 코드
const testChunkSizes = [256, 512, 1024, 2048];

for (const size of testChunkSizes) {
  const chunker = new RecursiveChunker(size);
  const chunks = chunker.chunk(document);

  console.log(`청크 크기 ${size}: ${chunks.length}개 청크`);
  console.log(`평균 청크 길이: ${chunks.reduce((acc, c) => acc + c.content.length, 0) / chunks.length}`);
}
```

**RAG 전처리** 관점에서 청크 크기별 특성:

| 청크 크기 | 특성 | 적합한 질문 유형 |
|----------|------|----------------|
| 256 토큰 | 매우 구체적, 많은 청크 | 사실 기반 질문 |
| 512 토큰 | 균형 잡힌 선택 | 일반적인 질의응답 |
| 1024 토큰 | 더 많은 문맥 | 요약, 비교 질문 |
| 2048 토큰 | 긴 문맥 필요 시 | 복잡한 분석 |

### 4.2 실험으로 최적값 찾기

Document Processing에서 최적의 청크 크기는 데이터와 사용 사례에 따라 다릅니다. 실험이 필수입니다.

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
      console.log(`청크 크기 ${size}: 평균 관련성 ${avgRelevance.toFixed(3)}`);
    }

    // 가장 높은 관련성을 보인 크기 반환
    const optimal = [...results.entries()].sort((a, b) => b[1] - a[1])[0][0];
    console.log(`✅ 최적 청크 크기: ${optimal}`);
    return optimal;
  }
}
```

제 경험상, **문서 처리** 대상이 기술 문서라면 512-768 토큰이 좋았고, 법률 문서나 계약서는 1024 토큰이 더 나았습니다.

---

## 5. 메타데이터 관리

### 5.1 왜 메타데이터가 중요한가?

Document Processing과 **RAG 전처리**에서 메타데이터는 검색 품질을 크게 향상시킵니다. 메타데이터 없이 **청킹**만 하면:

- 출처를 알 수 없음
- 필터링 검색 불가
- 계층 구조 정보 손실

### 5.2 필수 메타데이터 필드

```typescript
interface ChunkMetadata {
  // 필수 필드
  source: string;           // 원본 파일 경로 또는 URL
  chunkIndex: number;       // 청크 순서

  // 권장 필드
  title?: string;           // 문서 제목
  section?: string;         // 섹션 제목
  page?: number;            // 페이지 번호 (PDF)

  // 필터링용 필드
  category?: string;        // 카테고리
  tags?: string[];          // 태그
  date?: string;            // 작성일

  // 계층 구조
  parentId?: string;        // 상위 청크 ID
  level?: number;           // 헤딩 레벨
}
```

### 5.3 메타데이터 활용 예시

**문서 처리** 시 메타데이터를 잘 설정하면, 검색 시 필터링이 가능합니다.

```typescript
// 메타데이터 기반 필터링 검색
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

// 사용 예시
const results = await searchWithFilter(
  '휴가 정책',
  { category: 'HR', dateFrom: '2024-01-01' }
);
```

---

## 6. 전체 문서 처리 파이프라인

### 6.1 파이프라인 통합

지금까지 만든 컴포넌트를 하나의 **RAG 전처리** 파이프라인으로 통합합니다.

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
      console.log(`📥 문서 처리 시작: ${source}`);

      // 1. 문서 로딩
      const documents = await this.loader.load(source);

      // 2. 청킹
      for (const doc of documents) {
        const chunks = this.chunker.chunk(doc);
        allChunks.push(...chunks);
      }
    }

    console.log(`\n✅ 전체 문서 처리 완료`);
    console.log(`   - 처리된 소스: ${sources.length}개`);
    console.log(`   - 생성된 청크: ${allChunks.length}개`);

    return allChunks;
  }
}
```

### 6.2 사용 예시

```typescript
// examples/day2-document-processing.ts
import { IngestionPipeline } from '../src/rag/pipeline/ingestion-pipeline';

async function main() {
  const pipeline = new IngestionPipeline({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  // 다양한 소스의 문서 처리
  const chunks = await pipeline.process([
    './documents/company-policy.pdf',
    './documents/product-guide.md',
    'https://docs.example.com/api-reference',
  ]);

  // 결과 확인
  console.log('\n📊 청킹 결과 샘플:');
  console.log('---');
  console.log(chunks[0].content.slice(0, 200) + '...');
  console.log('메타데이터:', chunks[0].metadata);
}

main().catch(console.error);
```

실행 결과:

```
📥 문서 처리 시작: ./documents/company-policy.pdf
📄 PDF 파싱 완료: 15개 페이지
🔄 재귀적 청킹 (레벨 0): 45개

📥 문서 처리 시작: ./documents/product-guide.md
📝 마크다운 처리 완료: 8개 섹션
🔄 재귀적 청킹 (레벨 0): 12개

📥 문서 처리 시작: https://docs.example.com/api-reference
🌐 웹 페이지 로딩 완료
🔄 재귀적 청킹 (레벨 0): 20개

✅ 전체 문서 처리 완료
   - 처리된 소스: 3개
   - 생성된 청크: 77개
```

---

## 7. 실전 팁: 문서 처리 품질 높이기

효과적인 Document Processing을 위해 실전에서 유용한 팁들을 정리했습니다.

### 7.1 텍스트 정규화

**PDF 파싱** 후에는 반드시 정규화 과정이 필요합니다. **텍스트 분할** 전에 깨끗한 데이터를 확보하세요.

```typescript
function normalizeText(text: string): string {
  return text
    // 유니코드 정규화
    .normalize('NFC')
    // 연속 공백 제거
    .replace(/\s+/g, ' ')
    // 특수 따옴표 변환
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // 하이픈 정규화
    .replace(/[‐‑‒–—―]/g, '-')
    // 줄바꿈 정규화
    .replace(/\r\n/g, '\n')
    .trim();
}
```

### 7.2 노이즈 필터링

**문서 처리**와 **PDF 파싱** 시 불필요한 내용을 제거합니다. 노이즈가 많으면 **텍스트 분할** 품질도 떨어집니다.

```typescript
function filterNoise(chunks: DocumentChunk[]): DocumentChunk[] {
  return chunks.filter(chunk => {
    const content = chunk.content;

    // 너무 짧은 청크 제거
    if (content.length < 50) return false;

    // 대부분 숫자인 청크 제거 (페이지 번호 등)
    const numericRatio = (content.match(/\d/g)?.length || 0) / content.length;
    if (numericRatio > 0.5) return false;

    // 반복 패턴 제거 (머리글/바닥글)
    if (/^\s*(page|페이지)\s*\d+\s*$/i.test(content)) return false;

    return true;
  });
}
```

### 7.3 청크 품질 검증

Document Processing과 **텍스트 분할** 후 품질을 검증합니다.

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

  console.log('📊 청크 품질 리포트:');
  console.log(`   총 청크: ${stats.total}`);
  console.log(`   너무 짧음 (<100): ${stats.tooShort}`);
  console.log(`   너무 김 (>2000): ${stats.tooLong}`);
  console.log(`   메타데이터 누락: ${stats.noMetadata}`);
}
```

---

## 8. 마무리 및 다음 편 예고

오늘은 RAG 시스템의 첫 단계인 **문서 처리**와 **청킹** 전략을 살펴봤습니다.

### 핵심 포인트

1. **문서 처리**는 RAG 품질의 기초 - **PDF 파싱**, 마크다운, 웹 크롤링 지원
2. **청킹**은 검색 품질을 결정 - 고정 크기, 의미 기반, 재귀적 전략
3. **텍스트 분할** 시 오버랩으로 문맥 보존
4. 메타데이터로 필터링 검색과 출처 추적 가능
5. **RAG 전처리** 파이프라인으로 컴포넌트 통합

### Day 3 예고: 임베딩과 벡터 데이터베이스

다음 편에서는 청크를 벡터로 변환하고 저장하는 과정을 다룹니다:

- 임베딩 모델 비교 (OpenAI, Voyage AI, Cohere)
- Supabase Vector 설정 및 pgvector 기초
- 배치 임베딩과 인덱싱 파이프라인 완성

**전체 코드는 GitHub에서 확인하세요:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- **Day 2: 문서 처리와 청킹 전략** (현재 글)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)
