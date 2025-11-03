/**
 * publish 명령어: 마크다운 파일을 WordPress에 발행
 */

import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import {
  WordPressClient,
  parseMarkdownFile,
  injectAds,
  calculateSeoScore,
  validateKeywordDensity,
} from '@blog/core';
import { loadConfig } from '../utils/config';

interface PublishOptions {
  draft: boolean;
  language: 'ko' | 'en';
  dryRun: boolean;
  linkTo?: string;  // 연결할 포스트 ID (영문 발행 시 사용)
}

export async function publishCommand(file: string, options: PublishOptions) {
  const spinner = ora('마크다운 파일 읽는 중...').start();

  try {
    const filePath = path.resolve(process.cwd(), file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    spinner.text = '파일 파싱 및 검증 중...';
    let metadata, htmlContent, seoData;

    try {
      const parsed = await parseMarkdownFile(fileContent);
      metadata = parsed.metadata;
      htmlContent = parsed.htmlContent;
      seoData = parsed.seoData;
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

    // SEO 점수 계산
    const seoScore = calculateSeoScore({
      title: metadata.title,
      excerpt: metadata.excerpt,
      content: htmlContent,
      keywords: metadata.tags,
    });

    // 키워드 밀도 검증
    const densityValidation = validateKeywordDensity(htmlContent, metadata.tags);

    // 발행 전 검증 요약 표시
    spinner.info(chalk.blue('발행 준비 완료'));
    console.log(chalk.cyan('\n=== 포스트 정보 ==='));
    console.log(chalk.white('제목:'), chalk.green(metadata.title));
    console.log(chalk.white('Slug:'), chalk.gray(seoData.slug));
    console.log(
      chalk.white('요약:'),
      chalk.gray(
        metadata.excerpt.substring(0, 80) +
          (metadata.excerpt.length > 80 ? '...' : '')
      )
    );
    console.log(
      chalk.white('상태:'),
      finalStatus === 'publish' ? chalk.green(finalStatus) : chalk.yellow(finalStatus)
    );
    console.log(chalk.white('언어:'), metadata.language);
    console.log(chalk.white('카테고리:'), chalk.cyan(metadata.categories.join(', ')));
    console.log(chalk.white('태그:'), chalk.cyan(metadata.tags.join(', ')));

    console.log(chalk.cyan('\n=== SEO 점수 ==='));
    const scoreColor =
      seoScore.score >= 80
        ? chalk.green
        : seoScore.score >= 60
        ? chalk.yellow
        : chalk.red;
    console.log(
      chalk.white('총점:'),
      scoreColor(`${seoScore.score}/${seoScore.maxScore}`)
    );

    // 키워드 밀도 경고
    if (!densityValidation.valid) {
      console.log(chalk.yellow('\n⚠️  키워드 밀도 경고:'));
      densityValidation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  - ${warning}`));
      });
    }

    console.log(chalk.cyan('==================\n'));

    if (options.dryRun) {
      spinner.succeed(chalk.green('시뮬레이션 모드 완료 (실제 업로드하지 않음)'));
      return;
    }

    spinner.text = '광고 코드 삽입 중...';
    const contentWithAds = injectAds(htmlContent, config.ads);

    spinner.text = 'WordPress에 업로드 중 (SEO 메타데이터 포함)...';
    const postId = await wpClient.createPost(
      { ...metadata, status: finalStatus },
      contentWithAds,
      seoData
    );

    spinner.succeed(chalk.green(`포스트 발행 완료! (ID: ${postId})`));
    console.log(chalk.blue(`URL: ${config.wordpress.url}/?p=${postId}`));

    // 언어 연결 (영문 포스트이고 --link-to 옵션이 있는 경우)
    if (metadata.language === 'en' && options.linkTo) {
      spinner.start('Polylang 언어 연결 중...');

      try {
        const koPostId = parseInt(options.linkTo, 10);

        if (isNaN(koPostId) || koPostId <= 0) {
          spinner.warn(chalk.yellow('⚠️  잘못된 --link-to 값입니다 (숫자여야 함). 언어 연결을 건너뜁니다.'));
        } else {
          await wpClient.linkTranslations(koPostId, postId);
          spinner.succeed(chalk.green(`언어 연결 완료: 한글(${koPostId}) ↔ 영문(${postId})`));
        }
      } catch (error) {
        // linkTranslations 실패 시에도 포스트 발행은 성공으로 처리
        spinner.warn(chalk.yellow('⚠️  언어 연결 실패 (포스트 발행은 성공)'));

        if (error instanceof Error) {
          console.error(chalk.yellow(`언어 연결 오류: ${error.message}`));
        }

        console.log(chalk.cyan('\n수동 연결 방법:'));
        console.log(chalk.gray(`  blog link-translations --ko ${options.linkTo} --en ${postId}`));
        console.log(chalk.gray('  또는 WordPress 관리자에서 포스트 편집 → Polylang 메타박스에서 연결'));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('발행 실패'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
