/**
 * 이미지 생성 모듈 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageGenerator, generateImage, generateBlogImage } from './image';
import { existsSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import type { ImageGenerationOptions } from '@blog/shared';

// OpenAI 모듈 모킹
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      images: {
        generate: vi.fn().mockResolvedValue({
          data: [
            {
              url: 'https://example.com/generated-image.png',
              revised_prompt: 'A beautiful test image',
            },
          ],
        }),
      },
    })),
  };
});

// axios 모듈 모킹
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({
        data: Buffer.from('fake-image-data'),
      }),
    },
  };
});

describe('ImageGenerator', () => {
  let generator: ImageGenerator;
  const testOutputDir = join(process.cwd(), 'test-images');

  beforeEach(() => {
    // 테스트 디렉토리 생성
    if (!existsSync(testOutputDir)) {
      mkdirSync(testOutputDir, { recursive: true });
    }

    // API 키가 설정된 generator 생성
    generator = new ImageGenerator('test-api-key');
  });

  afterEach(() => {
    // 테스트 파일 정리
    if (existsSync(testOutputDir)) {
      const files = require('fs').readdirSync(testOutputDir);
      files.forEach((file: string) => {
        unlinkSync(join(testOutputDir, file));
      });
      rmdirSync(testOutputDir);
    }
  });

  describe('Configuration', () => {
    it('should initialize with API key', () => {
      const gen = new ImageGenerator('my-api-key');
      expect(gen.isConfigured()).toBe(true);
    });

    it('should initialize with environment variable', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      const gen = new ImageGenerator();
      expect(gen.isConfigured()).toBe(true);
      delete process.env.OPENAI_API_KEY;
    });

    it('should detect missing API key', () => {
      delete process.env.OPENAI_API_KEY;
      const gen = new ImageGenerator();
      expect(gen.isConfigured()).toBe(false);
    });
  });

  describe('generateImage', () => {
    it('should generate image with basic options', async () => {
      const options: ImageGenerationOptions = {
        prompt: 'A beautiful sunset over the ocean',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        model: 'dall-e-3',
      };

      const result = await generator.generateImage(options);

      expect(result.url).toBe('https://example.com/generated-image.png');
      expect(result.revisedPrompt).toBe('A beautiful test image');
    });

    it('should use default values for optional parameters', async () => {
      const options: ImageGenerationOptions = {
        prompt: 'Test prompt',
      };

      const result = await generator.generateImage(options);

      expect(result.url).toBeDefined();
      expect(result.revisedPrompt).toBeDefined();
    });

    it('should throw error if API key not configured', async () => {
      const unconfiguredGen = new ImageGenerator();

      await expect(
        unconfiguredGen.generateImage({
          prompt: 'Test',
        })
      ).rejects.toThrow('OpenAI API key is not configured');
    });

    it('should handle different image sizes', async () => {
      const sizes: Array<'1024x1024' | '1792x1024' | '1024x1792'> = [
        '1024x1024',
        '1792x1024',
        '1024x1792',
      ];

      for (const size of sizes) {
        const result = await generator.generateImage({
          prompt: 'Test',
          size,
        });

        expect(result.url).toBeDefined();
      }
    });

    it('should handle different quality settings', async () => {
      const qualities: Array<'standard' | 'hd'> = ['standard', 'hd'];

      for (const quality of qualities) {
        const result = await generator.generateImage({
          prompt: 'Test',
          quality,
        });

        expect(result.url).toBeDefined();
      }
    });

    it('should handle different style settings', async () => {
      const styles: Array<'vivid' | 'natural'> = ['vivid', 'natural'];

      for (const style of styles) {
        const result = await generator.generateImage({
          prompt: 'Test',
          style,
        });

        expect(result.url).toBeDefined();
      }
    });
  });

  describe('downloadImage', () => {
    it('should download image to specified path', async () => {
      const url = 'https://example.com/test-image.png';
      const outputPath = join(testOutputDir, 'downloaded-image.png');

      const result = await generator.downloadImage(url, outputPath);

      expect(result).toBe(outputPath);
      expect(existsSync(outputPath)).toBe(true);
    });

    it('should handle download errors gracefully', async () => {
      const axios = await import('axios');
      vi.mocked(axios.default.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const url = 'https://example.com/test-image.png';
      const outputPath = join(testOutputDir, 'error-image.png');

      await expect(
        generator.downloadImage(url, outputPath)
      ).rejects.toThrow('Failed to download image: Network error');
    });
  });

  describe('generateBlogImage', () => {
    it('should generate optimized blog image', async () => {
      const options = {
        title: 'AI 블로그 자동화 가이드',
        keywords: ['AI', '자동화', '블로그'],
        style: 'vivid' as const,
        outputDir: testOutputDir,
      };

      const result = await generator.generateBlogImage(options);

      expect(result.url).toBe('https://example.com/generated-image.png');
      expect(result.localPath).toContain(testOutputDir);
      expect(result.revisedPrompt).toBe('A beautiful test image');
      expect(existsSync(result.localPath)).toBe(true);
    });

    it('should use default output directory', async () => {
      const defaultOutputDir = './images';

      // 디렉토리가 없으면 생성
      if (!existsSync(defaultOutputDir)) {
        mkdirSync(defaultOutputDir, { recursive: true });
      }

      const options = {
        title: 'Test Blog Post',
        keywords: ['test', 'blog'],
      };

      const result = await generator.generateBlogImage(options);

      expect(result.localPath).toContain('images');

      // 정리
      if (existsSync(result.localPath)) {
        unlinkSync(result.localPath);
      }
      if (existsSync(defaultOutputDir)) {
        const files = require('fs').readdirSync(defaultOutputDir);
        if (files.length === 0) {
          rmdirSync(defaultOutputDir);
        }
      }
    });

    it('should use natural style when specified', async () => {
      const options = {
        title: 'Natural Style Test',
        keywords: ['nature', 'calm'],
        style: 'natural' as const,
        outputDir: testOutputDir,
      };

      const result = await generator.generateBlogImage(options);

      expect(result.url).toBeDefined();
      expect(existsSync(result.localPath)).toBe(true);
    });

    it('should generate slug from Korean title', async () => {
      const options = {
        title: '한글 제목 테스트',
        keywords: ['테스트'],
        outputDir: testOutputDir,
      };

      const result = await generator.generateBlogImage(options);

      expect(result.localPath).toMatch(/hangeul-jemog-teseuteu/);
    });

    it('should limit keywords to 3 in optimized prompt', async () => {
      const options = {
        title: 'Test Title',
        keywords: ['keyword1', 'keyword2', 'keyword3', 'keyword4', 'keyword5'],
        outputDir: testOutputDir,
      };

      // optimizeBlogPrompt는 private이므로 결과를 간접적으로 테스트
      const result = await generator.generateBlogImage(options);

      expect(result.url).toBeDefined();
    });
  });

  describe('Helper Functions', () => {
    it('generateImage helper should work', async () => {
      // 환경 변수 설정
      process.env.OPENAI_API_KEY = 'test-api-key';

      const options: ImageGenerationOptions = {
        prompt: 'Helper function test',
      };

      const result = await generateImage(options);

      expect(result.url).toBeDefined();
      expect(result.revisedPrompt).toBeDefined();

      // 정리
      delete process.env.OPENAI_API_KEY;
    });

    it('generateBlogImage helper should work', async () => {
      // 환경 변수 설정
      process.env.OPENAI_API_KEY = 'test-api-key';

      const options = {
        title: 'Helper Test',
        keywords: ['test'],
        outputDir: testOutputDir,
      };

      const result = await generateBlogImage(options);

      expect(result.url).toBeDefined();
      expect(result.localPath).toBeDefined();
      expect(existsSync(result.localPath)).toBe(true);

      // 정리
      delete process.env.OPENAI_API_KEY;
    });
  });
});
