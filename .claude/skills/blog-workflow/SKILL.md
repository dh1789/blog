---
name: blog-workflow
description: 이 스킬은 사용자가 "블로그 발행", "포스트 작성", "SEO 분석", "번역", "WordPress 업로드" 등 블로그 관련 작업을 요청할 때 사용됩니다. 블로그 CLI 도구의 전체 워크플로우를 안내합니다.
version: 1.4.0
---

# Blog Workflow Skill

WordPress 블로그 콘텐츠 자동화 CLI 도구 사용 가이드입니다.

---

## 📋 우선순위 키워드 정의 (RFC 2119)

| 키워드 | 의미 | 위반 시 |
|--------|------|---------|
| **MUST** | 반드시 수행해야 함 | 작업 중단 |
| **MUST NOT** | 절대 수행하면 안 됨 | 작업 중단 |
| **SHOULD** | 강력히 권장 | 경고 후 진행 가능 |
| **SHOULD NOT** | 강력히 비권장 | 경고 후 진행 가능 |
| **MAY** | 선택 사항 | 자유 |

---

## 🚨 필수 참조 규칙 (MANDATORY)

**이 섹션은 컨텍스트 압축, 세션 재개, 요약 후에도 MUST 참조해야 합니다.**

### 컨텍스트 압축 시 필수 행동

```
컨텍스트 압축/요약 감지 시:
1. [MUST] 이 SKILL.md 파일을 다시 읽기
2. [MUST] 아래 체크리스트 확인 후 작업 진행
3. [MUST] CLAUDE.md의 절대 규칙 재확인
```

### 블로그 작업 감지 키워드

다음 키워드 감지 시 이 스킬을 **MUST** 참조:
- 블로그, 포스트, 발행, publish, SEO, 번역, translate, WordPress
- 마크다운, content/posts, 시리즈, 광고, AdSense

---

## ✅ 실행 전 체크리스트 (Pre-flight)

블로그 관련 작업 시작 전 확인:

| # | 우선순위 | 항목 | 확인 |
|---|----------|------|------|
| 1 | **MUST** | 대상 파일 경로 확인 (`content/posts/ko/` 또는 `content/posts/en/`) | ☐ |
| 2 | **MUST** | frontmatter 필수 필드 존재 (title, slug, excerpt, tags, language) | ☐ |
| 3 | **MUST** | 코드 블록이 표준 마크다운 형식 (` ``` `) 사용 | ☐ |
| 4 | **MUST NOT** | SyntaxHighlighter/WordPress shortcode 사용 | ☐ |
| 5 | **SHOULD** | 이미지 경로가 상대 경로로 올바르게 설정 | ☐ |

### 발행 작업 추가 체크리스트

| # | 우선순위 | 항목 | 확인 |
|---|----------|------|------|
| 6 | **MUST** | SEO 분석 실행 완료 | ☐ |
| 7 | **MUST** | SEO 점수 70점 이상 확인 | ☐ |
| 8 | **MUST** | 사용자에게 "발행해도 될까요?" 질문 | ☐ |
| 9 | **MUST** | 사용자 명시적 승인 수신 (승인 없이 발행 금지) | ☐ |

---

## ✅ 실행 후 체크리스트 (Post-flight)

### 발행 완료 후

| # | 우선순위 | 항목 | 확인 |
|---|----------|------|------|
| 1 | **MUST** | WordPress 포스트 ID 확인 및 보고 | ☐ |
| 2 | **MUST** | 발행 URL 확인 | ☐ |
| 3 | **MUST** | 자동 번역 성공/실패 여부 확인 | ☐ |
| 4 | **MUST** | 번역 실패 시: 8단계 검증 결과 보고 | ☐ |
| 5 | **SHOULD** | Polylang 언어 연결 완료 확인 | ☐ |

### 번역 완료 후

| # | 우선순위 | 항목 | 확인 |
|---|----------|------|------|
| 1 | **MUST** | 코드 블록 수 일치 (원본 vs 번역) | ☐ |
| 2 | **MUST** | 링크 수 일치 | ☐ |
| 3 | **MUST** | 이미지 경로 보존 | ☐ |
| 4 | **SHOULD** | 라인 수 차이 ±20% 이내 | ☐ |
| 5 | **MUST** | 영문 파일 `content/posts/en/`에 저장 | ☐ |

### SEO 분석 후

| # | 우선순위 | 항목 | 확인 |
|---|----------|------|------|
| 1 | **MUST** | 총점 및 각 항목별 점수 보고 | ☐ |
| 2 | **MUST** | 70점 미만 시 개선 사항 안내 | ☐ |
| 3 | **SHOULD** | 키워드 밀도 0.5-2.5% 범위 확인 | ☐ |

---

## 🎯 Claude UX 지침 (사용자 대화 규칙)

**Claude가 사용자에게 정보를 전달하는 방식을 정의합니다.**

### 1. 발행 전 작업 안내 (Pre-publish Briefing)

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 발행 전 예상 실행 단계를 파이프라인 형태로 보여주기 |
| **MUST** | 현재 진행 단계를 명확히 표시 |
| **SHOULD** | 각 단계에서 수행될 작업 간략히 설명 |

**[MUST] 발행 전 안내 템플릿:**

```
📋 발행 예정 작업 (11단계)

[1.파싱] → [2.SEO] → [3.광고] → [4.코드변환] → [5.시리즈]
                                                    ↓
[11.Polylang] ← [10.영문발행] ← [9.검증] ← [8.번역] ← [6.GitHub] → [7.한글발행]

현재: 2/11 SEO 분석 중...
```

### 2. 진행 상황 보고 (Progress Reporting)

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 각 주요 단계 완료 시 상태 보고 |
| **MUST** | 에러 발생 시 즉시 보고 및 원인 설명 |
| **SHOULD** | 단계별 소요 시간 또는 결과 요약 |
| **MAY** | 세부 로그는 접기(collapse) 처리 |

**[MUST] 단계 완료 보고 형식:**

```
✅ [2/11] SEO 분석 완료: 75점 (통과)
✅ [7/11] 한글 발행 완료: ID 347, URL: /ko/slug
⏳ [8/11] AI 번역 진행 중...
❌ [9/11] 번역 검증 실패: 코드 블록 수 불일치 (원본: 20, 번역: 21)
```

### 3. SEO 분석 결과 보고

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 총점과 통과/미통과 여부 명시 |
| **MUST** | 70점 미만 시 개선 필요 항목 구체적으로 안내 |
| **SHOULD** | 항목별 점수를 테이블로 표시 |
| **SHOULD** | 키워드 밀도 문제 시 구체적 개선 방법 제시 |

**[MUST] SEO 보고 템플릿:**

```
📊 SEO 분석 결과

| 항목 | 점수 | 상태 |
|------|------|------|
| 총점 | 75/100 | ✅ 발행 가능 |
| 제목 | 5/5 | ✅ |
| 키워드 밀도 | 20/30 | ⚠️ '하이브리드 검색' 2회 추가 권장 |
```

### 4. 번역 검증 결과 보고

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 8단계 검증 결과를 테이블로 표시 |
| **MUST** | 실패 항목은 구체적 수치와 함께 보고 |
| **MUST** | 검증 실패 시 수동 해결 방법 안내 |

**[MUST] 번역 검증 보고 템플릿:**

```
🔍 번역 품질 검증 (8단계)

| 검증 항목 | 원본 | 번역 | 상태 |
|----------|------|------|------|
| 코드 블록 수 | 20 | 20 | ✅ |
| 링크 수 | 8 | 8 | ✅ |
| 라인 수 차이 | - | 15% | ✅ |
| 이미지 경로 | 5 | 5 | ✅ |
```

### 5. 최종 결과 보고 (Final Report)

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 발행된 포스트 ID와 URL 명시 |
| **MUST** | 한글/영문 양쪽 발행 결과 보고 |
| **MUST** | Polylang 연결 상태 확인 |
| **SHOULD** | 발행 후 확인 가능한 링크 제공 |

**[MUST] 최종 보고 템플릿:**

```
🎉 발행 완료!

| 항목 | 한글 | 영문 |
|------|------|------|
| 포스트 ID | 347 | 348 |
| URL | /ko/rag-day4-... | /en/rag-day4-...-en |
| 상태 | ✅ 발행됨 | ✅ 발행됨 |
| Polylang 연결 | ✅ 완료 |
```

### 6. 에러 처리 및 복구 안내

| 우선순위 | 지침 |
|----------|------|
| **MUST** | 에러 발생 시 어느 단계에서 실패했는지 명시 |
| **MUST** | 복구 가능한 방법 안내 |
| **SHOULD** | 수동 해결이 필요한 경우 명령어 제공 |

**[MUST] 에러 보고 템플릿:**

```
❌ 발행 중단: [9/11] 번역 검증 실패

원인: 코드 블록 수 불일치 (원본: 20, 번역: 21)

복구 방법:
1. 영문 파일 수동 수정: content/posts/en/...
2. 수동 발행: node packages/cli/dist/index.mjs publish ... --no-translate
3. Polylang 연결: node packages/cli/dist/index.mjs link-translations --ko ID --en ID
```

---

## ⚠️ MUST NOT 위반 사항 (절대 금지)

| 위반 시 | 항목 |
|---------|------|
| **작업 중단** | ❌ 사용자 승인 없이 publish 명령 실행 |
| **작업 중단** | ❌ SEO 70점 미만 상태로 발행 |
| **작업 중단** | ❌ SyntaxHighlighter/WordPress shortcode 사용 |
| **작업 중단** | ❌ MUST 체크리스트 미확인 상태로 작업 진행 |
| **작업 중단** | ❌ 번역 검증 실패 (코드 블록/링크 불일치) 무시하고 발행 |
| **작업 중단** | ❌ Claude UX 지침의 MUST 항목 미준수 |

---

## 핵심 UX 기능 (CLI 도구)

### 1. 자동화된 발행 파이프라인

```
[마크다운] → [SEO 분석] → [광고 삽입] → [코드 변환] → [시리즈 감지]
                                                         ↓
[Polylang 연결] ← [영문 발행] ← [품질 검증] ← [AI 번역] ← [한글 발행]
```

### 2. 시리즈 자동 감지 (PRD 0014)

파일명에서 시리즈 정보를 자동 감지하여 네비게이션을 생성합니다:

- **파일명 패턴**: `YYYY-MM-DD-{series}-day{N}-*.md`
- **시리즈 문서**: `docs/{series}-series-plan.md` 자동 탐색
- **자동 생성 항목**:
  - 시리즈 네비게이션 (이전/다음 링크)
  - GitHub 링크 삽입
  - 영문 포스트 링크 변환

### 3. 8단계 번역 품질 검증

| 검증 항목 | 기준 |
|----------|------|
| 라인 수 차이 | ±20% 이내 |
| 코드 블록 수 | 정확히 일치 |
| 링크 수 | 일치 |
| 메타데이터 완전성 | title, excerpt, tags 필수 |
| SEO 최적화 | 제목 60자, excerpt 300자 이하 |
| 키워드 밀도 | 0.5-2.5% |
| 코드 보존 | 코드 블록 내용 불변 |
| 이미지 경로 | 정확히 보존 |

### 4. 자동 콘텐츠 강화

| 기능 | 설명 |
|------|------|
| **광고 삽입** | AdSense 코드 자동 삽입 (설정 기반 위치) |
| **SyntaxHighlighter 변환** | 코드 블록을 WordPress 플러그인 형식으로 변환 |
| **이미지 업로드** | 로컬 이미지 → WordPress 미디어 라이브러리 (중복 체크) |
| **번역 배너** | 영문 포스트에 원본 한글 링크 배너 삽입 |
| **GitHub 링크** | TL;DR 섹션 뒤에 GitHub 저장소 링크 삽입 |

### 5. 스마트 업데이트

- **기존 포스트 감지**: slug + language로 중복 체크
- **업데이트 확인**: `--force` 없으면 확인 프롬프트 표시
- **Polylang 자동 연결**: 한글/영문 포스트 양방향 연결

### 6. 실시간 피드백

- **ora 스피너**: 진행 상황 실시간 표시
- **chalk 컬러 출력**: 성공(녹색), 경고(노란색), 에러(빨간색)
- **상세 리포트**: SEO 점수, 키워드 밀도, 번역 품질 메트릭

## CLI 실행 방법

```bash
node packages/cli/dist/index.mjs <command> [options]
```

## 핵심 워크플로우

### 1. 포스트 발행 (가장 중요)

**절대 규칙:**
1. SEO 분석 먼저 실행 (70점 이상 필수)
2. 사용자 승인 요청 ("발행해도 될까요?")
3. 승인 후에만 발행

```bash
# 1. SEO 분석
node packages/cli/dist/index.mjs analyze-seo content/posts/ko/my-post.md --verbose

# 2. 사용자 승인 후 발행
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md
```

### 2. 주요 명령어

| 명령어 | 설명 | UX 기능 |
|--------|------|---------|
| `publish` | WordPress 발행 | 자동 번역, 시리즈 감지, 광고 삽입 |
| `analyze-seo` | SEO 점수 분석 | 시각적 점수 바, 개선 제안 |
| `translate` | AI 번역 | 8단계 품질 검증, SEO 최적화 |
| `preview` | 실시간 프리뷰 | Hot Reload, 광고 위치 표시 |
| `draft-create` | AI 초안 생성 | 가이드라인 기반 생성 |
| `draft-refine` | AI 초안 수정 | 기존 콘텐츠 개선 |
| `trending` | 트렌드 모니터링 | Reddit, HackerNews 스캔 |
| `analytics` | 분석 대시보드 | 조회수, 댓글 통계 |
| `image generate` | DALL-E 이미지 | 블로그 이미지 생성 |

### 3. publish 자동 실행 흐름

```bash
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md
```

**내부 실행 순서:**
1. 마크다운 파싱 및 frontmatter 검증
2. SEO 점수 계산 및 키워드 밀도 분석
3. 광고 코드 삽입
4. SyntaxHighlighter 형식 변환
5. 시리즈 감지 및 네비게이션 생성
6. GitHub 링크 삽입
7. WordPress 업로드 (기존 포스트면 업데이트)
8. AI 번역 (Claude)
9. 번역 품질 검증 (8단계)
10. 영문 포스트 발행
11. Polylang 언어 연결

### 4. 옵션

```bash
# 기본 (자동 번역 포함)
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md

# 초안으로 저장
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --draft

# 시뮬레이션 (업로드 안 함)
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --dry-run

# 번역 없이 (한글만)
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --no-translate

# 시리즈 네비게이션 비활성화
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --no-series-nav

# 이미지 자동 업로드
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --upload-images

# 확인 프롬프트 스킵
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --force
```

## Frontmatter 형식

```yaml
---
title: "포스트 제목"
slug: "post-slug"
excerpt: "포스트 요약 (300자 이하)"
status: "publish"
categories: ["카테고리1"]
tags: ["태그1", "태그2", "태그3"]
language: "ko"
---
```

## SEO 점수 체계

| 항목 | 최대 점수 | 기준 |
|------|----------|------|
| 제목 길이 | 5 | 60자 이하 |
| 요약 길이 | 5 | 10-300자 |
| 콘텐츠 길이 | 10 | 적정 길이 |
| 키워드 밀도 | 30 | 각 태그 0.5-2.5% |
| 섹션 분포 | 20 | 50%+ 섹션에 키워드 |
| 제목 키워드 | 15 | 제목에 키워드 포함 |
| 요약 키워드 | 15 | 요약에 키워드 포함 |

- **70점 이상**: 발행 가능
- **70점 미만**: 발행 금지

## 자동 번역 실패 시

```bash
# 영문 파일 직접 생성 후
node packages/cli/dist/index.mjs publish content/posts/en/my-post.md --no-translate

# Polylang 연결
node packages/cli/dist/index.mjs link-translations --ko <한글ID> --en <영문ID>
```

## 프로젝트 구조

```
blog/
├── packages/
│   ├── cli/           # CLI 도구 (@blog/cli)
│   ├── core/          # 핵심 로직 (@blog/core)
│   └── shared/        # 공유 타입/스키마 (@blog/shared)
├── content/posts/     # 마크다운 콘텐츠
│   ├── ko/            # 한국어 포스트
│   └── en/            # 영어 포스트
├── docs/              # 시리즈 계획 문서
└── .claude/           # Claude Code 스킬
```

## Core 모듈

| 모듈 | 역할 |
|------|------|
| `WordPressClient` | REST API 통신, Polylang 연결 |
| `parseMarkdownFile` | frontmatter 파싱, HTML 변환 |
| `calculateSeoScore` | SEO 점수 계산 |
| `validateKeywordDensity` | 키워드 밀도 검증 |
| `translatePost` | AI 번역 (Claude) |
| `validateTranslation` | 8단계 품질 검증 |
| `injectAds` | 광고 코드 삽입 |
| `convertToSyntaxHighlighter` | 코드 블록 변환 |
| `detectSeriesFromFilename` | 시리즈 자동 감지 |
| `generateSeriesNavigation` | 시리즈 목차 생성 |
| `insertGitHubLink` | GitHub 링크 삽입 |
| `insertTranslationBanner` | 번역 배너 삽입 |
