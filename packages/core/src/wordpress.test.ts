/**
 * WordPress 클라이언트 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WordPressClient } from './wordpress';
import type { WordPressConfig } from '@blog/shared';

// Mock fetch globally
global.fetch = vi.fn();

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
});
