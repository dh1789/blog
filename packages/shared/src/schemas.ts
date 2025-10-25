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
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['publish', 'draft', 'pending', 'private']).default('draft'),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(['ko', 'en']).default('ko'),
  featuredImage: z.string().optional(),
});

export const AdConfigSchema = z.object({
  clientId: z.string(),
  slotId: z.string(),
  positions: z.array(z.enum(['top', 'after-first-paragraph', 'after-first-h2', 'middle', 'bottom'])),
});
