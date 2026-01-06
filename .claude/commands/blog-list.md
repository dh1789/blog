---
description: WordPress 포스트 목록 조회 - 발행/초안/전체 상태별 필터링
argument-hint: [--status publish|draft|all] [--limit N]
allowed-tools: [Bash]
---

# /blog-list - 포스트 목록 조회

WordPress에 발행된 포스트 목록을 조회합니다.

## 사용자 입력

$ARGUMENTS

## 실행 명령어

```bash
node packages/cli/dist/index.mjs list [옵션]
```

## 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `-s, --status` | all | 상태 필터 (publish, draft, all) |
| `-l, --limit` | 10 | 결과 개수 제한 |

## 사용 예시

```bash
# 모든 포스트 10개 조회
node packages/cli/dist/index.mjs list

# 발행된 포스트만 20개 조회
node packages/cli/dist/index.mjs list --status publish --limit 20

# 초안만 조회
node packages/cli/dist/index.mjs list --status draft
```

## 출력 정보

- ID
- 제목
- Slug
- 상태 (publish/draft)
- 날짜
