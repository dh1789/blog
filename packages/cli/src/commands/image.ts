/**
 * blog image generate 명령어
 * DALL-E를 사용하여 블로그 이미지 생성
 */

import ora from 'ora';
import chalk from 'chalk';
import { ImageGenerator } from '@blog/core';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface ImageGenerateOptions {
  size?: string;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  output?: string;
  upload?: boolean;
}

/**
 * image generate 명령어 핸들러
 */
export async function imageGenerateCommand(
  prompt: string,
  options: ImageGenerateOptions
): Promise<void> {
  const spinner = ora('이미지 생성 준비 중...').start();

  try {
    // 이미지 생성기 초기화
    const generator = new ImageGenerator();

    // API 키 확인
    if (!generator.isConfigured()) {
      spinner.fail(chalk.red('OpenAI API 키가 설정되지 않았습니다'));
      console.error(chalk.yellow('\n환경 변수 설정이 필요합니다:'));
      console.error(chalk.gray('  export OPENAI_API_KEY="your-api-key-here"'));
      console.error(chalk.gray('\n또는 .env 파일에 추가:'));
      console.error(chalk.gray('  OPENAI_API_KEY=your-api-key-here'));
      process.exit(1);
    }

    // 출력 디렉토리 설정
    const outputDir = options.output || './images';
    const outputPath = resolve(process.cwd(), outputDir);

    // 디렉토리가 없으면 생성
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
    }

    spinner.text = 'DALL-E로 이미지 생성 중... (30초~1분 소요)';

    // 이미지 생성
    const result = await generator.generateImage({
      prompt,
      size: (options.size as any) || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      model: 'dall-e-3',
    });

    spinner.text = '이미지 다운로드 중...';

    // 파일명 생성
    const timestamp = Date.now();
    const fileName = `dall-e-${timestamp}.png`;
    const localPath = resolve(outputPath, fileName);

    // 이미지 다운로드
    await generator.downloadImage(result.url, localPath);

    spinner.succeed(chalk.green('이미지 생성 완료!'));

    console.log(chalk.cyan('\n=== 생성된 이미지 ==='));
    console.log(chalk.white('로컬 경로:'), chalk.gray(localPath));
    console.log(chalk.white('임시 URL:'), chalk.gray(result.url));

    if (result.revisedPrompt) {
      console.log(chalk.white('\nDALL-E 수정 프롬프트:'));
      console.log(chalk.gray(result.revisedPrompt));
    }

    console.log(chalk.cyan('==================\n'));

    if (options.upload) {
      console.log(chalk.yellow('⚠️  WordPress 업로드는 아직 구현되지 않았습니다'));
      console.log(chalk.gray('수동으로 업로드하거나 publish 명령어를 사용하세요'));
    }
  } catch (error) {
    spinner.fail(chalk.red('이미지 생성 실패'));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
}
