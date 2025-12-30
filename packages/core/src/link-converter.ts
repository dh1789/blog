/**
 * 링크 변환 모듈
 * PRD 0014: WordPress 포스트 생성 기능 개선
 *
 * 시리즈 문서의 URL 매핑을 기반으로 한글 링크를 영문 링크로 변환합니다.
 */

import type { SeriesDocument } from '@blog/shared';

/**
 * 콘텐츠 내의 한글 URL을 영문 URL로 변환합니다.
 *
 * 시리즈 문서에 정의된 URL 매핑을 사용하여:
 * - koreanUrls의 URL을 찾아서
 * - 동일한 Day 번호의 englishUrls로 교체
 *
 * @param content 원본 콘텐츠 (마크다운 또는 HTML)
 * @param seriesDoc 시리즈 문서 정보 (URL 매핑 포함)
 * @returns 영문 URL로 변환된 콘텐츠
 */
export function convertLinksToEnglish(content: string, seriesDoc: SeriesDocument | null): string {
  // 유효성 검사
  if (!content) {
    return '';
  }

  if (!seriesDoc) {
    return content;
  }

  const { koreanUrls, englishUrls } = seriesDoc;

  // URL 매핑이 없으면 원본 반환
  if (!koreanUrls || Object.keys(koreanUrls).length === 0) {
    return content;
  }

  let result = content;

  // 각 Day의 한글 URL을 영문 URL로 변환
  for (const [dayStr, koreanUrl] of Object.entries(koreanUrls)) {
    const day = Number(dayStr);
    const englishUrl = englishUrls[day];

    // 영문 URL이 없으면 변환하지 않음
    if (!englishUrl) {
      continue;
    }

    // URL을 안전하게 이스케이프하여 정규식 생성
    const escapedKoreanUrl = escapeRegExp(koreanUrl);

    // 한글 URL을 영문 URL로 모두 치환
    // URL 뒤에 쿼리 문자열이나 해시가 있을 수 있음
    const urlPattern = new RegExp(escapedKoreanUrl, 'g');
    result = result.replace(urlPattern, englishUrl);
  }

  return result;
}

/**
 * 정규식 특수문자를 이스케이프합니다.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
