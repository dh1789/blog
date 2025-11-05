# Epic 13.0: AI 기반 포스트 이미지 자동 생성 시스템 - 태스크 리스트

**PRD**: tasks/13.0-prd-ai-image-generation.md
**생성일**: 2025-11-05
**예상 기간**: 5주

---

## 관련 파일 (Relevant Files)

### 런타임 모듈 (매 포스트 발행 시 실행)
- `packages/core/src/image-generation.ts` - 이미지 생성 엔진 래퍼 (Claude Code CLI 또는 DALL-E 선택)
- `packages/core/src/image-generation.test.ts` - image-generation.ts 단위 테스트
- `packages/core/src/image-optimizer.ts` - Sharp 기반 이미지 최적화 (WebP 변환, 리사이징, 압축)
- `packages/core/src/image-optimizer.test.ts` - image-optimizer.ts 단위 테스트

### 개발 도구 (Phase 1에서만 1회 실행)
- `packages/core/src/benchmark-analyzer.ts` - Web 검색 + AI 분석으로 블로그 벤치마크 조사
- `packages/core/src/benchmark-analyzer.test.ts` - benchmark-analyzer.ts 단위 테스트
- `packages/core/src/spike-validator.ts` - Claude Code CLI 스파이크 검증
- `packages/core/src/spike-validator.test.ts` - spike-validator.ts 단위 테스트

### CLI 명령어
- `packages/cli/src/commands/publish.ts` - `--generate-images` 플래그 추가 (기존 파일 수정)
- `packages/cli/src/commands/publish.test.ts` - publish.ts 단위 테스트 (기존 파일 수정)
- `packages/cli/src/commands/retry-images.ts` - 이미지 재생성 명령어
- `packages/cli/src/commands/retry-images.test.ts` - retry-images.ts 단위 테스트
- `packages/cli/src/commands/benchmark-images.ts` - 벤치마크 재실행 명령어 (선택 사항)
- `packages/cli/src/commands/benchmark-images.test.ts` - benchmark-images.ts 단위 테스트

### 설정 파일 (1회성 작업 결과, git 커밋)
- `config/image-defaults.json` - 벤치마크 결과 (최적 이미지 개수, 크기, 포맷, 배치 전략)
- `config/claude-code-cli-limits.json` - 스파이크 검증 결과 (API 제약사항, 성능 기준)

### 문서
- `tasks/spike-results-image-generation.md` - 스파이크 검증 결과 상세 문서
- `tasks/benchmark-results-image-strategy.md` - 벤치마크 조사 결과 문서

### E2E 테스트
- `packages/cli/src/__tests__/e2e/image-generation.e2e.test.ts` - 이미지 자동 생성 전체 워크플로우 시스템 테스트

### 기존 파일 (재사용 또는 참고)
- `packages/core/src/image.ts` - 기존 DALL-E 이미지 생성 (참고용)
- `packages/core/src/wordpress.ts` - WordPress API 클라이언트 (uploadMedia, findMediaByFilename 재사용)
- `packages/core/src/markdown.ts` - 마크다운 파싱 (이미지 경로 삽입 시 사용)
- `packages/cli/src/commands/image.ts` - 기존 이미지 생성 명령어 (참고용)

---

## 주의사항 (Notes)

### 테스트 요구사항

**단위 테스트**:
- 단위 테스트는 코드 파일과 동일한 디렉토리에 배치 (예: `image-generation.ts` → `image-generation.test.ts`)
- Jest 테스트 프레임워크 사용
- 각 테스트 suite는 최소 3가지 테스트 케이스 포함:
  - **Happy Path**: 일반적인 사용 시나리오 (정상 동작 검증)
  - **Boundary Conditions**: 경계 조건 (최소값, 최대값, 빈 입력, null 값)
  - **Exception Cases**: 예외 처리 (잘못된 입력, 에러 조건, 네트워크 실패)
- 테스트 실행: `npx jest packages/core/src/image-generation.test.ts` (특정 파일) 또는 `npx jest` (전체)

**시스템 테스트**:
- PRD의 사용자 스토리 기반 E2E 시나리오 작성
- 최소 2개의 실제 사용자 시나리오 테스트
- **실제 데이터로 검증** (하드코딩된 값이나 더미 데이터 사용 금지)
- 전체 워크플로우 검증 (시작부터 끝까지)
- 모든 컴포넌트 통합 검증

### 1회성 작업 주의
- **1.0 벤치마크 조사**와 **2.0 스파이크 검증**은 Phase 1에서 **1회만 실행**
- 결과를 문서화하여 향후 개발에 재사용
- 런타임에서는 저장된 config 파일만 사용 (Web 검색이나 AI 분석 재실행 안 함)

### 기존 코드 활용
- `packages/core/src/image.ts`의 DALL-E 구현 참고 (ImageGenerator 클래스)
- Epic 12.0의 `uploadMedia()`, `findMediaByFilename()` 재사용
- 기존 마크다운 파싱 로직 (`parseMarkdownFile`) 재사용

---

## 태스크 (Tasks)

- [x] **1.0 벤치마크 조사 및 설정 파일 생성** (1회성 작업, Phase 1)
  - [x] 1.1 Web 검색으로 SEO 상위 블로그 크롤링 (TechCrunch, Smashing Magazine, CSS-Tricks 등)
    - Puppeteer 또는 Cheerio 사용
    - 포스트당 평균 이미지 개수 수집
    - 이미지 크기 (width × height) 분석
    - 파일 크기 및 포맷 (WebP, PNG, JPG) 분석
    - 최소 10개 블로그, 블로그당 20개 포스트 샘플링
  - [x] 1.2 수집된 데이터를 AI로 분석하여 최적값 도출
    - Claude API를 활용한 패턴 분석
    - 포스트 길이별 최적 이미지 개수 추출 (예: 500단어당 1개)
    - 이미지 배치 위치 전략 도출 (예: H2 헤딩마다, 문단 2개마다)
    - Featured image 최적 사이즈 결정 (Open Graph 표준 고려)
  - [x] 1.3 분석 결과를 `config/image-defaults.json`에 저장
    - JSON 스키마 정의 (featuredImage, contentImages)
    - 권장 설정값 저장 (width, height, format, quality, countRule, placement)
    - Git 커밋하여 팀 공유
  - [x] 1.4 벤치마크 결과 문서화 (`tasks/benchmark-results-image-strategy.md`)
    - 조사 대상 블로그 리스트
    - 수집된 데이터 요약 (평균, 중앙값, 표준편차)
    - AI 분석 결과 및 근거
    - 최종 권장 설정값 및 이유
  - [x] 1.5 `packages/core/src/benchmark-analyzer.ts` 구현 및 테스트
    - `BenchmarkAnalyzer` 클래스 구현
    - `analyzeBlogImages()` 메서드: Web 크롤링 + AI 분석
    - `saveToConfig()` 메서드: config/image-defaults.json 저장
    - **단위 테스트 작성** (`benchmark-analyzer.test.ts`):
      - Happy Path: Web 검색 결과 정상 파싱, AI 분석 결과 유효한 JSON 형식, 권장 설정값이 합리적 범위 내
      - Boundary Conditions: 검색 결과 0개, 검색 결과 100개 이상, 불완전한 데이터
      - Exception Cases: Web 검색 실패, AI 분석 실패, 파싱 에러

- [ ] **2.0 이미지 생성 엔진 스파이크 및 선택** (1회성 작업, Phase 1) 🟡 OpenAI API 키 필요
  - [x] 2.1 Claude Code CLI 이미지 생성 기능 검증 (불가 확인, DALL-E로 전환)
    - Claude API는 텍스트 전용, 이미지 생성 불가
    - DALL-E 3 API로 즉시 전환 결정
    - spike-image-generation.mjs 스크립트 작성 완료
    - OpenAI API 키 설정 필요 (실행 대기 중)
  - [ ] 2.2 품질/크기 제어 가능성 검증
    - 해상도 지정 가능 여부 확인 (1200x630, 800x450 등)
    - 품질 설정 옵션 확인 (high/medium/low)
    - 파일 포맷 지정 가능 여부 (WebP, PNG, JPG)
    - 실제 출력 파일 검증 (크기, 포맷, 품질)
  - [ ] 2.3 비용 및 속도 측정
    - 이미지당 생성 시간 측정 (10회 반복, 평균 계산)
    - API 호출 비용 추정 (요청당 비용, 월 예상 비용)
    - 동시 생성 가능 개수 테스트 (1개, 3개, 5개 동시 요청)
    - 성공 기준: 평균 생성 시간 ≤30초, 이미지당 비용 ≤$0.10
  - [ ] 2.4 블로그 컨텍스트 기반 생성 테스트
    - 포스트 제목 + excerpt를 프롬프트에 포함하여 생성
    - 생성된 이미지의 관련성 평가 (1-5점 척도)
    - 키워드 기반 스타일 지정 테스트 ("technical diagram", "screenshot", "illustration")
    - 부적절한 콘텐츠 생성 방지 확인
  - [ ] 2.5 DALL-E와 비교 평가 및 최종 선택
    - Claude Code CLI vs DALL-E 성능 비교 (속도, 비용, 품질)
    - 장단점 분석 및 최종 엔진 선택
    - 선택 근거 문서화
  - [ ] 2.6 스파이크 결과 문서화 (`tasks/spike-results-image-generation.md`)
    - 4가지 검증 항목 결과 상세 기록
    - 성능 측정 데이터 (시간, 비용, 동시 처리)
    - 선택된 엔진 및 이유
    - 제약사항 및 주의사항
  - [ ] 2.7 API 제약사항 저장 (`config/claude-code-cli-limits.json`)
    - 일일 요청 제한, 동시 요청 제한 기록
    - 최적 설정값 저장 (권장 해상도, 품질, 포맷)
    - 타임아웃 설정 권장값
  - [ ] 2.8 최적 프롬프트 템플릿 작성 (FR-13.4 구현)
    - 블로그 포스트용 프롬프트 템플릿 작성
    - 동적 요소 정의 (title, excerpt, keywords, language)
    - 카테고리별 스타일 변경 로직
  - [ ] 2.9 `packages/core/src/spike-validator.ts` 구현 및 테스트
    - `SpikeValidator` 클래스 구현
    - `validateImageGeneration()` 메서드: 4가지 검증 실행
    - `saveResults()` 메서드: 결과 문서화 및 config 저장
    - **단위 테스트 작성** (`spike-validator.test.ts`):
      - Happy Path: 이미지 생성 성공, 파일 저장 확인, 메타데이터 정확성
      - Boundary Conditions: 최소 길이 프롬프트 (10자), 최대 길이 프롬프트 (5000자), 특수문자 포함
      - Exception Cases: API 타임아웃, 잘못된 파일 경로, 네트워크 에러

- [ ] **3.0 이미지 생성 및 최적화 모듈 구현** (Phase 2)
  - [ ] 3.1 `packages/core/src/image-generation.ts` 구현
    - `ImageGenerationEngine` 클래스 구현
    - Phase 1에서 선택된 엔진 (Claude Code CLI 또는 DALL-E) 래퍼
    - `config/image-defaults.json` 설정 자동 로드
    - `generateFeaturedImage()` 메서드: Featured image 생성
    - `generateContentImages()` 메서드: 본문 이미지 생성 (개수, 위치는 config 기준)
    - 프롬프트 최적화 (`optimizePrompt()` 메서드)
    - **단위 테스트 작성** (`image-generation.test.ts`):
      - Happy Path: 정상적인 프롬프트로 이미지 생성 성공, 파일이 지정된 경로에 저장됨, 반환된 메타데이터가 정확함
      - Boundary Conditions: 최소 길이 프롬프트 (10자), 최대 길이 프롬프트 (5000자), 특수문자 포함 프롬프트
      - Exception Cases: API 타임아웃 시 에러 처리, 잘못된 파일 경로 에러, 네트워크 에러 처리
  - [ ] 3.2 `packages/core/src/image-optimizer.ts` 구현
    - `ImageOptimizer` 클래스 구현
    - Sharp 라이브러리 사용
    - `optimizeImage()` 메서드: PNG/JPG → WebP 변환, 리사이징, 압축
    - `config/image-defaults.json`의 quality 설정 적용
    - 메타데이터 보존 (EXIF 데이터)
    - **단위 테스트 작성** (`image-optimizer.test.ts`):
      - Happy Path: PNG → WebP 변환 성공, 리사이징 정확도, 압축률 검증
      - Boundary Conditions: 최소 크기 (1×1px), 최대 크기 (10000×10000px), 매우 작은 파일 (1KB)
      - Exception Cases: 손상된 이미지 파일, 지원하지 않는 포맷, 디스크 용량 부족
  - [ ] 3.3 로컬 저장 로직 구현
    - 이미지 저장 경로: `content/posts/images/{post-slug}/`
    - 파일명 규칙: `featured.webp`, `section-1.webp`, `section-2.webp`
    - 디렉토리 자동 생성 (존재하지 않을 경우)
    - 메타데이터 저장: `images.json` (제목, 설명, 생성 시간, 프롬프트)
  - [ ] 3.4 마크다운 이미지 경로 삽입 로직 구현
    - frontmatter에 `featured_image` 필드 추가
    - 본문 이미지 자동 삽입 (config의 placement 규칙 따름)
    - 이미지 캡션 자동 생성 (포스트 컨텍스트 기반)
    - 기존 `packages/core/src/markdown.ts` 활용
  - [ ] 3.5 WordPress 업로드 통합
    - Epic 12.0의 `uploadMedia()` 재사용
    - `findMediaByFilename()`으로 중복 이미지 감지
    - 업로드 성공 시 마크다운 경로를 WordPress URL로 변환
    - 진행률 표시 (ora 스피너)

- [ ] **4.0 publish 명령어 통합 및 다국어 이미지 공유** (Phase 3)
  - [ ] 4.1 `packages/cli/src/commands/publish.ts`에 `--generate-images` 플래그 추가
    - Commander.js 옵션 추가: `.option('--generate-images', '포스트 이미지 자동 생성')`
    - 플래그 활성화 시 이미지 생성 워크플로우 실행
    - 기존 publish 로직과 매끄럽게 통합
  - [ ] 4.2 이미지 생성 워크플로우 구현
    - 단계 1: 포스트 메타데이터 파싱 (제목, excerpt, 태그)
    - 단계 2: Featured image 생성 및 로컬 저장
    - 단계 3: 본문 이미지 생성 (config의 countRule 기준)
    - 단계 4: 이미지 최적화 (WebP 변환)
    - 단계 5: WordPress 업로드
    - 단계 6: 마크다운 파일 업데이트 (이미지 경로 삽입)
    - 단계 7: WordPress 포스트 발행
  - [ ] 4.3 한글 포스트 발행 시 이미지 생성 구현
    - `--generate-images` 플래그 활성화 시 자동 실행
    - frontmatter에 이미지 경로 기록 (`featured_image`, `content_images`)
    - 생성된 이미지 경로 로깅
  - [ ] 4.4 자동 번역 시 이미지 경로 복사 구현
    - 한글 포스트의 frontmatter에서 `featured_image` 읽기
    - 영문 포스트 frontmatter에 동일 경로 복사
    - 본문 이미지 경로도 동일하게 복사
    - 새로운 이미지 생성 **안 함** (비용 절감)
  - [ ] 4.5 이미지 경로 관리 로직 구현
    - 언어별 다른 경로가 아닌 공통 경로 사용 (`images/{post-slug}/`)
    - WordPress 미디어 라이브러리에서 한 번만 업로드
    - 한/영 포스트 모두 동일한 WordPress URL 참조
  - [ ] 4.6 publish 명령어 단위 테스트 업데이트
    - 기존 `publish.test.ts`에 `--generate-images` 플래그 테스트 추가
    - Happy Path: 이미지 생성 성공, 마크다운 삽입 확인, WordPress 업로드 확인
    - Boundary Conditions: 이미지 없는 포스트, 이미 이미지가 있는 포스트
    - Exception Cases: 이미지 생성 실패 시 포스트 발행 계속 진행

- [ ] **5.0 에러 처리 및 재시도 메커니즘 구현** (Phase 3)
  - [ ] 5.1 이미지 생성 실패 처리 구현
    - try-catch로 에러 캐치
    - 경고 메시지 출력: `⚠️ 이미지 생성 실패: {이유}`
    - 포스트 발행은 계속 진행 (이미지 없이)
    - 실패 로그 저장: `logs/image-generation-failures.log`
  - [ ] 5.2 WordPress 업로드 실패 처리 구현
    - 로컬 파일은 유지 (재시도 가능)
    - 경고 메시지 출력
    - 포스트는 로컬 이미지 경로로 발행 (나중에 수동 업로드 가능)
  - [ ] 5.3 `packages/cli/src/commands/retry-images.ts` 구현
    - `blog retry-images {post-id}` 명령어
    - WordPress에서 포스트 조회 (`getPost()`)
    - frontmatter에서 이미지 경로 읽기
    - 로컬 파일 존재 여부 확인
    - 존재하지 않으면 재생성, 존재하면 재업로드
    - **단위 테스트 작성** (`retry-images.test.ts`):
      - Happy Path: 실패한 이미지 재생성 성공
      - Boundary Conditions: 포스트 없음, 이미지 경로 없음
      - Exception Cases: 재생성 실패, 재업로드 실패
  - [ ] 5.4 로깅 시스템 구현
    - `logs/` 디렉토리 생성
    - `image-generation-failures.log`: 이미지 생성 실패 기록
    - `image-upload-failures.log`: 업로드 실패 기록
    - 타임스탬프, 포스트 ID, 에러 메시지 기록
  - [ ] 5.5 진행률 표시 개선
    - ora 스피너 사용
    - 단계별 진행 상태 표시 ("이미지 생성 중...", "업로드 중...", "완료!")
    - 성공/실패 메시지 컬러링 (chalk)

- [ ] **6.0 종합 테스트 및 문서화** (Phase 4, Phase 5)
  - [ ] 6.1 E2E 테스트 작성 (`image-generation.e2e.test.ts`)
    - **E2E-13.1: 이미지 자동 생성 전체 워크플로우**
      - 실제 마크다운 포스트 파일 준비
      - `blog publish {file} --generate-images` 실행
      - 로컬 파일 생성 확인
      - WordPress 미디어 라이브러리 업로드 확인
      - 마크다운에 이미지 경로 삽입 확인
      - WordPress 포스트에 이미지 정상 표시 확인
    - **E2E-13.2: 다국어 포스트 이미지 공유**
      - 한글 포스트 발행 (`--generate-images`)
      - 이미지 생성 확인
      - 자동 번역 실행
      - 영문 포스트에서 새 이미지 생성 안 됨 확인
      - 양쪽 포스트 모두 동일한 WordPress URL 사용 확인
  - [ ] 6.2 수동 테스트 수행
    - 실제 블로그 포스트로 전체 워크플로우 테스트
    - 다양한 포스트 길이 테스트 (짧은 글, 긴 글)
    - 다양한 카테고리 테스트 (개발, WordPress, SEO)
    - 이미지 생성 실패 시나리오 테스트
  - [ ] 6.3 성능 벤치마크 측정
    - 이미지 생성 평균 시간 측정 (목표: ≤30초)
    - 포스트 발행 시간 증가율 측정 (목표: ≤20%)
    - 생성 성공률 측정 (목표: ≥90%)
  - [ ] 6.4 README.md 업데이트
    - Epic 13.0 기능 설명 추가
    - `--generate-images` 플래그 사용법
    - 설정 파일 설명 (`config/image-defaults.json`)
    - 예제 명령어
  - [ ] 6.5 사용자 가이드 작성
    - 이미지 생성 기능 사용법
    - 설정 커스터마이징 방법
    - 문제 해결 가이드
    - 비용 관리 팁
  - [ ] 6.6 릴리스 노트 작성
    - Epic 13.0 주요 기능
    - 성능 지표 (생성 시간, 성공률)
    - 알려진 제약사항
    - 향후 계획 (Epic 14.0, 15.0)

---

## 선택 사항 (Optional Tasks)

- [ ] **7.0 벤치마크 재실행 명령어 구현** (관리 도구, 필요 시)
  - [ ] 7.1 `packages/cli/src/commands/benchmark-images.ts` 구현
    - `blog benchmark-images` 명령어
    - `BenchmarkAnalyzer` 재실행
    - 기존 `config/image-defaults.json` 백업
    - 새로운 분석 결과로 업데이트
  - [ ] 7.2 단위 테스트 작성 (`benchmark-images.test.ts`)
    - Happy Path: 벤치마크 재실행 성공, config 업데이트
    - Boundary Conditions: 기존 config 없음, 백업 실패
    - Exception Cases: Web 검색 실패, AI 분석 실패

---

## 개발 순서 권장사항

1. **Phase 1 (1주)**: 태스크 1.0 + 2.0 완료 → config 파일 생성 및 문서화
2. **Phase 2 (2주)**: 태스크 3.0 완료 → 핵심 모듈 구현 및 단위 테스트
3. **Phase 3 (1주)**: 태스크 4.0 + 5.0 완료 → CLI 통합 및 에러 처리
4. **Phase 4 (1주)**: 태스크 6.1 + 6.2 + 6.3 완료 → E2E 테스트 및 성능 측정
5. **Phase 5 (3일)**: 태스크 6.4 + 6.5 + 6.6 완료 → 문서화

**총 예상 기간**: 5주
