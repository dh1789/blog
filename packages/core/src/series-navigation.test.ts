/**
 * series-navigation.ts 단위 테스트
 * PRD 0014: WordPress 포스트 생성 기능 개선 - 시리즈 네비게이션 모듈
 */

import { describe, it, expect } from 'vitest';
import {
  generateSeriesNavigation,
  hasExistingSeriesNavigation,
  removeExistingSeriesNavigation,
} from './series-navigation';
import type { SeriesDocument } from '@blog/shared';

describe('generateSeriesNavigation', () => {
  // =========================================================================
  // Task 2.2: Happy Path - 정상 생성
  // =========================================================================

  describe('Happy Path: 정상적인 네비게이션 생성', () => {
    it('시리즈 네비게이션 마크다운을 생성한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/mcp-day1',
          2: 'https://blog.com/ko/mcp-day2',
        },
        englishUrls: {},
        githubUrl: 'https://github.com/user/mcp-server',
        totalDays: 5,
      };

      const result = generateSeriesNavigation({
        seriesName: 'MCP 시리즈',
        currentDay: 2,
        seriesDoc,
        language: 'ko',
      });

      expect(result).toContain('MCP 시리즈');
      expect(result).toContain('Day 1');
      expect(result).toContain('Day 2');
      // 다른 Day URL은 포함
      expect(result).toContain('https://blog.com/ko/mcp-day1');
      // 현재 Day(2)는 링크 대신 "현재 글" 표시
      expect(result).toContain('현재 글');
    });

    it('현재 Day를 강조 표시한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/day1',
          2: 'https://blog.com/ko/day2',
          3: 'https://blog.com/ko/day3',
        },
        englishUrls: {},
        githubUrl: null,
        totalDays: 3,
      };

      const result = generateSeriesNavigation({
        seriesName: 'Test Series',
        currentDay: 2,
        seriesDoc,
        language: 'ko',
      });

      // 현재 Day는 굵게 표시되거나 특별한 마크가 있어야 함
      expect(result).toMatch(/\*\*.*Day 2.*\*\*|👉.*Day 2|📍.*Day 2/);
    });

    it('영문 포스트의 경우 영문 URL을 사용한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/day1',
          2: 'https://blog.com/ko/day2',
        },
        englishUrls: {
          1: 'https://blog.com/en/day1',
          2: 'https://blog.com/en/day2',
        },
        githubUrl: null,
        totalDays: 2,
      };

      // currentDay를 1로 설정하면 Day 1은 현재 글 표시
      // Day 2의 URL을 확인하여 영문 URL 사용 여부 검증
      const result = generateSeriesNavigation({
        seriesName: 'English Series',
        currentDay: 1,
        seriesDoc,
        language: 'en',
      });

      // Day 2는 영문 URL 사용
      expect(result).toContain('https://blog.com/en/day2');
      // 한글 URL은 사용하지 않음
      expect(result).not.toContain('https://blog.com/ko/day2');
    });
  });

  // =========================================================================
  // Task 2.3: Boundary Condition - 미작성 포스트 알림
  // =========================================================================

  describe('Boundary Condition: 미작성 포스트 처리', () => {
    it('URL이 없는 Day는 "준비 중" 표시를 한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/day1',
          // Day 2, 3 없음
        },
        englishUrls: {},
        githubUrl: null,
        totalDays: 3,
      };

      const result = generateSeriesNavigation({
        seriesName: 'Partial Series',
        currentDay: 1,
        seriesDoc,
        language: 'ko',
      });

      expect(result).toContain('Day 1');
      expect(result).toContain('Day 2');
      expect(result).toContain('Day 3');
      // 미작성 포스트는 링크 없이 표시
      expect(result).toMatch(/Day 2.*준비 중|Day 2.*Coming Soon/i);
    });

    it('totalDays가 URL 개수보다 큰 경우 모든 Day를 표시한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/day1',
        },
        englishUrls: {},
        githubUrl: null,
        totalDays: 5,
      };

      const result = generateSeriesNavigation({
        seriesName: 'Long Series',
        currentDay: 1,
        seriesDoc,
        language: 'ko',
      });

      expect(result).toContain('Day 1');
      expect(result).toContain('Day 5');
    });

    it('GitHub URL이 있으면 표시한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: 'https://github.com/user/project',
        totalDays: 1,
      };

      const result = generateSeriesNavigation({
        seriesName: 'GitHub Series',
        currentDay: 1,
        seriesDoc,
        language: 'ko',
      });

      expect(result).toContain('https://github.com/user/project');
    });
  });

  // =========================================================================
  // Task 2.4: Exception Cases - 빈 시리즈
  // =========================================================================

  describe('Exception Cases: 예외 상황 처리', () => {
    it('null seriesDoc은 기본 네비게이션을 반환한다', () => {
      // @ts-expect-error 의도적인 null 테스트
      const result = generateSeriesNavigation({
        seriesName: 'Empty Series',
        currentDay: 1,
        seriesDoc: null,
        language: 'ko',
      });

      expect(result).toContain('Empty Series');
      expect(result).toContain('Day 1');
    });

    it('빈 시리즈명은 기본값을 사용한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 1,
      };

      const result = generateSeriesNavigation({
        seriesName: '',
        currentDay: 1,
        seriesDoc,
        language: 'ko',
      });

      expect(result).toContain('시리즈');
    });

    it('currentDay가 0이면 1로 처리한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: {},
        githubUrl: null,
        totalDays: 1,
      };

      const result = generateSeriesNavigation({
        seriesName: 'Test',
        currentDay: 0,
        seriesDoc,
        language: 'ko',
      });

      // 에러 없이 생성되어야 함
      expect(result).toContain('Day 1');
    });

    it('currentDay가 totalDays보다 크면 처리한다', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 3,
      };

      const result = generateSeriesNavigation({
        seriesName: 'Test',
        currentDay: 10,
        seriesDoc,
        language: 'ko',
      });

      // totalDays에 맞춰 Day 1-3만 표시하거나, currentDay까지 표시
      expect(result).toBeDefined();
    });
  });
});

// =============================================================================
// 시리즈 네비게이션 중복 삽입 방지 기능 테스트
// =============================================================================

describe('hasExistingSeriesNavigation', () => {
  // =========================================================================
  // Happy Path: 시리즈 네비게이션 감지
  // =========================================================================

  describe('Happy Path: 시리즈 네비게이션 감지', () => {
    it('한글 시리즈 목차 헤더가 있으면 true를 반환한다', () => {
      const content = `
        <p>본문 내용입니다.</p>
        <hr>
        <h2>📚 시리즈 목차</h2>
        <p><strong>MCP 시리즈</strong> (2/5)</p>
      `;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });

    it('영문 Series Index 헤더가 있으면 true를 반환한다', () => {
      const content = `
        <p>Content here.</p>
        <hr>
        <h2>📚 Series Index</h2>
        <p><strong>MCP Series</strong> (2/5)</p>
      `;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });

    it('마크다운 형식의 시리즈 목차도 감지한다', () => {
      const content = `
본문 내용

---

## 📚 시리즈 목차

**MCP 시리즈** (2/5)
`;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });

    it('"시리즈 네비게이션" 패턴을 감지한다', () => {
      const content = `
본문 내용

---

## 시리즈 네비게이션

**MCP 시리즈** (3/5)
`;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });

    it('"Series Navigation" 패턴을 감지한다', () => {
      const content = `
Content here

---

## Series Navigation

**MCP Series** (3/5)
`;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });
  });

  // =========================================================================
  // Boundary Condition: 유사하지만 다른 콘텐츠
  // =========================================================================

  describe('Boundary Condition: 유사하지만 다른 콘텐츠', () => {
    it('시리즈 목차가 없으면 false를 반환한다', () => {
      const content = `
        <p>일반 블로그 포스트입니다.</p>
        <h2>목차</h2>
        <p>내용...</p>
      `;
      expect(hasExistingSeriesNavigation(content)).toBe(false);
    });

    it('일반 목차는 시리즈 목차로 인식하지 않는다', () => {
      const content = `
        <h2>📚 일반 목차</h2>
        <p>내용...</p>
      `;
      expect(hasExistingSeriesNavigation(content)).toBe(false);
    });

    it('빈 콘텐츠는 false를 반환한다', () => {
      expect(hasExistingSeriesNavigation('')).toBe(false);
    });
  });

  // =========================================================================
  // Exception Cases: 엣지 케이스
  // =========================================================================

  describe('Exception Cases: 엣지 케이스', () => {
    it('여러 개의 시리즈 목차가 있어도 true를 반환한다 (중복 감지)', () => {
      const content = `
        <h2>📚 시리즈 목차</h2>
        <p>첫 번째</p>
        <h2>📚 시리즈 목차</h2>
        <p>두 번째 (중복)</p>
      `;
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });

    it('대소문자 구분 없이 감지한다', () => {
      const content = `
        <h2>📚 SERIES INDEX</h2>
        <p>내용</p>
      `;
      // 대소문자 구분 없이 감지해야 함
      expect(hasExistingSeriesNavigation(content)).toBe(true);
    });
  });
});

describe('removeExistingSeriesNavigation', () => {
  // =========================================================================
  // Happy Path: 시리즈 네비게이션 제거
  // =========================================================================

  describe('Happy Path: 시리즈 네비게이션 제거', () => {
    it('HTML 형식의 시리즈 네비게이션을 제거한다', () => {
      const content = `<p>본문 내용입니다.</p>
<hr>
<h2>📚 시리즈 목차</h2>
<p><strong>MCP 시리즈</strong> (2/5)</p>
<ol>
<li><a href="https://blog.com/ko/day1">Day 1</a></li>
<li><strong>👉 Day 2</strong> (현재 글)</li>
</ol>
<p>🔗 <a href="https://github.com/user/repo">GitHub 저장소</a></p>
<hr>`;

      const result = removeExistingSeriesNavigation(content);

      expect(result).not.toContain('시리즈 목차');
      expect(result).not.toContain('Day 1');
      expect(result).toContain('본문 내용입니다');
    });

    it('영문 Series Index를 제거한다', () => {
      const content = `<p>Content here.</p>
<hr>
<h2>📚 Series Index</h2>
<p><strong>MCP Series</strong> (2/5)</p>
<ol>
<li><a href="https://blog.com/en/day1">Day 1</a></li>
<li><strong>👉 Day 2</strong> (Current)</li>
</ol>
<hr>`;

      const result = removeExistingSeriesNavigation(content);

      expect(result).not.toContain('Series Index');
      expect(result).toContain('Content here');
    });

    it('시리즈 네비게이션이 없으면 원본을 그대로 반환한다', () => {
      const content = '<p>시리즈 네비게이션이 없는 일반 콘텐츠입니다.</p>';

      const result = removeExistingSeriesNavigation(content);

      expect(result).toBe(content);
    });

    it('"시리즈 네비게이션" 패턴을 제거한다', () => {
      const content = `본문 내용입니다.

---

## 시리즈 네비게이션

**MCP 시리즈** (3/5)

1. [Day 1](https://blog.com/ko/day1)
2. **👉 Day 2** (현재 글)
3. Day 3 *(준비 중)*

---`;

      const result = removeExistingSeriesNavigation(content);

      expect(result).not.toContain('시리즈 네비게이션');
      expect(result).not.toContain('Day 1');
      expect(result).toContain('본문 내용입니다');
    });

    it('"Series Navigation" 패턴을 제거한다', () => {
      const content = `Content here.

---

## Series Navigation

**MCP Series** (3/5)

1. [Day 1](https://blog.com/en/day1)
2. **👉 Day 2** (Current)
3. Day 3 *(Coming Soon)*

---`;

      const result = removeExistingSeriesNavigation(content);

      expect(result).not.toContain('Series Navigation');
      expect(result).not.toContain('Day 1');
      expect(result).toContain('Content here');
    });
  });

  // =========================================================================
  // Boundary Condition: 복잡한 콘텐츠
  // =========================================================================

  describe('Boundary Condition: 복잡한 콘텐츠', () => {
    it('본문 중간에 있는 시리즈 네비게이션도 제거한다', () => {
      const content = `<p>서론</p>
<hr>
<h2>📚 시리즈 목차</h2>
<p>네비게이션 내용</p>
<hr>
<p>결론</p>`;

      const result = removeExistingSeriesNavigation(content);

      expect(result).toContain('서론');
      expect(result).toContain('결론');
      expect(result).not.toContain('시리즈 목차');
    });

    it('중복된 시리즈 네비게이션을 모두 제거한다', () => {
      const content = `<p>본문</p>
<hr>
<h2>📚 시리즈 목차</h2>
<p>첫 번째</p>
<hr>
<hr>
<h2>📚 시리즈 목차</h2>
<p>두 번째 (중복)</p>
<hr>`;

      const result = removeExistingSeriesNavigation(content);

      // 모든 시리즈 목차가 제거되어야 함
      expect(result).not.toContain('시리즈 목차');
      expect(result).toContain('본문');
    });
  });

  // =========================================================================
  // Exception Cases: 엣지 케이스
  // =========================================================================

  describe('Exception Cases: 엣지 케이스', () => {
    it('빈 콘텐츠는 빈 문자열을 반환한다', () => {
      expect(removeExistingSeriesNavigation('')).toBe('');
    });

    it('시리즈 네비게이션만 있는 콘텐츠를 처리한다', () => {
      const content = `<hr>
<h2>📚 시리즈 목차</h2>
<p>네비게이션만 있음</p>
<hr>`;

      const result = removeExistingSeriesNavigation(content);

      // 빈 문자열 또는 공백만 남아야 함
      expect(result.trim()).toBe('');
    });
  });
});
