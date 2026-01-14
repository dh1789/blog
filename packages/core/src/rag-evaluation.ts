/**
 * RAG 평가 시스템 모듈
 *
 * RAG 시스템의 품질을 측정하는 평가 도구를 제공합니다.
 * - 정확도 (Accuracy): 답변이 질문에 맞는가?
 * - 관련성 (Relevance): 검색된 문서가 질문과 관련 있는가?
 * - 충실도 (Faithfulness): 답변이 문서 내용에 충실한가?
 */

import type { Citation } from './rag';

/**
 * RAG 평가 지표 인터페이스
 */
export interface RAGEvaluationMetrics {
  /** 정확도: 답변이 질문에 맞는가? (0-1) */
  accuracy: number;
  /** 관련성: 검색된 문서가 질문과 관련 있는가? (0-1) */
  relevance: number;
  /** 충실도: 답변이 문서 내용에 충실한가? (0-1) */
  faithfulness: number;
}

/**
 * 평가 케이스 인터페이스
 */
export interface EvaluationCase {
  /** 테스트 질문 */
  question: string;
  /** 예상 답변 */
  expectedAnswer: string;
  /** 관련 있어야 할 문서 ID 목록 */
  relevantDocIds: string[];
}

/**
 * 평가 가중치 인터페이스
 */
export interface EvaluationWeights {
  accuracy: number;
  relevance: number;
  faithfulness: number;
}

/**
 * RAG 생성 결과 인터페이스
 */
export interface RAGGenerationResult {
  content: string;
  citations: Citation[];
}

/**
 * RAG 생성 함수 타입
 */
export type RAGGenerateFunction = (question: string) => Promise<RAGGenerationResult>;

/**
 * 기본 가중치
 */
const DEFAULT_WEIGHTS: EvaluationWeights = {
  accuracy: 0.4,
  relevance: 0.3,
  faithfulness: 0.3,
};

/**
 * RAG 평가 점수 계산
 *
 * @param metrics - 평가 지표
 * @param weights - 가중치 (기본: accuracy 0.4, relevance 0.3, faithfulness 0.3)
 * @returns 가중 평균 점수 (0-1)
 */
export function calculateRAGScore(
  metrics: RAGEvaluationMetrics,
  weights: EvaluationWeights = DEFAULT_WEIGHTS
): number {
  return (
    metrics.accuracy * weights.accuracy +
    metrics.relevance * weights.relevance +
    metrics.faithfulness * weights.faithfulness
  );
}

/**
 * RAG 평가기 클래스
 */
export class RAGEvaluator {
  private testCases: EvaluationCase[];
  private generateFn?: RAGGenerateFunction;

  constructor(testCases: EvaluationCase[], generateFn?: RAGGenerateFunction) {
    this.testCases = testCases;
    this.generateFn = generateFn;
  }

  /**
   * 테스트 케이스 반환
   */
  getTestCases(): EvaluationCase[] {
    return this.testCases;
  }

  /**
   * 전체 평가 실행
   */
  async evaluate(): Promise<RAGEvaluationMetrics> {
    if (!this.generateFn) {
      throw new Error('RAG generate function is required for evaluation');
    }

    const results = await Promise.all(
      this.testCases.map(tc => this.evaluateCase(tc))
    );

    return {
      accuracy: this.average(results.map(r => r.accuracy)),
      relevance: this.average(results.map(r => r.relevance)),
      faithfulness: this.average(results.map(r => r.faithfulness)),
    };
  }

  /**
   * 개별 케이스 평가
   */
  private async evaluateCase(testCase: EvaluationCase): Promise<RAGEvaluationMetrics> {
    if (!this.generateFn) {
      throw new Error('RAG generate function is required');
    }

    const result = await this.generateFn(testCase.question);

    return {
      accuracy: this.scoreAccuracy(result.content, testCase.expectedAnswer),
      relevance: this.scoreRelevance(result.citations, testCase.relevantDocIds),
      faithfulness: this.scoreFaithfulness(result.content, result.citations),
    };
  }

  /**
   * 정확도 점수 계산 (공통 단어 기반)
   */
  scoreAccuracy(answer: string, expected: string): number {
    const wordsA = this.getWords(answer);
    const wordsB = this.getWords(expected);

    if (wordsA.size === 0 && wordsB.size === 0) return 1;
    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    const commonWords = [...wordsA].filter(w => wordsB.has(w)).length;
    const totalWords = new Set([...wordsA, ...wordsB]).size;

    return totalWords > 0 ? commonWords / totalWords : 0;
  }

  /**
   * 관련성 점수 계산 (문서 매칭 기반)
   */
  scoreRelevance(citations: Citation[], expectedDocIds: string[]): number {
    if (expectedDocIds.length === 0) return 1;
    if (citations.length === 0) return 0;

    const citedIds = citations.map(c => c.source);
    const matches = citedIds.filter(id => expectedDocIds.includes(id));

    return matches.length / expectedDocIds.length;
  }

  /**
   * 충실도 점수 계산 (출처 인용 기반)
   */
  scoreFaithfulness(answer: string, citations: Citation[]): number {
    if (citations.length === 0) return 0;

    const hasCitations = answer.includes('[문서');
    return hasCitations ? 1 : 0.5;
  }

  /**
   * 단어 추출 (정규화)
   */
  private getWords(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0)
    );
  }

  /**
   * 평균 계산
   */
  private average(nums: number[]): number {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
}
