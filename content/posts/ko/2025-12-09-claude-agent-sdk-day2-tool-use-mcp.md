---
title: "Claude Agent SDK Day 2: Tool Use와 MCP 서버 연동"
slug: "claude-agent-sdk-day2-tool-use-mcp"
excerpt: "AI Agent가 도구를 사용하는 Tool Use 기능을 구현합니다. Function Calling의 개념부터 커스텀 Tool 구현, MCP 서버를 Agent 도구로 연동하는 방법까지 단계별로 알아봅니다."
date: "2025-12-09"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - Tool Use
  - Function Calling
  - MCP
  - MCP 연동
  - AI Agent
  - AI 에이전트
  - Agent Tool
  - 도구 사용
  - TypeScript
featured_image: ""
status: "publish"
language: "ko"
seo_title: "Claude Agent SDK Tool Use 가이드: Function Calling과 MCP 연동 완벽 정리"
seo_description: "Claude Agent SDK로 AI Agent의 Tool Use 기능을 구현하는 방법. Function Calling 개념, 커스텀 Tool 구현, MCP 서버 연동까지 실전 예제와 함께."
---

## TL;DR

**Claude Agent SDK**의 **Tool Use**(도구 사용) 기능으로 **AI Agent**가 실제 작업을 수행할 수 있게 합니다. Day 2에서는 **Function Calling**의 개념을 이해하고, **TypeScript**로 커스텀 **Agent Tool**을 구현하며, **MCP 서버를 Agent 도구로 연동**하는 방법을 배웁니다. **도구 사용** 기능은 **AI 에이전트**가 외부 세계와 상호작용하는 핵심 메커니즘입니다.

**구현 목표**
- **Tool Use**(도구 사용)란 무엇인가: **AI Agent**가 도구를 사용하는 **Function Calling** 메커니즘
- **커스텀 Tool 구현**: Claude Agent SDK에서 **TypeScript**로 **Agent Tool** 정의 및 실행
- **Agent 루프**: **도구 사용** 요청을 처리하는 **AI 에이전트** 반복 실행 패턴
- **MCP 연동**: MCP 서버를 **Agent Tool**로 연결하여 **AI Agent** 기능 확장
- **실전 예제**: 계산기 Tool과 **MCP 연동** 데모로 **도구 사용** 실습

**전체 코드**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Tool Use 튜토리얼

**시리즈**: [Day 1: Agent 개념](/ko/claude-agent-sdk-day1-introduction) | **Day 2: Tool Use와 MCP** (현재 글) | [Day 3: 메모리와 컨텍스트](/ko/claude-agent-sdk-day3-memory-context) | [Day 4: 멀티 에이전트](/ko/claude-agent-sdk-day4-multi-agent) | [Day 5: 프로덕션 배포](/ko/claude-agent-sdk-day5-production)

> *시리즈 연재 중입니다. 일부 링크가 아직 유효하지 않을 수 있습니다.*

---

## Tool Use란 무엇인가?

### AI Agent의 손과 발: 도구 사용의 핵심

Day 1에서 **AI Agent**의 구성 요소를 배웠습니다. LLM이 "두뇌"라면, **Tool Use**(도구 사용)는 Agent의 "손과 발"입니다. **도구 사용** 기능을 통해 **AI 에이전트**는 텍스트 생성을 넘어 실제 작업을 수행할 수 있습니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    Tool Use의 역할                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐                           ┌─────────────────┐  │
│  │   LLM   │  ←── 추론/판단 ──→        │   Tool Use      │  │
│  │  (두뇌) │                           │   (손과 발)     │  │
│  └─────────┘                           └─────────────────┘  │
│                                                ↓            │
│                                        ┌─────────────────┐  │
│                                        │  외부 세계      │  │
│                                        │  - API 호출     │  │
│                                        │  - 파일 읽기    │  │
│                                        │  - 계산 수행    │  │
│                                        │  - MCP 서버     │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**도구 사용** 기능이 없는 LLM은 텍스트만 생성합니다. 하지만 **Claude Agent SDK**의 Tool Use를 활용하면 **AI Agent**가 파일을 읽고, API를 호출하고, 계산을 수행할 수 있습니다. **AI 에이전트**가 진정한 자동화 도구로 기능하려면 **도구 사용**이 필수입니다.

### Function Calling의 개념: AI Agent의 도구 사용 방식

**Function Calling**은 Tool Use(도구 사용)의 핵심 메커니즘입니다. **AI Agent**가 사용자 요청을 분석하고, 적절한 **Agent Tool**을 선택하여 **Function Calling**으로 호출하는 기능입니다.

```
┌────────────────────────────────────────────────────────────┐
│              Function Calling 흐름                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. 사용자: "123 + 456을 계산해줘"                         │
│                    ↓                                       │
│  2. Claude 분석: "계산기 도구가 필요하군"                   │
│                    ↓                                       │
│  3. Function Calling: calculator({ a: 123, b: 456 })       │
│                    ↓                                       │
│  4. Tool 실행: 579 반환                                    │
│                    ↓                                       │
│  5. Claude 응답: "123 + 456의 결과는 579입니다"            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Claude Agent SDK에서 **Function Calling**은 `tool_use` 응답으로 나타납니다. **AI 에이전트**는 이 **도구 사용** 요청을 감지하고 적절한 **Agent Tool**을 실행합니다. **TypeScript**로 구현된 **AI Agent**는 **Function Calling** 응답을 파싱하여 자동으로 도구를 호출합니다.

---

## Tool 정의 방법

### Tool 스키마 구조: AI 에이전트 도구 사용의 기반

Claude Agent SDK에서 **Agent Tool**은 세 가지 요소로 정의됩니다. **TypeScript** 타입 시스템과 함께 **AI Agent**의 **도구 사용**을 안전하게 구현할 수 있습니다:

1. **name**: 도구 이름 (Claude가 호출할 때 사용)
2. **description**: 도구 설명 (Claude가 언제 사용할지 판단하는 기준)
3. **input_schema**: 입력 파라미터 스키마 (JSON Schema 형식)

```typescript
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Claude Agent SDK Tool 정의 예시
const calculatorTool: Tool = {
  name: "calculator",
  description: "수학 연산을 수행합니다. 덧셈, 뺄셈, 곱셈, 나눗셈을 지원합니다.",
  input_schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"],
        description: "수행할 연산 유형",
      },
      a: {
        type: "number",
        description: "첫 번째 숫자",
      },
      b: {
        type: "number",
        description: "두 번째 숫자",
      },
    },
    required: ["operation", "a", "b"],
  },
};
```

**도구 사용**에서 **description**은 매우 중요합니다. **AI Agent**는 이 설명을 보고 언제 해당 **Agent Tool**을 **Function Calling**으로 호출할지 결정합니다.

### 완전한 Calculator Tool 구현

실제로 동작하는 계산기 **Agent Tool**을 **TypeScript**로 구현해보겠습니다. **도구 사용**의 전체 흐름을 이해할 수 있습니다.

```typescript
// src/tools/calculator.ts
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

/**
 * Calculator Tool - Claude Agent SDK Tool Use 예제
 *
 * AI Agent가 수학 연산을 수행할 수 있도록 합니다.
 */
export const calculatorTool: Tool = {
  name: "calculator",
  description:
    "수학 연산을 수행합니다. 덧셈, 뺄셈, 곱셈, 나눗셈, 거듭제곱을 지원합니다.",
  input_schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide", "power"],
        description: "수행할 연산 유형",
      },
      a: {
        type: "number",
        description: "첫 번째 숫자",
      },
      b: {
        type: "number",
        description: "두 번째 숫자",
      },
    },
    required: ["operation", "a", "b"],
  },
};

/**
 * Calculator Tool 입력 타입
 */
interface CalculatorInput {
  operation: "add" | "subtract" | "multiply" | "divide" | "power";
  a: number;
  b: number;
}

/**
 * Calculator Tool 실행 함수
 *
 * Tool Use 요청이 오면 이 함수가 실행됩니다.
 */
export function executeCalculator(input: CalculatorInput): string {
  const { operation, a, b } = input;

  let result: number;

  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) {
        return JSON.stringify({ error: "0으로 나눌 수 없습니다" });
      }
      result = a / b;
      break;
    case "power":
      result = Math.pow(a, b);
      break;
    default:
      return JSON.stringify({ error: `알 수 없는 연산: ${operation}` });
  }

  return JSON.stringify({
    operation,
    a,
    b,
    result,
    expression: `${a} ${getSymbol(operation)} ${b} = ${result}`,
  });
}

function getSymbol(op: string): string {
  const symbols: Record<string, string> = {
    add: "+", subtract: "-", multiply: "×", divide: "÷", power: "^",
  };
  return symbols[op] || "?";
}
```

이 **Agent Tool**은 Claude Agent SDK의 Tool Use 기능을 통해 AI 에이전트에 수학 연산 능력을 부여합니다.

---

## ToolAgent 구현

### Agent 루프 패턴: AI 에이전트의 도구 사용 자동화

**도구 사용**을 지원하는 **AI Agent**는 **Agent 루프**를 구현해야 합니다. **AI 에이전트**가 Tool Use를 요청하면 **Function Calling**으로 도구를 실행하고, 결과를 다시 전달하는 반복 과정입니다.

```typescript
// src/agents/tool-agent.ts
import Anthropic from "@anthropic-ai/sdk";
import type { Tool, MessageParam } from "@anthropic-ai/sdk/resources/messages";

type ToolHandler = (input: unknown) => string | Promise<string>;

/**
 * ToolAgent - Claude Agent SDK Tool Use 지원 Agent
 *
 * Agent 루프를 구현하여 도구 호출을 자동으로 처리합니다.
 */
export class ToolAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;
  private maxIterations: number;
  private tools: Tool[] = [];
  private toolHandlers: Map<string, ToolHandler> = new Map();

  constructor(config: {
    model?: string;
    systemPrompt?: string;
    maxIterations?: number;
  } = {}) {
    this.client = new Anthropic();
    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt ||
      "당신은 도구를 사용할 수 있는 AI 어시스턴트입니다.";
    this.maxIterations = config.maxIterations || 10;
  }

  /**
   * Agent Tool 등록
   *
   * Tool Use에 사용할 도구를 등록합니다.
   */
  registerTool(tool: Tool, handler: ToolHandler): void {
    this.tools.push(tool);
    this.toolHandlers.set(tool.name, handler);
  }

  /**
   * Tool 실행
   */
  private async executeTool(name: string, input: unknown): Promise<string> {
    const handler = this.toolHandlers.get(name);
    if (!handler) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
    return await handler(input);
  }

  /**
   * Agent 루프 실행
   *
   * Tool Use 요청을 자동으로 처리하고 최종 응답을 반환합니다.
   */
  async run(userMessage: string): Promise<string> {
    const messages: MessageParam[] = [
      { role: "user", content: userMessage },
    ];

    for (let i = 0; i < this.maxIterations; i++) {
      // Claude API 호출
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        tools: this.tools.length > 0 ? this.tools : undefined,
        messages,
      });

      // 응답 처리
      if (response.stop_reason === "end_turn") {
        // Tool Use 없이 최종 응답
        const textContent = response.content.find((c) => c.type === "text");
        return textContent && "text" in textContent ? textContent.text : "";
      }

      if (response.stop_reason === "tool_use") {
        // Tool Use 요청 처리
        const toolUseBlocks = response.content.filter(
          (c) => c.type === "tool_use"
        );

        // assistant 메시지 추가
        messages.push({ role: "assistant", content: response.content });

        // 각 Tool 실행 결과 수집
        const toolResults: Array<{
          type: "tool_result";
          tool_use_id: string;
          content: string;
        }> = [];

        for (const block of toolUseBlocks) {
          if (block.type === "tool_use") {
            const result = await this.executeTool(block.name, block.input);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        // tool_result 메시지 추가
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      break;
    }

    return "최대 반복 횟수에 도달했습니다.";
  }

  getTools(): Tool[] {
    return [...this.tools];
  }
}
```

이 **ToolAgent**는 Claude Agent SDK의 **도구 사용** 기능을 완벽하게 지원합니다. **Function Calling** 요청이 오면 자동으로 **Agent Tool**을 실행하는 **AI 에이전트** 구현체입니다.

### Tool Use 실행 예제: AI Agent 도구 사용 데모

ToolAgent를 사용하여 계산기 **Agent Tool**을 실행해보겠습니다. **TypeScript**로 작성된 **AI 에이전트**가 **도구 사용**을 통해 계산을 수행합니다.

```typescript
// examples/day2-tool-demo.ts
import "dotenv/config";
import { ToolAgent } from "../src/agents/tool-agent.js";
import { calculatorTool, executeCalculator } from "../src/tools/calculator.js";

async function main() {
  console.log("=== Claude Agent SDK Day 2: Tool Use 데모 ===\n");

  // ToolAgent 생성
  const agent = new ToolAgent({
    systemPrompt: `당신은 수학 문제를 해결하는 AI 어시스턴트입니다.
계산이 필요한 경우 반드시 calculator 도구를 사용하세요.`,
  });

  // Calculator Tool 등록
  agent.registerTool(calculatorTool, (input) => {
    return executeCalculator(input as Parameters<typeof executeCalculator>[0]);
  });

  console.log("등록된 도구:", agent.getTools().map((t) => t.name).join(", "));

  // Tool Use 테스트
  const response1 = await agent.run("123 더하기 456은 얼마야?");
  console.log("\n질문: 123 더하기 456은 얼마야?");
  console.log(`응답: ${response1}`);

  const response2 = await agent.run("2의 10승을 계산해줘");
  console.log("\n질문: 2의 10승을 계산해줘");
  console.log(`응답: ${response2}`);
}

main().catch(console.error);
```

**실행 결과**:
```
=== Claude Agent SDK Day 2: Tool Use 데모 ===

등록된 도구: calculator

질문: 123 더하기 456은 얼마야?
응답: 123 더하기 456은 579입니다.

질문: 2의 10승을 계산해줘
응답: 2의 10승은 1024입니다.
```

Claude Agent SDK의 **Tool Use**와 **Function Calling**이 정상적으로 동작합니다. **AI 에이전트**가 계산기 **Agent Tool**을 **도구 사용**하여 연산을 수행했습니다. 이처럼 **AI Agent**는 **도구 사용** 기능으로 실제 작업을 처리합니다.

---

## MCP 서버 연동

### MCP란?

**MCP**(Model Context Protocol)는 AI 모델이 외부 도구와 상호작용하기 위한 표준 프로토콜입니다. **MCP 연동**을 통해 AI Agent의 기능을 무한히 확장할 수 있습니다.

Claude Agent SDK의 **도구 사용**과 MCP를 결합하면 강력한 **AI 에이전트**를 구축할 수 있습니다. **AI Agent**가 MCP 서버의 도구들을 **Agent Tool**로 변환하여 **Function Calling**으로 호출합니다.

### MCP Bridge 구현

**TypeScript**로 MCP 서버를 Claude Agent SDK의 **도구 사용** 시스템과 연결하는 브릿지를 구현합니다.

```typescript
// src/tools/mcp-bridge.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

interface MCPBridgeConfig {
  serverCommand: string;
  serverArgs?: string[];
}

interface MCPConnection {
  tools: Tool[];
  executeToolOnMCP: (name: string, args: Record<string, unknown>) => Promise<string>;
  disconnect: () => Promise<void>;
}

/**
 * MCP 서버에 연결하고 Agent Tool로 변환
 *
 * MCP 연동을 통해 외부 MCP 서버의 도구를
 * Claude Agent SDK Tool Use 시스템에서 사용할 수 있습니다.
 */
export async function connectToMCPServer(
  config: MCPBridgeConfig
): Promise<MCPConnection> {
  // MCP 클라이언트 생성
  const transport = new StdioClientTransport({
    command: config.serverCommand,
    args: config.serverArgs,
  });

  const client = new Client(
    { name: "my-first-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  // MCP 서버 연결
  await client.connect(transport);

  // MCP 도구 목록 조회
  const mcpTools = await client.listTools();

  // MCP 도구를 Claude Agent SDK Tool로 변환
  const tools: Tool[] = mcpTools.tools.map((mcpTool) => ({
    name: mcpTool.name,
    description: mcpTool.description || `MCP Tool: ${mcpTool.name}`,
    input_schema: mcpTool.inputSchema as Tool["input_schema"],
  }));

  // MCP Tool 실행 함수
  const executeToolOnMCP = async (
    name: string,
    args: Record<string, unknown>
  ): Promise<string> => {
    const result = await client.callTool({ name, arguments: args });

    if (result.content && Array.isArray(result.content)) {
      return result.content
        .map((item) => (item.type === "text" ? item.text : JSON.stringify(item)))
        .join("\n");
    }
    return JSON.stringify(result);
  };

  return {
    tools,
    executeToolOnMCP,
    disconnect: async () => await client.close(),
  };
}

/**
 * MCP 도구들을 ToolAgent에 등록
 *
 * MCP 연동 완료 후 모든 MCP 도구를 Agent Tool로 사용할 수 있습니다.
 */
export function registerMCPTools(
  agent: { registerTool: (tool: Tool, handler: (input: unknown) => Promise<string>) => void },
  mcpConnection: MCPConnection
): void {
  for (const tool of mcpConnection.tools) {
    agent.registerTool(tool, async (input: unknown) => {
      return mcpConnection.executeToolOnMCP(tool.name, input as Record<string, unknown>);
    });
  }
}
```

### MCP 연동 실전 예제

my-first-mcp 프로젝트와 연동하여 프로젝트 분석 기능을 사용해보겠습니다.

```typescript
// examples/day2-mcp-demo.ts
import "dotenv/config";
import { ToolAgent } from "../src/agents/tool-agent.js";
import { connectToMCPServer, registerMCPTools } from "../src/tools/mcp-bridge.js";

async function main() {
  console.log("=== Claude Agent SDK Day 2: MCP 연동 데모 ===\n");

  // MCP 서버 연결
  console.log("MCP 서버에 연결 중...");
  const mcpConnection = await connectToMCPServer({
    serverCommand: "node",
    serverArgs: ["/path/to/my-first-mcp/dist/index.js"],
  });

  console.log("연결된 MCP 도구:", mcpConnection.tools.map((t) => t.name).join(", "));

  // ToolAgent 생성
  const agent = new ToolAgent({
    systemPrompt: `당신은 코드 분석 전문가 AI 어시스턴트입니다.
프로젝트 분석이 필요하면 제공된 MCP 도구를 사용하세요.`,
  });

  // MCP 도구를 Agent Tool로 등록
  registerMCPTools(agent, mcpConnection);

  try {
    // MCP Tool Use 테스트
    const response = await agent.run(
      "현재 프로젝트의 구조를 분석해줘"
    );
    console.log("\n질문: 현재 프로젝트의 구조를 분석해줘");
    console.log(`응답: ${response}`);
  } finally {
    await mcpConnection.disconnect();
    console.log("\nMCP 연결 해제됨");
  }
}

main().catch(console.error);
```

**MCP 연동**을 통해 Claude Agent SDK의 AI 에이전트가 외부 MCP 서버의 기능을 Tool Use로 활용합니다.

---

## Tool 설계 베스트 프랙티스

### 좋은 Tool 정의의 조건: AI Agent 도구 사용 최적화

Claude Agent SDK에서 효과적인 **Agent Tool**을 만들기 위한 **TypeScript** 가이드라인입니다. **AI 에이전트**가 **Function Calling**을 올바르게 수행하려면 Tool 정의가 중요합니다.

1. **명확한 description**: **AI Agent**가 언제 **도구 사용**을 해야 하는지 이해할 수 있도록 상세히 작성

```typescript
// ❌ 나쁜 예
{ name: "search", description: "검색" }

// ✅ 좋은 예
{
  name: "search",
  description: "웹에서 정보를 검색합니다. 실시간 정보나 최신 뉴스가 필요할 때 사용하세요."
}
```

2. **구체적인 input_schema**: 파라미터의 타입과 설명을 명확하게 정의

```typescript
// ✅ 좋은 예
{
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "검색할 키워드 또는 문장",
      },
      limit: {
        type: "number",
        description: "반환할 최대 결과 수 (기본값: 10)",
      },
    },
    required: ["query"],
  },
}
```

3. **에러 처리**: **도구 사용** 실패 시 **AI 에이전트**에게 명확한 에러 메시지 반환

```typescript
export function executeTool(input: ToolInput): string {
  try {
    // 도구 실행 로직
    return JSON.stringify({ success: true, result: data });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}
```

### Tool Use 디버깅: AI Agent 도구 사용 문제 해결

**Function Calling** 및 **도구 사용** 문제를 해결하기 위한 팁:

```typescript
// 디버깅용 로깅 추가
async run(userMessage: string): Promise<string> {
  // ...
  if (response.stop_reason === "tool_use") {
    console.log("[Tool Use 요청]");
    for (const block of toolUseBlocks) {
      if (block.type === "tool_use") {
        console.log(`  - Tool: ${block.name}`);
        console.log(`  - Input: ${JSON.stringify(block.input)}`);
      }
    }
  }
  // ...
}
```

---

## 프로젝트 구조 업데이트

Day 2까지 구현한 my-first-agent 프로젝트 구조입니다.

```
my-first-agent/
├── src/
│   ├── index.ts
│   ├── agents/
│   │   ├── basic-agent.ts        # Day 1
│   │   ├── conversational.ts     # Day 1
│   │   ├── robust-agent.ts       # Day 1
│   │   ├── agent-factory.ts      # Day 1
│   │   └── tool-agent.ts         # Day 2: Tool Use Agent
│   ├── tools/                    # Day 2: Agent Tool
│   │   ├── calculator.ts         # 계산기 Tool
│   │   └── mcp-bridge.ts         # MCP 연동
│   ├── prompts/
│   │   └── system-prompts.ts
│   └── types/
│       └── index.ts
├── examples/
│   ├── basic-usage.ts
│   ├── conversation-demo.ts
│   ├── agent-factory-demo.ts
│   ├── day2-tool-demo.ts         # Day 2: Tool Use 데모
│   └── day2-mcp-demo.ts          # Day 2: MCP 연동 데모
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 요약

Day 2에서 배운 Claude Agent SDK **Tool Use**의 핵심 내용입니다.

1. **Tool Use 개념**
   - **Function Calling**: Claude가 도구를 호출하는 메커니즘
   - **Agent Tool**: name, description, input_schema로 정의
   - Tool Use로 AI 에이전트가 외부 세계와 상호작용

2. **ToolAgent 구현**
   - Agent 루프: Tool Use 요청 → 실행 → 결과 전달 반복
   - `registerTool()`: Agent Tool 등록
   - `run()`: Tool Use를 자동으로 처리

3. **MCP 연동**
   - MCP 서버의 도구를 Agent Tool로 변환
   - `connectToMCPServer()`: MCP 서버 연결
   - `registerMCPTools()`: MCP 도구를 ToolAgent에 등록

4. **베스트 프랙티스**
   - 명확한 Tool description 작성
   - 구체적인 input_schema 정의
   - 에러 처리와 디버깅

### Claude Agent SDK Tool Use 핵심 코드

```typescript
// Tool Use - Agent Tool 등록
const agent = new ToolAgent();
agent.registerTool(calculatorTool, executeCalculator);

// Tool Use 실행
const response = await agent.run("123 + 456을 계산해줘");

// MCP 연동
const mcp = await connectToMCPServer({ serverCommand: "node", serverArgs: ["mcp.js"] });
registerMCPTools(agent, mcp);
```

---

## 다음 편 예고

**Day 3: 메모리와 컨텍스트 관리**

Day 3에서는 AI Agent의 메모리 시스템을 구현합니다:

- Short-term Memory: 대화 히스토리
- Long-term Memory: 영속 저장소
- 컨텍스트 윈도우 관리 전략
- 상태 관리 패턴

---

## 참고 자료

### 튜토리얼 소스 코드
- [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - 이 튜토리얼의 전체 소스 코드

### 공식 문서
- [Claude Agent SDK Overview](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [MCP Documentation](https://modelcontextprotocol.io/)

### 시리즈 링크
- [Day 1: Agent 개념과 첫 번째 Agent](/ko/claude-agent-sdk-day1-introduction)
- [Day 3: 메모리와 컨텍스트 관리](/ko/claude-agent-sdk-day3-memory-context)
- [Day 4: 멀티 에이전트 오케스트레이션](/ko/claude-agent-sdk-day4-multi-agent)
- [Day 5: 프로덕션 배포와 최적화](/ko/claude-agent-sdk-day5-production)

> *시리즈 연재 중입니다. 일부 링크가 아직 유효하지 않을 수 있습니다.*
