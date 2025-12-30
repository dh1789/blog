---
title: "Claude Agent SDK Day 3: 메모리와 컨텍스트 관리"
slug: "claude-agent-sdk-day3-memory-context"
excerpt: "AI Agent의 메모리 시스템과 컨텍스트 관리 전략을 알아봅니다. Claude Agent SDK로 대화 히스토리, 장기 메모리, 상태 관리를 구현하여 개인화된 AI 에이전트를 만들어봅니다."
date: "2025-12-10"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - Agent Memory
  - Context Management
  - AI Agent
  - AI 에이전트
  - 컨텍스트 관리
  - 상태 관리
  - TypeScript
featured_image: ""
status: "publish"
language: "ko"
seo_title: "Claude Agent SDK 메모리 관리 가이드: Agent Memory와 Context Management 완벽 튜토리얼"
seo_description: "Claude Agent SDK로 AI Agent의 메모리 시스템을 구현합니다. Short-term Memory, Long-term Memory, Working Memory 개념과 컨텍스트 관리 전략을 TypeScript 코드로 배워봅니다."
---

## TL;DR

**Claude Agent SDK**의 **Agent Memory** 시스템을 활용하면 **AI Agent**가 대화 맥락을 기억하고 사용자에게 개인화된 경험을 제공할 수 있습니다. Day 3에서는 **Context Management** 전략과 **상태 관리** 기법을 배우고, 실제 **TypeScript** 코드로 **컨텍스트 관리** 기능을 갖춘 **AI 에이전트**를 구현합니다.

**주요 내용**
- **Agent Memory** 유형: Short-term, Long-term, Working Memory의 역할과 구현
- **Context Management**: 토큰 제한 처리와 **컨텍스트 관리** 요약 전략
- **상태 관리** 패턴: 세션 상태와 사용자 선호도 저장으로 개인화된 **AI Agent** 구현
- **Claude Agent SDK**와 **TypeScript**를 사용한 **Agent Memory** 시스템 실전 구현
- **AI 에이전트**의 **컨텍스트 관리** 최적화 기법

**전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Agent Memory 튜토리얼

**시리즈**: [Day 1: Agent 개념](/ko/claude-agent-sdk-day1-introduction) | [Day 2: Tool Use와 MCP](/ko/claude-agent-sdk-day2-tool-use-mcp) | **Day 3: 메모리와 컨텍스트** (현재 글) | [Day 4: 멀티 에이전트](/ko/claude-agent-sdk-day4-multi-agent) | [Day 5: 프로덕션 배포](/ko/claude-agent-sdk-day5-production)

> *시리즈 진행 중입니다. 일부 링크는 아직 활성화되지 않았을 수 있습니다.*

---

## AI Agent에게 기억이란?

### Agent Memory가 필요한 이유

Day 1에서 만든 기본 **AI Agent**는 각 요청을 독립적으로 처리했습니다. 하지만 실제 사용자 경험에서는 **AI 에이전트**가 이전 대화를 기억하고, 사용자 선호도를 학습하며, 진행 중인 작업 **컨텍스트 관리**를 수행해야 합니다. **Agent Memory**는 **AI Agent**를 단순한 응답 생성기에서 진정한 어시스턴트로 변화시키는 핵심 요소입니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Agent Memory 시스템 아키텍처                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   │
│   │ Short-term    │   │ Long-term     │   │ Working       │   │
│   │ Memory        │   │ Memory        │   │ Memory        │   │
│   │ (대화 히스토리)│   │ (영속 저장소) │   │ (현재 컨텍스트)│   │
│   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   │
│           │                   │                   │           │
│           └───────────────────┼───────────────────┘           │
│                               ▼                               │
│                     ┌─────────────────┐                       │
│                     │    AI Agent     │                       │
│                     │  (상태 관리)    │                       │
│                     └─────────────────┘                       │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Claude Agent SDK**에서 **Agent Memory** 시스템을 구현하면 **AI 에이전트**가 다음과 같은 능력을 갖추게 됩니다:

- **대화 연속성**: 이전 질문과 답변을 기억하여 자연스러운 **컨텍스트 관리** 수행
- **개인화**: 사용자 선호도와 **상태 관리**를 통한 맞춤형 응답
- **작업 추적**: 진행 중인 작업의 컨텍스트를 유지하여 복잡한 태스크 처리

### 세 가지 Agent Memory 유형

**AI Agent**의 **Agent Memory**는 인간의 기억 시스템과 유사하게 세 가지로 구분됩니다. **Claude Agent SDK**로 각 유형의 **Agent Memory**를 **TypeScript**로 구현할 수 있습니다.

| Memory 유형 | 특징 | **상태 관리** 방식 | **컨텍스트 관리** 용도 |
|-------------|------|-------------------|----------------------|
| **Short-term Memory** | 휘발성, 세션 한정 | 배열/리스트 | 대화 히스토리 |
| **Long-term Memory** | 영속성, 세션 간 유지 | 파일/DB | 사용자 정보, 선호도 |
| **Working Memory** | 현재 작업 컨텍스트 | 임시 저장소 | 진행 중인 태스크 |

---

## Short-term Memory 구현

### 대화 히스토리 관리

**Short-term Memory**는 현재 세션의 대화 히스토리를 저장합니다. **Claude Agent SDK**에서 **Context Management**의 기본이 되는 **Agent Memory** 유형입니다.

```typescript
// src/memory/conversation-memory.ts
import type { Message } from "../types/index.js";

/**
 * ConversationMemory - 대화 히스토리를 관리하는 Short-term Memory
 *
 * Agent Memory의 핵심 컴포넌트로, Context Management를 수행합니다.
 */
export class ConversationMemory {
  private messages: Message[] = [];
  private maxMessages: number;
  private maxTokens: number;

  constructor(options: { maxMessages?: number; maxTokens?: number } = {}) {
    this.maxMessages = options.maxMessages || 50;
    this.maxTokens = options.maxTokens || 100000;
  }

  /**
   * 메시지를 히스토리에 추가합니다.
   */
  add(message: Message): void {
    this.messages.push(message);
    this.trim();
  }

  /**
   * 사용자 메시지를 추가합니다.
   */
  addUserMessage(content: string): void {
    this.add({ role: "user", content });
  }

  /**
   * 어시스턴트 메시지를 추가합니다.
   */
  addAssistantMessage(content: string): void {
    this.add({ role: "assistant", content });
  }

  /**
   * 전체 히스토리를 반환합니다.
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * 최근 N개의 메시지를 반환합니다.
   */
  getRecentMessages(count: number): Message[] {
    return this.messages.slice(-count);
  }

  /**
   * 대략적인 토큰 수를 추정합니다.
   */
  estimateTokens(): number {
    const totalChars = this.messages.reduce((sum, msg) => {
      return sum + (typeof msg.content === "string" ? msg.content.length : 0);
    }, 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * 토큰/메시지 제한에 따라 히스토리를 압축합니다.
   * 컨텍스트 관리의 핵심 로직입니다.
   */
  private trim(): void {
    // 메시지 수 제한
    while (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    // 토큰 제한 (오래된 메시지부터 제거)
    while (this.estimateTokens() > this.maxTokens && this.messages.length > 2) {
      this.messages.shift();
    }
  }

  /**
   * 히스토리를 초기화합니다.
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Agent Memory 상태를 반환합니다.
   */
  getStats(): {
    messageCount: number;
    estimatedTokens: number;
  } {
    return {
      messageCount: this.messages.length,
      estimatedTokens: this.estimateTokens(),
    };
  }
}
```

### Context Management: 토큰 제한 처리

**Claude Agent SDK**에서 **Context Management**는 필수입니다. LLM의 **컨텍스트 관리** 윈도우는 제한되어 있으므로, **Agent Memory**가 무한정 커지면 안 됩니다. **AI Agent**의 **상태 관리** 효율성을 위해 슬라이딩 윈도우 방식을 사용합니다.

```typescript
/**
 * 슬라이딩 윈도우 기반 Context Management 전략
 *
 * AI Agent의 컨텍스트 관리를 최적화합니다.
 */
class SlidingWindowMemory extends ConversationMemory {
  /**
   * 대화 요약으로 Agent Memory를 압축합니다.
   */
  async compress(
    summarizer: (messages: Message[]) => Promise<string>
  ): Promise<void> {
    if (this.getMessages().length < 10) return;

    const messages = this.getMessages();
    // 마지막 4개 메시지는 유지, 나머지 요약
    const toSummarize = messages.slice(0, -4);
    const toKeep = messages.slice(-4);

    const summary = await summarizer(toSummarize);

    this.clear();
    this.add({ role: "assistant", content: `[이전 대화 요약]\n${summary}` });
    toKeep.forEach((msg) => this.add(msg));
  }
}
```

**컨텍스트 관리** 요약 전략은 **AI Agent**의 **Agent Memory** 효율을 크게 높입니다. **Claude Agent SDK**에서 **상태 관리**와 함께 사용하면 더욱 효과적입니다.

---

## Long-term Memory 구현

### 영속 저장소로 상태 관리

**Long-term Memory**는 세션 간에 유지되는 **Agent Memory**입니다. **AI 에이전트**가 사용자를 "기억"하게 만드는 핵심 **상태 관리** 시스템입니다.

```typescript
// src/memory/persistent-memory.ts
import * as fs from "fs/promises";

/**
 * PersistentMemory - 파일 기반 Long-term Memory
 *
 * AI Agent의 상태 관리를 위한 영속 저장소입니다.
 */
export class PersistentMemory {
  private data: Map<string, unknown> = new Map();
  private filePath: string;
  private autoSave: boolean;

  constructor(options: { filePath?: string; autoSave?: boolean } = {}) {
    this.filePath = options.filePath || ".agent-memory.json";
    this.autoSave = options.autoSave ?? true;
  }

  /**
   * 파일에서 Agent Memory를 로드합니다.
   */
  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(content);
      this.data = new Map(Object.entries(parsed));
    } catch {
      this.data = new Map();
    }
  }

  /**
   * Agent Memory를 파일에 저장합니다.
   */
  async save(): Promise<void> {
    const obj = Object.fromEntries(this.data);
    await fs.writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf-8");
  }

  /**
   * 값을 저장합니다.
   */
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
    if (this.autoSave) await this.save();
  }

  /**
   * 값을 조회합니다.
   */
  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * 네임스페이스로 구분된 값을 저장합니다.
   * 예: setNested("user.preferences.theme", "dark")
   */
  async setNested(keyPath: string, value: unknown): Promise<void> {
    const keys = keyPath.split(".");
    const rootKey = keys[0];

    if (keys.length === 1) {
      await this.set(rootKey, value);
      return;
    }

    let obj = (this.get<Record<string, unknown>>(rootKey) || {});
    let current = obj;

    for (let i = 1; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) current[keys[i]] = {};
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    await this.set(rootKey, obj);
  }

  /**
   * 네임스페이스로 구분된 값을 조회합니다.
   */
  getNested<T>(keyPath: string): T | undefined {
    const keys = keyPath.split(".");
    let current: unknown = this.get(keys[0]);

    for (let i = 1; i < keys.length && current !== undefined; i++) {
      current = (current as Record<string, unknown>)?.[keys[i]];
    }

    return current as T | undefined;
  }
}
```

### 사용자 선호도 상태 관리

**AI 에이전트**의 개인화를 위해 **상태 관리** 헬퍼 클래스를 구현합니다. **Claude Agent SDK**에서 **Agent Memory**와 **컨텍스트 관리**를 결합한 패턴입니다.

```typescript
/**
 * UserPreferences - 사용자 선호도 상태 관리 헬퍼
 *
 * AI Agent의 개인화된 Context Management를 위한 클래스입니다.
 */
export class UserPreferences {
  private memory: PersistentMemory;
  private namespace: string;

  constructor(memory: PersistentMemory, namespace: string = "preferences") {
    this.memory = memory;
    this.namespace = namespace;
  }

  async setPreference(key: string, value: unknown): Promise<void> {
    await this.memory.setNested(`${this.namespace}.${key}`, value);
  }

  getPreference<T>(key: string): T | undefined {
    return this.memory.getNested<T>(`${this.namespace}.${key}`);
  }

  async setLanguage(lang: string): Promise<void> {
    await this.setPreference("language", lang);
  }

  getLanguage(): string {
    return this.getPreference<string>("language") || "ko";
  }
}
```

---

## Working Memory와 MemoryAgent 통합

### Working Memory: 현재 작업 컨텍스트 관리

**Working Memory**는 현재 진행 중인 작업의 **컨텍스트 관리**를 담당합니다. 세션 내에서만 유효하며, **AI Agent**가 복잡한 작업을 처리할 때 중간 상태를 저장합니다.

### MemoryAgent 완전 구현

세 가지 **Agent Memory** 유형을 통합한 **MemoryAgent**를 구현합니다. **Claude Agent SDK**의 **Context Management** 기능을 모두 활용하는 **AI 에이전트**입니다.

```typescript
// src/agents/memory-agent.ts
import Anthropic from "@anthropic-ai/sdk";
import { ConversationMemory } from "../memory/conversation-memory.js";
import { PersistentMemory, UserPreferences } from "../memory/persistent-memory.js";

/**
 * MemoryAgentConfig - 메모리 AI Agent 설정
 */
export interface MemoryAgentConfig {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  maxMessages?: number;
  maxTokens?: number;
  persistentMemoryPath?: string;
  enablePersistence?: boolean;
}

/**
 * MemoryAgent - Agent Memory와 Context Management를 통합한 AI Agent
 *
 * Claude Agent SDK Day 3의 핵심 구현입니다.
 * - Short-term Memory: 대화 히스토리 (ConversationMemory)
 * - Long-term Memory: 영속 저장소 (PersistentMemory)
 * - Working Memory: 현재 세션 컨텍스트
 */
export class MemoryAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;

  // Agent Memory 시스템
  private conversationMemory: ConversationMemory;
  private persistentMemory: PersistentMemory;
  private userPreferences: UserPreferences;

  // Working Memory (현재 세션 상태 관리)
  private workingContext: Map<string, unknown> = new Map();

  constructor(config: MemoryAgentConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt ||
      "당신은 사용자의 선호도와 이전 대화를 기억하는 개인화된 AI 어시스턴트입니다.";

    // Agent Memory 초기화
    this.conversationMemory = new ConversationMemory({
      maxMessages: config.maxMessages || 50,
      maxTokens: config.maxTokens || 100000,
    });

    this.persistentMemory = new PersistentMemory({
      filePath: config.persistentMemoryPath || ".agent-memory.json",
      autoSave: config.enablePersistence ?? true,
    });

    this.userPreferences = new UserPreferences(this.persistentMemory);
  }

  /**
   * 영속 Agent Memory를 로드합니다.
   */
  async initialize(): Promise<void> {
    await this.persistentMemory.load();
  }

  /**
   * 시스템 프롬프트를 Context Management 정보로 확장합니다.
   */
  private buildContextualSystemPrompt(): string {
    const parts = [this.systemPrompt];

    // 사용자 선호도 반영 (상태 관리)
    const language = this.userPreferences.getLanguage();
    if (language) {
      parts.push(`\n사용자 언어 선호: ${language}`);
    }

    // Working Memory 반영 (컨텍스트 관리)
    const currentTask = this.workingContext.get("currentTask");
    if (currentTask) {
      parts.push(`\n현재 작업: ${currentTask}`);
    }

    // Long-term Memory에서 사용자 정보 반영
    const userName = this.persistentMemory.getNested<string>("user.name");
    if (userName) {
      parts.push(`\n사용자 이름: ${userName}`);
    }

    return parts.join("");
  }

  /**
   * 사용자 메시지에 대한 응답을 생성합니다.
   */
  async chat(userMessage: string): Promise<string> {
    // Short-term Memory에 추가
    this.conversationMemory.addUserMessage(userMessage);

    // Context Management 기반 시스템 프롬프트 생성
    const contextualPrompt = this.buildContextualSystemPrompt();

    // Claude API 호출
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: contextualPrompt,
      messages: this.conversationMemory.getMessages(),
    });

    // 응답 추출
    const textContent = response.content.find((c) => c.type === "text");
    const assistantMessage = textContent && "text" in textContent
      ? textContent.text
      : "";

    // Short-term Memory에 응답 추가
    this.conversationMemory.addAssistantMessage(assistantMessage);

    return assistantMessage;
  }

  /**
   * Agent Memory 압축 (Context Management)
   */
  async compressMemory(): Promise<void> {
    await this.conversationMemory.compress(async (messages) => {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        system: "다음 대화를 3-4문장으로 핵심만 요약해주세요.",
        messages: [{
          role: "user",
          content: messages.map((m) => `${m.role}: ${m.content}`).join("\n\n"),
        }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      return textContent && "text" in textContent ? textContent.text : "";
    });
  }

  // === Working Memory (상태 관리) ===

  setWorkingContext(key: string, value: unknown): void {
    this.workingContext.set(key, value);
  }

  getWorkingContext<T>(key: string): T | undefined {
    return this.workingContext.get(key) as T | undefined;
  }

  setCurrentTask(task: string): void {
    this.setWorkingContext("currentTask", task);
  }

  // === Long-term Memory (상태 관리) ===

  async setUserInfo(key: string, value: unknown): Promise<void> {
    await this.persistentMemory.setNested(`user.${key}`, value);
  }

  getUserInfo<T>(key: string): T | undefined {
    return this.persistentMemory.getNested<T>(`user.${key}`);
  }

  // === Agent Memory 통계 ===

  getMemoryStats(): {
    conversation: { messageCount: number; estimatedTokens: number };
    workingContextKeys: string[];
  } {
    return {
      conversation: this.conversationMemory.getStats(),
      workingContextKeys: Array.from(this.workingContext.keys()),
    };
  }
}
```

---

## 실전 예제: 개인화된 AI Agent

### MemoryAgent 사용 예제

**Claude Agent SDK**의 **Agent Memory** 시스템을 활용한 개인화된 **AI 에이전트** 사용법입니다.

```typescript
// examples/day3-memory-demo.ts
import { MemoryAgent } from "../src/agents/memory-agent.js";

async function main() {
  console.log("🧠 Day 3: Agent Memory와 Context Management 데모");

  const agent = new MemoryAgent({
    systemPrompt: "당신은 사용자의 이름과 선호도를 기억하는 개인화된 AI 어시스턴트입니다.",
    persistentMemoryPath: ".my-agent-memory.json",
    maxMessages: 20,
  });

  // Agent Memory 초기화
  await agent.initialize();

  // Long-term Memory에 사용자 정보 저장 (상태 관리)
  await agent.setUserInfo("name", "철수");
  await agent.setPreference("responseStyle", "간결하게");

  // Working Memory에 현재 작업 설정 (컨텍스트 관리)
  agent.setCurrentTask("TypeScript 학습");

  console.log("Agent Memory 통계:", agent.getMemoryStats());

  // 대화 시작 - AI Agent가 사용자 정보를 활용
  const response1 = await agent.chat("안녕하세요! 제 이름을 기억하세요?");
  console.log("AI Agent:", response1);

  // 후속 대화 - Context Management로 맥락 유지
  const response2 = await agent.chat("TypeScript 제네릭에 대해 설명해주세요.");
  console.log("AI Agent:", response2);

  // Agent Memory 압축 (장시간 대화 후)
  await agent.compressMemory();
}

main();
```

### Agent Memory 시스템 활용 시나리오

**Claude Agent SDK**의 **Agent Memory**와 **Context Management**를 활용한 실제 시나리오입니다.

```
사용자: 안녕하세요!
AI Agent: 안녕하세요, 철수님! 오늘도 TypeScript 학습을 도와드릴까요?
         (Long-term Memory에서 이름, Working Memory에서 현재 작업 활용)

사용자: 지난번에 배운 내용 요약해줘
AI Agent: 지난 세션에서 인터페이스와 타입의 차이점에 대해 학습하셨습니다.
         (Agent Memory 요약 기능 활용)

사용자: 오늘은 제네릭 배우고 싶어
AI Agent: 네, 현재 작업을 '제네릭 학습'으로 업데이트했습니다.
         (Working Memory 상태 관리)
```

---

## Context Management 최적화 전략

### 토큰 효율적인 컨텍스트 관리

**AI Agent**의 **컨텍스트 관리** 효율을 높이는 전략입니다. **Claude Agent SDK**에서 **Agent Memory**를 최적화하는 방법입니다.

| 전략 | 설명 | **상태 관리** 효과 |
|------|------|------------------|
| **슬라이딩 윈도우** | 오래된 메시지 자동 제거 | 토큰 사용량 제한 |
| **요약 압축** | 대화 내용을 요약으로 대체 | 맥락 보존 + 토큰 절약 |
| **선택적 로드** | 필요한 **Agent Memory**만 로드 | 응답 속도 향상 |
| **계층적 저장** | 중요도별 **상태 관리** | 효율적 검색 |

### 상태 관리 모범 사례

**AI 에이전트** 개발 시 **상태 관리** 모범 사례입니다. **Claude Agent SDK**와 **TypeScript**로 안정적인 **Agent Memory** 시스템을 구축하세요.

1. **Memory 분리**: Short-term, Long-term, Working을 명확히 분리
2. **자동 정리**: **컨텍스트 관리** 임계치 설정으로 자동 압축
3. **영속성 전략**: 중요한 **상태 관리** 데이터는 즉시 저장
4. **에러 처리**: **Agent Memory** 로드/저장 실패 시 graceful degradation

---

## 다음 단계

Day 3에서 **Claude Agent SDK**의 **Agent Memory**와 **Context Management** 시스템을 구현했습니다. **AI 에이전트**가 대화 맥락을 기억하고 사용자에게 개인화된 경험을 제공할 수 있게 되었습니다.

**Day 4 예고: 멀티 에이전트 오케스트레이션**

- 여러 **AI Agent**가 협업하는 시스템 구축
- Supervisor, Peer-to-Peer, Pipeline 패턴
- **Agent Memory** 공유와 **상태 관리** 동기화
- 코드 리뷰 **AI 에이전트** 시스템 구현

**시리즈 전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent)

---

## 참고 자료

### 공식 문서
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [Context Window Management](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)

### 관련 포스트
- [Day 1: Agent 개념과 첫 번째 Agent](/ko/claude-agent-sdk-day1-introduction)
- [Day 2: Tool Use와 MCP 서버 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)

---

## 시리즈 네비게이션

- [Day 1: Agent 개념과 아키텍처](/ko/claude-agent-sdk-day1-introduction)
- [Day 2: 도구 사용과 MCP 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)
- **Day 3: 메모리와 컨텍스트 관리** (현재 글)
- [Day 4: 멀티 에이전트 오케스트레이션](/ko/claude-agent-sdk-day4-multi-agent)
- [Day 5: 프로덕션 배포와 최적화](/ko/claude-agent-sdk-day5-production)
