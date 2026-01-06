---
description: 블로그 포스트 실시간 프리뷰 - 브라우저에서 마크다운을 미리 봅니다
argument-hint: <markdown-file> [--port N] [--show-ads]
allowed-tools: [Bash]
---

# /blog-preview - 실시간 프리뷰

마크다운 파일을 브라우저에서 실시간으로 미리 봅니다. 파일 변경 시 자동 새로고침됩니다.

## 사용자 입력

$ARGUMENTS

## 실행 명령어

```bash
node packages/cli/dist/index.mjs preview <파일경로> [옵션]
```

## 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `-p, --port` | 3000 | 시작 포트 번호 |
| `--no-browser` | - | 브라우저 자동 열기 비활성화 |
| `--show-ads` | - | 광고 삽입 위치 표시 |

## 사용 예시

```bash
# 기본 프리뷰 (포트 3000)
node packages/cli/dist/index.mjs preview content/posts/ko/my-post.md

# 다른 포트 사용
node packages/cli/dist/index.mjs preview content/posts/ko/my-post.md --port 8080

# 광고 위치 확인
node packages/cli/dist/index.mjs preview content/posts/ko/my-post.md --show-ads
```

## 기능

- **Hot Reload**: 파일 변경 시 자동 새로고침
- **마크다운 렌더링**: GFM 지원
- **코드 하이라이팅**: 언어별 구문 강조
- **광고 위치 표시**: `--show-ads` 옵션으로 광고 삽입 위치 확인
