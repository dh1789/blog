/**
 * 마크다운 이미지 처리 유닛 테스트
 */

import { describe, it, expect } from 'vitest';
import { parseImagePaths, replaceImageUrls, resolveImagePath } from './markdown';

describe('parseImagePaths', () => {
  // Happy Path
  it('should parse relative image paths from markdown', () => {
    const content = '![alt text](./images/test.png)';
    const paths = parseImagePaths(content);

    expect(paths).toEqual(['./images/test.png']);
  });

  it('should parse multiple image paths', () => {
    const content = `
![image1](./a.png)
![image2](../b.jpg)
![image3](images/c.gif)
    `;
    const paths = parseImagePaths(content);

    expect(paths).toHaveLength(3);
    expect(paths).toContain('./a.png');
    expect(paths).toContain('../b.jpg');
    expect(paths).toContain('images/c.gif');
  });

  it('should parse HTML img tags', () => {
    const content = '<img src="./test.png" alt="test">';
    const paths = parseImagePaths(content);

    expect(paths).toEqual(['./test.png']);
  });

  it('should parse both markdown and HTML images', () => {
    const content = `
![markdown](./md-image.png)
<img src="./html-image.jpg">
    `;
    const paths = parseImagePaths(content);

    expect(paths).toHaveLength(2);
    expect(paths).toContain('./md-image.png');
    expect(paths).toContain('./html-image.jpg');
  });

  // Boundary Conditions
  it('should handle empty content', () => {
    const paths = parseImagePaths('');
    expect(paths).toEqual([]);
  });

  it('should handle content without images', () => {
    const content = 'This is just text without images.';
    const paths = parseImagePaths(content);

    expect(paths).toEqual([]);
  });

  it('should remove duplicate paths', () => {
    const content = `
![image1](./test.png)
<img src="./test.png">
    `;
    const paths = parseImagePaths(content);

    expect(paths).toEqual(['./test.png']);
  });

  // Exception Cases
  it('should ignore external URLs (http)', () => {
    const content = '![external](http://example.com/image.png)';
    const paths = parseImagePaths(content);

    expect(paths).toEqual([]);
  });

  it('should ignore external URLs (https)', () => {
    const content = '![external](https://example.com/image.png)';
    const paths = parseImagePaths(content);

    expect(paths).toEqual([]);
  });

  it('should filter mixed local and external images', () => {
    const content = `
![local](./local.png)
![external](https://example.com/external.png)
![another-local](../another.jpg)
    `;
    const paths = parseImagePaths(content);

    expect(paths).toHaveLength(2);
    expect(paths).toContain('./local.png');
    expect(paths).toContain('../another.jpg');
  });

  it('should handle images with spaces in path', () => {
    const content = '![image](./path with spaces/image.png)';
    const paths = parseImagePaths(content);

    expect(paths).toEqual(['./path with spaces/image.png']);
  });
});

describe('replaceImageUrls', () => {
  // Happy Path
  it('should replace image URL in markdown', () => {
    const content = '![alt](./images/test.png)';
    const map = new Map([
      ['./images/test.png', 'https://example.com/wp-content/uploads/test.png']
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toBe('![alt](https://example.com/wp-content/uploads/test.png)');
  });

  it('should replace multiple image URLs', () => {
    const content = `
![image1](./a.png)
![image2](./b.jpg)
    `;
    const map = new Map([
      ['./a.png', 'https://example.com/a-wp.png'],
      ['./b.jpg', 'https://example.com/b-wp.jpg'],
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toContain('![image1](https://example.com/a-wp.png)');
    expect(result).toContain('![image2](https://example.com/b-wp.jpg)');
  });

  it('should replace HTML img src', () => {
    const content = '<img src="./test.png" alt="test">';
    const map = new Map([
      ['./test.png', 'https://example.com/test-wp.png']
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toBe('<img src="https://example.com/test-wp.png" alt="test">');
  });

  it('should replace both markdown and HTML images', () => {
    const content = `
![markdown](./md.png)
<img src="./html.jpg">
    `;
    const map = new Map([
      ['./md.png', 'https://example.com/md-wp.png'],
      ['./html.jpg', 'https://example.com/html-wp.jpg'],
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toContain('![markdown](https://example.com/md-wp.png)');
    expect(result).toContain('<img src="https://example.com/html-wp.jpg">');
  });

  // Boundary Conditions
  it('should handle empty map', () => {
    const content = '![alt](./test.png)';
    const map = new Map();

    const result = replaceImageUrls(content, map);

    expect(result).toBe(content);
  });

  it('should handle empty content', () => {
    const map = new Map([['./test.png', 'https://example.com/test.png']]);

    const result = replaceImageUrls('', map);

    expect(result).toBe('');
  });

  it('should not modify external URLs', () => {
    const content = '![external](https://example.com/external.png)';
    const map = new Map([
      ['https://example.com/external.png', 'https://wordpress.com/new.png']
    ]);

    const result = replaceImageUrls(content, map);

    // External URLs should be replaced if in map
    expect(result).toContain('https://wordpress.com/new.png');
  });

  it('should preserve alt text and attributes', () => {
    const content = '![Important Image](./test.png)';
    const map = new Map([
      ['./test.png', 'https://example.com/test-wp.png']
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toBe('![Important Image](https://example.com/test-wp.png)');
  });

  // Exception Cases
  it('should not fail with paths not in map', () => {
    const content = '![alt](./not-in-map.png)';
    const map = new Map([
      ['./different.png', 'https://example.com/different.png']
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toBe(content);
  });

  it('should handle special characters in paths', () => {
    const content = '![alt](./path/image (1).png)';
    const map = new Map([
      ['./path/image (1).png', 'https://example.com/image-1.png']
    ]);

    const result = replaceImageUrls(content, map);

    expect(result).toBe('![alt](https://example.com/image-1.png)');
  });
});

describe('resolveImagePath', () => {
  // Happy Path
  it('should resolve relative path with ./', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = './images/test.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/posts/ko/images/test.png');
  });

  it('should resolve parent directory path with ../', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = '../images/test.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/posts/images/test.png');
  });

  it('should resolve path without ./ prefix', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = 'images/test.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/posts/ko/images/test.png');
  });

  // Boundary Conditions
  it('should handle nested relative paths', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = './a/b/c/test.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/posts/ko/a/b/c/test.png');
  });

  it('should handle multiple parent directory traversals', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = '../../images/test.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/images/test.png');
  });

  it('should handle absolute paths', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const absolutePath = '/absolute/path/image.png';

    const result = resolveImagePath(basePath, absolutePath);

    expect(result).toBe('/absolute/path/image.png');
  });

  // Exception Cases
  it('should handle paths with spaces', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = './images/test image.png';

    const result = resolveImagePath(basePath, relativePath);

    expect(result).toBe('/Users/me/blog/posts/ko/images/test image.png');
  });

  it('should handle Windows-style paths on Unix', () => {
    const basePath = '/Users/me/blog/posts/ko';
    const relativePath = '.\\images\\test.png';

    // path.resolve handles both / and \ on Unix
    const result = resolveImagePath(basePath, relativePath);

    expect(result).toContain('images');
    expect(result).toContain('test.png');
  });
});
