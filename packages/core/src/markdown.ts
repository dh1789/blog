/**
 * 마크다운 파싱 및 HTML 변환
 */

import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { PostMetadata } from '@blog/shared';
import { PostMetadataSchema } from '@blog/shared';

export interface ParsedPost {
  metadata: PostMetadata;
  content: string;
  htmlContent: string;
}

export async function parseMarkdownFile(fileContent: string): Promise<ParsedPost> {
  const { data, content } = matter(fileContent);

  const metadata = PostMetadataSchema.parse(data);

  const htmlContent = await convertMarkdownToHtml(content);

  return {
    metadata,
    content,
    htmlContent,
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
