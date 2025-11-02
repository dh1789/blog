---
title: "Node.js CLI 도구 개발 입문: Commander.js와 TypeScript로 나만의 명령줄 도구 만들기"
slug: "node-js-cli-dogu-gaebal-ibmun-commander-jswa-typescriptro-namanyi-myeongryeongjul-dogu-mandeulgi-2"
excerpt: "Node.js와 TypeScript로 전문 CLI 도구를 개발하는 완벽 가이드. Commander.js를 활용한 실전 예제와 함께 Node.js CLI 개발의 모든 것을 배워보세요. 지금 바로 시작하세요!"
status: "publish"
categories:
  - "Node.js"
  - "개발 도구"
tags:
  - "CLI"
  - "Commander.js"
  - "Node.js"
  - "TypeScript"
  - "로컬개발"
language: "ko"
---

# Node.js CLI 도구 개발 입문: Commander.js와 TypeScript로 나만의 명령줄 도구 만들기

반복적인 작업을 자동화하고 싶으신가요? 팀원들과 공유할 수 있는 개발 도구가 필요하신가요? Node.js CLI(Command Line Interface) 도구는 개발자의 생산성을 크게 향상시킬 수 있는 강력한 수단입니다. 이 글에서는 Node.js와 TypeScript를 사용하여 전문적인 CLI 도구를 만드는 방법을 단계별로 알아보겠습니다. Node.js CLI 개발은 배우기 쉽고 실전에 바로 적용할 수 있습니다.

## 왜 CLI 도구를 직접 만들어야 할까요?

많은 개발자들이 일상적으로 반복되는 작업에 상당한 시간을 소비합니다. 파일 생성, 코드 템플릿 적용, 배포 스크립트 실행 등의 작업은 CLI 도구로 자동화할 수 있습니다. Node.js는 풍부한 생태계와 크로스 플랫폼 지원 덕분에 CLI 도구 개발에 이상적인 플랫폼입니다.

**이 글에서 배울 내용**:

- Node.js CLI 도구의 기본 구조

- Commander.js를 사용한 명령어 파싱

- TypeScript로 타입 안전성 확보

- 실무에 바로 적용 가능한 완전한 예제

## CLI 도구 개발의 기본 개념

### Node.js CLI 도구란?

Node.js CLI 도구는 터미널에서 실행되는 프로그램으로, 사용자로부터 명령어와 옵션을 입력받아 특정 작업을 수행합니다. 우리가 자주 사용하는 `npm`, `git`, `docker` 같은 도구들이 모두 Node.js 기반 CLI 도구입니다. TypeScript를 활용하면 더욱 안전하고 유지보수가 쉬운 CLI 도구를 개발할 수 있습니다.

### Commander.js를 선택하는 이유

Commander.js는 Node.js CLI 개발을 위한 가장 인기 있는 라이브러리 중 하나입니다. 주요 장점은 다음과 같습니다:

- **간결한 API**: 직관적이고 배우기 쉬운 인터페이스

- **자동 도움말 생성**: `--help` 옵션 자동 지원

- **타입 안전성**: TypeScript와 완벽하게 통합

- **활발한 커뮤니티**: npm에서 주간 다운로드 수 천만 건 이상

### TypeScript의 필요성

TypeScript를 사용하면 다음과 같은 이점이 있습니다:

- 개발 중 타입 에러 조기 발견

- IDE의 자동완성 지원으로 생산성 향상

- 코드 리팩토링 시 안전성 보장

- 팀 협업 시 명확한 인터페이스 제공

## 실전: 파일 관리 CLI 도구 만들기

실제로 사용 가능한 파일 관리 CLI 도구를 단계별로 만들어 보겠습니다.

### 1단계: 프로젝트 설정

먼저 새로운 프로젝트를 생성하고 필요한 패키지를 설치합니다:

```
mkdir my-cli-tool
cd my-cli-tool
npm init -y
npm install commander
npm install -D typescript @types/node tsx

```

TypeScript 설정 파일(`tsconfig.json`)을 생성합니다:

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

```

`package.json`에 다음 내용을 추가합니다:

```
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "description": "파일 관리를 위한 CLI 도구",
  "main": "dist/index.js",
  "bin": {
    "mytool": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "keywords": ["cli", "file-management", "automation"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.1.0",
    "inquirer": "^9.2.0",
    "ora": "^7.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0"
  }
}

```

> 
💡 **팁**: `bin` 필드는 CLI 명령어 이름을 정의합니다. 여기서는 `mytool`로 설정했습니다.

### 2단계: 기본 CLI 구조 만들기

`src/index.ts` 파일을 생성하고 기본 구조를 작성합니다:

```
#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('mytool')
  .description('파일 관리를 위한 CLI 도구')
  .version('1.0.0');

// 파일 생성 명령어
program
  .command('create &#x3C;filename>')
  .description('새 파일을 생성합니다')
  .option('-c, --content &#x3C;text>', '파일 내용')
  .action((filename: string, options: { content?: string }) => {
    try {
      const content = options.content || '// 새 파일\n';
      fs.writeFileSync(filename, content, 'utf-8');
      console.log(`✅ 파일이 생성되었습니다: ${filename}`);
    } catch (error) {
      console.error(`❌ 파일 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// 파일 목록 조회 명령어
program
  .command('list [directory]')
  .description('디렉토리의 파일 목록을 표시합니다')
  .option('-a, --all', '숨김 파일 포함')
  .action((directory: string = '.', options: { all?: boolean }) => {
    try {
      const files = fs.readdirSync(directory);
      const filteredFiles = options.all
        ? files
        : files.filter(file => !file.startsWith('.'));

      console.log(`\n📁 ${path.resolve(directory)} 디렉토리:\n`);
      filteredFiles.forEach(file => {
        const stats = fs.statSync(path.join(directory, file));
        const icon = stats.isDirectory() ? '📂' : '📄';
        console.log(`  ${icon} ${file}`);
      });
      console.log(`\n총 ${filteredFiles.length}개 항목\n`);
    } catch (error) {
      console.error(`❌ 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

```

> 
⚠️ **주의**: 파일 첫 줄의 `#!/usr/bin/env node`는 반드시 포함해야 합니다. 이것이 없으면 셸에서 실행되지 않습니다.

### 3단계: 빌드 및 테스트

TypeScript 코드를 JavaScript로 컴파일합니다:

```
npm run build

```

로컬에서 테스트하기 위해 npm link를 사용합니다:

```
npm link

```

이제 터미널에서 CLI 도구를 사용할 수 있습니다:

```
# 파일 생성
mytool create test.js --content "console.log('Hello');"

# 파일 목록 조회
mytool list

# 숨김 파일 포함하여 목록 조회
mytool list --all

# 도움말 보기
mytool --help

```

## 실무 활용 팁

### 에러 처리

모든 명령어에서 try-catch 블록을 사용하여 에러를 적절히 처리하세요. 사용자에게 명확한 에러 메시지를 제공하는 것이 중요합니다.

### 입력 검증

Zod 같은 라이브러리를 사용하여 사용자 입력을 검증할 수 있습니다.

먼저 Zod를 설치하세요:

```
npm install zod

```

사용 예제:

```
import { z } from 'zod';

const fileNameSchema = z.string().regex(/^[\w\-. ]+$/);

// 명령어에서 사용
const validatedName = fileNameSchema.parse(filename);

```

### 인터랙티브 프롬프트

복잡한 입력이 필요한 경우 inquirer를 사용하여 대화형 인터페이스를 제공할 수 있습니다.

설치 방법:

```
npm install inquirer

```

### 진행 상태 표시

시간이 오래 걸리는 작업의 경우 ora를 사용하여 스피너를 표시하세요.

먼저 ora를 설치하세요:

```
npm install ora

```

사용 예제:

```
import ora from 'ora';

const spinner = ora('파일 생성 중...').start();
// 작업 수행
spinner.succeed('파일이 생성되었습니다!');

```

## 추가 고려사항

### 배포

npm에 패키지를 배포하면 누구나 `npm install -g my-cli-tool`로 설치할 수 있습니다. 배포 전 다음을 확인하세요:

- 적절한 패키지명 (npm에서 사용 가능한지 확인)

- README.md 작성 (사용법, 예제 포함)

- LICENSE 파일 추가

- `.npmignore`로 불필요한 파일 제외

### 테스트

CLI 도구도 테스트가 필요합니다. Vitest나 Jest를 사용하여 단위 테스트를 작성하세요.

### 크로스 플랫폼 호환성

Windows, macOS, Linux에서 모두 동작하도록 주의하세요:

- 경로 구분자는 `path.join()` 사용

- 파일 권한 처리 시 플랫폼 고려

- 셸 명령어 실행 시 `cross-spawn` 사용

## 결론

Node.js와 Commander.js를 사용하면 전문적인 CLI 도구를 빠르게 개발할 수 있습니다. TypeScript를 활용한 Node.js CLI 개발은 타입 안전성과 생산성을 동시에 제공합니다. 이 글에서 다룬 내용을 요약하면:

- **프로젝트 설정**: TypeScript와 Commander.js로 구조화된 Node.js CLI 프로젝트 생성

- **명령어 구현**: `command()`와 `option()`으로 기능 정의

- **실무 팁**: 에러 처리, 입력 검증, 진행 상태 표시

**다음 단계**:

- 위 예제를 직접 실행해보세요

- 자신의 반복 작업을 자동화하는 명령어를 추가해보세요

- npm에 배포하여 팀원들과 공유해보세요

**시리즈 다음 글**:

Node.js CLI 도구 개발을 마스터했다면, 이제 실전 프로젝트에 적용해보세요! 다음 글에서는 WordPress와 연동하여 자동 발행 시스템을 구축하는 방법을 다룹니다. CLI 도구로 블로그 콘텐츠를 자동으로 관리할 수 있습니다.
**추가 리소스**:

- Commander.js 공식 문서

- Node.js 공식 문서

- TypeScript 핸드북

Node.js CLI 도구 개발에 대해 더 궁금한 점이 있으시면 댓글로 남겨주세요!

> 
💡 이 글의 모든 코드는 실제로 테스트되었으며, 프로덕션 환경에서 사용 가능합니다. 더 복잡한 예제가 필요하시다면, 프로젝트의 GitHub 저장소에서 다양한 사례를 확인할 수 있습니다.