---
description: 블로그 포스트 번역 - 한국어 포스트를 영어로 AI 번역합니다
argument-hint: <korean-file> [--dry-run] [--publish]
allowed-tools: [Read, Bash, Write]
---

# /blog-translate - 포스트 번역

한국어 마크다운 포스트를 영어로 번역합니다. Claude AI 기반 SEO 최적화 번역을 수행합니다.

## 사용자 입력

$ARGUMENTS

## 실행 명령어

```bash
node packages/cli/dist/index.mjs translate <한글파일> [옵션]
```

## 옵션

| 옵션 | 설명 |
|------|------|
| `-t, --target` | 타겟 언어 (기본: en) |
| `-p, --publish` | 번역 후 WordPress에 자동 발행 |
| `--dry-run` | 미리보기 (파일 생성 안 함) |
| `-o, --output` | 출력 파일 경로 지정 |

## 번역 프로세스

1. **메타데이터 번역**: 제목, excerpt, 태그 SEO 최적화
2. **콘텐츠 번역**: 본문 번역 (코드 블록 보존)
3. **품질 검증**: 8단계 품질 검증
4. **파일 생성**: `content/posts/en/` 에 저장

## SEO 최적화 항목

- **제목**: 60자 이하, SEO 패턴 적용
- **Excerpt**: 300자 이하, 키워드 포함
- **Slug**: 원본 slug + `-en` 접미사
- **키워드**: 영문 SEO 키워드 최적화

## 품질 검증 기준

- 라인 수 차이: ±20% 이내
- 코드 블록 수: 정확히 일치
- 링크 수: 일치
- 메타데이터 완전성
- SEO 최적화 여부

## 수동 번역 워크플로우

자동 번역 실패 시:

```bash
# 1. 한글 파일 복사
cp content/posts/ko/my-post.md content/posts/en/my-post.md

# 2. 수동 번역 (language: en으로 변경)

# 3. 영문 포스트 발행
node packages/cli/dist/index.mjs publish content/posts/en/my-post.md --no-translate

# 4. Polylang 연결
node packages/cli/dist/index.mjs link-translations --ko <한글ID> --en <영문ID>
```
