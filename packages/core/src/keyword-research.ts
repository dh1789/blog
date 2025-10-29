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
   *
   * @param keywords 조회할 키워드 목록
   * @returns 키워드 데이터 배열
   */
  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    // TODO: Task 3.2에서 구현
    throw new Error('Not implemented yet');
  }
}
