# Drafts Directory

이 디렉토리는 AI로 생성된 블로그 포스트 초안을 저장합니다.

## 자동 생성 위치

`blog draft create` 명령어로 생성된 초안 파일들이 이 디렉토리에 저장됩니다:

```bash
blog draft create "주제" "키워드1,키워드2,키워드3"
```

## 파일명 형식

생성된 파일은 다음 형식을 따릅니다:

```
YYYY-MM-DD-slug.md
```

예시:
- `2025-10-27-chatgpt-활용법.md`
- `2025-10-27-nextjs-시작하기.md`
- `2025-10-27-github-copilot-리뷰.md`

## 워크플로우

1. **초안 생성**
   ```bash
   blog draft create "주제" "키워드1,키워드2" -w 2000 -t blog-post
   ```

2. **초안 확인**
   ```bash
   cat content/drafts/2025-10-27-주제.md
   ```

3. **초안 수정** (필요시)
   ```bash
   blog draft refine "content/drafts/2025-10-27-주제.md" "제목을 더 매력적으로 수정"
   ```

4. **프리뷰** (구현 예정)
   ```bash
   blog preview "content/drafts/2025-10-27-주제.md"
   ```

5. **발행**
   ```bash
   blog publish "content/drafts/2025-10-27-주제.md"
   ```

## Git 관리

- ✅ 이 디렉토리 자체는 git에 추적됨
- ❌ 초안 파일 (*.md)은 `.gitignore`에 의해 무시됨
- 💡 초안은 로컬에서만 관리하고 개인 작업물로 유지

## 주의사항

- 초안 파일은 자동으로 git에서 제외됩니다
- 중요한 초안은 별도로 백업하세요
- 발행 후에는 WordPress에서 관리됩니다
