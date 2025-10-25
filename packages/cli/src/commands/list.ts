/**
 * list 명령어: WordPress 포스트 목록 조회
 */

import chalk from 'chalk';

interface ListOptions {
  status: string;
  limit: string;
}

export async function listCommand(options: ListOptions) {
  console.log(chalk.yellow('포스트 목록 조회 기능은 개발 중입니다.'));
  console.log(`상태: ${options.status}, 제한: ${options.limit}`);
}
