/**
 * 번역 품질 검증 모듈
 */

import type {
  PostMetadata,
  ValidationResult,
  ValidationIssue,
  TranslationQualityMetrics,
} from '@blog/shared';

/**
 * 번역 품질 종합 검증
 */
export async function validateTranslation(
  originalContent: string,
  originalMetadata: PostMetadata,
  translatedContent: string,
  translatedMetadata: PostMetadata
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // 1. 기본 검증 (비어있지 않음, 코드 블록, 링크, 헤딩)
  const basicIssues = validateBasics(originalContent, translatedContent);
  issues.push(...basicIssues);

  // 2. 라인 수 검증 (50-150% 범위)
  const lineCountIssues = validateLineCount(originalContent, translatedContent);
  issues.push(...lineCountIssues);

  // 3. SEO 키워드 검증
  const keywordIssues = validateSeoKeywords(originalMetadata, translatedContent);
  issues.push(...keywordIssues);

  // 4. 제목 길이 검증 (≤60자)
  const titleIssues = validateTitleLength(translatedMetadata);
  issues.push(...titleIssues);

  // 5. 품질 메트릭 계산
  const metrics = calculateMetrics(
    originalContent,
    originalMetadata,
    translatedContent,
    translatedMetadata
  );

  // 6. 전체 검증 결과 판정
  const hasErrors = issues.some((issue) => issue.severity === 'error');
  const isValid = !hasErrors;

  return {
    isValid,
    issues,
    metrics,
  };
}

/**
 * 기본 검증 - 비어있지 않음, 코드 블록, 링크, 헤딩 구조
 */
function validateBasics(
  originalContent: string,
  translatedContent: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. 비어있지 않음 확인
  if (!translatedContent || translatedContent.trim().length === 0) {
    issues.push({
      type: 'content',
      severity: 'error',
      message: 'Translated content is empty',
    });
    return issues; // 빈 콘텐츠면 다른 검증 불가
  }

  // 2. 코드 블록 개수 일치 (``` 개수)
  const originalCodeBlocks = (originalContent.match(/```/g) || []).length;
  const translatedCodeBlocks = (translatedContent.match(/```/g) || []).length;

  if (originalCodeBlocks !== translatedCodeBlocks) {
    issues.push({
      type: 'content',
      severity: 'error',
      message: `Code block count mismatch: original has ${originalCodeBlocks / 2} blocks, translated has ${translatedCodeBlocks / 2} blocks`,
      field: 'code_blocks',
    });
  }

  // 3. 링크 형식 유지 - 대략적인 개수 확인
  const originalLinks = (originalContent.match(/\[.*?\]\(.*?\)/g) || []).length;
  const translatedLinks = (translatedContent.match(/\[.*?\]\(.*?\)/g) || []).length;

  if (originalLinks !== translatedLinks) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: `Link count mismatch: original has ${originalLinks} links, translated has ${translatedLinks} links`,
      field: 'links',
    });
  }

  // 4. 마크다운 헤딩 구조 보존 - h1, h2, h3 개수 확인
  const originalH1 = (originalContent.match(/^# /gm) || []).length;
  const translatedH1 = (translatedContent.match(/^# /gm) || []).length;
  const originalH2 = (originalContent.match(/^## /gm) || []).length;
  const translatedH2 = (translatedContent.match(/^## /gm) || []).length;

  if (originalH1 !== translatedH1) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: `H1 heading count mismatch: original has ${originalH1}, translated has ${translatedH1}`,
      field: 'headings',
    });
  }

  if (originalH2 !== translatedH2) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: `H2 heading count mismatch: original has ${originalH2}, translated has ${translatedH2}`,
      field: 'headings',
    });
  }

  return issues;
}

/**
 * 라인 수 검증 - 50-150% 범위
 */
function validateLineCount(
  originalContent: string,
  translatedContent: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const originalLines = originalContent.split('\n').length;
  const translatedLines = translatedContent.split('\n').length;

  // 퍼센티지 계산
  const percentage = (translatedLines / originalLines) * 100;

  // 50-150% 범위 확인
  if (percentage < 50) {
    issues.push({
      type: 'quality',
      severity: 'error',
      message: `Translation is too short: ${translatedLines} lines (${percentage.toFixed(1)}% of original ${originalLines} lines). Expected 50-150%.`,
      field: 'line_count',
    });
  } else if (percentage > 150) {
    issues.push({
      type: 'quality',
      severity: 'error',
      message: `Translation is too long: ${translatedLines} lines (${percentage.toFixed(1)}% of original ${originalLines} lines). Expected 50-150%.`,
      field: 'line_count',
    });
  } else if (percentage < 70 || percentage > 130) {
    // 70-130% 범위 밖이면 경고
    issues.push({
      type: 'quality',
      severity: 'warning',
      message: `Translation length is ${percentage.toFixed(1)}% of original. Consider reviewing.`,
      field: 'line_count',
    });
  }

  return issues;
}

/**
 * SEO 키워드 검증 - tags 키워드 유지 확인
 */
function validateSeoKeywords(
  originalMetadata: PostMetadata,
  translatedContent: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // frontmatter tags에서 키워드 추출
  const keywords = originalMetadata.tags || [];

  if (keywords.length === 0) {
    issues.push({
      type: 'seo',
      severity: 'info',
      message: 'No SEO keywords found in original metadata tags',
      field: 'keywords',
    });
    return issues;
  }

  // 번역본에 키워드 존재 여부 확인 (대소문자 무시)
  const missingKeywords: string[] = [];
  const translatedLower = translatedContent.toLowerCase();

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    if (!translatedLower.includes(keywordLower)) {
      missingKeywords.push(keyword);
    }
  }

  // 누락된 키워드 보고
  if (missingKeywords.length > 0) {
    issues.push({
      type: 'seo',
      severity: 'warning',
      message: `Missing SEO keywords in translation: ${missingKeywords.join(', ')}`,
      field: 'keywords',
    });
  }

  // 키워드 밀도 확인 (선택적)
  const totalWords = translatedContent.split(/\s+/).length;
  const keywordCount = keywords.reduce((count, keyword) => {
    const regex = new RegExp(keyword, 'gi');
    const matches = translatedContent.match(regex) || [];
    return count + matches.length;
  }, 0);

  const density = (keywordCount / totalWords) * 100;

  // 권장 키워드 밀도: 0.5-2.5%
  if (density < 0.5) {
    issues.push({
      type: 'seo',
      severity: 'info',
      message: `Keyword density is low (${density.toFixed(2)}%). Recommended: 0.5-2.5%`,
      field: 'keyword_density',
    });
  } else if (density > 2.5) {
    issues.push({
      type: 'seo',
      severity: 'warning',
      message: `Keyword density is high (${density.toFixed(2)}%). Recommended: 0.5-2.5%`,
      field: 'keyword_density',
    });
  }

  return issues;
}

/**
 * 제목 길이 검증 - ≤60자 (SEO 최적)
 */
function validateTitleLength(translatedMetadata: PostMetadata): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const titleLength = translatedMetadata.title.length;

  if (titleLength > 60) {
    issues.push({
      type: 'seo',
      severity: 'warning',
      message: `Title is too long (${titleLength} characters). Recommended: ≤60 characters for SEO.`,
      field: 'title',
    });
  }

  return issues;
}

/**
 * 품질 메트릭 계산
 */
function calculateMetrics(
  originalContent: string,
  originalMetadata: PostMetadata,
  translatedContent: string,
  translatedMetadata: PostMetadata
): TranslationQualityMetrics {
  // 라인 수 계산
  const originalLines = originalContent.split('\n').length;
  const translatedLines = translatedContent.split('\n').length;
  const lineCountDiff = Math.abs(translatedLines - originalLines);
  const lineCountDiffPercent = (lineCountDiff / originalLines) * 100;

  // 코드 블록 개수
  const originalCodeBlocks = (originalContent.match(/```/g) || []).length / 2;
  const translatedCodeBlocks = (translatedContent.match(/```/g) || []).length / 2;
  const preservedCodeBlocks = Math.min(originalCodeBlocks, translatedCodeBlocks);

  // 메타데이터 완전성
  const metadataComplete =
    !!translatedMetadata.title &&
    !!translatedMetadata.excerpt &&
    !!translatedMetadata.slug &&
    (translatedMetadata.categories?.length || 0) > 0 &&
    (translatedMetadata.tags?.length || 0) >= 3;

  // SEO 최적화 여부
  const seoOptimized =
    translatedMetadata.title.length <= 60 &&
    (translatedMetadata.excerpt?.length || 0) <= 300 &&
    (translatedMetadata.tags?.length || 0) >= 3;

  return {
    lineCountDiff,
    lineCountDiffPercent,
    preservedCodeBlocks,
    metadataComplete,
    seoOptimized,
    titleLength: translatedMetadata.title.length,
    excerptLength: translatedMetadata.excerpt?.length || 0,
  };
}
