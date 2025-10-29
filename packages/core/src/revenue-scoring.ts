/**
 * 수익성 점수 계산 모듈
 *
 * Google Keyword Planner 데이터를 기반으로 키워드의 수익성 점수를 계산합니다.
 * - 데이터 정규화: CPC, 검색량, 경쟁 강도를 0-1 범위로 정규화
 * - 수익성 점수: 가중치를 적용한 종합 점수 (0-100)
 * - 수익 예측: 보수적/낙관적 시나리오 기반 월간 수익 예측
 */

import type { KeywordData, KeywordMetrics, RevenueScore } from '@blog/shared';

/**
 * CPC 정규화 상수
 */
const CPC_MIN = 0.01; // $0.01
const CPC_MAX = 10.0; // $10.00

/**
 * 검색량 정규화 상수 (로그 스케일)
 */
const VOLUME_MIN = 10;
const VOLUME_MAX = 100000;

/**
 * 수익성 점수 가중치
 */
const WEIGHTS = {
  CPC: 0.35, // 35%
  SEARCH_VOLUME: 0.35, // 35%
  SEO_DIFFICULTY: 0.3, // 30%
};

/**
 * 랭크 팩터 (검색 순위별 클릭률 추정)
 */
const RANK_FACTORS = {
  TOP_3: 0.3, // 1-3위: 30% CTR
  TOP_10: 0.15, // 4-10위: 15% CTR
  TOP_20: 0.05, // 11-20위: 5% CTR
};

/**
 * 광고 CTR (광고 클릭률)
 */
const AD_CTR = {
  CONSERVATIVE: 0.01, // 1%
  OPTIMISTIC: 0.03, // 3%
};

/**
 * CPC를 0-1 범위로 정규화
 *
 * $0.01~$10.00 범위를 0.0~1.0으로 변환합니다.
 * - $0.01 → 0.0
 * - $5.00 → ~0.5
 * - $10.00 → 1.0
 *
 * @param cpc CPC 값 (USD)
 * @returns 정규화된 점수 (0.0-1.0)
 */
export function normalizeCPC(cpc: number): number {
  if (cpc <= CPC_MIN) return 0.0;
  if (cpc >= CPC_MAX) return 1.0;

  // 선형 정규화
  return (cpc - CPC_MIN) / (CPC_MAX - CPC_MIN);
}

/**
 * 검색량을 0-1 범위로 정규화
 *
 * 로그 스케일을 사용하여 넓은 범위의 검색량을 정규화합니다.
 * - 10 → 0.0
 * - 1,000 → ~0.4
 * - 10,000 → ~0.7
 * - 100,000 → 1.0
 *
 * @param volume 월간 검색량
 * @returns 정규화된 점수 (0.0-1.0)
 */
export function normalizeSearchVolume(volume: number): number {
  if (volume <= VOLUME_MIN) return 0.0;
  if (volume >= VOLUME_MAX) return 1.0;

  // 로그 스케일 정규화
  const logMin = Math.log10(VOLUME_MIN);
  const logMax = Math.log10(VOLUME_MAX);
  const logVolume = Math.log10(volume);

  return (logVolume - logMin) / (logMax - logMin);
}

/**
 * SEO 난이도를 0-1 범위로 정규화 (역순)
 *
 * 경쟁 지수(0-100)를 역순으로 변환합니다.
 * 난이도가 낮을수록 좋으므로 역순 매핑:
 * - 0 (쉬움) → 1.0
 * - 50 (중간) → 0.5
 * - 100 (어려움) → 0.0
 *
 * competitionIndex가 없는 경우 competition 값으로 추정:
 * - LOW → 0.25 (난이도 25 → 점수 0.75)
 * - MEDIUM → 0.5 (난이도 50 → 점수 0.5)
 * - HIGH → 0.75 (난이도 75 → 점수 0.25)
 *
 * @param difficulty 경쟁 지수 (0-100) 또는 competition 레벨
 * @param competition competition 레벨 (competitionIndex가 없을 때 사용)
 * @returns 정규화된 점수 (0.0-1.0, 낮을수록 좋음)
 */
export function normalizeSEODifficulty(
  difficulty: number | undefined,
  competition: 'LOW' | 'MEDIUM' | 'HIGH'
): number {
  let difficultyValue: number;

  if (difficulty !== undefined) {
    // competitionIndex가 있는 경우
    difficultyValue = Math.max(0, Math.min(100, difficulty));
  } else {
    // competitionIndex가 없는 경우 competition으로 추정
    switch (competition) {
      case 'LOW':
        difficultyValue = 25;
        break;
      case 'MEDIUM':
        difficultyValue = 50;
        break;
      case 'HIGH':
        difficultyValue = 75;
        break;
    }
  }

  // 역순 변환: 난이도 높을수록 점수 낮음
  return 1.0 - difficultyValue / 100;
}

/**
 * 키워드 데이터를 정규화된 지표로 변환
 *
 * @param data 키워드 데이터
 * @returns 정규화된 지표 (0-1 범위)
 */
export function normalizeKeywordData(data: KeywordData): KeywordMetrics {
  return {
    searchVolumeScore: normalizeSearchVolume(data.searchVolume),
    cpcScore: normalizeCPC(data.cpc),
    competitionScore: normalizeSEODifficulty(data.competitionIndex, data.competition),
  };
}

/**
 * 수익성 점수 계산
 *
 * 가중치를 적용하여 0-100 범위의 종합 점수를 계산합니다.
 * - CPC: 35%
 * - 검색량: 35%
 * - SEO 난이도: 30%
 *
 * @param data 키워드 데이터
 * @returns 수익성 점수 (0-100)
 */
export function calculateRevenueScore(data: KeywordData): RevenueScore {
  // 데이터 정규화
  const metrics = normalizeKeywordData(data);

  // 가중 평균 계산 (0-1)
  const weightedScore =
    metrics.cpcScore * WEIGHTS.CPC +
    metrics.searchVolumeScore * WEIGHTS.SEARCH_VOLUME +
    metrics.competitionScore * WEIGHTS.SEO_DIFFICULTY;

  // 0-100 범위로 변환
  const totalScore = Math.round(weightedScore * 100);

  // 수익 예측
  const { conservative, optimistic } = estimateRevenue(data);

  return {
    keyword: data.keyword,
    totalScore,
    metrics,
    expectedRevenue: {
      conservative,
      optimistic,
    },
    ranking: {
      overall: 0, // 나중에 전체 키워드 목록에서 순위 계산
      byVolume: 0,
      byRevenue: 0,
    },
  };
}

/**
 * 수익 예측 계산
 *
 * 보수적/낙관적 시나리오를 기반으로 월간 예상 수익을 계산합니다.
 *
 * **계산 공식:**
 * 1. 트래픽 예상 = 검색량 × 랭크 팩터 × CTR
 * 2. 광고 수익 = 트래픽 × 광고 CTR × CPC
 *
 * **시나리오:**
 * - 보수적: Top 10 랭킹 (15% CTR), 광고 CTR 1%
 * - 낙관적: Top 3 랭킹 (30% CTR), 광고 CTR 3%
 *
 * @param data 키워드 데이터
 * @returns 보수적/낙관적 월간 수익 예측 (USD)
 */
export function estimateRevenue(
  data: KeywordData
): { conservative: number; optimistic: number } {
  const { searchVolume, cpc } = data;

  // 보수적 시나리오: Top 10 랭킹
  const conservativeTraffic = searchVolume * RANK_FACTORS.TOP_10;
  const conservativeRevenue = conservativeTraffic * AD_CTR.CONSERVATIVE * cpc;

  // 낙관적 시나리오: Top 3 랭킹
  const optimisticTraffic = searchVolume * RANK_FACTORS.TOP_3;
  const optimisticRevenue = optimisticTraffic * AD_CTR.OPTIMISTIC * cpc;

  return {
    conservative: Math.round(conservativeRevenue * 100) / 100, // 소수점 2자리
    optimistic: Math.round(optimisticRevenue * 100) / 100,
  };
}

/**
 * 키워드 목록에 대해 수익성 점수를 계산하고 순위를 매김
 *
 * @param keywords 키워드 데이터 목록
 * @returns 순위가 포함된 수익성 점수 목록
 */
export function calculateRevenueScores(keywords: KeywordData[]): RevenueScore[] {
  // 각 키워드의 수익성 점수 계산
  const scores = keywords.map((keyword) => calculateRevenueScore(keyword));

  // 전체 점수 기준 정렬
  const sortedByScore = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  // 검색량 기준 정렬
  const sortedByVolume = [...keywords].sort((a, b) => b.searchVolume - a.searchVolume);

  // 수익 기준 정렬 (낙관적 예상 수익)
  const sortedByRevenue = [...scores].sort(
    (a, b) => b.expectedRevenue.optimistic - a.expectedRevenue.optimistic
  );

  // 순위 매기기
  return scores.map((score) => {
    const overallRank = sortedByScore.findIndex((s) => s.keyword === score.keyword) + 1;
    const volumeRank =
      sortedByVolume.findIndex((k) => k.keyword === score.keyword) + 1;
    const revenueRank =
      sortedByRevenue.findIndex((s) => s.keyword === score.keyword) + 1;

    return {
      ...score,
      ranking: {
        overall: overallRank,
        byVolume: volumeRank,
        byRevenue: revenueRank,
      },
    };
  });
}
