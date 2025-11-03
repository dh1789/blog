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

### 개선 필요 이슈 ⚠️

#### 1. Polylang 언어 연결 자동화 부재
- **문제**: 한영 포스트 발행 후 수동으로 WordPress 관리자에서 연결 필요
- **현재**: WordPress 관리자 → 포스트 편집 → Polylang 메타박스에서 수동 선택
- **해결 방안**: `blog link-translations` 명령어 구현 예정
- **우선순위**: Medium
- **참고**: ISSUES.md [WF-001]

#### 2. SEO 키워드 밀도 최적화 부족
- **문제**: 대부분 키워드가 권장 범위(0.5-2.5%) 미달
- **영향**: SEO 점수 42-75점으로 낮음
- **해결 방안**: 자동 키워드 주입 로직 구현 예정
- **우선순위**: Medium
- **참고**: ISSUES.md [TECH-002]

#### 3. 워크플로우 검증 단계 부재
- **문제**: 한글 검증 완료 전에 영문 번역 진행
- **해결**: WORKFLOW-GUIDE.md 작성으로 프로세스 표준화
- **권장**: 한글 검증 → 발행 → 영문 번역 → 발행 → 연결
- **참고**: ISSUES.md [WF-002], WORKFLOW-GUIDE.md

### 전체 이슈 현황

- **해결 완료**: 3개
- **개선 중**: 4개
- **미해결**: 1개

**상세 내역**: `ISSUES.md` 참조

---

## 권장 워크플로우

**최종 업데이트**: 2025-11-03

품질 높은 한영 블로그 포스트 발행을 위한 표준 프로세스입니다.
상세 가이드는 `WORKFLOW-GUIDE.md`를 참고하세요.

### 핵심 원칙

1. **한글 우선, 영문 후속**: 한글 포스트가 완벽하게 검증된 후에만 영문 번역 진행
2. **각 단계마다 검증**: 발행 전 로컬 검증 필수
3. **SEO 최적화**: 키워드 밀도 0.5-2.5%, Excerpt 300자 이하
4. **자동화 활용**: CLI 명령어로 반복 작업 최소화

### 4단계 프로세스

#### Phase 1: 한글 포스트 작성 및 검증
```bash
# 1. 마크다운 작성
vi content/posts/ko/my-post.md

# 2. SEO 분석
blog analyze-seo content/posts/ko/my-post.md --verbose

# 3. 로컬 프리뷰
blog preview content/posts/ko/my-post.md --show-ads

# 4. 최종 검토 (체크리스트 확인)
```

**체크리스트**:
- [ ] SEO 점수 70점 이상
- [ ] 모든 필수 메타데이터 입력 (제목, excerpt, 카테고리, 태그)
- [ ] Excerpt 300자 이하
- [ ] 키워드 밀도 0.5-2.5% 범위

#### Phase 2: 한글 포스트 발행
```bash
# 발행
blog publish content/posts/ko/my-post.md

# 출력 예시:
# ✔ 포스트 발행 완료! (ID: 29)
# URL: https://beomanro.com/?p=29

# ⚠️ Post ID 기록 필수 (나중에 영문 연결 시 필요)
```

**확인 사항**:
- [ ] WordPress 관리자에서 발행 확인
- [ ] 실제 페이지 확인 (레이아웃, 이미지, 광고)
- [ ] 필요시 수정 및 재발행

#### Phase 3: 영문 번역 및 검증
```bash
# 번역 생성 (한글 검증 완료 후에만!)
blog translate content/posts/ko/my-post.md --target en

# 출력 예시:
# ✔ 번역 완료!
# ✅ 번역 파일 생성 완료: content/posts/en/my-post-english.md

# 번역 품질 검토
# - SEO 리포트 확인
# - 키워드 밀도 조정
# - 필요시 수동 수정
```

**체크리스트**:
- [ ] 제목이 SEO 최적화되었는가? (How to, Complete Guide 등)
- [ ] 번역 디스클레이머 포함되었는가?
- [ ] 키워드 밀도가 적절한가?
- [ ] 코드 블록이 보존되었는가?

#### Phase 4: 영문 포스트 발행 및 연결
```bash
# 발행
blog publish content/posts/en/my-post-english.md

# 출력 예시:
# ✔ 포스트 발행 완료! (ID: 26)
# URL: https://beomanro.com/?p=26
```

**Polylang 언어 연결 (현재 수동)**:
1. WordPress 관리자 → Posts → All Posts
2. 한글 포스트 (ID: 29) 편집
3. Polylang 메타박스에서 영문 포스트 (ID: 26) 선택
4. 저장

**향후 자동화 예정**:
```bash
blog link-translations --ko 29 --en 26
```

**최종 확인**:
- [ ] 한영 포스트가 Polylang으로 연결되었는가?
- [ ] 언어 전환 버튼이 정상 작동하는가?

### 주의사항

- ⚠️ **Excerpt는 300자를 절대 초과하지 마세요** (발행 실패)
- ⚠️ **반드시 한글 검증 완료 후 영문 번역** (재작업 방지)
- ⚠️ **Post ID를 반드시 기록** (연결 시 필요)

### 효율성 팁

```bash
# Dry-run으로 시뮬레이션
blog publish content/posts/ko/my-post.md --dry-run

# 번역 미리보기
blog translate content/posts/ko/my-post.md --dry-run
```

**상세 가이드**: `WORKFLOW-GUIDE.md` 참조

---

## 다음 단계 (Next Steps)

**최종 업데이트**: 2025-11-03

### 즉시 실행 (이번 주)
1. ✅ 번역 패턴 문서화 (TRANSLATION-PATTERNS.md)
2. ✅ 이슈 추적 문서 작성 (ISSUES.md)
3. ✅ 워크플로우 가이드 작성 (WORKFLOW-GUIDE.md)
4. 🔄 Polylang 자동 연결 구현 방안 리서치

### 단기 (1-2주)
1. **Polylang 자동 연결 명령어 구현** (우선순위: HIGH)
   - `blog link-translations --ko <id> --en <id>` 명령어
   - 또는 `publish` 명령어에 `--link-to <id>` 옵션 추가
   - 참고: ISSUES.md [WF-001]

2. **SEO 키워드 밀도 자동 최적화** (우선순위: MEDIUM)
   - 번역 시 키워드 밀도 자동 분석
   - 부족한 키워드 자동 주입 (자연스러운 위치)
   - 참고: ISSUES.md [TECH-002]

3. **배치 번역 기능**
   - 여러 포스트 동시 번역
   - 진행률 표시
   - 병렬 처리

### 중기 (1개월)
1. **통합 발행 명령어** (참고: ISSUES.md [UX-002])
   ```bash
   blog publish-bilingual content/posts/ko/my-post.md
   # 자동으로: 한글 발행 → 검증 → 영문 번역 → 영문 발행 → 연결
   ```

2. **Git Hook 통합**
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
