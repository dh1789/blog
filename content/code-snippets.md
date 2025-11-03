# 재사용 가능한 코드 예제 라이브러리

**목적**: 자주 사용하는 코드 스니펫을 모아 빠른 작성 지원
**최종 업데이트**: 2025-11-03

---

## 📦 Node.js / TypeScript

### TypeScript 설정 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup 빌드 설정
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

### package.json (CLI 도구)
```json
{
  "name": "@username/cli-tool",
  "version": "1.0.0",
  "description": "CLI 도구 설명",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "bin": {
    "mytool": "dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "test": "vitest"
  },
  "keywords": ["cli", "tool"],
  "license": "MIT"
}
```

### Commander.js 기본 구조
```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('mytool')
  .description('CLI 도구 설명')
  .version('1.0.0');

program
  .command('create <filename>')
  .description('파일 생성')
  .option('-c, --content <text>', '파일 내용')
  .action((filename: string, options: { content?: string }) => {
    console.log(`Creating ${filename}...`);
  });

program.parse(process.argv);
```

### Zod 스키마 검증
```typescript
import { z } from 'zod';

const PostMetadataSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  status: z.enum(['publish', 'draft']),
  language: z.enum(['ko', 'en']),
});

type PostMetadata = z.infer<typeof PostMetadataSchema>;
```

---

## 🌐 WordPress REST API

### WordPress 클라이언트 인증
```typescript
import axios from 'axios';

const wpClient = axios.create({
  baseURL: 'https://example.com/wp-json/wp/v2',
  auth: {
    username: process.env.WORDPRESS_USERNAME!,
    password: process.env.WORDPRESS_APP_PASSWORD!,
  },
});
```

### 포스트 생성
```typescript
interface CreatePostData {
  title: string;
  content: string;
  status: 'publish' | 'draft';
  categories: number[];
  tags: number[];
}

async function createPost(data: CreatePostData) {
  const response = await wpClient.post('/posts', {
    title: data.title,
    content: data.content,
    status: data.status,
    categories: data.categories,
    tags: data.tags,
  });
  return response.data;
}
```

### Rank Math SEO 메타 설정
```typescript
const postData = {
  title: 'Post Title',
  content: '<p>Post content</p>',
  meta: {
    rank_math_title: 'SEO Title',
    rank_math_description: 'SEO Description',
    rank_math_focus_keyword: 'keyword1, keyword2',
    rank_math_robots: ['index', 'follow'],
  },
};
```

---

## 🐧 Bash / Shell

### UFW 방화벽 설정
```bash
# UFW 방화벽 활성화
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
ufw status
```

### WordOps 설치 및 WordPress 생성
```bash
# WordOps 설치
wget -qO wo wops.cc && sudo bash wo

# WordPress + Redis + SSL 사이트 생성
wo site create example.com --wp --redis --letsencrypt
```

### npm 배포
```bash
# 빌드 및 테스트
npm run build
npm test

# 버전 업데이트
npm version patch  # 1.0.0 → 1.0.1

# 배포
npm publish --access public

# 배포 확인
npm view @username/package version
```

### Git 작업
```bash
# 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 변경사항 커밋
git add .
git commit -m "feat: Add new feature"

# 원격 저장소 푸시
git push origin feature/new-feature
```

---

## 🎨 Nginx

### Cloudflare SSL 설정
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/example.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/example.com.key;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### WordPress Nginx 설정
```nginx
# WordPress 퍼머링크 지원
location / {
    try_files $uri $uri/ /index.php?$args;
}

# PHP 처리
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

# 정적 파일 캐싱
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔧 GitHub Actions

### npm 자동 배포
```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### WordPress 배포
```yaml
name: Deploy to WordPress

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - name: Publish to WordPress
        env:
          WORDPRESS_URL: ${{ secrets.WORDPRESS_URL }}
          WORDPRESS_USERNAME: ${{ secrets.WORDPRESS_USERNAME }}
          WORDPRESS_APP_PASSWORD: ${{ secrets.WORDPRESS_APP_PASSWORD }}
        run: |
          node packages/cli/dist/index.mjs publish content/posts/ko/*.md
```

---

## 📊 Markdown 형식

### 비교표
```markdown
| 기능 | 옵션 A | 옵션 B | 추천 |
|------|--------|--------|------|
| 가격 | $10/월 | $20/월 | 옵션 A |
| 성능 | 중 | 고 | 옵션 B |
| 지원 | 제한적 | 완전 | 옵션 B |
```

### 체크리스트
```markdown
### 설치 체크리스트

- [ ] Node.js 20+ 설치
- [ ] pnpm 설치
- [ ] 프로젝트 클론
- [ ] 의존성 설치 (`pnpm install`)
- [ ] 환경 변수 설정 (`.env`)
- [ ] 빌드 (`pnpm build`)
```

### 코드 블록 (다양한 언어)
````markdown
```typescript
// TypeScript 코드
```

```javascript
// JavaScript 코드
```

```bash
# Bash 명령어
```

```json
// JSON 설정
```

```nginx
# Nginx 설정
```

```yaml
# YAML 설정
```
````

---

## 🎯 사용 가이드

### 복사 방법
1. 필요한 코드 스니펫 찾기
2. 복사하여 포스트에 붙여넣기
3. 실제 값으로 수정 (example.com, username 등)
4. 반드시 실행 테스트 후 발행

### 주의사항
- **언어 태그 필수**: 모든 코드 블록에 언어 지정
- **주석 추가**: 복잡한 코드는 설명 주석 포함
- **실제 값 교체**: 예제 값을 실제 값으로 변경
- **테스트 필수**: 복사-붙여넣기로 즉시 동작 확인

---

**다음 업데이트 예정**:
- React/Vue 컴포넌트 예제
- Docker 설정
- Python 스크립트
- SQL 쿼리
