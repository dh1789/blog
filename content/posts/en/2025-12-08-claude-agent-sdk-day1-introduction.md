---
title: "Claude Agent SDK Day 1: Understanding AI Agents and Building Your First Agent"
slug: "claude-agent-sdk-day1-introduction"
excerpt: "What is an AI Agent? Learn to build your first AI agent with Claude Agent SDK. From SDK installation to implementing a simple agent in TypeScript - a beginner's guide to agent development."
date: "2025-12-08"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - AI Agent
  - TypeScript
  - Anthropic
  - Agent Development
  - SDK Installation
  - Agent Architecture
  - LLM
  - First Agent
  - Tutorial
featured_image: ""
status: "draft"
language: "en"
seo_title: "Claude Agent SDK Guide: AI Agent Concepts and First Agent Development"
seo_description: "Build AI agents with Claude Agent SDK. Learn agent concepts, SDK installation, and implement your first agent in TypeScript with step-by-step guide."
---

> **🌐 Translation**: Translated from [Korean](/ko/claude-agent-sdk-day1-introduction).

## TL;DR

Build your **first Agent** with **Claude Agent SDK**. Understand what AI agents are, how they differ from regular LLMs, and start developing your first Agent in TypeScript. This tutorial is a step-by-step guide for beginners in agent development. Claude Agent SDK is the official agent development tool from Anthropic - this tutorial guides you from SDK installation to first Agent implementation.

What you'll learn in this tutorial:
- AI Agent vs LLM differences: Why agent development matters
- Claude Agent SDK installation and project setup (SDK installation guide)
- Core components of Agent Architecture (LLM, Tools, Memory, Planning)
- Building your first Agent with TypeScript
- Claude Agent SDK basic API usage (completing your first Agent)

**Full Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Complete tutorial source code for Claude Agent SDK agent development

**Series**: **Day 1: Agent Concepts** | [Day 2: Tool Use & MCP](/en/claude-agent-sdk-day2-tool-use-mcp) | [Day 3: Memory & Context](/en/claude-agent-sdk-day3-memory-context) | [Day 4: Multi-Agent](/en/claude-agent-sdk-day4-multi-agent) | [Day 5: Production Deploy](/en/claude-agent-sdk-day5-production)

> *This series is in progress. Some links may not be active yet.*

---

## What is an AI Agent?

### LLM vs AI Agent

A regular LLM (Large Language Model) takes text input and produces text output. It's a simple structure with one request and one response. In contrast, an AI Agent is an autonomous system that **plans on its own**, **uses tools**, and **executes multiple steps** to achieve goals.

```
┌─────────────────────────────────────────────────────────────┐
│                      Regular LLM                            │
├─────────────────────────────────────────────────────────────┤
│  Input → LLM → Output                                       │
│  (Simple request-response, no state)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      AI Agent                               │
├─────────────────────────────────────────────────────────────┤
│  Goal → Planning → Tool Execution → Result Analysis → Loop  │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   LLM   │  │  Tools  │  │ Memory  │  │Planning │        │
│  │ (Brain) │  │ (Hands) │  │(Memory) │  │(Strategy)│       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

With Claude Agent SDK, you can easily build such AI agents. All the components needed for agent development are included in the SDK. This tutorial will walk you through each component step by step.

### Core Components of AI Agent

An AI agent consists of four core components. Claude Agent SDK provides integrated support for all these elements.

1. **LLM (Brain)**: Language models like Claude handle reasoning and decision-making
2. **Tools**: Interact with the external world through file reading, API calls, code execution
3. **Memory**: Store conversation history, user information, and task state
4. **Planning**: Break down complex tasks into steps and establish execution strategies

In this tutorial series, we'll learn how to implement each component with Claude Agent SDK. Today on Day 1, we'll understand the basic Agent Architecture through SDK installation and first Agent implementation. This tutorial covers the fundamentals, and from Day 2, we'll cover tools, memory, multi-agent, and more.

---

## Introducing Claude Agent SDK

### Why Claude Agent SDK?

Anthropic's **Claude Agent SDK** is the official TypeScript library for building AI agents. Here's why to choose Claude Agent SDK for agent development:

- **Official Support**: SDK developed and maintained directly by Anthropic
- **TypeScript First**: Type safety and optimized developer experience
- **Integrated Architecture**: LLM, Tools, Memory unified in one SDK
- **MCP Compatible**: Perfect compatibility with Model Context Protocol
- **Production Ready**: Built-in error handling, retry, and monitoring features

Claude Agent SDK is the most efficient way to create AI agents. This tutorial shows you how starting agent development with this SDK lets you implement AI Agents immediately without complex configuration.

### SDK Installation and Project Setup

Let's start with Claude Agent SDK installation. The SDK installation process is simple, and you can start your first Agent development project right away.

```bash
# Create project directory
mkdir my-first-agent
cd my-first-agent

# Initialize npm
npm init -y

# Install Claude Agent SDK
npm install @anthropic-ai/sdk

# Install TypeScript and dev dependencies
npm install -D typescript @types/node ts-node

# Initialize TypeScript configuration
npx tsc --init
```

### tsconfig.json Configuration

After SDK installation, configure TypeScript. This configuration is optimized for first Agent development with proper Agent Architecture setup.

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

### Environment Variables Setup

After SDK installation is complete, set up the API key. This is the authentication information for your first Agent to communicate with Claude.

```bash
# Create .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env

# Install dotenv (optional)
npm install dotenv
```

**How to get an API key**:
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create a new key in the API Keys menu
3. Save the generated key in `.env` file

---

## Understanding Agent Architecture

### Claude Agent SDK Agent Architecture

Let's examine the core classes and interfaces that compose your first Agent in Claude Agent SDK. This is the fundamental structure of Agent Architecture.

```typescript
import { Anthropic } from "@anthropic-ai/sdk";

// Core structure of Claude Agent SDK
interface AgentConfig {
  // LLM configuration
  model: string;                    // Claude model to use
  maxTokens: number;                // Maximum response tokens

  // Agent configuration
  systemPrompt: string;             // Define agent role
  tools?: Tool[];                   // Available tools list

  // Execution configuration
  maxIterations?: number;           // Maximum iterations
  stopCondition?: StopCondition;    // Stop condition
}

// Tool interface used by AI Agent
interface Tool {
  name: string;                     // Tool name
  description: string;              // Tool description
  inputSchema: object;              // Input schema
  execute: (input: unknown) => Promise<unknown>;  // Execute function
}
```

Based on this Agent Architecture, we'll implement your first Agent in Claude Agent SDK. Following this Agent Architecture pattern ensures consistent code.

### Agent Execution Flow

An AI Agent doesn't follow simple request-response but has an iterative execution cycle. Claude Agent SDK manages this flow automatically.

```typescript
// AI Agent execution cycle
class AgentLoop {
  async run(initialPrompt: string): Promise<string> {
    let messages = [{ role: "user", content: initialPrompt }];

    while (true) {
      // 1. Send current state to LLM
      const response = await this.callLLM(messages);

      // 2. Check if tool call is needed
      if (response.stopReason === "tool_use") {
        // 3. Execute tool
        const toolResult = await this.executeTool(response.toolCall);

        // 4. Add result to messages
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResult });

        // 5. Continue to next iteration
        continue;
      }

      // 6. Return final response
      return response.content;
    }
  }
}
```

This agent loop is the core of Claude Agent SDK Agent Architecture. When building your first Agent, we follow this pattern.

---

## Building Your First Agent

### Basic Agent Class

With SDK installation complete, let's implement your first Agent with Claude Agent SDK. This tutorial's first Agent example represents the simplest Agent Architecture. Follow along with this hands-on tutorial to build your own agent.

```typescript
// src/basic-agent.ts
import Anthropic from "@anthropic-ai/sdk";

// Claude Agent SDK basic AI Agent implementation
class BasicAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;

  constructor(config: {
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
  }) {
    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt || "You are a friendly AI assistant.";
  }

  // AI agent chat method
  async chat(userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    // Extract response text
    const textContent = response.content.find(c => c.type === "text");
    return textContent ? textContent.text : "";
  }
}

export { BasicAgent };
```

This is your first Agent built with Claude Agent SDK. It's a basic Agent Architecture without tools or memory, but it's the starting point for first Agent development.

### Adding Conversation Features

Let's enhance the AI agent to support continuous conversation by adding conversation history. This is the first step in managing memory with Claude Agent SDK.

```typescript
// src/conversational-agent.ts
import Anthropic from "@anthropic-ai/sdk";

// Message type definition
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Conversational AI Agent - Using Claude Agent SDK
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
      "You are a friendly AI assistant. You provide helpful answers to user questions.";
  }

  // AI agent chat - maintaining history
  async chat(userMessage: string): Promise<string> {
    // Add user message
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Claude Agent SDK API call
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: this.conversationHistory,
    });

    // Extract response
    const textContent = response.content.find(c => c.type === "text");
    const assistantMessage = textContent ? textContent.text : "";

    // Add response to history
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }
}

export { ConversationalAgent, Message };
```

Now your first Agent remembers previous conversations. This first Agent built with Claude Agent SDK adds memory functionality to the Agent Architecture.

### Execution Example

Let's run your first Agent built with Claude Agent SDK. This tutorial step verifies the results of SDK installation and first Agent development. Try this example to complete the tutorial.

```typescript
// src/index.ts
import { ConversationalAgent } from "./conversational-agent";

async function main() {
  // Create AI Agent instance
  const agent = new ConversationalAgent({
    systemPrompt: `You are a TypeScript expert AI assistant.
You answer coding questions in a friendly and detailed manner.
When providing code examples, you follow best practices.`,
  });

  console.log("=== Claude Agent SDK First AI Agent ===\n");

  // First conversation
  const response1 = await agent.chat(
    "What's the difference between interfaces and types in TypeScript?"
  );
  console.log("User: What's the difference between interfaces and types in TypeScript?");
  console.log(`Agent: ${response1}\n`);

  // Second conversation (maintaining previous context)
  const response2 = await agent.chat(
    "When should I use interface vs type?"
  );
  console.log("User: When should I use interface vs type?");
  console.log(`Agent: ${response2}\n`);

  // Third conversation
  const response3 = await agent.chat(
    "Can you show me with example code?"
  );
  console.log("User: Can you show me with example code?");
  console.log(`Agent: ${response3}\n`);

  console.log("=== Conversation History ===");
  console.log(`Total ${agent.getHistory().length} messages`);
}

main().catch(console.error);
```

### How to Run

```bash
# Run TypeScript
npx ts-node src/index.ts

# Or build and run
npm run build
node dist/index.js
```

---

## System Prompt Design

### Effective System Prompts

AI Agent behavior is determined by the system prompt. In Claude Agent SDK, it's the core element that defines the AI agent's personality and capabilities.

```typescript
// System prompt templates for agent development
const systemPromptTemplates = {
  // Coding assistant AI Agent
  codingAssistant: `You are an expert software developer AI assistant.

Role:
- Code review and improvement suggestions
- Bug analysis and solutions
- Best practices guidance
- Architecture design advice

Rules:
- Always provide executable code examples
- Immediately warn about security vulnerabilities
- Include performance optimization tips
- Explain clearly and concisely`,

  // Data analysis AI Agent
  dataAnalyst: `You are a data analysis expert AI assistant.

Role:
- Data pattern analysis and insights
- Statistical analysis methodology suggestions
- Visualization strategy development
- Data quality validation

Rules:
- Always provide evidence for analysis results
- State uncertainties explicitly
- Provide Python/SQL code examples`,

  // Technical writing AI Agent
  technicalWriter: `You are a technical documentation expert AI assistant.

Role:
- API documentation
- User guides
- README and CHANGELOG
- Code comment improvements

Rules:
- Use clear and concise sentences
- Include plenty of examples
- Use consistent terminology`,
};
```

### Role-Based Agent Pattern

Here's a pattern for creating AI agents with various roles in Claude Agent SDK. We use a reusable factory pattern for agent development.

```typescript
// AI Agent factory - Create agents by role
type AgentRole = "coder" | "analyst" | "writer" | "reviewer";

function createAgent(role: AgentRole): ConversationalAgent {
  const prompts: Record<AgentRole, string> = {
    coder: `You are a skilled TypeScript/JavaScript developer.
You help with code writing, review, and debugging.`,

    analyst: `You are a data analysis expert.
You analyze data patterns and provide insights.`,

    writer: `You are a technical documentation expert.
You write clear and understandable documentation.`,

    reviewer: `You are a senior code reviewer.
You review code quality, security, and performance.`,
  };

  return new ConversationalAgent({
    systemPrompt: prompts[role],
  });
}

// Usage example
const coder = createAgent("coder");
const reviewer = createAgent("reviewer");
```

---

## Error Handling and Retry

### API Call Error Handling

In agent development with Claude Agent SDK, robust error handling is essential. For AI Agent to work reliably in production, proper error handling is necessary.

```typescript
import Anthropic from "@anthropic-ai/sdk";

// AI Agent with error handling
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

  // API call with retry logic
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
        console.warn(`Attempt ${attempt}/${this.maxRetries} failed:`, error);

        // Handle by API error type
        if (this.isRetryableError(error)) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        // Throw non-retryable errors immediately
        throw error;
      }
    }

    throw new Error(`Max retries exceeded: ${lastError?.message}`);
  }

  // Check if error is retryable
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Anthropic.RateLimitError) return true;
    if (error instanceof Anthropic.InternalServerError) return true;
    if (error instanceof Anthropic.APIConnectionError) return true;
    return false;
  }

  // Delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Project Structure

### Recommended Directory Structure

Here's the recommended structure for your first Agent project after SDK installation. With this Agent Architecture-based directory structure, you can systematically manage your first Agent code.

```
my-first-agent/
├── src/
│   ├── index.ts                 # Entry point
│   ├── agents/
│   │   ├── basic-agent.ts       # Basic AI Agent
│   │   ├── conversational.ts    # Conversational agent
│   │   └── robust-agent.ts      # With error handling
│   ├── prompts/
│   │   ├── system-prompts.ts    # System prompts collection
│   │   └── templates.ts         # Prompt templates
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       ├── config.ts            # Configuration management
│       └── logger.ts            # Logging utility
├── examples/
│   ├── basic-usage.ts           # Basic usage example
│   └── conversation-demo.ts     # Conversation demo
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

After SDK installation and first Agent implementation, using this Agent Architecture structure enables scalable project development.

---

## Summary

Here are the key concepts from this Day 1 tutorial about Claude Agent SDK and first Agent development. From SDK installation to understanding Agent Architecture, this tutorial has built the foundation for first Agent development.

1. **AI Agent Concepts**
   - LLM vs Agent differences: Autonomy, tool use, planning
   - Agent Architecture: LLM + Tools + Memory + Planning
   - Claude Agent SDK provides integrated support for this Agent Architecture

2. **Claude Agent SDK Installation** (Tutorial Complete)
   - SDK installation and npm package setup
   - Environment variable setup and API key management
   - Basic project structure for first Agent - covered in this tutorial

3. **First Agent Implementation**
   - BasicAgent: Simple request-response first Agent
   - ConversationalAgent: Maintaining conversation history
   - RobustAgent: Error handling and retry logic

4. **Agent Architecture Patterns**
   - System prompt design methods
   - Role-based Agent factory pattern
   - Error handling and retry strategies

### Claude Agent SDK Core Code Pattern

```typescript
// AI Agent basic pattern - Claude Agent SDK
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  system: "AI agent role definition",
  messages: [{ role: "user", content: "User input" }],
});
```

---

## Next Episode Preview

**Day 2: Tool Use and MCP Server Integration**

In Day 2, we'll give the AI Agent the ability to use tools:

- Execute external tools with Function Calling
- Validate tool inputs with Zod schema
- Integrate MCP servers as Agent tools
- Implement practical tools like file system and API calls

---

## References

### Tutorial Source Code
- [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Complete source code for this tutorial

### Official Documentation
- [Claude Agent SDK Overview](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)

### Series Links
- [Day 2: Tool Use & MCP Integration](/en/claude-agent-sdk-day2-tool-use-mcp)
- [Day 3: Memory & Context Management](/en/claude-agent-sdk-day3-memory-context)
- [Day 4: Multi-Agent Orchestration](/en/claude-agent-sdk-day4-multi-agent)
- [Day 5: Production Deploy & Optimization](/en/claude-agent-sdk-day5-production)

> *This series is in progress. Some links may not be active yet.*
