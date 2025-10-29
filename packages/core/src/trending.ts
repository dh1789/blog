/**
 * 트렌드 모니터링 모듈
 * - Reddit, Hacker News, Twitter에서 인기 토픽 수집
 * - 트렌드 점수 계산 및 정렬
 * - Google Ads API 통합으로 키워드 수익성 분석
 */

import axios from 'axios';
import type {
  TrendingTopic,
  TrendingOptions,
  TrendScore,
  TrendSource,
  ScoredTrendingTopic,
  KeywordData,
} from '@blog/shared';
import { GoogleAdsClient } from './keyword-research';
import { calculateRevenueScores } from './revenue-scoring';
import { KeywordCache } from './cache';

/**
 * 트렌드 모니터링 클라이언트
 */
export class TrendingMonitor {
  private googleAdsClient: GoogleAdsClient | null = null;
  private keywordCache: KeywordCache;

  constructor() {
    this.keywordCache = new KeywordCache();
  }

  /**
   * GoogleAdsClient 인스턴스 가져오기 (lazy initialization)
   */
  private getGoogleAdsClient(): GoogleAdsClient {
    if (!this.googleAdsClient) {
      this.googleAdsClient = new GoogleAdsClient();
    }
    return this.googleAdsClient;
  }

  /**
   * 트렌딩 토픽에 대한 키워드 수익 데이터 가져오기
   * 캐시를 사용하여 Google Ads API 호출 최소화
   *
   * @param topics 트렌딩 토픽 목록
   * @returns 키워드 데이터 배열
   */
  async getKeywordRevenueData(topics: TrendingTopic[]): Promise<KeywordData[]> {
    const keywords = topics.map((topic) => topic.title);
    const keywordDataList: KeywordData[] = [];
    const uncachedKeywords: string[] = [];

    let cacheHits = 0;
    let cacheMisses = 0;

    // 캐시 확인 및 데이터 수집
    for (const keyword of keywords) {
      const cachedData = this.keywordCache.get(keyword);

      if (cachedData) {
        keywordDataList.push(cachedData);
        cacheHits++;
      } else {
        uncachedKeywords.push(keyword);
        cacheMisses++;
      }
    }

    // 캐시되지 않은 키워드가 있으면 API 호출
    if (uncachedKeywords.length > 0) {
      try {
        const googleAds = this.getGoogleAdsClient();
        const newKeywordDataList = await googleAds.getKeywordData(uncachedKeywords);

        // 새로 가져온 데이터를 캐시에 저장
        for (const keywordData of newKeywordDataList) {
          this.keywordCache.set(keywordData.keyword, keywordData);
          keywordDataList.push(keywordData);
        }
      } catch (error) {
        console.error('Failed to fetch keyword revenue data:', error);
      }
    }

    // 캐시 통계 로그
    if (keywords.length > 0) {
      const hitRate = ((cacheHits / keywords.length) * 100).toFixed(1);
      console.log(`Cache stats: ${cacheHits} hits, ${cacheMisses} misses (${hitRate}% hit rate)`);
      if (cacheMisses > 0) {
        console.log(`API calls saved by cache: ${cacheHits} / ${keywords.length}`);
      }
    }

    return keywordDataList;
  }

  /**
   * 트렌딩 토픽 가져오기
   */
  async getTrendingTopics(
    options: TrendingOptions = {}
  ): Promise<TrendingTopic[]> {
    const {
      sources = ['reddit', 'hackernews'],
      limit = 50,
      minScore = 0,
      keywords = [],
    } = options;

    const allTopics: TrendingTopic[] = [];

    // 각 소스에서 토픽 수집
    for (const source of sources) {
      try {
        let topics: TrendingTopic[] = [];

        switch (source) {
          case 'reddit':
            topics = await this.fetchRedditTopics(limit);
            break;
          case 'hackernews':
            topics = await this.fetchHackerNewsTopics(limit);
            break;
          case 'twitter':
            topics = await this.fetchTwitterTopics(limit);
            break;
        }

        allTopics.push(...topics);
      } catch (error) {
        console.error(`Failed to fetch from ${source}:`, error);
      }
    }

    // 최소 점수 필터링
    let filteredTopics = allTopics.filter((topic) => topic.score >= minScore);

    // 키워드 필터링
    if (keywords.length > 0) {
      filteredTopics = filteredTopics.filter((topic) =>
        keywords.some((keyword) =>
          topic.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    return filteredTopics;
  }

  /**
   * Reddit에서 인기 토픽 가져오기
   */
  private async fetchRedditTopics(limit: number): Promise<TrendingTopic[]> {
    try {
      // Reddit API는 인증 없이 공개 데이터 접근 가능
      const response = await axios.get(
        'https://www.reddit.com/r/programming/hot.json',
        {
          params: { limit },
          headers: {
            'User-Agent': 'WordPress-Automation-Bot/1.0',
          },
        }
      );

      const posts = response.data.data.children;

      return posts.map((post: any) => ({
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        url: `https://www.reddit.com${post.data.permalink}`,
        source: 'reddit' as TrendSource,
        score: post.data.ups || 0,
        comments: post.data.num_comments || 0,
        author: post.data.author,
        createdAt: new Date(post.data.created_utc * 1000),
        subreddit: post.data.subreddit,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch Reddit topics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Hacker News에서 인기 토픽 가져오기
   */
  private async fetchHackerNewsTopics(
    limit: number
  ): Promise<TrendingTopic[]> {
    try {
      // Hacker News API로 top stories 가져오기
      const topStoriesResponse = await axios.get(
        'https://hacker-news.firebaseio.com/v0/topstories.json'
      );

      const topStoryIds = topStoriesResponse.data.slice(0, limit);

      // 각 스토리 상세 정보 가져오기
      const storyPromises = topStoryIds.map((id: number) =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      );

      const stories = await Promise.all(storyPromises);

      return stories
        .map((response) => response.data)
        .filter((story) => story && story.title)
        .map((story) => ({
          id: `hn-${story.id}`,
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'hackernews' as TrendSource,
          score: story.score || 0,
          comments: story.descendants || 0,
          author: story.by,
          createdAt: new Date(story.time * 1000),
        }));
    } catch (error) {
      throw new Error(
        `Failed to fetch Hacker News topics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Twitter에서 인기 토픽 가져오기
   * 참고: Twitter API v2는 인증 필요
   */
  private async fetchTwitterTopics(limit: number): Promise<TrendingTopic[]> {
    // Twitter API는 인증이 필요하므로, 환경 변수 확인
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      console.warn(
        'Twitter API requires TWITTER_BEARER_TOKEN environment variable'
      );
      return [];
    }

    try {
      // Twitter API v2 - Search Recent Tweets
      const response = await axios.get(
        'https://api.twitter.com/2/tweets/search/recent',
        {
          params: {
            query: 'programming OR coding OR software -is:retweet',
            max_results: Math.min(limit, 100),
            'tweet.fields': 'created_at,public_metrics,author_id',
          },
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const tweets = response.data.data || [];

      return tweets.map((tweet: any) => ({
        id: `twitter-${tweet.id}`,
        title: tweet.text,
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        source: 'twitter' as TrendSource,
        score: tweet.public_metrics.like_count || 0,
        comments: tweet.public_metrics.reply_count || 0,
        author: tweet.author_id,
        createdAt: new Date(tweet.created_at),
        hashtags: this.extractHashtags(tweet.text),
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch Twitter topics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 트렌드 점수 계산
   */
  calculateTrendScore(
    topic: TrendingTopic,
    keywords: string[] = []
  ): TrendScore {
    const now = Date.now();
    const topicTime = topic.createdAt.getTime();
    const ageInHours = (now - topicTime) / (1000 * 60 * 60);

    // 점수 가중치
    const upvotesWeight = 0.4;
    const commentsWeight = 0.3;
    const recencyWeight = 0.2;
    const keywordWeight = 0.1;

    // 업보트 점수 (0-100)
    const upvotesScore = Math.min((topic.score / 100) * 100, 100);

    // 댓글 점수 (0-100)
    const commentsScore = Math.min((topic.comments / 50) * 100, 100);

    // 최신성 점수 (0-100) - 24시간 이내가 만점
    const recencyScore = Math.max(0, 100 - (ageInHours / 24) * 100);

    // 키워드 매칭 점수 (0-100)
    let keywordScore = 0;
    if (keywords.length > 0) {
      const titleLower = topic.title.toLowerCase();
      const matchCount = keywords.filter((keyword) =>
        titleLower.includes(keyword.toLowerCase())
      ).length;
      keywordScore = (matchCount / keywords.length) * 100;
    }

    // 최종 점수
    const finalScore =
      upvotesScore * upvotesWeight +
      commentsScore * commentsWeight +
      recencyScore * recencyWeight +
      keywordScore * keywordWeight;

    return {
      topic,
      finalScore: Math.round(finalScore * 100) / 100,
      scoreBreakdown: {
        upvotes: Math.round(upvotesScore * 100) / 100,
        comments: Math.round(commentsScore * 100) / 100,
        recency: Math.round(recencyScore * 100) / 100,
        keywordMatch: Math.round(keywordScore * 100) / 100,
      },
    };
  }

  /**
   * 트렌딩 토픽 점수 계산 및 정렬
   */
  async getTrendingTopicsWithScores(
    options: TrendingOptions = {}
  ): Promise<TrendScore[]> {
    const { keywords = [] } = options;

    const topics = await this.getTrendingTopics(options);

    // 각 토픽에 대한 점수 계산
    const scoredTopics = topics.map((topic) =>
      this.calculateTrendScore(topic, keywords)
    );

    // 점수 순으로 정렬
    scoredTopics.sort((a, b) => b.finalScore - a.finalScore);

    return scoredTopics;
  }

  /**
   * 트렌딩 토픽과 수익성 데이터를 결합하여 반환
   *
   * @param options 트렌딩 옵션
   * @returns 수익성 데이터가 포함된 트렌딩 토픽 배열
   */
  async getTrendingTopicsWithRevenue(
    options: TrendingOptions = {}
  ): Promise<ScoredTrendingTopic[]> {
    // 1. 소셜 미디어 트렌드 점수 가져오기
    const trendScores = await this.getTrendingTopicsWithScores(options);

    // 2. 키워드 수익 데이터 가져오기
    const topics = trendScores.map((score) => score.topic);
    const keywordDataList = await this.getKeywordRevenueData(topics);

    // 3. 수익성 점수 계산
    const revenueScores = calculateRevenueScores(keywordDataList);

    // 4. 트렌드 점수와 수익성 점수 결합
    const combinedResults: ScoredTrendingTopic[] = trendScores.map((trendScore, index) => {
      const keywordData = keywordDataList[index];
      const revenueScore = revenueScores[index];

      return {
        ...trendScore,
        revenueData: keywordData,
        revenueScore: revenueScore,
      };
    });

    // 5. 종합 점수로 정렬 (트렌드 점수 60% + 수익성 점수 40%)
    combinedResults.sort((a, b) => {
      const scoreA = (a.finalScore * 0.6) + ((a.revenueScore?.totalScore || 0) * 0.4);
      const scoreB = (b.finalScore * 0.6) + ((b.revenueScore?.totalScore || 0) * 0.4);
      return scoreB - scoreA;
    });

    return combinedResults;
  }

  /**
   * 해시태그 추출 (Twitter용)
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  }
}

/**
 * 트렌딩 토픽 가져오기 헬퍼 함수
 */
export async function getTrendingTopics(
  options: TrendingOptions = {}
): Promise<TrendingTopic[]> {
  const monitor = new TrendingMonitor();
  return monitor.getTrendingTopics(options);
}

/**
 * 트렌딩 토픽 점수와 함께 가져오기
 */
export async function getTrendingTopicsWithScores(
  options: TrendingOptions = {}
): Promise<TrendScore[]> {
  const monitor = new TrendingMonitor();
  return monitor.getTrendingTopicsWithScores(options);
}
