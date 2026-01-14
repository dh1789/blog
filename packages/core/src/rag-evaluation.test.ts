/**
 * RAG 평가 시스템 테스트
 * TDD 방식: Red → Green → Refactor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RAGEvaluationMetrics,
  EvaluationCase,
  calculateRAGScore,
  RAGEvaluator,
} from './rag-evaluation';

describe('RAG Evaluation Module', () => {
  describe('calculateRAGScore', () => {
    it('should calculate weighted score from metrics', () => {
      const metrics: RAGEvaluationMetrics = {
        accuracy: 0.8,
        relevance: 0.7,
        faithfulness: 0.9,
      };

      // 가중치: accuracy 0.4, relevance 0.3, faithfulness 0.3
      // 0.8 * 0.4 + 0.7 * 0.3 + 0.9 * 0.3 = 0.32 + 0.21 + 0.27 = 0.80
      const score = calculateRAGScore(metrics);
      expect(score).toBeCloseTo(0.80);
    });

    it('should return 0 for all zero metrics', () => {
      const metrics: RAGEvaluationMetrics = {
        accuracy: 0,
        relevance: 0,
        faithfulness: 0,
      };

      expect(calculateRAGScore(metrics)).toBe(0);
    });

    it('should return 1 for all perfect metrics', () => {
      const metrics: RAGEvaluationMetrics = {
        accuracy: 1,
        relevance: 1,
        faithfulness: 1,
      };

      expect(calculateRAGScore(metrics)).toBe(1);
    });

    it('should handle custom weights', () => {
      const metrics: RAGEvaluationMetrics = {
        accuracy: 1,
        relevance: 0,
        faithfulness: 0,
      };

      const customWeights = { accuracy: 1.0, relevance: 0, faithfulness: 0 };
      const score = calculateRAGScore(metrics, customWeights);
      expect(score).toBe(1);
    });
  });

  describe('RAGEvaluator', () => {
    const testCases: EvaluationCase[] = [
      {
        question: '휴가 신청은 어떻게 하나요?',
        expectedAnswer: 'HR 시스템에서 휴가 신청 메뉴를 통해 신청합니다.',
        relevantDocIds: ['hr-policy.md', 'leave-guide.md'],
      },
      {
        question: '코드 리뷰 절차는?',
        expectedAnswer: 'PR 생성 후 최소 1명의 승인이 필요합니다.',
        relevantDocIds: ['dev-guide.md'],
      },
    ];

    it('should be instantiable with test cases', () => {
      const evaluator = new RAGEvaluator(testCases);
      expect(evaluator).toBeDefined();
      expect(evaluator.getTestCases()).toHaveLength(2);
    });

    it('should calculate accuracy based on common words', () => {
      const evaluator = new RAGEvaluator([]);

      // 동일한 문장
      expect(evaluator.scoreAccuracy('hello world', 'hello world')).toBe(1);

      // 일부만 일치
      const score = evaluator.scoreAccuracy('hello world', 'hello there');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it('should calculate relevance based on document matching', () => {
      const evaluator = new RAGEvaluator([]);

      // 완벽 일치
      const citations = [
        { documentIndex: 1, documentTitle: 'Doc 1', source: 'hr-policy.md' },
        { documentIndex: 2, documentTitle: 'Doc 2', source: 'leave-guide.md' },
      ];
      const expected = ['hr-policy.md', 'leave-guide.md'];

      expect(evaluator.scoreRelevance(citations, expected)).toBe(1);

      // 부분 일치
      expect(evaluator.scoreRelevance([citations[0]], expected)).toBe(0.5);

      // 일치 없음
      expect(evaluator.scoreRelevance([], expected)).toBe(0);
    });

    it('should calculate faithfulness based on citation presence', () => {
      const evaluator = new RAGEvaluator([]);

      // 출처가 있는 답변
      const citations = [{ documentIndex: 1, documentTitle: 'Doc', source: 'test.md' }];
      expect(evaluator.scoreFaithfulness('답변입니다 [문서 1]', citations)).toBe(1);

      // 출처 없는 답변
      expect(evaluator.scoreFaithfulness('답변입니다', [])).toBe(0);
    });

    it('should return average metrics from multiple test cases', async () => {
      // Mock RAG generator
      const mockGenerate = vi.fn()
        .mockResolvedValueOnce({
          content: 'HR 시스템에서 휴가 신청 [문서 1]',
          citations: [{ documentIndex: 1, documentTitle: 'HR', source: 'hr-policy.md' }],
        })
        .mockResolvedValueOnce({
          content: 'PR 생성 후 승인 필요 [문서 1]',
          citations: [{ documentIndex: 1, documentTitle: 'Dev', source: 'dev-guide.md' }],
        });

      const evaluator = new RAGEvaluator(testCases, mockGenerate);
      const metrics = await evaluator.evaluate();

      expect(metrics.accuracy).toBeGreaterThan(0);
      expect(metrics.relevance).toBeGreaterThan(0);
      expect(metrics.faithfulness).toBeGreaterThan(0);
      expect(mockGenerate).toHaveBeenCalledTimes(2);
    });
  });
});
