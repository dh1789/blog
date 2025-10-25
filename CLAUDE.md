# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Claude Code 작업 설정

**IMPORTANT**: 이 프로젝트의 모든 작업에서 `--ultrathink` 모드를 사용합니다.
- 최대 깊이 분석 (~32K tokens)
- 모든 MCP 서버 통합 활성화 (`--seq --c7 --all-mcp`)
- 비즈니스 의사결정, 아키텍처 설계, 복잡한 문제 해결에 필수

---

## 프로젝트 개요

**프로젝트명**: WordPress Content Automation CLI
**목적**: WordPress + Avada 테마 기반 블로그의 콘텐츠 작성/관리/광고 수익 최적화 자동화 도구

### 핵심 가치 제안
- 마크다운으로 로컬에서 편하게 작성 → 자동으로 WordPress 업로드
- 광고 코드 자동 삽입으로 수익 최적화
- 한국어/영어 다국어 콘텐츠 효율적 관리
- 반복 작업 자동화로 콘텐츠 생산에 집중

### 프로젝트 컨텍스트
- **WordPress 환경**: WordPress + Avada 프리미엄 테마 (ref/Avada_Full_Package/ 참고)
- **수익 모델**: Google AdSense 광고를 통한 블로그 수익 창출
- **다국어**: 한국어 메인, 영어 지원
- **사용자**: 블로거 본인 (개발자)

---

## 기술 스택

### Core 기술
- **Runtime**: Node.js 20+ (LTS)
- **Language**: TypeScript 5.3+
- **Package Manager**: pnpm 8+ (workspace 기능 활용)
- **Build Tool**: tsup (esbuild 기반, 빠른 빌드)

### 주요 라이브러리
| 라이브러리 | 역할 | 선정 이유 |
|-----------|------|----------|
| `wpapi` | WordPress REST API 클라이언트 | WordPress 전용 설계, 인증 자동 처리 |
| `gray-matter` | 마크다운 frontmatter 파싱 | 메타데이터 추출 |
| `unified` + `remark` | 마크다운 → HTML 변환 | 플러그인 아키텍처로 광고 삽입 커스터마이징 가능 |
| `commander` | CLI 프레임워크 | npm CLI 도구 표준, 간결한 API |
| `inquirer` | 인터랙티브 프롬프트 | 사용자 입력 처리 |
| `ora` | 터미널 스피너 | 작업 진행 상태 표시 |
| `chalk` | 터미널 컬러링 | 가독성 향상 |
| `zod` | 런타임 타입 검증 | TypeScript 타입과 런타임 검증 통합 |

### 기술 스택 선정 근거
1. **WordPress 생태계 호환성** (30%): REST API 연동이 핵심
2. **개발 생산성** (25%): 빠른 MVP 개발
3. **유지보수성** (20%): 장기적 확장 고려
4. **성능** (15%): 대량 콘텐츠 처리
5. **커뮤니티 지원** (10%): 한국어 자료, 활발한 생태계

---

## 프로젝트 구조

```
blog/
├── packages/               # Monorepo 패키지들
│   ├── cli/               # CLI 도구 (사용자 인터페이스)
│   │   ├── src/
│   │   │   ├── index.ts           # CLI 진입점
│   │   │   ├── commands/          # 명령어 구현
│   │   │   │   ├── publish.ts     # blog publish 명령
│   │   │   │   ├── list.ts        # blog list 명령
│   │   │   │   ├── delete.ts      # blog delete 명령
│   │   │   │   └── config.ts      # blog config 명령
│   │   │   └── utils/             # CLI 유틸리티
│   │   │       └── config.ts      # 설정 로드
│   │   └── package.json           # bin: "blog" 명령
│   │
│   ├── core/              # 핵심 로직
│   │   ├── src/
│   │   │   ├── index.ts           # 공개 API
│   │   │   ├── wordpress.ts       # WordPress REST API 클라이언트
│   │   │   ├── markdown.ts        # 마크다운 파싱 및 변환
│   │   │   └── ads.ts             # 광고 코드 삽입
│   │   └── package.json
│   │
│   └── shared/            # 공유 타입 및 유틸리티
│       ├── src/
│       │   ├── index.ts           # 공개 API
│       │   ├── types.ts           # TypeScript 타입 정의
│       │   ├── schemas.ts         # Zod 스키마 (런타임 검증)
│       │   └── utils.ts           # 공통 유틸리티 함수
│       └── package.json
│
├── content/               # 마크다운 콘텐츠
│   ├── posts/
│   │   ├── ko/           # 한국어 포스트
│   │   └── en/           # 영어 포스트
│   └── templates/        # 포스트 템플릿
│
├── ref/                  # 참고 자료
│   └── Avada_Full_Package/  # Avada 테마 (WordPress에 설치 예정)
│
├── config/               # 설정 파일 (향후 추가)
│
├── .env.example          # 환경 변수 템플릿
├── .gitignore
├── package.json          # 루트 package.json (workspace)
├── pnpm-workspace.yaml   # pnpm workspace 설정
├── tsconfig.json         # 루트 TypeScript 설정
└── CLAUDE.md             # 이 파일
```

### 패키지 간 의존성
```
@blog/cli
  ├── @blog/core
  │   └── @blog/shared
  └── @blog/shared
```

---

## 개발 워크플로우

### 초기 설정
```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 WordPress 연결 정보 입력

# 3. 빌드
pnpm build

# 4. CLI 실행 (로컬)
pnpm dev
```

### 명령어 사용법
```bash
# 포스트 발행
blog publish content/posts/ko/my-post.md

# 초안으로 저장
blog publish content/posts/ko/my-post.md --draft

# 시뮬레이션 모드 (실제 업로드 안 함)
blog publish content/posts/ko/my-post.md --dry-run

# WordPress 연결 설정
blog config

# 포스트 목록 조회 (개발 예정)
blog list

# 포스트 삭제 (개발 예정)
blog delete <post-id>
```

### 마크다운 파일 형식
```markdown
---
title: "포스트 제목"
slug: "post-slug"
excerpt: "포스트 요약"
status: "publish"  # or "draft"
categories:
  - "카테고리1"
  - "카테고리2"
tags:
  - "태그1"
  - "태그2"
language: "ko"  # or "en"
---

# 본문 시작

여기에 마크다운 내용 작성...
```

---

## 주요 기능 구현 상태

### ✅ Phase 1 - MVP (완료)
- [x] 프로젝트 구조 설정
- [x] TypeScript + pnpm workspace 설정
- [x] WordPress API 클라이언트 (`WordPressClient` 클래스)
- [x] 마크다운 파싱 (`parseMarkdownFile` 함수)
- [x] 광고 코드 자동 삽입 (`injectAds` 함수)
- [x] CLI 기본 명령어 (`publish`, `list`, `delete`, `config`)

### 🚧 Phase 2 - 자동화 강화 (예정)
- [ ] 일괄 업로드/업데이트
- [ ] 스케줄 발행
- [ ] SEO 메타데이터 자동 생성
- [ ] 다국어 콘텐츠 관리 개선
- [ ] 이미지 자동 최적화

### 📋 Phase 3 - 수익 최적화 (예정)
- [ ] 광고 위치 A/B 테스팅
- [ ] 성과 분석 대시보드
- [ ] AI 기반 콘텐츠 최적화 제안

---

## 코드 아키텍처

### 핵심 클래스 및 함수

#### `WordPressClient` (packages/core/src/wordpress.ts)
WordPress REST API와 통신하는 핵심 클라이언트

**주요 메서드**:
- `createPost(metadata, content)`: 새 포스트 생성
- `updatePost(postId, metadata, content)`: 기존 포스트 업데이트
- `deletePost(postId)`: 포스트 삭제
- `uploadMedia(filePath)`: 미디어 업로드

**인증**: WordPress Application Password 사용

#### `parseMarkdownFile` (packages/core/src/markdown.ts)
마크다운 파일을 파싱하여 메타데이터와 HTML 추출

**프로세스**:
1. `gray-matter`로 frontmatter 추출
2. Zod 스키마로 메타데이터 검증
3. `unified` 파이프라인으로 마크다운 → HTML 변환

#### `injectAds` (packages/core/src/ads.ts)
HTML 콘텐츠에 광고 코드 자동 삽입

**지원 위치**:
- `top`: 콘텐츠 최상단
- `after-first-paragraph`: 첫 문단 뒤
- `after-first-h2`: 첫 번째 h2 제목 뒤
- `middle`: 콘텐츠 중간
- `bottom`: 콘텐츠 최하단

### 타입 시스템
모든 핵심 타입은 `packages/shared/src/types.ts`에 정의되어 있으며, Zod 스키마(`packages/shared/src/schemas.ts`)로 런타임 검증됩니다.

**주요 타입**:
- `WordPressConfig`: WordPress 연결 정보
- `PostMetadata`: 포스트 메타데이터 (frontmatter)
- `AdConfig`: 광고 설정
- `PublishOptions`: 발행 옵션

---

## 환경 변수

### 필수 환경 변수 (.env)
```bash
# WordPress 연결 설정
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

# 광고 설정
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# 기타 설정
DEFAULT_LANGUAGE=ko
DEFAULT_POST_STATUS=draft
```

### WordPress Application Password 생성 방법
1. WordPress 관리자 → 사용자 → 프로필
2. "Application Passwords" 섹션에서 새 비밀번호 생성
3. 생성된 비밀번호를 `WORDPRESS_APP_PASSWORD`에 설정

---

## 개발 가이드라인

### 코드 스타일
- TypeScript strict 모드 사용
- 함수 및 클래스에 JSDoc 주석 작성
- 라인 끝 공백 제거
- 공백만 있는 라인 제거

### 에러 처리
- 모든 비동기 함수는 try-catch로 에러 처리
- 명확한 에러 메시지 제공 (사용자 친화적)
- WordPress API 에러는 `WordPressClient`에서 래핑하여 재전달

### 테스팅 (향후 추가 예정)
- `vitest` 사용 예정
- 단위 테스트: 핵심 로직 (마크다운 파싱, 광고 삽입)
- 통합 테스트: WordPress API 연동 (모킹)

---

## 빌드 및 배포

### 로컬 빌드
```bash
# 모든 패키지 빌드
pnpm build

# 특정 패키지만 빌드
pnpm --filter @blog/cli build

# 타입 체크
pnpm typecheck
```

### 배포 (향후 계획)
- npm에 배포하여 전역 설치 가능하도록: `npm install -g @blog/cli`
- 또는 GitHub Releases로 바이너리 배포

---

## 문제 해결

### WordPress 연결 실패
1. `WORDPRESS_URL`이 올바른지 확인 (https:// 포함)
2. Application Password가 유효한지 확인
3. WordPress REST API가 활성화되어 있는지 확인 (기본적으로 활성화)
4. 방화벽이나 보안 플러그인이 API 요청을 차단하지 않는지 확인

### pnpm 관련 이슈
```bash
# pnpm 캐시 정리
pnpm store prune

# node_modules 재설치
rm -rf node_modules packages/*/node_modules
pnpm install
```

### TypeScript 타입 에러
```bash
# 타입 체크
pnpm typecheck

# 빌드 전 타입 정의 재생성
pnpm clean && pnpm build
```

---

## 참고 자료

### WordPress REST API
- [공식 문서](https://developer.wordpress.org/rest-api/)
- [wpapi 라이브러리](https://github.com/WP-API/node-wpapi)

### Avada 테마
- 참고 자료: `ref/Avada_Full_Package/`
- [Avada 문서](https://avada.theme-fusion.com/documentation/)

### 개발 도구
- [pnpm workspace](https://pnpm.io/workspaces)
- [tsup](https://github.com/egoist/tsup)
- [unified](https://unifiedjs.com/)

---

## 다음 단계 (Next Steps)

### 즉시 구현 가능한 기능
1. `list` 명령어 완성 (WordPress 포스트 목록 조회)
2. `delete` 명령어 완성 (포스트 삭제)
3. 이미지 자동 업로드 및 경로 변환
4. 콘텐츠 템플릿 시스템

### 중장기 개선 사항
1. 웹 대시보드 추가 (Next.js)
2. 포스트 스케줄링
3. 성과 분석 (조회수, 광고 수익)
4. AI 기반 SEO 최적화 제안

---

## 라이선스

MIT License

---

**마지막 업데이트**: 2025-10-24
**프로젝트 버전**: 0.1.0 (MVP)
