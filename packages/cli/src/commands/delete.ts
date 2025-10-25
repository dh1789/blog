/**
 * delete 명령어: WordPress 포스트 삭제
 */

import chalk from 'chalk';

interface DeleteOptions {
  force: boolean;
}

export async function deleteCommand(postId: string, options: DeleteOptions) {
  console.log(chalk.yellow('포스트 삭제 기능은 개발 중입니다.'));
  console.log(`포스트 ID: ${postId}, 강제: ${options.force}`);
}
