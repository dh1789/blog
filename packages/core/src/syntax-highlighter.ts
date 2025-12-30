/**
 * SyntaxHighlighter Evolved 플러그인 호환 변환
 *
 * HTML의 <pre><code> 태그를 WordPress SyntaxHighlighter Evolved 플러그인의
 * [code language="..."]...[/code] shortcode 형식으로 변환합니다.
 */

/**
 * 언어 매핑 테이블
 * 마크다운 언어명 → SyntaxHighlighter Evolved brush 이름
 */
const LANGUAGE_MAP: Record<string, string> = {
  // JavaScript / TypeScript
  javascript: 'jscript',
  js: 'jscript',
  typescript: 'jscript', // SHE는 TypeScript brush가 없어서 jscript 사용
  ts: 'jscript',
  jsx: 'jscript',
  tsx: 'jscript',

  // Shell / Bash
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',

  // Web
  html: 'xml',
  xml: 'xml',
  css: 'css',
  scss: 'css',
  sass: 'css',

  // Data formats
  json: 'jscript', // JSON은 jscript로 처리
  yaml: 'plain',
  yml: 'plain',

  // Other languages
  python: 'python',
  py: 'python',
  ruby: 'ruby',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  csharp: 'csharp',
  cs: 'csharp',
  cpp: 'cpp',
  c: 'cpp',
  go: 'plain',
  rust: 'plain',
  sql: 'sql',
  diff: 'diff',
  markdown: 'plain',
  md: 'plain',
  text: 'plain',
  plain: 'plain',
  '': 'plain',
};

/**
 * HTML 콘텐츠의 코드 블록을 SyntaxHighlighter Evolved shortcode로 변환
 *
 * @param html - HTML 콘텐츠
 * @returns SyntaxHighlighter Evolved shortcode가 적용된 HTML
 *
 * @example
 * ```typescript
 * const html = '<pre><code class="language-typescript">const x = 1;</code></pre>';
 * const result = convertToSyntaxHighlighter(html);
 * // '[code language="jscript"]const x = 1;[/code]'
 * ```
 */
export function convertToSyntaxHighlighter(html: string): string {
  // <pre><code class="language-xxx">...</code></pre> 패턴 매칭
  const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;

  return html.replace(codeBlockRegex, (_match, language, code) => {
    // HTML 엔티티 디코딩
    const decodedCode = decodeHtmlEntities(code);

    // 언어 매핑 (없으면 plain)
    const brush = LANGUAGE_MAP[language?.toLowerCase() || ''] || 'plain';

    // SyntaxHighlighter Evolved shortcode 형식으로 변환
    return `[code language="${brush}"]${decodedCode}[/code]`;
  });
}

/**
 * HTML 엔티티를 원래 문자로 디코딩
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * SyntaxHighlighter Evolved shortcode를 HTML로 역변환 (디버깅용)
 */
export function convertFromSyntaxHighlighter(content: string): string {
  const shortcodeRegex = /\[code language="([^"]*)"\]([\s\S]*?)\[\/code\]/g;

  return content.replace(shortcodeRegex, (_match, language, code) => {
    const encodedCode = encodeHtmlEntities(code);
    return `<pre><code class="language-${language}">${encodedCode}</code></pre>`;
  });
}

/**
 * 특수문자를 HTML 엔티티로 인코딩
 */
function encodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
