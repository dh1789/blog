/**
 * 주제 추천 로직 모듈
 *
 * 트렌딩 토픽과 키워드 수익성 데이터를 분석하여
 * 블로그 포스트 주제를 추천합니다.
 */

import type {
  ScoredTrendingTopic,
  SuggestedTopic,
  TopicPriority,
} from '@blog/shared';

/**
 * 주제 추천 가중치
 */
const WEIGHTS = {
  TRENDING: 0.4, // 40%
  REVENUE: 0.3, // 30%
  SEO: 0.2, // 20%
  RELEVANCE: 0.1, // 10%
};

/**
 * 우선순위 임계값
 */
const PRIORITY_THRESHOLDS = {
  HIGH: 70, // 70점 이상: high
  MEDIUM: 50, // 50-70점: medium
  // 50점 미만: low
};

/**
 * 주제 추천 생성
 *
 * @param scoredTopics 수익성 분석이 포함된 트렌드 점수 목록
 * @param userKeywords 사용자 지정 키워드 (관련성 평가용)
 * @returns 우선순위별로 정렬된 주제 추천 목록
 */
export function generateTopicSuggestions(
  scoredTopics: ScoredTrendingTopic[],
  userKeywords: string[] = []
): SuggestedTopic[] {
  const suggestions: SuggestedTopic[] = scoredTopics.map((scoredTopic) => {
    // 1. 트렌드 점수 (0-100)
    const trendScore = scoredTopic.finalScore;

    // 2. 수익성 점수 (0-100)
    const revenueScore = scoredTopic.revenueScore?.totalScore || 0;

    // 3. SEO 난이도 점수 (0-100, 낮을수록 좋음)
    const seoScore = scoredTopic.revenueScore?.metrics.competitionScore
      ? scoredTopic.revenueScore.metrics.competitionScore * 100
      : 0;

    // 4. 키워드 관련성 점수 (0-100)
    const relevanceScore = calculateRelevanceScore(
      scoredTopic.topic.title,
      userKeywords
    );

    // 5. 종합 점수 계산 (가중 평균)
    const combinedScore =
      trendScore * WEIGHTS.TRENDING +
      revenueScore * WEIGHTS.REVENUE +
      seoScore * WEIGHTS.SEO +
      relevanceScore * WEIGHTS.RELEVANCE;

    // 6. 우선순위 결정
    const priority = determinePriority(combinedScore);

    // 7. 추천 이유 생성
    const reason = generateReason(
      trendScore,
      revenueScore,
      seoScore,
      relevanceScore,
      priority
    );

    return {
      topic: scoredTopic.topic,
      priority,
      combinedScore: Math.round(combinedScore * 100) / 100,
      scoreBreakdown: {
        trendScore: Math.round(trendScore * 100) / 100,
        revenueScore: Math.round(revenueScore * 100) / 100,
        seoScore: Math.round(seoScore * 100) / 100,
        relevanceScore: Math.round(relevanceScore * 100) / 100,
      },
      reason,
      estimatedRevenue: scoredTopic.revenueScore?.expectedRevenue,
      revenueData: scoredTopic.revenueData,
    };
  });

  // 종합 점수 기준 정렬 (높은 순)
  suggestions.sort((a, b) => b.combinedScore - a.combinedScore);

  return suggestions;
}

/**
 * 키워드 관련성 점수 계산
 *
 * @param title 토픽 제목
 * @param userKeywords 사용자 지정 키워드
 * @returns 관련성 점수 (0-100)
 */
function calculateRelevanceScore(
  title: string,
  userKeywords: string[]
): number {
  if (userKeywords.length === 0) {
    return 50; // 키워드가 없으면 중립 점수
  }

  const titleLower = title.toLowerCase();
  const matchedKeywords = userKeywords.filter((keyword) =>
    titleLower.includes(keyword.toLowerCase())
  );

  // 매칭된 키워드 비율로 점수 계산
  const matchRatio = matchedKeywords.length / userKeywords.length;
  return matchRatio * 100;
}

/**
 * 우선순위 결정
 *
 * @param combinedScore 종합 점수
 * @returns 우선순위
 */
function determinePriority(combinedScore: number): TopicPriority {
  if (combinedScore >= PRIORITY_THRESHOLDS.HIGH) {
    return 'high';
  } else if (combinedScore >= PRIORITY_THRESHOLDS.MEDIUM) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * 추천 이유 생성
 *
 * @param trendScore 트렌드 점수
 * @param revenueScore 수익성 점수
 * @param seoScore SEO 점수
 * @param relevanceScore 관련성 점수
 * @param priority 우선순위
 * @returns 추천 이유 텍스트
 */
function generateReason(
  trendScore: number,
  revenueScore: number,
  seoScore: number,
  relevanceScore: number,
  priority: TopicPriority
): string {
  const reasons: string[] = [];

  // 트렌드 분석
  if (trendScore >= 70) {
    reasons.push('현재 높은 인기를 끌고 있는 주제');
  } else if (trendScore >= 50) {
    reasons.push('꾸준한 관심을 받고 있는 주제');
  }

  // 수익성 분석
  if (revenueScore >= 70) {
    reasons.push('광고 수익 잠재력이 매우 높음');
  } else if (revenueScore >= 50) {
    reasons.push('적절한 수익 기대 가능');
  }

  // SEO 분석
  if (seoScore >= 70) {
    reasons.push('검색 엔진 최적화가 비교적 쉬움');
  } else if (seoScore >= 50) {
    reasons.push('중간 수준의 SEO 경쟁');
  } else if (seoScore < 30) {
    reasons.push('SEO 경쟁이 매우 치열함 (주의 필요)');
  }

  // 관련성 분석
  if (relevanceScore >= 70) {
    reasons.push('지정한 키워드와 높은 연관성');
  }

  // 우선순위별 추가 메시지
  if (priority === 'high') {
    reasons.push('✨ 우선 작성 권장');
  } else if (priority === 'low') {
    reasons.push('⚠️ 수익성 또는 트렌드 보완 필요');
  }

  return reasons.join(', ');
}

/**
 * 우선순위별 주제 필터링
 *
 * @param suggestions 주제 추천 목록
 * @param priority 필터링할 우선순위
 * @returns 필터링된 주제 목록
 */
export function filterByPriority(
  suggestions: SuggestedTopic[],
  priority: TopicPriority
): SuggestedTopic[] {
  return suggestions.filter((suggestion) => suggestion.priority === priority);
}

/**
 * 최상위 N개 주제 가져오기
 *
 * @param suggestions 주제 추천 목록
 * @param limit 가져올 개수
 * @returns 상위 N개 주제
 */
export function getTopSuggestions(
  suggestions: SuggestedTopic[],
  limit: number
): SuggestedTopic[] {
  return suggestions.slice(0, limit);
}
