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
    content: _content,
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
 * 키워드 밀도 분석 (포스트 길이 고려)
 * Guidelines v1.3: 긴 포스트는 목표 밀도를 동적으로 조정
 *
 * @param content - 분석할 콘텐츠
 * @param keywords - 키워드 목록
 * @param postLength - 포스트 줄 수 (옵션, 기본값 사용 시 0.5-2.5%)
 */
export function analyzeKeywordDensity(
  content: string,
  keywords: string[],
  postLength?: number
): KeywordDensity[] {
  // 텍스트에서 HTML 태그 제거
  const plainText = content.replace(/<[^>]*>/g, ' ');

  // 단어 개수 계산 (공백 기준)
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const totalWords = words.length;

  // 길이별 가중치 계산
  const lengthFactor = postLength ? calculateLengthFactor(postLength) : 1.0;

  // 목표 밀도 계산 (기본: 0.5-2.5%, 길이별 조정)
  const minDensity = 0.5 * lengthFactor;
  const maxDensity = 2.5 * lengthFactor;

  // 각 키워드별 밀도 계산
  return keywords.map((keyword) => {
    const regex = new RegExp(escapeRegExp(keyword), 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;

    // 최적 밀도: 길이별로 동적 조정
    const isOptimal = density >= minDensity && density <= maxDensity;

    return {
      keyword,
      count,
      density: Math.round(density * 100) / 100, // 소수점 2자리
      isOptimal,
    };
  });
}

/**
 * 키워드 밀도 검증 (포스트 길이 고려)
 * Guidelines v1.3: 긴 포스트는 목표 밀도를 동적으로 조정
 *
 * @param content - 분석할 콘텐츠
 * @param keywords - 키워드 목록
 * @param postLength - 포스트 줄 수 (옵션)
 */
export function validateKeywordDensity(
  content: string,
  keywords: string[],
  postLength?: number
): {
  valid: boolean;
  warnings: string[];
  densities: KeywordDensity[];
  targetDensity?: { min: number; max: number };
} {
  const densities = analyzeKeywordDensity(content, keywords, postLength);
  const warnings: string[] = [];

  // 길이별 가중치 계산
  const lengthFactor = postLength ? calculateLengthFactor(postLength) : 1.0;
  const minDensity = 0.5 * lengthFactor;
  const maxDensity = 2.5 * lengthFactor;

  for (const density of densities) {
    if (density.density < minDensity) {
      warnings.push(
        `키워드 "${density.keyword}"의 밀도가 너무 낮습니다 (${density.density}%). 최소 ${minDensity.toFixed(2)}% 이상 권장됩니다.`
      );
    } else if (density.density > maxDensity) {
      warnings.push(
        `키워드 "${density.keyword}"의 밀도가 너무 높습니다 (${density.density}%). 최대 ${maxDensity.toFixed(2)}% 이하 권장됩니다.`
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
    densities,
    targetDensity: { min: minDensity, max: maxDensity },
  };
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 섹션별 키워드 분포 분석
 * Guidelines v1.3: 키워드가 모든 섹션에 균등하게 분포되어야 함
 *
 * @param content - 마크다운 콘텐츠
 * @param keywords - 키워드 목록
 * @returns 섹션별 키워드 출현 횟수
 */
export function analyzeSectionDistribution(
  content: string,
  keywords: string[]
): {
  sectionTitle: string;
  keywordCounts: Record<string, number>;
  totalKeywords: number;
}[] {
  // H2 제목으로 섹션 분리
  const sections = content.split(/\n## /);

  // 각 섹션 분석
  return sections.map((section, index) => {
    let sectionTitle: string;
    let sectionContent: string;

    if (index === 0) {
      // 첫 번째 섹션 (Introduction): 제목이 없으므로 전체가 내용
      sectionTitle = '(Introduction)';
      sectionContent = section;
    } else {
      // 나머지 섹션: 첫 줄이 제목, 나머지가 내용
      const lines = section.split('\n');
      sectionTitle = lines[0] || '(Untitled)';
      sectionContent = lines.slice(1).join('\n');
    }

    // 각 키워드 출현 횟수 계산
    const keywordCounts: Record<string, number> = {};
    let totalKeywords = 0;

    keywords.forEach((keyword) => {
      // Use word boundaries to match whole words only
      const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'gi');
      const matches = sectionContent.match(regex);
      const count = matches ? matches.length : 0;
      keywordCounts[keyword] = count;
      totalKeywords += count;
    });

    return {
      sectionTitle,
      keywordCounts,
      totalKeywords,
    };
  });
}

/**
 * 포스트 길이 계산 (줄 수)
 * Guidelines v1.3: 포스트 길이별 SEO 목표 조정에 사용
 */
export function calculatePostLength(content: string, excludeEmpty = true): number {
  const lines = content.split('\n');

  if (excludeEmpty) {
    // 빈 줄 제외 (공백만 있는 줄도 제외)
    return lines.filter((line) => line.trim().length > 0).length;
  }

  return lines.length;
}

/**
 * 포스트 길이별 가중치 계산
 * Guidelines v1.3: 긴 포스트는 키워드 밀도 목표를 낮춤
 *
 * @param postLength - 포스트 줄 수
 * @returns 가중치 (0.7 ~ 1.0)
 */
export function calculateLengthFactor(postLength: number): number {
  if (postLength < 500) {
    // 짧은 포스트: 기본 밀도 유지
    return 1.0;
  } else if (postLength < 1000) {
    // 중간 포스트: 10% 감소
    return 0.9;
  } else if (postLength < 1500) {
    // 긴 포스트: 20% 감소
    return 0.8;
  } else {
    // 매우 긴 포스트: 30% 감소
    return 0.7;
  }
}

/**
 * SEO 점수 계산 (포스트 길이 및 섹션 분포 고려)
 * Guidelines v1.3: 긴 포스트는 목표 밀도를 동적으로 조정하고, 섹션 분포를 평가
 */
export function calculateSeoScore(options: {
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
}): {
  score: number;
  maxScore: number;
  postLength?: number;
  lengthFactor?: number;
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

  // 포스트 길이 계산 (Guidelines v1.3)
  const postLength = calculatePostLength(content);
  const lengthFactor = calculateLengthFactor(postLength);

  // 1. 제목 길이 (5점)
  const titleLength = title.length;
  let titleScore = 0;
  if (titleLength >= 30 && titleLength <= 60) {
    titleScore = 5;
  } else if (titleLength >= 20 && titleLength <= 70) {
    titleScore = 3;
  } else if (titleLength >= 10 && titleLength <= 80) {
    titleScore = 2;
  }
  totalScore += titleScore;
  details.push({
    category: '제목 길이',
    score: titleScore,
    maxScore: 5,
    description: `${titleLength}자 (최적: 30-60자)`,
  });

  // 2. 요약 길이 (5점)
  const excerptLength = excerpt.length;
  let excerptScore = 0;
  if (excerptLength >= 120 && excerptLength <= 160) {
    excerptScore = 5;
  } else if (excerptLength >= 100 && excerptLength <= 200) {
    excerptScore = 3;
  } else if (excerptLength >= 80 && excerptLength <= 250) {
    excerptScore = 2;
  }
  totalScore += excerptScore;
  details.push({
    category: '요약 길이',
    score: excerptScore,
    maxScore: 5,
    description: `${excerptLength}자 (최적: 120-160자)`,
  });

  // 3. 콘텐츠 길이 (10점)
  const contentWords = content.split(/\s+/).filter((w) => w.length > 0).length;
  let contentScore = 0;
  if (contentWords >= 1500) {
    contentScore = 10;
  } else if (contentWords >= 1000) {
    contentScore = 7;
  } else if (contentWords >= 500) {
    contentScore = 5;
  } else if (contentWords >= 300) {
    contentScore = 3;
  }
  totalScore += contentScore;
  details.push({
    category: '콘텐츠 길이',
    score: contentScore,
    maxScore: 10,
    description: `${contentWords}단어 (최적: 1500+ 단어)`,
  });

  // 4. 키워드 밀도 (30점, 포스트 길이 고려)
  const densityValidation = validateKeywordDensity(content, keywords, postLength);
  const optimalCount = densityValidation.densities.filter((d) => d.isOptimal).length;
  const densityScore = Math.round((optimalCount / keywords.length) * 30);
  totalScore += densityScore;
  const targetRange = densityValidation.targetDensity
    ? `${densityValidation.targetDensity.min.toFixed(2)}-${densityValidation.targetDensity.max.toFixed(2)}%`
    : '0.5-2.5%';
  details.push({
    category: '키워드 밀도',
    score: densityScore,
    maxScore: 30,
    description: `${optimalCount}/${keywords.length} 키워드가 최적 범위 (${targetRange}, 길이: ${postLength}줄)`,
  });

  // 5. 섹션 분포 (20점, Guidelines v1.3)
  const sectionDistribution = analyzeSectionDistribution(content, keywords);
  const sectionsWithKeywords = sectionDistribution.filter((s) => s.totalKeywords > 0).length;
  const totalSections = sectionDistribution.length;
  let distributionScore = 0;
  if (totalSections > 0) {
    const distributionRatio = sectionsWithKeywords / totalSections;
    // 50% 이상의 섹션에 키워드가 있으면 만점
    if (distributionRatio >= 0.5) {
      distributionScore = 20;
    } else if (distributionRatio >= 0.3) {
      distributionScore = 15;
    } else if (distributionRatio >= 0.2) {
      distributionScore = 10;
    } else if (distributionRatio > 0) {
      distributionScore = 5;
    }
  }
  totalScore += distributionScore;
  details.push({
    category: '섹션 분포',
    score: distributionScore,
    maxScore: 20,
    description: `${sectionsWithKeywords}/${totalSections} 섹션에 키워드 포함`,
  });

  // 6. 제목에 키워드 포함 (15점)
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

  // 7. 요약에 키워드 포함 (15점)
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
    postLength,
    lengthFactor,
    details,
  };
}
