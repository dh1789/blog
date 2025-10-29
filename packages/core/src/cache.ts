/**
 * Keyword cache implementation with file-based storage
 * Provides TTL management and automatic expiration checking
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { KeywordData } from '@blog/shared';

interface CacheEntry {
  data: KeywordData;
  timestamp: number;
  ttl: number;
}

/**
 * KeywordCache - File-based cache for Google Ads API keyword data
 *
 * Features:
 * - File-based storage in .cache/keywords/ directory
 * - TTL management (default: 24 hours)
 * - Automatic expiration checking
 * - MD5 hash-based cache keys
 */
export class KeywordCache {
  private cacheDir: string;
  private defaultTTL: number;

  /**
   * Create a new KeywordCache instance
   * @param cacheDir Cache directory path (default: '.cache/keywords')
   * @param defaultTTL Default TTL in seconds (default: 86400 = 24 hours)
   */
  constructor(cacheDir = '.cache/keywords', defaultTTL = 86400) {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
    this.defaultTTL = defaultTTL;
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate MD5 hash from keyword for cache file name
   */
  private hashKeyword(keyword: string): string {
    return crypto.createHash('md5').update(keyword.toLowerCase()).digest('hex');
  }

  /**
   * Get cache file path for a keyword
   */
  private getCacheFilePath(keyword: string): string {
    const hash = this.hashKeyword(keyword);
    return path.join(this.cacheDir, `${hash}.json`);
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const expiresAt = entry.timestamp + entry.ttl * 1000;
    return now > expiresAt;
  }

  /**
   * Get cached keyword data
   * @param keyword Keyword to retrieve
   * @returns Keyword data or null if not found or expired
   */
  get(keyword: string): KeywordData | null {
    const filePath = this.getCacheFilePath(keyword);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(content);

      if (this.isExpired(entry)) {
        this.invalidate(keyword);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to read cache for keyword "${keyword}":`, error);
      return null;
    }
  }

  /**
   * Set cached keyword data
   * @param keyword Keyword to cache
   * @param data Keyword data to store
   * @param ttl TTL in seconds (optional, uses default if not provided)
   */
  set(keyword: string, data: KeywordData, ttl?: number): void {
    this.ensureCacheDir();

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };

    const filePath = this.getCacheFilePath(keyword);

    try {
      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to write cache for keyword "${keyword}":`, error);
    }
  }

  /**
   * Check if keyword exists in cache and is not expired
   * @param keyword Keyword to check
   * @returns true if cached and not expired, false otherwise
   */
  has(keyword: string): boolean {
    const filePath = this.getCacheFilePath(keyword);

    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(content);

      if (this.isExpired(entry)) {
        this.invalidate(keyword);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Invalidate (delete) cached keyword data
   * @param keyword Keyword to invalidate
   */
  invalidate(keyword: string): void {
    const filePath = this.getCacheFilePath(keyword);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to invalidate cache for keyword "${keyword}":`, error);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    if (!fs.existsSync(this.cacheDir)) {
      return;
    }

    try {
      const files = fs.readdirSync(this.cacheDir);

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        if (file.endsWith('.json')) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
