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
} from './schemas';
import type {
  KeywordData,
  KeywordMetrics,
  RevenueScore,
  TopicSuggestion,
  RevenueAnalysisOptions,
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
