/**
 * blog trending 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TrendScore, ScoredTrendingTopic, SuggestedTopic } from '@blog/shared';
import fs from 'fs';

// getTrendingTopicsWithScores, getTrendingTopicsWithRevenue 모킹
const mockGetTrendingTopicsWithScores = vi.fn();
const mockGetTrendingTopicsWithRevenue = vi.fn();
const mockGenerateTopicSuggestions = vi.fn();

// @blog/core 모듈 모킹
vi.mock('@blog/core', () => {
  return {
    TrendingMonitor: vi.fn().mockImplementation(() => ({
      getTrendingTopicsWithScores: mockGetTrendingTopicsWithScores,
      getTrendingTopicsWithRevenue: mockGetTrendingTopicsWithRevenue,
    })),
    generateTopicSuggestions: mockGenerateTopicSuggestions,
  };
});

// fs 모듈 모킹
vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
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

  describe('수익성 분석 (--revenue)', () => {
    it('should call getTrendingTopicsWithRevenue when --revenue is enabled', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScoredTopicsWithRevenue: ScoredTrendingTopic[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'TypeScript 5.0 Release',
            url: 'https://reddit.com/r/programming/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
            subreddit: 'programming',
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
          revenueData: {
            keyword: 'TypeScript 5.0 Release',
            searchVolume: 10000,
            cpc: 5.0,
            competition: 'MEDIUM',
            competitionIndex: 50,
          },
          revenueScore: {
            keyword: 'TypeScript 5.0 Release',
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
      ];

      const mockSuggestions: SuggestedTopic[] = [
        {
          topic: mockScoredTopicsWithRevenue[0].topic,
          priority: 'high',
          combinedScore: 71.7,
          scoreBreakdown: {
            trendScore: 85.5,
            revenueScore: 75,
            seoScore: 50,
            relevanceScore: 50,
          },
          reason: '트렌드 점수 85.5, 수익 점수 75로 우수합니다. 우선 작성 권장',
          estimatedRevenue: {
            conservative: 75.0,
            optimistic: 450.0,
          },
          revenueData: mockScoredTopicsWithRevenue[0].revenueData,
        },
      ];

      mockGetTrendingTopicsWithRevenue.mockResolvedValue(mockScoredTopicsWithRevenue);
      mockGenerateTopicSuggestions.mockReturnValue(mockSuggestions);

      await trendingCommand({ revenue: true });

      expect(mockGetTrendingTopicsWithRevenue).toHaveBeenCalledWith({
        sources: ['reddit', 'hackernews'],
        limit: 10,
        minScore: 0,
        keywords: [],
        language: 'ko',
      });

      expect(mockGenerateTopicSuggestions).toHaveBeenCalledWith(
        mockScoredTopicsWithRevenue,
        []
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('주제 추천');
      expect(output).toContain('TypeScript 5.0 Release');
    });

    it('should display priority icons in revenue mode', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScoredTopicsWithRevenue: ScoredTrendingTopic[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'High Priority Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
          revenueData: {
            keyword: 'High Priority Topic',
            searchVolume: 10000,
            cpc: 5.0,
            competition: 'MEDIUM',
            competitionIndex: 50,
          },
          revenueScore: {
            keyword: 'High Priority Topic',
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
      ];

      const mockSuggestions: SuggestedTopic[] = [
        {
          topic: mockScoredTopicsWithRevenue[0].topic,
          priority: 'high',
          combinedScore: 71.7,
          scoreBreakdown: {
            trendScore: 85.5,
            revenueScore: 75,
            seoScore: 50,
            relevanceScore: 50,
          },
          reason: '우선 작성 권장',
          estimatedRevenue: {
            conservative: 75.0,
            optimistic: 450.0,
          },
        },
      ];

      mockGetTrendingTopicsWithRevenue.mockResolvedValue(mockScoredTopicsWithRevenue);
      mockGenerateTopicSuggestions.mockReturnValue(mockSuggestions);

      await trendingCommand({ revenue: true });

      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('HIGH');
    });

    it('should display revenue estimates in revenue mode', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScoredTopicsWithRevenue: ScoredTrendingTopic[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Revenue Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
          revenueData: {
            keyword: 'Revenue Topic',
            searchVolume: 10000,
            cpc: 5.0,
            competition: 'MEDIUM',
            competitionIndex: 50,
          },
          revenueScore: {
            keyword: 'Revenue Topic',
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
      ];

      const mockSuggestions: SuggestedTopic[] = [
        {
          topic: mockScoredTopicsWithRevenue[0].topic,
          priority: 'high',
          combinedScore: 71.7,
          scoreBreakdown: {
            trendScore: 85.5,
            revenueScore: 75,
            seoScore: 50,
            relevanceScore: 50,
          },
          reason: '우선 작성 권장',
          estimatedRevenue: {
            conservative: 75.0,
            optimistic: 450.0,
          },
        },
      ];

      mockGetTrendingTopicsWithRevenue.mockResolvedValue(mockScoredTopicsWithRevenue);
      mockGenerateTopicSuggestions.mockReturnValue(mockSuggestions);

      await trendingCommand({ revenue: true });

      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      expect(output).toContain('예상 수익');
      expect(output).toContain('$75');
      expect(output).toContain('$450');
    });
  });

  describe('출력 포맷 옵션 (--format)', () => {
    it('should output JSON format when --format json', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Test Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({ format: 'json' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      // JSON 형식 검증
      expect(() => JSON.parse(output)).not.toThrow();

      const jsonOutput = JSON.parse(output);
      expect(Array.isArray(jsonOutput)).toBe(true);
      expect(jsonOutput[0].topic.title).toBe('Test Topic');
    });

    it('should output table format by default', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Test Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call[0]).join('\n');

      // 테이블 형식 검증 (헤더 확인)
      expect(output).toContain('트렌딩 토픽');
      expect(output).not.toContain('"topic"');
      expect(output).not.toContain('"finalScore"');
    });
  });

  describe('파일 저장 옵션 (--output)', () => {
    it('should save results to file when --output is specified', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Test Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      const outputPath = '/tmp/test-output.json';
      await trendingCommand({ output: outputPath });

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = (fs.writeFileSync as any).mock.calls[0];

      expect(writeCall[0]).toBe(outputPath);
      expect(writeCall[1]).toBeTruthy();
      expect(writeCall[2]).toBe('utf-8');
    });

    it('should save JSON format when --output and --format json', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Test Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      await trendingCommand({
        output: '/tmp/output.json',
        format: 'json',
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeCall = (fs.writeFileSync as any).mock.calls[0];
      const content = writeCall[1];

      // JSON 파싱 가능한지 확인
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should create directory if not exists', async () => {
      const { trendingCommand } = await import('./trending');

      const mockScores: TrendScore[] = [
        {
          topic: {
            id: 'reddit-1',
            title: 'Test Topic',
            url: 'https://reddit.com/1',
            source: 'reddit',
            score: 500,
            comments: 150,
            author: 'user1',
            createdAt: new Date(),
          },
          finalScore: 85.5,
          scoreBreakdown: {
            upvotes: 80,
            comments: 90,
            recency: 95,
            keywordMatch: 70,
          },
        },
      ];

      mockGetTrendingTopicsWithScores.mockResolvedValue(mockScores);

      // 디렉토리가 없다고 모킹
      (fs.existsSync as any).mockReturnValue(false);

      await trendingCommand({
        output: '/tmp/new-dir/output.json',
      });

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });
});
