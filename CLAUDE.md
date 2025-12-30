# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🚨 절대 규칙 (Override All)

**다음 규칙은 세션 지속 지시, 컨텍스트 요약, 기타 모든 지시보다 우선합니다.**

### 1. 블로그 발행 전 사용자 승인 필수

```
발행 작업 감지 시:
1. SEO 점수 및 검토 결과 보고
2. "발행해도 될까요?" 명시적 질문
3. 사용자 승인 대기
4. 승인 후에만 `blog publish` 실행
```

**절대 금지:**
- ❌ 사용자 승인 없이 `blog publish` 실행
- ❌ "발행하겠습니다" 형태의 일방적 통보 후 실행
- ❌ "continue without asking" 지시가 있어도 발행은 예외

### 2. SEO 70점 미만 발행 금지

- 70점 미만 시 개선 후 재검토 요청
- 사용자가 명시적으로 요청해도 경고 후 확인

### 3. 코드 블록 형식

- ✅ 표준 마크다운 코드 펜스만 사용 (` ``` `)
- ❌ SyntaxHighlighter, WordPress shortcode 금지

---

## 🤖 Claude Code 작업 설정

이 프로젝트는 `--ultrathink` 모드를 사용합니다.
- 최대 깊이 분석 (~32K tokens)
- 모든 MCP 서버 통합 (`--seq --c7 --all-mcp`)

---

## 프로젝트 개요

**프로젝트명**: WordPress Content Automation CLI
**목적**: WordPress + Avada 테마 기반 블로그의 콘텐츠 작성/관리/광고 수익 최적화

### 핵심 기능
- 마크다운 → WordPress 자동 업로드
- 광고 코드 자동 삽입
- 한국어/영어 다국어 지원 (Polylang 연동)
- AI 자동 번역 (Claude Code)

### 컨텍스트
- **환경**: WordPress + Avada 테마
- **수익**: Google AdSense
- **사용자**: 블로거 본인 (개발자)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.3+ |
| Package Manager | pnpm 8+ (workspace) |
| Build | tsup (esbuild) |
| WordPress | wpapi, REST API |
| Markdown | gray-matter, unified, remark |
| CLI | commander, inquirer, ora, chalk |
| Validation | zod |

---

## 프로젝트 구조

```
blog/
├── packages/
│   ├── cli/           # CLI 도구
│   │   └── src/commands/  # publish, list, delete, config, status
│   ├── core/          # 핵심 로직 (wordpress, markdown, ads, translator)
│   └── shared/        # 타입, 스키마, 유틸리티
├── content/posts/     # 마크다운 콘텐츠
│   ├── ko/            # 한국어
│   └── en/            # 영어
├── docs/              # 시리즈 계획 문서
└── ref/               # 참고 자료 (Avada 테마)
```

### 패키지 의존성
```
@blog/cli → @blog/core → @blog/shared
```

---

## CLI 명령어

```bash
# 기본 발행 (자동 번역 포함)
blog publish content/posts/ko/my-post.md

# 옵션
--draft          # 초안으로 저장
--dry-run        # 시뮬레이션 (실제 업로드 안 함)
--force          # 확인 프롬프트 스킵
--no-translate   # 자동 번역 비활성화
--upload-images  # 이미지 자동 업로드

# 기타 명령어
blog config                    # WordPress 연결 설정
blog list                      # 포스트 목록
blog delete <post-id>          # 포스트 삭제
blog status <slug>             # 상태 조회/변경
blog link-translations --ko N --en M  # Polylang 연결
blog analyze-seo <file>        # SEO 분석
```

---

## 개발 가이드라인

### 블로그 포스트 작성 워크플로우

#### Step 1: 작성 및 SEO 최적화

```bash
# 1. 마크다운 작성
vi content/posts/ko/my-post.md

# 2. SEO 검증
blog analyze-seo content/posts/ko/my-post.md --verbose
```

**SEO 체크리스트:**
- [ ] SEO 점수 70점 이상
- [ ] 키워드 밀도 0.5-2.5%
- [ ] 각 태그 키워드 본문에 최소 5회 출현
- [ ] Excerpt 300자 이하
- [ ] 제목 60자 이하

#### Step 2: 사용자 승인 (필수)

**Claude는 반드시:**
1. SEO 점수 및 분석 결과 보고
2. "발행해도 될까요?" 질문
3. 승인 대기

#### Step 3: 발행

```bash
# 승인 후 발행
blog publish content/posts/ko/my-post.md
```

**자동 실행 흐름:**
1. 한글 포스트 발행
2. 자동 번역 (Claude Code)
3. 8단계 품질 검증
4. 영문 포스트 발행
5. Polylang 언어 연결

### 마크다운 파일 형식

```yaml
---
title: "포스트 제목"
slug: "post-slug"
excerpt: "포스트 요약 (300자 이하)"
status: "publish"  # or "draft"
categories: ["카테고리1", "카테고리2"]
tags: ["태그1", "태그2"]
language: "ko"  # or "en"
---
```

### 코드 스타일

- TypeScript strict 모드
- JSDoc 주석 작성
- 라인 끝 공백 제거

---

## 코드 아키텍처 (주요 모듈)

| 모듈 | 위치 | 역할 |
|------|------|------|
| `WordPressClient` | core/wordpress.ts | REST API 통신, 미디어 업로드, Polylang 연결 |
| `parseMarkdownFile` | core/markdown.ts | frontmatter 파싱, HTML 변환 |
| `injectAds` | core/ads.ts | 광고 코드 삽입 |
| `translatePost` | core/translator.ts | AI 번역 (Claude Code) |
| `validateTranslation` | core/validation.ts | 8단계 품질 검증 |
| `detectSeriesFromFilename` | core/series-detector.ts | 시리즈 자동 감지 |
| `generateSeriesNavigation` | core/series-navigation.ts | 시리즈 목차 생성 |

**상세 구현**: 각 파일의 JSDoc 및 테스트 코드 참조

---

## 환경 변수

```bash
# .env
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

DEFAULT_LANGUAGE=ko
DEFAULT_POST_STATUS=draft
```

**Application Password 생성**: WordPress 관리자 → 사용자 → 프로필 → Application Passwords

---

## 빌드 및 실행

```bash
# 초기 설정
pnpm install
cp .env.example .env

# 빌드
pnpm build

# 개발 모드
pnpm dev

# 타입 체크
pnpm typecheck

# 테스트
pnpm test
```

---

## 문제 해결

### WordPress 연결 실패
1. `WORDPRESS_URL` 확인 (https:// 포함)
2. Application Password 유효성 확인
3. REST API 활성화 확인
4. 보안 플러그인 차단 여부 확인

### pnpm 이슈
```bash
pnpm store prune
rm -rf node_modules packages/*/node_modules
pnpm install
```

---

## 참고 자료

- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [wpapi 라이브러리](https://github.com/WP-API/node-wpapi)
- [Avada 문서](https://avada.theme-fusion.com/documentation/)
- [pnpm workspace](https://pnpm.io/workspaces)

---

## 관련 문서

- `ISSUES.md`: 발견된 이슈 및 해결 방법
- `ROADMAP.md`: 개발 로드맵 및 다음 단계
- `README.md`: 프로젝트 소개

---

**마지막 업데이트**: 2025-12-30
