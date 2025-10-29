/**
 * 주제 추천 로직 유닛 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  generateTopicSuggestions,
  filterByPriority,
  getTopSuggestions,
} from './topic-suggestion';
import type { ScoredTrendingTopic, TrendingTopic } from '@blog/shared';

describe('Topic Suggestion Module', () => {
  // 목 데이터 생성
  const mockTopic1: TrendingTopic = {
    id: 'reddit-1',
    title: 'React 18 새로운 기능 소개',
    url: 'https://reddit.com/r/programming/1',
    source: 'reddit',
    score: 500,
    comments: 150,
    author: 'user1',
    createdAt: new Date('2025-01-15T10:00:00Z'),
    subreddit: 'programming',
  };

  const mockTopic2: TrendingTopic = {
    id: 'hn-2',
    title: 'TypeScript 5.0 릴리스',
    url: 'https://news.ycombinator.com/item?id=2',
    source: 'hackernews',
    score: 300,
    comments: 80,
    author: 'user2',
    createdAt: new Date('2025-01-14T10:00:00Z'),
  };

  const mockTopic3: TrendingTopic = {
    id: 'reddit-3',
    title: 'Node.js 최적화 팁',
    url: 'https://reddit.com/r/programming/3',
    source: 'reddit',
    score: 100,
    comments: 30,
    author: 'user3',
    createdAt: new Date('2025-01-13T10:00:00Z'),
    subreddit: 'node',
  };

  const mockScoredTopics: ScoredTrendingTopic[] = [
    {
      topic: mockTopic1,
      finalScore: 85.5,
      scoreBreakdown: {
        upvotes: 80,
        comments: 90,
        recency: 95,
        keywordMatch: 70,
      },
      revenueData: {
        keyword: 'React 18 새로운 기능',
        searchVolume: 10000,
        cpc: 5.0,
        competition: 'MEDIUM',
        competitionIndex: 50,
      },
      revenueScore: {
        keyword: 'React 18 새로운 기능',
        totalScore: 75,
        metrics: {
          searchVolumeScore: 0.75,
          cpcScore: 0.5,
          competitionScore: 0.5,
        },
        expectedRevenue: {
          conservative: 75.0,
          optimistic: 450.0,
        },
        ranking: {
          overall: 1,
          byVolume: 1,
          byRevenue: 1,
        },
      },
    },
    {
      topic: mockTopic2,
      finalScore: 65.3,
      scoreBreakdown: {
        upvotes: 60,
        comments: 70,
        recency: 80,
        keywordMatch: 50,
      },
      revenueData: {
        keyword: 'TypeScript 5.0 릴리스',
        searchVolume: 5000,
        cpc: 3.0,
        competition: 'LOW',
        competitionIndex: 25,
      },
      revenueScore: {
        keyword: 'TypeScript 5.0 릴리스',
        totalScore: 55,
        metrics: {
          searchVolumeScore: 0.5,
          cpcScore: 0.3,
          competitionScore: 0.75,
        },
        expectedRevenue: {
          conservative: 22.5,
          optimistic: 135.0,
        },
        ranking: {
          overall: 2,
          byVolume: 2,
          byRevenue: 2,
        },
      },
    },
    {
      topic: mockTopic3,
      finalScore: 35.2,
      scoreBreakdown: {
        upvotes: 20,
        comments: 30,
        recency: 40,
        keywordMatch: 60,
      },
      revenueData: {
        keyword: 'Node.js 최적화 팁',
        searchVolume: 1000,
        cpc: 1.5,
        competition: 'HIGH',
        competitionIndex: 80,
      },
      revenueScore: {
        keyword: 'Node.js 최적화 팁',
        totalScore: 30,
        metrics: {
          searchVolumeScore: 0.25,
          cpcScore: 0.15,
          competitionScore: 0.2,
        },
        expectedRevenue: {
          conservative: 2.25,
          optimistic: 13.5,
        },
        ranking: {
          overall: 3,
          byVolume: 3,
          byRevenue: 3,
        },
      },
    },
  ];

  describe('generateTopicSuggestions', () => {
    it('should generate suggestions for all topics', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].topic.id).toBe('reddit-1');
    });

    it('should calculate combined scores with correct weights (40% trend, 30% revenue, 20% SEO, 10% relevance)', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      // 첫 번째 토픽: trendScore=85.5, revenueScore=75, seoScore=50, relevanceScore=50
      // combinedScore = 85.5*0.4 + 75*0.3 + 50*0.2 + 50*0.1 = 34.2 + 22.5 + 10 + 5 = 71.7
      expect(suggestions[0].combinedScore).toBeCloseTo(71.7, 1);

      // 점수 세부사항 검증
      expect(suggestions[0].scoreBreakdown.trendScore).toBe(85.5);
      expect(suggestions[0].scoreBreakdown.revenueScore).toBe(75);
      expect(suggestions[0].scoreBreakdown.seoScore).toBe(50);
    });

    it('should assign correct priorities based on combined score', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      // High priority: >= 70
      expect(suggestions[0].priority).toBe('high');
      expect(suggestions[0].combinedScore).toBeGreaterThanOrEqual(70);

      // Medium priority: 50-70
      const mediumSuggestion = suggestions.find((s) => s.priority === 'medium');
      if (mediumSuggestion) {
        expect(mediumSuggestion.combinedScore).toBeGreaterThanOrEqual(50);
        expect(mediumSuggestion.combinedScore).toBeLessThan(70);
      }

      // Low priority: < 50
      const lowSuggestion = suggestions.find((s) => s.priority === 'low');
      if (lowSuggestion) {
        expect(lowSuggestion.combinedScore).toBeLessThan(50);
      }
    });

    it('should sort suggestions by combined score (descending)', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].combinedScore).toBeGreaterThanOrEqual(
          suggestions[i + 1].combinedScore
        );
      }
    });

    it('should generate recommendation reasons', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      suggestions.forEach((suggestion) => {
        expect(suggestion.reason).toBeTruthy();
        expect(typeof suggestion.reason).toBe('string');
        expect(suggestion.reason.length).toBeGreaterThan(0);
      });
    });

    it('should include revenue estimates', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      suggestions.forEach((suggestion) => {
        expect(suggestion.estimatedRevenue).toBeDefined();
        expect(suggestion.estimatedRevenue!.conservative).toBeGreaterThan(0);
        expect(suggestion.estimatedRevenue!.optimistic).toBeGreaterThan(0);
        expect(suggestion.estimatedRevenue!.optimistic).toBeGreaterThan(
          suggestion.estimatedRevenue!.conservative
        );
      });
    });

    it('should calculate relevance score based on keyword matching', () => {
      const keywords = ['React', 'TypeScript'];
      const suggestions = generateTopicSuggestions(mockScoredTopics, keywords);

      // 'React 18 새로운 기능' contains 'React'
      const reactSuggestion = suggestions.find(
        (s) => s.topic.title.includes('React')
      );
      expect(reactSuggestion?.scoreBreakdown.relevanceScore).toBeGreaterThan(0);

      // 'TypeScript 5.0 릴리스' contains 'TypeScript'
      const tsSuggestion = suggestions.find(
        (s) => s.topic.title.includes('TypeScript')
      );
      expect(tsSuggestion?.scoreBreakdown.relevanceScore).toBeGreaterThan(0);

      // 'Node.js 최적화 팁' doesn't contain any keyword
      const nodeSuggestion = suggestions.find(
        (s) => s.topic.title.includes('Node.js')
      );
      expect(nodeSuggestion?.scoreBreakdown.relevanceScore).toBe(0);
    });

    it('should use neutral relevance score (50) when no keywords provided', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics, []);

      suggestions.forEach((suggestion) => {
        expect(suggestion.scoreBreakdown.relevanceScore).toBe(50);
      });
    });

    it('should handle empty input', () => {
      const suggestions = generateTopicSuggestions([]);

      expect(suggestions).toEqual([]);
    });

    it('should include revenue data in suggestions', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      suggestions.forEach((suggestion) => {
        expect(suggestion.revenueData).toBeDefined();
        expect(suggestion.revenueData!.keyword).toBeTruthy();
        expect(suggestion.revenueData!.searchVolume).toBeGreaterThan(0);
        expect(suggestion.revenueData!.cpc).toBeGreaterThan(0);
      });
    });

    it('should round combined scores to 2 decimal places', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      suggestions.forEach((suggestion) => {
        const scoreStr = suggestion.combinedScore.toString();
        const decimalPart = scoreStr.split('.')[1];
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });
    });

    it('should include high priority indicator in reason for high priority topics', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);

      const highPrioritySuggestions = suggestions.filter(
        (s) => s.priority === 'high'
      );

      highPrioritySuggestions.forEach((suggestion) => {
        expect(suggestion.reason).toContain('우선 작성 권장');
      });
    });
  });

  describe('filterByPriority', () => {
    it('should filter suggestions by high priority', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const highPriority = filterByPriority(suggestions, 'high');

      highPriority.forEach((suggestion) => {
        expect(suggestion.priority).toBe('high');
        expect(suggestion.combinedScore).toBeGreaterThanOrEqual(70);
      });
    });

    it('should filter suggestions by medium priority', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const mediumPriority = filterByPriority(suggestions, 'medium');

      mediumPriority.forEach((suggestion) => {
        expect(suggestion.priority).toBe('medium');
        expect(suggestion.combinedScore).toBeGreaterThanOrEqual(50);
        expect(suggestion.combinedScore).toBeLessThan(70);
      });
    });

    it('should filter suggestions by low priority', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const lowPriority = filterByPriority(suggestions, 'low');

      lowPriority.forEach((suggestion) => {
        expect(suggestion.priority).toBe('low');
        expect(suggestion.combinedScore).toBeLessThan(50);
      });
    });

    it('should return empty array when no matches', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      // 모든 항목을 high로 만들기 위해 새로운 배열 생성
      const allHighSuggestions = suggestions.map((s) => ({
        ...s,
        priority: 'high' as const,
      }));

      const lowPriority = filterByPriority(allHighSuggestions, 'low');
      expect(lowPriority).toEqual([]);
    });
  });

  describe('getTopSuggestions', () => {
    it('should return top N suggestions', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const top2 = getTopSuggestions(suggestions, 2);

      expect(top2).toHaveLength(2);
      expect(top2[0].combinedScore).toBeGreaterThanOrEqual(top2[1].combinedScore);
    });

    it('should return all suggestions when limit exceeds array length', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const top10 = getTopSuggestions(suggestions, 10);

      expect(top10).toHaveLength(suggestions.length);
    });

    it('should return empty array when limit is 0', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const top0 = getTopSuggestions(suggestions, 0);

      expect(top0).toEqual([]);
    });

    it('should maintain sort order', () => {
      const suggestions = generateTopicSuggestions(mockScoredTopics);
      const top3 = getTopSuggestions(suggestions, 3);

      for (let i = 0; i < top3.length - 1; i++) {
        expect(top3[i].combinedScore).toBeGreaterThanOrEqual(
          top3[i + 1].combinedScore
        );
      }
    });
  });
});
