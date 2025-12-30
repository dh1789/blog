/**
 * @file 스크린샷 생성기 테스트
 * @description PRD 0016 - Phase 2: 스크린샷 생성 시스템
 *
 * 🔴 RED Phase: 터미널 및 브라우저 캡처 테스트
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  ScreenshotGenerator,
  createTerminalHtml,
  convertAnsiToHtml,
} from './screenshot-generator';
import type { TerminalCapture, BrowserCapture, ScreenshotOptions } from './types';

// 테스트용 임시 디렉토리
const TEST_OUTPUT_DIR = '/tmp/humanizer-test-screenshots';

describe('ScreenshotGenerator', () => {
  let generator: ScreenshotGenerator;

  beforeAll(async () => {
    // 테스트 출력 디렉토리 생성
    if (!fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
    }
    generator = new ScreenshotGenerator();
    await generator.initialize();
  });

  afterAll(async () => {
    await generator.close();
    // 테스트 후 정리
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  describe('ANSI to HTML Conversion', () => {
    it('should convert basic ANSI colors to HTML', () => {
      const ansiText = '\x1b[32mSuccess\x1b[0m';
      const html = convertAnsiToHtml(ansiText);

      expect(html).toContain('Success');
      expect(html).toContain('color:'); // CSS color style
    });

    it('should handle text without ANSI codes', () => {
      const plainText = 'Hello World';
      const html = convertAnsiToHtml(plainText);

      expect(html).toContain('Hello World');
    });

    it('should handle multiple ANSI codes', () => {
      const ansiText = '\x1b[31mError:\x1b[0m \x1b[33mWarning\x1b[0m';
      const html = convertAnsiToHtml(ansiText);

      expect(html).toContain('Error:');
      expect(html).toContain('Warning');
    });
  });

  describe('Terminal HTML Template', () => {
    it('should create dark theme HTML template', () => {
      const content = 'npm test\n✓ All tests passed';
      const html = createTerminalHtml(content, { theme: 'dark', fontSize: 14 });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('background-color');
      expect(html).toContain('npm test');
      expect(html).toContain('All tests passed');
    });

    it('should create light theme HTML template', () => {
      const content = 'Hello World';
      const html = createTerminalHtml(content, { theme: 'light', fontSize: 14 });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('background-color');
    });

    it('should apply custom font size', () => {
      const content = 'Test';
      const html = createTerminalHtml(content, { theme: 'dark', fontSize: 16 });

      expect(html).toContain('font-size: 16px');
    });
  });

  describe('Terminal Capture', () => {
    it('should capture terminal output with dark theme', async () => {
      const config: TerminalCapture = {
        command: 'echo "Hello World"',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'terminal-hello.png');
      const result = await generator.captureTerminal(config, outputPath);

      expect(result.success).toBe(true);
      expect(result.imagePath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // 파일이 유효한 PNG인지 확인
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle command with colored output', async () => {
      const config: TerminalCapture = {
        command: 'printf "\\033[32m✓ Test passed\\033[0m\\n"',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'terminal-colored.png');
      const result = await generator.captureTerminal(config, outputPath);

      expect(result.success).toBe(true);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should handle command error gracefully', async () => {
      const config: TerminalCapture = {
        command: 'nonexistent-command-xyz',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'terminal-error.png');
      const result = await generator.captureTerminal(config, outputPath);

      // 에러 시에도 stderr 캡처하여 스크린샷 생성
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle timeout', async () => {
      const config: TerminalCapture = {
        command: 'sleep 10',
        workingDir: '/tmp',
        timeout: 100, // 매우 짧은 타임아웃
        theme: 'dark',
        fontSize: 14,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'terminal-timeout.png');
      const result = await generator.captureTerminal(config, outputPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should limit output lines when maxLines is set', async () => {
      const config: TerminalCapture = {
        command: 'seq 1 100', // 1부터 100까지 출력
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
        maxLines: 10,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'terminal-maxlines.png');
      const result = await generator.captureTerminal(config, outputPath);

      expect(result.success).toBe(true);
    });
  });

  describe('Browser Capture', () => {
    it('should capture webpage screenshot', async () => {
      const config: BrowserCapture = {
        url: 'data:text/html,<html><body><h1>Hello World</h1></body></html>',
        viewport: { width: 800, height: 600 },
        fullPage: false,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-hello.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(true);
      expect(result.imagePath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should capture full page', async () => {
      const config: BrowserCapture = {
        url: 'data:text/html,<html><body style="height:2000px"><h1>Tall Page</h1></body></html>',
        viewport: { width: 800, height: 600 },
        fullPage: true,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-fullpage.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(true);
    });

    it('should capture specific selector', async () => {
      const config: BrowserCapture = {
        url: 'data:text/html,<html><body><div id="target" style="width:200px;height:100px;background:blue">Target</div></body></html>',
        selector: '#target',
        viewport: { width: 800, height: 600 },
        fullPage: false,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-selector.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(true);
    });

    it('should wait for element before capture', async () => {
      const config: BrowserCapture = {
        url: 'data:text/html,<html><body><div id="delayed">Content</div></body></html>',
        viewport: { width: 800, height: 600 },
        waitFor: '#delayed',
        fullPage: false,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-wait.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(true);
    });

    it('should handle delay before capture', async () => {
      const config: BrowserCapture = {
        url: 'data:text/html,<html><body><h1>Delayed</h1></body></html>',
        viewport: { width: 800, height: 600 },
        fullPage: false,
        delay: 100,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-delay.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(true);
    });

    it('should handle invalid URL gracefully', async () => {
      const config: BrowserCapture = {
        url: 'invalid-url',
        viewport: { width: 800, height: 600 },
        fullPage: false,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'browser-invalid.png');
      const result = await generator.captureBrowser(config, outputPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Image Optimization', () => {
    it('should resize image to maxWidth', async () => {
      const config: TerminalCapture = {
        command: 'echo "Wide content for resizing test"',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      const outputPath = path.join(TEST_OUTPUT_DIR, 'resized.png');
      const result = await generator.captureTerminal(config, outputPath, {
        maxWidth: 400,
        quality: 85,
      });

      expect(result.success).toBe(true);
    });

    it('should apply quality setting', async () => {
      const config: TerminalCapture = {
        command: 'echo "Quality test"',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      const highQualityPath = path.join(TEST_OUTPUT_DIR, 'high-quality.png');
      const lowQualityPath = path.join(TEST_OUTPUT_DIR, 'low-quality.png');

      await generator.captureTerminal(config, highQualityPath, {
        maxWidth: 800,
        quality: 100,
      });

      await generator.captureTerminal(config, lowQualityPath, {
        maxWidth: 800,
        quality: 50,
      });

      // 두 파일 모두 생성되어야 함
      expect(fs.existsSync(highQualityPath)).toBe(true);
      expect(fs.existsSync(lowQualityPath)).toBe(true);
    });
  });

  describe('Unified Screenshot API', () => {
    it('should capture terminal via unified API', async () => {
      const options: ScreenshotOptions = {
        type: 'terminal',
        config: {
          command: 'echo "Unified API Test"',
          workingDir: '/tmp',
          timeout: 5000,
          theme: 'dark',
          fontSize: 14,
        },
        outputPath: path.join(TEST_OUTPUT_DIR, 'unified-terminal.png'),
        maxWidth: 1200,
        quality: 85,
      };

      const result = await generator.capture(options);

      expect(result.success).toBe(true);
      expect(result.imagePath).toBe(options.outputPath);
    });

    it('should capture browser via unified API', async () => {
      const options: ScreenshotOptions = {
        type: 'browser',
        config: {
          url: 'data:text/html,<html><body><h1>Unified Browser</h1></body></html>',
          viewport: { width: 800, height: 600 },
          fullPage: false,
        },
        outputPath: path.join(TEST_OUTPUT_DIR, 'unified-browser.png'),
        maxWidth: 1200,
        quality: 85,
      };

      const result = await generator.capture(options);

      expect(result.success).toBe(true);
    });

    it('should generate alt text', async () => {
      const options: ScreenshotOptions = {
        type: 'terminal',
        config: {
          command: 'npm test',
          workingDir: '/tmp',
          timeout: 5000,
          theme: 'dark',
          fontSize: 14,
        },
        outputPath: path.join(TEST_OUTPUT_DIR, 'alt-text.png'),
        maxWidth: 1200,
        quality: 85,
      };

      const result = await generator.capture(options);

      expect(result.altText).toBeDefined();
      expect(result.altText?.toLowerCase()).toContain('terminal');
    });

    it('should measure duration', async () => {
      const options: ScreenshotOptions = {
        type: 'terminal',
        config: {
          command: 'echo "Duration Test"',
          workingDir: '/tmp',
          timeout: 5000,
          theme: 'dark',
          fontSize: 14,
        },
        outputPath: path.join(TEST_OUTPUT_DIR, 'duration.png'),
        maxWidth: 1200,
        quality: 85,
      };

      const result = await generator.capture(options);

      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
