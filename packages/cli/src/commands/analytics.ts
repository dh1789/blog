/**
 * blog analytics 명령어
 * 블로그 분석 대시보드 표시
 */

import ora from 'ora';
import chalk from 'chalk';
import { AnalyticsClient } from '@blog/core';
import { loadWordPressConfig } from '../utils/config';
import type { AnalyticsDashboard, PostStats } from '@blog/shared';

interface AnalyticsCommandOptions {
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: string;
  sortBy?: 'views' | 'comments' | 'date';
}

/**
 * analytics 명령어 핸들러
 */
export async function analyticsCommand(
  options: AnalyticsCommandOptions
): Promise<void> {
  const spinner = ora('분석 데이터 수집 중...').start();

  try {
    // WordPress 설정 로드
    const config = loadWordPressConfig();

    // 옵션 파싱
    const period = options.period || 'month';
    const limit = options.limit ? parseInt(options.limit, 10) : 10;
    const sortBy = options.sortBy || 'views';

    // 분석 클라이언트 생성
    const client = new AnalyticsClient(config);

    spinner.text = 'WordPress에서 통계 가져오는 중...';

    // 대시보드 데이터 가져오기
    const dashboard = await client.getDashboard({
      period,
      limit,
      sortBy,
    });

    spinner.succeed(chalk.green('분석 데이터 수집 완료!'));

    // 대시보드 표시
    displayDashboard(dashboard, period);
  } catch (error) {
    spinner.fail(chalk.red('분석 데이터 수집 실패'));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
}

/**
 * 대시보드 표시
 */
function displayDashboard(
  dashboard: AnalyticsDashboard,
  period: string
): void {
  console.log(chalk.cyan('\n=== 📊 블로그 분석 대시보드 ===\n'));

  // 요약 통계
  displaySummary(dashboard.summary);

  // 기간별 통계
  console.log(chalk.cyan(`\n=== 📅 ${getPeriodLabel(period)} 통계 ===\n`));
  displayPeriodStats(dashboard.periodStats);

  // 인기 포스트
  console.log(chalk.cyan('\n=== 🔥 인기 포스트 TOP 10 ===\n'));
  displayTopPosts(dashboard.topPosts);

  // 최근 포스트
  console.log(chalk.cyan('\n=== 📝 최근 포스트 ===\n'));
  displayRecentPosts(dashboard.recentPosts);

  console.log(chalk.cyan('\n============================\n'));
}

/**
 * 요약 통계 표시
 */
function displaySummary(summary: {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  averageViewsPerPost: number;
}): void {
  console.log(chalk.white('총 포스트:'), chalk.yellow(formatNumber(summary.totalPosts)));
  console.log(chalk.white('총 조회수:'), chalk.yellow(formatNumber(summary.totalViews)));
  console.log(chalk.white('총 댓글:'), chalk.yellow(formatNumber(summary.totalComments)));
  console.log(chalk.white('포스트당 평균 조회수:'), chalk.yellow(formatNumber(summary.averageViewsPerPost)));
}

/**
 * 기간별 통계 표시
 */
function displayPeriodStats(stats: {
  period: string;
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  averageViewsPerPost: number;
}): void {
  console.log(chalk.white('기간 내 포스트:'), chalk.yellow(formatNumber(stats.totalPosts)));
  console.log(chalk.white('기간 내 조회수:'), chalk.yellow(formatNumber(stats.totalViews)));
  console.log(chalk.white('기간 내 댓글:'), chalk.yellow(formatNumber(stats.totalComments)));
  console.log(chalk.white('포스트당 평균:'), chalk.yellow(formatNumber(stats.averageViewsPerPost)));
}

/**
 * 인기 포스트 표시
 */
function displayTopPosts(posts: PostStats[]): void {
  if (posts.length === 0) {
    console.log(chalk.gray('데이터가 없습니다.'));
    return;
  }

  posts.forEach((post, index) => {
    const rank = `${index + 1}.`.padEnd(4);
    const rankColor = index < 3 ? chalk.yellow : chalk.white;

    // 제목 (60자 제한)
    const title =
      post.title.length > 60
        ? post.title.substring(0, 57) + '...'
        : post.title;

    console.log(rankColor(rank) + chalk.white(title));
    console.log(
      chalk.gray(
        `     👁️  ${formatNumber(post.views)} views | 💬 ${post.comments} comments`
      )
    );

    if (post.likes !== undefined) {
      console.log(chalk.gray(`     ❤️  ${post.likes} likes`));
    }

    console.log(chalk.gray(`     🔗 ${post.url}`));
    console.log('');
  });
}

/**
 * 최근 포스트 표시
 */
function displayRecentPosts(posts: PostStats[]): void {
  if (posts.length === 0) {
    console.log(chalk.gray('데이터가 없습니다.'));
    return;
  }

  posts.forEach((post) => {
    const relativeDate = formatRelativeDate(post.publishedDate);

    console.log(chalk.white('• ') + chalk.white(post.title));
    console.log(
      chalk.gray(
        `  발행: ${relativeDate} | 👁️  ${formatNumber(post.views)} | 💬 ${post.comments}`
      )
    );
  });
}

/**
 * 기간 레이블
 */
function getPeriodLabel(period: string): string {
  switch (period) {
    case 'day':
      return '최근 24시간';
    case 'week':
      return '최근 7일';
    case 'month':
      return '최근 30일';
    case 'year':
      return '최근 1년';
    default:
      return period;
  }
}

/**
 * 숫자 포맷 (천 단위 콤마)
 */
function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 상대 날짜 포맷
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}
