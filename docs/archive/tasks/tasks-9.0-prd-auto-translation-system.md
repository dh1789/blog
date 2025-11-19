# 태스크: 자동 번역 시스템

**PRD**: 9.0-prd-auto-translation-system.md
**생성일**: 2025-11-04
**예상 공수**: 5-6일

---

## 관련 파일

- `packages/core/src/translator.ts` - 번역 엔진 모듈 (TODO 구현 필요: 라인 50, 114, 144, 212)
- `packages/core/src/translator.test.ts` - translator.ts에 대한 유닛 테스트
- `packages/core/src/validation.ts` - 번역 품질 검증 모듈 (신규 생성)
- `packages/core/src/validation.test.ts` - validation.ts에 대한 유닛 테스트
- `packages/core/src/claude.ts` - Claude Code CLI 실행 모듈 (이미 구현됨, 활용)
- `packages/core/src/markdown.ts` - 마크다운 파싱 모듈 (슬러그 자동 처리 이미 구현됨)
- `packages/core/src/wordpress.ts` - WordPress REST API 클라이언트 (수정 필요)
- `packages/core/src/wordpress.test.ts` - wordpress.ts에 대한 유닛 테스트
- `packages/cli/src/commands/publish.ts` - CLI publish 명령어 (수정 필요)
- `packages/cli/src/commands/publish.test.ts` - publish.ts에 대한 통합 테스트
- `packages/shared/src/types.ts` - TypeScript 타입 정의 (번역 관련 타입 추가)
- `packages/shared/src/schemas.ts` - Zod 스키마 정의 (번역 검증 스키마 추가)

### 참고사항

#### 코드베이스 현황

**기존 구조**:
```
packages/
├── cli/
│   ├── src/commands/
│   │   ├── publish.ts          ✅ 존재 (수정 필요)
│   │   └── link-translations.ts ✅ 존재 (참고용)
│   └── package.json
├── core/
│   ├── src/
│   │   ├── markdown.ts         ✅ 존재 (슬러그 자동 처리 이미 구현)
│   │   ├── wordpress.ts        ✅ 존재 (수정 필요)
│   │   ├── claude.ts           ✅ 존재 (이미 완벽하게 구현됨!)
│   │   ├── translator.ts       ✅ 존재 (TODO 구현 필요)
│   │   └── validation.ts       ❌ 생성 필요
│   └── package.json
└── shared/
    ├── src/
    │   ├── types.ts            ✅ 존재 (타입 추가 필요)
    │   └── schemas.ts          ✅ 존재 (스키마 추가 필요)
    └── package.json
```

**중요 사항**:
- `claude.ts`의 `executeClaude()` 함수가 이미 완벽하게 구현되어 있습니다
- Claude Code CLI를 headless 모드로 실행
- API 키 불필요 (Claude Code 구독 활용)
- 의존성 추가 불필요

#### 테스팅 요구사항

**유닛 테스팅:**
- 유닛 테스트는 일반적으로 테스트하는 코드 파일과 함께 배치되어야 합니다 (예: 같은 디렉토리에 `translator.ts`와 `translator.test.ts`).
- 모든 구현은 프로그래밍 언어의 네이티브 테스팅 프레임워크(Jest)를 사용해야 합니다.
- 각 유닛 테스트 스위트는 다음을 다루는 최소 3개의 테스트 케이스를 포함해야 합니다:
  - **정상 경로**: 가장 일반적이고 예상되는 사용 시나리오를 테스트하여 올바른 동작을 확인합니다.
  - **경계 조건**: 최소값, 최대값, 빈 입력, null 값 및 한계 조건을 포함한 엣지 케이스를 테스트합니다.
  - **예외 케이스**: 잘못된 입력, 오류 조건 및 예외적인 상황을 테스트하여 적절한 오류 처리를 보장합니다.
  - **부작용**: 테스트가 독립적이며 (테스트 간 간섭 없음) 글로벌 상태나 외부 시스템에 영향을 주지 않는지 확인합니다.
- Jest 테스트를 실행하려면 `npx jest [선택적/경로/테스트/파일]`을 사용하세요.

**시스템 테스팅:**
- PRD에 정의된 사용자 스토리를 기반으로 시스템 테스트를 생성합니다.
- 정상적인 기능 사용을 나타내는 최소 2개의 현실적인 사용자 시나리오를 테스트합니다.
- **검증을 위해 실제 데이터를 사용해야 합니다** - 하드코딩된 값이나 더미 데이터는 허용되지 않습니다.
- 처음부터 끝까지 완전한 사용자 워크플로우를 검증합니다.
- 시스템 테스트는 모든 컴포넌트의 통합과 기능의 엔드투엔드 기능을 검증해야 합니다.

---

## 태스크

### 1.0 프로젝트 분석 및 타입 정의

**목표**: 기존 구현 파악 및 번역 기능에 필요한 타입 정의

**구현 작업**:
- [x] 1.1 `packages/core/src/claude.ts` 분석 - executeClaude() 함수 이해
  - [x] ClaudeOptions, ClaudeResponse 타입 확인
  - [x] headless 모드 실행 방식 이해
  - [x] 타임아웃 및 에러 처리 방식 파악
- [x] 1.2 `packages/core/src/translator.ts` 분석 - TODO 위치 및 구조 파악
  - [x] 라인 50: translatePost() TODO
  - [x] 라인 114: generateSEOTitle() TODO
  - [x] 라인 144: generateSEOExcerpt() TODO
  - [x] 라인 212: translateContent() TODO
- [x] 1.3 `packages/shared/src/types.ts`에 번역 관련 타입 정의 추가
  - [x] TranslationOptions 타입 추가
  - [x] ValidationResult 타입 추가
  - [x] ValidationIssue 타입 추가
  - [x] TranslationQualityMetrics 타입 추가
- [x] 1.4 `packages/shared/src/schemas.ts`에 번역 검증 스키마 추가
  - [x] TranslationOptionsSchema 정의
  - [x] ValidationIssueSchema 정의
  - [x] TranslationQualityMetricsSchema 정의
  - [x] ValidationResultSchema 정의

**테스트 작업**:
- [x] 1.5 타입 정의 컴파일 테스트 - pnpm build 성공
- [x] 1.6 executeClaude() 동작 확인 - export 구조 정상

**예상 시간**: 0.5일

**의존성**: 없음

**완료 시간**: 0.5일 (2025-11-04)

---

### 2.0 번역 모듈 구현

**목표**: executeClaude()를 활용한 고품질 번역 엔진 구축

**구현 작업**:
- [x] 2.1 `packages/core/src/translator.ts` TODO 구현 (라인 50, 114, 144, 212)
- [x] 2.2 `translateContent()` 함수 구현 - executeClaude() 호출
  - [x] 기존 임시 구현 삭제 및 실제 번역 로직 구현
  - [x] 자연스러운 번역을 위한 프롬프트 엔지니어링
    - [x] 역할 정의: "professional technical writer and translator"
    - [x] 번역 목표: 직역이 아닌 의역, 문화적 맥락 고려
    - [x] 품질 기준: 자연스러움, 전문성, 가독성, 톤 유지
    - [x] 필수 보존 항목: SEO 키워드, 코드 블록, 링크, 이미지 경로
    - [x] 번역 금지 항목: 브랜드명, 기술 용어, 명령어, 파일명
    - [x] 문화적 맥락 변환: 한국어 관용구 → 영어권 표현
    - [x] SEO 키워드 동적 삽입: frontmatter `tags` 필드 활용
    - [x] 마크다운 출력 형식 (번역된 전체 콘텐츠)
  - [x] executeClaude() 호출 및 결과 파싱
  - [x] 에러 처리 및 타임아웃 계산
- [x] 2.3 `generateSEOTitle()` 함수 개선 - executeClaude()로 SEO 최적화 제목 생성
  - [x] async 함수로 변경
  - [x] SEO 패턴 적용 (How to, Complete Guide 등)
  - [x] 60자 제한 및 경고
  - [x] 에러 시 폴백 (원본 반환)
- [x] 2.4 `generateSEOExcerpt()` 함수 개선 - executeClaude()로 SEO 최적화 요약 생성
  - [x] async 함수로 변경
  - [x] 300자 제한 엄격 적용 (WordPress 제한)
  - [x] 초과 시 자동 자르기
  - [x] 에러 시 폴백 (원본 300자까지)
- [x] 2.5 `translateMetadata()` 함수 수정 - async 호출 추가 (await)
- [x] 2.6 `translatePost()` 함수 통합 - TODO 주석 제거 및 워크플로우 완성

**테스트 작업**:
- [x] 2.7 `translateContent()` 유닛 테스트 작성 (TC-1.1, TC-1.2)
  - [x] TC-1.1: executeClaude() 정상 호출 및 번역 (skip - 통합 테스트)
  - [x] TC-1.2: Claude Code 실행 오류 처리
  - [x] TC-1.3: 빈 콘텐츠 처리 (경계 조건)
- [x] 2.8 프롬프트 엔지니어링 테스트 작성 (TC-1.4 ~ TC-1.6)
  - [x] TC-1.4: 기본 구조 (SEO, 기술 용어, 코드 블록)
  - [x] TC-1.5: SEO 키워드 프롬프트 포함
  - [x] TC-1.6: 번역 금지 항목 (skip - 통합 테스트)
- [x] 2.9 `translatePost()` 통합 테스트
  - [x] 번역 디스클레이머 생성
  - [x] 300자 excerpt 제한
  - [x] 타임아웃 계산
  - [x] SEO 리포트 생성
- [x] 2.10 `translateMetadata()` 유닛 테스트
  - [x] 메타데이터 필드 번역 확인
  - [x] 언어 코드 변경 확인

**테스트 결과**: 9개 통과, 3개 skip (실제 Claude Code 실행 필요)

**예상 시간**: 2일

**의존성**: 1.0 완료

**완료 시간**: 1.5일 (2025-11-04)

---

### 3.0 품질 검증 모듈 구현

**목표**: 번역 품질 자동 검증 시스템 구축

**구현 작업**:
- [x] 3.1 `packages/core/src/validation.ts` 파일 생성
- [x] 3.2 `validateTranslation()` 함수 구현 - 품질 검증 통합 관리
  - [x] 모든 검증 함수 호출 및 결과 통합
  - [x] 검증 실패 시 상세 에러 메시지 생성
  - [x] isValid 판정 (error가 있으면 false)
- [x] 3.3 `validateLineCount()` 함수 구현 - 라인 수 검증 (50-150%)
  - [x] 원본과 번역 라인 수 비교
  - [x] 퍼센티지 계산
  - [x] 범위 벗어날 경우 실패 처리
  - [x] 70-130% 범위 밖이면 경고
- [x] 3.4 `validateSeoKeywords()` 함수 구현 - SEO 키워드 유지 확인
  - [x] frontmatter tags에서 키워드 추출
  - [x] 번역본에 키워드 존재 여부 확인
  - [x] 누락된 키워드 목록 생성
  - [x] 키워드 밀도 계산 (권장: 0.5-2.5%)
- [x] 3.5 `validateTitleLength()` 함수 구현 - 제목 길이 검증 (≤60자)
  - [x] 영어 제목 길이 측정
  - [x] 60자 초과 시 경고 (발행은 진행)
- [x] 3.6 `validateBasics()` 함수 구현 - 기본 검증
  - [x] 비어있지 않음 확인
  - [x] 코드 블록 개수 일치 (``` 개수)
  - [x] 링크 형식 유지 (URL 깨짐 방지)
  - [x] 마크다운 헤딩 구조 보존 (h1, h2 개수)
- [ ] 3.7 `validateNaturalness()` 함수 구현 (선택적, Phase 2)
  - [ ] 기계 번역 패턴 감지 (반복 패턴, 과도한 수동태)
  - [ ] 기술 용어 적절성 검증
  - [ ] 톤 일관성 체크

**테스트 작업**:
- [x] 3.8 `validateLineCount()` 유닛 테스트
  - [x] TC-2.1: 정상 범위 (50-150%)
  - [x] TC-2.2: 범위 미달 (<50%) - error
  - [x] TC-2.3: 범위 초과 (>150%) - error
  - [x] TC-2.4: 경계 경고 (70-130% 밖) - warning
- [x] 3.9 `validateSeoKeywords()` 유닛 테스트
  - [x] TC-2.4: 키워드 유지 확인
  - [x] TC-2.5: 키워드 누락 감지
  - [x] TC-2.6: 키워드 밀도 계산
  - [x] TC-2.7: tags 없는 경우 처리
- [x] 3.10 `validateTitleLength()` 유닛 테스트
  - [x] TC-2.7: 정상 길이 (≤60자)
  - [x] TC-2.8: 길이 초과 (>60자) - warning
- [x] 3.11 `validateBasics()` 유닛 테스트
  - [x] TC-2.10: 기본 구조 검증 통과
  - [x] TC-2.11: 빈 콘텐츠 감지 - error
  - [x] TC-2.12: 코드 블록 개수 불일치 - error
  - [x] TC-2.13: 링크 개수 불일치 - warning
  - [x] TC-2.14: 헤딩 구조 불일치 - warning
- [x] 3.12 `validateTranslation()` 통합 테스트
  - [x] 종합 검증 결과 구조 확인
  - [x] isValid 판정 (error 있으면 false)
  - [x] metrics 계산 정확성
  - [x] warning만 있으면 valid
- [ ] 3.13 `validateNaturalness()` 유닛 테스트 (Phase 2)
  - [ ] TC-2.13: 기계 번역 패턴 감지
  - [ ] TC-2.14: 자연스러운 번역

**테스트 결과**: 19개 통과

**예상 시간**: 1일

**완료 시간**: 0.5일 (2025-11-04)

**의존성**: 없음 (2.0과 병렬 진행 가능)

---

### 4.0 CLI 통합

**목표**: 자동 번역 워크플로우를 CLI에 통합

**구현 작업**:
- [ ] 4.1 `packages/cli/src/commands/publish.ts` 수정
  - [ ] `--no-translate` 플래그 추가 (Commander.js)
  - [ ] 한글 포스트 발행 후 자동 번역 로직 호출
  - [ ] 번역 진행 상황 표시 (Ora 스피너)
  - [ ] 번역 품질 검증 결과 출력 (Chalk 컬러링)
  - [ ] 에러 처리 강화 (번역 실패 시 한글만 발행)
  - [ ] 성공/실패 메시지 출력
- [ ] 4.2 번역 워크플로우 통합
  - [ ] language: ko 감지
  - [ ] translatePost() 호출
  - [ ] validateTranslation() 호출
  - [ ] 영어 포스트 발행
  - [ ] Polylang 언어 연결

**테스트 작업**:
- [ ] 4.3 CLI 통합 테스트 - 전체 워크플로우 성공 시나리오 (TC-3.1)
  - [ ] Given: 유효한 한글 포스트 마크다운 파일
  - [ ] When: `blog publish` 명령 실행
  - [ ] Then: 한글/영어 포스트 발행, 언어 연결 완료
- [ ] 4.4 CLI 통합 테스트 - 번역 API 실패 시나리오 (TC-3.2)
  - [ ] Given: 잘못된 Claude API 키 설정
  - [ ] When: `blog publish` 명령 실행
  - [ ] Then: 한글 포스트만 발행, 에러 메시지 출력
- [ ] 4.5 CLI 통합 테스트 - 번역 품질 검증 실패 시나리오 (TC-3.3)
  - [ ] Given: 라인 수 검증 실패하도록 설정된 Mock API
  - [ ] When: `blog publish` 명령 실행
  - [ ] Then: 한글 포스트만 발행, 검증 실패 원인 명시
- [ ] 4.6 CLI 통합 테스트 - `--no-translate` 플래그 동작 (TC-3.4)
  - [ ] Given: 유효한 한글 포스트, `--no-translate` 플래그
  - [ ] When: `blog publish --no-translate` 명령 실행
  - [ ] Then: 한글 포스트만 발행, "자동 번역 비활성화" 메시지

**예상 시간**: 1일

**의존성**: 2.0, 3.0 완료

---

### 5.0 WordPress 연동 강화

**목표**: 영어 포스트 발행 및 Polylang 언어 연결 자동화

**구현 작업**:
- [ ] 5.1 `packages/core/src/wordpress.ts` 수정
  - [ ] `linkTranslations(koPostId, enPostId)` 메서드 추가
  - [ ] Polylang REST API Helper 호출 로직 구현
    - [ ] POST /wp-json/polylang-helper/v1/link-translations
    - [ ] 요청 본문: { ko: koPostId, en: enPostId }
  - [ ] 에러 처리 (Polylang 연결 실패 시 경고)
  - [ ] 성공 시 언어 연결 확인 메시지

**테스트 작업**:
- [ ] 5.2 `linkTranslations()` 유닛 테스트 - 정상 연결
  - [ ] Given: 유효한 한글/영어 포스트 ID
  - [ ] When: linkTranslations() 호출
  - [ ] Then: Polylang API 호출 성공, 언어 연결 완료
- [ ] 5.3 `linkTranslations()` 유닛 테스트 - API 호출 실패
  - [ ] Given: 잘못된 포스트 ID
  - [ ] When: linkTranslations() 호출
  - [ ] Then: 에러 발생, 명확한 에러 메시지
- [ ] 5.4 WordPress 통합 테스트 (Mock REST API)
  - [ ] 한글/영어 포스트 발행 → 언어 연결 전체 플로우 테스트

**예상 시간**: 0.5일

**의존성**: 4.0 완료

---

### 6.0 E2E 테스트 및 문서화

**목표**: 실제 WordPress 환경에서 전체 워크플로우 검증 및 문서 업데이트

**구현 작업**:
- [ ] 6.1 실제 WordPress 환경에서 E2E 테스트 실행 (TC-4.1)
  - [ ] 한글 포스트 발행 → 영어 번역 → 발행 → 언어 연결 전체 확인
  - [ ] 웹 브라우저에서 두 포스트 정상 표시 확인
  - [ ] Polylang 언어 전환기 동작 확인
  - [ ] 한글 URL: `/ko/slug/`, 영어 URL: `/en/slug-en/` 확인
- [ ] 6.2 다양한 포스트 형식으로 E2E 테스트
  - [ ] 긴 포스트 (1000줄 이상)
  - [ ] 짧은 포스트 (100줄 이하)
  - [ ] 코드 블록 많은 포스트 (10개 이상)
- [ ] 6.3 에러 시나리오 E2E 테스트
  - [ ] 네트워크 장애 시뮬레이션
  - [ ] WordPress 응답 지연 시뮬레이션
- [ ] 6.4 문서 업데이트
  - [ ] README.md 업데이트 (새로운 기능 설명)
  - [ ] CLAUDE.md 업데이트 (아키텍처 다이어그램)
  - [ ] 사용 가이드 작성 (번역 명령어, 플래그, 에러 처리)

**테스트 작업**:
- [ ] 6.5 E2E 테스트 실행 및 결과 검증
- [ ] 6.6 성능 측정 (번역 시간, 전체 발행 시간)
- [ ] 6.7 품질 메트릭 수집 (번역 품질 통과율, 키워드 보존율)

**예상 시간**: 0.5일

**의존성**: 5.0 완료

---

## 태스크 요약

| Phase | 태스크 | 예상 시간 | 의존성 | 우선순위 |
|-------|--------|----------|--------|---------|
| 1 | 프로젝트 분석 및 타입 정의 | 0.5일 | - | High |
| 2 | 번역 모듈 구현 | 2일 | 1.0 | High |
| 3 | 품질 검증 모듈 구현 | 1.5일 | - | High |
| 4 | CLI 통합 | 1일 | 2.0, 3.0 | High |
| 5 | WordPress 연동 강화 | 0.5일 | 4.0 | Medium |
| 6 | E2E 테스트 및 문서화 | 0.5일 | 5.0 | Medium |

**총 예상 공수**: 6일

**병렬 진행 가능**: 2.0과 3.0은 병렬로 진행 가능하여 실제 소요 시간은 5-5.5일로 단축 가능
