---
title: "Claude Agent SDK Day 5: Production Deployment and Optimization"
slug: "claude-agent-sdk-day5-production-en"
excerpt: "Learn how to deploy AI Agents to production environments with optimization strategies. Implement error handling, monitoring, cost optimization, and security considerations using Claude Agent SDK."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Production"
  - "Production Deployment"
  - "AI Agent"
  - "Optimization"
language: "en"
---

> **Translation**: This post was translated from the [Korean version](/ko/claude-agent-sdk-day5-production).

## TL;DR

This is the final post in the Claude Agent SDK series. We implement 5 essential patterns and optimization strategies for safely deploying AI Agents to production environments.

**What we'll implement:**
- **CircuitBreaker**: Circuit breaker pattern to protect the system during continuous failures
- **AgentLogger**: Structured JSON logging with sensitive data masking
- **CostTracker**: Real-time token usage and cost tracking
- **InputValidator**: Input validation including prompt injection defense
- **ProductionAgent**: Production-ready Agent integrating all features above

**GitHub Repository**: [my-first-agent](https://github.com/dh1789/my-first-agent) - Includes Day 5 code

---

## Why Production Deployment Matters

AI Agents that work well in development environments often cause problems in production. Even with Claude Agent SDK, you cannot run actual services without proper production deployment optimization.

**Major problems in production environments:**

1. **API Failures**: Claude API server downtime, Rate Limit exceeded
2. **Cost Explosion**: Unexpected token usage increase leading to billing surges
3. **Security Vulnerabilities**: Prompt injection attacks, sensitive data exposure
4. **Debugging Difficulties**: Unable to identify root causes due to lack of logs
5. **Performance Degradation**: Response delays, memory leaks

In this Day 5, we cover optimization strategies for safely deploying Claude Agent SDK-based AI Agents to production environments with cost optimization methods.

---

## 1. Error Handling and Circuit Breaker

The most important thing in production deployment is **failure response**. When Claude API temporarily doesn't respond, continuing to send requests makes the situation worse.

### Circuit Breaker Pattern

The CircuitBreaker detects continuous failures and protects the system.

**State Transitions:**
- **Closed**: Normal state, all requests allowed
- **Open**: Failure state, all requests blocked
- **Half-Open**: Recovery attempt, only some requests allowed

```typescript
/**
 * CircuitBreaker - Circuit Breaker Pattern
 *
 * Essential failure response pattern for AI Agent production deployment.
 */

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold?: number;  // Failure threshold (default: 5)
  successThreshold?: number;  // Recovery threshold (default: 2)
  timeout?: number;           // Recovery wait time (default: 30s)
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successes = 0;
  private nextAttempt: Date | null = null;

  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.successThreshold = config.successThreshold ?? 2;
    this.timeout = config.timeout ?? 30000;
  }

  /**
   * Check if request can be executed
   */
  canExecute(): boolean {
    if (this.state === "closed") return true;

    if (this.state === "open") {
      // Transition to half-open when timeout elapses
      if (this.nextAttempt && new Date() >= this.nextAttempt) {
        this.state = "half-open";
        return true;
      }
      return false;
    }

    return true; // half-open
  }

  /**
   * Record success
   */
  recordSuccess(): void {
    this.successes++;

    if (this.state === "half-open" && this.successes >= this.successThreshold) {
      this.state = "closed";
      this.failures = 0;
      this.successes = 0;
    }
  }

  /**
   * Record failure
   */
  recordFailure(): void {
    this.failures++;

    if (this.state === "closed" && this.failures >= this.failureThreshold) {
      this.state = "open";
      this.nextAttempt = new Date(Date.now() + this.timeout);
    }

    if (this.state === "half-open") {
      this.state = "open";
      this.nextAttempt = new Date(Date.now() + this.timeout);
    }
  }

  /**
   * Wrap function execution
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error("Circuit is open. Please retry later.");
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}
```

### Exponential Backoff Retry

When Claude API calls fail, instead of retrying immediately, retry with progressively longer intervals.

```typescript
/**
 * Exponential Backoff Retry Logic
 *
 * Essential for Rate Limit handling in AI Agent production deployment.
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Maximum retry attempts exceeded");
}

function isRetryableError(error: unknown): boolean {
  const err = error as { status?: number; name?: string };
  // Rate Limit (429) or server error (500+)
  return err.status === 429 || (err.status && err.status >= 500);
}
```

---

## 2. Monitoring and Logging (AgentLogger)

You must track all activities of AI Agents in production environments. Logging is essential for optimization and debugging when using Claude Agent SDK.

### Structured JSON Logging

```typescript
/**
 * AgentLogger - Structured Logging System
 *
 * Essential Monitoring component for AI Agent production deployment.
 */

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  agentId?: string;
  requestId?: string;
  duration?: number;
  tokens?: { input: number; output: number };
  metadata?: Record<string, unknown>;
}

// Define sensitive data patterns
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
];

export class AgentLogger {
  private logs: LogEntry[] = [];
  private requestId: string | null = null;
  private readonly agentId: string;
  private readonly maskSensitiveData: boolean;

  constructor(config: { agentId?: string; maskSensitiveData?: boolean } = {}) {
    this.agentId = config.agentId || `agent-${Date.now()}`;
    this.maskSensitiveData = config.maskSensitiveData ?? true;
  }

  /**
   * Set request tracking ID
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Record log
   */
  log(level: LogEntry["level"], message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      agentId: this.agentId,
      requestId: this.requestId || undefined,
      metadata: this.maskSensitiveData ? this.maskSensitive(metadata) : metadata,
    };

    this.logs.push(entry);
    console.log(JSON.stringify(entry)); // Send to log collector in production
  }

  /**
   * Log response (including tokens, latency)
   */
  logResponse(duration: number, tokens: { input: number; output: number }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message: `Request completed in ${duration}ms`,
      agentId: this.agentId,
      requestId: this.requestId || undefined,
      duration,
      tokens,
    };

    this.logs.push(entry);
    console.log(JSON.stringify(entry));
  }

  /**
   * Mask sensitive information
   */
  private maskSensitive(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return undefined;

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

      if (isSensitive && typeof value === "string") {
        masked[key] = value.length > 8
          ? value.slice(0, 4) + "****" + value.slice(-4)
          : "****";
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}
```

**Monitoring output example:**
```json
{"timestamp":"2024-12-12T10:30:00.000Z","level":"info","message":"Request completed in 1523ms","agentId":"prod-agent-123","requestId":"req-abc123","duration":1523,"tokens":{"input":150,"output":350}}
```

---

## 3. Cost Optimization (CostTracker)

If you don't track Claude API usage costs in real-time, you might be surprised by the bill. Cost Optimization is an essential element in AI Agent production deployment.

### Token Usage and Cost Tracking

```typescript
/**
 * CostTracker - Cost Tracking System
 *
 * Core component for Cost Optimization in Claude Agent SDK-based AI Agents.
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model: string;
  timestamp: Date;
}

// Claude model pricing (USD per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "claude-3-opus-20240229": { input: 15.0, output: 75.0 },
};

export class CostTracker {
  private usageHistory: TokenUsage[] = [];
  private budgetLimit: number | null;
  private onBudgetAlert: ((current: number, limit: number) => void) | null;

  constructor(config: { budgetLimit?: number; onBudgetAlert?: (current: number, limit: number) => void } = {}) {
    this.budgetLimit = config.budgetLimit ?? null;
    this.onBudgetAlert = config.onBudgetAlert ?? null;
  }

  /**
   * Record usage
   */
  trackUsage(model: string, inputTokens: number, outputTokens: number): TokenUsage {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["claude-sonnet-4-5-20250929"];

    const estimatedCost =
      (inputTokens / 1_000_000) * pricing.input +
      (outputTokens / 1_000_000) * pricing.output;

    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      estimatedCost,
      model,
      timestamp: new Date(),
    };

    this.usageHistory.push(usage);
    this.checkBudget();

    return usage;
  }

  /**
   * Get total cost
   */
  getTotalCost(): number {
    return this.usageHistory.reduce((sum, u) => sum + u.estimatedCost, 0);
  }

  /**
   * Check budget and alert
   */
  private checkBudget(): void {
    if (!this.budgetLimit || !this.onBudgetAlert) return;

    const currentCost = this.getTotalCost();
    if (currentCost >= this.budgetLimit * 0.8) {
      this.onBudgetAlert(currentCost, this.budgetLimit);
    }
  }

  /**
   * Get cost summary
   */
  getSummary() {
    return {
      totalInputTokens: this.usageHistory.reduce((sum, u) => sum + u.inputTokens, 0),
      totalOutputTokens: this.usageHistory.reduce((sum, u) => sum + u.outputTokens, 0),
      totalCost: this.getTotalCost(),
      requestCount: this.usageHistory.length,
    };
  }
}
```

### Cost Optimization Strategies

Cost optimization methods for AI Agent production deployment:

1. **Model Selection Optimization**: Use Haiku for simple tasks, Sonnet for complex tasks
2. **Response Caching**: Return cached responses for identical questions
3. **Token Limiting**: Set max_tokens appropriately
4. **Budget Alerts**: Notify when threshold is reached

---

## 4. Security: Input Validation (InputValidator)

**Security** is the top priority in AI Agent production deployment. You must defend against prompt injection attacks.

### Prompt Injection Defense

```typescript
/**
 * InputValidator - Input Validation System
 *
 * First line of defense for security in AI Agent production deployment.
 */

// Forbidden patterns: prompt injection attempts
const FORBIDDEN_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all)\s+(instructions?|prompts?)/i,
  /disregard\s+(previous|all)\s+(instructions?|prompts?)/i,
  /reveal\s+(your|the)\s+system\s+prompt/i,
  /you\s+are\s+now\s+a/i,
  /pretend\s+(to\s+be|you\s+are)/i,
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedInput?: string;
}

export class InputValidator {
  private maxLength: number;
  private forbiddenPatterns: RegExp[];

  constructor(config: { maxLength?: number } = {}) {
    this.maxLength = config.maxLength ?? 100000;
    this.forbiddenPatterns = FORBIDDEN_PATTERNS;
  }

  /**
   * Validate input
   */
  validate(input: string): ValidationResult {
    const errors: string[] = [];

    // Check null/empty string
    if (!input || input.trim().length === 0) {
      return { isValid: false, errors: ["Input is empty."] };
    }

    // Check length
    if (input.length > this.maxLength) {
      errors.push(`Input is too long. (Maximum ${this.maxLength} characters)`);
    }

    // Check forbidden patterns
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(input)) {
        errors.push("Forbidden pattern detected.");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedInput: this.sanitize(input),
    };
  }

  /**
   * Sanitize input
   */
  private sanitize(input: string): string {
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
      .replace(/\s+/g, " ") // Clean consecutive whitespace
      .trim();
  }
}
```

---

## 5. ProductionAgent: Integrating Everything

Here is the **ProductionAgent** that integrates all the features we've implemented. This is a production-ready AI Agent utilizing Claude Agent SDK.

```typescript
/**
 * ProductionAgent - Production-Ready AI Agent
 *
 * The complete form of AI Agent production deployment based on Claude Agent SDK.
 * Error handling, Monitoring, Cost Optimization, and security are all integrated.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AgentLogger } from "../utils/logger.js";
import { CostTracker } from "../utils/cost-tracker.js";
import { InputValidator } from "../utils/input-validator.js";
import { CircuitBreaker } from "../utils/circuit-breaker.js";

export interface ProductionAgentConfig {
  systemPrompt?: string;
  maxRetries?: number;
  fallbackResponse?: string;
}

export class ProductionAgent {
  private client: Anthropic;
  private logger: AgentLogger;
  private costTracker: CostTracker;
  private validator: InputValidator;
  private circuitBreaker: CircuitBreaker;
  private fallbackResponse: string;

  constructor(config: ProductionAgentConfig = {}) {
    this.client = new Anthropic();
    this.logger = new AgentLogger({ agentId: `prod-${Date.now()}` });
    this.costTracker = new CostTracker();
    this.validator = new InputValidator();
    this.circuitBreaker = new CircuitBreaker();
    this.fallbackResponse = config.fallbackResponse ??
      "Sorry, we cannot process your request at this time.";
  }

  /**
   * Execute production-level conversation
   */
  async chat(userMessage: string): Promise<string> {
    const requestId = `req-${Date.now()}`;
    this.logger.setRequestId(requestId);
    const startTime = Date.now();

    try {
      // 1. Input validation
      const validation = this.validator.validate(userMessage);
      if (!validation.isValid) {
        this.logger.log("warn", "Input validation failed", { errors: validation.errors });
        return this.fallbackResponse;
      }

      // 2. Check circuit breaker
      if (!this.circuitBreaker.canExecute()) {
        this.logger.log("warn", "Circuit open - returning fallback");
        return this.fallbackResponse;
      }

      // 3. API call
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [{ role: "user", content: userMessage }],
      });

      // 4. Handle success
      this.circuitBreaker.recordSuccess();

      // 5. Track cost
      this.costTracker.trackUsage(
        "claude-sonnet-4-5-20250929",
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      // 6. Logging
      this.logger.logResponse(Date.now() - startTime, {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      });

      const textContent = response.content.find(c => c.type === "text");
      return textContent && "text" in textContent ? textContent.text : "";

    } catch (error) {
      this.circuitBreaker.recordFailure();
      this.logger.log("error", (error as Error).message);
      return this.fallbackResponse;
    }
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const cost = this.costTracker.getSummary();
    return {
      ...cost,
      circuitState: this.circuitBreaker.getState(),
    };
  }
}
```

### Usage Example

```typescript
import { ProductionAgent } from "my-first-agent";

const agent = new ProductionAgent({
  systemPrompt: "You are a friendly AI assistant.",
  fallbackResponse: "Service temporarily unavailable.",
});

// Safe conversation in production environment
const response = await agent.chat("What are the benefits of TypeScript?");
console.log(response);

// Check metrics
console.log(agent.getMetrics());
// {
//   totalInputTokens: 150,
//   totalOutputTokens: 350,
//   totalCost: 0.0057,
//   requestCount: 1,
//   circuitState: "closed"
// }
```

---

## Production Deployment Checklist

Items to verify before deploying Claude Agent SDK-based AI Agents to production environments.

### Required Items

- [ ] **Error Handling**: CircuitBreaker, exponential backoff retry
- [ ] **Monitoring**: Structured logging, metrics collection
- [ ] **Cost Optimization**: Token tracking, budget alerts
- [ ] **Security**: Input validation, sensitive data masking
- [ ] **Fallback**: Alternative response during failures

### Recommended Items

- [ ] **Environment Variables**: Never hardcode API keys
- [ ] **Rate Limiting**: Limit requests per user
- [ ] **Testing**: Write unit/integration tests
- [ ] **Documentation**: API docs, operations manual

---

## Series Conclusion

We have completed the entire 5-day Claude Agent SDK series!

### Learning Summary

| Day | Topic | Key Content |
|-----|-------|-------------|
| Day 1 | Agent Concepts and Architecture | BasicAgent, ConversationalAgent |
| Day 2 | Tool Use and MCP Integration | ToolAgent, MCP Bridge |
| Day 3 | Memory and Context Management | MemoryAgent, 3-tier Memory |
| Day 4 | Multi-Agent Orchestration | CodeReviewSystem, Pipeline Pattern |
| Day 5 | Production Deployment and Optimization | ProductionAgent, Security/Cost/Monitoring |

### Complete Code

**GitHub Repository**: [my-first-agent](https://github.com/dh1789/my-first-agent)

```bash
# Install
git clone https://github.com/dh1789/my-first-agent.git
cd my-first-agent
npm install

# Run tests
npm test  # 178 tests pass

# Run example
npx ts-node examples/day5-production-demo.ts
```

With Claude Agent SDK, we have established the foundation to develop AI Agents and complete production deployment. Now create your own AI Agent!

---

## Series Navigation

- [Day 1: Agent Concepts and Architecture](/en/claude-agent-sdk-day1-introduction-en)
- [Day 2: Tool Use and MCP Integration](/en/claude-agent-sdk-day2-tool-use-mcp-en)
- [Day 3: Memory and Context Management](/en/claude-agent-sdk-day3-memory-context-en)
- [Day 4: Multi-Agent Orchestration](/en/claude-agent-sdk-day4-multi-agent-en)
- **Day 5: Production Deployment and Optimization** (Current)
