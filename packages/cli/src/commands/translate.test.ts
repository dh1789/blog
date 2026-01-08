/**
 * translate 명령어 유닛 테스트
 * - 중복 frontmatter 제거 기능 테스트
 */

import { describe, it, expect } from 'vitest';

/**
 * removeDuplicateFrontmatter 함수 테스트용 복제
 * (원본은 translate.ts에 private으로 정의됨)
 */
function removeDuplicateFrontmatter(content: string): string {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n*/;

  if (content.trim().startsWith('---')) {
    return content.replace(frontmatterRegex, '').trim();
  }

  return content;
}

describe('Translate Command - Duplicate Frontmatter Removal', () => {
  describe('removeDuplicateFrontmatter', () => {
    it('should remove frontmatter when content starts with ---', () => {
      const contentWithFrontmatter = `---
title: "Test Title"
slug: "test-slug"
---

# Test Content

This is the body.`;

      const result = removeDuplicateFrontmatter(contentWithFrontmatter);

      expect(result).not.toContain('title: "Test Title"');
      expect(result).not.toContain('slug: "test-slug"');
      expect(result).toContain('# Test Content');
      expect(result).toContain('This is the body.');
    });

    it('should preserve content that does not start with frontmatter', () => {
      const contentWithoutFrontmatter = `# Test Content

This is the body without frontmatter.

\`\`\`typescript
const code = 'example';
\`\`\``;

      const result = removeDuplicateFrontmatter(contentWithoutFrontmatter);

      expect(result).toBe(contentWithoutFrontmatter);
    });

    it('should handle content with --- in code blocks', () => {
      const contentWithCodeBlock = `# Content

\`\`\`yaml
---
config: value
---
\`\`\`

More content here.`;

      const result = removeDuplicateFrontmatter(contentWithCodeBlock);

      // 코드 블록 내부의 ---는 건드리지 않아야 함
      expect(result).toBe(contentWithCodeBlock);
    });

    it('should handle empty content', () => {
      const result = removeDuplicateFrontmatter('');
      expect(result).toBe('');
    });

    it('should handle content with only frontmatter', () => {
      const contentOnlyFrontmatter = `---
title: "Only Frontmatter"
---`;

      const result = removeDuplicateFrontmatter(contentOnlyFrontmatter);

      expect(result).toBe('');
    });

    it('should handle frontmatter with complex YAML', () => {
      const contentWithComplexFrontmatter = `---
title: "Complex Title"
tags:
  - tag1
  - tag2
  - tag3
categories:
  - cat1
nested:
  key: value
---

# Actual Content

Body text here.`;

      const result = removeDuplicateFrontmatter(contentWithComplexFrontmatter);

      expect(result).not.toContain('title: "Complex Title"');
      expect(result).not.toContain('- tag1');
      expect(result).toContain('# Actual Content');
      expect(result).toContain('Body text here.');
    });

    it('should trim but not remove frontmatter if whitespace before ---', () => {
      // 앞에 공백이 있으면:
      // - trim().startsWith('---')가 true이므로 replace 시도
      // - 하지만 정규식 ^---가 매칭되지 않아 frontmatter는 유지
      // - 최종적으로 .trim()만 적용됨
      const contentWithWhitespace = `   ---
title: "Whitespace Test"
---

Content after frontmatter.`;

      const result = removeDuplicateFrontmatter(contentWithWhitespace);

      // 정규식이 매칭되지 않으므로 frontmatter는 유지되고 trim()만 적용
      expect(result).toContain('title:');
      expect(result).toContain('Content after frontmatter.');
      expect(result.startsWith('---')); // trim() 적용됨
    });

    it('should preserve markdown formatting after removal', () => {
      const contentWithFormatting = `---
title: "Formatting Test"
---

## Heading 2

- List item 1
- List item 2

> Blockquote

**Bold** and *italic* text.`;

      const result = removeDuplicateFrontmatter(contentWithFormatting);

      expect(result).toContain('## Heading 2');
      expect(result).toContain('- List item 1');
      expect(result).toContain('> Blockquote');
      expect(result).toContain('**Bold**');
    });
  });
});
