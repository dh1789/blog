# PRD: WordPress 포스트 생성 기능 개선

**문서 번호**: 0014
**작성일**: 2024-12-05
**상태**: 초안
**담당**: 개발팀

---

## 1. 개요 (Introduction/Overview)

### 1.1 배경

현재 블로그 CLI 도구(`blog publish`)는 마크다운 파일을 WordPress 포스트로 변환하여 발행하는 기능을 제공합니다. 그러나 시리즈 포스트 작성, 다국어(한영) 포스트 관리, 기존 포스트 업데이트 등의 시나리오에서 여러 제한사항과 불편함이 존재합니다.

### 1.2 문제점

1. **시리즈 포스트 관리 어려움**
   - 시리즈 전체 계획 문서가 있어도 자동으로 참조되지 않음
   - 아직 작성되지 않은 포스트의 링크를 미리 설정할 수 없음
   - 시리즈 네비게이션 링크가 수동 관리 필요

2. **영문 포스트 링크 문제**
   - 번역 시 한글 포스트 링크가 그대로 유지되어 언어 불일치 발생
   - 번역 출처가 명시적으로 표시되지 않음
   - GitHub 저장소 링크 삽입이 수동

3. **드래프트/퍼블리시 상태 관리 부재**
   - 기존 드래프트 포스트가 있어도 새 포스트가 중복 생성됨
   - 상태 변경을 위한 별도 CLI 명령어 없음

4. **포스트 업데이트 기능 부재**
   - 이미 발행된 포스트 수정 시 명시적 업데이트 방법 없음
   - 변경 사항 추적 및 적용이 어려움

### 1.3 해결 목표

이 기능 개선을 통해 시리즈 포스트 작성, 다국어 포스트 관리, 포스트 상태 관리를 효율화하여 콘텐츠 작성 생산성을 향상시킵니다.

---

## 2. 목표 (Goals)

### 2.1 정량적 목표

| 목표 | 측정 기준 | 목표치 |
|------|----------|--------|
| 시리즈 포스트 작성 시간 단축 | 5편 시리즈 작성 소요 시간 | 30% 감소 |
| 링크 오류 발생률 감소 | 발행 후 깨진 링크 수 | 0건 |
| 중복 포스트 생성 방지 | 드래프트 중복 생성 건수 | 0건 |
| 포스트 업데이트 효율성 | 업데이트 작업 소요 시간 | 50% 감소 |

### 2.2 정성적 목표

- 시리즈 포스트 작성 워크플로우 간소화
- 다국어 포스트 간 일관성 유지
- 포스트 상태 관리의 명확성 향상
- 개발자 경험(DX) 개선

---

## 3. 사용자 스토리 (User Stories)

### US-01: 시리즈 문서 자동 참조

**As a** 블로그 작성자
**I want to** 시리즈 포스트 작성 시 관련 계획 문서가 자동으로 참조되기를
**So that** 일관된 시리즈 구조와 링크를 유지할 수 있습니다.

**인수 조건**:
- docs/ 폴더에서 시리즈명과 매칭되는 문서를 자동 감지
- 감지된 문서의 URL 정보를 포스트 생성 시 활용
- 참조된 문서 정보가 로그에 표시됨

### US-02: 미작성 포스트 링크 사전 설정

**As a** 시리즈 포스트 작성자
**I want to** 아직 작성되지 않은 포스트의 링크도 미리 설정하고
**So that** 시리즈 완료 후 모든 링크가 정상 동작합니다.

**인수 조건**:
- 시리즈 문서에 정의된 모든 포스트 링크가 자동 삽입
- 미작성 포스트 링크에는 시리즈 네비게이션 섹션 아래에 알림 문구 표시
- 알림 문구 예시: `> 일부 링크는 아직 작성 중인 포스트입니다. 시리즈 완료 후 정상 동작합니다.`

### US-03: 영문 포스트 링크 자동 변환

**As a** 다국어 블로그 운영자
**I want to** 영문 포스트 생성 시 시리즈 문서의 영문 링크가 자동 적용되기를
**So that** 언어별로 일관된 내부 링크를 유지할 수 있습니다.

**인수 조건**:
- 시리즈 문서에서 한글/영문 URL이 모두 정의되어 있음
- 영문 포스트 생성 시 시리즈 문서의 영문 URL 섹션 참조
- 한글 링크(`/ko/...`)가 영문 링크(`/en/...-en`)로 자동 변환

### US-04: 번역 출처 표시

**As a** 영문 블로그 독자
**I want to** 번역된 포스트의 원본 출처를 알 수 있기를
**So that** 필요시 원문을 참조할 수 있습니다.

**인수 조건**:
- 영문 포스트 상단에 번역 출처 배너 표시
- 배너에 원본 한글 포스트 링크 포함
- 배너 형식: `> **🌐 Translation**: Translated from [Korean](/ko/{slug}).`

### US-05: GitHub 저장소 링크 자동 삽입

**As a** 기술 블로그 작성자
**I want to** 관련 GitHub 저장소 링크가 TL;DR 섹션에 자동 삽입되기를
**So that** 독자가 전체 코드를 쉽게 찾을 수 있습니다.

**인수 조건**:
- frontmatter의 `github_url` 필드 또는 시리즈 문서의 GitHub 링크 참조
- TL;DR 섹션에 "**전체 코드**: [저장소명](URL)" 형식으로 삽입
- GitHub 링크가 없는 경우 삽입하지 않음

### US-06: 드래프트 포스트 중복 방지

**As a** 블로그 관리자
**I want to** 동일한 slug의 드래프트 포스트가 이미 있으면 중복 생성되지 않기를
**So that** WordPress에 불필요한 포스트가 쌓이지 않습니다.

**인수 조건**:
- `blog publish` 실행 시 동일 slug의 기존 포스트 검색
- 드래프트 상태의 동일 slug 포스트 존재 시 업데이트 진행
- 퍼블리시 상태의 동일 slug 포스트 존재 시 경고 및 확인 요청

### US-07: 포스트 상태 변경 CLI

**As a** 블로그 관리자
**I want to** CLI 명령어로 포스트 상태를 변경할 수 있기를
**So that** WordPress 관리자에 접속하지 않고도 상태 관리가 가능합니다.

**인수 조건**:
- `blog status <slug> --publish` 명령어로 드래프트 → 퍼블리시
- `blog status <slug> --draft` 명령어로 퍼블리시 → 드래프트
- 상태 변경 성공/실패 결과 출력

### US-08: 포스트 업데이트

**As a** 블로그 작성자
**I want to** 마크다운 파일 수정 후 기존 포스트를 업데이트할 수 있기를
**So that** 발행된 포스트의 내용을 쉽게 수정할 수 있습니다.

**인수 조건**:
- `blog publish` 실행 시 기존 포스트 감지되면 전체 덮어쓰기 업데이트
- 업데이트 시 제목, 본문, 카테고리, 태그, excerpt 모두 갱신
- 업데이트 완료 후 변경된 포스트 URL 출력

---

## 4. 기능 요구사항 (Functional Requirements)

### FR-01: 시리즈 문서 자동 감지

**기능 설명**: 마크다운 파일의 frontmatter 또는 파일명에서 시리즈 정보를 추출하고, docs/ 폴더에서 매칭되는 계획 문서를 자동으로 찾아 참조합니다.

**상세 요구사항**:

1. **시리즈 감지 로직**
   ```typescript
   // 파일명에서 시리즈 추출: 2025-12-05-mcp-day1-xxx.md → "mcp"
   // frontmatter의 categories에서 시리즈 추출

   interface SeriesInfo {
     name: string;           // 시리즈명 (예: "mcp", "claude-agent-sdk")
     dayNumber: number;      // Day 번호 (예: 1, 2, 3)
     docPath: string | null; // 매칭된 문서 경로
   }
   ```

2. **문서 매칭 규칙**
   - `docs/{series-name}-series-plan.md` 형식 우선
   - `docs/{series-name}-*.md` 형식 차선
   - 매칭되는 문서가 여러 개면 가장 최근 수정된 파일 사용

3. **참조 데이터 추출**
   ```typescript
   interface SeriesDocument {
     koreanUrls: Map<number, string>;  // Day → 한글 URL
     englishUrls: Map<number, string>; // Day → 영문 URL
     githubUrl: string | null;         // GitHub 저장소 URL
     totalDays: number;                // 전체 Day 수
   }
   ```

### FR-02: 시리즈 네비게이션 자동 생성

**기능 설명**: 시리즈 문서에서 추출한 URL 정보를 기반으로 시리즈 네비게이션 섹션을 자동 생성합니다.

**상세 요구사항**:

1. **네비게이션 위치**: 포스트 본문 최하단 (시리즈 네비게이션 제목 아래)

2. **네비게이션 형식** (한글):
   ```markdown
   ---

   ## 시리즈 네비게이션

   - [Day 1: 제목](/ko/slug-day1)
   - [Day 2: 제목](/ko/slug-day2)
   - **Day 3: 제목** (현재 글)
   - [Day 4: 제목](/ko/slug-day4)
   - [Day 5: 제목](/ko/slug-day5)

   > 일부 링크는 아직 작성 중인 포스트입니다. 시리즈 완료 후 정상 동작합니다.
   ```

3. **미작성 포스트 표시**
   - WordPress에 해당 slug의 포스트가 없으면 "미작성"으로 판단
   - 미작성 포스트가 1개 이상이면 네비게이션 아래에 알림 문구 추가

### FR-03: 영문 링크 자동 변환

**기능 설명**: 영문 포스트 생성 시 시리즈 문서의 영문 URL 섹션을 참조하여 링크를 자동 변환합니다.

**상세 요구사항**:

1. **변환 조건**
   - 포스트 language가 "en"인 경우
   - 시리즈 문서에 영문 URL이 정의되어 있는 경우

2. **변환 대상**
   - 시리즈 네비게이션의 모든 내부 링크
   - 본문 내 동일 시리즈 포스트 참조 링크

3. **변환 로직**
   ```typescript
   function convertToEnglishUrl(koreanUrl: string, seriesDoc: SeriesDocument): string {
     // /ko/mcp-day1-xxx → /en/mcp-day1-xxx-en
     const dayMatch = koreanUrl.match(/day(\d+)/);
     if (dayMatch) {
       const day = parseInt(dayMatch[1]);
       return seriesDoc.englishUrls.get(day) || koreanUrl;
     }
     return koreanUrl;
   }
   ```

### FR-04: 번역 출처 배너 삽입

**기능 설명**: 영문 포스트 상단에 번역 출처를 표시하는 배너를 자동 삽입합니다.

**상세 요구사항**:

1. **삽입 위치**: TL;DR 섹션 바로 위 또는 포스트 최상단

2. **배너 형식**:
   ```markdown
   > **🌐 Translation**: Translated from [Korean](/ko/{korean-slug}).
   ```

3. **조건**
   - language가 "en"인 경우에만 삽입
   - 이미 번역 배너가 있으면 중복 삽입하지 않음

### FR-05: GitHub 링크 TL;DR 삽입

**기능 설명**: GitHub 저장소 링크를 TL;DR 섹션에 자동 삽입합니다.

**상세 요구사항**:

1. **링크 소스 우선순위**
   - frontmatter의 `github_url` 필드
   - 시리즈 문서의 GitHub 링크
   - 없으면 삽입하지 않음

2. **삽입 형식**:
   ```markdown
   **전체 코드**: [my-first-mcp](https://github.com/dh1789/my-first-mcp)
   ```

3. **삽입 위치**: TL;DR 섹션 마지막 항목으로 추가

### FR-06: Slug 기반 중복 감지

**기능 설명**: 포스트 발행 전 동일 slug의 기존 포스트를 검색하여 중복 생성을 방지합니다.

**상세 요구사항**:

1. **검색 API**
   ```typescript
   interface ExistingPost {
     id: number;
     slug: string;
     status: 'publish' | 'draft' | 'pending';
     language: string;
   }

   async function findExistingPost(slug: string, language: string): Promise<ExistingPost | null>
   ```

2. **동작 정의**
   | 기존 포스트 상태 | 동작 |
   |-----------------|------|
   | 없음 | 새 포스트 생성 |
   | draft | 기존 포스트 업데이트 |
   | publish | 경고 출력 후 업데이트 확인 요청 |

### FR-07: 포스트 상태 변경 CLI

**기능 설명**: CLI 명령어로 WordPress 포스트의 상태를 변경합니다.

**상세 요구사항**:

1. **명령어 형식**
   ```bash
   blog status <slug> --publish   # 드래프트 → 퍼블리시
   blog status <slug> --draft     # 퍼블리시 → 드래프트
   blog status <slug>             # 현재 상태 조회
   ```

2. **출력 예시**
   ```
   ✔ 포스트 상태 변경 완료
     제목: MCP Day 1: 개념과 첫 서버
     이전 상태: draft
     현재 상태: publish
     URL: https://blog.example.com/ko/mcp-day1-xxx
   ```

### FR-08: 포스트 전체 업데이트

**기능 설명**: 마크다운 파일의 전체 내용으로 기존 WordPress 포스트를 덮어씁니다.

**상세 요구사항**:

1. **업데이트 대상 필드**
   - title (제목)
   - content (본문 HTML)
   - excerpt (요약)
   - categories (카테고리)
   - tags (태그)
   - featured_media (대표 이미지) - 있는 경우

2. **업데이트 워크플로우**
   ```
   1. slug로 기존 포스트 검색
   2. 기존 포스트 존재 확인
   3. 마크다운 파싱 및 HTML 변환
   4. WordPress API PUT 요청으로 업데이트
   5. 결과 출력
   ```

3. **변경 로그 출력**
   ```
   ✔ 포스트 업데이트 완료 (ID: 253)
     제목: MCP Day 5: 고급 패턴과 최적화
     상태: publish
     URL: https://blog.example.com/ko/mcp-day5-xxx
   ```

---

## 5. 비목표 (Non-Goals / Out of Scope)

이 PRD에서 다루지 **않는** 항목:

1. **부분 업데이트**: 변경된 필드만 선택적으로 업데이트하는 기능 (전체 덮어쓰기만 지원)
2. **버전 관리**: 포스트의 이전 버전 보관 및 롤백 기능
3. **자동 번역**: 한글 → 영문 자동 번역 기능 (별도 기능으로 이미 존재)
4. **스케줄 발행**: 특정 시간에 자동 발행하는 기능
5. **일괄 처리**: 여러 포스트를 한 번에 처리하는 배치 기능
6. **WordPress 외 플랫폼**: Medium, Notion 등 다른 플랫폼 지원

---

## 6. 설계 고려사항 (Design Considerations)

### 6.1 시리즈 문서 형식

시리즈 계획 문서는 다음 형식을 권장합니다:

```markdown
# {시리즈명} 시리즈 계획 문서

## 📌 핵심 참고 링크
| 리소스 | URL |
|--------|-----|
| GitHub Repository | https://github.com/xxx/yyy |

## 🔗 URL 링크 정의

### 한국어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `series-day1-xxx` | `/ko/series-day1-xxx` |

### 영어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `series-day1-xxx-en` | `/en/series-day1-xxx-en` |
```

### 6.2 CLI 옵션 확장

```bash
blog publish <file> [options]
  --no-translate      번역 없이 단일 언어만 발행
  --force             기존 포스트 경고 없이 덮어쓰기
  --dry-run           실제 발행 없이 시뮬레이션

blog status <slug> [options]
  --publish           상태를 publish로 변경
  --draft             상태를 draft로 변경
  --lang <language>   언어 지정 (기본: ko)
```

### 6.3 에러 처리

| 상황 | 에러 메시지 | 동작 |
|------|------------|------|
| 시리즈 문서 없음 | "시리즈 문서를 찾을 수 없습니다. 기본 설정으로 진행합니다." | 경고 후 계속 |
| slug 중복 (publish) | "동일 slug의 발행된 포스트가 있습니다. 업데이트하시겠습니까? (y/n)" | 확인 요청 |
| API 실패 | "WordPress API 오류: {상세 메시지}" | 중단 |

---

## 7. 기술 고려사항 (Technical Considerations)

### 7.1 파일 구조 변경

```
packages/core/src/
├── index.ts
├── wordpress.ts          # 기존: WordPress API 클라이언트
├── wordpress-status.ts   # 신규: 상태 변경 기능
├── series-detector.ts    # 신규: 시리즈 문서 감지
├── series-navigation.ts  # 신규: 네비게이션 생성
├── link-converter.ts     # 신규: 링크 변환
└── markdown.ts           # 기존: 마크다운 파싱

packages/cli/src/commands/
├── publish.ts            # 수정: 시리즈/업데이트 로직 추가
└── status.ts             # 신규: 상태 변경 명령어
```

### 7.2 의존성

- 기존 의존성 활용 (추가 패키지 불필요)
  - `wpapi`: WordPress REST API
  - `gray-matter`: frontmatter 파싱
  - `commander`: CLI 프레임워크

### 7.3 WordPress API 엔드포인트

```typescript
// 포스트 검색 (slug 기준)
GET /wp-json/wp/v2/posts?slug={slug}&status=any

// 포스트 업데이트
PUT /wp-json/wp/v2/posts/{id}

// 포스트 상태 변경
PATCH /wp-json/wp/v2/posts/{id}
{ "status": "publish" | "draft" }
```

---

## 8. 테스트 요구사항 (Testing Requirements)

### 8.1 단위 테스트 (Unit Testing)

각 구현 클래스 및 함수에 대해 최소 3가지 테스트 케이스 포함:

#### 8.1.1 series-detector.ts 테스트

```typescript
describe('SeriesDetector', () => {
  // Happy Path
  it('파일명에서 시리즈명과 Day 번호를 정확히 추출한다', () => {
    const result = detectSeries('2025-12-05-mcp-day1-introduction.md');
    expect(result.name).toBe('mcp');
    expect(result.dayNumber).toBe(1);
  });

  // Boundary Condition
  it('시리즈 형식이 아닌 파일명은 null을 반환한다', () => {
    const result = detectSeries('2025-12-05-standalone-post.md');
    expect(result).toBeNull();
  });

  // Exception Case
  it('잘못된 파일 경로에 대해 적절한 에러를 던진다', () => {
    expect(() => detectSeries('')).toThrow('Invalid file path');
  });
});
```

#### 8.1.2 link-converter.ts 테스트

```typescript
describe('LinkConverter', () => {
  // Happy Path
  it('한글 URL을 영문 URL로 정확히 변환한다', () => {
    const seriesDoc = { englishUrls: new Map([[1, '/en/mcp-day1-en']]) };
    const result = convertToEnglishUrl('/ko/mcp-day1', seriesDoc);
    expect(result).toBe('/en/mcp-day1-en');
  });

  // Boundary Condition
  it('매칭되는 영문 URL이 없으면 원본을 반환한다', () => {
    const seriesDoc = { englishUrls: new Map() };
    const result = convertToEnglishUrl('/ko/mcp-day1', seriesDoc);
    expect(result).toBe('/ko/mcp-day1');
  });

  // Side Effect
  it('원본 URL 문자열을 변경하지 않는다', () => {
    const originalUrl = '/ko/mcp-day1';
    convertToEnglishUrl(originalUrl, mockSeriesDoc);
    expect(originalUrl).toBe('/ko/mcp-day1');
  });
});
```

#### 8.1.3 wordpress-status.ts 테스트

```typescript
describe('WordPressStatus', () => {
  // Happy Path
  it('드래프트 포스트를 퍼블리시로 변경한다', async () => {
    const result = await changeStatus('test-slug', 'publish');
    expect(result.status).toBe('publish');
  });

  // Boundary Condition
  it('이미 같은 상태인 경우 변경 없이 성공을 반환한다', async () => {
    const result = await changeStatus('published-slug', 'publish');
    expect(result.changed).toBe(false);
  });

  // Exception Case
  it('존재하지 않는 slug에 대해 NotFoundError를 던진다', async () => {
    await expect(changeStatus('nonexistent', 'publish'))
      .rejects.toThrow('Post not found');
  });
});
```

### 8.2 시스템 테스트 (System Testing)

#### 시나리오 1: 시리즈 포스트 신규 발행

```
Given: MCP 시리즈 계획 문서가 docs/mcp-series-plan.md에 존재
And: Day 3 마크다운 파일이 작성됨
When: blog publish content/posts/ko/2025-12-05-mcp-day3-xxx.md 실행
Then:
  - 시리즈 문서가 자동 감지됨
  - 시리즈 네비게이션이 자동 생성됨
  - 미작성 포스트(Day 4, 5)에 대한 알림이 표시됨
  - WordPress에 포스트가 생성됨
```

#### 시나리오 2: 기존 드래프트 업데이트 및 발행

```
Given: slug "mcp-day1-xxx"의 드래프트 포스트가 WordPress에 존재
And: 마크다운 파일이 수정됨
When: blog publish content/posts/ko/2025-12-05-mcp-day1-xxx.md 실행
Then:
  - 기존 드래프트 포스트가 감지됨
  - 전체 내용이 업데이트됨
  - 상태가 publish로 변경됨
  - 업데이트된 URL이 출력됨
```

---

## 9. 성공 지표 (Success Metrics)

| 지표 | 측정 방법 | 목표 |
|------|----------|------|
| 시리즈 작성 효율성 | 5편 시리즈 완성 소요 시간 | 기존 대비 30% 단축 |
| 링크 정확도 | 발행 후 404 에러 발생 건수 | 0건 |
| 중복 포스트 | WordPress 드래프트 중복 수 | 0건 |
| 사용자 만족도 | CLI 사용 피드백 | 긍정 평가 80% 이상 |

---

## 10. 열린 질문 (Open Questions)

1. **시리즈 문서 형식 표준화**: 시리즈 문서의 필수 섹션과 형식을 더 엄격하게 정의해야 할까요?

2. **Polylang 연동**: 상태 변경 시 Polylang 언어 연결도 함께 처리해야 할까요?

3. **롤백 기능**: 업데이트 실패 시 이전 상태로 롤백하는 기능이 필요할까요?

4. **알림 시스템**: 포스트 상태 변경 시 Slack 등으로 알림을 보내는 기능이 필요할까요?

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 0.1 | 2024-12-05 | Claude | 초안 작성 |
