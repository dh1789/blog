---
title: "MCP 서버 개발 (1/5): Model Context Protocol 이해와 첫 서버 만들기"
slug: "mcp-day1-introduction-and-first-server"
excerpt: "Model Context Protocol(MCP)이 무엇인지 이해하고, TypeScript로 첫 MCP서버를 직접 만들어봅니다. TDD 방식의 유닛테스트까지 포함한 AI개발 실전 가이드. Claude Code와 AI도구 연동 방법까지 완벽 설명."
date: "2025-11-28"
author: "idongho"
categories:
  - "MCP"
  - "AI Tools"
  - "Tutorial"
tags:
  - MCP
  - Model Context Protocol
  - Claude Code
  - TypeScript
  - AI도구
  - MCP서버
  - Tool구현
  - 유닛테스트
  - TDD
  - AI개발
featured_image: ""
status: "publish"
language: "ko"
seo_title: "MCP 서버 개발 가이드: Model Context Protocol 개념부터 첫 서버 구현까지"
seo_description: "MCP(Model Context Protocol)의 핵심 개념을 이해하고 TypeScript로 첫 MCP 서버를 만드는 완벽 가이드. TDD 유닛 테스트 포함."
---

## TL;DR

**MCP(Model Context Protocol)** 는 AI도구가 외부 데이터와 기능에 접근할 수 있게 해주는 표준 프로토콜입니다. AI개발에서 가장 중요한 외부 연동 문제를 해결합니다.

**다루는 내용**
- Model Context Protocol이 왜 필요한지, 어떤 문제를 해결하는지
- Host, Client, MCP서버 아키텍처 이해
- TypeScript로 MCP서버 직접 구현과 Tool구현 방법
- TDD 방식으로 유닛테스트 작성
- Claude Code에 연동하여 AI도구로 실제 사용

**완성 코드**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - AI개발 입문자를 위한 MCP서버 튜토리얼

---

## AI도구의 한계와 Model Context Protocol의 등장

### 문제: AI는 외부 세계를 모른다

Claude나 GPT 같은 AI도구는 학습 데이터에 기반한 지식만 가지고 있습니다. 실시간 정보, 로컬 파일, 데이터베이스, 외부 API에 접근하려면 별도의 연동이 필요합니다. AI개발에서 이 문제는 핵심적인 과제입니다.

기존 방식의 한계:
- **Function Calling**: AI도구 제공자마다 다른 구현 방식
- **플러그인/확장**: 각 AI도구별로 별도 Tool구현 필요
- **커스텀 통합**: 표준 없이 개별 구현의 반복

### 해결책: Model Context Protocol(MCP)

2024년 11월 Anthropic이 발표한 Model Context Protocol은 이 문제를 해결합니다. AI도구가 외부 컨텍스트에 접근하는 **표준화된 프로토콜**을 제공합니다.

Model Context Protocol의 핵심 가치:
- **표준화**: 한 번 만든 MCP서버를 여러 AI도구에서 사용
- **유연성**: 다양한 데이터 소스와 Tool구현 연동
- **확장성**: 커뮤니티가 만든 MCP서버 생태계 활용
- **보안**: 명시적 권한 관리와 샌드박싱

---

## Model Context Protocol 핵심 아키텍처

### Host, Client, MCP서버 관계

Model Context Protocol은 세 가지 컴포넌트로 구성됩니다:

```
┌─────────────────────────────────────────────────────────┐
│                   Host (Claude Code)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Client  │  │ Client  │  │ Client  │  │ Client  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │   MCP   │  │   MCP   │  │   MCP   │  │   MCP   │
   │ Server  │  │ Server  │  │ Server  │  │ Server  │
   │ (파일)  │  │ (Git)   │  │ (API)   │  │ (DB)    │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

| 컴포넌트 | 역할 | 예시 |
|----------|------|------|
| **Host** | MCP 클라이언트를 호스팅하는 AI도구 | Claude Code, Claude Desktop |
| **Client** | MCP서버와 1:1 연결 관리 | Host 내부에서 자동 생성 |
| **MCP서버** | Tool구현을 제공하는 프로세스 | 파일 시스템, GitHub, DB 등 |

### 통신 방식: JSON-RPC 2.0

MCP는 **JSON-RPC 2.0** 프로토콜을 사용합니다. 요청과 응답이 명확하고 표준화되어 있습니다.

```json
// 요청 예시
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": { "a": 10, "b": 5, "operation": "add" }
  }
}

// 응답 예시
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "10 + 5 = 15" }]
  }
}
```

---

## MCP의 3가지 핵심 기능

MCP 서버는 세 가지 유형의 기능을 제공할 수 있습니다:

### 1. Tools: AI가 실행하는 함수

**Tool**은 AI가 호출할 수 있는 함수입니다. 계산, 파일 처리, API 호출 등 실제 작업을 수행합니다.

```typescript
// Tool 등록 예시
server.tool(
  "calculate",                    // Tool 이름
  "두 숫자의 사칙연산을 수행합니다", // 설명
  {                               // 입력 스키마 (zod)
    a: z.number(),
    b: z.number(),
    operation: z.enum(["add", "subtract", "multiply", "divide"])
  },
  async ({ a, b, operation }) => {  // 실행 함수
    // 결과 반환
  }
);
```

### 2. Resources: AI에게 제공하는 데이터

**Resource**는 AI가 참조할 수 있는 데이터입니다. 설정 파일, 문서, 상태 정보 등을 제공합니다.

```typescript
// Resource 등록 예시
server.resource(
  "config://app",           // 리소스 URI
  "애플리케이션 설정",       // 설명
  async () => ({
    contents: [{ type: "text", text: JSON.stringify(config) }]
  })
);
```

### 3. Prompts: 템플릿화된 프롬프트

**Prompt**는 미리 정의된 프롬프트 템플릿입니다. 코드 리뷰, 번역 등 반복적인 작업에 유용합니다.

```typescript
// Prompt 등록 예시
server.prompt(
  "code-review",
  "코드 리뷰를 요청합니다",
  { code: z.string() },
  async ({ code }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `다음 코드를 리뷰해주세요:\n${code}` }
    }]
  })
);
```

### 언제 어떤 기능을 사용하나?

| 기능 | 사용 시점 | 예시 |
|------|----------|------|
| **Tool** | 동작 수행 | 파일 생성, API 호출, 계산 |
| **Resource** | 데이터 참조 | 설정 파일, 문서, 상태 |
| **Prompt** | 템플릿 재사용 | 코드 리뷰, 번역 요청 |

---

## 개발 환경 준비

### 필수 도구 설치

MCP 서버 개발에 필요한 도구:

```bash
# Node.js 20+ 확인
node --version  # v20.x.x 이상

# 프로젝트 디렉토리 생성
mkdir my-first-mcp
cd my-first-mcp

# npm 초기화
npm init -y
```

### TypeScript 설정

```bash
# 의존성 설치
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node vitest
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json** 핵심 설정:
```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": { "my-first-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "inspect": "npx @modelcontextprotocol/inspector dist/index.js"
  }
}
```

---

## 첫 MCP 서버 구현

### 프로젝트 구조

TDD 원칙에 따라 테스트 가능한 구조로 설계합니다:

```
my-first-mcp/
├── src/
│   ├── index.ts      # MCP 서버 진입점
│   ├── tools.ts      # 핵심 로직 (순수 함수)
│   └── tools.test.ts # 유닛 테스트
├── dist/             # 빌드 결과물
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 핵심 로직: tools.ts

테스트 가능한 순수 함수로 핵심 로직을 분리합니다:

```typescript
// src/tools.ts

// Tool 1: 현재 시간 조회
export type TimeFormat = "full" | "date" | "time";

export interface TimeResult {
  formatted: string;
  timezone: string;
}

export function formatTime(
  date: Date,
  timezone: string = "Asia/Seoul",
  format: TimeFormat = "full"
): TimeResult {
  let options: Intl.DateTimeFormatOptions = { timeZone: timezone };

  switch (format) {
    case "date":
      options = { ...options, dateStyle: "full" };
      break;
    case "time":
      options = { ...options, timeStyle: "long" };
      break;
    case "full":
    default:
      options = { ...options, dateStyle: "full", timeStyle: "long" };
      break;
  }

  const formatted = date.toLocaleString("ko-KR", options);
  return { formatted, timezone };
}

// Tool 2: 사칙연산 계산기
export type Operation = "add" | "subtract" | "multiply" | "divide";

export interface CalculateResult {
  result: number;
  expression: string;
  isError: boolean;
  errorMessage?: string;
}

export function calculate(
  a: number,
  b: number,
  operation: Operation
): CalculateResult {
  const symbols: Record<Operation, string> = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷",
  };

  if (operation === "divide" && b === 0) {
    return {
      result: NaN,
      expression: `${a} ${symbols[operation]} ${b}`,
      isError: true,
      errorMessage: "오류: 0으로 나눌 수 없습니다.",
    };
  }

  let result: number;
  switch (operation) {
    case "add": result = a + b; break;
    case "subtract": result = a - b; break;
    case "multiply": result = a * b; break;
    case "divide": result = a / b; break;
  }

  return {
    result,
    expression: `${a} ${symbols[operation]} ${b} = ${result}`,
    isError: false,
  };
}

// Tool 3: 랜덤 숫자 생성
export function generateRandomNumbers(
  min: number,
  max: number,
  count: number = 1
) {
  if (min > max) {
    return {
      numbers: [],
      min, max,
      isError: true,
      errorMessage: "오류: 최소값이 최대값보다 큽니다.",
    };
  }

  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return { numbers, min, max, isError: false };
}

// Tool 4: 문자열 뒤집기
export function reverseString(text: string) {
  return {
    original: text,
    reversed: text.split("").reverse().join(""),
  };
}

// Tool 5: 서버 정보
export function getServerInfo() {
  return {
    name: "my-first-mcp",
    version: "1.0.0",
    description: "MCP 서버 개발 튜토리얼",
    tools: [
      "get_current_time - 현재 시간 조회",
      "calculate - 사칙연산 계산기",
      "get_random_number - 랜덤 숫자 생성",
      "reverse_string - 문자열 뒤집기",
      "get_server_info - 서버 정보 조회",
    ],
  };
}
```

### MCP 서버 진입점: index.ts

```typescript
#!/usr/bin/env node
// src/index.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
  type TimeFormat,
  type Operation,
} from "./tools.js";

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// Tool 1: 현재 시간 조회
server.tool(
  "get_current_time",
  "현재 날짜와 시간을 반환합니다. 시간대를 지정할 수 있습니다.",
  {
    timezone: z.string().optional()
      .describe("시간대 (예: Asia/Seoul, America/New_York)"),
    format: z.enum(["full", "date", "time"]).optional()
      .describe("출력 형식: full(전체), date(날짜만), time(시간만)"),
  },
  async ({ timezone, format }) => {
    const result = formatTime(
      new Date(),
      timezone || "Asia/Seoul",
      (format || "full") as TimeFormat
    );
    return {
      content: [{
        type: "text",
        text: `현재 시간 (${result.timezone}): ${result.formatted}`,
      }],
    };
  }
);

// Tool 2: 사칙연산 계산기
server.tool(
  "calculate",
  "두 숫자의 사칙연산을 수행합니다.",
  {
    a: z.number().describe("첫 번째 숫자"),
    b: z.number().describe("두 번째 숫자"),
    operation: z.enum(["add", "subtract", "multiply", "divide"])
      .describe("연산 종류"),
  },
  async ({ a, b, operation }) => {
    const result = calculate(a, b, operation as Operation);

    if (result.isError) {
      return {
        content: [{ type: "text", text: result.errorMessage! }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: result.expression }],
    };
  }
);

// Tool 3: 랜덤 숫자 생성
server.tool(
  "get_random_number",
  "지정한 범위 내에서 랜덤 정수를 생성합니다.",
  {
    min: z.number().int().describe("최소값"),
    max: z.number().int().describe("최대값"),
    count: z.number().int().min(1).max(10).optional()
      .describe("생성할 숫자 개수 (1-10)"),
  },
  async ({ min, max, count }) => {
    const result = generateRandomNumbers(min, max, count || 1);

    if (result.isError) {
      return {
        content: [{ type: "text", text: result.errorMessage! }],
        isError: true,
      };
    }

    const n = result.numbers.length;
    const text = n === 1
      ? `랜덤 숫자 (${min}~${max}): ${result.numbers[0]}`
      : `랜덤 숫자 ${n}개 (${min}~${max}): ${result.numbers.join(", ")}`;

    return { content: [{ type: "text", text }] };
  }
);

// Tool 4: 문자열 뒤집기
server.tool(
  "reverse_string",
  "입력된 문자열을 뒤집어서 반환합니다.",
  { text: z.string().min(1).describe("뒤집을 문자열") },
  async ({ text }) => {
    const result = reverseString(text);
    return {
      content: [{
        type: "text",
        text: `원본: ${result.original}\n뒤집음: ${result.reversed}`,
      }],
    };
  }
);

// Tool 5: 서버 정보
server.tool(
  "get_server_info",
  "MCP 서버 정보와 사용 가능한 Tool 목록을 반환합니다.",
  {},
  async () => {
    const info = getServerInfo();
    const text = `=== ${info.name} ===\n버전: ${info.version}\n\n사용 가능한 Tool:\n${info.tools.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
    return { content: [{ type: "text", text }] };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("my-first-mcp 서버가 시작되었습니다.");
}

main().catch((error) => {
  console.error("서버 시작 실패:", error);
  process.exit(1);
});
```

---

## TDD로 유닛테스트 작성

AI개발에서 TDD(Test-Driven Development)는 MCP서버의 Tool구현 품질을 보장하는 핵심 방법론입니다.

### TDD 원칙

**Red → Green → Refactor** 사이클로 유닛테스트를 작성합니다:
1. 실패하는 유닛테스트 작성 (Red)
2. 유닛테스트를 통과하는 최소 코드 작성 (Green)
3. 코드 개선 (Refactor)

**Tidy First** 원칙:
- 구조 변경과 동작 변경을 분리
- 구조 변경 후 유닛테스트로 검증

### vitest 설정

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

### 테스트 코드: tools.test.ts

```typescript
// src/tools.test.ts
import { describe, it, expect } from "vitest";
import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
} from "./tools.js";

describe("formatTime", () => {
  it("기본 시간대(Asia/Seoul)로 포맷팅", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate);

    expect(result.timezone).toBe("Asia/Seoul");
    expect(result.formatted).toContain("2025");
  });

  it("커스텀 시간대 지원", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "America/New_York");

    expect(result.timezone).toBe("America/New_York");
  });

  it("날짜만 출력", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "Asia/Seoul", "date");

    expect(result.formatted).toContain("2025");
    expect(result.formatted).not.toContain("시");
  });
});

describe("calculate", () => {
  it("덧셈 계산", () => {
    const result = calculate(123, 456, "add");

    expect(result.result).toBe(579);
    expect(result.expression).toBe("123 + 456 = 579");
    expect(result.isError).toBe(false);
  });

  it("0으로 나누기 에러 처리", () => {
    const result = calculate(100, 0, "divide");

    expect(result.isError).toBe(true);
    expect(result.errorMessage).toBe("오류: 0으로 나눌 수 없습니다.");
  });

  it("곱셈 계산", () => {
    const result = calculate(15, 8, "multiply");

    expect(result.result).toBe(120);
    expect(result.expression).toBe("15 × 8 = 120");
  });
});

describe("generateRandomNumbers", () => {
  it("범위 내 랜덤 숫자 생성", () => {
    const result = generateRandomNumbers(1, 10);

    expect(result.numbers).toHaveLength(1);
    expect(result.numbers[0]).toBeGreaterThanOrEqual(1);
    expect(result.numbers[0]).toBeLessThanOrEqual(10);
  });

  it("여러 개 랜덤 숫자 생성 (로또)", () => {
    const result = generateRandomNumbers(1, 45, 6);

    expect(result.numbers).toHaveLength(6);
    result.numbers.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(45);
    });
  });

  it("min > max 에러 처리", () => {
    const result = generateRandomNumbers(100, 10);

    expect(result.isError).toBe(true);
    expect(result.errorMessage).toContain("최소값이 최대값보다");
  });
});

describe("reverseString", () => {
  it("영문 문자열 뒤집기", () => {
    const result = reverseString("hello");
    expect(result.reversed).toBe("olleh");
  });

  it("한글 문자열 뒤집기", () => {
    const result = reverseString("안녕");
    expect(result.reversed).toBe("녕안");
  });

  it("특수문자 포함 뒤집기", () => {
    const result = reverseString("Hello MCP!");
    expect(result.reversed).toBe("!PCM olleH");
  });
});

describe("getServerInfo", () => {
  it("서버 이름과 버전 반환", () => {
    const info = getServerInfo();

    expect(info.name).toBe("my-first-mcp");
    expect(info.version).toBe("1.0.0");
  });

  it("5개 Tool 목록 포함", () => {
    const info = getServerInfo();

    expect(info.tools).toHaveLength(5);
    expect(info.tools.some(t => t.includes("calculate"))).toBe(true);
  });
});
```

### 유닛테스트 실행

```bash
# 유닛테스트 실행
npm test

# 결과
# ✓ src/tools.test.ts (31 tests) 18ms
# Test Files  1 passed (1)
# Tests       31 passed (31)
```

TDD 방식으로 작성한 31개의 유닛테스트가 모든 Tool구현을 검증합니다. AI개발에서 이런 유닛테스트는 MCP서버의 안정성을 보장합니다.

---

## MCP Inspector로 MCP서버 테스트

MCP Inspector는 MCP서버의 Tool구현을 테스트하는 공식 AI도구입니다.

### Inspector 실행

AI개발과 TDD 과정에서 MCP Inspector는 필수 도구입니다. Claude Code와 같은 AI도구에 연결하기 전에 먼저 Inspector로 테스트합니다.

```bash
# 빌드
npm run build

# Inspector 실행
npm run inspect
# 또는
npx @modelcontextprotocol/inspector dist/index.js
```

브라우저에서 `http://localhost:6274`에 접속하면 MCP Inspector UI가 열립니다.

![MCP Inspector UI](./images/mcp-day1/mcp-inspector-ui.jpg)

### Inspector에서 테스트

1. **Tool 목록 확인**: 등록된 5개 Tool 확인
2. **Tool 호출**: calculate Tool로 `123 + 456` 계산
3. **응답 확인**: `123 + 456 = 579` 결과 확인

![MCP Inspector Tool List](./images/mcp-day1/mcp-inspector-tools-list.jpg)

---

## Claude Code AI도구에 연동

### MCP서버 등록

TDD로 유닛테스트와 Inspector 테스트를 완료했다면 Claude Code AI도구에 연동할 준비가 되었습니다.

```bash
# Claude Code AI도구에 MCP서버 추가
claude mcp add my-first-mcp -- node /path/to/my-first-mcp/dist/index.js

# 연결 상태 확인
claude mcp list
# my-first-mcp: ✓ Connected
```

### 프로젝트별 자동 연결 (.mcp.json)

프로젝트에 `.mcp.json` 파일을 추가하면 Claude Code가 자동으로 MCP 서버를 감지합니다:

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {}
    }
  }
}
```

프로젝트 디렉토리에 진입하면 자동 감지 다이얼로그가 표시됩니다:

![MCP Auto Detection](./images/mcp-day1/mcp-auto-detection-dialog.jpg)

### 실제 사용 예시

Claude Code에서 MCP Tool을 사용할 수 있습니다:

![Claude Code Calculate Demo](./images/mcp-day1/claude-code-calculate-demo.jpg)

```
사용자: "123 더하기 456 계산해줘"
Claude: [calculate Tool 호출: a=123, b=456, operation="add"]
       123 + 456 = 579 입니다.
```

---

## 정리

### 배운 내용

1. **Model Context Protocol 개념**: AI도구가 외부 데이터에 접근하는 표준 프로토콜
2. **아키텍처**: Host → Client → MCP서버 구조, JSON-RPC 2.0 통신
3. **3가지 기능**: Tool구현(함수), Resources(데이터), Prompts(템플릿)
4. **MCP서버 구현**: TypeScript + @modelcontextprotocol/sdk + zod
5. **TDD 유닛테스트**: 순수 함수 분리 → 유닛테스트 → 리팩토링

AI개발에서 Model Context Protocol은 필수 기술이 되어가고 있습니다. 이번 포스트에서 학습한 MCP서버와 Tool구현 방법을 활용하여 다양한 AI도구를 만들어보세요.

### 프로젝트 구조

```
my-first-mcp/
├── src/
│   ├── index.ts      # MCP서버 (Handler)
│   ├── tools.ts      # Tool구현 로직 (Pure Functions)
│   └── tools.test.ts # 유닛테스트 (31 tests)
├── dist/
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 주요 명령어

```bash
npm run build     # TypeScript 빌드
npm test          # 유닛테스트 실행 (31 tests)
npm run inspect   # MCP Inspector로 Tool구현 테스트
claude mcp add    # Claude Code AI도구에 MCP서버 등록
```

---

## 다음 편 예고

**Day 2: 실전 MCP서버 - 프로젝트 분석 AI도구**

- 파일 시스템 접근하는 Tool구현
- Resource로 프로젝트 설정 제공
- Prompt 템플릿 활용
- 실제 프로젝트 분석 자동화

AI개발과 Model Context Protocol에 관심 있으신 분들은 다음 포스트도 기대해주세요!

---

## 참고 자료

### 공식 문서
- [MCP 공식 스펙](https://modelcontextprotocol.io/specification)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [예제 서버](https://github.com/anthropics/mcp-servers)

### 도구
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

*이 글은 MCP 서버 개발 시리즈의 첫 번째 포스트입니다. 질문이나 피드백은 댓글로 남겨주세요!*
