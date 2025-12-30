/**
 * @file 네이티브 번역 시스템
 * @description PRD 0016 - Phase 4: 네이티브 영문 번역 강화
 *
 * 영어 번역 품질을 분석하고 네이티브 스타일로 개선하기 위한 가이드라인을 제공합니다.
 *
 * 품질 기준:
 * - 직역 패턴: 0개
 * - 수동태 비율: 20% 미만
 * - 평균 문장 길이: 15-25 단어
 */

import type { TranslationQualityCheck } from './types';

/**
 * 직역 패턴 목록
 * 한국어를 영어로 직역할 때 흔히 나타나는 패턴들
 */
export const DIRECT_TRANSLATION_PATTERNS: RegExp[] = [
  // 겸손한 표현 (한국어식)
  /it seems (that|like)/i,
  /it appears (that|like)/i,
  /i think (that )?/i,
  /i believe (that )?/i,
  /i feel (that|like)/i,
  /it might be/i,
  /it could be/i,
  /perhaps we could/i,
  /maybe we should/i,

  // 불필요한 hedging
  /kind of|sort of/i,
  /in some ways?/i,
  /to some extent/i,
  /in a way/i,

  // 한국어식 문장 종결
  /is very (good|nice|great|important)/i,
  /is not (good|nice|great)/i,

  // 직역된 표현
  /have a look at/i,
  /take a look at/i,
  /do the work/i,
  /make an effort/i,
];

/**
 * 한국어 문장 구조 패턴
 * 한국어식 문장 구조가 영어에 나타날 때 감지
 */
export const KOREAN_STRUCTURE_PATTERNS: RegExp[] = [
  // Topic-comment 구조 (한국어식)
  /as for .+?, (it|this|that|they)/i,
  /regarding .+?, (it|this|that)/i,
  /when it comes to .+?, /i,

  // 과도한 hedging
  /(maybe|perhaps) .* (could|might|would)/i,
  /would like to (maybe|perhaps)/i,

  // 불필요한 수식어 반복
  /very very/i,
  /really really/i,

  // 한국어식 접속어
  /and then,? and/i,
  /but,? but/i,

  // 장황한 표현
  /in order to/i,
  /due to the fact that/i,
  /the reason why .+ is because/i,
];

/**
 * 수동태 패턴
 */
const PASSIVE_VOICE_PATTERNS: RegExp[] = [
  /\b(was|were|is|are|been|be|being)\s+\w+ed\b/i,
  /\b(was|were|is|are|been|be|being)\s+\w+en\b/i,
  /\bhas been\s+\w+ed\b/i,
  /\bhave been\s+\w+ed\b/i,
  /\bhad been\s+\w+ed\b/i,
  /\bwill be\s+\w+ed\b/i,
];

/**
 * 직역 패턴 감지
 */
export function detectDirectTranslationPatterns(text: string): string[] {
  const patterns: string[] = [];

  for (const pattern of DIRECT_TRANSLATION_PATTERNS) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      patterns.push(...matches);
    }
  }

  return patterns;
}

/**
 * 수동태 비율 계산
 */
export function detectPassiveVoice(text: string): number {
  if (!text || text.trim() === '') {
    return 0;
  }

  // 문장 분리
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) {
    return 0;
  }

  let passiveCount = 0;

  for (const sentence of sentences) {
    for (const pattern of PASSIVE_VOICE_PATTERNS) {
      if (pattern.test(sentence)) {
        passiveCount++;
        break; // 한 문장에서 한 번만 카운트
      }
    }
  }

  return passiveCount / sentences.length;
}

/**
 * 한국어 구조 패턴 감지
 */
export function detectKoreanStructurePatterns(text: string): string[] {
  const patterns: string[] = [];

  for (const pattern of KOREAN_STRUCTURE_PATTERNS) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      patterns.push(...matches);
    }
  }

  return patterns;
}

/**
 * 평균 문장 길이 계산
 */
export function calculateAverageSentenceLength(text: string): number {
  if (!text || text.trim() === '') {
    return 0;
  }

  // 코드 블록 제거
  const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  // 문장 분리
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) {
    return 0;
  }

  // 단어 수 계산
  let totalWords = 0;
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter((w) => w.length > 0);
    totalWords += words.length;
  }

  return totalWords / sentences.length;
}

/**
 * 번역 품질 분석
 */
export function analyzeTranslationQuality(text: string): TranslationQualityCheck {
  if (!text || text.trim() === '') {
    return {
      directTranslationPatterns: [],
      passiveVoiceRatio: 0,
      averageSentenceLength: 0,
      koreanStructurePatterns: [],
    };
  }

  return {
    directTranslationPatterns: detectDirectTranslationPatterns(text),
    passiveVoiceRatio: detectPassiveVoice(text),
    averageSentenceLength: calculateAverageSentenceLength(text),
    koreanStructurePatterns: detectKoreanStructurePatterns(text),
  };
}

/**
 * 네이티브 스타일 번역 프롬프트 생성
 */
export function generateNativeStylePrompt(): string {
  return `## 영문 번역 가이드라인

### 스타일 원칙
1. **직역 금지**: 한국어 문장 구조를 영어로 옮기지 않음
   - ❌ "It seems that this is a good solution"
   - ✅ "This solution works well"

2. **재작성**: 같은 의미를 영어 네이티브가 표현하는 방식으로 재작성
   - ❌ "I think that perhaps we could try..."
   - ✅ "Let's try..." or "Consider..."

3. **자신감 있는 어조**: 겸손한 표현 → 직접적 표현
   - ❌ "~인 것 같습니다" → "It seems like..."
   - ✅ "This is..." / "This works..."

4. **능동태 선호**: 수동태보다 능동태 사용
   - ❌ "The code was written by the developer"
   - ✅ "The developer wrote the code"

### 기술 용어 처리
- 영어권 개발자 커뮤니티에서 실제 사용하는 표현 적용
- 한국어 고유 표현은 문맥에 맞게 의역
- 기술 용어는 원어 유지 (API, JSON, TypeScript 등)

### 문장 구조
- 짧고 명확한 문장 선호 (15-25 단어)
- 불필요한 수식어 제거
- 핵심 내용 먼저 제시 (영어권 writing style)

### 피해야 할 패턴
- "It seems that..." / "It appears that..."
- "I think that..." / "I believe that..."
- "As for..., it is..."
- 과도한 hedging (maybe, perhaps, possibly 중복)
- 장황한 표현 (in order to, due to the fact that)

### 권장 패턴
- 직접적이고 명확한 문장
- 동사로 시작하는 명령문 (Use, Try, Consider)
- 간결한 접속사 (and, but, so)
- 구체적인 예시와 수치`;
}

/**
 * 개선 제안 타입
 */
export interface ImprovementSuggestion {
  type: 'directTranslation' | 'passiveVoice' | 'koreanStructure' | 'sentenceLength';
  issue: string;
  suggestion: string;
}

/**
 * 네이티브 번역 검증기 클래스
 */
export class NativeTranslator {
  private readonly qualityCriteria = {
    maxDirectTranslationPatterns: 0,
    maxPassiveVoiceRatio: 0.2,
    minSentenceLength: 10,
    maxSentenceLength: 30,
    maxKoreanStructurePatterns: 0,
  };

  /**
   * 번역 품질 분석
   */
  analyze(text: string): TranslationQualityCheck {
    return analyzeTranslationQuality(text);
  }

  /**
   * 품질 기준 충족 여부 확인
   */
  meetsQualityCriteria(text: string): boolean {
    const result = this.analyze(text);

    // 직역 패턴 검사
    if (result.directTranslationPatterns.length > this.qualityCriteria.maxDirectTranslationPatterns) {
      return false;
    }

    // 수동태 비율 검사
    if (result.passiveVoiceRatio > this.qualityCriteria.maxPassiveVoiceRatio) {
      return false;
    }

    // 한국어 구조 패턴 검사
    if (result.koreanStructurePatterns.length > this.qualityCriteria.maxKoreanStructurePatterns) {
      return false;
    }

    return true;
  }

  /**
   * 개선 제안 생성
   */
  getSuggestions(text: string): ImprovementSuggestion[] {
    const result = this.analyze(text);
    const suggestions: ImprovementSuggestion[] = [];

    // 직역 패턴 제안
    for (const pattern of result.directTranslationPatterns) {
      suggestions.push({
        type: 'directTranslation',
        issue: `직역 패턴 감지: "${pattern}"`,
        suggestion: '더 직접적이고 자신감 있는 표현으로 재작성하세요.',
      });
    }

    // 수동태 제안
    if (result.passiveVoiceRatio > this.qualityCriteria.maxPassiveVoiceRatio) {
      suggestions.push({
        type: 'passiveVoice',
        issue: `수동태 비율이 높습니다: ${Math.round(result.passiveVoiceRatio * 100)}%`,
        suggestion: '능동태로 문장을 재구성하세요. 예: "was written by X" → "X wrote"',
      });
    }

    // 한국어 구조 패턴 제안
    for (const pattern of result.koreanStructurePatterns) {
      suggestions.push({
        type: 'koreanStructure',
        issue: `한국어 구조 패턴 감지: "${pattern}"`,
        suggestion: '영어 네이티브 스타일로 문장을 재구성하세요.',
      });
    }

    // 문장 길이 제안
    if (result.averageSentenceLength < this.qualityCriteria.minSentenceLength) {
      suggestions.push({
        type: 'sentenceLength',
        issue: `평균 문장 길이가 너무 짧습니다: ${result.averageSentenceLength.toFixed(1)} 단어`,
        suggestion: '관련 내용을 연결하여 더 완성도 있는 문장을 작성하세요.',
      });
    } else if (result.averageSentenceLength > this.qualityCriteria.maxSentenceLength) {
      suggestions.push({
        type: 'sentenceLength',
        issue: `평균 문장 길이가 너무 깁니다: ${result.averageSentenceLength.toFixed(1)} 단어`,
        suggestion: '문장을 나누어 더 명확하게 작성하세요.',
      });
    }

    return suggestions;
  }

  /**
   * 번역 프롬프트 가져오기
   */
  getTranslationPrompt(): string {
    return generateNativeStylePrompt();
  }
}
