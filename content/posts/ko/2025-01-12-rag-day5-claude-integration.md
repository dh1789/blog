---
title: "RAG Day 5: Claude 통합과 답변 생성 - 검색 결과로 답변 만들기"
slug: "rag-day5-claude-integration"
excerpt: "RAG 시스템에서 컨텍스트 주입과 프롬프트 엔지니어링으로 답변 생성 품질을 높이는 방법을 알아봅니다. Claude 통합부터 출처 표시까지 실습합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Claude"
  - "답변 생성"
  - "프롬프트 엔지니어링"
  - "컨텍스트 주입"
language: "ko"
---

## TL;DR

- **컨텍스트 주입**은 검색 결과를 LLM 프롬프트에 포함시키는 핵심 기술
- **프롬프트 엔지니어링**으로 RAG 답변 생성 품질의 80%가 결정됨
- **"모르면 모른다고 해"** 지시가 환각 방지의 핵심
- **출처 표시**로 답변 생성의 신뢰도를 높임
- **스트리밍 응답**으로 사용자 경험 개선

---

> 💡 처음 Claude를 RAG 시스템에 연동할 때, 참고할 만한 자료를 찾고 이해하는 것이 가장 어려웠습니다.
> 공식 문서와 여러 예제를 비교하면서 프롬프트 엔지니어링의 핵심 패턴을 파악했고, 이 글에서 컨텍스트 주입부터 답변 생성까지 배운 것들을 정리합니다.

---

## 1. 컨텍스트 주입의 이해

### 1.1 컨텍스트 주입이란?

RAG 시스템에서 **컨텍스트 주입(Context Injection)**은 검색된 문서를 LLM 프롬프트에 포함시키는 과정입니다. 이것이 RAG의 핵심이며, 답변 생성의 품질을 결정합니다.

```typescript
// 컨텍스트 주입의 기본 구조
interface RAGContext {
  query: string;           // 사용자 질문
  documents: Document[];   // 검색된 문서들
  maxTokens: number;       // 최대 컨텍스트 길이
}

async function injectContext(context: RAGContext): Promise<string> {
  const { query, documents } = context;

  // 문서들을 하나의 컨텍스트로 결합
  const contextText = documents
    .map((doc, i) => `[문서 ${i + 1}]\n${doc.content}\n출처: ${doc.source}`)
    .join('\n\n');

  return `다음 문서들을 참고하여 질문에 답하세요:

${contextText}

질문: ${query}`;
}
```

### 1.2 컨텍스트 윈도우 관리

Claude의 컨텍스트 윈도우는 모델에 따라 다릅니다:

| 모델 | 컨텍스트 윈도우 |
|------|----------------|
| Claude 3.5 Sonnet | 200K 토큰 |
| Claude 3.5 Haiku | 200K 토큰 |
| Claude 3 Opus | 200K 토큰 |

```typescript
// 컨텍스트 길이 관리
function manageContextWindow(
  documents: Document[],
  maxTokens: number = 100000
): Document[] {
  let totalTokens = 0;
  const selectedDocs: Document[] = [];

  for (const doc of documents) {
    const docTokens = estimateTokens(doc.content);

    if (totalTokens + docTokens > maxTokens) {
      break;
    }

    selectedDocs.push(doc);
    totalTokens += docTokens;
  }

  console.log(`컨텍스트: ${selectedDocs.length}개 문서, ~${totalTokens} 토큰`);
  return selectedDocs;
}

// 토큰 수 추정 (대략 4자 = 1토큰)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

### 1.3 긴 컨텍스트 처리 전략

200K 토큰이라도 효율적으로 사용해야 합니다:

```typescript
// 청크 우선순위 기반 선택
interface RankedDocument extends Document {
  score: number;
  rank: number;
}

function selectTopDocuments(
  documents: RankedDocument[],
  options: {
    maxDocs: number;
    maxTokens: number;
    minScore: number;
  }
): Document[] {
  return documents
    .filter(doc => doc.score >= options.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxDocs)
    .filter((_, i, arr) => {
      const totalTokens = arr
        .slice(0, i + 1)
        .reduce((sum, d) => sum + estimateTokens(d.content), 0);
      return totalTokens <= options.maxTokens;
    });
}
```

---

## 2. RAG 프롬프트 설계

RAG에서 프롬프트 엔지니어링은 답변 생성 품질을 좌우하는 핵심 요소입니다.

### 2.1 기본 RAG 프롬프트 템플릿

프롬프트 엔지니어링을 통해 RAG 답변 생성 품질의 80%가 결정됩니다. 다음은 실전에서 검증된 프롬프트 템플릿입니다:

```typescript
const RAG_SYSTEM_PROMPT = `당신은 제공된 문서를 기반으로 정확하게 답변하는 AI 어시스턴트입니다.

## 핵심 규칙

1. **문서 기반 답변**: 반드시 제공된 문서의 정보만 사용하세요.
2. **출처 표시**: 답변에 사용한 정보의 출처를 [문서 N] 형식으로 표시하세요.
3. **모르면 인정**: 문서에 없는 정보는 "제공된 문서에서 해당 정보를 찾을 수 없습니다"라고 답하세요.
4. **추측 금지**: 문서에 명시되지 않은 내용을 추측하거나 만들어내지 마세요.

## 답변 형식

- 명확하고 구조화된 답변
- 필요시 마크다운 사용 (리스트, 코드 블록 등)
- 답변 끝에 참고한 문서 번호 명시`;

function buildRAGPrompt(query: string, documents: Document[]): string {
  const contextSection = documents
    .map((doc, i) => `[문서 ${i + 1}]
제목: ${doc.title || 'N/A'}
내용: ${doc.content}
출처: ${doc.source}`)
    .join('\n\n---\n\n');

  return `${RAG_SYSTEM_PROMPT}

---

## 참고 문서

${contextSection}

---

## 질문

${query}

---

위 문서들을 참고하여 질문에 답변해주세요.`;
}
```

### 2.2 환각 방지 프롬프트 기법

프롬프트 엔지니어링에서 Claude가 문서에 없는 내용을 만들어내는 것(환각)을 방지하는 것이 중요합니다:

```typescript
// 환각 방지를 위한 강화된 프롬프트
const ANTI_HALLUCINATION_PROMPT = `## 중요: 환각 방지 규칙

다음 상황에서는 반드시 "모른다"고 답하세요:

1. 질문과 관련된 정보가 문서에 없을 때
2. 문서의 정보가 불완전하거나 모호할 때
3. 질문이 문서의 범위를 벗어날 때

잘못된 예시:
- "아마도 ~일 것입니다" (추측)
- "일반적으로 ~합니다" (문서 외 지식 사용)
- 문서에 없는 구체적인 수치나 날짜 제시

올바른 예시:
- "제공된 문서에서 해당 정보를 찾을 수 없습니다."
- "문서 [N]에 따르면 ~입니다. 그러나 ~에 대한 정보는 없습니다."`;
```

### 2.3 출처 표시 요청

답변의 신뢰도를 높이기 위해 출처를 명확히 표시하도록 요청합니다:

```typescript
const CITATION_PROMPT = `## 출처 표시 규칙

답변 작성 시 다음 형식으로 출처를 표시하세요:

1. **인라인 출처**: 문장 끝에 [문서 N] 형식으로 표시
   예: "TypeScript는 정적 타입 언어입니다 [문서 1]."

2. **참고 문서 목록**: 답변 끝에 사용한 문서 요약
   예:
   ---
   📚 참고 문서:
   - [문서 1] TypeScript 공식 문서
   - [문서 3] 프로젝트 README

3. **복수 출처**: 여러 문서를 참고한 경우 모두 표시
   예: "이 기능은 버전 2.0에서 추가되었습니다 [문서 1, 문서 2]."`;
```

---

## 3. Claude 통합 구현

### 3.1 Anthropic SDK 설정

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

const DEFAULT_OPTIONS: GenerateOptions = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0,  // RAG에서는 낮은 temperature 권장
  stream: false,
};
```

### 3.2 답변 생성 함수

```typescript
async function generateAnswer(
  query: string,
  documents: Document[],
  options: GenerateOptions = {}
): Promise<string> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 컨텍스트 윈도우 관리
  const selectedDocs = manageContextWindow(documents, 100000);

  // RAG 프롬프트 구성
  const prompt = buildRAGPrompt(query, selectedDocs);

  try {
    const response = await anthropic.messages.create({
      model: config.model!,
      max_tokens: config.maxTokens!,
      temperature: config.temperature!,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // 응답 텍스트 추출
    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return textBlock.text;
  } catch (error) {
    console.error('Claude API 오류:', error);
    throw error;
  }
}
```

### 3.3 스트리밍 응답 구현

사용자 경험을 위해 스트리밍 응답을 구현합니다:

```typescript
async function* generateAnswerStream(
  query: string,
  documents: Document[],
  options: GenerateOptions = {}
): AsyncGenerator<string> {
  const config = { ...DEFAULT_OPTIONS, ...options, stream: true };
  const selectedDocs = manageContextWindow(documents, 100000);
  const prompt = buildRAGPrompt(query, selectedDocs);

  const stream = await anthropic.messages.stream({
    model: config.model!,
    max_tokens: config.maxTokens!,
    temperature: config.temperature!,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

// 사용 예제
async function streamExample() {
  const query = 'TypeScript의 주요 특징은?';
  const documents = await searchDocuments(query);

  process.stdout.write('답변: ');

  for await (const chunk of generateAnswerStream(query, documents)) {
    process.stdout.write(chunk);
  }

  console.log('\n--- 스트리밍 완료 ---');
}
```

---

## 4. 출처 추출 및 표시

### 4.1 출처 파싱

Claude 응답에서 출처 정보를 추출합니다:

```typescript
interface Citation {
  documentIndex: number;
  documentTitle: string;
  source: string;
}

function extractCitations(
  answer: string,
  documents: Document[]
): Citation[] {
  // [문서 N] 패턴 매칭
  const citationPattern = /\[문서\s*(\d+)\]/g;
  const matches = answer.matchAll(citationPattern);

  const citedIndices = new Set<number>();

  for (const match of matches) {
    const index = parseInt(match[1], 10) - 1;
    if (index >= 0 && index < documents.length) {
      citedIndices.add(index);
    }
  }

  return Array.from(citedIndices).map(index => ({
    documentIndex: index + 1,
    documentTitle: documents[index].title || `문서 ${index + 1}`,
    source: documents[index].source,
  }));
}
```

### 4.2 답변 포맷팅

출처 정보를 포함한 최종 답변을 생성합니다:

```typescript
interface FormattedAnswer {
  content: string;
  citations: Citation[];
  metadata: {
    model: string;
    documentsUsed: number;
    generatedAt: string;
  };
}

function formatAnswer(
  rawAnswer: string,
  documents: Document[],
  model: string
): FormattedAnswer {
  const citations = extractCitations(rawAnswer, documents);

  // 출처 섹션 추가 (없으면)
  let content = rawAnswer;
  if (!rawAnswer.includes('📚 참고 문서') && citations.length > 0) {
    content += '\n\n---\n📚 **참고 문서:**\n';
    content += citations
      .map(c => `- [문서 ${c.documentIndex}] ${c.documentTitle}`)
      .join('\n');
  }

  return {
    content,
    citations,
    metadata: {
      model,
      documentsUsed: citations.length,
      generatedAt: new Date().toISOString(),
    },
  };
}
```

---

## 5. 전체 RAG 파이프라인 통합

### 5.1 완전한 RAG 클래스

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface RAGConfig {
  anthropicApiKey: string;
  model?: string;
  maxContextTokens?: number;
  temperature?: number;
}

class RAGGenerator {
  private anthropic: Anthropic;
  private config: Required<RAGConfig>;

  constructor(config: RAGConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    this.config = {
      anthropicApiKey: config.anthropicApiKey,
      model: config.model || 'claude-sonnet-4-20250514',
      maxContextTokens: config.maxContextTokens || 100000,
      temperature: config.temperature || 0,
    };
  }

  async generate(
    query: string,
    documents: Document[]
  ): Promise<FormattedAnswer> {
    // 1. 컨텍스트 관리
    const selectedDocs = manageContextWindow(
      documents,
      this.config.maxContextTokens
    );

    // 2. 프롬프트 구성
    const prompt = buildRAGPrompt(query, selectedDocs);

    // 3. Claude 호출
    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      messages: [{ role: 'user', content: prompt }],
    });

    // 4. 응답 추출
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response');
    }

    // 5. 포맷팅 및 출처 추출
    return formatAnswer(textBlock.text, selectedDocs, this.config.model);
  }
}
```

### 5.2 사용 예제

```typescript
// RAG 시스템 초기화
const rag = new RAGGenerator({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  temperature: 0,
});

// 검색 + 답변 생성
async function askQuestion(query: string) {
  // 1. 검색 (Day 4에서 구현한 하이브리드 검색)
  const documents = await hybridSearch(query, {
    topK: 5,
    alpha: 0.7,
  });

  // 2. 답변 생성
  const answer = await rag.generate(query, documents);

  console.log('=== 답변 ===');
  console.log(answer.content);
  console.log('\n=== 메타데이터 ===');
  console.log(`사용된 문서: ${answer.metadata.documentsUsed}개`);
  console.log(`모델: ${answer.metadata.model}`);

  return answer;
}

// 실행
askQuestion('TypeScript에서 제네릭은 어떻게 사용하나요?');
```

---

## 6. 품질 개선 팁

프롬프트 엔지니어링과 답변 생성 품질을 더 높이는 팁들입니다.

### 6.1 Temperature 설정

RAG 답변 생성에서는 낮은 temperature를 사용합니다:

```typescript
// RAG 권장 설정
const RAG_TEMPERATURE = 0;  // 가장 결정적인 답변

// 창의적 답변이 필요한 경우
const CREATIVE_TEMPERATURE = 0.3;
```

### 6.2 에러 처리

```typescript
async function safeGenerate(
  query: string,
  documents: Document[]
): Promise<FormattedAnswer | null> {
  try {
    return await rag.generate(query, documents);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`API 오류 (${error.status}):`, error.message);

      if (error.status === 429) {
        console.log('Rate limit - 잠시 후 재시도...');
        await sleep(5000);
        return safeGenerate(query, documents);
      }
    }

    return null;
  }
}
```

### 6.3 답변 품질 검증

```typescript
function validateAnswer(answer: FormattedAnswer): boolean {
  // 1. 출처가 있는지 확인
  if (answer.citations.length === 0) {
    console.warn('경고: 출처가 없는 답변');
    return false;
  }

  // 2. "모른다" 패턴 확인
  const unknownPatterns = [
    '찾을 수 없습니다',
    '정보가 없습니다',
    '확인할 수 없습니다',
  ];

  const hasUnknown = unknownPatterns.some(p =>
    answer.content.includes(p)
  );

  if (hasUnknown) {
    console.info('정보: 문서에 없는 질문으로 판단됨');
  }

  return true;
}
```

---

## 마무리

이번 포스트에서는 RAG 시스템의 핵심인 Claude 통합과 답변 생성을 다뤘습니다:

1. **컨텍스트 주입**: 검색 결과를 효과적으로 LLM에 전달
2. **프롬프트 엔지니어링**: 환각 방지와 출처 표시를 위한 프롬프트 설계
3. **답변 생성**: Claude API를 활용한 고품질 응답 생성
4. **스트리밍 응답**: 사용자 경험 개선
5. **출처 추출**: 답변 신뢰도 향상

프롬프트 엔지니어링과 컨텍스트 주입을 잘 활용하면 RAG 시스템의 답변 생성 품질이 크게 향상됩니다.

다음 Day 6에서는 프로덕션 배포와 최적화를 다룹니다.

---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- **Day 5: Claude 통합과 답변 생성** (현재 글)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)
