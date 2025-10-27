/**
 * blog analytics 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AnalyticsDashboard } from '@blog/shared';

// getDashboard 모킹
const mockGetDashboard = vi.fn();

// @blog/core 모킹
vi.mock('@blog/core', () => {
  return {
    AnalyticsClient: vi.fn().mockImplementation(() => ({
      getDashboard: mockGetDashboard,
    })),
  };
});

// config 유틸리티 모킹
vi.mock('../utils/config', () => {
  return {
    loadWordPressConfig: vi.fn().mockReturnValue({
      url: 'https://test-blog.com',
      username: 'testuser',
      password: 'testpass',
    }),
  };
});

describe('analytics command', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    it('should fetch and display dashboard', async () => {
      const { analyticsCommand } = await import('./analytics');

      const mockDashboard: AnalyticsDashboard = {
        summary: {
          totalPosts: 50,
          totalViews: 10000,
          totalComments: 500,
          averageViewsPerPost: 200,
        },
        topPosts: [
          {
            id: 1,
            title: 'Popular Post',
            url: 'https://test-blog.com/popular',
            publishedDate: new Date(),
            views: 1000,
            comments: 50,
          },
        ],
        recentPosts: [
          {
            id: 2,
            title: 'Recent Post',
            url: 'https://test-blog.com/recent',
            publishedDate: new Date(),
            views: 100,
            comments: 5,
          },
        ],
        periodStats: {
          period: 'month',
          totalViews: 5000,
          totalPosts: 10,
          totalComments: 100,
          averageViewsPerPost: 500,
        },
      };

      mockGetDashboard.mockResolvedValue(mockDashboard);

      await analyticsCommand({});

      expect(mockGetDashboard).toHaveBeenCalledWith({
        period: 'month',
        limit: 10,
        sortBy: 'views',
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');

      expect(output).toContain('블로그 분석 대시보드');
      expect(output).toContain('Popular Post');
      expect(output).toContain('Recent Post');
    });

    it('should handle empty dashboard', async () => {
      const { analyticsCommand } = await import('./analytics');

      const mockDashboard: AnalyticsDashboard = {
        summary: {
          totalPosts: 0,
          totalViews: 0,
          totalComments: 0,
          averageViewsPerPost: 0,
        },
        topPosts: [],
        recentPosts: [],
        periodStats: {
          period: 'month',
          totalViews: 0,
          totalPosts: 0,
          totalComments: 0,
          averageViewsPerPost: 0,
        },
      };

      mockGetDashboard.mockResolvedValue(mockDashboard);

      await analyticsCommand({});

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');

      expect(output).toContain('블로그 분석 대시보드');
      expect(output).toContain('데이터가 없습니다');
    });
  });

  describe('옵션 처리', () => {
    it('should parse period option', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockResolvedValue({
        summary: { totalPosts: 0, totalViews: 0, totalComments: 0, averageViewsPerPost: 0 },
        topPosts: [],
        recentPosts: [],
        periodStats: { period: 'week', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({ period: 'week' });

      expect(mockGetDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          period: 'week',
        })
      );
    });

    it('should parse limit option', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockResolvedValue({
        summary: { totalPosts: 0, totalViews: 0, totalComments: 0, averageViewsPerPost: 0 },
        topPosts: [],
        recentPosts: [],
        periodStats: { period: 'month', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({ limit: '20' });

      expect(mockGetDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it('should parse sortBy option', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockResolvedValue({
        summary: { totalPosts: 0, totalViews: 0, totalComments: 0, averageViewsPerPost: 0 },
        topPosts: [],
        recentPosts: [],
        periodStats: { period: 'month', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({ sortBy: 'comments' });

      expect(mockGetDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'comments',
        })
      );
    });
  });

  describe('출력 포맷', () => {
    it('should display summary statistics', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockResolvedValue({
        summary: {
          totalPosts: 100,
          totalViews: 50000,
          totalComments: 1000,
          averageViewsPerPost: 500,
        },
        topPosts: [],
        recentPosts: [],
        periodStats: { period: 'month', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');

      expect(output).toContain('100');
      expect(output).toContain('50,000');
      expect(output).toContain('1,000');
      expect(output).toContain('500');
    });

    it('should display top posts with likes', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockResolvedValue({
        summary: { totalPosts: 0, totalViews: 0, totalComments: 0, averageViewsPerPost: 0 },
        topPosts: [
          {
            id: 1,
            title: 'Post with Likes',
            url: 'https://test.com/post',
            publishedDate: new Date(),
            views: 1000,
            comments: 50,
            likes: 100,
          },
        ],
        recentPosts: [],
        periodStats: { period: 'month', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');

      expect(output).toContain('100 likes');
    });

    it('should truncate long titles', async () => {
      const { analyticsCommand } = await import('./analytics');

      const longTitle = 'A'.repeat(80);

      mockGetDashboard.mockResolvedValue({
        summary: { totalPosts: 0, totalViews: 0, totalComments: 0, averageViewsPerPost: 0 },
        topPosts: [
          {
            id: 1,
            title: longTitle,
            url: 'https://test.com/post',
            publishedDate: new Date(),
            views: 100,
            comments: 5,
          },
        ],
        recentPosts: [],
        periodStats: { period: 'month', totalViews: 0, totalPosts: 0, totalComments: 0, averageViewsPerPost: 0 },
      });

      await analyticsCommand({});

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');

      expect(output).toContain('...');
    });
  });

  describe('에러 처리', () => {
    it('should handle API errors', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockRejectedValue(new Error('WordPress API error'));

      await analyticsCommand({});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle network errors', async () => {
      const { analyticsCommand } = await import('./analytics');

      mockGetDashboard.mockRejectedValue(new Error('Network timeout'));

      await analyticsCommand({});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network timeout')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
