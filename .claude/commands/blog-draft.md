---
description: AI 블로그 초안 생성 - 주제와 키워드로 블로그 포스트 초안을 생성합니다
argument-hint: <topic> <keywords> [--words N] [--language ko|en]
allowed-tools: [Bash, Read, Write]
---

# /blog-draft - AI 초안 생성

AI를 사용하여 블로그 포스트 초안을 생성합니다.

## 사용자 입력

$ARGUMENTS

## 명령어

### 초안 생성

```bash
node packages/cli/dist/index.mjs draft-create "<주제>" "<키워드1,키워드2,...>" [옵션]
```

### 초안 수정

```bash
node packages/cli/dist/index.mjs draft-refine <파일> "<수정지시>"
```

## 생성 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `-w, --words` | 2000 | 타겟 단어 수 |
| `-t, --template` | blog-post | 템플릿 이름 |
| `-l, --language` | ko | 언어 (ko/en) |
| `-s, --style` | - | 작성 스타일 |
| `-g, --guidelines` | prompts/blog-post-guidelines.md | 가이드라인 파일 |
| `--no-guidelines` | - | 가이드라인 비활성화 |

## 사용 예시

```bash
# 한글 블로그 초안 생성
node packages/cli/dist/index.mjs draft-create \
  "RAG 시스템 구축하기" \
  "RAG,벡터 데이터베이스,임베딩,LLM" \
  --words 3000

# 영문 블로그 초안 생성
node packages/cli/dist/index.mjs draft-create \
  "Building RAG Systems" \
  "RAG,Vector Database,Embeddings,LLM" \
  --language en

# 초안 수정
node packages/cli/dist/index.mjs draft-refine \
  content/posts/ko/my-draft.md \
  "코드 예제를 더 추가하고 설명을 간결하게"
```

## 초안 워크플로우

1. `draft-create`로 초안 생성
2. 내용 검토 및 수정
3. `draft-refine`으로 AI 수정 (선택)
4. `analyze-seo`로 SEO 점수 확인
5. `publish`로 발행
