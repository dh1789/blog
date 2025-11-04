/**
 * translate 명령어: 한국어 포스트를 영어로 번역
 */

import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import matter from 'gray-matter';
import {
  translatePost,
  validateTranslation,
  type TranslationResult
} from '@blog/core';
import { PostMetadataSchema, type PostMetadata } from '@blog/shared';

export interface TranslateOptions {
  target: 'en' | 'ko';
  publish: boolean;
  dryRun: boolean;
  output?: string;
}

export async function translateCommand(file: string, options: TranslateOptions) {
  const spinner = ora('한국어 포스트 읽는 중...').start();

  try {
    // 파일 읽기
    const filePath = path.resolve(process.cwd(), file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Frontmatter 파싱
    spinner.text = 'Frontmatter 파싱 중...';
    const { data: rawMetadata, content } = matter(fileContent);

    // 메타데이터 검증
    let metadata: PostMetadata;
    try {
      metadata = PostMetadataSchema.parse(rawMetadata);
    } catch (error) {
      spinner.fail(chalk.red('Frontmatter 검증 실패'));
      if (error instanceof Error) {
        console.error(chalk.red('\n검증 오류:'));
        if ('issues' in error && Array.isArray((error as any).issues)) {
          (error as any).issues.forEach((issue: any) => {
            const field = issue.path.join('.');
            console.error(chalk.yellow(`  - ${field}: ${issue.message}`));
          });
        }
      }
      process.exit(1);
    }

    // 원본 언어 확인
    if (metadata.language !== 'ko') {
      spinner.fail(chalk.red('이 명령어는 한국어 포스트만 번역할 수 있습니다.'));
      console.error(chalk.yellow(`\n현재 언어: ${metadata.language}`));
      process.exit(1);
    }

    // AI 번역 수행
    spinner.text = `AI를 사용하여 ${options.target}로 번역 중... (약 30초 소요)`;

    const translationResult: TranslationResult = await translatePost(
      content,
      metadata,
      {
        targetLang: options.target,
        optimizeSeo: true,
        preserveCodeBlocks: true
      }
    );

    spinner.succeed(chalk.green('번역 완료!'));

    // 번역 결과 표시
    displayTranslationResult(metadata, translationResult);

    // 검증
    console.log(chalk.cyan('\n=== 번역 검증 중 ==='));
    const validation = await validateTranslation(
      fileContent,
      metadata,
      translationResult.translatedContent,
      translationResult.translatedMetadata
    );

    const errors = validation.issues.filter(i => i.severity === 'error');
    const warnings = validation.issues.filter(i => i.severity === 'warning');

    if (errors.length > 0) {
      console.error(chalk.red('\n❌ 검증 실패:'));
      errors.forEach(err => console.error(chalk.red(`  - ${err.message}`)));
    }

    if (warnings.length > 0) {
      console.warn(chalk.yellow('\n⚠️  경고:'));
      warnings.forEach(warn => console.warn(chalk.yellow(`  - ${warn.message}`)));
    }

    if (validation.isValid) {
      console.log(chalk.green('✅ 번역 검증 통과'));
    }

    // Dry-run 모드
    if (options.dryRun) {
      console.log(chalk.yellow('\n[DRY-RUN] 실제 파일을 생성하지 않습니다.'));
      console.log(chalk.dim('\n번역된 내용 미리보기:'));
      console.log(chalk.dim(translationResult.translatedContent.substring(0, 500) + '...'));
      return;
    }

    // 출력 파일 경로 결정
    const outputPath = determineOutputPath(filePath, options);

    // 번역된 마크다운 파일 생성
    await saveTranslatedFile(
      outputPath,
      translationResult.translatedMetadata,
      translationResult.translatedContent
    );

    console.log(chalk.green(`\n✅ 번역 파일 생성 완료: ${outputPath}`));

    // 발행 옵션
    if (options.publish) {
      console.log(chalk.cyan('\n=== WordPress 발행 중 ==='));
      // TODO: publish 명령어 통합
      console.log(chalk.yellow('자동 발행은 아직 구현되지 않았습니다.'));
      console.log(chalk.yellow(`수동 발행: blog publish ${outputPath}`));
    }

  } catch (error) {
    spinner.fail(chalk.red('번역 실패'));
    console.error(chalk.red(`\n오류: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * 번역 결과 표시
 */
function displayTranslationResult(
  original: PostMetadata,
  result: TranslationResult
) {
  console.log(chalk.cyan('\n=== 번역 결과 ==='));

  console.log(chalk.white('\n원본 (한국어):'));
  console.log(`  제목: ${original.title}`);
  console.log(`  Slug: ${original.slug}`);
  console.log(`  카테고리: ${original.categories?.join(', ') || 'N/A'}`);
  console.log(`  태그: ${original.tags?.join(', ') || 'N/A'}`);

  console.log(chalk.white('\n번역본 (영어):'));
  console.log(`  제목: ${result.translatedMetadata.title}`);
  console.log(`  Slug: ${result.translatedMetadata.slug}`);
  console.log(`  발췌문: ${result.translatedMetadata.excerpt?.substring(0, 100)}...`);
  console.log(`  카테고리: ${result.translatedMetadata.categories?.join(', ') || 'N/A'}`);
  console.log(`  태그: ${result.translatedMetadata.tags?.join(', ') || 'N/A'}`);

  // SEO 리포트
  console.log(chalk.cyan('\n=== SEO 분석 ==='));
  console.log(`제목 최적화: ${result.seoReport.titleOptimized ? '✅' : '❌'}`);
  console.log(`발췌문 길이: ${result.seoReport.excerptLength}/300자 ${result.seoReport.excerptValid ? '✅' : '❌'}`);

  if (result.seoReport.keywordDensity.length > 0) {
    console.log(chalk.white('\n키워드 밀도:'));
    result.seoReport.keywordDensity.forEach(kd => {
      const statusIcon = kd.status === 'ok' ? '✅' : kd.status === 'warning' ? '⚠️' : '❌';
      console.log(`  ${statusIcon} ${kd.keyword}: ${kd.density.toFixed(2)}% (${kd.count}회)`);
    });
  }

  if (result.seoReport.suggestions.length > 0) {
    console.log(chalk.yellow('\nSEO 개선 제안:'));
    result.seoReport.suggestions.forEach(suggestion => {
      console.log(chalk.yellow(`  - ${suggestion}`));
    });
  }
}

/**
 * 출력 파일 경로 결정
 */
function determineOutputPath(inputPath: string, options: TranslateOptions): string {
  if (options.output) {
    return path.resolve(process.cwd(), options.output);
  }

  // 기본 경로: content/posts/ko/xxx.md → content/posts/en/xxx.md
  const parsedPath = path.parse(inputPath);
  const pathParts = parsedPath.dir.split(path.sep);

  // 'ko'를 'en'으로 변경
  const koIndex = pathParts.indexOf('ko');
  if (koIndex !== -1) {
    pathParts[koIndex] = options.target;
  }

  const outputDir = pathParts.join(path.sep);
  return path.join(outputDir, parsedPath.base);
}

/**
 * 번역된 파일 저장
 */
async function saveTranslatedFile(
  outputPath: string,
  metadata: PostMetadata,
  content: string
): Promise<void> {
  // 디렉토리 생성 (존재하지 않으면)
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Frontmatter + 본문 조합
  const frontmatter = {
    title: metadata.title,
    slug: metadata.slug,
    excerpt: metadata.excerpt,
    status: metadata.status,
    categories: metadata.categories,
    tags: metadata.tags,
    language: metadata.language
  };

  const fileContent = matter.stringify(content, frontmatter);

  // 파일 쓰기
  await fs.writeFile(outputPath, fileContent, 'utf-8');
}
