# E2E Testing Guide - AI 자동 번역 시스템

**Epic 11.0 - AI Auto-Translation System**

이 가이드는 실제 WordPress 환경에서 자동 번역 시스템의 E2E(End-to-End) 테스트를 수행하는 방법을 안내합니다.

## 📋 테스트 준비사항

### 1. WordPress 환경 요구사항

- ✅ WordPress 5.0 이상
- ✅ Avada 테마 설치 및 활성화
- ✅ Polylang 플러그인 설치 및 활성화
- ✅ Polylang REST API Helper 플러그인 설치 및 활성화
  - 위치: `/wordpress-plugin/polylang-rest-api-helper.php`
  - 설치 방법: WordPress 관리자 → 플러그인 → 새로 추가 → 업로드
- ✅ WordPress Application Password 생성
- ✅ Polylang 언어 설정: 한국어(ko), 영어(en)

### 2. 로컬 환경 요구사항

- ✅ Node.js 20 이상
- ✅ pnpm 9 이상
- ✅ Claude Code CLI 설치 및 인증
  - `/opt/homebrew/bin/claude` 실행 가능
  - 구독 활성화 상태
- ✅ 프로젝트 의존성 설치: `pnpm install`
- ✅ 프로젝트 빌드: `pnpm build`
- ✅ 환경 변수 설정: `.env` 파일 작성

### 3. 테스트 포스트 준비

테스트용 한글 마크다운 파일 3개 준비:

1. **짧은 포스트** (100줄 이하): `content/posts/ko/test-short.md`
2. **중간 포스트** (500줄 내외): `content/posts/ko/test-medium.md`
3. **코드 블록 많은 포스트** (10개 이상 코드 블록): `content/posts/ko/test-code-heavy.md`

**필수 메타데이터**:
```markdown
---
title: "테스트 포스트 제목 (60자 이하)"
excerpt: "테스트 포스트 요약 (300자 이하)"
categories: ["테스트"]
tags: ["WordPress", "CLI", "Test"]
status: "draft"
language: "ko"
---
```

---

## 🧪 테스트 시나리오

### Test 1: 기본 자동 번역 워크플로우 (TC-4.1)

**목적**: 한글 포스트 발행 시 자동 번역 → 영문 발행 → Polylang 연결 전체 검증

**실행**:
```bash
# 중간 포스트로 테스트
blog publish content/posts/ko/test-medium.md --draft
```

**예상 결과**:
1. ✅ 한글 포스트 발행 성공 (ID 출력)
2. ✅ 자동 번역 시작 메시지
3. ✅ 번역 품질 검증 통과
   ```
   === 번역 품질 메트릭 ===
   라인 수 차이: XX%
   코드 블록 보존: N개
   메타데이터 완전성: ✓
   SEO 최적화: ✓
   제목 길이: NN자
   Excerpt 길이: NNN자/300자
   ```
4. ✅ 영문 포스트 발행 성공 (ID 출력)
5. ✅ Polylang 언어 연결 성공
   ```
   ✔ 언어 연결 완료: 한글(ID1) ↔ 영문(ID2)
   ```

**검증 방법**:
1. **WordPress 관리자 확인**:
   - Posts → All Posts에서 두 포스트 확인
   - 한글 포스트 편집 → Polylang 메타박스에서 영문 연결 확인
   - 영문 포스트 편집 → Polylang 메타박스에서 한글 연결 확인

2. **웹 브라우저 확인**:
   - 한글 포스트 URL 접속: `https://your-blog.com/ko/slug/`
   - 언어 전환 버튼 확인 (Polylang 언어 스위처)
   - 영문 포스트로 전환: `https://your-blog.com/en/slug-en/`
   - 역방향 언어 전환 확인

3. **번역 품질 확인**:
   - 제목이 영문 SEO 최적화되었는지 확인 (예: "How to...", "Complete Guide to...")
   - 요약이 300자 이하인지 확인
   - 코드 블록이 완전히 보존되었는지 확인
   - 번역 디스클레이머가 포함되었는지 확인
     ```
     > **🌐 Translation**: Translated from [Korean](/ko/원본-슬러그).
     ```

**통과 기준**:
- ✅ 모든 단계가 에러 없이 완료
- ✅ 두 포스트 모두 WordPress에 정상 발행
- ✅ Polylang 양방향 연결 정상
- ✅ 웹에서 언어 전환 정상 작동
- ✅ 번역 품질 메트릭 모두 통과

---

### Test 2: 짧은 포스트 검증 실패 (TC-4.2)

**목적**: 짧은 포스트(100줄 이하)에서 라인 수 검증 실패 시나리오 테스트

**실행**:
```bash
blog publish content/posts/ko/test-short.md --draft
```

**예상 결과**:
1. ✅ 한글 포스트 발행 성공
2. ✅ 자동 번역 시작
3. ⚠️ 번역 품질 검증 실패 (라인 수 < 50%)
   ```
   ❌ 에러 (1개):
     - Translation is too short: XX lines (XX% of original). Expected 50-150%.

   번역 품질 검증 실패
   한글 포스트만 발행되었습니다.
   ```
4. ✅ 한글 포스트는 정상 발행 (실패 안전)

**검증 방법**:
- WordPress에 한글 포스트만 존재하는지 확인
- 영문 포스트가 발행되지 않았는지 확인
- 에러 메시지가 명확하게 출력되었는지 확인

**통과 기준**:
- ✅ 검증 실패 시 명확한 에러 메시지
- ✅ 한글 포스트는 정상 발행 (실패 안전)
- ✅ 영문 포스트는 발행되지 않음

---

### Test 3: 코드 블록 보존 검증 (TC-4.3)

**목적**: 코드 블록이 많은 포스트에서 번역 시 코드 블록이 완전히 보존되는지 검증

**실행**:
```bash
blog publish content/posts/ko/test-code-heavy.md --draft
```

**예상 결과**:
1. ✅ 코드 블록 개수 보존: 원본 N개 = 번역 N개
   ```
   코드 블록 보존: 10개
   ```
2. ✅ 코드 블록 내용 보존 (번역 없음)
3. ✅ 코드 블록 언어 보존 (```typescript, ```bash 등)

**검증 방법**:
1. WordPress 관리자에서 영문 포스트 확인
2. 모든 코드 블록이 그대로 보존되었는지 확인
3. 코드 블록 개수가 한글 포스트와 일치하는지 확인
4. 코드 블록 내용이 번역되지 않았는지 확인

**통과 기준**:
- ✅ 코드 블록 개수 일치
- ✅ 코드 블록 내용 완전 보존
- ✅ 코드 블록 언어 보존

---

### Test 4: SEO 키워드 보존 검증 (TC-4.4)

**목적**: frontmatter tags의 모든 키워드가 영문 콘텐츠에 포함되었는지 검증

**준비**:
```markdown
---
tags: ["WordPress", "TypeScript", "CLI", "REST API", "Node.js"]
---
```

**예상 결과**:
1. ✅ 모든 키워드가 영문 콘텐츠에 포함
2. ✅ 키워드 밀도 0.5-2.5% 범위 (정보 메시지)
   ```
   ℹ️  정보 (1개):
     - Keyword density is low (0.45%). Recommended: 0.5-2.5%
   ```

**검증 방법**:
1. 영문 포스트 내용에서 각 키워드 검색 (Ctrl+F)
2. 모든 키워드가 최소 1회 이상 포함되었는지 확인

**통과 기준**:
- ✅ 모든 tags 키워드 포함
- ⚠️ 키워드 밀도 경고는 통과 (warning이므로 발행됨)

---

### Test 5: --no-translate 플래그 (TC-4.5)

**목적**: 자동 번역 비활성화 옵션 검증

**실행**:
```bash
blog publish content/posts/ko/test-medium.md --no-translate --draft
```

**예상 결과**:
1. ✅ 한글 포스트 발행 성공
2. ✅ 자동 번역 비활성화 메시지
   ```
   자동 번역이 비활성화되었습니다. (--no-translate)
   ```
3. ✅ 영문 포스트 미발행

**검증 방법**:
- WordPress에 한글 포스트만 존재하는지 확인

**통과 기준**:
- ✅ 한글 포스트만 발행
- ✅ 자동 번역 실행 안 됨

---

### Test 6: Polylang 연결 실패 시나리오 (TC-4.6)

**목적**: Polylang REST API Helper 플러그인 미설치 시 에러 처리 검증

**준비**:
1. WordPress에서 Polylang REST API Helper 플러그인 비활성화

**실행**:
```bash
blog publish content/posts/ko/test-medium.md --draft
```

**예상 결과**:
1. ✅ 한글/영문 포스트 모두 발행 성공
2. ⚠️ Polylang 연결 실패 경고
   ```
   ⚠️  언어 연결 실패 (포스트 발행은 성공)

   언어 연결 오류: Polylang REST API Helper 플러그인이 설치되지 않았습니다.

   해결 방법:
   1. /wordpress-plugin/polylang-rest-api-helper.php 파일을
   2. WordPress 서버의 wp-content/plugins/ 디렉토리에 업로드
   3. WordPress 관리자에서 플러그인 활성화

   수동 연결 방법:
     blog link-translations --ko ID1 --en ID2
   ```

**검증 방법**:
- 두 포스트 모두 WordPress에 발행되었는지 확인
- Polylang 연결이 안 되어 있는지 확인
- 수동 연결 가이드가 출력되었는지 확인

**통과 기준**:
- ✅ 두 포스트 모두 발행 성공 (실패 안전)
- ✅ 명확한 에러 메시지 및 해결 가이드
- ✅ 수동 연결 명령어 제공

---

### Test 7: 성능 측정 (TC-4.7)

**목적**: 전체 번역 및 발행 시간 측정

**실행**:
```bash
# 중간 포스트 (500줄 내외)
time blog publish content/posts/ko/test-medium.md --draft
```

**측정 지표**:
- **번역 시간**: Claude Code 실행 시간 (60ms/단어 기준)
- **검증 시간**: 8단계 validation 시간
- **발행 시간**: WordPress API 호출 시간
- **전체 시간**: 시작부터 완료까지

**예상 시간** (500줄, 약 3000 단어):
- 번역: 약 3분 (3000 * 60ms = 180초)
- 검증: 약 5초
- 발행 (한글): 약 2초
- 발행 (영문): 약 2초
- Polylang 연결: 약 1초
- **전체**: 약 3분 10초

**통과 기준**:
- ✅ 전체 시간 < 5분 (500줄 기준)
- ✅ 번역 시간이 예상 범위 내

---

### Test 8: 품질 메트릭 수집 (TC-4.8)

**목적**: 번역 품질 메트릭 수집 및 분석

**실행**:
```bash
# 5개 포스트로 테스트
for i in {1..5}; do
  blog publish content/posts/ko/test-$i.md --draft
done
```

**수집 메트릭**:
1. **라인 수 차이 평균**: 평균 몇 %인지
2. **코드 블록 보존율**: 100% 달성했는지
3. **SEO 키워드 보존율**: 평균 몇 %의 키워드 포함
4. **제목 길이 평균**: 평균 몇 자인지 (≤60자)
5. **Excerpt 길이 평균**: 평균 몇 자인지 (≤300자)
6. **검증 통과율**: 몇 %가 검증 통과했는지

**통과 기준**:
- ✅ 라인 수 차이: 평균 50-150% 범위
- ✅ 코드 블록 보존율: 100%
- ✅ SEO 키워드 보존율: ≥90%
- ✅ 제목 길이 평균: ≤60자
- ✅ Excerpt 길이 평균: ≤300자
- ✅ 검증 통과율: ≥80%

---

## 🔧 트러블슈팅

### 문제 1: 번역이 너무 느림

**증상**: 번역 시간이 10분 이상 소요

**원인**:
- 포스트가 너무 긴 경우 (5000+ 단어)
- Claude Code 서버 응답 지연

**해결**:
```bash
# 포스트 길이 확인
wc -w content/posts/ko/test-medium.md

# 타임아웃 에러 발생 시 재시도
blog publish content/posts/ko/test-medium.md --draft
```

---

### 문제 2: 코드 블록이 번역됨

**증상**: 코드 블록 내용이 일부 번역됨

**원인**:
- 코드 블록 마크다운 형식 오류 (백틱 개수 불일치)
- Claude Code가 코드 블록을 인식하지 못함

**해결**:
1. 원본 마크다운에서 코드 블록 형식 확인
   ```
   ```typescript  (opening)
   code here
   ```  (closing)
   ```
2. 백틱 개수 일치 확인 (opening 3개, closing 3개)

---

### 문제 3: Polylang 연결 실패

**증상**: `언어 연결 실패` 에러

**원인**:
- Polylang REST API Helper 플러그인 미설치/비활성화
- Polylang 플러그인 미활성화
- WordPress 권한 문제

**해결**:
1. WordPress 관리자 → 플러그인에서 Polylang 활성화 확인
2. Polylang REST API Helper 플러그인 설치 확인
   ```bash
   # 플러그인 업로드
   scp wordpress-plugin/polylang-rest-api-helper.php root@YOUR_VPS:/var/www/html/wp-content/plugins/
   ```
3. 수동 연결:
   ```bash
   blog link-translations --ko 29 --en 26
   ```

---

### 문제 4: 검증 실패가 너무 많음

**증상**: 대부분의 포스트가 검증 실패

**원인**:
- 포스트가 너무 짧음 (< 100줄)
- Excerpt가 너무 김 (> 300자)
- 키워드가 너무 적음 (< 3개)

**해결**:
1. 포스트 길이 확인
   ```bash
   wc -l content/posts/ko/test-medium.md
   ```
2. Excerpt 길이 확인 (frontmatter에서)
3. Tags 개수 확인 (최소 3개 권장)

---

## 📊 테스트 결과 기록

### 테스트 실행 일시
- **날짜**: 2025-11-04
- **테스터**: [이름]
- **WordPress 버전**: [버전]
- **Polylang 버전**: [버전]

### 테스트 결과 요약

| Test | 시나리오 | 결과 | 비고 |
|------|---------|------|------|
| 1 | 기본 자동 번역 워크플로우 | ⬜ PASS / ⬜ FAIL | |
| 2 | 짧은 포스트 검증 실패 | ⬜ PASS / ⬜ FAIL | |
| 3 | 코드 블록 보존 검증 | ⬜ PASS / ⬜ FAIL | |
| 4 | SEO 키워드 보존 검증 | ⬜ PASS / ⬜ FAIL | |
| 5 | --no-translate 플래그 | ⬜ PASS / ⬜ FAIL | |
| 6 | Polylang 연결 실패 | ⬜ PASS / ⬜ FAIL | |
| 7 | 성능 측정 | ⬜ PASS / ⬜ FAIL | 전체 시간: __분 __초 |
| 8 | 품질 메트릭 수집 | ⬜ PASS / ⬜ FAIL | 검증 통과율: __% |

### 발견된 이슈

1. [이슈 제목]
   - 증상:
   - 재현 방법:
   - 해결 여부:

---

## 📝 참고 문서

- **README.md**: 전체 기능 개요 및 사용법
- **CLAUDE.md**: 아키텍처 및 구현 상세
- **WORKFLOW-GUIDE.md**: 권장 워크플로우
- **ISSUES.md**: 알려진 이슈 및 해결 방법
- **tasks/9.0-prd-auto-translation-system.md**: PRD
- **tasks/tasks-9.0-prd-auto-translation-system.md**: Task 목록

---

**작성일**: 2025-11-04
**버전**: Epic 11.0
**작성자**: Claude Code (Sonnet 4.5)
