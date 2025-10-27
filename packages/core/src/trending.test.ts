/**
 * 트렌드 모니터링 모듈 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TrendingMonitor,
  getTrendingTopics,
  getTrendingTopicsWithScores,
} from './trending';
import type { TrendingTopic, TrendingOptions } from '@blog/shared';

// axios 모듈 모킹
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('TrendingMonitor', () => {
  let monitor: TrendingMonitor;
  let mockAxios: any;

  beforeEach(async () => {
    monitor = new TrendingMonitor();
    mockAxios = (await import('axios')).default;
    vi.clearAllMocks();
  });

  describe('fetchRedditTopics', () => {
    it('should fetch trending topics from Reddit', async () => {
      const mockRedditResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'abc123',
                  title: 'New JavaScript Framework Released',
                  permalink: '/r/programming/comments/abc123/new_framework',
                  ups: 150,
                  num_comments: 45,
                  author: 'testuser',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'def456',
                  title: 'Best Practices for React Hooks',
                  permalink: '/r/programming/comments/def456/react_hooks',
                  ups: 200,
                  num_comments: 60,
                  author: 'anotheruser',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockRedditResponse);

      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
        limit: 10,
      });

      expect(topics.length).toBe(2);
      expect(topics[0].title).toBe('New JavaScript Framework Released');
      expect(topics[0].source).toBe('reddit');
      expect(topics[0].score).toBe(150);
      expect(topics[0].comments).toBe(45);
      expect(topics[0].subreddit).toBe('programming');
    });

    it('should handle Reddit API errors gracefully', async () => {
      vi.mocked(mockAxios.get).mockRejectedValue(new Error('Network error'));

      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
      });

      // 에러 발생 시 빈 배열 반환
      expect(topics).toEqual([]);
    });
  });

  describe('fetchHackerNewsTopics', () => {
    it('should fetch trending topics from Hacker News', async () => {
      const mockTopStoriesResponse = {
        data: [12345, 67890],
      };

      const mockStory1 = {
        data: {
          id: 12345,
          title: 'Show HN: My New Project',
          url: 'https://example.com/project',
          score: 300,
          descendants: 80,
          by: 'hnuser',
          time: Date.now() / 1000,
        },
      };

      const mockStory2 = {
        data: {
          id: 67890,
          title: 'Ask HN: What are you working on?',
          url: undefined,
          score: 150,
          descendants: 120,
          by: 'asker',
          time: Date.now() / 1000,
        },
      };

      vi.mocked(mockAxios.get)
        .mockResolvedValueOnce(mockTopStoriesResponse)
        .mockResolvedValueOnce(mockStory1)
        .mockResolvedValueOnce(mockStory2);

      const topics = await monitor.getTrendingTopics({
        sources: ['hackernews'],
        limit: 2,
      });

      expect(topics.length).toBe(2);
      expect(topics[0].title).toBe('Show HN: My New Project');
      expect(topics[0].source).toBe('hackernews');
      expect(topics[0].score).toBe(300);
      expect(topics[0].url).toBe('https://example.com/project');
      expect(topics[1].url).toContain('news.ycombinator.com');
    });

    it('should handle Hacker News API errors gracefully', async () => {
      vi.mocked(mockAxios.get).mockRejectedValue(
        new Error('HN API down')
      );

      const topics = await monitor.getTrendingTopics({
        sources: ['hackernews'],
      });

      expect(topics).toEqual([]);
    });
  });

  describe('fetchTwitterTopics', () => {
    it('should fetch trending topics from Twitter with bearer token', async () => {
      process.env.TWITTER_BEARER_TOKEN = 'test-bearer-token';

      const mockTwitterResponse = {
        data: {
          data: [
            {
              id: '1234567890',
              text: 'Exciting new features in #TypeScript 5.0! #programming',
              created_at: new Date().toISOString(),
              public_metrics: {
                like_count: 500,
                reply_count: 50,
              },
              author_id: 'author123',
            },
          ],
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockTwitterResponse);

      const topics = await monitor.getTrendingTopics({
        sources: ['twitter'],
        limit: 10,
      });

      expect(topics.length).toBe(1);
      expect(topics[0].source).toBe('twitter');
      expect(topics[0].score).toBe(500);
      expect(topics[0].comments).toBe(50);
      expect(topics[0].hashtags).toContain('TypeScript');
      expect(topics[0].hashtags).toContain('programming');

      delete process.env.TWITTER_BEARER_TOKEN;
    });

    it('should return empty array without bearer token', async () => {
      delete process.env.TWITTER_BEARER_TOKEN;

      const topics = await monitor.getTrendingTopics({
        sources: ['twitter'],
      });

      expect(topics).toEqual([]);
    });
  });

  describe('getTrendingTopics with filters', () => {
    it('should filter by minimum score', async () => {
      const mockRedditResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'high',
                  title: 'High Score Post',
                  permalink: '/r/programming/comments/high',
                  ups: 500,
                  num_comments: 100,
                  author: 'user1',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'low',
                  title: 'Low Score Post',
                  permalink: '/r/programming/comments/low',
                  ups: 10,
                  num_comments: 5,
                  author: 'user2',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockRedditResponse);

      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
        minScore: 100,
      });

      expect(topics.length).toBe(1);
      expect(topics[0].title).toBe('High Score Post');
    });

    it('should filter by keywords', async () => {
      const mockRedditResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'match',
                  title: 'TypeScript Best Practices',
                  permalink: '/r/programming/comments/match',
                  ups: 100,
                  num_comments: 20,
                  author: 'user1',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'nomatch',
                  title: 'Python Tutorial',
                  permalink: '/r/programming/comments/nomatch',
                  ups: 150,
                  num_comments: 30,
                  author: 'user2',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockRedditResponse);

      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
        keywords: ['TypeScript'],
      });

      expect(topics.length).toBe(1);
      expect(topics[0].title).toBe('TypeScript Best Practices');
    });

    it('should filter with multiple keywords', async () => {
      const mockRedditResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'ts',
                  title: 'TypeScript Guide',
                  permalink: '/r/programming/comments/ts',
                  ups: 100,
                  num_comments: 20,
                  author: 'user1',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'react',
                  title: 'React Hooks Tutorial',
                  permalink: '/r/programming/comments/react',
                  ups: 150,
                  num_comments: 30,
                  author: 'user2',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'python',
                  title: 'Python Basics',
                  permalink: '/r/programming/comments/python',
                  ups: 120,
                  num_comments: 25,
                  author: 'user3',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockRedditResponse);

      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
        keywords: ['TypeScript', 'React'],
      });

      expect(topics.length).toBe(2);
    });
  });

  describe('calculateTrendScore', () => {
    it('should calculate trend score correctly', () => {
      const topic: TrendingTopic = {
        id: 'test-1',
        title: 'Test Topic',
        url: 'https://example.com',
        source: 'reddit',
        score: 100,
        comments: 50,
        createdAt: new Date(),
      };

      const trendScore = monitor.calculateTrendScore(topic);

      expect(trendScore.topic).toBe(topic);
      expect(trendScore.finalScore).toBeGreaterThan(0);
      expect(trendScore.scoreBreakdown.upvotes).toBeDefined();
      expect(trendScore.scoreBreakdown.comments).toBeDefined();
      expect(trendScore.scoreBreakdown.recency).toBeDefined();
      expect(trendScore.scoreBreakdown.keywordMatch).toBe(0);
    });

    it('should give high recency score to new topics', () => {
      const newTopic: TrendingTopic = {
        id: 'new',
        title: 'New Topic',
        url: 'https://example.com',
        source: 'reddit',
        score: 50,
        comments: 10,
        createdAt: new Date(),
      };

      const oldTopic: TrendingTopic = {
        id: 'old',
        title: 'Old Topic',
        url: 'https://example.com',
        source: 'reddit',
        score: 50,
        comments: 10,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48시간 전
      };

      const newScore = monitor.calculateTrendScore(newTopic);
      const oldScore = monitor.calculateTrendScore(oldTopic);

      expect(newScore.scoreBreakdown.recency).toBeGreaterThan(
        oldScore.scoreBreakdown.recency
      );
    });

    it('should boost score for keyword matches', () => {
      const topic: TrendingTopic = {
        id: 'test',
        title: 'TypeScript and React Best Practices',
        url: 'https://example.com',
        source: 'reddit',
        score: 100,
        comments: 50,
        createdAt: new Date(),
      };

      const scoreWithKeywords = monitor.calculateTrendScore(topic, [
        'TypeScript',
        'React',
      ]);
      const scoreWithoutKeywords = monitor.calculateTrendScore(topic, []);

      expect(scoreWithKeywords.scoreBreakdown.keywordMatch).toBe(100);
      expect(scoreWithoutKeywords.scoreBreakdown.keywordMatch).toBe(0);
      expect(scoreWithKeywords.finalScore).toBeGreaterThan(
        scoreWithoutKeywords.finalScore
      );
    });

    it('should handle partial keyword matches', () => {
      const topic: TrendingTopic = {
        id: 'test',
        title: 'TypeScript Guide',
        url: 'https://example.com',
        source: 'reddit',
        score: 100,
        comments: 50,
        createdAt: new Date(),
      };

      const score = monitor.calculateTrendScore(topic, [
        'TypeScript',
        'React',
        'Vue',
      ]);

      // 3개 중 1개 매칭 = 33.33%
      expect(score.scoreBreakdown.keywordMatch).toBeCloseTo(33.33, 1);
    });
  });

  describe('getTrendingTopicsWithScores', () => {
    it('should return sorted topics by score', async () => {
      const mockRedditResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'low',
                  title: 'Low Engagement',
                  permalink: '/r/programming/comments/low',
                  ups: 10,
                  num_comments: 5,
                  author: 'user1',
                  created_utc: (Date.now() - 24 * 60 * 60 * 1000) / 1000,
                  subreddit: 'programming',
                },
              },
              {
                data: {
                  id: 'high',
                  title: 'High Engagement',
                  permalink: '/r/programming/comments/high',
                  ups: 500,
                  num_comments: 200,
                  author: 'user2',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockRedditResponse);

      const scoredTopics = await monitor.getTrendingTopicsWithScores({
        sources: ['reddit'],
      });

      expect(scoredTopics.length).toBe(2);
      // 첫 번째 토픽이 더 높은 점수를 가져야 함
      expect(scoredTopics[0].finalScore).toBeGreaterThan(
        scoredTopics[1].finalScore
      );
      expect(scoredTopics[0].topic.title).toBe('High Engagement');
    });
  });

  describe('Helper Functions', () => {
    it('getTrendingTopics helper should work', async () => {
      const mockResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'test',
                  title: 'Test Post',
                  permalink: '/r/programming/comments/test',
                  ups: 100,
                  num_comments: 20,
                  author: 'testuser',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockResponse);

      const topics = await getTrendingTopics({ sources: ['reddit'] });

      expect(topics.length).toBe(1);
      expect(topics[0].title).toBe('Test Post');
    });

    it('getTrendingTopicsWithScores helper should work', async () => {
      const mockResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  id: 'test',
                  title: 'Test Post',
                  permalink: '/r/programming/comments/test',
                  ups: 100,
                  num_comments: 20,
                  author: 'testuser',
                  created_utc: Date.now() / 1000,
                  subreddit: 'programming',
                },
              },
            ],
          },
        },
      };

      vi.mocked(mockAxios.get).mockResolvedValue(mockResponse);

      const scoredTopics = await getTrendingTopicsWithScores({
        sources: ['reddit'],
      });

      expect(scoredTopics.length).toBe(1);
      expect(scoredTopics[0].finalScore).toBeGreaterThan(0);
    });
  });
});
