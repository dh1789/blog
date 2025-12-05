---
title: "MCP 서버 개발 (3/5): 실전 프로젝트 분석 도구 만들기"
slug: "mcp-day3-practical-project-analyzer"
excerpt: "MCP서버로 실용적인 프로젝트분석 도구를 만듭니다. 파일시스템 접근, 디렉토리 구조 분석, 코드 통계까지 TypeScript로 구현하는 AI개발 실전 가이드. Claude Code에서 바로 사용할 수 있는 MCP개발 튜토리얼."
date: "2025-12-02"
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
  - 프로젝트분석
  - 파일시스템
  - AI개발
  - MCP개발
  - AI도구
featured_image: ""
status: "publish"
language: "ko"
seo_title: "MCP 실전 프로젝트 분석 도구: TypeScript로 파일시스템 Tool 개발하기"
seo_description: "MCP 서버로 프로젝트 분석 도구를 만드는 실전 가이드. 파일시스템 접근, 디렉토리 구조 분석, 코드 통계 Tool 구현."
---

## TL;DR

**MCP (Model Context Protocol)** 서버로 실제 개발에 유용한 **프로젝트분석** 도구를 만듭니다. Day 1에서 MCP서버 개념을, Day 2에서 Resource와 Prompt를 배웠다면, 이제 AI개발 현장에서 바로 사용할 수 있는 실전 Tool을 구현합니다.

이 글에서 배우는 것:
- AI개발 실전 - MCP개발로 파일시스템 접근 Tool 구현
- MCP서버로 프로젝트분석 자동화하는 AI개발 워크플로우
- 디렉토리 구조 분석, 의존성 분석, 코드 통계 Tool을 TypeScript로 개발
- Claude Code AI도구에서 Model Context Protocol 기반 Tool 활용법
- AI개발 현장에서 필수인 보안 고려사항

**전체 코드**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP개발 튜토리얼 프로젝트분석 확장

**시리즈**: [Day 1: Model Context Protocol 개념](/mcp-day1-introduction-and-first-server) | [Day 2: Resource와 Prompt](/mcp-day2-resource-and-prompt) | **Day 3: 실전 프로젝트분석** | Day 4: npm 배포 (예정)

---

## 왜 프로젝트분석 MCP서버인가?

### AI개발에서 컨텍스트의 중요성

Claude Code 같은 AI도구로 개발할 때 가장 중요한 것은 **컨텍스트**입니다. AI가 프로젝트 구조를 이해하고, 어떤 의존성을 사용하는지, 코드베이스가 얼마나 큰지 파악해야 더 정확한 도움을 줄 수 있습니다.

MCP서버로 프로젝트분석 도구를 만들면:

```
┌─────────────────────────────────────────────────────────────┐
│                    프로젝트분석 MCP서버                       │
├─────────────────────────────────────────────────────────────┤
│  Tool 1: analyze_structure                                   │
│  → 디렉토리 구조를 트리 형태로 분석                           │
│                                                              │
│  Tool 2: analyze_dependencies                                │
│  → package.json 의존성 분석                                  │
│                                                              │
│  Tool 3: count_lines                                         │
│  → 코드 라인 수 통계                                         │
├─────────────────────────────────────────────────────────────┤
│  Claude Code가 이 정보로 더 정확한 분석과 제안 제공          │
└─────────────────────────────────────────────────────────────┘
```

Model Context Protocol을 사용하면 AI도구가 파일시스템에 안전하게 접근할 수 있습니다. MCP개발을 통해 AI개발 워크플로우를 자동화할 수 있습니다.

---

## 프로젝트 확장 준비

### 기존 my-first-mcp 프로젝트 확장

Day 1에서 만든 MCP서버에 프로젝트분석 기능을 추가합니다. Claude Code AI도구와 연동할 수 있도록 기존 TypeScript 프로젝트 구조를 유지하면서 새로운 Tool들을 추가합니다. Model Context Protocol 기반 AI개발의 핵심은 확장 가능한 설계입니다.

```bash
# 기존 프로젝트로 이동
cd my-first-mcp

# 파일시스템 관련 의존성 추가
npm install glob

# 타입 정의 추가
npm install -D @types/node
```

### 파일 구조 확장

MCP개발에서는 코드를 모듈화하는 것이 좋습니다:

```
my-first-mcp/
├── src/
│   ├── index.ts              # 메인 서버
│   ├── tools/
│   │   ├── time.ts           # 시간 관련 Tool
│   │   ├── calculator.ts     # 계산 Tool
│   │   └── project-analyzer.ts  # 프로젝트분석 Tool (새로 추가)
│   └── utils/
│       └── file-system.ts    # 파일시스템 유틸리티
├── package.json
└── tsconfig.json
```

---

## Tool 1: 프로젝트 구조 분석

### analyze_structure Tool 구현

MCP서버의 첫 번째 프로젝트분석 Tool입니다. 디렉토리 구조를 트리 형태로 분석하여 AI도구가 프로젝트 전체 구조를 파악할 수 있게 합니다.

```typescript
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// 프로젝트 구조 분석 Tool - MCP개발 핵심 기능
server.tool(
  "analyze_structure",
  "프로젝트 디렉토리 구조를 분석합니다",
  {
    targetPath: z.string().describe("분석할 디렉토리 경로"),
    maxDepth: z.number().optional().default(3).describe("최대 탐색 깊이"),
    includeHidden: z.boolean().optional().default(false).describe("숨김 파일 포함 여부"),
  },
  async ({ targetPath, maxDepth, includeHidden }) => {
    // 경로 보안 검증 - 파일시스템 접근 시 필수
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [{ type: "text", text: `오류: 경로를 찾을 수 없습니다 - ${resolvedPath}` }],
        isError: true,
      };
    }

    const structure = buildDirectoryTree(resolvedPath, maxDepth, includeHidden);

    return {
      content: [{
        type: "text",
        text: `## 프로젝트 구조 분석 결과\n\n경로: ${resolvedPath}\n\n\`\`\`\n${structure}\n\`\`\``,
      }],
    };
  }
);
```

### 디렉토리 트리 생성 함수

파일시스템을 순회하며 트리 구조를 생성하는 유틸리티 함수입니다. MCP개발에서 자주 사용되는 패턴입니다.

```typescript
// 파일시스템 트리 생성 - AI개발에서 프로젝트분석에 필수
function buildDirectoryTree(
  dirPath: string,
  maxDepth: number,
  includeHidden: boolean,
  currentDepth: number = 0,
  prefix: string = ""
): string {
  if (currentDepth >= maxDepth) {
    return prefix + "...\n";
  }

  let result = "";
  const items = fs.readdirSync(dirPath);

  // 숨김 파일 필터링
  const filteredItems = includeHidden
    ? items
    : items.filter(item => !item.startsWith("."));

  // node_modules, dist 등 제외 (MCP서버 성능 최적화)
  const excludeDirs = ["node_modules", "dist", ".git", "coverage"];
  const finalItems = filteredItems.filter(item => !excludeDirs.includes(item));

  finalItems.forEach((item, index) => {
    const itemPath = path.join(dirPath, item);
    const isLast = index === finalItems.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      result += prefix + connector + item + "/\n";
      result += buildDirectoryTree(itemPath, maxDepth, includeHidden, currentDepth + 1, newPrefix);
    } else {
      result += prefix + connector + item + "\n";
    }
  });

  return result;
}
```

### 실행 예시

Claude Code AI도구에서 MCP서버의 프로젝트분석 Tool을 호출한 결과:

```
User: "이 프로젝트 구조를 분석해줘"

Claude Code: analyze_structure Tool 호출
→ 경로: /Users/dev/my-project

## 프로젝트 구조 분석 결과

경로: /Users/dev/my-project

├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── index.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Tool 2: 의존성 분석

### analyze_dependencies Tool 구현

package.json을 분석하여 프로젝트 의존성 정보를 제공합니다. MCP서버가 TypeScript 프로젝트의 기술 스택을 파악하는 데 유용합니다.

```typescript
// package.json 의존성 분석 - Model Context Protocol 활용
server.tool(
  "analyze_dependencies",
  "package.json의 의존성을 분석합니다",
  {
    targetPath: z.string().describe("package.json이 있는 디렉토리 경로"),
    includeDevDeps: z.boolean().optional().default(true).describe("devDependencies 포함 여부"),
  },
  async ({ targetPath, includeDevDeps }) => {
    const packageJsonPath = path.join(path.resolve(targetPath), "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      return {
        content: [{ type: "text", text: `오류: package.json을 찾을 수 없습니다 - ${packageJsonPath}` }],
        isError: true,
      };
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const result = formatDependencyAnalysis(packageJson, includeDevDeps);

    return {
      content: [{ type: "text", text: result }],
    };
  }
);
```

### 의존성 포맷팅 함수

MCP개발에서 AI도구가 쉽게 파싱할 수 있는 형태로 데이터를 포맷팅합니다:

```typescript
// 의존성 분석 결과 포맷팅 - AI개발 친화적 출력
function formatDependencyAnalysis(packageJson: any, includeDevDeps: boolean): string {
  let result = `## 의존성 분석 결과\n\n`;

  // 프로젝트 기본 정보
  result += `### 프로젝트 정보\n`;
  result += `- **이름**: ${packageJson.name || "N/A"}\n`;
  result += `- **버전**: ${packageJson.version || "N/A"}\n`;
  result += `- **설명**: ${packageJson.description || "N/A"}\n\n`;

  // 프로덕션 의존성
  const deps = packageJson.dependencies || {};
  const depCount = Object.keys(deps).length;

  result += `### 프로덕션 의존성 (${depCount}개)\n`;
  if (depCount > 0) {
    result += "| 패키지 | 버전 |\n|--------|------|\n";
    Object.entries(deps).forEach(([name, version]) => {
      result += `| ${name} | ${version} |\n`;
    });
  } else {
    result += "프로덕션 의존성 없음\n";
  }
  result += "\n";

  // 개발 의존성
  if (includeDevDeps) {
    const devDeps = packageJson.devDependencies || {};
    const devDepCount = Object.keys(devDeps).length;

    result += `### 개발 의존성 (${devDepCount}개)\n`;
    if (devDepCount > 0) {
      result += "| 패키지 | 버전 |\n|--------|------|\n";
      Object.entries(devDeps).forEach(([name, version]) => {
        result += `| ${name} | ${version} |\n`;
      });
    } else {
      result += "개발 의존성 없음\n";
    }
    result += "\n";
  }

  // 스크립트
  const scripts = packageJson.scripts || {};
  const scriptCount = Object.keys(scripts).length;

  result += `### NPM 스크립트 (${scriptCount}개)\n`;
  if (scriptCount > 0) {
    Object.entries(scripts).forEach(([name, command]) => {
      result += `- \`npm run ${name}\`: ${command}\n`;
    });
  }

  return result;
}
```

---

## Tool 3: 코드 통계

### count_lines Tool 구현

프로젝트의 코드 라인 수를 분석합니다. MCP서버로 코드베이스 규모를 파악하면 AI도구가 더 적절한 분석을 제공할 수 있습니다.

```typescript
import { glob } from "glob";

// 코드 라인 수 통계 - MCP개발 프로젝트분석 Tool
server.tool(
  "count_lines",
  "프로젝트의 코드 라인 수를 분석합니다",
  {
    targetPath: z.string().describe("분석할 디렉토리 경로"),
    extensions: z.array(z.string()).optional()
      .default(["ts", "tsx", "js", "jsx"])
      .describe("분석할 파일 확장자"),
  },
  async ({ targetPath, extensions }) => {
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [{ type: "text", text: `오류: 경로를 찾을 수 없습니다` }],
        isError: true,
      };
    }

    const stats = await analyzeCodeLines(resolvedPath, extensions);

    return {
      content: [{ type: "text", text: formatCodeStats(stats) }],
    };
  }
);
```

### 코드 라인 분석 함수

파일시스템을 순회하며 코드, 주석, 빈 줄을 분류합니다:

```typescript
interface CodeStats {
  totalFiles: number;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  byExtension: Record<string, { files: number; lines: number }>;
}

// 파일시스템 순회하며 코드 통계 수집 - TypeScript로 구현
async function analyzeCodeLines(
  dirPath: string,
  extensions: string[]
): Promise<CodeStats> {
  const pattern = `**/*.{${extensions.join(",")}}`;
  const files = await glob(pattern, {
    cwd: dirPath,
    ignore: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  });

  const stats: CodeStats = {
    totalFiles: 0,
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    byExtension: {},
  };

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const ext = path.extname(file).slice(1);
    if (!stats.byExtension[ext]) {
      stats.byExtension[ext] = { files: 0, lines: 0 };
    }

    stats.totalFiles++;
    stats.byExtension[ext].files++;

    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      stats.totalLines++;
      stats.byExtension[ext].lines++;

      if (trimmed === "") {
        stats.blankLines++;
      } else if (inBlockComment) {
        stats.commentLines++;
        if (trimmed.includes("*/")) {
          inBlockComment = false;
        }
      } else if (trimmed.startsWith("/*")) {
        stats.commentLines++;
        if (!trimmed.includes("*/")) {
          inBlockComment = true;
        }
      } else if (trimmed.startsWith("//")) {
        stats.commentLines++;
      } else {
        stats.codeLines++;
      }
    }
  }

  return stats;
}

// 코드 통계 포맷팅 - AI개발 친화적 출력
function formatCodeStats(stats: CodeStats): string {
  let result = `## 코드 통계 분석 결과\n\n`;

  result += `### 전체 요약\n`;
  result += `- **총 파일 수**: ${stats.totalFiles}개\n`;
  result += `- **총 라인 수**: ${stats.totalLines.toLocaleString()}줄\n`;
  result += `- **코드 라인**: ${stats.codeLines.toLocaleString()}줄 (${((stats.codeLines / stats.totalLines) * 100).toFixed(1)}%)\n`;
  result += `- **주석 라인**: ${stats.commentLines.toLocaleString()}줄 (${((stats.commentLines / stats.totalLines) * 100).toFixed(1)}%)\n`;
  result += `- **빈 줄**: ${stats.blankLines.toLocaleString()}줄 (${((stats.blankLines / stats.totalLines) * 100).toFixed(1)}%)\n\n`;

  result += `### 확장자별 통계\n`;
  result += "| 확장자 | 파일 수 | 라인 수 |\n|--------|---------|----------|\n";

  Object.entries(stats.byExtension)
    .sort((a, b) => b[1].lines - a[1].lines)
    .forEach(([ext, data]) => {
      result += `| .${ext} | ${data.files}개 | ${data.lines.toLocaleString()}줄 |\n`;
    });

  return result;
}
```

---

## 파일시스템 보안 고려사항

### MCP개발에서 보안의 중요성

MCP서버가 파일시스템에 접근할 때는 보안이 매우 중요합니다. Model Context Protocol 기반 서버를 개발할 때 반드시 고려해야 할 사항들입니다.

```typescript
// 경로 보안 검증 유틸리티 - MCP서버 필수 보안
function validatePath(inputPath: string, allowedBase?: string): string {
  // 경로 정규화
  const resolved = path.resolve(inputPath);

  // 경로 이탈 방지 (Path Traversal 공격 차단)
  if (allowedBase) {
    const normalizedBase = path.resolve(allowedBase);
    if (!resolved.startsWith(normalizedBase)) {
      throw new Error(`보안 오류: 허용된 경로 범위를 벗어났습니다`);
    }
  }

  // 심볼릭 링크 확인
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) {
    const realPath = fs.realpathSync(resolved);
    if (allowedBase && !realPath.startsWith(path.resolve(allowedBase))) {
      throw new Error(`보안 오류: 심볼릭 링크가 허용된 범위를 벗어납니다`);
    }
  }

  return resolved;
}
```

### 민감 파일 필터링

AI도구에 노출되면 안 되는 파일들을 필터링합니다:

```typescript
// 민감 파일 패턴 - MCP개발 보안 설정
const SENSITIVE_PATTERNS = [
  /\.env$/,           // 환경 변수
  /\.env\..+$/,       // .env.local, .env.production 등
  /credentials/i,     // 인증 정보
  /secrets?/i,        // 시크릿 파일
  /\.pem$/,           // 인증서
  /\.key$/,           // 키 파일
  /password/i,        // 패스워드 관련
];

function isSensitiveFile(filename: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(filename));
}

// 파일시스템 접근 시 민감 파일 제외
function filterSensitiveFiles(files: string[]): string[] {
  return files.filter(file => !isSensitiveFile(file));
}
```

---

## 통합 테스트

### MCP Inspector로 테스트

프로젝트분석 Tool들을 MCP Inspector로 테스트합니다:

```bash
# 빌드
npm run build

# Inspector 실행
npm run inspect
# 브라우저에서 http://localhost:6274 열기
```

### 테스트 시나리오

```
1. Tools 탭 클릭
2. analyze_structure 선택
   - targetPath: "." (현재 디렉토리)
   - maxDepth: 3
   - includeHidden: false
3. Run Tool 클릭
4. 디렉토리 트리 결과 확인

5. analyze_dependencies 선택
   - targetPath: "."
   - includeDevDeps: true
6. Run Tool 클릭
7. 의존성 목록 확인

8. count_lines 선택
   - targetPath: "."
   - extensions: ["ts", "js"]
9. Run Tool 클릭
10. 코드 통계 확인
```

### Claude Code에서 활용

MCP서버를 Claude Code AI도구에 연결한 후:

```
User: "이 프로젝트를 분석해줘"

Claude Code:
1. analyze_structure로 전체 구조 파악
2. analyze_dependencies로 기술 스택 확인
3. count_lines로 코드베이스 규모 분석

→ 종합적인 프로젝트 분석 보고서 제공
```

---

## 전체 코드 통합

### src/tools/project-analyzer.ts

Model Context Protocol 기반 프로젝트분석 Tool 전체 코드:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// 프로젝트분석 Tool 등록 함수 - MCP개발 모듈화
export function registerProjectAnalyzerTools(server: McpServer) {
  // Tool 1: 구조 분석
  server.tool(
    "analyze_structure",
    "프로젝트 디렉토리 구조를 분석합니다",
    {
      targetPath: z.string().describe("분석할 디렉토리 경로"),
      maxDepth: z.number().optional().default(3),
      includeHidden: z.boolean().optional().default(false),
    },
    async ({ targetPath, maxDepth, includeHidden }) => {
      const resolved = path.resolve(targetPath);
      if (!fs.existsSync(resolved)) {
        return { content: [{ type: "text", text: "경로를 찾을 수 없습니다" }], isError: true };
      }
      const tree = buildDirectoryTree(resolved, maxDepth!, includeHidden!);
      return { content: [{ type: "text", text: `## 프로젝트 구조\n\n\`\`\`\n${tree}\`\`\`` }] };
    }
  );

  // Tool 2: 의존성 분석
  server.tool(
    "analyze_dependencies",
    "package.json 의존성을 분석합니다",
    {
      targetPath: z.string().describe("package.json이 있는 경로"),
      includeDevDeps: z.boolean().optional().default(true),
    },
    async ({ targetPath, includeDevDeps }) => {
      const pkgPath = path.join(path.resolve(targetPath), "package.json");
      if (!fs.existsSync(pkgPath)) {
        return { content: [{ type: "text", text: "package.json을 찾을 수 없습니다" }], isError: true };
      }
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      return { content: [{ type: "text", text: formatDependencyAnalysis(pkg, includeDevDeps!) }] };
    }
  );

  // Tool 3: 코드 통계
  server.tool(
    "count_lines",
    "코드 라인 수를 분석합니다",
    {
      targetPath: z.string().describe("분석할 디렉토리"),
      extensions: z.array(z.string()).optional().default(["ts", "tsx", "js", "jsx"]),
    },
    async ({ targetPath, extensions }) => {
      const resolved = path.resolve(targetPath);
      if (!fs.existsSync(resolved)) {
        return { content: [{ type: "text", text: "경로를 찾을 수 없습니다" }], isError: true };
      }
      const stats = await analyzeCodeLines(resolved, extensions!);
      return { content: [{ type: "text", text: formatCodeStats(stats) }] };
    }
  );
}

// ... 헬퍼 함수들 (위에서 정의한 것들)
```

### src/index.ts 업데이트

MCP서버 메인 파일에 프로젝트분석 Tool을 등록합니다:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProjectAnalyzerTools } from "./tools/project-analyzer.js";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// 기존 Tool들 (Day 1에서 구현)
// ...

// 프로젝트분석 Tool 등록 (Day 3)
registerProjectAnalyzerTools(server);

// Resource와 Prompt (Day 2에서 구현)
// ...

// 서버 시작
const transport = new StdioServerTransport();
server.connect(transport);
console.error("MCP 서버 시작됨!");
```

---

## 요약

Day 3에서 배운 MCP개발 핵심 내용:

1. **실전 프로젝트분석 Tool 구현**
   - `analyze_structure`: 디렉토리 구조 분석으로 AI도구에 컨텍스트 제공
   - `analyze_dependencies`: package.json 분석으로 기술 스택 파악
   - `count_lines`: 코드 통계로 프로젝트 규모 분석

2. **파일시스템 접근 패턴**
   - Node.js fs 모듈로 TypeScript 기반 파일 처리
   - glob 패턴 매칭으로 효율적인 파일 탐색
   - MCP서버 성능 최적화 (불필요한 디렉토리 제외)

3. **보안 고려사항**
   - 경로 이탈 방지 (Path Traversal 공격 차단)
   - 민감 파일 필터링
   - Model Context Protocol 기반 안전한 파일시스템 접근

### MCP개발 핵심 패턴

```typescript
// 파일시스템 Tool 패턴 - Model Context Protocol
server.tool(
  "tool_name",
  "설명",
  { targetPath: z.string(), ...options },
  async ({ targetPath, ...options }) => {
    // 1. 경로 검증
    const resolved = path.resolve(targetPath);
    // 2. 파일시스템 접근
    // 3. 결과 포맷팅
    return { content: [{ type: "text", text: result }] };
  }
);
```

---

## 다음 편 예고

**Day 4: MCP 서버 npm 배포하기**

Day 4에서는 MCP개발 결과물을 세상에 공유합니다:

- npm 패키지 구조화 및 배포 설정
- TypeScript 빌드 최적화
- README.md 작성 가이드
- npx로 바로 실행 가능한 MCP서버 만들기
- 사용자 설치 및 설정 가이드

---

## 참고 자료

### 공식 문서
- [MCP 공식 스펙 - Server](https://modelcontextprotocol.io/specification/2025-06-18/server)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Node.js fs 모듈](https://nodejs.org/api/fs.html)

### 시리즈 링크
- [Day 1: Model Context Protocol 개념과 첫 서버](/mcp-day1-introduction-and-first-server)
- [Day 2: Resource와 Prompt 구현](/mcp-day2-resource-and-prompt)
- Day 4: npm 배포 (예정)
- Day 5: 고급 패턴 (예정)
