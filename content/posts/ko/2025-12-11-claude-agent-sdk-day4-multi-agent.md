---
title: "Claude Agent SDK Day 4: 멀티 에이전트 오케스트레이션"
slug: "claude-agent-sdk-day4-multi-agent"
excerpt: "여러 AI Agent가 협업하는 멀티 에이전트 시스템을 구축합니다. Claude Agent SDK로 Supervisor, Pipeline, Peer-to-Peer 오케스트레이션 패턴을 구현하고 코드 리뷰 멀티 에이전트 시스템을 만들어봅니다."
date: "2025-12-11"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - Multi Agent
  - 멀티 에이전트
  - Orchestration
  - 오케스트레이션
  - AI Agent
  - AI 에이전트
  - TypeScript
featured_image: ""
status: "publish"
language: "ko"
seo_title: "Claude Agent SDK 멀티 에이전트 가이드: Multi Agent 오케스트레이션 완벽 튜토리얼"
seo_description: "Claude Agent SDK로 멀티 에이전트 시스템을 구현합니다. Supervisor, Pipeline, Peer-to-Peer 오케스트레이션 패턴과 코드 리뷰 AI Agent 시스템을 TypeScript로 배워봅니다."
---

## TL;DR

**Claude Agent SDK**의 **멀티 에이전트** 시스템을 활용하면 여러 **AI Agent**가 협업하여 복잡한 작업을 처리할 수 있습니다. Day 4에서는 **Orchestration** 패턴을 배우고, 실제 **TypeScript** 코드로 코드 리뷰 **멀티 에이전트** 시스템을 구현합니다.

이 글에서 배우는 것:
- **Multi Agent** 아키텍처: 단일 **AI Agent**에서 **멀티 에이전트**로 확장하는 방법
- **오케스트레이션** 패턴: Supervisor, Pipeline, Peer-to-Peer 패턴의 차이와 선택 기준
- **AI 에이전트** 간 통신: 메시지 전달과 상태 공유로 **멀티 에이전트** 협업 구현
- **Claude Agent SDK**와 **TypeScript**를 사용한 코드 리뷰 **Multi Agent** 시스템 실전 구현
- **Orchestration** 최적화와 **멀티 에이전트** 디버깅 기법

**전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Multi Agent 튜토리얼

**시리즈**: [Day 1: Agent 개념](/ko/claude-agent-sdk-day1-introduction) | [Day 2: Tool Use와 MCP](/ko/claude-agent-sdk-day2-tool-use-mcp) | [Day 3: 메모리와 컨텍스트](/ko/claude-agent-sdk-day3-memory-context) | **Day 4: 멀티 에이전트** (현재 글) | [Day 5: 프로덕션 배포](/ko/claude-agent-sdk-day5-production)

> *시리즈 진행 중입니다. 일부 링크는 아직 활성화되지 않았을 수 있습니다.*

---

## 왜 멀티 에이전트인가?

### 단일 AI Agent의 한계

Day 1~3에서 구현한 단일 **AI Agent**는 다양한 작업을 처리할 수 있지만 한계가 있습니다. 하나의 **AI 에이전트**가 모든 전문성을 갖추기는 어렵습니다. **Claude Agent SDK**의 **멀티 에이전트** 시스템은 이 문제를 해결합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                단일 Agent vs 멀티 에이전트 비교                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   단일 Agent                      Multi Agent 시스템                │
│   ┌─────────────┐                ┌─────────────────────────────┐   │
│   │             │                │   ┌───────┐  ┌───────┐       │   │
│   │  모든 작업  │                │   │분석가 │  │리뷰어 │       │   │
│   │  한 Agent   │                │   └───┬───┘  └───┬───┘       │   │
│   │  처리       │                │       │          │           │   │
│   │             │      →         │       ▼          ▼           │   │
│   └─────────────┘                │   ┌─────────────────┐        │   │
│                                  │   │   오케스트레이터  │        │   │
│   - 컨텍스트 제한                │   └─────────────────┘        │   │
│   - 전문성 분산                  │   │                          │   │
│   - 유지보수 어려움              │   - 전문화된 AI 에이전트      │   │
│                                  │   - 병렬 처리                │   │
│                                  │   - 확장성                   │   │
│                                  └─────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**멀티 에이전트** 아키텍처의 장점:

- **전문화**: 각 **AI Agent**가 특정 역할에 집중하여 더 높은 품질 제공
- **병렬 처리**: 여러 **AI 에이전트**가 동시에 작업하여 처리 속도 향상
- **확장성**: 새로운 **Multi Agent**를 추가하여 기능 확장 용이
- **유지보수성**: 각 **AI Agent**를 독립적으로 개선 가능

### 멀티 에이전트 사용 시나리오

**Claude Agent SDK**의 **멀티 에이전트** 시스템이 효과적인 시나리오입니다.

| 시나리오 | **Multi Agent** 구성 | **오케스트레이션** 패턴 |
|---------|---------------------|----------------------|
| 코드 리뷰 | 분석가, 리뷰어, 요약가 | Pipeline |
| 고객 지원 | 분류기, 전문가, QA | Supervisor |
| 문서 작성 | 연구원, 작성자, 편집자 | Pipeline |
| 데이터 분석 | 수집기, 분석가, 시각화 | Peer-to-Peer |

---

## 오케스트레이션 패턴

### Supervisor 패턴

**Supervisor 패턴**은 중앙 조정자가 여러 **AI 에이전트**를 관리합니다. **Claude Agent SDK**에서 가장 일반적인 **오케스트레이션** 패턴입니다.

```typescript
// src/agents/orchestration/supervisor-orchestrator.ts
import Anthropic from "@anthropic-ai/sdk";

/**
 * SupervisorOrchestrator - 중앙 조정 기반 멀티 에이전트 오케스트레이션
 *
 * Supervisor 패턴: 하나의 조정자가 여러 AI Agent를 관리합니다.
 */
export class SupervisorOrchestrator {
  private client: Anthropic;
  private agents: Map<string, AgentConfig> = new Map();

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * AI 에이전트를 등록합니다.
   */
  registerAgent(name: string, config: AgentConfig): void {
    this.agents.set(name, config);
  }

  /**
   * 작업을 분석하고 적절한 Multi Agent를 선택합니다.
   */
  private async selectAgent(task: string): Promise<string> {
    const agentList = Array.from(this.agents.entries())
      .map(([name, config]) => `- ${name}: ${config.description}`)
      .join("\n");

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 100,
      system: `당신은 멀티 에이전트 시스템의 Supervisor입니다.
작업을 분석하고 가장 적합한 AI Agent를 선택하세요.
사용 가능한 에이전트:
${agentList}

에이전트 이름만 반환하세요.`,
      messages: [{ role: "user", content: task }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    return textContent && "text" in textContent
      ? textContent.text.trim()
      : "default";
  }

  /**
   * 선택된 AI Agent에게 작업을 위임합니다.
   */
  private async delegateToAgent(agentName: string, task: string): Promise<string> {
    const config = this.agents.get(agentName);
    if (!config) {
      throw new Error(`AI 에이전트를 찾을 수 없음: ${agentName}`);
    }

    const response = await this.client.messages.create({
      model: config.model || "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: config.systemPrompt,
      messages: [{ role: "user", content: task }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    return textContent && "text" in textContent ? textContent.text : "";
  }

  /**
   * Orchestration 실행: 작업을 분석하고 적절한 멀티 에이전트에 위임
   */
  async orchestrate(task: string): Promise<OrchestratorResult> {
    console.log("🎯 Supervisor 오케스트레이션 시작...");

    // 1. 적절한 AI Agent 선택
    const selectedAgent = await this.selectAgent(task);
    console.log(`✅ 선택된 AI 에이전트: ${selectedAgent}`);

    // 2. 선택된 Multi Agent에게 위임
    const result = await this.delegateToAgent(selectedAgent, task);

    return {
      selectedAgent,
      result,
      orchestrationPattern: "supervisor",
    };
  }
}

interface AgentConfig {
  description: string;
  systemPrompt: string;
  model?: string;
}

interface OrchestratorResult {
  selectedAgent: string;
  result: string;
  orchestrationPattern: string;
}
```

### Pipeline 패턴

**Pipeline 패턴**은 **AI 에이전트**가 순차적으로 작업을 처리합니다. **멀티 에이전트**의 **오케스트레이션**에서 데이터 처리 흐름이 명확할 때 효과적입니다.

```typescript
// src/agents/orchestration/pipeline-orchestrator.ts

/**
 * PipelineOrchestrator - 순차 처리 기반 Multi Agent 오케스트레이션
 *
 * Pipeline 패턴: AI Agent가 순서대로 작업을 처리하고 결과를 전달합니다.
 */
export class PipelineOrchestrator {
  private client: Anthropic;
  private stages: PipelineStage[] = [];

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * 파이프라인 스테이지(AI 에이전트)를 추가합니다.
   */
  addStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  /**
   * 파이프라인을 실행합니다.
   * 각 멀티 에이전트가 순차적으로 작업을 처리합니다.
   */
  async execute(input: string): Promise<PipelineResult> {
    console.log("🔄 Pipeline 오케스트레이션 시작...");

    let currentInput = input;
    const stageResults: StageResult[] = [];

    for (const stage of this.stages) {
      console.log(`▶️ 스테이지 실행: ${stage.name}`);

      const response = await this.client.messages.create({
        model: stage.model || "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: stage.systemPrompt,
        messages: [{ role: "user", content: currentInput }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      const output = textContent && "text" in textContent ? textContent.text : "";

      stageResults.push({
        stageName: stage.name,
        input: currentInput,
        output,
      });

      // 다음 AI Agent의 입력으로 전달
      currentInput = output;
    }

    return {
      finalOutput: currentInput,
      stageResults,
      orchestrationPattern: "pipeline",
    };
  }
}

interface PipelineStage {
  name: string;
  systemPrompt: string;
  model?: string;
}

interface StageResult {
  stageName: string;
  input: string;
  output: string;
}

interface PipelineResult {
  finalOutput: string;
  stageResults: StageResult[];
  orchestrationPattern: string;
}
```

### Peer-to-Peer 패턴

**Peer-to-Peer 패턴**은 **AI 에이전트**가 서로 직접 통신합니다. **멀티 에이전트**의 **오케스트레이션**에서 중앙 조정 없이 협업이 필요할 때 사용합니다.

```typescript
// src/agents/orchestration/peer-orchestrator.ts

/**
 * PeerOrchestrator - 분산 협업 기반 멀티 에이전트 오케스트레이션
 *
 * Peer-to-Peer 패턴: AI Agent가 서로 직접 통신하며 협업합니다.
 */
export class PeerOrchestrator {
  private client: Anthropic;
  private peers: Map<string, PeerAgent> = new Map();
  private messageQueue: PeerMessage[] = [];

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Peer AI 에이전트를 등록합니다.
   */
  registerPeer(peer: PeerAgent): void {
    this.peers.set(peer.id, peer);
  }

  /**
   * AI Agent 간 메시지를 전송합니다.
   */
  sendMessage(from: string, to: string, content: string): void {
    this.messageQueue.push({ from, to, content, timestamp: Date.now() });
  }

  /**
   * 특정 Multi Agent의 메시지를 처리합니다.
   */
  private async processMessages(peerId: string): Promise<string[]> {
    const peer = this.peers.get(peerId);
    if (!peer) return [];

    const messages = this.messageQueue.filter((m) => m.to === peerId);
    const responses: string[] = [];

    for (const msg of messages) {
      const response = await this.client.messages.create({
        model: peer.model || "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        system: `${peer.systemPrompt}

수신 메시지: ${msg.from}로부터 메시지를 받았습니다.`,
        messages: [{ role: "user", content: msg.content }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      if (textContent && "text" in textContent) {
        responses.push(textContent.text);
      }
    }

    // 처리된 메시지 제거
    this.messageQueue = this.messageQueue.filter((m) => m.to !== peerId);

    return responses;
  }

  /**
   * Peer-to-Peer 오케스트레이션을 실행합니다.
   * 멀티 에이전트가 라운드 로빈 방식으로 메시지를 처리합니다.
   */
  async orchestrate(initialTask: string, initiatorId: string, rounds: number = 3): Promise<PeerResult> {
    console.log("🔀 Peer-to-Peer 오케스트레이션 시작...");

    // 초기 작업을 첫 AI 에이전트에게 전달
    const peerIds = Array.from(this.peers.keys());
    const nextPeerId = peerIds.find((id) => id !== initiatorId) || peerIds[0];
    this.sendMessage("system", nextPeerId, initialTask);

    const allResponses: PeerResponse[] = [];

    for (let round = 0; round < rounds; round++) {
      console.log(`🔄 라운드 ${round + 1}/${rounds}`);

      for (const peerId of peerIds) {
        const responses = await this.processMessages(peerId);

        for (const response of responses) {
          allResponses.push({ peerId, response, round });

          // 다른 AI Agent에게 응답 공유
          for (const otherId of peerIds) {
            if (otherId !== peerId) {
              this.sendMessage(peerId, otherId, response);
            }
          }
        }
      }
    }

    return {
      responses: allResponses,
      orchestrationPattern: "peer-to-peer",
    };
  }
}

interface PeerAgent {
  id: string;
  systemPrompt: string;
  model?: string;
}

interface PeerMessage {
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

interface PeerResponse {
  peerId: string;
  response: string;
  round: number;
}

interface PeerResult {
  responses: PeerResponse[];
  orchestrationPattern: string;
}
```

### 오케스트레이션 패턴 선택 가이드

**멀티 에이전트** 시스템에서 **오케스트레이션** 패턴을 선택하는 기준입니다.

| 패턴 | 특징 | **Multi Agent** 적합 시나리오 |
|------|------|----------------------------|
| **Supervisor** | 중앙 조정, 유연한 라우팅 | 작업 유형이 다양하고 동적 선택 필요 |
| **Pipeline** | 순차 처리, 명확한 흐름 | 처리 단계가 정해진 워크플로우 |
| **Peer-to-Peer** | 분산 협업, 토론형 | 브레인스토밍, 합의 도출 |

---

## 실전: 코드 리뷰 멀티 에이전트 시스템

### 시스템 아키텍처

**Claude Agent SDK**로 실제 코드 리뷰 **멀티 에이전트** 시스템을 구현합니다. Pipeline **오케스트레이션** 패턴을 사용합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                 코드 리뷰 Multi Agent 시스템                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   입력 코드                                                         │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────┐                                                   │
│   │   분석가     │  - 코드 구조 분석                                 │
│   │  AI Agent   │  - 복잡도 평가                                    │
│   └──────┬──────┘  - 잠재적 문제 식별                               │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │   리뷰어     │  - 코드 품질 평가                                 │
│   │  AI 에이전트 │  - 보안 검토                                      │
│   └──────┬──────┘  - 개선 제안                                      │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │   요약가     │  - 리뷰 결과 종합                                 │
│   │ Multi Agent │  - 우선순위 정리                                  │
│   └──────┬──────┘  - 실행 가능한 피드백                             │
│          │                                                          │
│          ▼                                                          │
│   최종 리뷰 보고서                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 코드 리뷰 멀티 에이전트 구현

**Claude Agent SDK**의 Pipeline **오케스트레이션**으로 **AI 에이전트** 시스템을 구현합니다.

```typescript
// src/agents/code-review-system.ts
import Anthropic from "@anthropic-ai/sdk";

/**
 * CodeReviewSystem - 코드 리뷰 멀티 에이전트 시스템
 *
 * Claude Agent SDK Day 4의 핵심 구현입니다.
 * Pipeline 패턴으로 세 AI Agent가 협업하여 코드를 리뷰합니다.
 */
export class CodeReviewSystem {
  private client: Anthropic;
  private model: string;

  // Multi Agent 시스템 프롬프트
  private readonly agents = {
    analyzer: `당신은 시니어 코드 분석가입니다.
제출된 코드를 분석하여 다음을 제공하세요:
1. 코드 구조 분석 (함수, 클래스, 모듈 구조)
2. 복잡도 평가 (순환 복잡도, 인지 복잡도)
3. 잠재적 문제점 식별 (버그 가능성, 안티패턴)

분석 결과를 구조화된 형식으로 제공하세요.`,

    reviewer: `당신은 시니어 코드 리뷰어입니다.
이전 분석 결과를 바탕으로 코드를 리뷰하세요:
1. 코드 품질 평가 (가독성, 유지보수성)
2. 보안 취약점 검토 (OWASP 기준)
3. 성능 최적화 제안
4. 구체적인 개선 코드 예시

리뷰 결과를 상세하게 제공하세요.`,

    summarizer: `당신은 기술 문서 요약 전문가입니다.
분석 및 리뷰 결과를 종합하여 최종 보고서를 작성하세요:
1. 핵심 발견 사항 (3-5개)
2. 우선순위별 개선 항목
3. 즉시 조치 필요 사항
4. 장기 개선 계획

경영진과 개발자 모두 이해할 수 있게 작성하세요.`,
  };

  constructor(config?: { apiKey?: string; model?: string }) {
    this.client = new Anthropic({
      apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = config?.model || "claude-sonnet-4-5-20250929";
  }

  /**
   * AI Agent를 실행합니다.
   */
  private async runAgent(agentType: keyof typeof this.agents, input: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.agents[agentType],
      messages: [{ role: "user", content: input }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    return textContent && "text" in textContent ? textContent.text : "";
  }

  /**
   * 멀티 에이전트 코드 리뷰를 실행합니다.
   *
   * Pipeline 오케스트레이션:
   * 1. 분석가 AI Agent: 코드 구조 분석
   * 2. 리뷰어 AI 에이전트: 품질 및 보안 리뷰
   * 3. 요약가 Multi Agent: 최종 보고서 작성
   */
  async review(code: string, context?: string): Promise<CodeReviewResult> {
    console.log("🔍 코드 리뷰 멀티 에이전트 시스템 시작...");

    const input = context
      ? `## 컨텍스트\n${context}\n\n## 코드\n\`\`\`\n${code}\n\`\`\``
      : `## 코드\n\`\`\`\n${code}\n\`\`\``;

    // 1단계: 분석가 AI Agent
    console.log("📊 1단계: 분석가 AI Agent 실행 중...");
    const analysis = await this.runAgent("analyzer", input);

    // 2단계: 리뷰어 AI 에이전트
    console.log("🔎 2단계: 리뷰어 AI 에이전트 실행 중...");
    const reviewInput = `## 원본 코드\n\`\`\`\n${code}\n\`\`\`\n\n## 분석 결과\n${analysis}`;
    const review = await this.runAgent("reviewer", reviewInput);

    // 3단계: 요약가 Multi Agent
    console.log("📝 3단계: 요약가 Multi Agent 실행 중...");
    const summaryInput = `## 분석 결과\n${analysis}\n\n## 리뷰 결과\n${review}`;
    const summary = await this.runAgent("summarizer", summaryInput);

    console.log("✅ 코드 리뷰 멀티 에이전트 시스템 완료!");

    return {
      analysis,
      review,
      summary,
      orchestrationPattern: "pipeline",
      agentCount: 3,
    };
  }
}

interface CodeReviewResult {
  analysis: string;
  review: string;
  summary: string;
  orchestrationPattern: string;
  agentCount: number;
}
```

### 사용 예제

**멀티 에이전트** 코드 리뷰 시스템 사용법입니다.

```typescript
// examples/day4-code-review-demo.ts
import { CodeReviewSystem } from "../src/agents/code-review-system.js";

async function main() {
  console.log("🤖 Day 4: 멀티 에이전트 코드 리뷰 데모");

  const system = new CodeReviewSystem();

  // 리뷰할 코드
  const codeToReview = `
function processUser(data) {
  // SQL 쿼리 직접 생성 (보안 위험!)
  const query = "SELECT * FROM users WHERE id = " + data.id;

  // 에러 처리 없음
  const result = db.query(query);

  // 중첩 반복문 (성능 이슈)
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].orders.length; j++) {
      console.log(result[i].orders[j]);
    }
  }

  return result;
}
`;

  // 멀티 에이전트 코드 리뷰 실행
  const result = await system.review(codeToReview, "사용자 데이터 처리 함수");

  console.log("\n=== 분석 결과 ===");
  console.log(result.analysis);

  console.log("\n=== 리뷰 결과 ===");
  console.log(result.review);

  console.log("\n=== 최종 요약 ===");
  console.log(result.summary);

  console.log(`\n오케스트레이션 패턴: ${result.orchestrationPattern}`);
  console.log(`사용된 AI Agent 수: ${result.agentCount}`);
}

main();
```

---

## 멀티 에이전트 통신 패턴

### 메시지 기반 통신

**AI 에이전트** 간 통신의 기본은 메시지 전달입니다. **Claude Agent SDK**의 **멀티 에이전트** 시스템에서 사용하는 통신 패턴입니다.

```typescript
/**
 * AgentMessage - 멀티 에이전트 간 메시지 형식
 */
interface AgentMessage {
  id: string;
  from: string;        // 발신 AI Agent
  to: string;          // 수신 AI 에이전트
  type: MessageType;   // 메시지 유형
  content: string;     // 메시지 내용
  metadata?: Record<string, unknown>;
  timestamp: number;
}

type MessageType = "request" | "response" | "notification" | "error";

/**
 * MessageBus - Multi Agent 메시지 버스
 *
 * AI Agent 간 메시지 라우팅을 담당합니다.
 */
class MessageBus {
  private handlers: Map<string, MessageHandler[]> = new Map();

  /**
   * AI 에이전트의 메시지 핸들러를 등록합니다.
   */
  subscribe(agentId: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(agentId) || [];
    handlers.push(handler);
    this.handlers.set(agentId, handlers);
  }

  /**
   * 멀티 에이전트에게 메시지를 발행합니다.
   */
  async publish(message: AgentMessage): Promise<void> {
    const handlers = this.handlers.get(message.to) || [];
    for (const handler of handlers) {
      await handler(message);
    }
  }
}

type MessageHandler = (message: AgentMessage) => Promise<void>;
```

### 상태 공유 패턴

**멀티 에이전트**가 상태를 공유하는 패턴입니다. **오케스트레이션**에서 **AI Agent** 간 데이터 동기화에 사용합니다.

```typescript
/**
 * SharedState - 멀티 에이전트 공유 상태
 *
 * AI Agent 간 상태를 안전하게 공유합니다.
 */
class SharedState {
  private state: Map<string, unknown> = new Map();
  private locks: Set<string> = new Set();

  /**
   * 상태를 읽습니다 (락 없이).
   */
  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  /**
   * 상태를 업데이트합니다 (락 사용).
   */
  async update<T>(key: string, updater: (current: T | undefined) => T): Promise<void> {
    // 간단한 락 구현 (실제로는 더 정교한 구현 필요)
    while (this.locks.has(key)) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.locks.add(key);
    try {
      const current = this.state.get(key) as T | undefined;
      this.state.set(key, updater(current));
    } finally {
      this.locks.delete(key);
    }
  }
}
```

---

## 오케스트레이션 최적화

**Claude Agent SDK**의 **멀티 에이전트** 시스템 성능을 극대화하는 최적화 전략입니다.

### 병렬 실행 전략

**Claude Agent SDK**를 사용한 **멀티 에이전트** 시스템에서 **AI 에이전트**를 병렬로 실행하여 성능을 향상시킵니다.

```typescript
/**
 * 병렬 Multi Agent 실행
 *
 * 독립적인 AI Agent를 동시에 실행합니다.
 */
async function parallelExecution(tasks: AgentTask[]): Promise<AgentResult[]> {
  return Promise.all(tasks.map((task) => executeAgent(task)));
}

// 사용 예시
const tasks = [
  { agentId: "analyzer", input: code },
  { agentId: "security-checker", input: code },
  { agentId: "performance-analyzer", input: code },
];

// 세 AI 에이전트가 동시에 실행
const results = await parallelExecution(tasks);
```

### 에러 처리와 복구

**Claude Agent SDK**를 사용한 **멀티 에이전트** **오케스트레이션**에서 안정적인 에러 처리 전략입니다.

```typescript
/**
 * 복원력 있는 멀티 에이전트 실행
 */
async function resilientExecution(
  agentId: string,
  input: string,
  options: { retries: number; fallbackAgent?: string }
): Promise<string> {
  for (let attempt = 0; attempt < options.retries; attempt++) {
    try {
      return await executeAgent({ agentId, input });
    } catch (error) {
      console.error(`AI Agent ${agentId} 실패 (시도 ${attempt + 1})`);

      if (attempt === options.retries - 1 && options.fallbackAgent) {
        console.log(`폴백 AI 에이전트 사용: ${options.fallbackAgent}`);
        return await executeAgent({ agentId: options.fallbackAgent, input });
      }
    }
  }

  throw new Error(`Multi Agent 실행 실패: ${agentId}`);
}
```

---

## 다음 단계

Day 4에서 **Claude Agent SDK**의 **멀티 에이전트** 시스템과 **오케스트레이션** 패턴을 구현했습니다. 여러 **AI 에이전트**가 협업하여 복잡한 작업을 처리하는 방법을 배웠습니다.

**Day 5 예고: 프로덕션 배포와 최적화**

- **AI Agent** 에러 처리와 복구 전략
- **멀티 에이전트** 모니터링과 로깅
- 비용 최적화와 토큰 관리
- **Multi Agent** 보안 고려사항
- 프로덕션 **오케스트레이션** 체크리스트

**시리즈 전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent)

---

## 참고 자료

### 공식 문서
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [Multi-Agent Systems Design](https://docs.anthropic.com/en/docs/build-with-claude/multi-agent)

## 시리즈 네비게이션

- [Day 1: Agent 개념과 아키텍처](/ko/claude-agent-sdk-day1-introduction)
- [Day 2: 도구 사용과 MCP 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)
- [Day 3: 메모리와 컨텍스트 관리](/ko/claude-agent-sdk-day3-memory-context)
- **Day 4: 멀티 에이전트 오케스트레이션** (현재 글)
- [Day 5: 프로덕션 배포와 최적화](/ko/claude-agent-sdk-day5-production)
