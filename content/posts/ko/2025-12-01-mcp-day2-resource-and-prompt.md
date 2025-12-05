---
title: "MCP 서버 개발 (2/5): Resource와 Prompt 구현 완벽 가이드"
slug: "mcp-day2-resource-and-prompt"
excerpt: "MCP서버의 핵심 기능인 Resource와 Prompt를 TypeScript로 직접 구현합니다. 정적 Resource부터 동적 템플릿까지, 실전 예제와 함께 MCP 개발 완벽 마스터. Claude Code에서 실제 사용하는 방법까지 단계별로 설명합니다."
date: "2025-12-01"
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
  - MCP서버
  - Resource구현
  - Prompt구현
  - AI개발
  - MCP개발
  - AI도구
featured_image: ""
status: "publish"
language: "ko"
seo_title: "MCP Resource와 Prompt 구현 가이드: TypeScript로 MCP 서버 완성하기"
seo_description: "MCP 서버의 Resource와 Prompt를 TypeScript로 구현하는 완벽 가이드. 정적/동적 Resource, Prompt 템플릿까지 실전 예제 포함."
---

## TL;DR

**MCP(Model Context Protocol)** 서버는 Tool 외에도 **Resource** 와 **Prompt** 기능을 제공합니다. 이 글에서는 MCP서버에 Resource구현과 Prompt구현을 추가하는 방법을 다룹니다. AI개발에서 Model Context Protocol의 전체 기능을 활용하려면 이 세 가지를 모두 이해해야 합니다.

이 글에서 배우는 것:
- MCP개발 핵심 - Resource구현으로 AI도구에 데이터 제공하기
- MCP개발 핵심 - Prompt구현으로 재사용 가능한 템플릿 만들기
- 정적 Resource와 동적 Resource(Template)의 차이와 활용법
- Claude Code AI도구에서 Resource와 Prompt 실제 사용법
- AI개발 실전에서 Model Context Protocol 완벽 활용하기

**완성 코드**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - Resource구현과 Prompt구현이 포함된 MCP개발 튜토리얼

**시리즈**: [Day 1: Model Context Protocol 개념](/mcp-day1-introduction-and-first-server) | **Day 2: Resource와 Prompt** | Day 3: 실전 프로젝트 (예정)

---

## Tool vs Resource vs Prompt 복습

[Day 1](/mcp-day1-introduction-and-first-server)에서 Model Context Protocol 기반 MCP서버의 3가지 핵심 기능을 소개했습니다. AI개발과 MCP개발에서 이 세 가지를 명확히 구분하는 것이 중요합니다. Claude Code 같은 AI도구에서 각 기능이 어떻게 활용되는지 이해해야 합니다.

| 기능 | 설명 | AI도구 관점 | 사용 예시 |
|------|------|-------------|----------|
| **Tool** | AI가 실행하는 함수 | "이 작업을 수행해줘" | 계산, 검색, API 호출 |
| **Resource** | AI에게 제공하는 데이터 | "이 정보를 참고해" | 설정 파일, 문서, 상태 |
| **Prompt** | 미리 정의된 템플릿 | "이 형식으로 작업해" | 코드 리뷰, 번역 요청 |

Day 1에서는 Tool구현에 집중했습니다. 오늘은 Resource구현과 Prompt구현을 통해 Model Context Protocol 기반 MCP서버를 완성합니다. Claude Code와 같은 AI도구에서 이 기능들을 활용하는 AI개발 실전 예제도 함께 다룹니다.

---

## Resource란? AI도구에 데이터 제공하기

### Resource의 역할

MCP Resource는 AI도구가 참조할 수 있는 **읽기 전용 데이터**입니다. AI개발에서 컨텍스트 제공이 핵심인데, Resource가 바로 그 역할을 합니다.

Resource구현 시 고려할 점:
- **URI 형식**: `protocol://path` 형태로 식별
- **읽기 전용**: Resource는 데이터를 제공만 함 (수정 불가)
- **구조화된 데이터**: JSON, 텍스트, 바이너리 등 다양한 형식 지원

### 정적 Resource vs 동적 Resource

MCP서버에서 Resource구현 방식은 두 가지입니다:

```
┌─────────────────────────────────────────────────────────────┐
│                    Resource 유형                              │
├─────────────────────────────┬───────────────────────────────┤
│       정적 Resource          │       동적 Resource            │
│  (Static Resource)           │  (Resource Template)           │
├─────────────────────────────┼───────────────────────────────┤
│  고정된 URI                   │  변수가 포함된 URI 템플릿      │
│  config://settings           │  file:///{path}                │
│  server.resource()           │  server.resource() + 템플릿    │
│  설정 파일, 상수 데이터        │  파일 시스템, DB 레코드        │
└─────────────────────────────┴───────────────────────────────┘
```

---

## 정적 Resource구현

### 서버 정보 Resource 만들기

가장 간단한 Resource구현부터 시작합니다. MCP서버의 정보를 제공하는 정적 Resource입니다.

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// 정적 Resource 등록
server.resource(
  "server-info",                    // 리소스 이름
  "server://info",                  // URI
  {
    description: "MCP서버 정보를 제공합니다",
    mimeType: "application/json",
  },
  async () => {
    const serverInfo = {
      name: "my-first-mcp",
      version: "1.0.0",
      description: "MCP개발 튜토리얼 서버",
      author: "idongho",
      tools: [
        "get_current_time",
        "calculate",
        "get_random_number",
        "reverse_string",
        "get_server_info",
      ],
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
      },
    };

    return {
      contents: [{
        uri: "server://info",
        mimeType: "application/json",
        text: JSON.stringify(serverInfo, null, 2),
      }],
    };
  }
);
```

### Resource구현 핵심 포인트

MCP Resource구현 시 반드시 알아야 할 사항:

1. **URI 설계**: `protocol://path` 형식으로 명확하게
2. **mimeType 지정**: `application/json`, `text/plain` 등
3. **contents 배열**: 여러 콘텐츠 반환 가능
4. **비동기 처리**: async 함수로 구현

### 설정 Resource 추가하기

실전에서 자주 사용하는 설정 Resource구현입니다:

```typescript
// 설정 Resource - AI도구가 현재 설정을 참조할 수 있음
server.resource(
  "config",
  "config://settings",
  {
    description: "MCP서버 설정 정보",
    mimeType: "application/json",
  },
  async () => {
    const config = {
      timezone: "Asia/Seoul",
      language: "ko",
      features: {
        calculation: true,
        timeQuery: true,
        stringManipulation: true,
      },
      limits: {
        maxRandomNumber: 1000,
        maxStringLength: 10000,
      },
    };

    return {
      contents: [{
        uri: "config://settings",
        mimeType: "application/json",
        text: JSON.stringify(config, null, 2),
      }],
    };
  }
);
```

---

## 동적 Resource구현 (Resource Template)

### Resource Template이란?

동적 Resource는 **URI 템플릿**을 사용합니다. 요청 시 변수가 치환되어 다양한 데이터를 제공할 수 있습니다. MCP개발에서 파일 시스템 접근, DB 조회 등에 활용됩니다.

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// 동적 Resource Template
server.resource(
  "help",
  new ResourceTemplate("help://topic/{topic}", { list: undefined }),
  {
    description: "도움말 토픽을 조회합니다",
    mimeType: "text/plain",
  },
  async (uri, { topic }) => {
    const helpTopics: Record<string, string> = {
      tools: `
## 사용 가능한 Tool 목록

1. **get_current_time**: 현재 시간을 조회합니다
   - timezone: 시간대 (예: Asia/Seoul)

2. **calculate**: 사칙연산을 수행합니다
   - a: 첫 번째 숫자
   - b: 두 번째 숫자
   - operation: add, subtract, multiply, divide

3. **get_random_number**: 랜덤 숫자를 생성합니다
   - min: 최소값 (기본값: 0)
   - max: 최대값 (기본값: 100)

4. **reverse_string**: 문자열을 뒤집습니다
   - text: 뒤집을 문자열

5. **get_server_info**: MCP서버 정보를 조회합니다
`,
      resources: `
## Resource 목록

1. **server://info**: MCP서버 정보
2. **config://settings**: 서버 설정
3. **help://topic/{topic}**: 도움말 (tools, resources, prompts)
`,
      prompts: `
## Prompt 템플릿 목록

1. **code-review**: 코드 리뷰 요청 템플릿
2. **explain-code**: 코드 설명 요청 템플릿
`,
    };

    const content = helpTopics[topic as string] ||
      `알 수 없는 토픽입니다. 사용 가능: tools, resources, prompts`;

    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/plain",
        text: content,
      }],
    };
  }
);
```

### URI Template 문법

MCP Resource Template에서 사용하는 URI 패턴:

| 패턴 | 설명 | 예시 |
|------|------|------|
| `{variable}` | 필수 변수 | `file:///{path}` |
| `{+variable}` | 예약 문자 포함 | `file:///{+path}` (슬래시 허용) |
| `{?param}` | 쿼리 파라미터 | `api://data{?format}` |

---

## Prompt구현: 재사용 가능한 템플릿

### Prompt란?

MCP Prompt는 미리 정의된 **프롬프트 템플릿**입니다. AI개발에서 반복적인 작업을 템플릿화하여 일관된 결과를 얻을 수 있습니다.

Prompt구현의 장점:
- **일관성**: 같은 형식의 요청을 반복 사용
- **재사용성**: 한 번 정의하면 여러 번 활용
- **파라미터화**: 인자를 받아 동적으로 프롬프트 생성

### 코드 리뷰 Prompt 만들기

가장 실용적인 Prompt구현 예제입니다:

```typescript
import { z } from "zod";

// 코드 리뷰 Prompt
server.prompt(
  "code-review",
  "코드 리뷰를 요청합니다",
  {
    code: z.string().describe("리뷰할 코드"),
    language: z.string().optional().describe("프로그래밍 언어"),
    focusAreas: z.string().optional().describe("중점 검토 영역 (쉼표로 구분)"),
  },
  async ({ code, language, focusAreas }) => {
    const lang = language || "알 수 없음";
    const focus = focusAreas || "전반적인 코드 품질";

    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `다음 ${lang} 코드를 리뷰해주세요.

## 중점 검토 영역
${focus}

## 코드
\`\`\`${lang}
${code}
\`\`\`

## 요청 사항
1. 코드 품질 평가 (1-10점)
2. 개선이 필요한 부분
3. 잘 작성된 부분
4. 구체적인 개선 제안
`,
        },
      }],
    };
  }
);
```

### 코드 설명 Prompt 추가

AI도구에서 자주 사용하는 또 다른 Prompt구현 예제:

```typescript
// 코드 설명 Prompt
server.prompt(
  "explain-code",
  "코드를 설명해달라고 요청합니다",
  {
    code: z.string().describe("설명할 코드"),
    level: z.enum(["beginner", "intermediate", "advanced"])
      .optional()
      .describe("설명 수준"),
  },
  async ({ code, level }) => {
    const levelText = {
      beginner: "프로그래밍 초보자도 이해할 수 있게 쉽게",
      intermediate: "기본 프로그래밍 지식이 있는 사람이 이해할 수 있게",
      advanced: "숙련된 개발자를 위해 심층적으로",
    };

    const explanation = levelText[level || "intermediate"];

    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `다음 코드를 ${explanation} 설명해주세요.

\`\`\`
${code}
\`\`\`

## 설명 형식
1. 코드의 목적
2. 주요 로직 단계별 설명
3. 사용된 패턴이나 기법
4. 주의할 점
`,
        },
      }],
    };
  }
);
```

### Prompt구현 핵심 포인트

MCP Prompt구현 시 중요한 사항:

1. **명확한 이름**: 용도를 알 수 있는 이름 사용
2. **zod 스키마**: 파라미터 타입과 설명 정의
3. **messages 배열**: role과 content 형식
4. **마크다운 활용**: 구조화된 프롬프트 작성

---

## 전체 MCP서버 코드

Resource구현과 Prompt구현이 모두 포함된 완성된 MCP서버입니다:

```typescript
// src/index.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 서버 생성
const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// ===== Tools (Day 1에서 구현) =====

server.tool(
  "get_current_time",
  "현재 시간을 반환합니다",
  { timezone: z.string().optional().describe("시간대") },
  async ({ timezone }) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || "Asia/Seoul",
      dateStyle: "full",
      timeStyle: "long",
    };
    return {
      content: [{ type: "text", text: now.toLocaleString("ko-KR", options) }],
    };
  }
);

// ... 다른 Tool들 ...

// ===== Resources (Day 2) =====

// 정적 Resource: 서버 정보
server.resource(
  "server-info",
  "server://info",
  { description: "MCP서버 정보", mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "server://info",
      mimeType: "application/json",
      text: JSON.stringify({
        name: "my-first-mcp",
        version: "1.0.0",
        capabilities: { tools: true, resources: true, prompts: true },
      }, null, 2),
    }],
  })
);

// 정적 Resource: 설정
server.resource(
  "config",
  "config://settings",
  { description: "서버 설정", mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "config://settings",
      mimeType: "application/json",
      text: JSON.stringify({
        timezone: "Asia/Seoul",
        language: "ko",
      }, null, 2),
    }],
  })
);

// ===== Prompts (Day 2) =====

// 코드 리뷰 Prompt
server.prompt(
  "code-review",
  "코드 리뷰를 요청합니다",
  {
    code: z.string().describe("리뷰할 코드"),
    language: z.string().optional().describe("프로그래밍 언어"),
  },
  async ({ code, language }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `다음 ${language || ''} 코드를 리뷰해주세요:\n\n\`\`\`\n${code}\n\`\`\``,
      },
    }],
  })
);

// 서버 시작
const transport = new StdioServerTransport();
server.connect(transport);
console.error("MCP서버가 시작되었습니다!");
```

---

## MCP Inspector로 Resource와 Prompt 테스트

### Inspector 실행

```bash
npm run inspect
# 브라우저에서 http://localhost:6274 접속
```

### Resource 테스트

1. **Resources 탭** 클릭
2. 등록된 Resource 목록 확인
3. `server://info` 선택
4. **Read Resource** 클릭
5. JSON 응답 확인

### Prompt 테스트

1. **Prompts 탭** 클릭
2. `code-review` 선택
3. 파라미터 입력:
   - code: `function add(a, b) { return a + b; }`
   - language: `javascript`
4. **Get Prompt** 클릭
5. 생성된 프롬프트 메시지 확인

---

## Claude Code에서 Resource와 Prompt 사용하기

### Resource 참조하기

Claude Code AI도구에서 Resource를 참조하는 예시:

```
사용자: "MCP 서버 정보를 알려줘"

Claude Code: server://info Resource를 읽어 정보를 제공합니다.
→ MCP서버 이름, 버전, 제공 기능 등을 응답
```

### Prompt 활용하기

Prompt구현된 템플릿을 Claude Code에서 사용:

```
사용자: "이 코드 리뷰해줘: function multiply(x, y) { return x * y; }"

Claude Code: code-review Prompt를 사용하여 구조화된 리뷰를 진행합니다.
→ 코드 품질 평가, 개선점, 장점 등을 형식에 맞게 응답
```

---

## 정리

Day 2에서 배운 Model Context Protocol 기반 MCP개발 핵심:

1. **Resource구현**: AI도구에 읽기 전용 데이터 제공
   - 정적 Resource: 고정된 URI로 설정, 상태 정보 제공
   - 동적 Resource: URI 템플릿으로 유연한 데이터 접근
   - AI개발에서 컨텍스트 제공의 핵심

2. **Prompt구현**: 재사용 가능한 프롬프트 템플릿
   - 파라미터화된 템플릿으로 일관된 요청
   - zod 스키마로 타입 안전성 확보
   - MCP개발 시 필수 기능

3. **완성된 MCP서버**: Tool + Resource + Prompt
   - AI도구와의 완전한 통합
   - Claude Code에서 Model Context Protocol 활용
   - AI개발 워크플로우 자동화

### MCP개발 핵심 코드 패턴

```typescript
// Resource구현 패턴 (Model Context Protocol)
server.resource(name, uri, metadata, handler);

// Prompt구현 패턴 (AI개발 필수)
server.prompt(name, description, schema, handler);
```

---

## 다음 편 예고

**Day 3: 실전 MCP서버 - 프로젝트 분석 도구**

Day 3에서는 Model Context Protocol을 활용한 실전 MCP개발을 다룹니다:

- 실용적인 MCP서버 개발 - AI개발 현장에서 바로 쓸 수 있는 도구
- 파일 시스템 접근 Tool구현 - Claude Code AI도구와 연동
- 프로젝트 구조 분석 기능
- 의존성 분석, 코드 통계 등 MCP개발 실전 예제

---

## 참고 자료

### 공식 문서
- [MCP 공식 스펙 - Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [MCP 공식 스펙 - Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### 시리즈 링크
- [Day 1: Model Context Protocol 개념과 첫 서버](/mcp-day1-introduction-and-first-server)
- Day 3: 실전 프로젝트 (예정)
- Day 4: npm 배포 (예정)
- Day 5: 고급 패턴 (예정)
