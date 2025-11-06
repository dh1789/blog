/**
 * Epic 13.0 Task 2.9: SpikeValidator 유닛 테스트
 *
 * 테스트 카테고리:
 * 1. Happy Path: 정상 동작 검증
 * 2. Boundary Conditions: 경계 조건 처리
 * 3. Exception Cases: 예외 상황 처리
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpikeValidator } from '../spike-validator';
import fs from 'fs';
import path from 'path';
import type { SpikeValidationResult } from '@blog/shared';

// OpenAI 모킹
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      images: {
        generate: vi.fn(),
      },
    })),
  };
});

// fetch 모킹
global.fetch = vi.fn();

describe('SpikeValidator', () => {
  let validator: SpikeValidator;
  const testOutputDir = 'test-spike-results';
  const mockApiKey = 'sk-test-mock-key';

  beforeEach(() => {
    // 테스트용 출력 디렉토리 초기화
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }

    validator = new SpikeValidator(mockApiKey, testOutputDir);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 테스트 후 정리
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  describe('생성자 (Constructor)', () => {
    it('출력 디렉토리를 자동으로 생성해야 함', () => {
      expect(fs.existsSync(testOutputDir)).toBe(true);
    });

    it('커스텀 출력 디렉토리를 사용할 수 있어야 함', () => {
      const customDir = 'custom-test-dir';
      const customValidator = new SpikeValidator(mockApiKey, customDir);

      expect(fs.existsSync(customDir)).toBe(true);

      // 정리
      fs.rmSync(customDir, { recursive: true });
    });
  });

  describe('Happy Path - 정상 동작', () => {
    it('validateImageGeneration()이 모든 Task를 성공적으로 완료해야 함', async () => {
      // Mock OpenAI API 응답
      const mockImageUrl = 'https://example.com/generated-image.png';
      const mockRevisedPrompt = 'A beautiful technical illustration';
      const mockImageBuffer = Buffer.from('fake-image-data');

      // OpenAI API 모킹
      const mockGenerate = vi.fn().mockResolvedValue({
        data: [
          {
            url: mockImageUrl,
            revised_prompt: mockRevisedPrompt,
          },
        ],
      });

      // @ts-ignore - OpenAI 클라이언트 모킹
      validator['openai'].images.generate = mockGenerate;

      // fetch 모킹 (이미지 다운로드)
      (global.fetch as any).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockImageBuffer.buffer),
      });

      const result = await validator.validateImageGeneration();

      // 검증
      expect(result).toBeDefined();
      expect(result.dalleModel).toBe('dall-e-3');
      expect(result.task21.success).toBe(true);
      expect(result.task22.success).toBe(true);
      expect(result.task23.success).toBe(true);
      expect(result.task24.success).toBe(true);
      expect(result.summary.successRate).toBeGreaterThan(0);
      expect(result.summary.totalCost).toBeGreaterThan(0);
      expect(result.summary.averageGenerationTime).toBeGreaterThan(0);
    });

    it('saveResults()가 JSON 파일을 정상적으로 저장해야 함', () => {
      const mockResult: SpikeValidationResult = {
        timestamp: '2025-11-06T00:00:00.000Z',
        dalleModel: 'dall-e-3',
        openaiApiKey: '***',
        task21: {
          success: true,
          imageUrl: 'https://example.com/image.png',
          revisedPrompt: 'Test prompt',
          generationTime: 15000,
          fileSize: 102400,
        },
        task22: {
          success: true,
          testCases: [],
          totalTests: 4,
          passedTests: 4,
          failedTests: 0,
        },
        task23: {
          success: true,
          iterations: 3,
          generationTimes: [15000, 16000, 14000],
          averageTime: 15000,
          minTime: 14000,
          maxTime: 16000,
          totalCost: 0.12,
          costPerImage: 0.04,
          validation: {
            avgTimeUnder30s: true,
            avgCostUnder010: false,
          },
        },
        task24: {
          success: true,
          testCases: [],
          totalTests: 2,
          passedTests: 2,
          failedTests: 0,
        },
        summary: {
          totalTests: 10,
          passedTests: 10,
          failedTests: 0,
          successRate: 100,
          totalCost: 0.52,
          averageGenerationTime: 15000,
        },
      };

      const outputPath = path.join(testOutputDir, 'test-result.json');
      validator.saveResults(mockResult, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const savedData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(savedData.dalleModel).toBe('dall-e-3');
      expect(savedData.summary.totalTests).toBe(10);
    });
  });

  describe('Boundary Conditions - 경계 조건', () => {
    it('OpenAI API가 빈 응답을 반환할 때 에러를 처리해야 함', async () => {
      // 빈 응답 모킹
      const mockGenerate = vi.fn().mockResolvedValue({
        data: [],
      });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      const result = await validator.validateImageGeneration();

      expect(result.task21.success).toBe(false);
      expect(result.task21.error).toContain('이미지 URL을 받지 못했습니다');
    });

    it('이미지 다운로드 실패 시 에러를 처리해야 함', async () => {
      const mockGenerate = vi.fn().mockResolvedValue({
        data: [{ url: 'https://example.com/image.png' }],
      });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      // fetch 실패 모킹
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await validator.validateImageGeneration();

      expect(result.task21.success).toBe(false);
      expect(result.task21.error).toContain('Network error');
    });

    it('생성 시간이 0ms일 때 평균 계산에서 제외해야 함', async () => {
      const mockGenerate = vi
        .fn()
        .mockResolvedValueOnce({
          data: [{ url: 'https://example.com/image1.png' }],
        })
        .mockRejectedValueOnce(new Error('Generation failed'))
        .mockResolvedValueOnce({
          data: [{ url: 'https://example.com/image3.png' }],
        });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-data').buffer),
      });

      const result = await validator.validateImageGeneration();

      // 0ms 생성 시간은 평균에서 제외되어야 함
      expect(result.summary.averageGenerationTime).toBeGreaterThan(0);
    });
  });

  describe('Exception Cases - 예외 상황', () => {
    it('OpenAI API 에러 시 적절한 에러 메시지를 반환해야 함', async () => {
      const mockGenerate = vi.fn().mockRejectedValue(new Error('Invalid API key'));

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      const result = await validator.validateImageGeneration();

      expect(result.task21.success).toBe(false);
      expect(result.task21.error).toContain('Invalid API key');
      expect(result.summary.failedTests).toBeGreaterThan(0);
      expect(result.summary.successRate).toBeLessThan(100);
    });

    it('Rate Limit 에러 시 적절히 처리해야 함', async () => {
      const mockGenerate = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'));

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      const result = await validator.validateImageGeneration();

      expect(result.summary.failedTests).toBeGreaterThan(0);
      expect(result.task21.error).toContain('Rate limit exceeded');
    });

    it('파일 시스템 에러 시 saveResults가 실패해야 함', () => {
      const mockResult: SpikeValidationResult = {
        timestamp: '2025-11-06T00:00:00.000Z',
        dalleModel: 'dall-e-3',
        openaiApiKey: '***',
        task21: {
          success: true,
          imageUrl: 'https://example.com/image.png',
          generationTime: 15000,
          fileSize: 102400,
        },
        task22: {
          success: true,
          testCases: [],
          totalTests: 4,
          passedTests: 4,
          failedTests: 0,
        },
        task23: {
          success: true,
          iterations: 3,
          generationTimes: [15000, 16000, 14000],
          averageTime: 15000,
          minTime: 14000,
          maxTime: 16000,
          totalCost: 0.12,
          costPerImage: 0.04,
          validation: {
            avgTimeUnder30s: true,
            avgCostUnder010: false,
          },
        },
        task24: {
          success: true,
          testCases: [],
          totalTests: 2,
          passedTests: 2,
          failedTests: 0,
        },
        summary: {
          totalTests: 10,
          passedTests: 10,
          failedTests: 0,
          successRate: 100,
          totalCost: 0.52,
          averageGenerationTime: 15000,
        },
      };

      // 쓰기 권한 없는 경로
      const invalidPath = '/root/invalid-path/test.json';

      expect(() => {
        validator.saveResults(mockResult, invalidPath);
      }).toThrow();
    });

    it('모든 Task가 실패해도 summary를 생성해야 함', async () => {
      const mockGenerate = vi.fn().mockRejectedValue(new Error('All tasks failed'));

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      const result = await validator.validateImageGeneration();

      expect(result.summary).toBeDefined();
      expect(result.summary.totalTests).toBeGreaterThan(0);
      expect(result.summary.passedTests).toBe(0);
      expect(result.summary.failedTests).toBe(result.summary.totalTests);
      expect(result.summary.successRate).toBe(0);
    });
  });

  describe('통계 계산 (Summary Calculation)', () => {
    it('총 비용이 올바르게 계산되어야 함', async () => {
      const mockImageUrl = 'https://example.com/image.png';
      const mockBuffer = Buffer.from('fake-data');

      const mockGenerate = vi.fn().mockResolvedValue({
        data: [{ url: mockImageUrl }],
      });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer.buffer),
      });

      const result = await validator.validateImageGeneration();

      // 예상 비용 계산:
      // Task 2.1: 1개 standard (1024x1024) = $0.04
      // Task 2.2: 4개 (1 standard, 3 hd) = $0.04 + $0.24 = $0.28
      // Task 2.3: 3개 standard = $0.12
      // Task 2.4: 2개 hd wide (1792x1024) = $0.16
      // 총합: $0.60

      expect(result.summary.totalCost).toBeCloseTo(0.6, 2);
    });

    it('성공률이 올바르게 계산되어야 함', async () => {
      const mockImageUrl = 'https://example.com/image.png';
      const mockBuffer = Buffer.from('fake-data');

      // 50% 성공 시나리오: Task 2.1과 Task 2.3는 성공, Task 2.2와 Task 2.4는 실패
      let callCount = 0;
      const mockGenerate = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 1 || (callCount >= 6 && callCount <= 8)) {
          // Task 2.1 (1개) + Task 2.3 (3개) = 4개 성공
          return Promise.resolve({ data: [{ url: mockImageUrl }] });
        } else {
          // Task 2.2 (4개) + Task 2.4 (2개) = 6개 실패
          return Promise.reject(new Error('Generation failed'));
        }
      });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer.buffer),
      });

      const result = await validator.validateImageGeneration();

      // 총 10개 테스트 중 4개 성공 = 40% 성공률
      expect(result.summary.successRate).toBeCloseTo(40, 0);
    });

    it('평균 생성 시간이 올바르게 계산되어야 함', async () => {
      const mockImageUrl = 'https://example.com/image.png';
      const mockBuffer = Buffer.from('fake-data');

      const mockGenerate = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          // 각 호출마다 약간의 지연 (실제 API 호출 시뮬레이션)
          setTimeout(() => {
            resolve({ data: [{ url: mockImageUrl }] });
          }, 10);
        });
      });

      // @ts-ignore
      validator['openai'].images.generate = mockGenerate;

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer.buffer),
      });

      const result = await validator.validateImageGeneration();

      expect(result.summary.averageGenerationTime).toBeGreaterThan(0);
      expect(result.summary.averageGenerationTime).toBeLessThan(1000); // 1초 이내
    });
  });
});
