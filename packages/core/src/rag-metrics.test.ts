/**
 * RAG 메트릭 및 알림 시스템 테스트
 * TDD 방식: Red → Green → Refactor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MetricsCollector,
  AlertManager,
  RAGError,
  RAGErrors,
  withRetry,
} from './rag-metrics';

describe('RAG Metrics Module', () => {
  describe('MetricsCollector', () => {
    let collector: MetricsCollector;

    beforeEach(() => {
      collector = new MetricsCollector();
    });

    it('should track total requests', () => {
      collector.recordRequest(true, 100);
      collector.recordRequest(false, 200);
      collector.recordRequest(true, 150);

      const metrics = collector.getMetrics();
      expect(metrics.requests.total).toBe(3);
      expect(metrics.requests.success).toBe(2);
      expect(metrics.requests.failed).toBe(1);
    });

    it('should calculate success rate', () => {
      collector.recordRequest(true, 100);
      collector.recordRequest(true, 100);
      collector.recordRequest(false, 100);
      collector.recordRequest(true, 100);

      const metrics = collector.getMetrics();
      expect(metrics.successRate).toBeCloseTo(0.75);
    });

    it('should calculate latency percentiles', () => {
      // 10개의 지연 시간 기록
      [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].forEach(latency => {
        collector.recordRequest(true, latency);
      });

      const metrics = collector.getMetrics();
      expect(metrics.latency.p50).toBe(600); // floor(10 * 0.5) = 5번째 인덱스
      expect(metrics.latency.p95).toBeGreaterThanOrEqual(900);
      expect(metrics.latency.p99).toBeGreaterThanOrEqual(900);
    });

    it('should track cache hits', () => {
      collector.recordCacheHit(true);
      collector.recordCacheHit(true);
      collector.recordCacheHit(false);

      const metrics = collector.getMetrics();
      expect(metrics.cache.hits).toBe(2);
      expect(metrics.cache.misses).toBe(1);
      expect(metrics.cacheHitRate).toBeCloseTo(0.67, 1);
    });

    it('should handle empty metrics', () => {
      const metrics = collector.getMetrics();
      expect(metrics.successRate).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe('AlertManager', () => {
    let alertManager: AlertManager;
    let mockNotify: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockNotify = vi.fn();
      alertManager = new AlertManager({ onAlert: mockNotify });
    });

    it('should trigger alert on high error rate', () => {
      alertManager.checkMetrics({
        requests: { total: 100, success: 85, failed: 15 },
        successRate: 0.85, // 15% 에러율
        latency: { p50: 100, p95: 200, p99: 300 },
        cache: { hits: 50, misses: 50 },
        cacheHitRate: 0.5,
      });

      expect(mockNotify).toHaveBeenCalled();
      const alert = mockNotify.mock.calls[0][0];
      expect(alert.level).toBe('critical');
      expect(alert.message).toContain('error rate');
    });

    it('should trigger alert on high latency', () => {
      alertManager.checkMetrics({
        requests: { total: 100, success: 99, failed: 1 },
        successRate: 0.99,
        latency: { p50: 1000, p95: 6000, p99: 8000 }, // p95 > 5000ms
        cache: { hits: 50, misses: 50 },
        cacheHitRate: 0.5,
      });

      expect(mockNotify).toHaveBeenCalled();
      const alert = mockNotify.mock.calls[0][0];
      expect(alert.level).toBe('warning');
      expect(alert.message).toContain('latency');
    });

    it('should trigger alert on low cache hit rate', () => {
      alertManager.checkMetrics({
        requests: { total: 100, success: 99, failed: 1 },
        successRate: 0.99,
        latency: { p50: 100, p95: 200, p99: 300 },
        cache: { hits: 20, misses: 80 },
        cacheHitRate: 0.2, // 20% < 50%
      });

      expect(mockNotify).toHaveBeenCalled();
      const alert = mockNotify.mock.calls[0][0];
      expect(alert.level).toBe('warning');
      expect(alert.message).toContain('cache hit rate');
    });

    it('should not trigger alert for healthy metrics', () => {
      alertManager.checkMetrics({
        requests: { total: 100, success: 98, failed: 2 },
        successRate: 0.98,
        latency: { p50: 100, p95: 500, p99: 800 },
        cache: { hits: 70, misses: 30 },
        cacheHitRate: 0.7,
      });

      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('should return alert history', () => {
      alertManager.checkMetrics({
        requests: { total: 100, success: 80, failed: 20 },
        successRate: 0.80,
        latency: { p50: 100, p95: 200, p99: 300 },
        cache: { hits: 50, misses: 50 },
        cacheHitRate: 0.5,
      });

      const alerts = alertManager.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('RAGError', () => {
    it('should create custom error with code', () => {
      const error = new RAGError('Test error', 'TEST_CODE', 500, true);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });

    it('should have factory methods for common errors', () => {
      const embeddingError = RAGErrors.EMBEDDING_FAILED('Failed to embed');
      expect(embeddingError.code).toBe('EMBEDDING_FAILED');
      expect(embeddingError.retryable).toBe(true);

      const rateLimitError = RAGErrors.RATE_LIMITED();
      expect(rateLimitError.statusCode).toBe(429);

      const invalidInputError = RAGErrors.INVALID_INPUT('Bad input');
      expect(invalidInputError.retryable).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fail'));

      await expect(withRetry(fn, 3, 10)).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(
        RAGErrors.INVALID_INPUT('Bad input')
      );

      await expect(withRetry(fn, 3, 10)).rejects.toThrow('Bad input');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
