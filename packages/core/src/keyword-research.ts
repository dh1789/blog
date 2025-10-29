/**
 * Google Ads API 통합 - 키워드 연구 모듈
 *
 * Google Keyword Planner API를 사용하여 키워드 데이터를 수집하고
 * 수익성 분석을 수행합니다.
 */

import { GoogleAdsApi } from 'google-ads-api';
import type {
  KeywordData,
  RevenueScore,
  TopicSuggestion,
} from '@blog/shared';

/**
 * 에러가 재시도 가능한지 판단
 *
 * @param error 발생한 에러
 * @returns 재시도 가능 여부
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();

  // 재시도 가능한 에러: 네트워크, 타임아웃, 할당량 초과, 서버 에러
  const retryablePatterns = [
    'network',
    'timeout',
    'enotfound',
    'econnrefused',
    'etimedout',
    'quota',
    'rate limit',
    'resource_exhausted',
    '429',
    '500',
    '503',
  ];

  return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
}

/**
 * 지수 백오프를 사용한 재시도 헬퍼 함수
 *
 * @param fn 재시도할 비동기 함수
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @param baseDelay 기본 지연 시간 (밀리초, 기본값: 1000)
 * @returns 함수 실행 결과
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 재시도 불가능한 에러는 즉시 throw
      if (!isRetryableError(error)) {
        throw error;
      }

      // 마지막 시도에서 실패하면 에러 throw
      if (attempt === maxRetries) {
        throw error;
      }

      // 지수 백오프 지연 (1초, 2초, 4초)
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Google Ads API 클라이언트 래퍼 클래스
 *
 * Google Keyword Planner API와 상호작용하여 키워드 데이터를 수집합니다.
 */
export class GoogleAdsClient {
  private client: GoogleAdsApi;
  private customerId: string;

  /**
   * GoogleAdsClient 생성자
   *
   * 환경 변수에서 Google Ads API 인증 정보를 로드하고 클라이언트를 초기화합니다.
   *
   * @throws {Error} 필수 환경 변수가 누락된 경우
   */
  constructor() {
    // 필수 환경 변수 확인
    const requiredEnvVars = [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Google Ads API environment variables: ${missingVars.join(', ')}\n` +
        `Please refer to docs/GOOGLE_ADS_SETUP.md for setup instructions.`
      );
    }

    // Google Ads API 클라이언트 초기화
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;
  }

  /**
   * Google Ads API 연결 테스트
   *
   * API 인증이 올바르게 설정되었는지 확인합니다.
   *
   * @returns 연결 성공 여부
   * @throws {Error} 인증 실패 또는 네트워크 오류 시
   */
  async testConnection(): Promise<boolean> {
    try {
      // Customer 정보 조회로 연결 테스트
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      });

      // 간단한 쿼리로 연결 확인
      await customer.query(`
        SELECT
          customer.id,
          customer.descriptive_name
        FROM customer
        LIMIT 1
      `);

      return true;
    } catch (error) {
      // 에러 타입별 사용자 친화적 메시지 제공
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
          throw new Error(
            `Google Ads API authentication failed. Please check your credentials.\n` +
            `Refer to docs/GOOGLE_ADS_SETUP.md for setup instructions.`
          );
        }

        if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          throw new Error(
            `Network error while connecting to Google Ads API.\n` +
            `Please check your internet connection and try again.`
          );
        }

        if (errorMessage.includes('customer')) {
          throw new Error(
            `Invalid Google Ads Customer ID: ${this.customerId}\n` +
            `Please verify your GOOGLE_ADS_CUSTOMER_ID in .env file.`
          );
        }

        // 기타 오류
        throw new Error(
          `Failed to connect to Google Ads API: ${error.message}\n` +
          `Refer to docs/GOOGLE_ADS_SETUP.md for troubleshooting.`
        );
      }

      throw error;
    }
  }

  /**
   * 키워드 데이터 조회
   *
   * Google Keyword Planner API를 사용하여 키워드의 검색량, CPC, 경쟁 강도를 조회합니다.
   * 네트워크 오류 및 API 할당량 초과 시 자동으로 재시도합니다 (최대 3회).
   *
   * @param keywords 조회할 키워드 목록 (최대 100개)
   * @returns 키워드 데이터 배열
   * @throws {Error} 키워드 배열이 비어있거나 100개 초과 시
   */
  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    // 입력 검증 (재시도 불필요)
    if (!keywords || keywords.length === 0) {
      throw new Error('Keywords array cannot be empty');
    }

    if (keywords.length > 100) {
      throw new Error('Maximum 100 keywords allowed per request');
    }

    // 재시도 로직을 포함한 API 호출
    return await retryWithBackoff(async () => {
      try {
        const customer = this.client.Customer({
          customer_id: this.customerId,
          refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
        });

        // Keyword Plan Idea Service를 사용하여 키워드 메트릭 조회
        const keywordPlanIdeaService = customer.keywordPlanIdeas;

        const response = await keywordPlanIdeaService.generateKeywordIdeas({
          customer_id: this.customerId,
          language: 'en', // 언어 코드 (향후 파라미터로 받을 수 있음)
          geo_target_constants: ['geoTargetConstants/2840'], // 미국 (향후 파라미터로 받을 수 있음)
          keyword_seed: {
            keywords,
          },
        });

        // API 응답을 KeywordData 형식으로 변환
        const keywordDataList: KeywordData[] = [];

        for (const idea of response) {
          if (!idea.text) continue;

          // 검색량 추출 (월간 평균)
          const searchVolume = idea.keyword_idea_metrics?.avg_monthly_searches || 0;

          // CPC 추출 (마이크로달러 → 달러 변환)
          const cpcMicros = idea.keyword_idea_metrics?.average_cpc_micros || 0;
          const cpc = cpcMicros / 1000000; // 마이크로달러를 달러로 변환

          // 경쟁 강도 추출
          const competitionLevel = idea.keyword_idea_metrics?.competition || 'UNSPECIFIED';
          let competition: 'LOW' | 'MEDIUM' | 'HIGH';

          switch (competitionLevel) {
            case 'LOW':
              competition = 'LOW';
              break;
            case 'MEDIUM':
              competition = 'MEDIUM';
              break;
            case 'HIGH':
              competition = 'HIGH';
              break;
            default:
              competition = 'MEDIUM'; // 기본값
          }

          // 경쟁 지수 추출 (0-100)
          const competitionIndex = idea.keyword_idea_metrics?.competition_index;

          keywordDataList.push({
            keyword: idea.text,
            searchVolume,
            cpc,
            competition,
            competitionIndex,
          });
        }

        return keywordDataList;
      } catch (error) {
        // 에러 타입별 사용자 친화적 메시지
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();

          if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            throw new Error(
              `Google Ads API quota exceeded.\n` +
              `Please wait a few minutes and try again, or check your API usage limits.`
            );
          }

          if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
            throw new Error(
              `Google Ads API authentication failed.\n` +
              `Please verify your credentials in .env file.\n` +
              `Refer to docs/GOOGLE_ADS_SETUP.md for setup instructions.`
            );
          }

          // 기타 오류
          throw new Error(
            `Failed to fetch keyword data: ${error.message}\n` +
            `Refer to docs/GOOGLE_ADS_SETUP.md for troubleshooting.`
          );
        }

        throw error;
      }
    });
  }
}
