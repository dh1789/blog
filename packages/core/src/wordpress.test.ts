/**
 * WordPress 클라이언트 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WordPressClient } from './wordpress';
import type { WordPressConfig } from '@blog/shared';

// Mock fetch globally
global.fetch = vi.fn();

// Mock WPAPI
vi.mock('wpapi', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      posts: vi.fn().mockReturnValue({
        create: vi.fn(),
        id: vi.fn().mockReturnValue({
          update: vi.fn(),
          delete: vi.fn(),
        }),
        perPage: vi.fn().mockReturnThis(),
        param: vi.fn().mockReturnThis(),
      }),
      media: vi.fn().mockReturnValue({
        file: vi.fn().mockReturnValue({
          create: vi.fn(),
        }),
        search: vi.fn(),
      }),
      categories: vi.fn().mockReturnValue({
        search: vi.fn(),
        create: vi.fn(),
      }),
      tags: vi.fn().mockReturnValue({
        search: vi.fn(),
        create: vi.fn(),
      }),
    })),
  };
});

describe('WordPressClient', () => {
  const mockConfig: WordPressConfig = {
    url: 'https://test.com',
    username: 'testuser',
    password: 'testpass',
  };

  let client: WordPressClient;

  beforeEach(() => {
    client = new WordPressClient(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('linkTranslations', () => {
    it('should successfully link Korean and English posts', async () => {
      // Mock successful API response
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            ko_post: { id: 29, title: '한글 포스트' },
            en_post: { id: 26, title: 'English Post' },
          },
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Spy on console.log to verify success message
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await client.linkTranslations(29, 26);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/wp-json/polylang-helper/v1/link-translations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Basic'),
          }),
          body: JSON.stringify({
            ko_post_id: 29,
            en_post_id: 26,
          }),
        })
      );

      // Verify success message was logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('언어 연결 완료: 한글(29) ↔ 영문(26)')
      );

      consoleLogSpy.mockRestore();
    });

    it('should throw error when plugin is not installed (404)', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          code: 'rest_no_route',
          message: 'No route found',
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Polylang REST API Helper 플러그인이 설치되지 않았습니다/
      );

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /wp-content\/plugins/
      );
    });

    it('should throw error when Polylang is not active', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          code: 'polylang_not_active',
          message: 'Polylang plugin is not active',
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Polylang 플러그인이 활성화되지 않았습니다/
      );
    });

    it('should throw error when Korean post is invalid', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          code: 'invalid_ko_post',
          message: 'Korean post ID 999 does not exist',
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(client.linkTranslations(999, 26)).rejects.toThrow(
        /Korean post ID 999 does not exist/
      );
    });

    it('should throw error when English post is invalid', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          code: 'invalid_en_post',
          message: 'English post ID 888 does not exist',
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(client.linkTranslations(29, 888)).rejects.toThrow(
        /English post ID 888 does not exist/
      );
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(
        new Error('Network connection failed')
      );

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Failed to link translations/
      );

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Network connection failed/
      );
    });

    it('should handle generic API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({
          code: 'internal_error',
          message: 'Internal server error',
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Failed to link translations/
      );

      await expect(client.linkTranslations(29, 26)).rejects.toThrow(
        /Internal server error/
      );
    });

    it('should encode Basic Auth credentials correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            ko_post: { id: 29, title: '한글 포스트' },
            en_post: { id: 26, title: 'English Post' },
          },
        }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Suppress console.log
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await client.linkTranslations(29, 26);

      // Verify Basic Auth header
      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;

      // Decode Base64 to verify credentials
      const authHeader = headers.Authorization;
      expect(authHeader).toMatch(/^Basic /);

      const base64Credentials = authHeader.replace('Basic ', '');
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      expect(decodedCredentials).toBe('testuser:testpass');

      consoleLogSpy.mockRestore();
    });
  });

  // ===========================================================================
  // Task 3.2-3.4: changePostStatus() 테스트
  // ===========================================================================

  describe('changePostStatus', () => {
    // =========================================================================
    // Task 3.2: Happy Path - 상태 변경
    // =========================================================================

    describe('Happy Path: 상태 변경', () => {
      it('draft 상태의 포스트를 publish로 변경한다', async () => {
        const mockGetPost = vi.fn().mockResolvedValue({
          id: 123,
          status: 'draft',
          title: { rendered: 'Test Post' },
        });
        const mockUpdatePost = vi.fn().mockResolvedValue({
          id: 123,
          status: 'publish',
        });

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                  update: mockUpdatePost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.changePostStatus(123, 'publish');

        expect(mockUpdatePost).toHaveBeenCalledWith({ status: 'publish' });
        expect(result).toEqual({
          id: 123,
          previousStatus: 'draft',
          newStatus: 'publish',
        });
      });

      it('publish 상태의 포스트를 draft로 변경한다', async () => {
        const mockGetPost = vi.fn().mockResolvedValue({
          id: 456,
          status: 'publish',
          title: { rendered: 'Published Post' },
        });
        const mockUpdatePost = vi.fn().mockResolvedValue({
          id: 456,
          status: 'draft',
        });

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                  update: mockUpdatePost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.changePostStatus(456, 'draft');

        expect(mockUpdatePost).toHaveBeenCalledWith({ status: 'draft' });
        expect(result.previousStatus).toBe('publish');
        expect(result.newStatus).toBe('draft');
      });
    });

    // =========================================================================
    // Task 3.3: Boundary Condition - 이미 같은 상태
    // =========================================================================

    describe('Boundary Condition: 이미 같은 상태', () => {
      it('이미 publish 상태인 포스트에 publish 요청 시 업데이트 없이 반환', async () => {
        const mockGetPost = vi.fn().mockResolvedValue({
          id: 789,
          status: 'publish',
          title: { rendered: 'Already Published' },
        });
        const mockUpdatePost = vi.fn();

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                  update: mockUpdatePost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.changePostStatus(789, 'publish');

        // update가 호출되지 않아야 함
        expect(mockUpdatePost).not.toHaveBeenCalled();
        expect(result).toEqual({
          id: 789,
          previousStatus: 'publish',
          newStatus: 'publish',
          unchanged: true,
        });
      });

      it('이미 draft 상태인 포스트에 draft 요청 시 업데이트 없이 반환', async () => {
        const mockGetPost = vi.fn().mockResolvedValue({
          id: 101,
          status: 'draft',
          title: { rendered: 'Draft Post' },
        });
        const mockUpdatePost = vi.fn();

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                  update: mockUpdatePost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.changePostStatus(101, 'draft');

        expect(mockUpdatePost).not.toHaveBeenCalled();
        expect(result.unchanged).toBe(true);
      });
    });

    // =========================================================================
    // Task 3.4: Exception Cases - 포스트 없음
    // =========================================================================

    describe('Exception Cases: 예외 상황', () => {
      it('존재하지 않는 포스트 ID에 대해 에러를 던진다', async () => {
        const mockGetPost = vi.fn().mockRejectedValue(new Error('rest_post_invalid_id'));

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        await expect(testClient.changePostStatus(99999, 'publish')).rejects.toThrow(
          /Post not found/
        );
      });

      it('네트워크 에러 시 적절한 에러 메시지를 던진다', async () => {
        const mockGetPost = vi.fn().mockRejectedValue(new Error('Network error'));

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        await expect(testClient.changePostStatus(123, 'publish')).rejects.toThrow(
          /Failed to change post status/
        );
      });

      it('업데이트 실패 시 적절한 에러를 던진다', async () => {
        const mockGetPost = vi.fn().mockResolvedValue({
          id: 123,
          status: 'draft',
        });
        const mockUpdatePost = vi.fn().mockRejectedValue(new Error('Update failed'));

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                id: (id: number) => ({
                  get: mockGetPost,
                  update: mockUpdatePost,
                }),
              }),
            } as any;
          }
        })(mockConfig);

        await expect(testClient.changePostStatus(123, 'publish')).rejects.toThrow(
          /Failed to change post status/
        );
      });
    });
  });

  // ===========================================================================
  // Task 3.5-3.6: getPostBySlug() 테스트
  // ===========================================================================

  describe('getPostBySlug', () => {
    // =========================================================================
    // Task 3.5: Happy Path - 포스트 상세 조회
    // =========================================================================

    describe('Happy Path: 포스트 상세 조회', () => {
      it('slug로 포스트 상세 정보를 조회한다', async () => {
        const mockSlugQuery = vi.fn().mockReturnThis();
        const mockParamQuery = vi.fn().mockReturnThis();
        const mockGetQuery = vi.fn().mockResolvedValue([
          {
            id: 123,
            title: { rendered: 'Test Post Title' },
            slug: 'test-post',
            status: 'publish',
            date: '2024-12-05T10:00:00',
            excerpt: { rendered: 'This is the excerpt.' },
            link: 'https://example.com/test-post',
          },
        ]);

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                slug: mockSlugQuery,
                param: mockParamQuery,
                get: mockGetQuery,
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.getPostBySlug('test-post');

        expect(result).not.toBeNull();
        expect(result?.id).toBe(123);
        expect(result?.title).toBe('Test Post Title');
        expect(result?.slug).toBe('test-post');
        expect(result?.status).toBe('publish');
        expect(result?.link).toBe('https://example.com/test-post');
      });

      it('언어 파라미터로 필터링하여 조회한다', async () => {
        const mockSlugQuery = vi.fn().mockReturnThis();
        const mockParamQuery = vi.fn().mockReturnThis();
        const mockGetQuery = vi.fn().mockResolvedValue([
          {
            id: 456,
            title: { rendered: 'English Post' },
            slug: 'test-post-en',
            status: 'publish',
            date: '2024-12-05T10:00:00',
            link: 'https://example.com/en/test-post-en',
          },
        ]);

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                slug: mockSlugQuery,
                param: mockParamQuery,
                get: mockGetQuery,
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.getPostBySlug('test-post-en', 'en');

        expect(mockParamQuery).toHaveBeenCalledWith('lang', 'en');
        expect(result?.id).toBe(456);
      });
    });

    // =========================================================================
    // Task 3.6: Boundary & Exception Cases
    // =========================================================================

    describe('Boundary & Exception: 예외 상황', () => {
      it('존재하지 않는 slug는 null을 반환한다', async () => {
        const mockSlugQuery = vi.fn().mockReturnThis();
        const mockParamQuery = vi.fn().mockReturnThis();
        const mockGetQuery = vi.fn().mockResolvedValue([]);

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                slug: mockSlugQuery,
                param: mockParamQuery,
                get: mockGetQuery,
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.getPostBySlug('non-existent-slug');

        expect(result).toBeNull();
      });

      it('API 에러 발생 시 null을 반환한다', async () => {
        const mockSlugQuery = vi.fn().mockReturnThis();
        const mockParamQuery = vi.fn().mockReturnThis();
        const mockGetQuery = vi.fn().mockRejectedValue(new Error('Network error'));

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                slug: mockSlugQuery,
                param: mockParamQuery,
                get: mockGetQuery,
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.getPostBySlug('test-post');

        expect(result).toBeNull();
      });

      it('excerpt가 없는 포스트도 정상 처리한다', async () => {
        const mockSlugQuery = vi.fn().mockReturnThis();
        const mockParamQuery = vi.fn().mockReturnThis();
        const mockGetQuery = vi.fn().mockResolvedValue([
          {
            id: 789,
            title: { rendered: 'No Excerpt Post' },
            slug: 'no-excerpt',
            status: 'draft',
            date: '2024-12-05T10:00:00',
            link: 'https://example.com/no-excerpt',
          },
        ]);

        const testClient = new (class extends WordPressClient {
          constructor(config: WordPressConfig) {
            super(config);
            this.wp = {
              posts: () => ({
                slug: mockSlugQuery,
                param: mockParamQuery,
                get: mockGetQuery,
              }),
            } as any;
          }
        })(mockConfig);

        const result = await testClient.getPostBySlug('no-excerpt');

        expect(result?.id).toBe(789);
        expect(result?.excerpt).toBe('');
      });
    });
  });

  describe('findMediaByFilename', () => {
    it('should find existing media by exact filename', async () => {
      // Mock WPAPI media search response
      const mockMediaResponse = [
        {
          id: 123,
          source_url: 'https://test.com/wp-content/uploads/2025/11/screenshot.png',
          title: { rendered: 'Screenshot' },
          alt_text: 'Test screenshot',
          media_details: {
            width: 1920,
            height: 1080,
            file: '2025/11/screenshot.png',
          },
        },
      ];

      const mockMediaSearch = vi.fn().mockResolvedValue(mockMediaResponse);

      // Create test client with mocked wp
      const testClient = new (class extends WordPressClient {
        constructor(config: WordPressConfig) {
          super(config);
          this.wp = {
            media: () => ({
              search: mockMediaSearch,
            }),
          } as any;
        }
      })(mockConfig);

      const result = await testClient.findMediaByFilename('screenshot.png');

      expect(result).not.toBeNull();
      expect(result?.id).toBe(123);
      expect(result?.source_url).toBe('https://test.com/wp-content/uploads/2025/11/screenshot.png');
      expect(result?.title).toBe('Screenshot');
      expect(result?.media_details?.file).toBe('2025/11/screenshot.png');
    });

    it('should return null when media is not found', async () => {
      const mockMediaSearch = vi.fn().mockResolvedValue([]);

      const testClient = new (class extends WordPressClient {
        constructor(config: WordPressConfig) {
          super(config);
          this.wp = {
            media: () => ({
              search: mockMediaSearch,
            }),
          } as any;
        }
      })(mockConfig);

      const result = await testClient.findMediaByFilename('nonexistent.png');

      expect(result).toBeNull();
    });

    it('should return null when filename does not match exactly', async () => {
      // Mock media with different filename
      const mockMediaResponse = [
        {
          id: 456,
          source_url: 'https://test.com/wp-content/uploads/2025/11/different.png',
          title: { rendered: 'Different' },
          media_details: {
            file: '2025/11/different.png',
          },
        },
      ];

      const mockMediaSearch = vi.fn().mockResolvedValue(mockMediaResponse);

      const testClient = new (class extends WordPressClient {
        constructor(config: WordPressConfig) {
          super(config);
          this.wp = {
            media: () => ({
              search: mockMediaSearch,
            }),
          } as any;
        }
      })(mockConfig);

      const result = await testClient.findMediaByFilename('screenshot.png');

      expect(result).toBeNull();
    });

    it('should handle media without media_details', async () => {
      // Mock media response without media_details
      const mockMediaResponse = [
        {
          id: 789,
          source_url: 'https://test.com/wp-content/uploads/test.png',
          title: { rendered: 'Test' },
        },
      ];

      const mockMediaSearch = vi.fn().mockResolvedValue(mockMediaResponse);

      const testClient = new (class extends WordPressClient {
        constructor(config: WordPressConfig) {
          super(config);
          this.wp = {
            media: () => ({
              search: mockMediaSearch,
            }),
          } as any;
        }
      })(mockConfig);

      const result = await testClient.findMediaByFilename('test.png');

      // Should return null because exact filename match requires media_details
      expect(result).toBeNull();
    });

    it('should throw error when API call fails', async () => {
      const mockMediaSearch = vi.fn().mockRejectedValue(new Error('Network error'));

      const testClient = new (class extends WordPressClient {
        constructor(config: WordPressConfig) {
          super(config);
          this.wp = {
            media: () => ({
              search: mockMediaSearch,
            }),
          } as any;
        }
      })(mockConfig);

      await expect(testClient.findMediaByFilename('test.png')).rejects.toThrow(
        /Failed to search media/
      );

      await expect(testClient.findMediaByFilename('test.png')).rejects.toThrow(
        /Network error/
      );
    });
  });
});
