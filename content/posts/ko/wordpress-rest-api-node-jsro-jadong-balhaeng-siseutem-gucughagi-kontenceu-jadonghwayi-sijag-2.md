---
title: "WordPress REST API + Node.js로 자동 발행 시스템 구축하기: 콘텐츠 자동화의 시작"
slug: "wordpress-rest-api-node-jsro-jadong-balhaeng-siseutem-gucughagi-kontenceu-jadonghwayi-sijag-2"
excerpt: "WordPress REST API + Node.js로 블로그 자동 발행 시스템을 구축하는 완벽 가이드. TypeScript와 Node.js를 활용한 콘텐츠 자동화 방법을 배워보세요. 지금 바로 시작하세요!"
status: "publish"
categories:
  - "AI 자동화"
  - "Node.js"
  - "WordPress"
tags:
  - "AI 블로그 자동화"
  - "Node.js"
  - "TypeScript"
  - "WordPress REST API"
  - "콘텐츠 자동화"
language: "ko"
---

# WordPress REST API + Node.js로 자동 발행 시스템 구축하기

블로그를 운영하면서 매번 WordPress 관리자 페이지에 로그인해서 콘텐츠를 복사하고, 카테고리를 선택하고, 태그를 입력하고, 광고 코드를 삽입하는 반복 작업에 지치셨나요? 특히 여러 개의 블로그를 운영하거나 다국어 콘텐츠를 관리하는 경우, 이런 수작업은 시간 낭비일 뿐만 아니라 실수의 여지도 많습니다. Node.js와 WordPress REST API를 활용하면 이 모든 과정을 자동화할 수 있습니다.

저는 이 Node.js 기반 자동화 시스템을 구축한 후, 한국어/영어 블로그 2개를 운영하면서 일주일에 약 10시간을 절약할 수 있었습니다. 로컬에서 편하게 마크다운으로 작성하고 Git으로 버전 관리하며, Node.js CLI 명령 한 줄로 발행하는 워크플로우는 콘텐츠 제작에만 집중할 수 있게 해줍니다.

이 글에서는 WordPress REST API와 Node.js, TypeScript를 활용해 마크다운 파일을 WordPress 포스트로 자동 변환하고 발행하는 시스템을 처음부터 끝까지 구축하는 방법을 알려드립니다. 단순히 코드를 복사하는 수준을 넘어, 실제 프로덕션 환경에서 사용할 수 있는 안정적인 블로그 자동화 도구를 만들 수 있습니다.

**이 글을 읽고 나면:**

- WordPress REST API의 핵심 개념과 인증 방법을 이해하게 됩니다

- TypeScript로 타입 안전한 WordPress 클라이언트를 구축할 수 있습니다

- 마크다운을 HTML로 변환하고 광고 코드를 자동 삽입하는 방법을 배웁니다

- 명령줄에서 한 번의 명령으로 포스트를 발행하는 CLI 도구를 만들 수 있습니다

- 확장 가능한 모노레포 프로젝트 구조를 설계하는 방법을 습득합니다

## WordPress REST API가 게임 체인저인 이유

WordPress는 전 세계 웹사이트의 약 43%를 차지하는 압도적인 CMS입니다. 그런데 많은 사람들이 WordPress REST API라는 강력한 기능을 제대로 활용하지 못하고 있습니다.

### WordPress REST API란?

WordPress REST API는 WordPress 4.7 버전부터 코어에 통합된 기능으로, HTTP 요청을 통해 WordPress 사이트의 데이터를 프로그래밍 방식으로 조작할 수 있게 해줍니다. 쉽게 말해, 웹 브라우저 없이도 포스트를 작성하고, 카테고리를 관리하고, 미디어를 업로드할 수 있다는 뜻입니다.

**REST API의 핵심 이점:**

- **플랫폼 독립성**: 어떤 프로그래밍 언어로든 WordPress와 상호작용 가능

- **자동화**: 반복 작업을 스크립트로 자동화

- **통합**: 외부 시스템(CRM, 마케팅 툴 등)과 연동

- **헤드리스 CMS**: WordPress를 백엔드로만 사용하고 프론트엔드는 React/Vue 등으로 구축 가능

### 전통적 방법 vs REST API 방식

**전통적 방법 (수작업):**

- WordPress 관리자 페이지 로그인

- 포스트 작성 페이지 이동

- 에디터에서 콘텐츠 작성 또는 복사-붙여넣기

- 카테고리, 태그, Featured Image 설정

- 광고 코드 수동 삽입

- 발행 버튼 클릭

- 다른 블로그/언어가 있다면 반복

**REST API 방식:**

```bash
# 로컬에서 마크다운으로 편하게 작성
blog publish content/posts/ko/my-awesome-post.md

```

단 한 줄의 명령으로 모든 과정이 자동으로 처리됩니다. 이것이 REST API가 제공하는 진정한 가치입니다.

## 프로젝트 설계: 아키텍처 결정

본격적인 구현에 앞서, 확장 가능하고 유지보수가 쉬운 구조를 설계하는 것이 중요합니다.

### 기술 스택 선정

**왜 Node.js와 TypeScript인가?**

Node.js는 JavaScript 런타임으로, WordPress REST API가 반환하는 JSON 데이터를 자연스럽게 다룰 수 있습니다. TypeScript를 추가하면 다음과 같은 이점이 있습니다:

- **타입 안전성**: 컴파일 타임에 에러 발견

- **자동 완성**: IDE에서 API 자동 완성 지원

- **리팩토링**: 안전한 코드 변경

- **문서화**: 타입 자체가 문서 역할

**핵심 라이브러리:**

라이브러리
역할
선정 이유

`wpapi`
WordPress REST API 클라이언트
WordPress 전용으로 설계되어 인증과 엔드포인트 처리가 간편 (※ 2021년 이후 업데이트 중단, 안정적이지만 대안으로 axios + fetch 직접 사용 가능)

`gray-matter`
Frontmatter 파싱
마크다운 메타데이터 추출에 최적화

`unified` + `remark`
마크다운 → HTML 변환
플러그인 아키텍처로 커스터마이징 용이

`commander`
CLI 프레임워크
npm 생태계의 표준 CLI 도구

`zod`
런타임 타입 검증
TypeScript 타입과 런타임 검증 통합

### 모노레포 구조 설계

여러 패키지를 하나의 저장소에서 관리하는 모노레포 방식을 채택합니다. 이렇게 하면 코드 재사용과 의존성 관리가 편리합니다.

```
blog/
├── packages/
│   ├── cli/               # 사용자 인터페이스 (명령줄 도구)
│   ├── core/              # 핵심 비즈니스 로직
│   └── shared/            # 공유 타입 및 유틸리티
├── content/               # 마크다운 콘텐츠
│   ├── posts/
│   │   ├── ko/           # 한국어 포스트
│   │   └── en/           # 영어 포스트
│   └── templates/        # 포스트 템플릿
└── pnpm-workspace.yaml   # pnpm workspace 설정

```

> 
💡 **팁**: pnpm을 사용하면 npm이나 yarn보다 디스크 공간을 절약하고 설치 속도도 빠릅니다. 특히 모노레포 환경에서 workspace 기능이 강력합니다.

## 단계 1: 프로젝트 초기 설정

### pnpm workspace 설정

먼저 루트 디렉토리에 `pnpm-workspace.yaml` 파일을 생성합니다:

```yaml
packages:
  - 'packages/*'

```

루트 `package.json`:

```json
{
  "name": "blog-automation",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter '@blog/*' run build",
    "dev": "pnpm --filter @blog/cli dev",
    "typecheck": "pnpm -r run typecheck"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0"
  }
}

```

### TypeScript 설정

루트 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "exclude": ["node_modules", "dist"]
}

```

> 
⚠️ **주의**: `moduleResolution: "bundler"`는 TypeScript 5.0+에서 지원하며, 최신 번들러(tsup, vite 등)와 함께 사용할 때 모듈 해석 문제를 줄여줍니다.

## 단계 2: 공유 타입 정의 (packages/shared)

모든 패키지에서 사용할 타입과 유틸리티를 정의합니다.

`packages/shared/src/types.ts`:

```typescript
/**
 * WordPress 연결 설정
 */
export interface WordPressConfig {
  url: string;              // WordPress 사이트 URL
  username: string;         // 사용자 이름
  appPassword: string;      // Application Password
}

/**
 * 포스트 메타데이터 (frontmatter)
 */
export interface PostMetadata {
  title: string;            // 포스트 제목
  slug?: string;            // URL slug (선택사항)
  excerpt?: string;         // 포스트 요약
  status: 'publish' | 'draft' | 'pending' | 'private';
  categories?: string[];    // 카테고리 목록
  tags?: string[];          // 태그 목록
  language: 'ko' | 'en';    // 언어
  date?: string;            // 발행 날짜 (ISO 8601)
  featuredImage?: string;   // Featured Image 경로
}

/**
 * 광고 코드 삽입 위치
 */
export type AdPosition = 
  | 'top'                     // 콘텐츠 최상단
  | 'after-first-paragraph'   // 첫 문단 뒤
  | 'after-first-h2'          // 첫 번째 H2 제목 뒤
  | 'middle'                  // 콘텐츠 중간
  | 'bottom';                 // 콘텐츠 최하단

/**
 * 광고 설정
 */
export interface AdConfig {
  clientId: string;         // AdSense Client ID
  slotId: string;           // AdSense Slot ID
  positions: AdPosition[];  // 광고 삽입 위치
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

/**
 * 발행 옵션
 */
export interface PublishOptions {
  dryRun?: boolean;         // 시뮬레이션 모드
  draft?: boolean;          // 초안으로 저장
  updateIfExists?: boolean; // 기존 포스트가 있으면 업데이트
}

```

`packages/shared/src/schemas.ts` (Zod 스키마):

```typescript
import { z } from 'zod';

/**
 * PostMetadata의 런타임 검증 스키마
 */
export const PostMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['publish', 'draft', 'pending', 'private']).default('draft'),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(['ko', 'en']).default('ko'),
  date: z.string().datetime().optional(),
  featuredImage: z.string().optional(),
});

/**
 * WordPressConfig의 런타임 검증 스키마
 */
export const WordPressConfigSchema = z.object({
  url: z.string().url('Invalid WordPress URL'),
  username: z.string().min(1, 'Username is required'),
  appPassword: z.string().min(1, 'Application Password is required'),
});

```

> 
🔍 **인사이트**: Zod 스키마는 TypeScript 타입과 런타임 검증을 동시에 제공합니다. 사용자 입력이나 외부 데이터를 다룰 때 필수적입니다.

## 단계 3: WordPress 클라이언트 구현 (packages/core)

`packages/core/src/wordpress.ts`:

```typescript
import WPAPI from 'wpapi';
import type { WordPressConfig, PostMetadata } from '@blog/shared';

/**
 * WordPress REST API 클라이언트
 */
export class WordPressClient {
  private wp: WPAPI;

  constructor(config: WordPressConfig) {
    // Basic Auth를 사용한 WordPress API 초기화
    this.wp = new WPAPI({
      endpoint: `${config.url}/wp-json`,
      username: config.username,
      password: config.appPassword,
    });
  }

  /**
   * 새 포스트 생성
   */
  async createPost(metadata: PostMetadata, htmlContent: string): Promise&#x3C;number> {
    try {
      // 카테고리 ID 조회 또는 생성
      const categoryIds = await this.resolveCategoryIds(metadata.categories || []);
      
      // 태그 ID 조회 또는 생성
      const tagIds = await this.resolveTagIds(metadata.tags || []);

      // 포스트 생성
      const response = await this.wp.posts().create({
        title: metadata.title,
        content: htmlContent,
        excerpt: metadata.excerpt || '',
        status: metadata.status,
        slug: metadata.slug,
        categories: categoryIds,
        tags: tagIds,
        date: metadata.date,
      });

      return response.id;
    } catch (error) {
      throw new Error(`Failed to create post: ${(error as Error).message}`);
    }
  }

  /**
   * 카테고리 이름을 ID로 변환 (없으면 생성)
   */
  private async resolveCategoryIds(categoryNames: string[]): Promise&#x3C;number[]> {
    const categoryIds: number[] = [];

    for (const name of categoryNames) {
      try {
        // 기존 카테고리 검색
        const categories = await this.wp.categories().search(name);
        
        if (categories.length > 0) {
          // 정확히 일치하는 카테고리 찾기
          const exactMatch = categories.find(cat => cat.name === name);
          if (exactMatch) {
            categoryIds.push(exactMatch.id);
            continue;
          }
        }

        // 카테고리가 없으면 생성
        const newCategory = await this.wp.categories().create({
          name,
          slug: this.slugify(name),
        });
        categoryIds.push(newCategory.id);
      } catch (error) {
        console.warn(`Warning: Could not resolve category "${name}": ${(error as Error).message}`);
      }
    }

    return categoryIds;
  }

  /**
   * 태그 이름을 ID로 변환 (없으면 생성)
   */
  private async resolveTagIds(tagNames: string[]): Promise&#x3C;number[]> {
    const tagIds: number[] = [];

    for (const name of tagNames) {
      try {
        // 기존 태그 검색
        const tags = await this.wp.tags().search(name);
        
        if (tags.length > 0) {
          // 정확히 일치하는 태그 찾기
          const exactMatch = tags.find(tag => tag.name === name);
          if (exactMatch) {
            tagIds.push(exactMatch.id);
            continue;
          }
        }

        // 태그가 없으면 생성
        const newTag = await this.wp.tags().create({
          name,
          slug: this.slugify(name),
        });
        tagIds.push(newTag.id);
      } catch (error) {
        console.warn(`Warning: Could not resolve tag "${name}": ${(error as Error).message}`);
      }
    }

    return tagIds;
  }

  /**
   * 문자열을 URL-friendly slug로 변환
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-')     // 공백을 하이픈으로
      .replace(/--+/g, '-')     // 연속 하이픈 제거
      .trim();
  }

  /**
   * 기존 포스트 업데이트
   */
  async updatePost(postId: number, metadata: PostMetadata, htmlContent: string): Promise&#x3C;void> {
    try {
      const categoryIds = await this.resolveCategoryIds(metadata.categories || []);
      const tagIds = await this.resolveTagIds(metadata.tags || []);

      await this.wp.posts().id(postId).update({
        title: metadata.title,
        content: htmlContent,
        excerpt: metadata.excerpt || '',
        status: metadata.status,
        slug: metadata.slug,
        categories: categoryIds,
        tags: tagIds,
        date: metadata.date,
      });
    } catch (error) {
      throw new Error(`Failed to update post: ${(error as Error).message}`);
    }
  }

  /**
   * 포스트 삭제
   */
  async deletePost(postId: number): Promise&#x3C;void> {
    try {
      await this.wp.posts().id(postId).delete();
    } catch (error) {
      throw new Error(`Failed to delete post: ${(error as Error).message}`);
    }
  }

  /**
   * 포스트 목록 조회
   */
  async listPosts(params?: { per_page?: number; page?: number; status?: string }) {
    try {
      let query = this.wp.posts();
      
      if (params?.per_page) query = query.perPage(params.per_page);
      if (params?.page) query = query.page(params.page);
      if (params?.status) query = query.param('status', params.status);

      return await query.get();
    } catch (error) {
      throw new Error(`Failed to list posts: ${(error as Error).message}`);
    }
  }
}

```

> 
💡 **팁**: WordPress Application Password는 WordPress 5.6+에서 지원하며, OAuth 2.0보다 설정이 간단합니다. 사용자 프로필 페이지에서 생성할 수 있습니다.

## 단계 4: 마크다운 처리 (packages/core)

`packages/core/src/markdown.ts`:

```typescript
import fs from 'fs/promises';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { PostMetadata } from '@blog/shared';
import { PostMetadataSchema } from '@blog/shared';

/**
 * 마크다운 파일 파싱 결과
 */
export interface ParsedMarkdown {
  metadata: PostMetadata;
  html: string;
}

/**
 * 마크다운 파일을 파싱하여 메타데이터와 HTML 추출
 */
export async function parseMarkdownFile(filePath: string): Promise&#x3C;ParsedMarkdown> {
  try {
    // 파일 읽기
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Frontmatter 파싱
    const { data, content } = matter(fileContent);

    // 메타데이터 검증 (Zod)
    const metadata = PostMetadataSchema.parse(data);

    // 마크다운 → HTML 변환
    const html = await markdownToHtml(content);

    return { metadata, html };
  } catch (error) {
    throw new Error(`Failed to parse markdown file "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * 마크다운을 HTML로 변환
 */
async function markdownToHtml(markdown: string): Promise&#x3C;string> {
  const result = await unified()
    .use(remarkParse)        // 마크다운 파싱
    .use(remarkRehype)       // 마크다운 AST → HTML AST
    .use(rehypeStringify)    // HTML AST → HTML 문자열
    .process(markdown);

  return String(result);
}

```

## 단계 5: 광고 코드 자동 삽입 (packages/core)

`packages/core/src/ads.ts`:

```typescript
import type { AdConfig, AdPosition } from '@blog/shared';

/**
 * HTML 콘텐츠에 광고 코드 삽입
 */
export function injectAds(html: string, adConfig: AdConfig): string {
  let result = html;

  for (const position of adConfig.positions) {
    result = injectAdAtPosition(result, adConfig, position);
  }

  return result;
}

/**
 * 특정 위치에 광고 코드 삽입
 */
function injectAdAtPosition(html: string, adConfig: AdConfig, position: AdPosition): string {
  const adHtml = generateAdSenseCode(adConfig);

  switch (position) {
    case 'top':
      // 콘텐츠 최상단에 삽입
      return adHtml + html;

    case 'after-first-paragraph':
      // 첫 번째 &#x3C;p> 태그 뒤에 삽입
      return html.replace(/(&#x3C;p>.*?&#x3C;\/p>)/i, `$1${adHtml}`);

    case 'after-first-h2':
      // 첫 번째 &#x3C;h2> 태그 뒤에 삽입
      return html.replace(/(&#x3C;h2>.*?&#x3C;\/h2>)/i, `$1${adHtml}`);

    case 'middle':
      // HTML 중간 지점에 삽입
      const middleIndex = Math.floor(html.length / 2);
      // 가장 가까운 태그 닫힘 찾기
      const insertIndex = html.indexOf('>', middleIndex) + 1;
      return html.slice(0, insertIndex) + adHtml + html.slice(insertIndex);

    case 'bottom':
      // 콘텐츠 최하단에 삽입
      return html + adHtml;

    default:
      return html;
  }
}

/**
 * AdSense 광고 코드 생성
 */
function generateAdSenseCode(adConfig: AdConfig): string {
  const format = adConfig.format || 'auto';
  
  return `
&#x3C;div class="ad-container" style="margin: 20px 0; text-align: center;">
  &#x3C;script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.clientId}"
     crossorigin="anonymous">&#x3C;/script>
  &#x3C;ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${adConfig.clientId}"
     data-ad-slot="${adConfig.slotId}"
     data-ad-format="${format}"
     data-full-width-responsive="true">&#x3C;/ins>
  &#x3C;script>
     (adsbygoogle = window.adsbygoogle || []).push({});
  &#x3C;/script>
&#x3C;/div>
`.trim();
}

```

> 
⚠️ **주의**: 광고 코드는 WordPress 테마와 호환되도록 HTML 구조를 조정해야 할 수 있습니다. Avada 테마의 경우 특정 CSS 클래스를 추가하면 레이아웃이 더 잘 맞습니다.

## 단계 6: CLI 도구 구현 (packages/cli)

`packages/cli/src/commands/publish.ts`:

```typescript
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { WordPressClient } from '@blog/core';
import { parseMarkdownFile, injectAds } from '@blog/core';
import { loadConfig } from '../utils/config';
import type { PublishOptions } from '@blog/shared';

export const publishCommand = new Command('publish')
  .description('Publish a markdown file to WordPress')
  .argument('&#x3C;file>', 'Markdown file path')
  .option('-d, --draft', 'Publish as draft', false)
  .option('--dry-run', 'Simulate publishing without actually uploading', false)
  .action(async (filePath: string, options: PublishOptions) => {
    const spinner = ora('Loading configuration...').start();

    try {
      // 1. 설정 로드
      const config = await loadConfig();
      spinner.succeed('Configuration loaded');

      // 2. 마크다운 파싱
      spinner.start('Parsing markdown file...');
      const { metadata, html } = await parseMarkdownFile(filePath);
      
      // draft 옵션이 있으면 status 덮어쓰기
      if (options.draft) {
        metadata.status = 'draft';
      }
      
      spinner.succeed(`Parsed: ${chalk.bold(metadata.title)}`);

      // 3. 광고 코드 삽입
      spinner.start('Injecting ads...');
      const htmlWithAds = injectAds(html, config.ads);
      spinner.succeed(`Injected ads at ${config.ads.positions.join(', ')}`);

      // 4. WordPress 업로드 (dry-run 체크)
      if (options.dryRun) {
        spinner.info('Dry-run mode: skipping actual upload');
        console.log(chalk.gray('\n--- Metadata ---'));
        console.log(metadata);
        console.log(chalk.gray('\n--- HTML Preview (first 500 chars) ---'));
        console.log(htmlWithAds.slice(0, 500) + '...');
        return;
      }

      spinner.start('Publishing to WordPress...');
      const wp = new WordPressClient(config.wordpress);
      const postId = await wp.createPost(metadata, htmlWithAds);
      
      spinner.succeed(chalk.green(`✓ Published successfully!`));
      console.log(`Post ID: ${postId}`);
      console.log(`URL: ${config.wordpress.url}/?p=${postId}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to publish'));
      console.error((error as Error).message);
      process.exit(1);
    }
  });

```

`packages/cli/src/utils/config.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import type { WordPressConfig, AdConfig } from '@blog/shared';
import { WordPressConfigSchema } from '@blog/shared';

/**
 * 전체 애플리케이션 설정
 */
export interface AppConfig {
  wordpress: WordPressConfig;
  ads: AdConfig;
}

/**
 * 설정 로드 (환경 변수 + .env 파일)
 */
export async function loadConfig(): Promise&#x3C;AppConfig> {
  // .env 파일 로드
  dotenvConfig();

  // WordPress 설정
  const wordpress: WordPressConfig = {
    url: process.env.WORDPRESS_URL || '',
    username: process.env.WORDPRESS_USERNAME || '',
    appPassword: process.env.WORDPRESS_APP_PASSWORD || '',
  };

  // 설정 검증
  const validatedWordPress = WordPressConfigSchema.parse(wordpress);

  // 광고 설정
  const ads: AdConfig = {
    clientId: process.env.ADSENSE_CLIENT_ID || '',
    slotId: process.env.ADSENSE_SLOT_ID || '',
    positions: (process.env.AD_POSITIONS?.split(',') as any) || ['after-first-h2', 'bottom'],
    format: (process.env.AD_FORMAT as any) || 'auto',
  };

  return {
    wordpress: validatedWordPress,
    ads,
  };
}

```

`packages/cli/src/index.ts` (CLI 진입점):

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { publishCommand } from './commands/publish';

const program = new Command();

program
  .name('blog')
  .description('WordPress content automation CLI')
  .version('0.1.0');

program.addCommand(publishCommand);

program.parse();

```

`packages/cli/package.json`:

```json
{
  "name": "@blog/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "blog": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "dev": "node dist/index.js"
  },
  "dependencies": {
    "@blog/core": "workspace:*",
    "@blog/shared": "workspace:*",
    "commander": "^11.1.0",
    "ora": "^8.0.1",
    "chalk": "^5.3.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}

```

## 단계 7: 환경 변수 설정

`.env.example`:

```bash
# WordPress 연결 설정
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# AdSense 광고 설정
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx
AD_POSITIONS=after-first-h2,bottom
AD_FORMAT=auto

# 기타 설정
DEFAULT_LANGUAGE=ko
DEFAULT_POST_STATUS=draft

```

> 
💡 **팁**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 추가하고, `.env.example`만 공유하세요.

## 실전 사용: 완전한 워크플로우

### 1. 마크다운 파일 작성

`content/posts/ko/wordpress-api-guide.md`:

```markdown
---
title: "WordPress REST API 완벽 가이드"
slug: "wordpress-rest-api-complete-guide"
excerpt: "WordPress REST API를 활용해 자동화 시스템을 구축하는 방법을 알아봅니다."
status: "publish"
categories: ["WordPress", "개발"]
tags: ["WordPress API", "자동화", "Node.js"]
language: "ko"
date: "2025-10-28T09:00:00+09:00"
---

# WordPress REST API란?

WordPress REST API는...

```

### 2. 빌드 및 설치

```bash
# 의존성 설치
pnpm install

# 모든 패키지 빌드
pnpm build

# CLI 도구 글로벌 링크 (개발용)
cd packages/cli
pnpm link --global

```

### 3. 발행

```bash
# 바로 발행
blog publish content/posts/ko/wordpress-api-guide.md

# 초안으로 저장
blog publish content/posts/ko/wordpress-api-guide.md --draft

# 시뮬레이션 (실제 업로드 안 함)
blog publish content/posts/ko/wordpress-api-guide.md --dry-run

```

### 4. 결과 확인

성공하면 다음과 같은 출력을 볼 수 있습니다:

```
✔ Configuration loaded
✔ Parsed: WordPress REST API 완벽 가이드
✔ Injected ads at after-first-h2, bottom
✔ Published successfully!
Post ID: 123
URL: https://your-blog.com/?p=123

```

## 고급 기능: 확장하기

### 이미지 자동 업로드

마크다운 내 로컬 이미지를 자동으로 WordPress 미디어 라이브러리에 업로드하고 URL을 변경하는 기능을 추가할 수 있습니다:

`packages/core/src/media.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import type { WordPressConfig } from '@blog/shared';

/**
 * 로컬 이미지를 WordPress 미디어 라이브러리에 업로드
 */
export async function uploadImage(
  config: WordPressConfig,
  filePath: string
): Promise&#x3C;string> {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`${config.url}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.appPassword}`).toString('base64')}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();
  return data.source_url; // 업로드된 이미지의 WordPress URL
}

/**
 * HTML 내 로컬 이미지 경로를 WordPress URL로 변경
 */
export async function replaceLocalImages(
  html: string,
  config: WordPressConfig,
  baseDir: string
): Promise&#x3C;string> {
  // 이미지 태그에서 로컬 경로 추출 (정규식)
  const imgRegex = /&#x3C;img[^>]+src="([^"]+)"/g;
  let result = html;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const imagePath = match[1];
    
    // 로컬 파일인지 확인 (http:// 또는 https://가 아닌 경우)
    if (!imagePath.startsWith('http://') &#x26;&#x26; !imagePath.startsWith('https://')) {
      const absolutePath = path.resolve(baseDir, imagePath);
      
      try {
        // WordPress에 업로드
        const wordpressUrl = await uploadImage(config, absolutePath);
        
        // HTML에서 경로 변경
        result = result.replace(imagePath, wordpressUrl);
      } catch (error) {
        console.warn(`Warning: Could not upload image "${imagePath}": ${(error as Error).message}`);
      }
    }
  }

  return result;
}

```

### 포스트 업데이트 로직

기존 포스트가 있으면 업데이트하는 기능:

```typescript
/**
 * slug로 기존 포스트 검색
 */
async findPostBySlug(slug: string): Promise&#x3C;number | null> {
  try {
    const posts = await this.wp.posts().slug(slug);
    return posts.length > 0 ? posts[0].id : null;
  } catch (error) {
    return null;
  }
}

/**
 * 포스트 발행 (생성 또는 업데이트)
 */
async publishPost(
  metadata: PostMetadata,
  htmlContent: string,
  options: PublishOptions = {}
): Promise&#x3C;number> {
  // slug가 있으면 기존 포스트 찾기
  if (metadata.slug &#x26;&#x26; options.updateIfExists) {
    const existingPostId = await this.findPostBySlug(metadata.slug);
    
    if (existingPostId) {
      await this.updatePost(existingPostId, metadata, htmlContent);
      return existingPostId;
    }
  }

  // 기존 포스트가 없으면 새로 생성
  return await this.createPost(metadata, htmlContent);
}

```

## 품질 관리 및 모범 사례

### 에러 처리

모든 비동기 함수는 명확한 에러 메시지를 제공해야 합니다:

```typescript
try {
  await wp.createPost(metadata, html);
} catch (error) {
  if (error.code === 'rest_post_invalid_id') {
    console.error('Invalid post ID. Check your WordPress configuration.');
  } else if (error.code === 'rest_cannot_create') {
    console.error('Permission denied. Check your Application Password.');
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
  process.exit(1);
}

```

### 테스팅 (향후 추가)

핵심 로직에 대한 단위 테스트 예시 (Vitest):

```typescript
import { describe, it, expect } from 'vitest';
import { injectAds } from '../src/ads';

describe('injectAds', () => {
  it('should inject ad after first H2', () => {
    const html = '&#x3C;h2>Section 1&#x3C;/h2>&#x3C;p>Content&#x3C;/p>';
    const config = {
      clientId: 'ca-pub-test',
      slotId: '123456',
      positions: ['after-first-h2'],
    };

    const result = injectAds(html, config);
    expect(result).toContain('&#x3C;/h2>&#x3C;div class="ad-container">');
  });
});

```

### SEO 최적화 팁

- **Excerpt 최적화**: 메타 설명(excerpt)은 150-160자로 작성하고 주요 키워드 포함

- **Slug 최적화**: URL-friendly한 slug를 사용하고, 키워드 포함

- **카테고리 전략**: 너무 많은 카테고리를 만들지 말고, 3-5개 핵심 카테고리에 집중

- **태그 전략**: 포스트당 3-8개의 관련 태그 사용

- **이미지 최적화**: 업로드 전 이미지 압축 및 리사이징

**이미지 최적화 예제 (sharp 사용)**:

```typescript
import sharp from 'sharp';
import path from 'path';

/**
 * 이미지 최적화 및 리사이징
 */
export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise&#x3C;void> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80 } = options;

  await sharp(inputPath)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',           // 비율 유지하며 크기 조정
      withoutEnlargement: true // 원본보다 크게 만들지 않음
    })
    .jpeg({ quality })         // JPEG 품질 설정
    .toFile(outputPath);
}

/**
 * 업로드 전 자동 이미지 최적화
 */
export async function uploadOptimizedImage(
  config: WordPressConfig,
  filePath: string
): Promise&#x3C;string> {
  const ext = path.extname(filePath);
  const optimizedPath = filePath.replace(ext, `-optimized${ext}`);

  // 이미지 최적화
  await optimizeImage(filePath, optimizedPath, {
    maxWidth: 1920,
    quality: 80
  });

  // WordPress에 업로드
  const url = await uploadImage(config, optimizedPath);

  // 임시 파일 삭제
  await fs.unlink(optimizedPath);

  return url;
}

```

### 보안 고려사항

**Application Password 보안**:

- 환경 변수로만 관리

- Git에 절대 커밋하지 않기

- 주기적으로 재생성

**입력 검증**:

- 모든 사용자 입력에 Zod 스키마 적용

- SQL Injection 방지 (WordPress REST API가 자동으로 처리)

**HTTPS 사용**:

- WordPress 사이트는 반드시 HTTPS 사용

- Application Password는 HTTPS에서만 안전

## 성능 최적화

### 병렬 처리

여러 포스트를 동시에 발행할 때:

```typescript
async function publishMultiple(filePaths: string[]) {
  const promises = filePaths.map(filePath => publishPost(filePath));
  
  const results = await Promise.allSettled(promises);
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`✓ ${succeeded} posts published, ${failed} failed`);
}

```

### 캐싱

카테고리와 태그 ID를 캐싱하여 API 호출 줄이기:

```typescript
private categoryCache = new Map&#x3C;string, number>();
private tagCache = new Map&#x3C;string, number>();

private async resolveCategoryIds(categoryNames: string[]): Promise&#x3C;number[]> {
  const categoryIds: number[] = [];

  for (const name of categoryNames) {
    // 캐시 확인
    if (this.categoryCache.has(name)) {
      categoryIds.push(this.categoryCache.get(name)!);
      continue;
    }

    // API 호출 후 캐시에 저장
    const id = await this.fetchOrCreateCategory(name);
    this.categoryCache.set(name, id);
    categoryIds.push(id);
  }

  return categoryIds;
}

```

## 트러블슈팅

### WordPress 연결 실패

**증상**: `Error: Failed to create post: Request failed with status code 401`

**해결 방법**:

- `WORDPRESS_URL`이 정확한지 확인 (https:// 포함)

- Application Password 재생성

WordPress REST API 활성화 확인:
```bash
curl https://your-blog.com/wp-json/wp/v2/posts

```

- 보안 플러그인(Wordfence 등)이 REST API를 차단하지 않는지 확인

### pnpm workspace 이슈

**증상**: 패키지 간 import 실패

**해결 방법**:

```bash
# pnpm 캐시 정리
pnpm store prune

# node_modules 재설치
rm -rf node_modules packages/*/node_modules
pnpm install

# 다시 빌드
pnpm build

```

### TypeScript 타입 에러

**증상**: `Cannot find module '@blog/shared'`

**해결 방법**:

```bash
# 타입 정의 재생성
pnpm --filter @blog/shared build

# 전체 빌드
pnpm build

```

## 다음 단계: 자동화 강화

이제 기본적인 자동 발행 시스템을 구축했으니, 다음 단계로 나아갈 수 있습니다:

- **일괄 업로드**: 폴더 내 모든 마크다운 파일 한 번에 발행

- **스케줄 발행**: cron job으로 특정 시간에 자동 발행

- **SEO 자동화**: AI로 메타 설명 생성, 키워드 제안

- **다국어 관리**: 한국어 포스트 → 영어 자동 번역 및 발행

- **이미지 최적화**: 자동 리사이징, WebP 변환

- **A/B 테스팅**: 광고 위치별 수익 비교

- **성과 분석**: Google Analytics API 연동으로 자동 리포트

## 추가 리소스

- WordPress REST API 공식 문서

- wpapi 라이브러리 GitHub

- Unified 생태계

- Zod 공식 문서

- pnpm workspace 가이드

## 결론

WordPress REST API와 Node.js를 활용하면 블로그 자동화를 통해 반복 작업을 극적으로 줄일 수 있습니다. TypeScript로 구축한 이 Node.js 시스템은 단순히 포스트를 발행하는 것을 넘어, 확장 가능한 콘텐츠 자동화 플랫폼의 토대가 됩니다.

핵심은 **일관된 워크플로우**를 구축하는 것입니다. Node.js CLI 도구로 로컬에서 마크다운으로 편하게 작성하고, Git으로 버전 관리하고, 한 줄의 명령으로 발행하는 이 패턴은 개인 블로거부터 대형 콘텐츠 팀까지 모두에게 유용합니다.

**지금 바로 시작하세요:**

- 이 글의 코드를 기반으로 TypeScript 프로젝트 생성

- 첫 포스트를 마크다운으로 작성

- Node.js CLI 명령 `blog publish`로 발행

- WordPress 블로그 자동화의 위력을 체험하세요!

**시리즈 연결**:

- 이전 글: Node.js CLI 도구 개발 기초를 먼저 익히고 싶다면, 시리즈 이전 포스트를 참고하세요.

- 다음 글: AI를 활용한 완전 자동화 파이프라인 구축 방법을 다음 포스트에서 다룰 예정입니다!