/**
 * GoogleAdsClient 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleAdsClient } from './keyword-research';

// google-ads-api 모킹
vi.mock('google-ads-api', () => {
  const mockQuery = vi.fn();
  const mockGenerateKeywordIdeas = vi.fn();
  const mockCustomer = vi.fn(() => ({
    query: mockQuery,
    keywordPlanIdeas: {
      generateKeywordIdeas: mockGenerateKeywordIdeas,
    },
  }));

  return {
    GoogleAdsApi: vi.fn().mockImplementation(() => ({
      Customer: mockCustomer,
    })),
    mockQuery,
    mockCustomer,
    mockGenerateKeywordIdeas,
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
    it('should validate empty keywords array', async () => {
      const client = new GoogleAdsClient();

      await expect(client.getKeywordData([])).rejects.toThrow(
        'Keywords array cannot be empty'
      );
    });

    it('should validate maximum 100 keywords limit', async () => {
      const client = new GoogleAdsClient();
      const keywords = Array(101).fill('test');

      await expect(client.getKeywordData(keywords)).rejects.toThrow(
        'Maximum 100 keywords allowed per request'
      );
    });

    it('should throw user-friendly error on authentication failure', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      // 인증 에러는 재시도하지 않으므로 한 번만 발생
      mockGenerateKeywordIdeas.mockRejectedValueOnce(
        new Error('Authentication failed')
      );

      const client = new GoogleAdsClient();

      try {
        await client.getKeywordData(['test']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Google Ads API authentication failed/);
      }
    });

    it('should throw user-friendly error on quota exceeded', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      // 할당량 초과는 재시도하므로 모든 시도에서 실패하도록 설정
      mockGenerateKeywordIdeas.mockRejectedValue(
        new Error('Quota exceeded')
      );

      const client = new GoogleAdsClient();

      try {
        await client.getKeywordData(['test']);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/Google Ads API quota exceeded/);
      }
    });

    it('should return keyword data with correct structure', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      const mockResponse = [
        {
          text: 'WordPress plugin',
          keyword_idea_metrics: {
            avg_monthly_searches: 10000,
            average_cpc_micros: 2500000, // $2.50
            competition: 'MEDIUM',
            competition_index: 65,
          },
        },
      ];

      mockGenerateKeywordIdeas.mockResolvedValueOnce(mockResponse);

      const client = new GoogleAdsClient();
      const result = await client.getKeywordData(['WordPress plugin']);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        keyword: 'WordPress plugin',
        searchVolume: 10000,
        cpc: 2.5,
        competition: 'MEDIUM',
        competitionIndex: 65,
      });
    });

    it('should convert CPC from micros to dollars', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      const mockResponse = [
        {
          text: 'test',
          keyword_idea_metrics: {
            avg_monthly_searches: 1000,
            average_cpc_micros: 3750000, // $3.75
            competition: 'LOW',
          },
        },
      ];

      mockGenerateKeywordIdeas.mockResolvedValueOnce(mockResponse);

      const client = new GoogleAdsClient();
      const result = await client.getKeywordData(['test']);

      expect(result[0].cpc).toBe(3.75);
    });

    it('should handle missing competition index', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      const mockResponse = [
        {
          text: 'test',
          keyword_idea_metrics: {
            avg_monthly_searches: 1000,
            average_cpc_micros: 1000000,
            competition: 'HIGH',
            // competition_index is missing
          },
        },
      ];

      mockGenerateKeywordIdeas.mockResolvedValueOnce(mockResponse);

      const client = new GoogleAdsClient();
      const result = await client.getKeywordData(['test']);

      expect(result[0].competitionIndex).toBeUndefined();
    });

    it('should default to MEDIUM competition for unspecified values', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      const mockResponse = [
        {
          text: 'test',
          keyword_idea_metrics: {
            avg_monthly_searches: 1000,
            average_cpc_micros: 1000000,
            competition: 'UNSPECIFIED',
          },
        },
      ];

      mockGenerateKeywordIdeas.mockResolvedValueOnce(mockResponse);

      const client = new GoogleAdsClient();
      const result = await client.getKeywordData(['test']);

      expect(result[0].competition).toBe('MEDIUM');
    });

    it('should skip keywords without text', async () => {
      const { mockGenerateKeywordIdeas } = await import('google-ads-api');

      const mockResponse = [
        {
          text: null, // Missing text
          keyword_idea_metrics: {
            avg_monthly_searches: 1000,
            average_cpc_micros: 1000000,
            competition: 'LOW',
          },
        },
        {
          text: 'valid keyword',
          keyword_idea_metrics: {
            avg_monthly_searches: 2000,
            average_cpc_micros: 2000000,
            competition: 'MEDIUM',
          },
        },
      ];

      mockGenerateKeywordIdeas.mockResolvedValueOnce(mockResponse);

      const client = new GoogleAdsClient();
      const result = await client.getKeywordData(['test']);

      expect(result).toHaveLength(1);
      expect(result[0].keyword).toBe('valid keyword');
    });
  });
});
