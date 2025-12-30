/**
 * Zod 스키마 검증 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  KeywordDataSchema,
  KeywordMetricsSchema,
  RevenueScoreSchema,
  TopicSuggestionSchema,
  RevenueAnalysisOptionsSchema,
  SeriesInfoSchema,
  SeriesDocumentSchema,
} from './schemas';
import type {
  KeywordData,
  KeywordMetrics,
  RevenueScore,
  TopicSuggestion,
  RevenueAnalysisOptions,
  SeriesInfo,
  SeriesDocument,
} from './types';

describe('Epic 8.0 Schema Validation', () => {
  describe('KeywordDataSchema', () => {
    it('should validate correct keyword data', () => {
      const validData: KeywordData = {
        keyword: 'WordPress plugin',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'MEDIUM',
        competitionIndex: 65,
      };

      const result = KeywordDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate keyword data without optional competitionIndex', () => {
      const validData: KeywordData = {
        keyword: 'WordPress plugin',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'HIGH',
      };

      const result = KeywordDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty keyword', () => {
      const invalidData = {
        keyword: '',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'MEDIUM',
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative search volume', () => {
      const invalidData = {
        keyword: 'test',
        searchVolume: -100,
        cpc: 2.5,
        competition: 'MEDIUM',
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative CPC', () => {
      const invalidData = {
        keyword: 'test',
        searchVolume: 10000,
        cpc: -1.5,
        competition: 'MEDIUM',
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid competition value', () => {
      const invalidData = {
        keyword: 'test',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'INVALID',
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject competitionIndex out of range', () => {
      const invalidData = {
        keyword: 'test',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'MEDIUM',
        competitionIndex: 150,
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer search volume', () => {
      const invalidData = {
        keyword: 'test',
        searchVolume: 10000.5,
        cpc: 2.5,
        competition: 'MEDIUM',
      };

      const result = KeywordDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('KeywordMetricsSchema', () => {
    it('should validate correct metrics', () => {
      const validMetrics: KeywordMetrics = {
        searchVolumeScore: 0.85,
        cpcScore: 0.72,
        competitionScore: 0.4,
      };

      const result = KeywordMetricsSchema.safeParse(validMetrics);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validMetrics);
      }
    });

    it('should accept boundary values (0 and 1)', () => {
      const boundaryMetrics: KeywordMetrics = {
        searchVolumeScore: 0,
        cpcScore: 1,
        competitionScore: 0.5,
      };

      const result = KeywordMetricsSchema.safeParse(boundaryMetrics);
      expect(result.success).toBe(true);
    });

    it('should reject scores below 0', () => {
      const invalidMetrics = {
        searchVolumeScore: -0.1,
        cpcScore: 0.5,
        competitionScore: 0.5,
      };

      const result = KeywordMetricsSchema.safeParse(invalidMetrics);
      expect(result.success).toBe(false);
    });

    it('should reject scores above 1', () => {
      const invalidMetrics = {
        searchVolumeScore: 0.5,
        cpcScore: 1.5,
        competitionScore: 0.5,
      };

      const result = KeywordMetricsSchema.safeParse(invalidMetrics);
      expect(result.success).toBe(false);
    });
  });

  describe('RevenueScoreSchema', () => {
    it('should validate correct revenue score', () => {
      const validScore: RevenueScore = {
        keyword: 'WordPress hosting',
        totalScore: 85.5,
        metrics: {
          searchVolumeScore: 0.9,
          cpcScore: 0.85,
          competitionScore: 0.3,
        },
        expectedRevenue: {
          conservative: 120.5,
          optimistic: 350.75,
        },
        ranking: {
          overall: 3,
          byVolume: 5,
          byRevenue: 2,
        },
      };

      const result = RevenueScoreSchema.safeParse(validScore);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validScore);
      }
    });

    it('should reject totalScore below 0', () => {
      const invalidScore = {
        keyword: 'test',
        totalScore: -10,
        metrics: {
          searchVolumeScore: 0.5,
          cpcScore: 0.5,
          competitionScore: 0.5,
        },
        expectedRevenue: {
          conservative: 100,
          optimistic: 200,
        },
        ranking: {
          overall: 1,
          byVolume: 1,
          byRevenue: 1,
        },
      };

      const result = RevenueScoreSchema.safeParse(invalidScore);
      expect(result.success).toBe(false);
    });

    it('should reject totalScore above 100', () => {
      const invalidScore = {
        keyword: 'test',
        totalScore: 105,
        metrics: {
          searchVolumeScore: 0.5,
          cpcScore: 0.5,
          competitionScore: 0.5,
        },
        expectedRevenue: {
          conservative: 100,
          optimistic: 200,
        },
        ranking: {
          overall: 1,
          byVolume: 1,
          byRevenue: 1,
        },
      };

      const result = RevenueScoreSchema.safeParse(invalidScore);
      expect(result.success).toBe(false);
    });

    it('should reject negative expected revenue', () => {
      const invalidScore = {
        keyword: 'test',
        totalScore: 50,
        metrics: {
          searchVolumeScore: 0.5,
          cpcScore: 0.5,
          competitionScore: 0.5,
        },
        expectedRevenue: {
          conservative: -50,
          optimistic: 200,
        },
        ranking: {
          overall: 1,
          byVolume: 1,
          byRevenue: 1,
        },
      };

      const result = RevenueScoreSchema.safeParse(invalidScore);
      expect(result.success).toBe(false);
    });

    it('should reject ranking below 1', () => {
      const invalidScore = {
        keyword: 'test',
        totalScore: 50,
        metrics: {
          searchVolumeScore: 0.5,
          cpcScore: 0.5,
          competitionScore: 0.5,
        },
        expectedRevenue: {
          conservative: 100,
          optimistic: 200,
        },
        ranking: {
          overall: 0,
          byVolume: 1,
          byRevenue: 1,
        },
      };

      const result = RevenueScoreSchema.safeParse(invalidScore);
      expect(result.success).toBe(false);
    });
  });

  describe('TopicSuggestionSchema', () => {
    it('should validate correct topic suggestion', () => {
      const validSuggestion: TopicSuggestion = {
        title: 'WordPress 호스팅 완벽 가이드',
        keywords: ['WordPress hosting', 'best hosting'],
        template: '완벽 가이드',
        estimatedRevenue: {
          conservative: 250.0,
          optimistic: 600.0,
        },
        keywordScores: [
          {
            keyword: 'WordPress hosting',
            totalScore: 85.5,
            metrics: {
              searchVolumeScore: 0.9,
              cpcScore: 0.85,
              competitionScore: 0.3,
            },
            expectedRevenue: {
              conservative: 120.5,
              optimistic: 350.75,
            },
            ranking: {
              overall: 1,
              byVolume: 2,
              byRevenue: 1,
            },
          },
        ],
      };

      const result = TopicSuggestionSchema.safeParse(validSuggestion);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSuggestion);
      }
    });

    it('should reject empty title', () => {
      const invalidSuggestion = {
        title: '',
        keywords: ['test'],
        template: '완벽 가이드',
        estimatedRevenue: {
          conservative: 100,
          optimistic: 200,
        },
        keywordScores: [],
      };

      const result = TopicSuggestionSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });

    it('should reject empty keywords array', () => {
      const invalidSuggestion = {
        title: 'Test Title',
        keywords: [],
        template: '완벽 가이드',
        estimatedRevenue: {
          conservative: 100,
          optimistic: 200,
        },
        keywordScores: [],
      };

      const result = TopicSuggestionSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });

    it('should reject negative estimated revenue', () => {
      const invalidSuggestion = {
        title: 'Test Title',
        keywords: ['test'],
        template: '완벽 가이드',
        estimatedRevenue: {
          conservative: -100,
          optimistic: 200,
        },
        keywordScores: [],
      };

      const result = TopicSuggestionSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });
  });

  describe('RevenueAnalysisOptionsSchema', () => {
    it('should validate correct options', () => {
      const validOptions: RevenueAnalysisOptions = {
        minSearchVolume: 1000,
        maxCompetition: 'MEDIUM',
        minCpc: 1.0,
        maxCpc: 10.0,
        limit: 50,
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(validOptions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validOptions);
      }
    });

    it('should validate empty options (all optional)', () => {
      const emptyOptions = {};

      const result = RevenueAnalysisOptionsSchema.safeParse(emptyOptions);
      expect(result.success).toBe(true);
    });

    it('should reject negative minSearchVolume', () => {
      const invalidOptions = {
        minSearchVolume: -100,
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });

    it('should reject negative minCpc', () => {
      const invalidOptions = {
        minCpc: -1.5,
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });

    it('should reject limit below 1', () => {
      const invalidOptions = {
        limit: 0,
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });

    it('should reject limit above 100', () => {
      const invalidOptions = {
        limit: 150,
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });

    it('should reject invalid maxCompetition value', () => {
      const invalidOptions = {
        maxCompetition: 'INVALID',
      };

      const result = RevenueAnalysisOptionsSchema.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// PRD 0014: WordPress 포스트 생성 기능 개선 - 시리즈 관련 스키마 테스트
// ============================================================================

describe('PRD 0014 Series Schema Validation', () => {
  describe('SeriesInfoSchema', () => {
    // Happy Path: 정상적인 시리즈 정보 검증
    it('시리즈명, Day 번호, 문서 경로가 모두 포함된 데이터를 검증한다', () => {
      const validData: SeriesInfo = {
        name: 'mcp',
        dayNumber: 1,
        docPath: 'docs/mcp-series-plan.md',
      };

      const result = SeriesInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    // Happy Path: docPath가 null인 경우 (문서 없음)
    it('docPath가 null인 경우도 유효하다', () => {
      const validData: SeriesInfo = {
        name: 'claude-agent-sdk',
        dayNumber: 3,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.docPath).toBeNull();
      }
    });

    // Boundary Condition: 최소 Day 번호 (1)
    it('Day 번호 최소값 1을 허용한다', () => {
      const validData: SeriesInfo = {
        name: 'test',
        dayNumber: 1,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // Boundary Condition: Day 번호 0 거부
    it('Day 번호 0을 거부한다', () => {
      const invalidData = {
        name: 'test',
        dayNumber: 0,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Exception Case: 빈 시리즈명
    it('빈 시리즈명을 거부한다', () => {
      const invalidData = {
        name: '',
        dayNumber: 1,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Exception Case: 음수 Day 번호
    it('음수 Day 번호를 거부한다', () => {
      const invalidData = {
        name: 'test',
        dayNumber: -1,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Exception Case: 소수점 Day 번호
    it('소수점 Day 번호를 거부한다', () => {
      const invalidData = {
        name: 'test',
        dayNumber: 1.5,
        docPath: null,
      };

      const result = SeriesInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SeriesDocumentSchema', () => {
    // Happy Path: 완전한 시리즈 문서 데이터
    it('한글/영문 URL, GitHub URL, 총 Day 수가 포함된 데이터를 검증한다', () => {
      const validData: SeriesDocument = {
        koreanUrls: {
          1: '/ko/mcp-day1-introduction',
          2: '/ko/mcp-day2-tools',
          3: '/ko/mcp-day3-resources',
        },
        englishUrls: {
          1: '/en/mcp-day1-introduction-en',
          2: '/en/mcp-day2-tools-en',
          3: '/en/mcp-day3-resources-en',
        },
        githubUrl: 'https://github.com/dh1789/my-first-mcp',
        totalDays: 5,
      };

      const result = SeriesDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalDays).toBe(5);
        expect(result.data.koreanUrls[1]).toBe('/ko/mcp-day1-introduction');
      }
    });

    // Happy Path: GitHub URL이 null인 경우
    it('githubUrl이 null인 경우도 유효하다', () => {
      const validData: SeriesDocument = {
        koreanUrls: { 1: '/ko/test-day1' },
        englishUrls: { 1: '/en/test-day1-en' },
        githubUrl: null,
        totalDays: 1,
      };

      const result = SeriesDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.githubUrl).toBeNull();
      }
    });

    // Boundary Condition: 빈 URL 객체
    it('빈 URL 객체를 허용한다 (아직 작성된 포스트 없음)', () => {
      const validData: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 5,
      };

      const result = SeriesDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // Boundary Condition: totalDays 최소값 1
    it('totalDays 최소값 1을 허용한다', () => {
      const validData: SeriesDocument = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 1,
      };

      const result = SeriesDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // Exception Case: totalDays 0 거부
    it('totalDays 0을 거부한다', () => {
      const invalidData = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: 0,
      };

      const result = SeriesDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Exception Case: 음수 totalDays 거부
    it('음수 totalDays를 거부한다', () => {
      const invalidData = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: null,
        totalDays: -1,
      };

      const result = SeriesDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Exception Case: 유효하지 않은 GitHub URL
    it('유효하지 않은 GitHub URL을 거부한다', () => {
      const invalidData = {
        koreanUrls: {},
        englishUrls: {},
        githubUrl: 'not-a-valid-url',
        totalDays: 5,
      };

      const result = SeriesDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // Side Effect: URL 키가 문자열로 변환되는지 확인
    it('숫자 키가 문자열로 변환되어도 정상 동작한다', () => {
      const validData = {
        koreanUrls: { '1': '/ko/test-day1', '2': '/ko/test-day2' },
        englishUrls: { '1': '/en/test-day1-en' },
        githubUrl: null,
        totalDays: 3,
      };

      const result = SeriesDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
