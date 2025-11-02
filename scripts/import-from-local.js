#!/usr/bin/env node
/**
 * 로컬 WordPress에서 포스트를 가져와 beomanro.com에 발행하는 스크립트
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 로컬 WordPress에서 가져올 포스트 slug 목록
const POST_SLUGS = [
  'node-js-cli-dogu-gaebal-ibmun-commander-jswa-typescriptro-namanyi-myeongryeongjul-dogu-mandeulgi-2',
  'wordpress-rest-api-node-jsro-jadong-balhaeng-siseutem-gucughagi-kontenceu-jadonghwayi-sijag-2',
  'ai-kontenceu-saengseongbuteo-wordpress-balhaengggaji-wanjeon-jadonghwa-paipeurain-gucughagi-3'
];

const LOCAL_WP_URL = 'http://blog-local-test.local';

/**
 * HTTP GET 요청
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON 파싱 실패: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * HTML을 마크다운 형식으로 간단히 정리
 */
function htmlToMarkdown(html) {
  // HTML 태그 제거 및 엔티티 디코딩
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
    // Google AdSense 광고 코드 제거
    .replace(/<!-- Google AdSense -->[\s\S]*?<\/script>/gi, '')
    .replace(/<ins class="adsbygoogle"[\s\S]*?<\/script>/gi, '')
    // HTML 엔티티 디코딩
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    // 나머지 HTML 태그 제거
    .replace(/<[^>]+>/g, '')
    // 3개 이상의 연속 줄바꿈을 2개로 축소
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return md;
}

/**
 * 로컬 WordPress에서 포스트 가져오기
 */
async function fetchPost(slug) {
  const url = `${LOCAL_WP_URL}/wp-json/wp/v2/posts?slug=${slug}`;
  console.log(`📥 포스트 가져오는 중: ${slug}`);

  const posts = await httpGet(url);

  if (!posts || posts.length === 0) {
    throw new Error(`포스트를 찾을 수 없습니다: ${slug}`);
  }

  return posts[0];
}

/**
 * WordPress API에서 카테고리/태그 이름 가져오기
 */
async function getCategoryNames(ids) {
  if (!ids || ids.length === 0) return [];

  const names = [];
  for (const id of ids) {
    try {
      const url = `${LOCAL_WP_URL}/wp-json/wp/v2/categories/${id}`;
      const cat = await httpGet(url);
      names.push(cat.name);
    } catch (e) {
      console.warn(`카테고리 ${id} 가져오기 실패:`, e.message);
    }
  }
  return names;
}

async function getTagNames(ids) {
  if (!ids || ids.length === 0) return [];

  const names = [];
  for (const id of ids) {
    try {
      const url = `${LOCAL_WP_URL}/wp-json/wp/v2/tags/${id}`;
      const tag = await httpGet(url);
      names.push(tag.name);
    } catch (e) {
      console.warn(`태그 ${id} 가져오기 실패:`, e.message);
    }
  }
  return names;
}

/**
 * 마크다운 파일 생성
 */
async function createMarkdownFile(post) {
  const title = post.title.rendered;
  const content = htmlToMarkdown(post.content.rendered);
  const excerpt = post.excerpt.rendered ? htmlToMarkdown(post.excerpt.rendered) : '';
  const slug = post.slug;

  // 카테고리와 태그 이름 가져오기
  const categories = await getCategoryNames(post.categories);
  const tags = await getTagNames(post.tags);

  // Frontmatter 생성
  const frontmatter = `---
title: "${title}"
slug: "${slug}"
excerpt: "${excerpt}"
status: "publish"
categories:
${categories.map(c => `  - "${c}"`).join('\n')}
tags:
${tags.map(t => `  - "${t}"`).join('\n')}
language: "ko"
---

`;

  const markdown = frontmatter + content;

  // 파일 저장
  const filename = `${slug.substring(0, 100)}.md`;
  const filepath = path.join(__dirname, '..', 'content', 'posts', 'ko', filename);

  fs.writeFileSync(filepath, markdown, 'utf-8');
  console.log(`✅ 마크다운 파일 생성: ${filename}`);

  return filepath;
}

/**
 * beomanro.com에 포스트 발행
 */
async function publishPost(filepath) {
  console.log(`🚀 beomanro.com에 발행 중: ${path.basename(filepath)}`);

  const cmd = `node packages/cli/dist/index.mjs publish "${filepath}"`;
  const { stdout, stderr } = await execAsync(cmd, {
    cwd: path.join(__dirname, '..')
  });

  if (stderr) {
    console.error('stderr:', stderr);
  }
  console.log(stdout);
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🎯 로컬 WordPress → beomanro.com 자동 이전 시작\n');

  for (const slug of POST_SLUGS) {
    try {
      // 1. 로컬 WordPress에서 포스트 가져오기
      const post = await fetchPost(slug);

      // 2. 마크다운 파일 생성
      const filepath = await createMarkdownFile(post);

      // 3. beomanro.com에 발행
      await publishPost(filepath);

      console.log(`\n✅ 완료: ${post.title.rendered}\n`);
      console.log('---\n');

    } catch (error) {
      console.error(`❌ 오류 발생 (${slug}):`, error.message);
      console.log('---\n');
    }
  }

  console.log('\n🎉 모든 포스트 이전 완료!');
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
});
