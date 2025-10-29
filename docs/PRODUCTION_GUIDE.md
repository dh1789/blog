# 실전 운영 가이드 (Production Guide)

**Epic 8.0 이후 업데이트됨** - 키워드 수익성 최적화 기능 포함

이 가이드는 @blog/cli를 실제 블로그 운영에 활용하는 **검증된 워크플로우**를 제공합니다.

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [실전 워크플로우 (8단계)](#2-실전-워크플로우-8단계)
3. [품질 기준](#3-품질-기준)
4. [검증 시나리오](#4-검증-시나리오)
5. [문제 해결](#5-문제-해결)
6. [FAQ](#6-faq)

---

## 1. 사전 준비

### 1.1 환경 변수 확인

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```bash
# 필수: WordPress 연결
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# 필수: AI 콘텐츠 생성 (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 필수: Google AdSense
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx

# 선택: 이미지 생성 (DALL-E)
OPENAI_API_KEY=sk-proj-xxxxx

# 선택: 트렌드 모니터링 (Twitter)
TWITTER_BEARER_TOKEN=AAAAAAAAAxxxxxxxxxx

# 선택: 키워드 수익성 분석 (Epic 8.0 - Google Ads API)
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdEFghIJklMNopQRst
GOOGLE_ADS_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-Abc123...
GOOGLE_ADS_REFRESH_TOKEN=1//0abcdefg...
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

### 1.2 시스템 테스트

모든 기능이 정상 작동하는지 확인합니다:

```bash
# 1. 빌드 확인
pnpm build

# 2. WordPress 연결 테스트
blog list

# 3. AI 연결 테스트 (간단한 초안 생성)
blog draft-create "테스트" "테스트" --words 500

# 4. SEO 분석 테스트
blog analyze-seo content/drafts/최근파일.md
```

**성공 기준**:
- ✅ 빌드 에러 없음
- ✅ WordPress 포스트 목록이 출력됨
- ✅ 테스트 초안이 생성됨
- ✅ SEO 점수가 출력됨

---

## 2. 실전 워크플로우 (8단계)

### 개요

```
Step 1: 토픽 조사 (5분)
   ↓
Step 2: AI 초안 생성 (5-10분)
   ↓
Step 3: SEO 분석 1차 (1분)
   ↓
Step 4: SEO 개선 (5-15분)
   ↓
Step 5: SEO 분석 2차 (1분)
   ↓
Step 6: 프리뷰 확인 (2분)
   ↓
Step 7: 발행 (1분)
   ↓
Step 8: 성과 모니터링 (지속적)
```

**총 소요 시간**: 20-40분 (토픽 조사 제외)

---

### Step 1: 토픽 조사

#### 1-1. 트렌드 모니터링 (선택사항)

```bash
# Reddit, Hacker News 트렌드 확인
blog trending --keywords "WordPress,AI,자동화" --limit 10

# 특정 분야 트렌드
blog trending --sources reddit,hackernews --min-score 50
```

#### 1-2. 수익성 기반 키워드 조사 (**Epic 8.0 신규 기능**)

**Google Ads API를 활용한 데이터 기반 토픽 선정**:

```bash
# 수익성 데이터 포함 트렌드 분석
blog trending --revenue --limit 10

# 결과를 JSON 파일로 저장하여 상세 분석
blog trending --revenue --limit 20 --output keyword-analysis.json

# 테이블 형식으로 출력
blog trending --revenue --format table --limit 15
```

**출력 예시**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   트렌드 토픽 (수익성 분석 포함)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cache stats: 0 hits, 10 misses (0.0% hit rate)

1. TypeScript 5.3: What's New (reddit)
   📊 트렌드: 85.2 | 💰 수익성: 72.4 | 🎯 종합: 80.0

   ├─ 검색량: 5,400/월
   ├─ CPC: $2.35
   ├─ 경쟁도: MEDIUM (50)
   └─ 수익성 평가: 높은 검색량, 적정 CPC, 중간 경쟁도

   https://reddit.com/r/programming/xyz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**수익성 점수 해석**:

| 점수 범위 | 평가 | 추천 |
|----------|------|------|
| 80-100 | 🟢 매우 높음 | 적극 권장 - 높은 수익 잠재력 |
| 60-79 | 🟡 높음 | 권장 - 안정적 수익 예상 |
| 40-59 | 🟠 중간 | 고려 가능 - 경쟁 분석 필요 |
| 0-39 | 🔴 낮음 | 신중 검토 - 차별화 전략 필수 |

**주요 지표 설명**:

- **검색량 (Search Volume)**: 월간 검색 횟수 → 높을수록 트래픽 잠재력 큼
- **CPC (Cost Per Click)**: 광고 클릭당 비용 → 높을수록 수익성 좋음
- **경쟁도 (Competition)**: LOW/MEDIUM/HIGH → 낮을수록 진입 용이
- **경쟁 지수 (Competition Index)**: 0-100 점수 → 50 이하 권장

**활용 팁**:

1. **고수익 토픽 선정**: 종합 점수 70+ 우선 선택
2. **캐시 활용**: 두 번째 실행부터 즉시 결과 확인 (24시간 캐시)
3. **JSON 저장**: `--output` 옵션으로 데이터 저장 후 스프레드시트 분석
4. **장기 모니터링**: 주기적으로 실행하여 트렌드 변화 추적

**사전 요구사항**:

- Google Ads API 설정 필요 (자세한 내용은 [GOOGLE_ADS_SETUP.md](./GOOGLE_ADS_SETUP.md) 참고)
- `.env` 파일에 다음 환경 변수 설정:
  ```bash
  GOOGLE_ADS_DEVELOPER_TOKEN=...
  GOOGLE_ADS_CLIENT_ID=...
  GOOGLE_ADS_CLIENT_SECRET=...
  GOOGLE_ADS_REFRESH_TOKEN=...
  GOOGLE_ADS_CUSTOMER_ID=...
  ```

#### 1-3. 토픽 선정 기준

다음 질문에 답하세요:
- [ ] **독자 가치**: 실용적인 정보를 제공하는가?
- [ ] **경쟁 강도**: 경쟁이 과도하지 않은가?
- [ ] **전문성**: 내가 제공할 수 있는 고유한 통찰이 있는가?
- [ ] **키워드**: 3-5개의 명확한 키워드를 선정했는가?
- [ ] **수익성** (Epic 8.0): 검색량·CPC·경쟁도가 적절한가?

#### 1-4. 키워드 선정 팁

- **주요 키워드 1개**: 가장 중요한 검색어
- **부가 키워드 2-4개**: 관련성 높은 검색어
- **예시**: "WordPress 자동화" (주), "Node.js", "REST API", "블로그 관리" (부)
- **수익성 고려** (Epic 8.0): `blog trending --revenue`로 데이터 기반 선정

---

### Step 2: AI 초안 생성

#### 2-1. 기본 사용법

```bash
blog draft-create \
  "WordPress + Node.js 블로그 자동화 완벽 가이드" \
  "WordPress,Node.js,자동화,REST API,블로그" \
  --words 2000 \
  --language ko
```

**권장 단어 수**:
- **짧은 글** (뉴스, 공지): 500-1000 단어
- **중간 길이** (튜토리얼): 1500-2000 단어
- **긴 글** (완벽 가이드): 2500-3000+ 단어

#### 2-2. 예상 출력

```
✔ AI 초안 생성 완료!

📄 생성된 파일: content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md
📊 단어 수: 2,134 단어
⏱️ 소요 시간: 45초

다음 단계:
1. blog analyze-seo <파일경로> - SEO 점수 분석
2. blog preview <파일경로> - 실시간 프리뷰
```

#### 2-3. 생성된 파일 확인

```bash
# 파일 열기
code content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md

# 또는
cat content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md | head -50
```

**검토 포인트**:
- [ ] Frontmatter가 완성되었는가? (title, excerpt, tags, etc.)
- [ ] 목차가 논리적인가?
- [ ] 코드 예제가 포함되었는가?
- [ ] 전문 용어가 정확한가?

---

### Step 3: SEO 분석 1차

#### 3-1. 기본 분석

```bash
blog analyze-seo content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md
```

#### 3-2. 예상 출력

```
================================================================================
📊 SEO 분석 결과
================================================================================

📄 포스트 정보:
  제목: WordPress + Node.js 블로그 자동화 완벽 가이드
  길이: 245줄 (가중치: 1x)
  키워드: WordPress, Node.js, 자동화, REST API, 블로그

🎯 SEO 점수:
  총점: 68/100

📋 카테고리별 점수:
  제목 길이           ████████████████████ 100% 5/5
  요약 길이           ████████████░░░░░░░░ 60% 3/5
  콘텐츠 길이          ██████████████░░░░░░ 70% 7/10
  키워드 밀도          ████████████░░░░░░░░ 60% 18/30
  섹션 분포           ████████████████░░░░ 80% 16/20
  제목 키워드          ████████████░░░░░░░░ 60% 9/15
  요약 키워드          ████████████████░░░░ 80% 12/15

🔍 키워드 밀도 분석:
  검증 결과: ❌ 실패
  목표 밀도: 0.50% - 2.50%

  키워드별 상세:
  키워드                  출현     밀도       상태
  --------------------------------------------------
  WordPress            12회    1.23%    ✓
  Node.js              8회     0.82%    ✓
  자동화                  3회     0.31%    ✗
  REST API             2회     0.21%    ✗
  블로그                  5회     0.51%    ✓

📑 섹션 분포 분석:
  전체 섹션: 8개
  키워드 포함 섹션: 6/8 (75.0%)

💡 개선 제안:
  1. '자동화' 키워드를 "(Introduction)", "시작하기" 섹션에 2회 추가 권장 (현재: 0.31%, 목표: 0.50%)
  2. 'REST API' 키워드를 "(Introduction)", "API 연동" 섹션에 3회 추가 권장 (현재: 0.21%, 목표: 0.50%)

================================================================================
```

#### 3-3. 분석 결과 해석

**점수 구간별 의미**:
- **80-100**: 우수 - 즉시 발행 가능
- **70-79**: 양호 - 소폭 개선 권장
- **60-69**: 보통 - 개선 필요
- **<60**: 미흡 - 반드시 개선 필요

**주요 확인 사항**:
1. **총점이 목표 이상인가?** (길이별 목표는 [3. 품질 기준](#3-품질-기준) 참조)
2. **키워드 밀도 검증 통과?** (모든 키워드가 최적 범위 내)
3. **섹션 분포 80% 이상?** (대부분의 섹션에 키워드 포함)
4. **개선 제안이 구체적인가?** (어느 섹션에 몇 회 추가)

---

### Step 4: SEO 개선

SEO 분석 결과를 바탕으로 개선합니다.

#### 4-1. 방법 A: AI로 자동 개선 (권장)

```bash
blog draft-refine content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md \
  "'자동화' 키워드를 Introduction과 시작하기 섹션에 2회 추가하고, 'REST API' 키워드를 API 연동 섹션에 3회 추가해주세요. 자연스럽게 본문에 녹여주세요."
```

#### 4-2. 방법 B: 수동 편집

```bash
# 파일 열기
code content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md
```

**수동 개선 팁**:
1. **개선 제안 섹션 참고**: analyze-seo 출력의 "💡 개선 제안" 활용
2. **자연스럽게 추가**: 키워드를 억지로 넣지 말고 문맥에 맞게
3. **균등 분산**: 한 섹션에 집중하지 말고 여러 섹션에 분산
4. **동의어 활용**: 완전히 같은 단어만 반복하지 말고 변형 활용

#### 4-3. 예시: 자연스러운 키워드 추가

**나쁜 예시** (부자연스러움):
```markdown
WordPress는 강력한 CMS입니다. WordPress를 사용하면 WordPress로 블로그를 WordPress처럼 관리할 수 있습니다.
```

**좋은 예시** (자연스러움):
```markdown
WordPress는 전 세계에서 가장 널리 사용되는 CMS입니다. 이 플랫폼을 통해 손쉽게 블로그를 운영할 수 있으며, REST API를 활용하면 자동화된 관리 시스템을 구축할 수 있습니다.
```

---

### Step 5: SEO 분석 2차

개선 후 다시 분석하여 효과를 확인합니다.

#### 5-1. 상세 분석 실행

```bash
blog analyze-seo content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md --verbose
```

`--verbose` 옵션으로 **섹션별 상세 정보**를 확인할 수 있습니다.

#### 5-2. 예상 출력 (개선 후)

```
================================================================================
📊 SEO 분석 결과
================================================================================

📄 포스트 정보:
  제목: WordPress + Node.js 블로그 자동화 완벽 가이드
  길이: 248줄 (가중치: 1x)
  키워드: WordPress, Node.js, 자동화, REST API, 블로그

🎯 SEO 점수:
  총점: 82/100 ⬆️ (+14)

📋 카테고리별 점수:
  제목 길이           ████████████████████ 100% 5/5
  요약 길이           ████████████░░░░░░░░ 60% 3/5
  콘텐츠 길이          ██████████████░░░░░░ 70% 7/10
  키워드 밀도          ████████████████████ 100% 30/30 ⬆️
  섹션 분포           ████████████████████ 100% 20/20 ⬆️
  제목 키워드          ████████████░░░░░░░░ 60% 9/15
  요약 키워드          ████████████████░░░░ 80% 12/15

🔍 키워드 밀도 분석:
  검증 결과: ✅ 통과 ⬆️

  키워드별 상세:
  키워드                  출현     밀도       상태
  --------------------------------------------------
  WordPress            12회    1.20%    ✓
  Node.js              8회     0.80%    ✓
  자동화                  5회     0.50%    ✓ ⬆️
  REST API             5회     0.50%    ✓ ⬆️
  블로그                  5회     0.50%    ✓

📑 섹션 분포 분석:
  전체 섹션: 8개
  키워드 포함 섹션: 8/8 (100.0%) ⬆️

  섹션별 상세:
  ● (Introduction)                             7회 ⬆️
  ● 시작하기                                     5회 ⬆️
  ● API 연동                                     6회 ⬆️
  ● 자동화 구현                                   5회
  ● 배포 및 운영                                  4회
  ● 문제 해결                                     3회
  ● 성과 분석                                     4회
  ● 결론                                        3회

✨ 훌륭합니다! 개선할 부분이 없습니다.

================================================================================
```

#### 5-3. 개선 효과 확인

**체크리스트**:
- [ ] **총점이 목표 이상인가?** (이 예시에서는 82/100, 목표 75+)
- [ ] **키워드 밀도 검증 통과?** (✅ 통과)
- [ ] **섹션 분포 80% 이상?** (100%)
- [ ] **개선 제안이 없는가?** ("훌륭합니다!" 메시지)

**통과 기준**: 위 4가지 모두 ✅ → Step 6로 진행

---

### Step 6: 프리뷰 확인

발행 전 실제 블로그와 동일한 모습으로 확인합니다.

#### 6-1. 프리뷰 서버 실행

```bash
blog preview content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md
```

#### 6-2. 예상 출력

```
Preview server started at http://localhost:3000
✓ Browser opened successfully
Watching file for changes...
```

브라우저가 자동으로 열리고, 실시간으로 파일을 감시합니다.

#### 6-3. 프리뷰 확인 사항

**레이아웃**:
- [ ] 제목이 적절한가?
- [ ] 목차가 표시되는가?
- [ ] 이미지가 정상 표시되는가?
- [ ] 코드 블록이 정상 표시되는가?

**광고 위치** (선택사항):
```bash
# 광고 삽입 위치 표시
blog preview content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md --show-ads
```

#### 6-4. 프리뷰 서버 종료

`Ctrl + C`로 종료합니다.

---

### Step 7: 발행

모든 검토가 끝나면 WordPress에 발행합니다.

#### 7-1. 초안으로 발행 (권장)

```bash
blog publish content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md --draft
```

**초안 발행의 장점**:
- WordPress 관리자에서 최종 검토 가능
- 발행 예약 가능
- 카테고리, 태그 등 WordPress 설정 조정 가능

#### 7-2. 즉시 발행

```bash
blog publish content/drafts/2025-10-29-wordpress-node-js-blog-automation-guide.md
```

#### 7-3. 예상 출력

```
✔ WordPress에 발행 완료!

📄 포스트 정보:
  제목: WordPress + Node.js 블로그 자동화 완벽 가이드
  상태: draft (초안)
  URL: https://your-blog.com/?p=123

다음 단계:
1. WordPress 관리자에서 최종 확인
2. 카테고리, 태그 설정
3. 발행 버튼 클릭
```

#### 7-4. 발행 후 확인

```bash
# 최근 포스트 확인
blog list --status draft --limit 5

# 특정 포스트 확인
blog list | grep "WordPress + Node.js"
```

---

### Step 8: 성과 모니터링

발행 후 성과를 지속적으로 모니터링합니다.

#### 8-1. 분석 대시보드

```bash
# 월간 분석 (기본)
blog analytics

# 주간 분석
blog analytics --period week

# 인기 포스트 20개
blog analytics --limit 20 --sort-by views
```

#### 8-2. 예상 출력

```
================================================================================
📊 블로그 분석 대시보드 (최근 30일)
================================================================================

📈 전체 통계:
  총 포스트: 25개
  총 조회수: 12,345회
  총 댓글: 123개
  평균 조회수: 494회/포스트

🔥 인기 포스트 TOP 10:
  1. WordPress + Node.js 블로그 자동화 완벽 가이드     1,234회  ⭐ NEW
  2. TypeScript 완벽 가이드                            987회
  3. React 18 새로운 기능                              856회
  ...

💬 댓글 많은 포스트:
  1. WordPress + Node.js 블로그 자동화 완벽 가이드     23개
  2. TypeScript 완벽 가이드                            18개
  ...

================================================================================
```

#### 8-3. 성과 개선

- **조회수 낮음** → SEO 개선, 키워드 재검토
- **댓글 없음** → CTA(Call-to-Action) 추가, 질문 던지기
- **이탈률 높음** → 콘텐츠 품질 개선, 내부 링크 추가

---

## 3. 품질 기준

### 3.1 SEO 점수 목표 (길이별)

Epic 7.0의 length-adaptive SEO 시스템에 따른 목표 점수:

| 포스트 길이 | SEO 목표 | 키워드 밀도 목표 | 가중치 |
|------------|---------|----------------|--------|
| < 500줄 (짧은 글) | 80+ | 0.50-2.50% | 1.0x |
| 500-1000줄 (중간) | 75+ | 0.45-2.25% | 0.9x |
| 1000-1500줄 (긴 글) | 70+ | 0.40-2.00% | 0.8x |
| 1500+ 줄 (매우 긴 글) | 65+ | 0.35-1.75% | 0.7x |

**핵심**: 긴 포스트는 자연스럽게 키워드 밀도가 낮아지므로, 목표 점수도 낮아집니다.

### 3.2 카테고리별 점수 기준

| 카테고리 | 배점 | 목표 | 설명 |
|---------|------|------|------|
| 제목 길이 | 5 | 5 | 30-60자 권장 |
| 요약 길이 | 5 | 3+ | 120-160자 권장 |
| 콘텐츠 길이 | 10 | 7+ | 1500+ 단어 권장 |
| **키워드 밀도** | 30 | 24+ | 80% 키워드가 최적 범위 |
| **섹션 분포** | 20 | 16+ | 80% 섹션에 키워드 포함 |
| 제목 키워드 | 15 | 9+ | 주요 키워드 포함 |
| 요약 키워드 | 15 | 9+ | 주요 키워드 포함 |

**중요**: 키워드 밀도(30점)와 섹션 분포(20점)가 전체 점수의 50%를 차지합니다.

### 3.3 발행 전 체크리스트

**SEO 품질**:
- [ ] SEO 점수가 목표 이상 (길이별 목표 참조)
- [ ] 모든 키워드가 최적 밀도 범위 내 (0.5-2.5%, 가중치 적용)
- [ ] 섹션 분포 80% 이상
- [ ] 제목에 주요 키워드 포함
- [ ] 요약에 주요 키워드 포함

**콘텐츠 품질**:
- [ ] 목차가 논리적으로 구성됨
- [ ] 코드 예제가 실행 가능함
- [ ] 이미지가 포함됨 (선택사항)
- [ ] 내부 링크가 추가됨 (관련 포스트)
- [ ] 외부 링크가 신뢰할 수 있음

**기술적 완성도**:
- [ ] Frontmatter 메타데이터 완성 (title, excerpt, tags, categories)
- [ ] 프리뷰에서 레이아웃 확인
- [ ] 광고 위치 적절함
- [ ] 맞춤법 및 문법 검토 완료

---

## 4. 검증 시나리오

실제로 전체 워크플로우를 따라해보는 시나리오입니다.

### 시나리오: "WordPress 자동화 실전 가이드" 포스트 작성

#### 준비 단계

```bash
# 현재 위치 확인
pwd
# /Users/idongho/proj/blog

# 환경 변수 확인
cat .env | grep -E "WORDPRESS_URL|ANTHROPIC_API_KEY"
```

---

#### Step 1: AI 초안 생성

```bash
blog draft-create \
  "WordPress REST API + Node.js로 블로그 자동화하기" \
  "WordPress,Node.js,자동화,REST API,TypeScript" \
  --words 2000 \
  --language ko
```

**예상 시간**: 30-60초

**성공 기준**:
- ✅ "AI 초안 생성 완료!" 메시지 출력
- ✅ content/drafts/ 디렉토리에 파일 생성됨
- ✅ 파일에 Frontmatter와 본문 포함

---

#### Step 2: 생성된 파일 확인

```bash
# 최근 생성된 파일 찾기
ls -lt content/drafts/ | head -5

# 파일 내용 일부 확인
head -50 content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md
```

**확인 사항**:
- [ ] title, excerpt, tags 필드 존재
- [ ] H2 섹션이 5개 이상
- [ ] 2000단어 전후

---

#### Step 3: SEO 분석 1차

```bash
blog analyze-seo content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md
```

**예상 출력**:
- SEO 점수: 60-75 범위 (초안이므로 낮을 수 있음)
- 개선 제안: 2-5개 항목

**기록할 정보**:
- 초기 SEO 점수: ___/100
- 키워드 밀도 검증: ✅ / ❌
- 섹션 분포: ___% (___/___개)

---

#### Step 4: SEO 개선 (AI 활용)

```bash
# analyze-seo 출력의 "개선 제안"을 복사하여 활용
blog draft-refine content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md \
  "다음 SEO 개선사항을 반영해주세요:
1. 'REST API' 키워드를 Introduction과 시작하기 섹션에 3회 추가
2. '자동화' 키워드를 본문 전반에 걸쳐 2회 추가
자연스럽게 문맥에 맞게 작성해주세요."
```

**예상 시간**: 30-60초

---

#### Step 5: SEO 분석 2차 (상세)

```bash
blog analyze-seo content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md --verbose
```

**예상 개선**:
- SEO 점수: +10~15점 상승
- 키워드 밀도 검증: ❌ → ✅
- 섹션 분포: +10~20% 증가

**목표 달성 확인**:
- [ ] SEO 점수 75+ (중간 길이 기준)
- [ ] 키워드 밀도 검증 통과
- [ ] 섹션 분포 80%+

**미달성 시**: Step 4로 돌아가서 추가 개선

---

#### Step 6: 프리뷰 확인

```bash
blog preview content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md
```

**브라우저에서 확인**:
- [ ] 레이아웃이 정상인가?
- [ ] 이미지가 표시되는가? (있다면)
- [ ] 코드 블록이 보기 좋은가?

**종료**: `Ctrl + C`

---

#### Step 7: 발행 (초안)

```bash
blog publish content/drafts/2025-10-29-wordpress-rest-api-node-js-blog-automation.md --draft
```

**예상 출력**:
- "WordPress에 발행 완료!" 메시지
- 포스트 ID 및 URL 출력

---

#### Step 8: 발행 확인

```bash
blog list --status draft --limit 5
```

**확인 사항**:
- [ ] 방금 발행한 포스트가 목록에 있는가?
- [ ] 제목이 올바른가?
- [ ] 상태가 "draft"인가?

---

### 검증 완료

전 단계가 성공적으로 완료되었다면, 워크플로우가 정상 작동합니다! 🎉

**최종 체크리스트**:
- [x] AI 초안 생성 성공
- [x] SEO 분석 1차 성공
- [x] SEO 개선 성공
- [x] SEO 분석 2차에서 개선 확인
- [x] 프리뷰 정상 작동
- [x] WordPress 발행 성공
- [x] 발행 확인 성공

---

## 5. 문제 해결

### 5.1 AI 생성 관련

#### 문제: "ANTHROPIC_API_KEY is not set"

```bash
# .env 파일 확인
cat .env | grep ANTHROPIC_API_KEY

# 없다면 추가
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env

# 빌드 재시작
pnpm build
```

#### 문제: "Request timeout"

**원인**: Claude API 응답이 느림

**해결**:
1. `--words` 값을 줄임 (2000 → 1500)
2. 재시도
3. 네트워크 상태 확인

---

### 5.2 WordPress 연결 관련

#### 문제: "Failed to connect to WordPress"

```bash
# WordPress URL 확인 (https:// 포함 확인)
echo $WORDPRESS_URL

# WordPress REST API 활성화 확인
curl -I https://your-blog.com/wp-json/

# 응답에 200 OK가 있어야 함
```

#### 문제: "Authentication failed"

**원인**: Application Password가 잘못됨

**해결**:
1. WordPress 관리자 → 사용자 → 프로필
2. "Application Passwords" 섹션
3. 새 비밀번호 생성
4. `.env` 파일의 `WORDPRESS_APP_PASSWORD` 업데이트

---

### 5.3 SEO 분석 관련

#### 문제: "파일을 찾을 수 없습니다"

```bash
# 절대 경로 사용
blog analyze-seo /Users/idongho/proj/blog/content/drafts/파일명.md

# 또는 현재 디렉토리에서
cd /Users/idongho/proj/blog
blog analyze-seo content/drafts/파일명.md
```

#### 문제: "Frontmatter에 title이 필요합니다"

**원인**: 마크다운 파일의 Frontmatter가 누락됨

**해결**:
```bash
# 파일 편집
code content/drafts/파일명.md

# Frontmatter 추가
---
title: "제목"
excerpt: "요약"
tags:
  - 태그1
  - 태그2
---
```

#### 문제: "키워드가 없습니다"

**원인**: Frontmatter에 `tags` 또는 `keywords` 필드가 없음

**해결**:
```yaml
---
tags:
  - WordPress
  - Node.js
  - 자동화
# 또는
keywords:
  - WordPress
  - Node.js
---
```

---

### 5.4 프리뷰 관련

#### 문제: "Port 3000 is already in use"

```bash
# 다른 포트 사용
blog preview content/drafts/파일명.md --port 8080

# 또는 3000 포트 프로세스 종료
lsof -ti:3000 | xargs kill
```

#### 문제: "Browser did not open automatically"

```bash
# 수동으로 브라우저 열기
open http://localhost:3000

# 또는 브라우저 자동 열기 비활성화
blog preview content/drafts/파일명.md --no-browser
```

---

## 6. FAQ

### Q1: SEO 점수가 목표에 미치지 못합니다. 어떻게 해야 하나요?

**A**: 다음 순서로 개선하세요:

1. **키워드 밀도 먼저 개선** (30점 배점)
   - `analyze-seo` 출력의 "개선 제안" 참고
   - 부족한 키워드를 지정된 섹션에 추가

2. **섹션 분포 개선** (20점 배점)
   - 키워드가 없는 섹션을 찾아 자연스럽게 추가
   - 80% 이상 섹션에 키워드 포함 목표

3. **콘텐츠 길이 늘리기** (10점 배점)
   - 1500+ 단어 목표
   - `draft-refine`으로 내용 보강

4. **제목/요약 최적화** (각 15점 배점)
   - 주요 키워드를 제목과 요약에 포함

---

### Q2: 긴 포스트(1500+ 줄)인데 SEO 점수가 65점입니다. 괜찮나요?

**A**: 예, 괜찮습니다.

Epic 7.0의 length-adaptive SEO 시스템은 긴 포스트에 대해 **더 낮은 목표 점수**를 설정합니다:

- 1500+ 줄: **65+ 목표**
- 1000-1500 줄: **70+ 목표**
- 500-1000 줄: **75+ 목표**
- < 500 줄: **80+ 목표**

긴 포스트는 자연스럽게 키워드 밀도가 낮아지므로, 이를 반영한 공정한 평가입니다.

---

### Q3: `draft-refine`을 여러 번 사용해도 되나요?

**A**: 예, 여러 번 사용 가능합니다.

**권장 방법**:
1. 첫 번째: SEO 개선 집중
2. 두 번째: 콘텐츠 품질 개선 (예제 추가, 설명 보강)
3. 세 번째: 문체 및 톤 조정

**주의**: 매번 Claude API 비용이 발생하므로, 한 번에 여러 지시사항을 합쳐서 요청하는 것이 경제적입니다.

---

### Q4: 프리뷰에서는 잘 보이는데 WordPress에서 레이아웃이 깨집니다.

**A**: 다음을 확인하세요:

1. **Avada 테마 설정**
   - WordPress 관리자 → Avada → Theme Options
   - 포스트 레이아웃 설정 확인

2. **CSS 충돌**
   - WordPress 관리자에서 포스트 편집
   - "텍스트" 탭에서 HTML 확인
   - 불필요한 인라인 스타일 제거

3. **이미지 크기**
   - 이미지가 너무 크면 레이아웃이 깨질 수 있음
   - WordPress 미디어 라이브러리에서 크기 조정

---

### Q5: WordPress에 발행했는데 광고가 삽입되지 않았습니다.

**A**: 광고 삽입은 `publish` 명령 실행 시 자동으로 처리됩니다.

**확인 방법**:
1. WordPress 관리자에서 포스트 편집
2. "텍스트" 탭 클릭 (HTML 보기)
3. `<div class="adsense-container">` 태그 확인

**없다면**:
- `.env` 파일의 `ADSENSE_CLIENT_ID`, `ADSENSE_SLOT_ID` 확인
- `pnpm build` 재실행 후 다시 발행

---

### Q6: `trending` 명령어가 "TWITTER_BEARER_TOKEN is not set" 오류를 냅니다.

**A**: Twitter API는 선택사항입니다.

**해결 방법**:
1. **Twitter 제외**:
   ```bash
   blog trending --sources reddit,hackernews
   ```

2. **Twitter API 키 발급** (선택):
   - Twitter Developer Portal에서 발급
   - `.env`에 `TWITTER_BEARER_TOKEN` 추가

---

### Q7: 발행 후 SEO 점수를 다시 확인하고 싶습니다.

**A**: 다음과 같이 발행된 포스트를 다시 분석할 수 있습니다:

```bash
# 1. WordPress에서 포스트 ID 확인
blog list

# 2. 로컬 파일이 남아있다면
blog analyze-seo content/drafts/파일명.md

# 3. 또는 WordPress에서 다운로드
# (현재 미구현, 향후 추가 예정)
```

---

### Q8: 여러 포스트를 한 번에 발행할 수 있나요?

**A**: 현재는 한 번에 하나씩 발행해야 합니다.

**일괄 발행 스크립트** (향후 추가 예정):
```bash
# 예시 (현재 미구현)
for file in content/drafts/*.md; do
  blog analyze-seo "$file"
  read -p "발행하시겠습니까? (y/n) " -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    blog publish "$file" --draft
  fi
done
```

---

## 7. 참고 자료

### 공식 문서
- [README.md](../README.md) - 전체 기능 소개
- [Getting Started](./getting-started.md) - 초기 설정 가이드
- [WordPress Setup](./wordpress-setup.md) - WordPress 연동 가이드
- [Workflows](./workflows.md) - 다양한 워크플로우 예제
- [Troubleshooting](./troubleshooting.md) - 문제 해결 가이드

### Guidelines
- [Blog Post Guidelines v1.3](../prompts/blog-post-guidelines.md) - AI 생성 시 사용하는 가이드라인

### Epic 7.0 관련
- [CHANGELOG.md](../CHANGELOG.md) - Epic 7.0 변경사항
- [Tasks 7.0](../tasks/tasks-7.0-prd-seo-optimization-system.md) - 개발 과정

---

## 8. 다음 단계

이 가이드를 완료했다면:

1. **실전 적용**
   - 실제 블로그에 3-5개 포스트 발행
   - 각 포스트의 SEO 점수 기록
   - 성과 모니터링 (조회수, 댓글)

2. **워크플로우 최적화**
   - 자신에게 맞는 프로세스 조정
   - 자주 사용하는 명령어 쉘 스크립트로 저장
   - 템플릿 커스터마이징

3. **고급 기능 활용**
   - 이미지 생성 (`blog image generate`)
   - 트렌드 모니터링 (`blog trending`)
   - 성과 분석 (`blog analytics`)

4. **커뮤니티 기여**
   - GitHub Issues에 피드백 제공
   - 새로운 기능 제안
   - 문서 개선 PR

---

**마지막 업데이트**: 2025-10-29 (Epic 7.0 완료 후)
**작성자**: @blog/cli 개발팀
**버전**: 1.0.0
