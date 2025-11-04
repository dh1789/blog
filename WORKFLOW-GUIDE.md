# 블로그 포스트 발행 워크플로우 가이드

**최종 업데이트**: 2025-11-04
**목적**: 품질 높은 한영 블로그 포스트 발행 프로세스 표준화

---

## 🎯 핵심 원칙

### 1. 한글 우선, 영문 후속
- **한글 포스트가 완벽하게 검증된 후에만** 영문 번역 진행
- 한글에 오류가 있으면 영문도 오류를 상속하므로 반드시 한글 먼저 완성

### 2. 각 단계마다 검증
- 발행 전 로컬 검증 필수
- SEO 최적화 확인
- 시각적 프리뷰 검토

### 3. 발행 전 SEO 최적화
- 키워드 밀도 0.5-2.5% 유지
- Excerpt 300자 이하
- 메타데이터 완성도 확인

### 4. 자동화 최대한 활용
- CLI 명령어로 반복 작업 최소화
- 검증 도구 적극 활용
- 향후 자동 연결 기능 활용 (개발 예정)

---

## 📋 전체 워크플로우 개요

```
Phase 1: 한글 포스트 작성 및 검증
  ├─ 1.1 마크다운 작성
  ├─ 1.2 Frontmatter 확인
  ├─ 1.3 SEO 분석
  ├─ 1.4 로컬 프리뷰
  └─ 1.5 최종 검토

Phase 2: 한글 포스트 발행
  ├─ 2.1 WordPress 발행
  ├─ 2.2 발행 결과 확인
  └─ 2.3 필요시 수정

Phase 3: 영문 번역 및 검증
  ├─ 3.1 AI 번역 생성
  ├─ 3.2 번역 품질 검토
  ├─ 3.3 SEO 리포트 확인
  └─ 3.4 필요시 수동 수정

Phase 4: 영문 포스트 발행 및 연결
  ├─ 4.1 WordPress 발행
  ├─ 4.2 Polylang 언어 연결
  └─ 4.3 최종 확인
```

**예상 소요 시간**: 전체 약 30-40분 (포스트 길이에 따라 변동)

---

## Phase 1: 한글 포스트 작성 및 검증

### 1.1 마크다운 파일 작성

**위치**: `content/posts/ko/[파일명].md`

**기본 구조**:
```markdown
---
title: "포스트 제목 (최대 200자)"
slug: "url-friendly-slug"
excerpt: "요약 (10-300자)"
status: "draft"  # 또는 "publish"
categories:
  - "카테고리1"
  - "카테고리2"
tags:
  - "태그1"
  - "태그2"
  - "태그3"
language: "ko"
---

# 포스트 제목

본문 내용...
```

**체크리스트**:
- [ ] 제목이 명확하고 SEO 친화적인가?
- [ ] Slug가 영문/숫자/하이픈만 포함하는가?
- [ ] Excerpt가 10-300자 범위인가?
- [ ] 카테고리 1-5개 지정했는가?
- [ ] 태그 3-10개 지정했는가?
- [ ] 본문에 코드 블록, 이미지 등이 올바르게 작성되었는가?

---

### 1.2 Frontmatter 확인

**필수 필드 검증**:
```yaml
title: string (1-200자)
slug: string (영문/숫자/하이픈)
excerpt: string (10-300자)
status: "draft" | "publish"
categories: string[] (1-5개)
tags: string[] (3-10개)
language: "ko" | "en"
```

**자동 검증**:
- CLI 명령어가 Zod 스키마로 자동 검증
- 오류 시 상세한 메시지 출력

---

### 1.3 SEO 분석

**명령어**:
```bash
blog analyze-seo content/posts/ko/my-post.md --verbose
```

**확인 사항**:
- **SEO 점수**: 70점 이상 목표
- **키워드 밀도**: 0.5-2.5% 범위 유지
- **제목 최적화**: 검색 의도 반영
- **Excerpt 품질**: 주요 베네핏 포함

**예시 출력**:
```
=== SEO 점수 ===
총점: 75/100

✅ 제목 최적화: 완료
✅ Excerpt 길이: 250/300자

키워드 밀도:
  ✅ Node.js: 1.2% (8회)
  ⚠️  CLI: 0.3% (2회) - 권장 0.5% 이상
  ❌ TypeScript: 3.5% (25회) - 권장 2.5% 이하

개선 제안:
  - "CLI" 키워드를 본문에 3-4회 추가 권장
  - "TypeScript" 키워드 사용 빈도를 20회 이하로 축소
```

**조치**:
- ⚠️ 경고가 있으면 본문 수정하여 키워드 밀도 조정
- ❌ 에러가 있으면 반드시 수정 후 진행

---

### 1.4 로컬 프리뷰

**명령어**:
```bash
blog preview content/posts/ko/my-post.md --show-ads
```

**확인 사항**:
- [ ] 제목과 헤딩 구조가 명확한가?
- [ ] 코드 블록이 올바르게 렌더링되는가?
- [ ] 이미지가 정상적으로 표시되는가?
- [ ] 광고 삽입 위치가 적절한가?
- [ ] 전체적인 가독성이 좋은가?

**브라우저**: http://localhost:3000 에서 실시간 확인

---

### 1.5 최종 검토

**체크리스트**:
- [ ] 맞춤법 및 문법 확인
- [ ] 기술 용어 정확성 확인
- [ ] 코드 예제 동작 테스트
- [ ] 외부 링크 유효성 확인
- [ ] SEO 점수 70점 이상
- [ ] 모든 필수 메타데이터 입력 완료

**⚠️ 중요**: 이 단계를 통과하지 못하면 영문 번역으로 진행하지 마세요!

---

## Phase 2: 한글 포스트 발행

### 2.1 WordPress 발행

**명령어 (초안)**:
```bash
blog publish content/posts/ko/my-post.md --draft
```

**명령어 (즉시 발행)**:
```bash
blog publish content/posts/ko/my-post.md
```

**출력 예시**:
```
=== 포스트 정보 ===
제목: Node.js CLI 도구 개발 입문
Slug: node-js-cli-dogu-gaebal-ibmun
요약: Node.js와 TypeScript로 전문 CLI 도구를 개발하는 완벽 가이드...
상태: publish
언어: ko

=== SEO 점수 ===
총점: 75/100

✔ 포스트 발행 완료! (ID: 29)
URL: https://beomanro.com/?p=29
```

**중요 정보 기록**:
- **Post ID 기록**: 나중에 영문 포스트와 연결할 때 필요
- **URL 확인**: 발행된 포스트 링크

**예시 기록**:
```
한글 포스트 발행 완료
- 제목: Node.js CLI 도구 개발 입문
- Post ID: 29
- URL: https://beomanro.com/?p=29
- 발행일: 2025-11-03
```

---

### 2.2 발행 결과 확인

**WordPress 관리자 확인**:
1. https://beomanro.com/wp-admin → Posts → All Posts
2. 발행된 포스트 확인
3. 언어가 "Korean"으로 올바르게 설정되었는지 확인

**실제 페이지 확인**:
1. 발행된 URL 방문
2. 레이아웃 확인
3. 이미지 및 코드 블록 렌더링 확인
4. 광고 위치 확인
5. 모바일 반응형 확인

---

### 2.3 필요시 수정

**수정이 필요한 경우**:
1. 로컬 마크다운 파일 수정
2. 다시 발행 (기존 포스트 업데이트)
   ```bash
   blog publish content/posts/ko/my-post.md
   ```

**⚠️ 주의**: Post ID는 변경되지 않으므로 기록한 ID 그대로 유지

---

## Phase 3: 영문 번역 및 검증

### 3.1 AI 번역 생성

**전제 조건**:
- ✅ 한글 포스트가 WordPress에 발행되어 있어야 함
- ✅ 한글 포스트의 품질이 완벽해야 함

**명령어**:
```bash
blog translate content/posts/ko/my-post.md --target en
```

**출력 예시**:
```
- 한국어 포스트 읽는 중...
AI를 사용하여 en로 번역 중... (약 30초 소요)
✔ 번역 완료!

=== 번역 결과 ===

원본 (한국어):
  제목: Node.js CLI 도구 개발 입문
  Slug: node-js-cli-dogu-gaebal-ibmun-...
  카테고리: Node.js, 개발 도구

번역본 (영어):
  제목: How to Build Node.js CLI Tools from Scratch
  Slug: build-nodejs-cli-tools-complete-guide
  발췌문: Build powerful, professional Node.js CLI tools...
  카테고리: Node.js, Development Tools

=== SEO 분석 ===
제목 최적화: ✅
발췌문 길이: 250/300자 ✅

키워드 밀도:
  ✅ CLI: 1.5% (12회)
  ✅ Node.js: 1.2% (10회)
  ⚠️  TypeScript: 0.4% (3회)

✅ 번역 검증 통과

✅ 번역 파일 생성 완료: content/posts/en/build-nodejs-cli-tools-complete-guide.md
```

**생성 위치**: `content/posts/en/[새로운-영어-slug].md`

---

### 3.2 번역 품질 검토

**확인 사항**:
- [ ] 제목이 SEO 최적화되어 있는가? (How to, Complete Guide 등)
- [ ] Excerpt가 베네핏 중심으로 작성되었는가?
- [ ] 카테고리/태그가 영어로 올바르게 변환되었는가?
- [ ] 번역 디스클레이머가 포함되었는가?
- [ ] 코드 블록이 보존되었는가?

**번역 디스클레이머 확인**:
```markdown
> **🌐 Translation**: Translated from [Korean](/ko/원본-slug).
```

---

### 3.3 SEO 리포트 확인

**자동 출력된 SEO 리포트 검토**:
```
키워드 밀도:
  ✅ CLI: 1.5% (OK)
  ⚠️  Automation: 0.3% (권장 0.5% 이상)
```

**조치**:
- ⚠️ 경고: 생성된 영어 파일을 열어 수동으로 키워드 추가
- ✅ 정상: 그대로 진행

---

### 3.4 필요시 수동 수정

**수정이 필요한 경우**:
1. `content/posts/en/[파일].md` 파일 열기
2. 제목, Excerpt, 본문 등 수정
3. 키워드 밀도 조정
4. 다시 SEO 분석 실행
   ```bash
   blog analyze-seo content/posts/en/[파일].md --verbose
   ```

**일반적인 수정 사항**:
- 키워드 부족 → 본문에 자연스럽게 추가
- Excerpt 너무 긺 → 300자 이하로 축소
- 제목 개선 → SEO 키워드 포함

---

## Phase 4: 영문 포스트 발행 및 연결

### 4.1 WordPress 발행

**전제 조건**:
- ✅ 한글 포스트 Post ID 기록되어 있음 (예: ID 29)
- ✅ 영문 번역 품질 검증 완료

**명령어**:
```bash
blog publish content/posts/en/build-nodejs-cli-tools-complete-guide.md
```

**출력 예시**:
```
=== 포스트 정보 ===
제목: How to Build Node.js CLI Tools from Scratch
상태: publish
언어: en

=== SEO 점수 ===
총점: 72/100

✔ 포스트 발행 완료! (ID: 26)
URL: https://beomanro.com/?p=26
```

**중요 정보 기록**:
```
영문 포스트 발행 완료
- 제목: How to Build Node.js CLI Tools from Scratch
- Post ID: 26
- URL: https://beomanro.com/?p=26
- 한글 원본 Post ID: 29 (연결 필요)
```

---

### 4.2 Polylang 언어 연결

이제 Polylang 언어 연결을 **자동화 또는 수동**으로 수행할 수 있습니다!

#### 방법 1: publish 명령어로 자동 연결 (권장) ✅

**영문 포스트 발행 시 자동으로 한글 포스트와 연결**:

```bash
# 영문 발행과 동시에 한글 Post ID 29와 자동 연결
blog publish content/posts/en/build-nodejs-cli-tools-complete-guide.md --link-to 29
```

**출력 예시**:
```
✔ 포스트 발행 완료! (ID: 26)
URL: https://beomanro.com/?p=26

Polylang 언어 연결 중...
✔ 언어 연결 완료: 한글(29) ↔ 영문(26)
```

**장점**:
- 한 번의 명령어로 발행 + 연결 동시 처리
- 실수 방지 (Post ID 입력 오류 최소화)
- 자동 에러 처리 (연결 실패 시 수동 방법 안내)

**주의사항**:
- 연결 실패 시에도 포스트 발행은 성공 처리됨
- 실패 시 수동 연결 방법이 자동으로 안내됨

---

#### 방법 2: 별도 명령어로 연결 ✅

**이미 발행된 포스트들을 나중에 연결**:

```bash
# 한글 Post ID 29와 영문 Post ID 26을 연결
blog link-translations --ko 29 --en 26
```

**출력 예시**:
```
Polylang 언어 연결 중...
✔ 언어 연결 완료!

=== 연결 결과 ===
한글 포스트: ID 29
영문 포스트: ID 26

WordPress 관리자에서 확인하세요:
https://beomanro.com/wp-admin/post.php?post=29&action=edit
```

**사용 시나리오**:
- 이미 발행된 포스트들을 나중에 연결할 때
- 자동 연결 실패 시 수동으로 재시도
- 연결을 변경하거나 업데이트할 때

---

#### 방법 3: WordPress 관리자에서 수동 연결 (기존 방법)

CLI를 사용하지 않고 WordPress UI에서 직접 연결:

1. **WordPress 관리자 접속**
   - https://beomanro.com/wp-admin

2. **Posts → All Posts**

3. **한글 포스트 편집**
   - 한글 포스트 (ID: 29) 클릭

4. **Polylang 메타박스에서 연결**
   - 오른쪽 사이드바에서 "Languages" 섹션 찾기
   - "English" 드롭다운에서 영문 포스트 선택
   - 예: "How to Build Node.js CLI Tools from Scratch" 선택

5. **저장**
   - "Update" 버튼 클릭

**사용 시나리오**:
- CLI 접근이 어려울 때
- 여러 포스트를 한 번에 관리할 때

---

#### 연결 확인

**WordPress 관리자에서**:
- Posts 목록에서 한글/영문 포스트가 연결된 것으로 표시됨
- 한글 포스트 편집 화면에서 "Languages" 섹션 확인

**실제 페이지에서**:
- 한글 포스트 페이지에 언어 전환 링크 표시
- 언어 전환 버튼 클릭 시 영문 페이지로 이동

---

### 4.3 최종 확인

**WordPress 확인**:
- [ ] 한글/영문 포스트가 Polylang으로 연결되어 있는가?
- [ ] 언어 전환 버튼이 정상 작동하는가?
- [ ] 두 포스트 모두 "publish" 상태인가?

**실제 페이지 확인**:
1. 한글 페이지 방문: https://beomanro.com/?p=29
2. 언어 전환 링크 클릭하여 영문 페이지로 이동
3. 영문 페이지에서 다시 한글로 전환 테스트
4. 모바일 환경에서도 테스트

**SEO 확인**:
- [ ] Google Search Console에 두 URL 모두 등록
- [ ] `hreflang` 태그가 자동 삽입되었는지 확인 (Polylang 자동)

---

## 📊 체크리스트 요약

### Phase 1: 한글 작성 및 검증
- [ ] 마크다운 파일 작성 완료
- [ ] Frontmatter 모든 필수 필드 입력
- [ ] `blog analyze-seo` 실행 및 70점 이상 확보
- [ ] `blog preview`로 시각적 확인
- [ ] 최종 검토 통과

### Phase 2: 한글 발행
- [ ] `blog publish` 실행
- [ ] Post ID 기록 (예: ID 29)
- [ ] WordPress 관리자에서 확인
- [ ] 실제 페이지 확인
- [ ] 필요시 수정 및 재발행

### Phase 3: 영문 번역 및 검증
- [ ] `blog translate` 실행
- [ ] 번역 품질 검토
- [ ] SEO 리포트 확인 및 조치
- [ ] 필요시 수동 수정

### Phase 4: 영문 발행 및 연결
- [ ] `blog publish` (영문) 실행
- [ ] Post ID 기록 (예: ID 26)
- [ ] WordPress에서 Polylang 연결
- [ ] 언어 전환 기능 테스트
- [ ] 최종 확인 완료

---

## ⚠️ 주의사항

### 1. Excerpt 길이 제한
- **최대 300자**를 절대 초과하지 마세요
- 초과 시 발행 실패
- 자동 축소 기능이 있지만 직접 확인 권장

### 2. 키워드 밀도
- **0.5-2.5%** 범위 유지
- 너무 적으면: SEO 점수 하락
- 너무 많으면: 스팸으로 간주될 위험

### 3. 한글 검증 후 영문 진행
- **반드시 한글이 완벽한 후** 영문 번역
- 한글 오류는 영문에도 그대로 반영됨
- 재작업 시간 낭비 방지

### 4. Post ID 기록
- 한글/영문 각각의 **Post ID 반드시 기록**
- Polylang 연결 시 필요
- 나중에 찾기 어려우므로 즉시 기록

### 5. 코드 블록 보존
- 번역 시 코드 블록이 그대로 유지되는지 확인
- 코드는 번역되지 않아야 함
- 주석만 번역되어야 함

---

## 🚀 효율성 팁

### 1. SEO 분석을 습관화
```bash
# 매번 작성 후 실행
blog analyze-seo content/posts/ko/[파일].md --verbose

# 수정 후에도 실행
blog analyze-seo content/posts/ko/[파일].md --verbose
```

### 2. 프리뷰 적극 활용
```bash
# 로컬에서 미리 확인
blog preview content/posts/ko/[파일].md --show-ads

# 수정하면서 실시간 확인 (Watch 모드)
```

### 3. Dry-run으로 시뮬레이션
```bash
# 실제 발행 전 테스트
blog publish content/posts/ko/[파일].md --dry-run

# 번역 미리보기
blog translate content/posts/ko/[파일].md --dry-run
```

### 4. 템플릿 활용
```bash
# 새 포스트 생성 시 템플릿 사용
cp content/templates/technical-post.md content/posts/ko/my-new-post.md
```

### 5. 배치 작업
```bash
# 여러 포스트 동시 분석 (향후 구현 예정)
blog analyze-seo content/posts/ko/*.md
```

---

## 📈 품질 기준

### 최소 기준 (반드시 충족)
- ✅ SEO 점수 70점 이상
- ✅ 모든 필수 메타데이터 입력
- ✅ Excerpt 300자 이하
- ✅ 카테고리 1-5개
- ✅ 태그 3-10개

### 권장 기준 (목표)
- 🎯 SEO 점수 80점 이상
- 🎯 키워드 밀도 모두 0.5-2.5% 범위
- 🎯 제목 최적화 (검색 의도 반영)
- 🎯 Excerpt 200자 이상

### 우수 기준 (이상적)
- 🏆 SEO 점수 90점 이상
- 🏆 모든 키워드 1.0-2.0% (최적 범위)
- 🏆 사용자 피드백 긍정적
- 🏆 검색엔진 상위 노출

---

## 🔄 향후 개선 예정

### 단기 (1-2주)
- [x] Polylang 자동 연결 명령어 ✅ 완료 (2025-11-04)
- [ ] SEO 키워드 자동 최적화
- [ ] 배치 번역 기능

### 중기 (1개월)
- [ ] 통합 발행 명령어 `blog publish-bilingual`
- [ ] Git Hook 통합 (자동 번역)
- [ ] Watch 모드 (실시간 변경 감지)

### 장기 (3개월)
- [ ] 완전 자동화 파이프라인
- [ ] 성과 분석 대시보드
- [ ] 다국어 확장 (일본어, 중국어)

---

## 📚 참고 문서

- `ISSUES.md`: 발견된 이슈 및 해결 방법
- `TRANSLATION-PATTERNS.md`: 번역 패턴 및 자동화 가이드
- `CLAUDE.md`: 프로젝트 개요 및 개발 가이드
- `README.md`: 프로젝트 소개 및 설치 가이드

---

**문서 버전**: 1.1
**최종 검증**: 2025-11-04
**주요 변경사항**: Polylang 자동 연결 기능 구현 및 워크플로우 업데이트
