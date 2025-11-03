---
title: "Automate WordPress Publishing with Node.js & REST API: Complete Content Automation Guide"
slug: "automate-wordpress-publishing-nodejs-rest-api"
excerpt: "Build a fully automated WordPress publishing system with Node.js and REST API. Transform markdown files into published posts with one command, automate ad insertion, and save 10+ hours per week. Production-ready tutorial with TypeScript."
status: "publish"
categories:
  - "Automation"
  - "Node.js"
  - "WordPress"
tags:
  - "WordPress REST API"
  - "Node.js"
  - "TypeScript"
  - "Content Automation"
  - "Blog Automation"
language: "en"
---

> **🌐 Translation**: Translated from [Korean](/ko/wordpress-rest-api-node-jsro-jadong-balhaeng-siseutem-gucughagi-kontenceu-jadonghwayi-sijag-2).

# Automate WordPress Publishing with Node.js & REST API

Are you tired of logging into WordPress admin, copying content, selecting categories, adding tags, and inserting ad codes manually for every single post? If you're managing multiple blogs or multilingual content, these repetitive tasks waste time and invite errors. WordPress REST API with Node.js can automate this entire workflow.

After building this Node.js automation system, I saved approximately **10 hours per week** managing two blogs (Korean/English). Writing in markdown locally, managing versions with Git, and publishing with a single CLI command lets me focus purely on content creation.

This comprehensive guide shows you how to build a production-ready system that automatically converts markdown files into WordPress posts using WordPress REST API, Node.js, and TypeScript. Go beyond simple code copying—create a robust blog automation tool you can actually use in production.

**What you'll learn**:

- Core concepts and authentication methods for WordPress REST API

- Building a type-safe WordPress client with TypeScript

- Converting markdown to HTML and auto-inserting ad codes

- Creating a CLI tool for one-command publishing

- Designing scalable monorepo project architecture

## Why WordPress REST API is a Game Changer

WordPress powers approximately 43% of all websites globally. Yet many people don't fully leverage the powerful WordPress REST API feature.

### What is WordPress REST API?

WordPress REST API, integrated into core since WordPress 4.7, enables programmatic manipulation of WordPress site data through HTTP requests. In simple terms, you can create posts, manage categories, and upload media without touching a web browser.

**Key REST API advantages**:

- **Platform independence**: Interact with WordPress using any programming language

- **Automation**: Script repetitive tasks

- **Integration**: Connect external systems (CRM, marketing tools, etc.)

- **Headless CMS**: Use WordPress as backend only, build frontend with React/Vue

### Traditional Method vs REST API Approach

**Traditional method (manual)**:

- Log into WordPress admin

- Navigate to post editor

- Write or copy-paste content

- Set categories, tags, featured image

- Manually insert ad codes

- Click publish

- Repeat for other blogs/languages

**REST API approach**:

```bash
# Write comfortably in markdown locally
blog publish content/posts/en/my-awesome-post.md

```

A single command automates the entire process. This is the true value WordPress REST API provides.

## Project Design: Architecture Decisions

Before diving into implementation, designing a scalable and maintainable structure is crucial.

### Technology Stack Selection

**Why Node.js and TypeScript?**

Node.js, a JavaScript runtime, naturally handles JSON data returned by WordPress REST API. Adding TypeScript provides these benefits:

- **Type safety**: Catch errors at compile time

- **Auto-completion**: IDE autocomplete support for APIs

- **Refactoring**: Safe code changes

- **Documentation**: Types serve as documentation

**Core Libraries**:

| Library | Role | Selection Reason |
|---------|------|------------------|
| `wpapi` | WordPress REST API client | WordPress-specific design simplifies authentication and endpoint handling (※ No updates since 2021, stable but consider axios + fetch alternative) |
| `gray-matter` | Frontmatter parsing | Optimized for markdown metadata extraction |
| `unified` + `remark` | Markdown → HTML conversion | Plugin architecture enables easy customization |
| `commander` | CLI framework | Standard CLI tool in npm ecosystem |
| `zod` | Runtime type validation | Integrates TypeScript types with runtime validation |

### Monorepo Structure Design

Adopt a monorepo approach managing multiple packages in one repository for convenient code reuse and dependency management.

```
blog/
├── packages/
│   ├── cli/               # User interface (command-line tool)
│   ├── core/              # Core business logic
│   └── shared/            # Shared types and utilities
├── content/               # Markdown content
│   ├── posts/
│   │   ├── ko/           # Korean posts
│   │   └── en/           # English posts
│   └── templates/        # Post templates
└── pnpm-workspace.yaml   # pnpm workspace configuration

```

>
💡 **Tip**: pnpm saves disk space and installs faster than npm or yarn. Its workspace feature is especially powerful in monorepo environments.

## Step 1: Initial Project Setup

### pnpm workspace configuration

Create `pnpm-workspace.yaml` in the root directory:

```yaml
packages:
  - 'packages/*'

```

Root `package.json`:

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

### TypeScript configuration

Root `tsconfig.json`:

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
⚠️ **Note**: `moduleResolution: "bundler"` is supported in TypeScript 5.0+ and reduces module resolution issues when used with modern bundlers (tsup, vite, etc.).

## Step 2: Shared Type Definitions (packages/shared)

Define types and utilities used across all packages.

`packages/shared/src/types.ts`:

```typescript
/**
 * WordPress connection configuration
 */
export interface WordPressConfig {
  url: string;              // WordPress site URL
  username: string;         // Username
  appPassword: string;      // Application Password
}

/**
 * Post metadata (frontmatter)
 */
export interface PostMetadata {
  title: string;            // Post title
  slug?: string;            // URL slug (optional)
  excerpt?: string;         // Post excerpt
  status: 'publish' | 'draft' | 'pending' | 'private';
  categories?: string[];    // Category list
  tags?: string[];          // Tag list
  language: 'ko' | 'en';    // Language
  date?: string;            // Publish date (ISO 8601)
  featuredImage?: string;   // Featured image path
}

/**
 * Ad insertion positions
 */
export type AdPosition =
  | 'top'                     // Top of content
  | 'after-first-paragraph'   // After first paragraph
  | 'after-first-h2'          // After first H2 heading
  | 'middle'                  // Middle of content
  | 'bottom';                 // Bottom of content

/**
 * Ad configuration
 */
export interface AdConfig {
  clientId: string;         // AdSense Client ID
  slotId: string;           // AdSense Slot ID
  positions: AdPosition[];  // Ad insertion positions
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

/**
 * Publishing options
 */
export interface PublishOptions {
  dryRun?: boolean;         // Simulation mode
  draft?: boolean;          // Save as draft
  updateIfExists?: boolean; // Update if post already exists
}

```

`packages/shared/src/schemas.ts` (Zod schemas):

```typescript
import { z } from 'zod';

/**
 * PostMetadata runtime validation schema
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
 * WordPressConfig runtime validation schema
 */
export const WordPressConfigSchema = z.object({
  url: z.string().url('Invalid WordPress URL'),
  username: z.string().min(1, 'Username is required'),
  appPassword: z.string().min(1, 'Application Password is required'),
});

```

>
🔍 **Insight**: Zod schemas provide both TypeScript types and runtime validation. Essential when handling user input or external data.

## Step 3: WordPress Client Implementation (packages/core)

`packages/core/src/wordpress.ts`:

```typescript
import WPAPI from 'wpapi';
import type { WordPressConfig, PostMetadata } from '@blog/shared';

/**
 * WordPress REST API client
 */
export class WordPressClient {
  private wp: WPAPI;

  constructor(config: WordPressConfig) {
    // Initialize WordPress API with Basic Auth
    this.wp = new WPAPI({
      endpoint: `${config.url}/wp-json`,
      username: config.username,
      password: config.appPassword,
    });
  }

  /**
   * Create new post
   */
  async createPost(metadata: PostMetadata, htmlContent: string): Promise<number> {
    try {
      // Resolve or create category IDs
      const categoryIds = await this.resolveCategoryIds(metadata.categories || []);

      // Resolve or create tag IDs
      const tagIds = await this.resolveTagIds(metadata.tags || []);

      // Create post
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
   * Convert category names to IDs (create if missing)
   */
  private async resolveCategoryIds(categoryNames: string[]): Promise<number[]> {
    const categoryIds: number[] = [];

    for (const name of categoryNames) {
      try {
        // Search existing categories
        const categories = await this.wp.categories().search(name);

        if (categories.length > 0) {
          // Find exact match
          const exactMatch = categories.find(cat => cat.name === name);
          if (exactMatch) {
            categoryIds.push(exactMatch.id);
            continue;
          }
        }

        // Create category if not found
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
   * Convert tag names to IDs (create if missing)
   */
  private async resolveTagIds(tagNames: string[]): Promise<number[]> {
    const tagIds: number[] = [];

    for (const name of tagNames) {
      try {
        // Search existing tags
        const tags = await this.wp.tags().search(name);

        if (tags.length > 0) {
          // Find exact match
          const exactMatch = tags.find(tag => tag.name === name);
          if (exactMatch) {
            tagIds.push(exactMatch.id);
            continue;
          }
        }

        // Create tag if not found
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
   * Convert string to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Remove consecutive hyphens
      .trim();
  }

  /**
   * Update existing post
   */
  async updatePost(postId: number, metadata: PostMetadata, htmlContent: string): Promise<void> {
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
   * Delete post
   */
  async deletePost(postId: number): Promise<void> {
    try {
      await this.wp.posts().id(postId).delete();
    } catch (error) {
      throw new Error(`Failed to delete post: ${(error as Error).message}`);
    }
  }

  /**
   * List posts
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
💡 **Tip**: WordPress Application Passwords are supported in WordPress 5.6+ and simpler to set up than OAuth 2.0. Generate them from the user profile page.

## Step 4: Markdown Processing (packages/core)

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
 * Parsed markdown result
 */
export interface ParsedMarkdown {
  metadata: PostMetadata;
  html: string;
}

/**
 * Parse markdown file to extract metadata and HTML
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
  try {
    // Read file
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Parse frontmatter
    const { data, content } = matter(fileContent);

    // Validate metadata (Zod)
    const metadata = PostMetadataSchema.parse(data);

    // Convert markdown → HTML
    const html = await markdownToHtml(content);

    return { metadata, html };
  } catch (error) {
    throw new Error(`Failed to parse markdown file "${filePath}": ${(error as Error).message}`);
  }
}

/**
 * Convert markdown to HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)        // Parse markdown
    .use(remarkRehype)       // Markdown AST → HTML AST
    .use(rehypeStringify)    // HTML AST → HTML string
    .process(markdown);

  return String(result);
}

```

## Step 5: Auto Ad Injection (packages/core)

`packages/core/src/ads.ts`:

```typescript
import type { AdConfig, AdPosition } from '@blog/shared';

/**
 * Inject ad codes into HTML content
 */
export function injectAds(html: string, adConfig: AdConfig): string {
  let result = html;

  for (const position of adConfig.positions) {
    result = injectAdAtPosition(result, adConfig, position);
  }

  return result;
}

/**
 * Inject ad at specific position
 */
function injectAdAtPosition(html: string, adConfig: AdConfig, position: AdPosition): string {
  const adHtml = generateAdSenseCode(adConfig);

  switch (position) {
    case 'top':
      // Insert at top of content
      return adHtml + html;

    case 'after-first-paragraph':
      // Insert after first <p> tag
      return html.replace(/(<p>.*?<\/p>)/i, `$1${adHtml}`);

    case 'after-first-h2':
      // Insert after first <h2> tag
      return html.replace(/(<h2>.*?<\/h2>)/i, `$1${adHtml}`);

    case 'middle':
      // Insert at middle point of HTML
      const middleIndex = Math.floor(html.length / 2);
      // Find nearest tag closing
      const insertIndex = html.indexOf('>', middleIndex) + 1;
      return html.slice(0, insertIndex) + adHtml + html.slice(insertIndex);

    case 'bottom':
      // Insert at bottom of content
      return html + adHtml;

    default:
      return html;
  }
}

/**
 * Generate AdSense ad code
 */
function generateAdSenseCode(adConfig: AdConfig): string {
  const format = adConfig.format || 'auto';

  return `
<div class="ad-container" style="margin: 20px 0; text-align: center;">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.clientId}"
     crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${adConfig.clientId}"
     data-ad-slot="${adConfig.slotId}"
     data-ad-format="${format}"
     data-full-width-responsive="true"></ins>
  <script>
     (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
`.trim();
}

```

>
⚠️ **Note**: Ad code HTML structure may need adjustments for WordPress theme compatibility. For Avada theme, adding specific CSS classes improves layout compatibility.

## Step 6: CLI Tool Implementation (packages/cli)

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
  .argument('<file>', 'Markdown file path')
  .option('-d, --draft', 'Publish as draft', false)
  .option('--dry-run', 'Simulate publishing without actually uploading', false)
  .action(async (filePath: string, options: PublishOptions) => {
    const spinner = ora('Loading configuration...').start();

    try {
      // 1. Load configuration
      const config = await loadConfig();
      spinner.succeed('Configuration loaded');

      // 2. Parse markdown
      spinner.start('Parsing markdown file...');
      const { metadata, html } = await parseMarkdownFile(filePath);

      // Override status if draft option present
      if (options.draft) {
        metadata.status = 'draft';
      }

      spinner.succeed(`Parsed: ${chalk.bold(metadata.title)}`);

      // 3. Inject ads
      spinner.start('Injecting ads...');
      const htmlWithAds = injectAds(html, config.ads);
      spinner.succeed(`Injected ads at ${config.ads.positions.join(', ')}`);

      // 4. Upload to WordPress (check dry-run)
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

*Due to length constraints, I'm providing the essential parts. The complete CLI implementation includes configuration loading, error handling, and user feedback.*

## Step 7: Environment Variables

`.env.example`:

```bash
# WordPress connection settings
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# AdSense ad configuration
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx
AD_POSITIONS=after-first-h2,bottom
AD_FORMAT=auto

# Other settings
DEFAULT_LANGUAGE=en
DEFAULT_POST_STATUS=draft

```

>
💡 **Tip**: Never commit `.env` files to Git. Add to `.gitignore` and only share `.env.example`.

## Production Usage: Complete Workflow

### 1. Write markdown file

`content/posts/en/wordpress-api-guide.md`:

```markdown
---
title: "Complete WordPress REST API Guide"
slug: "wordpress-rest-api-complete-guide"
excerpt: "Learn how to build automation systems using WordPress REST API."
status: "publish"
categories: ["WordPress", "Development"]
tags: ["WordPress API", "Automation", "Node.js"]
language: "en"
date: "2025-10-28T09:00:00+09:00"
---

# What is WordPress REST API?

WordPress REST API is...

```

### 2. Build and install

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Link CLI tool globally (development)
cd packages/cli
pnpm link --global

```

### 3. Publish

```bash
# Publish immediately
blog publish content/posts/en/wordpress-api-guide.md

# Save as draft
blog publish content/posts/en/wordpress-api-guide.md --draft

# Simulate (no actual upload)
blog publish content/posts/en/wordpress-api-guide.md --dry-run

```

### 4. Verify results

On success, you'll see output like:

```
✔ Configuration loaded
✔ Parsed: Complete WordPress REST API Guide
✔ Injected ads at after-first-h2, bottom
✔ Published successfully!
Post ID: 123
URL: https://your-blog.com/?p=123

```

## Advanced Features & Best Practices

### Auto Image Upload

Automatically upload local images in markdown to WordPress media library and update URLs.

### Post Update Logic

Update existing posts if they already exist based on slug matching.

### Error Handling

Provide clear, actionable error messages for common scenarios like authentication failures or network issues.

### Performance Optimization

- **Parallel processing**: Publish multiple posts simultaneously
- **Caching**: Cache category/tag IDs to reduce API calls
- **Rate limiting**: Respect WordPress API rate limits

### Security Considerations

- Store Application Passwords in environment variables only
- Never commit credentials to Git
- Regenerate passwords periodically
- Always use HTTPS for WordPress sites

## Troubleshooting

### WordPress Connection Failed

**Symptom**: `Error: Failed to create post: Request failed with status code 401`

**Solutions**:
- Verify `WORDPRESS_URL` is correct (including https://)
- Regenerate Application Password
- Check WordPress REST API is enabled: `curl https://your-blog.com/wp-json/wp/v2/posts`
- Verify security plugins (Wordfence, etc.) aren't blocking REST API

### pnpm workspace issues

**Symptom**: Package import failures

**Solutions**:
```bash
# Clean pnpm cache
pnpm store prune

# Reinstall node_modules
rm -rf node_modules packages/*/node_modules
pnpm install

# Rebuild
pnpm build
```

## Next Steps: Enhanced Automation

Now that you've built the basic auto-publishing system, take it further:

- **Batch upload**: Publish all markdown files in a folder at once
- **Scheduled publishing**: Auto-publish at specific times with cron jobs
- **SEO automation**: AI-generated meta descriptions and keyword suggestions
- **Multilingual management**: Auto-translate Korean posts to English
- **Image optimization**: Auto-resize and WebP conversion
- **A/B testing**: Compare ad revenue by position
- **Analytics integration**: Auto-reports with Google Analytics API

## Conclusion

WordPress REST API with Node.js dramatically reduces repetitive tasks through blog automation. This TypeScript-powered Node.js system goes beyond simply publishing posts—it's the foundation for a scalable content automation platform.

The key is establishing a **consistent workflow**. This pattern of writing comfortably in markdown locally, managing versions with Git, and publishing with one command is valuable for everyone from individual bloggers to large content teams.

**Get started now**:

- Create a TypeScript project based on this guide's code
- Write your first post in markdown
- Publish with `blog publish` CLI command
- Experience the power of WordPress automation!

**Series connection**:

- Previous: If you want to learn Node.js CLI tool basics first, check the previous series post
- Next: We'll cover building a fully automated pipeline with AI in the next post!
