/**
 * draft refine 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as coreModule from '@blog/core';
import { refineCommand } from './refine';

// 테스트용 임시 디렉토리
const TEST_DIR = join(process.cwd(), '.test-tmp');
const TEST_FILE = join(TEST_DIR, 'test-draft.md');

describe('draft refine command', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    // 테스트 디렉토리 생성
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    // 테스트 파일 정리
    if (existsSync(TEST_FILE)) {
      rmSync(TEST_FILE);
    }
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('file validation', () => {
    it('should exit when file does not exist', async () => {
      await expect(
        refineCommand('/non/existent/file.md', 'Test instruction', {})
      ).rejects.toThrow('process.exit(1)');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('파일을 찾을 수 없습니다')
      );
    });
  });

  describe('checkClaudeAvailability', () => {
    it('should exit when Claude is not available', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(false);

      await expect(
        refineCommand(TEST_FILE, 'Test instruction', {})
      ).rejects.toThrow('process.exit(1)');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Claude Code를 사용할 수 없습니다')
      );
    });
  });

  describe('successful draft refinement', () => {
    it('should refine draft with default options', async () => {
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      // 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should refine draft with custom timeout', async () => {
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      // 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });
  });

  describe('error handling', () => {
    it('should handle refineDraft errors', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'refineDraft').mockRejectedValue(new Error('Refinement failed'));

      await expect(
        refineCommand(TEST_FILE, 'Test instruction', {})
      ).rejects.toThrow('process.exit(1)');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('초안 수정 실패'),
        expect.stringContaining('Refinement failed')
      );
    });
  });

  describe('option parsing', () => {
    it('should parse timeout option as number', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      const refineDraftSpy = vi.spyOn(coreModule, 'refineDraft').mockResolvedValue('# Refined');

      await refineCommand(TEST_FILE, 'Test instruction', {
        timeout: '180000',
      });

      expect(refineDraftSpy).toHaveBeenCalledWith({
        file: TEST_FILE,
        instruction: 'Test instruction',
        timeout: 180000,
      });
    });

    it('should use default timeout when not provided', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      const refineDraftSpy = vi.spyOn(coreModule, 'refineDraft').mockResolvedValue('# Refined');

      await refineCommand(TEST_FILE, 'Test instruction', {});

      expect(refineDraftSpy).toHaveBeenCalledWith({
        file: TEST_FILE,
        instruction: 'Test instruction',
        timeout: undefined,
      });
    });
  });

  describe('output formatting', () => {
    it('should display success message with file path', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'refineDraft').mockResolvedValue('# Refined');

      await refineCommand(TEST_FILE, 'Test instruction', {});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('초안 수정 완료')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(TEST_FILE)
      );
    });

    it('should display next steps instructions', async () => {
      // 테스트 파일 생성
      writeFileSync(TEST_FILE, '# Test', 'utf-8');

      vi.spyOn(coreModule, 'checkClaudeAvailability').mockResolvedValue(true);
      vi.spyOn(coreModule, 'refineDraft').mockResolvedValue('# Refined');

      await refineCommand(TEST_FILE, 'Test instruction', {});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('다음 단계')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('추가 수정')
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
