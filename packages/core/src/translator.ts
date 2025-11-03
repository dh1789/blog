/**
 * AI 기반 블로그 포스트 번역기
 * Claude API를 사용하여 한국어 포스트를 영어로 번역하고 SEO 최적화
 */

import type { PostMetadata } from '@blog/shared';

export interface TranslationResult {
  translatedMetadata: PostMetadata;
  translatedContent: string;
  seoReport: SEOReport;
}

export interface SEOReport {
  titleOptimized: boolean;
  excerptLength: number;
  excerptValid: boolean;
  keywordDensity: KeywordDensityResult[];
  suggestions: string[];
}

export interface KeywordDensityResult {
  keyword: string;
  count: number;
  density: number;
  status: 'ok' | 'warning' | 'error';
}

export interface TranslationOptions {
  targetLang?: string;
  apiKey?: string;
  optimizeSeo?: boolean;
  preserveCodeBlocks?: boolean;
}

/**
 * Claude API를 사용하여 포스트 번역
 */
export async function translatePost(
  content: string,
  metadata: PostMetadata,
  options: TranslationOptions = {}
): Promise<TranslationResult> {
  const {
    targetLang = 'en',
    optimizeSeo = true,
    preserveCodeBlocks = true
  } = options;

  // TODO: Anthropic SDK 통합 필요
  // 현재는 패턴 기반 기본 번역으로 구현
  const translatedMetadata = await translateMetadata(metadata, targetLang);
  const translatedContent = await translateContent(
    content,
    metadata,
    translatedMetadata,
    { targetLang, preserveCodeBlocks }
  );

  // SEO 최적화
  if (optimizeSeo) {
    optimizeExcerpt(translatedMetadata);
    await optimizeKeywordDensity(translatedContent, translatedMetadata);
  }

  // SEO 리포트 생성
  const seoReport = generateSEOReport(translatedContent, translatedMetadata);

  return {
    translatedMetadata,
    translatedContent,
    seoReport
  };
}

/**
 * 메타데이터 번역 (제목, 발췌문, 카테고리, 태그)
 */
async function translateMetadata(
  metadata: PostMetadata,
  targetLang: string
): Promise<PostMetadata> {
  // SEO 최적화된 제목 생성
  const translatedTitle = generateSEOTitle(metadata.title);

  // 발췌문 번역 및 최적화
  const translatedExcerpt = generateSEOExcerpt(metadata.excerpt || '', metadata.title);

  // 카테고리 매핑
  const translatedCategories = translateCategories(metadata.categories || []);

  // 태그 최적화
  const translatedTags = optimizeTags(metadata.tags || []);

  // Slug 생성
  const translatedSlug = generateEnglishSlug(translatedTitle);

  return {
    ...metadata,
    title: translatedTitle,
    excerpt: translatedExcerpt,
    slug: translatedSlug,
    categories: translatedCategories,
    tags: translatedTags,
    language: targetLang as 'ko' | 'en'
  };
}

/**
 * SEO 최적화된 영어 제목 생성
 */
function generateSEOTitle(koreanTitle: string): string {
  // 패턴 기반 제목 생성
  // TODO: Claude API로 더 정교한 번역

  const patterns = {
    'cli 도구 개발': 'How to Build CLI Tools from Scratch: Complete Guide',
    'rest api': 'Automate WordPress Publishing with REST API',
    'ai 컨텐츠': 'AI-Powered Content Pipeline',
    '자동화': 'Complete Automation Guide',
    '입문': 'Complete Guide for Beginners'
  };

  let translated = koreanTitle;

  for (const [kr, en] of Object.entries(patterns)) {
    if (koreanTitle.toLowerCase().includes(kr)) {
      translated = en;
      break;
    }
  }

  return translated;
}

/**
 * SEO 최적화된 발췌문 생성 (최대 300자)
 */
function generateSEOExcerpt(_koreanExcerpt: string, _koreanTitle: string): string {
  // 기본 템플릿
  const template = `Build a fully automated system with modern tools and best practices. Step-by-step production-ready tutorial with TypeScript and comprehensive examples.`;

  // TODO: Claude API로 더 정교한 번역
  // 현재는 기본 템플릿 반환
  return template.substring(0, 300);
}

/**
 * 카테고리 번역
 */
function translateCategories(categories: string[]): string[] {
  const categoryMap: Record<string, string> = {
    '개발 도구': 'Development Tools',
    '자동화': 'Automation',
    '워드프레스': 'WordPress',
    '인공지능': 'AI',
    'Node.js': 'Node.js',
    '프로그래밍': 'Programming',
    '웹 개발': 'Web Development'
  };

  return categories.map(cat => categoryMap[cat] || cat);
}

/**
 * 태그 최적화 (SEO 친화적 영어 태그)
 */
function optimizeTags(tags: string[]): string[] {
  const tagMap: Record<string, string> = {
    'CLI': 'CLI',
    'Node.js': 'Node.js',
    'TypeScript': 'TypeScript',
    '자동화': 'Automation',
    '개발도구': 'Development Tools',
    'REST API': 'REST API',
    '워드프레스': 'WordPress',
    'AI': 'AI',
    '컨텐츠': 'Content',
    '블로그': 'Blog',
    'SEO': 'SEO'
  };

  return tags
    .map(tag => tagMap[tag] || tag)
    .filter((tag, index, self) => self.indexOf(tag) === index) // 중복 제거
    .slice(0, 10); // 최대 10개
}

/**
 * 영어 Slug 생성
 */
function generateEnglishSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * 콘텐츠 본문 번역
 */
async function translateContent(
  content: string,
  originalMetadata: PostMetadata,
  _translatedMetadata: PostMetadata,
  _options: { targetLang?: string; preserveCodeBlocks: boolean }
): Promise<string> {
  // TODO: Claude API 통합
  // 현재는 기본 구조만 반환

  // 번역 디스클레이머 추가
  const disclaimer = generateTranslationDisclaimer(
    originalMetadata.slug || 'original-post',
    originalMetadata.language || 'ko'
  );

  // TODO: 실제 본문 번역
  // 현재는 원본 반환 (임시)
  return `${disclaimer}\n\n${content}`;
}

/**
 * 번역 디스클레이머 생성
 */
function generateTranslationDisclaimer(
  originalSlug: string,
  sourceLang: string = 'ko'
): string {
  const langMap: Record<string, string> = {
    ko: 'Korean',
    en: 'English'
  };

  return `> **🌐 Translation**: Translated from [${langMap[sourceLang]}](/${sourceLang}/${originalSlug}).`;
}

/**
 * Excerpt 길이 최적화 (최대 300자)
 */
function optimizeExcerpt(metadata: PostMetadata): void {
  if (!metadata.excerpt) return;

  const maxLength = 300;
  if (metadata.excerpt.length <= maxLength) return;

  // 불필요한 단어 제거
  const fillerWords = ['Learn how to', 'modern', 'various', 'multiple', 'many'];
  let optimized = metadata.excerpt;

  for (const filler of fillerWords) {
    if (optimized.length <= maxLength) break;
    optimized = optimized.replace(new RegExp(filler, 'gi'), '').replace(/\s+/g, ' ').trim();
  }

  // 여전히 길면 마지막 문장 제거
  if (optimized.length > maxLength) {
    const sentences = optimized.split('. ');
    optimized = sentences.slice(0, -1).join('. ') + '.';
  }

  metadata.excerpt = optimized.substring(0, maxLength).trim();
}

/**
 * 키워드 밀도 최적화
 */
async function optimizeKeywordDensity(
  content: string,
  metadata: PostMetadata
): Promise<void> {
  // TODO: 키워드 밀도 분석 및 최적화
  // 현재는 분석만 수행
  const density = calculateKeywordDensity(content, metadata.tags || []);

  // 0.5-2.5% 범위 벗어나는 키워드 식별
  const issues = density.filter(d => d.status !== 'ok');

  if (issues.length > 0) {
    // TODO: 콘텐츠 수정으로 밀도 최적화
  }
}

/**
 * 키워드 밀도 계산
 */
function calculateKeywordDensity(
  content: string,
  keywords: string[]
): KeywordDensityResult[] {
  const text = content.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  return keywords.map(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const density = (count / wordCount) * 100;

    let status: 'ok' | 'warning' | 'error' = 'ok';
    if (density < 0.5) status = 'warning';
    if (density > 2.5) status = 'error';

    return { keyword, count, density, status };
  });
}

/**
 * SEO 리포트 생성
 */
function generateSEOReport(
  content: string,
  metadata: PostMetadata
): SEOReport {
  const excerptLength = metadata.excerpt?.length || 0;
  const excerptValid = excerptLength >= 10 && excerptLength <= 300;

  const keywordDensity = calculateKeywordDensity(
    content,
    metadata.tags || []
  );

  const suggestions: string[] = [];

  // Excerpt 검증
  if (!excerptValid) {
    if (excerptLength < 10) {
      suggestions.push('Excerpt too short (minimum 10 characters)');
    }
    if (excerptLength > 300) {
      suggestions.push('Excerpt too long (maximum 300 characters)');
    }
  }

  // 키워드 밀도 검증
  keywordDensity.forEach(kd => {
    if (kd.status === 'warning') {
      suggestions.push(`Keyword "${kd.keyword}" density ${kd.density.toFixed(2)}% is below recommended 0.5%`);
    }
    if (kd.status === 'error') {
      suggestions.push(`Keyword "${kd.keyword}" density ${kd.density.toFixed(2)}% exceeds maximum 2.5%`);
    }
  });

  // 제목 최적화 검증
  const titleOptimized = metadata.title.length > 20 && metadata.title.length <= 200;
  if (!titleOptimized) {
    suggestions.push('Title should be between 20-200 characters for optimal SEO');
  }

  return {
    titleOptimized,
    excerptLength,
    excerptValid,
    keywordDensity,
    suggestions
  };
}

/**
 * 번역 검증
 */
export function validateTranslation(
  original: PostMetadata,
  translation: PostMetadata,
  content: string
): { passed: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 메타데이터 검증
  if (!translation.title || translation.title.length > 200) {
    errors.push('Title must be 1-200 characters');
  }

  if (!translation.excerpt || translation.excerpt.length > 300 || translation.excerpt.length < 10) {
    errors.push('Excerpt must be 10-300 characters');
  }

  if (translation.language !== 'en') {
    errors.push('Language must be "en" for English translations');
  }

  if (!translation.categories || translation.categories.length < 1 || translation.categories.length > 5) {
    errors.push('Categories must be 1-5 items');
  }

  if (!translation.tags || translation.tags.length < 3 || translation.tags.length > 10) {
    errors.push('Tags must be 3-10 items');
  }

  // 콘텐츠 검증
  if (!content.includes('🌐 Translation')) {
    warnings.push('Translation disclaimer missing');
  }

  // 코드 블록 보존 검증
  const codeBlockPattern = /```[\s\S]*?```/g;
  const originalCodeBlocks = (original.excerpt || '').match(codeBlockPattern) || [];
  const translatedCodeBlocks = content.match(codeBlockPattern) || [];

  if (originalCodeBlocks.length !== translatedCodeBlocks.length) {
    warnings.push(`Code block count mismatch: ${originalCodeBlocks.length} → ${translatedCodeBlocks.length}`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}
