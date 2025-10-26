/**
 * Zod 스키마 정의 (런타임 검증)
 */

import { z } from 'zod';

export const WordPressConfigSchema = z.object({
  url: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export const PostMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  slug: z.string().optional(),
  excerpt: z.string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt must be 300 characters or less'),
  status: z.enum(['publish', 'draft', 'pending', 'private']).default('draft'),
  categories: z.array(z.string())
    .min(1, 'At least one category is required')
    .max(5, 'Maximum 5 categories allowed'),
  tags: z.array(z.string())
    .min(3, 'At least 3 tags are required for SEO')
    .max(10, 'Maximum 10 tags allowed'),
  language: z.enum(['ko', 'en']).default('ko'),
  featuredImage: z.string().optional(),
});

export const AdConfigSchema = z.object({
  clientId: z.string(),
  slotId: z.string(),
  positions: z.array(z.enum(['top', 'after-first-paragraph', 'after-first-h2', 'middle', 'bottom'])),
});
