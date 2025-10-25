/**
 * 프롬프트 템플릿 시스템
 *
 * prompts/ 디렉토리에서 템플릿 파일을 로드하고
 * 변수를 치환하여 Claude Code에 전달할 프롬프트 생성
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Template, TemplateOptions, TemplateVariables } from '@blog/shared';

/**
 * 프로젝트 루트 디렉토리 찾기
 * pnpm workspace 환경에서 packages/core에서 실행 시 루트로 이동
 */
function findProjectRoot(): string {
  let currentPath = process.cwd();

  // package.json에 workspaces가 있으면 루트
  while (currentPath !== '/') {
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      // pnpm-workspace.yaml이 있거나 workspaces 필드가 있으면 루트
      if (existsSync(join(currentPath, 'pnpm-workspace.yaml')) || packageJson.workspaces) {
        return currentPath;
      }
    }
    currentPath = resolve(currentPath, '..');
  }

  // 못 찾으면 현재 디렉토리
  return process.cwd();
}

/**
 * 템플릿 디렉토리 경로
 */
export const TEMPLATES_DIR = resolve(findProjectRoot(), 'prompts');

/**
 * 템플릿 파일 확장자
 */
const TEMPLATE_EXTENSION = '.txt';

/**
 * 템플릿 변수 정규식 (예: {TOPIC}, {KEYWORDS})
 */
const VARIABLE_PATTERN = /\{([A-Z_]+)\}/g;

/**
 * 템플릿에서 변수 추출
 *
 * @param content 템플릿 내용
 * @returns 변수 이름 배열
 */
export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_PATTERN);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * 템플릿 파일 로드
 *
 * @param name 템플릿 이름 (확장자 제외)
 * @returns Template 객체
 * @throws 템플릿 파일이 없을 경우 에러
 */
export function loadTemplate(name: string): Template {
  const templatePath = join(TEMPLATES_DIR, `${name}${TEMPLATE_EXTENSION}`);

  if (!existsSync(templatePath)) {
    throw new Error(
      `Template not found: ${name}\n` +
      `Expected path: ${templatePath}\n` +
      `Available templates: ${listTemplates().join(', ')}`
    );
  }

  const content = readFileSync(templatePath, 'utf-8');
  const variables = extractVariables(content);

  return {
    name,
    content,
    variables,
  };
}

/**
 * 사용 가능한 템플릿 목록 반환
 *
 * @returns 템플릿 이름 배열
 */
export function listTemplates(): string[] {
  if (!existsSync(TEMPLATES_DIR)) {
    return [];
  }

  return readdirSync(TEMPLATES_DIR)
    .filter((file) => file.endsWith(TEMPLATE_EXTENSION))
    .map((file) => file.replace(TEMPLATE_EXTENSION, ''));
}

/**
 * 템플릿 렌더링 (변수 치환)
 *
 * @param options 템플릿 옵션 (이름, 변수)
 * @returns 렌더링된 프롬프트
 * @throws 필수 변수가 누락된 경우 에러
 */
export function renderTemplate(options: TemplateOptions): string {
  const template = loadTemplate(options.name);

  // 필수 변수 검증
  const missingVariables = template.variables.filter(
    (varName) => !options.variables[varName]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required template variables: ${missingVariables.join(', ')}\n` +
      `Template: ${options.name}\n` +
      `Required variables: ${template.variables.join(', ')}\n` +
      `Provided variables: ${Object.keys(options.variables).join(', ')}`
    );
  }

  // 변수 치환
  let rendered = template.content;

  for (const [key, value] of Object.entries(options.variables)) {
    if (value !== undefined) {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(pattern, value);
    }
  }

  return rendered;
}

/**
 * 기본 변수값 설정
 *
 * @param variables 사용자 제공 변수
 * @returns 기본값이 적용된 변수
 */
export function applyDefaults(variables: Partial<TemplateVariables>): TemplateVariables {
  return {
    TOPIC: variables.TOPIC || '',
    KEYWORDS: variables.KEYWORDS || '',
    WORDS: variables.WORDS || '2000',
    TITLE: variables.TITLE || variables.TOPIC || '',
    CATEGORIES: variables.CATEGORIES || '',
    TAGS: variables.TAGS || variables.KEYWORDS || '',
    LANGUAGE: variables.LANGUAGE || 'ko',
    ...variables,
  };
}

/**
 * 템플릿 검증
 *
 * @param name 템플릿 이름
 * @returns 유효한 템플릿 여부
 */
export function validateTemplate(name: string): boolean {
  try {
    const template = loadTemplate(name);
    return template.content.length > 0;
  } catch {
    return false;
  }
}
