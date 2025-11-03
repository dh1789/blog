/**
 * link-translations 명령어: Polylang 언어 연결 (한글 ↔ 영문)
 */

import ora from 'ora';
import chalk from 'chalk';
import { WordPressClient } from '@blog/core';
import { loadConfig } from '../utils/config';

export interface LinkTranslationsOptions {
  ko: string;   // 한글 post ID
  en: string;   // 영문 post ID
  auto?: boolean;  // 자동 매칭 (향후 구현)
}

export async function linkTranslationsCommand(options: LinkTranslationsOptions) {
  const spinner = ora('Polylang 언어 연결 중...').start();

  try {
    // 설정 로드
    const config = await loadConfig();
    const wp = new WordPressClient(config.wordpress);

    // Post ID 파싱 및 검증
    const koId = parseInt(options.ko, 10);
    const enId = parseInt(options.en, 10);

    if (isNaN(koId) || isNaN(enId)) {
      spinner.fail(chalk.red('잘못된 Post ID입니다.'));
      console.error(chalk.yellow('\nPost ID는 숫자여야 합니다.'));
      console.error(chalk.cyan('사용법: blog link-translations --ko 29 --en 26'));
      process.exit(1);
    }

    if (koId <= 0 || enId <= 0) {
      spinner.fail(chalk.red('잘못된 Post ID입니다.'));
      console.error(chalk.yellow('\nPost ID는 양수여야 합니다.'));
      process.exit(1);
    }

    // 언어 연결
    await wp.linkTranslations(koId, enId);

    spinner.succeed(chalk.green('언어 연결 완료!'));

    // 연결 결과 출력
    console.log(chalk.cyan('\n=== 연결 결과 ==='));
    console.log(`한글 포스트: ID ${koId}`);
    console.log(`영문 포스트: ID ${enId}`);
    console.log(`\nWordPress 관리자에서 확인하세요:`);
    console.log(`${config.wordpress.url}/wp-admin/post.php?post=${koId}&action=edit`);

  } catch (error) {
    spinner.fail(chalk.red('언어 연결 실패'));

    if (error instanceof Error) {
      console.error(chalk.red(`\n오류: ${error.message}`));

      // 에러 타입별 안내 메시지
      if (error.message.includes('Post not found')) {
        console.error(chalk.yellow('\n포스트가 존재하지 않습니다.'));
        console.error(chalk.cyan('WordPress 관리자에서 포스트 ID를 확인하세요.'));
      } else if (error.message.includes('Permission denied')) {
        console.error(chalk.yellow('\n권한이 없습니다.'));
        console.error(chalk.cyan('WordPress Application Password를 확인하세요.'));
      } else {
        console.error(chalk.yellow('\n네트워크 연결 또는 WordPress 설정을 확인하세요.'));
      }
    } else {
      console.error(chalk.red(`\n오류: ${String(error)}`));
    }

    process.exit(1);
  }
}
