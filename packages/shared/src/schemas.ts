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

/**
 * Epic 8.0: 키워드 수익성 분석 스키마
 */

export const KeywordDataSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  searchVolume: z.number().int().min(0, 'Search volume must be non-negative'),
  cpc: z.number().min(0, 'CPC must be non-negative'),
  competition: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  competitionIndex: z.number().int().min(0).max(100).optional(),
});

export const KeywordMetricsSchema = z.object({
  searchVolumeScore: z.number().min(0).max(1),
  cpcScore: z.number().min(0).max(1),
  competitionScore: z.number().min(0).max(1),
});

export const RevenueScoreSchema = z.object({
  keyword: z.string().min(1),
  totalScore: z.number().min(0).max(100),
  metrics: KeywordMetricsSchema,
  expectedRevenue: z.object({
    conservative: z.number().min(0),
    optimistic: z.number().min(0),
  }),
  ranking: z.object({
    overall: z.number().int().min(1),
    byVolume: z.number().int().min(1),
    byRevenue: z.number().int().min(1),
  }),
});

export const TopicSuggestionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  template: z.string().min(1, 'Template is required'),
  estimatedRevenue: z.object({
    conservative: z.number().min(0),
    optimistic: z.number().min(0),
  }),
  keywordScores: z.array(RevenueScoreSchema),
});

export const RevenueAnalysisOptionsSchema = z.object({
  minSearchVolume: z.number().int().min(0).optional(),
  maxCompetition: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  minCpc: z.number().min(0).optional(),
  maxCpc: z.number().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
// Series Schemas (PRD 0014: 시리즈 포스트 기능)
// ============================================================================

/**
 * 시리즈 정보 스키마
 * 파일명이나 frontmatter에서 추출된 시리즈 메타데이터 검증
 */
export const SeriesInfoSchema = z.object({
  name: z.string().min(1, '시리즈명은 필수입니다'),
  dayNumber: z.number().int('Day 번호는 정수여야 합니다').min(1, 'Day 번호는 1 이상이어야 합니다'),
  docPath: z.string().nullable(),
});

/**
 * URL 매핑 스키마 (Day 번호 → URL)
 * 숫자 키와 문자열 키 모두 허용
 */
const UrlMappingSchema = z.record(
  z.union([z.string(), z.number()]).transform((val) => Number(val)),
  z.string()
);

/**
 * 시리즈 문서 스키마
 * docs/ 폴더의 시리즈 계획 문서에서 추출된 정보 검증
 */
export const SeriesDocumentSchema = z.object({
  koreanUrls: UrlMappingSchema,
  englishUrls: UrlMappingSchema,
  githubUrl: z.string().url('유효한 URL 형식이어야 합니다').nullable(),
  totalDays: z.number().int('총 Day 수는 정수여야 합니다').min(1, '총 Day 수는 1 이상이어야 합니다'),
});

// ============================================================================
// Translation Schemas (자동 번역 시스템)
// ============================================================================

/**
 * 번역 옵션 스키마
 */
export const TranslationOptionsSchema = z.object({
  targetLang: z.enum(['ko', 'en']).optional(),
  preserveCodeBlocks: z.boolean().optional().default(true),
  timeout: z.number().int().min(1000).max(600000).optional(), // 1초~10분
});

/**
 * 검증 이슈 스키마
 */
export const ValidationIssueSchema = z.object({
  type: z.enum(['metadata', 'content', 'quality', 'seo']),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string().min(1, 'Validation message is required'),
  field: z.string().optional(),
});

/**
 * 번역 품질 메트릭 스키마
 */
export const TranslationQualityMetricsSchema = z.object({
  lineCountDiff: z.number().int().min(0, 'Line count diff must be non-negative'),
  lineCountDiffPercent: z.number().min(0).max(100, 'Line count diff percent must be between 0-100'),
  preservedCodeBlocks: z.number().int().min(0, 'Preserved code blocks must be non-negative'),
  metadataComplete: z.boolean(),
  seoOptimized: z.boolean(),
  titleLength: z.number().int().min(0),
  excerptLength: z.number().int().min(0).max(300, 'Excerpt must be 300 characters or less'),
});

/**
 * 번역 검증 결과 스키마
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(ValidationIssueSchema),
  metrics: TranslationQualityMetricsSchema,
});
