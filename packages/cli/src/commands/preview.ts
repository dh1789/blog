/**
 * blog preview 명령어
 * 마크다운 파일을 브라우저에서 실시간 프리뷰
 */

import { startPreviewServer } from '@blog/core';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';

interface PreviewCommandOptions {
  port?: string;
  browser?: boolean;
  showAds?: boolean;
}

/**
 * preview 명령어 핸들러
 */
export async function previewCommand(
  file: string,
  options: PreviewCommandOptions
): Promise<void> {
  try {
    // 파일 경로 해석
    const filePath = resolve(process.cwd(), file);

    // 파일 존재 확인
    if (!existsSync(filePath)) {
      console.error(chalk.red(`\n❌ 파일을 찾을 수 없습니다: ${filePath}`));
      process.exit(1);
    }

    // 옵션 파싱
    const port = options.port ? parseInt(options.port, 10) : 3000;
    const openBrowser = options.browser !== false; // 기본값 true
    const showAdPositions = options.showAds === true; // 기본값 false

    console.log(chalk.blue('\n🌐 프리뷰 서버 시작 중...\n'));
    console.log(chalk.gray(`파일: ${filePath}`));
    console.log(chalk.gray(`포트: ${port}`));
    console.log(chalk.gray(`브라우저 자동 열기: ${openBrowser ? '활성화' : '비활성화'}`));
    console.log(chalk.gray(`광고 위치 표시: ${showAdPositions ? '활성화' : '비활성화'}\n`));

    // 프리뷰 서버 시작
    const server = await startPreviewServer({
      filePath,
      port,
      openBrowser,
      showAdPositions,
    });

    console.log(chalk.green(`\n✅ 프리뷰 서버가 시작되었습니다!`));
    console.log(chalk.cyan(`\n📍 URL: ${server.url}`));
    console.log(chalk.cyan(`🔌 포트: ${server.port}`));

    console.log(chalk.yellow('\n💡 팁:'));
    console.log(chalk.gray('  - 파일을 수정하면 브라우저가 자동으로 새로고침됩니다'));
    console.log(chalk.gray('  - 서버를 종료하려면 Ctrl+C를 누르세요'));

    // Graceful shutdown 설정
    const shutdown = async () => {
      console.log(chalk.yellow('\n\n🛑 서버를 종료하는 중...'));
      await server.close();
      console.log(chalk.green('✅ 서버가 종료되었습니다\n'));
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 서버가 종료될 때까지 대기
    await new Promise(() => {}); // 무한 대기
  } catch (error) {
    console.error(
      chalk.red('\n❌ 프리뷰 서버 시작 실패:'),
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
