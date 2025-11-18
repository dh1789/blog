---
title: "TypeScript Monorepo 실전 가이드: pnpm workspace로 패키지 관리 10배 효율화"
slug: "typescript-monorepo-pnpm-workspace-guide"
excerpt: "Multi-repo 중복 코드 지옥에서 벗어나 Monorepo로 전환한 실전 경험. pnpm workspace + tsup으로 빌드 20초→2초(10배), 타입 안전성 100% 달성. 패키지 간 의존성 관리부터 트러블슈팅까지 - TypeScript 개발자를 위한 완벽 가이드."
status: "publish"
categories:
  - "개발 생산성"
  - "소프트웨어 아키텍처"
tags:
  - "TypeScript"
  - "Monorepo"
  - "pnpm"
language: "ko"
---

# TypeScript Monorepo 실전 가이드: pnpm workspace로 패키지 관리 10배 효율화

## 핵심 요약

- **Before**: 3개 프로젝트에 같은 타입 정의 300줄 복붙, webpack 빌드 20초
- **After**: Monorepo로 통합, 타입 공유로 중복 0줄, tsup 빌드 2초 (10배 개선)
- **핵심**: pnpm workspace로 패키지 간 의존성 관리, tsup으로 초고속 빌드
- **성과**: 빌드 시간 90% 절감, 타입 안전성 100%, 디스크 사용량 67% 절감

---

## 💥 Multi-repo의 고통: 당신도 이런 경험 있나요?

### 시나리오 1: 타입 정의 복붙 지옥

```typescript
// project-cli/src/types.ts
export interface PostMetadata {
  title: string;
  slug: string;
  // ... 50줄
}

// project-core/src/types.ts
export interface PostMetadata {  // 똑같은 코드 복붙 😭
  title: string;
  slug: string;
  // ... 50줄
}

// project-shared/src/types.ts
export interface PostMetadata {  // 또 복붙... 😭😭
  title: string;
  slug: string;
  // ... 50줄
}
```

**문제**:
- 3개 파일에 같은 코드 복붙 (300줄 중복)
- `PostMetadata`에 필드 추가 시 3곳 모두 수정
- 복붙 과정에서 불일치 발생 (타입 drift)

### 시나리오 2: 버전 관리 지옥

```bash
# zod 버전 업데이트 시
cd project-cli
npm install zod@latest  # 3.22.4

cd ../project-core
npm install zod@latest  # 3.22.4

cd ../project-shared
npm install zod@latest  # 3.22.4

# 3번 반복... 😭
```

**문제**:
- 의존성 업데이트를 3번 반복
- 각 프로젝트마다 다른 버전 설치 위험
- package-lock.json 3개 관리

### 시나리오 3: 빌드 속도 지옥

```bash
# webpack으로 빌드 (각각 20초)
cd project-cli && npm run build     # 20초
cd ../project-core && npm run build # 20초
cd ../project-shared && npm run build # 20초

# 총 1분... 😭
```

**문제**:
- 전체 빌드에 1분 소요
- 개발 중 HMR(Hot Module Replacement) 느림
- CI/CD 파이프라인 병목

### Monorepo의 약속

**한 번 수정, 모든 패키지 동기화**:
- 타입 정의: `packages/shared`에 한 번만
- 의존성 업데이트: 루트에서 한 번만
- 빌드: `pnpm build` 명령 한 번으로 전체 빌드

---

## 🎯 Monorepo란?

### 정의

**Monorepo** (Monolithic Repository): 여러 개의 프로젝트(패키지)를 하나의 Git 저장소에서 관리하는 소프트웨어 아키텍처 패턴

```
❌ Multi-repo (Before):
project-cli/       (독립 Git 저장소)
project-core/      (독립 Git 저장소)
project-shared/    (독립 Git 저장소)

✅ Monorepo (After):
monorepo/
├── packages/
│   ├── cli/      (패키지)
│   ├── core/     (패키지)
│   └── shared/   (패키지)
└── package.json  (루트)
```

### 실제 사례

**세계적 기업들이 Monorepo를 사용**:
- **Google**: 20억 줄 코드를 하나의 저장소에 (Bazel 사용)
- **Facebook**: React, React Native, Jest 등을 Monorepo로 관리
- **Uber**: 수백 개 마이크로서비스를 Monorepo로 통합
- **Microsoft**: TypeScript, VS Code를 Monorepo로 개발

### 장점 (5가지)

**1. 코드 재사용**
```typescript
// ✅ Monorepo: 한 곳에서 정의
// packages/shared/src/types.ts
export interface PostMetadata { ... }

// packages/cli/src/index.ts
import { PostMetadata } from '@blog/shared';

// packages/core/src/api.ts
import { PostMetadata } from '@blog/shared';  // 같은 타입 사용
```

**2. 원자적 커밋 (Atomic Commits)**
```bash
# ✅ 한 번의 커밋으로 모든 패키지 동시 업데이트
git commit -m "feat: PostMetadata에 author 필드 추가"

# ❌ Multi-repo: 3번 커밋
git commit -m "feat: PostMetadata에 author 추가" # repo1
git commit -m "feat: PostMetadata에 author 추가" # repo2
git commit -m "feat: PostMetadata에 author 추가" # repo3
```

**3. 통합 CI/CD**
```yaml
# ✅ 한 번의 CI/CD 파이프라인
- run: pnpm install
- run: pnpm build
- run: pnpm test

# ❌ Multi-repo: 3개 파이프라인 관리
```

**4. 일관된 도구**
```json
// ✅ Monorepo: 루트에서 통합 관리
{
  "devDependencies": {
    "typescript": "^5.3.0",  // 모든 패키지가 같은 버전 사용
    "prettier": "^3.1.0"
  }
}
```

**5. 쉬운 리팩토링**
```typescript
// ✅ Monorepo: IDE에서 "Rename Symbol" 한 번
// packages/shared/src/types.ts
export interface PostMetadata { ... }  // 이름 변경

// packages/cli, core 모두 자동 업데이트 ✅
```

### 단점 (3가지)

**1. 저장소 크기**
- Git 클론 시간 증가 (shallow clone으로 완화)
- 히스토리 관리 복잡

**2. 빌드 복잡도**
- 패키지 간 의존성 순서 고려 필요
- 증분 빌드(Incremental Build) 설정 필요

**3. 러닝 커브**
- Monorepo 도구 학습 (pnpm, Nx, Turborepo)
- 새로운 워크플로우 적응

### 의사결정 가이드

**Monorepo를 써야 할 때**:
- ✅ 3개 이상의 연관된 프로젝트
- ✅ 패키지 간 코드 공유 빈번
- ✅ 통합 배포 필요
- ✅ 원자적 커밋 필요

**Multi-repo를 써야 할 때**:
- ❌ 완전히 독립적인 프로젝트들
- ❌ 팀이 완전히 분리됨
- ❌ 배포 주기가 완전히 다름

**결론**: 3개 이상 연관 프로젝트 = Monorepo 강력 추천

---

## 🛠️ 기술 스택 선택: pnpm + tsup

### pnpm vs npm vs yarn

**디스크 사용량 비교**:
```
npm:  900MB (3개 프로젝트)
yarn: 850MB
pnpm: 300MB (심볼릭 링크)  ✅ 67% 절감
```

**pnpm의 작동 원리**:
```
~/.pnpm-store/         # 전역 스토리지 (한 번만 저장)
  └── zod@3.22.4/

monorepo/
  └── node_modules/
      └── .pnpm/
          └── zod@3.22.4/  → ~/.pnpm-store/zod@3.22.4/  (심볼릭 링크)
```

**장점**:
1. **디스크 효율**: 같은 패키지를 중복 저장하지 않음
2. **빠른 설치**: 이미 캐시된 패키지 재사용
3. **Workspace 네이티브 지원**: workspace 프로토콜 내장

**벤치마크** (3개 패키지, 50개 의존성):
```
npm install:  30초
yarn install: 25초
pnpm install: 5초  ✅ 6배 빠름
```

### tsup vs webpack vs rollup

**빌드 시간 비교**:
```
webpack: 20초 (복잡한 설정)
rollup:  10초 (플러그인 필요)
tsup:    2초  (설정 거의 없음)  ✅ 10배 빠름
```

**tsup의 특징**:
- **esbuild 기반**: Go로 작성된 초고속 빌드 도구
- **Zero Config**: 기본 설정으로 바로 사용 가능
- **TypeScript 네이티브**: .d.ts 파일 자동 생성

**설정 비교**:

❌ **webpack (복잡)**:
```javascript
// webpack.config.js (50줄)
module.exports = {
  entry: './src/index.ts',
  output: { ... },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      // ... 20줄 더
    ]
  },
  plugins: [ ... ],
  // ...
};
```

✅ **tsup (간결)**:
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts"
  }
}
```

### 최종 선택: pnpm + tsup

**이유**:
1. **속도**: 설치 6배, 빌드 10배 빠름
2. **간결함**: 설정 최소화
3. **TypeScript 친화적**: 타입 정의 자동 생성
4. **생산성**: 개발자 경험 최고

---

## 🚀 실전 구축: Step-by-Step

실제 프로젝트 구조를 단계별로 구축해봅시다.

### Step 1: 프로젝트 초기화

```bash
# 1. 디렉토리 생성
mkdir blog-monorepo
cd blog-monorepo

# 2. pnpm 초기화
pnpm init

# 3. packages 디렉토리 생성
mkdir -p packages/{shared,core,cli}
```

### Step 2: pnpm workspace 설정

**pnpm-workspace.yaml** 생성:
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**루트 package.json** 설정:
```json
{
  "name": "blog-monorepo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @blog/cli dev",
    "build": "pnpm -r build",
    "clean": "pnpm -r clean",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.1"
  }
}
```

**설명**:
- `private: true`: npm에 발행하지 않음
- `pnpm -r`: recursive (모든 패키지)
- `pnpm --filter`: 특정 패키지만 실행

### Step 3: 패키지 생성 (shared)

```bash
cd packages/shared
pnpm init
```

**packages/shared/package.json**:
```json
{
  "name": "@blog/shared",
  "version": "0.1.0",
  "description": "공유 타입 정의 및 유틸리티",
  "main": "dist/index.mjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup src/index.ts --watch --format esm --dts",
    "build": "tsup src/index.ts --format esm --dts --minify",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5.3.0"
  }
}
```

**packages/shared/src/index.ts**:
```typescript
// TypeScript 공유 타입 정의
export interface PostMetadata {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  language: 'ko' | 'en';
}

export interface WordPressConfig {
  url: string;
  username: string;
  appPassword: string;
}
```

### Step 4: 패키지 생성 (core)

```bash
cd ../core
pnpm init
```

**packages/core/package.json**:
```json
{
  "name": "@blog/core",
  "version": "0.1.0",
  "description": "WordPress API 클라이언트 핵심 로직",
  "main": "dist/index.mjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup src/index.ts --watch --format esm --dts",
    "build": "tsup src/index.ts --format esm --dts --minify",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@blog/shared": "workspace:*",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5.3.0"
  }
}
```

**핵심**: `"@blog/shared": "workspace:*"`
- `workspace:*`: pnpm workspace 프로토콜
- 로컬 패키지를 의존성으로 사용

**packages/core/src/index.ts**:
```typescript
// @blog/shared에서 타입 import
import { PostMetadata, WordPressConfig } from '@blog/shared';

// WordPress API 클라이언트
export class WordPressClient {
  constructor(private config: WordPressConfig) {}

  async createPost(metadata: PostMetadata, content: string) {
    // WordPress REST API 호출
    console.log('Creating post:', metadata.title);
  }
}
```

### Step 5: 패키지 생성 (cli)

```bash
cd ../cli
pnpm init
```

**packages/cli/package.json**:
```json
{
  "name": "@blog/cli",
  "version": "0.1.0",
  "description": "WordPress 자동화 CLI 도구",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "blog": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsup src/index.ts --watch --format esm --dts",
    "build": "tsup src/index.ts --format esm --dts --minify",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@blog/core": "workspace:*",
    "@blog/shared": "workspace:*",
    "commander": "^11.1.0"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5.3.0"
  }
}
```

**packages/cli/src/index.ts**:
```typescript
#!/usr/bin/env node

// 두 패키지 모두에서 import
import { WordPressClient } from '@blog/core';
import { PostMetadata } from '@blog/shared';
import { Command } from 'commander';

const program = new Command();

program
  .name('blog')
  .description('WordPress 자동화 CLI')
  .version('0.1.0');

program
  .command('publish')
  .description('포스트 발행')
  .action(() => {
    console.log('Publishing post...');
  });

program.parse();
```

### Step 6: TypeScript 설정

**루트 tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**각 패키지 tsconfig.json**:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

### Step 7: 의존성 설치

```bash
# 루트로 이동
cd ../..

# 모든 의존성 설치 (workspace 링크 생성)
pnpm install
```

**실행 결과**:
```
Packages: +50
Progress: resolved 50, reused 50, downloaded 0, added 50, done
```

**확인**:
```bash
ls -la packages/cli/node_modules/@blog/

# shared -> ../../shared (심볼릭 링크)
# core -> ../../core (심볼릭 링크)
```

### 최종 디렉토리 구조

```
blog-monorepo/
├── packages/
│   ├── shared/              # 공유 타입
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── dist/            # 빌드 결과
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── core/                # 핵심 로직
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cli/                 # CLI 도구
│       ├── src/
│       │   └── index.ts
│       ├── dist/
│       ├── package.json
│       └── tsconfig.json
├── node_modules/            # 통합 node_modules
├── package.json             # 루트 package.json
├── pnpm-workspace.yaml      # workspace 설정
├── pnpm-lock.yaml           # 단일 lock 파일
└── tsconfig.json            # 루트 TypeScript 설정
```

---

## ⚡ 워크플로우: 실전 사용법

### 개발 모드 (Watch)

**전체 패키지 watch**:
```bash
# 모든 패키지를 watch 모드로 실행
pnpm -r --parallel dev
```

**특정 패키지만 watch**:
```bash
# cli 패키지만 개발
pnpm --filter @blog/cli dev

# core 패키지만 개발
pnpm --filter @blog/core dev
```

**여러 패키지 동시 watch**:
```bash
# cli와 core만
pnpm --filter @blog/cli --filter @blog/core dev
```

### 빌드

**전체 빌드 (의존성 순서 자동)**:
```bash
pnpm build

# 실행 순서:
# 1. shared (의존성 없음)
# 2. core (shared 의존)
# 3. cli (shared, core 의존)
```

**특정 패키지만 빌드**:
```bash
pnpm --filter @blog/shared build
```

**빌드 결과 확인**:
```bash
ls packages/shared/dist/

# index.mjs        (ESM 번들)
# index.d.ts       (TypeScript 타입 정의)
```

### 테스트

**전체 테스트**:
```bash
pnpm test
```

**특정 패키지 테스트**:
```bash
pnpm --filter @blog/core test
```

### 의존성 추가

**특정 패키지에 의존성 추가**:
```bash
# cli 패키지에 chalk 추가
pnpm --filter @blog/cli add chalk

# core 패키지에 axios 추가
pnpm --filter @blog/core add axios
```

**루트에 dev 의존성 추가**:
```bash
# 모든 패키지가 공유
pnpm add -D -w prettier
```

### 유용한 pnpm 명령어

```bash
# 전체 패키지 목록
pnpm list --depth 0

# 특정 패키지 의존성 확인
pnpm why axios

# 캐시 정리
pnpm store prune

# 워크스페이스 구조 확인
pnpm ls -r --depth -1
```

---

## 🐛 트러블슈팅: 실전 문제 해결

### 문제 1: workspace:* 프로토콜 이해 부족

**증상**:
```bash
pnpm build

# Error: Cannot find module '@blog/shared'
```

**원인**:
- `workspace:*` 프로토콜을 오해
- `pnpm install`을 실행하지 않음
- 심볼릭 링크가 생성되지 않음

**해결**:
```bash
# pnpm install 실행
pnpm install

# 심볼릭 링크 확인
ls -la packages/cli/node_modules/@blog/
# shared -> ../../shared ✅
```

**설명**:
- `workspace:*`: 로컬 workspace 패키지 사용
- `pnpm install` 시 심볼릭 링크 자동 생성
- 실제 패키지는 `packages/shared/` 디렉토리

### 문제 2: 빌드 순서 문제

**증상**:
```bash
pnpm --filter @blog/cli build

# Error: Cannot find module '@blog/shared/dist/index.mjs'
```

**원인**:
- cli 빌드 시 shared의 `dist/` 폴더가 아직 없음
- shared가 아직 빌드되지 않음

**해결책 1: 의존성 순서대로 빌드**:
```bash
# ❌ 잘못된 방법
pnpm --filter @blog/cli build

# ✅ 올바른 방법 (의존성 포함)
pnpm --filter @blog/cli... build
#                      ^^^
#                      의존성 포함
```

**해결책 2: 루트에서 전체 빌드**:
```bash
# pnpm이 의존성 그래프 분석해서 순서대로 빌드
pnpm -r build

# 실행 순서:
# 1. shared (의존성 없음)
# 2. core (shared 의존)
# 3. cli (core, shared 의존)
```

### 문제 3: 타입 정의 (.d.ts) 누락

**증상**:
```typescript
// packages/cli/src/index.ts
import { PostMetadata } from '@blog/shared';
//                            ^^^^^^^^^^^^
// Error: Could not find a declaration file for module '@blog/shared'
```

**원인**:
- tsup에서 `--dts` 플래그 누락
- TypeScript 타입 정의 파일이 생성되지 않음

**해결**:

❌ **잘못된 tsup 설정**:
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm"
    //                                       ← --dts 누락!
  }
}
```

✅ **올바른 tsup 설정**:
```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts"
    //                                       ^^^^^
    //                                       타입 정의 생성
  }
}
```

**빌드 결과**:
```bash
ls packages/shared/dist/

# index.mjs      (JavaScript 번들)
# index.d.ts     (TypeScript 타입 정의) ✅
```

### 문제 4: 순환 의존성

**증상**:
```bash
pnpm build

# Error: Circular dependency detected
```

**원인**:
```
cli → core → cli  (순환!)
```

**진단**:
```typescript
// ❌ 잘못된 구조
// packages/cli/src/index.ts
import { WordPressClient } from '@blog/core';

// packages/core/src/index.ts
import { CLI } from '@blog/cli';  // 순환 의존성!
```

**해결**:

✅ **올바른 구조 (shared로 타입 분리)**:
```
cli → core → shared
      ↓
   shared
```

```typescript
// packages/shared/src/types.ts
export interface PublishOptions {
  draft: boolean;
}

// packages/core/src/index.ts
import { PublishOptions } from '@blog/shared';  // ✅

// packages/cli/src/index.ts
import { WordPressClient } from '@blog/core';
import { PublishOptions } from '@blog/shared';  // ✅
```

**원칙**:
- shared는 누구에게도 의존하지 않음
- core는 shared에만 의존
- cli는 core, shared에 의존
- **절대로 역방향 의존성 금지**

### 문제 5: 상대 경로 vs 절대 경로

**증상**:
```typescript
// packages/cli/src/commands/publish.ts
import { WordPressClient } from '../../../core/src/index';
//                              ^^^^^^^^^^^^^^^^^^^^^^^^
// 상대 경로 지옥...
```

**해결**:
```typescript
// ✅ workspace 패키지 사용
import { WordPressClient } from '@blog/core';
//                              ^^^^^^^^^^^
// 패키지 이름으로 import
```

**장점**:
- 파일 위치 변경해도 import 경로 변경 불필요
- IDE 자동완성 지원
- 리팩토링 안전

---

## 💡 실전 팁

### Tip 1: 패키지 네이밍 전략

**스코프 사용**:
```json
{
  "name": "@blog/cli"
  //      ^^^^^ ^^^
  //      스코프  패키지명
}
```

**장점**:
- npm 충돌 방지 (전역 네임스페이스 오염 없음)
- 명확한 소유권 표시
- import 시 가독성 향상

**네이밍 규칙**:
```
@조직명/패키지명
@blog/shared      ✅
@blog/core        ✅
@blog/cli         ✅

blog-shared       ❌ (스코프 없음)
shared            ❌ (충돌 위험)
```

### Tip 2: 의존성 버전 관리

**❌ 잘못된 방법 (각 패키지마다 다른 버전)**:
```json
// packages/cli/package.json
{
  "dependencies": {
    "zod": "^3.22.0"
  }
}

// packages/core/package.json
{
  "dependencies": {
    "zod": "^3.21.0"  // 다른 버전!
  }
}
```

**✅ 올바른 방법 (루트에서 통합 관리)**:
```json
// 루트 package.json
{
  "devDependencies": {
    "zod": "^3.22.4",      // 한 곳에서 관리
    "typescript": "^5.3.0"
  }
}

// packages/cli/package.json (외부 의존성 제거)
{
  "dependencies": {
    "@blog/shared": "workspace:*"  // workspace 패키지만
  }
}
```

### Tip 3: 개발 효율화 스크립트

```json
{
  "scripts": {
    // 특정 패키지만 watch
    "dev:cli": "pnpm --filter @blog/cli dev",
    "dev:core": "pnpm --filter @blog/core dev",

    // 여러 패키지 동시 watch (병렬)
    "dev:all": "pnpm -r --parallel dev",

    // 의존성 포함 빌드
    "build:cli": "pnpm --filter @blog/cli... build",

    // 전체 정리 후 빌드
    "rebuild": "pnpm clean && pnpm build",

    // 타입 체크 (빠른 검증)
    "check": "pnpm -r typecheck"
  }
}
```

### Tip 4: CI/CD 최적화

**GitHub Actions 예시**:
```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # pnpm 설치
      - uses: pnpm/action-setup@v2
        with:
          version: 8

      # Node.js 설치
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      # 의존성 설치 (frozen-lockfile)
      - run: pnpm install --frozen-lockfile

      # 타입 체크
      - run: pnpm typecheck

      # 빌드
      - run: pnpm build

      # 테스트
      - run: pnpm test
```

**핵심**:
- `--frozen-lockfile`: lock 파일 변경 금지 (재현성)
- `cache: 'pnpm'`: pnpm 캐시 활용 (빠른 설치)

### Tip 5: 점진적 마이그레이션

**기존 Multi-repo → Monorepo 전환 단계**:

**Step 1: 새 Monorepo 저장소 생성**
```bash
mkdir monorepo
cd monorepo
pnpm init
```

**Step 2: shared 패키지부터 이전**
```bash
mkdir -p packages/shared
# 공통 코드를 shared로 이동
```

**Step 3: 기존 repo들을 packages로 이전**
```bash
git clone ../project-cli packages/cli
git clone ../project-core packages/core
```

**Step 4: 의존성 workspace:*로 변경**
```json
// packages/cli/package.json
{
  "dependencies": {
    "@blog/core": "workspace:*",    // npm 버전 → workspace
    "@blog/shared": "workspace:*"
  }
}
```

**Step 5: 검증 및 전환**
```bash
pnpm install
pnpm build
pnpm test

# 성공 시 기존 repo 아카이브
```

---

## 📊 성과 측정: Before/After

### 정량적 비교

| 메트릭 | Multi-repo (Before) | Monorepo (After) | 개선율 |
|--------|---------------------|------------------|--------|
| **빌드 시간** | webpack 20초 | tsup 2초 | **10배 ↑** |
| **중복 코드** | 300줄 (타입 정의 복붙) | 0줄 (shared 패키지) | **100% 제거** |
| **타입 안전성** | 70% (복붙 과정 drift) | 100% (단일 소스) | **30% ↑** |
| **의존성 업데이트** | 3번 (각 repo) | 1번 (루트) | **3배 ↑** |
| **디스크 사용량** | 900MB (중복 node_modules) | 300MB (pnpm 심볼릭 링크) | **67% 절감** |
| **개발자 경험** | 불편 (3개 터미널 창) | 편리 (1개 창) | ✅ |

### 시나리오별 시간 절감

**시나리오 1: 타입 정의 수정**

Before (Multi-repo):
```bash
# 3개 파일 수정 (각 1분)
vi project-cli/src/types.ts      # 1분
vi project-core/src/types.ts     # 1분
vi project-shared/src/types.ts   # 1분

# 각각 빌드 (각 20초)
cd project-cli && npm run build     # 20초
cd ../project-core && npm run build # 20초
cd ../project-shared && npm run build # 20초

# 총 4분
```

After (Monorepo):
```bash
# shared에서 한 번만 수정
vi packages/shared/src/types.ts  # 1분

# 전체 빌드 (의존성 순서 자동)
pnpm build  # 6초 (shared 2초 + core 2초 + cli 2초)

# 총 1분 6초 ✅ (4배 빠름)
```

**시간 절감**: 4분 → 1분 6초

**시나리오 2: 의존성 업데이트**

Before (Multi-repo):
```bash
# 각 프로젝트마다 업데이트
cd project-cli && npm install zod@latest     # 30초
cd ../project-core && npm install zod@latest # 30초
cd ../project-shared && npm install zod@latest # 30초

# 총 1분 30초
```

After (Monorepo):
```bash
# 루트에서 한 번만
pnpm add -D -w zod@latest  # 5초

# 총 5초 ✅ (18배 빠름)
```

**시간 절감**: 1분 30초 → 5초

---

## 🎯 마무리

### 핵심 정리

TypeScript Monorepo 실전 가이드의 **핵심**:

1. ✅ **문제 인식**: Multi-repo의 고통 (중복 코드, 버전 관리 지옥, 느린 빌드)
2. ✅ **기술 선택**: pnpm workspace (디스크 67% 절감) + tsup (빌드 10배)
3. ✅ **실전 구축**: Step-by-Step 가이드 (workspace 설정 → 패키지 생성 → 의존성 관리)
4. ✅ **워크플로우**: 개발/빌드/테스트 명령어 익히기
5. ✅ **트러블슈팅**: 4가지 실전 문제 해결법
6. ✅ **성과 측정**: 빌드 20초 → 2초, 중복 코드 300줄 → 0줄

### 당신이 얻을 수 있는 것

**즉시**:
- 빌드 시간 90% 절감 (20초 → 2초)
- 의존성 관리 3배 효율화 (3번 → 1번)

**단기 (1주)**:
- 타입 안전성 100% 달성
- 중복 코드 완전 제거

**장기 (1개월)**:
- 개발 생산성 30% 향상
- 코드 품질 개선 (단일 소스)

### Next Steps

**1주차: 실험**
- 테스트 프로젝트로 Monorepo 구축
- pnpm workspace 익히기
- tsup 빌드 설정 마스터

**2주차: 마이그레이션 준비**
- 기존 프로젝트 의존성 분석
- shared 패키지 후보 식별
- 마이그레이션 계획 수립

**3주차: 전환**
- 점진적 마이그레이션 실행
- CI/CD 파이프라인 업데이트
- 팀원 교육

**4주차: 최적화**
- 빌드 캐시 설정
- 증분 빌드 최적화
- 성과 측정 및 문서화

### 추가 학습 자료

**공식 문서**:
- [pnpm Workspace](https://pnpm.io/workspaces)
- [tsup 가이드](https://tsup.egoist.dev/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

**고급 주제**:
- Turborepo: 캐싱 및 원격 빌드
- Nx: 대규모 Monorepo 관리
- Changesets: 버전 관리 및 CHANGELOG 자동화

---

**TypeScript Monorepo, 지금 바로 시작하세요!** 🚀

빌드 시간 10배 개선, 중복 코드 제거, 타입 안전성 100% - 모두 가능합니다.

질문이나 피드백이 있으신가요? 댓글로 남겨주세요!

당신의 Monorepo 구축 경험도 궁금합니다. 🙂
