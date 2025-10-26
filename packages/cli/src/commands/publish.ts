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

    spinner.text = '파일 파싱 및 검증 중...';
    let metadata, htmlContent;

    try {
      const parsed = await parseMarkdownFile(fileContent);
      metadata = parsed.metadata;
      htmlContent = parsed.htmlContent;
    } catch (error) {
      spinner.fail(chalk.red('Frontmatter 검증 실패'));

      if (error instanceof Error) {
        console.error(chalk.red('\n검증 오류:'));

        // Zod validation error handling
        if ('issues' in error && Array.isArray((error as any).issues)) {
          (error as any).issues.forEach((issue: any) => {
            const field = issue.path.join('.');
            console.error(chalk.yellow(`  - ${field}: ${issue.message}`));
          });
        } else {
          console.error(chalk.yellow(`  ${error.message}`));
        }

        console.error(chalk.cyan('\n필수 frontmatter 형식:'));
        console.error(chalk.gray('---'));
        console.error(chalk.gray('title: "포스트 제목" (필수, 최대 200자)'));
        console.error(chalk.gray('excerpt: "요약 설명" (필수, 10-300자)'));
        console.error(chalk.gray('categories: ["카테고리1", "카테고리2"] (필수, 1-5개)'));
        console.error(chalk.gray('tags: ["태그1", "태그2", "태그3"] (필수, 3-10개)'));
        console.error(chalk.gray('status: "draft" 또는 "publish" (선택, 기본값: draft)'));
        console.error(chalk.gray('language: "ko" 또는 "en" (선택, 기본값: ko)'));
        console.error(chalk.gray('---'));
      }

      process.exit(1);
    }

    const finalStatus = options.draft ? 'draft' : metadata.status;

    spinner.text = 'WordPress 연결 중...';
    const config = await loadConfig();
    const wpClient = new WordPressClient(config.wordpress);

    // 발행 전 검증 요약 표시
    spinner.info(chalk.blue('발행 준비 완료'));
    console.log(chalk.cyan('\n=== 포스트 정보 ==='));
    console.log(chalk.white('제목:'), chalk.green(metadata.title));
    console.log(chalk.white('요약:'), chalk.gray(metadata.excerpt.substring(0, 80) + (metadata.excerpt.length > 80 ? '...' : '')));
    console.log(chalk.white('상태:'), finalStatus === 'publish' ? chalk.green(finalStatus) : chalk.yellow(finalStatus));
    console.log(chalk.white('언어:'), metadata.language);
    console.log(chalk.white('카테고리:'), chalk.cyan(metadata.categories.join(', ')));
    console.log(chalk.white('태그:'), chalk.cyan(metadata.tags.join(', ')));
    console.log(chalk.cyan('==================\n'));

    if (options.dryRun) {
      spinner.succeed(chalk.green('시뮬레이션 모드 완료 (실제 업로드하지 않음)'));
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
