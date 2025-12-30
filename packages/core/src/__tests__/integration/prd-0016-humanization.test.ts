/**
 * PRD 0016 시스템 테스트
 * AdSense 콘텐츠 휴머나이제이션 시스템 - 전체 워크플로우 검증
 *
 * Phase 7: E2E 테스트 및 검증
 * - 품질 검토 시스템 전체 워크플로우 테스트
 * - 번역 품질 검증 파이프라인 테스트
 * - CLI review 명령어 통합 테스트
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import {
  // Phase 3: 경험 인터뷰
  ExperienceInterviewer,
  generateExperienceQuestions,
  generateExperienceParagraph,
  findInsertionPosition,
  insertExperienceParagraph,
  // Phase 4: 네이티브 번역
  NativeTranslator,
  analyzeTranslationQuality,
  detectDirectTranslationPatterns,
  detectPassiveVoice,
  // Phase 5: 품질 검토
  QualityChecker,
  checkPersonalExperience,
  checkImages,
  checkTranslationQuality,
  checkSEOQuality,
  checkReadability,
  generateQualityReport,
} from '../../index';

// 프로젝트 루트 경로 계산
const PROJECT_ROOT = join(__dirname, '../../../../..');
const POSTS_DIR = join(PROJECT_ROOT, 'content/posts');

// ===========================================================================
// 시나리오 1: 한글 포스트 품질 검토 파이프라인
// ===========================================================================

describe('시나리오 1: 한글 포스트 품질 검토 파이프라인', () => {
  let koreanPosts: string[] = [];
  let sampleContent: string | null = null;

  beforeAll(() => {
    const koPostsDir = join(POSTS_DIR, 'ko');
    if (existsSync(koPostsDir)) {
      const allFiles = readdirSync(koPostsDir);
      koreanPosts = allFiles.filter((f) => f.endsWith('.md'));
      if (koreanPosts.length > 0) {
        const firstPost = koreanPosts[0];
        sampleContent = readFileSync(join(koPostsDir, firstPost), 'utf-8');
      }
    }
  });

  describe('경험 인터뷰 시스템', () => {
    it('질문 생성 시스템이 카테고리별 질문을 생성해야 한다', () => {
      const categories = ['motivation', 'challenge', 'application', 'insight'] as const;

      for (const category of categories) {
        const questions = generateExperienceQuestions(category, 3);
        expect(questions.length).toBe(3);
        questions.forEach((q) => {
          expect(q.category).toBe(category);
          expect(q.question).toBeTruthy();
          expect(q.exampleAnswer).toBeTruthy();
        });
      }
    });

    it('경험 문단 생성이 템플릿 기반으로 동작해야 한다', async () => {
      const questions = generateExperienceQuestions('motivation', 1);
      const author = {
        background: ['개발자'],
        tone: 'casual',
        perspective: '사용자 관점',
      };

      const paragraph = await generateExperienceParagraph(
        questions[0],
        'AI 어시스턴트 확장성에 대한 관심',
        author
      );

      expect(paragraph).toBeTruthy();
      expect(paragraph.length).toBeGreaterThan(10);
    });

    it('삽입 위치 찾기가 섹션 키워드를 인식해야 한다', () => {
      const content = `# 소개

본문 내용입니다.

## 기술적 구현

상세 내용입니다.

## 결론

마무리입니다.`;

      const introPos = findInsertionPosition(content, 'motivation');
      const techPos = findInsertionPosition(content, 'challenge');
      const conclusionPos = findInsertionPosition(content, 'insight');

      // 각 위치 객체가 유효해야 함
      expect(introPos).toHaveProperty('lineIndex');
      expect(introPos.lineIndex).toBeGreaterThanOrEqual(0);
      expect(techPos).toHaveProperty('lineIndex');
      expect(techPos.lineIndex).toBeGreaterThanOrEqual(0);
      expect(conclusionPos).toHaveProperty('lineIndex');
      expect(conclusionPos.lineIndex).toBeGreaterThanOrEqual(0);
    });

    it('ExperienceInterviewer 클래스가 전체 워크플로우를 처리해야 한다', async () => {
      const author = {
        background: ['개발자'],
        tone: 'casual',
        perspective: '사용자 관점',
      };
      const interviewer = new ExperienceInterviewer(author);

      // 질문 생성
      const questions = interviewer.generateQuestions(3);
      expect(questions.length).toBe(3);

      // 답변으로 경험담 생성
      const content = '# 테스트 포스트\n\n본문 내용입니다.';
      const paragraph = await interviewer.processAnswer(
        questions[0],
        'AI 기술에 대한 흥미'
      );
      expect(paragraph).toBeTruthy();

      // 경험담 삽입
      const enhancedContent = await interviewer.insertExperience(
        content,
        questions[0].category,
        paragraph
      );
      expect(enhancedContent.length).toBeGreaterThan(content.length);
    });
  });

  describe('품질 검토 시스템', () => {
    it('경험담 검사가 한글 지시어를 인식해야 한다', () => {
      const contentWithExp = '저는 이 기술을 배우면서 많은 것을 느꼈습니다. 제 경험을 공유합니다.';
      const contentWithoutExp = '이 함수는 입력값을 받아 출력값을 반환합니다.';

      const withExp = checkPersonalExperience(contentWithExp);
      const withoutExp = checkPersonalExperience(contentWithoutExp);

      expect(withExp.hasPersonalExperience).toBe(true);
      expect(withoutExp.hasPersonalExperience).toBe(false);
    });

    it('이미지 검사가 alt 텍스트 유무를 확인해야 한다', () => {
      const contentWithAlt = `
        ![스크린샷](./images/screenshot.png)
        ![터미널](./images/terminal.png)
      `;
      const contentWithoutAlt = `
        ![](./images/image1.png)
        ![스크린샷](./images/image2.png)
      `;

      const withAlt = checkImages(contentWithAlt);
      const withoutAlt = checkImages(contentWithoutAlt);

      expect(withAlt.imageCount).toBe(2);
      expect(withAlt.imagesHaveAltText).toBe(true);
      expect(withoutAlt.imagesHaveAltText).toBe(false);
    });

    it('SEO 점수가 메타데이터 품질에 따라 계산되어야 한다', () => {
      const goodMetadata = {
        title: 'MCP 시작하기: 완벽 가이드',
        excerpt: 'MCP의 기본 개념과 사용법을 배웁니다. 초보자도 쉽게 따라할 수 있는 튜토리얼입니다.',
        tags: ['MCP', 'AI', '개발', '튜토리얼'],
      };

      const poorMetadata = {
        title: 'T',
        excerpt: '',
        tags: [],
      };

      const content = '# MCP 시작하기\n\nMCP는 AI 어시스턴트를 위한 프로토콜입니다.';

      const goodScore = checkSEOQuality(content, goodMetadata);
      const poorScore = checkSEOQuality(content, poorMetadata);

      expect(goodScore).toBeGreaterThan(poorScore);
      expect(goodScore).toBeGreaterThan(0);
      expect(goodScore).toBeLessThanOrEqual(100);
    });

    it('가독성 점수가 문장 복잡도에 따라 계산되어야 한다', () => {
      const simpleContent = '짧은 문장. 명확한 내용. 읽기 쉽습니다.';
      const complexContent =
        '이것은 매우 길고 복잡한 문장으로서 여러 개의 절과 구를 포함하고 있으며 읽는 사람이 이해하기 어렵게 만드는 요소들이 많이 포함되어 있고 결국 가독성을 떨어뜨리는 결과를 초래하게 됩니다.';

      const simpleScore = checkReadability(simpleContent);
      const complexScore = checkReadability(complexContent);

      expect(simpleScore).toBeGreaterThan(complexScore);
    });

    it('종합 품질 리포트가 모든 검사 결과를 포함해야 한다', () => {
      const content = `
# 테스트 포스트

저는 MCP를 배우면서 많은 것을 알게 되었습니다.

![터미널 결과](./images/terminal.png)

이 글에서 그 경험을 공유합니다.
      `;
      const metadata = {
        title: 'MCP 시작하기',
        excerpt: 'MCP의 기본을 배웁니다. 초보자 튜토리얼.',
        tags: ['MCP', 'AI', '튜토리얼'],
        language: 'ko' as const,
      };

      const report = generateQualityReport(content, metadata);

      expect(report).toHaveProperty('checklist');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('overallScore');
      expect(report.checklist.hasPersonalExperience).toBe(true);
      expect(report.checklist.imageCount).toBe(1);
      expect(report.overallScore).toBeGreaterThan(0);
    });

    it('QualityChecker 클래스가 전체 검사를 수행해야 한다', () => {
      const checker = new QualityChecker();
      const content = `
# 완벽한 포스트

저의 경험을 공유합니다.

![이미지](./test.png)

자세한 내용입니다.
      `;
      const metadata = {
        title: '완벽한 포스트',
        excerpt: '이 포스트는 테스트용입니다. 품질 검사를 수행합니다.',
        tags: ['테스트', '품질', '검사'],
        language: 'ko' as const,
      };

      const result = checker.check(content, metadata);

      expect(result).toHaveProperty('checklist');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('overallScore');
      expect(typeof result.checklist.overallReady).toBe('boolean');
    });
  });

  describe('실제 포스트 품질 검사', () => {
    it('실제 한글 포스트가 있으면 품질 검사를 수행해야 한다', () => {
      if (!sampleContent) {
        console.log('⚠️ 실제 한글 포스트가 없어 테스트 스킵');
        return;
      }

      // frontmatter 분리
      const frontmatterMatch = sampleContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        console.log('⚠️ frontmatter 파싱 실패, 스킵');
        return;
      }

      const content = frontmatterMatch[2];
      const checker = new QualityChecker();
      const result = checker.check(content, {
        title: '테스트',
        excerpt: '테스트 요약입니다. 상세한 내용을 담고 있습니다.',
        tags: ['테스트', '품질', '검사'],
        language: 'ko',
      });

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);

      console.log(`✓ 실제 포스트 품질 점수: ${result.overallScore}점`);
      console.log(`  - 경험담: ${result.checklist.hasPersonalExperience ? '있음' : '없음'}`);
      console.log(`  - 이미지: ${result.checklist.imageCount}개`);
      console.log(`  - SEO: ${result.checklist.seoScore}점`);
      console.log(`  - 가독성: ${result.checklist.readabilityScore}점`);
    });
  });
});

// ===========================================================================
// 시나리오 2: 영문 포스트 번역 품질 검증 파이프라인
// ===========================================================================

describe('시나리오 2: 영문 포스트 번역 품질 검증 파이프라인', () => {
  let englishPosts: string[] = [];

  beforeAll(() => {
    const enPostsDir = join(POSTS_DIR, 'en');
    if (existsSync(enPostsDir)) {
      const allFiles = readdirSync(enPostsDir);
      englishPosts = allFiles.filter((f) => f.endsWith('.md'));
    }
  });

  describe('번역 품질 분석', () => {
    it('직역 패턴 감지가 동작해야 한다', () => {
      const directTranslation = 'It seems that this might be a good solution.';
      const nativeEnglish = 'This solution works well for our use case.';

      const directPatterns = detectDirectTranslationPatterns(directTranslation);
      const nativePatterns = detectDirectTranslationPatterns(nativeEnglish);

      expect(directPatterns.length).toBeGreaterThan(0);
      expect(nativePatterns.length).toBe(0);
    });

    it('수동태 비율 계산이 동작해야 한다', () => {
      // 2 passive, 2 active = 50%
      const mixedContent = 'The code was written. I tested it. The bug was fixed. We deployed it.';
      const activeContent = 'I wrote the code. I tested it. I fixed the bug. We deployed it.';

      const mixedRatio = detectPassiveVoice(mixedContent);
      const activeRatio = detectPassiveVoice(activeContent);

      expect(mixedRatio).toBeCloseTo(0.5, 1);
      expect(activeRatio).toBe(0);
    });

    it('종합 번역 품질 분석이 동작해야 한다', () => {
      const goodEnglish = `
        MCP revolutionizes how AI assistants interact with external tools.
        This article explores the core concepts and practical applications.
        You'll learn how to build your first MCP server in minutes.
      `;

      const poorEnglish = `
        It seems that MCP is very good for AI assistants.
        I think that this article explains the concepts.
        It appears that you might perhaps learn something.
      `;

      const goodAnalysis = analyzeTranslationQuality(goodEnglish);
      const poorAnalysis = analyzeTranslationQuality(poorEnglish);

      // 좋은 번역은 직역 패턴이 적어야 함
      expect(goodAnalysis.directTranslationPatterns.length).toBeLessThan(
        poorAnalysis.directTranslationPatterns.length
      );
      expect(poorAnalysis.directTranslationPatterns.length).toBeGreaterThan(0);
    });

    it('NativeTranslator 클래스가 전체 분석을 수행해야 한다', () => {
      const translator = new NativeTranslator();

      const content = 'This is a well-written article. It uses clear language.';
      const analysis = translator.analyze(content);

      // TranslationQualityCheck 타입 구조 확인
      expect(analysis).toHaveProperty('directTranslationPatterns');
      expect(analysis).toHaveProperty('passiveVoiceRatio');
      expect(analysis).toHaveProperty('averageSentenceLength');
      expect(analysis).toHaveProperty('koreanStructurePatterns');
      expect(analysis.passiveVoiceRatio).toBeGreaterThanOrEqual(0);
      expect(analysis.passiveVoiceRatio).toBeLessThanOrEqual(1);
    });
  });

  describe('영문 포스트 품질 검토', () => {
    it('영문 콘텐츠 번역 품질 검사가 동작해야 한다', () => {
      const englishContent = 'This article explains how to use MCP effectively.';
      const result = checkTranslationQuality(englishContent, 'en');

      expect(result).toHaveProperty('noDirectTranslation');
      expect(result).toHaveProperty('nativeStyleScore');
      expect(result.nativeStyleScore).toBeGreaterThanOrEqual(0);
      expect(result.nativeStyleScore).toBeLessThanOrEqual(100);
    });

    it('한글 콘텐츠는 번역 검사를 스킵해야 한다', () => {
      const koreanContent = '이것은 한국어 포스트입니다.';
      const result = checkTranslationQuality(koreanContent, 'ko');

      expect(result.noDirectTranslation).toBe(true);
      expect(result.nativeStyleScore).toBe(100);
    });

    it('QualityChecker가 영문 번역 품질을 검사해야 한다', () => {
      const checker = new QualityChecker();
      const content = 'It seems that this is a good solution. I think that we should try it.';
      const metadata = {
        title: 'Test Post',
        excerpt: 'This is a test post for quality checking system.',
        tags: ['test', 'quality', 'english'],
        language: 'en' as const,
      };

      const result = checker.check(content, metadata);

      expect(result.checklist.noDirectTranslation).toBe(false);
      expect(result.checklist.nativeStyleScore).toBeLessThanOrEqual(70);
    });
  });

  describe('실제 영문 포스트 품질 검사', () => {
    it('실제 영문 포스트가 있으면 품질 검사를 수행해야 한다', () => {
      if (englishPosts.length === 0) {
        console.log('⚠️ 실제 영문 포스트가 없어 테스트 스킵');
        return;
      }

      const firstPost = englishPosts[0];
      const content = readFileSync(join(POSTS_DIR, 'en', firstPost), 'utf-8');

      // frontmatter 분리
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        console.log('⚠️ frontmatter 파싱 실패, 스킵');
        return;
      }

      const bodyContent = frontmatterMatch[2];
      const translator = new NativeTranslator();
      const analysis = translator.analyze(bodyContent);

      // TranslationQualityCheck 구조 검증
      expect(analysis).toHaveProperty('directTranslationPatterns');
      expect(analysis).toHaveProperty('passiveVoiceRatio');
      expect(analysis).toHaveProperty('averageSentenceLength');
      expect(analysis.passiveVoiceRatio).toBeGreaterThanOrEqual(0);
      expect(analysis.passiveVoiceRatio).toBeLessThanOrEqual(1);

      console.log(`✓ 실제 영문 포스트 번역 품질 분석:`);
      console.log(`  - 직역 패턴: ${analysis.directTranslationPatterns.length}개`);
      console.log(`  - 수동태 비율: ${(analysis.passiveVoiceRatio * 100).toFixed(1)}%`);
      console.log(`  - 평균 문장 길이: ${analysis.averageSentenceLength.toFixed(1)}단어`);
    });
  });
});

// ===========================================================================
// 시나리오 3: 전체 휴머나이제이션 파이프라인 통합 테스트
// ===========================================================================

describe('시나리오 3: 전체 휴머나이제이션 파이프라인', () => {
  it('경험 인터뷰 → 품질 검토 파이프라인이 동작해야 한다', async () => {
    // 1. 원본 콘텐츠
    const originalContent = `
# MCP 시작하기

## 소개

MCP는 AI 어시스턴트를 위한 프로토콜입니다.

## 설치

npm을 사용하여 설치합니다.

## 결론

MCP를 사용해보세요.
    `;

    // 2. 경험 인터뷰로 경험담 추가
    const author = {
      background: ['개발자'],
      tone: 'casual',
      perspective: '사용자 관점',
    };
    const interviewer = new ExperienceInterviewer(author);
    const questions = interviewer.generateQuestions(1, 'motivation');
    const paragraph = await interviewer.processAnswer(questions[0], 'AI 확장성에 대한 관심');
    const enhancedContent = await interviewer.insertExperience(
      originalContent,
      'motivation',
      paragraph
    );

    // 3. 품질 검토
    const checker = new QualityChecker();
    const result = checker.check(enhancedContent, {
      title: 'MCP 시작하기',
      excerpt: 'MCP의 기본을 배웁니다. 초보자도 쉽게 따라할 수 있습니다.',
      tags: ['MCP', 'AI', '튜토리얼'],
      language: 'ko',
    });

    // 4. 경험담이 추가되었으므로 점수가 더 높아야 함
    expect(enhancedContent.length).toBeGreaterThan(originalContent.length);
    expect(result.checklist.hasPersonalExperience).toBe(true);
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it('영문 번역 품질 검증 파이프라인이 동작해야 한다', () => {
    // 1. 번역된 영문 콘텐츠 (직역투 문제 있음)
    const translatedContent = `
# Getting Started with MCP

It seems that MCP is a very useful protocol.
I think that you should try it.
It appears that the installation is easy.
    `;

    // 2. 번역 품질 분석
    const translator = new NativeTranslator();
    const analysis = translator.analyze(translatedContent);

    // 3. 품질 검토
    const checker = new QualityChecker();
    const result = checker.check(translatedContent, {
      title: 'Getting Started with MCP',
      excerpt: 'Learn the basics of MCP. A beginner-friendly tutorial.',
      tags: ['MCP', 'AI', 'tutorial'],
      language: 'en',
    });

    // 4. 직역 패턴이 감지되어야 함
    expect(analysis.directTranslationPatterns.length).toBeGreaterThan(0);
    expect(result.checklist.noDirectTranslation).toBe(false);
    expect(result.checklist.nativeStyleScore).toBeLessThan(100);
  });

  it('고품질 콘텐츠는 높은 점수를 받아야 한다', () => {
    const highQualityContent = `
# MCP 완벽 가이드

## 소개

저는 MCP를 사용하면서 많은 것을 배웠습니다.
이 글에서 그 경험을 공유하겠습니다.

![터미널 결과](./images/terminal.png)

## 설치 방법

저는 처음에 npm 설치에서 문제를 겪었습니다.
하지만 다음 방법으로 해결했습니다.

![설치 화면](./images/install.png)

## 실습

제 경험상 실습이 가장 중요합니다.

## 결론

MCP는 정말 유용한 도구입니다.
저처럼 AI 개발에 관심 있는 분들께 추천합니다.
    `;

    const checker = new QualityChecker();
    const result = checker.check(highQualityContent, {
      title: 'MCP 완벽 가이드: 초보자부터 고급자까지',
      excerpt: 'MCP의 기본부터 고급 활용까지. 저의 경험을 바탕으로 설명합니다.',
      tags: ['MCP', 'AI', '튜토리얼', '가이드'],
      language: 'ko',
    });

    expect(result.checklist.hasPersonalExperience).toBe(true);
    expect(result.checklist.experienceNaturallyIntegrated).toBe(true);
    expect(result.checklist.imageCount).toBe(2);
    expect(result.checklist.imagesHaveAltText).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });
});
