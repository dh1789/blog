/**
 * 시리즈 네비게이션 생성 모듈
 * PRD 0014: WordPress 포스트 생성 기능 개선
 *
 * 시리즈 포스트에 삽입할 네비게이션 마크다운을 생성합니다.
 */

import type { SeriesDocument } from '@blog/shared';

/**
 * 시리즈 네비게이션 생성 옵션
 */
export interface SeriesNavigationOptions {
  /** 시리즈 이름 (제목에 표시) */
  seriesName: string;
  /** 현재 포스트의 Day 번호 */
  currentDay: number;
  /** 시리즈 문서 정보 (URL 매핑 등) */
  seriesDoc: SeriesDocument | null;
  /** 언어 ('ko' | 'en') */
  language: 'ko' | 'en';
}

/**
 * 시리즈 네비게이션 마크다운을 생성합니다.
 *
 * 출력 형식:
 * ```markdown
 * ---
 * ## 📚 시리즈 목차
 *
 * **MCP 시리즈** (5/5)
 *
 * 1. [Day 1: 소개](https://...)
 * 2. **👉 Day 2: 현재 포스트**
 * 3. Day 3: 준비 중
 *
 * 🔗 [GitHub 저장소](https://github.com/...)
 * ---
 * ```
 *
 * @param options 네비게이션 생성 옵션
 * @returns 마크다운 문자열
 */
export function generateSeriesNavigation(options: SeriesNavigationOptions): string {
  const { seriesName, currentDay, seriesDoc, language } = options;

  // 기본값 처리
  const displayName = seriesName || (language === 'ko' ? '시리즈' : 'Series');
  const safeCurrentDay = Math.max(1, currentDay);

  // seriesDoc이 null인 경우 기본 네비게이션
  if (!seriesDoc) {
    return generateMinimalNavigation(displayName, safeCurrentDay, language);
  }

  // URL 매핑 선택 (언어에 따라)
  const urls = language === 'en' ? seriesDoc.englishUrls : seriesDoc.koreanUrls;

  // totalDays 결정 (명시적 값 또는 currentDay 중 큰 값)
  const totalDays = Math.max(seriesDoc.totalDays, safeCurrentDay);

  // 네비게이션 생성
  const lines: string[] = [];

  // 헤더
  lines.push('---');
  lines.push('');
  lines.push(language === 'ko' ? '## 📚 시리즈 목차' : '## 📚 Series Index');
  lines.push('');

  // 시리즈 제목과 진행 상황
  const publishedCount = Object.keys(urls).length;
  lines.push(`**${displayName}** (${publishedCount}/${totalDays})`);
  lines.push('');

  // 각 Day 항목 생성
  for (let day = 1; day <= totalDays; day++) {
    const url = urls[day];
    const isCurrentDay = day === safeCurrentDay;

    if (isCurrentDay) {
      // 현재 Day: 굵게 + 아이콘
      const currentLabel = language === 'ko' ? '현재 글' : 'Current';
      lines.push(`${day}. **👉 Day ${day}** (${currentLabel})`);
    } else if (url) {
      // 발행된 Day: 링크
      lines.push(`${day}. [Day ${day}](${url})`);
    } else {
      // 미발행 Day: 준비 중 표시
      const comingSoon = language === 'ko' ? '준비 중' : 'Coming Soon';
      lines.push(`${day}. Day ${day} *(${comingSoon})*`);
    }
  }

  // GitHub 링크 (있는 경우)
  if (seriesDoc.githubUrl) {
    lines.push('');
    const githubLabel = language === 'ko' ? 'GitHub 저장소' : 'GitHub Repository';
    lines.push(`🔗 [${githubLabel}](${seriesDoc.githubUrl})`);
  }

  lines.push('');
  lines.push('---');

  return lines.join('\n');
}

/**
 * 최소한의 네비게이션 생성 (seriesDoc이 없는 경우)
 */
function generateMinimalNavigation(
  seriesName: string,
  currentDay: number,
  language: 'ko' | 'en'
): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push('');
  lines.push(language === 'ko' ? '## 📚 시리즈 목차' : '## 📚 Series Index');
  lines.push('');
  lines.push(`**${seriesName}**`);
  lines.push('');

  const currentLabel = language === 'ko' ? '현재 글' : 'Current';
  lines.push(`1. **👉 Day ${currentDay}** (${currentLabel})`);

  lines.push('');
  lines.push('---');

  return lines.join('\n');
}

/**
 * 시리즈 네비게이션 감지 패턴
 * - 한글: "📚 시리즈 목차" 또는 "시리즈 네비게이션"
 * - 영문: "📚 Series Index" 또는 "Series Navigation"
 * - 마크다운 형식 (##) 및 HTML 형식 (<h2>) 모두 지원
 */
const SERIES_NAV_PATTERNS = [
  // 마크다운/텍스트 형식
  /📚\s*시리즈\s*목차/i,
  /📚\s*Series\s*Index/i,
  /##\s*시리즈\s*네비게이션/i,
  /##\s*Series\s*Navigation/i,
  // HTML 형식
  /<h2[^>]*>시리즈\s*네비게이션<\/h2>/i,
  /<h2[^>]*>Series\s*Navigation<\/h2>/i,
];

/**
 * 콘텐츠에 기존 시리즈 네비게이션이 있는지 확인합니다.
 *
 * @param content HTML 또는 마크다운 콘텐츠
 * @returns 시리즈 네비게이션이 있으면 true, 없으면 false
 */
export function hasExistingSeriesNavigation(content: string): boolean {
  if (!content) {
    return false;
  }

  return SERIES_NAV_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * 콘텐츠에서 기존 시리즈 네비게이션을 제거합니다.
 *
 * 시리즈 네비게이션 구조:
 * - <hr> (선택적)
 * - <h2>📚 시리즈 목차</h2> 또는 ## 📚 시리즈 목차
 * - 네비게이션 콘텐츠 (시리즈명, Day 목록, GitHub 링크 등)
 * - <hr> (선택적)
 *
 * @param content HTML 또는 마크다운 콘텐츠
 * @returns 시리즈 네비게이션이 제거된 콘텐츠
 */
export function removeExistingSeriesNavigation(content: string): string {
  if (!content) {
    return '';
  }

  // 시리즈 네비게이션이 없으면 원본 반환
  if (!hasExistingSeriesNavigation(content)) {
    return content;
  }

  let result = content;

  // HTML 형식의 시리즈 네비게이션 제거
  // 패턴: <hr> (선택) + <h2>📚 시리즈 목차</h2> + 내용 + <hr> (선택)
  const htmlPatterns = [
    // 한글 시리즈 목차 (hr로 감싸진 경우)
    /<hr\s*\/?>\s*\n?\s*<h2[^>]*>📚\s*시리즈\s*목차<\/h2>[\s\S]*?<hr\s*\/?>/gi,
    // 영문 Series Index (hr로 감싸진 경우)
    /<hr\s*\/?>\s*\n?\s*<h2[^>]*>📚\s*Series\s*Index<\/h2>[\s\S]*?<hr\s*\/?>/gi,
    // 한글 시리즈 목차 (hr 없는 경우 - h2부터 끝까지 또는 다음 hr까지)
    /<h2[^>]*>📚\s*시리즈\s*목차<\/h2>[\s\S]*?(?=<hr\s*\/?>|$)/gi,
    // 영문 Series Index (hr 없는 경우)
    /<h2[^>]*>📚\s*Series\s*Index<\/h2>[\s\S]*?(?=<hr\s*\/?>|$)/gi,
    // "시리즈 네비게이션" HTML 패턴 (hr로 감싸진 경우)
    /<hr\s*\/?>\s*\n?\s*<h2[^>]*>시리즈\s*네비게이션<\/h2>[\s\S]*?<hr\s*\/?>/gi,
    // "Series Navigation" HTML 패턴 (hr로 감싸진 경우)
    /<hr\s*\/?>\s*\n?\s*<h2[^>]*>Series\s*Navigation<\/h2>[\s\S]*?<hr\s*\/?>/gi,
    // "시리즈 네비게이션" HTML 패턴 (hr 없는 경우 - 끝까지 또는 다음 hr까지)
    /<h2[^>]*>시리즈\s*네비게이션<\/h2>[\s\S]*$/gi,
    // "Series Navigation" HTML 패턴 (hr 없는 경우 - 끝까지 또는 다음 hr까지)
    /<h2[^>]*>Series\s*Navigation<\/h2>[\s\S]*$/gi,
  ];

  for (const pattern of htmlPatterns) {
    result = result.replace(pattern, '');
  }

  // 마크다운 형식의 시리즈 네비게이션 제거
  // 패턴: --- (선택) + ## 📚 시리즈 목차 + 내용 + --- (선택)
  const markdownPatterns = [
    // 한글 (---로 감싸진 경우)
    /---\s*\n+##\s*📚\s*시리즈\s*목차[\s\S]*?---/gi,
    // 영문 (---로 감싸진 경우)
    /---\s*\n+##\s*📚\s*Series\s*Index[\s\S]*?---/gi,
    // 한글 (--- 없는 경우)
    /##\s*📚\s*시리즈\s*목차[\s\S]*?(?=---|\n##|$)/gi,
    // 영문 (--- 없는 경우)
    /##\s*📚\s*Series\s*Index[\s\S]*?(?=---|\n##|$)/gi,
    // "시리즈 네비게이션" 패턴 (한글)
    /##\s*시리즈\s*네비게이션[\s\S]*?(?=---|\n##|$)/gi,
    // "Series Navigation" 패턴 (영문)
    /##\s*Series\s*Navigation[\s\S]*?(?=---|\n##|$)/gi,
  ];

  for (const pattern of markdownPatterns) {
    result = result.replace(pattern, '');
  }

  // 연속된 빈 줄 정리 (3개 이상의 연속 줄바꿈을 2개로)
  result = result.replace(/\n{3,}/g, '\n\n');

  // 앞뒤 공백 정리
  result = result.trim();

  return result;
}
