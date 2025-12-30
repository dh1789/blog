/**
 * @file Humanizer 모듈 타입 테스트
 * @description PRD 0016 - Phase 1: 기반 구조
 *
 * 🔴 RED Phase: 인터페이스 및 타입 검증 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  ExperienceQuestion,
  ExperienceCategory,
  TerminalCapture,
  BrowserCapture,
  APICapture,
  ScreenshotOptions,
  CaptureType,
  TranslationQualityCheck,
  QualityChecklist,
  HumanizerConfig,
} from './types';

describe('Humanizer Types', () => {
  describe('ExperienceQuestion', () => {
    it('should have required fields', () => {
      const question: ExperienceQuestion = {
        id: 'q-001',
        question: '이 기술을 배우게 된 계기가 무엇인가요?',
        context: '독자가 작성자의 동기를 이해할 수 있도록',
        exampleAnswer: '최근 프로젝트에서 API 호출 최적화가 필요했습니다.',
        category: 'motivation',
      };

      expect(question.id).toBeDefined();
      expect(question.question).toBeDefined();
      expect(question.context).toBeDefined();
      expect(question.exampleAnswer).toBeDefined();
      expect(question.category).toBeDefined();
    });

    it('should support all category types', () => {
      const categories: ExperienceCategory[] = [
        'motivation',
        'challenge',
        'application',
        'insight',
      ];

      categories.forEach((category) => {
        const question: ExperienceQuestion = {
          id: `q-${category}`,
          question: 'Test question',
          context: 'Test context',
          exampleAnswer: 'Test answer',
          category,
        };
        expect(question.category).toBe(category);
      });
    });
  });

  describe('TerminalCapture', () => {
    it('should have required fields', () => {
      const config: TerminalCapture = {
        command: 'echo "Hello World"',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'dark',
        fontSize: 14,
      };

      expect(config.command).toBeDefined();
      expect(config.workingDir).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.theme).toBe('dark');
      expect(config.fontSize).toBe(14);
    });

    it('should support optional maxLines', () => {
      const config: TerminalCapture = {
        command: 'ls -la',
        workingDir: '/tmp',
        timeout: 5000,
        theme: 'light',
        fontSize: 12,
        maxLines: 50,
      };

      expect(config.maxLines).toBe(50);
    });

    it('should support dark and light themes', () => {
      const themes: Array<'dark' | 'light'> = ['dark', 'light'];

      themes.forEach((theme) => {
        const config: TerminalCapture = {
          command: 'test',
          workingDir: '/tmp',
          timeout: 1000,
          theme,
          fontSize: 14,
        };
        expect(config.theme).toBe(theme);
      });
    });
  });

  describe('BrowserCapture', () => {
    it('should have required fields', () => {
      const config: BrowserCapture = {
        url: 'http://localhost:3001',
        viewport: { width: 1280, height: 720 },
        fullPage: false,
      };

      expect(config.url).toBeDefined();
      expect(config.viewport.width).toBe(1280);
      expect(config.viewport.height).toBe(720);
      expect(config.fullPage).toBe(false);
    });

    it('should support optional fields', () => {
      const config: BrowserCapture = {
        url: 'http://localhost:3001/api/test',
        selector: '.main-content',
        viewport: { width: 1920, height: 1080 },
        waitFor: '#loaded',
        fullPage: true,
        delay: 1000,
      };

      expect(config.selector).toBe('.main-content');
      expect(config.waitFor).toBe('#loaded');
      expect(config.delay).toBe(1000);
    });
  });

  describe('APICapture', () => {
    it('should have required fields', () => {
      const config: APICapture = {
        method: 'GET',
        url: 'http://localhost:3001/api/users',
        formatAs: 'json',
      };

      expect(config.method).toBe('GET');
      expect(config.url).toBeDefined();
      expect(config.formatAs).toBe('json');
    });

    it('should support all HTTP methods', () => {
      const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE'> = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
      ];

      methods.forEach((method) => {
        const config: APICapture = {
          method,
          url: 'http://localhost:3001/api/test',
          formatAs: 'json',
        };
        expect(config.method).toBe(method);
      });
    });

    it('should support all format types', () => {
      const formats: Array<'json' | 'table' | 'raw'> = ['json', 'table', 'raw'];

      formats.forEach((formatAs) => {
        const config: APICapture = {
          method: 'GET',
          url: 'http://localhost:3001/api/test',
          formatAs,
        };
        expect(config.formatAs).toBe(formatAs);
      });
    });

    it('should support optional headers and body', () => {
      const config: APICapture = {
        method: 'POST',
        url: 'http://localhost:3001/api/users',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: { name: 'Test User' },
        formatAs: 'json',
      };

      expect(config.headers).toBeDefined();
      expect(config.headers?.['Content-Type']).toBe('application/json');
      expect(config.body).toEqual({ name: 'Test User' });
    });
  });

  describe('ScreenshotOptions', () => {
    it('should support terminal capture type', () => {
      const options: ScreenshotOptions = {
        type: 'terminal',
        config: {
          command: 'npm test',
          workingDir: '/project',
          timeout: 30000,
          theme: 'dark',
          fontSize: 14,
        },
        outputPath: './screenshots/terminal-output.png',
        maxWidth: 1200,
        quality: 85,
      };

      expect(options.type).toBe('terminal');
      expect(options.maxWidth).toBe(1200);
      expect(options.quality).toBe(85);
    });

    it('should support browser capture type', () => {
      const options: ScreenshotOptions = {
        type: 'browser',
        config: {
          url: 'http://localhost:3001',
          viewport: { width: 1280, height: 720 },
          fullPage: true,
        },
        outputPath: './screenshots/browser-output.png',
        maxWidth: 1200,
        quality: 90,
      };

      expect(options.type).toBe('browser');
    });

    it('should support api capture type', () => {
      const options: ScreenshotOptions = {
        type: 'api',
        config: {
          method: 'GET',
          url: 'http://localhost:3001/api/status',
          formatAs: 'json',
        },
        outputPath: './screenshots/api-output.png',
        maxWidth: 800,
        quality: 85,
      };

      expect(options.type).toBe('api');
    });
  });

  describe('TranslationQualityCheck', () => {
    it('should have quality metrics', () => {
      const check: TranslationQualityCheck = {
        directTranslationPatterns: ['it seems that', 'in Korea'],
        passiveVoiceRatio: 0.15,
        averageSentenceLength: 18,
        koreanStructurePatterns: ['~의 경우에', '~를 통해'],
      };

      expect(check.directTranslationPatterns).toHaveLength(2);
      expect(check.passiveVoiceRatio).toBeLessThan(0.2);
      expect(check.averageSentenceLength).toBeGreaterThan(15);
      expect(check.averageSentenceLength).toBeLessThan(25);
    });

    it('should detect quality issues', () => {
      const badCheck: TranslationQualityCheck = {
        directTranslationPatterns: [
          'it seems that',
          'in Korea',
          'from the viewpoint of',
        ],
        passiveVoiceRatio: 0.35, // Too high
        averageSentenceLength: 35, // Too long
        koreanStructurePatterns: ['~의 경우', '~에 대해'],
      };

      expect(badCheck.passiveVoiceRatio).toBeGreaterThan(0.2);
      expect(badCheck.averageSentenceLength).toBeGreaterThan(25);
    });
  });

  describe('QualityChecklist', () => {
    it('should have all checklist items', () => {
      const checklist: QualityChecklist = {
        // 경험담
        hasPersonalExperience: true,
        experienceNaturallyIntegrated: true,
        // 이미지
        imageCount: 3,
        imagesHaveAltText: true,
        imagesRelevant: true,
        // 영문 (영문 포스트인 경우)
        noDirectTranslation: true,
        nativeStyleScore: 85,
        // 전반적 품질
        seoScore: 75,
        readabilityScore: 80,
        overallReady: true,
      };

      expect(checklist.hasPersonalExperience).toBe(true);
      expect(checklist.imageCount).toBeGreaterThanOrEqual(2);
      expect(checklist.nativeStyleScore).toBeGreaterThanOrEqual(80);
      expect(checklist.overallReady).toBe(true);
    });

    it('should indicate not ready when issues exist', () => {
      const checklist: QualityChecklist = {
        hasPersonalExperience: false, // Missing experience
        experienceNaturallyIntegrated: false,
        imageCount: 1, // Not enough images
        imagesHaveAltText: true,
        imagesRelevant: true,
        noDirectTranslation: true,
        nativeStyleScore: 70, // Below threshold
        seoScore: 65,
        readabilityScore: 75,
        overallReady: false, // Not ready
      };

      expect(checklist.hasPersonalExperience).toBe(false);
      expect(checklist.imageCount).toBeLessThan(2);
      expect(checklist.overallReady).toBe(false);
    });
  });

  describe('HumanizerConfig', () => {
    it('should have all configuration options', () => {
      const config: HumanizerConfig = {
        enableInterview: true,
        enableScreenshots: true,
        enableNativeTranslation: true,
        skipReview: false,
        authorProfile: {
          background: [
            '현직 백엔드 개발자 (5년차)',
            '사이드 프로젝트로 AI 도구 개발 중',
          ],
          tone: '친근하면서도 전문적인',
          perspective: '실무 경험 기반의 실용적 관점',
        },
        screenshotDefaults: {
          maxWidth: 1200,
          quality: 85,
          theme: 'dark',
        },
      };

      expect(config.enableInterview).toBe(true);
      expect(config.enableScreenshots).toBe(true);
      expect(config.enableNativeTranslation).toBe(true);
      expect(config.skipReview).toBe(false);
      expect(config.authorProfile).toBeDefined();
      expect(config.authorProfile.background).toHaveLength(2);
      expect(config.screenshotDefaults.theme).toBe('dark');
    });

    it('should support partial configuration', () => {
      const minimalConfig: HumanizerConfig = {
        enableInterview: false,
        enableScreenshots: true,
        enableNativeTranslation: false,
        skipReview: false,
        authorProfile: {
          background: ['개발자'],
          tone: '전문적인',
          perspective: '기술적 관점',
        },
        screenshotDefaults: {
          maxWidth: 800,
          quality: 80,
          theme: 'light',
        },
      };

      expect(minimalConfig.enableInterview).toBe(false);
      expect(minimalConfig.screenshotDefaults.maxWidth).toBe(800);
    });
  });

  describe('CaptureType', () => {
    it('should support all capture types', () => {
      const types: CaptureType[] = ['terminal', 'browser', 'api'];

      types.forEach((type) => {
        expect(['terminal', 'browser', 'api']).toContain(type);
      });
    });
  });
});
