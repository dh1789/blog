/**
 * SEO 자동화 모듈
 * - 메타 태그 생성
 * - Open Graph 태그 생성
 * - Twitter Card 태그 생성
 * - 키워드 밀도 분석
 * - 한글 slug 영문 변환
 */

import { transliterate, slugify } from 'transliteration';
import type {
  SeoData,
  SeoOptions,
  SeoMetaTags,
  OpenGraphTags,
  TwitterCardTags,
  KeywordDensity,
} from '@blog/shared';

/**
 * SEO 데이터 생성
 */
export function generateSeoData(options: SeoOptions): SeoData {
  const {
    title,
    excerpt,
    content,
    keywords,
    url,
    imageUrl,
    siteName,
    language = 'ko',
  } = options;

  // Slug 생성 (한글 → 영문 변환)
  const slug = generateSlug(title);

  // SEO 메타 태그 생성
  const meta = generateMetaTags({
    title,
    description: excerpt,
    keywords,
  });

  // Open Graph 태그 생성
  const openGraph = generateOpenGraphTags({
    title,
    description: excerpt,
    url,
    imageUrl,
    siteName,
    language,
  });

  // Twitter Card 태그 생성
  const twitterCard = generateTwitterCardTags({
    title,
    description: excerpt,
    imageUrl,
  });

  return {
    meta,
    openGraph,
    twitterCard,
    slug,
  };
}

/**
 * SEO 메타 태그 생성
 */
export function generateMetaTags(options: {
  title: string;
  description: string;
  keywords: string[];
}): SeoMetaTags {
  const { title, description, keywords } = options;

  return {
    title,
    description,
    keywords,
    robots: 'index, follow',
  };
}

/**
 * Open Graph 태그 생성
 */
export function generateOpenGraphTags(options: {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  siteName?: string;
  language?: 'ko' | 'en';
}): OpenGraphTags {
  const { title, description, url, imageUrl, siteName, language = 'ko' } = options;

  const locale = language === 'ko' ? 'ko_KR' : 'en_US';

  return {
    'og:title': title,
    'og:description': description,
    'og:type': 'article',
    'og:url': url,
    'og:image': imageUrl,
    'og:locale': locale,
    'og:site_name': siteName,
  };
}

/**
 * Twitter Card 태그 생성
 */
export function generateTwitterCardTags(options: {
  title: string;
  description: string;
  imageUrl?: string;
  site?: string;
  creator?: string;
}): TwitterCardTags {
  const { title, description, imageUrl, site, creator } = options;

  return {
    'twitter:card': imageUrl ? 'summary_large_image' : 'summary',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': imageUrl,
    'twitter:site': site,
    'twitter:creator': creator,
  };
}

/**
 * 한글 slug 영문 변환
 */
export function generateSlug(title: string): string {
  // 한글을 로마자로 변환
  const romanized = transliterate(title);

  // URL-safe slug 생성
  const slug = slugify(romanized, {
    lowercase: true,
    separator: '-',
    replace: {
      '&': 'and',
      '@': 'at',
    },
  });

  return slug;
}

/**
 * 키워드 밀도 분석
 * 최적 밀도: 0.5% ~ 2.5%
 */
export function analyzeKeywordDensity(
  content: string,
  keywords: string[]
): KeywordDensity[] {
  // 텍스트에서 HTML 태그 제거
  const plainText = content.replace(/<[^>]*>/g, ' ');

  // 단어 개수 계산 (공백 기준)
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const totalWords = words.length;

  // 각 키워드별 밀도 계산
  return keywords.map((keyword) => {
    const regex = new RegExp(escapeRegExp(keyword), 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;

    // 최적 밀도: 0.5% ~ 2.5%
    const isOptimal = density >= 0.5 && density <= 2.5;

    return {
      keyword,
      count,
      density: Math.round(density * 100) / 100, // 소수점 2자리
      isOptimal,
    };
  });
}

/**
 * 키워드 밀도 검증
 */
export function validateKeywordDensity(
  content: string,
  keywords: string[]
): {
  valid: boolean;
  warnings: string[];
  densities: KeywordDensity[];
} {
  const densities = analyzeKeywordDensity(content, keywords);
  const warnings: string[] = [];

  for (const density of densities) {
    if (density.density < 0.5) {
      warnings.push(
        `키워드 "${density.keyword}"의 밀도가 너무 낮습니다 (${density.density}%). 최소 0.5% 이상 권장됩니다.`
      );
    } else if (density.density > 2.5) {
      warnings.push(
        `키워드 "${density.keyword}"의 밀도가 너무 높습니다 (${density.density}%). 최대 2.5% 이하 권장됩니다.`
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
    densities,
  };
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * SEO 점수 계산
 */
export function calculateSeoScore(options: {
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
}): {
  score: number;
  maxScore: number;
  details: {
    category: string;
    score: number;
    maxScore: number;
    description: string;
  }[];
} {
  const { title, excerpt, content, keywords } = options;
  const details: {
    category: string;
    score: number;
    maxScore: number;
    description: string;
  }[] = [];

  let totalScore = 0;
  const maxScore = 100;

  // 1. 제목 길이 (10점)
  const titleLength = title.length;
  let titleScore = 0;
  if (titleLength >= 30 && titleLength <= 60) {
    titleScore = 10;
  } else if (titleLength >= 20 && titleLength <= 70) {
    titleScore = 7;
  } else if (titleLength >= 10 && titleLength <= 80) {
    titleScore = 5;
  }
  totalScore += titleScore;
  details.push({
    category: '제목 길이',
    score: titleScore,
    maxScore: 10,
    description: `${titleLength}자 (최적: 30-60자)`,
  });

  // 2. 요약 길이 (10점)
  const excerptLength = excerpt.length;
  let excerptScore = 0;
  if (excerptLength >= 120 && excerptLength <= 160) {
    excerptScore = 10;
  } else if (excerptLength >= 100 && excerptLength <= 200) {
    excerptScore = 7;
  } else if (excerptLength >= 80 && excerptLength <= 250) {
    excerptScore = 5;
  }
  totalScore += excerptScore;
  details.push({
    category: '요약 길이',
    score: excerptScore,
    maxScore: 10,
    description: `${excerptLength}자 (최적: 120-160자)`,
  });

  // 3. 콘텐츠 길이 (20점)
  const contentWords = content.split(/\s+/).filter((w) => w.length > 0).length;
  let contentScore = 0;
  if (contentWords >= 1500) {
    contentScore = 20;
  } else if (contentWords >= 1000) {
    contentScore = 15;
  } else if (contentWords >= 500) {
    contentScore = 10;
  } else if (contentWords >= 300) {
    contentScore = 5;
  }
  totalScore += contentScore;
  details.push({
    category: '콘텐츠 길이',
    score: contentScore,
    maxScore: 20,
    description: `${contentWords}단어 (최적: 1500+ 단어)`,
  });

  // 4. 키워드 밀도 (30점)
  const densityValidation = validateKeywordDensity(content, keywords);
  const optimalCount = densityValidation.densities.filter((d) => d.isOptimal).length;
  const densityScore = Math.round((optimalCount / keywords.length) * 30);
  totalScore += densityScore;
  details.push({
    category: '키워드 밀도',
    score: densityScore,
    maxScore: 30,
    description: `${optimalCount}/${keywords.length} 키워드가 최적 범위 (0.5-2.5%)`,
  });

  // 5. 제목에 키워드 포함 (15점)
  const titleKeywordCount = keywords.filter((kw) =>
    title.toLowerCase().includes(kw.toLowerCase())
  ).length;
  const titleKeywordScore = Math.round((titleKeywordCount / keywords.length) * 15);
  totalScore += titleKeywordScore;
  details.push({
    category: '제목 키워드',
    score: titleKeywordScore,
    maxScore: 15,
    description: `${titleKeywordCount}/${keywords.length} 키워드가 제목에 포함`,
  });

  // 6. 요약에 키워드 포함 (15점)
  const excerptKeywordCount = keywords.filter((kw) =>
    excerpt.toLowerCase().includes(kw.toLowerCase())
  ).length;
  const excerptKeywordScore = Math.round((excerptKeywordCount / keywords.length) * 15);
  totalScore += excerptKeywordScore;
  details.push({
    category: '요약 키워드',
    score: excerptKeywordScore,
    maxScore: 15,
    description: `${excerptKeywordCount}/${keywords.length} 키워드가 요약에 포함`,
  });

  return {
    score: totalScore,
    maxScore,
    details,
  };
}
