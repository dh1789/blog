# WordPress Content Automation CLI

WordPress + Avada 테마 기반 블로그의 콘텐츠 작성/관리/광고 수익 최적화 자동화 도구

## 특징

- ✍️ **마크다운 작성**: 로컬에서 마크다운으로 편하게 글 작성
- 🚀 **자동 업로드**: WordPress에 자동으로 발행
- 💰 **광고 자동 삽입**: Google AdSense 코드 자동 삽입으로 수익 최적화
- 🌏 **다국어 지원**: 한국어/영어 콘텐츠 관리
- ⚡ **빠른 워크플로우**: 반복 작업 자동화로 콘텐츠 생산에 집중

## 기술 스택

- Node.js 20+ + TypeScript
- pnpm workspace (Monorepo)
- WordPress REST API
- Google AdSense

## 설치

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/blog.git
cd blog
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 편집하여 WordPress 연결 정보 입력:
```env
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx
```

### 4. 빌드
```bash
pnpm build
```

## 사용법

### WordPress 연결 설정
```bash
pnpm dev config
```

### 포스트 발행
```bash
# 발행
pnpm dev publish content/posts/ko/my-post.md

# 초안으로 저장
pnpm dev publish content/posts/ko/my-post.md --draft

# 시뮬레이션 (업로드 안 함)
pnpm dev publish content/posts/ko/my-post.md --dry-run
```

### 마크다운 파일 형식
```markdown
---
title: "포스트 제목"
slug: "post-slug"
excerpt: "포스트 요약"
status: "publish"
categories:
  - "카테고리1"
tags:
  - "태그1"
language: "ko"
---

# 본문

여기에 내용 작성...
```

## 프로젝트 구조

```
blog/
├── packages/
│   ├── cli/      # CLI 도구
│   ├── core/     # WordPress API, 마크다운 처리
│   └── shared/   # 공유 타입 및 유틸리티
├── content/      # 마크다운 콘텐츠
│   └── posts/
│       ├── ko/   # 한국어 포스트
│       └── en/   # 영어 포스트
└── ref/          # Avada 테마 참고 자료
```

## 개발

```bash
# 개발 모드 (watch)
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm typecheck

# 린트
pnpm lint

# 포맷팅
pnpm format
```

## 로드맵

- [x] 기본 포스트 발행 기능
- [x] 광고 코드 자동 삽입
- [ ] 이미지 자동 업로드
- [ ] 일괄 업로드/업데이트
- [ ] 스케줄 발행
- [ ] SEO 최적화
- [ ] 성과 분석 대시보드

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
