---
title: "Claude Agent SDK Day 2: Tool Use and MCP Server Integration"
slug: "claude-agent-sdk-day2-tool-use-mcp"
excerpt: "Implement Tool Use functionality that enables AI Agents to use tools. Learn Function Calling concepts, custom Tool implementation, and MCP server integration with Claude Agent SDK step by step."
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
  - MCP Integration
  - AI Agent
  - Agent Tool
  - TypeScript
featured_image: ""
status: "publish"
language: "en"
seo_title: "Claude Agent SDK Tool Use Guide: Function Calling and MCP Integration Complete Tutorial"
seo_description: "Learn how to implement Tool Use functionality for AI Agents with Claude Agent SDK. Function Calling concepts, custom Tool implementation, and MCP server integration with practical examples."
---

> **🌐 Translation**: Translated from [Korean](/ko/claude-agent-sdk-day2-tool-use-mcp).

## TL;DR

**Claude Agent SDK**'s **Tool Use** functionality enables **AI Agents** to perform real-world tasks. In Day 2, we understand **Function Calling** concepts, implement custom **Agent Tools** with **TypeScript**, and learn **MCP server integration** methods. **Tool Use** is the core mechanism for **AI Agents** to interact with the external world.

What you'll learn:
- **Tool Use** fundamentals: **Function Calling** mechanism for **AI Agent** tool usage
- **Custom Tool implementation**: Defining and executing **Agent Tools** with **Claude Agent SDK** and **TypeScript**
- **Agent Loop**: Iterative execution pattern for processing **Tool Use** requests
- **MCP Integration**: Connecting MCP servers as **Agent Tools** to extend **AI Agent** capabilities
- **Practical examples**: Calculator Tool and **MCP Integration** demos for hands-on **Tool Use** practice

**Full Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Tool Use Tutorial

**Series**: [Day 1: Agent Concepts](/en/claude-agent-sdk-day1-introduction) | **Day 2: Tool Use and MCP** (current) | [Day 3: Memory and Context](/en/claude-agent-sdk-day3-memory-context) | [Day 4: Multi-Agent](/en/claude-agent-sdk-day4-multi-agent) | [Day 5: Production Deployment](/en/claude-agent-sdk-day5-production)

> *Series in progress. Some links may not be active yet.*

---

## What is Tool Use?

### Hands and Feet of AI Agent: The Core of Tool Use

In Day 1, we learned about **AI Agent** components. If LLM is the "brain," **Tool Use** is the Agent's "hands and feet." Through **Tool Use** functionality, **AI Agents** can perform real tasks beyond text generation. With **TypeScript**, you can build type-safe **AI Agents** that leverage **Tool Use** and **MCP Integration** capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                    Role of Tool Use                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐                           ┌─────────────────┐  │
│  │   LLM   │  ←── Reasoning ──→        │   Tool Use      │  │
│  │ (Brain) │                           │ (Hands & Feet)  │  │
│  └─────────┘                           └─────────────────┘  │
│                                                ↓            │
│                                        ┌─────────────────┐  │
│                                        │ External World  │  │
│                                        │  - API calls    │  │
│                                        │  - File reading │  │
│                                        │  - Calculations │  │
│                                        │  - MCP servers  │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Without **Tool Use**, LLMs only generate text. However, with **Claude Agent SDK**'s Tool Use, **AI Agents** can read files, call APIs, and perform calculations. **Tool Use** is essential for **AI Agents** to function as true automation tools.

### Function Calling Concept: How AI Agents Use Tools

**Function Calling** is the core mechanism of Tool Use. **AI Agents** analyze user requests, select appropriate **Agent Tools**, and invoke them through **Function Calling**.

```
┌────────────────────────────────────────────────────────────┐
│              Function Calling Flow                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. User: "Calculate 123 + 456"                            │
│                    ↓                                       │
│  2. Claude analyzes: "Calculator tool needed"              │
│                    ↓                                       │
│  3. Function Calling: calculator({ a: 123, b: 456 })       │
│                    ↓                                       │
│  4. Tool execution: returns 579                            │
│                    ↓                                       │
│  5. Claude response: "123 + 456 equals 579"                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

In Claude Agent SDK, **Function Calling** appears as a `tool_use` response. **AI Agents** detect this **Tool Use** request and execute the appropriate **Agent Tool**. **AI Agents** implemented in **TypeScript** parse **Function Calling** responses to automatically invoke tools.

---

## Tool Definition Methods

### Tool Schema Structure: Foundation for AI Agent Tool Use

In Claude Agent SDK, **Agent Tools** are defined with three elements. Combined with **TypeScript**'s type system, you can implement **AI Agent** **Tool Use** safely:

1. **name**: Tool name (used when Claude calls the tool)
2. **description**: Tool description (criteria for Claude to decide when to use it)
3. **input_schema**: Input parameter schema (JSON Schema format)

```typescript
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

// Claude Agent SDK Tool definition example
const calculatorTool: Tool = {
  name: "calculator",
  description: "Performs math operations. Supports addition, subtraction, multiplication, and division.",
  input_schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"],
        description: "Type of operation to perform",
      },
      a: {
        type: "number",
        description: "First number",
      },
      b: {
        type: "number",
        description: "Second number",
      },
    },
    required: ["operation", "a", "b"],
  },
};
```

In **Tool Use**, **description** is crucial. **AI Agents** read this description to decide when to invoke the **Agent Tool** through **Function Calling**.

### Complete Calculator Tool Implementation

Let's implement a working calculator **Agent Tool** with **TypeScript**. This demonstrates the complete **Tool Use** flow.

```typescript
// src/tools/calculator.ts
import type { Tool } from "@anthropic-ai/sdk/resources/messages";

/**
 * Calculator Tool - Claude Agent SDK Tool Use Example
 *
 * Enables AI Agents to perform mathematical operations.
 */
export const calculatorTool: Tool = {
  name: "calculator",
  description:
    "Performs math operations. Supports addition, subtraction, multiplication, division, and power.",
  input_schema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide", "power"],
        description: "Type of operation to perform",
      },
      a: {
        type: "number",
        description: "First number",
      },
      b: {
        type: "number",
        description: "Second number",
      },
    },
    required: ["operation", "a", "b"],
  },
};

/**
 * Calculator Tool input type
 */
interface CalculatorInput {
  operation: "add" | "subtract" | "multiply" | "divide" | "power";
  a: number;
  b: number;
}

/**
 * Calculator Tool execution function
 *
 * This function executes when a Tool Use request arrives.
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
        return JSON.stringify({ error: "Cannot divide by zero" });
      }
      result = a / b;
      break;
    case "power":
      result = Math.pow(a, b);
      break;
    default:
      return JSON.stringify({ error: `Unknown operation: ${operation}` });
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

This **Agent Tool** provides mathematical operation capabilities to AI Agents through Claude Agent SDK's Tool Use functionality. The **TypeScript** type definitions ensure type safety during development, and this pattern extends to **MCP Integration** scenarios as well.

---

## ToolAgent Implementation

### Agent Loop Pattern: Automating AI Agent Tool Use

**AI Agents** supporting **Tool Use** must implement the **Agent Loop**. When **AI Agents** request Tool Use, the process repeats: execute the tool via **Function Calling** and pass results back.

```typescript
// src/agents/tool-agent.ts
import Anthropic from "@anthropic-ai/sdk";
import type { Tool, MessageParam } from "@anthropic-ai/sdk/resources/messages";

type ToolHandler = (input: unknown) => string | Promise<string>;

/**
 * ToolAgent - Claude Agent SDK Tool Use Supporting Agent
 *
 * Implements Agent Loop to automatically handle tool calls.
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
      "You are an AI assistant that can use tools.";
    this.maxIterations = config.maxIterations || 10;
  }

  /**
   * Register Agent Tool
   *
   * Registers tools for Tool Use.
   */
  registerTool(tool: Tool, handler: ToolHandler): void {
    this.tools.push(tool);
    this.toolHandlers.set(tool.name, handler);
  }

  /**
   * Execute Tool
   */
  private async executeTool(name: string, input: unknown): Promise<string> {
    const handler = this.toolHandlers.get(name);
    if (!handler) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
    return await handler(input);
  }

  /**
   * Run Agent Loop
   *
   * Automatically processes Tool Use requests and returns final response.
   */
  async run(userMessage: string): Promise<string> {
    const messages: MessageParam[] = [
      { role: "user", content: userMessage },
    ];

    for (let i = 0; i < this.maxIterations; i++) {
      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: this.systemPrompt,
        tools: this.tools.length > 0 ? this.tools : undefined,
        messages,
      });

      // Process response
      if (response.stop_reason === "end_turn") {
        // Final response without Tool Use
        const textContent = response.content.find((c) => c.type === "text");
        return textContent && "text" in textContent ? textContent.text : "";
      }

      if (response.stop_reason === "tool_use") {
        // Process Tool Use request
        const toolUseBlocks = response.content.filter(
          (c) => c.type === "tool_use"
        );

        // Add assistant message
        messages.push({ role: "assistant", content: response.content });

        // Collect each Tool execution result
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

        // Add tool_result message
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      break;
    }

    return "Maximum iterations reached.";
  }

  getTools(): Tool[] {
    return [...this.tools];
  }
}
```

This **ToolAgent** fully supports **Claude Agent SDK**'s **Tool Use** functionality. It's an **AI Agent** implementation that automatically executes **Agent Tools** when **Function Calling** requests arrive.

### Tool Use Execution Example: AI Agent Tool Use Demo

Let's execute the calculator **Agent Tool** using ToolAgent. An **AI Agent** written in **TypeScript** performs calculations through **Tool Use**.

```typescript
// examples/day2-tool-demo.ts
import "dotenv/config";
import { ToolAgent } from "../src/agents/tool-agent.js";
import { calculatorTool, executeCalculator } from "../src/tools/calculator.js";

async function main() {
  console.log("=== Claude Agent SDK Day 2: Tool Use Demo ===\n");

  // Create ToolAgent
  const agent = new ToolAgent({
    systemPrompt: `You are an AI assistant that solves math problems.
Always use the calculator tool when calculations are needed.`,
  });

  // Register Calculator Tool
  agent.registerTool(calculatorTool, (input) => {
    return executeCalculator(input as Parameters<typeof executeCalculator>[0]);
  });

  console.log("Registered tools:", agent.getTools().map((t) => t.name).join(", "));

  // Test Tool Use
  const response1 = await agent.run("What is 123 plus 456?");
  console.log("\nQuestion: What is 123 plus 456?");
  console.log(`Response: ${response1}`);

  const response2 = await agent.run("Calculate 2 to the power of 10");
  console.log("\nQuestion: Calculate 2 to the power of 10");
  console.log(`Response: ${response2}`);
}

main().catch(console.error);
```

**Execution Result**:
```
=== Claude Agent SDK Day 2: Tool Use Demo ===

Registered tools: calculator

Question: What is 123 plus 456?
Response: 123 plus 456 equals 579.

Question: Calculate 2 to the power of 10
Response: 2 to the power of 10 equals 1024.
```

Claude Agent SDK's **Tool Use** and **Function Calling** work correctly. The **AI Agent** used the calculator **Agent Tool** through **Tool Use** to perform calculations. This is how **AI Agents** handle real tasks through **Tool Use** functionality.

---

## MCP Server Integration

### What is MCP?

**MCP** (Model Context Protocol) is a standard protocol for AI models to interact with external tools. Through **MCP Integration**, you can extend AI Agent capabilities infinitely.

Combining **Claude Agent SDK**'s **Tool Use** with MCP enables building powerful **AI Agents**. **AI Agents** convert MCP server tools into **Agent Tools** and invoke them via **Function Calling**.

### MCP Bridge Implementation

Implement a bridge connecting MCP servers to **Claude Agent SDK**'s **Tool Use** system using **TypeScript**.

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
 * Connect to MCP server and convert to Agent Tools
 *
 * Through MCP Integration, external MCP server tools
 * become available in Claude Agent SDK Tool Use system.
 */
export async function connectToMCPServer(
  config: MCPBridgeConfig
): Promise<MCPConnection> {
  // Create MCP client
  const transport = new StdioClientTransport({
    command: config.serverCommand,
    args: config.serverArgs,
  });

  const client = new Client(
    { name: "my-first-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  // Connect to MCP server
  await client.connect(transport);

  // Get MCP tool list
  const mcpTools = await client.listTools();

  // Convert MCP tools to Claude Agent SDK Tools
  const tools: Tool[] = mcpTools.tools.map((mcpTool) => ({
    name: mcpTool.name,
    description: mcpTool.description || `MCP Tool: ${mcpTool.name}`,
    input_schema: mcpTool.inputSchema as Tool["input_schema"],
  }));

  // MCP Tool execution function
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
 * Register MCP tools to ToolAgent
 *
 * After MCP Integration, all MCP tools become available as Agent Tools.
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

### MCP Integration Practical Example

Let's integrate with the my-first-mcp project to use project analysis functionality.

```typescript
// examples/day2-mcp-demo.ts
import "dotenv/config";
import { ToolAgent } from "../src/agents/tool-agent.js";
import { connectToMCPServer, registerMCPTools } from "../src/tools/mcp-bridge.js";

async function main() {
  console.log("=== Claude Agent SDK Day 2: MCP Integration Demo ===\n");

  // Connect to MCP server
  console.log("Connecting to MCP server...");
  const mcpConnection = await connectToMCPServer({
    serverCommand: "node",
    serverArgs: ["/path/to/my-first-mcp/dist/index.js"],
  });

  console.log("Connected MCP tools:", mcpConnection.tools.map((t) => t.name).join(", "));

  // Create ToolAgent
  const agent = new ToolAgent({
    systemPrompt: `You are an expert code analysis AI assistant.
Use the provided MCP tools when project analysis is needed.`,
  });

  // Register MCP tools as Agent Tools
  registerMCPTools(agent, mcpConnection);

  try {
    // Test MCP Tool Use
    const response = await agent.run(
      "Analyze the structure of the current project"
    );
    console.log("\nQuestion: Analyze the structure of the current project");
    console.log(`Response: ${response}`);
  } finally {
    await mcpConnection.disconnect();
    console.log("\nMCP connection closed");
  }
}

main().catch(console.error);
```

Through **MCP Integration**, **Claude Agent SDK**'s AI Agent utilizes external server functionality via Tool Use. The **TypeScript** implementation ensures robust **MCP Integration** with proper typing and error handling.

---

## Tool Design Best Practices

### Conditions for Good Tool Definitions: Optimizing AI Agent Tool Use

Guidelines for creating effective **Agent Tools** in **Claude Agent SDK** using **TypeScript**. Proper Tool definitions are crucial for **AI Agents** to perform **Function Calling** correctly.

1. **Clear description**: Write detailed descriptions so **AI Agents** understand when to use **Tool Use**

```typescript
// ❌ Bad example
{ name: "search", description: "Search" }

// ✅ Good example
{
  name: "search",
  description: "Searches the web for information. Use when real-time information or latest news is needed."
}
```

2. **Specific input_schema**: Define parameter types and descriptions clearly

```typescript
// ✅ Good example
{
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Keywords or sentence to search",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 10)",
      },
    },
    required: ["query"],
  },
}
```

3. **Error handling**: Return clear error messages to **AI Agents** when **Tool Use** fails

```typescript
export function executeTool(input: ToolInput): string {
  try {
    // Tool execution logic
    return JSON.stringify({ success: true, result: data });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
```

### Tool Use Debugging: Troubleshooting AI Agent Tool Use Issues

Tips for resolving **Function Calling** and **Tool Use** issues:

```typescript
// Add debugging logs
async run(userMessage: string): Promise<string> {
  // ...
  if (response.stop_reason === "tool_use") {
    console.log("[Tool Use Request]");
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

## Project Structure Update

The my-first-agent project structure after implementing through Day 2.

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
│   ├── tools/                    # Day 2: Agent Tools
│   │   ├── calculator.ts         # Calculator Tool
│   │   └── mcp-bridge.ts         # MCP Integration
│   ├── prompts/
│   │   └── system-prompts.ts
│   └── types/
│       └── index.ts
├── examples/
│   ├── basic-usage.ts
│   ├── conversation-demo.ts
│   ├── agent-factory-demo.ts
│   ├── day2-tool-demo.ts         # Day 2: Tool Use Demo
│   └── day2-mcp-demo.ts          # Day 2: MCP Integration Demo
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Summary

Key concepts of **Claude Agent SDK** **Tool Use** learned in Day 2.

1. **Tool Use Concepts**
   - **Function Calling**: Mechanism for Claude to call tools
   - **Agent Tool**: Defined with name, description, input_schema
   - Tool Use enables AI Agents to interact with the external world

2. **ToolAgent Implementation**
   - Agent Loop: Tool Use request → execution → return result cycle
   - `registerTool()`: Register Agent Tools
   - `run()`: Automatically process Tool Use

3. **MCP Integration**
   - Convert MCP server tools to Agent Tools
   - `connectToMCPServer()`: Connect to MCP server
   - `registerMCPTools()`: Register MCP tools to ToolAgent

4. **Best Practices**
   - Write clear Tool descriptions with **TypeScript** type safety
   - Define specific input_schema for **MCP Integration**
   - Error handling and debugging

### Claude Agent SDK Tool Use Core Code

```typescript
// Tool Use - Register Agent Tool
const agent = new ToolAgent();
agent.registerTool(calculatorTool, executeCalculator);

// Execute Tool Use
const response = await agent.run("Calculate 123 + 456");

// MCP Integration
const mcp = await connectToMCPServer({ serverCommand: "node", serverArgs: ["mcp.js"] });
registerMCPTools(agent, mcp);
```

---

## Next Episode Preview

**Day 3: Memory and Context Management**

In Day 3, we implement the AI Agent memory system:

- Short-term Memory: Conversation history
- Long-term Memory: Persistent storage
- Context window management strategies
- State management patterns

---

## References

### Tutorial Source Code
- [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Complete source code for this tutorial

### Official Documentation
- [Claude Agent SDK Overview](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [MCP Documentation](https://modelcontextprotocol.io/)

### Series Links
- [Day 1: Agent Concepts and First Agent](/en/claude-agent-sdk-day1-introduction)
- [Day 3: Memory and Context Management](/en/claude-agent-sdk-day3-memory-context)
- [Day 4: Multi-Agent Orchestration](/en/claude-agent-sdk-day4-multi-agent)
- [Day 5: Production Deployment and Optimization](/en/claude-agent-sdk-day5-production)

> *Series in progress. Some links may not be active yet.*
