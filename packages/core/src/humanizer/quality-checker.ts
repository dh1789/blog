/**
 * @file 품질 검토 시스템
 * @description PRD 0016 - Phase 5: 품질 검토 시스템
 *
 * 포스트 품질을 종합적으로 검사하고 개선 사항을 제안합니다.
 *
 * 검사 항목:
 * - 경험담 포함 여부
 * - 이미지 품질 (개수, alt 텍스트)
 * - 번역 품질 (영문 포스트)
 * - SEO 점수
 * - 가독성 점수
 */

import type { QualityChecklist } from './types';
import { analyzeTranslationQuality } from './native-translator';

/**
 * 경험담 검사 결과
 */
export interface PersonalExperienceResult {
  hasPersonalExperience: boolean;
  experienceNaturallyIntegrated: boolean;
  indicators: string[];
}

/**
 * 이미지 검사 결과
 */
export interface ImageCheckResult {
  imageCount: number;
  imagesHaveAltText: boolean;
  imagesWithoutAlt: string[];
}

/**
 * 번역 품질 검사 결과
 */
export interface TranslationQualityResult {
  noDirectTranslation: boolean;
  nativeStyleScore: number;
  issues: string[];
}

/**
 * 품질 이슈
 */
export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'experience' | 'image' | 'translation' | 'seo' | 'readability';
  message: string;
  suggestion?: string;
}

/**
 * 품질 검사 결과
 */
export interface QualityCheckResult {
  checklist: QualityChecklist;
  issues: QualityIssue[];
  overallScore: number;
}

/**
 * 경험담 지표 패턴 (한국어)
 */
const KOREAN_EXPERIENCE_PATTERNS: RegExp[] = [
  /저[는가의]?\s/,
  /나[는가의]?\s/,
  /제[가]?\s/,
  /내[가]?\s/,
  /경험[을했상]/,
  /직접\s/,
  /실제로\s/,
  /처음\s.*[때했]/,
  /배우[면었]/,
  /해[보봤]/,
  /느[꼈낀]/,
  /어려[웠움]/,
  /쉬[웠움]/,
  /[좋나흥]았/,
];

/**
 * 경험담 지표 패턴 (영어)
 */
const ENGLISH_EXPERIENCE_PATTERNS: RegExp[] = [
  /\bI\s+(have|had|am|was|found|learned|tried|experienced)/i,
  /\bmy\s+(experience|journey|project|work)/i,
  /\bin my\s/i,
  /\bpersonally\b/i,
  /\bfirsthand\b/i,
  /\bwhen I\s/i,
];

/**
 * 마크다운 이미지 패턴
 */
const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;
const HTML_IMAGE_PATTERN = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
const HTML_IMG_ALT_PATTERN = /<img\s+[^>]*alt=["']([^"']+)["'][^>]*>/gi;

/**
 * 경험담 포함 여부 검사
 */
export function checkPersonalExperience(content: string): PersonalExperienceResult {
  if (!content || content.trim() === '') {
    return {
      hasPersonalExperience: false,
      experienceNaturallyIntegrated: false,
      indicators: [],
    };
  }

  // 코드 블록 제거
  const cleanContent = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  const indicators: string[] = [];

  // 한국어 패턴 검사
  for (const pattern of KOREAN_EXPERIENCE_PATTERNS) {
    const matches = cleanContent.match(pattern);
    if (matches) {
      indicators.push(...matches);
    }
  }

  // 영어 패턴 검사
  for (const pattern of ENGLISH_EXPERIENCE_PATTERNS) {
    const matches = cleanContent.match(pattern);
    if (matches) {
      indicators.push(...matches);
    }
  }

  const hasExperience = indicators.length > 0;

  // 자연스러운 통합 검사 (여러 섹션에 걸쳐 경험담이 분포되어 있는지)
  const sections = cleanContent.split(/^##?\s+/m);
  let sectionsWithExperience = 0;

  for (const section of sections) {
    const hasExperienceInSection =
      KOREAN_EXPERIENCE_PATTERNS.some((p) => p.test(section)) ||
      ENGLISH_EXPERIENCE_PATTERNS.some((p) => p.test(section));
    if (hasExperienceInSection) {
      sectionsWithExperience++;
    }
  }

  // 자연스러운 통합: 경험담이 있고, 여러 섹션에 분포 또는 적절한 위치에 있음
  const experienceNaturallyIntegrated = hasExperience && sectionsWithExperience >= 1;

  return {
    hasPersonalExperience: hasExperience,
    experienceNaturallyIntegrated,
    indicators: [...new Set(indicators)], // 중복 제거
  };
}

/**
 * 이미지 품질 검사
 */
export function checkImages(content: string): ImageCheckResult {
  if (!content || content.trim() === '') {
    return {
      imageCount: 0,
      imagesHaveAltText: true,
      imagesWithoutAlt: [],
    };
  }

  const imagesWithoutAlt: string[] = [];
  let totalImages = 0;
  let imagesWithAlt = 0;

  // 마크다운 이미지 검사
  const mdMatches = [...content.matchAll(MARKDOWN_IMAGE_PATTERN)];
  for (const match of mdMatches) {
    totalImages++;
    const altText = match[1].trim();
    const src = match[2];
    if (altText && altText.length > 0) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt.push(src);
    }
  }

  // HTML img 태그 검사
  const htmlSrcMatches = [...content.matchAll(HTML_IMAGE_PATTERN)];
  const htmlAltMatches = [...content.matchAll(HTML_IMG_ALT_PATTERN)];

  for (const match of htmlSrcMatches) {
    totalImages++;
    const src = match[1];

    // 같은 위치에 alt 속성이 있는지 확인
    const hasAlt = htmlAltMatches.some((altMatch) => {
      return match[0].includes(altMatch[1]) && altMatch[1].trim().length > 0;
    });

    // 더 정밀한 alt 검사: img 태그 내에 alt 속성이 있는지 확인
    const imgTag = match[0];
    const altInTag = /alt=["']([^"']+)["']/i.exec(imgTag);

    if (altInTag && altInTag[1].trim().length > 0) {
      imagesWithAlt++;
    } else if (hasAlt) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt.push(src);
    }
  }

  return {
    imageCount: totalImages,
    imagesHaveAltText: totalImages === 0 || imagesWithAlt === totalImages,
    imagesWithoutAlt,
  };
}

/**
 * 번역 품질 검사 (영문 포스트용)
 */
export function checkTranslationQuality(
  content: string,
  language: 'ko' | 'en'
): TranslationQualityResult {
  // 한국어는 번역 검사 스킵
  if (language === 'ko') {
    return {
      noDirectTranslation: true,
      nativeStyleScore: 100,
      issues: [],
    };
  }

  if (!content || content.trim() === '') {
    return {
      noDirectTranslation: true,
      nativeStyleScore: 0,
      issues: [],
    };
  }

  // 번역 품질 분석
  const analysis = analyzeTranslationQuality(content);
  const issues: string[] = [];

  // 직역 패턴 검사
  const hasDirectTranslation = analysis.directTranslationPatterns.length > 0;
  if (hasDirectTranslation) {
    for (const pattern of analysis.directTranslationPatterns) {
      issues.push(`직역 패턴 감지: "${pattern}"`);
    }
  }

  // 한국어 구조 패턴 검사
  if (analysis.koreanStructurePatterns.length > 0) {
    for (const pattern of analysis.koreanStructurePatterns) {
      issues.push(`한국어 구조 감지: "${pattern}"`);
    }
  }

  // 수동태 비율 검사
  if (analysis.passiveVoiceRatio > 0.2) {
    issues.push(`수동태 비율 높음: ${Math.round(analysis.passiveVoiceRatio * 100)}%`);
  }

  // 네이티브 스타일 점수 계산 (0-100)
  let nativeStyleScore = 100;

  // 직역 패턴 감점 (패턴당 -15점)
  nativeStyleScore -= analysis.directTranslationPatterns.length * 15;

  // 한국어 구조 패턴 감점 (패턴당 -10점)
  nativeStyleScore -= analysis.koreanStructurePatterns.length * 10;

  // 수동태 비율 감점 (20% 초과시 초과분당 -2점)
  if (analysis.passiveVoiceRatio > 0.2) {
    nativeStyleScore -= Math.floor((analysis.passiveVoiceRatio - 0.2) * 100) * 2;
  }

  // 문장 길이 감점 (30단어 초과시)
  if (analysis.averageSentenceLength > 30) {
    nativeStyleScore -= 10;
  }

  // 최소 0점
  nativeStyleScore = Math.max(0, nativeStyleScore);

  return {
    noDirectTranslation: !hasDirectTranslation && analysis.koreanStructurePatterns.length === 0,
    nativeStyleScore,
    issues,
  };
}

/**
 * SEO 품질 검사
 */
export function checkSEOQuality(
  content: string,
  metadata: { title?: string; excerpt?: string; tags?: string[] }
): number {
  if (!content || content.trim() === '') {
    return 0;
  }

  let score = 50; // 기본 점수

  // 제목 검사 (+10)
  if (metadata.title && metadata.title.length >= 10 && metadata.title.length <= 70) {
    score += 10;
  }

  // 요약 검사 (+10)
  if (metadata.excerpt && metadata.excerpt.length >= 50 && metadata.excerpt.length <= 300) {
    score += 10;
  }

  // 태그 검사 (+10)
  if (metadata.tags && metadata.tags.length >= 3) {
    score += 10;
  }

  // 키워드 밀도 검사 (+20)
  if (metadata.tags && metadata.tags.length > 0) {
    const cleanContent = content.toLowerCase();
    const words = cleanContent.split(/\s+/).length;

    let keywordMatches = 0;
    for (const tag of metadata.tags) {
      const tagLower = tag.toLowerCase();
      const regex = new RegExp(tagLower, 'gi');
      const matches = cleanContent.match(regex);
      if (matches) {
        keywordMatches += matches.length;
      }
    }

    const keywordDensity = keywordMatches / words;

    // 0.5% - 2.5% 범위가 이상적
    if (keywordDensity >= 0.005 && keywordDensity <= 0.025) {
      score += 20;
    } else if (keywordDensity > 0) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * 가독성 검사
 */
export function checkReadability(content: string): number {
  if (!content || content.trim() === '') {
    return 0;
  }

  // 코드 블록 제거
  const cleanContent = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  // 문장 분리
  const sentences = cleanContent.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) {
    return 50;
  }

  // 평균 문장 길이 계산
  let totalChars = 0;
  for (const sentence of sentences) {
    totalChars += sentence.trim().length;
  }
  const avgSentenceLength = totalChars / sentences.length;

  // 점수 계산
  let score = 100;

  // 문장 길이 기준 (한국어 기준 40-80자가 이상적)
  if (avgSentenceLength < 20) {
    score -= 20; // 너무 짧음
  } else if (avgSentenceLength > 100) {
    score -= 30; // 너무 길음
  } else if (avgSentenceLength > 80) {
    score -= 15; // 약간 길음
  }

  // 문단 검사 (빈 줄로 구분된 단락)
  const paragraphs = cleanContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length < 2) {
    score -= 10; // 문단 구분 부족
  }

  return Math.max(0, score);
}

/**
 * 종합 품질 리포트 생성
 */
export function generateQualityReport(
  content: string,
  metadata: {
    title?: string;
    excerpt?: string;
    tags?: string[];
    language?: 'ko' | 'en';
  }
): QualityCheckResult {
  const issues: QualityIssue[] = [];

  // 빈 콘텐츠 처리
  if (!content || content.trim() === '') {
    return {
      checklist: {
        hasPersonalExperience: false,
        experienceNaturallyIntegrated: false,
        imageCount: 0,
        imagesHaveAltText: true,
        imagesRelevant: false,
        noDirectTranslation: true,
        nativeStyleScore: 0,
        seoScore: 0,
        readabilityScore: 0,
        overallReady: false,
      },
      issues: [{ type: 'error', category: 'readability', message: '콘텐츠가 비어있습니다.' }],
      overallScore: 0,
    };
  }

  // 경험담 검사
  const experienceResult = checkPersonalExperience(content);
  if (!experienceResult.hasPersonalExperience) {
    issues.push({
      type: 'warning',
      category: 'experience',
      message: '개인 경험담이 감지되지 않았습니다.',
      suggestion: '글의 신뢰성을 높이기 위해 개인적인 경험이나 인사이트를 추가해보세요.',
    });
  }

  // 이미지 검사
  const imageResult = checkImages(content);
  if (!imageResult.imagesHaveAltText && imageResult.imageCount > 0) {
    issues.push({
      type: 'warning',
      category: 'image',
      message: `${imageResult.imagesWithoutAlt.length}개 이미지에 alt 텍스트가 없습니다.`,
      suggestion: '모든 이미지에 설명적인 alt 텍스트를 추가해 접근성을 개선하세요.',
    });
  }

  // 번역 품질 검사
  const language = metadata.language || 'ko';
  const translationResult = checkTranslationQuality(content, language);
  if (language === 'en' && !translationResult.noDirectTranslation) {
    issues.push({
      type: 'warning',
      category: 'translation',
      message: '직역 패턴이 감지되었습니다.',
      suggestion: '더 자연스러운 영어 표현으로 수정해주세요.',
    });
  }
  if (language === 'en' && translationResult.nativeStyleScore < 70) {
    issues.push({
      type: 'warning',
      category: 'translation',
      message: `네이티브 스타일 점수가 낮습니다: ${translationResult.nativeStyleScore}점`,
      suggestion: '문장을 더 직접적이고 능동적으로 수정해보세요.',
    });
  }

  // SEO 검사
  const seoScore = checkSEOQuality(content, metadata);
  if (seoScore < 50) {
    issues.push({
      type: 'warning',
      category: 'seo',
      message: `SEO 점수가 낮습니다: ${seoScore}점`,
      suggestion: '제목, 요약, 태그를 최적화하고 키워드 밀도를 조절하세요.',
    });
  }

  // 가독성 검사
  const readabilityScore = checkReadability(content);
  if (readabilityScore < 50) {
    issues.push({
      type: 'warning',
      category: 'readability',
      message: `가독성 점수가 낮습니다: ${readabilityScore}점`,
      suggestion: '문장을 짧게 나누고 문단을 적절히 구분하세요.',
    });
  }

  // 체크리스트 생성
  const checklist: QualityChecklist = {
    hasPersonalExperience: experienceResult.hasPersonalExperience,
    experienceNaturallyIntegrated: experienceResult.experienceNaturallyIntegrated,
    imageCount: imageResult.imageCount,
    imagesHaveAltText: imageResult.imagesHaveAltText,
    imagesRelevant: imageResult.imageCount > 0, // 이미지가 있으면 관련성 있다고 가정
    noDirectTranslation: translationResult.noDirectTranslation,
    nativeStyleScore: translationResult.nativeStyleScore,
    seoScore,
    readabilityScore,
    overallReady: calculateOverallReady(issues, seoScore, readabilityScore),
  };

  // 전체 점수 계산
  const overallScore = calculateOverallScore(checklist);

  return {
    checklist,
    issues,
    overallScore,
  };
}

/**
 * 전체 준비 상태 계산
 */
function calculateOverallReady(issues: QualityIssue[], seoScore: number, readabilityScore: number): boolean {
  // 에러가 있으면 준비 안됨
  if (issues.some((i) => i.type === 'error')) {
    return false;
  }

  // 최소 점수 기준
  if (seoScore < 40 || readabilityScore < 40) {
    return false;
  }

  // 경고가 3개 이상이면 준비 안됨
  if (issues.filter((i) => i.type === 'warning').length >= 3) {
    return false;
  }

  return true;
}

/**
 * 전체 점수 계산
 */
function calculateOverallScore(checklist: QualityChecklist): number {
  let score = 0;
  let maxScore = 0;

  // 경험담 (20점)
  maxScore += 20;
  if (checklist.hasPersonalExperience) {
    score += checklist.experienceNaturallyIntegrated ? 20 : 10;
  }

  // 이미지 (20점)
  maxScore += 20;
  if (checklist.imageCount > 0) {
    score += 10;
    if (checklist.imagesHaveAltText) {
      score += 10;
    }
  }

  // 번역 품질 (20점) - 영문만 해당
  maxScore += 20;
  score += Math.floor(checklist.nativeStyleScore * 0.2);

  // SEO (20점)
  maxScore += 20;
  score += Math.floor(checklist.seoScore * 0.2);

  // 가독성 (20점)
  maxScore += 20;
  score += Math.floor(checklist.readabilityScore * 0.2);

  return Math.round((score / maxScore) * 100);
}

/**
 * 품질 검토 클래스
 */
export class QualityChecker {
  /**
   * 콘텐츠 품질 검사
   */
  check(
    content: string,
    metadata: {
      title?: string;
      excerpt?: string;
      tags?: string[];
      language?: 'ko' | 'en';
    }
  ): QualityCheckResult {
    return generateQualityReport(content, metadata);
  }

  /**
   * 경험담 검사
   */
  checkExperience(content: string): PersonalExperienceResult {
    return checkPersonalExperience(content);
  }

  /**
   * 이미지 검사
   */
  checkImages(content: string): ImageCheckResult {
    return checkImages(content);
  }

  /**
   * 번역 품질 검사
   */
  checkTranslation(content: string, language: 'ko' | 'en'): TranslationQualityResult {
    return checkTranslationQuality(content, language);
  }

  /**
   * SEO 검사
   */
  checkSEO(
    content: string,
    metadata: { title?: string; excerpt?: string; tags?: string[] }
  ): number {
    return checkSEOQuality(content, metadata);
  }

  /**
   * 가독성 검사
   */
  checkReadability(content: string): number {
    return checkReadability(content);
  }
}
