# @blog/cli - Task List

AI-Powered WordPress Blog Automation Platform 개발 작업 목록

## Epic 1.0 - Core MVP ✅

- [x] 1.1 AI 초안 생성 (`draft create`)
  - [x] Claude API 연동
  - [x] 프롬프트 템플릿 시스템
  - [x] 마크다운 frontmatter 생성
  - [x] 키워드 및 언어 옵션
- [x] 1.2 AI 초안 수정 (`draft refine`)
  - [x] 기존 초안 읽기
  - [x] 수정 프롬프트 처리
  - [x] 파일 덮어쓰기
- [x] 1.3 WordPress 발행 (`publish`)
  - [x] WordPress REST API 연동
  - [x] 마크다운 → HTML 변환
  - [x] 다국어 지원 (한국어/영어)
  - [x] Draft/Publish 상태 관리
- [x] 1.4 기본 CLI 구조
  - [x] Commander.js 설정
  - [x] 서브커맨드 구조
  - [x] 에러 핸들링
  - [x] 환경 변수 관리

**Status**: ✅ 완료 (Completed)

## Epic 2.0 - Preview System ✅

- [x] 2.1 실시간 프리뷰 서버 (`preview`)
  - [x] Express 서버 구성
  - [x] 마크다운 렌더링
  - [x] WordPress 스타일 적용
  - [x] 포트 자동 선택
- [x] 2.2 Live Reload
  - [x] Socket.io 연동
  - [x] Chokidar 파일 감시
  - [x] 브라우저 자동 새로고침
- [x] 2.3 광고 위치 시각화
  - [x] AdSense 코드 삽입 위치 표시
  - [x] `--show-ads` 옵션
  - [x] 시각적 인디케이터

**Status**: ✅ 완료 (Completed)

## Epic 3.0 - SEO Automation ✅

- [x] 3.1 SEO 메타 태그 자동 생성
  - [x] Title, Description, Keywords
  - [x] Frontmatter 파싱
  - [x] HTML 메타 태그 생성
- [x] 3.2 Open Graph & Twitter Card
  - [x] OG 태그 생성 (title, description, image, url)
  - [x] Twitter Card 태그
  - [x] 소셜 미디어 최적화
- [x] 3.3 키워드 밀도 체크
  - [x] 키워드 빈도 계산
  - [x] 0.5-2.5% 범위 검증
  - [x] 경고 메시지
- [x] 3.4 Slug 자동 변환
  - [x] 한글 → 영문 transliteration
  - [x] SEO 친화적 URL 생성
  - [x] 커스텀 slug 지원

**Status**: ✅ 완료 (Completed)

## Epic 4.0 - Extended MVP ✅

- [x] 4.1 DALL-E 이미지 생성 (`image generate`)
  - [x] OpenAI DALL-E 3 연동
  - [x] 프롬프트 기반 이미지 생성
  - [x] 크기 옵션 (1024x1024, 1792x1024, 1024x1792)
  - [x] 품질 옵션 (standard, HD)
  - [x] 스타일 옵션 (vivid, natural)
  - [x] 로컬 다운로드 및 저장
- [x] 4.2 트렌드 모니터링 (`trending`)
  - [x] Reddit API 연동
  - [x] Hacker News API 연동
  - [x] Twitter API 연동 (선택)
  - [x] 트렌드 점수 계산
  - [x] 키워드 필터링
  - [x] 최소 점수 필터
- [x] 4.3 분석 대시보드 (`analytics`)
  - [x] WordPress 통계 가져오기
  - [x] 조회수 및 댓글 집계
  - [x] 인기 포스트 순위
  - [x] 기간별 필터 (week, month, year)
  - [x] 정렬 옵션 (views, comments)

**Status**: ✅ 완료 (Completed)

## Epic 5.0 - Testing & Documentation 🚧

### 테스팅

- [x] 5.1 Vitest 설정
  - [x] vitest 및 @vitest/coverage-v8 설치
  - [x] packages/core/vitest.config.ts 설정
  - [x] packages/cli/vitest.config.ts 설정
  - [x] coverage provider 설정 (v8)
  - [x] 타임아웃 설정 (600000ms)

- [x] 5.2 Core 모듈 단위 테스트
  - [x] templates.test.ts (15 tests)
  - [x] trending.test.ts (16 tests)
  - [x] analytics.test.ts (15 tests)
  - [x] image.test.ts (18 tests)
  - [x] seo.test.ts (20 tests)
  - [x] preview.test.ts (10 tests, 1 skipped)
  - [x] claude.test.ts (15 tests, 10 skipped)
  - [x] draft-to-publish integration test (14 tests)
  - [x] 총 112 tests passing

- [x] 5.3 확장 기능 단위 테스트
  - [x] DALL-E 이미지 생성 테스트 (Epic 4.0에서 완료)
  - [x] 트렌드 모니터링 테스트 (Epic 4.0에서 완료)
  - [x] 분석 대시보드 테스트 (Epic 4.0에서 완료)

- [ ] 5.4 WordPress 통합 테스트
  - [ ] 실제 WordPress 인스턴스 연결 테스트
  - [ ] 포스트 발행 통합 테스트
  - [ ] 포스트 목록/삭제 통합 테스트
  - [ ] 이미지 업로드 통합 테스트
  - [ ] 인증 실패 시나리오 테스트

- [ ] 5.5 전체 워크플로우 통합 테스트
  - [ ] 초안 생성 → 수정 → 발행 전체 플로우
  - [ ] 이미지 생성 → WordPress 업로드 플로우
  - [ ] 트렌드 모니터링 → 초안 생성 플로우
  - [ ] 프리뷰 → 발행 플로우

- [x] 5.6 테스트 커버리지 측정
  - [x] Core 패키지 커버리지: 82.01% ✅ (목표: 80%)
  - [x] CLI 패키지 커버리지: 67.18% ✅ (목표: 60%)
  - [x] coverage 리포트 생성 (text, json, html)
  - [x] utils 디렉토리 제외 설정

- [ ] 5.7 수동 테스트
  - [ ] WordPress 사이트에 실제 발행 테스트
  - [ ] SEO 메타 태그 검증
  - [ ] 광고 위치 확인
  - [ ] 모바일 반응형 확인
  - [ ] 소셜 미디어 공유 테스트

### 문서화

- [x] 5.8 README.md 업데이트
  - [x] 주요 기능 섹션 (Epic 1-4 모든 기능)
  - [x] 설치 가이드 (5단계, 환경 변수 설명)
  - [x] 사용법 예제 (9개 명령어 그룹)
  - [x] 마크다운 파일 형식 설명
  - [x] 프로젝트 구조 다이어그램
  - [x] 테스팅 현황 (167 tests, coverage)
  - [x] 개발 명령어
  - [x] 기술 스택 목록
  - [x] 로드맵 (Epic 1-5 상태)

- [x] 5.9 CHANGELOG.md 작성
  - [x] v0.1.0 릴리스 노트
  - [x] Epic별 기능 정리 (Added 섹션)
  - [x] 기술 세부사항 (Technical Details)
  - [x] 환경 변수 설정 가이드
  - [x] 파일 구조 설명
  - [x] Known Limitations
  - [x] 설치 가이드
  - [x] Keep a Changelog 형식 준수

- [x] 5.10 사용자 가이드 작성
  - [x] 시작하기 (Getting Started)
  - [x] 기본 워크플로우
  - [x] WordPress 설정 가이드
  - [x] 트러블슈팅 가이드 및 FAQ

**Status**: 🚧 진행 중 (In Progress - 8/10 완료)

## Epic 6.0 - Future Enhancements 📋

- [ ] 6.1 WordPress 미디어 라이브러리 통합
  - [ ] 이미지 자동 업로드
  - [ ] 미디어 관리 기능
  - [ ] 이미지 최적화

- [ ] 6.2 일괄 업로드/업데이트
  - [ ] 여러 포스트 동시 발행
  - [ ] 기존 포스트 일괄 업데이트
  - [ ] CSV/JSON 임포트

- [ ] 6.3 스케줄 발행
  - [ ] 예약 발행 기능
  - [ ] cron 통합
  - [ ] 발행 일정 관리

- [ ] 6.4 성능 분석
  - [ ] Core Web Vitals 측정
  - [ ] Lighthouse 통합
  - [ ] 성능 최적화 제안

- [ ] 6.5 다국어 콘텐츠 자동 번역
  - [ ] DeepL API 연동
  - [ ] 다국어 포스트 관리
  - [ ] 언어별 SEO 최적화

- [ ] 6.6 GitHub Actions CI/CD
  - [ ] 자동 테스트 실행
  - [ ] 자동 배포
  - [ ] 릴리스 자동화

**Status**: 📋 계획됨 (Planned)

---

## 현재 진행 상황

**Epic 5.0 - Task 5.10: 사용자 가이드 작성**

다음 서브태스크:
1. docs/ 디렉토리 생성
2. 시작하기 가이드 작성
3. 기본 워크플로우 문서화
4. WordPress 설정 상세 가이드
5. 트러블슈팅 및 FAQ

---

## Relevant Files

### Core Package (`packages/core/`)
- `src/claude.ts` - Claude AI 통합, 초안 생성/수정
- `src/wordpress.ts` - WordPress REST API 클라이언트
- `src/markdown.ts` - 마크다운 파싱 및 HTML 변환
- `src/seo.ts` - SEO 메타 태그 생성, 키워드 밀도 체크, slug 변환
- `src/ads.ts` - Google AdSense 코드 자동 삽입
- `src/preview.ts` - 실시간 프리뷰 서버 (Express, Socket.io)
- `src/templates.ts` - AI 프롬프트 템플릿 시스템
- `src/image.ts` - DALL-E 3 이미지 생성
- `src/trending.ts` - Reddit/HN/Twitter 트렌드 모니터링
- `src/analytics.ts` - WordPress 분석 대시보드

### CLI Package (`packages/cli/`)
- `src/commands/draft/create.ts` - AI 초안 생성 명령어
- `src/commands/draft/refine.ts` - AI 초안 수정 명령어
- `src/commands/publish.ts` - WordPress 발행 명령어
- `src/commands/preview.ts` - 실시간 프리뷰 명령어
- `src/commands/image.ts` - DALL-E 이미지 생성 명령어
- `src/commands/trending.ts` - 트렌드 모니터링 명령어
- `src/commands/analytics.ts` - 분석 대시보드 명령어
- `src/commands/list.ts` - 포스트 목록 조회
- `src/commands/delete.ts` - 포스트 삭제
- `src/commands/config.ts` - WordPress 연결 설정

### Shared Package (`packages/shared/`)
- `src/types.ts` - 공유 TypeScript 타입 정의
- `src/schemas.ts` - Zod 스키마 정의

### Test Files
- `packages/core/src/*.test.ts` - Core 모듈 단위 테스트 (112 tests)
- `packages/cli/src/commands/*.test.ts` - CLI 명령어 테스트 (55 tests)
- `packages/core/vitest.config.ts` - Core 테스트 설정
- `packages/cli/vitest.config.ts` - CLI 테스트 설정

### Documentation
- `README.md` - 프로젝트 전체 문서 (380줄, Epic 1-5 커버)
- `CHANGELOG.md` - v0.1.0 릴리스 노트
- `process-task-list.md` - 작업 관리 가이드라인
- `tasks.md` - 전체 작업 목록 (본 파일)

### Configuration
- `package.json` - Monorepo root 설정
- `pnpm-workspace.yaml` - pnpm workspace 설정
- `.env.example` - 환경 변수 템플릿
- `.gitignore` - Git 제외 파일 (ref/ 포함)

### Content & Templates
- `prompts/blog-post.txt` - 기본 블로그 포스트 템플릿
- `prompts/review.txt` - 리뷰 포스트 템플릿 (예정)
- `prompts/tutorial.txt` - 튜토리얼 포스트 템플릿 (예정)
- `content/drafts/` - AI 생성 초안 저장 디렉토리
- `content/posts/ko/` - 한국어 포스트
- `content/posts/en/` - 영어 포스트

---

## Test Results

### Latest Test Run (2025-10-27)

**Core Package:**
- Test Files: 8 passed
- Tests: 112 passed | 11 skipped (123 total)
- Coverage: 82.01% ✅
- Duration: 15.36s

**CLI Package:**
- Test Files: 6 passed | 1 skipped
- Tests: 55 passed | 14 skipped (69 total)
- Coverage: 67.18% ✅
- Duration: 382ms

**Total: 167 tests passing**

---

## Git History

**Latest Commits:**
1. `13b42ac` - docs: Epic 5.0 - 문서화 및 테스팅 완료 (2025-10-27)
2. `031ff7f` - feat: Epic 4.0 완료 - Extended MVP (이미지, 트렌드, 분석) (2025-10-27)
3. Earlier commits for Epic 1-3

**Branch:** main
**Remote:** origin/main (up to date)
