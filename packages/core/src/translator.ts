/**
 * AI 기반 블로그 포스트 번역기
 * Claude Code를 사용하여 한국어 포스트를 영어로 번역하고 SEO 최적화
 */

import type { PostMetadata } from '@blog/shared';
import { executeClaude, calculateTimeout } from './claude.js';

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

  // 메타데이터 번역 (제목, excerpt, 카테고리, 태그)
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
  // SEO 최적화된 제목 생성 (async)
  const translatedTitle = await generateSEOTitle(metadata.title);

  // 발췌문 번역 및 최적화 (async)
  const translatedExcerpt = await generateSEOExcerpt(metadata.excerpt || '', metadata.title);

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
async function generateSEOTitle(koreanTitle: string): Promise<string> {
  const prompt = `You are an expert SEO copywriter specializing in technical blog titles.

**Task:** Create an SEO-optimized English title for a technical blog post.

**Original Korean Title:**
${koreanTitle}

**SEO Title Requirements:**
1. **Length**: Maximum 60 characters (critical for search results)
2. **Keywords**: Include primary technical keywords naturally
3. **SEO Patterns**: Use proven patterns like:
   - "How to [Action]: Complete Guide"
   - "Step-by-Step Guide to [Topic]"
   - "[Number] Ways to [Action]"
   - "Complete Guide to [Topic]"
   - "[Topic] Tutorial for Beginners"
4. **Compelling**: Make it click-worthy while staying professional
5. **Clarity**: Clearly indicate what the reader will learn
6. **Technical Accuracy**: Use correct technical terminology

**Output Format:**
Output ONLY the English title, no quotes, no explanation.

**Examples:**
- Korean: "WordPress REST API로 블로그 자동화하기"
  English: "How to Automate WordPress with REST API: Complete Guide"
- Korean: "TypeScript로 CLI 도구 만들기 입문"
  English: "Building CLI Tools with TypeScript: Beginner's Guide"

**Generate the SEO-optimized English title:**`;

  try {
    const response = await executeClaude({
      prompt,
      timeout: calculateTimeout(50), // 제목은 짧으므로 짧은 타임아웃
    });

    if (!response.success) {
      // 실패 시 폴백: 기본 번역
      console.warn(`SEO title generation failed: ${response.error}. Using fallback.`);
      return koreanTitle;
    }

    const title = response.content.trim();

    // 60자 초과 시 경고 (하지만 사용)
    if (title.length > 60) {
      console.warn(`Generated title exceeds 60 characters (${title.length}): "${title}"`);
    }

    return title;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate SEO title: ${errorMessage}`);
    // 에러 시 폴백: 원본 반환
    return koreanTitle;
  }
}

/**
 * SEO 최적화된 발췌문 생성 (최대 300자)
 */
async function generateSEOExcerpt(koreanExcerpt: string, koreanTitle: string): Promise<string> {
  const prompt = `You are an expert SEO copywriter specializing in technical blog descriptions.

**Task:** Create an SEO-optimized English excerpt (description) for a technical blog post.

**Original Korean Title:**
${koreanTitle}

**Original Korean Excerpt:**
${koreanExcerpt}

**SEO Excerpt Requirements:**
1. **Length**: MAXIMUM 300 characters (CRITICAL - WordPress limit)
2. **SEO Optimization**:
   - Include primary keywords naturally
   - Front-load important information
   - Use action words and benefits
3. **Compelling**:
   - Hook readers in the first sentence
   - Clearly state the value proposition
   - Include a subtle call-to-action
4. **Professional Tone**: Technical but accessible
5. **Clarity**: Be specific about what readers will learn or achieve

**Output Format:**
Output ONLY the English excerpt text, no quotes, no explanation.
MUST be 300 characters or less.

**Example:**
- Korean Title: "WordPress REST API로 블로그 자동화하기"
  Korean Excerpt: "CLI 도구를 만들어 마크다운을 자동으로 WordPress에 발행하는 방법을 배웁니다."
  English Excerpt: "Learn to build a CLI tool that automates WordPress publishing from Markdown. Step-by-step guide with TypeScript, REST API integration, and production-ready examples for efficient content workflows."

**Generate the SEO-optimized English excerpt (max 300 chars):**`;

  try {
    const response = await executeClaude({
      prompt,
      timeout: calculateTimeout(100), // excerpt는 짧으므로 짧은 타임아웃
    });

    if (!response.success) {
      console.warn(`SEO excerpt generation failed: ${response.error}. Using fallback.`);
      return koreanExcerpt.substring(0, 300);
    }

    let excerpt = response.content.trim();

    // 300자 초과 시 자르기 (CRITICAL)
    if (excerpt.length > 300) {
      console.warn(`Generated excerpt exceeds 300 characters (${excerpt.length}). Truncating.`);
      // 마지막 완전한 문장까지만 자르기
      excerpt = excerpt.substring(0, 297) + '...';
    }

    return excerpt;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to generate SEO excerpt: ${errorMessage}`);
    // 에러 시 폴백: 원본 300자까지
    return koreanExcerpt.substring(0, 300);
  }
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
  translatedMetadata: PostMetadata,
  options: { targetLang?: string; preserveCodeBlocks: boolean }
): Promise<string> {
  const targetLang = options.targetLang || 'en';
  const sourceLang = originalMetadata.language || 'ko';

  // SEO 키워드 추출 (tags 활용)
  const seoKeywords = originalMetadata.tags?.join(', ') || '';

  // 번역 프롬프트 작성
  const prompt = `You are a professional technical writer and translator specializing in software development content.

**Translation Task:**
Translate the following Korean blog post to English for an international tech audience.

**Core Translation Principles:**
1. **Natural Expression**: Translate for meaning and context, not word-for-word. Use idiomatic English.
2. **Cultural Adaptation**: Convert Korean cultural references and idioms to equivalent English expressions.
3. **Technical Accuracy**: Maintain precise technical terminology and concepts.
4. **Professional Tone**: Keep the professional yet approachable tone of the original.
5. **SEO Optimization**: Naturally incorporate SEO keywords throughout the translation.

**What to PRESERVE (DO NOT translate):**
- Brand names (e.g., WordPress, Avada, Google)
- Technical terms and APIs (e.g., REST API, CLI, npm, TypeScript)
- Code blocks (syntax, commands, variable names)
- File paths and URLs
- Command-line instructions
- Package names and version numbers

**What to TRANSLATE:**
- All explanatory text and descriptions
- Comments in code (translate but preserve code syntax)
- User-facing messages and instructions
- Section headings and titles

**SEO Requirements:**
- Primary keywords: ${seoKeywords}
- Naturally incorporate these keywords 3-5 times throughout the content
- Use keyword variations and related terms for natural flow
- Place keywords in headings, first paragraph, and conclusion when appropriate

**Format Requirements:**
- Output ONLY the translated markdown content
- Preserve all markdown formatting (headings, lists, code blocks, links)
- Maintain the same heading hierarchy (h1, h2, h3, etc.)
- Keep code blocks with their original language tags (\`\`\`typescript, \`\`\`bash, etc.)
- Preserve all image markdown syntax exactly as is

**Original Content to Translate:**

${content}

**Output the translated content in markdown format:**`;

  // 타임아웃 계산 (단어 수 기반)
  const wordCount = content.split(/\s+/).length;
  const timeout = calculateTimeout(wordCount);

  try {
    // Claude Code 실행
    const response = await executeClaude({
      prompt,
      timeout,
    });

    if (!response.success) {
      throw new Error(`Translation failed: ${response.error || 'Unknown error'}`);
    }

    // 번역된 콘텐츠
    let translatedContent = response.content.trim();

    // 번역 디스클레이머 추가
    const disclaimer = generateTranslationDisclaimer(
      originalMetadata.slug || 'original-post',
      sourceLang
    );

    return `${disclaimer}\n\n${translatedContent}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to translate content: ${errorMessage}`);
  }
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
