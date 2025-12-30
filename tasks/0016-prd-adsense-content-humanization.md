# PRD 0016: 애드센스 승인을 위한 콘텐츠 휴머나이제이션 시스템

**작성일**: 2025-12-30
**상태**: Draft
**우선순위**: High
**예상 작업량**: Epic (18시간)
**복잡도**: 중간 (24점)

---

## 0. 복잡도 분석 (Complexity Analysis)

### 복잡도 점수 계산
| 요소 | 값 | 가중치 | 점수 |
|------|---|--------|------|
| 컴포넌트 수 | 5개 | ×2 | 10 |
| 외부 의존성 | 2개 (playwright, sharp) | ×3 | 6 |
| 보안 요구사항 | 낮음 | - | 0 |
| 성능 제약사항 | 중간 (스크린샷 생성 시간) | - | 5 |
| 불명확성 | 낮음 | - | 3 |
| **총점** | | | **24** |

**결과**: 중간 복잡도 (11-25점) → Sequential Thinking 적용

### 주요 컴포넌트
1. `experience-interviewer` - 경험 인터뷰 질문 생성
2. `experience-generator` - 경험담 문단 생성
3. `screenshot-generator` - 터미널/브라우저 스크린샷
4. `native-translator` - 네이티브 영문 번역
5. `quality-checker` - 품질 검증

---

## 1. 개요 (Introduction)

### 배경
beomanro.com 블로그가 구글 애드센스 승인 심사에서 **"가치가 별로 없는 콘텐츠"** 사유로 거절되었습니다. 웹 리서치 결과, AI 콘텐츠 자체는 문제가 아니지만 **인간적 터치(human touch)**와 **고유한 가치**가 부족할 경우 거절될 수 있음을 확인했습니다.

### 문제 정의
현재 블로그 콘텐츠의 주요 문제점:

1. **개인 경험 부재**: 작성자의 실제 경험, 시행착오, 의견이 부족
2. **이미지/스크린샷 부족**: 코드 실행 결과를 보여주는 시각적 자료가 거의 없음
3. **영문 번역 품질**: 번역체 느낌이 강하고 자연스럽지 않음
4. **반복적 구조**: 모든 포스트가 비슷한 패턴으로 작성됨

### 솔루션
포스트 생성 파이프라인을 개선하여:
- 작성 전 개인 경험 인터뷰 진행
- 코드 실행 결과 스크린샷 자동 생성
- 영문 번역 프롬프트 강화
- 포스트별 다양한 구조와 어조 적용

---

## 2. 목표 (Goals)

### 주요 목표
| 목표 | 측정 지표 | 목표값 |
|------|----------|--------|
| 애드센스 승인 획득 | 승인 여부 | 승인 |
| AI 느낌 감소 | 사용자 피드백/자체 평가 | "AI 작성 느낌 없음" |
| 콘텐츠 가치 향상 | 이미지 포함 비율 | 포스트당 2개 이상 |
| 영문 품질 향상 | 번역체 표현 비율 | 50% 이상 감소 |

### 성공 기준
1. 구글 애드센스 승인 획득
2. 신규 포스트에 최소 2개 이상의 스크린샷/이미지 포함
3. 개인 경험담이 자연스럽게 본문에 통합됨
4. 영문 포스트가 네이티브 스타일에 가까움

---

## 3. 사용자 스토리 (User Stories)

### US-1: 개인 경험 인터뷰
> **As a** 블로그 작성자
> **I want to** 포스트 작성 전에 관련 경험에 대한 질문을 받고 답변하고 싶다
> **So that** 내 실제 경험이 포스트에 자연스럽게 녹아들 수 있다

**인수 조건:**
- [ ] 포스트 주제 분석 후 관련 경험 질문 3-5개 자동 생성
- [ ] 답변을 바탕으로 경험담 문단 자동 생성
- [ ] 생성된 경험담이 본문의 적절한 위치에 삽입됨

### US-2: 코드 실행 결과 스크린샷 자동 생성
> **As a** 기술 블로그 작성자
> **I want to** 코드 예제의 실행 결과를 스크린샷으로 자동 캡처하고 싶다
> **So that** 독자가 실제 결과를 시각적으로 확인할 수 있다

**인수 조건:**
- [ ] 터미널 출력 결과 캡처 지원
- [ ] 브라우저 렌더링 결과 캡처 지원 (Playwright)
- [ ] API 응답 결과 포맷팅 및 캡처
- [ ] 생성된 이미지 자동 WordPress 업로드

### US-3: 네이티브 영문 스타일 번역
> **As a** 다국어 블로그 운영자
> **I want to** 영문 포스트가 네이티브 스피커가 작성한 것처럼 보이게 하고 싶다
> **So that** 영어권 독자에게 자연스러운 콘텐츠를 제공할 수 있다

**인수 조건:**
- [ ] 번역 프롬프트에 네이티브 스타일 가이드라인 포함
- [ ] 한국어 문장 구조가 드러나지 않도록 재구성
- [ ] 기술 용어는 영어권에서 실제 사용하는 표현 적용
- [ ] 문화적 뉘앙스 고려 (예: 겸손한 표현 → 자신감 있는 표현)

### US-4: 포스트 검토 및 승인
> **As a** 블로그 운영자
> **I want to** 발행 전 생성된 포스트를 검토하고 승인하고 싶다
> **So that** 품질 기준에 맞는 콘텐츠만 발행할 수 있다

**인수 조건:**
- [ ] 생성된 포스트 미리보기 제공
- [ ] 경험담, 이미지, 번역 품질 체크리스트 표시
- [ ] 승인/수정 요청/거절 옵션 제공
- [ ] 수정 요청 시 피드백 반영 후 재생성

---

## 4. 기능 요구사항 (Functional Requirements)

### FR-1: 개인 경험 인터뷰 시스템

#### FR-1.1: 경험 질문 생성
```typescript
interface ExperienceQuestion {
  id: string;
  question: string;        // 질문 내용
  context: string;         // 질문 맥락 설명
  exampleAnswer: string;   // 예시 답변
  category: 'motivation' | 'challenge' | 'application' | 'insight';
}

// 예시 질문 카테고리:
// - motivation: "이 기술을 배우게 된 계기가 무엇인가요?"
// - challenge: "개발 중 가장 어려웠던 점은 무엇이었나요?"
// - application: "실제로 어디에 적용했거나 적용할 계획인가요?"
// - insight: "이 기술에 대해 다른 사람들에게 전하고 싶은 인사이트는?"
```

#### FR-1.2: 경험담 문단 생성
- 답변을 바탕으로 1인칭 시점의 자연스러운 문단 생성
- 작성자 프로필 반영 (현직 개발자, 사이드 프로젝트 경험)
- 본문의 관련 섹션에 자연스럽게 삽입

#### FR-1.3: 삽입 위치 결정
| 카테고리 | 삽입 위치 |
|---------|----------|
| motivation | 서론/도입부 |
| challenge | 관련 기술 설명 섹션 |
| application | 실습/예제 섹션 |
| insight | 결론/마무리 |

### FR-2: 스크린샷 자동 생성 시스템

#### FR-2.1: 터미널 출력 캡처
```typescript
interface TerminalCapture {
  command: string;           // 실행할 명령어
  workingDir: string;        // 작업 디렉토리
  timeout: number;           // 타임아웃 (ms)
  theme: 'dark' | 'light';   // 터미널 테마 (기본: dark)
  fontSize: number;          // 폰트 크기 (기본: 14)
  maxLines?: number;         // 최대 출력 라인 수
}

// 캡처 프로세스:
// 1. child_process.exec()로 명령어 실행
// 2. stdout/stderr를 ansi-to-html로 HTML 변환
// 3. 다크 테마 HTML 템플릿에 삽입
// 4. Playwright로 HTML 페이지 스크린샷

// 지원 환경:
// - Node.js (npx tsx, node)
// - Python (python, pip)
// - Shell (bash, zsh)
// - Package managers (npm, pnpm, yarn)
```

#### FR-2.2: 브라우저 캡처 (Playwright)
```typescript
interface BrowserCapture {
  url: string;               // 캡처할 URL (http://, file://)
  selector?: string;         // 특정 요소만 캡처 (선택)
  viewport: { width: number; height: number };
  waitFor?: string;          // 대기할 셀렉터 또는 조건
  fullPage: boolean;         // 전체 페이지 캡처 여부
  delay?: number;            // 캡처 전 대기 시간 (ms)
}

// 캡처 프로세스:
// 1. Playwright 브라우저 인스턴스 생성
// 2. 지정된 URL로 이동
// 3. waitFor 조건 대기 (선택)
// 4. 스크린샷 캡처 (전체 페이지 또는 특정 요소)
// 5. sharp로 이미지 최적화
```

#### FR-2.3: API 응답 캡처
```typescript
interface APICapture {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  formatAs: 'json' | 'table' | 'raw';
}

// 캡처 프로세스:
// 1. fetch()로 API 호출
// 2. 응답을 지정된 포맷으로 변환
// 3. 터미널 캡처와 동일한 HTML 템플릿 사용
// 4. Playwright로 스크린샷
```

#### FR-2.4: 통합 스크린샷 생성기
```typescript
type CaptureType = 'terminal' | 'browser' | 'api';

interface ScreenshotOptions {
  type: CaptureType;
  config: TerminalCapture | BrowserCapture | APICapture;
  outputPath: string;        // 저장 경로
  maxWidth: number;          // 최대 너비 (기본: 1200px)
  quality: number;           // 이미지 품질 (1-100, 기본: 85)
}

// 공통 후처리:
// - sharp로 이미지 리사이징 (maxWidth)
// - 이미지 압축 (quality)
// - alt 텍스트 자동 생성
```

#### FR-2.4: 이미지 처리 및 업로드
- 생성된 스크린샷을 `content/posts/{lang}/images/` 에 저장
- WordPress 미디어 라이브러리에 자동 업로드
- 포스트 본문에 이미지 마크다운 자동 삽입
- 이미지 alt 텍스트 자동 생성

### FR-3: 네이티브 영문 번역 시스템

#### FR-3.1: 강화된 번역 프롬프트
```markdown
## 영문 번역 가이드라인

### 스타일 원칙
1. **직역 금지**: 한국어 문장 구조를 영어로 옮기지 않음
2. **재작성**: 같은 의미를 영어 네이티브가 표현하는 방식으로 재작성
3. **자신감 있는 어조**: 겸손한 표현("~인 것 같습니다") → 직접적 표현("This is...")
4. **능동태 선호**: 수동태보다 능동태 사용

### 기술 용어 처리
- 영어권 개발자 커뮤니티에서 실제 사용하는 표현 적용
- 한국어 고유 표현은 문맥에 맞게 의역

### 문장 구조
- 짧고 명확한 문장 선호
- 불필요한 수식어 제거
- 핵심 내용 먼저 제시 (영어권 writing style)
```

#### FR-3.2: 번역 품질 검증
```typescript
interface TranslationQualityCheck {
  directTranslationPatterns: string[];  // 직역 패턴 감지
  passiveVoiceRatio: number;            // 수동태 비율
  averageSentenceLength: number;        // 평균 문장 길이
  koreanStructurePatterns: string[];    // 한국어 구조 패턴 감지
}

// 품질 기준:
// - 직역 패턴: 0개
// - 수동태 비율: 20% 미만
// - 평균 문장 길이: 15-25 단어
```

### FR-4: 포스트 검토 시스템

#### FR-4.1: 품질 체크리스트 생성
```typescript
interface QualityChecklist {
  // 경험담
  hasPersonalExperience: boolean;
  experienceNaturallyIntegrated: boolean;

  // 이미지
  imageCount: number;
  imagesHaveAltText: boolean;
  imagesRelevant: boolean;

  // 영문 (영문 포스트인 경우)
  noDirectTranslation: boolean;
  nativeStyleScore: number;  // 0-100

  // 전반적 품질
  seoScore: number;
  readabilityScore: number;
  overallReady: boolean;
}
```

#### FR-4.2: 검토 인터페이스
- CLI에서 포스트 미리보기 표시
- 체크리스트 항목별 통과/실패 표시
- 승인/수정 요청/거절 선택
- 수정 요청 시 구체적 피드백 입력

---

## 5. 비기능 요구사항 (Non-Functional Requirements)

### NFR-1: 성능
- 스크린샷 생성: 코드 블록당 30초 이내
- 경험담 생성: 5초 이내
- 번역 품질 검증: 3초 이내

### NFR-2: 호환성
- 기존 `blog publish` 워크플로우와 통합
- 현재 마크다운 파일 형식 유지
- WordPress REST API 호환

### NFR-3: 확장성
- 새로운 캡처 유형 추가 용이
- 다른 언어 번역 지원 가능한 구조

---

## 6. 비목표 (Non-Goals / Out of Scope)

1. **기존 포스트 수정**: 이번 PRD는 신규 포스트에만 적용
2. **실시간 코드 실행**: 복잡한 환경 설정이 필요한 코드는 제외
3. **다국어 확장**: 영어 외 다른 언어는 향후 과제
4. **자동 발행**: 검토 없이 자동 발행하는 기능은 포함하지 않음
5. **AI 이미지 생성**: 실제 스크린샷만 대상 (생성형 이미지 제외)

---

## 7. 아키텍처 결정사항 (Architecture Decisions)

| 결정사항 | 선택 | 근거 | 트레이드오프 |
|---------|------|------|-------------|
| 터미널 캡처 방식 | HTML 템플릿 + Playwright | 기존 Playwright 재사용, 스타일링 자유도 높음 | 추가 HTML 템플릿 관리 필요 |
| 브라우저 캡처 | Playwright 직접 사용 | 크로스 브라우저 지원, 이미 프로젝트에 존재 | 브라우저 인스턴스 오버헤드 |
| 경험담 저장 | 마크다운 인라인 삽입 | 별도 파일 관리 불필요, 원본 구조 유지 | 원본과 생성 콘텐츠 혼합 |
| 번역 검증 | 규칙 기반 패턴 매칭 | 빠른 검증, 예측 가능한 결과 | LLM 기반보다 유연성 낮음 |
| 이미지 저장 경로 | `posts/{lang}/images/` | 포스트별 그룹핑, 기존 구조 일관성 | 중복 이미지 가능성 |
| CLI 옵션 구조 | 개별 플래그 (--interview, --screenshots 등) | 세밀한 제어 가능 | 플래그 조합이 복잡해질 수 있음 |
| 품질 검증 시점 | 발행 직전 (동기) | 품질 보장, 즉시 피드백 | 워크플로우 시간 증가 |

---

## 8. Phase 분해 (Implementation Phases)

### Phase 1: 기반 구조 (Foundation)
**목표**: 핵심 인터페이스 및 타입 정의
**예상 시간**: 2시간
**복잡도**: 낮음

**Tasks:**
1. 🔴 **RED**: humanizer 모듈 인터페이스 테스트 작성
2. 🟢 **GREEN**: 타입 정의 및 기본 구조 구현
3. 🔵 **REFACTOR**: 인터페이스 정리

**산출물:**
- `packages/core/src/humanizer/types.ts`
- `packages/core/src/humanizer/index.ts`

**테스트 전략:**
- 타입 검증 테스트
- 커버리지 목표: 80%

---

### Phase 2: 스크린샷 생성 시스템 (Screenshot Generator)
**목표**: 터미널 및 브라우저 스크린샷 캡처 구현
**예상 시간**: 4시간
**복잡도**: 높음 → TDD 필수

**Tasks:**
1. 🔴 **RED**: 터미널 캡처 테스트 작성
   - 명령어 실행 및 출력 캡처
   - ANSI → HTML 변환
   - 스크린샷 생성
2. 🟢 **GREEN**: TerminalCapture 클래스 구현
3. 🔴 **RED**: 브라우저 캡처 테스트 작성
   - URL 로딩
   - 요소 대기
   - 스크린샷 캡처
4. 🟢 **GREEN**: BrowserCapture 클래스 구현
5. 🔵 **REFACTOR**: 공통 로직 추출, 에러 핸들링 개선

**산출물:**
- `packages/core/src/humanizer/screenshot-generator.ts`
- `packages/core/src/humanizer/templates/terminal-dark.html`
- `packages/core/src/humanizer/screenshot-generator.test.ts`

**테스트 전략:**
- 단위 테스트: 각 캡처 타입별
- 통합 테스트: 실제 스크린샷 생성
- 커버리지 목표: 90%
- 테스트 케이스:
  - ✅ Happy Path: 정상 명령어 실행, URL 캡처
  - 🔶 Boundary: 빈 출력, 긴 출력, 타임아웃
  - ❌ Exception: 잘못된 명령어, 네트워크 에러

---

### Phase 3: 경험 인터뷰 시스템 (Experience Interview)
**목표**: 포스트 주제 기반 경험 질문 생성 및 답변 처리
**예상 시간**: 3시간
**복잡도**: 중간 → TDD 적용

**Tasks:**
1. 🔴 **RED**: 질문 생성 테스트 작성
2. 🟢 **GREEN**: ExperienceInterviewer 클래스 구현
3. 🔴 **RED**: 경험담 생성 테스트 작성
4. 🟢 **GREEN**: ExperienceGenerator 클래스 구현
5. 🔵 **REFACTOR**: 프롬프트 최적화

**산출물:**
- `packages/core/src/humanizer/experience-interviewer.ts`
- `packages/core/src/humanizer/experience-generator.ts`
- 테스트 파일들

**테스트 전략:**
- 단위 테스트: 질문 카테고리 분류, 삽입 위치 결정
- 커버리지 목표: 85%

---

### Phase 4: 네이티브 번역 강화 (Native Translation)
**목표**: 기존 translator 개선으로 네이티브 영문 스타일 적용
**예상 시간**: 3시간
**복잡도**: 중간 → TDD 적용

**Tasks:**
1. 🔴 **RED**: 번역 품질 검증 테스트 작성
   - 직역 패턴 감지
   - 수동태 비율 체크
   - 한국어 구조 패턴 감지
2. 🟢 **GREEN**: NativeTranslator 클래스 구현
3. 🔵 **REFACTOR**: 프롬프트 가이드라인 최적화

**산출물:**
- `packages/core/src/humanizer/native-translator.ts`
- `packages/core/src/humanizer/translation-patterns.ts`

**테스트 전략:**
- 단위 테스트: 패턴 감지 정확도
- 통합 테스트: 실제 번역 품질
- 커버리지 목표: 85%

---

### Phase 5: 품질 검토 시스템 (Quality Checker)
**목표**: 포스트 품질 체크리스트 및 승인 플로우
**예상 시간**: 2시간
**복잡도**: 낮음

**Tasks:**
1. 🔴 **RED**: 품질 체크리스트 생성 테스트
2. 🟢 **GREEN**: QualityChecker 클래스 구현
3. 🔵 **REFACTOR**: 점수 계산 로직 개선

**산출물:**
- `packages/core/src/humanizer/quality-checker.ts`

**테스트 전략:**
- 단위 테스트: 각 체크 항목별
- 커버리지 목표: 80%

---

### Phase 6: CLI 통합 (CLI Integration)
**목표**: --humanize 옵션 및 워크플로우 통합
**예상 시간**: 2시간
**복잡도**: 낮음

**Tasks:**
1. publish 명령어에 --humanize 옵션 추가
2. 개별 플래그 구현 (--interview, --screenshots, --native-english)
3. 검토 인터페이스 구현
4. 기존 워크플로우와 통합

**산출물:**
- `packages/cli/src/commands/publish.ts` 수정

**테스트 전략:**
- CLI 옵션 파싱 테스트
- 통합 테스트: 전체 워크플로우
- 커버리지 목표: 70%

---

### Phase 7: E2E 테스트 및 검증 (Acceptance Testing)
**목표**: 전체 파이프라인 검증 및 문서화
**예상 시간**: 2시간
**복잡도**: 중간

**Tasks:**
1. E2E 시나리오 테스트 작성
2. 성능 벤치마크 (스크린샷 생성 시간)
3. 문서화 업데이트

**테스트 시나리오:**
- 시나리오 1: 한글 포스트 → 경험담 인터뷰 → 스크린샷 → 발행
- 시나리오 2: 영문 번역 → 네이티브 스타일 → 품질 검증 → 발행
- 시나리오 3: 스크린샷 실패 → 발행 중단 확인

---

### Phase 요약

| Phase | 목표 | 시간 | 마일스톤 |
|-------|------|------|----------|
| 1 | 기반 구조 | 2h | - |
| 2 | 스크린샷 생성 | 4h | **M1**: 스크린샷 동작 |
| 3 | 경험 인터뷰 | 3h | - |
| 4 | 네이티브 번역 | 3h | **M2**: 휴머나이제이션 완료 |
| 5 | 품질 검토 | 2h | - |
| 6 | CLI 통합 | 2h | - |
| 7 | E2E 테스트 | 2h | **M3**: 전체 파이프라인 |
| **총계** | | **18h** | |

---

## 9. 설계 고려사항 (Design Considerations)

### 9.1 아키텍처
```
[마크다운 작성]
       ↓
[경험 인터뷰] ← 사용자 답변
       ↓
[경험담 삽입]
       ↓
[코드 블록 분석]
       ↓
[스크린샷 생성] → [이미지 업로드]
       ↓
[영문 번역] (영문인 경우)
       ↓
[품질 검증]
       ↓
[검토 요청] ← 사용자 승인
       ↓
[발행]
```

### 7.2 새로운 CLI 옵션
```bash
# 기본 사용 (모든 기능 활성화)
blog publish post.md --humanize

# 개별 기능 선택
blog publish post.md --interview        # 경험 인터뷰만
blog publish post.md --screenshots      # 스크린샷만
blog publish post.md --native-english   # 네이티브 영문 번역

# 검토 건너뛰기 (권장하지 않음)
blog publish post.md --humanize --skip-review
```

### 7.3 작성자 프로필 설정
```yaml
# .blog-profile.yaml
author:
  background:
    - "현직 백엔드 개발자 (5년차)"
    - "사이드 프로젝트로 AI 도구 개발 중"
    - "새로운 기술 학습을 즐김"
  tone: "친근하면서도 전문적인"
  perspective: "실무 경험 기반의 실용적 관점"
```

---

## 8. 기술 고려사항 (Technical Considerations)

### 8.1 의존성
| 패키지 | 용도 | 비고 |
|--------|------|------|
| `playwright` | 브라우저/터미널 스크린샷 | 이미 프로젝트에 설정됨 |
| `sharp` | 이미지 처리/최적화 | 리사이징, 압축 |
| `ansi-to-html` | 터미널 ANSI 코드 → HTML 변환 | 컬러 출력 지원 |

### 8.2 스크린샷 캡처 아키텍처

#### 터미널 출력 캡처 플로우
```
[코드 실행] → [stdout/stderr 캡처] → [ANSI→HTML 변환]
                                            ↓
[Playwright 스크린샷] ← [다크 테마 HTML 템플릿에 삽입]
```

#### 브라우저 캡처 플로우
```
[URL/로컬 HTML] → [Playwright 브라우저 열기] → [스크린샷 캡처]
```

### 8.3 파일 구조
```
packages/core/src/
├── humanizer/
│   ├── index.ts
│   ├── experience-interviewer.ts    # 경험 인터뷰
│   ├── experience-generator.ts      # 경험담 생성
│   ├── screenshot-generator.ts      # 스크린샷 생성
│   ├── native-translator.ts         # 네이티브 번역
│   └── quality-checker.ts           # 품질 검증
```

### 8.3 기존 코드 연동
- `packages/core/src/translator.ts`: 번역 프롬프트 강화
- `packages/cli/src/commands/publish.ts`: --humanize 옵션 추가
- `packages/core/src/markdown.ts`: 경험담/이미지 삽입 로직

---

## 11. 테스트 요구사항 (Testing Requirements)

### 11.1 TDD 워크플로우

**각 Phase에서 Red-Green-Refactor 사이클 적용:**

```
🔴 RED Phase:
   1. 실패하는 테스트 먼저 작성
   2. 올바른 이유로 실패하는지 확인
   3. 실패하는 테스트 커밋

🟢 GREEN Phase:
   1. 테스트를 통과시키는 최소 코드 작성
   2. 자주 테스트 실행 (2-5분마다)
   3. 모든 테스트 통과 시 중단

🔵 REFACTOR Phase:
   1. 테스트 통과 상태 유지하면서 코드 개선
   2. 중복 제거, 네이밍 개선
   3. 각 리팩토링 후 테스트 실행
```

### 11.2 단위 테스트

| 모듈 | 테스트 케이스 | 커버리지 목표 |
|------|--------------|-------------|
| experience-interviewer | 질문 생성, 카테고리 분류 | 85% |
| experience-generator | 답변→문단 변환, 삽입 위치 결정 | 85% |
| screenshot-generator | 터미널/브라우저/API 캡처 | 90% |
| native-translator | 번역 품질 검증, 패턴 감지 | 85% |
| quality-checker | 체크리스트 생성, 점수 계산 | 80% |

**테스트 패턴 (AAA):**
```typescript
describe('ScreenshotGenerator', () => {
  it('should capture terminal output with dark theme', async () => {
    // Arrange
    const config: TerminalCapture = {
      command: 'echo "Hello World"',
      workingDir: '/tmp',
      timeout: 5000,
      theme: 'dark',
      fontSize: 14
    };

    // Act
    const result = await generator.captureTerminal(config);

    // Assert
    expect(result.success).toBe(true);
    expect(result.imagePath).toMatch(/\.png$/);
    expect(fs.existsSync(result.imagePath)).toBe(true);
  });
});
```

### 11.3 통합 테스트

1. **전체 휴머나이제이션 파이프라인 E2E 테스트**
   - 입력: 샘플 마크다운 파일
   - 출력: 경험담 + 스크린샷 + 품질 검증 완료된 포스트

2. **WordPress 이미지 업로드 통합 테스트**
   - Mock WordPress API 사용
   - 이미지 업로드 → URL 반환 → 마크다운 삽입

3. **CLI 옵션 조합 테스트**
   - `--humanize` 단독
   - `--interview --screenshots` 조합
   - `--skip-review` 동작

### 11.4 시스템 테스트

| 시나리오 | 입력 | 예상 결과 |
|---------|------|----------|
| 한글 포스트 전체 플로우 | 마크다운 + 사용자 답변 | 경험담 삽입, 스크린샷 2개 이상, 발행 |
| 영문 번역 플로우 | 한글 포스트 | 네이티브 스타일, 품질 점수 80+ |
| 스크린샷 실패 | 잘못된 명령어 | 발행 중단, 에러 메시지 |
| 품질 검증 실패 | 경험담 없는 포스트 | 검토 요청, 발행 차단 |

### 11.5 품질 게이트 (Quality Gates)

**각 Phase 완료 조건:**

| 체크 항목 | 기준 |
|----------|------|
| ✅ 모든 테스트 통과 | 100% |
| ✅ 커버리지 목표 달성 | Phase별 상이 (80-90%) |
| ✅ TypeScript 타입 체크 | 에러 0개 |
| ✅ ESLint | 에러 0개, 경고 최소화 |
| ✅ 빌드 성공 | `pnpm build` 통과 |

**최종 릴리스 조건:**
- 전체 커버리지: ≥80%
- E2E 테스트 통과: 100%
- 성능 기준 충족: 스크린샷 생성 30초 이내

### 11.6 테스트 데이터 / Fixtures

```
packages/core/src/humanizer/__fixtures__/
├── sample-posts/
│   ├── mcp-tutorial.md        # 코드 블록 포함 포스트
│   └── rag-introduction.md    # 설명 위주 포스트
├── mock-responses/
│   ├── interview-answers.json # 인터뷰 답변 샘플
│   └── wordpress-media.json   # WordPress API 응답
└── expected-outputs/
    ├── terminal-screenshot.png
    └── browser-screenshot.png
```

---

## 12. 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 애드센스 승인 | 승인 | 구글 애드센스 대시보드 |
| 포스트당 이미지 수 | 2개 이상 | 자동 집계 |
| 경험담 포함 비율 | 100% | 자동 집계 |
| 영문 번역 품질 점수 | 80점 이상 | 품질 검증 시스템 |
| 검토 통과율 | 90% 이상 | CLI 로그 |

---

## 13. 위험 요소 및 완화 전략 (Risks & Mitigations)

| 위험 요소 | 확률 | 영향 | 완화 전략 |
|----------|------|------|----------|
| 코드 실행 환경 복잡성 | 중 | 높음 | 지원 환경 명확히 제한 (Node.js, Python, Shell만) |
| Playwright 브라우저 의존성 | 낮음 | 중간 | 브라우저 설치 스크립트 제공, 에러 메시지 명확화 |
| 네이티브 번역 품질 주관성 | 중 | 중간 | 규칙 기반 검증 + 사용자 검토 단계 필수 |
| 스크린샷 생성 시간 초과 | 낮음 | 중간 | 타임아웃 설정, 병렬 처리 검토 |
| 경험담 삽입 위치 부정확 | 중 | 낮음 | 섹션 헤딩 기반 삽입, 사용자 검토 가능 |

---

## 14. 결정된 사항 (Resolved Questions)

| 질문 | 결정 | 상세 |
|------|------|------|
| 터미널 스크린샷 테마 | **다크 테마** | 검은 배경 + 밝은 글자 (개발자 친화적) |
| 경험담 문단 길이 | **중간 (3-4문장)** | 적당한 맥락과 함께 설명 |
| 영문 번역 검수 | **네이티브 검토 요청** | Claude에게 네이티브 관점으로 검토 요청 |
| 이미지 최대 크기 | **1200px 너비** | 가독성과 용량 균형 |
| 스크린샷 실패 처리 | **발행 중단** | 스크린샷 없이는 발행하지 않음 |

---

## 15. 참고 자료 (References)

### 웹 리서치 결과
- [Google AdSense AI Content Policy](https://support.google.com/adsense/answer/48182?hl=en) - AI 콘텐츠 자체는 문제 없음
- [AdSense Approval Requirements 2025](https://ranklytics.ai/can-i-get-adsense-approval-with-ai-content/) - 인간적 터치가 핵심
- [애드센스 거절 대처법](https://adsensefarm.kr/adsense-reject-approval-how-to-deal-with-it/) - 한국어 가이드

### 현재 블로그 분석
- **URL**: https://beomanro.com
- **플랫폼**: WordPress + Avada 테마
- **콘텐츠**: 기술 튜토리얼 시리즈 (MCP, Agent SDK, RAG)
- **필수 페이지**: About, Privacy Policy, Contact - 모두 존재

---

## 16. 버전 이력 (Version History)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2025-12-24 | Claude | 초기 PRD 작성 |
| 2.0 | 2025-12-30 | Claude | PRD 개선 - 복잡도 분석, Phase 분해, 아키텍처 결정사항, TDD 전략, 품질 게이트, 위험 요소 추가. 기술 의존성 수정 (터미널+브라우저 캡처 지원) |

---

**문서 상태**: ✅ Ready - 모든 질문 해결됨, 구현 준비 완료

## 다음 단계

1. PLAN.md 검토
2. 필요시 수정
3. 구현 시작: `/implement` 또는 Phase 1부터 순차 구현
