/**
 * delete 명령어: WordPress 포스트 삭제
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { WordPressClient } from '@blog/core';
import { loadWordPressConfig } from '../utils/config.js';

interface DeleteOptions {
  force: boolean;
}

export async function deleteCommand(postId: string, options: DeleteOptions) {
  const spinner = ora();

  try {
    // 설정 로드
    const config = loadWordPressConfig();

    // WordPress 클라이언트 생성
    const client = new WordPressClient(config);

    // 포스트 ID 숫자 변환
    const id = parseInt(postId, 10);
    if (isNaN(id)) {
      console.error(chalk.red(`❌ 유효하지 않은 포스트 ID: ${postId}`));
      process.exit(1);
    }

    // --force 옵션이 없으면 확인 요청
    if (!options.force) {
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `포스트 ID ${id}를 정말 삭제하시겠습니까?`,
          default: false,
        },
      ]);

      if (!confirmed) {
        console.log(chalk.yellow('취소되었습니다.'));
        process.exit(0);
      }
    }

    // 포스트 삭제
    spinner.start(`포스트 ID ${id} 삭제 중...`);
    await client.deletePost(id);
    spinner.succeed(chalk.green(`✅ 포스트 ID ${id} 삭제 완료!`));

  } catch (error) {
    spinner.fail(chalk.red('❌ 포스트 삭제 실패'));
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}
