/**
 * GoogleAdsClient 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAdsClient } from './keyword-research';

// google-ads-api 모킹
vi.mock('google-ads-api', () => {
  const mockQuery = vi.fn();
  const mockCustomer = vi.fn(() => ({
    query: mockQuery,
  }));

  return {
    GoogleAdsApi: vi.fn().mockImplementation(() => ({
      Customer: mockCustomer,
    })),
    mockQuery,
    mockCustomer,
  };
});

describe('GoogleAdsClient', () => {
  // 원본 환경 변수 백업
  const originalEnv = process.env;

  beforeEach(() => {
    // 환경 변수 초기화
    process.env = {
      ...originalEnv,
      GOOGLE_ADS_DEVELOPER_TOKEN: 'test-developer-token',
      GOOGLE_ADS_CLIENT_ID: 'test-client-id',
      GOOGLE_ADS_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_ADS_REFRESH_TOKEN: 'test-refresh-token',
      GOOGLE_ADS_CUSTOMER_ID: '1234567890',
    };

    // 모든 모킹 초기화
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 환경 변수 복원
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should initialize with valid environment variables', () => {
      expect(() => new GoogleAdsClient()).not.toThrow();
    });

    it('should throw error when GOOGLE_ADS_DEVELOPER_TOKEN is missing', () => {
      delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_DEVELOPER_TOKEN/
      );
    });

    it('should throw error when GOOGLE_ADS_CLIENT_ID is missing', () => {
      delete process.env.GOOGLE_ADS_CLIENT_ID;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_CLIENT_ID/
      );
    });

    it('should throw error when GOOGLE_ADS_CLIENT_SECRET is missing', () => {
      delete process.env.GOOGLE_ADS_CLIENT_SECRET;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_CLIENT_SECRET/
      );
    });

    it('should throw error when GOOGLE_ADS_REFRESH_TOKEN is missing', () => {
      delete process.env.GOOGLE_ADS_REFRESH_TOKEN;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_REFRESH_TOKEN/
      );
    });

    it('should throw error when GOOGLE_ADS_CUSTOMER_ID is missing', () => {
      delete process.env.GOOGLE_ADS_CUSTOMER_ID;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_CUSTOMER_ID/
      );
    });

    it('should throw error with multiple missing variables', () => {
      delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      delete process.env.GOOGLE_ADS_CLIENT_ID;

      expect(() => new GoogleAdsClient()).toThrow(
        /Missing required Google Ads API environment variables.*GOOGLE_ADS_DEVELOPER_TOKEN.*GOOGLE_ADS_CLIENT_ID/
      );
    });

    it('should include setup guide link in error message', () => {
      delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

      expect(() => new GoogleAdsClient()).toThrow(
        /docs\/GOOGLE_ADS_SETUP\.md/
      );
    });
  });

  describe('testConnection()', () => {
    it('should return true when connection succeeds', async () => {
      const { GoogleAdsApi, mockQuery } = await import('google-ads-api');

      // 성공적인 쿼리 응답 모킹
      mockQuery.mockResolvedValueOnce([
        {
          customer: {
            id: '1234567890',
            descriptive_name: 'Test Customer',
          },
        },
      ]);

      const client = new GoogleAdsClient();
      const result = await client.testConnection();

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });

    it('should throw user-friendly error on authentication failure', async () => {
      const { mockQuery } = await import('google-ads-api');

      // 인증 실패 에러 모킹
      mockQuery.mockRejectedValueOnce(
        new Error('Authentication failed: Invalid credentials')
      );

      const client = new GoogleAdsClient();

      try {
        await client.testConnection();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Google Ads API authentication failed/);
        expect((error as Error).message).toMatch(/docs\/GOOGLE_ADS_SETUP\.md/);
      }
    });

    it('should throw user-friendly error on network failure', async () => {
      const { mockQuery } = await import('google-ads-api');

      // 네트워크 에러 모킹
      mockQuery.mockRejectedValueOnce(
        new Error('Network timeout: Unable to connect')
      );

      const client = new GoogleAdsClient();

      try {
        await client.testConnection();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Network error while connecting to Google Ads API/);
        expect((error as Error).message).toMatch(/check your internet connection/);
      }
    });

    it('should throw user-friendly error on invalid customer ID', async () => {
      const { mockQuery } = await import('google-ads-api');

      // Customer ID 에러 모킹
      mockQuery.mockRejectedValueOnce(
        new Error('Customer not found: Invalid customer ID')
      );

      const client = new GoogleAdsClient();

      try {
        await client.testConnection();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Invalid Google Ads Customer ID/);
        expect((error as Error).message).toMatch(/GOOGLE_ADS_CUSTOMER_ID/);
      }
    });

    it('should throw generic error for unknown failures', async () => {
      const { mockQuery } = await import('google-ads-api');

      // 알 수 없는 에러 모킹
      mockQuery.mockRejectedValueOnce(
        new Error('Unknown error occurred')
      );

      const client = new GoogleAdsClient();

      try {
        await client.testConnection();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Failed to connect to Google Ads API/);
        expect((error as Error).message).toMatch(/Unknown error occurred/);
        expect((error as Error).message).toMatch(/docs\/GOOGLE_ADS_SETUP\.md/);
      }
    });

    it('should preserve non-Error exceptions', async () => {
      const { mockQuery } = await import('google-ads-api');

      // 문자열 에러 모킹
      mockQuery.mockRejectedValueOnce('String error');

      const client = new GoogleAdsClient();

      await expect(client.testConnection()).rejects.toBe('String error');
    });
  });

  describe('getKeywordData()', () => {
    it('should throw "Not implemented yet" error', async () => {
      const client = new GoogleAdsClient();

      await expect(client.getKeywordData(['test'])).rejects.toThrow(
        'Not implemented yet'
      );
    });
  });
});
