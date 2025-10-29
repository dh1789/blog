/**
 * 프롬프트 템플릿 시스템 테스트
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  extractVariables,
  loadTemplate,
  listTemplates,
  renderTemplate,
  applyDefaults,
  validateTemplate,
} from './templates';

// 프로젝트 루트 찾기
function findProjectRoot(): string {
  let currentPath = process.cwd();

  while (currentPath !== '/') {
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8') as string);
      if (existsSync(join(currentPath, 'pnpm-workspace.yaml')) || (packageJson as any).workspaces) {
        return currentPath;
      }
    }
    currentPath = resolve(currentPath, '..');
  }
  return process.cwd();
}

// 테스트용 템플릿 디렉토리 (프로젝트 루트의 prompts)
const TEST_TEMPLATES_DIR = resolve(findProjectRoot(), 'prompts');

describe('Template System', () => {
  beforeAll(() => {
    // 테스트용 템플릿 디렉토리 생성
    if (!existsSync(TEST_TEMPLATES_DIR)) {
      mkdirSync(TEST_TEMPLATES_DIR, { recursive: true });
    }

    // 테스트용 템플릿 파일 생성
    writeFileSync(
      join(TEST_TEMPLATES_DIR, 'test-template.txt'),
      'Topic: {TOPIC}\nKeywords: {KEYWORDS}\nWords: {WORDS}'
    );

    writeFileSync(
      join(TEST_TEMPLATES_DIR, 'test-blog-post.txt'),
      `당신은 AI 활용 전문 블로거입니다.

주제: {TOPIC}
키워드: {KEYWORDS}
타겟 독자: AI 도구를 배우고 싶은 일반 사용자

요구사항:
- 길이: {WORDS} 단어
- 톤: 친근하고 실용적`
    );
  });

  afterAll(() => {
    // 테스트용 템플릿 파일만 삭제 (디렉토리는 유지)
    const testTemplate = join(TEST_TEMPLATES_DIR, 'test-template.txt');
    const testBlogPostTemplate = join(TEST_TEMPLATES_DIR, 'test-blog-post.txt');

    if (existsSync(testTemplate)) {
      rmSync(testTemplate);
    }
    if (existsSync(testBlogPostTemplate)) {
      rmSync(testBlogPostTemplate);
    }
  });

  describe('extractVariables', () => {
    it('should extract variables from template content', () => {
      const content = 'Hello {NAME}, your score is {SCORE}';
      const variables = extractVariables(content);

      expect(variables).toEqual(['NAME', 'SCORE']);
    });

    it('should handle multiple occurrences of same variable', () => {
      const content = '{NAME} and {NAME} again';
      const variables = extractVariables(content);

      expect(variables).toEqual(['NAME']);
    });

    it('should return empty array for no variables', () => {
      const content = 'No variables here';
      const variables = extractVariables(content);

      expect(variables).toEqual([]);
    });

    it('should only match uppercase variables', () => {
      const content = '{NAME} {name} {Name}';
      const variables = extractVariables(content);

      expect(variables).toEqual(['NAME']);
    });
  });

  describe('loadTemplate', () => {
    it('should load template from file', () => {
      const template = loadTemplate('test-template');

      expect(template.name).toBe('test-template');
      expect(template.content).toContain('Topic: {TOPIC}');
      expect(template.variables).toEqual(['TOPIC', 'KEYWORDS', 'WORDS']);
    });

    it('should throw error for non-existent template', () => {
      expect(() => loadTemplate('non-existent')).toThrow('Template not found');
    });
  });

  describe('listTemplates', () => {
    it('should list available templates', () => {
      const templates = listTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      expect(templates).toContain('test-template');
      expect(templates).toContain('blog-post');
    });
  });

  describe('renderTemplate', () => {
    it('should render template with variables', () => {
      const rendered = renderTemplate({
        name: 'test-template',
        variables: {
          TOPIC: 'AI Automation',
          KEYWORDS: 'AI, automation, tools',
          WORDS: '2000',
        },
      });

      expect(rendered).toContain('Topic: AI Automation');
      expect(rendered).toContain('Keywords: AI, automation, tools');
      expect(rendered).toContain('Words: 2000');
    });

    it('should throw error for missing required variables', () => {
      expect(() =>
        renderTemplate({
          name: 'test-template',
          variables: {
            TOPIC: 'AI Automation',
            KEYWORDS: 'AI, automation',
            // WORDS 누락
          },
        })
      ).toThrow('Missing required template variables');
    });
  });

  describe('applyDefaults', () => {
    it('should apply default values', () => {
      const variables = applyDefaults({
        TOPIC: 'Test Topic',
        KEYWORDS: 'test, keywords',
      });

      expect(variables.TOPIC).toBe('Test Topic');
      expect(variables.KEYWORDS).toBe('test, keywords');
      expect(variables.WORDS).toBe('2000');
      expect(variables.LANGUAGE).toBe('ko');
    });

    it('should not override provided values', () => {
      const variables = applyDefaults({
        TOPIC: 'Test Topic',
        KEYWORDS: 'test',
        WORDS: '3000',
        LANGUAGE: 'en',
      });

      expect(variables.WORDS).toBe('3000');
      expect(variables.LANGUAGE).toBe('en');
    });

    it('should use TOPIC as TITLE default', () => {
      const variables = applyDefaults({
        TOPIC: 'My Topic',
        KEYWORDS: 'test',
      });

      expect(variables.TITLE).toBe('My Topic');
    });

    it('should use KEYWORDS as TAGS default', () => {
      const variables = applyDefaults({
        TOPIC: 'Test',
        KEYWORDS: 'tag1, tag2',
      });

      expect(variables.TAGS).toBe('tag1, tag2');
    });
  });

  describe('validateTemplate', () => {
    it('should validate existing template', () => {
      expect(validateTemplate('test-template')).toBe(true);
    });

    it('should return false for non-existent template', () => {
      expect(validateTemplate('non-existent')).toBe(false);
    });
  });
});
