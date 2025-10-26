# Task List: AI-Powered Blog Automation Platform

> Generated from: `0001-prd-ai-blog-automation-platform.md`
> Created: 2025-10-25

## Current State Assessment

### Existing Infrastructure
- ✅ Monorepo setup with pnpm workspaces
- ✅ TypeScript configuration across all packages
- ✅ Basic CLI structure (commander)
- ✅ WordPress REST API client (basic implementation)
- ✅ Markdown processing pipeline (unified + remark)
- ✅ Ad injection system (basic implementation)
- ✅ Zod schemas for validation

### Existing Commands
- `blog publish <file>` - WordPress 발행
- `blog list` - 포스트 목록 조회
- `blog delete <postId>` - 포스트 삭제
- `blog config` - 연결 설정

### Gap Analysis
**Missing Core Features**:
- Claude Code headless mode 통합 (AI 초안 생성/수정)
- 프리뷰 서버 (Express + Live Reload)
- SEO 자동화 (메타 태그, Open Graph)
- 프롬프트 템플릿 시스템

**Missing Extended Features**:
- DALL-E 이미지 자동 생성
- 트렌드 모니터링 (Reddit/HN/Twitter)
- 분석 대시보드
- 테스트 커버리지 (현재 0% → 목표 80%)

## Relevant Files

### New Files to Create

**AI Integration (packages/core/src/)**:
- `claude.ts` - Claude Code headless mode 통합
- `claude.test.ts` - Claude 통합 단위 테스트
- `templates.ts` - 프롬프트 템플릿 관리
- `templates.test.ts` - 템플릿 시스템 테스트

**Preview System (packages/core/src/)**:
- `preview.ts` - Express 프리뷰 서버
- `preview.test.ts` - 프리뷰 서버 테스트

**SEO (packages/core/src/)**:
- `seo.ts` - SEO 메타 태그 생성
- `seo.test.ts` - SEO 생성 테스트

**Extended Features (packages/core/src/)**:
- `image.ts` - DALL-E 이미지 생성
- `image.test.ts` - 이미지 생성 테스트
- `trending.ts` - 트렌드 모니터링
- `trending.test.ts` - 트렌드 모니터링 테스트
- `analytics.ts` - 분석 대시보드
- `analytics.test.ts` - 분석 테스트

**CLI Commands (packages/cli/src/commands/)**:
- `draft/create.ts` - AI 초안 생성 명령어
- `draft/refine.ts` - AI 초안 수정 명령어
- `preview.ts` - 프리뷰 명령어
- `image.ts` - 이미지 생성 명령어
- `trending.ts` - 트렌드 모니터링 명령어
- `analytics.ts` - 분석 대시보드 명령어

**Template Files**:
- `prompts/blog-post.txt` - 블로그 포스트 기본 템플릿
- `prompts/tutorial.txt` - 튜토리얼 템플릿
- `prompts/review.txt` - 리뷰 템플릿

**Content Directories**:
- `content/drafts/` - AI 생성 초안 저장 위치

**Integration Tests**:
- `packages/core/src/__tests__/integration/wordpress.integration.test.ts`
- `packages/core/src/__tests__/integration/publish-workflow.integration.test.ts`

**E2E Tests** (optional):
- `tests/e2e/draft-preview-publish.spec.ts`

### Files to Modify

**packages/core/src/**:
- `wordpress.ts` - 미디어 업로드, 메타 태그 지원 추가
- `markdown.ts` - SEO 메타데이터 추출 개선
- `ads.ts` - 광고 삽입 위치 개선 (middle 위치 정확도)
- `index.ts` - 새 모듈 export 추가

**packages/shared/src/**:
- `types.ts` - AI 관련 타입, 프리뷰 타입 추가
- `schemas.ts` - 새 기능용 Zod 스키마 추가

**packages/cli/src/**:
- `index.ts` - 새 명령어 등록 (draft, preview, image, trending, analytics)

**Configuration**:
- `.env.example` - 새 환경 변수 추가 (OPENAI_API_KEY, REDDIT_*, TWITTER_*)
- `package.json` (root, packages/cli, packages/core) - 새 의존성 추가

### Notes

- 단위 테스트는 각 소스 파일과 동일한 디렉토리에 배치 (예: `claude.ts` → `claude.test.ts`)
- 통합 테스트는 `packages/core/src/__tests__/integration/` 디렉토리에 배치
- 테스트 실행: `pnpm test` (전체) 또는 `pnpm test <path>` (특정 파일)
- 테스트 커버리지 목표: 80% 이상

## Tasks

- [ ] 1.0 Core MVP - AI 초안 생성 및 WordPress 발행 시스템
  - [x] 1.1 프로젝트 환경 설정 및 의존성 설치
  - [x] 1.2 프롬프트 템플릿 시스템 구현 (`packages/core/src/templates.ts`)
  - [x] 1.3 Claude Code headless 통합 구현 (`packages/core/src/claude.ts`)
  - [x] 1.4 `blog draft create` CLI 명령어 구현 (`packages/cli/src/commands/draft/create.ts`)
  - [x] 1.5 `blog draft refine` CLI 명령어 구현 (`packages/cli/src/commands/draft/refine.ts`)
  - [x] 1.6 기본 프롬프트 템플릿 파일 작성 (`prompts/blog-post.txt`, `prompts/tutorial.txt`, `prompts/review.txt`)
  - [x] 1.7 content/drafts 디렉토리 생성 및 .gitignore 설정
  - [x] 1.8 기존 `publish` 명령어 개선 (frontmatter 검증 강화)
  - [x] 1.9 Core MVP 통합 테스트 (초안 생성 → 발행 워크플로우)

- [x] 2.0 프리뷰 시스템 구현
  - [x] 2.1 프리뷰 서버 코어 구현 (`packages/core/src/preview.ts` - Express + Socket.io)
  - [x] 2.2 마크다운 → HTML 렌더링 엔진 (WordPress 스타일 CSS 적용)
  - [x] 2.3 광고 삽입 위치 시각화 (빨간 점선 박스 표시)
  - [x] 2.4 파일 감시 및 Live Reload 구현 (chokidar)
  - [x] 2.5 `blog preview` CLI 명령어 구현 (`packages/cli/src/commands/preview.ts`)
  - [x] 2.6 프리뷰 HTML 템플릿 작성 (반응형 디자인)
  - [x] 2.7 자동 브라우저 열기 기능 (open 패키지)
  - [x] 2.8 포트 충돌 처리 로직 (3000 → 3001 → 3002...)
  - [x] 2.9 프리뷰 서버 단위 테스트 작성

- [ ] 3.0 SEO 자동화 시스템
  - [ ] 3.1 SEO 메타 태그 생성 모듈 구현 (`packages/core/src/seo.ts`)
  - [ ] 3.2 Open Graph 태그 생성 로직 (og:title, og:description, og:image, og:url, og:type)
  - [ ] 3.3 Twitter Card 태그 생성 로직
  - [ ] 3.4 키워드 밀도 체크 기능 (0.5-2.5% 경고)
  - [ ] 3.5 한글 slug 자동 영문 변환 (transliteration)
  - [ ] 3.6 기존 `markdown.ts` 개선 (SEO 메타데이터 추출)
  - [ ] 3.7 기존 `wordpress.ts` 개선 (메타 태그를 WordPress에 전송)
  - [ ] 3.8 `publish` 명령어에 SEO 자동화 통합
  - [ ] 3.9 SEO 모듈 단위 테스트 작성

- [ ] 4.0 확장 MVP - 이미지, 트렌드, 분석 기능
  - [ ] 4.1 DALL-E 이미지 생성 모듈 구현 (`packages/core/src/image.ts`)
  - [ ] 4.2 WordPress 미디어 라이브러리 업로드 기능 (`wordpress.ts` 확장)
  - [ ] 4.3 `blog image generate` CLI 명령어 구현 (`packages/cli/src/commands/image.ts`)
  - [ ] 4.4 트렌드 모니터링 모듈 구현 (`packages/core/src/trending.ts` - Reddit, HN, Twitter API)
  - [ ] 4.5 트렌드 점수 계산 및 정렬 로직
  - [ ] 4.6 `blog trending` CLI 명령어 구현 (`packages/cli/src/commands/trending.ts`)
  - [ ] 4.7 분석 대시보드 모듈 구현 (`packages/core/src/analytics.ts` - WordPress API + AdSense API)
  - [ ] 4.8 터미널 UI 구현 (blessed 또는 ink)
  - [ ] 4.9 `blog analytics` CLI 명령어 구현 (`packages/cli/src/commands/analytics.ts`)
  - [ ] 4.10 .env.example 업데이트 (OPENAI_API_KEY, REDDIT_*, TWITTER_*, 등)
  - [ ] 4.11 확장 기능 단위 테스트 작성

- [ ] 5.0 테스팅 및 문서화
  - [ ] 5.1 vitest 설정 및 테스트 인프라 구성
  - [ ] 5.2 Core 모듈 단위 테스트 작성 (claude.ts, templates.ts, preview.ts, seo.ts)
  - [ ] 5.3 확장 기능 단위 테스트 작성 (image.ts, trending.ts, analytics.ts)
  - [ ] 5.4 WordPress 통합 테스트 작성 (모킹 사용)
  - [ ] 5.5 전체 워크플로우 통합 테스트 작성
  - [ ] 5.6 테스트 커버리지 측정 및 80% 달성
  - [ ] 5.7 실제 WordPress 사이트에서 수동 테스트 (포스트 10개 발행)
  - [ ] 5.8 README.md 업데이트 (설치 가이드, 사용법, 예제)
  - [ ] 5.9 CHANGELOG.md 작성 (v0.1.0 릴리스 노트)
  - [ ] 5.10 사용자 가이드 작성 (docs/ 디렉토리)

---

## Phase 2: Sub-Tasks Generated ✅

각 상위 작업이 세부 하위 작업으로 분해되었습니다.

**총 작업 수**: 5개 상위 작업 → 48개 하위 작업

**예상 구현 일정** (PRD 기준):
- Week 1-2: Task 1.0 Core MVP (9 sub-tasks)
- Week 3: Task 2.0 프리뷰 시스템 (9 sub-tasks)
- Week 4: Task 3.0 SEO 자동화 (9 sub-tasks)
- Week 5-6: Task 4.0 확장 MVP (11 sub-tasks)
- Week 6: Task 5.0 테스팅 및 문서화 (10 sub-tasks)

**다음 단계**: 작업 목록을 참고하여 구현을 시작할 수 있습니다.
