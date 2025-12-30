/**
 * status 명령어 테스트
 * PRD 0014: WordPress 포스트 생성 기능 개선 - Task 3.8-3.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// WordPressClient 모킹
vi.mock('@blog/core', () => ({
  WordPressClient: vi.fn().mockImplementation(() => ({
    getPostBySlug: vi.fn(),
    changePostStatus: vi.fn(),
  })),
}));

// config 모킹
vi.mock('../utils/config', () => ({
  loadConfig: vi.fn().mockResolvedValue({
    url: 'https://test.com',
    username: 'testuser',
    password: 'testpass',
  }),
}));

// ora 모킹
vi.mock('ora', () => ({
  default: vi.fn().mockReturnValue({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
  }),
}));

import { statusCommand } from './status';
import { WordPressClient } from '@blog/core';

describe('statusCommand', () => {
  let mockGetPostBySlug: ReturnType<typeof vi.fn>;
  let mockChangePostStatus: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPostBySlug = vi.fn();
    mockChangePostStatus = vi.fn();

    (WordPressClient as any).mockImplementation(() => ({
      getPostBySlug: mockGetPostBySlug,
      changePostStatus: mockChangePostStatus,
    }));

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  // ===========================================================================
  // Task 3.8: --publish 옵션 테스트
  // ===========================================================================

  describe('--publish 옵션', () => {
    it('draft 상태의 포스트를 publish로 변경한다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        status: 'draft',
        date: '2024-12-05T10:00:00',
        link: 'https://example.com/test-post',
      });
      mockChangePostStatus.mockResolvedValue({
        id: 123,
        previousStatus: 'draft',
        newStatus: 'publish',
      });

      await statusCommand('test-post', { publish: true, draft: false });

      expect(mockChangePostStatus).toHaveBeenCalledWith(123, 'publish');
    });

    it('이미 publish 상태인 포스트는 변경하지 않는다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        status: 'publish',
        date: '2024-12-05T10:00:00',
        link: 'https://example.com/test-post',
      });
      mockChangePostStatus.mockResolvedValue({
        id: 123,
        previousStatus: 'publish',
        newStatus: 'publish',
        unchanged: true,
      });

      await statusCommand('test-post', { publish: true, draft: false });

      expect(mockChangePostStatus).toHaveBeenCalledWith(123, 'publish');
    });
  });

  // ===========================================================================
  // Task 3.9: --draft 옵션 테스트
  // ===========================================================================

  describe('--draft 옵션', () => {
    it('publish 상태의 포스트를 draft로 변경한다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 456,
        title: 'Published Post',
        slug: 'published-post',
        status: 'publish',
        date: '2024-12-05T10:00:00',
        link: 'https://example.com/published-post',
      });
      mockChangePostStatus.mockResolvedValue({
        id: 456,
        previousStatus: 'publish',
        newStatus: 'draft',
      });

      await statusCommand('published-post', { publish: false, draft: true });

      expect(mockChangePostStatus).toHaveBeenCalledWith(456, 'draft');
    });

    it('이미 draft 상태인 포스트는 변경하지 않는다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 456,
        title: 'Draft Post',
        slug: 'draft-post',
        status: 'draft',
        date: '2024-12-05T10:00:00',
        link: 'https://example.com/draft-post',
      });
      mockChangePostStatus.mockResolvedValue({
        id: 456,
        previousStatus: 'draft',
        newStatus: 'draft',
        unchanged: true,
      });

      await statusCommand('draft-post', { publish: false, draft: true });

      expect(mockChangePostStatus).toHaveBeenCalledWith(456, 'draft');
    });
  });

  // ===========================================================================
  // Task 3.10: 상태 조회 테스트 (옵션 없음)
  // ===========================================================================

  describe('상태 조회 (옵션 없음)', () => {
    it('포스트 상태 정보를 출력한다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 789,
        title: 'Query Post',
        slug: 'query-post',
        status: 'publish',
        date: '2024-12-05T10:00:00',
        excerpt: 'This is excerpt',
        link: 'https://example.com/query-post',
      });

      await statusCommand('query-post', { publish: false, draft: false });

      // 상태 변경 API가 호출되지 않음
      expect(mockChangePostStatus).not.toHaveBeenCalled();
      // 콘솔에 정보 출력됨
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('존재하지 않는 slug는 에러를 출력한다', async () => {
      mockGetPostBySlug.mockResolvedValue(null);

      await expect(
        statusCommand('non-existent', { publish: false, draft: false })
      ).rejects.toThrow('process.exit called');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('언어 파라미터로 필터링하여 조회한다', async () => {
      mockGetPostBySlug.mockResolvedValue({
        id: 999,
        title: 'English Post',
        slug: 'english-post',
        status: 'publish',
        date: '2024-12-05T10:00:00',
        link: 'https://example.com/en/english-post',
      });

      await statusCommand('english-post', {
        publish: false,
        draft: false,
        language: 'en',
      });

      expect(mockGetPostBySlug).toHaveBeenCalledWith('english-post', 'en');
    });
  });
});
