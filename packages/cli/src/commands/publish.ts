/**
 * publish 명령어: 마크다운 파일을 WordPress에 발행
 */

import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { WordPressClient, parseMarkdownFile, injectAds } from '@blog/core';
import { loadConfig } from '../utils/config';

interface PublishOptions {
  draft: boolean;
  language: 'ko' | 'en';
  dryRun: boolean;
}

export async function publishCommand(file: string, options: PublishOptions) {
  const spinner = ora('마크다운 파일 읽는 중...').start();

  try {
    const filePath = path.resolve(process.cwd(), file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    spinner.text = '파일 파싱 중...';
    const { metadata, htmlContent } = await parseMarkdownFile(fileContent);

    const finalStatus = options.draft ? 'draft' : metadata.status;

    spinner.text = 'WordPress 연결 중...';
    const config = await loadConfig();
    const wpClient = new WordPressClient(config.wordpress);

    if (options.dryRun) {
      spinner.succeed(chalk.green('시뮬레이션 모드 (실제 업로드하지 않음)'));
      console.log(chalk.cyan('\n제목:'), metadata.title);
      console.log(chalk.cyan('상태:'), finalStatus);
      console.log(chalk.cyan('언어:'), metadata.language);
      console.log(chalk.cyan('카테고리:'), metadata.categories?.join(', ') || '없음');
      console.log(chalk.cyan('태그:'), metadata.tags?.join(', ') || '없음');
      return;
    }

    spinner.text = '광고 코드 삽입 중...';
    const contentWithAds = injectAds(htmlContent, config.ads);

    spinner.text = 'WordPress에 업로드 중...';
    const postId = await wpClient.createPost(
      { ...metadata, status: finalStatus },
      contentWithAds
    );

    spinner.succeed(chalk.green(`포스트 발행 완료! (ID: ${postId})`));
    console.log(chalk.blue(`URL: ${config.wordpress.url}/?p=${postId}`));
  } catch (error) {
    spinner.fail(chalk.red('발행 실패'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
