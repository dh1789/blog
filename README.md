# @blog/cli - AI-Powered WordPress Blog Automation Platform

WordPress + Avada 테마 기반 블로그의 콘텐츠 작성부터 수익 최적화까지 완전 자동화하는 CLI 도구

## ✨ 주요 기능

### 📝 AI 콘텐츠 생성
- **AI 초안 생성**: Claude를 활용한 고품질 블로그 포스트 자동 생성
- **초안 수정**: AI 기반 콘텐츠 개선 및 리파인
- **템플릿 시스템**: 다양한 콘텐츠 유형별 맞춤 템플릿

### 🌐 AI 자동 번역 (Epic 11.0)
- **원클릭 번역 & 발행**: 한글 포스트 발행 시 자동으로 영문 번역 및 발행
- **Claude Code 통합**: 고품질 AI 번역 엔진
- **8단계 품질 검증**: 라인 수, 코드 블록, SEO 키워드, 제목 길이 자동 검증
- **SEO 최적화**: 영문 SEO에 최적화된 제목/요약 자동 생성
- **Polylang 자동 연결**: 한영 포스트 자동 연결로 언어 전환 지원

### 🖼️ 이미지 생성 (DALL-E 3)
- **AI 이미지 생성**: DALL-E 3를 사용한 블로그 이미지 생성
- **다양한 크기 지원**: 1024x1024, 1792x1024, 1024x1792
- **품질 옵션**: Standard / HD
- **자동 다운로드**: 로컬 저장 및 WordPress 업로드 준비

### 🚀 WordPress 자동화
- **원클릭 발행**: 마크다운 → WordPress 자동 변환 및 업로드
- **🖼️ 이미지 자동 업로드 (Epic 12.0)**: 로컬 이미지를 WordPress 미디어 라이브러리에 자동 업로드
  - 중복 이미지 자동 감지 및 재사용
  - 마크다운 경로 자동 변환 (로컬 → WordPress CDN URL)
  - 업로드 진행률 및 결과 리포트
- **SEO 자동화**: 메타 태그, Open Graph, Twitter Card 자동 생성
- **광고 자동 삽입**: Google AdSense 코드 최적 위치 자동 삽입
- **포스트 관리**: 목록 조회, 삭제, 상태 변경

### 📊 분석 & 모니터링
- **SEO 분석**: 키워드 밀도, 섹션 분포, SEO 점수 분석 및 개선 제안
- **분석 대시보드**: 조회수, 댓글, 인기 포스트 통계
- **트렌드 모니터링**: Reddit, Hacker News, Twitter 실시간 트렌드 추적
- **키워드 점수**: 트렌드 토픽의 영향력 자동 계산
- **길이별 가중치**: 포스트 길이에 따른 동적 SEO 목표 조정
- **💰 키워드 수익성 분석 (Epic 8.0)**: Google Ads API를 통한 검색량·CPC·경쟁도 데이터 기반 주제 선정

### 👁️ 실시간 프리뷰
- **Live Reload**: 파일 변경 시 브라우저 자동 새로고침
- **WordPress 스타일**: 실제 블로그와 동일한 스타일 프리뷰
- **광고 위치 표시**: AdSense 삽입 위치 시각화

## 📦 설치

### 필요 사항
- Node.js 20 이상
- pnpm 9 이상
- WordPress 사이트 (REST API 활성화)
- OpenAI API 키 (이미지 생성 기능 사용 시)

### 1. 저장소 클론
```bash
git clone https://github.com/dh1789/blog.git
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

`.env` 파일 편집:
```env
# WordPress 연결
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-application-password

# Claude AI (콘텐츠 생성)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Google AdSense
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# OpenAI (이미지 생성)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# Twitter API (선택사항 - 트렌드 모니터링)
TWITTER_BEARER_TOKEN=AAAAAAAAAxxxxxxxxxx

# Google Ads API (선택사항 - Epic 8.0 키워드 수익성 분석)
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdEFghIJklMNopQRst
GOOGLE_ADS_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-Abc123...
GOOGLE_ADS_REFRESH_TOKEN=1//0abcdefg...
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

### 4. 빌드
```bash
pnpm build
```

### 5. CLI 설치 (선택사항)
```bash
cd packages/cli
pnpm link --global
```

이제 `blog` 명령어를 전역에서 사용할 수 있습니다.

## 🖥️ WordPress 서버 설치

VPS에 WordPress + Avada 테마를 자동으로 설치합니다.

### 필요 사항
- Ubuntu 20.04 또는 22.04 LTS VPS
- 도메인 (Cloudflare 등록 권장)
- Cloudflare Origin Certificate

### 설치 방법

상세 가이드: [docs/VULTR_VPS_SETUP.md](docs/VULTR_VPS_SETUP.md)

#### 1. Cloudflare Origin Certificate 준비

```bash
# Cloudflare 대시보드에서 인증서 발급
# SSL/TLS → Origin Server → Create Certificate (15 years)

# 로컬에 저장
cd scripts/wordpress-setup
# cert.pem, key.pem 파일 저장
```

#### 2. 설정 편집

```bash
# config.sh 편집
vim scripts/wordpress-setup/config.sh

# 도메인, 관리자 정보 입력
DOMAIN="your-domain.com"
ADMIN_EMAIL="your-email@gmail.com"
ADMIN_PASSWORD="SecurePassword123"
```

#### 3. 패키징 및 VPS 전송

```bash
# 압축
cd scripts
tar -czf wordpress-setup.tar.gz wordpress-setup/

# VPS로 전송
scp wordpress-setup.tar.gz root@YOUR_VPS_IP:/root/
```

#### 4. VPS에서 설치 실행

```bash
# VPS SSH 접속
ssh root@YOUR_VPS_IP

# 압축 해제 및 실행
cd /root
tar -xzf wordpress-setup.tar.gz
cd wordpress-setup
sudo bash setup.sh
```

**설치 시간**: 5-10분
**자동 구성**: LEMP + WordPress + Cloudflare SSL + Redis 캐싱 + Avada 테마

### 실제 운영 사례

- **도메인**: [https://beomanro.com](https://beomanro.com)
- **설치 완료**: 2025-11-02
- **구성**: Vultr VPS (Tokyo) + Cloudflare + Avada

## 🎯 사용법

### AI 초안 생성
```bash
# 기본 초안 생성
blog draft create "Next.js 14 완벽 가이드" "Next.js, React, SSR" --words 2000

# 한국어로 생성
blog draft create "Next.js 14 가이드" "Next.js, 리액트" --language ko

# 커스텀 템플릿 사용
blog draft create "제품 리뷰" "리뷰, 평가" --template review

# 초안 수정
blog draft refine content/drafts/my-post.md "SEO 키워드 추가 및 더 전문적인 톤으로 수정"
```

### DALL-E 이미지 생성
```bash
# 기본 이미지 생성
blog image generate "Modern minimalist blog header with tech theme"

# HD 품질, 가로 이미지
blog image generate "Beautiful landscape for blog header" \
  --size 1792x1024 \
  --quality hd \
  --style natural \
  --output ./images
```

### 실시간 프리뷰
```bash
# 기본 프리뷰 (포트 3000)
blog preview content/posts/my-post.md

# 커스텀 포트, 광고 위치 표시
blog preview content/posts/my-post.md --port 8080 --show-ads

# 브라우저 자동 열기 비활성화
blog preview content/posts/my-post.md --no-browser
```

### WordPress 발행
```bash
# 즉시 발행
blog publish content/posts/my-post.md

# 초안으로 저장
blog publish content/posts/my-post.md --draft

# 시뮬레이션 (업로드 안 함)
blog publish content/posts/my-post.md --dry-run

# 영어 콘텐츠 발행
blog publish content/posts/en/guide.md --language en

# 영어 포스트 발행 + 자동 언어 연결 (Polylang)
blog publish content/posts/en/guide.md --link-to 29
# 한글 Post ID 29와 자동으로 연결됨

# 🆕 로컬 이미지 자동 업로드 (Epic 12.0)
blog publish content/posts/my-post.md --upload-images

# 실행 흐름:
# 1. 마크다운에서 이미지 경로 파싱 (![](path), <img src="path">)
# 2. 각 이미지의 중복 여부 확인 (WordPress 미디어 라이브러리)
# 3. 신규 이미지만 업로드, 중복은 기존 URL 재사용
# 4. 마크다운 경로를 WordPress URL로 자동 변환
# 5. HTML 재생성 및 발행
```

**이미지 업로드 출력 예시**:
```
=== 이미지 자동 업로드 ===
⠹ 이미지 경로 파싱 중...
⠹ 로컬 이미지 3개 발견

발견된 이미지: ./images/screenshot.png, ./images/diagram.jpg, ../shared/logo.png

⠹ 이미지 업로드 중: screenshot.png
  ✓ 업로드: screenshot.png → https://beomanro.com/wp-content/uploads/2025/11/screenshot.png
⠹ 이미지 업로드 중: diagram.jpg
  ↻ 중복: diagram.jpg → 기존 URL 재사용
⠹ 이미지 업로드 중: logo.png
  ✓ 업로드: logo.png → https://beomanro.com/wp-content/uploads/2025/11/logo.png

=== 이미지 업로드 리포트 ===
총 이미지: 3
성공: 3
✔ 이미지 업로드 완료
```

### 포스트 관리
```bash
# 포스트 목록 조회
blog list

# 발행된 포스트만
blog list --status publish

# 최근 20개
blog list --limit 20

# 포스트 삭제
blog delete 123

# 강제 삭제 (확인 없이)
blog delete 123 --force
```

### AI 자동 번역 (Epic 11.0)

한글 포스트 발행 시 Claude Code를 활용해 자동으로 영문 번역 및 발행합니다.

```bash
# 기본 사용: 한글 포스트 발행 → 자동 번역 → 영문 발행 → 언어 연결
blog publish content/posts/ko/my-post.md

# 실행 흐름:
# 1. 한글 포스트 파싱 및 SEO 검증
# 2. WordPress에 한글 포스트 발행 (ID: 29)
# 3. ✨ 자동 번역 시작 (Claude Code)
# 4. 번역 품질 검증 (8단계)
# 5. 검증 통과 시 영문 포스트 발행 (ID: 26)
# 6. Polylang으로 언어 연결: 한글(29) ↔ 영문(26)

# 자동 번역 비활성화 (한글만 발행)
blog publish content/posts/ko/my-post.md --no-translate

# 초안으로 저장 (번역도 초안)
blog publish content/posts/ko/my-post.md --draft
```

**품질 검증 기준**:
- ✅ 라인 수: 50-150% 범위 (너무 짧거나 길면 에러)
- ✅ 코드 블록: 완전 보존 (개수 일치)
- ✅ SEO 키워드: 모든 태그 포함 여부
- ✅ 키워드 밀도: 0.5-2.5% 권장
- ✅ 제목 길이: ≤60자 (SEO 최적)
- ✅ 링크/헤딩: 구조 보존

**출력 예시**:
```
=== 자동 번역 시작 ===
⠹ 한글 포스트 번역 중 (Claude Code)...
✔ 번역 품질 검증 통과

=== 번역 품질 메트릭 ===
라인 수 차이: 8.5%
코드 블록 보존: 3개
메타데이터 완전성: ✓
SEO 최적화: ✓
제목 길이: 58자
Excerpt 길이: 285자/300자

✔ 영어 포스트 발행 완료! (ID: 26)
✔ 언어 연결 완료: 한글(29) ↔ 영문(26)
```

**실패 처리**:
- 번역 실패 시: 한글 포스트만 발행, 에러 메시지 출력
- 검증 실패 시: 한글 포스트만 발행, 검증 이슈 상세 출력
- 연결 실패 시: 양쪽 포스트 발행 성공, 수동 연결 가이드 제공

### 다국어 콘텐츠 관리 (Polylang)

Polylang 플러그인을 사용하는 WordPress 사이트에서 한글/영문 포스트를 수동으로 연결합니다.

```bash
# 방법 1: 발행 시 자동 연결 (권장)
# 1. 먼저 한글 포스트 발행
blog publish content/posts/ko/my-post.md
# → Post ID: 29

# 2. 영문 포스트 발행 + 자동 연결
blog publish content/posts/en/my-post.md --link-to 29
# → Post ID: 26, 자동으로 ID 29와 연결됨

# 방법 2: 별도 명령어로 연결
# 이미 발행된 포스트들을 나중에 연결
blog link-translations --ko 29 --en 26
```

**기능:**
- ✅ WordPress REST API를 통한 Polylang meta 필드 자동 업데이트
- ✅ 양방향 연결 (한국어 ↔ 영어)
- ✅ 자동 에러 처리 및 사용자 친화적 메시지
- ✅ 연결 실패 시에도 포스트 발행은 성공 처리

**워크플로우 예시:**
```bash
# 1. 한글 포스트 작성 및 발행
blog publish content/posts/ko/nodejs-cli-guide.md
# ✔ 포스트 발행 완료! (ID: 100)

# 2. 영문 번역
blog translate content/posts/ko/nodejs-cli-guide.md --target en
# ✔ 번역 파일 생성: content/posts/en/build-nodejs-cli-tools.md

# 3. 영문 발행 + 자동 연결
blog publish content/posts/en/build-nodejs-cli-tools.md --link-to 100
# ✔ 포스트 발행 완료! (ID: 101)
# ✔ 언어 연결 완료: 한글(100) ↔ 영문(101)
```

### 트렌드 모니터링
```bash
# Reddit과 Hacker News 트렌드
blog trending

# Twitter 포함
blog trending --sources reddit,hackernews,twitter

# 키워드 필터링
blog trending --keywords "AI,Machine Learning" --limit 20

# 최소 점수 필터
blog trending --min-score 50

# 🆕 수익성 데이터 포함 (Epic 8.0)
blog trending --revenue --limit 10

# 결과를 JSON으로 저장
blog trending --revenue --output keyword-analysis.json

# 테이블 형식으로 출력
blog trending --revenue --format table
```

**수익성 분석 출력 예시**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   트렌드 토픽 (수익성 분석 포함)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TypeScript 5.3: What's New (reddit)
   📊 트렌드: 85.2 | 💰 수익성: 72.4 | 🎯 종합: 80.0

   ├─ 검색량: 5,400/월
   ├─ CPC: $2.35
   ├─ 경쟁도: MEDIUM (50)
   └─ 수익성 평가: 높은 검색량, 적정 CPC, 중간 경쟁도
```

**설정 방법**: [GOOGLE_ADS_SETUP.md](./docs/GOOGLE_ADS_SETUP.md) 참고

### 분석 대시보드
```bash
# 월간 분석 (기본)
blog analytics

# 주간 분석
blog analytics --period week

# 인기 포스트 20개, 댓글순 정렬
blog analytics --limit 20 --sort-by comments
```

### SEO 분석
```bash
# 기본 SEO 분석
blog analyze-seo content/posts/my-post.md

# 상세 분석 (섹션별 키워드 분포 표시)
blog analyze-seo content/posts/my-post.md --verbose

# JSON 형식 출력 (프로그래밍 용도)
blog analyze-seo content/posts/my-post.md --json
```

**분석 결과**:
- **SEO 점수**: 100점 만점 (제목, 요약, 콘텐츠 길이, 키워드 밀도, 섹션 분포, 제목/요약 키워드 포함 여부)
- **키워드 밀도**: 각 키워드의 출현 횟수 및 밀도 (최적 범위: 0.5-2.5%)
- **섹션 분포**: H2 섹션별 키워드 분포 현황
- **개선 제안**: 구체적인 키워드 추가/제거 위치 및 횟수 제안

**길이별 가중치**:
- 1500+ 줄: 0.7x (목표 밀도: 0.35-1.75%)
- 1000-1500 줄: 0.8x (목표 밀도: 0.40-2.00%)
- 500-1000 줄: 0.9x (목표 밀도: 0.45-2.25%)
- 500 줄 미만: 1.0x (목표 밀도: 0.50-2.50%)

### 설정
```bash
# WordPress 연결 설정
blog config
```

## 📁 마크다운 파일 형식

```markdown
---
title: "포스트 제목 (SEO 최적화)"
description: "메타 설명 (150-160자)"
keywords: ["키워드1", "키워드2", "키워드3"]
tags: ["태그1", "태그2"]
categories: ["카테고리1"]
slug: "custom-url-slug"
language: "ko"
---

# 메인 제목

소개 내용...

## 첫 번째 섹션

내용...

## 두 번째 섹션

내용...
```

**자동 처리되는 기능:**
- ✅ SEO 메타 태그 자동 생성
- ✅ Open Graph 태그 (소셜 미디어 공유)
- ✅ Twitter Card 태그
- ✅ Google AdSense 코드 삽입 (첫 H2 뒤, 중간 위치)
- ✅ 키워드 밀도 체크 (0.5-2.5%)
- ✅ 한글 slug → 영문 자동 변환

## 🏗️ 프로젝트 구조

```
blog/
├── packages/
│   ├── cli/                 # CLI 명령어
│   │   ├── src/
│   │   │   ├── commands/    # 각 명령어 구현
│   │   │   │   ├── draft/   # AI 초안 생성
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── image.ts
│   │   │   │   ├── trending.ts
│   │   │   │   ├── preview.ts
│   │   │   │   └── publish.ts
│   │   │   └── index.ts     # CLI 진입점
│   │   └── package.json
│   ├── core/                # 핵심 로직
│   │   ├── src/
│   │   │   ├── wordpress.ts # WordPress API
│   │   │   ├── markdown.ts  # 마크다운 처리
│   │   │   ├── claude.ts    # AI 초안 생성
│   │   │   ├── seo.ts       # SEO 자동화
│   │   │   ├── image.ts     # DALL-E 이미지
│   │   │   ├── trending.ts  # 트렌드 모니터링
│   │   │   ├── analytics.ts # 분석 대시보드
│   │   │   ├── preview.ts   # 프리뷰 서버
│   │   │   ├── ads.ts       # 광고 삽입
│   │   │   └── templates.ts # 템플릿 시스템
│   │   └── package.json
│   └── shared/              # 공유 타입
│       ├── src/
│       │   ├── types.ts     # TypeScript 타입
│       │   └── schemas.ts   # Zod 스키마
│       └── package.json
├── content/
│   ├── drafts/              # AI 생성 초안
│   └── posts/               # 발행 준비된 포스트
│       ├── ko/              # 한국어
│       └── en/              # 영어
├── prompts/                 # AI 프롬프트 템플릿
│   ├── blog-post.txt
│   ├── review.txt
│   └── tutorial.txt
├── .env.example
└── package.json
```

## 🧪 테스팅

```bash
# 전체 테스트
pnpm test

# 커버리지 측정
pnpm test --coverage

# 특정 패키지 테스트
cd packages/core
pnpm test
```

**테스트 현황:**
- ✅ Core: 112 tests, 82% coverage
- ✅ CLI: 55 tests, 67% coverage
- ✅ Total: 167 tests

## 🔧 개발

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

## 📚 기술 스택

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+
- **Package Manager**: pnpm (workspace)
- **Testing**: Vitest
- **WordPress**: WordPress REST API, WPAPI
- **AI**: Claude (초안 생성), DALL-E 3 (이미지)
- **Framework**: Commander.js (CLI)
- **Preview**: Express, Socket.io, Chokidar
- **SEO**: Marked, transliteration
- **Trending**: Reddit API, Hacker News API, Twitter API
- **Terminal UI**: Chalk, Ora

## 🗺️ 로드맵

### ✅ Epic 1.0 - Core MVP
- [x] AI 초안 생성 (draft create, draft refine)
- [x] WordPress 발행 (publish)
- [x] 기본 CLI 구조

### ✅ Epic 2.0 - Preview System
- [x] 실시간 프리뷰 서버
- [x] Live Reload
- [x] 광고 위치 시각화

### ✅ Epic 3.0 - SEO Automation
- [x] SEO 메타 태그 자동 생성
- [x] Open Graph & Twitter Card
- [x] 키워드 밀도 체크
- [x] Slug 자동 변환

### ✅ Epic 4.0 - Extended MVP
- [x] DALL-E 이미지 생성
- [x] 트렌드 모니터링 (Reddit, HN, Twitter)
- [x] 분석 대시보드

### ✅ Epic 5.0 - Testing & Documentation
- [x] Vitest 설정
- [x] 단위 테스트 (167 tests)
- [x] 커버리지 측정 (82% core, 67% CLI)
- [x] 통합 테스트
- [x] CLI 검증
- [x] 사용자 가이드

### ✅ Epic 8.0 - Keyword Revenue Optimization
- [x] Google Ads API 연동
- [x] 키워드 수익성 분석 (검색량, CPC, 경쟁도)
- [x] trending 명령어 --revenue 플래그
- [x] 캐싱 시스템
- [x] 종합 문서화

### ✅ Epic 9.0 - WordPress Server Automation
- [x] WordOps 기반 자동 설치 스크립트
- [x] Cloudflare Origin Certificate SSL 설정
- [x] 방화벽(UFW) 자동 구성
- [x] Avada 테마 자동 설치
- [x] VPS 실제 배포 검증 (beomanro.com)
- [x] 완전 자동화 (5-10분 설치)

### ✅ Epic 10.0 - Multilingual Content Management
- [x] Polylang 자동 언어 연결
- [x] `link-translations` 명령어 구현
- [x] `publish --link-to` 옵션 통합
- [x] WordPress REST API 기반 양방향 연결
- [x] 완전 자동화 워크플로우

### ✅ Epic 11.0 - AI Auto-Translation System
- [x] Claude Code 통합 번역 엔진
- [x] 8단계 품질 검증 시스템
  - [x] 라인 수 검증 (50-150% 범위)
  - [x] 코드 블록 보존
  - [x] SEO 키워드 보존
  - [x] 키워드 밀도 검증 (0.5-2.5%)
  - [x] 제목 길이 검증 (≤60자)
  - [x] 링크/헤딩 구조 보존
- [x] SEO 최적화 영문 제목/요약 자동 생성
- [x] `publish --no-translate` 플래그
- [x] 자동 번역 → 발행 → Polylang 연결 완전 자동화
- [x] 종합 테스트 (39 tests: translator 12, validation 19, wordpress 8)
- [x] 문서화 및 사용 가이드

### ✅ Epic 12.0 - WordPress Media Library Integration
- [x] WordPress Media API 클라이언트 구현
  - [x] `findMediaByFilename()`: 중복 이미지 검색
  - [x] 기존 `uploadMedia()` 활용
- [x] 이미지 경로 파싱 및 URL 변환
  - [x] `parseImagePaths()`: 마크다운/HTML 이미지 경로 추출
  - [x] `replaceImageUrls()`: 로컬 경로 → WordPress URL 변환
  - [x] `resolveImagePath()`: 상대 경로 → 절대 경로 변환
- [x] CLI 통합
  - [x] `--upload-images` 플래그 추가
  - [x] 자동 업로드 워크플로우 구현
  - [x] 진행률 표시 및 결과 리포트
- [x] 종합 테스트 (42 tests: findMediaByFilename 5, markdown 29, 기존 유지)
- [x] 문서화 (README.md, CLAUDE.md)

### 📋 Future Enhancements
- [ ] 일괄 업로드/업데이트
- [ ] 스케줄 발행
- [ ] 성능 분석 (Core Web Vitals)
- [ ] 추가 언어 지원 (일본어, 중국어)
- [ ] GitHub Actions CI/CD

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 🤝 기여

이슈와 PR을 환영합니다!

## 📮 문의

이슈를 통해 문의해주세요.
