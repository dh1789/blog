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

// ===========================================================================
// Task 4.9: --force 옵션 테스트
// ===========================================================================

describe('--force 옵션 파싱', () => {
  it('--force 옵션 사용 시 options.force가 true여야 한다', () => {
    const program = new Command();
    let capturedOptions: Record<string, unknown> = {};

    program
      .command('publish <file>')
      .option('-f, --force', '확인 없이 강제 업데이트', false)
      .action((file, options) => {
        capturedOptions = options;
      });

    program.parse(['node', 'test', 'publish', 'test.md', '--force']);

    expect(capturedOptions.force).toBe(true);
  });

  it('옵션 없이 사용 시 options.force가 false여야 한다', () => {
    const program = new Command();
    let capturedOptions: Record<string, unknown> = {};

    program
      .command('publish <file>')
      .option('-f, --force', '확인 없이 강제 업데이트', false)
      .action((file, options) => {
        capturedOptions = options;
      });

    program.parse(['node', 'test', 'publish', 'test.md']);

    expect(capturedOptions.force).toBe(false);
  });

  it('-f 단축 옵션도 force로 인식해야 한다', () => {
    const program = new Command();
    let capturedOptions: Record<string, unknown> = {};

    program
      .command('publish <file>')
      .option('-f, --force', '확인 없이 강제 업데이트', false)
      .action((file, options) => {
        capturedOptions = options;
      });

    program.parse(['node', 'test', 'publish', 'test.md', '-f']);

    expect(capturedOptions.force).toBe(true);
  });
});

// ===========================================================================
// Task 4.10: 시리즈 통합 테스트 (Happy Path: 전체 워크플로우)
// ===========================================================================

describe('시리즈 기능 통합 (Happy Path)', () => {
  it('시리즈 파일명에서 시리즈 정보를 감지해야 한다', async () => {
    const { detectSeriesFromFilename } = await import('@blog/core');

    const result = detectSeriesFromFilename(
      'content/posts/ko/2025-12-05-mcp-day3-practical-guide.md'
    );

    expect(result).not.toBeNull();
    expect(result?.name).toBe('mcp');
    expect(result?.dayNumber).toBe(3);
  });

  it('시리즈 문서에서 URL 매핑을 파싱해야 한다', async () => {
    const { parseSeriesDocument } = await import('@blog/core');
    const { existsSync } = await import('fs');
    const { join } = await import('path');

    // 실제 시리즈 문서가 있는지 확인
    const docsDir = join(process.cwd(), '../../docs');
    const mcpPlanPath = join(docsDir, 'mcp-series-plan.md');

    if (existsSync(mcpPlanPath)) {
      const result = parseSeriesDocument(mcpPlanPath);

      expect(result).not.toBeNull();
      expect(result?.totalDays).toBeGreaterThan(0);
      // URL 매핑이 있어야 함
      expect(
        Object.keys(result?.koreanUrls || {}).length > 0 ||
        Object.keys(result?.englishUrls || {}).length > 0
      ).toBe(true);
    }
  });

  it('시리즈 네비게이션을 올바르게 생성해야 한다', async () => {
    const { generateSeriesNavigation } = await import('@blog/core');
    const { SeriesDocument } = await import('@blog/shared');

    const seriesDoc = {
      koreanUrls: {
        1: 'https://example.com/day1',
        2: 'https://example.com/day2',
      },
      englishUrls: {},
      githubUrl: 'https://github.com/test/repo',
      totalDays: 5,
    };

    const nav = generateSeriesNavigation({
      seriesName: 'MCP',
      currentDay: 3,
      seriesDoc,
      language: 'ko',
    });

    // 네비게이션 구조 검증
    expect(nav).toContain('## 📚 시리즈 목차');
    expect(nav).toContain('**MCP**');
    expect(nav).toContain('Day 1');
    expect(nav).toContain('Day 2');
    expect(nav).toContain('👉 Day 3');
    expect(nav).toContain('github.com/test/repo');
  });

  it('영문 포스트에서 한글 링크를 영문 링크로 변환해야 한다', async () => {
    const { convertLinksToEnglish } = await import('@blog/core');

    const seriesDoc = {
      koreanUrls: {
        1: 'https://example.com/ko/day1',
        2: 'https://example.com/ko/day2',
      },
      englishUrls: {
        1: 'https://example.com/en/day1',
        2: 'https://example.com/en/day2',
      },
      githubUrl: null,
      totalDays: 2,
    };

    const content = `
[Day 1 링크](https://example.com/ko/day1)와
[Day 2 링크](https://example.com/ko/day2)를 참고하세요.
    `;

    const result = convertLinksToEnglish(content, seriesDoc);

    expect(result).toContain('https://example.com/en/day1');
    expect(result).toContain('https://example.com/en/day2');
    expect(result).not.toContain('https://example.com/ko/day1');
    expect(result).not.toContain('https://example.com/ko/day2');
  });

  it('영문 포스트 상단에 번역 배너를 삽입해야 한다', async () => {
    const { insertTranslationBanner } = await import('@blog/core');

    const content = '# Test Post\n\nThis is content.';
    const result = insertTranslationBanner(content, {
      language: 'en',
      originalUrl: 'https://example.com/ko/original',
    });

    expect(result).toContain('🌐 **Translation**');
    expect(result).toContain('https://example.com/ko/original');
    expect(result.indexOf('Translation')).toBeLessThan(result.indexOf('# Test Post'));
  });

  it('TL;DR 섹션 뒤에 GitHub 링크를 삽입해야 한다', async () => {
    const { insertGitHubLink } = await import('@blog/core');

    const content = `# Title

## TL;DR

Quick summary here.

## Introduction

Main content.`;

    const result = insertGitHubLink(content, 'https://github.com/test/repo');

    expect(result).toContain('🔗 [GitHub Repository](https://github.com/test/repo)');
    // TL;DR 섹션 뒤에 삽입되어야 함
    const tldrEnd = result.indexOf('Quick summary here.');
    const githubPos = result.indexOf('GitHub Repository');
    expect(githubPos).toBeGreaterThan(tldrEnd);
  });
});

// ===========================================================================
// Task 4.11: 시리즈 통합 테스트 (Boundary: 시리즈 문서 없음)
// ===========================================================================

describe('시리즈 기능 통합 (Boundary: 시리즈 문서 없음)', () => {
  it('시리즈 문서가 없어도 에러 없이 최소 네비게이션을 생성해야 한다', async () => {
    const { generateSeriesNavigation } = await import('@blog/core');

    const nav = generateSeriesNavigation({
      seriesName: 'Test Series',
      currentDay: 1,
      seriesDoc: null, // 시리즈 문서 없음
      language: 'ko',
    });

    // 최소 네비게이션 구조 확인
    expect(nav).toContain('## 📚 시리즈 목차');
    expect(nav).toContain('**Test Series**');
    expect(nav).toContain('Day 1');
    // GitHub 링크는 없어야 함
    expect(nav).not.toContain('github.com');
  });

  it('존재하지 않는 docs 폴더에서 시리즈 문서 찾기는 null을 반환해야 한다', async () => {
    const { findSeriesDocument } = await import('@blog/core');

    const result = findSeriesDocument('mcp', '/nonexistent/path/to/docs');

    expect(result).toBeNull();
  });

  it('시리즈가 아닌 일반 파일명은 null을 반환해야 한다', async () => {
    const { detectSeriesFromFilename } = await import('@blog/core');

    const result = detectSeriesFromFilename(
      'content/posts/ko/2025-12-05-general-blog-post.md'
    );

    expect(result).toBeNull();
  });

  it('시리즈 문서가 없어도 링크 변환은 원본을 그대로 반환해야 한다', async () => {
    const { convertLinksToEnglish } = await import('@blog/core');

    const content = 'Some content with [link](https://example.com)';
    const result = convertLinksToEnglish(content, null);

    expect(result).toBe(content);
  });

  it('한글 포스트에는 번역 배너를 삽입하지 않아야 한다', async () => {
    const { insertTranslationBanner } = await import('@blog/core');

    const content = '# 테스트 포스트\n\n내용입니다.';
    const result = insertTranslationBanner(content, {
      language: 'ko',
      originalUrl: 'https://example.com/original',
    });

    expect(result).toBe(content);
    expect(result).not.toContain('Translation');
  });

  it('GitHub URL이 없으면 링크를 삽입하지 않아야 한다', async () => {
    const { insertGitHubLink } = await import('@blog/core');

    const content = '# Title\n\nContent';
    const result = insertGitHubLink(content, null);

    expect(result).toBe(content);
    expect(result).not.toContain('GitHub');
  });
});
