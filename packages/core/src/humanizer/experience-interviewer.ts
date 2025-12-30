/**
 * @file 경험 인터뷰 시스템
 * @description PRD 0016 - Phase 3: 경험 인터뷰 시스템
 *
 * 카테고리별 경험 질문을 생성하고, 답변을 바탕으로
 * 자연스러운 경험담 문단을 생성하여 콘텐츠에 삽입합니다.
 *
 * 카테고리별 삽입 위치:
 * - motivation: 서론/도입부
 * - challenge: 관련 기술 설명 섹션
 * - application: 실습/예제 섹션
 * - insight: 결론/마무리
 */

import type {
  ExperienceCategory,
  ExperienceQuestion,
  AuthorProfile,
} from './types';

/**
 * 카테고리별 질문 풀
 */
export const QUESTION_POOL: Record<ExperienceCategory, ExperienceQuestion[]> = {
  motivation: [
    {
      id: 'mot-1',
      question: '이 기술을 배우게 된 계기가 무엇인가요?',
      context: '개인적인 동기나 필요성을 설명해주세요',
      exampleAnswer: '회사에서 새 프로젝트에 필요해서 배우게 되었습니다.',
      category: 'motivation',
    },
    {
      id: 'mot-2',
      question: '이 기술에 처음 관심을 갖게 된 순간은 언제인가요?',
      context: '특별한 계기나 사건이 있었는지',
      exampleAnswer: '기술 블로그에서 관련 글을 읽고 흥미를 느꼈습니다.',
      category: 'motivation',
    },
    {
      id: 'mot-3',
      question: '이 기술을 배우기 전에 어떤 문제를 겪고 있었나요?',
      context: '해결하고자 했던 문제나 불편함',
      exampleAnswer: '기존 방식으로는 확장성에 한계가 있었습니다.',
      category: 'motivation',
    },
    {
      id: 'mot-4',
      question: '다른 대안들 대신 이 기술을 선택한 이유는?',
      context: '비교 검토 과정에서의 결정 요인',
      exampleAnswer: '커뮤니티가 활발하고 문서화가 잘 되어 있어서 선택했습니다.',
      category: 'motivation',
    },
  ],
  challenge: [
    {
      id: 'cha-1',
      question: '개발 중 가장 어려웠던 점은 무엇이었나요?',
      context: '기술적 어려움이나 장벽',
      exampleAnswer: '비동기 처리 개념을 이해하는 데 시간이 걸렸습니다.',
      category: 'challenge',
    },
    {
      id: 'cha-2',
      question: '이 문제를 어떻게 해결했나요?',
      context: '해결 과정과 사용한 방법',
      exampleAnswer: '공식 문서를 읽고 여러 예제를 직접 만들어보며 익혔습니다.',
      category: 'challenge',
    },
    {
      id: 'cha-3',
      question: '예상치 못한 문제가 발생한 적이 있나요?',
      context: '버그나 예외 상황',
      exampleAnswer: '프로덕션에서만 발생하는 메모리 누수 문제가 있었습니다.',
      category: 'challenge',
    },
    {
      id: 'cha-4',
      question: '이 기술을 배우면서 가장 혼란스러웠던 개념은?',
      context: '이해하기 어려웠던 부분',
      exampleAnswer: '처음에는 상태 관리 패턴이 복잡하게 느껴졌습니다.',
      category: 'challenge',
    },
  ],
  application: [
    {
      id: 'app-1',
      question: '실제로 어디에 적용했거나 적용할 계획인가요?',
      context: '실무나 프로젝트 적용 사례',
      exampleAnswer: '현재 진행 중인 사이드 프로젝트에 적용하고 있습니다.',
      category: 'application',
    },
    {
      id: 'app-2',
      question: '적용 후 어떤 변화가 있었나요?',
      context: '성과나 개선점',
      exampleAnswer: '코드 유지보수가 훨씬 쉬워졌고, 버그도 줄었습니다.',
      category: 'application',
    },
    {
      id: 'app-3',
      question: '이 기술을 사용한 구체적인 예시를 하나 들어주세요.',
      context: '실제 사용 사례',
      exampleAnswer: 'API 호출 최적화를 위해 캐싱 레이어를 구현했습니다.',
      category: 'application',
    },
    {
      id: 'app-4',
      question: '다른 프로젝트에도 적용할 계획인가요?',
      context: '향후 활용 계획',
      exampleAnswer: '다음 프로젝트에서도 기본 스택으로 사용할 예정입니다.',
      category: 'application',
    },
  ],
  insight: [
    {
      id: 'ins-1',
      question: '이 기술에 대해 다른 사람들에게 전하고 싶은 인사이트는?',
      context: '배움에서 얻은 통찰',
      exampleAnswer: '처음에는 어려워 보여도 기본 개념만 이해하면 빠르게 적응할 수 있습니다.',
      category: 'insight',
    },
    {
      id: 'ins-2',
      question: '이 기술을 배우려는 분들께 조언 한 마디?',
      context: '초보자를 위한 팁',
      exampleAnswer: '공식 튜토리얼부터 차근차근 따라하는 것을 추천합니다.',
      category: 'insight',
    },
    {
      id: 'ins-3',
      question: '이 기술의 미래에 대해 어떻게 생각하시나요?',
      context: '전망이나 발전 가능성',
      exampleAnswer: '점점 더 많은 기업에서 채택할 것으로 예상합니다.',
      category: 'insight',
    },
    {
      id: 'ins-4',
      question: '다시 처음부터 배운다면 어떻게 하시겠어요?',
      context: '회고와 개선점',
      exampleAnswer: '프로젝트 기반으로 배웠을 것 같습니다. 이론만으로는 한계가 있어요.',
      category: 'insight',
    },
  ],
};

/**
 * 섹션 매칭을 위한 키워드
 */
const SECTION_KEYWORDS: Record<ExperienceCategory, string[]> = {
  motivation: ['소개', '도입', '시작', 'introduction', 'intro', 'overview', '개요'],
  challenge: ['기술', '상세', '설명', '핵심', 'technical', 'detail', 'concept', '개념', '원리'],
  application: ['실습', '예제', '적용', '사용', 'practice', 'example', 'usage', '활용', '구현'],
  insight: ['결론', '마무리', '정리', 'conclusion', 'summary', '요약', 'wrap', '마치며'],
};

/**
 * 삽입 위치 정보
 */
export interface InsertionPosition {
  lineIndex: number;
  sectionTitle: string;
  afterParagraph: boolean;
}

/**
 * 지정된 카테고리 또는 모든 카테고리에서 질문 생성
 */
export function generateExperienceQuestions(
  category?: ExperienceCategory,
  count: number = 3
): ExperienceQuestion[] {
  if (category) {
    // 특정 카테고리에서 랜덤 선택
    const pool = [...QUESTION_POOL[category]];
    const selected: ExperienceQuestion[] = [];

    while (selected.length < count && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(randomIndex, 1)[0]);
    }

    return selected;
  }

  // 모든 카테고리에서 균등하게 선택
  const categories: ExperienceCategory[] = ['motivation', 'challenge', 'application', 'insight'];
  const selected: ExperienceQuestion[] = [];
  let categoryIndex = 0;

  while (selected.length < count) {
    const currentCategory = categories[categoryIndex % categories.length];
    const pool = QUESTION_POOL[currentCategory];
    const availableQuestions = pool.filter((q) => !selected.some((s) => s.id === q.id));

    if (availableQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      selected.push(availableQuestions[randomIndex]);
    }

    categoryIndex++;

    // 무한 루프 방지
    if (categoryIndex > count * 4) break;
  }

  return selected;
}

/**
 * 질문과 답변을 바탕으로 경험담 문단 생성
 */
export async function generateExperienceParagraph(
  question: ExperienceQuestion,
  answer: string,
  author: AuthorProfile
): Promise<string> {
  // 간단한 템플릿 기반 문단 생성
  // 실제 프로덕션에서는 Claude API를 사용하여 더 자연스러운 문단 생성

  const templates: Record<ExperienceCategory, string[]> = {
    motivation: [
      `저는 ${answer} 그래서 이 기술을 배우기 시작했습니다.`,
      `개인적으로 ${answer} 이런 이유로 관심을 갖게 되었어요.`,
      `제가 이 기술에 주목하게 된 건 ${answer} 덕분이었습니다.`,
    ],
    challenge: [
      `처음에는 ${answer} 정말 어려웠습니다. 하지만 꾸준히 연습하다 보니 익숙해졌어요.`,
      `솔직히 ${answer} 이 부분에서 많이 고생했습니다. 하지만 그 과정에서 많이 배웠죠.`,
      `${answer} 이게 가장 힘든 부분이었는데, 결국 해결하고 나니 뿌듯했습니다.`,
    ],
    application: [
      `저는 현재 ${answer} 실제로 프로젝트에 적용해보니 효과가 좋았어요.`,
      `${answer} 이렇게 실무에 적용해보고 있습니다. 확실히 생산성이 올랐어요.`,
      `개인 프로젝트에서 ${answer} 이렇게 활용 중인데, 정말 유용합니다.`,
    ],
    insight: [
      `제 경험상 ${answer} 이 점이 가장 중요한 것 같습니다.`,
      `${answer} 이런 인사이트를 얻었어요. 여러분에게도 도움이 되면 좋겠습니다.`,
      `마지막으로 ${answer} 이 점을 꼭 기억하시면 좋겠어요.`,
    ],
  };

  const categoryTemplates = templates[question.category];
  const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
  const template = categoryTemplates[randomIndex];

  // 톤에 따른 조정
  let paragraph = template;

  if (author.tone === 'formal') {
    paragraph = paragraph
      .replace('저는', '필자는')
      .replace('제가', '필자가')
      .replace('~요.', '~습니다.');
  }

  return paragraph;
}

/**
 * 카테고리에 맞는 삽입 위치 찾기
 */
export function findInsertionPosition(
  content: string,
  category: ExperienceCategory
): InsertionPosition {
  // 빈 콘텐츠 처리
  if (!content || content.trim() === '') {
    return {
      lineIndex: 0,
      sectionTitle: '',
      afterParagraph: false,
    };
  }

  const lines = content.split('\n');
  const keywords = SECTION_KEYWORDS[category];

  // 기본 위치 (콘텐츠 끝)
  let bestPosition: InsertionPosition = {
    lineIndex: lines.length,
    sectionTitle: '',
    afterParagraph: true,
  };

  // 섹션 제목 찾기 (## 또는 # 로 시작하는 라인)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#')) {
      const title = line.replace(/^#+\s*/, '').toLowerCase();

      // 키워드 매칭
      const isMatch = keywords.some((keyword) =>
        title.includes(keyword.toLowerCase())
      );

      if (isMatch) {
        // 섹션 내용이 끝나는 위치 찾기 (다음 섹션 시작 전 또는 파일 끝)
        let endIndex = i + 1;
        while (endIndex < lines.length) {
          const nextLine = lines[endIndex].trim();
          if (nextLine.startsWith('#')) {
            break;
          }
          endIndex++;
        }

        // 섹션 내 첫 번째 빈 줄 뒤에 삽입
        let insertIndex = i + 1;
        for (let j = i + 1; j < endIndex; j++) {
          if (lines[j].trim() !== '' && !lines[j].startsWith('```')) {
            insertIndex = j + 1;
            break;
          }
        }

        bestPosition = {
          lineIndex: insertIndex,
          sectionTitle: line.replace(/^#+\s*/, ''),
          afterParagraph: true,
        };
        break;
      }
    }
  }

  return bestPosition;
}

/**
 * 경험담 문단을 콘텐츠에 삽입
 */
export function insertExperienceParagraph(
  content: string,
  paragraph: string,
  category: ExperienceCategory
): string {
  const position = findInsertionPosition(content, category);
  const lines = content.split('\n');

  // 문단 앞뒤에 빈 줄 추가
  const formattedParagraph = `\n${paragraph}\n`;

  // 삽입
  lines.splice(position.lineIndex, 0, formattedParagraph);

  return lines.join('\n');
}

/**
 * 경험 인터뷰어 클래스
 */
export class ExperienceInterviewer {
  private author: AuthorProfile;

  constructor(author: AuthorProfile) {
    this.author = author;
  }

  /**
   * 작성자 프로필 반환
   */
  getAuthor(): AuthorProfile {
    return this.author;
  }

  /**
   * 질문 생성
   */
  generateQuestions(count: number = 3, category?: ExperienceCategory): ExperienceQuestion[] {
    return generateExperienceQuestions(category, count);
  }

  /**
   * 답변 처리 및 문단 생성
   */
  async processAnswer(
    question: ExperienceQuestion,
    answer: string
  ): Promise<string> {
    return generateExperienceParagraph(question, answer, this.author);
  }

  /**
   * 경험담을 콘텐츠에 삽입
   */
  async insertExperience(
    content: string,
    category: ExperienceCategory,
    paragraph: string
  ): Promise<string> {
    return insertExperienceParagraph(content, paragraph, category);
  }

  /**
   * 여러 경험담을 한 번에 삽입
   */
  async insertMultipleExperiences(
    content: string,
    experiences: Array<{ category: ExperienceCategory; paragraph: string }>
  ): Promise<string> {
    let result = content;

    // 카테고리 순서대로 삽입 (뒤에서부터 삽입하여 인덱스 변동 방지)
    const sortedExperiences = [...experiences].sort((a, b) => {
      const order: ExperienceCategory[] = ['insight', 'application', 'challenge', 'motivation'];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });

    for (const exp of sortedExperiences) {
      result = insertExperienceParagraph(result, exp.paragraph, exp.category);
    }

    return result;
  }
}
