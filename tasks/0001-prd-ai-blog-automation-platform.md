# PRD: AI-Powered Blog Automation Platform

## Introduction/Overview

### Problem Statement
블로거가 장기적으로 안정적인 수익을 창출하기 위해서는 지속적이고 고품질의 콘텐츠 생산이 필수적입니다. 하지만 전통적인 블로깅 워크플로우는 다음과 같은 문제점이 있습니다:

- **시간 소모**: 포스트 1개 작성에 4-6시간 소요
- **반복 작업**: 마크다운 작성 → HTML 변환 → WordPress 업로드 → SEO 설정 → 광고 삽입 등의 수동 작업
- **일관성 부족**: 수동 작업으로 인한 실수 (광고 누락, SEO 태그 누락 등)
- **확장성 한계**: 다중 블로그 운영 시 작업량 기하급수적 증가

### Solution
Claude Code와 WordPress REST API를 활용한 완전 자동화된 블로그 콘텐츠 관리 플랫폼을 구축합니다. 이를 통해:

- 블로거는 **기본 설계만** 하고 AI가 초안 작성
- **자동화된 프리뷰** 시스템으로 빠른 검토
- **원클릭 발행**으로 WordPress 업로드 + 광고 자동 삽입 + SEO 최적화
- **시간 절감**: 포스트 1개 작성 시간 4-6시간 → **1-2시간** (60-75% 절감)

### Business Context
- **니치**: AI/LLM 활용 가이드 (단일 니치 전략)
- **수익 모델**: Google AdSense (Phase 1)
- **목표 독자**: AI 도구를 배우고 싶은 일반 사용자, 비즈니스 전문가
- **콘텐츠 전략**: Evergreen 80% + Trending 20%

---

## Goals

### Business Goals
1. **6개월 목표** (보수적 목표):
   - 월 방문자: 10,000명
   - 월 수익: $100-300 (AdSense)
   - 총 포스트: 50개 (주 2개 × 6개월)

2. **12개월 목표**:
   - 월 방문자: 50,000명
   - 월 수익: $500-1,000
   - 총 포스트: 100개+

3. **장기 목표** (Year 2-3):
   - 서브 니치 확장 (생산성 도구)
   - 다중 수익원 (제휴 마케팅, 디지털 제품)
   - 다중 블로그 운영

### Product Goals
1. **생산성 향상**: 콘텐츠 작성 시간 60% 이상 절감
2. **품질 보장**: AI 생성 콘텐츠의 일관된 품질 유지
3. **자동화**: 반복 작업(SEO, 광고 삽입, 이미지 처리) 100% 자동화
4. **확장성**: 미래 다중 블로그 지원 가능한 아키텍처

### Technical Goals
1. **안정성**: 80%+ 테스트 커버리지
2. **개발 효율**: 4-6주 내 MVP 완성
3. **유지보수성**: 명확한 코드 구조와 문서화

---

## User Stories

### Epic 1: AI 기반 콘텐츠 생성

**US-1.1: 기본 아웃라인으로 초안 생성**
- **As a** 블로거
- **I want to** 주제와 키워드만 입력하면 Claude Code가 자동으로 2000단어 초안을 생성하도록
- **So that** 4-6시간 걸리던 초안 작성을 30분으로 단축할 수 있다

**US-1.2: 프롬프트 템플릿 재사용**
- **As a** 블로거
- **I want to** 자주 사용하는 포스트 구조를 템플릿으로 저장하고 재사용하도록
- **So that** 매번 새로운 프롬프트를 작성하지 않아도 된다

**US-1.3: AI 초안 반복 수정**
- **As a** 블로거
- **I want to** 생성된 초안에 대해 자연어로 수정 지시를 하면 Claude가 자동으로 수정하도록
- **So that** 원하는 품질이 나올 때까지 빠르게 반복할 수 있다

### Epic 2: 프리뷰 및 검토

**US-2.1: 브라우저 프리뷰**
- **As a** 블로거
- **I want to** 생성된 마크다운을 WordPress 스타일로 브라우저에서 프리뷰할 수 있도록
- **So that** 최종 발행 전 정확한 모습을 확인할 수 있다

**US-2.2: 광고 위치 시각화**
- **As a** 블로거
- **I want to** 프리뷰에서 광고가 삽입될 위치를 시각적으로 확인할 수 있도록
- **So that** 광고 배치가 적절한지 사전에 판단할 수 있다

### Epic 3: 자동 발행

**US-3.1: 원클릭 WordPress 발행**
- **As a** 블로거
- **I want to** 하나의 명령어로 마크다운 파일을 WordPress에 발행할 수 있도록
- **So that** 수동 복사/붙여넣기 작업을 제거할 수 있다

**US-3.2: 광고 자동 삽입**
- **As a** 블로거
- **I want to** 발행 시 자동으로 AdSense 광고 코드가 전략적 위치에 삽입되도록
- **So that** 매번 수동으로 광고 코드를 넣지 않아도 되고 누락을 방지한다

**US-3.3: SEO 자동 최적화**
- **As a** 블로거
- **I want to** 발행 시 SEO 메타 태그(title, description, og tags)가 자동 생성되도록
- **So that** 검색 엔진 최적화를 빠뜨리지 않는다

### Epic 4: 고급 기능 (확장 MVP)

**US-4.1: 이미지 자동 생성**
- **As a** 블로거
- **I want to** DALL-E/Midjourney API로 포스트 주제에 맞는 Featured Image를 자동 생성하도록
- **So that** 별도로 이미지를 찾거나 제작하지 않아도 된다

**US-4.2: 트렌드 모니터링**
- **As a** 블로거
- **I want to** Reddit, Hacker News, Twitter에서 AI 관련 트렌딩 토픽을 자동으로 추천받도록
- **So that** Trending 20% 콘텐츠를 빠르게 포착하고 작성할 수 있다

**US-4.3: 분석 대시보드**
- **As a** 블로거
- **I want to** 터미널에서 블로그 성과(방문자, 수익, 인기 포스트)를 확인할 수 있도록
- **So that** WordPress 관리자에 로그인하지 않고도 현황을 파악한다

---

## Functional Requirements

### Core Features (필수)

#### 1. AI 초안 생성 시스템
**FR-1.1** 시스템은 Claude Code headless mode (`-p` 플래그)를 통해 블로그 포스트 초안을 생성해야 한다.

**FR-1.2** 사용자는 다음 정보를 입력할 수 있어야 한다:
- 주제 (필수)
- 키워드 (필수)
- 타겟 단어 수 (기본: 2000 단어)
- 포스트 구조/아웃라인 (선택)
- 톤/스타일 (선택: 친근함, 전문적, 교육적 등)

**FR-1.3** 생성된 초안은 마크다운 형식으로 `content/drafts/` 디렉토리에 저장되어야 한다.

**FR-1.4** 초안은 frontmatter를 포함해야 한다:
```yaml
---
title: "포스트 제목"
slug: "url-slug"
excerpt: "요약 (150자 이내)"
status: "draft"
categories: ["카테고리1", "카테고리2"]
tags: ["태그1", "태그2"]
language: "ko" # or "en"
featuredImage: ""
createdAt: "2025-01-01T00:00:00Z"
---
```

**FR-1.5** 시스템은 프롬프트 템플릿 파일(`.txt`)을 `prompts/` 디렉토리에서 로드하여 재사용할 수 있어야 한다.

#### 2. AI 초안 수정 시스템
**FR-2.1** 사용자는 자연어로 수정 지시를 할 수 있어야 한다.
- 예: "고급 팁 섹션에 실제 예시 3개 추가해줘"

**FR-2.2** 시스템은 기존 마크다운 파일을 읽고 Claude Code에 전달하여 수정된 버전을 생성해야 한다.

**FR-2.3** 수정 이력을 간단히 로그로 남겨야 한다 (날짜, 수정 내용 요약).

#### 3. 프리뷰 시스템
**FR-3.1** 시스템은 로컬 웹 서버(포트: 3000)를 시작하여 마크다운을 HTML로 렌더링해야 한다.

**FR-3.2** 프리뷰는 WordPress 테마와 유사한 스타일을 적용해야 한다 (Avada 스타일 참고).

**FR-3.3** 광고 코드가 삽입될 위치를 시각적으로 표시해야 한다 (예: 빨간 점선 박스).

**FR-3.4** 프리뷰 실행 시 자동으로 브라우저가 열려야 한다.

**FR-3.5** 파일 변경 감지 시 브라우저가 자동으로 새로고침되어야 한다 (Live Reload).

#### 4. WordPress 발행 시스템
**FR-4.1** 시스템은 WordPress REST API를 통해 포스트를 생성/업데이트/삭제할 수 있어야 한다.

**FR-4.2** 발행 전 다음을 자동으로 처리해야 한다:
- 마크다운 → HTML 변환 (unified + remark)
- 광고 코드 삽입 (설정된 위치: after-first-h2, middle)
- SEO 메타 태그 생성 (title, description, og:image 등)

**FR-4.3** 사용자는 발행 상태를 선택할 수 있어야 한다:
- `--draft`: 초안으로 저장
- `--publish`: 즉시 발행 (기본값)

**FR-4.4** 발행 성공 시 다음 정보를 출력해야 한다:
- WordPress 포스트 ID
- 발행 URL
- 카테고리/태그 정보

**FR-4.5** 발행 실패 시 명확한 에러 메시지를 제공해야 한다.

#### 5. 광고 관리 시스템
**FR-5.1** 시스템은 `.env` 파일에서 AdSense 설정을 로드해야 한다:
```env
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx
```

**FR-5.2** 광고는 다음 위치에 자동 삽입되어야 한다:
- `after-first-h2`: 첫 번째 H2 제목 뒤
- `middle`: 본문 중간 (문단 개수의 50% 지점)

**FR-5.3** 광고 코드는 AdSense Auto Ads 형식을 사용해야 한다.

#### 6. SEO 자동화 시스템
**FR-6.1** 시스템은 frontmatter에서 메타 정보를 추출하여 WordPress 메타 태그로 변환해야 한다.

**FR-6.2** Open Graph 태그를 자동 생성해야 한다:
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`

**FR-6.3** 포스트 slug는 한글일 경우 자동으로 영문 변환되어야 한다.

**FR-6.4** 키워드 밀도를 체크하고 경고를 표시해야 한다 (기준: 0.5-2.5%).

### Advanced Features (확장 MVP)

#### 7. 이미지 자동 생성
**FR-7.1** 시스템은 DALL-E 또는 Midjourney API를 통합하여 Featured Image를 생성해야 한다.

**FR-7.2** 생성된 이미지는 자동으로 WordPress 미디어 라이브러리에 업로드되어야 한다.

**FR-7.3** 이미지 생성 프롬프트는 포스트 제목과 키워드를 기반으로 자동 생성되어야 한다.

**FR-7.4** 사용자는 이미지 스타일을 선택할 수 있어야 한다:
- `realistic`, `illustration`, `minimalist`, `abstract`

#### 8. 트렌드 모니터링
**FR-8.1** 시스템은 다음 소스에서 AI 관련 트렌딩 토픽을 수집해야 한다:
- Reddit: r/ChatGPT, r/artificial, r/MachineLearning
- Hacker News: AI 관련 스레드
- Twitter: #AI, #ChatGPT 등의 해시태그

**FR-8.2** 트렌딩 토픽은 점수(upvotes, likes, comments)로 정렬되어야 한다.

**FR-8.3** 사용자는 트렌딩 토픽을 선택하면 자동으로 해당 주제의 초안 생성 프롬프트가 제공되어야 한다.

**FR-8.4** 트렌드 모니터링은 하루 1회 자동 실행되어야 한다 (cron 또는 GitHub Actions).

#### 9. 분석 대시보드
**FR-9.1** 시스템은 WordPress REST API를 통해 다음 지표를 가져와야 한다:
- 총 포스트 수
- 총 방문자 수 (WordPress Analytics 플러그인 필요)
- 인기 포스트 Top 10 (조회수 기준)

**FR-9.2** AdSense API를 통해 수익 정보를 가져와야 한다:
- 오늘 수익
- 이번 달 수익
- RPM (Revenue Per Mille)

**FR-9.3** 대시보드는 터미널 UI로 표시되어야 한다 (blessed, ink 등 사용).

**FR-9.4** 대시보드는 실시간 업데이트되어야 한다 (30초마다).

---

## Non-Goals (Out of Scope)

본 프로젝트에서 다루지 **않는** 사항:

1. **웹 인터페이스**: CLI 도구로 제한 (웹 대시보드는 Phase 2 이후)
2. **다중 사용자 지원**: 개인용으로 설계, 사용자 계정 관리 없음
3. **WordPress 테마 개발**: Avada 테마를 그대로 사용, 커스터마이징 없음
4. **WordPress 플러그인 개발**: REST API만 사용, 플러그인 제작 안 함
5. **제휴 마케팅 기능**: Phase 1에서는 AdSense만, 제휴 링크 관리는 Phase 2
6. **이메일 마케팅**: 뉴스레터 기능은 Phase 2
7. **소셜 미디어 자동 공유**: Phase 2
8. **콘텐츠 캘린더/스케줄링**: Phase 2
9. **다중 블로그 동시 관리**: Phase 1은 단일 블로그만, Phase 2에서 확장
10. **AI 모델 선택**: Phase 1은 Claude Code만, GPT-4 등은 Phase 2

---

## Design Considerations

### UI/UX (CLI)

**명령어 구조**:
```bash
# 초안 생성
blog draft create <topic> [options]
  --keywords <keywords>      # 쉼표로 구분
  --words <number>           # 타겟 단어 수 (기본: 2000)
  --template <file>          # 프롬프트 템플릿
  --language <ko|en>         # 언어 (기본: ko)

# 초안 수정
blog draft refine <file> --instruction <text>

# 프리뷰
blog preview <file>
  --port <number>            # 포트 번호 (기본: 3000)
  --no-browser               # 브라우저 자동 열기 비활성화

# 발행
blog publish <file>
  --draft                    # 초안으로 저장
  --publish                  # 즉시 발행 (기본값)

# 이미지 생성 (확장 MVP)
blog image generate <file>
  --style <realistic|illustration|minimalist|abstract>

# 트렌드 모니터링 (확장 MVP)
blog trending
  --source <reddit|hn|twitter|all>  # 소스 선택
  --limit <number>                   # 결과 개수 (기본: 10)

# 분석 (확장 MVP)
blog analytics
  --range <today|week|month>  # 기간
```

**프리뷰 화면**:
- Markdown 렌더링 (GitHub Flavored Markdown)
- WordPress 스타일 CSS 적용
- 광고 삽입 위치 시각화 (빨간 점선 박스)
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 프롬프트 템플릿

`prompts/blog-post.txt`:
```
당신은 AI 활용 전문 블로거입니다.

주제: {TOPIC}
키워드: {KEYWORDS}
타겟 독자: AI 도구를 배우고 싶은 일반 사용자, 비즈니스 전문가

요구사항:
- 길이: {WORDS} 단어
- 톤: 친근하고 실용적
- 구조:
  1. 소개 (300 단어) - 문제 제시 + 해결책 소개
  2. 기본 사용법 (500 단어) - 단계별 가이드
  3. 고급 팁 (700 단어) - 실제 예시 5개
  4. 결론 (200 단어) - 요약 + 실행 제안

- 각 섹션에 명확한 소제목 (H2, H3)
- 실제 스크린샷 설명 포함 (이미지 경로는 추후 삽입)
- SEO: 키워드를 자연스럽게 5-7회 삽입
- 코드 예시가 필요하면 마크다운 코드 블록 사용

Frontmatter 형식:
---
title: "{TITLE}"
excerpt: "간단한 요약 (150자 이내)"
categories: [{CATEGORIES}]
tags: [{TAGS}]
language: "{LANGUAGE}"
status: "draft"
---
```

---

## Technical Considerations

### Architecture

**Monorepo 구조** (기존 유지):
```
blog/
├── packages/
│   ├── cli/              # CLI 명령어
│   │   └── src/commands/
│   │       ├── draft/
│   │       │   ├── create.ts
│   │       │   └── refine.ts
│   │       ├── preview.ts
│   │       ├── publish.ts
│   │       ├── image.ts     # 확장 MVP
│   │       ├── trending.ts  # 확장 MVP
│   │       └── analytics.ts # 확장 MVP
│   ├── core/
│   │   └── src/
│   │       ├── claude.ts       # Claude Code 통합
│   │       ├── wordpress.ts    # WordPress API
│   │       ├── markdown.ts     # 마크다운 처리
│   │       ├── ads.ts          # 광고 삽입
│   │       ├── seo.ts          # SEO 최적화
│   │       ├── preview.ts      # 프리뷰 서버
│   │       ├── image.ts        # 이미지 생성 (확장 MVP)
│   │       ├── trending.ts     # 트렌드 모니터링 (확장 MVP)
│   │       └── analytics.ts    # 분석 (확장 MVP)
│   └── shared/
│
├── content/
│   ├── drafts/           # AI 생성 초안
│   └── posts/
│
├── prompts/              # 재사용 프롬프트 템플릿
│   ├── blog-post.txt
│   ├── tutorial.txt
│   └── review.txt
│
└── .env                  # 환경 변수
```

### Technology Stack

**Core**:
- Node.js 20+ + TypeScript 5.3+
- pnpm 8+ (workspace)
- tsup (빌드)

**CLI**:
- commander (CLI 프레임워크)
- inquirer (인터랙티브 프롬프트)
- ora (스피너)
- chalk (컬러링)

**Claude Code 통합**:
- child_process (headless mode 실행)
- 또는 직접 Claude API 호출 (fallback)

**마크다운 처리**:
- gray-matter (frontmatter)
- unified + remark-parse + remark-gfm + remark-rehype + rehype-stringify

**WordPress**:
- wpapi (REST API 클라이언트)

**프리뷰 서버**:
- express (웹 서버)
- socket.io (Live Reload)
- chokidar (파일 감시)

**이미지 생성 (확장 MVP)**:
- openai (DALL-E 3)
- 또는 Replicate API (Midjourney)

**트렌드 모니터링 (확장 MVP)**:
- snoowrap (Reddit API)
- axios (Hacker News/Twitter API)

**분석 (확장 MVP)**:
- blessed 또는 ink (터미널 UI)

**테스팅**:
- vitest (단위/통합 테스트)
- @testing-library (컴포넌트 테스트)
- Playwright (E2E - 선택)

### External Dependencies

**필수 서비스**:
- WordPress 사이트 (Avada 테마 설치됨)
- WordPress REST API 활성화
- WordPress Application Password 생성
- Google AdSense 계정

**선택 서비스 (확장 MVP)**:
- OpenAI API (DALL-E)
- Reddit API 키
- Twitter API 키

### Environment Variables

`.env`:
```env
# WordPress
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# AdSense
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# 기본 설정
DEFAULT_LANGUAGE=ko
DEFAULT_POST_STATUS=draft
DEFAULT_WORDS=2000

# 확장 MVP - 이미지 생성
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
IMAGE_STYLE=realistic

# 확장 MVP - 트렌드 모니터링
REDDIT_CLIENT_ID=xxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxx
TWITTER_BEARER_TOKEN=xxxxxxxx

# 확장 MVP - 분석
WORDPRESS_ANALYTICS_PLUGIN=jetpack # or google-site-kit
```

### Error Handling

**에러 타입**:
1. **WordPress API 에러**: 연결 실패, 인증 실패, 포스트 생성 실패
2. **Claude Code 에러**: 프로세스 실패, 타임아웃, 응답 파싱 실패
3. **파일 시스템 에러**: 권한 없음, 파일 없음
4. **검증 에러**: frontmatter 누락, 필수 필드 없음

**에러 처리 전략**:
- 모든 에러는 명확한 메시지와 함께 사용자에게 전달
- 복구 가능한 에러는 재시도 로직 (최대 3회)
- 모든 에러는 로그 파일에 기록 (`logs/error.log`)

---

## Success Metrics

### Business Metrics (6개월 목표)
1. **트래픽**: 월 10,000 방문자
2. **수익**: 월 $100-300 (AdSense)
3. **콘텐츠**: 총 50개 포스트 발행
4. **SEO**: 10개 이상 키워드 Google 1페이지 랭킹

### Product Metrics
1. **생산성**: 포스트 1개 작성 시간 **1-2시간 이내** (기존 4-6시간 대비 60-75% 절감)
2. **품질**: AI 생성 포스트의 95% 이상이 수정 1회 이내로 발행 가능
3. **자동화율**: 반복 작업(광고, SEO, 이미지)의 100% 자동화
4. **안정성**: WordPress 발행 성공률 98% 이상

### Technical Metrics
1. **테스트 커버리지**: 80% 이상
2. **빌드 시간**: 2분 이내
3. **CLI 응답 시간**: 초안 생성 30초-2분, 발행 5-10초
4. **에러율**: 5% 이하

---

## Testing Strategy

### Unit Tests (핵심 로직)
**테스트 대상**:
- `packages/core/src/claude.ts`: Claude Code 호출 및 응답 파싱
- `packages/core/src/markdown.ts`: 마크다운 파싱 및 HTML 변환
- `packages/core/src/ads.ts`: 광고 삽입 로직
- `packages/core/src/seo.ts`: SEO 메타 태그 생성
- `packages/shared/src/schemas.ts`: Zod 검증

**도구**: vitest

**목표 커버리지**: 80%

### Integration Tests (WordPress 연동)
**테스트 시나리오**:
1. WordPress API 연결 테스트 (모킹)
2. 포스트 생성/업데이트/삭제
3. 미디어 업로드
4. 카테고리/태그 관리

**도구**: vitest + nock (HTTP 모킹)

### E2E Tests (전체 워크플로우)
**테스트 시나리오**:
1. 초안 생성 → 프리뷰 → 발행 전체 플로우
2. 이미지 생성 → WordPress 업로드
3. 트렌딩 토픽 감지 → 초안 생성

**도구**: Playwright (선택적)

### Manual Tests (수동 테스트)
**테스트 항목**:
1. 실제 WordPress 사이트에 발행
2. AdSense 광고 표시 확인
3. SEO 메타 태그 확인 (Google 검색 콘솔)
4. 프리뷰 화면 시각적 확인

---

## Open Questions

1. **DALL-E vs Midjourney**: 이미지 생성 API 선택 기준?
   - DALL-E 3: OpenAI 통합, 간편함, 비용 $0.04/이미지
   - Midjourney: 품질 우수, Replicate 통해 API 사용, 비용 $0.08/이미지
   - **제안**: Phase 1에서는 DALL-E로 시작, Phase 2에서 비교 테스트

2. **WordPress Analytics 플러그인**: 어떤 플러그인 사용?
   - Jetpack (공식, 무료)
   - Google Site Kit (Google 통합)
   - MonsterInsights (유료, 고급 기능)
   - **제안**: Jetpack 무료 버전으로 시작

3. **트렌드 모니터링 빈도**: 하루 1회? 실시간?
   - 하루 1회: 리소스 절약, 충분한 데이터
   - 실시간: 빠른 대응, 비용 증가
   - **제안**: 하루 1회 (오전 9시)

4. **이미지 저장 위치**: WordPress 미디어 라이브러리? 로컬?
   - WordPress 미디어: 중앙 관리, CDN 활용
   - 로컬 저장: 백업 용이, 재사용 가능
   - **제안**: WordPress 미디어 + 로컬 캐시

5. **다국어 포스트 관리**: 한 파일? 분리?
   - 한 파일: 관리 간편, frontmatter에 언어 지정
   - 분리: 명확한 구조, `content/posts/ko/`, `content/posts/en/`
   - **제안**: 분리 (기존 구조 유지)

6. **Claude Code 타임아웃**: 긴 포스트 생성 시 타임아웃?
   - 기본: 2분
   - 긴 포스트 (3000+ 단어): 5분
   - **제안**: 단어 수에 비례하여 동적 타임아웃 설정

7. **프리뷰 서버 포트 충돌**: 3000 포트 이미 사용 중이면?
   - **제안**: 자동으로 다음 포트 (3001, 3002...) 찾기

8. **테스트 데이터**: 실제 WordPress vs 로컬 Mock?
   - **제안**: 개발 시 Mock, CI/CD는 테스트 WordPress 인스턴스

---

## Implementation Phases

### Phase 1: Core MVP (Week 1-2)
- [ ] Claude Code headless 통합
- [ ] 마크다운 파싱 및 WordPress 발행
- [ ] 기본 광고 삽입
- [ ] CLI 명령어 (`draft create`, `publish`)

### Phase 2: 프리뷰 시스템 (Week 3)
- [ ] 프리뷰 서버 구현
- [ ] Live Reload
- [ ] 광고 위치 시각화

### Phase 3: SEO 자동화 (Week 4)
- [ ] 메타 태그 생성
- [ ] Open Graph 태그
- [ ] 키워드 밀도 체크

### Phase 4: 확장 기능 (Week 5-6)
- [ ] 이미지 자동 생성
- [ ] 트렌드 모니터링
- [ ] 분석 대시보드

### Phase 5: 테스팅 및 문서화 (Week 6)
- [ ] 단위 테스트 작성 (80% 커버리지)
- [ ] 통합 테스트
- [ ] README 및 사용 가이드

---

## Acceptance Criteria

**Definition of Done**:
1. ✅ 모든 필수 기능 (FR-1.1 ~ FR-6.4) 구현 완료
2. ✅ 확장 MVP 기능 (FR-7.1 ~ FR-9.4) 구현 완료
3. ✅ 테스트 커버리지 80% 이상 달성
4. ✅ 모든 테스트 통과 (unit + integration)
5. ✅ 실제 WordPress 사이트에 포스트 10개 발행 성공
6. ✅ AdSense 광고 정상 표시 확인
7. ✅ SEO 메타 태그 Google 검색 콘솔에서 확인
8. ✅ 프리뷰 화면 정상 작동 (브라우저 자동 열림, Live Reload)
9. ✅ 에러 처리 로직 검증 (의도적으로 에러 발생 시켜 확인)
10. ✅ 코드 리뷰 완료 및 CLAUDE.md 업데이트

---

**문서 버전**: 1.0
**작성일**: 2025-10-25
**작성자**: AI Assistant (Claude Code)
**검토자**: 사용자 (idongho)
