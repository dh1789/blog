# 프로젝트 이슈 추적 (Issues Tracking)

**최종 업데이트**: 2025-11-04
**프로젝트**: WordPress Content Automation CLI

---

## 📊 이슈 분류 체계

### 우선순위 레벨
- 🔴 **Critical**: 즉시 해결 필요 (프로젝트 진행 불가)
- 🟡 **Medium**: 개선 필요 (사용성/효율성 저하)
- 🟢 **Low**: 추후 개선 (Nice to have)

### 상태
- ❌ **미해결** (Open)
- ⚠️ **개선 중** (In Progress)
- ✅ **해결 완료** (Resolved)
- 🚫 **해결 불가** (Won't Fix)

---

## 📋 이슈 목록

### 워크플로우 이슈 (Workflow Issues)

#### 🟡 [WF-001] Polylang 언어 연결 자동화 부재

**상태**: ✅ 해결 완료
**우선순위**: Medium
**발견일**: 2025-11-03
**해결일**: 2025-11-04
**영향도**: 사용성 개선, 자동화 구현

**문제 설명**:
- 한국어 포스트와 영어 포스트를 발행한 후 WordPress 관리자에서 수동으로 연결해야 함
- Polylang UI가 직관적이지 않아 연결 과정이 번거로움
- 실수로 잘못된 포스트를 연결할 위험성 존재

**이전 워크플로우**:
```bash
# 1. 한글 발행
blog publish content/posts/ko/my-post.md  # → Post ID: 100

# 2. 영문 발행
blog publish content/posts/en/my-post.md  # → Post ID: 101

# 3. 수동 연결 (WordPress 관리자)
- Posts → All Posts
- 한글 포스트 편집
- Polylang 메타박스에서 영어 포스트 선택
- 저장
```

**구현된 솔루션**:

1. **옵션 A**: `blog link-translations` 명령어 ✅ 구현 완료
   ```bash
   blog link-translations --ko 100 --en 101
   ```
   - 독립 명령어로 언제든지 수동 연결 가능
   - 상세한 에러 처리 및 사용자 피드백
   - 파일: `packages/cli/src/commands/link-translations.ts`

2. **옵션 B**: `publish` 명령어에 자동 연결 통합 ✅ 구현 완료
   ```bash
   blog publish content/posts/en/my-post.md --link-to 100
   ```
   - 영문 발행과 동시에 자동 연결
   - 연결 실패 시에도 포스트 발행은 성공 처리
   - 실패 시 수동 연결 방법 안내
   - 파일: `packages/cli/src/commands/publish.ts`

3. **핵심 메서드**: `WordPressClient.linkTranslations()` ✅ 구현 완료
   - WordPress REST API로 `_pll_translations` meta 필드 업데이트
   - 양방향 연결 (한국어 ↔ 영어)
   - JSON 형식: `{"ko": koPostId, "en": enPostId}`
   - 파일: `packages/core/src/wordpress.ts`

**기술 조사 결과**:
- [x] Polylang REST API 확인: WordPress REST API로 meta 필드 접근 가능
- [x] Meta 필드명: `_pll_translations` (JSON 직렬화 객체)
- [x] 양방향 연결 메커니즘 확인 및 구현

**구현 시간**: 4시간 (예상 2-3시간보다 1시간 추가)
**참고 문서**: `POLYLANG-AUTO-LINK-SPEC.md`, `tasks/tasks-polylang-auto-link-spec.md`

---

#### 🟡 [WF-002] 검증 단계 부재 - 한글 검증 전 영문 번역 진행

**상태**: ⚠️ 개선 필요
**우선순위**: Medium
**발견일**: 2025-11-03
**영향도**: 품질 저하, 재작업 증가

**문제 설명**:
- 현재는 한글 포스트 검증 없이 바로 영문 번역 진행
- 한글에 오류가 있으면 영문도 오류를 상속
- 발행 후 수정 시 한영 모두 재작업 필요

**현재 워크플로우** (문제):
```
1. 한글 작성
2. 영문 번역 생성  ← 한글 검증 없이 진행
3. 한글 발행
4. 영문 발행
5. 오류 발견 → 한영 모두 수정
```

**권장 워크플로우**:
```
1. 한글 작성
2. 한글 로컬 검증 (SEO, 문법, 구조)
3. 한글 발행
4. 발행 결과 확인 및 최종 검토
5. ✅ 검증 완료 후 → 영문 번역 생성
6. 영문 로컬 검증
7. 영문 발행
8. 자동 언어 연결
```

**해결 방안**:
- WORKFLOW-GUIDE.md 작성 (권장 프로세스 문서화)
- 단계별 체크리스트 제공
- 검증 명령어 활용 가이드
  - `blog analyze-seo <file>`: SEO 검증
  - `blog preview <file>`: 로컬 프리뷰

**구현 상태**: ✅ 문서화 완료 (이 파일과 WORKFLOW-GUIDE.md)
**참고 문서**: `WORKFLOW-GUIDE.md`, `TRANSLATION-PATTERNS.md`

---

#### 🟢 [WF-003] SEO 검증이 발행 후에만 가능

**상태**: ⚠️ 개선 중
**우선순위**: Low
**발견일**: 2025-11-03

**문제 설명**:
- 현재 SEO 점수는 WordPress 발행 시에만 표시됨
- 로컬에서 미리 확인하고 수정할 수 없음

**해결 방안**:
- `blog analyze-seo` 명령어 활용 (이미 구현됨)
- 발행 전 SEO 검증 권장

**구현 상태**: ✅ 명령어 존재, 문서화 필요
**사용법**:
```bash
blog analyze-seo content/posts/ko/my-post.md --verbose
```

---

### 기술적 이슈 (Technical Issues)

#### 🟢 [TECH-001] Excerpt 300자 제한 오류

**상태**: ✅ 해결 완료
**우선순위**: Low (해결됨)
**발견일**: 2025-11-03
**해결일**: 2025-11-03

**문제 설명**:
- WordPress REST API와 Zod 스키마가 excerpt를 최대 300자로 제한
- 초기 번역에서 352자로 초과하여 발행 실패

**발견된 오류**:
```
✖ Frontmatter 검증 실패
검증 오류:
  - excerpt: Excerpt must be 300 characters or less
```

**해결 방법**:
- `optimizeExcerpt()` 함수 구현 (packages/core/src/translator.ts:110)
- 불필요한 단어 자동 제거 ("Learn how to", "modern", "various" 등)
- 여전히 길면 마지막 문장 제거
- 최종적으로 300자로 자동 축소

**코드 참고**:
```typescript
// packages/core/src/translator.ts
function optimizeExcerpt(metadata: PostMetadata): void {
  if (!metadata.excerpt || metadata.excerpt.length <= 300) return;

  const fillerWords = ['Learn how to', 'modern', 'various', 'multiple', 'many'];
  let optimized = metadata.excerpt;

  for (const filler of fillerWords) {
    if (optimized.length <= 300) break;
    optimized = optimized.replace(new RegExp(filler, 'gi'), '').replace(/\s+/g, ' ').trim();
  }

  if (optimized.length > 300) {
    const sentences = optimized.split('. ');
    optimized = sentences.slice(0, -1).join('. ') + '.';
  }

  metadata.excerpt = optimized.substring(0, 300).trim();
}
```

**테스트 결과**: ✅ 모든 포스트 발행 성공

---

#### 🟡 [TECH-002] SEO 키워드 밀도 최적화 부족

**상태**: ⚠️ 개선 필요
**우선순위**: Medium
**발견일**: 2025-11-03
**영향도**: SEO 점수 저하 (42-75점)

**문제 설명**:
- 대부분의 키워드 밀도가 권장 범위(0.5-2.5%) 미달
- 특히 태그로 지정한 키워드가 본문에 충분히 반영되지 않음

**발견된 패턴**:
```
Node.js CLI post (SEO: 72/100):
  - ❌ CLI: 2.99% (권장 최대 2.5% 초과)
  - ⚠️ Automation: 0.09% (권장 최소 0.5% 미달)

WordPress API post (SEO: 50/100):
  - ⚠️ Node.js: 0.36% (0.5% 미달)
  - ⚠️ TypeScript: 0.39% (0.5% 미달)
  - ⚠️ Content Automation: 0.04% (0.5% 미달)

AI Pipeline post (SEO: 42/100):
  - ⚠️ WordPress Automation: 0% (0.5% 미달)
  - ⚠️ Marketing Automation: 0.09% (0.5% 미달)
```

**원인 분석**:
1. 번역 시 키워드 밀도를 고려하지 않음
2. 자연스러운 표현 우선으로 키워드 희석
3. 자동 키워드 주입 로직 부재

**해결 방안**:
1. **단기** (수동):
   - 기존 포스트 수동 수정하여 키워드 추가
   - 자연스러운 맥락에 키워드 통합

2. **중기** (자동화):
   - 번역 시 키워드 밀도 자동 분석
   - 부족한 키워드 자동 주입 (자연스러운 위치)
   - 초과 키워드 자동 축소

**구현 계획**:
```typescript
// packages/core/src/translator.ts
async function optimizeKeywordDensity(
  content: string,
  metadata: PostMetadata
): Promise<string> {
  const density = calculateKeywordDensity(content, metadata.tags || []);

  // 0.5% 미만인 키워드 식별
  const underused = density.filter(d => d.density < 0.5);

  // 각 키워드를 자연스러운 위치에 삽입
  let optimized = content;
  for (const keyword of underused) {
    optimized = injectKeyword(optimized, keyword.keyword, 0.5);
  }

  return optimized;
}
```

**예상 구현 시간**: 3-4시간
**우선순위**: Medium (SEO에 직접 영향)

**참고 파일**:
- `packages/core/src/translator.ts`
- `packages/core/src/seo.ts`

---

#### 🟢 [TECH-003] 번역 디스클레이머 수동 추가

**상태**: ✅ 해결 완료
**우선순위**: Low (해결됨)
**발견일**: 2025-11-03
**해결일**: 2025-11-03

**문제 설명**:
- 초기에는 번역 디스클레이머를 수동으로 추가해야 했음

**해결 방법**:
- `generateTranslationDisclaimer()` 함수 구현
- 번역 시 자동으로 디스클레이머 삽입
- 형식: `> **🌐 Translation**: Translated from [Korean](/ko/원본-슬러그).`

**코드 참고**:
```typescript
// packages/core/src/translator.ts
function generateTranslationDisclaimer(
  originalSlug: string,
  sourceLang: string = 'ko'
): string {
  const langMap: Record<string, string> = {
    ko: 'Korean',
    en: 'English'
  };
  return `> **🌐 Translation**: Translated from [${langMap[sourceLang]}](/${sourceLang}/${originalSlug}).`;
}
```

**테스트 결과**: ✅ 모든 번역 포스트에 자동 삽입 확인

---

### UX 이슈 (User Experience Issues)

#### 🟡 [UX-001] Polylang UI 연결 방식이 직관적이지 않음

**상태**: ⚠️ 개선 필요 (문서화로 부분 해결)
**우선순위**: Medium
**발견일**: 2025-11-03

**문제 설명**:
- "+" 버튼 클릭 시 새 번역 작성 화면으로 이동 (연결이 아님)
- 실제 연결은 포스트 편집 → Polylang 메타박스에서 가능
- 사용자가 혼란스러워함

**해결 방안**:
1. **단기**: WORKFLOW-GUIDE.md에 명확한 가이드 작성 (✅ 완료)
2. **중기**: CLI 자동 연결 명령어 구현 ([WF-001] 참고)
3. **장기**: WordPress 플러그인 개발로 UI 개선

**현재 상태**: 문서화 완료, 자동화 구현 대기

---

#### 🟢 [UX-002] 워크플로우가 여러 단계로 분리되어 번거로움

**상태**: ⚠️ 개선 중
**우선순위**: Low
**발견일**: 2025-11-03

**문제 설명**:
- 포스트 발행이 여러 명령어로 분리됨
- 단계가 많아 실수 가능성 증가

**현재 워크플로우**:
```bash
# 6단계 필요
1. blog analyze-seo (검증)
2. blog publish (한글)
3. blog translate (번역)
4. blog analyze-seo (영문 검증)
5. blog publish (영문)
6. WordPress 관리자에서 연결
```

**개선 방안**:
- 통합 명령어 구현 (향후)
  ```bash
  blog publish-bilingual content/posts/ko/my-post.md
  # 자동으로 모든 단계 실행
  ```

**우선순위**: Low (문서화로 일단 해결, 자동화는 향후)

---

## 📈 이슈 통계

### 상태별 통계
- ✅ **해결 완료**: 4개 (WF-001, TECH-001, TECH-003, WF-003)
- ⚠️ **개선 중**: 4개 (WF-002, TECH-002, UX-001, UX-002)
- ❌ **미해결**: 0개

### 우선순위별 통계
- 🔴 **Critical**: 0개
- 🟡 **Medium**: 4개
- 🟢 **Low**: 4개

### 카테고리별 통계
- 워크플로우 이슈: 3개
- 기술적 이슈: 3개
- UX 이슈: 2개

---

## 🎯 다음 우선순위 작업

### 즉시 실행 (이번 주)
1. ✅ WORKFLOW-GUIDE.md 작성 (권장 워크플로우 문서화)
2. ✅ CLAUDE.md 업데이트 (이슈 및 워크플로우 섹션 추가)
3. ✅ Polylang 자동 연결 구현 완료 ([WF-001])

### 단기 (1-2주)
1. SEO 키워드 밀도 자동 최적화 ([TECH-002])

### 중기 (1개월)
1. 통합 발행 명령어 구현 ([UX-002])
2. 배치 번역 기능
3. Git Hook 통합

---

## 📚 참고 문서

- `TRANSLATION-PATTERNS.md`: 번역 패턴 및 자동화 가이드
- `WORKFLOW-GUIDE.md`: 권장 워크플로우 (이 문서와 함께 작성)
- `CLAUDE.md`: 프로젝트 개요 및 개발 가이드
- `packages/core/src/translator.ts`: 번역 로직 구현
- `packages/core/src/wordpress.ts`: WordPress API 클라이언트

---

**문서 관리**:
- 이슈 발견 시 즉시 이 문서에 추가
- 해결 시 상태를 ✅로 변경하고 해결일 기록
- 매주 이슈 통계 업데이트
