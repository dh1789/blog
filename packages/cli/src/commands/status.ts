/**
 * status 명령어: WordPress 포스트 상태 조회 및 변경
 * PRD 0014: WordPress 포스트 생성 기능 개선 - Task 3.7
 */

import chalk from 'chalk';
import ora from 'ora';
import { WordPressClient } from '@blog/core';
import { loadConfig } from '../utils/config';

interface StatusOptions {
  publish?: boolean;
  draft?: boolean;
  language?: string;
}

/**
 * 포스트 상태 조회 또는 변경
 *
 * @param slug 포스트 슬러그
 * @param options 명령어 옵션
 *
 * @example
 * ```bash
 * # 상태 조회
 * blog status my-post-slug
 *
 * # 발행으로 변경
 * blog status my-post-slug --publish
 *
 * # 초안으로 변경
 * blog status my-post-slug --draft
 *
 * # 언어 지정
 * blog status my-post-slug -l en
 * ```
 */
export async function statusCommand(slug: string, options: StatusOptions) {
  const spinner = ora('WordPress 포스트 조회 중...').start();

  try {
    const config = await loadConfig();
    const client = new WordPressClient(config);

    // 포스트 조회
    const post = await client.getPostBySlug(slug, options.language);

    if (!post) {
      spinner.fail(`포스트를 찾을 수 없습니다: ${slug}`);
      console.error(
        chalk.red('오류:'),
        `슬러그 "${slug}"에 해당하는 포스트가 없습니다.`
      );
      process.exit(1);
    }

    // 상태 변경 요청인 경우
    if (options.publish || options.draft) {
      const newStatus = options.publish ? 'publish' : 'draft';
      spinner.text = `포스트 상태 변경 중: ${post.status} → ${newStatus}...`;

      const result = await client.changePostStatus(post.id, newStatus);

      if (result.unchanged) {
        spinner.info(`포스트가 이미 "${result.newStatus}" 상태입니다.`);
      } else {
        spinner.succeed(
          `포스트 상태 변경 완료: ${result.previousStatus} → ${result.newStatus}`
        );
      }

      console.log('');
      console.log(chalk.bold('포스트 정보:'));
      console.log(`  ${chalk.gray('ID:')}      ${chalk.cyan(post.id)}`);
      console.log(`  ${chalk.gray('제목:')}    ${post.title}`);
      console.log(`  ${chalk.gray('상태:')}    ${formatStatus(result.newStatus)}`);
      console.log(`  ${chalk.gray('URL:')}     ${chalk.blue(post.link)}`);
      console.log('');

      return;
    }

    // 상태 조회만 하는 경우
    spinner.succeed(`포스트를 찾았습니다: ${post.title}`);

    console.log('');
    console.log(chalk.bold('포스트 상태 정보:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  ${chalk.gray('ID:')}        ${chalk.cyan(post.id)}`);
    console.log(`  ${chalk.gray('제목:')}      ${post.title}`);
    console.log(`  ${chalk.gray('슬러그:')}    ${chalk.gray(post.slug)}`);
    console.log(`  ${chalk.gray('상태:')}      ${formatStatus(post.status)}`);
    console.log(`  ${chalk.gray('발행일:')}    ${formatDate(post.date)}`);
    if (post.excerpt) {
      const shortExcerpt = stripHtml(post.excerpt).substring(0, 100);
      console.log(`  ${chalk.gray('요약:')}      ${shortExcerpt}...`);
    }
    console.log(`  ${chalk.gray('URL:')}       ${chalk.blue(post.link)}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');
    console.log(chalk.gray('상태 변경:'));
    console.log(`  ${chalk.green('발행하려면:')} blog status ${slug} --publish`);
    console.log(`  ${chalk.yellow('초안으로:')}   blog status ${slug} --draft`);
    console.log('');
  } catch (error) {
    spinner.fail('포스트 상태 조회/변경 실패');
    console.error(
      chalk.red('오류:'),
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * 상태 텍스트를 포맷팅
 */
function formatStatus(status: string): string {
  switch (status) {
    case 'publish':
      return chalk.green('발행됨 (publish)');
    case 'draft':
      return chalk.yellow('초안 (draft)');
    case 'pending':
      return chalk.blue('검토 대기 (pending)');
    case 'private':
      return chalk.magenta('비공개 (private)');
    default:
      return chalk.gray(status);
  }
}

/**
 * 날짜를 포맷팅
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * HTML 태그 제거
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
