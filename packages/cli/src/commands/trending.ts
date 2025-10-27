/**
 * blog trending 명령어
 * 인기 트렌드 토픽 모니터링 및 표시
 */

import ora from 'ora';
import chalk from 'chalk';
import { TrendingMonitor } from '@blog/core';
import type { TrendSource } from '@blog/shared';

interface TrendingCommandOptions {
  sources?: string;
  limit?: string;
  keywords?: string;
  minScore?: string;
  language?: 'ko' | 'en';
}

/**
 * trending 명령어 핸들러
 */
export async function trendingCommand(
  options: TrendingCommandOptions
): Promise<void> {
  const spinner = ora('트렌드 토픽 수집 중...').start();

  try {
    // 옵션 파싱
    const sources: TrendSource[] = options.sources
      ? (options.sources.split(',') as TrendSource[])
      : ['reddit', 'hackernews'];

    const limit = options.limit ? parseInt(options.limit, 10) : 10;
    const minScore = options.minScore ? parseInt(options.minScore, 10) : 0;
    const keywords = options.keywords
      ? options.keywords.split(',').map((k) => k.trim())
      : [];

    // 트렌딩 모니터 생성
    const monitor = new TrendingMonitor();

    spinner.text = `${sources.join(', ')}에서 트렌드 수집 중...`;

    // 트렌딩 토픽 가져오기 (점수 포함)
    const scoredTopics = await monitor.getTrendingTopicsWithScores({
      sources,
      limit,
      minScore,
      keywords,
      language: options.language || 'ko',
    });

    spinner.succeed(chalk.green(`${scoredTopics.length}개 트렌드 토픽 발견!`));

    if (scoredTopics.length === 0) {
      console.log(chalk.yellow('\n조건에 맞는 트렌드 토픽이 없습니다.'));
      console.log(chalk.gray('- 최소 점수를 낮추거나'));
      console.log(chalk.gray('- 키워드를 변경해보세요'));
      return;
    }

    // 결과 출력
    console.log(chalk.cyan('\n=== 트렌딩 토픽 ===\n'));

    scoredTopics.forEach((scored, index) => {
      const { topic, finalScore, scoreBreakdown } = scored;

      // 순위 표시
      const rank = `${index + 1}.`.padEnd(4);
      const rankColor = index < 3 ? chalk.yellow : chalk.white;

      // 소스 아이콘
      const sourceIcon = getSourceIcon(topic.source);

      // 점수 색상
      const scoreColor = getScoreColor(finalScore);

      // 제목 (80자 제한)
      const title =
        topic.title.length > 80
          ? topic.title.substring(0, 77) + '...'
          : topic.title;

      console.log(rankColor(rank) + sourceIcon + ' ' + chalk.white(title));
      console.log(
        chalk.gray(
          `     URL: ${topic.url.length > 70 ? topic.url.substring(0, 67) + '...' : topic.url}`
        )
      );
      console.log(
        chalk.gray(`     작성자: ${topic.author || 'Unknown'}`) +
          chalk.gray(
            ` | 작성: ${formatRelativeTime(topic.createdAt)}`
          )
      );

      // 점수 정보
      console.log(
        chalk.gray('     점수: ') +
          scoreColor(`${finalScore.toFixed(1)}점`) +
          chalk.gray(
            ` (↑${topic.score} 💬${topic.comments})`
          )
      );

      // 점수 세부사항
      if (keywords.length > 0) {
        console.log(
          chalk.gray(
            `     세부: 업보트 ${scoreBreakdown.upvotes.toFixed(1)} | 댓글 ${scoreBreakdown.comments.toFixed(1)} | 최신성 ${scoreBreakdown.recency.toFixed(1)} | 키워드 ${scoreBreakdown.keywordMatch.toFixed(1)}`
          )
        );
      }

      // 추가 정보
      if (topic.subreddit) {
        console.log(chalk.gray(`     서브레딧: r/${topic.subreddit}`));
      }
      if (topic.hashtags && topic.hashtags.length > 0) {
        console.log(
          chalk.gray(`     해시태그: ${topic.hashtags.map((t) => `#${t}`).join(' ')}`)
        );
      }

      console.log('');
    });

    console.log(chalk.cyan('==================\n'));

    // 요약 통계
    const avgScore =
      scoredTopics.reduce((sum, s) => sum + s.finalScore, 0) /
      scoredTopics.length;
    const sourceCounts = scoredTopics.reduce(
      (acc, s) => {
        acc[s.topic.source] = (acc[s.topic.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(chalk.white('요약 통계:'));
    console.log(chalk.gray(`  평균 점수: ${avgScore.toFixed(1)}점`));
    console.log(
      chalk.gray(
        `  소스별: ${Object.entries(sourceCounts)
          .map(([source, count]) => `${source}(${count})`)
          .join(', ')}`
      )
    );

    if (keywords.length > 0) {
      console.log(chalk.gray(`  키워드 필터: ${keywords.join(', ')}`));
    }

    console.log('');
  } catch (error) {
    spinner.fail(chalk.red('트렌드 수집 실패'));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
}

/**
 * 소스별 아이콘 가져오기
 */
function getSourceIcon(source: TrendSource): string {
  switch (source) {
    case 'reddit':
      return '🔴';
    case 'hackernews':
      return '🟠';
    case 'twitter':
      return '🔵';
    default:
      return '⚪';
  }
}

/**
 * 점수에 따른 색상
 */
function getScoreColor(score: number): (text: string) => string {
  if (score >= 80) return chalk.green;
  if (score >= 60) return chalk.yellow;
  if (score >= 40) return chalk.blue;
  return chalk.gray;
}

/**
 * 상대 시간 포맷
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  return `${diffDays}일 전`;
}
