/**
 * 분석 대시보드 모듈 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsClient, getDashboard, getPostStats } from './analytics';
import type { WordPressConfig } from '@blog/shared';

// wpapi 모듈 모킹
vi.mock('wpapi', () => {
  return {
    default: vi.fn(),
  };
});

describe('AnalyticsClient', () => {
  let client: AnalyticsClient;
  let mockWPAPI: any;
  const mockConfig: WordPressConfig = {
    url: 'https://test-blog.com',
    username: 'testuser',
    password: 'testpass',
  };

  beforeEach(async () => {
    const WPAPI = (await import('wpapi')).default;

    // WordPress API 모킹
    mockWPAPI = {
      posts: vi.fn().mockReturnThis(),
      perPage: vi.fn().mockReturnThis(),
      get: vi.fn(),
      id: vi.fn().mockReturnThis(),
    };

    vi.mocked(WPAPI).mockReturnValue(mockWPAPI);

    client = new AnalyticsClient(mockConfig);
  });

  describe('getDashboard', () => {
    it('should fetch and process dashboard data', async () => {
      const mockPosts = [
        {
          id: 1,
          title: { rendered: 'Post 1' },
          link: 'https://test-blog.com/post-1',
          date: '2025-10-20T00:00:00',
          comment_count: 10,
        },
        {
          id: 2,
          title: { rendered: 'Post 2' },
          link: 'https://test-blog.com/post-2',
          date: '2025-10-25T00:00:00',
          comment_count: 5,
        },
        {
          id: 3,
          title: { rendered: 'Post 3' },
          link: 'https://test-blog.com/post-3',
          date: '2025-10-27T00:00:00',
          comment_count: 15,
        },
      ];

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard();

      expect(mockWPAPI.posts).toHaveBeenCalled();
      expect(mockWPAPI.perPage).toHaveBeenCalledWith(100);
      expect(dashboard.summary.totalPosts).toBe(3);
      expect(dashboard.summary.totalViews).toBeGreaterThan(0);
      expect(dashboard.summary.totalComments).toBe(30);
      expect(dashboard.topPosts).toBeDefined();
      expect(dashboard.recentPosts).toBeDefined();
      expect(dashboard.periodStats).toBeDefined();
    });

    it('should sort top posts by views', async () => {
      const mockPosts = [
        {
          id: 1,
          title: { rendered: 'Low Views' },
          link: 'https://test-blog.com/post-1',
          date: '2025-10-20T00:00:00',
          comment_count: 2,
        },
        {
          id: 2,
          title: { rendered: 'High Views' },
          link: 'https://test-blog.com/post-2',
          date: '2025-10-25T00:00:00',
          comment_count: 50,
        },
      ];

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard({ sortBy: 'views' });

      expect(dashboard.topPosts[0].title).toBe('High Views');
      expect(dashboard.topPosts[0].comments).toBe(50);
    });

    it('should sort recent posts by date', async () => {
      const mockPosts = [
        {
          id: 1,
          title: { rendered: 'Older Post' },
          link: 'https://test-blog.com/post-1',
          date: '2025-10-20T00:00:00',
          comment_count: 10,
        },
        {
          id: 2,
          title: { rendered: 'Newer Post' },
          link: 'https://test-blog.com/post-2',
          date: '2025-10-27T00:00:00',
          comment_count: 5,
        },
      ];

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard();

      expect(dashboard.recentPosts[0].title).toBe('Newer Post');
    });

    it('should limit results', async () => {
      const mockPosts = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: { rendered: `Post ${i + 1}` },
        link: `https://test-blog.com/post-${i + 1}`,
        date: '2025-10-20T00:00:00',
        comment_count: i,
      }));

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard({ limit: 5 });

      expect(dashboard.topPosts.length).toBe(5);
      expect(dashboard.recentPosts.length).toBe(5);
    });

    it('should filter by period', async () => {
      const now = new Date();
      const oldDate = new Date(now);
      oldDate.setMonth(now.getMonth() - 2);

      const mockPosts = [
        {
          id: 1,
          title: { rendered: 'Recent Post' },
          link: 'https://test-blog.com/post-1',
          date: now.toISOString(),
          comment_count: 10,
        },
        {
          id: 2,
          title: { rendered: 'Old Post' },
          link: 'https://test-blog.com/post-2',
          date: oldDate.toISOString(),
          comment_count: 5,
        },
      ];

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard({ period: 'month' });

      // 최근 1개월 포스트만 기간 통계에 포함
      expect(dashboard.periodStats.totalPosts).toBe(1);
    });

    it('should calculate summary statistics correctly', async () => {
      const mockPosts = [
        {
          id: 1,
          title: { rendered: 'Post 1' },
          link: 'https://test-blog.com/post-1',
          date: '2025-10-20T00:00:00',
          comment_count: 10,
        },
        {
          id: 2,
          title: { rendered: 'Post 2' },
          link: 'https://test-blog.com/post-2',
          date: '2025-10-25T00:00:00',
          comment_count: 20,
        },
      ];

      mockWPAPI.get.mockResolvedValue(mockPosts);

      const dashboard = await client.getDashboard();

      expect(dashboard.summary.totalPosts).toBe(2);
      expect(dashboard.summary.totalComments).toBe(30);
      expect(dashboard.summary.averageViewsPerPost).toBeGreaterThan(0);
    });

    it('should handle empty posts', async () => {
      mockWPAPI.get.mockResolvedValue([]);

      const dashboard = await client.getDashboard();

      expect(dashboard.summary.totalPosts).toBe(0);
      expect(dashboard.summary.totalViews).toBe(0);
      expect(dashboard.summary.totalComments).toBe(0);
      expect(dashboard.summary.averageViewsPerPost).toBe(0);
      expect(dashboard.topPosts).toEqual([]);
      expect(dashboard.recentPosts).toEqual([]);
    });
  });

  describe('getPostStats', () => {
    it('should fetch single post statistics', async () => {
      const mockPost = {
        id: 123,
        title: { rendered: 'Test Post' },
        link: 'https://test-blog.com/test-post',
        date: '2025-10-27T00:00:00',
        comment_count: 25,
      };

      mockWPAPI.get.mockResolvedValue(mockPost);

      const stats = await client.getPostStats(123);

      expect(mockWPAPI.id).toHaveBeenCalledWith(123);
      expect(stats.id).toBe(123);
      expect(stats.title).toBe('Test Post');
      expect(stats.comments).toBe(25);
      expect(stats.views).toBeGreaterThan(0);
    });

    it('should handle missing title', async () => {
      const mockPost = {
        id: 123,
        link: 'https://test-blog.com/test-post',
        date: '2025-10-27T00:00:00',
        comment_count: 10,
      };

      mockWPAPI.get.mockResolvedValue(mockPost);

      const stats = await client.getPostStats(123);

      expect(stats.title).toBe('Untitled');
    });

    it('should extract Jetpack stats if available', async () => {
      const mockPost = {
        id: 123,
        title: { rendered: 'Test Post' },
        link: 'https://test-blog.com/test-post',
        date: '2025-10-27T00:00:00',
        comment_count: 10,
        jetpack_stats: { views: 500 },
        jetpack_likes_enabled: true,
        jetpack_likes: { count: 50 },
      };

      mockWPAPI.get.mockResolvedValue(mockPost);

      const stats = await client.getPostStats(123);

      expect(stats.views).toBe(500);
      expect(stats.likes).toBe(50);
    });

    it('should estimate views from comments if no stats', async () => {
      const mockPost = {
        id: 123,
        title: { rendered: 'Test Post' },
        link: 'https://test-blog.com/test-post',
        date: '2025-10-27T00:00:00',
        comment_count: 10,
      };

      mockWPAPI.get.mockResolvedValue(mockPost);

      const stats = await client.getPostStats(123);

      // 댓글 수 * 10으로 추정
      expect(stats.views).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle WordPress API errors', async () => {
      mockWPAPI.get.mockRejectedValue(new Error('API Error'));

      await expect(client.getDashboard()).rejects.toThrow(
        'Failed to fetch posts'
      );
    });

    it('should handle post not found error', async () => {
      mockWPAPI.get.mockRejectedValue(new Error('Post not found'));

      await expect(client.getPostStats(999)).rejects.toThrow(
        'Failed to fetch post 999'
      );
    });
  });

  describe('Helper Functions', () => {
    it('getDashboard helper should work', async () => {
      mockWPAPI.get.mockResolvedValue([
        {
          id: 1,
          title: { rendered: 'Test' },
          link: 'https://test.com',
          date: '2025-10-27T00:00:00',
          comment_count: 5,
        },
      ]);

      const dashboard = await getDashboard(mockConfig);

      expect(dashboard.summary.totalPosts).toBe(1);
    });

    it('getPostStats helper should work', async () => {
      mockWPAPI.get.mockResolvedValue({
        id: 123,
        title: { rendered: 'Test' },
        link: 'https://test.com',
        date: '2025-10-27T00:00:00',
        comment_count: 5,
      });

      const stats = await getPostStats(mockConfig, 123);

      expect(stats.id).toBe(123);
    });
  });
});
