/**
 * 임베딩 캐시 시스템 테스트
 * TDD 방식: Red → Green → Refactor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  EmbeddingCache,
  CachedEmbedder,
  CostBreakdown,
  ModelConfig,
  estimateMonthlyCost,
  selectModel,
  MODELS,
} from './embedding-cache';

describe('Embedding Cache Module', () => {
  describe('EmbeddingCache', () => {
    let cache: EmbeddingCache;

    beforeEach(() => {
      cache = new EmbeddingCache(100, 1000); // 100개 항목, 1초 TTL
    });

    it('should store and retrieve embeddings', () => {
      const embedding = [0.1, 0.2, 0.3];
      cache.set('hello', embedding);

      expect(cache.get('hello')).toEqual(embedding);
    });

    it('should return null for missing keys', () => {
      expect(cache.get('unknown')).toBeNull();
    });

    it('should expire entries after TTL', async () => {
      const embedding = [0.1, 0.2, 0.3];
      cache.set('hello', embedding, 50); // 50ms TTL

      expect(cache.get('hello')).toEqual(embedding);

      // TTL 대기
      await new Promise(r => setTimeout(r, 100));

      expect(cache.get('hello')).toBeNull();
    });

    it('should evict oldest entry when full', () => {
      const smallCache = new EmbeddingCache(2, 60000);

      smallCache.set('first', [1]);
      smallCache.set('second', [2]);
      smallCache.set('third', [3]); // first가 제거되어야 함

      expect(smallCache.get('first')).toBeNull();
      expect(smallCache.get('second')).toEqual([2]);
      expect(smallCache.get('third')).toEqual([3]);
    });

    it('should report correct stats', () => {
      cache.set('a', [1]);
      cache.set('b', [2]);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(100);
    });
  });

  describe('CachedEmbedder', () => {
    it('should cache embeddings and avoid redundant API calls', async () => {
      const mockEmbed = vi.fn().mockResolvedValue([0.1, 0.2, 0.3]);
      const embedder = new CachedEmbedder(mockEmbed, 100);

      // 첫 번째 호출 - API 호출
      await embedder.embed('hello');
      expect(mockEmbed).toHaveBeenCalledTimes(1);

      // 두 번째 호출 - 캐시 히트
      await embedder.embed('hello');
      expect(mockEmbed).toHaveBeenCalledTimes(1); // 증가하지 않음
    });

    it('should track hit rate', async () => {
      const mockEmbed = vi.fn().mockResolvedValue([0.1, 0.2]);
      const embedder = new CachedEmbedder(mockEmbed, 100);

      await embedder.embed('a'); // miss
      await embedder.embed('a'); // hit
      await embedder.embed('b'); // miss
      await embedder.embed('a'); // hit

      expect(embedder.getHitRate()).toBeCloseTo(0.5); // 2 hits / 4 calls
    });

    it('should call API for different texts', async () => {
      const mockEmbed = vi.fn().mockResolvedValue([0.1]);
      const embedder = new CachedEmbedder(mockEmbed, 100);

      await embedder.embed('hello');
      await embedder.embed('world');

      expect(mockEmbed).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cost Estimation', () => {
    it('should estimate monthly cost breakdown', () => {
      const cost = estimateMonthlyCost(1000, 100);

      expect(cost.embedding).toBeGreaterThanOrEqual(0);
      expect(cost.vectorStorage).toBeGreaterThanOrEqual(0);
      expect(cost.llmGeneration).toBeGreaterThan(0);
      expect(cost.total).toBe(
        cost.embedding + cost.vectorStorage + cost.llmGeneration
      );
    });

    it('should use free tier for small document counts', () => {
      const cost = estimateMonthlyCost(100, 10);
      expect(cost.vectorStorage).toBe(0);
    });

    it('should charge for large document counts', () => {
      const cost = estimateMonthlyCost(600000, 100);
      expect(cost.vectorStorage).toBe(25);
    });
  });

  describe('Model Selection', () => {
    it('should return haiku for simple use case', () => {
      const model = selectModel('simple');
      expect(model.name).toContain('haiku');
      expect(model.speed).toBe('fast');
    });

    it('should return sonnet for complex use case', () => {
      const model = selectModel('complex');
      expect(model.name).toContain('sonnet');
      expect(model.quality).toBe('high');
    });

    it('should return opus for critical use case', () => {
      const model = selectModel('critical');
      expect(model.name).toContain('opus');
      expect(model.speed).toBe('slow');
      expect(model.quality).toBe('high');
    });

    it('should have correct cost structure for models', () => {
      expect(MODELS['claude-3-haiku'].inputCostPer1M).toBeLessThan(
        MODELS['claude-sonnet-4'].inputCostPer1M
      );
      expect(MODELS['claude-sonnet-4'].inputCostPer1M).toBeLessThan(
        MODELS['claude-opus-4'].inputCostPer1M
      );
    });
  });
});
