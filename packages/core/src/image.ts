/**
 * 이미지 생성 모듈 - DALL-E 통합
 */

import OpenAI from 'openai';
import type { ImageGenerationOptions, ImageGenerationResult } from '@blog/shared';
import { writeFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { transliterate, slugify } from 'transliteration';

/**
 * DALL-E 클라이언트
 */
export class ImageGenerator {
  private openai: OpenAI | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;

    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  /**
   * API 키 설정 확인
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * 이미지 생성
   */
  async generateImage(
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    if (!this.openai) {
      throw new Error(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }

    const {
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      model = 'dall-e-3',
    } = options;

    try {
      const response = await this.openai.images.generate({
        model,
        prompt,
        size,
        quality,
        style,
        n: 1,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from OpenAI');
      }

      const imageData = response.data[0];

      if (!imageData.url) {
        throw new Error('No image URL returned from OpenAI');
      }

      return {
        url: imageData.url,
        revisedPrompt: imageData.revised_prompt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error('Failed to generate image: Unknown error');
    }
  }

  /**
   * 이미지 URL에서 다운로드
   */
  async downloadImage(url: string, outputPath: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      writeFileSync(outputPath, response.data);

      return outputPath;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to download image: ${error.message}`);
      }
      throw new Error('Failed to download image: Unknown error');
    }
  }

  /**
   * 블로그 포스트용 이미지 생성
   * - 프롬프트 최적화
   * - 이미지 다운로드
   */
  async generateBlogImage(options: {
    title: string;
    keywords: string[];
    style?: 'vivid' | 'natural';
    outputDir?: string;
  }): Promise<{
    url: string;
    localPath: string;
    revisedPrompt?: string;
  }> {
    const { title, keywords, style = 'vivid', outputDir = './images' } = options;

    // 프롬프트 최적화
    const optimizedPrompt = this.optimizeBlogPrompt(title, keywords);

    // 이미지 생성
    const result = await this.generateImage({
      prompt: optimizedPrompt,
      size: '1792x1024', // 블로그 배너용 와이드 사이즈
      quality: 'hd',
      style,
      model: 'dall-e-3',
    });

    // 파일명 생성 (타임스탬프 + 슬러그)
    const timestamp = Date.now();
    const romanized = transliterate(title);
    const slug = slugify(romanized, {
      lowercase: true,
      separator: '-',
    }).substring(0, 50);
    const fileName = `${timestamp}-${slug}.png`;
    const localPath = join(outputDir, fileName);

    // 이미지 다운로드
    await this.downloadImage(result.url, localPath);

    return {
      url: result.url,
      localPath,
      revisedPrompt: result.revisedPrompt,
    };
  }

  /**
   * 블로그용 프롬프트 최적화
   */
  private optimizeBlogPrompt(title: string, keywords: string[]): string {
    const keywordText = keywords.slice(0, 3).join(', ');

    return `Create a professional, eye-catching blog post hero image for an article titled "${title}". The image should be related to ${keywordText}. Use modern, clean design with vibrant colors. The image should be suitable for a tech blog and look professional. No text or words in the image.`;
  }
}

/**
 * 이미지 생성 헬퍼 함수
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const generator = new ImageGenerator();
  return generator.generateImage(options);
}

/**
 * 블로그 이미지 생성 헬퍼 함수
 */
export async function generateBlogImage(options: {
  title: string;
  keywords: string[];
  style?: 'vivid' | 'natural';
  outputDir?: string;
}): Promise<{
  url: string;
  localPath: string;
  revisedPrompt?: string;
}> {
  const generator = new ImageGenerator();
  return generator.generateBlogImage(options);
}
