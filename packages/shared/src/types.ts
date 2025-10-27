/**
 * 공유 타입 정의
 */

export interface WordPressConfig {
  url: string;
  username: string;
  password: string;
}

export interface PostMetadata {
  title: string;
  slug?: string;
  excerpt?: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  categories?: string[];
  tags?: string[];
  language: 'ko' | 'en';
  featuredImage?: string;
}

export interface AdConfig {
  clientId: string;
  slotId: string;
  positions: AdPosition[];
}

export type AdPosition =
  | 'top'
  | 'after-first-paragraph'
  | 'after-first-h2'
  | 'middle'
  | 'bottom';

export interface PublishOptions {
  file: string;
  status?: 'publish' | 'draft';
  language?: 'ko' | 'en';
  dryRun?: boolean;
}

/**
 * 프롬프트 템플릿 변수
 */
export interface TemplateVariables {
  TOPIC: string;
  KEYWORDS: string;
  WORDS?: string;
  TITLE?: string;
  CATEGORIES?: string;
  TAGS?: string;
  LANGUAGE?: string;
  [key: string]: string | undefined;
}

/**
 * 템플릿 로드 옵션
 */
export interface TemplateOptions {
  name: string;
  variables: TemplateVariables;
}

/**
 * 템플릿 객체
 */
export interface Template {
  name: string;
  content: string;
  variables: string[];
}

/**
 * Claude Code 실행 옵션
 */
export interface ClaudeOptions {
  prompt: string;
  timeout?: number;
  model?: string;
}

/**
 * Claude Code 응답
 */
export interface ClaudeResponse {
  success: boolean;
  content: string;
  error?: string;
  executionTime?: number;
}

/**
 * 초안 생성 옵션
 */
export interface DraftCreateOptions {
  topic: string;
  keywords: string;
  words?: number;
  template?: string;
  language?: 'ko' | 'en';
  style?: string;
}

/**
 * 초안 수정 옵션
 */
export interface DraftRefineOptions {
  file: string;
  instruction: string;
  timeout?: number;
}

/**
 * SEO 메타 태그
 */
export interface SeoMetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  robots?: string;
}

/**
 * Open Graph 태그
 */
export interface OpenGraphTags {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url'?: string;
  'og:image'?: string;
  'og:locale': string;
  'og:site_name'?: string;
}

/**
 * Twitter Card 태그
 */
export interface TwitterCardTags {
  'twitter:card': 'summary' | 'summary_large_image' | 'app' | 'player';
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image'?: string;
  'twitter:site'?: string;
  'twitter:creator'?: string;
}

/**
 * SEO 데이터
 */
export interface SeoData {
  meta: SeoMetaTags;
  openGraph: OpenGraphTags;
  twitterCard: TwitterCardTags;
  slug: string;
}

/**
 * 키워드 밀도 분석 결과
 */
export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
  isOptimal: boolean;
}

/**
 * SEO 생성 옵션
 */
export interface SeoOptions {
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
  url?: string;
  imageUrl?: string;
  siteName?: string;
  language?: 'ko' | 'en';
}

/**
 * 이미지 생성 옵션
 */
export interface ImageGenerationOptions {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  model?: 'dall-e-2' | 'dall-e-3';
}

/**
 * 이미지 생성 결과
 */
export interface ImageGenerationResult {
  url: string;
  revisedPrompt?: string;
}

/**
 * 트렌드 소스
 */
export type TrendSource = 'reddit' | 'hackernews' | 'twitter';

/**
 * 트렌딩 토픽
 */
export interface TrendingTopic {
  id: string;
  title: string;
  url: string;
  source: TrendSource;
  score: number;
  comments: number;
  author?: string;
  createdAt: Date;
  subreddit?: string; // Reddit 전용
  hashtags?: string[]; // Twitter 전용
}

/**
 * 트렌딩 옵션
 */
export interface TrendingOptions {
  sources?: TrendSource[];
  limit?: number;
  minScore?: number;
  keywords?: string[];
  language?: 'ko' | 'en';
}

/**
 * 트렌드 점수
 */
export interface TrendScore {
  topic: TrendingTopic;
  finalScore: number;
  scoreBreakdown: {
    upvotes: number;
    comments: number;
    recency: number;
    keywordMatch: number;
  };
}

/**
 * 블로그 포스트 통계
 */
export interface PostStats {
  id: number;
  title: string;
  url: string;
  publishedDate: Date;
  views: number;
  likes?: number;
  comments: number;
  shares?: number;
}

/**
 * 기간별 통계
 */
export interface PeriodStats {
  period: 'day' | 'week' | 'month' | 'year';
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  averageViewsPerPost: number;
}

/**
 * 분석 대시보드 데이터
 */
export interface AnalyticsDashboard {
  summary: {
    totalPosts: number;
    totalViews: number;
    totalComments: number;
    averageViewsPerPost: number;
  };
  topPosts: PostStats[];
  recentPosts: PostStats[];
  periodStats: PeriodStats;
}

/**
 * 분석 옵션
 */
export interface AnalyticsOptions {
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  sortBy?: 'views' | 'comments' | 'date';
}
