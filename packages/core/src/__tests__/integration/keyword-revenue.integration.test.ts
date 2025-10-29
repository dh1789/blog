/**
 * Epic 8.0 통합 테스트: Keyword Revenue Optimization
 *
 * 이 테스트는 키워드 수익성 최적화 워크플로우를 검증합니다:
 * 1. 트렌딩 토픽 수집 (Reddit, Hacker News)
 * 2. Google Ads API를 통한 키워드 데이터 조회
 * 3. 캐싱 시스템을 통한 API 호출 최적화
 * 4. 수익성 점수 계산
 * 5. 최종 결과 생성 및 정렬
 *
 * 참고: 이 테스트는 실제 Google Ads API 인증이 필요하므로
 * CI/CD 환경에서는 스킵되며, 로컬에서 .env 설정 후 실행 가능합니다.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { TrendingMonitor } from '../../trending';
import { GoogleAdsClient } from '../../keyword-research';
import { KeywordCache } from '../../cache';
import type { TrendingTopic, KeywordData } from '@blog/shared';

// 테스트용 캐시 디렉토리
const TEST_CACHE_DIR = join(process.cwd(), '.cache-test-integration');

/**
 * 참고: 이 통합 테스트는 실제 Google Ads API 인증이 필요합니다.
 * 로컬 환경에서 테스트하려면:
 *
 * 1. .env 파일에 다음 환경 변수 설정:
 *    - GOOGLE_ADS_DEVELOPER_TOKEN
 *    - GOOGLE_ADS_CLIENT_ID
 *    - GOOGLE_ADS_CLIENT_SECRET
 *    - GOOGLE_ADS_REFRESH_TOKEN
 *    - GOOGLE_ADS_CUSTOMER_ID
 *
 * 2. describe.skip을 describe로 변경
 *
 * 3. pnpm test 실행
 */
describe.skip('Epic 8.0 Integration: Keyword Revenue Optimization', () => {
  let monitor: TrendingMonitor;
  let cache: KeywordCache;

  beforeAll(() => {
    // 통합 테스트용 캐시 생성 (5초 TTL for fast testing)
    cache = new KeywordCache(TEST_CACHE_DIR, 5);
  });

  afterAll(() => {
    // 테스트 캐시 디렉토리 정리
    if (existsSync(TEST_CACHE_DIR)) {
      rmSync(TEST_CACHE_DIR, { recursive: true });
    }
  });

  beforeEach(() => {
    // 각 테스트마다 새로운 TrendingMonitor 인스턴스 생성
    monitor = new TrendingMonitor();
  });

  describe('Full Workflow: Trending → Google Ads API → Revenue Scoring', () => {
    it('should fetch trending topics with revenue data', async () => {
      // 1. 트렌딩 토픽 가져오기 (limit: 5 for faster testing)
      const topics = await monitor.getTrendingTopics({
        sources: ['reddit', 'hackernews'],
        limit: 5,
      });

      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(10); // 2 sources * 5 limit

      // 2. 키워드 수익 데이터 가져오기
      const keywordDataList = await monitor.getKeywordRevenueData(topics);

      expect(Array.isArray(keywordDataList)).toBe(true);
      expect(keywordDataList.length).toBeGreaterThan(0);

      // 3. 데이터 구조 검증
      keywordDataList.forEach((data) => {
        expect(data).toHaveProperty('keyword');
        expect(data).toHaveProperty('searchVolume');
        expect(data).toHaveProperty('cpc');
        expect(data).toHaveProperty('competition');
        expect(data).toHaveProperty('competitionIndex');

        expect(typeof data.keyword).toBe('string');
        expect(typeof data.searchVolume).toBe('number');
        expect(typeof data.cpc).toBe('number');
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(data.competition);
        expect(data.competitionIndex).toBeGreaterThanOrEqual(0);
        expect(data.competitionIndex).toBeLessThanOrEqual(100);
      });
    }, 60000); // 60초 타임아웃 (API 호출 포함)

    it('should calculate revenue scores and combine with trend scores', async () => {
      // 1. 트렌딩 토픽 + 수익성 데이터 가져오기
      const scoredTopics = await monitor.getTrendingTopicsWithRevenue({
        sources: ['reddit'],
        limit: 3,
      });

      expect(Array.isArray(scoredTopics)).toBe(true);
      expect(scoredTopics.length).toBeGreaterThan(0);

      // 2. 점수 데이터 구조 검증
      scoredTopics.forEach((topic) => {
        // 트렌드 점수
        expect(topic).toHaveProperty('finalScore');
        expect(topic).toHaveProperty('scoreBreakdown');
        expect(typeof topic.finalScore).toBe('number');

        // 수익성 데이터
        expect(topic).toHaveProperty('revenueData');
        expect(topic.revenueData).toHaveProperty('keyword');
        expect(topic.revenueData).toHaveProperty('searchVolume');
        expect(topic.revenueData).toHaveProperty('cpc');

        // 수익성 점수
        expect(topic).toHaveProperty('revenueScore');
        if (topic.revenueScore) {
          expect(topic.revenueScore).toHaveProperty('totalScore');
          expect(topic.revenueScore).toHaveProperty('breakdown');
          expect(typeof topic.revenueScore.totalScore).toBe('number');
          expect(topic.revenueScore.totalScore).toBeGreaterThanOrEqual(0);
          expect(topic.revenueScore.totalScore).toBeLessThanOrEqual(100);
        }
      });

      // 3. 정렬 검증 (종합 점수 내림차순)
      for (let i = 0; i < scoredTopics.length - 1; i++) {
        const currentCombined = (scoredTopics[i].finalScore * 0.6) +
          ((scoredTopics[i].revenueScore?.totalScore || 0) * 0.4);
        const nextCombined = (scoredTopics[i + 1].finalScore * 0.6) +
          ((scoredTopics[i + 1].revenueScore?.totalScore || 0) * 0.4);

        expect(currentCombined).toBeGreaterThanOrEqual(nextCombined);
      }
    }, 60000);
  });

  describe('Caching Integration', () => {
    it('should use cache on second call to avoid redundant API calls', async () => {
      // 1. 첫 번째 호출 - 캐시 미스, API 호출 발생
      const topics1 = await monitor.getTrendingTopics({
        sources: ['reddit'],
        limit: 2,
      });

      const keywordData1 = await monitor.getKeywordRevenueData(topics1);

      expect(keywordData1.length).toBeGreaterThan(0);

      // 2. 두 번째 호출 (동일한 키워드) - 캐시 히트, API 호출 생략
      // Note: 콘솔 로그에서 "Cache stats: X hits, Y misses" 확인 가능
      const keywordData2 = await monitor.getKeywordRevenueData(topics1);

      expect(keywordData2.length).toBe(keywordData1.length);

      // 3. 데이터 동일성 검증
      keywordData1.forEach((data1, index) => {
        const data2 = keywordData2[index];
        expect(data1.keyword).toBe(data2.keyword);
        expect(data1.searchVolume).toBe(data2.searchVolume);
        expect(data1.cpc).toBe(data2.cpc);
        expect(data1.competition).toBe(data2.competition);
      });
    }, 60000);

    it('should fetch fresh data after cache expiration', async () => {
      // 1. 짧은 TTL로 캐시 생성 (1초)
      const shortTTLCache = new KeywordCache(TEST_CACHE_DIR, 1);
      const monitorWithShortCache = new TrendingMonitor();
      // @ts-expect-error - private field access for testing
      monitorWithShortCache.keywordCache = shortTTLCache;

      // 2. 첫 번째 호출
      const topics = await monitorWithShortCache.getTrendingTopics({
        sources: ['reddit'],
        limit: 1,
      });

      const keywordData1 = await monitorWithShortCache.getKeywordRevenueData(topics);
      expect(keywordData1.length).toBeGreaterThan(0);

      // 3. 캐시 만료 대기 (1.5초)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. 두 번째 호출 - 캐시 만료로 API 재호출 발생
      const keywordData2 = await monitorWithShortCache.getKeywordRevenueData(topics);

      expect(keywordData2.length).toBe(keywordData1.length);
      // Note: 실제 API 호출이 다시 발생하므로 데이터는 최신화됨
    }, 65000);
  });

  describe('Error Handling', () => {
    it('should handle Google Ads API errors gracefully', async () => {
      // 잘못된 환경 변수로 GoogleAdsClient 생성 시도
      const originalToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

      try {
        // 환경 변수를 임시로 제거
        delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

        // GoogleAdsClient 생성 시 에러 발생 예상
        expect(() => {
          new GoogleAdsClient();
        }).toThrow('Missing required Google Ads API environment variables');

      } finally {
        // 환경 변수 복원
        if (originalToken) {
          process.env.GOOGLE_ADS_DEVELOPER_TOKEN = originalToken;
        }
      }
    });

    it('should continue execution even when API calls fail', async () => {
      // 네트워크 에러나 API 제한 등으로 실패해도 빈 배열 반환
      const mockTopics: TrendingTopic[] = [
        {
          id: 'test-1',
          title: 'Test Topic',
          url: 'https://example.com',
          source: 'reddit',
          score: 100,
          comments: 50,
          author: 'test-author',
          createdAt: new Date(),
        },
      ];

      // API 호출 실패해도 에러를 던지지 않고 빈 배열이나 기존 데이터 유지
      const result = await monitor.getKeywordRevenueData(mockTopics);

      expect(Array.isArray(result)).toBe(true);
      // API 실패 시 빈 배열 또는 캐시된 데이터 반환
    }, 30000);
  });

  describe('Performance Validation', () => {
    it('should complete workflow within acceptable time limits', async () => {
      const startTime = Date.now();

      const scoredTopics = await monitor.getTrendingTopicsWithRevenue({
        sources: ['reddit'],
        limit: 5,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(scoredTopics.length).toBeGreaterThan(0);

      // 5개 토픽에 대해 60초 이내 완료 (캐시 미스 가정)
      expect(duration).toBeLessThan(60000);

      console.log(`Workflow completed in ${duration}ms`);
    }, 65000);

    it('should demonstrate significant speedup with cache', async () => {
      // 1. 캐시 없이 첫 번째 호출 (시간 측정)
      const topics = await monitor.getTrendingTopics({
        sources: ['reddit'],
        limit: 3,
      });

      const startTime1 = Date.now();
      await monitor.getKeywordRevenueData(topics);
      const duration1 = Date.now() - startTime1;

      // 2. 캐시 사용 두 번째 호출 (시간 측정)
      const startTime2 = Date.now();
      await monitor.getKeywordRevenueData(topics);
      const duration2 = Date.now() - startTime2;

      // 캐시 사용 시 최소 80% 이상 속도 향상 예상
      const speedup = duration1 / duration2;
      expect(speedup).toBeGreaterThan(5); // 최소 5배 이상 빠름

      console.log(`First call: ${duration1}ms, Second call (cached): ${duration2}ms`);
      console.log(`Speedup: ${speedup.toFixed(2)}x`);
    }, 70000);
  });
});

/**
 * 유닛 테스트용 모킹 통합 테스트
 * (Google Ads API 인증 없이 실행 가능)
 */
describe('Keyword Revenue Integration (Mocked)', () => {
  it('should validate data flow between modules', () => {
    // KeywordCache 모듈
    const cache = new KeywordCache('.cache-test-mocked', 3600);

    const mockKeywordData: KeywordData = {
      keyword: 'test keyword',
      searchVolume: 1000,
      cpc: 2.5,
      competition: 'MEDIUM',
      competitionIndex: 50,
    };

    // 1. 캐시 저장
    cache.set('test keyword', mockKeywordData);

    // 2. 캐시 조회
    const retrieved = cache.get('test keyword');
    expect(retrieved).toEqual(mockKeywordData);

    // 3. 캐시 존재 확인
    expect(cache.has('test keyword')).toBe(true);

    // 4. 캐시 삭제
    cache.invalidate('test keyword');
    expect(cache.has('test keyword')).toBe(false);
  });

  afterAll(() => {
    // 모킹 테스트 캐시 정리
    const mockCacheDir = join(process.cwd(), '.cache-test-mocked');
    if (existsSync(mockCacheDir)) {
      rmSync(mockCacheDir, { recursive: true });
    }
  });
});
