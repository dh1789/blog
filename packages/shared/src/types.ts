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
