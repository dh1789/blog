/**
 * 공유 타입 정의
 */

export interface WordPressConfig {
  url: string;
  username: string;
  password: string;
}

export interface PostMetadata {
  title: string;
  slug?: string;
  excerpt?: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  categories?: string[];
  tags?: string[];
  language: 'ko' | 'en';
  featuredImage?: string;
}

export interface AdConfig {
  clientId: string;
  slotId: string;
  positions: AdPosition[];
}

export type AdPosition =
  | 'top'
  | 'after-first-paragraph'
  | 'after-first-h2'
  | 'middle'
  | 'bottom';

export interface PublishOptions {
  file: string;
  status?: 'publish' | 'draft';
  language?: 'ko' | 'en';
  dryRun?: boolean;
}

/**
 * 프롬프트 템플릿 변수
 */
export interface TemplateVariables {
  TOPIC: string;
  KEYWORDS: string;
  WORDS?: string;
  TITLE?: string;
  CATEGORIES?: string;
  TAGS?: string;
  LANGUAGE?: string;
  [key: string]: string | undefined;
}

/**
 * 템플릿 로드 옵션
 */
export interface TemplateOptions {
  name: string;
  variables: TemplateVariables;
}

/**
 * 템플릿 객체
 */
export interface Template {
  name: string;
  content: string;
  variables: string[];
}

/**
 * Claude Code 실행 옵션
 */
export interface ClaudeOptions {
  prompt: string;
  timeout?: number;
  model?: string;
}

/**
 * Claude Code 응답
 */
export interface ClaudeResponse {
  success: boolean;
  content: string;
  error?: string;
  executionTime?: number;
}

/**
 * 초안 생성 옵션
 */
export interface DraftCreateOptions {
  topic: string;
  keywords: string;
  words?: number;
  template?: string;
  language?: 'ko' | 'en';
  style?: string;
}

/**
 * 초안 수정 옵션
 */
export interface DraftRefineOptions {
  file: string;
  instruction: string;
  timeout?: number;
}
