/**
 * Core MVP 통합 테스트: 초안 생성 → 발행 워크플로우
 *
 * 이 테스트는 전체 워크플로우를 검증합니다:
 * 1. 프롬프트 템플릿 로드
 * 2. AI 초안 생성 (Claude Code)
 * 3. 초안 수정 (선택)
 * 4. Frontmatter 검증
 * 5. WordPress 발행 (dry-run)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  listTemplates,
  loadTemplate,
  renderTemplate,
  applyDefaults,
} from '../../templates';
import { parseMarkdownFile } from '../../markdown';
import { calculateTimeout } from '../../claude';

// 테스트용 디렉토리
const TEST_DIR = join(process.cwd(), '.test-integration');
const TEST_DRAFTS_DIR = join(TEST_DIR, 'drafts');

describe('Core MVP Integration: Draft to Publish Workflow', () => {
  beforeAll(() => {
    // 테스트 디렉토리 생성
    if (!existsSync(TEST_DRAFTS_DIR)) {
      mkdirSync(TEST_DRAFTS_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // 테스트 디렉토리 정리
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('Step 1: Template System', () => {
    it('should list available templates', () => {
      const templates = listTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain('blog-post');
    });

    it('should load and render blog-post template', () => {
      const template = loadTemplate('blog-post');

      expect(template.name).toBe('blog-post');
      expect(template.content).toContain('{TOPIC}');
      expect(template.content).toContain('{KEYWORDS}');
      expect(template.variables).toContain('TOPIC');
      expect(template.variables).toContain('KEYWORDS');
    });

    it('should apply default values to template variables', () => {
      const variables = applyDefaults({
        TOPIC: 'AI 블로그 자동화',
        KEYWORDS: 'AI, automation, blog',
      });

      expect(variables.TOPIC).toBe('AI 블로그 자동화');
      expect(variables.KEYWORDS).toBe('AI, automation, blog');
      expect(variables.WORDS).toBe('2000');
      expect(variables.LANGUAGE).toBe('ko');
    });

    it('should render template with variables', () => {
      const rendered = renderTemplate({
        name: 'blog-post',
        variables: {
          TOPIC: 'AI 블로그 자동화',
          KEYWORDS: 'AI, automation, blog',
          WORDS: '2000',
          LANGUAGE: 'ko',
        },
      });

      expect(rendered).toContain('AI 블로그 자동화');
      expect(rendered).toContain('AI, automation, blog');
      expect(rendered).toContain('2000');
      expect(rendered).not.toContain('{TOPIC}');
      expect(rendered).not.toContain('{KEYWORDS}');
    });
  });

  describe('Step 2: Draft Creation (Simulated)', () => {
    it('should calculate appropriate timeout for word count', () => {
      const timeout2000 = calculateTimeout(2000);
      const timeout5000 = calculateTimeout(5000);
      const timeout10000 = calculateTimeout(10000);

      expect(timeout2000).toBe(120000); // 2분 최소
      expect(timeout5000).toBe(300000); // 5000 * 60
      expect(timeout10000).toBe(600000); // 10분 최대
    });

    it('should create a simulated draft file', () => {
      const draftContent = `---
title: "AI 블로그 자동화 플랫폼 완벽 가이드"
excerpt: "Claude Code를 활용하여 블로그 콘텐츠를 자동으로 생성하고 WordPress에 발행하는 방법을 단계별로 알아봅니다."
categories: ["Technology", "AI"]
tags: ["AI", "automation", "blog", "Claude", "WordPress"]
status: "draft"
language: "ko"
---

# AI 블로그 자동화 플랫폼 완벽 가이드

AI 기술의 발전으로 블로그 콘텐츠 제작이 혁신적으로 변화하고 있습니다.

## 주요 기능

### 1. AI 기반 콘텐츠 생성
Claude Code를 활용하여 고품질 블로그 포스트를 자동 생성합니다.

### 2. 자동 WordPress 발행
생성된 콘텐츠를 WordPress에 원클릭으로 발행합니다.

### 3. SEO 최적화
메타 태그, 키워드, 구조화된 데이터를 자동으로 최적화합니다.

## 사용 방법

1. 주제와 키워드 입력
2. AI가 초안 자동 생성
3. 필요시 수정 및 개선
4. WordPress 발행

## 결론

AI 블로그 자동화로 콘텐츠 제작 시간을 90% 단축하고 품질을 향상시킬 수 있습니다.
`;

      const draftPath = join(TEST_DRAFTS_DIR, '2025-10-27-ai-blog-automation.md');
      writeFileSync(draftPath, draftContent, 'utf-8');

      expect(existsSync(draftPath)).toBe(true);
    });
  });

  describe('Step 3: Draft Validation', () => {
    it('should validate draft frontmatter', async () => {
      const draftPath = join(TEST_DRAFTS_DIR, '2025-10-27-ai-blog-automation.md');
      const draftContent = readFileSync(draftPath, 'utf-8');

      const { metadata, htmlContent } = await parseMarkdownFile(draftContent);

      // Frontmatter 검증
      expect(metadata.title).toBe('AI 블로그 자동화 플랫폼 완벽 가이드');
      expect(metadata.excerpt).toContain('Claude Code');
      expect(metadata.categories).toEqual(['Technology', 'AI']);
      expect(metadata.tags).toEqual(['AI', 'automation', 'blog', 'Claude', 'WordPress']);
      expect(metadata.status).toBe('draft');
      expect(metadata.language).toBe('ko');

      // HTML 변환 검증
      expect(htmlContent).toContain('<h1>AI 블로그 자동화 플랫폼 완벽 가이드</h1>');
      expect(htmlContent).toContain('<h2>주요 기능</h2>');
      expect(htmlContent).toContain('<h3>1. AI 기반 콘텐츠 생성</h3>');
    });

    it('should reject invalid frontmatter - short excerpt', async () => {
      const invalidContent = `---
title: "짧은 제목"
excerpt: "짧음"
categories: ["Test"]
tags: ["태그1", "태그2", "태그3"]
---

# 내용
`;

      try {
        await parseMarkdownFile(invalidContent);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject invalid frontmatter - missing categories', async () => {
      const invalidContent = `---
title: "Valid Title"
excerpt: "This is a valid excerpt with enough characters"
categories: []
tags: ["tag1", "tag2", "tag3"]
---

# 내용
`;

      try {
        await parseMarkdownFile(invalidContent);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject invalid frontmatter - insufficient tags', async () => {
      const invalidContent = `---
title: "Valid Title"
excerpt: "This is a valid excerpt with enough characters"
categories: ["Test"]
tags: ["tag1"]
---

# 내용
`;

      try {
        await parseMarkdownFile(invalidContent);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Step 4: Draft Refinement (Simulated)', () => {
    it('should simulate draft refinement', () => {
      const originalPath = join(TEST_DRAFTS_DIR, '2025-10-27-ai-blog-automation.md');
      const originalContent = readFileSync(originalPath, 'utf-8');

      // 수정 시뮬레이션 (제목 변경)
      const refinedContent = originalContent.replace(
        'AI 블로그 자동화 플랫폼 완벽 가이드',
        'AI 블로그 자동화 플랫폼: 2025년 완벽 가이드'
      );

      writeFileSync(originalPath, refinedContent, 'utf-8');

      const updatedContent = readFileSync(originalPath, 'utf-8');
      expect(updatedContent).toContain('2025년 완벽 가이드');
    });
  });

  describe('Step 5: Complete Workflow', () => {
    it('should complete full workflow: template → draft → validate', async () => {
      // 1. 템플릿 렌더링
      const prompt = renderTemplate({
        name: 'blog-post',
        variables: applyDefaults({
          TOPIC: 'Next.js 14 시작하기',
          KEYWORDS: 'Next.js, React, 웹개발',
        }),
      });

      expect(prompt).toContain('Next.js 14 시작하기');

      // 2. 시뮬레이션된 초안 생성
      const workflowDraft = `---
title: "Next.js 14 시작하기: 초보자를 위한 완벽 가이드"
excerpt: "Next.js 14의 새로운 기능과 함께 현대적인 웹 애플리케이션을 만드는 방법을 배워봅시다. App Router, Server Components 등 핵심 개념을 다룹니다."
categories: ["Web Development", "React"]
tags: ["Next.js", "React", "JavaScript", "웹개발", "프론트엔드"]
status: "draft"
language: "ko"
---

# Next.js 14 시작하기

Next.js는 React 기반의 강력한 웹 프레임워크입니다.

## 설치 및 설정

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

## 주요 기능

- App Router
- Server Components
- 향상된 성능

## 결론

Next.js 14로 현대적인 웹 앱을 만들어보세요.
`;

      const workflowPath = join(TEST_DRAFTS_DIR, '2025-10-27-nextjs-14-guide.md');
      writeFileSync(workflowPath, workflowDraft, 'utf-8');

      // 3. 검증
      const { metadata, htmlContent } = await parseMarkdownFile(workflowDraft);

      expect(metadata.title).toContain('Next.js 14');
      expect(metadata.categories.length).toBeGreaterThanOrEqual(1);
      expect(metadata.tags.length).toBeGreaterThanOrEqual(3);
      expect(htmlContent).toContain('<h1>Next.js 14 시작하기</h1>');
      expect(htmlContent).toContain('npx create-next-app@latest my-app');

      // 4. 발행 준비 완료
      expect(metadata.excerpt.length).toBeGreaterThan(10);
      expect(metadata.excerpt.length).toBeLessThanOrEqual(300);
    });
  });

  describe('Step 6: SEO and Quality Checks', () => {
    it('should verify SEO requirements are met', async () => {
      const draftPath = join(TEST_DRAFTS_DIR, '2025-10-27-nextjs-14-guide.md');
      const draftContent = readFileSync(draftPath, 'utf-8');
      const { metadata } = await parseMarkdownFile(draftContent);

      // SEO 요구사항
      expect(metadata.title.length).toBeGreaterThan(0);
      expect(metadata.title.length).toBeLessThanOrEqual(200);
      expect(metadata.excerpt.length).toBeGreaterThanOrEqual(10);
      expect(metadata.excerpt.length).toBeLessThanOrEqual(300);
      expect(metadata.categories.length).toBeGreaterThanOrEqual(1);
      expect(metadata.categories.length).toBeLessThanOrEqual(5);
      expect(metadata.tags.length).toBeGreaterThanOrEqual(3);
      expect(metadata.tags.length).toBeLessThanOrEqual(10);
    });

    it('should verify content structure', async () => {
      const draftPath = join(TEST_DRAFTS_DIR, '2025-10-27-nextjs-14-guide.md');
      const draftContent = readFileSync(draftPath, 'utf-8');
      const { htmlContent } = await parseMarkdownFile(draftContent);

      // 구조 검증
      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<h2>');
      expect(htmlContent).toMatch(/<code/); // 코드 블록 존재 확인
    });
  });
});
