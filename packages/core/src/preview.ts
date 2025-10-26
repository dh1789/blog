/**
 * 프리뷰 서버 - Express + Socket.io + Live Reload
 */

import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { watch } from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import { parseMarkdownFile } from './markdown.js';
import open from 'open';

export interface PreviewServerOptions {
  /** 마크다운 파일 경로 */
  filePath: string;
  /** 시작 포트 (기본: 3000) */
  port?: number;
  /** 최대 포트 시도 횟수 (기본: 10) */
  maxPortAttempts?: number;
  /** 자동으로 브라우저 열기 (기본: true) */
  openBrowser?: boolean;
  /** 광고 삽입 위치 표시 (기본: false) */
  showAdPositions?: boolean;
}

export interface PreviewServer {
  /** 서버 URL */
  url: string;
  /** 실제 사용 중인 포트 */
  port: number;
  /** 서버 중지 */
  close: () => Promise<void>;
}

/**
 * 프리뷰 서버 시작
 */
export async function startPreviewServer(
  options: PreviewServerOptions
): Promise<PreviewServer> {
  const {
    filePath,
    port: startPort = 3000,
    maxPortAttempts = 10,
    openBrowser = true,
    showAdPositions = false,
  } = options;

  // 파일 존재 확인
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // 포트 찾기
  const port = await findAvailablePort(startPort, maxPortAttempts);

  // Express 앱 생성
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer);

  // 파일 감시자 설정
  const watcher = watch(filePath, {
    persistent: true,
    ignoreInitial: true,
  });

  // 정적 파일 제공
  app.use(express.static('public'));

  // 메인 페이지
  app.get('/', (_req: Request, res: Response) => {
    res.send(generatePreviewHtml(showAdPositions));
  });

  // 콘텐츠 API
  app.get('/api/content', async (_req: Request, res: Response) => {
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const parsed = await parseMarkdownFile(fileContent);

      res.json({
        success: true,
        data: {
          metadata: parsed.metadata,
          html: parsed.htmlContent,
          showAdPositions,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Socket.io 연결
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // 파일 변경 감지
  watcher.on('change', async (path) => {
    console.log(`File changed: ${path}`);
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const parsed = await parseMarkdownFile(fileContent);

      io.emit('content-updated', {
        metadata: parsed.metadata,
        html: parsed.htmlContent,
        showAdPositions,
      });
    } catch (error) {
      console.error('Error processing file change:', error);
      io.emit('error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // 서버 시작
  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, () => {
      resolve();
    });
    httpServer.on('error', reject);
  });

  const url = `http://localhost:${port}`;
  console.log(`Preview server started at ${url}`);

  // 브라우저 열기
  if (openBrowser) {
    try {
      await open(url);
    } catch (error) {
      console.warn('Failed to open browser:', error);
    }
  }

  // 서버 중지 함수
  const close = async (): Promise<void> => {
    await watcher.close();
    io.close();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    console.log('Preview server stopped');
  };

  return {
    url,
    port,
    close,
  };
}

/**
 * 사용 가능한 포트 찾기
 */
async function findAvailablePort(
  startPort: number,
  maxAttempts: number
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await checkPortAvailable(port);
    if (isAvailable) {
      return port;
    }
  }
  throw new Error(
    `No available port found between ${startPort} and ${startPort + maxAttempts - 1}`
  );
}

/**
 * 포트 사용 가능 여부 확인
 */
function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * 프리뷰 HTML 생성
 */
function generatePreviewHtml(showAdPositions: boolean): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      min-height: 100vh;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .header {
      padding: 20px 0;
      border-bottom: 2px solid #eee;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
      color: #222;
    }

    .metadata {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      color: #666;
      font-size: 0.9rem;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .categories, .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category, .tag {
      padding: 4px 12px;
      background: #e3f2fd;
      border-radius: 16px;
      font-size: 0.85rem;
      color: #1976d2;
    }

    .tag {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .content {
      margin-top: 30px;
    }

    .content h1 {
      font-size: 1.8rem;
      margin: 30px 0 15px;
      color: #222;
    }

    .content h2 {
      font-size: 1.5rem;
      margin: 25px 0 12px;
      color: #333;
    }

    .content h3 {
      font-size: 1.3rem;
      margin: 20px 0 10px;
      color: #444;
    }

    .content p {
      margin: 15px 0;
      line-height: 1.8;
    }

    .content ul, .content ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    .content li {
      margin: 8px 0;
    }

    .content pre {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      margin: 15px 0;
    }

    .content code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .content pre code {
      background: transparent;
      padding: 0;
    }

    .content blockquote {
      border-left: 4px solid #ddd;
      padding-left: 15px;
      margin: 15px 0;
      color: #666;
    }

    .ad-position {
      border: 2px dashed #ff5722;
      background: rgba(255, 87, 34, 0.05);
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      color: #ff5722;
      font-weight: bold;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }

    .status-bar {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      font-size: 0.9rem;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .status-bar.show {
      opacity: 1;
    }

    .status-bar.error {
      background: #f44336;
    }

    @media (max-width: 768px) {
      .container {
        padding: 15px;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .content h1 {
        font-size: 1.5rem;
      }

      .content h2 {
        font-size: 1.3rem;
      }

      .content h3 {
        font-size: 1.1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="app">
      <div class="loading">Loading preview...</div>
    </div>
  </div>

  <div id="status-bar" class="status-bar"></div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const app = document.getElementById('app');
    const statusBar = document.getElementById('status-bar');
    const showAdPositions = ${showAdPositions};

    // 초기 콘텐츠 로드
    loadContent();

    // Socket.io 이벤트
    socket.on('content-updated', (data) => {
      console.log('Content updated');
      renderContent(data);
      showStatus('Updated', false);
    });

    socket.on('error', (data) => {
      console.error('Error:', data.message);
      showError(data.message);
      showStatus('Error', true);
    });

    socket.on('connect', () => {
      console.log('Connected to preview server');
      showStatus('Connected', false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from preview server');
      showStatus('Disconnected', true);
    });

    // 초기 콘텐츠 로드
    async function loadContent() {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success) {
          renderContent(result.data);
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError('Failed to load content: ' + error.message);
      }
    }

    // 콘텐츠 렌더링
    function renderContent(data) {
      const { metadata, html } = data;

      let contentHtml = html;

      // 광고 위치 표시
      if (showAdPositions) {
        contentHtml = insertAdPositions(contentHtml);
      }

      app.innerHTML = \`
        <div class="header">
          <h1>\${escapeHtml(metadata.title)}</h1>
          <div class="metadata">
            <div class="metadata-item">
              <strong>Status:</strong> \${metadata.status || 'draft'}
            </div>
            <div class="metadata-item">
              <strong>Language:</strong> \${metadata.language || 'ko'}
            </div>
          </div>
          <div class="metadata">
            <div class="metadata-item">
              <strong>Categories:</strong>
              <div class="categories">
                \${metadata.categories.map(cat => \`<span class="category">\${escapeHtml(cat)}</span>\`).join('')}
              </div>
            </div>
          </div>
          <div class="metadata">
            <div class="metadata-item">
              <strong>Tags:</strong>
              <div class="tags">
                \${metadata.tags.map(tag => \`<span class="tag">\${escapeHtml(tag)}</span>\`).join('')}
              </div>
            </div>
          </div>
          <div class="metadata">
            <p><strong>Excerpt:</strong> \${escapeHtml(metadata.excerpt)}</p>
          </div>
        </div>
        <div class="content">
          \${contentHtml}
        </div>
      \`;
    }

    // 광고 위치 삽입
    function insertAdPositions(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const paragraphs = doc.querySelectorAll('p');

      if (paragraphs.length >= 3) {
        // 상단 광고 (첫 번째 문단 후)
        insertAdMarker(paragraphs[0], 'top');

        // 중간 광고 (중간 문단)
        const middleIndex = Math.floor(paragraphs.length / 2);
        insertAdMarker(paragraphs[middleIndex], 'middle');

        // 하단 광고 (마지막 문단 후)
        insertAdMarker(paragraphs[paragraphs.length - 1], 'bottom');
      }

      return doc.body.innerHTML;
    }

    // 광고 마커 삽입
    function insertAdMarker(element, position) {
      const marker = document.createElement('div');
      marker.className = 'ad-position';
      marker.textContent = \`광고 위치: \${position.toUpperCase()}\`;
      element.after(marker);
    }

    // HTML 이스케이프
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // 에러 표시
    function showError(message) {
      app.innerHTML = \`
        <div class="error">
          <strong>Error:</strong> \${escapeHtml(message)}
        </div>
      \`;
    }

    // 상태 표시
    function showStatus(message, isError = false) {
      statusBar.textContent = message;
      statusBar.className = 'status-bar show' + (isError ? ' error' : '');
      setTimeout(() => {
        statusBar.classList.remove('show');
      }, 3000);
    }
  </script>
</body>
</html>`;
}
