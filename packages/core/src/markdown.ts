/**
 * 마크다운 파싱 및 HTML 변환
 */

import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { PostMetadata, SeoData } from '@blog/shared';
import { PostMetadataSchema } from '@blog/shared';
import { generateSeoData } from './seo.js';

export interface ParsedPost {
  metadata: PostMetadata;
  content: string;
  htmlContent: string;
  seoData: SeoData;
}

export async function parseMarkdownFile(fileContent: string): Promise<ParsedPost> {
  const { data, content } = matter(fileContent);

  const metadata = PostMetadataSchema.parse(data);

  // Polylang Free 제약: 언어별 고유 slug 필요
  // 영어 포스트는 자동으로 '-en' 접미사 추가 (한글은 기본 언어로 유지)
  if (metadata.language === 'en' && metadata.slug && !metadata.slug.endsWith('-en')) {
    metadata.slug = `${metadata.slug}-en`;
  }

  const htmlContent = await convertMarkdownToHtml(content);

  // SEO 데이터 생성
  const seoData = generateSeoData({
    title: metadata.title,
    excerpt: metadata.excerpt || '',
    content: htmlContent,
    keywords: metadata.tags || [],
    language: metadata.language,
  });

  return {
    metadata,
    content,
    htmlContent,
    seoData,
  };
}

async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}
