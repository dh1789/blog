/**
 * 분석 대시보드 모듈
 * - WordPress API를 통한 블로그 통계 수집
 * - 포스트별 조회수, 댓글, 좋아요 분석
 */

import WPAPI from 'wpapi';
import type {
  WordPressConfig,
  PostStats,
  PeriodStats,
  AnalyticsDashboard,
  AnalyticsOptions,
} from '@blog/shared';

/**
 * 분석 클라이언트
 */
export class AnalyticsClient {
  private wp: WPAPI;

  constructor(config: WordPressConfig) {
    this.wp = new WPAPI({
      endpoint: `${config.url}/wp-json`,
      username: config.username,
      password: config.password,
    });
  }

  /**
   * 대시보드 데이터 가져오기
   */
  async getDashboard(
    options: AnalyticsOptions = {}
  ): Promise<AnalyticsDashboard> {
    const {
      period = 'month',
      limit = 10,
      sortBy = 'views',
    } = options;

    // 모든 포스트 가져오기
    const posts = await this.getAllPosts();

    // 포스트 통계 생성
    const postStats = posts.map((post: any) => this.mapPostToStats(post));

    // 정렬
    const sortedPosts = this.sortPosts(postStats, sortBy);

    // 기간 필터링
    const periodPosts = this.filterByPeriod(postStats, period);

    // 요약 통계 계산
    const summary = this.calculateSummary(postStats);

    // 기간별 통계
    const periodStats = this.calculatePeriodStats(periodPosts, period);

    return {
      summary,
      topPosts: sortedPosts.slice(0, limit),
      recentPosts: this.sortPosts(postStats, 'date').slice(0, limit),
      periodStats,
    };
  }

  /**
   * 모든 포스트 가져오기
   */
  private async getAllPosts(): Promise<any[]> {
    try {
      const posts = await this.wp.posts().perPage(100).get();
      return posts;
    } catch (error) {
      throw new Error(
        `Failed to fetch posts: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * WordPress 포스트를 PostStats로 변환
   */
  private mapPostToStats(post: any): PostStats {
    return {
      id: post.id,
      title: post.title?.rendered || 'Untitled',
      url: post.link || '',
      publishedDate: new Date(post.date),
      // WordPress 기본 API는 조회수를 제공하지 않으므로 메타 데이터에서 가져옴
      // 플러그인(Jetpack, Google Analytics) 설치 시 사용 가능
      views: this.extractViews(post),
      comments: post.comment_count || 0,
      likes: this.extractLikes(post),
      shares: this.extractShares(post),
    };
  }

  /**
   * 조회수 추출 (메타 데이터 또는 플러그인 데이터)
   */
  private extractViews(post: any): number {
    // Jetpack Stats
    if (post.jetpack_stats?.views) {
      return post.jetpack_stats.views;
    }

    // Custom meta field
    if (post.meta?._post_views_count) {
      return parseInt(post.meta._post_views_count, 10);
    }

    // WP Statistics
    if (post.wp_statistics?.views) {
      return post.wp_statistics.views;
    }

    // 기본값: 댓글 수 * 10으로 추정 (플러그인 없을 때)
    return (post.comment_count || 0) * 10;
  }

  /**
   * 좋아요 수 추출
   */
  private extractLikes(post: any): number | undefined {
    // Jetpack Likes
    if (post.jetpack_likes_enabled && post.jetpack_likes?.count) {
      return post.jetpack_likes.count;
    }

    return undefined;
  }

  /**
   * 공유 수 추출
   */
  private extractShares(post: any): number | undefined {
    // Jetpack Sharing
    if (post.jetpack_sharing?.count) {
      return post.jetpack_sharing.count;
    }

    return undefined;
  }

  /**
   * 포스트 정렬
   */
  private sortPosts(
    posts: PostStats[],
    sortBy: 'views' | 'comments' | 'date'
  ): PostStats[] {
    const sorted = [...posts];

    switch (sortBy) {
      case 'views':
        sorted.sort((a, b) => b.views - a.views);
        break;
      case 'comments':
        sorted.sort((a, b) => b.comments - a.comments);
        break;
      case 'date':
        sorted.sort(
          (a, b) =>
            b.publishedDate.getTime() - a.publishedDate.getTime()
        );
        break;
    }

    return sorted;
  }

  /**
   * 기간별 필터링
   */
  private filterByPeriod(
    posts: PostStats[],
    period: 'day' | 'week' | 'month' | 'year'
  ): PostStats[] {
    const now = new Date();
    const cutoffDate = new Date(now);

    switch (period) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return posts.filter(
      (post) => post.publishedDate >= cutoffDate
    );
  }

  /**
   * 요약 통계 계산
   */
  private calculateSummary(posts: PostStats[]) {
    const totalPosts = posts.length;
    const totalViews = posts.reduce(
      (sum, post) => sum + post.views,
      0
    );
    const totalComments = posts.reduce(
      (sum, post) => sum + post.comments,
      0
    );
    const averageViewsPerPost =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    return {
      totalPosts,
      totalViews,
      totalComments,
      averageViewsPerPost,
    };
  }

  /**
   * 기간별 통계 계산
   */
  private calculatePeriodStats(
    posts: PostStats[],
    period: 'day' | 'week' | 'month' | 'year'
  ): PeriodStats {
    const totalPosts = posts.length;
    const totalViews = posts.reduce(
      (sum, post) => sum + post.views,
      0
    );
    const totalComments = posts.reduce(
      (sum, post) => sum + post.comments,
      0
    );
    const averageViewsPerPost =
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    return {
      period,
      totalViews,
      totalPosts,
      totalComments,
      averageViewsPerPost,
    };
  }

  /**
   * 특정 포스트 상세 통계
   */
  async getPostStats(postId: number): Promise<PostStats> {
    try {
      const post = await this.wp.posts().id(postId).get();
      return this.mapPostToStats(post);
    } catch (error) {
      throw new Error(
        `Failed to fetch post ${postId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * 대시보드 데이터 가져오기 헬퍼 함수
 */
export async function getDashboard(
  config: WordPressConfig,
  options: AnalyticsOptions = {}
): Promise<AnalyticsDashboard> {
  const client = new AnalyticsClient(config);
  return client.getDashboard(options);
}

/**
 * 포스트 통계 가져오기 헬퍼 함수
 */
export async function getPostStats(
  config: WordPressConfig,
  postId: number
): Promise<PostStats> {
  const client = new AnalyticsClient(config);
  return client.getPostStats(postId);
}
