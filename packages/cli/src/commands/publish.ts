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
  translatePost,
  validateTranslation,
  parseImagePaths,
  replaceImageUrls,
  resolveImagePath,
  convertMarkdownToHtml,
} from '@blog/core';
import { loadConfig } from '../utils/config';

interface PublishOptions {
  draft: boolean;
  language: 'ko' | 'en';
  dryRun: boolean;
  linkTo?: string;  // 연결할 포스트 ID (영문 발행 시 사용)
  noTranslate?: boolean;  // 자동 번역 비활성화 (기본값: false)
  uploadImages?: boolean;  // 이미지 자동 업로드 (기본값: false)
}

export async function publishCommand(file: string, options: PublishOptions) {
  const spinner = ora('마크다운 파일 읽는 중...').start();

  try {
    const filePath = path.resolve(process.cwd(), file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    spinner.text = '파일 파싱 및 검증 중...';
    let metadata, htmlContent, seoData, content;

    try {
      const parsed = await parseMarkdownFile(fileContent);
      metadata = parsed.metadata;
      content = parsed.content;
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

    // 이미지 자동 업로드 워크플로우
    let finalContent = content;
    let finalHtmlContent = htmlContent;

    if (options.uploadImages) {
      console.log(chalk.cyan('\n=== 이미지 자동 업로드 ==='));
      spinner.start('이미지 경로 파싱 중...');

      const imagePaths = parseImagePaths(content);

      if (imagePaths.length === 0) {
        spinner.info(chalk.blue('로컬 이미지가 없습니다. 업로드를 건너뜁니다.'));
      } else {
        spinner.text = `로컬 이미지 ${imagePaths.length}개 발견`;
        console.log(chalk.gray(`\n발견된 이미지: ${imagePaths.join(', ')}\n`));

        const imageUrlMap = new Map<string, string>();
        const uploadResults: { success: string[]; failed: Array<{ path: string; error: string }> } = {
          success: [],
          failed: [],
        };

        // 마크다운 파일의 디렉토리 경로
        const markdownDir = path.dirname(filePath);

        for (const imagePath of imagePaths) {
          const absolutePath = resolveImagePath(markdownDir, imagePath);

          spinner.text = `이미지 업로드 중: ${path.basename(imagePath)}`;

          try {
            // 파일 존재 확인
            await fs.access(absolutePath);

            const filename = path.basename(absolutePath);

            // 중복 체크
            const existingMedia = await wpClient.findMediaByFilename(filename);

            let wordpressUrl: string;

            if (existingMedia) {
              wordpressUrl = existingMedia.source_url;
              console.log(chalk.yellow(`  ↻ 중복: ${filename} → 기존 URL 재사용`));
            } else {
              // 신규 업로드
              const uploadResult = await wpClient.uploadMedia(absolutePath);
              wordpressUrl = uploadResult.url;
              console.log(chalk.green(`  ✓ 업로드: ${filename} → ${wordpressUrl}`));
            }

            imageUrlMap.set(imagePath, wordpressUrl);
            uploadResults.success.push(imagePath);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(chalk.red(`  ✗ 실패: ${imagePath} - ${errorMessage}`));
            uploadResults.failed.push({ path: imagePath, error: errorMessage });
          }
        }

        // URL 변환
        if (imageUrlMap.size > 0) {
          spinner.text = '마크다운 이미지 URL 변환 중...';
          finalContent = replaceImageUrls(content, imageUrlMap);

          // HTML 재생성
          const { unified } = await import('unified');
          const { default: remarkParse } = await import('remark-parse');
          const { default: remarkGfm } = await import('remark-gfm');
          const { default: remarkRehype } = await import('remark-rehype');
          const { default: rehypeStringify } = await import('rehype-stringify');

          const result = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkRehype)
            .use(rehypeStringify)
            .process(finalContent);

          finalHtmlContent = String(result);
        }

        // 최종 리포트
        console.log(chalk.cyan('\n=== 이미지 업로드 리포트 ==='));
        console.log(chalk.white('총 이미지:'), chalk.gray(imagePaths.length));
        console.log(chalk.green('성공:'), chalk.gray(uploadResults.success.length));

        if (uploadResults.failed.length > 0) {
          console.log(chalk.red('실패:'), chalk.gray(uploadResults.failed.length));
          console.log(chalk.yellow('\n실패한 이미지:'));
          uploadResults.failed.forEach(({ path: p, error }) => {
            console.log(chalk.yellow(`  - ${p}: ${error}`));
          });
        }

        console.log(chalk.cyan('==================\n'));

        spinner.succeed(chalk.green('이미지 업로드 완료'));
      }
    }

    spinner.text = '광고 코드 삽입 중...';
    const contentWithAds = injectAds(finalHtmlContent, config.ads);

    spinner.text = 'WordPress에 업로드 중 (SEO 메타데이터 포함)...';
    const postId = await wpClient.createPost(
      { ...metadata, status: finalStatus },
      contentWithAds,
      seoData
    );

    spinner.succeed(chalk.green(`포스트 발행 완료! (ID: ${postId})`));
    console.log(chalk.blue(`URL: ${config.wordpress.url}/?p=${postId}`));

    // 자동 번역 워크플로우 (한글 포스트이고 --no-translate가 아닌 경우)
    if (metadata.language === 'ko' && !options.noTranslate && !options.dryRun) {
      console.log(chalk.cyan('\n=== 자동 번역 시작 ==='));
      spinner.start('한글 포스트 번역 중 (Claude Code)...');

      try {
        // 1. 포스트 번역
        const translationResult = await translatePost(fileContent, metadata, {
          targetLang: 'en',
          optimizeSeo: true,
          preserveCodeBlocks: true,
        });

        spinner.text = '번역 품질 검증 중...';

        // 2. 품질 검증
        const validationResult = await validateTranslation(
          fileContent,
          metadata,
          translationResult.translatedContent,
          translationResult.translatedMetadata
        );

        // 3. 검증 결과 출력
        spinner.info(chalk.blue('번역 품질 검증 완료'));

        console.log(chalk.cyan('\n=== 번역 품질 메트릭 ==='));
        console.log(chalk.white('라인 수 차이:'), chalk.gray(`${validationResult.metrics.lineCountDiffPercent.toFixed(1)}%`));
        console.log(chalk.white('코드 블록 보존:'), chalk.gray(`${validationResult.metrics.preservedCodeBlocks}개`));
        console.log(
          chalk.white('메타데이터 완전성:'),
          validationResult.metrics.metadataComplete ? chalk.green('✓') : chalk.red('✗')
        );
        console.log(
          chalk.white('SEO 최적화:'),
          validationResult.metrics.seoOptimized ? chalk.green('✓') : chalk.red('✗')
        );
        console.log(chalk.white('제목 길이:'), chalk.gray(`${validationResult.metrics.titleLength}자`));
        console.log(chalk.white('Excerpt 길이:'), chalk.gray(`${validationResult.metrics.excerptLength}자/300자`));

        // 4. 검증 이슈 출력
        if (validationResult.issues.length > 0) {
          console.log(chalk.cyan('\n=== 검증 이슈 ==='));

          const errors = validationResult.issues.filter((i) => i.severity === 'error');
          const warnings = validationResult.issues.filter((i) => i.severity === 'warning');
          const infos = validationResult.issues.filter((i) => i.severity === 'info');

          if (errors.length > 0) {
            console.log(chalk.red(`\n❌ 에러 (${errors.length}개):`));
            errors.forEach((issue) => {
              console.log(chalk.red(`  - ${issue.message}`));
            });
          }

          if (warnings.length > 0) {
            console.log(chalk.yellow(`\n⚠️  경고 (${warnings.length}개):`));
            warnings.forEach((issue) => {
              console.log(chalk.yellow(`  - ${issue.message}`));
            });
          }

          if (infos.length > 0) {
            console.log(chalk.blue(`\nℹ️  정보 (${infos.length}개):`));
            infos.forEach((issue) => {
              console.log(chalk.blue(`  - ${issue.message}`));
            });
          }
        }

        // 5. 검증 실패 시 중단
        if (!validationResult.isValid) {
          spinner.fail(chalk.red('번역 품질 검증 실패'));
          console.log(chalk.yellow('\n한글 포스트만 발행되었습니다.'));
          console.log(chalk.gray('번역 품질을 개선한 후 다시 시도하거나, --no-translate 옵션으로 수동 번역하세요.'));
          return;
        }

        spinner.succeed(chalk.green('번역 품질 검증 통과'));

        // 6. 영어 포스트 발행
        spinner.start('영어 포스트 발행 중...');

        // 번역된 마크다운을 HTML로 변환
        spinner.text = '번역된 마크다운을 HTML로 변환 중...';
        const translatedHtmlContent = await convertMarkdownToHtml(translationResult.translatedContent);

        // 광고 삽입
        spinner.text = '영어 포스트에 광고 코드 삽입 중...';
        const englishContentWithAds = injectAds(translatedHtmlContent, config.ads);
        const englishPostId = await wpClient.createPost(
          { ...translationResult.translatedMetadata, status: finalStatus },
          englishContentWithAds,
          // SEO 데이터는 번역된 메타데이터에서 생성
          {
            slug: translationResult.translatedMetadata.slug || '',
            meta: {
              title: translationResult.translatedMetadata.title,
              description: translationResult.translatedMetadata.excerpt || '',
              keywords: translationResult.translatedMetadata.tags || [],
            },
            openGraph: {
              'og:title': translationResult.translatedMetadata.title,
              'og:description': translationResult.translatedMetadata.excerpt || '',
              'og:type': 'article',
              'og:locale': 'en_US',
            },
            twitterCard: {
              'twitter:card': 'summary_large_image',
              'twitter:title': translationResult.translatedMetadata.title,
              'twitter:description': translationResult.translatedMetadata.excerpt || '',
            },
          }
        );

        spinner.succeed(chalk.green(`영어 포스트 발행 완료! (ID: ${englishPostId})`));
        console.log(chalk.blue(`URL: ${config.wordpress.url}/?p=${englishPostId}`));

        // 7. Polylang 언어 연결
        spinner.start('Polylang 언어 연결 중...');

        try {
          await wpClient.linkTranslations(postId, englishPostId);
          spinner.succeed(chalk.green(`언어 연결 완료: 한글(${postId}) ↔ 영문(${englishPostId})`));
        } catch (linkError) {
          spinner.warn(chalk.yellow('⚠️  언어 연결 실패 (포스트 발행은 성공)'));

          if (linkError instanceof Error) {
            console.error(chalk.yellow(`언어 연결 오류: ${linkError.message}`));
          }

          console.log(chalk.cyan('\n수동 연결 방법:'));
          console.log(chalk.gray(`  blog link-translations --ko ${postId} --en ${englishPostId}`));
          console.log(chalk.gray('  또는 WordPress 관리자에서 포스트 편집 → Polylang 메타박스에서 연결'));
        }

        console.log(chalk.green('\n✓ 자동 번역 및 발행 완료!'));
      } catch (translationError) {
        spinner.fail(chalk.red('자동 번역 실패'));

        if (translationError instanceof Error) {
          console.error(chalk.red(`\n번역 오류: ${translationError.message}`));
        }

        console.log(chalk.yellow('\n한글 포스트만 발행되었습니다.'));
        console.log(chalk.gray('나중에 수동으로 번역하거나, 문제를 해결한 후 다시 시도하세요.'));
      }
    } else if (metadata.language === 'ko' && options.noTranslate) {
      console.log(chalk.gray('\n자동 번역이 비활성화되었습니다. (--no-translate)'));
    }

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
