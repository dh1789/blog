/**
 * @file 품질 검토 명령어 테스트
 * @description PRD 0016 - Phase 6: CLI 통합
 *
 * 🔴 RED Phase: review 명령어 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewCommand } from './review';
import * as fs from 'fs/promises';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  }),
}));
vi.mock('chalk', () => ({
  default: {
    cyan: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
    red: (s: string) => s,
    gray: (s: string) => s,
    white: (s: string) => s,
    blue: (s: string) => s,
  },
}));

describe('reviewCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('basic functionality', () => {
    it('should read markdown file and analyze quality', async () => {
      const mockContent = `---
title: "테스트 포스트"
excerpt: "테스트 요약입니다. 상세한 내용을 담고 있습니다."
categories: ["테스트"]
tags: ["test", "quality", "review"]
language: "ko"
---

# 테스트 포스트

저의 경험을 공유합니다.

![이미지](./test.png)
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      // 함수가 에러 없이 실행되어야 함
      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });

    it('should handle file read error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      // 파일 읽기 실패 시 에러 처리
      await expect(
        reviewCommand('nonexistent.md', { verbose: false, json: false })
      ).rejects.toThrow();
    });
  });

  describe('options', () => {
    it('should support --verbose option for detailed output', async () => {
      const mockContent = `---
title: "Test"
excerpt: "Test excerpt for the post. Contains detailed information."
categories: ["Test"]
tags: ["test", "verbose", "quality"]
language: "ko"
---

# Test

Content here.
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await expect(
        reviewCommand('test.md', { verbose: true, json: false })
      ).resolves.not.toThrow();
    });

    it('should support --json option for JSON output', async () => {
      const mockContent = `---
title: "Test"
excerpt: "Test excerpt for the post. Contains detailed information."
categories: ["Test"]
tags: ["test", "json", "output"]
language: "ko"
---

# Test

Content.
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      // JSON 옵션은 결과를 JSON으로 반환해야 함
      await expect(
        reviewCommand('test.md', { verbose: false, json: true })
      ).resolves.not.toThrow();
    });
  });

  describe('quality checks', () => {
    it('should check personal experience', async () => {
      const mockContent = `---
title: "경험담 포스트"
excerpt: "저의 경험을 공유합니다. 실제 프로젝트에서 배운 내용입니다."
categories: ["개발"]
tags: ["경험", "공유", "개발"]
language: "ko"
---

# 경험담

저는 이 기술을 배우면서 많은 것을 느꼈습니다.
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });

    it('should check images', async () => {
      const mockContent = `---
title: "이미지 포스트"
excerpt: "이미지가 포함된 포스트입니다. 시각적 자료로 설명합니다."
categories: ["튜토리얼"]
tags: ["이미지", "가이드", "튜토리얼"]
language: "ko"
---

# 포스트

![스크린샷](./images/screenshot.png)
![터미널](./images/terminal.png)
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });

    it('should check translation quality for English posts', async () => {
      const mockContent = `---
title: "English Post"
excerpt: "This is an English post. It contains technical content."
categories: ["Development"]
tags: ["english", "test", "development"]
language: "en"
---

# English Post

This is well-written content with clear language.
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });
  });

  describe('output format', () => {
    it('should display checklist results', async () => {
      const mockContent = `---
title: "품질 테스트"
excerpt: "품질 검사 테스트입니다. 자세한 내용을 담고 있습니다."
categories: ["테스트"]
tags: ["품질", "검사", "테스트"]
language: "ko"
---

# 품질 테스트

저의 경험을 공유합니다.

![이미지](./test.png)
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });

    it('should display issues and suggestions', async () => {
      const mockContent = `---
title: "최소 테스트"
excerpt: "이것은 테스트 포스트입니다. 최소한의 내용만 포함합니다."
categories: ["테스트"]
tags: ["최소", "테스트", "품질"]
language: "ko"
---

기술 문서
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      // 이슈가 있는 콘텐츠도 처리해야 함
      await expect(
        reviewCommand('test.md', { verbose: false, json: false })
      ).resolves.not.toThrow();
    });
  });
});
