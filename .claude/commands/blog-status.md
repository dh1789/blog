---
description: WordPress 포스트 상태 조회/변경 - slug로 포스트를 찾아 상태를 확인하거나 변경합니다
argument-hint: <slug> [--publish] [--draft] [--language ko|en]
allowed-tools: [Bash]
---

# /blog-status - 포스트 상태 관리

slug로 WordPress 포스트를 찾아 상태를 조회하거나 변경합니다.

## 사용자 입력

$ARGUMENTS

## 실행 명령어

```bash
node packages/cli/dist/index.mjs status <slug> [옵션]
```

## 옵션

| 옵션 | 설명 |
|------|------|
| `-p, --publish` | 발행 상태로 변경 |
| `-d, --draft` | 초안 상태로 변경 |
| `-l, --language` | 언어 필터 (ko/en) |

## 사용 예시

```bash
# 상태 조회
node packages/cli/dist/index.mjs status rag-day3-embedding-vectordb

# 발행으로 변경
node packages/cli/dist/index.mjs status rag-day3-embedding-vectordb --publish

# 초안으로 변경
node packages/cli/dist/index.mjs status rag-day3-embedding-vectordb --draft

# 특정 언어 포스트 조회
node packages/cli/dist/index.mjs status rag-day3-embedding-vectordb --language ko
```

## Polylang 언어 연결

```bash
node packages/cli/dist/index.mjs link-translations --ko <한글ID> --en <영문ID>
```
