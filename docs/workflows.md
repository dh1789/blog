# 기본 워크플로우 (Workflows)

@blog/cli를 활용한 다양한 블로그 운영 워크플로우를 안내합니다.

## 📚 목차

- [기본 워크플로우](#기본-워크플로우)
- [트렌드 기반 콘텐츠 생성](#트렌드-기반-콘텐츠-생성)
- [대량 콘텐츠 생성](#대량-콘텐츠-생성)
- [SEO 최적화 워크플로우](#seo-최적화-워크플로우)
- [다국어 콘텐츠 관리](#다국어-콘텐츠-관리)
- [성과 분석 및 개선](#성과-분석-및-개선)

---

## 기본 워크플로우

가장 일반적인 블로그 포스트 작성 워크플로우입니다.

### 워크플로우 다이어그램

```
1. 주제 선정
   ↓
2. AI 초안 생성 (blog draft create)
   ↓
3. 초안 검토 및 수정 (blog draft refine)
   ↓
4. 이미지 생성 (blog image generate) [선택사항]
   ↓
5. 실시간 프리뷰 (blog preview)
   ↓
6. WordPress 발행 (blog publish)
   ↓
7. 성과 모니터링 (blog analytics)
```

### 1. 주제 선정

블로그 포스트 주제를 선정합니다. 다음 요소를 고려하세요:

- **대상 독자**: 누구를 위한 콘텐츠인가?
- **검색 의도**: 어떤 검색어로 찾을까?
- **경쟁 강도**: 너무 경쟁이 심하지 않은가?
- **전문성**: 내가 제공할 수 있는 가치가 있는가?

### 2. AI 초안 생성

선정한 주제로 AI 초안을 생성합니다:

```bash
blog draft create "TypeScript 타입 시스템 완벽 가이드" \
  "TypeScript, 타입, 타입 시스템, 제네릭" \
  --words 2500 \
  --language ko \
  --template blog-post
```

**팁:**
- 키워드는 구체적이고 관련성 높은 것으로 선정
- 목표 단어 수는 검색 의도에 맞게 조정 (튜토리얼: 2000+, 뉴스: 500-1000)
- 템플릿을 활용하여 일관된 구조 유지

### 3. 초안 검토 및 수정

생성된 초안을 검토하고 필요시 AI로 수정합니다:

```bash
# 초안 열기
code content/drafts/2025-10-27-typescript-guide.md

# AI로 수정
blog draft refine content/drafts/2025-10-27-typescript-guide.md \
  "실무 예제를 더 추가하고, 코드 설명을 더 상세하게 작성해주세요"
```

**검토 포인트:**
- ✅ 키워드가 자연스럽게 포함되어 있는가?
- ✅ 목차와 본문이 일치하는가?
- ✅ 코드 예제가 실행 가능한가?
- ✅ 문법과 맞춤법이 올바른가?
- ✅ 독자에게 실질적인 가치를 제공하는가?

### 4. 이미지 생성 (선택사항)

헤더 이미지나 설명 이미지를 생성합니다:

```bash
# 헤더 이미지
blog image generate \
  "Modern minimalist TypeScript logo with code snippets background" \
  --size 1792x1024 \
  --quality hd \
  --style natural \
  --output ./images

# 섹션 이미지
blog image generate \
  "Diagram showing TypeScript type hierarchy and relationships" \
  --size 1024x1024 \
  --quality standard \
  --output ./images
```

**이미지 활용 팁:**
- 헤더 이미지는 가로 형태 (1792x1024) 권장
- 본문 이미지는 정사각형 (1024x1024) 권장
- HD 품질은 헤더 이미지에만 사용 (비용 절감)

### 5. 실시간 프리뷰

발행 전 실시간 프리뷰로 최종 확인:

```bash
blog preview content/drafts/2025-10-27-typescript-guide.md --show-ads
```

**확인 사항:**
- ✅ 제목과 메타 설명이 매력적인가?
- ✅ 목차가 올바르게 생성되는가?
- ✅ 이미지가 적절한 위치에 있는가?
- ✅ 광고 위치가 적절한가?
- ✅ 모바일에서도 잘 보이는가?

### 6. WordPress 발행

모든 준비가 완료되면 발행합니다:

```bash
blog publish content/drafts/2025-10-27-typescript-guide.md
```

**발행 후 체크리스트:**
- ✅ WordPress 사이트에서 포스트 확인
- ✅ 소셜 미디어 공유 테스트 (Open Graph, Twitter Card)
- ✅ 모바일 디바이스에서 확인
- ✅ SEO 점수 확인
- ✅ Google Search Console에 색인 요청

### 7. 성과 모니터링

발행 후 주기적으로 성과를 모니터링합니다:

```bash
# 주간 분석
blog analytics --period week

# 인기 포스트 확인
blog analytics --limit 10 --sort-by views
```

---

## 트렌드 기반 콘텐츠 생성

실시간 트렌드를 활용하여 빠르게 콘텐츠를 생성하는 워크플로우입니다.

### 워크플로우

```
1. 트렌드 모니터링 (blog trending)
   ↓
2. 주제 선정 (트렌드 점수 기반)
   ↓
3. 빠른 초안 생성 (--words 1000-1500)
   ↓
4. 신속 발행 (--draft 옵션으로 초안 저장)
   ↓
5. 트렌드가 지속되면 정식 발행
```

### 1. 트렌드 모니터링

Reddit과 Hacker News에서 실시간 트렌드를 확인합니다:

```bash
# 기술 관련 트렌드 (키워드 필터링)
blog trending \
  --sources reddit,hackernews \
  --keywords "AI,Machine Learning,Web Development,React,TypeScript" \
  --min-score 50 \
  --limit 20
```

**출력 예시:**
```
🔥 트렌드 토픽 TOP 20

1. [95점] ChatGPT-4 API 공개 - 개발자들의 반응
   출처: Reddit r/programming, Hacker News
   키워드: AI, ChatGPT, API

2. [87점] Next.js 14 릴리스 - 주요 변경사항
   출처: Hacker News, Reddit r/nextjs
   키워드: Next.js, React, Web Development
```

### 2. 주제 선정

트렌드 점수가 높고 키워드가 매칭되는 주제를 선택합니다.

**선정 기준:**
- 트렌드 점수 70점 이상
- 내 블로그 주제와 관련성 높음
- 24시간 이내 트렌드 (신선도 중요)
- 경쟁 콘텐츠가 아직 많지 않음

### 3. 빠른 초안 생성

트렌드성 콘텐츠는 짧고 빠르게 작성합니다:

```bash
blog draft create "ChatGPT-4 API 사용법과 실전 예제" \
  "ChatGPT-4, API, OpenAI, 사용법" \
  --words 1200 \
  --language ko
```

**팁:**
- 단어 수를 1000-1500으로 제한 (빠른 작성)
- 뉴스성 콘텐츠는 상세도보다 신속성이 중요
- 실습 예제와 코드 포함으로 가치 제공

### 4. 신속 발행

초안으로 먼저 저장하여 빠르게 발행:

```bash
# 초안으로 발행 (비공개)
blog publish content/drafts/2025-10-27-chatgpt4-api.md --draft

# 트렌드가 지속되면 정식 발행
blog list --status draft  # 초안 확인
# WordPress 관리자 페이지에서 "발행" 버튼 클릭
```

### 5. 트렌드 추적

발행 후 트렌드를 계속 추적하여 업데이트:

```bash
# 다음 날 트렌드 확인
blog trending --keywords "ChatGPT-4,API"

# 여전히 인기 있으면 초안 업데이트
blog draft refine content/drafts/2025-10-27-chatgpt4-api.md \
  "최신 정보와 추가 예제를 포함하여 업데이트해주세요"
```

---

## 대량 콘텐츠 생성

여러 개의 블로그 포스트를 효율적으로 생성하는 워크플로우입니다.

### 워크플로우

```
1. 주제 목록 작성 (스프레드시트)
   ↓
2. 배치 초안 생성 (스크립트)
   ↓
3. 일괄 검토 및 수정
   ↓
4. 일괄 이미지 생성
   ↓
5. 스케줄 발행 (수동 또는 스크립트)
```

### 1. 주제 목록 작성

CSV 또는 스프레드시트로 주제 목록을 작성합니다:

**topics.csv:**
```csv
title,keywords,words,language
"React Hooks 완벽 가이드","React,Hooks,useState,useEffect",2000,ko
"TypeScript 제네릭 활용법","TypeScript,제네릭,타입",1500,ko
"Next.js 성능 최적화","Next.js,성능,최적화,SSR",2500,ko
"Tailwind CSS 실전 활용","Tailwind,CSS,스타일링",1800,ko
```

### 2. 배치 초안 생성

셸 스크립트로 일괄 생성:

```bash
#!/bin/bash
# generate-batch.sh

while IFS=',' read -r title keywords words language
do
  echo "생성 중: $title"
  blog draft create "$title" "$keywords" --words "$words" --language "$language"
  sleep 60  # API 레이트 리밋 방지 (1분 대기)
done < topics.csv
```

실행:
```bash
chmod +x generate-batch.sh
./generate-batch.sh
```

### 3. 일괄 검토 및 수정

생성된 초안을 일괄 검토:

```bash
# 모든 초안 나열
ls -lt content/drafts/

# 각 초안 검토 및 수정
for file in content/drafts/*.md; do
  echo "검토 중: $file"
  code "$file"  # 또는 vim, nano 등
done
```

### 4. 일괄 이미지 생성

각 포스트에 맞는 이미지 생성:

```bash
#!/bin/bash
# generate-images.sh

blog image generate "React Hooks visual diagram with colorful components" \
  --size 1792x1024 --quality hd --output ./images

blog image generate "TypeScript generics concept illustration" \
  --size 1792x1024 --quality hd --output ./images

blog image generate "Next.js performance optimization dashboard" \
  --size 1792x1024 --quality hd --output ./images

blog image generate "Tailwind CSS utility classes showcase" \
  --size 1792x1024 --quality hd --output ./images
```

### 5. 스케줄 발행

일정에 맞춰 발행 (현재는 수동):

```bash
# 오늘 발행
blog publish content/drafts/2025-10-27-react-hooks.md

# 내일 발행할 것은 초안으로 저장
blog publish content/drafts/2025-10-28-typescript-generics.md --draft

# WordPress 관리자 페이지에서 예약 발행 설정
```

**미래 기능 (Epic 6.0):**
- cron과 통합된 자동 스케줄 발행
- CSV 기반 일괄 업로드

---

## SEO 최적화 워크플로우

검색 엔진 최적화를 극대화하는 워크플로우입니다.

### 워크플로우

```
1. 키워드 리서치
   ↓
2. SEO 친화적 초안 생성
   ↓
3. 키워드 밀도 검증
   ↓
4. 메타 태그 최적화
   ↓
5. 내부 링크 추가
   ↓
6. 발행 및 색인 요청
```

### 1. 키워드 리서치

도구를 사용하여 키워드를 조사합니다:

- Google Keyword Planner
- Ahrefs
- SEMrush
- Ubersuggest

**선정 기준:**
- 검색량: 월 1,000회 이상
- 경쟁도: 낮음~중간
- 의도: 정보성 (Informational)
- 관련성: 블로그 주제와 높은 관련성

### 2. SEO 친화적 초안 생성

키워드를 자연스럽게 포함하여 생성:

```bash
blog draft create \
  "React 성능 최적화 완벽 가이드 - 2025년 최신 기법" \
  "React 성능 최적화, React 최적화, 성능 개선, useMemo, useCallback" \
  --words 2500 \
  --language ko
```

**SEO 최적화 팁:**
- 제목에 주요 키워드 포함 (앞쪽 배치)
- H2, H3 제목에 관련 키워드 포함
- 첫 100단어 내 주요 키워드 포함
- 이미지 alt 텍스트에 키워드 포함

### 3. 키워드 밀도 검증

발행 시 자동으로 키워드 밀도를 체크합니다:

```bash
blog publish content/drafts/2025-10-27-react-performance.md --dry-run
```

**출력:**
```
✓ 키워드 밀도 체크
  - React 성능 최적화: 1.8% ✓ (최적 범위)
  - React 최적화: 1.2% ✓
  - 성능 개선: 0.9% ✓
  - useMemo: 0.7% ✓
  - useCallback: 0.6% ✓
```

**목표 범위:**
- 주요 키워드: 1.5-2.5%
- 보조 키워드: 0.5-1.5%
- 너무 높으면 (>3%) 키워드 스터핑으로 페널티

### 4. 메타 태그 최적화

Frontmatter에서 메타 태그를 최적화:

```yaml
---
title: "React 성능 최적화 완벽 가이드 - 2025년 최신 기법"
description: "React 성능 최적화를 위한 useMemo, useCallback, React.memo 활용법을 실전 예제와 함께 상세히 설명합니다. 2025년 최신 기법 포함."
keywords: ["React 성능 최적화", "React 최적화", "useMemo", "useCallback", "React.memo"]
slug: "react-performance-optimization-guide-2025"
language: "ko"
---
```

**최적화 포인트:**
- Title: 50-60자 (주요 키워드 앞쪽)
- Description: 150-160자 (클릭 유도 문구 포함)
- Keywords: 5-7개 (관련성 높은 순서)
- Slug: 영문, 하이픈 구분, 간결

### 5. 내부 링크 추가

기존 포스트와 연결하여 SEO 강화:

```markdown
이전에 작성한 [React Hooks 가이드](/react-hooks-guide)에서 설명한
useMemo와 useCallback을 성능 최적화에 활용할 수 있습니다.

자세한 내용은 [Next.js 성능 최적화](/nextjs-performance)도 참고하세요.
```

### 6. 발행 및 색인 요청

발행 후 Google Search Console에서 색인 요청:

```bash
# 발행
blog publish content/drafts/2025-10-27-react-performance.md

# URL 복사 후 Google Search Console에서:
# 1. URL 검사 도구 열기
# 2. URL 입력
# 3. "색인 생성 요청" 클릭
```

---

## 다국어 콘텐츠 관리

한국어와 영어 콘텐츠를 함께 관리하는 워크플로우입니다.

### 워크플로우

```
1. 한국어 초안 생성
   ↓
2. 한국어 발행
   ↓
3. 영어 초안 생성 (같은 주제)
   ↓
4. 영어 발행
   ↓
5. 상호 링크 연결
```

### 1. 한국어 초안 생성

```bash
blog draft create "React 성능 최적화 가이드" \
  "React, 성능, 최적화" \
  --words 2000 \
  --language ko
```

### 2. 한국어 발행

```bash
blog publish content/drafts/2025-10-27-react-performance-ko.md
# URL: https://your-blog.com/react-performance-optimization
```

### 3. 영어 초안 생성

같은 주제로 영어 버전 생성:

```bash
blog draft create "React Performance Optimization Guide" \
  "React, performance, optimization, useMemo, useCallback" \
  --words 2000 \
  --language en
```

### 4. 영어 발행

```bash
blog publish content/posts/en/2025-10-27-react-performance-en.md --language en
# URL: https://your-blog.com/en/react-performance-optimization
```

### 5. 상호 링크 연결

각 포스트에 다른 언어 버전 링크 추가:

**한국어 포스트에:**
```markdown
🌐 [Read this article in English](/en/react-performance-optimization)
```

**영어 포스트에:**
```markdown
🌐 [이 글을 한국어로 읽기](/react-performance-optimization)
```

---

## 성과 분석 및 개선

블로그 성과를 분석하고 개선하는 워크플로우입니다.

### 워크플로우

```
1. 주간 성과 분석
   ↓
2. 인기 포스트 파악
   ↓
3. 저조한 포스트 개선
   ↓
4. 트렌드 기반 후속 콘텐츠
   ↓
5. A/B 테스팅
```

### 1. 주간 성과 분석

매주 월요일마다 지난 주 성과 확인:

```bash
# 지난 주 통계
blog analytics --period week

# 인기 포스트 TOP 10
blog analytics --period week --limit 10 --sort-by views
```

**출력 예시:**
```
📊 블로그 분석 (최근 7일)

전체 통계:
- 총 조회수: 12,543
- 총 댓글: 87
- 평균 조회수/포스트: 418

인기 포스트 TOP 10:
1. [2,341 views] React Hooks 완벽 가이드
2. [1,823 views] TypeScript 제네릭 활용법
3. [1,456 views] Next.js 성능 최적화
```

### 2. 인기 포스트 파악

인기 포스트의 공통점 분석:

- 어떤 주제가 인기 있는가?
- 어떤 키워드가 잘 작동하는가?
- 어떤 포스트 구조가 효과적인가?
- 어떤 날짜/시간에 발행했는가?

### 3. 저조한 포스트 개선

조회수가 낮은 포스트를 개선:

```bash
# 저조한 포스트 확인
blog analytics --sort-by views --limit 50
# 하위 10개 포스트 확인

# 포스트 ID로 삭제 또는 WordPress에서 수정
blog delete 456  # 저품질 포스트 삭제
```

**개선 방법:**
- 제목 변경 (더 매력적으로)
- 메타 설명 개선
- 내부 링크 추가
- 최신 정보로 업데이트
- 이미지 추가 또는 교체

### 4. 트렌드 기반 후속 콘텐츠

인기 포스트의 후속 콘텐츠 작성:

```bash
# 트렌드 확인
blog trending --keywords "React,TypeScript"

# 후속 콘텐츠 생성
blog draft create "React Hooks 고급 패턴" \
  "React, Hooks, 고급, 패턴, useReducer" \
  --words 2500
```

### 5. A/B 테스팅

제목이나 메타 설명을 테스트:

1. 같은 내용으로 제목만 다르게 2개 발행
2. 2주 후 성과 비교
3. 더 좋은 제목 패턴 파악
4. 향후 포스트에 적용

---

## 워크플로우 자동화 팁

### Bash 스크립트 예제

**daily-blog.sh** - 매일 트렌드 기반 포스트 생성:

```bash
#!/bin/bash

# 1. 트렌드 확인
echo "🔍 트렌드 확인 중..."
blog trending --keywords "AI,Web Development" --min-score 70 > trend.txt

# 2. 가장 인기 있는 주제 선택 (수동)
echo "📝 트렌드 리스트를 확인하고 주제를 선택하세요"
cat trend.txt

# 3. 주제 입력 받기
read -p "주제: " topic
read -p "키워드: " keywords

# 4. 초안 생성
echo "✍️ AI 초안 생성 중..."
blog draft create "$topic" "$keywords" --words 1500 --language ko

echo "✅ 완료! content/drafts/ 디렉토리를 확인하세요"
```

### Cron 작업 예제

매주 월요일 오전 9시에 성과 분석:

```bash
# crontab -e
0 9 * * 1 cd /path/to/blog && blog analytics --period week > analytics.txt && mail -s "주간 블로그 분석" you@email.com < analytics.txt
```

---

## 다음 단계

- **WordPress 설정**: [WordPress 설정 가이드](./wordpress-setup.md)
- **트러블슈팅**: [트러블슈팅 가이드](./troubleshooting.md)
- **시작하기**: [시작하기 가이드](./getting-started.md)

---

**이전**: [시작하기](./getting-started.md) | **다음**: [WordPress 설정 가이드](./wordpress-setup.md)
