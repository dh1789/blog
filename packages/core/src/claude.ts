/**
 * Claude Code headless 통합
 *
 * child_process를 사용하여 Claude Code를 headless 모드로 실행하고
 * AI 생성 콘텐츠를 받아옵니다.
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type {
  ClaudeOptions,
  ClaudeResponse,
  DraftCreateOptions,
  DraftRefineOptions,
} from '@blog/shared';
import { renderTemplate, applyDefaults } from './templates';

/**
 * Claude Code 실행 파일 경로
 * which claude로 확인한 절대 경로 사용
 */
const CLAUDE_COMMAND = '/opt/homebrew/bin/claude';

/**
 * 기본 타임아웃 (밀리초)
 */
const DEFAULT_TIMEOUT = 120000; // 2분

/**
 * 단어당 타임아웃 계산 (밀리초)
 * 1000 단어당 약 60초 = 단어당 60ms (Claude Code가 더 느릴 수 있음)
 */
const TIMEOUT_PER_WORD = 60;

/**
 * content/drafts 디렉토리
 */
function getDraftsDir(): string {
  // 프로젝트 루트 찾기
  let currentPath = process.cwd();
  while (currentPath !== '/') {
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (existsSync(join(currentPath, 'pnpm-workspace.yaml')) || packageJson.workspaces) {
        return resolve(currentPath, 'content/drafts');
      }
    }
    currentPath = resolve(currentPath, '..');
  }
  return resolve(process.cwd(), 'content/drafts');
}

/**
 * 단어 수에 비례한 타임아웃 계산
 *
 * @param words 타겟 단어 수
 * @returns 타임아웃 (밀리초)
 */
export function calculateTimeout(words: number): number {
  // 최소 2분, 단어 수에 비례하여 증가
  const calculatedTimeout = Math.max(DEFAULT_TIMEOUT, words * TIMEOUT_PER_WORD);

  // 최대 10분
  return Math.min(calculatedTimeout, 600000);
}

/**
 * Claude Code 실행
 *
 * @param options Claude 실행 옵션
 * @returns Claude 응답
 */
export async function executeClaude(options: ClaudeOptions): Promise<ClaudeResponse> {
  const startTime = Date.now();
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  return new Promise((resolve) => {
    // stdin으로 프롬프트 전달 (특수 문자 이스케이프 문제 회피)
    // -p: headless 모드 (필수)
    // --permission-mode acceptEdits: 권한 프롬프트 자동 승인
    const claudeProcess = spawn(CLAUDE_COMMAND, [
      '-p',
      '--permission-mode', 'acceptEdits'
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      env: process.env,   // 환경 변수 전달 (macOS Keychain 접근 등)
      cwd: process.cwd(), // 현재 작업 디렉토리
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | null = null;
    let isTimedOut = false;

    // 타임아웃 설정
    timeoutId = setTimeout(() => {
      isTimedOut = true;
      claudeProcess.kill('SIGTERM');

      resolve({
        success: false,
        content: '',
        error: `Claude Code execution timed out after ${timeout}ms`,
        executionTime: Date.now() - startTime,
      });
    }, timeout);

    // stdout 수집
    claudeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // stderr 수집
    claudeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // 프로세스 종료 처리
    claudeProcess.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 이미 타임아웃 처리된 경우 무시
      if (isTimedOut) {
        return;
      }

      const executionTime = Date.now() - startTime;

      if (code === 0) {
        resolve({
          success: true,
          content: stdout.trim(),
          executionTime,
        });
      } else {
        resolve({
          success: false,
          content: stdout.trim(),
          error: stderr.trim() || `Claude Code exited with code ${code}`,
          executionTime,
        });
      }
    });

    // 에러 처리
    claudeProcess.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!isTimedOut) {
        resolve({
          success: false,
          content: '',
          error: `Failed to execute Claude Code: ${error.message}`,
          executionTime: Date.now() - startTime,
        });
      }
    });

    // stdin으로 프롬프트 전달
    claudeProcess.stdin.write(options.prompt);
    claudeProcess.stdin.end();
  });
}

/**
 * 가이드라인 파일 로드
 *
 * @param guidelinesPath 가이드라인 파일 경로
 * @returns 가이드라인 내용 또는 null
 */
function loadGuidelines(guidelinesPath?: string): string | null {
  if (!guidelinesPath) {
    return null;
  }

  try {
    const fullPath = resolve(process.cwd(), guidelinesPath);
    if (!existsSync(fullPath)) {
      console.warn(`⚠️  가이드라인 파일을 찾을 수 없습니다: ${guidelinesPath}`);
      return null;
    }

    const guidelines = readFileSync(fullPath, 'utf-8');
    console.log(`✓ 가이드라인 로드 완료: ${guidelinesPath}`);
    return guidelines;
  } catch (error) {
    console.warn(`⚠️  가이드라인 파일 로드 실패: ${(error as Error).message}`);
    return null;
  }
}

/**
 * 초안 생성
 *
 * @param options 초안 생성 옵션
 * @returns 생성된 마크다운 파일 경로
 */
export async function createDraft(options: DraftCreateOptions): Promise<string> {
  // 기본값 적용
  const words = options.words || 2000;
  const template = options.template || 'blog-post';
  const language = options.language || 'ko';
  const guidelinesPath = options.guidelines || 'prompts/blog-post-guidelines.md';

  // 템플릿 변수 준비
  const variables = applyDefaults({
    TOPIC: options.topic,
    KEYWORDS: options.keywords,
    WORDS: words.toString(),
    LANGUAGE: language,
  });

  // 템플릿 렌더링
  let prompt = renderTemplate({
    name: template,
    variables,
  });

  // 가이드라인 주입
  const guidelines = loadGuidelines(guidelinesPath);
  if (guidelines) {
    prompt = `${prompt}

---

## 📋 Blog Post Guidelines

다음 가이드라인을 반드시 준수하여 포스트를 작성하세요:

${guidelines}

---

위 가이드라인을 모두 적용하여 고품질 블로그 포스트를 작성해주세요.`;
  }

  // 타임아웃 계산 (중요: 단어 수에 비례)
  const timeout = calculateTimeout(words);

  // Claude Code 실행
  const response = await executeClaude({
    prompt,
    timeout,
  });

  if (!response.success) {
    throw new Error(
      `Failed to generate draft: ${response.error}\n` +
      `Execution time: ${response.executionTime}ms`
    );
  }

  // 파일명 생성 (topic을 slug로 변환)
  const slug = options.topic
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${timestamp}-${slug}.md`;
  const filepath = join(getDraftsDir(), filename);

  // 파일 저장
  writeFileSync(filepath, response.content, 'utf-8');

  return filepath;
}

/**
 * 초안 수정
 *
 * @param options 초안 수정 옵션
 * @returns 수정된 콘텐츠
 */
export async function refineDraft(options: DraftRefineOptions): Promise<string> {
  // 기존 파일 읽기
  if (!existsSync(options.file)) {
    throw new Error(`Draft file not found: ${options.file}`);
  }

  const existingContent = readFileSync(options.file, 'utf-8');

  // 프롬프트 생성
  const prompt = `다음 마크다운 문서를 수정해주세요.

수정 지시사항:
${options.instruction}

기존 문서:
\`\`\`markdown
${existingContent}
\`\`\`

수정된 전체 문서를 마크다운 형식으로 출력해주세요. 다른 설명 없이 마크다운 문서만 출력하세요.`;

  // 타임아웃 (수정은 생성보다 짧게)
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  // Claude Code 실행
  const response = await executeClaude({
    prompt,
    timeout,
  });

  if (!response.success) {
    throw new Error(
      `Failed to refine draft: ${response.error}\n` +
      `Execution time: ${response.executionTime}ms`
    );
  }

  // 파일 덮어쓰기
  writeFileSync(options.file, response.content, 'utf-8');

  return response.content;
}

/**
 * Claude Code 사용 가능 여부 확인
 *
 * @returns Claude Code 사용 가능 여부
 */
export async function checkClaudeAvailability(): Promise<boolean> {
  try {
    const response = await executeClaude({
      prompt: 'Hello',
      timeout: 10000, // 10초
    });

    return response.success;
  } catch {
    return false;
  }
}
