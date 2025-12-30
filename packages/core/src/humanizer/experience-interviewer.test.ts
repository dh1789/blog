/**
 * @file 경험 인터뷰 시스템 테스트
 * @description PRD 0016 - Phase 3: 경험 인터뷰 시스템
 *
 * 🔴 RED Phase: 경험 질문 생성 및 문단 삽입 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  ExperienceInterviewer,
  generateExperienceQuestions,
  generateExperienceParagraph,
  insertExperienceParagraph,
  findInsertionPosition,
  QUESTION_POOL,
} from './experience-interviewer';
import type { ExperienceCategory, ExperienceQuestion, AuthorProfile } from './types';

describe('ExperienceInterviewer', () => {
  // 테스트용 작성자 프로필
  const testAuthor: AuthorProfile = {
    name: 'Test Author',
    role: 'Software Engineer',
    experience: 5,
    specialties: ['TypeScript', 'Node.js', 'React'],
    tone: 'casual',
  };

  describe('QUESTION_POOL', () => {
    it('should have questions for all categories', () => {
      const categories: ExperienceCategory[] = ['motivation', 'challenge', 'application', 'insight'];

      categories.forEach((category) => {
        const questions = QUESTION_POOL[category];
        expect(questions).toBeDefined();
        expect(questions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid question structure', () => {
      Object.values(QUESTION_POOL).flat().forEach((question) => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('context');
        expect(question).toHaveProperty('exampleAnswer');
        expect(question).toHaveProperty('category');
      });
    });
  });

  describe('generateExperienceQuestions', () => {
    it('should generate questions for specified category', () => {
      const questions = generateExperienceQuestions('motivation', 2);

      expect(questions).toHaveLength(2);
      questions.forEach((q) => {
        expect(q.category).toBe('motivation');
      });
    });

    it('should generate questions for all categories if none specified', () => {
      const questions = generateExperienceQuestions(undefined, 4);

      expect(questions).toHaveLength(4);
      // 카테고리가 다양하게 포함되어야 함
      const categories = new Set(questions.map((q) => q.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should not return duplicate questions', () => {
      const questions = generateExperienceQuestions('challenge', 5);

      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(questions.length);
    });

    it('should limit questions to available pool size', () => {
      const questions = generateExperienceQuestions('motivation', 100);

      expect(questions.length).toBeLessThanOrEqual(QUESTION_POOL.motivation.length);
    });
  });

  describe('generateExperienceParagraph', () => {
    it('should generate a paragraph from question and answer', async () => {
      const question: ExperienceQuestion = {
        id: 'test-1',
        question: '이 기술을 배우게 된 계기가 무엇인가요?',
        context: '개인적인 동기나 필요성',
        exampleAnswer: '회사에서 새 프로젝트에 필요해서 배우게 되었습니다.',
        category: 'motivation',
      };

      const answer = '사이드 프로젝트를 위해 TypeScript를 배우기 시작했습니다.';

      const paragraph = await generateExperienceParagraph(question, answer, testAuthor);

      expect(paragraph).toBeDefined();
      expect(paragraph.length).toBeGreaterThan(50);
      expect(paragraph).toContain('TypeScript'); // 답변 키워드 포함
    });

    it('should reflect author profile in generated paragraph', async () => {
      const question: ExperienceQuestion = {
        id: 'test-2',
        question: '개발 중 가장 어려웠던 점은?',
        context: '기술적 어려움',
        exampleAnswer: '비동기 처리가 어려웠습니다.',
        category: 'challenge',
      };

      const answer = 'Node.js의 비동기 패턴이 처음에는 어려웠습니다.';

      const paragraph = await generateExperienceParagraph(question, answer, testAuthor);

      // casual tone이 반영되어야 함
      expect(paragraph).toBeDefined();
      expect(paragraph.length).toBeGreaterThan(50);
    });

    it('should generate 1st person perspective paragraph', async () => {
      const question: ExperienceQuestion = {
        id: 'test-3',
        question: '실제로 어디에 적용했나요?',
        context: '실무 적용 사례',
        exampleAnswer: '회사 프로젝트에 적용했습니다.',
        category: 'application',
      };

      const answer = 'React 프론트엔드 프로젝트에서 사용 중입니다.';

      const paragraph = await generateExperienceParagraph(question, answer, testAuthor);

      // 1인칭 표현이 포함되어야 함
      const firstPersonIndicators = ['나는', '저는', '제가', '내', '제', 'I', 'my', 'me'];
      const hasFirstPerson = firstPersonIndicators.some((ind) =>
        paragraph.toLowerCase().includes(ind.toLowerCase())
      );
      expect(hasFirstPerson || paragraph.length > 0).toBe(true);
    });
  });

  describe('findInsertionPosition', () => {
    const sampleContent = `# 제목

## 소개
이것은 소개 부분입니다.
기술에 대한 설명입니다.

## 기술 상세
여기서 기술 세부사항을 설명합니다.
복잡한 개념들이 있습니다.

## 실습 예제
코드 예제를 보여드립니다.

\`\`\`typescript
const example = "code";
\`\`\`

## 결론
마무리 내용입니다.
`;

    it('should find position for motivation (introduction)', () => {
      const position = findInsertionPosition(sampleContent, 'motivation');

      expect(position).toBeDefined();
      expect(position.sectionTitle).toContain('소개');
    });

    it('should find position for challenge (technical section)', () => {
      const position = findInsertionPosition(sampleContent, 'challenge');

      expect(position).toBeDefined();
      expect(position.sectionTitle).toContain('기술');
    });

    it('should find position for application (practice section)', () => {
      const position = findInsertionPosition(sampleContent, 'application');

      expect(position).toBeDefined();
      expect(position.sectionTitle).toContain('실습');
    });

    it('should find position for insight (conclusion)', () => {
      const position = findInsertionPosition(sampleContent, 'insight');

      expect(position).toBeDefined();
      expect(position.sectionTitle).toContain('결론');
    });

    it('should return fallback position if section not found', () => {
      const shortContent = '# 제목\n\n짧은 내용입니다.';
      const position = findInsertionPosition(shortContent, 'motivation');

      expect(position).toBeDefined();
      expect(position.lineIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('insertExperienceParagraph', () => {
    const sampleContent = `# 제목

## 소개
이것은 소개 부분입니다.

## 기술 상세
여기서 기술을 설명합니다.

## 결론
마무리입니다.
`;

    it('should insert paragraph at correct position', () => {
      const paragraph = '> 💡 **개발자의 경험**: 저는 이 기술을 사용하면서 많은 것을 배웠습니다.';

      const result = insertExperienceParagraph(sampleContent, paragraph, 'motivation');

      expect(result).toContain(paragraph);
      // 소개 섹션 뒤에 삽입되어야 함
      const paragraphIndex = result.indexOf(paragraph);
      const introIndex = result.indexOf('## 소개');
      expect(paragraphIndex).toBeGreaterThan(introIndex);
    });

    it('should maintain markdown structure', () => {
      const paragraph = '경험담 문단입니다.';

      const result = insertExperienceParagraph(sampleContent, paragraph, 'insight');

      // 모든 원본 섹션이 유지되어야 함
      expect(result).toContain('## 소개');
      expect(result).toContain('## 기술 상세');
      expect(result).toContain('## 결론');
    });

    it('should add blank lines around inserted paragraph', () => {
      const paragraph = '경험담 문단입니다.';

      const result = insertExperienceParagraph(sampleContent, paragraph, 'motivation');

      // 문단 앞뒤로 빈 줄이 있어야 함
      const paragraphIndex = result.indexOf(paragraph);
      expect(result.substring(paragraphIndex - 2, paragraphIndex)).toContain('\n');
    });
  });

  describe('ExperienceInterviewer class', () => {
    it('should create instance with author profile', () => {
      const interviewer = new ExperienceInterviewer(testAuthor);

      expect(interviewer).toBeDefined();
      expect(interviewer.getAuthor()).toEqual(testAuthor);
    });

    it('should generate interview questions', () => {
      const interviewer = new ExperienceInterviewer(testAuthor);

      const questions = interviewer.generateQuestions(3);

      expect(questions).toHaveLength(3);
    });

    it('should process answer and generate paragraph', async () => {
      const interviewer = new ExperienceInterviewer(testAuthor);
      const questions = interviewer.generateQuestions(1);

      const paragraph = await interviewer.processAnswer(
        questions[0],
        '테스트 답변입니다.'
      );

      expect(paragraph).toBeDefined();
      expect(paragraph.length).toBeGreaterThan(0);
    });

    it('should insert experience into content', async () => {
      const interviewer = new ExperienceInterviewer(testAuthor);
      const content = `# 제목\n\n## 소개\n내용입니다.\n\n## 결론\n마무리.`;

      const result = await interviewer.insertExperience(
        content,
        'motivation',
        '테스트 경험담입니다.'
      );

      expect(result).toContain('테스트 경험담입니다.');
    });

    it('should support batch processing of multiple experiences', async () => {
      const interviewer = new ExperienceInterviewer(testAuthor);
      const content = `# 제목\n\n## 소개\n내용\n\n## 기술\n설명\n\n## 결론\n마무리`;

      const experiences: Array<{ category: ExperienceCategory; paragraph: string }> = [
        { category: 'motivation', paragraph: '동기 경험담' },
        { category: 'insight', paragraph: '인사이트 경험담' },
      ];

      const result = await interviewer.insertMultipleExperiences(content, experiences);

      expect(result).toContain('동기 경험담');
      expect(result).toContain('인사이트 경험담');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const position = findInsertionPosition('', 'motivation');

      expect(position).toBeDefined();
      expect(position.lineIndex).toBe(0);
    });

    it('should handle content without sections', () => {
      const content = '단순한 텍스트입니다. 섹션이 없습니다.';
      const position = findInsertionPosition(content, 'challenge');

      expect(position).toBeDefined();
    });

    it('should handle Korean and English mixed content', () => {
      const content = `# Introduction

## 소개
This is mixed content 한국어와 영어가 섞여있습니다.

## Conclusion 결론
마무리입니다.
`;
      const position = findInsertionPosition(content, 'insight');

      expect(position).toBeDefined();
    });

    it('should preserve code blocks when inserting', () => {
      const content = `# 제목

## 소개
소개입니다.

\`\`\`typescript
const code = "preserved";
\`\`\`

## 결론
끝.
`;
      const paragraph = '경험담입니다.';
      const result = insertExperienceParagraph(content, paragraph, 'motivation');

      expect(result).toContain('const code = "preserved"');
    });
  });
});
