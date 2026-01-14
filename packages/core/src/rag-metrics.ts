/**
 * RAG 메트릭 수집 및 알림 시스템 모듈
 *
 * 프로덕션 RAG 시스템의 모니터링을 위한 도구를 제공합니다.
 * - 요청 성공/실패 추적
 * - 지연 시간 백분위수 계산
 * - 캐시 히트율 추적
 * - 임계값 기반 알림
 */

/**
 * 알림 인터페이스
 */
export interface Alert {
  level: 'warning' | 'critical';
  message: string;
  timestamp: Date;
}

/**
 * 알림 콜백 타입
 */
export type AlertCallback = (alert: Alert) => void;

/**
 * 알림 매니저 설정
 */
export interface AlertManagerConfig {
  onAlert?: AlertCallback;
  thresholds?: {
    errorRate?: number;
    latencyP95?: number;
    cacheHitRate?: number;
  };
}

/**
 * 메트릭 데이터 인터페이스
 */
export interface MetricsData {
  requests: {
    total: number;
    success: number;
    failed: number;
  };
  successRate: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  cache: {
    hits: number;
    misses: number;
  };
  cacheHitRate: number;
}

/**
 * 커스텀 RAG 에러 클래스
 */
export class RAGError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'RAGError';
  }
}

/**
 * 에러 팩토리 메서드
 */
export const RAGErrors = {
  EMBEDDING_FAILED: (msg: string) =>
    new RAGError(msg, 'EMBEDDING_FAILED', 503, true),
  SEARCH_FAILED: (msg: string) =>
    new RAGError(msg, 'SEARCH_FAILED', 503, true),
  GENERATION_FAILED: (msg: string) =>
    new RAGError(msg, 'GENERATION_FAILED', 503, true),
  RATE_LIMITED: () =>
    new RAGError('Rate limit exceeded', 'RATE_LIMITED', 429, true),
  INVALID_INPUT: (msg: string) =>
    new RAGError(msg, 'INVALID_INPUT', 400, false),
};

/**
 * 메트릭 수집기 클래스
 */
export class MetricsCollector {
  private metrics = {
    requests: {
      total: 0,
      success: 0,
      failed: 0,
    },
    latency: {
      p50: 0,
      p95: 0,
      p99: 0,
    },
    cache: {
      hits: 0,
      misses: 0,
    },
  };

  private latencies: number[] = [];

  /**
   * 요청 결과 기록
   */
  recordRequest(success: boolean, latency: number): void {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.failed++;
    }

    this.latencies.push(latency);
    this.updateLatencyPercentiles();
  }

  /**
   * 캐시 히트/미스 기록
   */
  recordCacheHit(hit: boolean): void {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
  }

  /**
   * 지연 시간 백분위수 업데이트
   */
  private updateLatencyPercentiles(): void {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.latency.p50 = sorted[Math.floor(len * 0.5)] || 0;
    this.metrics.latency.p95 = sorted[Math.floor(len * 0.95)] || 0;
    this.metrics.latency.p99 = sorted[Math.floor(len * 0.99)] || 0;
  }

  /**
   * 현재 메트릭 반환
   */
  getMetrics(): MetricsData {
    const total = this.metrics.requests.total;
    const cacheTotal = this.metrics.cache.hits + this.metrics.cache.misses;

    return {
      ...this.metrics,
      successRate: total > 0 ? this.metrics.requests.success / total : 0,
      cacheHitRate: cacheTotal > 0 ? this.metrics.cache.hits / cacheTotal : 0,
    };
  }
}

/**
 * 알림 매니저 클래스
 */
export class AlertManager {
  private alerts: Alert[] = [];
  private onAlert?: AlertCallback;
  private thresholds = {
    errorRate: 0.1,
    latencyP95: 5000,
    cacheHitRate: 0.5,
  };

  constructor(config: AlertManagerConfig = {}) {
    this.onAlert = config.onAlert;
    if (config.thresholds) {
      Object.assign(this.thresholds, config.thresholds);
    }
  }

  /**
   * 메트릭 확인 및 알림 발생
   */
  checkMetrics(metrics: MetricsData): void {
    // 에러율 체크
    const errorRate = 1 - metrics.successRate;
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert('critical', `High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    // 지연 시간 체크
    if (metrics.latency.p95 > this.thresholds.latencyP95) {
      this.addAlert('warning', `High latency P95: ${metrics.latency.p95}ms`);
    }

    // 캐시 히트율 체크
    if (metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      this.addAlert('warning', `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    }
  }

  /**
   * 알림 추가
   */
  private addAlert(level: Alert['level'], message: string): void {
    const alert: Alert = { level, message, timestamp: new Date() };
    this.alerts.push(alert);

    if (this.onAlert) {
      this.onAlert(alert);
    }
  }

  /**
   * 알림 기록 반환
   */
  getAlerts(): Alert[] {
    return [...this.alerts];
  }
}

/**
 * 헬퍼: sleep 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 래퍼 함수
 *
 * @param fn - 실행할 함수
 * @param maxRetries - 최대 재시도 횟수
 * @param delay - 재시도 간격 (ms)
 * @returns 함수 실행 결과
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 재시도 불가능한 에러는 즉시 throw
      if (error instanceof RAGError && !error.retryable) {
        throw error;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < maxRetries) {
        const waitTime = error instanceof RAGError && error.code === 'RATE_LIMITED'
          ? delay * attempt * 2
          : delay * attempt;
        await sleep(waitTime);
      }
    }
  }

  throw lastError;
}
