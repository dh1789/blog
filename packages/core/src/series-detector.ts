/**
 * 시리즈 문서 감지 모듈
 * PRD 0014: WordPress 포스트 생성 기능 개선
 *
 * 파일명에서 시리즈 정보를 추출하고, docs/ 폴더에서 매칭 문서를 탐색합니다.
 */

import type { SeriesInfo, SeriesDocument } from '@blog/shared';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * 파일명에서 시리즈명과 Day 번호를 추출합니다.
 *
 * 지원 형식:
 * - 2025-12-05-mcp-day1-introduction.md
 * - content/posts/ko/2025-12-05-remote-claude-day3-multi-project.md
 * - mcp-day1-introduction.md (날짜 없이)
 *
 * @param filePath 파일명 또는 전체 경로
 * @returns SeriesInfo | null (시리즈 아닌 경우 null)
 */
export function detectSeriesFromFilename(filePath: string): SeriesInfo | null {
  // null, undefined, 빈 문자열 처리
  if (!filePath || typeof filePath !== 'string') {
    return null;
  }

  // 파일명만 추출 (경로에서)
  const filename = filePath.split('/').pop() || filePath;

  // Day 패턴 찾기: {시리즈명}-day{번호}-{제목}
  // 대소문자 구분 없이 매칭 (day, Day, DAY 모두 허용)
  const dayPattern = /([a-z0-9_-]+)-day(\d+)/i;
  const match = filename.match(dayPattern);

  if (!match) {
    return null;
  }

  const dayNumber = parseInt(match[2], 10);

  // Day 번호 유효성 검사 (1 이상)
  if (dayNumber < 1) {
    return null;
  }

  // 시리즈명 추출: day 패턴 앞의 부분에서 날짜 패턴 제거
  let seriesNamePart = match[1];

  // 날짜 패턴 제거: YYYY-MM-DD- 형식
  const datePattern = /^\d{4}-\d{2}-\d{2}-/;
  seriesNamePart = seriesNamePart.replace(datePattern, '');

  // 빈 시리즈명 체크
  if (!seriesNamePart) {
    return null;
  }

  return {
    name: seriesNamePart,
    dayNumber,
    docPath: null, // findSeriesDocument()에서 채워짐
  };
}

/**
 * docs/ 폴더에서 시리즈명과 매칭되는 문서를 찾습니다.
 *
 * 우선순위:
 * 1. {series}-series-plan.md 형식 우선
 * 2. {series}-series-*.md 형식 차선
 * 3. {series}-*.md 형식 차차선
 *
 * @param seriesName 시리즈명 (예: "mcp", "remote-claude")
 * @param docsDir docs 폴더 경로 (기본값: 프로젝트 루트의 docs/)
 * @returns 매칭된 문서의 전체 경로 또는 null
 */
export function findSeriesDocument(
  seriesName: string,
  docsDir: string
): string | null {
  // 입력 유효성 검사
  if (!seriesName || typeof seriesName !== 'string') {
    return null;
  }

  // 디렉토리 존재 여부 확인
  if (!existsSync(docsDir)) {
    return null;
  }

  try {
    // docs 폴더의 모든 .md 파일 목록
    const files = readdirSync(docsDir).filter((file) => file.endsWith('.md'));

    if (files.length === 0) {
      return null;
    }

    // 시리즈명으로 시작하는 파일들 필터링
    const matchingFiles = files.filter((file) =>
      file.toLowerCase().startsWith(seriesName.toLowerCase() + '-')
    );

    if (matchingFiles.length === 0) {
      return null;
    }

    // 우선순위에 따라 정렬
    // 1. {series}-series-plan.md (정확히 일치)
    // 2. {series}-series-*.md (series 키워드 포함)
    // 3. 나머지 매칭 파일
    const prioritized = matchingFiles.sort((a, b) => {
      const aExact = a.toLowerCase() === `${seriesName}-series-plan.md`.toLowerCase();
      const bExact = b.toLowerCase() === `${seriesName}-series-plan.md`.toLowerCase();
      const aHasSeries = a.toLowerCase().includes('-series-');
      const bHasSeries = b.toLowerCase().includes('-series-');

      // 정확히 일치하는 series-plan 우선
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // series 키워드 포함하는 파일 우선
      if (aHasSeries && !bHasSeries) return -1;
      if (!aHasSeries && bHasSeries) return 1;

      // 나머지는 파일명 길이가 짧은 것 우선 (더 정확한 매칭)
      return a.length - b.length;
    });

    return join(docsDir, prioritized[0]);
  } catch {
    // 파일 시스템 에러 처리
    return null;
  }
}

/**
 * 시리즈 문서를 파싱하여 URL 매핑과 메타데이터를 추출합니다.
 *
 * 지원하는 형식:
 * - GitHub URL: [name](https://github.com/...) 또는 **GitHub**: https://github.com/...
 * - totalDays: **시리즈 구성**: N개 포스트 또는 **총 Day 수**: N
 * - URL 매핑 (리스트): - Day N: https://...
 * - URL 매핑 (테이블): | N | https://ko/... | https://en/... |
 *
 * @param docPath 시리즈 문서 전체 경로
 * @returns SeriesDocument | null (파싱 실패 시 null)
 */
export function parseSeriesDocument(docPath: string): SeriesDocument | null {
  // 입력 유효성 검사
  if (!docPath || typeof docPath !== 'string') {
    return null;
  }

  // 파일 존재 여부 확인
  if (!existsSync(docPath)) {
    return null;
  }

  try {
    const content = readFileSync(docPath, 'utf-8');

    // 결과 객체 초기화
    const result: SeriesDocument = {
      koreanUrls: {},
      englishUrls: {},
      koreanTitles: {},
      englishTitles: {},
      githubUrl: null,
      totalDays: 1,
    };

    // 1. GitHub URL 추출
    result.githubUrl = extractGitHubUrl(content);

    // 2. totalDays 추출
    const explicitTotalDays = extractTotalDays(content);

    // 3. URL 및 제목 추출 (리스트 형식)
    extractListUrlsAndTitles(content, result);

    // 4. URL 및 제목 추출 (테이블 형식)
    extractTableUrlsAndTitles(content, result);

    // 5. 헤딩 형식에서 제목 추출 (### Day N: 제목)
    extractHeadingTitles(content, result);

    // 5. totalDays 결정 (명시적 값 우선, 없으면 URL 개수에서 유추)
    if (explicitTotalDays !== null) {
      result.totalDays = explicitTotalDays;
    } else {
      const maxKoreanDay = Math.max(0, ...Object.keys(result.koreanUrls).map(Number));
      const maxEnglishDay = Math.max(0, ...Object.keys(result.englishUrls).map(Number));
      result.totalDays = Math.max(1, maxKoreanDay, maxEnglishDay);
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * GitHub URL을 추출합니다.
 * 우선순위:
 * 1. **GitHub**: URL 형식 (문서 상단에 명시된 프로젝트 URL)
 * 2. "이 시리즈" 또는 "this project" 키워드가 있는 행의 URL
 * 3. 첫 번째 마크다운 링크 (fallback)
 */
function extractGitHubUrl(content: string): string | null {
  // 패턴 1 (최우선): 직접 URL **GitHub**: https://github.com/...
  const directUrlPattern = /\*\*(?:GitHub|프로젝트)\*\*:\s*(https:\/\/github\.com\/[\w/-]+)/i;
  const directMatch = content.match(directUrlPattern);
  if (directMatch) {
    return directMatch[1];
  }

  // 패턴 2: "이 시리즈 프로젝트" 또는 "this project" 키워드가 있는 행에서 URL 추출
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('이 시리즈') || line.toLowerCase().includes('this project')) {
      const urlMatch = line.match(/(https:\/\/github\.com\/[\w/-]+)/i);
      if (urlMatch) {
        return urlMatch[1];
      }
    }
  }

  // 패턴 3 (fallback): 첫 번째 마크다운 링크 [name](https://github.com/...)
  const markdownLinkPattern = /\[[\w\s-]+\]\((https:\/\/github\.com\/[\w/-]+)\)/i;
  const markdownMatch = content.match(markdownLinkPattern);
  if (markdownMatch) {
    return markdownMatch[1];
  }

  return null;
}

/**
 * totalDays를 추출합니다.
 */
function extractTotalDays(content: string): number | null {
  // 패턴 1: **시리즈 구성**: N개 포스트
  const koreanPattern = /\*\*시리즈 구성\*\*:\s*(\d+)개/i;
  const koreanMatch = content.match(koreanPattern);
  if (koreanMatch) {
    return parseInt(koreanMatch[1], 10);
  }

  // 패턴 2: **총 Day 수**: N
  const dayCountPattern = /\*\*총 Day 수\*\*:\s*(\d+)/i;
  const dayMatch = content.match(dayCountPattern);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  return null;
}

/**
 * 리스트 형식의 URL과 제목을 추출합니다.
 * 형식 1: - [Day N: 제목](URL)
 * 형식 2: - Day N: 제목
 */
function extractListUrlsAndTitles(content: string, result: SeriesDocument): void {
  const lines = content.split('\n');
  let currentSection: 'korean' | 'english' | null = null;

  for (const line of lines) {
    // 섹션 감지
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('한글') || lowerLine.includes('korean') || lowerLine.includes('한국어')) {
      currentSection = 'korean';
      continue;
    }
    if (lowerLine.includes('영문') || lowerLine.includes('english') || lowerLine.includes('영어')) {
      currentSection = 'english';
      continue;
    }

    // 패턴 1: [Day N: 제목](URL) - 마크다운 링크 형식
    const linkPattern = /[-*]\s*\[Day\s*(\d+):\s*([^\]]+)\]\(([^)]+)\)/i;
    const linkMatch = line.match(linkPattern);
    if (linkMatch && currentSection) {
      const dayNumber = parseInt(linkMatch[1], 10);
      const title = linkMatch[2].trim();
      const url = normalizeUrl(linkMatch[3]);

      if (isValidUrl(url)) {
        if (currentSection === 'korean') {
          result.koreanUrls[dayNumber] = url;
          if (title && !result.koreanTitles[dayNumber]) {
            result.koreanTitles[dayNumber] = title;
          }
        } else {
          result.englishUrls[dayNumber] = url;
          if (title && !result.englishTitles[dayNumber]) {
            result.englishTitles[dayNumber] = title;
          }
        }
      }
      continue;
    }

    // 패턴 2: Day N: URL (URL만 있는 경우)
    const urlPattern = /[-*]\s*Day\s*(\d+):\s*(https?:\/\/[^\s]+)/i;
    const urlMatch = line.match(urlPattern);
    if (urlMatch && currentSection) {
      const dayNumber = parseInt(urlMatch[1], 10);
      const url = urlMatch[2];

      if (isValidUrl(url)) {
        if (currentSection === 'korean') {
          result.koreanUrls[dayNumber] = url;
        } else {
          result.englishUrls[dayNumber] = url;
        }
      }
    }
  }
}

/**
 * 테이블 형식의 URL과 제목을 추출합니다.
 * | Day | Korean | English |
 * | 1 | https://ko/... | https://en/... |
 */
function extractTableUrlsAndTitles(content: string, result: SeriesDocument): void {
  const lines = content.split('\n');
  let isInTable = false;
  let koreanColIndex = -1;
  let englishColIndex = -1;
  let urlColIndex = -1;
  let currentSection: 'korean' | 'english' | null = null;

  for (const line of lines) {
    // 섹션 감지 (한글 URL / 영어 URL 섹션)
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('한국어 url') || lowerLine.includes('한글 url') || lowerLine.includes('korean url')) {
      currentSection = 'korean';
      continue;
    }
    if (lowerLine.includes('영어 url') || lowerLine.includes('영문 url') || lowerLine.includes('english url')) {
      currentSection = 'english';
      continue;
    }

    // 테이블 헤더 감지 (Korean/English 또는 전체 URL 컬럼)
    if (line.includes('|') && (
      line.toLowerCase().includes('korean') ||
      line.toLowerCase().includes('english') ||
      line.toLowerCase().includes('url') ||
      line.includes('전체')
    )) {
      const headers = line.split('|').map((h) => h.trim().toLowerCase());
      koreanColIndex = headers.findIndex((h) => h.includes('korean') || h === '한글');
      englishColIndex = headers.findIndex((h) => h.includes('english') || h === '영문');
      // "전체 URL" 또는 "url" 컬럼 인덱스
      urlColIndex = headers.findIndex((h) => h.includes('url') || h.includes('전체'));
      isInTable = true;
      continue;
    }

    // 테이블 구분선 스킵
    if (line.match(/^\|[\s-|]+\|$/)) {
      continue;
    }

    // 테이블 데이터 행 파싱
    if (isInTable && line.includes('|')) {
      const cols = line.split('|').map((c) => c.trim());

      // Day 번호 추출 (첫 번째 컬럼에서)
      const dayMatch = cols[1]?.match(/(\d+)/);
      if (!dayMatch) continue;

      const dayNumber = parseInt(dayMatch[1], 10);

      // Korean URL
      if (koreanColIndex > 0 && cols[koreanColIndex]) {
        const url = normalizeUrl(cols[koreanColIndex]);
        if (isValidUrl(url)) {
          result.koreanUrls[dayNumber] = url;
        }
      }

      // English URL
      if (englishColIndex > 0 && cols[englishColIndex]) {
        const url = normalizeUrl(cols[englishColIndex]);
        if (isValidUrl(url)) {
          result.englishUrls[dayNumber] = url;
        }
      }

      // 일반 URL 컬럼 (섹션에 따라 분류)
      if (urlColIndex > 0 && cols[urlColIndex] && currentSection) {
        const url = normalizeUrl(cols[urlColIndex]);
        if (isValidUrl(url)) {
          if (currentSection === 'korean') {
            result.koreanUrls[dayNumber] = url;
          } else if (currentSection === 'english') {
            result.englishUrls[dayNumber] = url;
          }
        }
      }
    }
  }
}

/**
 * 헤딩 형식에서 Day 제목을 추출합니다.
 * ### Day N: 제목
 * **한국어 제목**: "... Day N: 제목"
 * **영어 제목**: "... Day N: Title"
 */
function extractHeadingTitles(content: string, result: SeriesDocument): void {
  const lines = content.split('\n');
  let currentLanguage: 'korean' | 'english' | null = null;

  for (const line of lines) {
    // 언어 섹션 감지
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('한글') || lowerLine.includes('korean') || lowerLine.includes('한국어')) {
      currentLanguage = 'korean';
    }
    if (lowerLine.includes('영문') || lowerLine.includes('english') || lowerLine.includes('영어')) {
      currentLanguage = 'english';
    }

    // 패턴 1: ### Day N: 제목 (헤딩 형식)
    const headingPattern = /^#{1,4}\s*Day\s*(\d+):\s*(.+)/i;
    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const dayNumber = parseInt(headingMatch[1], 10);
      const title = headingMatch[2].trim();

      // 언어가 감지되었으면 해당 언어에 저장, 아니면 기본적으로 한글로
      const targetLang = currentLanguage || 'korean';
      if (targetLang === 'korean' && !result.koreanTitles[dayNumber]) {
        result.koreanTitles[dayNumber] = title;
      } else if (targetLang === 'english' && !result.englishTitles[dayNumber]) {
        result.englishTitles[dayNumber] = title;
      }
      continue;
    }

    // 패턴 2: **한국어 제목**: "Claude Agent SDK Day 1: Agent 개념과 첫 번째 Agent 만들기"
    const koreanTitlePattern = /\*\*한국어 제목\*\*:\s*"[^"]*Day\s*(\d+):\s*([^"]+)"/i;
    const koreanMatch = line.match(koreanTitlePattern);
    if (koreanMatch) {
      const dayNumber = parseInt(koreanMatch[1], 10);
      const title = koreanMatch[2].trim();
      if (!result.koreanTitles[dayNumber]) {
        result.koreanTitles[dayNumber] = title;
      }
      continue;
    }

    // 패턴 3: **영어 제목**: "Claude Agent SDK Day 1: Agent Concepts and Building Your First Agent"
    const englishTitlePattern = /\*\*영어 제목\*\*:\s*"[^"]*Day\s*(\d+):\s*([^"]+)"/i;
    const englishMatch = line.match(englishTitlePattern);
    if (englishMatch) {
      const dayNumber = parseInt(englishMatch[1], 10);
      const title = englishMatch[2].trim();
      if (!result.englishTitles[dayNumber]) {
        result.englishTitles[dayNumber] = title;
      }
    }
  }
}

/**
 * URL 정규화 (백틱, 공백 등 제거)
 */
function normalizeUrl(url: string): string {
  if (!url) return '';
  // 백틱, 따옴표 제거
  return url.replace(/[`'"]/g, '').trim();
}

/**
 * URL 유효성 검사
 * - 절대 URL: http://, https://
 * - 상대 URL: /ko/, /en/
 */
function isValidUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;

  // 상대 경로 허용 (/ko/, /en/)
  if (normalized.startsWith('/ko/') || normalized.startsWith('/en/')) {
    return true;
  }

  try {
    new URL(normalized);
    return normalized.startsWith('http://') || normalized.startsWith('https://');
  } catch {
    return false;
  }
}
