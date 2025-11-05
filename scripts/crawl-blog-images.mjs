/**
 * 블로그 이미지 전략 벤치마크 크롤러
 *
 * 목적: SEO 상위 블로그들의 이미지 사용 전략 분석
 * - 포스트당 평균 이미지 개수
 * - 이미지 크기 (width × height)
 * - 파일 크기 및 포맷 (WebP, PNG, JPG)
 */

import https from 'https';
import { writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

// 크롤링 대상 블로그 리스트
const TARGET_BLOGS = [
  {
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com',
    articleSelector: 'article.post',
    imageSelector: 'img',
    postsToSample: 20
  },
  {
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com',
    articleSelector: 'article',
    imageSelector: 'img',
    postsToSample: 20
  },
  {
    name: 'A List Apart',
    url: 'https://alistapart.com',
    articleSelector: 'article',
    imageSelector: 'img',
    postsToSample: 20
  }
];

/**
 * URL에서 HTML 가져오기
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * 이미지 메타데이터 추출
 */
function extractImageMetadata(imgElement) {
  const src = imgElement.src || imgElement.getAttribute('data-src') || '';

  // 외부 URL만 (base64, SVG 제외)
  if (!src.startsWith('http') || src.includes('data:image')) {
    return null;
  }

  return {
    src,
    width: imgElement.width || parseInt(imgElement.getAttribute('width')) || null,
    height: imgElement.height || parseInt(imgElement.getAttribute('height')) || null,
    format: src.split('.').pop().split('?')[0].toLowerCase() || 'unknown',
    alt: imgElement.alt || '',
  };
}

/**
 * 단일 포스트 분석
 */
async function analyzePost(url, imageSelector) {
  try {
    console.log(`  분석 중: ${url}`);
    const html = await fetchHTML(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // 모든 이미지 추출
    const images = Array.from(document.querySelectorAll(imageSelector))
      .map(extractImageMetadata)
      .filter(Boolean);

    return {
      url,
      imageCount: images.length,
      images: images.slice(0, 10), // 처음 10개만 저장 (데이터 크기 제한)
      wordCount: document.body.textContent.split(/\s+/).length,
    };
  } catch (error) {
    console.error(`  실패: ${url} - ${error.message}`);
    return null;
  }
}

/**
 * 블로그 크롤링
 */
async function crawlBlog(blog) {
  console.log(`\n=== ${blog.name} 크롤링 시작 ===`);

  try {
    // 메인 페이지에서 포스트 링크 추출
    const html = await fetchHTML(blog.url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const articleLinks = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && href.startsWith('http') && href.includes(blog.url))
      .filter((href, index, self) => self.indexOf(href) === index) // 중복 제거
      .slice(0, Math.min(5, blog.postsToSample)); // 테스트용 5개만

    console.log(`  포스트 ${articleLinks.length}개 발견`);

    // 각 포스트 분석
    const results = [];
    for (const link of articleLinks) {
      const result = await analyzePost(link, blog.imageSelector);
      if (result) {
        results.push(result);
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      blog: blog.name,
      url: blog.url,
      totalPosts: results.length,
      posts: results,
    };
  } catch (error) {
    console.error(`  ${blog.name} 크롤링 실패: ${error.message}`);
    return null;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('블로그 이미지 벤치마크 크롤링 시작...\n');

  const results = [];

  for (const blog of TARGET_BLOGS) {
    const result = await crawlBlog(blog);
    if (result) {
      results.push(result);
    }
  }

  // 결과 저장
  const outputPath = 'data/benchmark-crawl-results.json';
  writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ 크롤링 완료!`);
  console.log(`결과 저장: ${outputPath}`);

  // 간단한 통계
  const totalPosts = results.reduce((sum, r) => sum + r.totalPosts, 0);
  const totalImages = results.flatMap(r => r.posts).reduce((sum, p) => sum + p.imageCount, 0);
  const avgImagesPerPost = totalImages / totalPosts;

  console.log(`\n=== 통계 요약 ===`);
  console.log(`분석한 블로그: ${results.length}개`);
  console.log(`분석한 포스트: ${totalPosts}개`);
  console.log(`총 이미지: ${totalImages}개`);
  console.log(`포스트당 평균 이미지: ${avgImagesPerPost.toFixed(2)}개`);
}

main().catch(console.error);
