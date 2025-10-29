/**
 * SEO 모듈 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  generateSeoData,
  generateMetaTags,
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateSlug,
  analyzeKeywordDensity,
  validateKeywordDensity,
  calculateSeoScore,
  calculatePostLength,
  calculateLengthFactor,
  analyzeSectionDistribution,
} from './seo.js';

describe('SEO Module', () => {
  describe('generateMetaTags', () => {
    it('should generate basic meta tags', () => {
      const meta = generateMetaTags({
        title: 'AI 블로그 자동화',
        description: 'Claude Code를 활용한 블로그 자동화',
        keywords: ['AI', 'automation', 'blog'],
      });

      expect(meta.title).toBe('AI 블로그 자동화');
      expect(meta.description).toBe('Claude Code를 활용한 블로그 자동화');
      expect(meta.keywords).toEqual(['AI', 'automation', 'blog']);
      expect(meta.robots).toBe('index, follow');
    });
  });

  describe('generateOpenGraphTags', () => {
    it('should generate Open Graph tags', () => {
      const og = generateOpenGraphTags({
        title: 'AI 블로그 자동화',
        description: 'Claude Code를 활용한 블로그 자동화',
        url: 'https://example.com/post',
        imageUrl: 'https://example.com/image.jpg',
        siteName: 'My Blog',
        language: 'ko',
      });

      expect(og['og:title']).toBe('AI 블로그 자동화');
      expect(og['og:description']).toBe('Claude Code를 활용한 블로그 자동화');
      expect(og['og:type']).toBe('article');
      expect(og['og:url']).toBe('https://example.com/post');
      expect(og['og:image']).toBe('https://example.com/image.jpg');
      expect(og['og:locale']).toBe('ko_KR');
      expect(og['og:site_name']).toBe('My Blog');
    });

    it('should use English locale for en language', () => {
      const og = generateOpenGraphTags({
        title: 'AI Blog Automation',
        description: 'Automate your blog with Claude Code',
        language: 'en',
      });

      expect(og['og:locale']).toBe('en_US');
    });
  });

  describe('generateTwitterCardTags', () => {
    it('should generate Twitter Card tags with image', () => {
      const twitter = generateTwitterCardTags({
        title: 'AI 블로그 자동화',
        description: 'Claude Code를 활용한 블로그 자동화',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(twitter['twitter:card']).toBe('summary_large_image');
      expect(twitter['twitter:title']).toBe('AI 블로그 자동화');
      expect(twitter['twitter:description']).toBe('Claude Code를 활용한 블로그 자동화');
      expect(twitter['twitter:image']).toBe('https://example.com/image.jpg');
    });

    it('should generate Twitter Card tags without image', () => {
      const twitter = generateTwitterCardTags({
        title: 'AI 블로그 자동화',
        description: 'Claude Code를 활용한 블로그 자동화',
      });

      expect(twitter['twitter:card']).toBe('summary');
    });
  });

  describe('generateSlug', () => {
    it('should convert Korean to romanized slug', () => {
      const slug = generateSlug('AI 블로그 자동화 가이드');

      expect(slug).toBe('ai-beulrogeu-jadonghwa-gaideu');
    });

    it('should convert mixed Korean and English to slug', () => {
      const slug = generateSlug('Next.js 14 시작하기');

      expect(slug).toContain('next');
      expect(slug).toContain('14');
    });

    it('should handle special characters', () => {
      const slug = generateSlug('React & TypeScript 가이드');

      expect(slug).toContain('and');
      expect(slug).not.toContain('&');
    });

    it('should be lowercase', () => {
      const slug = generateSlug('UPPERCASE TITLE');

      expect(slug).toBe('uppercase-title');
    });
  });

  describe('analyzeKeywordDensity', () => {
    it('should calculate keyword density correctly', () => {
      const content = `
        AI 기술은 블로그 작성을 자동화합니다.
        블로그 자동화는 시간을 절약합니다.
        AI와 automation이 핵심입니다.
        총 단어가 있습니다.
      `;

      const densities = analyzeKeywordDensity(content, ['AI', '블로그']);

      expect(densities).toHaveLength(2);

      const aiDensity = densities.find((d) => d.keyword === 'AI');
      expect(aiDensity?.count).toBeGreaterThanOrEqual(2);
      expect(aiDensity?.density).toBeGreaterThan(0);

      const blogDensity = densities.find((d) => d.keyword === '블로그');
      expect(blogDensity?.count).toBeGreaterThanOrEqual(2);
    });

    it('should mark optimal density correctly', () => {
      // 100 단어 중 1개 키워드 = 1% (최적 범위: 0.5-2.5%)
      const words = Array(100).fill('word').join(' ');
      const content = `keyword ${words}`;

      const densities = analyzeKeywordDensity(content, ['keyword']);

      expect(densities[0].isOptimal).toBe(true);
    });

    it('should mark low density as non-optimal', () => {
      // 1000 단어 중 1개 키워드 = 0.1% (너무 낮음)
      const words = Array(1000).fill('word').join(' ');
      const content = `keyword ${words}`;

      const densities = analyzeKeywordDensity(content, ['keyword']);

      expect(densities[0].isOptimal).toBe(false);
      expect(densities[0].density).toBeLessThan(0.5);
    });

    it('should mark high density as non-optimal', () => {
      // 10 단어 중 1개 키워드 = 10% (너무 높음)
      const content = 'keyword word word word word word word word word word';

      const densities = analyzeKeywordDensity(content, ['keyword']);

      expect(densities[0].isOptimal).toBe(false);
      expect(densities[0].density).toBeGreaterThan(2.5);
    });

    it('should handle HTML content', () => {
      const content = '<p>AI 기술은 <strong>블로그</strong>를 자동화합니다.</p>';

      const densities = analyzeKeywordDensity(content, ['AI', '블로그']);

      expect(densities[0].count).toBeGreaterThan(0);
    });
  });

  describe('validateKeywordDensity', () => {
    it('should pass validation for optimal density', () => {
      const words = Array(100).fill('word').join(' ');
      const content = `keyword ${words}`;

      const result = validateKeywordDensity(content, ['keyword']);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should fail validation for low density', () => {
      const words = Array(1000).fill('word').join(' ');
      const content = `keyword ${words}`;

      const result = validateKeywordDensity(content, ['keyword']);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('너무 낮습니다');
    });

    it('should fail validation for high density', () => {
      const content = 'keyword keyword keyword word word';

      const result = validateKeywordDensity(content, ['keyword']);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('너무 높습니다');
    });

    it('should adjust target density for long posts', () => {
      // 1500+ 줄 포스트는 목표 밀도가 0.35-1.75% (lengthFactor 0.7)
      const words = Array(1000).fill('word').join(' ');
      const content = `keyword keyword keyword keyword ${words}`; // 4 keywords in 1004 words = ~0.4% 밀도

      // postLength 없이는 실패해야 함 (0.4% < 0.5% 기본 최소값)
      const resultWithoutLength = validateKeywordDensity(content, ['keyword']);
      expect(resultWithoutLength.valid).toBe(false);

      // postLength 1600으로 하면 통과해야 함 (0.4% is within 0.35-1.75% with 0.7x factor)
      const resultWithLength = validateKeywordDensity(content, ['keyword'], 1600);
      expect(resultWithLength.valid).toBe(true);
      expect(resultWithLength.targetDensity).toBeDefined();
      expect(resultWithLength.targetDensity?.min).toBeCloseTo(0.35, 2);
      expect(resultWithLength.targetDensity?.max).toBeCloseTo(1.75, 2);
    });
  });

  describe('calculatePostLength', () => {
    it('should count non-empty lines by default', () => {
      const content = `Line 1

Line 2

Line 3`;
      const length = calculatePostLength(content);

      expect(length).toBe(3); // 3 non-empty lines
    });

    it('should count all lines when excludeEmpty is false', () => {
      const content = `Line 1

Line 2

Line 3`;
      const length = calculatePostLength(content, false);

      expect(length).toBe(5); // 3 lines + 2 empty lines
    });

    it('should handle empty string', () => {
      expect(calculatePostLength('')).toBe(0);
      expect(calculatePostLength('', false)).toBe(1); // Empty string has 1 line
    });

    it('should handle single line', () => {
      expect(calculatePostLength('Single line')).toBe(1);
    });

    it('should exclude lines with only whitespace', () => {
      const content = `Line 1

Line 2
\t
Line 3`;
      const length = calculatePostLength(content);

      expect(length).toBe(3); // Whitespace-only lines excluded
    });

    it('should handle very long posts', () => {
      const content = Array(2000).fill('line').join('\n');
      const length = calculatePostLength(content);

      expect(length).toBe(2000);
    });
  });

  describe('calculateLengthFactor', () => {
    it('should return 1.0 for posts under 500 lines', () => {
      expect(calculateLengthFactor(0)).toBe(1.0);
      expect(calculateLengthFactor(100)).toBe(1.0);
      expect(calculateLengthFactor(499)).toBe(1.0);
    });

    it('should return 0.9 for posts between 500-999 lines', () => {
      expect(calculateLengthFactor(500)).toBe(0.9);
      expect(calculateLengthFactor(750)).toBe(0.9);
      expect(calculateLengthFactor(999)).toBe(0.9);
    });

    it('should return 0.8 for posts between 1000-1499 lines', () => {
      expect(calculateLengthFactor(1000)).toBe(0.8);
      expect(calculateLengthFactor(1250)).toBe(0.8);
      expect(calculateLengthFactor(1499)).toBe(0.8);
    });

    it('should return 0.7 for posts 1500+ lines', () => {
      expect(calculateLengthFactor(1500)).toBe(0.7);
      expect(calculateLengthFactor(2000)).toBe(0.7);
      expect(calculateLengthFactor(10000)).toBe(0.7);
    });
  });

  describe('analyzeSectionDistribution', () => {
    it('should split content by H2 headers', () => {
      const content = `Introduction text

## Section 1
Content for section 1

## Section 2
Content for section 2`;

      const sections = analyzeSectionDistribution(content, ['keyword']);

      expect(sections).toHaveLength(3); // Introduction + 2 sections
      expect(sections[0].sectionTitle).toBe('(Introduction)');
      expect(sections[1].sectionTitle).toBe('Section 1');
      expect(sections[2].sectionTitle).toBe('Section 2');
    });

    it('should count keywords per section', () => {
      const content = `AI introduction

## Section 1
AI and automation here

## Section 2
Only automation here`;

      const sections = analyzeSectionDistribution(content, ['AI', 'automation']);

      expect(sections[0].keywordCounts['AI']).toBe(1);
      expect(sections[0].keywordCounts['automation']).toBe(0);
      expect(sections[0].totalKeywords).toBe(1);

      expect(sections[1].keywordCounts['AI']).toBe(1);
      expect(sections[1].keywordCounts['automation']).toBe(1);
      expect(sections[1].totalKeywords).toBe(2);

      expect(sections[2].keywordCounts['AI']).toBe(0);
      expect(sections[2].keywordCounts['automation']).toBe(1);
      expect(sections[2].totalKeywords).toBe(1);
    });

    it('should handle content without H2 headers', () => {
      const content = 'Just plain content with AI and automation';

      const sections = analyzeSectionDistribution(content, ['AI', 'automation']);

      expect(sections).toHaveLength(1);
      expect(sections[0].sectionTitle).toBe('(Introduction)');
      expect(sections[0].totalKeywords).toBe(2);
    });

    it('should handle empty sections', () => {
      const content = `Intro text

## Section 1

## Section 2
AI content here`;

      const sections = analyzeSectionDistribution(content, ['AI']);

      expect(sections).toHaveLength(3); // Intro + 2 sections
      expect(sections[0].totalKeywords).toBe(0); // Intro has no keywords
      expect(sections[1].totalKeywords).toBe(0); // Section 1 is empty
      expect(sections[2].totalKeywords).toBe(1); // Section 2 has AI
    });

    it('should be case-insensitive', () => {
      const content = `AI ai Ai aI`;

      const sections = analyzeSectionDistribution(content, ['AI']);

      expect(sections[0].keywordCounts['AI']).toBe(4);
    });
  });

  describe('calculateSeoScore', () => {
    it('should calculate SEO score correctly', () => {
      const result = calculateSeoScore({
        title: 'AI 블로그 자동화 가이드 - Claude Code 활용법', // ~40자 (최적)
        excerpt:
          'Claude Code를 활용하여 AI 기반 블로그 자동화 시스템을 구축하는 방법을 단계별로 알아봅니다. automation과 AI 기술을 활용하세요.', // ~120자 (최적)
        content: Array(1500)
          .fill(
            'AI 블로그 자동화 automation content word text paragraph sentence example'
          )
          .join(' '), // 1500+ 단어
        keywords: ['AI', '블로그', 'automation'],
      });

      expect(result.score).toBeGreaterThan(0);
      expect(result.maxScore).toBe(100);
      expect(result.details).toHaveLength(7); // 7 categories now (added 섹션 분포)

      // 각 카테고리 확인
      const categories = result.details.map((d) => d.category);
      expect(categories).toContain('제목 길이');
      expect(categories).toContain('요약 길이');
      expect(categories).toContain('콘텐츠 길이');
      expect(categories).toContain('키워드 밀도');
      expect(categories).toContain('섹션 분포'); // NEW category
      expect(categories).toContain('제목 키워드');
      expect(categories).toContain('요약 키워드');
    });

    it('should give high score for optimal content', () => {
      // Create content with proper sections for good distribution
      const sectionContent = Array(200).fill('AI automation 블로그 content word').join(' ');
      const contentWithSections = `Introduction with AI automation 블로그

## Section 1
${sectionContent}

## Section 2
More AI and automation content for 블로그

## Section 3
Additional content with automation and 블로그`;

      const result = calculateSeoScore({
        title: 'AI Automation Guide - 블로그 자동화', // 키워드 포함
        excerpt: 'AI와 automation으로 블로그를 자동화하는 완벽한 가이드입니다.', // 키워드 포함
        content: contentWithSections,
        keywords: ['AI', 'automation', '블로그'],
      });

      expect(result.score).toBeGreaterThan(50); // 적절한 점수 기대
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should calculate postLength and lengthFactor', () => {
      const shortContent = Array(400).fill('word').join('\n');
      const longContent = Array(1600).fill('word').join('\n');

      const shortResult = calculateSeoScore({
        title: 'Short Post',
        excerpt: 'Short excerpt',
        content: shortContent,
        keywords: ['word'],
      });

      const longResult = calculateSeoScore({
        title: 'Long Post',
        excerpt: 'Long excerpt',
        content: longContent,
        keywords: ['word'],
      });

      // Short post should have lengthFactor 1.0
      expect(shortResult.postLength).toBe(400);
      expect(shortResult.lengthFactor).toBe(1.0);

      // Long post should have lengthFactor 0.7
      expect(longResult.postLength).toBe(1600);
      expect(longResult.lengthFactor).toBe(0.7);
    });

    it('should score section distribution correctly', () => {
      // Content with keywords well-distributed across sections
      const wellDistributed = `AI introduction

## Section 1
AI and automation here

## Section 2
More AI content

## Section 3
Automation content`;

      // Content with keywords only in one section
      const poorlyDistributed = `Introduction

## Section 1
All the AI automation keywords here

## Section 2
No keywords

## Section 3
No keywords either`;

      const goodResult = calculateSeoScore({
        title: 'Test',
        excerpt: 'Test',
        content: wellDistributed,
        keywords: ['AI', 'automation'],
      });

      const badResult = calculateSeoScore({
        title: 'Test',
        excerpt: 'Test',
        content: poorlyDistributed,
        keywords: ['AI', 'automation'],
      });

      // Find section distribution scores
      const goodDistScore = goodResult.details.find((d) => d.category === '섹션 분포')?.score || 0;
      const badDistScore = badResult.details.find((d) => d.category === '섹션 분포')?.score || 0;

      // Well-distributed should score higher
      expect(goodDistScore).toBeGreaterThan(badDistScore);
      expect(goodDistScore).toBe(20); // Full score (75% sections have keywords)
    });
  });

  describe('generateSeoData', () => {
    it('should generate complete SEO data', () => {
      const seoData = generateSeoData({
        title: 'AI 블로그 자동화',
        excerpt: 'Claude Code를 활용한 블로그 자동화',
        content: 'AI 기술을 활용하여 블로그를 자동화합니다.',
        keywords: ['AI', 'automation', 'blog'],
        url: 'https://example.com/post',
        imageUrl: 'https://example.com/image.jpg',
        siteName: 'My Blog',
        language: 'ko',
      });

      expect(seoData.meta).toBeDefined();
      expect(seoData.openGraph).toBeDefined();
      expect(seoData.twitterCard).toBeDefined();
      expect(seoData.slug).toBeDefined();

      expect(seoData.meta.title).toBe('AI 블로그 자동화');
      expect(seoData.openGraph['og:title']).toBe('AI 블로그 자동화');
      expect(seoData.twitterCard['twitter:title']).toBe('AI 블로그 자동화');
      expect(seoData.slug).toContain('ai');
    });
  });
});
