---
title: "Claude Agent SDK Day 3: Memory and Context Management"
slug: "claude-agent-sdk-day3-memory-context-en"
excerpt: "Learn AI Agent memory systems and context management strategies. Build personalized AI agents with conversation history, long-term memory, and state management using Claude Agent SDK."
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
  - State Management
  - TypeScript
  - AI Development
  - LLM Memory
featured_image: ""
status: "publish"
language: "en"
seo_title: "Claude Agent SDK Memory Guide: Complete Agent Memory and Context Management Tutorial"
seo_description: "Implement AI Agent memory systems with Claude Agent SDK. Learn Short-term Memory, Long-term Memory, Working Memory concepts and context management strategies with TypeScript code examples."
---

> **🌐 Translation**: Translated from [Korean](/ko/claude-agent-sdk-day3-memory-context).

## TL;DR

With **Claude Agent SDK**'s **Agent Memory** system, your **AI Agent** can remember conversation context and provide personalized experiences through **LLM Memory** management. Day 3 covers **Context Management** strategies and **State Management** techniques for **AI Development**, implementing a fully-featured **AI Agent** with **TypeScript**.

What you'll learn:
- **Agent Memory** types: Short-term, Long-term, Working Memory roles and **LLM Memory** implementation
- **Context Management**: Token limit handling and summarization strategies for **AI Development**
- **State Management** patterns: Session state and user preference storage for personalized **AI Agent**
- Practical implementation of **Agent Memory** and **LLM Memory** systems with **Claude Agent SDK** and **TypeScript**
- **Context Management** optimization techniques for modern **AI Development**

**Full Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent) - Claude Agent SDK Agent Memory Tutorial

**Series**: [Day 1: Agent Concepts](/en/claude-agent-sdk-day1-introduction-en) | [Day 2: Tool Use and MCP](/en/claude-agent-sdk-day2-tool-use-mcp-en) | **Day 3: Memory and Context** (current) | [Day 4: Multi-Agent](/en/claude-agent-sdk-day4-multi-agent-en) | [Day 5: Production](/en/claude-agent-sdk-day5-production-en)

> *Series in progress. Some links may not be active yet.*

---

## Why Memory Matters for AI Agents

### The Need for Agent Memory in AI Development

The basic **AI Agent** from Day 1 processed each request independently. However, real **AI Development** experiences require **AI Agent** to remember previous conversations through **LLM Memory**, learn user preferences, and perform **Context Management** for ongoing tasks. **Agent Memory** transforms an **AI Agent** from a simple response generator to a true assistant in modern **AI Development**.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Agent Memory System Architecture               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   │
│   │ Short-term    │   │ Long-term     │   │ Working       │   │
│   │ Memory        │   │ Memory        │   │ Memory        │   │
│   │ (History)     │   │ (Persistent)  │   │ (Context)     │   │
│   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   │
│           │                   │                   │           │
│           └───────────────────┼───────────────────┘           │
│                               ▼                               │
│                     ┌─────────────────┐                       │
│                     │    AI Agent     │                       │
│                     │ (State Manager) │                       │
│                     └─────────────────┘                       │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

Implementing **Agent Memory** and **LLM Memory** with **Claude Agent SDK** enables your **AI Agent** to:

- **Conversation Continuity**: Natural **Context Management** by remembering previous Q&A through **LLM Memory**
- **Personalization**: Custom responses through **State Management** and user preferences in **AI Development**
- **Task Tracking**: Handle complex tasks by maintaining ongoing work context with **LLM Memory**

### Three Types of Agent Memory for AI Development

**AI Agent** **Agent Memory** divides into three types similar to human memory, enabling effective **LLM Memory** management. **Claude Agent SDK** lets you implement each **Agent Memory** type in **TypeScript** for professional **AI Development**.

| Memory Type | Characteristics | **State Management** | **Context Management** Use |
|-------------|-----------------|---------------------|---------------------------|
| **Short-term Memory** | Volatile, session-limited | Array/List | Conversation history |
| **Long-term Memory** | Persistent, cross-session | File/DB | User info, preferences |
| **Working Memory** | Current task context | Temp storage | Ongoing tasks |

---

## Implementing Short-term Memory

### Conversation History Management for LLM Memory

**Short-term Memory** stores the current session's conversation history as **LLM Memory**. It's the foundational **Agent Memory** type for **Context Management** in **Claude Agent SDK** **AI Development**.

```typescript
// src/memory/conversation-memory.ts
import type { Message } from "../types/index.js";

/**
 * ConversationMemory - Short-term Memory for conversation history
 *
 * Core Agent Memory component for Context Management.
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
   * Add a message to history.
   */
  add(message: Message): void {
    this.messages.push(message);
    this.trim();
  }

  /**
   * Add a user message.
   */
  addUserMessage(content: string): void {
    this.add({ role: "user", content });
  }

  /**
   * Add an assistant message.
   */
  addAssistantMessage(content: string): void {
    this.add({ role: "assistant", content });
  }

  /**
   * Return full history.
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Return last N messages.
   */
  getRecentMessages(count: number): Message[] {
    return this.messages.slice(-count);
  }

  /**
   * Estimate token count.
   */
  estimateTokens(): number {
    const totalChars = this.messages.reduce((sum, msg) => {
      return sum + (typeof msg.content === "string" ? msg.content.length : 0);
    }, 0);
    return Math.ceil(totalChars / 4);
  }

  /**
   * Compress history based on token/message limits.
   * Core Context Management logic.
   */
  private trim(): void {
    // Message count limit
    while (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    // Token limit (remove oldest messages)
    while (this.estimateTokens() > this.maxTokens && this.messages.length > 2) {
      this.messages.shift();
    }
  }

  /**
   * Clear history.
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Return Agent Memory stats.
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

### Context Management: Token Limit Handling

**Context Management** is essential in **Claude Agent SDK**. LLM context windows are limited, so **Agent Memory** can't grow indefinitely. Use sliding window for efficient **State Management** in **AI Agent**.

```typescript
/**
 * Sliding Window Context Management Strategy
 *
 * Optimizes AI Agent Context Management.
 */
class SlidingWindowMemory extends ConversationMemory {
  /**
   * Compress Agent Memory with conversation summary.
   */
  async compress(
    summarizer: (messages: Message[]) => Promise<string>
  ): Promise<void> {
    if (this.getMessages().length < 10) return;

    const messages = this.getMessages();
    // Keep last 4 messages, summarize the rest
    const toSummarize = messages.slice(0, -4);
    const toKeep = messages.slice(-4);

    const summary = await summarizer(toSummarize);

    this.clear();
    this.add({ role: "assistant", content: `[Previous Conversation Summary]\n${summary}` });
    toKeep.forEach((msg) => this.add(msg));
  }
}
```

**Context Management** summarization strategy greatly improves **AI Agent** **Agent Memory** and **LLM Memory** efficiency. Combined with **State Management** in **Claude Agent SDK**, it becomes even more effective for **AI Development**.

---

## Implementing Long-term Memory

### State Management with Persistent Storage for AI Development

**Long-term Memory** is **Agent Memory** that persists across sessions, essential for **LLM Memory** management. It's the core **State Management** system that makes **AI Agent** "remember" users in **AI Development** projects.

```typescript
// src/memory/persistent-memory.ts
import * as fs from "fs/promises";

/**
 * PersistentMemory - File-based Long-term Memory
 *
 * Persistent storage for AI Agent State Management.
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
   * Load Agent Memory from file.
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
   * Save Agent Memory to file.
   */
  async save(): Promise<void> {
    const obj = Object.fromEntries(this.data);
    await fs.writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf-8");
  }

  /**
   * Store a value.
   */
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
    if (this.autoSave) await this.save();
  }

  /**
   * Retrieve a value.
   */
  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * Store namespaced value.
   * Example: setNested("user.preferences.theme", "dark")
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
   * Retrieve namespaced value.
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

### User Preference State Management for LLM Memory

Implement a **State Management** helper class for **AI Agent** personalization using **LLM Memory**. This pattern combines **Agent Memory** with **Context Management** in **Claude Agent SDK** for effective **AI Development**.

```typescript
/**
 * UserPreferences - State Management helper for user preferences
 *
 * Enables personalized Context Management for AI Agent.
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
    return this.getPreference<string>("language") || "en";
  }
}
```

---

## Working Memory and MemoryAgent Integration

### Working Memory: Current Task Context Management with LLM Memory

**Working Memory** handles **Context Management** for ongoing tasks as part of **LLM Memory** strategy. It's valid only within a session and stores intermediate states when **AI Agent** processes complex tasks in **AI Development**.

### Complete MemoryAgent Implementation for AI Development

Implement a **MemoryAgent** that integrates all three **Agent Memory** types with comprehensive **LLM Memory** support. This **AI Agent** utilizes all **Context Management** features of **Claude Agent SDK** for modern **AI Development**.

```typescript
// src/agents/memory-agent.ts
import Anthropic from "@anthropic-ai/sdk";
import { ConversationMemory } from "../memory/conversation-memory.js";
import { PersistentMemory, UserPreferences } from "../memory/persistent-memory.js";

/**
 * MemoryAgentConfig - Memory AI Agent configuration
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
 * MemoryAgent - AI Agent with integrated Agent Memory and Context Management
 *
 * Core implementation for Claude Agent SDK Day 3.
 * - Short-term Memory: Conversation history (ConversationMemory)
 * - Long-term Memory: Persistent storage (PersistentMemory)
 * - Working Memory: Current session context
 */
export class MemoryAgent {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string;

  // Agent Memory systems
  private conversationMemory: ConversationMemory;
  private persistentMemory: PersistentMemory;
  private userPreferences: UserPreferences;

  // Working Memory (current session State Management)
  private workingContext: Map<string, unknown> = new Map();

  constructor(config: MemoryAgentConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.model = config.model || "claude-sonnet-4-5-20250929";
    this.systemPrompt = config.systemPrompt ||
      "You are a personalized AI assistant that remembers user preferences and previous conversations.";

    // Initialize Agent Memory
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
   * Load persistent Agent Memory.
   */
  async initialize(): Promise<void> {
    await this.persistentMemory.load();
  }

  /**
   * Extend system prompt with Context Management info.
   */
  private buildContextualSystemPrompt(): string {
    const parts = [this.systemPrompt];

    // Apply user preferences (State Management)
    const language = this.userPreferences.getLanguage();
    if (language) {
      parts.push(`\nUser language preference: ${language}`);
    }

    // Apply Working Memory (Context Management)
    const currentTask = this.workingContext.get("currentTask");
    if (currentTask) {
      parts.push(`\nCurrent task: ${currentTask}`);
    }

    // Apply user info from Long-term Memory
    const userName = this.persistentMemory.getNested<string>("user.name");
    if (userName) {
      parts.push(`\nUser name: ${userName}`);
    }

    return parts.join("");
  }

  /**
   * Generate response to user message.
   */
  async chat(userMessage: string): Promise<string> {
    // Add to Short-term Memory
    this.conversationMemory.addUserMessage(userMessage);

    // Build Context Management-based system prompt
    const contextualPrompt = this.buildContextualSystemPrompt();

    // Call Claude API
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: contextualPrompt,
      messages: this.conversationMemory.getMessages(),
    });

    // Extract response
    const textContent = response.content.find((c) => c.type === "text");
    const assistantMessage = textContent && "text" in textContent
      ? textContent.text
      : "";

    // Add response to Short-term Memory
    this.conversationMemory.addAssistantMessage(assistantMessage);

    return assistantMessage;
  }

  /**
   * Compress Agent Memory (Context Management)
   */
  async compressMemory(): Promise<void> {
    await this.conversationMemory.compress(async (messages) => {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        system: "Summarize the following conversation in 3-4 sentences with key points.",
        messages: [{
          role: "user",
          content: messages.map((m) => `${m.role}: ${m.content}`).join("\n\n"),
        }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      return textContent && "text" in textContent ? textContent.text : "";
    });
  }

  // === Working Memory (State Management) ===

  setWorkingContext(key: string, value: unknown): void {
    this.workingContext.set(key, value);
  }

  getWorkingContext<T>(key: string): T | undefined {
    return this.workingContext.get(key) as T | undefined;
  }

  setCurrentTask(task: string): void {
    this.setWorkingContext("currentTask", task);
  }

  // === Long-term Memory (State Management) ===

  async setUserInfo(key: string, value: unknown): Promise<void> {
    await this.persistentMemory.setNested(`user.${key}`, value);
  }

  getUserInfo<T>(key: string): T | undefined {
    return this.persistentMemory.getNested<T>(`user.${key}`);
  }

  // === Agent Memory Stats ===

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

## Practical Example: Personalized AI Agent

### MemoryAgent Usage Example

Here's how to use the **Agent Memory** system from **Claude Agent SDK** to build a personalized **AI Agent**.

```typescript
// examples/day3-memory-demo.ts
import { MemoryAgent } from "../src/agents/memory-agent.js";

async function main() {
  console.log("🧠 Day 3: Agent Memory and Context Management Demo");

  const agent = new MemoryAgent({
    systemPrompt: "You are a personalized AI assistant that remembers user names and preferences.",
    persistentMemoryPath: ".my-agent-memory.json",
    maxMessages: 20,
  });

  // Initialize Agent Memory
  await agent.initialize();

  // Store user info in Long-term Memory (State Management)
  await agent.setUserInfo("name", "John");
  await agent.setPreference("responseStyle", "concise");

  // Set current task in Working Memory (Context Management)
  agent.setCurrentTask("TypeScript learning");

  console.log("Agent Memory Stats:", agent.getMemoryStats());

  // Start conversation - AI Agent uses user info
  const response1 = await agent.chat("Hi! Do you remember my name?");
  console.log("AI Agent:", response1);

  // Follow-up - Context Management maintains context
  const response2 = await agent.chat("Explain TypeScript generics please.");
  console.log("AI Agent:", response2);

  // Compress Agent Memory (after long conversations)
  await agent.compressMemory();
}

main();
```

### Agent Memory System Usage Scenarios

Real scenarios using **Agent Memory** and **Context Management** from **Claude Agent SDK**.

```
User: Hello!
AI Agent: Hello, John! Would you like to continue learning TypeScript today?
         (Using name from Long-term Memory, task from Working Memory)

User: Summarize what we learned last time
AI Agent: In our last session, we covered the differences between interfaces and types.
         (Using Agent Memory summarization)

User: Today I want to learn generics
AI Agent: Sure, I've updated your current task to 'generics learning'.
         (Working Memory State Management)
```

---

## Context Management Optimization Strategies

### Token-Efficient Context Management

Strategies to improve **Context Management** efficiency for **AI Agent**. Methods to optimize **Agent Memory** in **Claude Agent SDK**.

| Strategy | Description | **State Management** Effect |
|----------|-------------|---------------------------|
| **Sliding Window** | Auto-remove old messages | Limit token usage |
| **Summary Compression** | Replace content with summary | Preserve context + save tokens |
| **Selective Loading** | Load only needed **Agent Memory** | Improve response speed |
| **Hierarchical Storage** | **State Management** by importance | Efficient retrieval |

### State Management Best Practices

**State Management** best practices for **AI Agent** **AI Development**. Build stable **Agent Memory** systems with **Claude Agent SDK** and **TypeScript**.

1. **Memory Separation**: Clearly separate Short-term, Long-term, Working
2. **Auto Cleanup**: Set **Context Management** thresholds for auto-compression
3. **Persistence Strategy**: Save important **State Management** data immediately
4. **Error Handling**: Graceful degradation on **Agent Memory** load/save failures

---

## Next Steps

In Day 3, we implemented **Agent Memory** and **Context Management** systems for **Claude Agent SDK**. Your **AI Agent** can now remember conversation context and provide personalized experiences.

**Day 4 Preview: Multi-Agent Orchestration**

- Build systems where multiple **AI Agent**s collaborate
- Supervisor, Peer-to-Peer, Pipeline patterns
- **Agent Memory** sharing and **State Management** synchronization
- Implement a code review **AI Agent** system

**Full Series Code**: [GitHub: my-first-agent](https://github.com/dh1789/my-first-agent)

---

## References

### Official Documentation
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [Context Window Management](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)

### Related Posts
- [Day 1: Agent Concepts and First Agent](/en/claude-agent-sdk-day1-introduction-en)
- [Day 2: Tool Use and MCP Server Integration](/en/claude-agent-sdk-day2-tool-use-mcp-en)

---

## Series Navigation

- [Day 1: Agent Concepts and Architecture](/en/claude-agent-sdk-day1-introduction-en)
- [Day 2: Tool Use and MCP Integration](/en/claude-agent-sdk-day2-tool-use-mcp-en)
- **Day 3: Memory and Context Management** (current)
- [Day 4: Multi-Agent Orchestration](/en/claude-agent-sdk-day4-multi-agent-en)
- [Day 5: Production Deployment and Optimization](/en/claude-agent-sdk-day5-production-en)
