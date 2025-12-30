---
title: "Claude Agent SDK Day 1: Agent 개념과 첫 번째 Agent 만들기"
slug: "claude-agent-sdk-day1-introduction"
excerpt: "AI Agent란 무엇인가? Claude Agent SDK를 사용하여 첫 번째 AI 에이전트를 만들어봅니다. SDK 설치부터 간단한 Agent 구현까지 TypeScript로 시작하는 에이전트 개발 입문 가이드."
date: "2025-12-08"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - AI Agent
  - AI 에이전트
  - TypeScript
  - Anthropic
  - 에이전트 개발
  - SDK 설치
  - Agent 아키텍처
  - LLM
  - 첫 Agent
featured_image: ""
status: "publish"
language: "ko"
seo_title: "Claude Agent SDK 입문: AI Agent 개념과 첫 번째 에이전트 개발 가이드"
seo_description: "Claude Agent SDK로 AI Agent를 만드는 방법을 알아봅니다. Agent 개념, SDK 설치, TypeScript로 첫 번째 에이전트 구현까지 단계별 가이드."
---

## TL;DR

**Claude Agent SDK**로 **첫 Agent**를 만들어봅니다. AI 에이전트란 무엇인지, 일반 LLM과 어떻게 다른지 이해하고, TypeScript로 첫 Agent 개발을 시작합니다. 이 글은 에이전트 개발 입문자를 위한 단계별 가이드입니다. Claude Agent SDK는 Anthropic이 제공하는 공식 에이전트 개발 도구로, SDK 설치부터 첫 Agent 구현까지 단계별로 안내합니다.

에이전트 개발에서 배우는 것:
- AI Agent와 LLM의 차이점: 왜 에이전트 개발이 필요한가
- Claude Agent SDK 설치와 프로젝트 설정 방법 (SDK 설치 가이드)
- Agent 아키텍처의 핵심 구성 요소 (LLM, Tools, Memory, Planning)
- TypeScript로 첫 Agent 구현하기
- Claude Agent SDK의 기본 API 사용법 (첫 Agent 완성)

**전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK 에이전트 개발 튜토리얼

**시리즈**: **Day 1: Agent 개념** | [Day 2: Tool Use와 MCP](/ko/claude-agent-sdk-day2-tool-use-mcp) | [Day 3: 메모리와 컨텍스트](/ko/claude-agent-sdk-day3-memory-context) | [Day 4: 멀티 에이전트](/ko/claude-agent-sdk-day4-multi-agent) | [Day 5: 프로덕션 배포](/ko/claude-agent-sdk-day5-production)

> *시리즈 연재 중입니다. 일부 링크가 아직 유효하지 않을 수 있습니다.*

---

## AI Agent란 무엇인가?

### LLM vs AI Agent

일반 LLM(Large Language Model)은 텍스트를 입력받아 텍스트를 출력합니다. 한 번의 요청에 한 번의 응답을 하는 단순한 구조입니다. 반면 AI Agent는 목표를 달성하기 위해 **스스로 계획하고**, **도구를 사용하며**, **여러 단계를 실행**하는 자율적인 시스템입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                      일반 LLM                               │
├─────────────────────────────────────────────────────────────┤
│  입력 → LLM → 출력                                          │
│  (단순 요청-응답, 상태 없음)                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      AI Agent                               │
├─────────────────────────────────────────────────────────────┤
│  목표 → 계획 수립 → 도구 실행 → 결과 분석 → 반복 → 완료      │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   LLM   │  │  Tools  │  │ Memory  │  │Planning │        │
│  │ (두뇌)  │  │ (손발)  │  │ (기억)  │  │ (전략)  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

Claude Agent SDK를 사용하면 이러한 AI 에이전트를 쉽게 구축할 수 있습니다. 에이전트 개발에 필요한 모든 구성 요소가 SDK에 포함되어 있습니다.

### AI Agent의 핵심 구성 요소

AI 에이전트는 네 가지 핵심 구성 요소로 이루어집니다. Claude Agent SDK는 이 모든 요소를 통합적으로 지원합니다.

1. **LLM (두뇌)**: Claude와 같은 언어 모델이 추론과 의사결정을 담당
2. **Tools (도구)**: 파일 읽기, API 호출, 코드 실행 등 외부 세계와 상호작용
3. **Memory (메모리)**: 대화 히스토리, 사용자 정보, 작업 상태 저장
4. **Planning (계획)**: 복잡한 작업을 단계별로 분해하고 실행 전략 수립

이 시리즈에서는 Claude Agent SDK로 각 구성 요소를 구현하는 방법을 배웁니다. 오늘 Day 1에서는 SDK 설치와 첫 Agent 구현을 통해 기본적인 Agent 아키텍처를 이해하고, Day 2부터 도구, 메모리, 멀티 에이전트 등을 다룹니다.

---

## Claude Agent SDK 소개

### 왜 Claude Agent SDK인가?

Anthropic의 **Claude Agent SDK**는 AI 에이전트를 구축하기 위한 공식 TypeScript 라이브러리입니다. 에이전트 개발을 위해 Claude Agent SDK를 선택하는 이유:

- **공식 지원**: Anthropic이 직접 개발하고 유지보수하는 SDK
- **TypeScript 우선**: 타입 안전성과 개발자 경험 최적화
- **통합 아키텍처**: LLM, Tools, Memory가 하나의 SDK로 통합
- **MCP 호환**: Model Context Protocol과 완벽 호환
- **프로덕션 준비**: 에러 처리, 재시도, 모니터링 기능 내장

Claude Agent SDK는 AI 에이전트를 만들기 위한 가장 효율적인 방법입니다. 이 SDK로 에이전트 개발을 시작하면 복잡한 설정 없이 바로 AI Agent를 구현할 수 있습니다.

### SDK 설치 및 프로젝트 설정

Claude Agent SDK 설치부터 시작합니다. SDK 설치 과정은 간단하며, 첫 Agent 개발 프로젝트를 바로 시작할 수 있습니다.

```bash
# 프로젝트 디렉토리 생성
mkdir my-first-agent
cd my-first-agent

# npm 초기화
npm init -y

# Claude Agent SDK 설치
npm install @anthropic-ai/sdk

# TypeScript 및 개발 의존성 설치
npm install -D typescript @types/node ts-node

# TypeScript 설정 초기화
npx tsc --init
```

### tsconfig.json 설정

SDK 설치 후 TypeScript 설정을 진행합니다. 첫 Agent 개발에 최적화된 Agent 아키텍처 구성을 위한 설정입니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 환경 변수 설정

SDK 설치가 완료되면 API 키를 설정합니다. 첫 Agent가 Claude와 통신하기 위한 인증 정보입니다.

```bash
# .env 파일 생성
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env

# dotenv 설치 (선택사항)
npm install dotenv
```

**API 키 발급 방법**:
1. [Anthropic Console](https://console.anthropic.com/)에 접속
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 `.env` 파일에 저장

---

## Agent 아키텍처 이해하기

### Claude Agent SDK의 Agent 아키텍처

Claude Agent SDK에서 첫 Agent를 구성하는 핵심 클래스와 인터페이스를 살펴봅니다. Agent 아키텍처의 기본이 되는 구조입니다.

```typescript
import { Anthropic } from "@anthropic-ai/sdk";

// Claude Agent SDK의 핵심 구조
interface AgentConfig {
  // LLM 설정
  model: string;                    // 사용할 Claude 모델
  maxTokens: number;                // 최대 응답 토큰

  // Agent 설정
  systemPrompt: string;             // 에이전트 역할 정의
  tools?: Tool[];                   // 사용 가능한 도구 목록

  // 실행 설정
  maxIterations?: number;           // 최대 반복 횟수
  stopCondition?: StopCondition;    // 종료 조건
}

// AI Agent가 사용하는 도구 인터페이스
interface Tool {
  name: string;                     // 도구 이름
  description: string;              // 도구 설명
  inputSchema: object;              // 입력 스키마
  execute: (input: unknown) => Promise<unknown>;  // 실행 함수
}
```

이 Agent 아키텍처를 바탕으로 Claude Agent SDK에서 첫 Agent를 구현합니다. 이 Agent 아키텍처 패턴을 따르면 일관성 있는 코드를 작성할 수 있습니다.

### 에이전트 실행 흐름

AI Agent는 단순한 요청-응답이 아닌 반복적인 실행 사이클을 가집니다. Claude Agent SDK는 이 흐름을 자동으로 관리합니다.

```typescript
// AI Agent 실행 사이클
class AgentLoop {
  async run(initialPrompt: string): Promise<string> {
    let messages = [{ role: "user", content: initialPrompt }];

    while (true) {
      // 1. LLM에 현재 상태 전달
      const response = await this.callLLM(messages);

      // 2. 도구 호출이 필요한지 확인
      if (response.stopReason === "tool_use") {
        // 3. 도구 실행
        const toolResult = await this.executeTool(response.toolCall);

        // 4. 결과를 메시지에 추가
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResult });

        // 5. 다음 반복으로 계속
        continue;
      }

      // 6. 최종 응답 반환
      return response.content;
    }
  }
}
```

이 에이전트 루프는 Claude Agent SDK Agent 아키텍처의 핵심입니다. 첫 Agent를 만들 때도 이 패턴을 따릅니다.

---

## 첫 번째 Agent 구현

### 기본 Agent 클래스

SDK 설치가 완료되었으니 Claude Agent SDK로 첫 Agent를 구현합니다. 이 첫 Agent 예제는 가장 단순한 Agent 아키텍처입니다.

```typescript
// src/basic-agent.ts
import Anthropic from "@anthropic-ai/sdk";

// Claude Agent SDK 기본 AI Agent 구현
class BasicAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;

  constructor(config: {
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
  }) {
    // Anthropic 클라이언트 초기화
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt || "당신은 친절한 AI 어시스턴트입니다.";
  }

  // AI 에이전트 대화 메서드
  async chat(userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    // 응답 텍스트 추출
    const textContent = response.content.find(c => c.type === "text");
    return textContent ? textContent.text : "";
  }
}

export { BasicAgent };
```

이것이 Claude Agent SDK로 만든 첫 Agent입니다. 아직 도구나 메모리가 없는 기본 Agent 아키텍처이지만, 첫 Agent 개발의 출발점입니다.

### 대화 기능 추가

AI 에이전트에 대화 히스토리를 추가하여 연속적인 대화가 가능하도록 개선합니다. Claude Agent SDK에서 메모리를 관리하는 첫 단계입니다.

```typescript
// src/conversational-agent.ts
import Anthropic from "@anthropic-ai/sdk";

// 메시지 타입 정의
interface Message {
  role: "user" | "assistant";
  content: string;
}

// 대화형 AI Agent - Claude Agent SDK 활용
class ConversationalAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;
  private conversationHistory: Message[] = [];

  constructor(config: {
    model?: string;
    systemPrompt?: string;
  }) {
    this.client = new Anthropic();
    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt ||
      "당신은 친절한 AI 어시스턴트입니다. 사용자의 질문에 도움이 되는 답변을 제공합니다.";
  }

  // AI 에이전트 대화 - 히스토리 유지
  async chat(userMessage: string): Promise<string> {
    // 사용자 메시지 추가
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Claude Agent SDK API 호출
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: this.conversationHistory,
    });

    // 응답 추출
    const textContent = response.content.find(c => c.type === "text");
    const assistantMessage = textContent ? textContent.text : "";

    // 응답을 히스토리에 추가
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }

  // 대화 히스토리 초기화
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // 대화 히스토리 조회
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }
}

export { ConversationalAgent, Message };
```

이제 첫 Agent가 이전 대화를 기억합니다. Claude Agent SDK로 만든 이 첫 Agent는 Agent 아키텍처에 메모리 기능을 추가한 형태입니다.

### 실행 예제

Claude Agent SDK로 만든 첫 Agent를 실행해봅니다. SDK 설치와 첫 Agent 개발 결과를 확인하는 단계입니다.

```typescript
// src/index.ts
import { ConversationalAgent } from "./conversational-agent";

async function main() {
  // AI Agent 인스턴스 생성
  const agent = new ConversationalAgent({
    systemPrompt: `당신은 TypeScript 전문가 AI 어시스턴트입니다.
사용자의 코딩 질문에 친절하고 상세하게 답변합니다.
코드 예제를 제공할 때는 모범 사례를 따릅니다.`,
  });

  console.log("=== Claude Agent SDK 첫 번째 AI Agent ===\n");

  // 첫 번째 대화
  const response1 = await agent.chat(
    "TypeScript에서 인터페이스와 타입의 차이점이 뭐야?"
  );
  console.log("사용자: TypeScript에서 인터페이스와 타입의 차이점이 뭐야?");
  console.log(`에이전트: ${response1}\n`);

  // 두 번째 대화 (이전 대화 맥락 유지)
  const response2 = await agent.chat(
    "그럼 언제 인터페이스를 쓰고 언제 타입을 써야 해?"
  );
  console.log("사용자: 그럼 언제 인터페이스를 쓰고 언제 타입을 써야 해?");
  console.log(`에이전트: ${response2}\n`);

  // 세 번째 대화
  const response3 = await agent.chat(
    "예제 코드로 보여줄 수 있어?"
  );
  console.log("사용자: 예제 코드로 보여줄 수 있어?");
  console.log(`에이전트: ${response3}\n`);

  console.log("=== 대화 히스토리 ===");
  console.log(`총 ${agent.getHistory().length}개의 메시지`);
}

main().catch(console.error);
```

### 실행 방법

```bash
# TypeScript 실행
npx ts-node src/index.ts

# 또는 빌드 후 실행
npm run build
node dist/index.js
```

---

## 시스템 프롬프트 설계

### 효과적인 시스템 프롬프트

AI Agent의 동작은 시스템 프롬프트에 의해 결정됩니다. Claude Agent SDK에서 AI 에이전트의 성격과 능력을 정의하는 핵심 요소입니다.

```typescript
// 에이전트 개발을 위한 시스템 프롬프트 템플릿
const systemPromptTemplates = {
  // 코딩 도우미 AI Agent
  codingAssistant: `당신은 전문 소프트웨어 개발자 AI 어시스턴트입니다.

역할:
- 코드 리뷰 및 개선 제안
- 버그 분석 및 해결 방안 제시
- 모범 사례(best practices) 안내
- 아키텍처 설계 조언

규칙:
- 항상 실행 가능한 코드 예제를 제공합니다
- 보안 취약점이 있으면 즉시 경고합니다
- 성능 최적화 팁을 함께 제공합니다
- 한국어로 친절하게 설명합니다`,

  // 데이터 분석 AI Agent
  dataAnalyst: `당신은 데이터 분석 전문가 AI 어시스턴트입니다.

역할:
- 데이터 패턴 분석 및 인사이트 도출
- 통계적 분석 방법론 제안
- 시각화 전략 수립
- 데이터 품질 검증

규칙:
- 분석 결과는 항상 근거를 제시합니다
- 불확실성이 있으면 명시합니다
- Python/SQL 코드 예제를 제공합니다`,

  // 문서 작성 AI Agent
  technicalWriter: `당신은 기술 문서 작성 전문가 AI 어시스턴트입니다.

역할:
- API 문서 작성
- 사용자 가이드 작성
- README 및 CHANGELOG 작성
- 코드 주석 개선

규칙:
- 명확하고 간결한 문장을 사용합니다
- 예제를 충분히 포함합니다
- 일관된 용어를 사용합니다`,
};
```

### 역할 기반 Agent 패턴

Claude Agent SDK에서 다양한 역할의 AI 에이전트를 생성하는 패턴입니다. 에이전트 개발 시 재사용 가능한 팩토리 패턴을 활용합니다.

```typescript
// AI Agent 팩토리 - 역할별 에이전트 생성
type AgentRole = "coder" | "analyst" | "writer" | "reviewer";

function createAgent(role: AgentRole): ConversationalAgent {
  const prompts: Record<AgentRole, string> = {
    coder: `당신은 숙련된 TypeScript/JavaScript 개발자입니다.
코드 작성, 리뷰, 디버깅을 도와줍니다.`,

    analyst: `당신은 데이터 분석 전문가입니다.
데이터 패턴을 분석하고 인사이트를 제공합니다.`,

    writer: `당신은 기술 문서 작성 전문가입니다.
명확하고 이해하기 쉬운 문서를 작성합니다.`,

    reviewer: `당신은 시니어 코드 리뷰어입니다.
코드 품질, 보안, 성능을 검토합니다.`,
  };

  return new ConversationalAgent({
    systemPrompt: prompts[role],
  });
}

// 사용 예시
const coder = createAgent("coder");
const reviewer = createAgent("reviewer");
```

---

## 에러 처리와 재시도

### API 호출 에러 처리

Claude Agent SDK를 사용한 에이전트 개발에서 안정적인 에러 처리는 필수입니다. AI Agent가 프로덕션에서 안정적으로 동작하려면 적절한 에러 처리가 필요합니다.

```typescript
import Anthropic from "@anthropic-ai/sdk";

// 에러 처리가 포함된 AI Agent
class RobustAgent {
  private client: Anthropic;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: {
    maxRetries?: number;
    retryDelayMs?: number;
  } = {}) {
    this.client = new Anthropic();
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelayMs || 1000;
  }

  // 재시도 로직이 포함된 API 호출
  async chat(
    messages: Anthropic.MessageParam[],
    systemPrompt: string
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4096,
          system: systemPrompt,
          messages,
        });

        const textContent = response.content.find(c => c.type === "text");
        return textContent ? textContent.text : "";

      } catch (error) {
        lastError = error as Error;
        console.warn(`시도 ${attempt}/${this.maxRetries} 실패:`, error);

        // API 에러 유형에 따른 처리
        if (this.isRetryableError(error)) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        // 재시도 불가능한 에러는 즉시 throw
        throw error;
      }
    }

    throw new Error(`최대 재시도 횟수 초과: ${lastError?.message}`);
  }

  // 재시도 가능한 에러인지 확인
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.RateLimitError) return true;
    if (error instanceof Anthropic.InternalServerError) return true;
    if (error instanceof Anthropic.APIConnectionError) return true;
    return false;
  }

  // 지연 함수
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 프로젝트 구조

### 권장 디렉토리 구조

SDK 설치 후 첫 Agent 프로젝트의 권장 구조입니다. 이 Agent 아키텍처 기반 디렉토리 구조로 첫 Agent 코드를 체계적으로 관리할 수 있습니다.

```
my-first-agent/
├── src/
│   ├── index.ts                 # 진입점
│   ├── agents/
│   │   ├── basic-agent.ts       # 기본 AI Agent
│   │   ├── conversational.ts    # 대화형 에이전트
│   │   └── robust-agent.ts      # 에러 처리 포함
│   ├── prompts/
│   │   ├── system-prompts.ts    # 시스템 프롬프트 모음
│   │   └── templates.ts         # 프롬프트 템플릿
│   ├── types/
│   │   └── index.ts             # TypeScript 타입 정의
│   └── utils/
│       ├── config.ts            # 설정 관리
│       └── logger.ts            # 로깅 유틸리티
├── examples/
│   ├── basic-usage.ts           # 기본 사용 예제
│   └── conversation-demo.ts     # 대화 데모
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

SDK 설치와 첫 Agent 구현 후 이 Agent 아키텍처 구조를 활용하면 확장성 있는 프로젝트를 만들 수 있습니다.

---

## 요약

Day 1에서 배운 Claude Agent SDK와 첫 Agent 개발의 핵심 내용입니다. SDK 설치부터 Agent 아키텍처 이해까지, 첫 Agent 개발의 기초를 다졌습니다.

1. **AI Agent 개념**
   - LLM vs Agent의 차이: 자율성, 도구 사용, 계획 수립
   - Agent 아키텍처: LLM + Tools + Memory + Planning
   - Claude Agent SDK가 이 Agent 아키텍처를 통합 지원

2. **Claude Agent SDK 설치**
   - SDK 설치와 npm 패키지 구성
   - 환경 변수 설정과 API 키 관리
   - 첫 Agent를 위한 기본 프로젝트 구조

3. **첫 Agent 구현**
   - BasicAgent: 단순 요청-응답의 첫 Agent
   - ConversationalAgent: 대화 히스토리 유지
   - RobustAgent: 에러 처리와 재시도 로직

4. **Agent 아키텍처 패턴**
   - 시스템 프롬프트 설계 방법
   - 역할 기반 Agent 팩토리 패턴
   - 에러 처리 및 재시도 전략

### Claude Agent SDK 핵심 코드 패턴

```typescript
// AI Agent 기본 패턴 - Claude Agent SDK
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  system: "AI 에이전트 역할 정의",
  messages: [{ role: "user", content: "사용자 입력" }],
});
```

---

## 다음 편 예고

**Day 2: Tool Use와 MCP 서버 연동**

Day 2에서는 AI Agent에 도구 사용 능력을 부여합니다:

- Function Calling으로 외부 도구 실행
- Zod 스키마로 도구 입력 검증
- MCP 서버를 Agent 도구로 연동
- 파일 시스템, API 호출 등 실전 도구 구현

---

## 참고 자료

### 튜토리얼 소스 코드
- [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - 이 튜토리얼의 전체 소스 코드

### 공식 문서
- [Claude Agent SDK Overview](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)

### 시리즈 링크
- [Day 2: Tool Use와 MCP 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)
- [Day 3: 메모리와 컨텍스트 관리](/ko/claude-agent-sdk-day3-memory-context)
- [Day 4: 멀티 에이전트 오케스트레이션](/ko/claude-agent-sdk-day4-multi-agent)
- [Day 5: 프로덕션 배포와 최적화](/ko/claude-agent-sdk-day5-production)

> *시리즈 연재 중입니다. 일부 링크가 아직 유효하지 않을 수 있습니다.*
