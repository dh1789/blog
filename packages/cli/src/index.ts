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
import { createCommand, refineCommand } from './commands/draft';
import { previewCommand } from './commands/preview';
import { imageGenerateCommand } from './commands/image';
import { trendingCommand } from './commands/trending';
import { analyticsCommand } from './commands/analytics';
import { analyzeSeoCommand } from './commands/analyze-seo';
import { translateCommand } from './commands/translate';
import { linkTranslationsCommand } from './commands/link-translations';

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
  .option('--link-to <id>', '연결할 한글 포스트 ID (영문 발행 시)')
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
  .command('draft-create <topic> <keywords>')
  .description('AI를 사용하여 블로그 포스트 초안 생성')
  .option('-w, --words <number>', '타겟 단어 수', '2000')
  .option('-t, --template <name>', '템플릿 이름', 'blog-post')
  .option('-l, --language <lang>', '언어 설정 (ko|en)', 'ko')
  .option('-s, --style <style>', '작성 스타일')
  .option('-g, --guidelines <path>', '가이드라인 파일 경로', 'prompts/blog-post-guidelines.md')
  .option('--no-guidelines', '가이드라인 비활성화')
  .action(createCommand);

program
  .command('draft-refine <file> <instruction>')
  .description('AI를 사용하여 기존 블로그 포스트 초안 수정')
  .option('-t, --timeout <ms>', '타임아웃 (밀리초)', '120000')
  .action(refineCommand);

program
  .command('preview <file>')
  .description('마크다운 파일을 브라우저에서 실시간 프리뷰')
  .option('-p, --port <number>', '시작 포트 번호', '3000')
  .option('--no-browser', '브라우저 자동 열기 비활성화')
  .option('--show-ads', '광고 삽입 위치 표시')
  .action(previewCommand);

program
  .command('image generate <prompt>')
  .description('DALL-E를 사용하여 블로그 이미지 생성')
  .option('-s, --size <size>', '이미지 크기 (1024x1024, 1792x1024, 1024x1792)', '1024x1024')
  .option('-q, --quality <quality>', '이미지 품질 (standard|hd)', 'standard')
  .option('--style <style>', '이미지 스타일 (vivid|natural)', 'vivid')
  .option('-o, --output <dir>', '출력 디렉토리', './images')
  .option('-u, --upload', 'WordPress에 자동 업로드 (미구현)')
  .action(imageGenerateCommand);

program
  .command('trending')
  .description('인기 트렌드 토픽 모니터링')
  .option('-s, --sources <sources>', '트렌드 소스 (reddit,hackernews,twitter)', 'reddit,hackernews')
  .option('-l, --limit <number>', '결과 개수 제한', '10')
  .option('-k, --keywords <keywords>', '키워드 필터 (쉼표 구분)')
  .option('-m, --min-score <score>', '최소 점수 필터', '0')
  .option('--language <lang>', '언어 설정 (ko|en)', 'ko')
  .option('-r, --revenue', '수익성 분석 포함 (Google Keyword Planner API 필요)')
  .option('-o, --output <path>', '결과를 파일로 저장 (JSON 형식)')
  .option('-f, --format <type>', '출력 포맷 (table|json)', 'table')
  .action(trendingCommand);

program
  .command('analytics')
  .description('블로그 분석 대시보드')
  .option('-p, --period <period>', '분석 기간 (day|week|month|year)', 'month')
  .option('-l, --limit <number>', '결과 개수 제한', '10')
  .option('-s, --sort-by <sort>', '정렬 기준 (views|comments|date)', 'views')
  .action(analyticsCommand);

program
  .command('analyze-seo <file>')
  .description('마크다운 파일의 SEO 점수 분석 및 개선 제안')
  .option('-v, --verbose', '상세 정보 출력 (섹션별 키워드 분포)')
  .option('--json', 'JSON 형식으로 출력')
  .action(analyzeSeoCommand);

program
  .command('translate <file>')
  .description('한국어 포스트를 영어로 번역 (AI 기반 SEO 최적화)')
  .option('-t, --target <lang>', '타겟 언어', 'en')
  .option('-p, --publish', '번역 후 WordPress에 자동 발행', false)
  .option('--dry-run', '실제 파일 생성 없이 미리보기', false)
  .option('-o, --output <path>', '출력 파일 경로 (기본값: content/posts/en/)')
  .action(translateCommand);

program
  .command('link-translations')
  .description('Polylang 언어 연결 (한글 ↔ 영문)')
  .requiredOption('--ko <id>', '한국어 포스트 ID')
  .requiredOption('--en <id>', '영어 포스트 ID')
  .option('--auto', '자동 매칭 (slug 기반, 향후 구현)')
  .action(linkTranslationsCommand);

program.parse();
