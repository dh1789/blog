/**
 * draft create 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as coreModule from '@blog/core';
import { createCommand } from './create';

describe('draft create command', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkClaudeAvailability', () => {
    it('should exit when Claude is not available', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(false);

      await expect(
        createCommand('Test Topic', 'test, keywords', {})
      ).rejects.toThrow('process.exit(1)');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Code를 사용할 수 없습니다')
      );
    });
  });

  describe('successful draft creation', () => {
    it('should create draft with default options', async () => {
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      // 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should create draft with custom options', async () => {
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      // 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });
  });

  describe('error handling', () => {
    it('should handle createDraft errors', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'createDraft').mockRejectedValue(new Error('Creation failed'));

      await expect(
        createCommand('Test Topic', 'test, keywords', {})
      ).rejects.toThrow('process.exit(1)');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('초안 생성 실패'),
        expect.stringContaining('Creation failed')
      );
    });
  });

  describe('option parsing', () => {
    it('should parse words option as number', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      const createDraftSpy = vi.spyOn(coreModule, 'createDraft').mockResolvedValue('/path/to/draft.md');

      await createCommand('Test Topic', 'test, keywords', {
        words: '3000',
        template: 'custom-template',
        language: 'en',
        style: 'formal',
      });

      expect(createDraftSpy).toHaveBeenCalledWith({
        topic: 'Test Topic',
        keywords: 'test, keywords',
        words: 3000,
        template: 'custom-template',
        language: 'en',
        style: 'formal',
        guidelines: 'prompts/blog-post-guidelines.md',
      });
    });

    it('should use default values when options not provided', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      const createDraftSpy = vi.spyOn(coreModule, 'createDraft').mockResolvedValue('/path/to/draft.md');

      await createCommand('Test Topic', 'test, keywords', {});

      expect(createDraftSpy).toHaveBeenCalledWith({
        topic: 'Test Topic',
        keywords: 'test, keywords',
        words: undefined,
        template: undefined,
        language: undefined,
        style: undefined,
        guidelines: 'prompts/blog-post-guidelines.md',
      });
    });
  });

  describe('output formatting', () => {
    it('should display success message with file path', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'createDraft').mockResolvedValue('/path/to/draft.md');

      await createCommand('Test Topic', 'test, keywords', {});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('초안 생성 완료')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('/path/to/draft.md')
      );
    });

    it('should display next steps instructions', async () => {
      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'createDraft').mockResolvedValue('/path/to/draft.md');

      await createCommand('Test Topic', 'test, keywords', {});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('다음 단계')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('blog draft refine')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('blog preview')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('blog publish')
      );
    });
  });
});
