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

# 기존 포스트 강제 업데이트 (확인 프롬프트 스킵)
blog publish content/posts/ko/my-post.md --force

# WordPress 연결 설정
blog config

# 포스트 목록 조회
blog list

# 포스트 삭제
blog delete <post-id>

# 포스트 상태 조회
blog status my-post-slug

# 포스트 상태 변경 (발행/초안)
blog status my-post-slug --publish
blog status my-post-slug --draft
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

### ✅ Epic 11.0 - AI 자동 번역 시스템 (완료)
- [x] **번역 엔진**: Claude Code 통합 (`translatePost` 함수)
- [x] **품질 검증**: 8단계 validation 시스템
  - [x] 라인 수 검증 (50-150% 범위)
  - [x] 코드 블록 보존 검증
  - [x] SEO 키워드 보존 검증
  - [x] 키워드 밀도 검증 (0.5-2.5%)
  - [x] 제목 길이 검증 (≤60자)
  - [x] 링크/헤딩 구조 보존
- [x] **SEO 최적화**: 영문 SEO 제목/요약 자동 생성
- [x] **CLI 통합**: `publish --no-translate` 옵션
- [x] **Polylang 자동 연결**: `WordPressClient.linkTranslations()`
- [x] **종합 테스트**: 39 tests (translator: 12, validation: 19, wordpress: 8)
- [x] **문서화**: README.md, CLAUDE.md, E2E 가이드

### ✅ Epic 12.0 - WordPress 미디어 라이브러리 통합 (완료)
- [x] **Media API 클라이언트**: `WordPressClient.findMediaByFilename()` 구현
- [x] **이미지 경로 파싱**: 마크다운/HTML 이미지 경로 추출 (`parseImagePaths`)
- [x] **URL 변환**: 로컬 경로 → WordPress CDN URL 변환 (`replaceImageUrls`)
- [x] **경로 해석**: 상대 경로 → 절대 경로 변환 (`resolveImagePath`)
- [x] **CLI 통합**: `publish --upload-images` 옵션
- [x] **중복 감지**: 파일명 기반 자동 중복 체크 및 URL 재사용
- [x] **진행률 표시**: 실시간 업로드 진행률 및 최종 리포트
- [x] **종합 테스트**: 42 tests (findMediaByFilename: 5, markdown: 29, 기존 유지)
- [x] **문서화**: README.md, CLAUDE.md

### ✅ PRD 0014 - WordPress 포스트 생성 기능 개선 (완료)
- [x] **시리즈 감지**: 파일명에서 시리즈 정보 자동 감지 (`detectSeriesFromFilename`)
- [x] **시리즈 문서 파싱**: docs/ 폴더 시리즈 계획서 자동 탐색 및 파싱 (`findSeriesDocument`, `parseSeriesDocument`)
- [x] **시리즈 네비게이션**: 자동 목차 마크다운 생성 (`generateSeriesNavigation`)
- [x] **한영 링크 변환**: 영문 포스트 발행 시 한글 URL → 영문 URL 자동 변환 (`convertLinksToEnglish`)
- [x] **번역 배너 삽입**: 영문 포스트 상단 원본 링크 배너 (`insertTranslationBanner`)
- [x] **GitHub 링크 삽입**: TL;DR 섹션 뒤 GitHub 저장소 링크 (`insertGitHubLink`)
- [x] **포스트 상태 CLI**: `blog status <slug>` 명령어 추가
- [x] **강제 업데이트**: `publish --force` 옵션 추가 (확인 프롬프트 스킵)
- [x] **종합 테스트**: 134 tests (core: 101, cli: 18, system: 15)

### 🚧 Phase 2 - 자동화 강화 (예정)
- [ ] 일괄 업로드/업데이트
- [ ] 스케줄 발행

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
- `findMediaByFilename(filename)`: 파일명으로 미디어 검색 (Epic 12.0)
  - WordPress 미디어 라이브러리에서 정확히 일치하는 파일명 검색
  - 중복 이미지 감지에 사용
  - 반환: `MediaItem | null`

**인증**: WordPress Application Password 사용

#### `parseMarkdownFile` (packages/core/src/markdown.ts)
마크다운 파일을 파싱하여 메타데이터와 HTML 추출

**프로세스**:
1. `gray-matter`로 frontmatter 추출
2. Zod 스키마로 메타데이터 검증
3. `unified` 파이프라인으로 마크다운 → HTML 변환

#### 이미지 처리 함수 (packages/core/src/markdown.ts) - Epic 12.0

**`parseImagePaths(content: string): string[]`**
마크다운 콘텐츠에서 로컬 이미지 경로 추출

**기능**:
- 마크다운 이미지 패턴 (`![alt](path)`) 파싱
- HTML img 태그 (`<img src="path">`) 파싱
- 외부 URL (http://, https://) 자동 제외
- 중복 경로 자동 제거

**`replaceImageUrls(content: string, imageUrlMap: Map<string, string>): string`**
마크다운 콘텐츠의 이미지 경로를 WordPress URL로 변환

**기능**:
- 로컬 경로를 WordPress CDN URL로 일괄 변환
- 마크다운 이미지 및 HTML img 태그 모두 지원
- 특수문자 경로 안전하게 처리 (정규식 이스케이프)

**`resolveImagePath(basePath: string, relativePath: string): string`**
상대 이미지 경로를 절대 경로로 변환

**기능**:
- `./`, `../` 상대 경로 해석
- 마크다운 파일 위치 기준 절대 경로 계산
- Node.js `path.resolve()` 활용

#### `injectAds` (packages/core/src/ads.ts)
HTML 콘텐츠에 광고 코드 자동 삽입

**지원 위치**:
- `top`: 콘텐츠 최상단
- `after-first-paragraph`: 첫 문단 뒤
- `after-first-h2`: 첫 번째 h2 제목 뒤
- `middle`: 콘텐츠 중간
- `bottom`: 콘텐츠 최하단

#### `translatePost` (packages/core/src/translator.ts)
한글 포스트를 영문으로 자동 번역 (Epic 11.0)

**프로세스**:
1. 원본 메타데이터 및 콘텐츠 파싱
2. Claude Code로 콘텐츠 번역 (executeClaude)
3. SEO 최적화 영문 제목 생성 (60자 이하)
4. SEO 최적화 영문 요약 생성 (300자 이하)
5. 카테고리/태그 번역
6. 슬러그 자동 생성 (-en 접미사)
7. 번역 디스클레이머 삽입

**타임아웃**: 60ms/단어 (최소 2분, 최대 10분)

**주요 함수**:
- `translateContent()`: 본문 번역 (기술 용어 보존, SEO 키워드 자연스러운 삽입)
- `generateSEOTitle()`: 영문 SEO 제목 생성
- `generateSEOExcerpt()`: 영문 SEO 요약 생성 (300자 엄격 제한)
- `translateMetadata()`: 메타데이터 번역

#### `validateTranslation` (packages/core/src/validation.ts)
번역 품질 종합 검증 (Epic 11.0)

**8단계 검증**:
1. **기본 검증**: 비어있지 않음, 코드 블록 개수, 링크 개수, 헤딩 구조
2. **라인 수 검증**: 50-150% 범위 (에러), 70-130% 범위 (경고)
3. **SEO 키워드 검증**: 모든 tags 키워드 포함 여부
4. **키워드 밀도 검증**: 0.5-2.5% 권장 범위
5. **제목 길이 검증**: ≤60자 (SEO 최적)
6. **링크/헤딩 보존**: 마크다운 구조 일치
7. **코드 블록 보존**: 완전 일치 (번역 금지)
8. **메타데이터 완전성**: title, excerpt, slug, categories, tags

**반환값**:
- `isValid`: boolean (에러 없으면 true, 경고만 있으면 통과)
- `issues`: ValidationIssue[] (severity: error|warning|info)
- `metrics`: TranslationQualityMetrics (품질 메트릭)

#### `WordPressClient.linkTranslations` (packages/core/src/wordpress.ts)
Polylang 언어 연결 (Epic 11.0)

**프로세스**:
1. Polylang REST API Helper 플러그인 endpoint 호출
2. Basic Auth 인증
3. POST 요청: `{ ko_post_id, en_post_id }`
4. 양방향 연결 완료

**에러 처리**:
- 404: 플러그인 미설치 → 설치 가이드 제공
- polylang_not_active: Polylang 비활성화
- invalid_ko_post/invalid_en_post: 잘못된 포스트 ID
- 네트워크 에러

**WordPress 플러그인**: `/wordpress-plugin/polylang-rest-api-helper.php` (Polylang Free 버전 지원)

#### 시리즈 기능 (PRD 0014)

**`detectSeriesFromFilename(filePath: string): SeriesInfo | null`** (packages/core/src/series-detector.ts)
파일명에서 시리즈 정보 자동 감지

**패턴 인식**:
- `YYYY-MM-DD-시리즈명-dayN-제목.md` → 시리즈명, N번째 회차
- 대소문자 무관: `Day1`, `day-1`, `DAY_1` 모두 인식

**`findSeriesDocument(seriesName: string, docsDir: string): string | null`**
docs/ 폴더에서 시리즈 계획 문서 탐색

**탐색 패턴**: `{seriesName}-series-plan.md`, `{seriesName}-series.md` 등

**`parseSeriesDocument(docPath: string): SeriesDocument`**
시리즈 문서에서 URL 매핑 및 GitHub 정보 추출

**추출 정보**:
- `totalDays`: 시리즈 총 회차 수
- `koreanUrls`: Day별 한글 포스트 URL 맵
- `englishUrls`: Day별 영문 포스트 URL 맵
- `githubUrl`: GitHub 저장소 URL

**`generateSeriesNavigation(options): string`** (packages/core/src/series-navigation.ts)
시리즈 네비게이션 마크다운 생성

**출력 예시**:
```markdown
## 📚 시리즈 목차
**MCP 시리즈**
- [Day 1: 시작하기](https://...)
- 👉 Day 2: 고급 활용 (현재 글)
- Day 3: 실전 프로젝트 (작성 예정)

🔗 [GitHub Repository](https://github.com/...)
```

**`convertLinksToEnglish(content: string, seriesDoc: SeriesDocument | null): string`** (packages/core/src/link-converter.ts)
영문 포스트 내 한글 URL → 영문 URL 변환

**`insertTranslationBanner(content: string, options): string`** (packages/core/src/content-enhancer.ts)
영문 포스트 상단에 번역 출처 배너 삽입

**배너 형식**: `> 🌐 **Translation**: This post was translated from [Korean original](URL).`

**`insertGitHubLink(content: string, githubUrl: string | null): string`**
TL;DR 섹션 뒤에 GitHub 저장소 링크 삽입

### 타입 시스템
모든 핵심 타입은 `packages/shared/src/types.ts`에 정의되어 있으며, Zod 스키마(`packages/shared/src/schemas.ts`)로 런타임 검증됩니다.

**주요 타입**:
- `WordPressConfig`: WordPress 연결 정보
- `PostMetadata`: 포스트 메타데이터 (frontmatter)
- `MediaItem`: WordPress 미디어 아이템 (Epic 12.0)
  - `id`, `url`, `source_url`, `title`, `alt_text`
  - `media_details`: width, height, file 경로
- `AdConfig`: 광고 설정
- `PublishOptions`: 발행 옵션
  - `uploadImages?: boolean`: 이미지 자동 업로드 (Epic 12.0)
  - `force?: boolean`: 기존 포스트 업데이트 시 확인 스킵 (PRD 0014)
- `SeriesInfo`: 시리즈 감지 결과 (PRD 0014)
  - `name`: 시리즈명 (예: "mcp", "remote-claude")
  - `dayNumber`: 회차 번호
- `SeriesDocument`: 시리즈 문서 파싱 결과 (PRD 0014)
  - `totalDays`: 총 회차 수
  - `koreanUrls`: `{ [day: number]: string }` - 한글 URL 맵
  - `englishUrls`: `{ [day: number]: string }` - 영문 URL 맵
  - `githubUrl`: GitHub 저장소 URL

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

### 블로그 포스트 작성 규칙

#### SEO 점수 70점 이상 필수

**작성 전 (SEO 계획)**:
1. 태그 키워드 목록 추출 (7-10개)
2. 본문 길이 기반 최소 출현 횟수 계산
   - 1,500단어: 키워드당 최소 7-11회
   - 1,800단어: 키워드당 최소 9-13회
3. 섹션별 키워드 배치 계획 수립

**작성 중 (키워드 통합)**:
1. 키워드를 자연스럽게 본문에 녹임
2. 동의어 대신 정확한 키워드 사용
   - ❌ "원격으로 작업" → ✅ "원격개발"
   - ❌ "로컬 DB" → ✅ "로컬환경의 DB"
3. 섹션 제목에 키워드 포함
4. Excerpt에 주요 키워드 3-5회 포함

**작성 후 (검증 및 개선)**:
1. 중간 SEO 검증 실행: `blog analyze-seo <file> --verbose`
2. 키워드 밀도 확인 (0.5-2.5% 범위)
3. 부족한 키워드 자연스럽게 추가
4. 최종 검증: 70점 이상 달성
5. **사용자에게 초안 보고 및 승인 대기 (필수)**
6. 승인 후에만 발행 (절대 임의 발행 금지)
7. **70점 미만 시 절대 발행하지 않음**

**핵심 원칙**:
- 각 태그 키워드는 본문에 최소 5-10회 출현
- 키워드 밀도: 0.5-2.5% 범위 엄수
- 가독성 우선: 키워드 스터핑 금지

#### 코드 블록 작성 규칙 (필수)

**⚠️ 절대 사용 금지:**
- `<pre class="brush: xxx">` (SyntaxHighlighter Evolved 형식) - WordPress에서 작동 안 함
- `[code language="xxx"]...[/code]` (WordPress shortcode) - remark 파서와 호환 안 됨

**✅ 반드시 표준 마크다운 코드 펜스 사용:**
```
\`\`\`typescript
const example = "code here";
\`\`\`
```

**이유:**
- unified/remark가 마크다운 코드 펜스를 `<pre><code class="language-xxx">` 형태로 변환
- WordPress가 기본적으로 지원하는 표준 HTML 형식
- Avada 테마에서 정상 렌더링됨

**지원 언어 태그:**
- `typescript`, `javascript`, `bash`, `json`, `html`, `css`
- 일반 텍스트/다이어그램: 언어 태그 없이 ` ``` ` 만 사용

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

## 발견된 이슈 및 해결 방법

**최종 업데이트**: 2025-11-03

프로젝트 진행 중 발견된 주요 이슈와 해결 방법을 문서화합니다.
자세한 내용은 `ISSUES.md`를 참고하세요.

### 해결된 이슈 ✅

#### 1. Excerpt 300자 제한 오류
- **문제**: WordPress REST API가 excerpt를 최대 300자로 제한
- **해결**: `optimizeExcerpt()` 함수 구현 (packages/core/src/translator.ts)
- **참고**: ISSUES.md [TECH-001]

#### 2. 번역 디스클레이머 자동 삽입
- **문제**: 번역 포스트에 원본 링크 수동 추가 필요
- **해결**: `generateTranslationDisclaimer()` 함수 구현
- **형식**: `> **🌐 Translation**: Translated from [Korean](/ko/원본-슬러그).`
- **참고**: ISSUES.md [TECH-003]

#### 3. Polylang 언어 연결 자동화 (Epic 11.0)
- **문제**: 한영 포스트 발행 후 수동으로 WordPress 관리자에서 연결 필요
- **해결**: `WordPressClient.linkTranslations()` 메서드 구현
- **기능**: Polylang REST API Helper 플러그인을 통한 자동 연결
- **워크플로우**: `blog publish` 시 자동 번역 → 자동 발행 → 자동 연결
- **참고**: packages/core/src/wordpress.ts:225-295

#### 4. 워크플로우 검증 단계 자동화 (Epic 11.0)
- **문제**: 한글 검증 완료 전에 영문 번역 진행, 수동 검증 필요
- **해결**: 8단계 자동 품질 검증 시스템 구현
- **기능**: 라인 수, 코드 블록, SEO 키워드, 제목 길이, 링크/헤딩 자동 검증
- **워크플로우**: 번역 → 자동 검증 → 검증 실패 시 발행 중단
- **참고**: packages/core/src/validation.ts

### 개선 필요 이슈 ⚠️

#### 1. SEO 키워드 밀도 최적화 부족
- **문제**: 대부분 키워드가 권장 범위(0.5-2.5%) 미달
- **영향**: SEO 점수 42-75점으로 낮음
- **해결 방안**: 자동 키워드 주입 로직 구현 예정
- **우선순위**: Medium
- **참고**: ISSUES.md [TECH-002]

### 전체 이슈 현황

- **해결 완료**: 6개 (Epic 11.0로 2개 추가 해결)
- **개선 중**: 1개
- **미해결**: 0개

**상세 내역**: `ISSUES.md` 참조

---

## 권장 워크플로우

**최종 업데이트**: 2025-11-04 (Epic 11.0 자동 번역 시스템 반영)

AI 자동 번역 시스템을 활용한 원클릭 한영 블로그 포스트 발행 프로세스입니다.

### 핵심 원칙

1. **원클릭 자동화**: 한글 발행 시 자동으로 번역 → 검증 → 영문 발행 → 언어 연결
2. **자동 품질 검증**: 8단계 validation으로 번역 품질 보증
3. **SEO 최적화**: 영문 SEO 제목/요약 자동 생성, 키워드 밀도 검증
4. **실패 안전**: 번역/검증 실패 시에도 한글 포스트는 정상 발행

### 3단계 프로세스 (Epic 11.0 자동 번역 + SEO 최적화)

#### Phase 1: 한글 포스트 작성 및 로컬 검증

```bash
# 1. SEO 계획 수립 (작성 전 필수)
# - 태그 키워드 목록 추출 (7-10개)
# - 본문 길이 기반 최소 출현 횟수 계산
#   * 1,500단어: 키워드당 최소 7-11회
#   * 1,800단어: 키워드당 최소 9-13회
# - 섹션별 키워드 배치 계획 수립

# 2. 마크다운 초안 작성
vi content/posts/ko/my-post.md
# - 키워드를 자연스럽게 본문에 녹임
# - 동의어 대신 정확한 키워드 사용
# - 예: "원격으로 작업" → "원격개발"

# 3. 중간 SEO 검증 (초안 완성 후 필수)
blog analyze-seo content/posts/ko/my-post.md --verbose
# - 현재 점수 확인
# - 키워드 밀도 분석
# - 부족한 키워드 식별

# 4. SEO 개선 (70점 미만 시)
# - 키워드 밀도 부족 시 자연스럽게 추가
# - 섹션 제목에 키워드 포함
# - Excerpt에 주요 키워드 3-5회 포함
# - 3단계 재실행하여 점수 확인

# 5. 최종 SEO 검증 (발행 전 필수)
blog analyze-seo content/posts/ko/my-post.md --verbose
# - 70점 이상 확인
# - 미달 시 4단계 반복

# 6. 실시간 프리뷰 (선택사항)
blog preview content/posts/ko/my-post.md --show-ads

```

**로컬 검증 체크리스트**:
- [ ] **SEO 점수 70점 이상** (필수)
- [ ] 모든 필수 메타데이터 입력 (제목, excerpt, 카테고리, 태그)
- [ ] Excerpt 300자 이하
- [ ] **키워드 밀도 0.5-2.5% 범위** (필수)
- [ ] **각 태그 키워드가 본문에 최소 5회 이상 출현** (필수)

#### Phase 1.5: 사용자 승인 (필수)

**⚠️ 중요: 절대 이 단계를 건너뛰지 마세요**

```bash
# 1. 초안 및 SEO 결과 사용자에게 보고
# 2. 사용자 승인 대기
# 3. 승인 받은 후에만 Phase 2로 진행
```

**보고 내용**:
- 작성된 포스트 파일 경로
- SEO 점수 (70점 이상 여부)
- 키워드 밀도 분석 결과
- 개선 사항 (있는 경우)

**절대 금지**:
- ❌ 사용자 승인 없이 발행
- ❌ "작성 완료했으니 발행하겠습니다" 형태의 일방적 통보
- ❌ Phase 2로 자동 진행

#### Phase 2: 원클릭 발행 (자동 번역 + 자동 연결)

**발행 전 최종 확인**:
- ✅ SEO 점수 70점 이상 달성 확인
- ✅ 모든 체크리스트 항목 완료
- ✅ **사용자 승인 완료** (필수)
```bash
# 한 줄 명령어로 한영 포스트 발행 완료
blog publish content/posts/ko/my-post.md

# 실행 흐름 (자동):
# 1. 한글 포스트 파싱 및 SEO 검증
# 2. WordPress에 한글 포스트 발행 (ID: 29)
# 3. ✨ 자동 번역 시작 (Claude Code)
# 4. 번역 품질 검증 (8단계)
#    - 라인 수 50-150% 범위 확인
#    - 코드 블록 완전 보존 확인
#    - SEO 키워드 모두 포함 확인
#    - 키워드 밀도 0.5-2.5% 확인
#    - 제목 길이 ≤60자 확인
#    - 링크/헤딩 구조 보존 확인
# 5. 검증 통과 시 영문 포스트 발행 (ID: 26)
# 6. Polylang으로 언어 연결: 한글(29) ↔ 영문(26)
# 7. 완료!
```

**출력 예시**:
```
=== 자동 번역 시작 ===
⠹ 한글 포스트 번역 중 (Claude Code)...
✔ 번역 품질 검증 통과

=== 번역 품질 메트릭 ===
라인 수 차이: 8.5%
코드 블록 보존: 3개
메타데이터 완전성: ✓
SEO 최적화: ✓
제목 길이: 58자
Excerpt 길이: 285자/300자

✔ 영어 포스트 발행 완료! (ID: 26)
✔ 언어 연결 완료: 한글(29) ↔ 영문(26)

✓ 자동 번역 및 발행 완료!
```

**자동 번역 비활성화 (한글만 발행)**:
```bash
blog publish content/posts/ko/my-post.md --no-translate
```

**최종 확인**:
- [ ] WordPress 관리자에서 한글/영문 포스트 확인
- [ ] 실제 페이지 확인 (레이아웃, 이미지, 광고)
- [ ] 언어 전환 버튼 정상 작동 확인

### 실패 처리

**번역 실패 시**:
- 한글 포스트만 발행됨
- 에러 메시지 출력
- 수동 번역 또는 재시도 가능

**검증 실패 시**:
- 한글 포스트만 발행됨
- 검증 이슈 상세 출력 (에러/경고/정보)
- 품질 개선 후 재시도

**Polylang 연결 실패 시**:
- 양쪽 포스트 모두 발행 성공
- 수동 연결 가이드 제공:
  ```bash
  blog link-translations --ko 29 --en 26
  ```

### 주의사항

- ⚠️ **Excerpt는 300자를 절대 초과하지 마세요** (발행 실패)
- ⚠️ **검증 실패 시 품질 개선 후 재시도** (한글 포스트는 이미 발행됨)
- ✅ **번역/연결 실패해도 한글 포스트는 정상 발행** (실패 안전)

### 고급 옵션

```bash
# 시뮬레이션 (실제 업로드 안 함)
blog publish content/posts/ko/my-post.md --dry-run

# 초안으로 저장 (번역도 초안)
blog publish content/posts/ko/my-post.md --draft
```

---

## 다음 단계 (Next Steps)

**최종 업데이트**: 2025-11-04 (Epic 11.0 완료)

### ✅ 완료된 기능 (Epic 11.0)
1. ✅ AI 자동 번역 시스템 구현
2. ✅ 8단계 품질 검증 시스템
3. ✅ Polylang 자동 연결 (`WordPressClient.linkTranslations()`)
4. ✅ 원클릭 한영 발행 (`blog publish`)
5. ✅ `--no-translate` 플래그 추가
6. ✅ 종합 테스트 (39 tests)
7. ✅ 문서화 (README.md, CLAUDE.md, E2E 가이드)

### 단기 (1-2주)
1. **SEO 키워드 밀도 자동 최적화** (우선순위: MEDIUM)
   - 번역 시 키워드 밀도 자동 분석 ✅ (구현됨)
   - 부족한 키워드 자동 주입 (자연스러운 위치) ⏳ (예정)
   - 참고: ISSUES.md [TECH-002]

2. **배치 번역 기능**
   - 여러 포스트 동시 번역
   - 진행률 표시
   - 병렬 처리

3. **번역 캐싱**
   - 이전 번역 결과 재사용
   - 부분 번역 지원 (수정된 섹션만 재번역)

### 중기 (1개월)
1. **Git Hook 통합**
   - 한글 포스트 커밋 시 자동 번역
   - Watch 모드 (파일 변경 감지 → 자동 업데이트)

3. **이미지 자동 처리**
   - 이미지 자동 업로드 및 경로 변환
   - 이미지 최적화 (압축, 리사이징)

### 장기 (3개월)
1. **완전 자동화 파이프라인**
   - AI 콘텐츠 생성 → 한영 동시 생성 → 자동 발행
   - 스케줄링 시스템
   - 성과 분석 대시보드

2. **다국어 확장**
   - 일본어, 중국어, 스페인어 지원
   - 언어별 SEO 전략
   - 글로벌 콘텐츠 전략

3. **웹 대시보드**
   - Next.js 기반 관리 인터페이스
   - 실시간 성과 모니터링
   - 포스트 스케줄링 UI

### 기타 개선 사항
- `list` 명령어 완성 (WordPress 포스트 목록 조회)
- `delete` 명령어 완성 (포스트 삭제)
- 콘텐츠 템플릿 시스템
- AI 기반 SEO 최적화 제안

---

## 라이선스

MIT License

---

**마지막 업데이트**: 2025-10-24
**프로젝트 버전**: 0.1.0 (MVP)
