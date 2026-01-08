/**
 * 번역 모듈 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translatePost } from './translator';
import type { PostMetadata } from '@blog/shared';
import * as claudeModule from './claude';

describe('Translator Module', () => {
  const mockMetadata: PostMetadata = {
    title: 'WordPress REST API로 블로그 자동화하기',
    slug: 'wordpress-rest-api-automation',
    excerpt: 'CLI 도구를 만들어 마크다운을 자동으로 WordPress에 발행하는 방법을 배웁니다.',
    status: 'publish',
    categories: ['개발 도구', '자동화'],
    tags: ['WordPress', 'REST API', 'CLI', 'TypeScript', 'Node.js'],
    language: 'ko',
  };

  const mockContent = `# WordPress REST API 완벽 가이드

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

이 가이드를 통해 WordPress 자동화를 구현할 수 있습니다.`;

  describe('translatePost', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle empty content (boundary condition)', async () => {
      // TC-1.3: 빈 콘텐츠 처리
      const emptyContent = '';

      // executeClaude Mock 설정
      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: '',
        executionTime: 100,
      });

      await expect(
        translatePost(emptyContent, mockMetadata)
      ).resolves.toBeTruthy();

      vi.restoreAllMocks();
    });

    it('should throw error on executeClaude failure', async () => {
      // TC-1.2: Claude Code 실행 오류 처리
      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: false,
        content: '',
        error: 'Claude execution failed',
      });

      await expect(
        translatePost(mockContent, mockMetadata)
      ).rejects.toThrow('Failed to translate content');

      vi.restoreAllMocks();
    });

    it('should preserve code blocks in translation', async () => {
      // TC-1.4: 코드 블록 보존
      const contentWithCode = `# Test

\`\`\`typescript
const example = 'test';
\`\`\``;

      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: `# Test

\`\`\`typescript
const example = 'test';
\`\`\``,
        executionTime: 1000,
      });

      const result = await translatePost(contentWithCode, mockMetadata);

      expect(result.translatedContent).toContain('```typescript');
      expect(result.translatedContent).toContain("const example = 'test'");

      vi.restoreAllMocks();
    });

    it('should include SEO keywords in translation prompt', async () => {
      // TC-1.4: SEO 키워드 프롬프트 포함
      const executeMock = vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: 'Translated content with WordPress, REST API, and TypeScript keywords.',
        executionTime: 2000,
      });

      await translatePost(mockContent, mockMetadata);

      // executeClaude 호출 시 프롬프트에 keywords가 포함되어 있는지 확인
      expect(executeMock).toHaveBeenCalled();
      const callArgs = executeMock.mock.calls[0][0];
      expect(callArgs.prompt).toContain('WordPress');
      expect(callArgs.prompt).toContain('REST API');
      expect(callArgs.prompt).toContain('TypeScript');

      vi.restoreAllMocks();
    });

    it('should NOT include translation disclaimer (removed feature)', async () => {
      // 번역 디스클레이머가 제거되었는지 확인
      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: '# Complete Guide to WordPress Automation\n\nTranslated content here.',
        executionTime: 2000,
      });

      const result = await translatePost(mockContent, mockMetadata);

      // 디스클레이머가 포함되지 않아야 함
      expect(result.translatedContent).not.toContain('🌐 Translation');
      expect(result.translatedContent).not.toContain('Translated from');

      vi.restoreAllMocks();
    });

    it('should enforce 300 character excerpt limit', async () => {
      // Excerpt 300자 제한 확인
      const longExcerpt = 'A'.repeat(400);
      const metadataWithLongExcerpt = {
        ...mockMetadata,
        excerpt: longExcerpt,
      };

      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: 'Translated content',
        executionTime: 1000,
      });

      const result = await translatePost(mockContent, metadataWithLongExcerpt);

      // Excerpt가 300자 이하인지 확인
      expect(result.translatedMetadata.excerpt).toBeDefined();
      expect(result.translatedMetadata.excerpt!.length).toBeLessThanOrEqual(300);

      vi.restoreAllMocks();
    });

    it('should use proper timeout for translation', async () => {
      // 타임아웃 계산 확인
      const executeMock = vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: 'Translated content',
        executionTime: 2000,
      });

      const calculateTimeoutSpy = vi.spyOn(claudeModule, 'calculateTimeout');

      await translatePost(mockContent, mockMetadata);

      // calculateTimeout이 호출되었는지 확인
      expect(calculateTimeoutSpy).toHaveBeenCalled();

      // executeClaude가 timeout 옵션과 함께 호출되었는지 확인
      expect(executeMock).toHaveBeenCalled();
      const callArgs = executeMock.mock.calls[0][0];
      expect(callArgs.timeout).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it.skip('should successfully translate Korean post to English', async () => {
      // TC-1.1: executeClaude() 정상 호출 및 번역
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      // 통합 테스트에서 검증
      const result = await translatePost(mockContent, mockMetadata);

      expect(result.translatedMetadata.language).toBe('en');
      expect(result.translatedMetadata.title).not.toBe(mockMetadata.title);
      expect(result.translatedContent).not.toBe(mockContent);
      expect(result.seoReport).toBeDefined();
    });

    it.skip('should generate SEO-optimized title', async () => {
      // TC-1.5: SEO 제목 생성
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      const result = await translatePost(mockContent, mockMetadata);

      // SEO 패턴 확인 (How to, Complete Guide 등)
      const title = result.translatedMetadata.title;
      const hasSeoPattern =
        title.includes('How to') ||
        title.includes('Complete Guide') ||
        title.includes('Step-by-Step') ||
        title.includes('Tutorial');

      expect(hasSeoPattern).toBe(true);
      expect(title.length).toBeLessThanOrEqual(60); // SEO 제목 길이 제한
    });

    it.skip('should preserve technical terms in translation', async () => {
      // TC-1.6: 번역 금지 항목 (브랜드명, 기술 용어)
      // Note: 실제 Claude Code 실행이 필요하므로 skip
      const result = await translatePost(mockContent, mockMetadata);

      // 기술 용어가 보존되는지 확인
      expect(result.translatedContent).toContain('WordPress');
      expect(result.translatedContent).toContain('REST API');
      expect(result.translatedContent).toContain('TypeScript');
    });
  });

  describe('Tag Translation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should translate Korean tags to English using AI', async () => {
      // 한국어 태그를 AI로 번역
      const metadataWithKoreanTags: PostMetadata = {
        ...mockMetadata,
        tags: ['시맨틱 검색', '하이브리드 검색', 'RAG'],
      };

      // Mock: 제목, excerpt, 본문, 태그 번역 순서로 호출됨
      vi.spyOn(claudeModule, 'executeClaude')
        .mockResolvedValueOnce({ success: true, content: 'SEO Title', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'SEO Excerpt', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'Semantic Search\nHybrid Search', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'Translated content', executionTime: 1000 });

      const result = await translatePost(mockContent, metadataWithKoreanTags);

      // 영어 태그가 포함되어 있어야 함
      expect(result.translatedMetadata.tags).toContain('RAG'); // 영어는 그대로
      expect(result.translatedMetadata.tags).toContain('Semantic Search');
      expect(result.translatedMetadata.tags).toContain('Hybrid Search');

      vi.restoreAllMocks();
    });

    it('should keep English tags unchanged', async () => {
      // 영어 태그는 그대로 유지
      const metadataWithEnglishTags: PostMetadata = {
        ...mockMetadata,
        tags: ['RAG', 'TypeScript', 'Node.js', 'REST API'],
      };

      vi.spyOn(claudeModule, 'executeClaude')
        .mockResolvedValueOnce({ success: true, content: 'SEO Title', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'SEO Excerpt', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'Translated content', executionTime: 1000 });

      const result = await translatePost(mockContent, metadataWithEnglishTags);

      // 모든 영어 태그가 보존되어야 함
      expect(result.translatedMetadata.tags).toContain('RAG');
      expect(result.translatedMetadata.tags).toContain('TypeScript');
      expect(result.translatedMetadata.tags).toContain('Node.js');
      expect(result.translatedMetadata.tags).toContain('REST API');

      vi.restoreAllMocks();
    });

    it('should handle empty tags array', async () => {
      // 빈 태그 배열 처리
      const metadataWithNoTags: PostMetadata = {
        ...mockMetadata,
        tags: [],
      };

      vi.spyOn(claudeModule, 'executeClaude')
        .mockResolvedValueOnce({ success: true, content: 'SEO Title', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'SEO Excerpt', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'Translated content', executionTime: 1000 });

      const result = await translatePost(mockContent, metadataWithNoTags);

      expect(result.translatedMetadata.tags).toEqual([]);

      vi.restoreAllMocks();
    });

    it('should limit tags to maximum 10', async () => {
      // 최대 10개 태그 제한
      const metadataWithManyTags: PostMetadata = {
        ...mockMetadata,
        tags: Array.from({ length: 15 }, (_, i) => `Tag${i + 1}`),
      };

      vi.spyOn(claudeModule, 'executeClaude')
        .mockResolvedValueOnce({ success: true, content: 'SEO Title', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'SEO Excerpt', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'Translated content', executionTime: 1000 });

      const result = await translatePost(mockContent, metadataWithManyTags);

      expect(result.translatedMetadata.tags!.length).toBeLessThanOrEqual(10);

      vi.restoreAllMocks();
    });

    it('should fallback to original tags on translation failure', async () => {
      // 번역 실패 시 원본 태그 사용
      const metadataWithKoreanTags: PostMetadata = {
        ...mockMetadata,
        tags: ['시맨틱 검색', 'RAG'],
      };

      vi.spyOn(claudeModule, 'executeClaude')
        .mockResolvedValueOnce({ success: true, content: 'SEO Title', executionTime: 100 })
        .mockResolvedValueOnce({ success: true, content: 'SEO Excerpt', executionTime: 100 })
        .mockResolvedValueOnce({ success: false, content: '', error: 'Tag translation failed', executionTime: 0 })
        .mockResolvedValueOnce({ success: true, content: 'Translated content', executionTime: 1000 });

      const result = await translatePost(mockContent, metadataWithKoreanTags);

      // 원본 태그가 반환되어야 함 (최대 10개)
      expect(result.translatedMetadata.tags).toBeDefined();
      expect(result.translatedMetadata.tags!.length).toBeLessThanOrEqual(10);

      vi.restoreAllMocks();
    });
  });

  describe('Translation Quality Checks', () => {
    it('should return SEO report', async () => {
      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: 'Translated content',
        executionTime: 2000,
      });

      const result = await translatePost(mockContent, mockMetadata);

      expect(result.seoReport).toBeDefined();
      expect(result.seoReport.titleOptimized).toBeDefined();
      expect(result.seoReport.excerptLength).toBeGreaterThanOrEqual(0);
      expect(result.seoReport.excerptValid).toBeDefined();

      vi.restoreAllMocks();
    });

    it('should translate metadata fields', async () => {
      vi.spyOn(claudeModule, 'executeClaude').mockResolvedValue({
        success: true,
        content: 'Translated content',
        executionTime: 2000,
      });

      const result = await translatePost(mockContent, mockMetadata);

      // 메타데이터 번역 확인
      expect(result.translatedMetadata.language).toBe('en');
      expect(result.translatedMetadata.slug).toBeDefined();
      expect(result.translatedMetadata.categories).toBeDefined();
      expect(result.translatedMetadata.tags).toBeDefined();

      vi.restoreAllMocks();
    });
  });
});
