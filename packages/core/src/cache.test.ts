/**
 * KeywordCache 유닛 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KeywordCache } from './cache';
import fs from 'fs';
import path from 'path';
import type { KeywordData } from '@blog/shared';

describe('KeywordCache', () => {
  let cache: KeywordCache;
  let testCacheDir: string;

  beforeEach(() => {
    // 테스트용 임시 캐시 디렉토리 생성
    testCacheDir = path.join(process.cwd(), '.cache-test', `test-${Date.now()}`);
    cache = new KeywordCache(testCacheDir, 3600); // 1 hour TTL for tests
  });

  afterEach(() => {
    // 테스트 후 캐시 디렉토리 정리
    if (fs.existsSync(testCacheDir)) {
      const files = fs.readdirSync(testCacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testCacheDir, file));
      }
      fs.rmdirSync(testCacheDir);
      // 부모 디렉토리도 정리
      const parentDir = path.dirname(testCacheDir);
      if (fs.existsSync(parentDir) && fs.readdirSync(parentDir).length === 0) {
        fs.rmdirSync(parentDir);
      }
    }
  });

  const mockKeywordData: KeywordData = {
    keyword: 'test keyword',
    searchVolume: 1000,
    cpc: 2.5,
    competition: 'MEDIUM',
    competitionIndex: 50,
  };

  describe('CRUD Operations', () => {
    describe('set() and get()', () => {
      it('should store and retrieve keyword data', () => {
        cache.set('test keyword', mockKeywordData);

        const retrieved = cache.get('test keyword');

        expect(retrieved).toEqual(mockKeywordData);
      });

      it('should return null for non-existent keyword', () => {
        const retrieved = cache.get('non-existent keyword');

        expect(retrieved).toBeNull();
      });

      it('should overwrite existing cache entry', () => {
        cache.set('test keyword', mockKeywordData);

        const updatedData: KeywordData = {
          ...mockKeywordData,
          searchVolume: 5000,
          cpc: 5.0,
        };

        cache.set('test keyword', updatedData);

        const retrieved = cache.get('test keyword');

        expect(retrieved).toEqual(updatedData);
        expect(retrieved?.searchVolume).toBe(5000);
        expect(retrieved?.cpc).toBe(5.0);
      });

      it('should handle keywords with special characters', () => {
        const specialKeyword = 'test-keyword_2024 (updated)';
        const data: KeywordData = {
          ...mockKeywordData,
          keyword: specialKeyword,
        };

        cache.set(specialKeyword, data);
        const retrieved = cache.get(specialKeyword);

        expect(retrieved).toEqual(data);
      });

      it('should be case-insensitive for keyword matching', () => {
        cache.set('Test Keyword', mockKeywordData);

        const retrieved1 = cache.get('test keyword');
        const retrieved2 = cache.get('TEST KEYWORD');

        expect(retrieved1).toEqual(mockKeywordData);
        expect(retrieved2).toEqual(mockKeywordData);
      });
    });

    describe('has()', () => {
      it('should return true for existing keyword', () => {
        cache.set('test keyword', mockKeywordData);

        expect(cache.has('test keyword')).toBe(true);
      });

      it('should return false for non-existent keyword', () => {
        expect(cache.has('non-existent keyword')).toBe(false);
      });

      it('should return false after cache is invalidated', () => {
        cache.set('test keyword', mockKeywordData);
        expect(cache.has('test keyword')).toBe(true);

        cache.invalidate('test keyword');
        expect(cache.has('test keyword')).toBe(false);
      });
    });

    describe('invalidate()', () => {
      it('should delete cached keyword data', () => {
        cache.set('test keyword', mockKeywordData);
        expect(cache.get('test keyword')).toEqual(mockKeywordData);

        cache.invalidate('test keyword');

        expect(cache.get('test keyword')).toBeNull();
        expect(cache.has('test keyword')).toBe(false);
      });

      it('should not throw error when invalidating non-existent keyword', () => {
        expect(() => {
          cache.invalidate('non-existent keyword');
        }).not.toThrow();
      });

      it('should only delete specified keyword', () => {
        cache.set('keyword1', mockKeywordData);
        cache.set('keyword2', { ...mockKeywordData, keyword: 'keyword2' });

        cache.invalidate('keyword1');

        expect(cache.has('keyword1')).toBe(false);
        expect(cache.has('keyword2')).toBe(true);
      });
    });

    describe('clear()', () => {
      it('should delete all cached data', () => {
        cache.set('keyword1', mockKeywordData);
        cache.set('keyword2', { ...mockKeywordData, keyword: 'keyword2' });
        cache.set('keyword3', { ...mockKeywordData, keyword: 'keyword3' });

        cache.clear();

        expect(cache.has('keyword1')).toBe(false);
        expect(cache.has('keyword2')).toBe(false);
        expect(cache.has('keyword3')).toBe(false);
      });

      it('should not throw error when clearing empty cache', () => {
        expect(() => {
          cache.clear();
        }).not.toThrow();
      });

      it('should allow setting new data after clear', () => {
        cache.set('keyword1', mockKeywordData);
        cache.clear();

        cache.set('keyword2', mockKeywordData);

        expect(cache.get('keyword2')).toEqual(mockKeywordData);
      });
    });
  });

  describe('TTL Management', () => {
    it('should return cached data before TTL expires', () => {
      cache.set('test keyword', mockKeywordData, 3600); // 1 hour

      const retrieved = cache.get('test keyword');

      expect(retrieved).toEqual(mockKeywordData);
      expect(cache.has('test keyword')).toBe(true);
    });

    it('should return null and delete expired cache', () => {
      // Create cache with very short TTL
      const shortTTLCache = new KeywordCache(testCacheDir, 1); // 1 second
      shortTTLCache.set('test keyword', mockKeywordData);

      // Wait for TTL to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const retrieved = shortTTLCache.get('test keyword');

          expect(retrieved).toBeNull();
          expect(shortTTLCache.has('test keyword')).toBe(false);
          resolve(undefined);
        }, 1100); // Wait 1.1 seconds
      });
    });

    it('should use custom TTL when provided', () => {
      cache.set('short-lived', mockKeywordData, 1); // 1 second TTL

      expect(cache.has('short-lived')).toBe(true);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(cache.has('short-lived')).toBe(false);
          resolve(undefined);
        }, 1100);
      });
    });

    it('should use default TTL when custom TTL not provided', () => {
      const defaultTTLCache = new KeywordCache(testCacheDir, 7200); // 2 hours default
      defaultTTLCache.set('test keyword', mockKeywordData);

      // Should still be valid after a short time
      expect(defaultTTLCache.has('test keyword')).toBe(true);
      expect(defaultTTLCache.get('test keyword')).toEqual(mockKeywordData);
    });

    it('should handle different TTLs for different keywords', () => {
      cache.set('long-lived', mockKeywordData, 3600); // 1 hour
      cache.set('short-lived', mockKeywordData, 1); // 1 second

      expect(cache.has('long-lived')).toBe(true);
      expect(cache.has('short-lived')).toBe(true);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(cache.has('long-lived')).toBe(true);
          expect(cache.has('short-lived')).toBe(false);
          resolve(undefined);
        }, 1100);
      });
    });
  });

  describe('File System Operations', () => {
    it('should create cache directory if it does not exist', () => {
      const newCacheDir = path.join(process.cwd(), '.cache-test', `new-${Date.now()}`);

      expect(fs.existsSync(newCacheDir)).toBe(false);

      new KeywordCache(newCacheDir);

      expect(fs.existsSync(newCacheDir)).toBe(true);

      // Cleanup
      fs.rmdirSync(newCacheDir);
      const parentDir = path.dirname(newCacheDir);
      if (fs.readdirSync(parentDir).length === 0) {
        fs.rmdirSync(parentDir);
      }
    });

    it('should store cache as JSON files', () => {
      cache.set('test keyword', mockKeywordData);

      const files = fs.readdirSync(testCacheDir);

      expect(files.length).toBeGreaterThan(0);
      expect(files.some((file) => file.endsWith('.json'))).toBe(true);
    });

    it('should use MD5 hash for file names', () => {
      cache.set('test keyword', mockKeywordData);

      const files = fs.readdirSync(testCacheDir);
      const jsonFiles = files.filter((file) => file.endsWith('.json'));

      expect(jsonFiles.length).toBe(1);
      // MD5 hash should be 32 characters
      expect(jsonFiles[0].replace('.json', '').length).toBe(32);
    });

    it('should handle file read errors gracefully', () => {
      cache.set('test keyword', mockKeywordData);

      // Get file path and corrupt the file
      const files = fs.readdirSync(testCacheDir);
      const filePath = path.join(testCacheDir, files[0]);
      fs.writeFileSync(filePath, 'invalid json', 'utf-8');

      // Should return null instead of throwing
      const retrieved = cache.get('test keyword');

      expect(retrieved).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string keyword', () => {
      const emptyKeywordData: KeywordData = {
        ...mockKeywordData,
        keyword: '',
      };

      cache.set('', emptyKeywordData);
      const retrieved = cache.get('');

      expect(retrieved).toEqual(emptyKeywordData);
    });

    it('should handle very long keywords', () => {
      const longKeyword = 'a'.repeat(1000);
      const data: KeywordData = {
        ...mockKeywordData,
        keyword: longKeyword,
      };

      cache.set(longKeyword, data);
      const retrieved = cache.get(longKeyword);

      expect(retrieved).toEqual(data);
    });

    it('should handle keywords with unicode characters', () => {
      const unicodeKeyword = '한글 키워드 テスト 测试';
      const data: KeywordData = {
        ...mockKeywordData,
        keyword: unicodeKeyword,
      };

      cache.set(unicodeKeyword, data);
      const retrieved = cache.get(unicodeKeyword);

      expect(retrieved).toEqual(data);
    });

    it('should handle multiple rapid set operations on same keyword', () => {
      for (let i = 0; i < 10; i++) {
        cache.set('test keyword', {
          ...mockKeywordData,
          searchVolume: i * 1000,
        });
      }

      const retrieved = cache.get('test keyword');

      expect(retrieved?.searchVolume).toBe(9000);
    });
  });
});
