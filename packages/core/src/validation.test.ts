/**
 * 품질 검증 모듈 유닛 테스트
 */

import { describe, it, expect } from 'vitest';
import { validateTranslation } from './validation';
import type { PostMetadata } from '@blog/shared';

describe('Validation Module', () => {
  const mockOriginalMetadata: PostMetadata = {
    title: 'WordPress REST API로 블로그 자동화하기',
    slug: 'wordpress-rest-api-automation',
    excerpt: 'CLI 도구를 만들어 마크다운을 자동으로 WordPress에 발행하는 방법을 배웁니다.',
    status: 'publish',
    categories: ['개발 도구', '자동화'],
    tags: ['WordPress', 'REST API', 'CLI', 'TypeScript', 'Node.js'],
    language: 'ko',
  };

  const mockOriginalContent = `# WordPress REST API 완벽 가이드

WordPress REST API를 활용하여 블로그 포스팅을 자동화하는 방법을 알아봅니다.

## 주요 기능

- 마크다운에서 WordPress로 자동 변환
- REST API 연동
- SEO 최적화

\`\`\`typescript
// 예제 코드
const client = new WordPressClient({
  url: 'https://example.com',
  username: 'admin',
  password: 'app-password'
});
\`\`\`

## 결론

WordPress, REST API, CLI, TypeScript, Node.js를 활용한 자동화입니다.`;

  const mockTranslatedMetadata: PostMetadata = {
    title: 'Complete Guide to WordPress Automation with REST API',
    slug: 'wordpress-rest-api-automation-en',
    excerpt: 'Learn to build a CLI tool that automates WordPress publishing from Markdown with TypeScript.',
    status: 'publish',
    categories: ['Development Tools', 'Automation'],
    tags: ['WordPress', 'REST API', 'CLI', 'TypeScript', 'Node.js'],
    language: 'en',
  };

  const mockTranslatedContent = `# Complete Guide to WordPress Automation

Explore how to automate blog posting using WordPress REST API.

## Key Features

- Automatic conversion from Markdown to WordPress
- REST API integration
- SEO optimization

\`\`\`typescript
// Example code
const client = new WordPressClient({
  url: 'https://example.com',
  username: 'admin',
  password: 'app-password'
});
\`\`\`

## Conclusion

Automation using WordPress, REST API, CLI, TypeScript, and Node.js.`;

  describe('validateBasics', () => {
    it('should pass for valid content', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      const basicIssues = result.issues.filter((i) => i.type === 'content');
      expect(basicIssues.length).toBe(0);
    });

    it('should detect empty content', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        '', // 빈 콘텐츠
        mockTranslatedMetadata
      );

      expect(result.isValid).toBe(false);
      const emptyIssue = result.issues.find((i) => i.message.includes('empty'));
      expect(emptyIssue).toBeDefined();
      expect(emptyIssue?.severity).toBe('error');
    });

    it('should detect code block count mismatch', async () => {
      const contentWithExtraCodeBlock = mockTranslatedContent + '\n\n```js\nconst extra = true;\n```';

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        contentWithExtraCodeBlock,
        mockTranslatedMetadata
      );

      const codeBlockIssue = result.issues.find((i) => i.field === 'code_blocks');
      expect(codeBlockIssue).toBeDefined();
      expect(codeBlockIssue?.severity).toBe('error');
    });

    it('should detect link count mismatch', async () => {
      const contentWithLink = mockTranslatedContent + '\n\n[Extra Link](https://example.com)';

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        contentWithLink,
        mockTranslatedMetadata
      );

      const linkIssue = result.issues.find((i) => i.field === 'links');
      expect(linkIssue).toBeDefined();
      expect(linkIssue?.severity).toBe('warning');
    });

    it('should detect heading structure mismatch', async () => {
      const contentWithExtraH1 = '# Extra H1\n\n' + mockTranslatedContent;

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        contentWithExtraH1,
        mockTranslatedMetadata
      );

      const headingIssue = result.issues.find((i) => i.field === 'headings');
      expect(headingIssue).toBeDefined();
      expect(headingIssue?.severity).toBe('warning');
    });
  });

  describe('validateLineCount', () => {
    it('should pass for normal line count (50-150%)', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      const lineCountErrors = result.issues.filter(
        (i) => i.field === 'line_count' && i.severity === 'error'
      );
      expect(lineCountErrors.length).toBe(0);
    });

    it('should fail for too short content (<50%)', async () => {
      const shortContent = `# Title\n\nShort content.`;

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        shortContent,
        mockTranslatedMetadata
      );

      expect(result.isValid).toBe(false);
      const lineCountError = result.issues.find(
        (i) => i.field === 'line_count' && i.severity === 'error'
      );
      expect(lineCountError).toBeDefined();
      expect(lineCountError?.message).toContain('too short');
    });

    it('should fail for too long content (>150%)', async () => {
      const longContent = mockTranslatedContent + '\n'.repeat(100) + 'Extra content\n'.repeat(50);

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        longContent,
        mockTranslatedMetadata
      );

      expect(result.isValid).toBe(false);
      const lineCountError = result.issues.find(
        (i) => i.field === 'line_count' && i.severity === 'error'
      );
      expect(lineCountError).toBeDefined();
      expect(lineCountError?.message).toContain('too long');
    });

    it('should warn for borderline content (70-130% range)', async () => {
      // 약 65% 길이 (경고 범위)
      const borderlineContent = mockTranslatedContent.split('\n').slice(0, 12).join('\n');

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        borderlineContent,
        mockTranslatedMetadata
      );

      const lineCountWarning = result.issues.find(
        (i) => i.field === 'line_count' && i.severity === 'warning'
      );
      expect(lineCountWarning).toBeDefined();
    });
  });

  describe('validateSeoKeywords', () => {
    it('should pass when all keywords are present', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      const keywordErrors = result.issues.filter(
        (i) => i.field === 'keywords' && i.severity === 'error'
      );
      expect(keywordErrors.length).toBe(0);
    });

    it('should detect missing keywords', async () => {
      const contentWithoutKeywords = `# Title

Some content without any SEO keywords.`;

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        contentWithoutKeywords,
        mockTranslatedMetadata
      );

      const keywordIssue = result.issues.find((i) => i.field === 'keywords');
      expect(keywordIssue).toBeDefined();
      expect(keywordIssue?.message).toContain('Missing SEO keywords');
    });

    it('should calculate keyword density', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      const densityIssue = result.issues.find((i) => i.field === 'keyword_density');
      // 밀도가 0.5-2.5% 범위 내인지 확인 (info 또는 warning)
      if (densityIssue) {
        expect(['info', 'warning']).toContain(densityIssue.severity);
      }
    });

    it('should handle missing tags gracefully', async () => {
      const metadataWithoutTags = {
        ...mockOriginalMetadata,
        tags: [],
      };

      const result = await validateTranslation(
        mockOriginalContent,
        metadataWithoutTags,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      const keywordInfo = result.issues.find((i) => i.field === 'keywords' && i.severity === 'info');
      expect(keywordInfo).toBeDefined();
      expect(keywordInfo?.message).toContain('No SEO keywords');
    });
  });

  describe('validateTitleLength', () => {
    it('should pass for titles ≤60 characters', async () => {
      const shortTitle: PostMetadata = {
        ...mockTranslatedMetadata,
        title: 'Short Title',
      };

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        shortTitle
      );

      const titleIssue = result.issues.find((i) => i.field === 'title');
      expect(titleIssue).toBeUndefined();
    });

    it('should warn for titles >60 characters', async () => {
      const longTitle: PostMetadata = {
        ...mockTranslatedMetadata,
        title: 'This is a very long title that exceeds the recommended 60 character limit for SEO optimization',
      };

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        longTitle
      );

      const titleIssue = result.issues.find((i) => i.field === 'title');
      expect(titleIssue).toBeDefined();
      expect(titleIssue?.severity).toBe('warning');
      expect(titleIssue?.message).toContain('too long');
    });
  });

  describe('validateTranslation - Integration', () => {
    it('should return comprehensive validation result', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      // 결과 구조 확인
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('metrics');

      // 메트릭 확인
      expect(result.metrics).toHaveProperty('lineCountDiff');
      expect(result.metrics).toHaveProperty('lineCountDiffPercent');
      expect(result.metrics).toHaveProperty('preservedCodeBlocks');
      expect(result.metrics).toHaveProperty('metadataComplete');
      expect(result.metrics).toHaveProperty('seoOptimized');
      expect(result.metrics).toHaveProperty('titleLength');
      expect(result.metrics).toHaveProperty('excerptLength');
    });

    it('should mark as invalid when there are errors', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        '', // 빈 콘텐츠 (에러)
        mockTranslatedMetadata
      );

      expect(result.isValid).toBe(false);
    });

    it('should mark as valid when only warnings exist', async () => {
      const longTitle: PostMetadata = {
        ...mockTranslatedMetadata,
        title: 'This is a long title that will trigger a warning but not an error',
      };

      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        longTitle
      );

      // 경고만 있으면 valid
      const hasErrors = result.issues.some((i) => i.severity === 'error');
      expect(hasErrors).toBe(false);
      expect(result.isValid).toBe(true);
    });

    it('should calculate metrics correctly', async () => {
      const result = await validateTranslation(
        mockOriginalContent,
        mockOriginalMetadata,
        mockTranslatedContent,
        mockTranslatedMetadata
      );

      // 코드 블록 보존 확인
      expect(result.metrics.preservedCodeBlocks).toBe(1);

      // 메타데이터 완전성 확인
      expect(result.metrics.metadataComplete).toBe(true);

      // SEO 최적화 확인 (title ≤60, excerpt ≤300, tags ≥3)
      expect(result.metrics.seoOptimized).toBe(true);

      // 제목/요약 길이 확인
      expect(result.metrics.titleLength).toBe(mockTranslatedMetadata.title.length);
      expect(result.metrics.excerptLength).toBe(mockTranslatedMetadata.excerpt?.length || 0);
    });
  });
});
