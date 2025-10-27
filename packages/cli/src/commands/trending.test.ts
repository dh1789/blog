/**
 * blog trending 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TrendScore } from '@blog/shared';

// getTrendingTopicsWithScores 모킹
const mockGetTrendingTopicsWithScores = vi.fn();

// @blog/core 모듈 모킹
vi.mock('@blog/core', () => {
  return {
    TrendingMonitor: vi.fn().mockImplementation(() => ({
      getTrendingTopicsWithScores: mockGetTrendingTopicsWithScores,
    })),
  };
});

describe('trending command', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // console.log, console.error 스파이
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // process.exit 스파이
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('기본 동작', () => {
    it('should fetch and display trending topics', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'New TypeScript Features',
            url: 'https://reddit.com/r/programming/1',
            source: 'reddit',
            score: 500,
            comments: 100,
            author: 'user1',
            createdAt: new Date(),
            subreddit: 'programming',
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 100,
            comments: 100,
            recency: 90,
            keywordMatch: 0,
          },
        },
        {
          topic: {
            id: 'hn-2',
            title: 'Show HN: My New Project',
            url: 'https://news.ycombinator.com/item?id=2',
            source: 'hackernews',
            score: 300,
            comments: 80,
            author: 'hnuser',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
          },
          finalScore: 72.3,
          scoreBreakdown: {
            upvotes: 60,
            comments: 80,
            recency: 85,
            keywordMatch: 0,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({});

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith({
        sources: ['reddit', 'hackernews'],
        limit: 10,
        minScore: 0,
        keywords: [],
        language: 'ko',
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('트렌딩 토픽');
      expect(output).toContain('New TypeScript Features');
      expect(output).toContain('Show HN: My New Project');
    });

    it('should handle empty results', async () => {
      const { trendingCommand } = await import('./trending');

      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({});

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('조건에 맞는 트렌드 토픽이 없습니다');
    });
  });

  describe('옵션 처리', () => {
    it('should parse sources option', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        sources: 'reddit,twitter',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: ['reddit', 'twitter'],
        })
      );
    });

    it('should parse limit option', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        limit: '20',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it('should parse minScore option', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        minScore: '50',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith(
        expect.objectContaining({
          minScore: 50,
        })
      );
    });

    it('should parse keywords option', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        keywords: 'TypeScript,React,Vue',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ['TypeScript', 'React', 'Vue'],
        })
      );
    });

    it('should parse language option', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        language: 'en',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'en',
        })
      );
    });

    it('should handle multiple options together', async () => {
      const { trendingCommand } = await import('./trending');
      mockGetTrendingTopicsWithScores.mockResolvedValue([]);

      await trendingCommand({
        sources: 'reddit',
        limit: '5',
        keywords: 'TypeScript',
        minScore: '100',
        language: 'en',
      });

      expect(mockGetTrendingTopicsWithScores).toHaveBeenCalledWith({
        sources: ['reddit'],
        limit: 5,
        minScore: 100,
        keywords: ['TypeScript'],
        language: 'en',
      });
    });
  });

  describe('출력 포맷', () => {
    it('should display topic details correctly', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'test-1',
            title: 'Test Topic with Very Long Title That Should Be Truncated',
            url: 'https://example.com/very/long/url/that/should/also/be/truncated/to/fit/in/terminal',
            source: 'reddit',
            score: 250,
            comments: 75,
            author: 'testuser',
            createdAt: new Date(),
            subreddit: 'programming',
          },
          finalScore: 65.5,
          scoreBreakdown: {
            upvotes: 50,
            comments: 75,
            recency: 95,
            keywordMatch: 50,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({ keywords: 'TypeScript' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      // 제목 출력 확인
      expect(output).toContain('Test Topic');

      // 점수 출력 확인
      expect(output).toContain('65.5점');

      // 업보트/댓글 표시 확인
      expect(output).toContain('250');
      expect(output).toContain('75');

      // 서브레딧 표시 확인
      expect(output).toContain('r/programming');

      // 키워드 필터 시 세부 점수 표시 확인
      expect(output).toContain('세부:');
    });

    it('should display Twitter hashtags', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'twitter-1',
            title: 'Great article about #TypeScript and #React',
            url: 'https://twitter.com/i/web/status/123',
            source: 'twitter',
            score: 100,
            comments: 20,
            author: 'twitteruser',
            createdAt: new Date(),
            hashtags: ['TypeScript', 'React'],
          },
          finalScore: 55.0,
          scoreBreakdown: {
            upvotes: 20,
            comments: 40,
            recency: 100,
            keywordMatch: 0,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('#TypeScript');
      expect(output).toContain('#React');
    });

    it('should display summary statistics', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Topic 1',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 100,
            comments: 20,
            createdAt: new Date(),
          },
          finalScore: 80.0,
          scoreBreakdown: {
            upvotes: 100,
            comments: 40,
            recency: 100,
            keywordMatch: 0,
          },
        },
        {
          topic: {
            id: 'hn-1',
            title: 'Topic 2',
            url: 'https://news.ycombinator.com/1',
            source: 'hackernews',
            score: 200,
            comments: 50,
            createdAt: new Date(),
          },
          finalScore: 90.0,
          scoreBreakdown: {
            upvotes: 100,
            comments: 100,
            recency: 100,
            keywordMatch: 0,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('요약 통계');
      expect(output).toContain('평균 점수');
      expect(output).toContain('소스별');
      expect(output).toContain('reddit');
      expect(output).toContain('hackernews');
    });
  });

  describe('에러 처리', () => {
    it('should handle API errors gracefully', async () => {
      const { trendingCommand } = await import('./trending');

      mockGetTrendingTopicsWithScores.mockRejectedValue(
        new Error('API connection failed')
      );

      await trendingCommand({});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle network errors', async () => {
      const { trendingCommand } = await import('./trending');

      mockGetTrendingTopicsWithScores.mockRejectedValue(
        new Error('Network timeout')
      );

      await trendingCommand({});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network timeout')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
