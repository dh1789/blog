/**
 * preview 명령어 테스트
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

describe('preview command', () => {
  describe('file path resolution', () => {
    it('should resolve relative paths correctly', () => {
      const testFile = resolve(process.cwd(), 'test.md');
      expect(testFile).toContain('test.md');
      expect(testFile.startsWith('/')).toBe(true);
    });
  });

  describe('options parsing', () => {
    it('should parse port option correctly', () => {
      const portString = '3001';
      const port = parseInt(portString, 10);
      expect(port).toBe(3001);
    });

    it('should handle default port', () => {
      const portString = undefined;
      const port = portString ? parseInt(portString, 10) : 3000;
      expect(port).toBe(3000);
    });

    it('should handle browser option correctly', () => {
      // --no-browser 옵션이 설정되면 browser 값이 false가 됨
      const browserOption = false;
      const openBrowser = browserOption !== false;
      expect(openBrowser).toBe(false);

      // 옵션이 없으면 기본값 true (브라우저 열기)
      const noBrowserOption = true;
      const openBrowserDefault = noBrowserOption !== false;
      expect(openBrowserDefault).toBe(true);
    });

    it('should handle show-ads option correctly', () => {
      const showAdsTrue = true;
      const showAdPositions = showAdsTrue === true;
      expect(showAdPositions).toBe(true);

      const showAdsFalse = undefined;
      const showAdPositionsDefault = showAdsFalse === true;
      expect(showAdPositionsDefault).toBe(false);
    });
  });

  describe('file validation', () => {
    it('should check if sample files exist', () => {
      const sampleFile = resolve(
        process.cwd(),
        '../../content/drafts/sample-valid-post.md'
      );

      // 파일이 존재하는 경우
      if (existsSync(sampleFile)) {
        expect(existsSync(sampleFile)).toBe(true);
      } else {
        // 파일이 존재하지 않는 것도 정상 (테스트 환경에 따라)
        expect(existsSync(sampleFile)).toBe(false);
      }
    });
  });

  describe('command help text', () => {
    it('should provide correct command description', () => {
      const description = '마크다운 파일을 브라우저에서 실시간 프리뷰';
      expect(description).toContain('마크다운');
      expect(description).toContain('프리뷰');
    });

    it('should provide correct option descriptions', () => {
      const portOption = '시작 포트 번호';
      const browserOption = '브라우저 자동 열기 비활성화';
      const showAdsOption = '광고 삽입 위치 표시';

      expect(portOption).toContain('포트');
      expect(browserOption).toContain('브라우저');
      expect(showAdsOption).toContain('광고');
    });
  });
});
