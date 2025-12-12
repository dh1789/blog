---
title: "Claude Agent SDK Day 5: 프로덕션 배포와 최적화"
slug: "claude-agent-sdk-day5-production"
excerpt: "AI Agent를 프로덕션 환경에 배포하는 방법과 최적화 전략을 알아봅니다. Claude Agent SDK를 활용한 에러 처리, 모니터링, 비용 최적화, 보안 고려사항을 실제 코드로 구현합니다."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Production"
  - "프로덕션 배포"
  - "AI Agent"
  - "최적화"
language: "ko"
---

## TL;DR

Claude Agent SDK 시리즈의 마지막 포스트입니다. AI Agent를 프로덕션 환경에 안전하게 배포하기 위한 핵심 패턴 5가지를 구현합니다.

**이번 포스트에서 구현할 내용:**
- **CircuitBreaker**: 연속 실패 시 시스템 보호하는 회로 차단기 패턴
- **AgentLogger**: 구조화된 JSON 로깅과 민감 정보 마스킹
- **CostTracker**: 토큰 사용량 및 비용 실시간 추적
- **InputValidator**: 프롬프트 인젝션 방어를 포함한 입력 검증
- **ProductionAgent**: 위 모든 기능을 통합한 프로덕션 레디 Agent

**GitHub 저장소**: [my-first-agent](https://github.com/dh1789/my-first-agent) - Day 5 코드 포함

---

## 왜 프로덕션 배포가 중요한가?

개발 환경에서 잘 동작하는 AI Agent가 프로덕션 환경에서 문제를 일으키는 경우가 많습니다. Claude Agent SDK를 사용하더라도 프로덕션 배포 없이는 실제 서비스를 운영할 수 없습니다.

**프로덕션 환경에서 발생하는 주요 문제:**

1. **API 장애**: Claude API 서버 다운타임, Rate Limit 초과
2. **비용 폭증**: 예상치 못한 토큰 사용량 증가로 청구 비용 급증
3. **보안 취약점**: 프롬프트 인젝션 공격, 민감 정보 노출
4. **디버깅 어려움**: 로그 부재로 문제 원인 파악 불가
5. **성능 저하**: 응답 지연, 메모리 누수

이번 Day 5에서는 Claude Agent SDK 기반 AI Agent를 프로덕션 환경에 안전하게 배포하기 위한 최적화 전략을 다룹니다.

---

## 1. 에러 처리와 회로 차단기 (CircuitBreaker)

프로덕션 환경에서 가장 중요한 것은 **장애 대응**입니다. Claude API가 일시적으로 응답하지 않을 때, 계속 요청을 보내면 상황이 악화됩니다.

### 회로 차단기 패턴

회로 차단기(CircuitBreaker)는 연속적인 실패를 감지하여 시스템을 보호합니다.

**상태 전이:**
- **Closed (닫힘)**: 정상 상태, 모든 요청 허용
- **Open (열림)**: 장애 상태, 모든 요청 차단
- **Half-Open (반열림)**: 복구 시도, 일부 요청만 허용

```typescript
/**
 * CircuitBreaker - 회로 차단기 패턴
 *
 * AI Agent 프로덕션 배포에서 필수적인 장애 대응 패턴입니다.
 */

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold?: number;  // 실패 임계치 (기본: 5)
  successThreshold?: number;  // 복구 임계치 (기본: 2)
  timeout?: number;           // 복구 대기 시간 (기본: 30초)
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
   * 요청 실행 가능 여부 확인
   */
  canExecute(): boolean {
    if (this.state === "closed") return true;

    if (this.state === "open") {
      // 타임아웃 경과 시 half-open으로 전이
      if (this.nextAttempt && new Date() >= this.nextAttempt) {
        this.state = "half-open";
        return true;
      }
      return false;
    }

    return true; // half-open
  }

  /**
   * 성공 기록
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
   * 실패 기록
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
   * 함수 실행 래핑
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error("회로가 열려있습니다. 잠시 후 재시도하세요.");
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

### 지수 백오프 재시도

Claude API 호출 실패 시 바로 재시도하지 않고, 점점 긴 간격으로 재시도합니다.

```typescript
/**
 * 지수 백오프 재시도 로직
 *
 * AI Agent 프로덕션 배포에서 Rate Limit 대응에 필수입니다.
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

      // 지수 백오프 + 지터
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("최대 재시도 횟수 초과");
}

function isRetryableError(error: unknown): boolean {
  const err = error as { status?: number; name?: string };
  // Rate Limit (429) 또는 서버 에러 (500+)
  return err.status === 429 || (err.status && err.status >= 500);
}
```

---

## 2. 모니터링과 로깅 (AgentLogger)

프로덕션 환경에서 AI Agent의 모든 활동을 추적해야 합니다. Claude Agent SDK 사용 시 로깅은 최적화와 디버깅에 필수입니다.

### 구조화된 JSON 로깅

```typescript
/**
 * AgentLogger - 구조화된 로깅 시스템
 *
 * AI Agent 프로덕션 배포에서 Monitoring 필수 컴포넌트입니다.
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

// 민감한 데이터 패턴 정의
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
   * 요청 추적 ID 설정
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * 로그 기록
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
    console.log(JSON.stringify(entry)); // 프로덕션에서는 로그 수집기로 전송
  }

  /**
   * 응답 로깅 (토큰, 지연 포함)
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
   * 민감 정보 마스킹
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

**Monitoring 출력 예시:**
```json
{"timestamp":"2024-12-12T10:30:00.000Z","level":"info","message":"Request completed in 1523ms","agentId":"prod-agent-123","requestId":"req-abc123","duration":1523,"tokens":{"input":150,"output":350}}
```

---

## 3. 비용 최적화 (CostTracker)

Claude API 사용 비용을 실시간으로 추적하지 않으면 청구서에 놀랄 수 있습니다. Cost Optimization은 AI Agent 프로덕션 배포에서 빠뜨릴 수 없는 요소입니다.

### 토큰 사용량 및 비용 추적

```typescript
/**
 * CostTracker - 비용 추적 시스템
 *
 * Claude Agent SDK 기반 AI Agent의 Cost Optimization 핵심입니다.
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model: string;
  timestamp: Date;
}

// Claude 모델별 가격 (USD per 1M tokens)
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
   * 사용량 기록
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
   * 총 비용 조회
   */
  getTotalCost(): number {
    return this.usageHistory.reduce((sum, u) => sum + u.estimatedCost, 0);
  }

  /**
   * 예산 확인 및 알림
   */
  private checkBudget(): void {
    if (!this.budgetLimit || !this.onBudgetAlert) return;

    const currentCost = this.getTotalCost();
    if (currentCost >= this.budgetLimit * 0.8) {
      this.onBudgetAlert(currentCost, this.budgetLimit);
    }
  }

  /**
   * 비용 요약
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

### 비용 최적화 전략

AI Agent 프로덕션 배포 시 비용 최적화 방법:

1. **모델 선택 최적화**: 간단한 작업은 Haiku, 복잡한 작업은 Sonnet
2. **응답 캐싱**: 동일 질문에 캐시된 응답 반환
3. **토큰 제한**: max_tokens 적절히 설정
4. **예산 알림**: 임계치 도달 시 알림

---

## 4. 보안: 입력 검증 (InputValidator)

AI Agent 프로덕션 배포에서 **보안**은 최우선입니다. 프롬프트 인젝션 공격을 방어해야 합니다.

### 프롬프트 인젝션 방어

```typescript
/**
 * InputValidator - 입력 검증 시스템
 *
 * AI Agent 프로덕션 배포에서 보안의 첫 번째 방어선입니다.
 */

// 금지 패턴: 프롬프트 인젝션 시도
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
   * 입력 검증
   */
  validate(input: string): ValidationResult {
    const errors: string[] = [];

    // null/빈 문자열 체크
    if (!input || input.trim().length === 0) {
      return { isValid: false, errors: ["입력이 비어있습니다."] };
    }

    // 길이 체크
    if (input.length > this.maxLength) {
      errors.push(`입력이 너무 깁니다. (최대 ${this.maxLength}자)`);
    }

    // 금지 패턴 체크
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(input)) {
        errors.push("금지된 패턴이 감지되었습니다.");
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
   * 입력 정제
   */
  private sanitize(input: string): string {
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // 제어 문자 제거
      .replace(/\s+/g, " ") // 연속 공백 정리
      .trim();
  }
}
```

---

## 5. ProductionAgent: 모든 것을 통합

지금까지 구현한 모든 기능을 통합한 **ProductionAgent**입니다. Claude Agent SDK를 활용한 프로덕션 레디 AI Agent입니다.

```typescript
/**
 * ProductionAgent - 프로덕션 레디 AI Agent
 *
 * Claude Agent SDK 기반 AI Agent 프로덕션 배포의 완성형입니다.
 * 에러 처리, Monitoring, Cost Optimization, 보안이 모두 통합되어 있습니다.
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
      "죄송합니다. 현재 요청을 처리할 수 없습니다.";
  }

  /**
   * 프로덕션 레벨 대화 실행
   */
  async chat(userMessage: string): Promise<string> {
    const requestId = `req-${Date.now()}`;
    this.logger.setRequestId(requestId);
    const startTime = Date.now();

    try {
      // 1. 입력 검증
      const validation = this.validator.validate(userMessage);
      if (!validation.isValid) {
        this.logger.log("warn", "입력 검증 실패", { errors: validation.errors });
        return this.fallbackResponse;
      }

      // 2. 회로 차단기 확인
      if (!this.circuitBreaker.canExecute()) {
        this.logger.log("warn", "회로 열림 - Fallback 반환");
        return this.fallbackResponse;
      }

      // 3. API 호출
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [{ role: "user", content: userMessage }],
      });

      // 4. 성공 처리
      this.circuitBreaker.recordSuccess();

      // 5. 비용 추적
      this.costTracker.trackUsage(
        "claude-sonnet-4-5-20250929",
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      // 6. 로깅
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
   * 메트릭 조회
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

### 사용 예제

```typescript
import { ProductionAgent } from "my-first-agent";

const agent = new ProductionAgent({
  systemPrompt: "당신은 친절한 AI 어시스턴트입니다.",
  fallbackResponse: "서비스 일시 중지 중입니다.",
});

// 프로덕션 환경에서 안전하게 대화
const response = await agent.chat("TypeScript의 장점이 뭐야?");
console.log(response);

// 메트릭 확인
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

## 프로덕션 배포 체크리스트

Claude Agent SDK 기반 AI Agent를 프로덕션 환경에 배포하기 전 확인해야 할 사항입니다.

### 필수 항목

- [ ] **에러 처리**: CircuitBreaker, 지수 백오프 재시도
- [ ] **Monitoring**: 구조화된 로깅, 메트릭 수집
- [ ] **Cost Optimization**: 토큰 추적, 예산 알림
- [ ] **보안**: 입력 검증, 민감 정보 마스킹
- [ ] **Fallback**: 장애 시 대체 응답

### 권장 항목

- [ ] **환경 변수**: API 키 하드코딩 금지
- [ ] **Rate Limiting**: 사용자별 요청 제한
- [ ] **테스트**: 단위/통합 테스트 작성
- [ ] **문서화**: API 문서, 운영 매뉴얼

---

## 시리즈 마무리

Claude Agent SDK 시리즈 5일 과정을 모두 완료했습니다!

### 학습 내용 정리

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | Agent 개념과 아키텍처 | BasicAgent, ConversationalAgent |
| Day 2 | Tool Use와 MCP 연동 | ToolAgent, MCP Bridge |
| Day 3 | 메모리와 컨텍스트 관리 | MemoryAgent, 3계층 메모리 |
| Day 4 | 멀티 에이전트 오케스트레이션 | CodeReviewSystem, Pipeline 패턴 |
| Day 5 | 프로덕션 배포와 최적화 | ProductionAgent, 보안/비용/모니터링 |

### 전체 코드

**GitHub 저장소**: [my-first-agent](https://github.com/dh1789/my-first-agent)

```bash
# 설치
git clone https://github.com/dh1789/my-first-agent.git
cd my-first-agent
npm install

# 테스트 실행
npm test  # 178개 테스트 통과

# 예제 실행
npx ts-node examples/day5-production-demo.ts
```

Claude Agent SDK를 활용하여 AI Agent를 개발하고 프로덕션 배포까지 완료할 수 있는 기반을 마련했습니다. 이제 여러분만의 AI Agent를 만들어보세요!

---

## 시리즈 네비게이션

- [Day 1: Agent 개념과 아키텍처](/ko/claude-agent-sdk-day1-introduction)
- [Day 2: 도구 사용과 MCP 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)
- [Day 3: 메모리와 컨텍스트 관리](/ko/claude-agent-sdk-day3-memory-context)
- [Day 4: 멀티 에이전트 오케스트레이션](/ko/claude-agent-sdk-day4-multi-agent)
- **Day 5: 프로덕션 배포와 최적화** (현재 글)
