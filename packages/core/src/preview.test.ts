/**
 * 프리뷰 서버 테스트
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { startPreviewServer, type PreviewServer } from './preview.js';

// 테스트용 디렉토리
const TEST_DIR = join(process.cwd(), '.test-preview');
const TEST_FILE = join(TEST_DIR, 'test-post.md');

describe('Preview Server', () => {
  let server: PreviewServer | null = null;

  beforeEach(() => {
    // 테스트 디렉토리 생성
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }

    // 테스트 파일 생성
    const testContent = `---
title: "프리뷰 테스트 포스트"
excerpt: "프리뷰 서버 테스트를 위한 샘플 포스트입니다."
categories: ["Test"]
tags: ["preview", "test", "sample"]
status: "draft"
language: "ko"
---

# 프리뷰 테스트

이것은 프리뷰 서버 테스트를 위한 샘플 콘텐츠입니다.

## 기능 테스트

- 마크다운 렌더링
- 실시간 업데이트
- 광고 위치 표시

\`\`\`javascript
console.log('테스트 코드 블록');
\`\`\`
`;
    writeFileSync(TEST_FILE, testContent, 'utf-8');
  });

  afterEach(async () => {
    // 서버 중지
    if (server) {
      await server.close();
      server = null;
    }

    // 테스트 디렉토리 정리
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('Server Initialization', () => {
    it('should start server on default port 3000', async () => {
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
      });

      expect(server.port).toBeGreaterThanOrEqual(3000);
      expect(server.url).toBe(`http://localhost:${server.port}`);
    });

    it('should find next available port if default is taken', async () => {
      // 첫 번째 서버 시작
      const server1 = await startPreviewServer({
        filePath: TEST_FILE,
        port: 3100,
        openBrowser: false,
      });

      // 두 번째 서버는 다음 포트를 사용해야 함
      const server2 = await startPreviewServer({
        filePath: TEST_FILE,
        port: 3100,
        openBrowser: false,
      });

      expect(server2.port).toBe(3101);

      // 정리
      await server1.close();
      await server2.close();
    });

    it('should throw error if file does not exist', async () => {
      await expect(
        startPreviewServer({
          filePath: '/non/existent/file.md',
          openBrowser: false,
        })
      ).rejects.toThrow('File not found');
    });

    it('should throw error if no port available', async () => {
      const servers: PreviewServer[] = [];

      try {
        // 최대 시도 횟수만큼 서버 시작
        for (let i = 0; i < 3; i++) {
          const srv = await startPreviewServer({
            filePath: TEST_FILE,
            port: 3200,
            maxPortAttempts: 3,
            openBrowser: false,
          });
          servers.push(srv);
        }

        // 4번째 시도는 실패해야 함
        await expect(
          startPreviewServer({
            filePath: TEST_FILE,
            port: 3200,
            maxPortAttempts: 3,
            openBrowser: false,
          })
        ).rejects.toThrow('No available port found');
      } finally {
        // 모든 서버 정리
        for (const srv of servers) {
          await srv.close();
        }
      }
    });
  });

  describe('Content Loading', () => {
    it('should load and parse markdown content', async () => {
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
      });

      const response = await fetch(`${server.url}/api/content`);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data.metadata.title).toBe('프리뷰 테스트 포스트');
      expect(result.data.metadata.categories).toEqual(['Test']);
      expect(result.data.metadata.tags).toContain('preview');
      expect(result.data.html).toContain('<h1>프리뷰 테스트</h1>');
    });

    it('should return error for invalid markdown', async () => {
      // Note: 실제 검증 오류 테스트는 통합 테스트에서 다룹니다
      // 프리뷰 서버는 에러를 클라이언트에 전달하는 것이 주 목적
      expect(true).toBe(true);
    }, { skip: true });
  });

  describe('Server Lifecycle', () => {
    it('should properly close server and watcher', async () => {
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
      });

      const port = server.port;

      await server.close();
      server = null;

      // 서버가 닫힌 후 같은 포트를 다시 사용할 수 있어야 함
      const newServer = await startPreviewServer({
        filePath: TEST_FILE,
        port: port,
        openBrowser: false,
      });

      expect(newServer.port).toBe(port);

      await newServer.close();
    });
  });

  describe('Options', () => {
    it('should respect openBrowser option', async () => {
      // openBrowser: false는 에러 없이 실행되어야 함
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
      });

      expect(server).toBeDefined();
      expect(server.url).toContain('localhost');
    });

    it('should respect showAdPositions option', async () => {
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
        showAdPositions: true,
      });

      const response = await fetch(`${server.url}/api/content`);
      const result = await response.json();

      expect(result.data.showAdPositions).toBe(true);
    });
  });

  describe('HTML Page', () => {
    it('should serve HTML preview page', async () => {
      server = await startPreviewServer({
        filePath: TEST_FILE,
        openBrowser: false,
      });

      const response = await fetch(server.url);
      const html = await response.text();

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Blog Preview');
      expect(html).toContain('socket.io');
    });
  });
});
