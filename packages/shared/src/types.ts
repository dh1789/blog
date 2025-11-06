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

/**
 * WordPress 미디어 아이템
 */
export interface MediaItem {
  id: number;
  url: string;
  source_url: string;
  title: string;
  alt_text?: string;
  media_details?: {
    width: number;
    height: number;
    file: string;
  };
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
  /**
   * 가이드라인 파일 경로 (선택)
   * 예: 'prompts/blog-post-guidelines.md'
   * 기본값: prompts/blog-post-guidelines.md
   */
  guidelines?: string;
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
  slug?: string;
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
  revenue?: boolean; // 수익성 분석 활성화 (Google Keyword Planner API)
  outputFile?: string; // 결과 출력 파일 경로
  format?: 'table' | 'json'; // 출력 형식
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
 * 수익성 분석이 포함된 트렌드 점수
 * (TrendScore를 확장하여 키워드 수익성 데이터 추가)
 */
export interface ScoredTrendingTopic extends TrendScore {
  revenueData?: KeywordData; // 키워드 데이터 (검색량, CPC, 경쟁 강도)
  revenueScore?: RevenueScore; // 수익성 점수
}

/**
 * 주제 추천 우선순위
 */
export type TopicPriority = 'high' | 'medium' | 'low';

/**
 * 주제 추천 결과
 */
export interface SuggestedTopic {
  topic: TrendingTopic; // 트렌딩 토픽 원본 데이터
  priority: TopicPriority; // 우선순위 (high/medium/low)
  combinedScore: number; // 종합 점수 (0-100)
  scoreBreakdown: {
    trendScore: number; // 트렌드 점수 (0-100)
    revenueScore: number; // 수익성 점수 (0-100)
    seoScore: number; // SEO 난이도 점수 (0-100, 낮을수록 좋음)
    relevanceScore: number; // 키워드 관련성 점수 (0-100)
  };
  reason: string; // 추천 이유
  estimatedRevenue?: {
    conservative: number; // 보수적 예상 수익
    optimistic: number; // 낙관적 예상 수익
  };
  revenueData?: KeywordData; // 키워드 수익성 데이터
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

/**
 * 키워드 데이터 (Google Keyword Planner API)
 */
export interface KeywordData {
  keyword: string;
  searchVolume: number; // 월간 검색량
  cpc: number; // Cost Per Click (USD)
  competition: 'LOW' | 'MEDIUM' | 'HIGH'; // 경쟁 강도
  competitionIndex?: number; // 경쟁 지수 (0-100)
}

/**
 * 정규화된 키워드 지표
 */
export interface KeywordMetrics {
  searchVolumeScore: number; // 0-1 정규화
  cpcScore: number; // 0-1 정규화
  competitionScore: number; // 0-1 정규화 (낮을수록 좋음)
}

/**
 * 수익성 점수
 */
export interface RevenueScore {
  keyword: string;
  totalScore: number; // 0-100 종합 점수
  metrics: KeywordMetrics;
  expectedRevenue: {
    conservative: number; // 보수적 예상 수익 (USD/월)
    optimistic: number; // 낙관적 예상 수익 (USD/월)
  };
  ranking: {
    overall: number; // 전체 순위
    byVolume: number; // 검색량 순위
    byRevenue: number; // 수익 순위
  };
}

/**
 * 주제 추천
 */
export interface TopicSuggestion {
  title: string; // 추천 제목
  keywords: string[]; // 관련 키워드들
  template: string; // 사용된 템플릿 ("완벽 가이드", "TOP 10" 등)
  estimatedRevenue: {
    conservative: number; // 보수적 예상 수익 (USD/월)
    optimistic: number; // 낙관적 예상 수익 (USD/월)
  };
  keywordScores: RevenueScore[]; // 키워드별 수익성 점수
}

/**
 * 수익성 분석 옵션
 */
export interface RevenueAnalysisOptions {
  minSearchVolume?: number; // 최소 검색량 필터
  maxCompetition?: 'LOW' | 'MEDIUM' | 'HIGH'; // 최대 경쟁 강도
  minCpc?: number; // 최소 CPC (USD)
  maxCpc?: number; // 최대 CPC (USD)
  limit?: number; // 결과 개수 제한
}

// ============================================================================
// Translation Types (자동 번역 시스템)
// ============================================================================

/**
 * 번역 옵션
 */
export interface TranslationOptions {
  targetLang?: 'ko' | 'en';
  preserveCodeBlocks?: boolean;
  timeout?: number;
}

/**
 * 번역 검증 결과
 */
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  metrics: TranslationQualityMetrics;
}

/**
 * 검증 이슈
 */
export interface ValidationIssue {
  type: 'metadata' | 'content' | 'quality' | 'seo';
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

/**
 * 번역 품질 메트릭
 */
export interface TranslationQualityMetrics {
  lineCountDiff: number; // 라인 수 차이 (절대값)
  lineCountDiffPercent: number; // 라인 수 차이 비율 (%)
  preservedCodeBlocks: number; // 보존된 코드 블록 수
  metadataComplete: boolean; // 메타데이터 완전성
  seoOptimized: boolean; // SEO 최적화 여부
  titleLength: number; // 제목 길이
  excerptLength: number; // Excerpt 길이
}

// ============================================================================
// Image Benchmark Types (이미지 벤치마크 시스템)
// ============================================================================

/**
 * 이미지 메타데이터
 */
export interface ImageMetadata {
  src: string;
  width: number | null;
  height: number | null;
  format: string;
  alt: string;
}

/**
 * 포스트 분석 결과
 */
export interface PostAnalysis {
  url: string;
  imageCount: number;
  images: ImageMetadata[];
  wordCount: number;
}

/**
 * 블로그 크롤링 결과
 */
export interface BlogCrawlResult {
  blog: string;
  url: string;
  totalPosts: number;
  posts: PostAnalysis[];
}

/**
 * 이미지 기본 설정 (Featured Image)
 */
export interface FeaturedImageConfig {
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
  format: string;
  fallbackFormat: string;
  quality: number;
  maxFileSize: number;
  maxFileSizeReadable: string;
  rationale: string;
}

/**
 * 이미지 기본 설정 (Content Images)
 */
export interface ContentImagesConfig {
  description: string;
  count: {
    min: number;
    max: number;
    recommended: number;
    countRule: string;
  };
  placement: {
    strategy: string;
    alternativeStrategy: string;
    rationale: string;
  };
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  format: string;
  fallbackFormat: string;
  quality: number;
  maxFileSize: number;
  maxFileSizeReadable: string;
  rationale: string;
}

/**
 * 이미지 기본 설정 전체
 */
export interface ImageDefaults {
  $schema: string;
  title: string;
  description: string;
  version: string;
  lastUpdated: string;
  source: string;
  methodology: string;
  featuredImage: FeaturedImageConfig;
  contentImages: ContentImagesConfig;
  performance: {
    targetMetrics: {
      timeOnPage: string;
      bounceRate: string;
      pageViews: string;
    };
    constraints: {
      totalImagesPerPost: string;
      adSenseBalance: string;
      loadingSpeed: string;
    };
  };
  benchmark: {
    realCrawling: {
      averageImagesPerPost: number;
      commonSizes: string[];
      commonFormats: Record<string, string>;
    };
    referenceData: {
      averageImagesPerPost: number;
      recommendedSize: string;
      recommendedFormat: string;
    };
    finalDecision: string;
  };
  compatibility: {
    wordpress: string;
    avadaTheme: string;
    browser: string;
    mobileFirst: boolean;
  };
  seo: {
    openGraphCompliant: boolean;
    googleRecommended: boolean;
    imageToWordRatio: string;
    altTextRequired: boolean;
    lazyLoadingRecommended: boolean;
  };
}

/**
 * 벤치마크 분석 옵션
 */
export interface BenchmarkAnalysisOptions {
  targetBlogs?: string[]; // 크롤링 대상 블로그 URL 리스트
  postsPerBlog?: number; // 블로그당 샘플링할 포스트 수
  outputPath?: string; // 결과 저장 경로
  timeout?: number; // 크롤링 타임아웃 (ms)
}

/**
 * 벤치마크 분석 결과
 */
export interface BenchmarkAnalysisResult {
  success: boolean;
  crawlResults: BlogCrawlResult[];
  imageDefaults: ImageDefaults;
  error?: string;
}

// ============================================================================
// Spike Validation Types (이미지 생성 엔진 스파이크 검증)
// ============================================================================

/**
 * Task 2.1: 기본 이미지 생성 검증 결과
 */
export interface Task21Result {
  success: boolean;
  imageUrl: string;
  revisedPrompt?: string;
  generationTime: number;
  fileSize: number;
  error?: string;
}

/**
 * Task 2.2: 품질/크기 제어 검증 결과
 */
export interface Task22Result {
  success: boolean;
  testCases: Array<{
    name: string;
    size: string;
    quality: string;
    imageUrl: string;
    generationTime: number;
    fileSize: number;
    success: boolean;
    error?: string;
  }>;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

/**
 * Task 2.3: 비용 및 속도 측정 결과
 */
export interface Task23Result {
  success: boolean;
  iterations: number;
  generationTimes: number[];
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalCost: number;
  costPerImage: number;
  validation: {
    avgTimeUnder30s: boolean;
    avgCostUnder010: boolean;
  };
}

/**
 * Task 2.4: 블로그 컨텍스트 기반 생성 테스트 결과
 */
export interface Task24Result {
  success: boolean;
  testCases: Array<{
    name: string;
    context: string;
    imageUrl: string;
    generationTime: number;
    success: boolean;
    error?: string;
  }>;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

/**
 * 전체 스파이크 검증 결과
 */
export interface SpikeValidationResult {
  timestamp: string;
  dalleModel: string;
  openaiApiKey: string;
  task21: Task21Result;
  task22: Task22Result;
  task23: Task23Result;
  task24: Task24Result;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    totalCost: number;
    averageGenerationTime: number;
  };
}
