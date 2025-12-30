# 태스크 리스트: WordPress 포스트 생성 기능 개선

**PRD 참조**: `tasks/0014-prd-wordpress-post-enhancement.md`
**생성일**: 2024-12-05
**상태**: ✅ 완료 (134 tests: core 91 + cli 25 + system 15 + status 3)

---

## Relevant Files

### 신규 생성 파일

- `packages/core/src/series-detector.ts` - 시리즈 문서 자동 감지 모듈
- `packages/core/src/series-detector.test.ts` - series-detector.ts 단위 테스트
- `packages/core/src/series-navigation.ts` - 시리즈 네비게이션 생성 모듈
- `packages/core/src/series-navigation.test.ts` - series-navigation.ts 단위 테스트
- `packages/core/src/link-converter.ts` - 한영 링크 변환 모듈
- `packages/core/src/link-converter.test.ts` - link-converter.ts 단위 테스트
- `packages/core/src/content-enhancer.ts` - 콘텐츠 강화 모듈 (번역 배너, GitHub 링크)
- `packages/core/src/content-enhancer.test.ts` - content-enhancer.ts 단위 테스트
- `packages/cli/src/commands/status.ts` - 포스트 상태 변경 CLI 명령어
- `packages/cli/src/commands/status.test.ts` - status.ts 단위 테스트

### 수정 대상 파일

- `packages/core/src/wordpress.ts` - 상태 변경 메서드 추가 (`changePostStatus()`)
- `packages/core/src/wordpress.test.ts` - 상태 변경 테스트 추가
- `packages/core/src/index.ts` - 신규 모듈 export 추가
- `packages/cli/src/commands/publish.ts` - 시리즈 기능 통합, --force 옵션 추가
- `packages/cli/src/commands/publish.test.ts` - publish 명령어 테스트 추가
- `packages/cli/src/index.ts` - status 명령어 등록
- `packages/shared/src/types.ts` - SeriesInfo, SeriesDocument 타입 추가
- `packages/shared/src/schemas.ts` - 시리즈 관련 Zod 스키마 추가

---

## Notes

### Testing Requirements

**Unit Testing:**
- 단위 테스트는 테스트 대상 파일과 같은 디렉토리에 배치 (예: `series-detector.ts`와 `series-detector.test.ts`)
- 모든 구현은 Vitest 테스트 프레임워크 사용
- 각 단위 테스트 스위트는 최소 3개 테스트 케이스 포함:
  - **Happy Path**: 정상적인 사용 시나리오 검증
  - **Boundary Conditions**: 경계값 테스트 (빈 입력, null, 최대값 등)
  - **Exception Cases**: 예외 상황 및 에러 처리 검증
  - **Side Effects**: 테스트 독립성, 전역 상태 미영향 확인
- 테스트 실행: `pnpm test` 또는 `npx vitest run`

**System Testing:**
- PRD의 사용자 스토리 기반 시스템 테스트 작성
- 최소 2개의 실제 사용자 시나리오 검증
- **실제 데이터 사용 필수** - 하드코딩 값이나 더미 데이터 금지
- 전체 사용자 워크플로우 시작부터 끝까지 검증

---

## Tasks

- [x] 1.0 시리즈 문서 감지 및 파싱 모듈 구현 (FR-01)
  - [x] 1.1 `SeriesInfo`, `SeriesDocument` 타입 정의 (`packages/shared/src/types.ts`)
  - [x] 1.2 시리즈 관련 Zod 스키마 작성 (`packages/shared/src/schemas.ts`)
  - [x] 1.3 `detectSeriesFromFilename()` 함수 구현 - 파일명에서 시리즈명, Day 번호 추출
  - [x] 1.4 `detectSeriesFromFilename()` 단위 테스트 작성 (Happy Path: 정상 추출)
  - [x] 1.5 `detectSeriesFromFilename()` 단위 테스트 작성 (Boundary: 시리즈 아닌 파일)
  - [x] 1.6 `detectSeriesFromFilename()` 단위 테스트 작성 (Exception: 잘못된 경로)
  - [x] 1.7 `findSeriesDocument()` 함수 구현 - docs/ 폴더에서 매칭 문서 탐색
  - [x] 1.8 `findSeriesDocument()` 단위 테스트 작성 (Happy Path: 문서 발견)
  - [x] 1.9 `findSeriesDocument()` 단위 테스트 작성 (Boundary: 여러 문서 중 최신)
  - [x] 1.10 `findSeriesDocument()` 단위 테스트 작성 (Exception: 문서 없음)
  - [x] 1.11 `parseSeriesDocument()` 함수 구현 - 시리즈 문서에서 URL/GitHub 정보 추출
  - [x] 1.12 `parseSeriesDocument()` 단위 테스트 작성 (Happy Path: 정상 파싱)
  - [x] 1.13 `parseSeriesDocument()` 단위 테스트 작성 (Boundary: 부분 정보만 있음)
  - [x] 1.14 `parseSeriesDocument()` 단위 테스트 작성 (Exception: 잘못된 형식)
  - [x] 1.15 `packages/core/src/index.ts`에 series-detector 모듈 export 추가

- [x] 2.0 시리즈 콘텐츠 강화 모듈 구현 (FR-02, FR-03, FR-04, FR-05)
  - [x] 2.1 `generateSeriesNavigation()` 함수 구현 - 시리즈 네비게이션 마크다운 생성
  - [x] 2.2 `generateSeriesNavigation()` 단위 테스트 작성 (Happy Path: 정상 생성)
  - [x] 2.3 `generateSeriesNavigation()` 단위 테스트 작성 (Boundary: 미작성 포스트 알림)
  - [x] 2.4 `generateSeriesNavigation()` 단위 테스트 작성 (Exception: 빈 시리즈)
  - [x] 2.5 `convertLinksToEnglish()` 함수 구현 - 시리즈 문서 기반 한영 링크 변환
  - [x] 2.6 `convertLinksToEnglish()` 단위 테스트 작성 (Happy Path: 정상 변환)
  - [x] 2.7 `convertLinksToEnglish()` 단위 테스트 작성 (Boundary: 매칭 없는 링크)
  - [x] 2.8 `convertLinksToEnglish()` 단위 테스트 작성 (Side Effect: 원본 미변경)
  - [x] 2.9 `insertTranslationBanner()` 함수 구현 - 영문 포스트 상단 번역 출처 배너
  - [x] 2.10 `insertTranslationBanner()` 단위 테스트 작성 (Happy Path: 배너 삽입)
  - [x] 2.11 `insertTranslationBanner()` 단위 테스트 작성 (Boundary: 이미 배너 있음)
  - [x] 2.12 `insertTranslationBanner()` 단위 테스트 작성 (Exception: 한글 포스트)
  - [x] 2.13 `insertGitHubLink()` 함수 구현 - TL;DR 섹션에 GitHub 링크 삽입
  - [x] 2.14 `insertGitHubLink()` 단위 테스트 작성 (Happy Path: frontmatter 링크)
  - [x] 2.15 `insertGitHubLink()` 단위 테스트 작성 (Boundary: 시리즈 문서 링크)
  - [x] 2.16 `insertGitHubLink()` 단위 테스트 작성 (Exception: 링크 없음)
  - [x] 2.17 `packages/core/src/index.ts`에 series-navigation, link-converter, content-enhancer 모듈 export 추가

- [x] 3.0 포스트 상태 변경 CLI 명령어 구현 (FR-07)
  - [x] 3.1 `WordPressClient.changePostStatus()` 메서드 구현 (`packages/core/src/wordpress.ts`)
  - [x] 3.2 `changePostStatus()` 단위 테스트 작성 (Happy Path: 상태 변경)
  - [x] 3.3 `changePostStatus()` 단위 테스트 작성 (Boundary: 이미 같은 상태)
  - [x] 3.4 `changePostStatus()` 단위 테스트 작성 (Exception: 포스트 없음)
  - [x] 3.5 `WordPressClient.getPostBySlug()` 메서드 구현 - 상세 정보 포함 조회
  - [x] 3.6 `getPostBySlug()` 단위 테스트 작성 (5개 케이스)
  - [x] 3.7 `status` CLI 명령어 구현 (`packages/cli/src/commands/status.ts`)
  - [x] 3.8 `status` 명령어 테스트 작성 - `--publish` 옵션
  - [x] 3.9 `status` 명령어 테스트 작성 - `--draft` 옵션
  - [x] 3.10 `status` 명령어 테스트 작성 - 상태 조회 (옵션 없음)
  - [x] 3.11 `packages/cli/src/index.ts`에 status 명령어 등록

- [x] 4.0 publish 명령어 통합 및 --force 옵션 추가 (FR-06, FR-08)
  - [x] 4.1 `publish` 명령어에 `--force` 옵션 추가 (Commander.js 설정)
  - [x] 4.2 기존 publish 포스트 감지 시 확인 프롬프트 로직 구현
  - [x] 4.3 시리즈 감지 로직 통합 - `detectSeriesFromFilename()` 호출
  - [x] 4.4 시리즈 문서 탐색 및 파싱 로직 통합 - `findSeriesDocument()`, `parseSeriesDocument()` 호출
  - [x] 4.5 시리즈 네비게이션 자동 삽입 로직 통합 - `generateSeriesNavigation()` 호출
  - [x] 4.6 영문 포스트 링크 변환 로직 통합 - `convertLinksToEnglish()` 호출
  - [x] 4.7 번역 배너 삽입 로직 통합 - `insertTranslationBanner()` 호출
  - [x] 4.8 GitHub 링크 삽입 로직 통합 - `insertGitHubLink()` 호출
  - [x] 4.9 `--force` 옵션 단위 테스트 작성 (Happy Path: 경고 없이 업데이트)
  - [x] 4.10 시리즈 통합 단위 테스트 작성 (Happy Path: 전체 워크플로우)
  - [x] 4.11 시리즈 통합 단위 테스트 작성 (Boundary: 시리즈 문서 없음)

- [x] 5.0 시스템 테스트 및 문서화
  - [x] 5.1 시스템 테스트 1: 시리즈 포스트 신규 발행 시나리오 (US-01, US-02)
  - [x] 5.2 시스템 테스트 2: 기존 드래프트 업데이트 및 발행 시나리오 (US-06, US-08)
  - [x] 5.3 시스템 테스트 3: 영문 포스트 링크 자동 변환 시나리오 (US-03, US-04)
  - [x] 5.4 시스템 테스트 4: 포스트 상태 변경 CLI 시나리오 (US-07)
  - [x] 5.5 CLAUDE.md 업데이트 - 신규 CLI 옵션 및 시리즈 기능 문서화
  - [x] 5.6 README.md 업데이트 - 사용법 예시 추가
  - [x] 5.7 프로덕션 통합 검증 - 모든 신규 코드가 실제 호출되는지 확인

---

## 구현 순서 권장

1. **타입 정의 먼저** (1.1, 1.2) → 전체 구조 확정
2. **핵심 로직 TDD** (1.3~1.14) → series-detector 완성
3. **콘텐츠 강화 TDD** (2.1~2.16) → 네비게이션, 링크 변환 완성
4. **WordPress 확장** (3.1~3.6) → 상태 변경 API
5. **CLI 구현** (3.7~3.11) → status 명령어
6. **통합** (4.1~4.11) → publish 명령어에 모든 기능 연결
7. **시스템 테스트** (5.1~5.7) → 전체 워크플로우 검증

---

## TDD 체크포인트

각 구현 단계에서 반드시 확인:

- [ ] 모든 테스트 통과 (`pnpm test`)
- [ ] 타입 체크 통과 (`pnpm typecheck`)
- [ ] 린트 경고 없음 (`pnpm lint`)
- [ ] 커밋 전 전체 테스트 재실행
