/**
 * analyze-seo 명령어: 마크다운 파일의 SEO 점수 분석 및 개선 제안
 */

import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, existsSync } from 'fs';
import matter from 'gray-matter';
import {
  calculateSeoScore,
  calculatePostLength,
  calculateLengthFactor,
  analyzeSectionDistribution,
  validateKeywordDensity,
} from '@blog/core';

interface AnalyzeSeoOptions {
  verbose?: boolean;
  json?: boolean;
}

/**
 * 진행률 바 생성
 */
function getProgressBar(percentage: number): string {
  const barLength = 20;
  const filled = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  return `${bar} ${percentage}%`;
}

export async function analyzeSeoCommand(
  filePath: string,
  options: AnalyzeSeoOptions
) {
  const spinner = ora('SEO 분석 중...').start();

  try {
    // Task 5.2: 마크다운 파일 읽기 및 파싱
    if (!existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const { data: metadata, content: markdownContent } = matter(fileContent);

    // 필수 필드 검증
    if (!metadata.title) {
      throw new Error('Frontmatter에 title이 필요합니다.');
    }

    const keywords = metadata.tags || metadata.keywords || [];
    if (keywords.length === 0) {
      spinner.warn('키워드가 없습니다. tags 또는 keywords를 추가하세요.');
    }

    // Task 5.3: SEO 분석 실행
    const postLength = calculatePostLength(markdownContent);
    const lengthFactor = calculateLengthFactor(postLength);

    const seoResult = calculateSeoScore({
      title: metadata.title || '',
      excerpt: metadata.excerpt || '',
      content: markdownContent,
      keywords,
    });

    const densityValidation = validateKeywordDensity(
      markdownContent,
      keywords,
      postLength
    );

    const sectionDistribution = analyzeSectionDistribution(
      markdownContent,
      keywords
    );

    spinner.succeed('SEO 분석 완료!');

    // Task 5.4: 분석 결과 시각화
    if (options.json) {
      // JSON 형식 출력
      console.log(
        JSON.stringify(
          {
            postLength,
            lengthFactor,
            seoScore: seoResult,
            keywordDensity: densityValidation,
            sectionDistribution,
          },
          null,
          2
        )
      );
      return;
    }

    // 콘솔 시각화
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.cyan('📊 SEO 분석 결과'));
    console.log('='.repeat(80));

    // 기본 정보
    console.log(`\n${chalk.cyan('📄 포스트 정보:')}`);
    console.log(`  제목: ${metadata.title}`);
    console.log(`  길이: ${postLength}줄 (가중치: ${lengthFactor}x)`);
    console.log(`  키워드: ${keywords.join(', ')}`);

    // SEO 점수
    console.log(`\n${chalk.cyan('🎯 SEO 점수:')}`);
    const scoreColor =
      seoResult.score >= 80
        ? chalk.green
        : seoResult.score >= 60
        ? chalk.yellow
        : chalk.red;
    console.log(`  총점: ${scoreColor.bold(`${seoResult.score}/${seoResult.maxScore}`)}`);

    // 카테고리별 점수
    console.log(`\n${chalk.cyan('📋 카테고리별 점수:')}`);
    seoResult.details.forEach((detail) => {
      const percentage = Math.round((detail.score / detail.maxScore) * 100);
      const bar = getProgressBar(percentage);
      console.log(`  ${detail.category.padEnd(15)} ${bar} ${detail.score}/${detail.maxScore}`);
    });

    // 키워드 밀도
    console.log(`\n${chalk.cyan('🔍 키워드 밀도 분석:')}`);
    const validationStatus = densityValidation.valid
      ? chalk.green('✅ 통과')
      : chalk.red('❌ 실패');
    console.log(`  검증 결과: ${validationStatus}`);

    if (densityValidation.targetDensity) {
      console.log(
        `  목표 밀도: ${densityValidation.targetDensity.min.toFixed(2)}% - ${densityValidation.targetDensity.max.toFixed(2)}%`
      );
    }

    console.log(`\n  ${chalk.bold('키워드별 상세:')}`);
    console.log(
      `  ${'키워드'.padEnd(20)} ${'출현'.padEnd(6)} ${'밀도'.padEnd(8)} 상태`
    );
    console.log(`  ${'-'.repeat(50)}`);

    densityValidation.densities.forEach((d) => {
      const status = d.isOptimal ? chalk.green('✓') : chalk.red('✗');
      const keyword = d.keyword.padEnd(20);
      const count = `${d.count}회`.padEnd(6);
      const density = `${d.density.toFixed(2)}%`.padEnd(8);
      console.log(`  ${keyword} ${count} ${density} ${status}`);
    });

    // 섹션 분포
    console.log(`\n${chalk.cyan('📑 섹션 분포 분석:')}`);
    const sectionsWithKeywords = sectionDistribution.filter(
      (s) => s.totalKeywords > 0
    ).length;
    const distributionRatio = sectionsWithKeywords / sectionDistribution.length;
    console.log(`  전체 섹션: ${sectionDistribution.length}개`);
    console.log(
      `  키워드 포함 섹션: ${sectionsWithKeywords}/${sectionDistribution.length} (${(distributionRatio * 100).toFixed(1)}%)`
    );

    if (options.verbose) {
      console.log(`\n  ${chalk.bold('섹션별 상세:')}`);
      sectionDistribution.forEach((section) => {
        const title = section.sectionTitle.substring(0, 40).padEnd(42);
        const status =
          section.totalKeywords > 0 ? chalk.green('●') : chalk.red('○');
        console.log(`  ${status} ${title} ${section.totalKeywords}회`);
      });
    }

    // Task 5.5: 개선 제안 생성
    const suggestions: string[] = [];

    // 1. 키워드 밀도 개선 제안
    densityValidation.densities.forEach((d) => {
      if (!d.isOptimal && densityValidation.targetDensity) {
        if (d.density < densityValidation.targetDensity.min) {
          // 키워드가 너무 적음
          const neededCount = Math.ceil(
            (densityValidation.targetDensity.min / 100) *
              markdownContent.split(/\s+/).length -
              d.count
          );

          if (neededCount > 0) {
            // 키워드가 없는 섹션 찾기
            const emptySections = sectionDistribution.filter(
              (s) => !s.keywordCounts[d.keyword] || s.keywordCounts[d.keyword] === 0
            );

            if (emptySections.length > 0) {
              const sectionNames = emptySections
                .slice(0, 2)
                .map((s) => `"${s.sectionTitle}"`)
                .join(', ');
              suggestions.push(
                `'${d.keyword}' 키워드를 ${sectionNames} 섹션에 ${neededCount}회 추가 권장 (현재: ${d.density.toFixed(2)}%, 목표: ${densityValidation.targetDensity.min.toFixed(2)}%)`
              );
            } else {
              suggestions.push(
                `'${d.keyword}' 키워드를 전체적으로 ${neededCount}회 추가 권장 (현재: ${d.density.toFixed(2)}%, 목표: ${densityValidation.targetDensity.min.toFixed(2)}%)`
              );
            }
          }
        } else if (d.density > densityValidation.targetDensity.max) {
          // 키워드가 너무 많음
          const excessCount = Math.ceil(
            d.count -
              (densityValidation.targetDensity.max / 100) *
                markdownContent.split(/\s+/).length
          );

          if (excessCount > 0) {
            // 키워드가 가장 많은 섹션 찾기
            const sortedSections = sectionDistribution
              .filter((s) => s.keywordCounts[d.keyword] > 0)
              .sort(
                (a, b) => b.keywordCounts[d.keyword] - a.keywordCounts[d.keyword]
              );

            if (sortedSections.length > 0) {
              const sectionName = sortedSections[0].sectionTitle;
              suggestions.push(
                `'${d.keyword}' 키워드를 "${sectionName}" 섹션에서 ${excessCount}회 제거 권장 (현재: ${d.density.toFixed(2)}%, 목표: ${densityValidation.targetDensity.max.toFixed(2)}%)`
              );
            } else {
              suggestions.push(
                `'${d.keyword}' 키워드를 전체적으로 ${excessCount}회 제거 권장 (현재: ${d.density.toFixed(2)}%, 목표: ${densityValidation.targetDensity.max.toFixed(2)}%)`
              );
            }
          }
        }
      }
    });

    // 2. 섹션 분포 개선 제안
    if (distributionRatio < 0.5) {
      // 50% 미만의 섹션에만 키워드가 있음
      const emptySections = sectionDistribution.filter(
        (s) => s.totalKeywords === 0
      );
      const sectionNames = emptySections
        .slice(0, 3)
        .map((s) => `"${s.sectionTitle}"`)
        .join(', ');
      suggestions.push(
        `키워드가 없는 섹션이 많습니다. ${sectionNames} 섹션에 키워드를 추가하세요. (현재: ${(distributionRatio * 100).toFixed(1)}%, 목표: 50%+ 권장)`
      );
    }

    // 개선 제안 출력
    if (suggestions.length > 0) {
      console.log(`\n${chalk.cyan('💡 개선 제안:')}`);
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log(`\n${chalk.green('✨ 훌륭합니다! 개선할 부분이 없습니다.')}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    spinner.fail('SEO 분석 실패');
    console.error(chalk.red('오류:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
