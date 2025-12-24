---
title: "RAG Day 1: RAG 개념과 아키텍처 - 내 문서를 아는 AI 만들기"
slug: "rag-day1-introduction"
excerpt: "RAG(Retrieval Augmented Generation)란 무엇인가? LLM의 환각 문제를 해결하고 벡터 데이터베이스를 활용해 내 문서 기반으로 답변하는 AI 챗봇 시스템의 RAG 아키텍처를 TypeScript로 구현합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Retrieval Augmented Generation"
  - "LLM"
  - "벡터 데이터베이스"
  - "AI 챗봇"
language: "ko"
---

## TL;DR

- **RAG**(Retrieval Augmented Generation)는 LLM이 외부 문서를 검색해서 답변하는 기술
- LLM의 **환각**(hallucination) 문제와 최신 정보 부족 문제를 해결
- **벡터 데이터베이스**로 문서를 저장하고, 질문과 유사한 내용을 찾아 LLM에 전달
- 이 시리즈에서 TypeScript로 완전한 검색 증강 생성 시스템과 **AI 챗봇**을 구축
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. RAG란 무엇인가?

### LLM의 한계: 환각과 정보 부족

ChatGPT나 Claude 같은 **LLM**(Large Language Model)은 놀라운 능력을 보여줍니다. 하지만 치명적인 한계가 있습니다.

**첫 번째 문제: 환각(Hallucination)**

LLM에게 "우리 회사 휴가 정책이 뭐야?"라고 물으면 어떻게 될까요? LLM은 자신있게 답변합니다. 하지만 그 내용은 완전히 지어낸 것입니다. 이것이 **환각** 문제입니다. LLM은 모르는 것도 아는 척 답변하는 경향이 있습니다.

**두 번째 문제: 최신 정보 부족**

LLM은 학습 시점까지의 데이터만 알고 있습니다. 2024년에 학습된 모델은 2025년에 출시된 라이브러리나 변경된 API를 모릅니다. 여러분의 사내 문서나 최신 제품 정보는 당연히 모릅니다.

### RAG가 해결하는 문제

**RAG**는 **Retrieval Augmented Generation**의 약자입니다. 한국어로는 "검색 증강 생성"이라고 번역합니다. RAG의 핵심 아이디어는 단순합니다:

> "LLM이 답변하기 전에, 관련 문서를 먼저 찾아서 읽게 하자"

RAG 시스템의 동작 방식을 살펴보겠습니다:

1. 사용자가 질문합니다: "우리 회사 휴가 정책이 뭐야?"
2. RAG 시스템이 **벡터 데이터베이스**에서 관련 문서를 검색합니다
3. 검색된 문서(예: 사내 규정집)를 LLM에게 전달합니다
4. LLM이 문서를 참고해서 정확한 답변을 생성합니다

이렇게 하면 LLM의 환각 문제가 크게 줄어듭니다. 문서에 없는 내용은 "문서에서 찾을 수 없습니다"라고 답변하도록 유도할 수 있기 때문입니다.

### 실제 RAG 활용 사례

RAG 기술은 이미 다양한 곳에서 사용되고 있습니다:

- **기업용 AI 챗봇**: 사내 문서 기반 질의응답
- **고객 지원 봇**: FAQ와 매뉴얼 기반 자동 응답
- **법률/의료 AI**: 판례나 논문 기반 정보 제공
- **코드 어시스턴트**: 프로젝트 문서 기반 코딩 지원

이 시리즈에서 우리가 만들 RAG 시스템도 이런 **AI 챗봇**의 기반이 됩니다.

---

## 2. Retrieval Augmented Generation vs Fine-tuning: 무엇을 선택할까?

LLM을 특정 도메인에 맞게 개선하는 방법은 크게 두 가지입니다.

### Fine-tuning 방식

Fine-tuning은 LLM 자체를 추가 학습시키는 방법입니다.

**장점:**
- 모델이 도메인 지식을 "내재화"함
- 추론 시 추가 검색 단계 불필요

**단점:**
- 학습에 GPU 리소스와 시간 필요
- 새 정보 추가 시 재학습 필요
- 모델 크기가 커지면 비용 증가

### Retrieval Augmented Generation 방식

검색 증강 생성은 LLM을 수정하지 않고, 외부 지식을 검색해서 제공하는 방법입니다.

**장점:**
- 문서 추가/수정이 즉시 반영됨
- GPU 학습 불필요, 비용 효율적
- 출처를 명확히 표시 가능
- LLM의 환각 문제 완화

**단점:**
- 검색 품질에 의존
- 벡터 데이터베이스 운영 필요
- 컨텍스트 윈도우 제한

### 언제 검색 증강 생성을 선택할까?

| 상황 | 추천 방식 |
|------|----------|
| 문서가 자주 업데이트됨 | **검색 증강 생성** |
| 출처 표시가 필요함 | **검색 증강 생성** |
| 빠른 구축이 필요함 | **검색 증강 생성** |
| 도메인 언어 스타일 변경 | Fine-tuning |
| 오프라인 환경 | Fine-tuning |

대부분의 기업용 **AI 챗봇** 프로젝트에서는 Retrieval Augmented Generation이 더 실용적인 선택입니다. 우리 시리즈에서도 이 방식으로 시스템을 구축합니다.

---

## 3. 검색 증강 생성 아키텍처 상세

Retrieval Augmented Generation 시스템은 크게 두 가지 파이프라인으로 구성됩니다.

### 3.1 인덱싱 파이프라인 (오프라인)

문서를 **벡터 데이터베이스**에 저장하는 과정입니다. 한 번 실행하면 문서가 검색 가능한 상태가 됩니다.

```
[문서들] → [청킹] → [임베딩] → [벡터 데이터베이스 저장]
```

**단계별 설명:**

1. **문서 로딩**: PDF, 마크다운, 웹페이지 등 다양한 형식의 문서를 텍스트로 변환
2. **청킹(Chunking)**: 긴 문서를 작은 조각(청크)으로 분할. 보통 500-1000 토큰 단위
3. **임베딩(Embedding)**: 각 청크를 벡터(숫자 배열)로 변환. 의미가 비슷한 텍스트는 비슷한 벡터가 됨
4. **저장**: 벡터를 **벡터 데이터베이스**에 저장. Supabase, Pinecone 등 사용

### 3.2 검색 파이프라인 (온라인)

사용자 질문에 답변하는 과정입니다. 실시간으로 동작합니다.

```
[질문] → [임베딩] → [벡터 검색] → [컨텍스트 구성] → [LLM 답변 생성]
```

**단계별 설명:**

1. **질문 임베딩**: 사용자 질문을 벡터로 변환
2. **벡터 검색**: **벡터 데이터베이스**에서 질문 벡터와 유사한 문서 청크 검색
3. **컨텍스트 구성**: 검색된 청크들을 LLM 프롬프트에 포함
4. **답변 생성**: LLM이 컨텍스트를 참고하여 답변 생성

### 3.3 전체 시스템 구조

```typescript
// RAG 시스템 기본 인터페이스
interface RAGSystem {
  // 인덱싱 파이프라인
  ingest(documents: Document[]): Promise<void>;

  // 검색 파이프라인
  query(question: string): Promise<Answer>;
}

interface Document {
  content: string;
  metadata: {
    source: string;
    title?: string;
    [key: string]: unknown;
  };
}

interface Answer {
  text: string;
  sources: Source[];
}

interface Source {
  content: string;
  metadata: Document['metadata'];
  score: number;
}
```

이 인터페이스가 우리가 6일에 걸쳐 구현할 검색 증강 생성 시스템의 뼈대입니다.

---

## 4. 프로젝트 셋업

이제 실제로 Retrieval Augmented Generation 프로젝트를 시작해봅시다.

### 4.1 저장소 생성

```bash
# 프로젝트 디렉토리 생성
mkdir my-first-rag
cd my-first-rag

# Git 초기화
git init

# package.json 생성
npm init -y
```

### 4.2 TypeScript 설정

```bash
# TypeScript 및 필수 패키지 설치
npm install typescript @types/node tsx -D

# tsconfig.json 생성
npx tsc --init
```

`tsconfig.json`을 다음과 같이 수정합니다:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 검색 증강 생성 관련 패키지 설치

```bash
# Anthropic Claude SDK (LLM)
npm install @anthropic-ai/sdk

# 문서 처리
npm install pdf-parse gray-matter

# 임베딩 및 벡터 DB (Day 3에서 상세 설명)
npm install @supabase/supabase-js

# 유틸리티
npm install dotenv zod
```

### 4.4 프로젝트 구조

```
my-first-rag/
├── src/
│   ├── index.ts              # 진입점
│   ├── rag/
│   │   ├── simple-rag.ts     # 기본 RAG 클래스
│   │   ├── document-loader.ts # 문서 로더
│   │   ├── chunker.ts        # 청킹
│   │   ├── embedder.ts       # 임베딩
│   │   ├── vector-store.ts   # 벡터 저장소
│   │   ├── retriever.ts      # 검색
│   │   └── generator.ts      # 답변 생성
│   └── utils/
│       └── logger.ts         # 로깅
├── examples/
│   └── day1-basic.ts         # Day 1 예제
├── documents/                 # 인덱싱할 문서들
├── .env                       # 환경 변수
├── package.json
└── tsconfig.json
```

### 4.5 환경 변수 설정

`.env` 파일을 생성합니다:

```bash
# Anthropic API (Claude)
ANTHROPIC_API_KEY=your-api-key-here

# Supabase (벡터 데이터베이스)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# Voyage AI (임베딩) - Day 3에서 사용
VOYAGE_API_KEY=your-voyage-api-key
```

### 4.6 기본 스켈레톤 코드

`src/rag/simple-rag.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export interface RAGConfig {
  anthropicApiKey: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class SimpleRAG {
  private client: Anthropic;

  constructor(config: RAGConfig) {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }

  // Day 2에서 구현: 문서 인덱싱
  async ingest(documents: string[]): Promise<void> {
    console.log(`📚 ${documents.length}개 문서 인덱싱 예정`);
    // TODO: 청킹 → 임베딩 → 저장
  }

  // Day 5에서 완성: 질의응답
  async query(question: string): Promise<string> {
    console.log(`❓ 질문: ${question}`);

    // TODO: 벡터 검색으로 관련 문서 찾기
    const relevantDocs = '(검색된 문서가 여기에 들어갑니다)';

    // LLM에게 컨텍스트와 함께 질문
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `다음 문서를 참고하여 질문에 답변해주세요.

문서:
${relevantDocs}

질문: ${question}

문서에 없는 내용은 "문서에서 찾을 수 없습니다"라고 답변해주세요.`,
        },
      ],
    });

    const textBlock = response.content[0];
    if (textBlock.type === 'text') {
      return textBlock.text;
    }
    return '답변을 생성할 수 없습니다.';
  }
}
```

`src/index.ts`:

```typescript
import { SimpleRAG } from './rag/simple-rag';
import 'dotenv/config';

async function main() {
  const rag = new SimpleRAG({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Day 1: 기본 구조 확인
  console.log('🚀 RAG 시스템 초기화 완료');

  // 테스트 질문 (아직 검색 기능 없음)
  const answer = await rag.query('RAG란 무엇인가요?');
  console.log('💬 답변:', answer);
}

main().catch(console.error);
```

실행해봅시다:

```bash
npx tsx src/index.ts
```

아직 **벡터 데이터베이스** 검색 기능이 없어서 의미 있는 답변은 나오지 않습니다. Day 2부터 본격적으로 각 컴포넌트를 구현합니다.

---

## 5. AI 챗봇으로 확장하기

우리가 만드는 검색 증강 생성 시스템은 **AI 챗봇**의 핵심 엔진이 됩니다. Day 6에서는 이 시스템을 다음과 같이 확장합니다:

- **대화 히스토리 관리**: 이전 대화 맥락 유지
- **스트리밍 응답**: 실시간 답변 출력
- **출처 표시**: 답변의 근거 문서 링크 제공
- **API 서버**: REST API로 **AI 챗봇** 서비스 제공

**AI 챗봇**을 만들 때 Retrieval Augmented Generation이 왜 중요한지 정리하면:

| 일반 챗봇 | 검색 증강 생성 기반 AI 챗봇 |
|----------|--------------------------|
| 학습 데이터에만 의존 | 최신 문서 검색 가능 |
| 환각 문제 심각 | 문서 기반 정확한 답변 |
| 출처 불명확 | 명확한 출처 제공 |
| 업데이트 어려움 | 문서 추가로 즉시 반영 |

---

## 6. 마무리 및 다음 편 예고

오늘 배운 내용을 정리합니다:

### 핵심 포인트

1. **RAG**(Retrieval Augmented Generation)는 LLM의 환각과 정보 부족 문제를 해결
2. RAG 아키텍처: 인덱싱 파이프라인 + 검색 파이프라인
3. **벡터 데이터베이스**로 문서를 저장하고 유사도 기반 검색
4. Fine-tuning보다 유연하고 비용 효율적
5. **AI 챗봇** 구축의 핵심 기술

### Day 2 예고: 문서 처리와 청킹 전략

다음 편에서는 RAG의 첫 번째 단계인 문서 처리를 다룹니다:

- PDF, 마크다운, 텍스트 파일 로딩
- 효과적인 청킹 전략 (고정 크기 vs 의미 기반)
- 메타데이터 관리로 검색 품질 향상

**전체 코드는 GitHub에서 확인하세요:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

