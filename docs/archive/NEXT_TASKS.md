# 다음 작업 목록 (Next Tasks)

**최종 업데이트**: 2025-11-04
**현재 상태**: Epic 11.0 완료, 프로덕션 Ready

---

## 🎯 우선순위별 작업 목록

### ⭐⭐⭐⭐⭐ 최우선 (즉시 실행 가능, 1-2일)

#### Epic 12.0 - WordPress 미디어 라이브러리 통합
**예상 시간**: 1-2일
**ROI**: 매우 높음
**난이도**: 중간
**우선순위**: 1위

**현재 문제**:
- 마크다운의 로컬 이미지 경로 (`./images/screenshot.png`)
- 수동으로 WordPress 미디어 라이브러리에 업로드 필요
- 이미지 URL 수동 변경 필요

**목표**:
```bash
# Before (수동)
1. 마크다운 작성: ![설명](./images/screenshot.png)
2. WordPress 관리자 → 미디어 업로드
3. URL 복사: https://beomanro.com/wp-content/uploads/2025/11/screenshot.png
4. 마크다운 수정: ![설명](https://beomanro.com/...)

# After (자동)
blog publish <file> --upload-images
# → 자동으로 이미지 업로드 및 URL 변환
```

**주요 기능**:
- [ ] WordPress 미디어 REST API 클라이언트 구현
- [ ] 마크다운 이미지 경로 파싱 (`![](...)` 패턴)
- [ ] 로컬 이미지 파일 자동 업로드
- [ ] 마크다운 URL 자동 변환
- [ ] 중복 이미지 감지 (이미 업로드된 파일)

**기대 효과**:
- ✅ 이미지 처리 시간 100% 절감
- ✅ 워크플로우 완전 자동화
- ✅ 실수 방지 (잘못된 URL)

**예상 Task 분해**:
- Task 12.1: WordPress Media API 클라이언트 (0.5일)
- Task 12.2: 이미지 경로 파싱 및 변환 (0.5일)
- Task 12.3: CLI 통합 및 테스트 (0.5일)

---

#### Epic 12.1 - 마지막 포스트 발행 (wordpress-avada)
**예상 시간**: 10분
**ROI**: 중간
**난이도**: 쉬움
**우선순위**: 2위

**현재 상태**:
- wordpress-avada-peurimiueom-teulrogeuro-beulrogeu-wanseong.md (978줄)
- Status: draft
- 영문 버전: 로컬에 존재

**실행 명령**:
```bash
# 자동 번역 + 발행
node packages/cli/dist/index.mjs publish \
  content/posts/ko/wordpress-avada-peurimiueom-teulrogeuro-beulrogeu-wanseong.md

# 또는 status만 변경 (draft → publish)
# WordPress 관리자에서 직접 수정
```

**기대 효과**:
- ✅ 모든 로컬 포스트 발행 완료
- ✅ WordPress 콘텐츠 완성도 증가

---

#### Epic 12.2 - WordPress 중복 포스트 정리
**예상 시간**: 30분
**ROI**: 낮음
**난이도**: 쉬움
**우선순위**: 3위

**중복 의심 포스트**:
- ID 75 vs ID 86 (Cloudflare SSL)
- ID 71 vs ID 85 (Cloudflare SSL, 삭제됨?)

**확인 방법**:
```bash
# WordPress 관리자 확인
1. Posts → All Posts
2. ID 75, 86 내용 비교
3. 중복이면 하나 삭제
4. 휴지통 확인 (ID 83, 84, 85)
```

---

### ⭐⭐⭐⭐ 고우선순위 (1주일)

#### Epic 13.0 - 이미지 최적화 시스템
**예상 시간**: 2-3일
**ROI**: 높음
**난이도**: 중간
**우선순위**: 4위

**주요 기능**:
- [ ] Sharp/ImageMagick 통합
- [ ] PNG/JPG → WebP 자동 변환 (80% 압축)
- [ ] 반응형 이미지 생성 (3 sizes: 1200px, 800px, 400px)
- [ ] AI 기반 Alt 텍스트 자동 생성
- [ ] EXIF 데이터 제거 (개인정보 보호)

**CLI 명령어**:
```bash
# 이미지 최적화
blog publish <file> --optimize-images

# 자동 처리:
# - WebP 변환 (80% 압축)
# - 3개 크기 생성 (srcset)
# - Alt 텍스트 AI 생성
# - EXIF 제거
```

**기대 효과**:
- ✅ 페이지 로딩 속도 50-70% 향상
- ✅ SEO 점수 향상 (Core Web Vitals)
- ✅ 접근성 향상 (Alt 텍스트)
- ✅ 스토리지 사용량 감소

**예상 Task 분해**:
- Task 13.1: Sharp 통합 (0.5일)
- Task 13.2: WebP 변환 및 압축 (1일)
- Task 13.3: AI Alt 텍스트 생성 (1일)
- Task 13.4: 반응형 이미지 생성 (0.5일)

---

#### Epic 14.0 - 일괄 업로드/업데이트 시스템
**예상 시간**: 2-3일
**ROI**: 중간
**난이도**: 중간
**우선순위**: 5위

**현재 문제**:
- 한 번에 하나씩만 발행 가능
- 여러 포스트 업데이트 시 반복 작업

**주요 기능**:
- [ ] 디렉토리 전체 일괄 발행
- [ ] 기존 포스트 일괄 업데이트
- [ ] 병렬 처리 (5-10배 속도)
- [ ] 진행률 표시 (progress bar)
- [ ] 선택적 필터링 (날짜, 상태)

**CLI 명령어**:
```bash
# 디렉토리 일괄 발행
blog publish content/posts/ko/ --batch

# 병렬 처리
blog publish content/posts/ko/ --batch --concurrency 5

# 기존 포스트 업데이트
blog update --all --dry-run
blog update --modified-since 7d

# 선택적 발행
blog publish content/posts/ko/ --batch --status draft
blog publish content/posts/ko/ --batch --since 2025-11-01
```

**기대 효과**:
- ✅ 대량 발행 시간 5-10배 단축
- ✅ 일괄 업데이트 가능
- ✅ 콘텐츠 관리 효율성 향상

**예상 Task 분해**:
- Task 14.1: 디렉토리 스캔 및 필터링 (1일)
- Task 14.2: 병렬 처리 구현 (1일)
- Task 14.3: 진행률 표시 및 에러 처리 (0.5일)
- Task 14.4: update 명령어 구현 (0.5일)

---

### ⭐⭐⭐ 중간 우선순위 (2-4주)

#### Epic 15.0 - 스케줄 발행 시스템
**예상 시간**: 3-4일
**ROI**: 중간
**난이도**: 중간-높음
**우선순위**: 6위

**주요 기능**:
- [ ] 포스트 예약 발행
- [ ] Cron 작업 자동 생성
- [ ] GitHub Actions 워크플로우 생성
- [ ] 스케줄 관리 명령어

**CLI 명령어**:
```bash
# 스케줄 설정
blog schedule <file> --publish-at "2025-11-10 09:00"

# GitHub Actions YAML 생성
blog schedule generate-workflow

# 스케줄 목록 확인
blog schedule list

# Cron 예시:
# 매일 오전 9시 자동 발행
0 9 * * * cd /path/to/blog && blog publish content/posts/scheduled/
```

**기대 효과**:
- ✅ 콘텐츠 전략 자동화
- ✅ 일정한 발행 주기 유지
- ✅ 시간대 최적화

**예상 Task 분해**:
- Task 15.1: 스케줄 데이터 구조 설계 (0.5일)
- Task 15.2: schedule 명령어 구현 (1일)
- Task 15.3: GitHub Actions 통합 (1일)
- Task 15.4: Cron 작업 생성 (0.5일)
- Task 15.5: 스케줄 관리 UI (1일)

---

#### Epic 16.0 - 성과 분석 대시보드
**예상 시간**: 5-7일
**ROI**: 높음
**난이도**: 높음
**우선순위**: 7위

**주요 기능**:
- [ ] Google Analytics 통합
- [ ] 포스트별 성과 추적
- [ ] SEO 순위 모니터링
- [ ] 수익 분석 (AdSense)
- [ ] 웹 대시보드 (Next.js)

**CLI 명령어**:
```bash
# 성과 분석
blog analytics --post <id> --period 30d
blog analytics --top-posts 10
blog analytics --seo-rank <keyword>

# 리포트 생성
blog analytics --export report.json
blog analytics --dashboard  # 웹 UI 실행 (localhost:3000)
```

**대시보드 기능**:
- 📊 트래픽 분석 (일/주/월)
- 💰 수익 분석 (AdSense)
- 🔍 SEO 순위 추적
- 📈 성장률 그래프
- 🎯 인기 포스트 Top 10

**기대 효과**:
- ✅ 데이터 기반 의사결정
- ✅ 고성과 콘텐츠 식별
- ✅ SEO 전략 최적화
- ✅ 수익 추적 자동화

**예상 Task 분해**:
- Task 16.1: Google Analytics API 통합 (1일)
- Task 16.2: 데이터 수집 및 저장 (1.5일)
- Task 16.3: 분석 로직 구현 (1일)
- Task 16.4: CLI 명령어 구현 (1일)
- Task 16.5: Next.js 대시보드 개발 (2일)

---

#### Epic 17.0 - A/B 테스팅 시스템
**예상 시간**: 4-5일
**ROI**: 중간
**난이도**: 높음
**우선순위**: 8위

**주요 기능**:
- [ ] 제목 A/B 테스팅
- [ ] 광고 위치 최적화
- [ ] CTR 추적
- [ ] 자동 승자 선택

**CLI 명령어**:
```bash
# A/B 테스트 생성
blog ab-test create <post-id> \
  --variant-a "Original Title" \
  --variant-b "Optimized Title"

# 결과 확인
blog ab-test results <test-id>

# 승자 선택
blog ab-test select-winner <test-id> --auto
```

**기대 효과**:
- ✅ CTR 10-30% 향상
- ✅ 광고 수익 최적화
- ✅ 데이터 기반 제목 선택

---

#### Epic 18.0 - 추가 언어 지원 (일본어, 중국어)
**예상 시간**: 3-4일
**ROI**: 낮음-중간
**난이도**: 중간
**우선순위**: 9위

**주요 기능**:
- [ ] 일본어 번역 지원
- [ ] 중국어(간체/번체) 번역 지원
- [ ] 언어별 SEO 최적화
- [ ] 다국어 Polylang 연결

**기대 효과**:
- ✅ 글로벌 트래픽 확대
- ✅ 다국어 SEO
- ✅ 새로운 수익원

---

### ⭐⭐ 낮은 우선순위 (장기)

#### Epic 19.0 - AI 콘텐츠 생성 고도화
**예상 시간**: 5-7일
**ROI**: 중간
**난이도**: 높음

**주요 기능**:
- [ ] 자동 주제 발굴
- [ ] 경쟁 분석
- [ ] 콘텐츠 개요 자동 생성
- [ ] AI 편집 제안

---

#### Epic 20.0 - 소셜 미디어 통합
**예상 시간**: 4-5일
**ROI**: 중간
**난이도**: 중간

**주요 기능**:
- [ ] 트위터 자동 공유
- [ ] LinkedIn 자동 공유
- [ ] Facebook 페이지 연동
- [ ] 소셜 미디어 성과 추적

---

## 🔧 유지보수 및 개선 작업

### 즉시 실행 가능한 개선 사항

#### 1. 키워드 밀도 최적화
**예상 시간**: 2-3시간
**우선순위**: 중간

**현재 문제**:
- 일부 포스트에서 키워드 밀도 3-5% (권장: 0.5-2.5%)

**해결 방안**:
```typescript
// packages/core/src/translator.ts
// 번역 시 키워드 밀도 조정 로직 추가
if (keywordDensity > 2.5) {
  // 자연스럽게 일부 키워드를 동의어로 변경
}
```

---

#### 2. SEO 키워드 누락 최소화
**예상 시간**: 3-4시간
**우선순위**: 중간

**현재 문제**:
- 일부 한글 키워드가 영문에 누락

**해결 방안**:
```typescript
// 번역 프롬프트에 키워드 강조 추가
const prompt = `
...
IMPORTANT: Ensure these keywords appear naturally in translation:
${metadata.tags.join(', ')}
`;
```

---

#### 3. 로컬 번역 파일 자동 저장
**예상 시간**: 2-3시간
**우선순위**: 낮음

**현재 문제**:
- WordPress에만 발행, 로컬 파일 미생성

**해결 방안**:
```bash
# publish 시 번역 파일도 자동 저장
blog publish <file> --save-translation
```

---

#### 4. 테스트 커버리지 향상
**예상 시간**: 1-2일
**우선순위**: 중간

**현재 상태**:
- Core: 82% 커버리지
- CLI: 67% 커버리지

**목표**:
- Core: 90%+
- CLI: 80%+

---

#### 5. 에러 메시지 개선
**예상 시간**: 1일
**우선순위**: 낮음

**개선 사항**:
- 더 친절한 에러 메시지
- 해결 방법 제안
- 관련 문서 링크

---

## 📊 권장 로드맵 (다음 30일)

### Week 1 (11/4-11/10)
- ✅ Epic 11.0 완료 (완료!)
- 🔄 **Epic 12.0 - 미디어 라이브러리 통합** (2일) ⭐⭐⭐⭐⭐
- 📝 Epic 13.0 PRD 작성

### Week 2 (11/11-11/17)
- **Epic 13.0 - 이미지 최적화** (3일) ⭐⭐⭐⭐
- **Epic 14.0 - 일괄 처리 시스템** (2일) ⭐⭐⭐⭐

### Week 3 (11/18-11/24)
- **Epic 15.0 - 스케줄 발행** (4일) ⭐⭐⭐

### Week 4 (11/25-12/1)
- **Epic 16.0 - 성과 분석 대시보드** (5일) ⭐⭐⭐⭐

---

## 🎯 추천 우선순위 (Top 3)

### 1위: Epic 12.0 - 미디어 라이브러리 통합 ⭐⭐⭐⭐⭐
- **이유**: 워크플로우 완전 자동화의 마지막 퍼즐
- **ROI**: 매우 높음 (수동 이미지 관리 제거)
- **시간**: 단기 (1-2일)
- **영향**: 즉각적인 생산성 향상

### 2위: Epic 13.0 - 이미지 최적화 ⭐⭐⭐⭐
- **이유**: SEO 및 성능 개선
- **ROI**: 높음 (사용자 경험 + 검색 순위)
- **시간**: 단기 (2-3일)
- **영향**: 페이지 속도 50-70% 향상

### 3위: Epic 14.0 - 일괄 처리 시스템 ⭐⭐⭐
- **이유**: 대량 콘텐츠 관리 효율화
- **ROI**: 중간 (스케일링 준비)
- **시간**: 단기 (2-3일)
- **영향**: 대량 발행 시 5-10배 속도

---

## 📋 즉시 실행 가능한 액션 아이템

### 오늘/내일 할 수 있는 작업:

1. **마지막 포스트 발행** (10분)
   ```bash
   blog publish content/posts/ko/wordpress-avada-peurimiueom-teulrogeuro-beulrogeu-wanseong.md
   ```

2. **중복 포스트 정리** (30분)
   - WordPress 관리자에서 ID 75 vs 86 확인
   - 중복이면 하나 삭제

3. **Epic 12.0 PRD 작성** (1-2시간)
   ```bash
   blog draft-create "WordPress 미디어 라이브러리 자동 업로드" \
     "WordPress, 미디어, 이미지 업로드, REST API, 자동화"
   ```

4. **Epic 12.0 개발 시작** (1-2일)
   - Task 12.1: WordPress Media API 클라이언트
   - Task 12.2: 이미지 경로 파싱 및 변환
   - Task 12.3: CLI 통합 및 테스트

---

## 💡 최종 추천

**즉시 시작**: Epic 12.0 - 미디어 라이브러리 통합

**이유**:
1. 가장 높은 ROI
2. 빠른 완성 (1-2일)
3. 워크플로우 완전 자동화 달성
4. 다음 Epic들의 기반 기술

**예상 효과**:
- 이미지 처리 시간 100% 절감
- 완전 자동화된 블로그 발행 시스템 완성
- 프로덕션 사용 준비 완료

---

**마지막 업데이트**: 2025-11-04
**프로젝트 상태**: Epic 11.0 완료, 다음 Epic 준비 완료
