/**
 * content-enhancer.ts 단위 테스트
 * PRD 0014: WordPress 포스트 생성 기능 개선 - 콘텐츠 강화 모듈
 */

import { describe, it, expect } from 'vitest';
import { insertTranslationBanner, insertGitHubLink } from './content-enhancer';

describe('insertTranslationBanner', () => {
  // =========================================================================
  // Task 2.10: Happy Path - 배너 삽입
  // =========================================================================

  describe('Happy Path: 배너 삽입', () => {
    it('영문 포스트 상단에 번역 배너를 삽입한다', () => {
      const content = `# Hello World

This is the content.
`;
      const koreanUrl = 'https://blog.com/ko/hello-world';

      const result = insertTranslationBanner(content, {
        language: 'en',
        originalUrl: koreanUrl,
      });

      // 배너가 콘텐츠 최상단에 삽입됨
      expect(result).toMatch(/^>\s*.*Translation/i);
      expect(result).toContain(koreanUrl);
      expect(result).toContain('# Hello World');
    });

    it('원본 URL 링크가 클릭 가능한 형태로 삽입된다', () => {
      const content = '# Test';
      const koreanUrl = 'https://blog.com/ko/test-post';

      const result = insertTranslationBanner(content, {
        language: 'en',
        originalUrl: koreanUrl,
      });

      // 마크다운 링크 형식 확인
      expect(result).toMatch(/\[.*\]\(https:\/\/blog\.com\/ko\/test-post\)/);
    });

    it('배너에 이모지와 스타일이 포함된다', () => {
      const content = '# Test';

      const result = insertTranslationBanner(content, {
        language: 'en',
        originalUrl: 'https://blog.com/ko/test',
      });

      // 번역 관련 이모지 포함
      expect(result).toMatch(/🌐|🔤|📝/);
    });
  });

  // =========================================================================
  // Task 2.11: Boundary Condition - 이미 배너 있음
  // =========================================================================

  describe('Boundary Condition: 이미 배너가 있는 경우', () => {
    it('이미 번역 배너가 있으면 추가하지 않는다', () => {
      const contentWithBanner = `> 🌐 **Translation**: This article was translated from [Korean](https://blog.com/ko/original).

# Test Content
`;

      const result = insertTranslationBanner(contentWithBanner, {
        language: 'en',
        originalUrl: 'https://blog.com/ko/new-url',
      });

      // 배너가 중복되지 않음 (기존 배너 유지)
      const bannerCount = (result.match(/Translation/gi) || []).length;
      expect(bannerCount).toBe(1);
    });

    it('다른 인용구가 있어도 번역 배너만 체크한다', () => {
      const contentWithQuote = `> This is a regular quote, not a translation banner.

# Test Content
`;

      const result = insertTranslationBanner(contentWithQuote, {
        language: 'en',
        originalUrl: 'https://blog.com/ko/test',
      });

      // 번역 배너가 추가됨
      expect(result).toMatch(/Translation/i);
    });
  });

  // =========================================================================
  // Task 2.12: Exception Cases - 한글 포스트
  // =========================================================================

  describe('Exception Cases: 예외 상황 처리', () => {
    it('한글 포스트(ko)는 배너를 삽입하지 않는다', () => {
      const content = '# 한글 제목\n\n내용입니다.';

      const result = insertTranslationBanner(content, {
        language: 'ko',
        originalUrl: 'https://blog.com/en/english-version',
      });

      // 원본 그대로 반환
      expect(result).toBe(content);
    });

    it('원본 URL이 없으면 배너를 삽입하지 않는다', () => {
      const content = '# Test';

      const result = insertTranslationBanner(content, {
        language: 'en',
        originalUrl: '',
      });

      expect(result).toBe(content);
    });

    it('null URL은 배너를 삽입하지 않는다', () => {
      const content = '# Test';

      const result = insertTranslationBanner(content, {
        language: 'en',
        // @ts-expect-error 의도적인 null 테스트
        originalUrl: null,
      });

      expect(result).toBe(content);
    });

    it('빈 콘텐츠는 빈 문자열 반환', () => {
      const result = insertTranslationBanner('', {
        language: 'en',
        originalUrl: 'https://blog.com/ko/test',
      });

      expect(result).toBe('');
    });
  });
});

// ============================================================================
// Task 2.13-2.16: insertGitHubLink() 테스트
// ============================================================================

describe('insertGitHubLink', () => {
  // =========================================================================
  // Task 2.14: Happy Path - frontmatter 링크
  // =========================================================================

  describe('Happy Path: GitHub 링크 삽입', () => {
    it('TL;DR 섹션 뒤에 GitHub 링크를 삽입한다', () => {
      const content = `# Title

## TL;DR

Quick summary here.

## Introduction

Main content.
`;
      const githubUrl = 'https://github.com/user/project';

      const result = insertGitHubLink(content, githubUrl);

      // TL;DR 섹션 뒤에 GitHub 링크 삽입
      expect(result).toContain(githubUrl);
      expect(result.indexOf('TL;DR')).toBeLessThan(result.indexOf(githubUrl));
    });

    it('GitHub 링크에 이모지와 설명이 포함된다', () => {
      const content = `## TL;DR\n\nSummary.`;
      const githubUrl = 'https://github.com/user/repo';

      const result = insertGitHubLink(content, githubUrl);

      // 이모지 포함
      expect(result).toMatch(/🔗|📦|💻/);
      // 링크 형식
      expect(result).toMatch(/\[.*\]\(https:\/\/github\.com\/user\/repo\)/);
    });
  });

  // =========================================================================
  // Task 2.15: Boundary Condition - 시리즈 문서 링크
  // =========================================================================

  describe('Boundary Condition: TL;DR 섹션 없음', () => {
    it('TL;DR 섹션이 없으면 제목 바로 뒤에 삽입한다', () => {
      const content = `# Title

## Introduction

Content here.
`;
      const githubUrl = 'https://github.com/user/project';

      const result = insertGitHubLink(content, githubUrl);

      // 제목 뒤에 삽입
      expect(result).toContain(githubUrl);
      expect(result.indexOf('# Title')).toBeLessThan(result.indexOf(githubUrl));
    });

    it('이미 GitHub 링크가 있으면 추가하지 않는다', () => {
      const content = `# Title

🔗 [GitHub Repository](https://github.com/user/existing)

Content.
`;
      const githubUrl = 'https://github.com/user/new-repo';

      const result = insertGitHubLink(content, githubUrl);

      // 기존 링크 유지, 새 링크 추가 안 함
      expect(result).toContain('https://github.com/user/existing');
      expect(result).not.toContain(githubUrl);
    });
  });

  // =========================================================================
  // Task 2.16: Exception Cases - 링크 없음
  // =========================================================================

  describe('Exception Cases: 예외 상황 처리', () => {
    it('GitHub URL이 없으면 원본 그대로 반환', () => {
      const content = '# Test\n\nContent.';

      const result = insertGitHubLink(content, '');

      expect(result).toBe(content);
    });

    it('null URL은 원본 그대로 반환', () => {
      const content = '# Test';

      // @ts-expect-error 의도적인 null 테스트
      const result = insertGitHubLink(content, null);

      expect(result).toBe(content);
    });

    it('빈 콘텐츠는 빈 문자열 반환', () => {
      const result = insertGitHubLink('', 'https://github.com/user/repo');

      expect(result).toBe('');
    });

    it('유효하지 않은 GitHub URL은 원본 그대로 반환', () => {
      const content = '# Test';

      const result = insertGitHubLink(content, 'not-a-url');

      expect(result).toBe(content);
    });
  });
});
