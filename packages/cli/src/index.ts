#!/usr/bin/env node

/**
 * @blog/cli
 * WordPress 자동화 CLI 도구 진입점
 */

import { Command } from 'commander';
import { publishCommand } from './commands/publish';
import { listCommand } from './commands/list';
import { deleteCommand } from './commands/delete';
import { configCommand } from './commands/config';
import { createCommand } from './commands/draft';

const program = new Command();

program
  .name('blog')
  .description('WordPress + Avada 블로그 콘텐츠 관리 자동화 도구')
  .version('0.1.0');

program
  .command('publish <file>')
  .description('마크다운 파일을 WordPress에 발행')
  .option('-d, --draft', '초안으로 저장', false)
  .option('-l, --language <lang>', '언어 설정 (ko|en)', 'ko')
  .option('--dry-run', '실제 업로드 없이 시뮬레이션', false)
  .action(publishCommand);

program
  .command('list')
  .description('WordPress 포스트 목록 조회')
  .option('-s, --status <status>', '상태 필터 (publish|draft|all)', 'all')
  .option('-l, --limit <number>', '결과 제한', '10')
  .action(listCommand);

program
  .command('delete <postId>')
  .description('WordPress 포스트 삭제')
  .option('-f, --force', '확인 없이 강제 삭제', false)
  .action(deleteCommand);

program
  .command('config')
  .description('WordPress 연결 설정')
  .action(configCommand);

program
  .command('draft create <topic> <keywords>')
  .description('AI를 사용하여 블로그 포스트 초안 생성')
  .option('-w, --words <number>', '타겟 단어 수', '2000')
  .option('-t, --template <name>', '템플릿 이름', 'blog-post')
  .option('-l, --language <lang>', '언어 설정 (ko|en)', 'ko')
  .option('-s, --style <style>', '작성 스타일')
  .action(createCommand);

program.parse();
