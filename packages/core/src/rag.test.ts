/**
 * RAG (Retrieval-Augmented Generation) 모듈 테스트
 * TDD 방식으로 구현: Red → Green → Refactor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  injectContext,
  buildRAGPrompt,
  extractCitations,
  formatAnswer,
  manageContextWindow,
  estimateTokens,
  RAGGenerator,
} from './rag';
import type { Document, RAGContext, Citation, FormattedAnswer } from './rag';

describe('RAG Module', () => {
  // 테스트용 문서 데이터
  const mockDocuments: Document[] = [
    {
      content: 'TypeScript는 정적 타입을 지원하는 JavaScript의 상위 집합입니다.',
      title: 'TypeScript 소개',
      source: 'typescript-handbook.md',
    },
    {
      content: 'React는 사용자 인터페이스를 만들기 위한 JavaScript 라이브러리입니다.',
      title: 'React 기초',
      source: 'react-docs.md',
    },
    {
      content: 'Node.js는 Chrome V8 JavaScript 엔진으로 빌드된 JavaScript 런타임입니다.',
      title: 'Node.js 개요',
      source: 'nodejs-guide.md',
    },
  ];

  describe('estimateTokens', () => {
    it('should estimate tokens from text length (4 chars = 1 token)', () => {
      const text = '12345678'; // 8자 = 2토큰
      expect(estimateTokens(text)).toBe(2);
    });

    it('should round up token count', () => {
      const text = '12345'; // 5자 = 1.25토큰 → 2토큰
      expect(estimateTokens(text)).toBe(2);
    });

    it('should handle empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should handle Korean text', () => {
      const text = '한글테스트'; // 5자 = 1.25토큰 → 2토큰
      expect(estimateTokens(text)).toBe(2);
    });
  });

  describe('manageContextWindow', () => {
    it('should return all documents when within token limit', () => {
      const result = manageContextWindow(mockDocuments, 10000);
      expect(result.length).toBe(3);
    });

    it('should limit documents based on token count', () => {
      // 각 문서가 약 50자 = 약 13토큰
      // 50토큰 제한 시 약 3-4개 문서만 포함
      const result = manageContextWindow(mockDocuments, 30);
      expect(result.length).toBeLessThan(3);
    });

    it('should return empty array for zero token limit', () => {
      const result = manageContextWindow(mockDocuments, 0);
      expect(result.length).toBe(0);
    });

    it('should prioritize documents in order', () => {
      const result = manageContextWindow(mockDocuments, 50);
      expect(result[0]).toEqual(mockDocuments[0]);
    });
  });

  describe('injectContext', () => {
    it('should format documents into context string', () => {
      const context: RAGContext = {
        query: 'TypeScript란?',
        documents: mockDocuments.slice(0, 2),
        maxTokens: 10000,
      };

      const result = injectContext(context);

      expect(result).toContain('[문서 1]');
      expect(result).toContain('[문서 2]');
      expect(result).toContain('TypeScript');
      expect(result).toContain('질문: TypeScript란?');
    });

    it('should include document sources', () => {
      const context: RAGContext = {
        query: 'React란?',
        documents: [mockDocuments[1]],
        maxTokens: 10000,
      };

      const result = injectContext(context);

      expect(result).toContain('출처: react-docs.md');
    });

    it('should handle empty documents array', () => {
      const context: RAGContext = {
        query: '질문입니다',
        documents: [],
        maxTokens: 10000,
      };

      const result = injectContext(context);

      expect(result).toContain('질문: 질문입니다');
      expect(result).not.toContain('[문서');
    });
  });

  describe('buildRAGPrompt', () => {
    it('should include system instructions', () => {
      const prompt = buildRAGPrompt('TypeScript란?', mockDocuments);

      expect(prompt).toContain('문서 기반 답변');
      expect(prompt).toContain('출처 표시');
      expect(prompt).toContain('모르면 인정');
    });

    it('should include all documents with indices', () => {
      const prompt = buildRAGPrompt('질문', mockDocuments);

      expect(prompt).toContain('[문서 1]');
      expect(prompt).toContain('[문서 2]');
      expect(prompt).toContain('[문서 3]');
    });

    it('should include document titles and sources', () => {
      const prompt = buildRAGPrompt('질문', [mockDocuments[0]]);

      expect(prompt).toContain('제목: TypeScript 소개');
      expect(prompt).toContain('출처: typescript-handbook.md');
    });

    it('should include anti-hallucination instructions', () => {
      const prompt = buildRAGPrompt('질문', mockDocuments);

      expect(prompt).toContain('추측 금지');
    });

    it('should handle documents without title', () => {
      const docWithoutTitle: Document = {
        content: '내용입니다',
        source: 'test.md',
      };

      const prompt = buildRAGPrompt('질문', [docWithoutTitle]);

      expect(prompt).toContain('제목: N/A');
    });
  });

  describe('extractCitations', () => {
    it('should extract citation indices from answer', () => {
      const answer = 'TypeScript는 정적 타입 언어입니다 [문서 1]. React는 UI 라이브러리입니다 [문서 2].';

      const citations = extractCitations(answer, mockDocuments);

      expect(citations.length).toBe(2);
      expect(citations[0].documentIndex).toBe(1);
      expect(citations[1].documentIndex).toBe(2);
    });

    it('should include document titles and sources in citations', () => {
      const answer = '답변입니다 [문서 1].';

      const citations = extractCitations(answer, mockDocuments);

      expect(citations[0].documentTitle).toBe('TypeScript 소개');
      expect(citations[0].source).toBe('typescript-handbook.md');
    });

    it('should handle multiple references to same document', () => {
      const answer = '[문서 1]에서 설명한 대로 [문서 1]입니다.';

      const citations = extractCitations(answer, mockDocuments);

      // 중복 제거
      expect(citations.length).toBe(1);
    });

    it('should handle answers without citations', () => {
      const answer = '문서에서 해당 정보를 찾을 수 없습니다.';

      const citations = extractCitations(answer, mockDocuments);

      expect(citations.length).toBe(0);
    });

    it('should ignore invalid document indices', () => {
      const answer = '답변입니다 [문서 99].';

      const citations = extractCitations(answer, mockDocuments);

      expect(citations.length).toBe(0);
    });

    it('should handle citation format with spaces', () => {
      const answer = '답변입니다 [문서  2].'; // 공백 2개

      const citations = extractCitations(answer, mockDocuments);

      expect(citations.length).toBe(1);
      expect(citations[0].documentIndex).toBe(2);
    });
  });

  describe('formatAnswer', () => {
    it('should return formatted answer with citations', () => {
      const rawAnswer = 'TypeScript는 정적 타입 언어입니다 [문서 1].';

      const result = formatAnswer(rawAnswer, mockDocuments, 'claude-sonnet-4-20250514');

      expect(result.content).toContain('TypeScript');
      expect(result.citations.length).toBe(1);
      expect(result.metadata.model).toBe('claude-sonnet-4-20250514');
    });

    it('should add reference section if not present', () => {
      const rawAnswer = 'TypeScript 설명 [문서 1].';

      const result = formatAnswer(rawAnswer, mockDocuments, 'test-model');

      expect(result.content).toContain('📚 **참고 문서:**');
    });

    it('should not duplicate reference section if already present', () => {
      const rawAnswer = '답변입니다 [문서 1].\n\n📚 참고 문서:\n- [문서 1] 기존 문서';

      const result = formatAnswer(rawAnswer, mockDocuments, 'test-model');

      const matches = result.content.match(/📚/g);
      expect(matches?.length).toBe(1);
    });

    it('should include metadata with timestamp', () => {
      const rawAnswer = '답변입니다 [문서 1].';

      const result = formatAnswer(rawAnswer, mockDocuments, 'test-model');

      expect(result.metadata.generatedAt).toBeDefined();
      expect(result.metadata.documentsUsed).toBe(1);
    });

    it('should handle answer without any citations', () => {
      const rawAnswer = '문서에서 해당 정보를 찾을 수 없습니다.';

      const result = formatAnswer(rawAnswer, mockDocuments, 'test-model');

      expect(result.citations.length).toBe(0);
      expect(result.content).not.toContain('📚 **참고 문서:**');
    });
  });

  describe('RAGGenerator', () => {
    it('should be instantiable with config', () => {
      const generator = new RAGGenerator({
        anthropicApiKey: 'test-key',
      });

      expect(generator).toBeDefined();
    });

    it('should have default configuration values', () => {
      const generator = new RAGGenerator({
        anthropicApiKey: 'test-key',
      });

      expect(generator.getConfig().model).toBe('claude-sonnet-4-20250514');
      expect(generator.getConfig().maxContextTokens).toBe(100000);
      expect(generator.getConfig().temperature).toBe(0);
    });

    it('should allow custom configuration', () => {
      const generator = new RAGGenerator({
        anthropicApiKey: 'test-key',
        model: 'claude-3-haiku-20240307',
        maxContextTokens: 50000,
        temperature: 0.3,
      });

      expect(generator.getConfig().model).toBe('claude-3-haiku-20240307');
      expect(generator.getConfig().maxContextTokens).toBe(50000);
      expect(generator.getConfig().temperature).toBe(0.3);
    });
  });
});
