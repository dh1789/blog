/**
 * 콘텐츠 강화 모듈
 * PRD 0014: WordPress 포스트 생성 기능 개선
 *
 * 번역 배너, GitHub 링크 등을 콘텐츠에 자동 삽입합니다.
 */

/**
 * 번역 배너 삽입 옵션
 */
export interface TranslationBannerOptions {
  /** 포스트 언어 ('ko' | 'en') */
  language: 'ko' | 'en';
  /** 원본 포스트 URL */
  originalUrl: string;
}

/**
 * 영문 포스트 상단에 번역 출처 배너를 삽입합니다.
 *
 * 출력 형식:
 * ```markdown
 * > 🌐 **Translation**: This article was translated from [Korean](url).
 *
 * # Original Title
 * ```
 *
 * @param content 원본 콘텐츠
 * @param options 배너 옵션
 * @returns 배너가 삽입된 콘텐츠
 */
export function insertTranslationBanner(
  content: string,
  options: TranslationBannerOptions
): string {
  // 유효성 검사
  if (!content) {
    return '';
  }

  const { language, originalUrl } = options;

  // 한글 포스트는 배너 삽입 안 함
  if (language === 'ko') {
    return content;
  }

  // 원본 URL이 없으면 배너 삽입 안 함
  if (!originalUrl) {
    return content;
  }

  // 이미 번역 배너가 있는지 확인
  if (content.match(/>\s*.*translation/i)) {
    return content;
  }

  // 번역 배너 생성
  const banner = `> 🌐 **Translation**: This article was translated from [Korean](${originalUrl}).

`;

  return banner + content;
}

/**
 * 콘텐츠에 GitHub 저장소 링크를 삽입합니다.
 *
 * 삽입 위치:
 * 1. TL;DR 섹션이 있으면 그 뒤
 * 2. 없으면 첫 번째 제목 뒤
 *
 * @param content 원본 콘텐츠
 * @param githubUrl GitHub 저장소 URL
 * @returns GitHub 링크가 삽입된 콘텐츠
 */
export function insertGitHubLink(content: string, githubUrl: string | null): string {
  // 유효성 검사
  if (!content) {
    return '';
  }

  if (!githubUrl) {
    return content;
  }

  // URL 유효성 검사
  if (!githubUrl.startsWith('https://github.com/')) {
    return content;
  }

  // 이미 GitHub 링크가 있는지 확인
  if (content.includes('github.com/')) {
    return content;
  }

  // GitHub 링크 생성
  const githubLinkText = `\n🔗 [GitHub Repository](${githubUrl})\n`;

  // TL;DR 섹션 찾기
  const tldrMatch = content.match(/##\s*TL;DR[\s\S]*?(?=\n##|\n#[^#]|$)/i);

  if (tldrMatch) {
    // TL;DR 섹션 뒤에 삽입
    const tldrEnd = content.indexOf(tldrMatch[0]) + tldrMatch[0].length;
    return content.slice(0, tldrEnd) + githubLinkText + content.slice(tldrEnd);
  }

  // TL;DR가 없으면 첫 번째 제목 뒤에 삽입
  const titleMatch = content.match(/^#\s+.+$/m);

  if (titleMatch) {
    const titleEnd = content.indexOf(titleMatch[0]) + titleMatch[0].length;
    return content.slice(0, titleEnd) + '\n' + githubLinkText + content.slice(titleEnd);
  }

  // 제목도 없으면 맨 앞에 삽입
  return githubLinkText + content;
}
