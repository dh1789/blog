/**
 * 마크다운 파싱 및 HTML 변환
 */

import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import path from 'path';
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

/**
 * 마크다운 콘텐츠에서 이미지 경로 추출
 *
 * @param content - 마크다운 콘텐츠
 * @returns 로컬 이미지 경로 배열 (외부 URL 제외)
 *
 * @example
 * ```typescript
 * const paths = parseImagePaths('![alt](./images/test.png) ![ext](https://example.com/img.png)');
 * // ['./images/test.png']
 * ```
 */
export function parseImagePaths(content: string): string[] {
  const imagePaths: string[] = [];

  // 마크다운 이미지 패턴: ![alt text](path)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  // HTML img 태그 패턴: <img src="path">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;

  // 마크다운 이미지 추출
  let match;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const imagePath = match[2].trim();

    // 외부 URL 제외 (http:// 또는 https://로 시작)
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      imagePaths.push(imagePath);
    }
  }

  // HTML 이미지 추출
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const imagePath = match[1].trim();

    // 외부 URL 제외
    if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
      // 중복 제거
      if (!imagePaths.includes(imagePath)) {
        imagePaths.push(imagePath);
      }
    }
  }

  return imagePaths;
}

/**
 * 마크다운 콘텐츠의 이미지 경로를 WordPress URL로 변환
 *
 * @param content - 마크다운 콘텐츠
 * @param imageUrlMap - 로컬 경로 → WordPress URL 매핑
 * @returns 변환된 마크다운 콘텐츠
 *
 * @example
 * ```typescript
 * const map = new Map([['./images/test.png', 'https://example.com/wp-content/uploads/test.png']]);
 * const result = replaceImageUrls('![alt](./images/test.png)', map);
 * // '![alt](https://example.com/wp-content/uploads/test.png)'
 * ```
 */
export function replaceImageUrls(
  content: string,
  imageUrlMap: Map<string, string>
): string {
  let result = content;

  // 각 이미지 경로를 WordPress URL로 변환
  imageUrlMap.forEach((wordpressUrl, localPath) => {
    // 마크다운 이미지 패턴 변환: ![alt](localPath) → ![alt](wordpressUrl)
    const markdownRegex = new RegExp(
      `!\\[([^\\]]*)\\]\\(${escapeRegExp(localPath)}\\)`,
      'g'
    );
    result = result.replace(markdownRegex, `![$1](${wordpressUrl})`);

    // HTML img 태그 변환: <img src="localPath"> → <img src="wordpressUrl">
    const htmlRegex = new RegExp(
      `(<img[^>]+src=["'])${escapeRegExp(localPath)}(["'])`,
      'g'
    );
    result = result.replace(htmlRegex, `$1${wordpressUrl}$2`);
  });

  return result;
}

/**
 * 절대 경로로 변환
 *
 * @param basePath - 마크다운 파일의 디렉토리 경로
 * @param relativePath - 상대 이미지 경로
 * @returns 절대 경로
 *
 * @example
 * ```typescript
 * const abs = resolveImagePath('/Users/me/blog/posts/ko', './images/test.png');
 * // '/Users/me/blog/posts/ko/images/test.png'
 * ```
 */
export function resolveImagePath(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath);
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
