/**
 * @file 스크린샷 생성기
 * @description PRD 0016 - Phase 2: 스크린샷 생성 시스템
 *
 * 터미널 출력 및 브라우저 페이지를 스크린샷으로 캡처합니다.
 *
 * 캡처 플로우:
 * - 터미널: 명령어 실행 → ANSI→HTML 변환 → HTML 템플릿 → Playwright 스크린샷
 * - 브라우저: URL 로딩 → Playwright 스크린샷
 */

import { chromium, Browser, Page } from 'playwright';
import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import AnsiToHtml from 'ansi-to-html';
import type {
  TerminalCapture,
  BrowserCapture,
  APICapture,
  ScreenshotOptions,
  ScreenshotResult,
} from './types';

/**
 * ANSI 컬러 코드를 HTML로 변환
 */
export function convertAnsiToHtml(ansiText: string): string {
  const converter = new AnsiToHtml({
    fg: '#d4d4d4', // 기본 전경색 (밝은 회색)
    bg: '#1e1e1e', // 기본 배경색 (다크 테마)
    newline: true,
    escapeXML: true,
    colors: {
      // VS Code 다크 테마 기반 색상
      0: '#1e1e1e', // Black
      1: '#f44747', // Red
      2: '#6a9955', // Green
      3: '#dcdcaa', // Yellow
      4: '#569cd6', // Blue
      5: '#c586c0', // Magenta
      6: '#4ec9b0', // Cyan
      7: '#d4d4d4', // White
    },
  });

  return converter.toHtml(ansiText);
}

/**
 * 터미널 출력을 위한 HTML 템플릿 생성
 */
export function createTerminalHtml(
  content: string,
  options: { theme: 'dark' | 'light'; fontSize: number }
): string {
  const { theme, fontSize } = options;

  const styles =
    theme === 'dark'
      ? {
          background: '#1e1e1e',
          color: '#d4d4d4',
          scrollbar: '#424242',
        }
      : {
          background: '#ffffff',
          color: '#333333',
          scrollbar: '#cccccc',
        };

  // ANSI 코드가 있으면 HTML로 변환
  const htmlContent = convertAnsiToHtml(content);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background-color: ${styles.background};
      color: ${styles.color};
      font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: ${fontSize}px;
      line-height: 1.5;
      padding: 16px;
      min-width: fit-content;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }
    /* 스크롤바 스타일 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: ${styles.background};
    }
    ::-webkit-scrollbar-thumb {
      background: ${styles.scrollbar};
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <pre>${htmlContent}</pre>
</body>
</html>`;
}

/**
 * 이미지 최적화 옵션
 */
interface ImageOptimizationOptions {
  maxWidth: number;
  quality: number;
}

/**
 * 스크린샷 생성기 클래스
 */
export class ScreenshotGenerator {
  private browser: Browser | null = null;

  /**
   * Playwright 브라우저 초기화
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
  }

  /**
   * 브라우저 종료
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 터미널 명령어 실행 및 출력 캡처
   */
  private executeCommand(
    command: string,
    workingDir: string,
    timeout: number,
    maxLines?: number
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const childProcess = exec(
        command,
        {
          cwd: workingDir,
          timeout,
          env: {
            ...process.env,
            FORCE_COLOR: '1', // ANSI 컬러 강제 활성화
            TERM: 'xterm-256color',
          },
        },
        (error: ExecException | null, stdout: string, stderr: string) => {
          // 타임아웃 에러
          if (error && error.killed) {
            reject(new Error('timeout'));
            return;
          }

          // 출력 라인 수 제한
          let output = stdout + (stderr ? `\n${stderr}` : '');
          if (maxLines) {
            const lines = output.split('\n');
            if (lines.length > maxLines) {
              output = lines.slice(0, maxLines).join('\n') + '\n... (truncated)';
            }
          }

          resolve({ stdout: output, stderr: '' });
        }
      );

      // 타임아웃 시 프로세스 종료
      setTimeout(() => {
        childProcess.kill('SIGTERM');
      }, timeout);
    });
  }

  /**
   * HTML 콘텐츠를 스크린샷으로 캡처
   */
  private async captureHtml(
    html: string,
    outputPath: string,
    optimization?: ImageOptimizationOptions
  ): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page: Page = await this.browser.newPage();

    try {
      // HTML 콘텐츠 로드
      await page.setContent(html, { waitUntil: 'networkidle' });

      // 콘텐츠 크기에 맞게 뷰포트 조정
      const contentBox = await page.evaluate((): { width: number; height: number } => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (globalThis as any).document.body;
        return {
          width: Math.max(body.scrollWidth, 800),
          height: Math.max(body.scrollHeight, 100),
        };
      });

      await page.setViewportSize({
        width: Math.min(contentBox.width + 32, 1920),
        height: Math.min(contentBox.height + 32, 10000),
      });

      // 스크린샷 캡처
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
      });

      // 이미지 최적화 및 저장
      await this.optimizeAndSave(screenshotBuffer, outputPath, optimization);
    } finally {
      await page.close();
    }
  }

  /**
   * 이미지 최적화 및 저장
   */
  private async optimizeAndSave(
    buffer: Buffer,
    outputPath: string,
    optimization?: ImageOptimizationOptions
  ): Promise<void> {
    // 출력 디렉토리 생성
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let image = sharp(buffer);

    if (optimization) {
      const metadata = await image.metadata();
      const currentWidth = metadata.width || 1200;

      // 최대 너비 제한
      if (currentWidth > optimization.maxWidth) {
        image = image.resize(optimization.maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // PNG 품질 설정 (compressionLevel로 제어)
      const compressionLevel = Math.round((100 - optimization.quality) / 10);
      image = image.png({ compressionLevel: Math.min(9, compressionLevel) });
    }

    await image.toFile(outputPath);
  }

  /**
   * 터미널 출력 캡처
   */
  async captureTerminal(
    config: TerminalCapture,
    outputPath: string,
    optimization?: ImageOptimizationOptions
  ): Promise<ScreenshotResult> {
    const startTime = Date.now();

    try {
      // 명령어 실행
      const { stdout } = await this.executeCommand(
        config.command,
        config.workingDir,
        config.timeout,
        config.maxLines
      );

      // HTML 템플릿 생성
      const html = createTerminalHtml(stdout, {
        theme: config.theme,
        fontSize: config.fontSize,
      });

      // 스크린샷 캡처
      await this.captureHtml(html, outputPath, optimization);

      return {
        success: true,
        imagePath: outputPath,
        altText: `Terminal output of command: ${config.command}`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage === 'timeout') {
        return {
          success: false,
          error: 'Command execution timeout',
          duration: Date.now() - startTime,
        };
      }

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 브라우저 페이지 캡처
   */
  async captureBrowser(
    config: BrowserCapture,
    outputPath: string,
    optimization?: ImageOptimizationOptions
  ): Promise<ScreenshotResult> {
    const startTime = Date.now();

    if (!this.browser) {
      return {
        success: false,
        error: 'Browser not initialized. Call initialize() first.',
        duration: Date.now() - startTime,
      };
    }

    const page: Page = await this.browser.newPage();

    try {
      // 뷰포트 설정
      await page.setViewportSize(config.viewport);

      // 페이지 로드
      try {
        await page.goto(config.url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });
      } catch (error) {
        await page.close();
        return {
          success: false,
          error: `Failed to load URL: ${config.url}`,
          duration: Date.now() - startTime,
        };
      }

      // 대기 조건
      if (config.waitFor) {
        await page.waitForSelector(config.waitFor, { timeout: 10000 });
      }

      // 추가 대기
      if (config.delay) {
        await page.waitForTimeout(config.delay);
      }

      // 스크린샷 캡처
      let screenshotBuffer: Buffer;

      if (config.selector) {
        const element = await page.$(config.selector);
        if (!element) {
          await page.close();
          return {
            success: false,
            error: `Selector not found: ${config.selector}`,
            duration: Date.now() - startTime,
          };
        }
        screenshotBuffer = await element.screenshot({ type: 'png' });
      } else {
        screenshotBuffer = await page.screenshot({
          type: 'png',
          fullPage: config.fullPage,
        });
      }

      // 이미지 최적화 및 저장
      await this.optimizeAndSave(screenshotBuffer, outputPath, optimization);

      return {
        success: true,
        imagePath: outputPath,
        altText: `Browser screenshot of ${config.url}`,
        duration: Date.now() - startTime,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * API 응답 캡처
   */
  async captureAPI(
    config: APICapture,
    outputPath: string,
    optimization?: ImageOptimizationOptions
  ): Promise<ScreenshotResult> {
    const startTime = Date.now();

    try {
      // API 호출
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      const data = await response.text();

      // 포맷팅
      let formattedContent: string;
      switch (config.formatAs) {
        case 'json':
          try {
            formattedContent = JSON.stringify(JSON.parse(data), null, 2);
          } catch {
            formattedContent = data;
          }
          break;
        case 'table':
          formattedContent = data; // 향후 테이블 포맷 구현
          break;
        case 'raw':
        default:
          formattedContent = data;
      }

      // HTML 템플릿 생성 (터미널 스타일)
      const html = createTerminalHtml(
        `$ ${config.method} ${config.url}\n\n${formattedContent}`,
        { theme: 'dark', fontSize: 14 }
      );

      // 스크린샷 캡처
      await this.captureHtml(html, outputPath, optimization);

      return {
        success: true,
        imagePath: outputPath,
        altText: `API response from ${config.method} ${config.url}`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 통합 캡처 API
   */
  async capture(options: ScreenshotOptions): Promise<ScreenshotResult> {
    const optimization: ImageOptimizationOptions = {
      maxWidth: options.maxWidth,
      quality: options.quality,
    };

    switch (options.type) {
      case 'terminal':
        return this.captureTerminal(
          options.config as TerminalCapture,
          options.outputPath,
          optimization
        );
      case 'browser':
        return this.captureBrowser(
          options.config as BrowserCapture,
          options.outputPath,
          optimization
        );
      case 'api':
        return this.captureAPI(
          options.config as APICapture,
          options.outputPath,
          optimization
        );
      default:
        return {
          success: false,
          error: `Unknown capture type: ${options.type}`,
        };
    }
  }
}
