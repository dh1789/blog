---
name: blog-workflow
description: 이 스킬은 사용자가 "블로그 발행", "포스트 작성", "SEO 분석", "번역", "WordPress 업로드" 등 블로그 관련 작업을 요청할 때 사용됩니다. 블로그 CLI 도구의 전체 워크플로우를 안내합니다.
version: 1.0.0
---

# Blog Workflow Skill

WordPress 블로그 콘텐츠 자동화 CLI 도구 사용 가이드입니다.

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
└── .claude/commands/  # Claude Code 스킬
```

## CLI 실행 방법

```bash
node packages/cli/dist/index.mjs <command> [options]
```

## 핵심 워크플로우

### 1. 포스트 발행 (가장 중요)

**절대 규칙:**
1. SEO 분석 먼저 실행 (70점 이상 필수)
2. 사용자 승인 요청
3. 승인 후에만 발행

```bash
# 1. SEO 분석
node packages/cli/dist/index.mjs analyze-seo content/posts/ko/my-post.md --verbose

# 2. 사용자 승인 후 발행
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md
```

### 2. 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `publish <file>` | WordPress 발행 (자동 번역 포함) |
| `analyze-seo <file>` | SEO 점수 분석 |
| `translate <file>` | 한→영 번역 |
| `list` | 포스트 목록 |
| `status <slug>` | 상태 조회/변경 |
| `preview <file>` | 실시간 프리뷰 |
| `draft-create` | AI 초안 생성 |
| `link-translations` | Polylang 연결 |

### 3. publish 옵션

```bash
# 기본 (자동 번역 포함)
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md

# 초안으로 저장
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --draft

# 시뮬레이션
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --dry-run

# 번역 없이 (한글만)
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --no-translate

# 이미지 자동 업로드
node packages/cli/dist/index.mjs publish content/posts/ko/my-post.md --upload-images
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

## SEO 점수 기준

- **70점 이상**: 발행 가능
- **70점 미만**: 발행 금지 (개선 필요)
- **키워드 밀도**: 각 태그 0.5-2.5%

## 자동 번역 실패 시

```bash
# 영문 파일 직접 생성 후
node packages/cli/dist/index.mjs publish content/posts/en/my-post.md --no-translate

# Polylang 연결
node packages/cli/dist/index.mjs link-translations --ko <한글ID> --en <영문ID>
```

## Core 모듈

| 모듈 | 역할 |
|------|------|
| `WordPressClient` | REST API 통신, Polylang 연결 |
| `parseMarkdownFile` | frontmatter 파싱, HTML 변환 |
| `calculateSeoScore` | SEO 점수 계산 |
| `translatePost` | AI 번역 (Claude) |
| `validateTranslation` | 8단계 품질 검증 |
| `injectAds` | 광고 코드 삽입 |
| `detectSeriesFromFilename` | 시리즈 자동 감지 |
