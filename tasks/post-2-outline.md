# 블로그 포스트 #2 개요

## 기본 정보

**제목**: WordPress REST API + Node.js로 자동 발행 시스템 구축하기

**Slug**: `wordpress-rest-api-nodejs-automation`

**타겟 단어 수**: 2500-3000 단어

**언어**: 한국어 (ko)

**포스트 #1과의 관계**:
- 포스트 #1: Claude API로 블로그 초안 생성
- 포스트 #2: 생성된 초안을 WordPress에 자동 발행 (연결편)

---

## SEO 전략

### 메인 키워드
- WordPress REST API
- Node.js 자동화
- WordPress 자동 발행
- TypeScript WordPress

### 서브 키워드
- WordPress Application Password
- REST API 인증
- 마크다운 WordPress 변환
- 프론트매터 메타데이터
- 미디어 자동 업로드

### 타겟 독자
- Node.js/TypeScript 개발자
- WordPress 블로거
- 콘텐츠 자동화에 관심 있는 개발자
- 마크다운 기반 워크플로우 사용자

---

## 포스트 구조 (8개 주요 섹션)

### 1. 서론 (300단어)
**목적**: 문제 제기 및 독자 관심 유도

**내용**:
- 문제 정의: "AI로 초안 생성했는데, 수동으로 WordPress에 복붙하나요?"
- 해결책 제시: WordPress REST API + Node.js 자동화
- 포스트 #1 연결: "이전 포스트에서 Claude API로 초안을 생성했다면..."
- 이 글에서 얻을 것:
  - WordPress REST API 이해
  - Node.js로 자동 발행 시스템 구축
  - 마크다운 → HTML 변환 및 메타데이터 처리
  - 이미지 자동 업로드

**후킹 요소**:
- 통계: "수동 발행 시간 15분 → 자동화로 1분"
- 실제 동작하는 코드 제공

### 2. WordPress REST API 이해하기 (400단어)
**목적**: WordPress REST API의 기본 개념 설명

**내용**:

#### 2.1 WordPress REST API란?
- WordPress 4.7부터 기본 내장
- HTTP 요청으로 WordPress 데이터 조작
- JSON 형식 데이터 교환
- 플러그인 없이 사용 가능

#### 2.2 왜 REST API를 사용해야 할까?
- 웹 인터페이스 없이 프로그래밍 방식으로 제어
- CI/CD 파이프라인 통합 가능
- 다중 플랫폼 동시 발행 (WordPress, Ghost 등)
- Git 기반 워크플로우와 통합

#### 2.3 REST API vs XML-RPC vs GraphQL
비교표:
| 특징 | REST API | XML-RPC | GraphQL |
|------|----------|---------|---------|
| 기본 내장 | ✅ (4.7+) | ✅ (레거시) | ❌ (플러그인) |
| 보안 | Application Password | 기본 인증 | 복잡 |
| 학습 곡선 | 낮음 | 중간 | 높음 |
| 커뮤니티 지원 | 높음 | 낮음 | 중간 |

**권장**: REST API (공식 지원, 보안, 간단함)

#### 2.4 주요 엔드포인트
```
GET    /wp-json/wp/v2/posts          # 포스트 목록
POST   /wp-json/wp/v2/posts          # 포스트 생성
GET    /wp-json/wp/v2/posts/{id}     # 포스트 조회
PUT    /wp-json/wp/v2/posts/{id}     # 포스트 수정
DELETE /wp-json/wp/v2/posts/{id}     # 포스트 삭제
POST   /wp-json/wp/v2/media          # 미디어 업로드
GET    /wp-json/wp/v2/categories     # 카테고리 목록
GET    /wp-json/wp/v2/tags           # 태그 목록
```

### 3. WordPress 인증 설정 (500단어)
**목적**: Application Password 설정 및 인증 방법 설명

**내용**:

#### 3.1 인증 방법 비교
- **Basic Authentication**: 개발용, 프로덕션 부적합
- **OAuth 2.0**: 복잡, 타사 앱용
- **Application Password**: ⭐ 권장 (WordPress 5.6+)
- **JWT Token**: 플러그인 필요

#### 3.2 Application Password 설정하기 (단계별 가이드)

**Step 1: WordPress 버전 확인**
```bash
# WordPress 대시보드 → 업데이트
# 필요: WordPress 5.6 이상
```

**Step 2: 사용자 프로필에서 생성**
1. WordPress 관리자 로그인
2. 사용자 → 프로필 편집
3. "Application Passwords" 섹션으로 스크롤
4. 애플리케이션 이름 입력 (예: "Blog Automation CLI")
5. "새 Application Password 추가" 클릭
6. 생성된 비밀번호 복사 (공백 포함, 한 번만 표시됨)

**Step 3: 비밀번호 안전하게 저장**
```bash
# .env 파일 생성
cat > .env << 'EOF'
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
EOF

# .gitignore에 추가
echo ".env" >> .gitignore
```

**Step 4: 인증 테스트**
```bash
# curl로 테스트
curl -X GET \
  --user "username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  https://your-blog.com/wp-json/wp/v2/posts
```

#### 3.3 보안 모범 사례
- ✅ Application Password를 Git에 커밋하지 않기
- ✅ 각 애플리케이션마다 별도의 비밀번호 사용
- ✅ 사용하지 않는 비밀번호는 즉시 취소
- ✅ HTTPS 사용 필수 (평문 전송 방지)
- ✅ IP 제한 (가능한 경우)

#### 3.4 문제 해결
- 403 Forbidden: 플러그인이나 방화벽이 REST API 차단 (Wordfence 등)
- 401 Unauthorized: 비밀번호 오류 (공백 포함 확인)
- 404 Not Found: WordPress 버전이 5.6 미만

### 4. Node.js 프로젝트 설정 (400단어)
**목적**: TypeScript 프로젝트 초기 설정

**내용**:

#### 4.1 프로젝트 구조
```
wordpress-publisher/
├── src/
│   ├── wordpress.ts       # WordPress 클라이언트
│   ├── markdown.ts        # 마크다운 변환기
│   ├── publish.ts         # 발행 로직
│   └── cli.ts             # CLI 진입점
├── .env                   # 환경 변수
├── package.json
└── tsconfig.json
```

#### 4.2 초기 설정
```bash
# 프로젝트 생성
mkdir wordpress-publisher && cd wordpress-publisher
pnpm init

# 의존성 설치
pnpm add axios form-data
pnpm add -D typescript @types/node tsx

# TypeScript 설정
npx tsc --init --target ES2020 --module NodeNext --moduleResolution NodeNext
```

#### 4.3 package.json 설정
```json
{
  "name": "wordpress-publisher",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/cli.ts",
    "build": "tsc",
    "start": "node dist/cli.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

#### 4.4 왜 axios? fetch vs axios 비교
| 특징 | axios | fetch |
|------|-------|-------|
| 기본 제공 | ❌ npm 설치 | ✅ Node.js 18+ |
| Basic Auth | ✅ 내장 | ❌ 수동 처리 |
| FormData | ✅ 간편 | ⚠️ 복잡 |
| 에러 처리 | ✅ 4xx/5xx 자동 | ❌ 수동 체크 |
| TypeScript | ✅ 우수 | ✅ 우수 |

**권장**: axios (편의성 > 번들 크기)

### 5. WordPress 클라이언트 구현 (600단어)
**목적**: 실제 동작하는 WordPress API 클라이언트 코드 제공

**내용**:

#### 5.1 기본 클라이언트 구현
```typescript
// src/wordpress.ts
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';

export interface WordPressConfig {
  url: string;           // https://your-blog.com
  username: string;      // WordPress 사용자명
  appPassword: string;   // Application Password
}

export interface PostData {
  title: string;
  content: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
  excerpt?: string;
  featured_media?: number;
}

export class WordPressClient {
  private api: AxiosInstance;

  constructor(config: WordPressConfig) {
    this.api = axios.create({
      baseURL: `${config.url}/wp-json/wp/v2`,
      auth: {
        username: config.username,
        password: config.appPassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 포스트 생성
   */
  async createPost(data: PostData): Promise<number> {
    try {
      const response = await this.api.post('/posts', data);
      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to create post: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 포스트 업데이트
   */
  async updatePost(postId: number, data: Partial<PostData>): Promise<void> {
    try {
      await this.api.put(`/posts/${postId}`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to update post: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 미디어 업로드
   */
  async uploadMedia(filePath: string, title?: string): Promise<number> {
    try {
      const form = new FormData();
      form.append('file', createReadStream(filePath));
      if (title) {
        form.append('title', title);
      }

      const response = await this.api.post('/media', form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to upload media: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 카테고리 조회 또는 생성
   */
  async getOrCreateCategory(name: string): Promise<number> {
    try {
      // 기존 카테고리 검색
      const response = await this.api.get('/categories', {
        params: { search: name },
      });

      if (response.data.length > 0) {
        return response.data[0].id;
      }

      // 없으면 생성
      const createResponse = await this.api.post('/categories', { name });
      return createResponse.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get/create category: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * 태그 조회 또는 생성
   */
  async getOrCreateTag(name: string): Promise<number> {
    try {
      const response = await this.api.get('/tags', {
        params: { search: name },
      });

      if (response.data.length > 0) {
        return response.data[0].id;
      }

      const createResponse = await this.api.post('/tags', { name });
      return createResponse.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get/create tag: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}
```

#### 5.2 에러 처리 패턴
- axios.isAxiosError() 타입 가드 사용
- 에러 메시지를 WordPress 응답에서 추출
- 명확한 에러 메시지 제공

#### 5.3 사용 예제
```typescript
// 클라이언트 초기화
const wp = new WordPressClient({
  url: process.env.WORDPRESS_URL!,
  username: process.env.WORDPRESS_USERNAME!,
  appPassword: process.env.WORDPRESS_APP_PASSWORD!,
});

// 포스트 발행
const postId = await wp.createPost({
  title: '내 첫 자동 발행 포스트',
  content: '<p>Hello World!</p>',
  status: 'publish',
});

console.log(`포스트 발행 완료! ID: ${postId}`);
```

### 6. 마크다운 변환 및 메타데이터 처리 (500단어)
**목적**: 마크다운 파일을 WordPress 포맷으로 변환

**내용**:

#### 6.1 마크다운 → HTML 변환
```typescript
// src/markdown.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import matter from 'gray-matter';
import { readFileSync } from 'fs';

export interface PostMetadata {
  title: string;
  slug?: string;
  excerpt?: string;
  categories?: string[];
  tags?: string[];
  status?: 'publish' | 'draft';
  featured_image?: string;
}

export interface ParsedPost {
  metadata: PostMetadata;
  htmlContent: string;
}

export async function parseMarkdownFile(filePath: string): Promise<ParsedPost> {
  // 1. 파일 읽기
  const fileContent = readFileSync(filePath, 'utf-8');

  // 2. Frontmatter 파싱
  const { data, content } = matter(fileContent);

  // 3. 마크다운 → HTML 변환
  const result = await unified()
    .use(remarkParse)              // 마크다운 파싱
    .use(remarkGfm)                // GitHub Flavored Markdown (표, 체크박스 등)
    .use(remarkRehype)             // 마크다운 → HTML AST 변환
    .use(rehypeStringify)          // HTML 문자열화
    .process(content);

  const htmlContent = String(result);

  return {
    metadata: data as PostMetadata,
    htmlContent,
  };
}
```

**설치 필요 패키지**:
```bash
pnpm add unified remark-parse remark-gfm remark-rehype rehype-stringify gray-matter
```

#### 6.2 Frontmatter 예제
```markdown
---
title: "WordPress 자동 발행 테스트"
slug: "wordpress-auto-publish-test"
excerpt: "Node.js로 WordPress에 자동으로 포스트를 발행하는 방법"
categories:
  - "개발"
  - "자동화"
tags:
  - "WordPress"
  - "Node.js"
  - "REST API"
status: "draft"
featured_image: "./images/featured.jpg"
---

# 본문 시작

여기에 마크다운 내용...
```

#### 6.3 메타데이터 검증
```typescript
import { z } from 'zod';

const PostMetadataSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['publish', 'draft', 'pending', 'private']).default('draft'),
  featured_image: z.string().optional(),
});

// 사용
const validatedMetadata = PostMetadataSchema.parse(data);
```

#### 6.4 이미지 경로 처리
```typescript
/**
 * 상대 경로 이미지를 절대 경로로 변환
 */
function resolveImagePath(markdownFilePath: string, imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath; // 이미 절대 URL
  }

  // 상대 경로 해결
  const markdownDir = path.dirname(markdownFilePath);
  return path.resolve(markdownDir, imagePath);
}
```

### 7. 통합: 전체 발행 워크플로우 (400단어)
**목적**: 모든 요소를 통합한 완전한 발행 시스템

**내용**:

#### 7.1 발행 함수 구현
```typescript
// src/publish.ts
import { WordPressClient } from './wordpress';
import { parseMarkdownFile } from './markdown';
import path from 'path';

export interface PublishOptions {
  markdownFile: string;
  dryRun?: boolean;
}

export async function publishToWordPress(
  client: WordPressClient,
  options: PublishOptions
): Promise<number | null> {
  console.log(`📄 마크다운 파일 파싱 중: ${options.markdownFile}`);

  // 1. 마크다운 파싱
  const { metadata, htmlContent } = await parseMarkdownFile(options.markdownFile);

  console.log(`✅ 파싱 완료`);
  console.log(`   제목: ${metadata.title}`);
  console.log(`   상태: ${metadata.status || 'draft'}`);

  // 2. Featured Image 업로드 (있으면)
  let featuredMediaId: number | undefined;
  if (metadata.featured_image) {
    console.log(`🖼️  Featured Image 업로드 중...`);
    const imagePath = path.resolve(
      path.dirname(options.markdownFile),
      metadata.featured_image
    );
    featuredMediaId = await client.uploadMedia(imagePath, metadata.title);
    console.log(`✅ 이미지 업로드 완료 (ID: ${featuredMediaId})`);
  }

  // 3. 카테고리 ID 변환
  const categoryIds: number[] = [];
  if (metadata.categories) {
    console.log(`📂 카테고리 처리 중...`);
    for (const categoryName of metadata.categories) {
      const id = await client.getOrCreateCategory(categoryName);
      categoryIds.push(id);
    }
    console.log(`✅ 카테고리: ${metadata.categories.join(', ')}`);
  }

  // 4. 태그 ID 변환
  const tagIds: number[] = [];
  if (metadata.tags) {
    console.log(`🏷️  태그 처리 중...`);
    for (const tagName of metadata.tags) {
      const id = await client.getOrCreateTag(tagName);
      tagIds.push(id);
    }
    console.log(`✅ 태그: ${metadata.tags.join(', ')}`);
  }

  // 5. Dry-run 모드 체크
  if (options.dryRun) {
    console.log(`\n🔍 [Dry-run 모드] 실제 발행하지 않습니다.`);
    console.log(`\n포스트 데이터 미리보기:`);
    console.log(JSON.stringify({
      title: metadata.title,
      status: metadata.status || 'draft',
      categories: categoryIds,
      tags: tagIds,
      featured_media: featuredMediaId,
      content_length: htmlContent.length,
    }, null, 2));
    return null;
  }

  // 6. WordPress에 포스트 생성
  console.log(`\n🚀 WordPress에 포스트 발행 중...`);
  const postId = await client.createPost({
    title: metadata.title,
    content: htmlContent,
    status: metadata.status || 'draft',
    categories: categoryIds,
    tags: tagIds,
    excerpt: metadata.excerpt,
    featured_media: featuredMediaId,
  });

  console.log(`\n✅ 발행 완료!`);
  console.log(`   포스트 ID: ${postId}`);
  console.log(`   상태: ${metadata.status || 'draft'}`);

  return postId;
}
```

#### 7.2 CLI 진입점
```typescript
// src/cli.ts
import { Command } from 'commander';
import { WordPressClient } from './wordpress';
import { publishToWordPress } from './publish';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('wp-publish')
  .description('WordPress 자동 발행 도구')
  .version('1.0.0');

program
  .command('publish')
  .description('마크다운 파일을 WordPress에 발행')
  .argument('<file>', '마크다운 파일 경로')
  .option('--dry-run', '실제 발행하지 않고 미리보기만')
  .action(async (file: string, options) => {
    try {
      // WordPress 클라이언트 초기화
      const client = new WordPressClient({
        url: process.env.WORDPRESS_URL!,
        username: process.env.WORDPRESS_USERNAME!,
        appPassword: process.env.WORDPRESS_APP_PASSWORD!,
      });

      // 발행
      const postId = await publishToWordPress(client, {
        markdownFile: file,
        dryRun: options.dryRun,
      });

      if (postId) {
        console.log(`\n🎉 성공! WordPress에서 확인하세요.`);
      }
    } catch (error) {
      console.error(`\n❌ 오류 발생:`, error);
      process.exit(1);
    }
  });

program.parse();
```

#### 7.3 실행 예제
```bash
# 초안으로 발행
npm run dev publish ./posts/my-post.md

# Dry-run으로 미리보기
npm run dev publish ./posts/my-post.md --dry-run

# 빌드 후 실행
npm run build
node dist/cli.js publish ./posts/my-post.md
```

### 8. 고급 활용 및 문제 해결 (400단어)
**목적**: 실무 팁, 문제 해결, 확장 가능성

**내용**:

#### 8.1 이미지 자동 최적화
```typescript
import sharp from 'sharp';

async function optimizeImage(inputPath: string): Promise<Buffer> {
  return await sharp(inputPath)
    .resize(1200, 630, { fit: 'cover' })  // Featured image 크기
    .jpeg({ quality: 85 })                // 품질 85%
    .toBuffer();
}
```

#### 8.2 배치 발행
```typescript
async function batchPublish(files: string[]) {
  for (const file of files) {
    console.log(`\n처리 중: ${file}`);
    await publishToWordPress(client, { markdownFile: file });

    // 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

#### 8.3 에러 복구
```typescript
async function publishWithRetry(
  client: WordPressClient,
  options: PublishOptions,
  maxRetries = 3
): Promise<number | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await publishToWordPress(client, options);
    } catch (error) {
      console.error(`시도 ${i + 1}/${maxRetries} 실패:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return null;
}
```

#### 8.4 문제 해결 가이드

**문제 1: 403 Forbidden**
```
원인: REST API가 차단됨
해결:
1. Settings → Permalinks에서 "Post name" 선택
2. 보안 플러그인 (Wordfence 등) REST API 허용 설정
3. .htaccess 확인
```

**문제 2: 이미지 업로드 실패**
```
원인: 파일 권한 또는 크기 제한
해결:
1. WordPress 업로드 디렉토리 권한 확인 (wp-content/uploads)
2. php.ini에서 upload_max_filesize 확인
3. 이미지 사전 압축 (sharp 사용)
```

**문제 3: HTML 깨짐**
```
원인: 특수 문자 인코딩 문제
해결:
1. UTF-8 인코딩 확인
2. HTML 엔티티 이스케이프
3. WordPress의 wpautop 필터 이해 (자동 <p> 태그)
```

#### 8.5 다음 단계: 확장 아이디어
1. **Git 연동**: Git hook으로 commit 시 자동 발행
2. **CI/CD 통합**: GitHub Actions로 배포 자동화
3. **다중 블로그 지원**: 여러 WordPress 사이트 동시 발행
4. **포스트 업데이트**: 기존 포스트 감지 및 업데이트
5. **SEO 플러그인 연동**: Yoast SEO, Rank Math API 통합

---

## 결론 (200단어)
**목적**: 핵심 요약 및 행동 유도

**내용**:
- 주요 학습 내용 요약:
  1. WordPress REST API 이해
  2. Application Password 인증
  3. Node.js로 자동 발행 시스템 구축
  4. 마크다운 → WordPress 변환
  5. 실무 문제 해결

- 독자가 얻은 것:
  - ✅ 완전히 동작하는 발행 시스템
  - ✅ 수동 작업 90% 감소 (15분 → 1분)
  - ✅ Git 기반 워크플로우 통합
  - ✅ 확장 가능한 아키텍처

- 행동 유도 (CTA):
  - "오늘 바로 첫 자동 발행을 시도해보세요!"
  - GitHub 저장소 공유 (전체 코드)
  - 댓글로 질문 환영

- 다음 포스트 예고:
  - "마크다운 기반 블로그 워크플로우 최적화"
  - "AI 블로그 자동화로 수익 만들기"

---

## 추가 리소스

**공식 문서**:
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Application Passwords Documentation](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)

**예제 코드**:
- 이 프로젝트의 GitHub 저장소 (전체 코드 공개)

**관련 도구**:
- [axios](https://axios-http.com/)
- [unified](https://unifiedjs.com/)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)

---

## 메타 정보

**예상 작성 시간**: 2-3시간 (코드 작성 + 테스트 + 검증)

**난이도**: 중상 (Node.js/TypeScript 중급 수준 필요)

**선수 지식**:
- Node.js 기본
- TypeScript 기본
- REST API 개념
- WordPress 사용 경험

**테스트 체크리스트**:
- [ ] 모든 코드 예제가 실제로 작동하는지 확인
- [ ] WordPress REST API 엔드포인트 정확성 검증
- [ ] Application Password 생성 단계 정확성 확인
- [ ] 에러 케이스 테스트 (403, 401, 404)
- [ ] 이미지 업로드 테스트
- [ ] 한글 포스트 인코딩 테스트
