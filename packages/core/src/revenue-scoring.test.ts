/**
 * 수익성 점수 계산 모듈 유닛 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeCPC,
  normalizeSearchVolume,
  normalizeSEODifficulty,
  normalizeKeywordData,
  calculateRevenueScore,
  estimateRevenue,
  calculateRevenueScores,
} from './revenue-scoring';
import type { KeywordData } from '@blog/shared';

describe('Revenue Scoring Module', () => {
  describe('normalizeCPC', () => {
    it('should return 0.0 for minimum CPC ($0.01)', () => {
      expect(normalizeCPC(0.01)).toBe(0.0);
    });

    it('should return 1.0 for maximum CPC ($10.00)', () => {
      expect(normalizeCPC(10.0)).toBe(1.0);
    });

    it('should return ~0.5 for mid-range CPC ($5.00)', () => {
      const result = normalizeCPC(5.0);
      expect(result).toBeCloseTo(0.5, 2);
    });

    it('should return 0.0 for CPC below minimum', () => {
      expect(normalizeCPC(0.005)).toBe(0.0);
    });

    it('should return 1.0 for CPC above maximum', () => {
      expect(normalizeCPC(15.0)).toBe(1.0);
    });

    it('should handle edge cases', () => {
      expect(normalizeCPC(0.01)).toBe(0.0);
      expect(normalizeCPC(2.5)).toBeCloseTo(0.249, 2);
      expect(normalizeCPC(7.5)).toBeCloseTo(0.749, 2);
      expect(normalizeCPC(10.0)).toBe(1.0);
    });
  });

  describe('normalizeSearchVolume', () => {
    it('should return 0.0 for minimum volume (10)', () => {
      expect(normalizeSearchVolume(10)).toBe(0.0);
    });

    it('should return 1.0 for maximum volume (100,000)', () => {
      expect(normalizeSearchVolume(100000)).toBe(1.0);
    });

    it('should use logarithmic scale for mid-range values', () => {
      // log10(10) = 1, log10(100000) = 5
      // log10(100) = 2 → (2-1)/(5-1) = 0.25
      expect(normalizeSearchVolume(100)).toBeCloseTo(0.25, 2);

      // log10(1000) = 3 → (3-1)/(5-1) = 0.5
      expect(normalizeSearchVolume(1000)).toBeCloseTo(0.5, 2);

      // log10(10000) = 4 → (4-1)/(5-1) = 0.75
      expect(normalizeSearchVolume(10000)).toBeCloseTo(0.75, 2);
    });

    it('should return 0.0 for volume below minimum', () => {
      expect(normalizeSearchVolume(5)).toBe(0.0);
    });

    it('should return 1.0 for volume above maximum', () => {
      expect(normalizeSearchVolume(200000)).toBe(1.0);
    });
  });

  describe('normalizeSEODifficulty', () => {
    it('should return 1.0 for difficulty 0 (easiest)', () => {
      expect(normalizeSEODifficulty(0, 'LOW')).toBe(1.0);
    });

    it('should return 0.0 for difficulty 100 (hardest)', () => {
      expect(normalizeSEODifficulty(100, 'HIGH')).toBe(0.0);
    });

    it('should return 0.5 for difficulty 50 (medium)', () => {
      expect(normalizeSEODifficulty(50, 'MEDIUM')).toBe(0.5);
    });

    it('should estimate difficulty from competition level when competitionIndex is undefined', () => {
      // LOW → 25 → score 0.75
      expect(normalizeSEODifficulty(undefined, 'LOW')).toBe(0.75);

      // MEDIUM → 50 → score 0.5
      expect(normalizeSEODifficulty(undefined, 'MEDIUM')).toBe(0.5);

      // HIGH → 75 → score 0.25
      expect(normalizeSEODifficulty(undefined, 'HIGH')).toBe(0.25);
    });

    it('should prefer competitionIndex over competition level', () => {
      // competitionIndex가 있으면 competition은 무시
      expect(normalizeSEODifficulty(30, 'HIGH')).toBe(0.7);
    });

    it('should clamp difficulty values to 0-100 range', () => {
      expect(normalizeSEODifficulty(-10, 'LOW')).toBe(1.0);
      expect(normalizeSEODifficulty(150, 'HIGH')).toBe(0.0);
    });
  });

  describe('normalizeKeywordData', () => {
    it('should normalize all metrics correctly', () => {
      const data: KeywordData = {
        keyword: 'test keyword',
        searchVolume: 1000,
        cpc: 5.0,
        competition: 'MEDIUM',
        competitionIndex: 50,
      };

      const metrics = normalizeKeywordData(data);

      expect(metrics.searchVolumeScore).toBeCloseTo(0.5, 2);
      expect(metrics.cpcScore).toBeCloseTo(0.5, 2);
      expect(metrics.competitionScore).toBe(0.5);
    });

    it('should handle missing competitionIndex', () => {
      const data: KeywordData = {
        keyword: 'test keyword',
        searchVolume: 100,
        cpc: 2.5,
        competition: 'LOW',
      };

      const metrics = normalizeKeywordData(data);

      expect(metrics.searchVolumeScore).toBeCloseTo(0.25, 2);
      expect(metrics.cpcScore).toBeCloseTo(0.249, 2);
      expect(metrics.competitionScore).toBe(0.75); // LOW → 25 → 0.75
    });
  });

  describe('calculateRevenueScore', () => {
    it('should calculate weighted score with correct weights (CPC 35%, Volume 35%, SEO 30%)', () => {
      const data: KeywordData = {
        keyword: 'test keyword',
        searchVolume: 1000, // normalized: 0.5
        cpc: 5.0, // normalized: 0.5
        competition: 'MEDIUM',
        competitionIndex: 50, // normalized: 0.5
      };

      const score = calculateRevenueScore(data);

      // Weighted score = 0.5*0.35 + 0.5*0.35 + 0.5*0.3 = 0.5
      // Total score = 0.5 * 100 = 50
      expect(score.totalScore).toBe(50);
      expect(score.keyword).toBe('test keyword');
    });

    it('should return score in 0-100 range', () => {
      const lowScore: KeywordData = {
        keyword: 'low score',
        searchVolume: 10,
        cpc: 0.01,
        competition: 'HIGH',
        competitionIndex: 100,
      };

      const highScore: KeywordData = {
        keyword: 'high score',
        searchVolume: 100000,
        cpc: 10.0,
        competition: 'LOW',
        competitionIndex: 0,
      };

      const low = calculateRevenueScore(lowScore);
      const high = calculateRevenueScore(highScore);

      expect(low.totalScore).toBeGreaterThanOrEqual(0);
      expect(low.totalScore).toBeLessThanOrEqual(100);
      expect(high.totalScore).toBeGreaterThanOrEqual(0);
      expect(high.totalScore).toBeLessThanOrEqual(100);
      expect(high.totalScore).toBeGreaterThan(low.totalScore);
    });

    it('should include normalized metrics', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.5,
        competition: 'LOW',
        competitionIndex: 25,
      };

      const score = calculateRevenueScore(data);

      expect(score.metrics).toBeDefined();
      expect(score.metrics.searchVolumeScore).toBeCloseTo(0.5, 2);
      expect(score.metrics.cpcScore).toBeCloseTo(0.249, 2);
      expect(score.metrics.competitionScore).toBe(0.75);
    });

    it('should include revenue estimates', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const score = calculateRevenueScore(data);

      expect(score.expectedRevenue).toBeDefined();
      expect(score.expectedRevenue.conservative).toBeGreaterThan(0);
      expect(score.expectedRevenue.optimistic).toBeGreaterThan(0);
      expect(score.expectedRevenue.optimistic).toBeGreaterThan(
        score.expectedRevenue.conservative
      );
    });

    it('should initialize ranking fields to 0', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const score = calculateRevenueScore(data);

      expect(score.ranking.overall).toBe(0);
      expect(score.ranking.byVolume).toBe(0);
      expect(score.ranking.byRevenue).toBe(0);
    });
  });

  describe('estimateRevenue', () => {
    it('should calculate conservative revenue (Top 10, 1% ad CTR)', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const { conservative } = estimateRevenue(data);

      // Traffic: 1000 * 0.15 (Top 10 CTR) = 150
      // Revenue: 150 * 0.01 (ad CTR) * 2.0 (CPC) = 3.0
      expect(conservative).toBeCloseTo(3.0, 2);
    });

    it('should calculate optimistic revenue (Top 3, 3% ad CTR)', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const { optimistic } = estimateRevenue(data);

      // Traffic: 1000 * 0.3 (Top 3 CTR) = 300
      // Revenue: 300 * 0.03 (ad CTR) * 2.0 (CPC) = 18.0
      expect(optimistic).toBeCloseTo(18.0, 2);
    });

    it('should return optimistic > conservative', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const { conservative, optimistic } = estimateRevenue(data);

      expect(optimistic).toBeGreaterThan(conservative);
    });

    it('should scale revenue with search volume', () => {
      const low: KeywordData = {
        keyword: 'low volume',
        searchVolume: 100,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const high: KeywordData = {
        keyword: 'high volume',
        searchVolume: 10000,
        cpc: 2.0,
        competition: 'MEDIUM',
      };

      const lowRevenue = estimateRevenue(low);
      const highRevenue = estimateRevenue(high);

      expect(highRevenue.conservative).toBeGreaterThan(lowRevenue.conservative);
      expect(highRevenue.optimistic).toBeGreaterThan(lowRevenue.optimistic);
    });

    it('should scale revenue with CPC', () => {
      const lowCPC: KeywordData = {
        keyword: 'low cpc',
        searchVolume: 1000,
        cpc: 0.5,
        competition: 'MEDIUM',
      };

      const highCPC: KeywordData = {
        keyword: 'high cpc',
        searchVolume: 1000,
        cpc: 5.0,
        competition: 'MEDIUM',
      };

      const lowRevenue = estimateRevenue(lowCPC);
      const highRevenue = estimateRevenue(highCPC);

      expect(highRevenue.conservative).toBeGreaterThan(lowRevenue.conservative);
      expect(highRevenue.optimistic).toBeGreaterThan(lowRevenue.optimistic);
    });

    it('should round to 2 decimal places', () => {
      const data: KeywordData = {
        keyword: 'test',
        searchVolume: 1000,
        cpc: 1.23,
        competition: 'MEDIUM',
      };

      const { conservative, optimistic } = estimateRevenue(data);

      // Check that values have at most 2 decimal places
      expect(conservative).toBe(parseFloat(conservative.toFixed(2)));
      expect(optimistic).toBe(parseFloat(optimistic.toFixed(2)));
    });
  });

  describe('calculateRevenueScores', () => {
    const mockKeywords: KeywordData[] = [
      {
        keyword: 'wordpress plugin',
        searchVolume: 10000,
        cpc: 5.0,
        competition: 'HIGH',
        competitionIndex: 80,
      },
      {
        keyword: 'react hooks',
        searchVolume: 50000,
        cpc: 3.0,
        competition: 'MEDIUM',
        competitionIndex: 50,
      },
      {
        keyword: 'typescript tutorial',
        searchVolume: 5000,
        cpc: 2.0,
        competition: 'LOW',
        competitionIndex: 20,
      },
    ];

    it('should calculate scores for all keywords', () => {
      const scores = calculateRevenueScores(mockKeywords);

      expect(scores).toHaveLength(3);
      scores.forEach((score) => {
        expect(score.totalScore).toBeGreaterThanOrEqual(0);
        expect(score.totalScore).toBeLessThanOrEqual(100);
      });
    });

    it('should assign overall ranking by total score', () => {
      const scores = calculateRevenueScores(mockKeywords);

      // Find the highest scored keyword
      const topScore = Math.max(...scores.map((s) => s.totalScore));
      const topKeyword = scores.find((s) => s.totalScore === topScore);

      expect(topKeyword?.ranking.overall).toBe(1);

      // All rankings should be unique and sequential
      const rankings = scores.map((s) => s.ranking.overall).sort();
      expect(rankings).toEqual([1, 2, 3]);
    });

    it('should assign volume ranking by search volume', () => {
      const scores = calculateRevenueScores(mockKeywords);

      // 'react hooks' has highest volume (50000)
      const reactHooks = scores.find((s) => s.keyword === 'react hooks');
      expect(reactHooks?.ranking.byVolume).toBe(1);

      // 'typescript tutorial' has lowest volume (5000)
      const typescript = scores.find((s) => s.keyword === 'typescript tutorial');
      expect(typescript?.ranking.byVolume).toBe(3);
    });

    it('should assign revenue ranking by optimistic revenue', () => {
      const scores = calculateRevenueScores(mockKeywords);

      // All rankings should be assigned
      scores.forEach((score) => {
        expect(score.ranking.byRevenue).toBeGreaterThan(0);
        expect(score.ranking.byRevenue).toBeLessThanOrEqual(3);
      });

      // Rankings should be unique
      const revenueRankings = scores.map((s) => s.ranking.byRevenue);
      const uniqueRankings = new Set(revenueRankings);
      expect(uniqueRankings.size).toBe(3);
    });

    it('should handle empty array', () => {
      const scores = calculateRevenueScores([]);
      expect(scores).toEqual([]);
    });

    it('should handle single keyword', () => {
      const single = [mockKeywords[0]];
      const scores = calculateRevenueScores(single);

      expect(scores).toHaveLength(1);
      expect(scores[0].ranking.overall).toBe(1);
      expect(scores[0].ranking.byVolume).toBe(1);
      expect(scores[0].ranking.byRevenue).toBe(1);
    });
  });
});
