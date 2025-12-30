---
title: "MCP 서버 개발 Day 4: npm 패키지로 배포하기 - 전 세계와 공유하는 MCP 서버"
slug: "mcp-day4-npm-package-deployment"
excerpt: "직접 만든 MCP 서버를 npm 패키지로 배포하는 완벽 가이드. package.json 설정부터 npm publish, 사용자 설치 가이드까지 MCP 서버 배포의 모든 과정을 단계별로 설명합니다."
status: "publish"
categories:
  - "MCP"
  - "개발"
tags:
  - "MCP 서버"
  - "npm 배포"
  - "npm 패키지"
  - "TypeScript"
  - "npm publish"
  - "Claude Code"
  - "배포"
language: "ko"
---

## TL;DR

**MCP 서버 배포**, 생각보다 어렵지 않습니다:
- **npm 패키지**로 배포하면 `npx my-mcp-server`로 즉시 실행 가능
- **3단계**: package.json 설정 → npm publish → README 작성
- 오늘 만든 **MCP 패키지**가 전 세계 개발자들에게 공유됩니다

**실습 단계**
- **npm 패키지 구조화**: bin, main, files 설정
- **MCP 서버 배포**: npm publish 전체 과정
- **사용자 가이드 작성**: Claude Code 연결 방법

---

## npm 패키지 구조화

MCP 서버를 npm 패키지로 배포하려면 package.json을 올바르게 설정해야 합니다. **npm 배포**의 첫 번째 단계는 패키지 구조를 정리하는 것입니다.

### 배포용 디렉토리 구조

**MCP 패키지** 배포를 위한 권장 디렉토리 구조입니다:

```
my-first-mcp/
├── dist/                    # 빌드 결과물 (배포 대상)
│   └── index.js             # 번들된 실행 파일
├── src/                     # 소스 코드 (개발용)
│   ├── index.ts             # 진입점
│   ├── tools.ts             # Tool 로직
│   └── tools.test.ts        # 테스트
├── package.json             # 패키지 설정 (핵심!)
├── tsconfig.json            # TypeScript 설정
├── README.md                # 사용자 가이드
├── LICENSE                  # 라이선스
└── CHANGELOG.md             # 변경 이력
```

이 구조에서 **npm 배포** 시 포함되는 것은 `dist/`, `README.md`, `LICENSE`, `package.json`입니다.

### bin 설정: CLI 실행 파일

**MCP 서버**를 명령줄에서 실행할 수 있도록 `bin` 필드를 설정합니다:

```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "bin": {
    "my-first-mcp": "dist/index.js"
  }
}
```

이렇게 설정하면 **MCP 서버 설치** 후 다음과 같이 실행할 수 있습니다:

```bash
# 전역 설치 후
npm install -g my-first-mcp
my-first-mcp  # 직접 실행

# npx로 즉시 실행 (설치 없이)
npx my-first-mcp
```

**중요**: dist/index.js 파일 최상단에 shebang을 추가하세요:

```javascript
#!/usr/bin/env node
// dist/index.js 최상단
```

TypeScript에서는 src/index.ts에 추가합니다:

```typescript
#!/usr/bin/env node
/**
 * MCP 서버 진입점
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// ...
```

### files 필드: 배포 파일 지정

**npm 배포** 시 포함할 파일을 명시적으로 지정합니다:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

**files 필드의 이점**:
- 불필요한 파일(src/, test/, node_modules/) 자동 제외
- **npm 패키지** 크기 최소화
- 민감한 파일 유출 방지

---

## package.json 완성

**MCP 서버 배포**를 위한 완전한 package.json 예시입니다:

```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "description": "MCP 서버 개발 튜토리얼 - 프로젝트 분석 도구",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "my-first-mcp": "dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "claude",
    "claude-code",
    "ai-tools",
    "typescript"
  ],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/my-first-mcp.git"
  },
  "homepage": "https://github.com/username/my-first-mcp#readme",
  "bugs": {
    "url": "https://github.com/username/my-first-mcp/issues"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

### 핵심 필드 설명

| 필드 | 역할 | MCP 서버 배포 팁 |
|------|------|-----------------|
| `name` | 패키지 이름 | npm에서 유일해야 함 |
| `version` | 버전 | semver 준수 |
| `description` | 설명 | **MCP 서버** 기능 요약 |
| `bin` | CLI 실행 파일 | **Claude Code** 연결에 필수 |
| `files` | 배포 파일 | dist만 포함 권장 |
| `keywords` | 검색 키워드 | mcp, claude 포함 권장 |
| `engines` | Node.js 버전 | 20+ 권장 |

### prepublishOnly 스크립트

**npm publish** 실행 전 자동으로 빌드됩니다:

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test"
  }
}
```

이렇게 하면 **npm 배포** 전에 항상 최신 빌드와 테스트가 실행됩니다.

---

## 빌드 설정

### tsc vs tsup

**TypeScript 패키지** 빌드에는 두 가지 주요 옵션이 있습니다:

**tsc (TypeScript Compiler)**:
- 장점: 설정 간단, 추가 의존성 없음
- 단점: 느린 빌드, 번들링 미지원

**tsup (esbuild 기반)**:
- 장점: 매우 빠름, 번들링 지원, 트리 셰이킹
- 단점: 추가 의존성 필요

MCP 서버는 단순한 구조이므로 **tsc**로 충분합니다:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### 빌드 검증

**npm 배포** 전 빌드 결과를 확인합니다:

```bash
# 빌드
npm run build

# 결과 확인
ls -la dist/
# index.js
# index.d.ts (타입 정의)

# 로컬 테스트
node dist/index.js
```

---

## npm 배포

### 1. npm 계정 준비

**npm 배포**를 위해 계정이 필요합니다:

```bash
# 계정 생성 (웹사이트에서도 가능)
npm adduser

# 로그인 확인
npm whoami
```

### 2. 패키지 이름 확인

**npm 패키지** 이름이 사용 가능한지 확인합니다:

```bash
# 이름 검색
npm search my-first-mcp

# 또는 직접 조회
npm view my-first-mcp
# 404 에러면 사용 가능
```

### 3. 배포 전 테스트

**npm 배포** 전 로컬에서 테스트합니다:

```bash
# 패키지 팩 (배포 시뮬레이션)
npm pack

# 결과 확인
tar -tzf my-first-mcp-1.0.0.tgz
# package/dist/index.js
# package/README.md
# package/LICENSE
# package/package.json

# 정리
rm my-first-mcp-1.0.0.tgz
```

### 4. npm publish 실행

드디어 **npm publish**로 배포합니다:

```bash
# 배포
npm publish

# 성공 메시지
# + my-first-mcp@1.0.0
```

**공개 패키지 배포 시**:

```bash
npm publish --access public
```

### 5. 배포 확인

**MCP 패키지**가 정상 배포되었는지 확인합니다:

```bash
# npm에서 확인
npm view my-first-mcp

# 설치 테스트
npx my-first-mcp
```

---

## 버전 관리

**npm 패키지** 버전은 Semantic Versioning을 따릅니다:

```
MAJOR.MINOR.PATCH
  │     │     └── 버그 수정
  │     └──────── 기능 추가 (하위 호환)
  └────────────── 대규모 변경 (하위 비호환)
```

### 버전 업데이트

```bash
# 패치 업데이트 (1.0.0 → 1.0.1)
npm version patch

# 마이너 업데이트 (1.0.1 → 1.1.0)
npm version minor

# 메이저 업데이트 (1.1.0 → 2.0.0)
npm version major

# 배포
npm publish
```

### CHANGELOG.md 작성

**MCP 서버 배포** 시 변경 이력을 기록합니다:

```markdown
# Changelog

## [1.1.0] - 2024-12-03

### Added
- 새로운 Tool: analyze_structure
- Resource 지원 추가

### Fixed
- 시간대 계산 오류 수정

## [1.0.0] - 2024-12-01

### Added
- 초기 릴리스
- get_current_time, calculate Tool 구현
```

---

## README.md 작성

**npm 패키지**의 얼굴인 README.md를 작성합니다. **MCP 서버 설치** 방법을 명확히 안내하는 것이 중요합니다.

### README 필수 섹션

```markdown
# my-first-mcp

MCP(Model Context Protocol) 서버 - 프로젝트 분석 도구

## 설치

### npx로 즉시 실행

​```bash
npx my-first-mcp
​```

### 전역 설치

​```bash
npm install -g my-first-mcp
my-first-mcp
​```

## Claude Code 연결

### 방법 1: claude mcp add 명령어

​```bash
claude mcp add my-first-mcp -- npx my-first-mcp
​```

### 방법 2: 설정 파일 직접 편집

~/.claude/claude_desktop_config.json:

​```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
​```

## 제공 기능

### Tools

| Tool | 설명 |
|------|------|
| `get_current_time` | 현재 시간 조회 |
| `calculate` | 사칙연산 계산기 |
| `analyze_structure` | 프로젝트 구조 분석 |

### Resources

| URI | 설명 |
|-----|------|
| `project://config` | 프로젝트 설정 정보 |

## 라이선스

MIT
```

### 배지 추가

README 상단에 배지를 추가하면 신뢰도가 높아집니다:

```markdown
[![npm version](https://badge.fury.io/js/my-first-mcp.svg)](https://www.npmjs.com/package/my-first-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
```

---

## 사용자 가이드

**MCP 서버 설치** 후 **Claude Code**에 연결하는 방법을 상세히 안내합니다.

### Claude Code 연결 (권장)

**Claude Code**에서 가장 쉬운 연결 방법입니다:

```bash
# MCP 서버 추가
claude mcp add my-first-mcp -- npx my-first-mcp

# 등록 확인
claude mcp list

# 결과
# my-first-mcp: npx my-first-mcp
```

### Claude Desktop 연결

Claude Desktop 앱에서 사용하려면 설정 파일을 편집합니다:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
```

### 프로젝트별 설정 (.mcp.json)

프로젝트 루트에 `.mcp.json` 파일을 만들면 해당 프로젝트에서만 **MCP 서버**가 활성화됩니다:

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
```

**Claude Code**가 프로젝트 폴더를 열면 자동으로 **MCP 패키지**를 감지하고 연결을 제안합니다.

### 연결 테스트

**MCP 서버 설치**가 완료되면 Claude에서 테스트합니다:

```
사용자: "지금 몇 시야?"
Claude: [get_current_time Tool 호출]
        "현재 시간은 2024년 12월 3일 화요일 오후 3시 30분입니다."

사용자: "123 + 456 계산해줘"
Claude: [calculate Tool 호출]
        "123 + 456 = 579입니다."
```

---

## 배포 체크리스트

**npm 배포** 전 확인사항:

### 필수 항목

- [ ] package.json의 name, version, description 설정
- [ ] bin 필드에 실행 파일 경로 설정
- [ ] files 필드로 배포 파일 제한
- [ ] shebang (`#!/usr/bin/env node`) 추가
- [ ] README.md 작성 완료
- [ ] LICENSE 파일 포함
- [ ] npm test 통과
- [ ] npm pack으로 배포 파일 확인

### 권장 항목

- [ ] repository, homepage URL 설정
- [ ] keywords에 mcp, claude 포함
- [ ] engines 필드로 Node.js 버전 명시
- [ ] CHANGELOG.md 작성
- [ ] TypeScript 타입 정의 포함 (types 필드)

---

## 정리

오늘 배운 **MCP 서버 배포** 핵심:

1. **package.json 설정**: bin, files, keywords로 **npm 패키지** 구조화
2. **npm publish**: 3단계로 간단하게 **npm 배포**
3. **사용자 가이드**: **Claude Code** 연결 방법 명확히 안내

이제 여러분의 **MCP 패키지**가 npm에 배포되어 전 세계 개발자들이 `npx`로 바로 사용할 수 있습니다!

## 다음 편 예고

**Day 5: 고급 패턴과 최적화**에서는:
- 외부 API 연동 (GitHub API)
- 캐싱 전략
- 보안 고려사항
- 프로덕션 체크리스트

---

## 시리즈 네비게이션

- [Day 1: MCP란? 개념과 첫 서버 만들기](/ko/mcp-day1-introduction-and-first-server)
- [Day 2: Resource와 Prompt 완전 정복](/ko/mcp-day2-resource-and-prompt)
- [Day 3: 실전 프로젝트 - 프로젝트 분석 MCP 서버](/ko/mcp-day3-practical-project-analyzer)
- **Day 4: npm 패키지로 배포하기** (현재 글)
- Day 5: 고급 패턴과 최적화 (예정)
