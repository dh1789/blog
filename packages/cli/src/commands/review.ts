/**
 * @file 품질 검토 명령어
 * @description PRD 0016 - Phase 6: CLI 통합
 *
 * 마크다운 파일의 품질을 검토하고 개선 사항을 제안합니다.
 */

import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { parseMarkdownFile, QualityChecker } from '@blog/core';

interface ReviewOptions {
  verbose: boolean;
  json: boolean;
}

export async function reviewCommand(file: string, options: ReviewOptions) {
  const spinner = ora('마크다운 파일 읽는 중...').start();

  try {
    const filePath = path.resolve(process.cwd(), file);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    spinner.text = '파일 파싱 중...';

    // 마크다운 파싱
    const { metadata, content } = await parseMarkdownFile(fileContent);

    spinner.text = '품질 검사 중...';

    // 품질 검사
    const checker = new QualityChecker();
    const result = checker.check(content, {
      title: metadata.title,
      excerpt: metadata.excerpt,
      tags: metadata.tags,
      language: metadata.language as 'ko' | 'en',
    });

    spinner.stop();

    // JSON 출력 모드
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // 포스트 정보
    console.log(chalk.cyan('\n=== 포스트 정보 ==='));
    console.log(chalk.white('파일:'), chalk.gray(file));
    console.log(chalk.white('제목:'), chalk.green(metadata.title));
    console.log(chalk.white('언어:'), chalk.gray(metadata.language));

    // 품질 체크리스트
    console.log(chalk.cyan('\n=== 품질 체크리스트 ==='));

    const { checklist } = result;

    // 경험담
    console.log(
      chalk.white('경험담 포함:'),
      checklist.hasPersonalExperience
        ? chalk.green('✓ 있음')
        : chalk.yellow('✗ 없음')
    );
    if (checklist.hasPersonalExperience) {
      console.log(
        chalk.white('  자연스러운 통합:'),
        checklist.experienceNaturallyIntegrated
          ? chalk.green('✓')
          : chalk.yellow('✗')
      );
    }

    // 이미지
    console.log(
      chalk.white('이미지:'),
      chalk.gray(`${checklist.imageCount}개`)
    );
    if (checklist.imageCount > 0) {
      console.log(
        chalk.white('  Alt 텍스트:'),
        checklist.imagesHaveAltText
          ? chalk.green('✓ 모두 있음')
          : chalk.yellow('✗ 일부 누락')
      );
    }

    // 번역 품질 (영문만)
    if (metadata.language === 'en') {
      console.log(
        chalk.white('직역 패턴:'),
        checklist.noDirectTranslation
          ? chalk.green('✓ 없음')
          : chalk.yellow('✗ 감지됨')
      );
      console.log(
        chalk.white('네이티브 스타일:'),
        getScoreColor(checklist.nativeStyleScore)(`${checklist.nativeStyleScore}점`)
      );
    }

    // SEO & 가독성
    console.log(
      chalk.white('SEO 점수:'),
      getScoreColor(checklist.seoScore)(`${checklist.seoScore}점`)
    );
    console.log(
      chalk.white('가독성 점수:'),
      getScoreColor(checklist.readabilityScore)(`${checklist.readabilityScore}점`)
    );

    // 전체 점수
    console.log(chalk.cyan('\n=== 전체 점수 ==='));
    console.log(
      chalk.white('종합 점수:'),
      getScoreColor(result.overallScore)(`${result.overallScore}점/100점`)
    );
    console.log(
      chalk.white('발행 준비:'),
      checklist.overallReady
        ? chalk.green('✓ 준비 완료')
        : chalk.yellow('✗ 개선 필요')
    );

    // 이슈
    if (result.issues.length > 0) {
      console.log(chalk.cyan('\n=== 개선 사항 ==='));

      const errors = result.issues.filter((i) => i.type === 'error');
      const warnings = result.issues.filter((i) => i.type === 'warning');
      const infos = result.issues.filter((i) => i.type === 'info');

      if (errors.length > 0) {
        console.log(chalk.red(`\n❌ 에러 (${errors.length}개):`));
        errors.forEach((issue) => {
          console.log(chalk.red(`  • ${issue.message}`));
          if (options.verbose && issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
        });
      }

      if (warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠️  경고 (${warnings.length}개):`));
        warnings.forEach((issue) => {
          console.log(chalk.yellow(`  • ${issue.message}`));
          if (options.verbose && issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
        });
      }

      if (infos.length > 0 && options.verbose) {
        console.log(chalk.blue(`\nℹ️  정보 (${infos.length}개):`));
        infos.forEach((issue) => {
          console.log(chalk.blue(`  • ${issue.message}`));
          if (issue.suggestion) {
            console.log(chalk.gray(`    → ${issue.suggestion}`));
          }
        });
      }
    } else {
      console.log(chalk.green('\n✓ 개선 사항이 없습니다!'));
    }

    console.log(chalk.cyan('\n==================\n'));

    // verbose 모드에서 상세 정보 출력
    if (options.verbose) {
      console.log(chalk.gray('상세 정보:'));
      console.log(chalk.gray(JSON.stringify(checklist, null, 2)));
    }
  } catch (error) {
    spinner.fail(chalk.red('품질 검토 실패'));

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
}

/**
 * 점수에 따른 색상 반환
 */
function getScoreColor(score: number) {
  if (score >= 80) return chalk.green;
  if (score >= 60) return chalk.yellow;
  return chalk.red;
}
