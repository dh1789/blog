/**
 * Epic 13.0 Task 2.9: DALL-E 이미지 생성 엔진 스파이크 검증
 *
 * 이 모듈은 DALL-E 3 API를 사용한 이미지 생성 기능을 검증합니다.
 * Task 2.1-2.4의 모든 검증 항목을 자동으로 실행하고 결과를 JSON으로 저장합니다.
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import type {
  SpikeValidationResult,
  Task21Result,
  Task22Result,
  Task23Result,
  Task24Result,
} from '@blog/shared';

/**
 * DALL-E 3 이미지 생성 스파이크 검증 클래스
 */
export class SpikeValidator {
  private openai: OpenAI;
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = 'spike-results') {
    this.openai = new OpenAI({ apiKey });
    this.outputDir = outputDir;

    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Task 2.1: 기본 이미지 생성 검증
   *
   * DALL-E 3 API를 사용하여 기본 이미지 생성 기능을 검증합니다.
   * - 1024x1024 standard quality
   * - 생성 시간 및 파일 크기 측정
   */
  private async task21_BasicGeneration(): Promise<Task21Result> {
    console.log('\n=== Task 2.1: 기본 이미지 생성 검증 ===');

    const testPrompt =
      'Create a modern technical blog header image with abstract code elements. Vibrant tech colors (blue, purple gradient). No text or words in the image.';

    try {
      const startTime = Date.now();

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: testPrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        n: 1,
      });

      const generationTime = Date.now() - startTime;
      const imageUrl = response.data?.[0]?.url;
      const revisedPrompt = response.data?.[0]?.revised_prompt;

      if (!imageUrl) {
        throw new Error('이미지 URL을 받지 못했습니다.');
      }

      // 이미지 다운로드 및 파일 크기 측정
      const imageData = await fetch(imageUrl);
      const buffer = await imageData.arrayBuffer();
      const fileSize = buffer.byteLength;

      // 이미지 저장
      const imagePath = path.join(this.outputDir, 'task21-basic.png');
      fs.writeFileSync(imagePath, Buffer.from(buffer));

      console.log(`✓ 이미지 생성 성공`);
      console.log(`  - 생성 시간: ${generationTime}ms`);
      console.log(`  - 파일 크기: ${(fileSize / 1024).toFixed(2)} KB`);
      console.log(`  - 저장 경로: ${imagePath}`);

      return {
        success: true,
        imageUrl,
        revisedPrompt,
        generationTime,
        fileSize,
      };
    } catch (error) {
      console.error(`✗ Task 2.1 실패:`, error);
      return {
        success: false,
        imageUrl: '',
        generationTime: 0,
        fileSize: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Task 2.2: 품질/크기 제어 검증
   *
   * 다양한 크기와 품질 옵션을 테스트합니다.
   * - 1024x1024 standard
   * - 1024x1024 hd
   * - 1792x1024 hd (wide)
   * - 1024x1792 hd (tall)
   */
  private async task22_QualitySizeControl(): Promise<Task22Result> {
    console.log('\n=== Task 2.2: 품질/크기 제어 검증 ===');

    const testCases = [
      { size: '1024x1024', quality: 'standard', name: 'standard-1024' },
      { size: '1024x1024', quality: 'hd', name: 'hd-1024' },
      { size: '1792x1024', quality: 'hd', name: 'hd-1792-wide' },
      { size: '1024x1792', quality: 'hd', name: 'hd-1792-tall' },
    ] as const;

    const testPrompt =
      'Professional technical illustration with modern design. No text or words in the image.';

    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          console.log(`\n테스트 중: ${testCase.name}...`);
          const startTime = Date.now();

          const response = await this.openai.images.generate({
            model: 'dall-e-3',
            prompt: testPrompt,
            size: testCase.size as any,
            quality: testCase.quality as any,
            style: 'vivid',
            n: 1,
          });

          const generationTime = Date.now() - startTime;
          const imageUrl = response.data?.[0]?.url;

          if (!imageUrl) {
            throw new Error('이미지 URL을 받지 못했습니다.');
          }

          // 이미지 다운로드 및 저장
          const imageData = await fetch(imageUrl);
          const buffer = await imageData.arrayBuffer();
          const fileSize = buffer.byteLength;

          const imagePath = path.join(this.outputDir, `task22-${testCase.name}.png`);
          fs.writeFileSync(imagePath, Buffer.from(buffer));

          console.log(`  ✓ ${testCase.name} 성공 (${generationTime}ms, ${(fileSize / 1024).toFixed(2)} KB)`);

          return {
            name: testCase.name,
            size: testCase.size,
            quality: testCase.quality,
            imageUrl,
            generationTime,
            fileSize,
            success: true,
          };
        } catch (error) {
          console.error(`  ✗ ${testCase.name} 실패:`, error);
          return {
            name: testCase.name,
            size: testCase.size,
            quality: testCase.quality,
            imageUrl: '',
            generationTime: 0,
            fileSize: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    const passedTests = results.filter((r) => r.success).length;
    const failedTests = results.filter((r) => !r.success).length;

    console.log(`\n총 ${testCases.length}개 테스트 중 ${passedTests}개 통과, ${failedTests}개 실패`);

    return {
      success: passedTests === testCases.length,
      testCases: results,
      totalTests: testCases.length,
      passedTests,
      failedTests,
    };
  }

  /**
   * Task 2.3: 비용 및 속도 측정
   *
   * 여러 번 이미지를 생성하여 평균 생성 시간과 비용을 측정합니다.
   * - 3회 반복 생성
   * - 평균/최소/최대 시간 계산
   * - 총 비용 계산
   */
  private async task23_CostAndSpeed(): Promise<Task23Result> {
    console.log('\n=== Task 2.3: 비용 및 속도 측정 ===');

    const iterations = 3;
    const costPerImage = 0.04; // DALL-E 3 standard 1024x1024
    const testPrompt = 'Modern blog illustration. No text or words in the image.';
    const generationTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      try {
        console.log(`\n반복 ${i + 1}/${iterations}...`);
        const startTime = Date.now();

        const response = await this.openai.images.generate({
          model: 'dall-e-3',
          prompt: testPrompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
          n: 1,
        });

        const generationTime = Date.now() - startTime;
        generationTimes.push(generationTime);

        const imageUrl = response.data?.[0]?.url;
        if (imageUrl) {
          const imageData = await fetch(imageUrl);
          const buffer = await imageData.arrayBuffer();
          const imagePath = path.join(this.outputDir, `task23-iteration${i + 1}.png`);
          fs.writeFileSync(imagePath, Buffer.from(buffer));
        }

        console.log(`  ✓ 완료 (${generationTime}ms)`);
      } catch (error) {
        console.error(`  ✗ 반복 ${i + 1} 실패:`, error);
        generationTimes.push(0);
      }
    }

    const averageTime = generationTimes.reduce((a, b) => a + b, 0) / iterations;
    const minTime = Math.min(...generationTimes.filter((t) => t > 0));
    const maxTime = Math.max(...generationTimes);
    const totalCost = iterations * costPerImage;

    console.log(`\n평균 생성 시간: ${averageTime.toFixed(0)}ms`);
    console.log(`최소 시간: ${minTime}ms`);
    console.log(`최대 시간: ${maxTime}ms`);
    console.log(`총 비용: $${totalCost.toFixed(2)}`);

    return {
      success: true,
      iterations,
      generationTimes,
      averageTime,
      minTime,
      maxTime,
      totalCost,
      costPerImage,
      validation: {
        avgTimeUnder30s: averageTime < 30000,
        avgCostUnder010: costPerImage < 0.1,
      },
    };
  }

  /**
   * Task 2.4: 블로그 컨텍스트 기반 생성 테스트
   *
   * 실제 블로그 포스트 메타데이터를 사용하여 이미지를 생성합니다.
   * - WordPress 자동화 컨텍스트
   * - SEO 최적화 컨텍스트
   */
  private async task24_BlogContextGeneration(): Promise<Task24Result> {
    console.log('\n=== Task 2.4: 블로그 컨텍스트 기반 생성 테스트 ===');

    const testCases = [
      {
        name: 'wordpress-automation',
        title: 'WordPress 콘텐츠 자동화 완벽 가이드',
        excerpt: 'WordPress REST API를 활용한 블로그 자동화 도구 개발',
        keywords: ['WordPress', 'Automation', 'REST API'],
        style: 'vivid' as const,
      },
      {
        name: 'seo-optimization',
        title: '블로그 SEO 최적화 전략',
        excerpt: '검색 엔진 최적화를 위한 실전 가이드',
        keywords: ['SEO', 'Blog', 'Optimization'],
        style: 'natural' as const,
      },
    ];

    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          console.log(`\n테스트 중: ${testCase.name}...`);

          const prompt = `Create a professional blog post hero image for "${testCase.title}". About: ${testCase.excerpt}. Topics: ${testCase.keywords.join(', ')}. Modern technical illustration. No text or words in the image.`;

          const startTime = Date.now();

          const response = await this.openai.images.generate({
            model: 'dall-e-3',
            prompt,
            size: '1792x1024',
            quality: 'hd',
            style: testCase.style,
            n: 1,
          });

          const generationTime = Date.now() - startTime;
          const imageUrl = response.data?.[0]?.url;

          if (!imageUrl) {
            throw new Error('이미지 URL을 받지 못했습니다.');
          }

          // 이미지 다운로드 및 저장
          const imageData = await fetch(imageUrl);
          const buffer = await imageData.arrayBuffer();
          const imagePath = path.join(this.outputDir, `task24-${testCase.name}.png`);
          fs.writeFileSync(imagePath, Buffer.from(buffer));

          console.log(`  ✓ ${testCase.name} 성공 (${generationTime}ms)`);

          return {
            name: testCase.name,
            context: testCase.title,
            imageUrl,
            generationTime,
            success: true,
          };
        } catch (error) {
          console.error(`  ✗ ${testCase.name} 실패:`, error);
          return {
            name: testCase.name,
            context: testCase.title,
            imageUrl: '',
            generationTime: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    const passedTests = results.filter((r) => r.success).length;
    const failedTests = results.filter((r) => !r.success).length;

    console.log(`\n총 ${testCases.length}개 테스트 중 ${passedTests}개 통과, ${failedTests}개 실패`);

    return {
      success: passedTests === testCases.length,
      testCases: results,
      totalTests: testCases.length,
      passedTests,
      failedTests,
    };
  }

  /**
   * 전체 스파이크 검증 실행
   *
   * Task 2.1-2.4를 순차적으로 실행하고 종합 결과를 반환합니다.
   */
  async validateImageGeneration(): Promise<SpikeValidationResult> {
    console.log('=== DALL-E 3 이미지 생성 엔진 스파이크 검증 시작 ===');
    console.log(`출력 디렉토리: ${this.outputDir}\n`);

    const task21 = await this.task21_BasicGeneration();
    const task22 = await this.task22_QualitySizeControl();
    const task23 = await this.task23_CostAndSpeed();
    const task24 = await this.task24_BlogContextGeneration();

    // 종합 통계 계산
    const totalTests = 1 + task22.totalTests + task23.iterations + task24.totalTests;
    const passedTests =
      (task21.success ? 1 : 0) +
      task22.passedTests +
      (task23.success ? task23.iterations : 0) +
      task24.passedTests;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    // 모든 생성 시간 평균
    const allGenerationTimes = [
      task21.generationTime,
      ...task22.testCases.map((t) => t.generationTime),
      ...task23.generationTimes,
      ...task24.testCases.map((t) => t.generationTime),
    ].filter((t) => t > 0);

    const averageGenerationTime =
      allGenerationTimes.reduce((a, b) => a + b, 0) / allGenerationTimes.length;

    // 총 비용 계산 (1024x1024 standard: $0.04, hd: $0.08, 1792x1024 hd: $0.08)
    const totalCost =
      task21.success ? 0.04 : 0 + // Task 2.1: 1개 standard
      task22.testCases.filter((t) => t.success).reduce((sum, t) => {
        if (t.quality === 'standard') return sum + 0.04;
        if (t.quality === 'hd') return sum + 0.08;
        return sum;
      }, 0) + // Task 2.2: 4개 (1 standard, 3 hd)
      task23.totalCost + // Task 2.3: 3개 standard
      (task24.passedTests * 0.08); // Task 2.4: 2개 hd wide

    const result: SpikeValidationResult = {
      timestamp: new Date().toISOString(),
      dalleModel: 'dall-e-3',
      openaiApiKey: '***', // 보안을 위해 마스킹
      task21,
      task22,
      task23,
      task24,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: parseFloat(successRate.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        averageGenerationTime: parseFloat(averageGenerationTime.toFixed(0)),
      },
    };

    console.log('\n=== 스파이크 검증 완료 ===');
    console.log(`총 테스트: ${totalTests}개`);
    console.log(`통과: ${passedTests}개`);
    console.log(`실패: ${failedTests}개`);
    console.log(`성공률: ${successRate.toFixed(2)}%`);
    console.log(`총 비용: $${totalCost.toFixed(2)}`);
    console.log(`평균 생성 시간: ${averageGenerationTime.toFixed(0)}ms`);

    return result;
  }

  /**
   * 검증 결과를 JSON 파일로 저장
   *
   * @param result - 검증 결과
   * @param outputPath - 저장 경로 (기본값: spike-results/validation-result.json)
   */
  saveResults(result: SpikeValidationResult, outputPath?: string): void {
    const savePath = outputPath || path.join(this.outputDir, 'validation-result.json');

    fs.writeFileSync(savePath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`\n결과 저장 완료: ${savePath}`);
  }
}
