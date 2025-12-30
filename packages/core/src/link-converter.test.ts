/**
 * link-converter.ts 단위 테스트
 * PRD 0014: WordPress 포스트 생성 기능 개선 - 링크 변환 모듈
 */

import { describe, it, expect } from 'vitest';
import { convertLinksToEnglish } from './link-converter';
import type { SeriesDocument } from '@blog/shared';

describe('convertLinksToEnglish', () => {
  // =========================================================================
  // Task 2.6: Happy Path - 정상 변환
  // =========================================================================

  describe('Happy Path: 정상적인 링크 변환', () => {
    it('한글 URL을 영문 URL로 변환한다', () => {
      const content = `
# Day 1 포스트

이전 글: [Day 1](https://blog.com/ko/mcp-day1)
다음 글: [Day 3](https://blog.com/ko/mcp-day3)
`;
      const seriesDoc: SeriesDocument = {
        koreanUrls: {
          1: 'https://blog.com/ko/mcp-day1',
          3: 'https://blog.com/ko/mcp-day3',
        },
        englishUrls: {
          1: 'https://blog.com/en/mcp-day1',
          3: 'https://blog.com/en/mcp-day3',
        },
        githubUrl: null,
        totalDays: 3,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      expect(result).toContain('https://blog.com/en/mcp-day1');
      expect(result).toContain('https://blog.com/en/mcp-day3');
      expect(result).not.toContain('https://blog.com/ko/mcp-day1');
      expect(result).not.toContain('https://blog.com/ko/mcp-day3');
    });

    it('여러 형식의 링크를 모두 변환한다', () => {
      const content = `
마크다운 링크: [참조](https://blog.com/ko/day1)
HTML 링크: <a href="https://blog.com/ko/day1">링크</a>
직접 URL: https://blog.com/ko/day1
`;
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      // 모든 한글 URL이 영문으로 변환
      expect(result).not.toContain('https://blog.com/ko/day1');
      expect(result.match(/https:\/\/blog\.com\/en\/day1/g)?.length).toBe(3);
    });

    it('쿼리 문자열이 있는 URL도 변환한다', () => {
      const content = '[참조](https://blog.com/ko/day1?ref=series#section)';
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      expect(result).toContain('https://blog.com/en/day1?ref=series#section');
    });
  });

  // =========================================================================
  // Task 2.7: Boundary Condition - 매칭 없는 링크
  // =========================================================================

  describe('Boundary Condition: 매칭 없는 링크 처리', () => {
    it('매핑에 없는 URL은 그대로 유지한다', () => {
      const content = '[외부 링크](https://external.com/page)';
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      expect(result).toContain('https://external.com/page');
    });

    it('영문 URL이 없는 Day는 한글 URL 유지', () => {
      const content = '[참조](https://blog.com/ko/day2)';
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 2: 'https://blog.com/ko/day2' },
        englishUrls: {}, // 영문 URL 없음
        githubUrl: null,
        totalDays: 2,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      // 영문 매핑이 없으면 한글 URL 유지
      expect(result).toContain('https://blog.com/ko/day2');
    });

    it('빈 seriesDoc은 원본 그대로 반환', () => {
      const content = '[참조](https://blog.com/ko/day1)';
      // @ts-expect-error 의도적인 null 테스트
      const result = convertLinksToEnglish(content, null);

      expect(result).toBe(content);
    });

    it('빈 URL 매핑은 원본 그대로 반환', () => {
      const content = '[참조](https://blog.com/ko/day1)';
      const seriesDoc: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 1,
      };

      const result = convertLinksToEnglish(content, seriesDoc);

      expect(result).toBe(content);
    });
  });

  // =========================================================================
  // Task 2.8: Side Effect - 원본 미변경
  // =========================================================================

  describe('Side Effect: 원본 데이터 보존', () => {
    it('원본 콘텐츠를 변경하지 않는다', () => {
      const originalContent = '[참조](https://blog.com/ko/day1)';
      const content = originalContent;
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };

      convertLinksToEnglish(content, seriesDoc);

      // 원본은 변경되지 않음
      expect(content).toBe(originalContent);
    });

    it('원본 seriesDoc을 변경하지 않는다', () => {
      const content = '[참조](https://blog.com/ko/day1)';
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };
      const originalUrls = { ...seriesDoc.koreanUrls };

      convertLinksToEnglish(content, seriesDoc);

      // seriesDoc은 변경되지 않음
      expect(seriesDoc.koreanUrls).toEqual(originalUrls);
    });

    it('빈 콘텐츠는 빈 문자열 반환', () => {
      const seriesDoc: SeriesDocument = {
        koreanUrls: { 1: 'https://blog.com/ko/day1' },
        englishUrls: { 1: 'https://blog.com/en/day1' },
        githubUrl: null,
        totalDays: 1,
      };

      const result = convertLinksToEnglish('', seriesDoc);

      expect(result).toBe('');
    });
  });
});
