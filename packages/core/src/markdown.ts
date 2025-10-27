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
