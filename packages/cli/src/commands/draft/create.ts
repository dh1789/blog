/**
 * blog draft create 명령어
 * AI를 사용하여 블로그 포스트 초안 생성
 */

import { createDraft, checkClaudeAvailability } from '@blog/core';
import type { DraftCreateOptions } from '@blog/shared';

interface CreateCommandOptions {
  words?: string;
  template?: string;
  language?: 'ko' | 'en';
  style?: string;
  guidelines?: string;
  noGuidelines?: boolean;
}

/**
 * draft create 명령어 핸들러
 */
export async function createCommand(
  topic: string,
  keywords: string,
  options: CreateCommandOptions
): Promise<void> {
  try {
    console.log('🤖 Claude Code 가용성 확인 중...');

    // Claude Code 가용성 확인
    const isAvailable = await checkClaudeAvailability();
    if (!isAvailable) {
      console.error('❌ Claude Code를 사용할 수 없습니다.');
      console.error('Claude Code가 설치되어 있고 PATH에 등록되어 있는지 확인하세요.');
      process.exit(1);
    }

    console.log('✅ Claude Code 사용 가능');
    console.log(`\n📝 초안 생성 중...`);
    console.log(`주제: ${topic}`);
    console.log(`키워드: ${keywords}`);

    // 가이드라인 처리
    let guidelinesPath: string | undefined;
    if (options.noGuidelines) {
      console.log('ℹ️  가이드라인 비활성화');
      guidelinesPath = undefined;
    } else if (options.guidelines) {
      console.log(`📋 가이드라인: ${options.guidelines}`);
      guidelinesPath = options.guidelines;
    } else {
      // 기본값: prompts/blog-post-guidelines.md
      guidelinesPath = 'prompts/blog-post-guidelines.md';
    }

    // 옵션 파싱
    const draftOptions: DraftCreateOptions = {
      topic,
      keywords,
      words: options.words ? parseInt(options.words, 10) : undefined,
      template: options.template,
      language: options.language,
      style: options.style,
      guidelines: guidelinesPath,
    };

    // 타임아웃 안내
    const estimatedMinutes = Math.ceil((draftOptions.words || 2000) / 1000 * 1);
    console.log(`⏱️  예상 소요 시간: 약 ${estimatedMinutes}분`);
    console.log('');

    // 초안 생성
    const filePath = await createDraft(draftOptions);

    console.log('\n✅ 초안 생성 완료!');
    console.log(`📄 파일: ${filePath}`);
    console.log('\n다음 단계:');
    console.log(`  1. 초안 확인: cat "${filePath}"`);
    console.log(`  2. 초안 수정: blog draft refine "${filePath}" "수정 지시사항"`);
    console.log(`  3. 프리뷰: blog preview "${filePath}"`);
    console.log(`  4. 발행: blog publish "${filePath}"`);
  } catch (error) {
    console.error('\n❌ 초안 생성 실패:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
