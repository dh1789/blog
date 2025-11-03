# 오늘의 포스트 #2: npm 패키지 퍼블리싱 완벽 가이드

**작성일**: 2025-11-03
**예상 길이**: 1800단어
**예상 작성 시간**: 2-2.5시간
**난이도**: 중급
**SEO 목표**: 70점 이상

---

## Frontmatter

```yaml
title: "npm 패키지 퍼블리싱 완벽 가이드: @blog/cli를 전 세계에 배포하기"
excerpt: "TypeScript CLI 도구를 npm에 퍼블리싱하는 전체 과정. package.json 설정부터 자동화 배포, 버전 관리까지 실전 가이드입니다."
categories:
  - "Node.js"
  - "개발 도구"
  - "오픈소스"
tags:
  - "npm"
  - "패키지 배포"
  - "TypeScript"
  - "CLI"
  - "오픈소스"
  - "버전 관리"
status: publish
language: ko
```

---

## 아웃라인

### 서론 (150단어)
- npm 패키지 퍼블리싱의 가치
- @blog/cli를 npm에 배포하는 목표
- 이 가이드의 범위

### Section 1: package.json 설정 (400단어)
- **필수 필드**
  - name: 패키지 이름 (유니크해야 함)
  - version: Semantic Versioning
  - description: 검색 최적화
  - keywords: npm 검색 태그
  - license: MIT 추천
- **배포 관련 필드**
  - files: 배포할 파일 지정
  - main: CommonJS 진입점
  - module: ESM 진입점
  - types: TypeScript 타입 정의
  - bin: CLI 명령어 등록
- **저장소 및 작성자 정보**
  - repository: GitHub 링크
  - author: 작성자 정보
  - bugs: 이슈 트래커 URL

**코드 예제**:
```json
{
  "name": "@blog/cli",
  "version": "1.0.0",
  "description": "마크다운을 WordPress에 자동 발행하는 CLI 도구",
  "keywords": ["cli", "wordpress", "markdown", "automation"],
  "license": "MIT",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "bin": {
    "blog": "dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### Section 2: TypeScript 빌드 설정 (350단어)
- **tsup 설정**
  - 여러 포맷 동시 생성 (CJS, ESM)
  - 타입 정의 자동 생성
  - 소스맵 포함/제외
- **번들링 vs 개별 파일**
  - CLI 도구는 번들링 추천
  - 라이브러리는 개별 파일 추천
- **.npmignore**
  - src/ 디렉토리 제외
  - 테스트 파일 제외
  - 설정 파일 제외

**코드 예제**:
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

### Section 3: npm 계정 및 조직 설정 (300단어)
- **npm 계정 생성**
  - npmjs.com 가입
  - 이메일 인증
  - 2FA 활성화 (보안 강화)
- **Scoped Package vs Public Package**
  - `@username/package` vs `package`
  - 조직 패키지의 장점
- **npm 로그인**
  - `npm login` 명령어
  - 토큰 관리

**코드 예제**:
```bash
# npm 로그인
npm login

# 2FA 설정
npm profile enable-2fa auth-and-writes

# 조직 생성
npm org create my-org
```

### Section 4: 배포 전 체크리스트 (400단어)
- **README.md 작성**
  - 프로젝트 소개
  - 설치 방법
  - 사용 예제
  - API 문서
  - 라이선스 정보
- **테스트 실행**
  - `npm test`로 모든 테스트 통과 확인
  - 커버리지 측정
- **로컬 테스트**
  - `npm link`로 로컬 설치 테스트
  - 실제 사용 시나리오 검증
- **버전 번호 결정**
  - Semantic Versioning (1.0.0)
  - MAJOR.MINOR.PATCH

**코드 예제**:
```bash
# 로컬 테스트
npm run build
npm link
blog --version
npm unlink

# 버전 업데이트
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### Section 5: 퍼블리싱 및 배포 자동화 (350단어)
- **수동 배포**
  - `npm publish` 명령어
  - OTP (One-Time Password) 입력
  - 배포 확인
- **GitHub Actions 자동 배포**
  - 태그 푸시 시 자동 배포
  - npm 토큰 시크릿 설정
  - 릴리스 노트 자동 생성

**코드 예제**:
```bash
# 수동 배포
npm run build
npm publish --access public

# 배포 확인
npm view @blog/cli version
```

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Section 6: 배포 후 관리 (150단어)
- **사용자 피드백**
  - GitHub Issues 모니터링
  - npm 다운로드 통계
- **버전 관리 전략**
  - 버그 수정: PATCH
  - 새 기능: MINOR
  - Breaking Changes: MAJOR
- **Deprecation**
  - 오래된 버전 deprecated 처리

**코드 예제**:
```bash
# 특정 버전 deprecated
npm deprecate @blog/cli@1.0.0 "Use version 2.0.0 or higher"

# 패키지 삭제 (72시간 이내에만 가능)
npm unpublish @blog/cli@1.0.0
```

---

## 핵심 키워드 (SEO)

**Primary**: npm 패키지 배포, npm publish
**Secondary**: TypeScript 패키지, CLI 도구 배포, 오픈소스

---

## 필요한 리소스

### 스크린샷 (선택)
- npm 패키지 페이지
- GitHub Actions 배포 로그
- npm 다운로드 통계

### 참고 링크
- https://docs.npmjs.com/
- https://semver.org/
- @blog/cli GitHub 저장소

---

## 체크리스트

- [ ] 모든 코드 블록에 언어 태그 포함
- [ ] @blog/cli 실제 사례 활용
- [ ] package.json 완전한 예제
- [ ] SEO 점수 60점 이상 확인
- [ ] 내부 링크: Node.js CLI 개발 관련 포스트
- [ ] 결론에 다음 단계 제시 (NPM Badge, 문서화 등)
