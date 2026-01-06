---
description: 블로그 포스트 발행 - SEO 분석, 자동 번역, WordPress 업로드를 수행합니다
argument-hint: <markdown-file> [--draft] [--no-translate] [--dry-run]
allowed-tools: [Read, Bash, Glob, Grep, TodoWrite]
---

# /blog-publish - 블로그 포스트 발행

마크다운 파일을 WordPress에 발행합니다. SEO 분석, 자동 번역(한→영), Polylang 연결을 자동 수행합니다.

## 사용자 입력

$ARGUMENTS

## 실행 순서 (절대 규칙 준수)

### 1단계: SEO 분석 (필수)

```bash
node packages/cli/dist/index.mjs analyze-seo <파일경로> --verbose
```

**검증 기준:**
- SEO 점수 70점 이상 필수
- 70점 미만 시 발행 금지, 개선 제안 제공

### 2단계: 사용자 승인 요청 (필수)

SEO 분석 결과 보고 후 **반드시** 사용자에게 질문:

> "발행해도 될까요?"

**절대 금지:**
- 사용자 승인 없이 `blog publish` 실행
- 일방적 통보 후 실행

### 3단계: 발행 실행 (승인 후)

```bash
node packages/cli/dist/index.mjs publish <파일경로> [옵션]
```

**주요 옵션:**
- `--draft`: 초안으로 저장
- `--dry-run`: 시뮬레이션 (실제 업로드 안 함)
- `--no-translate`: 자동 번역 비활성화
- `--upload-images`: 로컬 이미지 자동 업로드
- `-f, --force`: 확인 프롬프트 스킵

### 4단계: 결과 보고

발행 완료 후 보고:
- 한글/영문 포스트 ID 및 URL
- SEO 점수
- Polylang 연결 상태

## 자동 번역 실패 시

번역 품질 검증 실패 시:
1. 한글 포스트만 발행됨
2. 수동 번역 후 재발행 안내:

```bash
# 영문 파일 수동 작성 후
node packages/cli/dist/index.mjs publish content/posts/en/<파일>.md --no-translate

# Polylang 연결
node packages/cli/dist/index.mjs link-translations --ko <한글ID> --en <영문ID>
```

## 파일 위치 규칙

- 한글: `content/posts/ko/YYYY-MM-DD-slug.md`
- 영문: `content/posts/en/YYYY-MM-DD-slug.md`

## Frontmatter 필수 형식

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
