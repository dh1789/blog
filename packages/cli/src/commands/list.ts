/**
 * list 명령어: WordPress 포스트 목록 조회
 */

import chalk from 'chalk';
import ora from 'ora';
import { WordPressClient } from '@blog/core';
import { loadConfig } from '../utils/config';

interface ListOptions {
  status: string;
  limit: string;
}

export async function listCommand(options: ListOptions) {
  const spinner = ora('WordPress 포스트 목록 조회 중...').start();

  try {
    const config = await loadConfig();
    const client = new WordPressClient(config);

    const status = options.status === 'all' ? 'all' : options.status as 'publish' | 'draft';
    const limit = parseInt(options.limit, 10);

    const posts = await client.listPosts({ status, limit });

    spinner.succeed(`총 ${posts.length}개의 포스트를 찾았습니다.`);

    if (posts.length === 0) {
      console.log(chalk.yellow('포스트가 없습니다.'));
      return;
    }

    console.log('\n');
    console.log(chalk.bold('ID   | 상태    | 제목                                      | Slug'));
    console.log(chalk.gray('─'.repeat(80)));

    posts.forEach((post) => {
      const statusColor = post.status === 'publish' ? chalk.green : chalk.yellow;
      const statusText = post.status === 'publish' ? '발행됨' : '초안';
      const title = post.title.length > 40 ? post.title.substring(0, 37) + '...' : post.title;

      console.log(
        `${chalk.cyan(post.id.toString().padEnd(4))} | ${statusColor(statusText.padEnd(6))} | ${title.padEnd(40)} | ${chalk.gray(post.slug)}`
      );
    });

    console.log('\n');
  } catch (error) {
    spinner.fail('포스트 목록 조회 실패');
    console.error(chalk.red('오류:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
