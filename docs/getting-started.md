# 시작하기 (Getting Started)

@blog/cli를 사용하여 AI 기반 블로그 자동화를 시작하는 방법을 안내합니다.

## 📚 목차

- [프로젝트 소개](#프로젝트-소개)
- [빠른 시작](#빠른-시작)
- [첫 번째 블로그 포스트 작성](#첫-번째-블로그-포스트-작성)
- [다음 단계](#다음-단계)

---

## 프로젝트 소개

@blog/cli는 WordPress + Avada 테마 기반 블로그의 콘텐츠 작성부터 수익 최적화까지 완전 자동화하는 CLI 도구입니다.

### 주요 기능

- **AI 콘텐츠 생성**: Claude를 활용한 고품질 블로그 포스트 자동 생성
- **이미지 생성**: DALL-E 3를 사용한 블로그 이미지 생성
- **WordPress 자동화**: 마크다운 → WordPress 자동 변환 및 업로드
- **SEO 자동화**: 메타 태그, Open Graph, Twitter Card 자동 생성
- **광고 자동 삽입**: Google AdSense 코드 최적 위치 자동 삽입
- **실시간 프리뷰**: 파일 변경 시 브라우저 자동 새로고침
- **트렌드 모니터링**: Reddit, Hacker News, Twitter 실시간 트렌드 추적
- **분석 대시보드**: 조회수, 댓글, 인기 포스트 통계

---

## 빠른 시작

### 1. 필요 사항

시작하기 전에 다음이 준비되어 있어야 합니다:

- **Node.js 20 이상**
- **pnpm 9 이상**
- **WordPress 사이트** (REST API 활성화)
- **OpenAI API 키** (이미지 생성 기능 사용 시)

### 2. 설치

#### 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/blog.git
cd blog

# 의존성 설치
pnpm install

# 빌드
pnpm build
```

#### CLI 전역 설치 (선택사항)

```bash
cd packages/cli
pnpm link --global
```

이제 `blog` 명령어를 전역에서 사용할 수 있습니다.

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 다음 정보를 입력합니다:

```env
# WordPress 연결 (필수)
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

# Google AdSense (선택사항)
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# OpenAI (이미지 생성 시 필수)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# Twitter API (선택사항 - 트렌드 모니터링)
TWITTER_BEARER_TOKEN=AAAAAAAAAxxxxxxxxxx
```

#### WordPress Application Password 생성 방법

1. WordPress 관리자 페이지 로그인
2. **사용자 → 프로필** 메뉴 이동
3. 하단의 **Application Passwords** 섹션으로 스크롤
4. 새 Application 이름 입력 (예: "blog-cli")
5. **Add New Application Password** 클릭
6. 생성된 비밀번호를 복사하여 `.env` 파일에 입력

> **주의**: Application Password는 일반 WordPress 비밀번호가 아닙니다. 반드시 위 절차를 따라 생성해야 합니다.

### 4. 설정 확인

WordPress 연결을 확인합니다:

```bash
blog config
```

올바르게 설정되었다면, WordPress 사이트 정보가 표시됩니다.

---

## 첫 번째 블로그 포스트 작성

실제로 블로그 포스트를 작성하고 발행하는 전체 과정을 따라해봅시다.

### Step 1: AI 초안 생성

Claude AI를 사용하여 블로그 포스트 초안을 생성합니다.

```bash
blog draft create "Next.js 14 완벽 가이드" "Next.js, React, SSR, 웹 개발" --words 2000 --language ko
```

**옵션 설명:**
- 첫 번째 인자: 포스트 주제
- 두 번째 인자: 키워드 (쉼표로 구분)
- `--words 2000`: 목표 단어 수
- `--language ko`: 한국어로 생성

생성된 초안은 `content/drafts/` 디렉토리에 저장됩니다.

**출력 예시:**
```
✓ AI 초안 생성 완료!

📝 초안 저장 위치: content/drafts/2025-10-27-nextjs-14-guide.md
📊 단어 수: 2,143 words
🔤 언어: Korean

다음 단계:
1. 초안 검토 및 수정: blog draft refine <파일경로> "수정 지시사항"
2. 프리뷰: blog preview <파일경로>
3. 발행: blog publish <파일경로>
```

### Step 2: 초안 검토 및 수정 (선택사항)

생성된 초안을 열어서 내용을 확인합니다:

```bash
# 텍스트 에디터로 열기
code content/drafts/2025-10-27-nextjs-14-guide.md
# 또는
vim content/drafts/2025-10-27-nextjs-14-guide.md
```

AI를 사용하여 초안을 수정할 수도 있습니다:

```bash
blog draft refine content/drafts/2025-10-27-nextjs-14-guide.md "SEO 키워드를 더 자연스럽게 추가하고, 실습 예제를 더 상세하게 작성해주세요"
```

### Step 3: 이미지 생성 (선택사항)

DALL-E 3를 사용하여 블로그 헤더 이미지를 생성합니다:

```bash
blog image generate "Modern minimalist blog header with Next.js logo and React components" \
  --size 1792x1024 \
  --quality hd \
  --style natural \
  --output ./images
```

**옵션 설명:**
- `--size`: 이미지 크기 (1024x1024, 1792x1024, 1024x1792)
- `--quality`: 품질 (standard, hd)
- `--style`: 스타일 (vivid, natural)
- `--output`: 저장 디렉토리

생성된 이미지는 지정한 디렉토리에 다운로드됩니다.

### Step 4: 실시간 프리뷰

발행하기 전에 실시간 프리뷰로 포스트를 확인합니다:

```bash
blog preview content/drafts/2025-10-27-nextjs-14-guide.md --show-ads
```

**프리뷰 기능:**
- 실제 WordPress 블로그와 동일한 스타일 적용
- 파일 수정 시 자동 새로고침 (Live Reload)
- `--show-ads` 옵션으로 광고 삽입 위치 표시
- 브라우저 자동 열림 (http://localhost:3000)

프리뷰를 확인하면서 내용을 수정할 수 있습니다. 파일을 저장하면 브라우저가 자동으로 새로고침됩니다.

프리뷰를 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

### Step 5: WordPress 발행

모든 준비가 완료되면 WordPress에 발행합니다:

```bash
blog publish content/drafts/2025-10-27-nextjs-14-guide.md
```

**발행 시 자동 처리:**
- ✅ 마크다운 → HTML 변환
- ✅ SEO 메타 태그 자동 생성 (title, description, keywords)
- ✅ Open Graph 태그 생성 (Facebook, LinkedIn 공유)
- ✅ Twitter Card 태그 생성 (Twitter 공유)
- ✅ Google AdSense 코드 자동 삽입 (첫 H2 뒤, 중간 위치)
- ✅ 키워드 밀도 체크 (0.5-2.5%)
- ✅ 한글 slug → 영문 자동 변환

**발행 옵션:**

```bash
# 초안으로 저장 (즉시 발행 안 함)
blog publish content/drafts/my-post.md --draft

# 시뮬레이션 (실제 업로드 안 함, 미리보기만)
blog publish content/drafts/my-post.md --dry-run

# 영어 콘텐츠 발행
blog publish content/posts/en/guide.md --language en
```

**출력 예시:**
```
✓ WordPress에 발행 완료!

📝 포스트 ID: 123
🔗 URL: https://your-blog.com/nextjs-14-guide
📊 SEO 점수: 95/100
🎯 키워드 밀도: 1.8% (최적)
📱 광고 삽입: 2개 위치

다음 단계:
1. 포스트 확인: https://your-blog.com/nextjs-14-guide
2. 분석 확인: blog analytics
```

### Step 6: 포스트 확인

발행된 포스트를 WordPress 사이트에서 확인합니다:

```bash
# 포스트 목록 조회
blog list

# 최근 10개 포스트
blog list --limit 10

# 발행된 포스트만
blog list --status publish
```

---

## 다음 단계

첫 번째 블로그 포스트를 성공적으로 발행했습니다! 다음 단계를 진행해보세요:

### 1. 기본 워크플로우 숙지

자세한 워크플로우는 [기본 워크플로우 가이드](./workflows.md)를 참조하세요.

### 2. 트렌드 모니터링

인기 있는 주제를 찾아서 블로그 포스트를 작성하세요:

```bash
# Reddit과 Hacker News 트렌드 확인
blog trending

# 키워드 필터링
blog trending --keywords "AI,Machine Learning" --limit 20
```

### 3. 분석 대시보드

블로그 성과를 확인하세요:

```bash
# 월간 분석 (기본)
blog analytics

# 주간 분석
blog analytics --period week

# 인기 포스트 20개, 댓글순 정렬
blog analytics --limit 20 --sort-by comments
```

### 4. 고급 기능 탐색

- **템플릿 시스템**: 다양한 콘텐츠 유형별 맞춤 템플릿 ([WordPress 설정 가이드](./wordpress-setup.md))
- **SEO 최적화**: 메타 태그 및 키워드 최적화 팁
- **광고 수익화**: AdSense 최적 배치 전략

### 5. 트러블슈팅

문제가 발생하면 [트러블슈팅 가이드](./troubleshooting.md)를 참조하세요.

---

## 자주 묻는 질문 (FAQ)

### Q1: Application Password를 생성할 수 없어요

**A:** WordPress 사이트에서 REST API가 활성화되어 있는지 확인하세요. 일부 보안 플러그인이 REST API를 차단할 수 있습니다.

### Q2: AI 초안 생성이 너무 느려요

**A:** Claude API는 긴 콘텐츠 생성 시 시간이 걸릴 수 있습니다. `--words` 옵션을 줄이거나, 여러 개의 짧은 포스트를 생성하는 것을 고려해보세요.

### Q3: 이미지 생성에 실패해요

**A:** OpenAI API 키가 올바르게 설정되어 있는지, API 크레딧이 남아있는지 확인하세요. DALL-E 3는 유료 API입니다.

### Q4: 프리뷰 서버 포트를 변경하고 싶어요

**A:** `--port` 옵션을 사용하세요:
```bash
blog preview content/posts/my-post.md --port 8080
```

### Q5: 발행된 포스트를 수정하고 싶어요

**A:** 현재 버전에서는 포스트 수정 기능이 없습니다. WordPress 관리자 페이지에서 직접 수정하거나, 새로 발행 후 이전 포스트를 삭제하세요:
```bash
blog delete 123  # 포스트 ID
```

---

## 도움이 필요하신가요?

- **전체 문서**: [README.md](../README.md)
- **WordPress 설정**: [WordPress 설정 가이드](./wordpress-setup.md)
- **트러블슈팅**: [트러블슈팅 가이드](./troubleshooting.md)
- **GitHub Issues**: [https://github.com/your-username/blog/issues](https://github.com/your-username/blog/issues)

---

**다음**: [기본 워크플로우](./workflows.md) | [WordPress 설정 가이드](./wordpress-setup.md)
