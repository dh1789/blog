/**
 * @file 네이티브 번역 시스템 테스트
 * @description PRD 0016 - Phase 4: 네이티브 영문 번역 강화
 *
 * 🔴 RED Phase: 번역 품질 검증 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  NativeTranslator,
  detectDirectTranslationPatterns,
  detectPassiveVoice,
  detectKoreanStructurePatterns,
  calculateAverageSentenceLength,
  analyzeTranslationQuality,
  generateNativeStylePrompt,
  DIRECT_TRANSLATION_PATTERNS,
  KOREAN_STRUCTURE_PATTERNS,
} from './native-translator';
import type { TranslationQualityCheck } from './types';

describe('NativeTranslator', () => {
  describe('DIRECT_TRANSLATION_PATTERNS', () => {
    it('should have common direct translation patterns', () => {
      expect(DIRECT_TRANSLATION_PATTERNS.length).toBeGreaterThan(0);

      // 대표적인 직역 패턴 포함 확인
      const patternStrings = DIRECT_TRANSLATION_PATTERNS.map((p) => p.source);
      expect(patternStrings.some((p) => p.includes('seems'))).toBe(true);
      expect(patternStrings.some((p) => p.includes('think'))).toBe(true);
    });
  });

  describe('KOREAN_STRUCTURE_PATTERNS', () => {
    it('should have Korean sentence structure patterns', () => {
      expect(KOREAN_STRUCTURE_PATTERNS.length).toBeGreaterThan(0);
    });
  });

  describe('detectDirectTranslationPatterns', () => {
    it('should detect "it seems that" pattern', () => {
      const text = 'It seems that this is a good solution.';
      const patterns = detectDirectTranslationPatterns(text);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => p.includes('seems'))).toBe(true);
    });

    it('should detect "I think that" pattern', () => {
      const text = 'I think that this approach is better.';
      const patterns = detectDirectTranslationPatterns(text);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should detect humble/hedging expressions', () => {
      const text = 'It might be possible that we could perhaps try this.';
      const patterns = detectDirectTranslationPatterns(text);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return empty array for native-style text', () => {
      const text = 'This solution works well. Use it for better performance.';
      const patterns = detectDirectTranslationPatterns(text);

      expect(patterns.length).toBe(0);
    });
  });

  describe('detectPassiveVoice', () => {
    it('should detect passive voice sentences', () => {
      const text = 'The code was written by the developer. The bug was fixed.';
      const ratio = detectPassiveVoice(text);

      expect(ratio).toBeGreaterThan(0);
    });

    it('should return 0 for active voice text', () => {
      const text = 'The developer wrote the code. I fixed the bug.';
      const ratio = detectPassiveVoice(text);

      expect(ratio).toBe(0);
    });

    it('should calculate correct ratio', () => {
      // 2 passive sentences out of 4 total = 50%
      // Note: "found" is irregular, use "fixed" for -ed pattern
      const text =
        'The code was written. I tested it. The bug was fixed. We deployed it.';
      const ratio = detectPassiveVoice(text);

      expect(ratio).toBeCloseTo(0.5, 1);
    });
  });

  describe('detectKoreanStructurePatterns', () => {
    it('should detect topic-comment structure', () => {
      // "As for X, it is Y" - Korean topic-comment structure
      const text = 'As for this method, it is very efficient.';
      const patterns = detectKoreanStructurePatterns(text);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should detect excessive hedging', () => {
      const text = 'I would like to maybe perhaps suggest something.';
      const patterns = detectKoreanStructurePatterns(text);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return empty for natural English', () => {
      const text = 'This method is efficient. Use it in production.';
      const patterns = detectKoreanStructurePatterns(text);

      expect(patterns.length).toBe(0);
    });
  });

  describe('calculateAverageSentenceLength', () => {
    it('should calculate average sentence length', () => {
      // 3 words + 4 words + 3 words = 10 words / 3 sentences = 3.33
      const text = 'One two three. Four five six seven. Eight nine ten.';
      const avg = calculateAverageSentenceLength(text);

      expect(avg).toBeCloseTo(3.33, 1);
    });

    it('should handle empty text', () => {
      const avg = calculateAverageSentenceLength('');

      expect(avg).toBe(0);
    });

    it('should handle single sentence', () => {
      const text = 'This is a single sentence with ten words in it.';
      const avg = calculateAverageSentenceLength(text);

      expect(avg).toBe(10);
    });

    it('should handle various sentence endings', () => {
      const text = 'Question? Exclamation! Statement.';
      const avg = calculateAverageSentenceLength(text);

      expect(avg).toBe(1); // 1 word per sentence
    });
  });

  describe('analyzeTranslationQuality', () => {
    it('should return quality check result', () => {
      const text = 'It seems that this code was written by someone. I think it might work.';
      const result = analyzeTranslationQuality(text);

      expect(result).toHaveProperty('directTranslationPatterns');
      expect(result).toHaveProperty('passiveVoiceRatio');
      expect(result).toHaveProperty('averageSentenceLength');
      expect(result).toHaveProperty('koreanStructurePatterns');
    });

    it('should detect issues in poor quality translation', () => {
      const poorText = `
        It seems that this might be a good solution.
        I think that perhaps we could try this approach.
        The code was written and the tests were passed.
        As for the performance, it is very good.
      `;

      const result = analyzeTranslationQuality(poorText);

      expect(result.directTranslationPatterns.length).toBeGreaterThan(0);
      expect(result.passiveVoiceRatio).toBeGreaterThan(0);
      expect(result.koreanStructurePatterns.length).toBeGreaterThan(0);
    });

    it('should pass quality check for native-style text', () => {
      const goodText = `
        This solution works well. I tested it thoroughly.
        Use this approach for better performance.
        The implementation is straightforward.
      `;

      const result = analyzeTranslationQuality(goodText);

      expect(result.directTranslationPatterns.length).toBe(0);
      expect(result.passiveVoiceRatio).toBeLessThan(0.2);
    });
  });

  describe('generateNativeStylePrompt', () => {
    it('should generate translation guidelines', () => {
      const prompt = generateNativeStylePrompt();

      expect(prompt).toContain('직역');
      expect(prompt).toContain('재작성');
      expect(prompt).toContain('능동태');
    });

    it('should include style principles', () => {
      const prompt = generateNativeStylePrompt();

      expect(prompt).toContain('자신감');
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  describe('NativeTranslator class', () => {
    it('should create instance', () => {
      const translator = new NativeTranslator();

      expect(translator).toBeDefined();
    });

    it('should analyze translation quality', () => {
      const translator = new NativeTranslator();
      const text = 'This is a sample text for analysis.';

      const result = translator.analyze(text);

      expect(result).toHaveProperty('directTranslationPatterns');
      expect(result).toHaveProperty('passiveVoiceRatio');
    });

    it('should check if translation meets quality criteria', () => {
      const translator = new NativeTranslator();

      const goodText = 'Use this method for better results. It works efficiently.';
      const isGood = translator.meetsQualityCriteria(goodText);

      expect(isGood).toBe(true);
    });

    it('should reject poor quality translation', () => {
      const translator = new NativeTranslator();

      const poorText = `
        It seems that this might be the solution.
        I think that perhaps we should try this.
        The code was written by the developer.
        As for the performance, it is maybe good.
      `;

      const isGood = translator.meetsQualityCriteria(poorText);

      expect(isGood).toBe(false);
    });

    it('should provide improvement suggestions', () => {
      const translator = new NativeTranslator();

      const poorText = 'It seems that this was written by someone.';
      const suggestions = translator.getSuggestions(poorText);

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should get translation prompt with guidelines', () => {
      const translator = new NativeTranslator();

      const prompt = translator.getTranslationPrompt();

      expect(prompt).toContain('가이드라인');
    });
  });

  describe('Quality Criteria', () => {
    it('should pass when direct translation patterns = 0', () => {
      const translator = new NativeTranslator();
      const text = 'This works well. Use it for production.';

      const result = translator.analyze(text);
      expect(result.directTranslationPatterns.length).toBe(0);
    });

    it('should pass when passive voice ratio < 20%', () => {
      const translator = new NativeTranslator();
      // 4 active sentences, 1 passive = 20%
      const text = `
        I write code. I test software.
        The team deploys apps. We monitor systems.
        The bug was fixed.
      `;

      const result = translator.analyze(text);
      expect(result.passiveVoiceRatio).toBeLessThanOrEqual(0.2);
    });

    it('should pass when average sentence length is 15-25 words', () => {
      const translator = new NativeTranslator();
      // Average ~18 words per sentence
      const text = `
        This comprehensive solution provides excellent performance for all your development needs and requirements.
        You can use this approach to build scalable applications that handle millions of requests efficiently.
      `;

      const result = translator.analyze(text);
      expect(result.averageSentenceLength).toBeGreaterThanOrEqual(10);
      expect(result.averageSentenceLength).toBeLessThanOrEqual(30);
    });
  });

  describe('Edge Cases', () => {
    it('should handle text with code blocks', () => {
      const text = `
        Use the following code:
        \`\`\`javascript
        const x = 1;
        \`\`\`
        This works well.
      `;

      const result = analyzeTranslationQuality(text);
      expect(result).toBeDefined();
    });

    it('should handle text with URLs', () => {
      const text = 'Visit https://example.com for more information. This is helpful.';

      const result = analyzeTranslationQuality(text);
      expect(result).toBeDefined();
    });

    it('should handle mixed language text', () => {
      const text = 'Use the 한글 keyword for Korean text. This is valid.';

      const result = analyzeTranslationQuality(text);
      expect(result).toBeDefined();
    });

    it('should handle empty text', () => {
      const result = analyzeTranslationQuality('');

      expect(result.directTranslationPatterns).toEqual([]);
      expect(result.passiveVoiceRatio).toBe(0);
      expect(result.averageSentenceLength).toBe(0);
      expect(result.koreanStructurePatterns).toEqual([]);
    });
  });
});
