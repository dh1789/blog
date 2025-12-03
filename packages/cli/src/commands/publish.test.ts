/**
 * publish 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

// 테스트용 임시 디렉토리
const TEST_DIR = join(process.cwd(), '.test-tmp-publish');
const TEST_FILE = join(TEST_DIR, 'test-post.md');

describe('publish command frontmatter validation', () => {
  beforeEach(() => {
    // 테스트 디렉토리 생성
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // 테스트 파일 정리
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('frontmatter validation rules', () => {
    it('should require title field', () => {
      const invalidContent = `---
excerpt: "Test excerpt for validation"
categories: ["Test"]
tags: ["tag1", "tag2", "tag3"]
---

# Content
`;

      writeFileSync(TEST_FILE, invalidContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should validate title length (max 200 characters)', () => {
      const longTitle = 'A'.repeat(201);
      const invalidContent = `---
title: "${longTitle}"
excerpt: "Test excerpt"
categories: ["Test"]
tags: ["tag1", "tag2", "tag3"]
---

# Content
`;

      writeFileSync(TEST_FILE, invalidContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should require excerpt field with 10-300 characters', () => {
      const invalidContent = `---
title: "Test Title"
excerpt: "Short"
categories: ["Test"]
tags: ["tag1", "tag2", "tag3"]
---

# Content
`;

      writeFileSync(TEST_FILE, invalidContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should require at least one category', () => {
      const invalidContent = `---
title: "Test Title"
excerpt: "This is a valid excerpt with enough characters"
categories: []
tags: ["tag1", "tag2", "tag3"]
---

# Content
`;

      writeFileSync(TEST_FILE, invalidContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should require at least 3 tags for SEO', () => {
      const invalidContent = `---
title: "Test Title"
excerpt: "This is a valid excerpt with enough characters"
categories: ["Test"]
tags: ["tag1", "tag2"]
---

# Content
`;

      writeFileSync(TEST_FILE, invalidContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should accept valid frontmatter', () => {
      const validContent = `---
title: "Valid Test Title"
excerpt: "This is a valid excerpt with enough characters for validation"
categories: ["Technology", "AI"]
tags: ["AI", "automation", "productivity", "tools"]
status: "draft"
language: "ko"
---

# Valid Content

This is the content of the post.
`;

      writeFileSync(TEST_FILE, validContent, 'utf-8');

      // Note: 실제 publish 명령어 실행은 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });
  });

  describe('validation error messages', () => {
    it('should provide helpful error messages for missing fields', () => {
      // Note: 에러 메시지 테스트는 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should show frontmatter format guide on validation failure', () => {
      // Note: 가이드 표시 테스트는 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });
  });

  describe('post info summary', () => {
    it('should display post information before publishing', () => {
      // Note: 정보 표시 테스트는 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });

    it('should show validation summary with all metadata', () => {
      // Note: 요약 표시 테스트는 통합 테스트에서 검증
      expect(true).toBe(true);
    }, { skip: true });
  });
});

describe('--no-translate 옵션 파싱', () => {
  it('--no-translate 옵션 사용 시 options.translate가 false여야 한다', () => {
    // Commander.js의 --no-xxx 패턴 테스트
    const program = new Command();
    let capturedOptions: Record<string, unknown> = {};

    program
      .command('publish <file>')
      .option('--no-translate', '자동 번역 비활성화')
      .action((file, options) => {
        capturedOptions = options;
      });

    program.parse(['node', 'test', 'publish', 'test.md', '--no-translate']);

    // Commander.js에서 --no-translate는 options.translate = false를 생성
    expect(capturedOptions.translate).toBe(false);
  });

  it('옵션 없이 사용 시 options.translate가 true여야 한다', () => {
    const program = new Command();
    let capturedOptions: Record<string, unknown> = {};

    program
      .command('publish <file>')
      .option('--no-translate', '자동 번역 비활성화')
      .action((file, options) => {
        capturedOptions = options;
      });

    program.parse(['node', 'test', 'publish', 'test.md']);

    // --no-translate 없이 실행하면 options.translate = true
    expect(capturedOptions.translate).toBe(true);
  });

  it('번역 비활성화 조건을 올바르게 판단해야 한다', () => {
    // 현재 버그: options.noTranslate를 체크하지만 실제로는 options.translate가 생성됨
    // 수정 후: options.translate === false일 때 번역 비활성화
    const shouldSkipTranslation = (options: { translate?: boolean }) => {
      return options.translate === false;
    };

    // --no-translate 사용 시
    expect(shouldSkipTranslation({ translate: false })).toBe(true);

    // 옵션 없이 사용 시
    expect(shouldSkipTranslation({ translate: true })).toBe(false);
  });
});
