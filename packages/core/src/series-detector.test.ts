/**
 * series-detector.ts 단위 테스트
 * PRD 0014: WordPress 포스트 생성 기능 개선 - 시리즈 문서 감지 모듈
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectSeriesFromFilename, findSeriesDocument, parseSeriesDocument } from './series-detector';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('detectSeriesFromFilename', () => {
  // =========================================================================
  // Task 1.4: Happy Path - 정상 추출
  // =========================================================================

  describe('Happy Path: 정상적인 시리즈 파일명 추출', () => {
    it('날짜-시리즈명-dayN-제목 형식에서 시리즈 정보를 추출한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-mcp-day1-introduction.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('mcp');
      expect(result?.dayNumber).toBe(1);
      expect(result?.docPath).toBeNull();
    });

    it('다양한 Day 번호를 정확히 추출한다 (day3)', () => {
      const result = detectSeriesFromFilename('2025-11-20-remote-claude-day3-multi-project.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('remote-claude');
      expect(result?.dayNumber).toBe(3);
    });

    it('두 자리 Day 번호를 추출한다 (day10)', () => {
      const result = detectSeriesFromFilename('2025-12-15-claude-agent-sdk-day10-final.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('claude-agent-sdk');
      expect(result?.dayNumber).toBe(10);
    });

    it('전체 파일 경로에서도 시리즈를 추출한다', () => {
      const result = detectSeriesFromFilename('content/posts/ko/2025-12-05-mcp-day2-tools.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('mcp');
      expect(result?.dayNumber).toBe(2);
    });

    it('영문 포스트 경로에서도 시리즈를 추출한다', () => {
      const result = detectSeriesFromFilename('content/posts/en/2025-12-05-mcp-day1-introduction-en.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('mcp');
      expect(result?.dayNumber).toBe(1);
    });
  });

  // =========================================================================
  // Task 1.5: Boundary Condition - 시리즈 아닌 파일
  // =========================================================================

  describe('Boundary Condition: 시리즈 형식이 아닌 파일', () => {
    it('시리즈 형식이 아닌 일반 포스트는 null을 반환한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-standalone-post.md');

      expect(result).toBeNull();
    });

    it('day 패턴 없는 파일은 null을 반환한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-nextjs-guide-complete.md');

      expect(result).toBeNull();
    });

    it('숫자만 있고 day 키워드 없는 파일은 null을 반환한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-top-10-tips.md');

      expect(result).toBeNull();
    });

    it('.md 확장자가 없어도 처리한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-mcp-day1-intro');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('mcp');
      expect(result?.dayNumber).toBe(1);
    });

    it('대소문자 혼용된 Day 패턴을 인식한다 (Day, DAY)', () => {
      const result1 = detectSeriesFromFilename('2025-12-05-mcp-Day1-intro.md');
      const result2 = detectSeriesFromFilename('2025-12-05-mcp-DAY1-intro.md');

      expect(result1).not.toBeNull();
      expect(result1?.dayNumber).toBe(1);
      expect(result2).not.toBeNull();
      expect(result2?.dayNumber).toBe(1);
    });
  });

  // =========================================================================
  // Task 1.6: Exception Cases - 잘못된 경로
  // =========================================================================

  describe('Exception Cases: 잘못된 입력 처리', () => {
    it('빈 문자열은 null을 반환한다', () => {
      const result = detectSeriesFromFilename('');

      expect(result).toBeNull();
    });

    it('null 입력은 null을 반환한다', () => {
      // @ts-expect-error 의도적인 null 테스트
      const result = detectSeriesFromFilename(null);

      expect(result).toBeNull();
    });

    it('undefined 입력은 null을 반환한다', () => {
      // @ts-expect-error 의도적인 undefined 테스트
      const result = detectSeriesFromFilename(undefined);

      expect(result).toBeNull();
    });

    it('날짜 패턴 없는 파일도 시리즈 정보를 추출한다', () => {
      const result = detectSeriesFromFilename('mcp-day1-introduction.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('mcp');
      expect(result?.dayNumber).toBe(1);
    });

    it('특수문자가 포함된 시리즈명도 추출한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-my_series-day1-intro.md');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('my_series');
    });

    it('Day 번호가 0인 경우 null을 반환한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-mcp-day0-intro.md');

      expect(result).toBeNull();
    });

    it('Day 번호가 음수인 경우 null을 반환한다', () => {
      const result = detectSeriesFromFilename('2025-12-05-mcp-day-1-intro.md');

      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// Task 1.7-1.10: findSeriesDocument() 테스트
// ============================================================================

describe('findSeriesDocument', () => {
  const TEST_DOCS_DIR = join(__dirname, '.test-docs');

  beforeEach(() => {
    // 테스트용 docs 디렉토리 생성
    if (!existsSync(TEST_DOCS_DIR)) {
      mkdirSync(TEST_DOCS_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 테스트용 docs 디렉토리 정리
    if (existsSync(TEST_DOCS_DIR)) {
      rmSync(TEST_DOCS_DIR, { recursive: true, force: true });
    }
  });

  // =========================================================================
  // Task 1.8: Happy Path - 문서 발견
  // =========================================================================

  describe('Happy Path: 시리즈 문서 발견', () => {
    it('{series}-series-plan.md 형식 문서를 찾는다', () => {
      // 테스트 문서 생성
      const docPath = join(TEST_DOCS_DIR, 'mcp-series-plan.md');
      writeFileSync(docPath, '# MCP Series Plan');

      const result = findSeriesDocument('mcp', TEST_DOCS_DIR);

      expect(result).not.toBeNull();
      expect(result).toContain('mcp-series-plan.md');
    });

    it('{series}-series-detailed-plan.md 형식 문서도 찾는다', () => {
      const docPath = join(TEST_DOCS_DIR, 'remote-claude-series-detailed-plan.md');
      writeFileSync(docPath, '# Remote Claude Series');

      const result = findSeriesDocument('remote-claude', TEST_DOCS_DIR);

      expect(result).not.toBeNull();
      expect(result).toContain('remote-claude-series-detailed-plan.md');
    });

    it('{series}-*.md 형식 문서도 찾는다 (차선)', () => {
      const docPath = join(TEST_DOCS_DIR, 'claude-agent-sdk-overview.md');
      writeFileSync(docPath, '# Claude Agent SDK');

      const result = findSeriesDocument('claude-agent-sdk', TEST_DOCS_DIR);

      expect(result).not.toBeNull();
      expect(result).toContain('claude-agent-sdk-overview.md');
    });
  });

  // =========================================================================
  // Task 1.9: Boundary Condition - 여러 문서 중 선택
  // =========================================================================

  describe('Boundary Condition: 우선순위 및 여러 문서 처리', () => {
    it('series-plan 형식이 다른 형식보다 우선한다', () => {
      // 두 가지 형식의 문서 생성
      writeFileSync(join(TEST_DOCS_DIR, 'mcp-series-plan.md'), '# MCP Series Plan');
      writeFileSync(join(TEST_DOCS_DIR, 'mcp-guide.md'), '# MCP Guide');

      const result = findSeriesDocument('mcp', TEST_DOCS_DIR);

      expect(result).toContain('mcp-series-plan.md');
    });

    it('여러 매칭 문서 중 series-plan을 우선 선택한다', () => {
      writeFileSync(join(TEST_DOCS_DIR, 'test-guide.md'), '# Test Guide');
      writeFileSync(join(TEST_DOCS_DIR, 'test-series-plan.md'), '# Test Series');
      writeFileSync(join(TEST_DOCS_DIR, 'test-overview.md'), '# Test Overview');

      const result = findSeriesDocument('test', TEST_DOCS_DIR);

      expect(result).toContain('test-series-plan.md');
    });

    it('시리즈명 일부만 매칭되는 경우 정확히 일치하는 것을 선택한다', () => {
      writeFileSync(join(TEST_DOCS_DIR, 'mcp-series-plan.md'), '# MCP');
      writeFileSync(join(TEST_DOCS_DIR, 'mcp-advanced-series-plan.md'), '# MCP Advanced');

      const result = findSeriesDocument('mcp', TEST_DOCS_DIR);

      // mcp-series-plan.md가 더 정확한 매칭
      expect(result).toContain('mcp-series-plan.md');
    });
  });

  // =========================================================================
  // Task 1.10: Exception Cases - 문서 없음
  // =========================================================================

  describe('Exception Cases: 문서 없거나 에러 상황', () => {
    it('매칭되는 문서가 없으면 null을 반환한다', () => {
      const result = findSeriesDocument('nonexistent-series', TEST_DOCS_DIR);

      expect(result).toBeNull();
    });

    it('빈 시리즈명은 null을 반환한다', () => {
      const result = findSeriesDocument('', TEST_DOCS_DIR);

      expect(result).toBeNull();
    });

    it('존재하지 않는 디렉토리는 null을 반환한다', () => {
      const result = findSeriesDocument('mcp', '/nonexistent/path');

      expect(result).toBeNull();
    });

    it('null 시리즈명은 null을 반환한다', () => {
      // @ts-expect-error 의도적인 null 테스트
      const result = findSeriesDocument(null, TEST_DOCS_DIR);

      expect(result).toBeNull();
    });

    it('빈 docs 디렉토리는 null을 반환한다', () => {
      // TEST_DOCS_DIR은 beforeEach에서 생성되지만 파일 없음
      const result = findSeriesDocument('mcp', TEST_DOCS_DIR);

      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// Task 1.11-1.14: parseSeriesDocument() 테스트
// ============================================================================

describe('parseSeriesDocument', () => {
  const TEST_DOCS_DIR = join(__dirname, '.test-parse-docs');

  beforeEach(() => {
    if (!existsSync(TEST_DOCS_DIR)) {
      mkdirSync(TEST_DOCS_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DOCS_DIR)) {
      rmSync(TEST_DOCS_DIR, { recursive: true, force: true });
    }
  });

  // =========================================================================
  // Task 1.12: Happy Path - 정상 파싱
  // =========================================================================

  describe('Happy Path: 정상적인 시리즈 문서 파싱', () => {
    it('GitHub URL과 totalDays를 추출한다', () => {
      const docContent = `# MCP 시리즈 계획

**프로젝트**: [my-mcp-server](https://github.com/user/my-mcp-server)
**시리즈 구성**: 5개 포스트

## 발행된 포스트 URL

### 한글
- Day 1: https://blog.example.com/ko/mcp-day1
- Day 2: https://blog.example.com/ko/mcp-day2

### 영문
- Day 1: https://blog.example.com/en/mcp-day1
- Day 2: https://blog.example.com/en/mcp-day2
`;
      const docPath = join(TEST_DOCS_DIR, 'mcp-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.githubUrl).toBe('https://github.com/user/my-mcp-server');
      expect(result?.totalDays).toBe(5);
      expect(result?.koreanUrls[1]).toBe('https://blog.example.com/ko/mcp-day1');
      expect(result?.koreanUrls[2]).toBe('https://blog.example.com/ko/mcp-day2');
      expect(result?.englishUrls[1]).toBe('https://blog.example.com/en/mcp-day1');
      expect(result?.englishUrls[2]).toBe('https://blog.example.com/en/mcp-day2');
    });

    it('테이블 형식의 URL 매핑도 파싱한다', () => {
      const docContent = `# Claude Agent SDK 시리즈

**프로젝트**: [claude-sdk](https://github.com/anthropics/claude-sdk)
**시리즈 구성**: 3개 포스트

## 발행 URL

| Day | Korean | English |
|-----|--------|---------|
| 1 | https://blog.com/ko/sdk-day1 | https://blog.com/en/sdk-day1 |
| 2 | https://blog.com/ko/sdk-day2 | https://blog.com/en/sdk-day2 |
`;
      const docPath = join(TEST_DOCS_DIR, 'sdk-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.totalDays).toBe(3);
      expect(result?.koreanUrls[1]).toBe('https://blog.com/ko/sdk-day1');
      expect(result?.englishUrls[2]).toBe('https://blog.com/en/sdk-day2');
    });

    it('다양한 totalDays 형식을 파싱한다', () => {
      const docContent = `# Test Series

**GitHub**: https://github.com/test/repo
**총 Day 수**: 7

내용...
`;
      const docPath = join(TEST_DOCS_DIR, 'test-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.totalDays).toBe(7);
      expect(result?.githubUrl).toBe('https://github.com/test/repo');
    });
  });

  // =========================================================================
  // Task 1.13: Boundary Condition - 부분 정보만 있음
  // =========================================================================

  describe('Boundary Condition: 부분 정보만 있는 문서', () => {
    it('URL 섹션 없이 기본 정보만 있는 문서를 파싱한다', () => {
      const docContent = `# Remote Claude 시리즈

**프로젝트**: [remote-claude](https://github.com/dh1789/remote-claude)
**시리즈 구성**: 5개 포스트

아직 발행된 포스트 없음
`;
      const docPath = join(TEST_DOCS_DIR, 'remote-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.githubUrl).toBe('https://github.com/dh1789/remote-claude');
      expect(result?.totalDays).toBe(5);
      expect(Object.keys(result?.koreanUrls || {})).toHaveLength(0);
      expect(Object.keys(result?.englishUrls || {})).toHaveLength(0);
    });

    it('GitHub URL 없는 문서도 파싱한다', () => {
      const docContent = `# 내부 프로젝트 시리즈

**시리즈 구성**: 3개 포스트

## 한글 URL
- Day 1: https://blog.com/ko/internal-day1
`;
      const docPath = join(TEST_DOCS_DIR, 'internal-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.githubUrl).toBeNull();
      expect(result?.totalDays).toBe(3);
      expect(result?.koreanUrls[1]).toBe('https://blog.com/ko/internal-day1');
    });

    it('totalDays를 URL 개수에서 유추한다', () => {
      const docContent = `# 시리즈 문서

**프로젝트**: https://github.com/test/project

## 한글
- Day 1: https://blog.com/ko/day1
- Day 2: https://blog.com/ko/day2
- Day 3: https://blog.com/ko/day3
- Day 4: https://blog.com/ko/day4
`;
      const docPath = join(TEST_DOCS_DIR, 'infer-series-plan.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      // totalDays가 명시되지 않으면 URL 개수에서 유추 (최소 4)
      expect(result?.totalDays).toBeGreaterThanOrEqual(4);
    });
  });

  // =========================================================================
  // Task 1.14: Exception Cases - 잘못된 형식
  // =========================================================================

  describe('Exception Cases: 잘못된 입력 처리', () => {
    it('존재하지 않는 파일은 null을 반환한다', () => {
      const result = parseSeriesDocument('/nonexistent/path/doc.md');

      expect(result).toBeNull();
    });

    it('빈 문자열 경로는 null을 반환한다', () => {
      const result = parseSeriesDocument('');

      expect(result).toBeNull();
    });

    it('null 경로는 null을 반환한다', () => {
      // @ts-expect-error 의도적인 null 테스트
      const result = parseSeriesDocument(null);

      expect(result).toBeNull();
    });

    it('빈 파일은 기본값을 반환한다', () => {
      const docPath = join(TEST_DOCS_DIR, 'empty-series-plan.md');
      writeFileSync(docPath, '');

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.githubUrl).toBeNull();
      expect(result?.totalDays).toBe(1); // 최소값
      expect(Object.keys(result?.koreanUrls || {})).toHaveLength(0);
      expect(Object.keys(result?.englishUrls || {})).toHaveLength(0);
    });

    it('잘못된 URL 형식은 무시한다', () => {
      const docContent = `# Test

## 한글
- Day 1: not-a-valid-url
- Day 2: https://valid.com/day2
`;
      const docPath = join(TEST_DOCS_DIR, 'invalid-url-series.md');
      writeFileSync(docPath, docContent);

      const result = parseSeriesDocument(docPath);

      expect(result).not.toBeNull();
      expect(result?.koreanUrls[1]).toBeUndefined(); // 잘못된 URL 무시
      expect(result?.koreanUrls[2]).toBe('https://valid.com/day2');
    });
  });
});
