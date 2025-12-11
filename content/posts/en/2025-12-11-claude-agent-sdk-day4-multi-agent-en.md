---
title: "Claude Agent SDK Day 4: Multi-Agent Orchestration"
slug: "claude-agent-sdk-day4-multi-agent-en"
excerpt: "Build Multi Agent systems where multiple AI Agents collaborate. Implement Supervisor, Pipeline, and Peer-to-Peer Orchestration patterns with Claude Agent SDK and create a code review Multi Agent system."
date: "2025-12-11"
author: "idongho"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - Claude Agent SDK
  - Multi Agent
  - Orchestration
  - AI Agent
  - TypeScript
featured_image: ""
status: "publish"
language: "en"
seo_title: "Claude Agent SDK Multi Agent Guide: Complete Orchestration Tutorial"
seo_description: "Build Multi Agent systems with Claude Agent SDK. Learn Supervisor, Pipeline, Peer-to-Peer Orchestration patterns and implement a code review AI Agent system in TypeScript."
---

> **🌐 Translation**: Translated from [Korean](/ko/claude-agent-sdk-day4-multi-agent).

## TL;DR

**Claude Agent SDK**'s **Multi Agent** systems enable multiple **AI Agents** to collaborate on complex tasks. In Day 4, we learn **Orchestration** patterns and implement a code review **Multi Agent** system in **TypeScript**.

What you'll learn:
- **Multi Agent** Architecture: Scaling from single **AI Agent** to collaborative agent systems
- **Orchestration** Patterns: Differences between Supervisor, Pipeline, and Peer-to-Peer patterns
- **AI Agent** Communication: Message passing and state sharing for collaborative agents
- Practical implementation of a code review **Multi Agent** system using **Claude Agent SDK** and **TypeScript**
- **Orchestration** optimization and agent system debugging techniques

**Full Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Multi Agent Tutorial

**Series**: [Day 1: Agent Concepts](/en/claude-agent-sdk-day1-introduction-en) | [Day 2: Tool Use and MCP](/en/claude-agent-sdk-day2-tool-use-mcp-en) | [Day 3: Memory and Context](/en/claude-agent-sdk-day3-memory-context-en) | **Day 4: Multi Agent** (Current) | [Day 5: Production Deployment](/en/claude-agent-sdk-day5-production-en)

> *Series in progress. Some links may not be active yet.*

---

## Why Multi Agent?

### Limitations of Single AI Agent

The single **AI Agent** we built in Days 1-3 can handle various tasks but has limitations. It's difficult for one **AI Agent** to possess all expertise. **Claude Agent SDK**'s **Multi Agent** system solves this problem.

```
┌─────────────────────────────────────────────────────────────────────┐
│              Single Agent vs Multi Agent Comparison                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Single Agent                      Multi Agent System              │
│   ┌─────────────┐                ┌─────────────────────────────┐   │
│   │             │                │   ┌───────┐  ┌───────┐       │   │
│   │  All tasks  │                │   │Analyzer│  │Reviewer│      │   │
│   │  One Agent  │                │   └───┬───┘  └───┬───┘       │   │
│   │  handles    │                │       │          │           │   │
│   │             │      →         │       ▼          ▼           │   │
│   └─────────────┘                │   ┌─────────────────┐        │   │
│                                  │   │   Orchestrator   │        │   │
│   - Context limits               │   └─────────────────┘        │   │
│   - Distributed expertise        │   │                          │   │
│   - Maintenance difficulty       │   - Specialized AI Agents    │   │
│                                  │   - Parallel processing       │   │
│                                  │   - Scalability               │   │
│                                  └─────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Benefits of **Multi Agent** Architecture:

- **Specialization**: Each **AI Agent** focuses on specific roles for higher quality
- **Parallel Processing**: Multiple **AI Agents** work simultaneously for faster processing
- **Scalability**: Easy to extend functionality by adding new specialized agents
- **Maintainability**: Each **AI Agent** can be improved independently

### Multi Agent Use Scenarios

Scenarios where **Claude Agent SDK**'s **Multi Agent** system is effective:

| Scenario | **Multi Agent** Configuration | **Orchestration** Pattern |
|---------|---------------------|----------------------|
| Code Review | Analyzer, Reviewer, Summarizer | Pipeline |
| Customer Support | Classifier, Expert, QA | Supervisor |
| Document Writing | Researcher, Writer, Editor | Pipeline |
| Data Analysis | Collector, Analyst, Visualizer | Peer-to-Peer |

---

## Orchestration Patterns

### Supervisor Pattern

**Supervisor Pattern** uses a central coordinator to manage multiple **AI Agents**. It's the most common **Orchestration** pattern in **Claude Agent SDK**.

```typescript
// src/agents/orchestration/supervisor-orchestrator.ts
import Anthropic from "@anthropic-ai/sdk";

/**
 * SupervisorOrchestrator - Central coordination Multi Agent Orchestration
 *
 * Supervisor Pattern: One coordinator manages multiple AI Agents.
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
   * Register an AI Agent.
   */
  registerAgent(name: string, config: AgentConfig): void {
    this.agents.set(name, config);
  }

  /**
   * Analyze task and select appropriate Multi Agent.
   */
  private async selectAgent(task: string): Promise<string> {
    const agentList = Array.from(this.agents.entries())
      .map(([name, config]) => `- ${name}: ${config.description}`)
      .join("\n");

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 100,
      system: `You are a Multi Agent system Supervisor.
Analyze the task and select the most appropriate AI Agent.
Available agents:
${agentList}

Return only the agent name.`,
      messages: [{ role: "user", content: task }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    return textContent && "text" in textContent
      ? textContent.text.trim()
      : "default";
  }

  /**
   * Delegate task to selected AI Agent.
   */
  private async delegateToAgent(agentName: string, task: string): Promise<string> {
    const config = this.agents.get(agentName);
    if (!config) {
      throw new Error(`AI Agent not found: ${agentName}`);
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
   * Execute Orchestration: Analyze task and delegate to appropriate Multi Agent
   */
  async orchestrate(task: string): Promise<OrchestratorResult> {
    console.log("🎯 Starting Supervisor Orchestration...");

    // 1. Select appropriate AI Agent
    const selectedAgent = await this.selectAgent(task);
    console.log(`✅ Selected AI Agent: ${selectedAgent}`);

    // 2. Delegate to selected Multi Agent
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

### Pipeline Pattern

**Pipeline Pattern** processes tasks sequentially through **AI Agents**. It's effective for **Multi Agent** **Orchestration** when data processing flow is clear.

```typescript
// src/agents/orchestration/pipeline-orchestrator.ts

/**
 * PipelineOrchestrator - Sequential processing Multi Agent Orchestration
 *
 * Pipeline Pattern: AI Agents process tasks in order and pass results.
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
   * Add a pipeline stage (AI Agent).
   */
  addStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  /**
   * Execute the pipeline.
   * Each Multi Agent processes tasks sequentially.
   */
  async execute(input: string): Promise<PipelineResult> {
    console.log("🔄 Starting Pipeline Orchestration...");

    let currentInput = input;
    const stageResults: StageResult[] = [];

    for (const stage of this.stages) {
      console.log(`▶️ Executing stage: ${stage.name}`);

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

      // Pass to next AI Agent as input
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

### Peer-to-Peer Pattern

**Peer-to-Peer Pattern** allows **AI Agents** to communicate directly with each other. Use it for **Multi Agent** **Orchestration** when collaboration without central coordination is needed.

```typescript
// src/agents/orchestration/peer-orchestrator.ts

/**
 * PeerOrchestrator - Distributed collaboration Multi Agent Orchestration
 *
 * Peer-to-Peer Pattern: AI Agents communicate directly and collaborate.
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
   * Register a Peer AI Agent.
   */
  registerPeer(peer: PeerAgent): void {
    this.peers.set(peer.id, peer);
  }

  /**
   * Send message between AI Agents.
   */
  sendMessage(from: string, to: string, content: string): void {
    this.messageQueue.push({ from, to, content, timestamp: Date.now() });
  }

  /**
   * Process messages for a specific Multi Agent.
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

Received message: You received a message from ${msg.from}.`,
        messages: [{ role: "user", content: msg.content }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      if (textContent && "text" in textContent) {
        responses.push(textContent.text);
      }
    }

    // Remove processed messages
    this.messageQueue = this.messageQueue.filter((m) => m.to !== peerId);

    return responses;
  }

  /**
   * Execute Peer-to-Peer Orchestration.
   * Multi Agents process messages in round-robin fashion.
   */
  async orchestrate(initialTask: string, initiatorId: string, rounds: number = 3): Promise<PeerResult> {
    console.log("🔀 Starting Peer-to-Peer Orchestration...");

    // Send initial task to first AI Agent
    const peerIds = Array.from(this.peers.keys());
    const nextPeerId = peerIds.find((id) => id !== initiatorId) || peerIds[0];
    this.sendMessage("system", nextPeerId, initialTask);

    const allResponses: PeerResponse[] = [];

    for (let round = 0; round < rounds; round++) {
      console.log(`🔄 Round ${round + 1}/${rounds}`);

      for (const peerId of peerIds) {
        const responses = await this.processMessages(peerId);

        for (const response of responses) {
          allResponses.push({ peerId, response, round });

          // Share response with other AI Agents
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

### Orchestration Pattern Selection Guide

Criteria for selecting **Orchestration** patterns in **Multi Agent** systems:

| Pattern | Features | Suitable **Multi Agent** Scenarios |
|------|------|----------------------------|
| **Supervisor** | Central coordination, flexible routing | Diverse task types requiring dynamic selection |
| **Pipeline** | Sequential processing, clear flow | Workflows with defined processing stages |
| **Peer-to-Peer** | Distributed collaboration, discussion-style | Brainstorming, consensus building |

---

## Practical: Code Review Multi Agent System

### System Architecture

Implementing a real code review **Multi Agent** system with **Claude Agent SDK**. We use Pipeline **Orchestration** pattern.

```
┌─────────────────────────────────────────────────────────────────────┐
│                 Code Review Multi Agent System                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Input Code                                                        │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────┐                                                   │
│   │   Analyzer   │  - Code structure analysis                       │
│   │  AI Agent    │  - Complexity evaluation                         │
│   └──────┬──────┘  - Potential issue identification                │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │   Reviewer   │  - Code quality assessment                       │
│   │  AI Agent    │  - Security review                               │
│   └──────┬──────┘  - Improvement suggestions                       │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │  Summarizer  │  - Consolidate review results                    │
│   │ Multi Agent  │  - Priority organization                         │
│   └──────┬──────┘  - Actionable feedback                           │
│          │                                                          │
│          ▼                                                          │
│   Final Review Report                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Code Review Multi Agent Implementation

Implementing the **AI Agent** system with **Claude Agent SDK**'s Pipeline **Orchestration**.

```typescript
// src/agents/code-review-system.ts
import Anthropic from "@anthropic-ai/sdk";

/**
 * CodeReviewSystem - Code Review Multi Agent System
 *
 * Core implementation of Claude Agent SDK Day 4.
 * Three AI Agents collaborate to review code using Pipeline pattern.
 */
export class CodeReviewSystem {
  private client: Anthropic;
  private model: string;

  // Multi Agent system prompts
  private readonly agents = {
    analyzer: `You are a senior code analyst.
Analyze the submitted code and provide:
1. Code structure analysis (functions, classes, module structure)
2. Complexity evaluation (cyclomatic complexity, cognitive complexity)
3. Potential issue identification (bug possibilities, anti-patterns)

Provide analysis results in a structured format.`,

    reviewer: `You are a senior code reviewer.
Based on the previous analysis, review the code:
1. Code quality assessment (readability, maintainability)
2. Security vulnerability review (OWASP criteria)
3. Performance optimization suggestions
4. Specific improvement code examples

Provide detailed review results.`,

    summarizer: `You are a technical documentation summary expert.
Synthesize the analysis and review results into a final report:
1. Key findings (3-5 items)
2. Improvement items by priority
3. Immediate action items
4. Long-term improvement plan

Write so that both executives and developers can understand.`,
  };

  constructor(config?: { apiKey?: string; model?: string }) {
    this.client = new Anthropic({
      apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = config?.model || "claude-sonnet-4-5-20250929";
  }

  /**
   * Execute an AI Agent.
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
   * Execute Multi Agent code review.
   *
   * Pipeline Orchestration:
   * 1. Analyzer AI Agent: Code structure analysis
   * 2. Reviewer AI Agent: Quality and security review
   * 3. Summarizer Multi Agent: Final report writing
   */
  async review(code: string, context?: string): Promise<CodeReviewResult> {
    console.log("🔍 Starting Code Review Multi Agent System...");

    const input = context
      ? `## Context\n${context}\n\n## Code\n\`\`\`\n${code}\n\`\`\``
      : `## Code\n\`\`\`\n${code}\n\`\`\``;

    // Step 1: Analyzer AI Agent
    console.log("📊 Step 1: Running Analyzer AI Agent...");
    const analysis = await this.runAgent("analyzer", input);

    // Step 2: Reviewer AI Agent
    console.log("🔎 Step 2: Running Reviewer AI Agent...");
    const reviewInput = `## Original Code\n\`\`\`\n${code}\n\`\`\`\n\n## Analysis Results\n${analysis}`;
    const review = await this.runAgent("reviewer", reviewInput);

    // Step 3: Summarizer Multi Agent
    console.log("📝 Step 3: Running Summarizer Multi Agent...");
    const summaryInput = `## Analysis Results\n${analysis}\n\n## Review Results\n${review}`;
    const summary = await this.runAgent("summarizer", summaryInput);

    console.log("✅ Code Review Multi Agent System Complete!");

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

### Usage Example

How to use the **Multi Agent** code review system:

```typescript
// examples/day4-code-review-demo.ts
import { CodeReviewSystem } from "../src/agents/code-review-system.js";

async function main() {
  console.log("🤖 Day 4: Multi Agent Code Review Demo");

  const system = new CodeReviewSystem();

  // Code to review
  const codeToReview = `
function processUser(data) {
  // Direct SQL query generation (security risk!)
  const query = "SELECT * FROM users WHERE id = " + data.id;

  // No error handling
  const result = db.query(query);

  // Nested loops (performance issue)
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].orders.length; j++) {
      console.log(result[i].orders[j]);
    }
  }

  return result;
}
`;

  // Execute Multi Agent code review
  const result = await system.review(codeToReview, "User data processing function");

  console.log("\n=== Analysis Results ===");
  console.log(result.analysis);

  console.log("\n=== Review Results ===");
  console.log(result.review);

  console.log("\n=== Final Summary ===");
  console.log(result.summary);

  console.log(`\nOrchestration Pattern: ${result.orchestrationPattern}`);
  console.log(`Number of AI Agents used: ${result.agentCount}`);
}

main();
```

---

## Multi Agent Communication Patterns

### Message-Based Communication

The foundation of **AI Agent** communication is message passing. Communication patterns used in **Claude Agent SDK**'s **Multi Agent** systems:

```typescript
/**
 * AgentMessage - Message format between Multi Agents
 */
interface AgentMessage {
  id: string;
  from: string;        // Sending AI Agent
  to: string;          // Receiving AI Agent
  type: MessageType;   // Message type
  content: string;     // Message content
  metadata?: Record<string, unknown>;
  timestamp: number;
}

type MessageType = "request" | "response" | "notification" | "error";

/**
 * MessageBus - Multi Agent Message Bus
 *
 * Handles message routing between AI Agents.
 */
class MessageBus {
  private handlers: Map<string, MessageHandler[]> = new Map();

  /**
   * Register message handler for an AI Agent.
   */
  subscribe(agentId: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(agentId) || [];
    handlers.push(handler);
    this.handlers.set(agentId, handlers);
  }

  /**
   * Publish message to Multi Agents.
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

### State Sharing Pattern

Pattern for **Multi Agents** to share state. Used for **AI Agent** data synchronization in **Orchestration**.

```typescript
/**
 * SharedState - Multi Agent Shared State
 *
 * Safely share state between AI Agents.
 */
class SharedState {
  private state: Map<string, unknown> = new Map();
  private locks: Set<string> = new Set();

  /**
   * Read state (without lock).
   */
  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  /**
   * Update state (with lock).
   */
  async update<T>(key: string, updater: (current: T | undefined) => T): Promise<void> {
    // Simple lock implementation (more sophisticated implementation needed in practice)
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

## Orchestration Optimization

Optimization strategies to maximize performance of **Claude Agent SDK**'s **Multi Agent** systems.

### Parallel Execution Strategy

Improving performance by running **AI Agents** in parallel in **Multi Agent** systems using **Claude Agent SDK**.

```typescript
/**
 * Parallel Multi Agent Execution
 *
 * Execute independent AI Agents simultaneously.
 */
async function parallelExecution(tasks: AgentTask[]): Promise<AgentResult[]> {
  return Promise.all(tasks.map((task) => executeAgent(task)));
}

// Usage example
const tasks = [
  { agentId: "analyzer", input: code },
  { agentId: "security-checker", input: code },
  { agentId: "performance-analyzer", input: code },
];

// Three AI Agents execute simultaneously
const results = await parallelExecution(tasks);
```

### Error Handling and Recovery

Robust error handling strategies for **Multi Agent** **Orchestration** using **Claude Agent SDK**.

```typescript
/**
 * Resilient Multi Agent Execution
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
      console.error(`AI Agent ${agentId} failed (attempt ${attempt + 1})`);

      if (attempt === options.retries - 1 && options.fallbackAgent) {
        console.log(`Using fallback AI Agent: ${options.fallbackAgent}`);
        return await executeAgent({ agentId: options.fallbackAgent, input });
      }
    }
  }

  throw new Error(`Multi Agent execution failed: ${agentId}`);
}
```

---

## Next Steps

In Day 4, we implemented **Claude Agent SDK**'s **Multi Agent** system and **Orchestration** patterns. We learned how multiple **AI Agents** collaborate to handle complex tasks.

**Day 5 Preview: Production Deployment and Optimization**

- **AI Agent** error handling and recovery strategies
- **Multi Agent** monitoring and logging
- Cost optimization and token management
- **Multi Agent** security considerations
- Production **Orchestration** checklist

**Full Series Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent)

---

## References

### Official Documentation
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [Multi-Agent Systems Design](https://docs.anthropic.com/en/docs/build-with-claude/multi-agent)

## Series Navigation

- [Day 1: Agent Concepts and Architecture](/en/claude-agent-sdk-day1-introduction-en)
- [Day 2: Tool Use and MCP Integration](/en/claude-agent-sdk-day2-tool-use-mcp-en)
- [Day 3: Memory and Context Management](/en/claude-agent-sdk-day3-memory-context-en)
- **Day 4: Multi Agent Orchestration** (Current)
- [Day 5: Production Deployment and Optimization](/en/claude-agent-sdk-day5-production-en)
