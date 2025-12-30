/**
 * @file 품질 검토 시스템 테스트
 * @description PRD 0016 - Phase 5: 품질 검토 시스템
 *
 * 🔴 RED Phase: 품질 체크리스트 검증 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  QualityChecker,
  checkPersonalExperience,
  checkImages,
  checkTranslationQuality,
  checkSEOQuality,
  checkReadability,
  generateQualityReport,
  type QualityCheckResult,
  type ImageCheckResult,
} from './quality-checker';
import type { QualityChecklist } from './types';

describe('QualityChecker', () => {
  describe('checkPersonalExperience', () => {
    it('should detect personal experience indicators', () => {
      const content = `
        # 블로그 포스트
        제가 이 기술을 처음 배웠을 때, 정말 어려웠습니다.
        이 글에서 제 경험을 공유하겠습니다.
      `;
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(true);
    });

    it('should detect experience when Korean first-person pronouns used', () => {
      const content = '저는 이 방법을 프로젝트에 적용해보았습니다. 나의 경험상 이것이 가장 좋았어요.';
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(true);
    });

    it('should detect experience when English first-person used', () => {
      const content = 'In my experience, this approach works best. I found that...';
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(true);
    });

    it('should return false for purely technical content', () => {
      const content = `
        # 기술 문서
        이 함수는 입력값을 받아 출력값을 반환합니다.
        다음 예제를 참고하세요.
      `;
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(false);
    });

    it('should check if experience is naturally integrated', () => {
      const content = `
        # MCP 시작하기

        ## 소개
        이 글에서는 MCP의 기본 개념을 설명합니다.

        제가 MCP를 처음 접했을 때, 문서만으로는 이해가 어려웠습니다.
        직접 예제를 만들어보면서 이해하게 되었어요.

        ## 설치 방법
        npm install을 실행합니다.
      `;
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(true);
      expect(result.experienceNaturallyIntegrated).toBe(true);
    });
  });

  describe('checkImages', () => {
    it('should count images in markdown content', () => {
      const content = `
        # 포스트
        ![Screenshot](./images/screenshot1.png)
        본문 내용
        ![Terminal](./images/terminal.png)
      `;
      const result = checkImages(content);

      expect(result.imageCount).toBe(2);
    });

    it('should check if images have alt text', () => {
      const content = `
        ![명확한 설명](./images/image1.png)
        ![](./images/image2.png)
      `;
      const result = checkImages(content);

      expect(result.imageCount).toBe(2);
      expect(result.imagesHaveAltText).toBe(false); // 하나라도 alt 없으면 false
    });

    it('should return true for alt text when all images have meaningful alt', () => {
      const content = `
        ![터미널 스크린샷](./images/terminal.png)
        ![API 응답 결과](./images/api.png)
      `;
      const result = checkImages(content);

      expect(result.imagesHaveAltText).toBe(true);
    });

    it('should handle HTML img tags', () => {
      const content = `
        <img src="./image.png" alt="설명 이미지" />
        <img src="./image2.png" />
      `;
      const result = checkImages(content);

      expect(result.imageCount).toBe(2);
      expect(result.imagesHaveAltText).toBe(false);
    });

    it('should return true when no images', () => {
      const content = '이미지가 없는 포스트입니다.';
      const result = checkImages(content);

      expect(result.imageCount).toBe(0);
      expect(result.imagesHaveAltText).toBe(true); // 이미지 없으면 true
    });
  });

  describe('checkTranslationQuality', () => {
    it('should check translation quality for English content', () => {
      const content = 'This is a well-written article. It uses clear language and active voice.';
      const result = checkTranslationQuality(content, 'en');

      expect(result.noDirectTranslation).toBe(true);
      expect(result.nativeStyleScore).toBeGreaterThan(0);
    });

    it('should detect direct translation patterns', () => {
      const content = 'It seems that this might be a good solution. I think that perhaps we should try.';
      const result = checkTranslationQuality(content, 'en');

      expect(result.noDirectTranslation).toBe(false);
      expect(result.nativeStyleScore).toBeLessThanOrEqual(70);
    });

    it('should skip translation check for Korean content', () => {
      const content = '이것은 한국어 포스트입니다.';
      const result = checkTranslationQuality(content, 'ko');

      expect(result.noDirectTranslation).toBe(true);
      expect(result.nativeStyleScore).toBe(100); // 한국어는 번역 검사 스킵
    });

    it('should calculate native style score based on quality metrics', () => {
      // 좋은 영문 콘텐츠
      const goodContent = `
        MCP revolutionizes how AI assistants interact with external tools.
        This article explores the core concepts and practical applications.
        You'll learn how to build your first MCP server in minutes.
      `;
      const goodResult = checkTranslationQuality(goodContent, 'en');

      // 나쁜 영문 콘텐츠 (직역투)
      const badContent = `
        It seems that MCP is very good for AI assistants.
        I think that this article explains the concepts.
        It appears that you might perhaps learn something.
      `;
      const badResult = checkTranslationQuality(badContent, 'en');

      expect(goodResult.nativeStyleScore).toBeGreaterThan(badResult.nativeStyleScore);
    });
  });

  describe('checkSEOQuality', () => {
    it('should calculate SEO score', () => {
      const content = `
        # MCP 시작하기: 완벽 가이드

        MCP는 AI 어시스턴트를 위한 프로토콜입니다.
        이 글에서 MCP의 모든 것을 배울 수 있습니다.
      `;
      const metadata = {
        title: 'MCP 시작하기: 완벽 가이드',
        excerpt: 'MCP의 기본 개념과 사용법을 배웁니다.',
        tags: ['MCP', 'AI', '개발'],
      };

      const score = checkSEOQuality(content, metadata);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher score for content with good keyword density', () => {
      const highKeywordContent = `
        MCP는 훌륭한 도구입니다. MCP를 사용하면 생산성이 향상됩니다.
        MCP 서버를 만들어보세요. MCP의 장점을 경험하세요.
      `;
      const lowKeywordContent = `
        이것은 좋은 도구입니다. 이것을 사용하면 생산성이 향상됩니다.
        서버를 만들어보세요. 장점을 경험하세요.
      `;
      const metadata = { title: 'MCP 가이드', excerpt: 'MCP 설명', tags: ['MCP'] };

      const highScore = checkSEOQuality(highKeywordContent, metadata);
      const lowScore = checkSEOQuality(lowKeywordContent, metadata);

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('checkReadability', () => {
    it('should calculate readability score', () => {
      const content = `
        이것은 읽기 쉬운 문장입니다.
        짧고 명확한 문장으로 구성되어 있습니다.
        각 문단이 하나의 아이디어를 전달합니다.
      `;
      const score = checkReadability(content);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give lower score for overly complex content', () => {
      const simpleContent = '짧은 문장. 명확한 내용. 읽기 쉽습니다.';
      const complexContent =
        '이것은 매우 길고 복잡한 문장으로서 여러 개의 절과 구를 포함하고 있으며 읽는 사람이 이해하기 어렵게 만드는 요소들이 많이 포함되어 있고 결국 가독성을 떨어뜨리는 결과를 초래하게 됩니다.';

      const simpleScore = checkReadability(simpleContent);
      const complexScore = checkReadability(complexContent);

      expect(simpleScore).toBeGreaterThan(complexScore);
    });
  });

  describe('generateQualityReport', () => {
    it('should generate comprehensive quality report', () => {
      const content = `
        # MCP 시작하기

        저는 MCP를 배우면서 많은 것을 알게 되었습니다.

        ![터미널 결과](./images/terminal.png)

        이 글에서 그 경험을 공유합니다.
      `;
      const metadata = {
        title: 'MCP 시작하기',
        excerpt: 'MCP의 기본을 배웁니다',
        tags: ['MCP', 'AI'],
        language: 'ko' as const,
      };

      const report = generateQualityReport(content, metadata);

      expect(report).toHaveProperty('checklist');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('overallScore');
      expect(report.checklist.hasPersonalExperience).toBe(true);
      expect(report.checklist.imageCount).toBe(1);
    });

    it('should identify issues in quality report', () => {
      // 문제가 있는 콘텐츠
      const content = `
        # 포스트
        기술적인 내용만 있습니다.
        ![](./no-alt.png)
      `;
      const metadata = {
        title: 'Test',
        excerpt: '',
        tags: [],
        language: 'ko' as const,
      };

      const report = generateQualityReport(content, metadata);

      expect(report.issues.length).toBeGreaterThan(0);
      expect(report.checklist.hasPersonalExperience).toBe(false);
      expect(report.checklist.imagesHaveAltText).toBe(false);
    });

    it('should calculate overall ready status', () => {
      const goodContent = `
        # 완성도 높은 포스트

        저의 경험을 공유하겠습니다.

        ![명확한 설명](./image.png)

        자세한 내용은 아래와 같습니다.
      `;
      const metadata = {
        title: '완성도 높은 포스트',
        excerpt: '이 포스트는 좋은 품질을 갖추고 있습니다',
        tags: ['품질', '테스트'],
        language: 'ko' as const,
      };

      const report = generateQualityReport(goodContent, metadata);

      expect(typeof report.checklist.overallReady).toBe('boolean');
    });
  });

  describe('QualityChecker class', () => {
    it('should create instance', () => {
      const checker = new QualityChecker();

      expect(checker).toBeDefined();
    });

    it('should check quality of content', () => {
      const checker = new QualityChecker();
      const content = `
        # 테스트 포스트
        저의 경험을 공유합니다.
        ![이미지](./test.png)
      `;
      const metadata = {
        title: '테스트 포스트',
        excerpt: '테스트입니다',
        tags: ['테스트'],
        language: 'ko' as const,
      };

      const result = checker.check(content, metadata);

      expect(result).toHaveProperty('checklist');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('overallScore');
    });

    it('should return issues list', () => {
      const checker = new QualityChecker();
      const content = '경험담 없는 기술 문서';
      const metadata = {
        title: 'T',
        excerpt: '',
        tags: [],
        language: 'ko' as const,
      };

      const result = checker.check(content, metadata);

      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should provide fix suggestions', () => {
      const checker = new QualityChecker();
      const content = '![](./no-alt.png)'; // alt 텍스트 없음
      const metadata = {
        title: '테스트',
        excerpt: '설명',
        tags: [],
        language: 'ko' as const,
      };

      const result = checker.check(content, metadata);

      // 이슈가 있으면 제안도 있어야 함
      const issuesWithSuggestions = result.issues.filter((i) => i.suggestion);
      if (result.issues.length > 0) {
        expect(issuesWithSuggestions.length).toBeGreaterThan(0);
      }
    });

    it('should check English translation quality', () => {
      const checker = new QualityChecker();
      const content =
        'It seems that this is a good solution. I think that we should try it.';
      const metadata = {
        title: 'Test',
        excerpt: 'Test',
        tags: ['test'],
        language: 'en' as const,
      };

      const result = checker.check(content, metadata);

      expect(result.checklist.noDirectTranslation).toBe(false);
    });
  });

  describe('Quality Criteria', () => {
    it('should pass when all criteria met', () => {
      const checker = new QualityChecker();
      const content = `
        # 완벽한 포스트

        ## 소개
        저는 이 주제를 오랫동안 연구해왔습니다.

        ## 본문
        ![터미널 결과 화면](./terminal.png)
        ![API 응답 예시](./api.png)

        자세한 내용을 설명하겠습니다.

        ## 결론
        제 경험이 도움이 되었으면 합니다.
      `;
      const metadata = {
        title: '완벽한 포스트: 상세 가이드',
        excerpt: '이 포스트에서는 주제에 대한 상세한 설명을 제공합니다.',
        tags: ['가이드', '튜토리얼', '개발'],
        language: 'ko' as const,
      };

      const result = checker.check(content, metadata);

      expect(result.checklist.hasPersonalExperience).toBe(true);
      expect(result.checklist.imageCount).toBeGreaterThanOrEqual(2);
      expect(result.checklist.imagesHaveAltText).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const checker = new QualityChecker();
      const result = checker.check('', {
        title: '',
        excerpt: '',
        tags: [],
        language: 'ko',
      });

      expect(result.checklist.hasPersonalExperience).toBe(false);
      expect(result.checklist.imageCount).toBe(0);
      expect(result.overallScore).toBe(0);
    });

    it('should handle content with only code blocks', () => {
      const content = '```typescript\nconst x = 1;\n```';
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(false);
    });

    it('should handle content with mixed languages', () => {
      const content = `
        이것은 한국어입니다.
        This is English.
        저의 experience를 공유합니다.
      `;
      const result = checkPersonalExperience(content);

      expect(result.hasPersonalExperience).toBe(true);
    });
  });
});
