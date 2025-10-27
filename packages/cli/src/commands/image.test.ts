/**
 * blog image generate 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync } from 'fs';

// ImageGenerator 모킹
const mockIsConfigured = vi.fn();
const mockGenerateImage = vi.fn();
const mockDownloadImage = vi.fn();

vi.mock('@blog/core', () => {
  return {
    ImageGenerator: vi.fn().mockImplementation(() => ({
      isConfigured: mockIsConfigured,
      generateImage: mockGenerateImage,
      downloadImage: mockDownloadImage,
    })),
  };
});

// fs 모듈 모킹
vi.mock('fs', () => {
  return {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

describe('image generate command', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as any);

    // 기본 동작 설정
    mockIsConfigured.mockReturnValue(true);
    vi.mocked(existsSync).mockReturnValue(true);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('기본 동작', () => {
    it('should generate image with default options', async () => {
      const { imageGenerateCommand } = await import('./image');

      const mockResult = {
        url: 'https://example.com/image.png',
        revisedPrompt: 'A beautiful landscape',
      };

      mockGenerateImage.mockResolvedValue(mockResult);
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', {});

      expect(mockIsConfigured).toHaveBeenCalled();
      expect(mockGenerateImage).toHaveBeenCalledWith({
        prompt: 'test prompt',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        model: 'dall-e-3',
      });
      expect(mockDownloadImage).toHaveBeenCalled();

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(output).toContain('생성된 이미지');
      expect(output).toContain('로컬 경로:');
      expect(output).toContain('DALL-E 수정 프롬프트:');
    });

    it('should create output directory if not exists', async () => {
      const { imageGenerateCommand } = await import('./image');

      vi.mocked(existsSync).mockReturnValue(false);
      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { output: './custom-dir' });

      expect(existsSync).toHaveBeenCalled();
      expect(mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('custom-dir'),
        { recursive: true }
      );
    });
  });

  describe('옵션 처리', () => {
    it('should use custom size option', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { size: '1792x1024' });

      expect(mockGenerateImage).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '1792x1024',
        })
      );
    });

    it('should use custom quality option', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { quality: 'hd' });

      expect(mockGenerateImage).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: 'hd',
        })
      );
    });

    it('should use custom style option', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { style: 'natural' });

      expect(mockGenerateImage).toHaveBeenCalledWith(
        expect.objectContaining({
          style: 'natural',
        })
      );
    });

    it('should use custom output directory', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { output: './custom-images' });

      expect(mockDownloadImage).toHaveBeenCalledWith(
        'https://example.com/image.png',
        expect.stringContaining('custom-images')
      );
    });
  });

  describe('출력 포맷', () => {
    it('should display revised prompt if available', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
        revisedPrompt: 'A modified prompt by DALL-E',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', {});

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(output).toContain('DALL-E 수정 프롬프트:');
      expect(output).toContain('A modified prompt by DALL-E');
    });

    it('should show upload warning when upload flag is used', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockResolvedValue(undefined);

      await imageGenerateCommand('test prompt', { upload: true });

      const output = consoleLogSpy.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(output).toContain('WordPress 업로드는 아직 구현되지 않았습니다');
    });
  });

  describe('에러 처리', () => {
    it('should handle missing API key', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockIsConfigured.mockReturnValue(false);

      await imageGenerateCommand('test prompt', {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorOutput = consoleErrorSpy.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(errorOutput).toContain('OPENAI_API_KEY');
      expect(errorOutput).toContain('환경 변수 설정이 필요합니다');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle image generation error', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockRejectedValue(new Error('DALL-E API error'));

      await imageGenerateCommand('test prompt', {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle download error', async () => {
      const { imageGenerateCommand } = await import('./image');

      mockGenerateImage.mockResolvedValue({
        url: 'https://example.com/image.png',
      });
      mockDownloadImage.mockRejectedValue(new Error('Download failed'));

      await imageGenerateCommand('test prompt', {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Download failed')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
