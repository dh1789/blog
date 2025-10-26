/**
 * blog draft refine 명령어
 * AI를 사용하여 기존 블로그 포스트 초안 수정
 */

import { refineDraft, checkClaudeAvailability } from '@blog/core';
import { existsSync } from 'fs';

interface RefineCommandOptions {
  timeout?: string;
}

/**
 * draft refine 명령어 핸들러
 */
export async function refineCommand(
  file: string,
  instruction: string,
  options: RefineCommandOptions
): Promise<void> {
  try {
    // 파일 존재 확인
    if (!existsSync(file)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${file}`);
      process.exit(1);
    }

    console.log('🤖 Claude Code 가용성 확인 중...');

    // Claude Code 가용성 확인
    const isAvailable = await checkClaudeAvailability();
    if (!isAvailable) {
      console.error('❌ Claude Code를 사용할 수 없습니다.');
      console.error('Claude Code가 설치되어 있고 PATH에 등록되어 있는지 확인하세요.');
      process.exit(1);
    }

    console.log('✅ Claude Code 사용 가능');
    console.log(`\n📝 초안 수정 중...`);
    console.log(`파일: ${file}`);
    console.log(`수정 지시사항: ${instruction}`);
    console.log('');

    // 옵션 파싱
    const refineOptions: { file: string; instruction: string; timeout?: number } = {
      file,
      instruction,
      timeout: options.timeout ? parseInt(options.timeout, 10) : undefined,
    };

    // 타임아웃 안내
    const timeoutMinutes = Math.ceil((refineOptions.timeout || 120000) / 60000);
    console.log(`⏱️  최대 대기 시간: ${timeoutMinutes}분`);
    console.log('');

    // 초안 수정
    const refinedContent = await refineDraft(refineOptions);

    console.log('\n✅ 초안 수정 완료!');
    console.log(`📄 파일: ${file}`);
    console.log('\n다음 단계:');
    console.log(`  1. 수정 내용 확인: cat "${file}"`);
    console.log(`  2. 추가 수정: blog draft refine "${file}" "추가 수정 지시사항"`);
    console.log(`  3. 프리뷰: blog preview "${file}"`);
    console.log(`  4. 발행: blog publish "${file}"`);
  } catch (error) {
    console.error('\n❌ 초안 수정 실패:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
