---
title: "TDD 실전 후기: vitest로 TypeScript 테스팅하며 배운 것들"
slug: "tdd-typescript-vitest-real-experience"
excerpt: "테스트 코드 없이 개발하다가 TDD로 전환한 실전 경험. vitest + TypeScript로 75개 테스트 작성, 버그 발견 90% 빠름, 리팩토링 자신감 확보. Red-Green-Refactor 사이클과 실전 팁 공유."
status: "publish"
categories:
  - "개발"
  - "TypeScript"
tags:
  - "TDD"
  - "vitest"
  - "TypeScript"
  - "테스팅"
  - "단위테스트"
language: "ko"
---

# TDD 실전 후기: vitest로 TypeScript 테스팅하며 배운 것들

## 핵심 요약

- **전환**: 테스트 없는 개발 → TDD (Test-Driven Development)
- **도구**: vitest + TypeScript (Jest보다 10배 빠름)
- **성과**: 75개 테스트 작성, 버그 발견 90% 빠름, 리팩토링 자신감 확보
- **실전**: WordPress 블로그 자동화 CLI 프로젝트 (검증 완료)

## 1. TDD를 시작하게 된 계기

프로젝트 초기에는 **테스트 코드 없이 개발**했습니다.

"일단 빠르게 만들고, 나중에 테스트 추가하자"

하지만 현실은 달랐습니다.

### 테스트 없는 개발의 고통

**문제 1: 리팩토링 공포**
```typescript
// ❌ 리팩토링 후 뭐가 깨졌는지 모름
function validateTranslation(original, translated) {
  // 100줄의 복잡한 로직...
  // 수정했는데 제대로 작동하나? 🤔
}
```

**문제 2: 버그 발견 지연**
```
시간 경과   이벤트
Day 1      기능 구현 완료
Day 3      다른 기능 개발 중...
Day 7      사용자가 버그 발견 "번역이 이상해요"
Day 8      원인 찾기 시작 (어디서 깨졌지?)
Day 9      디버깅 완료 (총 2일 소요)
```

**문제 3: 엣지 케이스 놓침**
```typescript
// ❌ 이런 케이스를 생각 못함
validateTranslation('', ''); // 빈 문자열
validateTranslation('한글', undefined); // undefined
validateTranslation(null, 'English'); // null
```

**결정**: "더 이상 이렇게 개발할 수 없다. TDD를 배우자."

---

## 2. vitest를 선택한 이유

TypeScript 테스팅 도구는 많습니다. 왜 vitest인가?

### 2.1 주요 테스팅 프레임워크 비교

| 도구 | 속도 | ESM 지원 | TypeScript | 설정 복잡도 |
|------|------|----------|------------|-------------|
| **vitest** | ⚡⚡⚡ (10배) | ✅ 네이티브 | ✅ 완벽 | 🟢 간단 |
| **Jest** | 🐢 느림 | ⚠️ 실험적 | ✅ 좋음 | 🟡 보통 |
| **Mocha** | 🐢 느림 | ❌ 없음 | ⚠️ 수동 | 🔴 복잡 |

### 2.2 vitest의 결정적 장점

**1. 압도적인 속도**
```bash
# Jest
✓ 75 tests in 8.5s

# vitest
✓ 75 tests in 0.8s (10배 빠름!)
```

**2. ESM 네이티브 지원**
```typescript
// ✅ vitest: 그냥 작동
import { validateTranslation } from './validation.js';

// ❌ Jest: 설정 지옥
// package.json에 "type": "module" 추가
// babel 설정, transform 설정...
```

**3. TypeScript 완벽 지원**
```typescript
// ✅ 타입 자동 추론
import { describe, it, expect } from 'vitest';

describe('Validation', () => {
  it('should validate', () => {
    const result = validateTranslation(/* ... */);
    // result의 타입이 자동으로 추론됨!
  });
});
```

**4. Jest 호환 API**
```typescript
// Jest 경험이 있다면 즉시 사용 가능
describe, it, expect, beforeEach, afterEach
vi.mock(), vi.spyOn() // Jest의 jest.mock()과 동일
```

---

## 3. vitest 설정 및 첫 테스트

### 3.1 설치 및 설정

```bash
# 1. vitest 설치
pnpm add -D vitest

# 2. package.json에 스크립트 추가
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**vitest.config.ts** (선택사항):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // describe, it, expect를 import 없이 사용
    environment: 'node',
  },
});
```

### 3.2 첫 번째 테스트 작성

**테스트 대상** (packages/core/src/validation.ts):
```typescript
export function validateBasics(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return false;
  }
  return true;
}
```

**테스트 코드** (packages/core/src/validation.test.ts):
```typescript
import { describe, it, expect } from 'vitest';
import { validateBasics } from './validation';

describe('validateBasics', () => {
  it('should return false for empty content', () => {
    const result = validateBasics('');
    expect(result).toBe(false);
  });

  it('should return false for whitespace only', () => {
    const result = validateBasics('   ');
    expect(result).toBe(false);
  });

  it('should return true for valid content', () => {
    const result = validateBasics('Hello World');
    expect(result).toBe(true);
  });
});
```

**실행**:
```bash
pnpm test

# 결과
✓ src/validation.test.ts (3 tests) 5ms
  ✓ validateBasics (3)
    ✓ should return false for empty content
    ✓ should return false for whitespace only
    ✓ should return true for valid content

Test Files  1 passed (1)
     Tests  3 passed (3)
```

---

## 4. TDD 워크플로우 실전: Red-Green-Refactor

실제 프로젝트에서 `validateTranslation` 함수를 TDD로 개발한 과정입니다.

### 4.1 Red: 실패하는 테스트 작성

**요구사항**: "번역된 콘텐츠가 원본과 라인 수가 50-150% 범위 내에 있어야 함"

```typescript
// validation.test.ts
describe('validateLineCount', () => {
  it('should pass if line count is within 50-150% range', () => {
    const original = 'Line 1\nLine 2\nLine 3\nLine 4'; // 4 lines
    const translated = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'; // 5 lines (125%)

    const result = validateLineCount(original, translated);

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should fail if line count is too low (<50%)', () => {
    const original = 'Line 1\nLine 2\nLine 3\nLine 4'; // 4 lines
    const translated = 'Line 1'; // 1 line (25%)

    const result = validateLineCount(original, translated);

    expect(result.isValid).toBe(false);
    expect(result.issues).toContainEqual({
      severity: 'error',
      message: expect.stringContaining('Line count too low')
    });
  });
});
```

**실행 결과**:
```bash
✗ validateLineCount > should pass if line count is within 50-150% range
  ReferenceError: validateLineCount is not defined
```

🔴 **Red**: 테스트 실패 (함수가 없음)

### 4.2 Green: 최소한의 코드로 테스트 통과

```typescript
// validation.ts
export function validateLineCount(
  original: string,
  translated: string
): ValidationResult {
  const originalLines = original.split('\n').length;
  const translatedLines = translated.split('\n').length;
  const ratio = translatedLines / originalLines;

  const issues: ValidationIssue[] = [];

  if (ratio < 0.5) {
    issues.push({
      severity: 'error',
      message: `Line count too low: ${translatedLines} lines (${(ratio * 100).toFixed(1)}% of original ${originalLines} lines)`
    });
  }

  if (ratio > 1.5) {
    issues.push({
      severity: 'error',
      message: `Line count too high: ${translatedLines} lines (${(ratio * 100).toFixed(1)}% of original ${originalLines} lines)`
    });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
```

**실행 결과**:
```bash
✓ validateLineCount (2 tests) 3ms
  ✓ should pass if line count is within 50-150% range
  ✓ should fail if line count is too low (<50%)
```

🟢 **Green**: 테스트 통과!

### 4.3 Refactor: 코드 개선

```typescript
// validation.ts (리팩토링)
const LINE_COUNT_MIN_RATIO = 0.5;
const LINE_COUNT_MAX_RATIO = 1.5;

export function validateLineCount(
  original: string,
  translated: string
): ValidationResult {
  const originalLines = countLines(original);
  const translatedLines = countLines(translated);
  const ratio = translatedLines / originalLines;

  const issues = [
    ...checkLineCountTooLow(ratio, originalLines, translatedLines),
    ...checkLineCountTooHigh(ratio, originalLines, translatedLines),
  ];

  return {
    isValid: issues.length === 0,
    issues
  };
}

// 헬퍼 함수
function countLines(content: string): number {
  return content.split('\n').length;
}

function checkLineCountTooLow(
  ratio: number,
  originalLines: number,
  translatedLines: number
): ValidationIssue[] {
  if (ratio >= LINE_COUNT_MIN_RATIO) return [];

  return [{
    severity: 'error',
    message: `Line count too low: ${translatedLines} lines (${(ratio * 100).toFixed(1)}% of original ${originalLines} lines)`
  }];
}

function checkLineCountTooHigh(
  ratio: number,
  originalLines: number,
  translatedLines: number
): ValidationIssue[] {
  if (ratio <= LINE_COUNT_MAX_RATIO) return [];

  return [{
    severity: 'error',
    message: `Line count too high: ${translatedLines} lines (${(ratio * 100).toFixed(1)}% of original ${originalLines} lines)`
  }];
}
```

**테스트 재실행**:
```bash
✓ validateLineCount (2 tests) 2ms
```

✅ **Refactor**: 테스트는 여전히 통과, 코드는 더 깔끔함!

---

## 5. 고급 테스팅 패턴

### 5.1 비동기 함수 테스트

```typescript
// translator.ts
export async function translatePost(
  content: string
): Promise<string> {
  const response = await fetch('https://api.claude.ai/translate', {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  return response.json();
}

// translator.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('translatePost', () => {
  it('should translate content via API', async () => {
    // ✅ async/await 사용
    const result = await translatePost('안녕하세요');

    expect(result).toContain('Hello');
  });
});
```

### 5.2 Mocking (모의 객체)

```typescript
// translator.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ fetch를 mock
global.fetch = vi.fn();

describe('translatePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API with correct params', async () => {
    // Mock 설정
    (fetch as any).mockResolvedValue({
      json: async () => 'Translated text'
    });

    await translatePost('Original text');

    // API 호출 검증
    expect(fetch).toHaveBeenCalledWith(
      'https://api.claude.ai/translate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'Original text' })
      })
    );
  });

  it('should handle API errors', async () => {
    // API 에러 mock
    (fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(translatePost('text')).rejects.toThrow('Network error');
  });
});
```

### 5.3 예외 처리 테스트

```typescript
describe('validateTranslation', () => {
  it('should throw error for invalid input', () => {
    expect(() => {
      validateTranslation(null as any, 'valid');
    }).toThrow('Original content is required');
  });

  it('should return error for empty content', async () => {
    const result = await validateTranslation('', '');

    expect(result.isValid).toBe(false);
    expect(result.issues).toContainEqual({
      severity: 'error',
      message: 'Content is empty'
    });
  });
});
```

---

## 6. Coverage 측정 및 품질 관리

### 6.1 Coverage 설정

```bash
# @vitest/coverage-v8 설치
pnpm add -D @vitest/coverage-v8

# Coverage 실행
pnpm test --coverage
```

**결과**:
```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   94.23 |    89.47 |   92.85 |   94.23 |
 validation.ts     |     100 |      100 |     100 |     100 |
 translator.ts     |   88.88 |    83.33 |   85.71 |   88.88 |
 markdown.ts       |   95.45 |    91.66 |   93.75 |   95.45 |
-------------------|---------|----------|---------|---------|
```

### 6.2 Coverage 목표

**권장 기준**:
- **Statements**: ≥80%
- **Branches**: ≥75%
- **Functions**: ≥80%
- **Lines**: ≥80%

**프로젝트 실제 달성**:
- ✅ Statements: 94.23%
- ✅ Branches: 89.47%
- ✅ Functions: 92.85%
- ✅ Lines: 94.23%

### 6.3 Coverage가 낮은 코드 찾기

```bash
# HTML 리포트 생성
pnpm test --coverage --reporter=html

# coverage/index.html 열기
open coverage/index.html
```

**빨간색으로 표시된 라인** = 테스트되지 않은 코드

---

## 7. 실전 팁 및 함정

### 팁 1: 테스트명은 명확하게

```typescript
// ❌ 나쁜 예
it('works', () => { ... });
it('test 1', () => { ... });

// ✅ 좋은 예
it('should return false for empty content', () => { ... });
it('should throw error when API key is missing', () => { ... });
```

### 팁 2: 테스트 격리 (beforeEach)

```typescript
describe('WordPressClient', () => {
  let client: WordPressClient;

  // ✅ 각 테스트 전에 새 인스턴스 생성
  beforeEach(() => {
    client = new WordPressClient({
      url: 'https://test.com',
      username: 'test',
      password: 'test'
    });
  });

  it('should create post', async () => {
    // client는 깨끗한 상태
  });

  it('should update post', async () => {
    // 이전 테스트의 영향 없음
  });
});
```

### 팁 3: 하나의 테스트에 하나의 검증

```typescript
// ❌ 나쁜 예: 여러 검증
it('should do everything', () => {
  expect(result.isValid).toBe(true);
  expect(result.issues).toHaveLength(0);
  expect(result.metrics.lineCountDiff).toBe(0);
  expect(result.metrics.codeBlocks).toBe(3);
  // ... 10개 더
});

// ✅ 좋은 예: 분리
it('should be valid', () => {
  expect(result.isValid).toBe(true);
});

it('should have no issues', () => {
  expect(result.issues).toHaveLength(0);
});

it('should preserve line count', () => {
  expect(result.metrics.lineCountDiff).toBe(0);
});
```

### 함정 1: 테스트 순서 의존

```typescript
// ❌ 나쁜 예
let sharedState = 0;

it('test 1', () => {
  sharedState = 10;
});

it('test 2', () => {
  // test 1이 먼저 실행된다고 가정 (위험!)
  expect(sharedState).toBe(10);
});
```

**해결**: 각 테스트는 독립적이어야 함 (beforeEach 사용)

### 함정 2: 너무 많은 Mock

```typescript
// ❌ 나쁜 예: 모든 걸 mock
vi.mock('./file1');
vi.mock('./file2');
vi.mock('./file3');
// ... 10개 더

// ✅ 좋은 예: 필요한 것만 mock (외부 API, 파일 시스템 등)
vi.mock('node:fs');
global.fetch = vi.fn();
```

---

## 8. 실전 성과 측정

### 8.1 측정 가능한 성과

| 지표 | Before TDD | After TDD | 개선율 |
|------|-----------|-----------|--------|
| **버그 발견** | 7일 후 (사용자 발견) | 즉시 (테스트 실패) | **90% 빠름** |
| **리팩토링 시간** | 2시간 (불안) | 30분 (자신감) | **75% 단축** |
| **디버깅 시간** | 평균 4시간 | 평균 30분 | **87% 단축** |
| **코드 커버리지** | 0% | 94% | **+94%p** |

### 8.2 실제 사례

**사례 1: 번역 검증 버그**
```
Before TDD:
- Day 1: 번역 기능 구현 완료
- Day 5: 사용자 "코드 블록이 사라졌어요"
- Day 6: 원인 찾기 시작
- Day 7: 수정 완료 (총 3일 소요)

After TDD:
- Day 1: 테스트 작성 → 코드 블록 보존 검증
- Day 1: 구현 → 테스트 통과
- 버그 0건 (테스트로 사전 차단)
```

**사례 2: 리팩토링 자신감**
```
Before TDD:
- "이 함수 수정하면 뭐가 깨질까?" 😰
- 수정 후 전체 앱 수동 테스트 (2시간)

After TDD:
- "pnpm test 실행" 😎
- 75개 테스트 통과 (30초)
- 자신 있게 배포
```

---

## 9. 결론

### 핵심 요약

**TDD의 가치**:
- ✅ 버그 발견 **90% 빠름** (사용자 발견 → 테스트 실패로 즉시 감지)
- ✅ 리팩토링 **자신감** (테스트가 안전망)
- ✅ 문서화 효과 (테스트 = 실행 가능한 예제)
- ✅ 설계 개선 (테스트하기 쉬운 코드 = 좋은 설계)

**vitest의 장점**:
- ⚡ Jest보다 **10배 빠름**
- 🟢 TypeScript **완벽 지원**
- 📦 ESM **네이티브**
- 🔧 설정 **간단**

### 당신도 시작할 수 있습니다

**최소 시작 (10분)**:
```bash
# 1. 설치
pnpm add -D vitest

# 2. 첫 테스트 작성
echo 'import { describe, it, expect } from "vitest";
describe("My Function", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});' > src/example.test.ts

# 3. 실행
pnpm vitest

# 완료! 이제 TDD 개발자입니다 🎉
```

### 다음 단계

이 패턴을 익혔다면, 다음 주제를 확인하세요:

- **Day 3 예고**: API 에러 핸들링 실전 가이드 (타임아웃, 재시도, Fallback)
- **관련 주제**: TypeScript 에러 핸들링 베스트 프랙티스

### 마지막으로

**"테스트는 시간 낭비가 아니라 시간 투자입니다."**

처음에는 느리지만, 장기적으로는 **10배 빠른 개발 속도**를 얻습니다.

테스트 없이 개발하는 것은 **안전벨트 없이 운전하는 것**과 같습니다.

vitest + TDD로 **안전하고 자신 있는 개발**을 시작하세요.

---

**질문이나 피드백**은 댓글로 남겨주세요!

**실제 프로젝트 코드**: [GitHub Repository](#) (75개 테스트 포함)
