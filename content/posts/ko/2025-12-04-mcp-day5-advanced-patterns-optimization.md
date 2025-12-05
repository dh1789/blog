---
title: "MCP 서버 개발 Day 5: 고급 패턴과 최적화 - 프로덕션 레벨 MCP 서버 만들기"
slug: "mcp-day5-advanced-patterns-optimization"
excerpt: "MCP 서버를 프로덕션 레벨로 업그레이드하는 고급 패턴. GitHub API 연동, 캐싱 전략, 보안 고려사항까지 실전에서 필요한 MCP 서버 최적화 기법을 배웁니다."
status: "publish"
categories:
  - "MCP"
  - "개발"
tags:
  - "MCP 서버"
  - "MCP 고급 패턴"
  - "GitHub API"
  - "캐싱"
  - "보안"
  - "Claude Code"
  - "TypeScript"
language: "ko"
---

## TL;DR

**MCP 서버**를 프로덕션에 배포하려면 **MCP 고급 패턴**이 필요합니다:
- **외부 API 연동**: GitHub API와 같은 외부 서비스 통합
- **캐싱 전략**: 성능 최적화를 위한 인메모리 캐싱
- **보안 고려사항**: 입력 검증과 경로 이탈 방지

이 글에서 배우는 **MCP 고급 패턴**:
- **GitHub API 연동**: 토큰 관리와 레이트 리미팅으로 **Claude Code** 기능 확장
- **MCP 서버 캐싱**: TTL 기반 캐시로 **Claude Code** 응답 속도 향상
- **보안 강화**: 프로덕션 레벨 입력 검증으로 안전한 **MCP 고급 패턴** 구현

**완성 코드**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - 이 시리즈에서 만든 MCP 서버 전체 소스코드

---

## 외부 API 연동

**MCP 서버**의 진정한 힘은 외부 API와 연동할 때 발휘됩니다. **GitHub API**를 연동하는 예시로 **MCP 고급 패턴**을 알아봅니다. **Claude Code**에서 외부 데이터를 활용하는 핵심 **MCP 고급 패턴**입니다.

### GitHub API Tool 구현

**GitHub API**를 활용한 저장소 정보 조회 Tool입니다:

```typescript
import { z } from "zod";

// GitHub 저장소 정보 조회 Tool
server.tool(
  "get_repo_info",
  "GitHub 저장소 정보를 조회합니다",
  {
    owner: z.string().describe("저장소 소유자"),
    repo: z.string().describe("저장소 이름"),
  },
  async ({ owner, repo }) => {
    const token = process.env.GITHUB_TOKEN;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: token ? `token ${token}` : "",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MCP-Server",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name: data.full_name,
          description: data.description,
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language,
          updated_at: data.updated_at,
        }, null, 2),
      }],
    };
  }
);
```

### 환경 변수 관리

**MCP 서버**에서 민감한 정보는 환경 변수로 관리합니다:

```typescript
// 환경 변수 검증
function validateEnv(): void {
  const requiredVars = ["GITHUB_TOKEN"];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`경고: 누락된 환경 변수: ${missing.join(", ")}`);
    console.warn("일부 기능이 제한될 수 있습니다.");
  }
}

// 서버 시작 시 검증
validateEnv();
```

**Claude Code**에서 환경 변수 설정:

```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

### 레이트 리미팅 처리

**GitHub API**는 시간당 요청 수를 제한합니다. **MCP 서버**에서 이를 처리하는 방법:

```typescript
// 레이트 리밋 상태 추적
let rateLimitRemaining = 60;
let rateLimitReset = 0;

async function fetchWithRateLimit(url: string, options: RequestInit) {
  // 레이트 리밋 도달 시 대기
  if (rateLimitRemaining <= 1) {
    const waitTime = rateLimitReset - Date.now();
    if (waitTime > 0) {
      throw new Error(
        `API 요청 한도 도달. ${Math.ceil(waitTime / 1000)}초 후 재시도하세요.`
      );
    }
  }

  const response = await fetch(url, options);

  // 레이트 리밋 헤더 업데이트
  rateLimitRemaining = parseInt(
    response.headers.get("X-RateLimit-Remaining") || "60"
  );
  rateLimitReset = parseInt(
    response.headers.get("X-RateLimit-Reset") || "0"
  ) * 1000;

  return response;
}
```

---

## 캐싱 전략

**MCP 서버**의 성능을 크게 향상시키는 **캐싱** 구현입니다. **Claude Code**에서 반복되는 API 호출을 줄이고 응답 속도를 높입니다.

### 인메모리 캐시 구현

간단하면서도 효과적인 TTL 기반 **캐싱** 클래스:

```typescript
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTTL = ttlSeconds * 1000;
  }

  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.store.clear();
  }

  // 만료된 항목 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }
}

// 전역 캐시 인스턴스
const repoCache = new Cache<any>(600); // 10분 TTL
```

### 캐시 적용 Tool

**캐싱**을 적용한 **GitHub API** Tool:

```typescript
server.tool(
  "get_repo_info_cached",
  "GitHub 저장소 정보를 조회합니다 (캐시 사용)",
  {
    owner: z.string().describe("저장소 소유자"),
    repo: z.string().describe("저장소 이름"),
    noCache: z.boolean().optional().describe("캐시 무시"),
  },
  async ({ owner, repo, noCache }) => {
    const cacheKey = `repo:${owner}/${repo}`;

    // 캐시 확인
    if (!noCache) {
      const cached = repoCache.get(cacheKey);
      if (cached) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ ...cached, _cached: true }, null, 2),
          }],
        };
      }
    }

    // API 호출
    const response = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: getGitHubHeaders() }
    );

    const data = await response.json();
    const result = {
      name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
    };

    // 캐시 저장
    repoCache.set(cacheKey, result);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ ...result, _cached: false }, null, 2),
      }],
    };
  }
);
```

### 캐시 관리 Tool

**MCP 서버**의 **캐싱** 상태를 관리하는 Tool:

```typescript
server.tool(
  "clear_cache",
  "MCP 서버 캐시를 초기화합니다",
  {},
  async () => {
    repoCache.clear();
    return {
      content: [{
        type: "text",
        text: "캐시가 초기화되었습니다.",
      }],
    };
  }
);
```

---

## 보안 고려사항

프로덕션 **MCP 서버**에서 가장 중요한 것은 **보안**입니다. 입력 검증부터 경로 이탈 방지까지 필수 **보안** 패턴을 알아봅니다.

### 입력 검증 강화

Zod를 활용한 철저한 입력 검증:

```typescript
// 경로 검증 스키마
const safePathSchema = z.string()
  .min(1)
  .max(500)
  .refine(
    (path) => !path.includes(".."),
    "상위 디렉토리 참조(..)는 허용되지 않습니다"
  )
  .refine(
    (path) => !path.startsWith("/"),
    "절대 경로는 허용되지 않습니다"
  );

// GitHub 사용자명 검증
const githubUsernameSchema = z.string()
  .min(1)
  .max(39)
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    "유효하지 않은 GitHub 사용자명입니다"
  );
```

### 경로 이탈 방지

파일 시스템 접근 시 **보안**을 위한 경로 검증:

```typescript
import * as path from "path";

function validatePath(basePath: string, targetPath: string): string {
  // 절대 경로로 변환
  const resolved = path.resolve(basePath, targetPath);

  // 베이스 경로 내부인지 확인
  if (!resolved.startsWith(path.resolve(basePath))) {
    throw new Error("경로 이탈 시도가 감지되었습니다");
  }

  return resolved;
}

// 사용 예시
server.tool(
  "read_project_file",
  "프로젝트 파일을 읽습니다",
  {
    filePath: safePathSchema.describe("읽을 파일 경로"),
  },
  async ({ filePath }) => {
    const projectRoot = process.cwd();
    const safePath = validatePath(projectRoot, filePath);

    const content = await fs.readFile(safePath, "utf-8");
    return {
      content: [{ type: "text", text: content }],
    };
  }
);
```

### 민감 정보 보호

**MCP 서버**에서 민감한 정보를 필터링하는 방법:

```typescript
// 민감 패턴 정의
const sensitivePatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /token\s*[:=]\s*['"][^'"]+['"]/gi,
];

function sanitizeContent(content: string): string {
  let sanitized = content;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

// Tool에서 사용
server.tool(
  "read_config",
  "설정 파일을 읽습니다 (민감 정보 마스킹)",
  {
    configPath: safePathSchema,
  },
  async ({ configPath }) => {
    const content = await fs.readFile(configPath, "utf-8");
    return {
      content: [{
        type: "text",
        text: sanitizeContent(content),
      }],
    };
  }
);
```

---

## 성능 최적화

**MCP 서버**의 응답 속도를 높이는 **최적화** 기법입니다.

### 비동기 병렬 처리

여러 작업을 동시에 처리하여 성능을 개선합니다:

```typescript
server.tool(
  "analyze_repos",
  "여러 저장소를 동시에 분석합니다",
  {
    repos: z.array(z.string()).max(5).describe("저장소 목록 (owner/repo)"),
  },
  async ({ repos }) => {
    // 병렬 처리
    const results = await Promise.all(
      repos.map(async (repo) => {
        const [owner, name] = repo.split("/");
        try {
          const response = await fetchWithRateLimit(
            `https://api.github.com/repos/${owner}/${name}`,
            { headers: getGitHubHeaders() }
          );
          return { repo, success: true, data: await response.json() };
        } catch (error) {
          return { repo, success: false, error: String(error) };
        }
      })
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2),
      }],
    };
  }
);
```

### 응답 스트리밍

대용량 데이터는 스트리밍으로 처리합니다:

```typescript
// 큰 파일 읽기 시 청크 단위로 처리
server.tool(
  "read_large_file",
  "대용량 파일을 읽습니다",
  {
    filePath: safePathSchema,
    maxLines: z.number().max(1000).default(100),
  },
  async ({ filePath, maxLines }) => {
    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    const lines: string[] = [];
    let lineCount = 0;

    for await (const chunk of fileStream) {
      const chunkLines = chunk.toString().split("\n");
      for (const line of chunkLines) {
        if (lineCount >= maxLines) break;
        lines.push(line);
        lineCount++;
      }
      if (lineCount >= maxLines) break;
    }

    return {
      content: [{
        type: "text",
        text: lines.join("\n"),
      }],
    };
  }
);
```

---

## 디버깅과 로깅

**MCP 고급 패턴**을 적용한 **MCP 서버** 문제를 빠르게 해결하기 위한 디버깅 도구입니다.

### 로깅 시스템

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLogLevel = process.env.LOG_LEVEL
  ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel]
  : LogLevel.INFO;

function log(level: LogLevel, message: string, data?: any): void {
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  const logMessage = `[${timestamp}] [${levelName}] ${message}`;

  if (data) {
    console.error(logMessage, JSON.stringify(data));
  } else {
    console.error(logMessage);
  }
}

// 사용 예시
log(LogLevel.INFO, "서버 시작됨");
log(LogLevel.DEBUG, "Tool 호출", { name: "get_repo_info", args: { owner, repo } });
log(LogLevel.ERROR, "API 오류", { status: response.status });
```

### MCP Inspector 활용

**MCP Inspector**로 서버를 디버깅합니다:

```bash
# MCP Inspector 실행
npx @modelcontextprotocol/inspector dist/index.js

# 브라우저에서 http://localhost:5173 접속
# - Tools 목록 확인
# - Tool 직접 호출 테스트
# - 응답 형식 검증
```

### 에러 추적 Tool

서버 상태를 진단하는 Tool:

```typescript
server.tool(
  "server_status",
  "MCP 서버 상태를 확인합니다",
  {},
  async () => {
    const status = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cacheSize: repoCache.size,
      rateLimitRemaining,
      nodeVersion: process.version,
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(status, null, 2),
      }],
    };
  }
);
```

---

## 프로덕션 체크리스트

**MCP 고급 패턴**을 적용한 **MCP 서버**를 프로덕션에 배포하기 전 확인사항입니다. **Claude Code**와 함께 안정적으로 동작하는지 점검하세요:

### 필수 항목

- [ ] 모든 입력에 Zod 스키마 적용
- [ ] 경로 이탈 방지 검증 구현
- [ ] 민감 정보 환경 변수로 분리
- [ ] 에러 메시지에 민감 정보 노출 금지
- [ ] 레이트 리미팅 처리
- [ ] 로깅 시스템 구현

### 권장 항목

- [ ] 인메모리 캐싱 구현
- [ ] 병렬 처리로 성능 최적화
- [ ] 헬스 체크 Tool 구현
- [ ] README.md에 **보안** 고려사항 문서화
- [ ] 버전 관리 및 CHANGELOG.md 유지

### 테스트 항목

- [ ] 정상 입력 테스트
- [ ] 비정상 입력 테스트 (경계값, 잘못된 타입)
- [ ] 경로 이탈 시도 테스트
- [ ] 레이트 리밋 도달 시 동작 테스트
- [ ] 캐시 동작 테스트

---

## 정리

**MCP 고급 패턴**과 함께 MCP 서버 개발 시리즈를 마무리합니다. **Claude Code**와 함께 더 강력한 개발 환경을 구축하세요:

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | MCP 개념 | 아키텍처와 핵심 기능 이해 |
| Day 2 | Resource와 Prompt | 데이터 제공과 템플릿 활용 |
| Day 3 | 실전 프로젝트 | 프로젝트 분석 MCP 서버 |
| Day 4 | npm 배포 | 패키지 구조화와 배포 |
| Day 5 | **고급 패턴** | API 연동, **캐싱**, **보안** |

### 다음 단계

**MCP 서버** 개발을 더 깊이 배우려면:
- [MCP 공식 스펙](https://modelcontextprotocol.io) 읽기
- [anthropics/mcp-servers](https://github.com/anthropics/mcp-servers) 분석
- 나만의 **MCP 서버** 아이디어 구현

**Claude Code**와 **MCP 서버**로 개발 생산성을 높여보세요!

---

## 시리즈 네비게이션

- [Day 1: MCP란? 개념과 첫 서버 만들기](/ko/mcp-day1-introduction-and-first-server)
- [Day 2: Resource와 Prompt 완전 정복](/ko/mcp-day2-resource-and-prompt)
- [Day 3: 실전 프로젝트 - 프로젝트 분석 MCP 서버](/ko/mcp-day3-practical-project-analyzer)
- [Day 4: npm 패키지로 배포하기](/ko/mcp-day4-npm-package-deployment)
- **Day 5: 고급 패턴과 최적화** (현재 글)
