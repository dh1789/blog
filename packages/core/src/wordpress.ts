/**
 * WordPress REST API 클라이언트
 */

import WPAPI from 'wpapi';
import type { WordPressConfig, PostMetadata, SeoData } from '@blog/shared';

export class WordPressClient {
  private wp: WPAPI;
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
    this.wp = new WPAPI({
      endpoint: `${config.url}/wp-json`,
      username: config.username,
      password: config.password,
    });
  }

  async createPost(
    metadata: PostMetadata,
    content: string,
    seoData?: SeoData
  ): Promise<number> {
    try {
      const postData: Record<string, unknown> = {
        title: metadata.title,
        content,
        slug: seoData?.slug || metadata.slug,
        excerpt: metadata.excerpt,
        status: metadata.status,
        lang: metadata.language, // Polylang 언어 코드
        categories: await this.getCategoryIds(metadata.categories || []),
        tags: await this.getTagIds(metadata.tags || []),
      };

      // SEO 메타 데이터 추가
      if (seoData) {
        postData.meta = {
          // 커스텀 SEO 필드 (하위 호환성)
          _seo_title: seoData.meta.title,
          _seo_description: seoData.meta.description,
          _seo_keywords: seoData.meta.keywords.join(', '),
          _seo_canonical: seoData.meta.canonical,
          _seo_robots: seoData.meta.robots,
          _og_title: seoData.openGraph['og:title'],
          _og_description: seoData.openGraph['og:description'],
          _og_type: seoData.openGraph['og:type'],
          _og_url: seoData.openGraph['og:url'],
          _og_image: seoData.openGraph['og:image'],
          _og_locale: seoData.openGraph['og:locale'],
          _og_site_name: seoData.openGraph['og:site_name'],
          _twitter_card: seoData.twitterCard['twitter:card'],
          _twitter_title: seoData.twitterCard['twitter:title'],
          _twitter_description: seoData.twitterCard['twitter:description'],
          _twitter_image: seoData.twitterCard['twitter:image'],
          _twitter_site: seoData.twitterCard['twitter:site'],
          _twitter_creator: seoData.twitterCard['twitter:creator'],
          // Rank Math SEO 플러그인 필드
          rank_math_title: seoData.meta.title,
          rank_math_description: seoData.meta.description,
          rank_math_focus_keyword: seoData.meta.keywords.join(', '),
          rank_math_robots: [seoData.meta.robots],
        };
      }

      const post = await this.wp.posts().create(postData);

      return post.id;
    } catch (error) {
      throw new Error(`Failed to create post: ${error}`);
    }
  }

  async updatePost(
    postId: number,
    metadata: PostMetadata,
    content: string,
    seoData?: SeoData
  ): Promise<void> {
    try {
      const postData: Record<string, unknown> = {
        title: metadata.title,
        content,
        slug: seoData?.slug || metadata.slug,
        excerpt: metadata.excerpt,
        status: metadata.status,
        lang: metadata.language, // Polylang 언어 코드
      };

      // SEO 메타 데이터 추가
      if (seoData) {
        postData.meta = {
          // 커스텀 SEO 필드 (하위 호환성)
          _seo_title: seoData.meta.title,
          _seo_description: seoData.meta.description,
          _seo_keywords: seoData.meta.keywords.join(', '),
          _seo_canonical: seoData.meta.canonical,
          _seo_robots: seoData.meta.robots,
          _og_title: seoData.openGraph['og:title'],
          _og_description: seoData.openGraph['og:description'],
          _og_type: seoData.openGraph['og:type'],
          _og_url: seoData.openGraph['og:url'],
          _og_image: seoData.openGraph['og:image'],
          _og_locale: seoData.openGraph['og:locale'],
          _og_site_name: seoData.openGraph['og:site_name'],
          _twitter_card: seoData.twitterCard['twitter:card'],
          _twitter_title: seoData.twitterCard['twitter:title'],
          _twitter_description: seoData.twitterCard['twitter:description'],
          _twitter_image: seoData.twitterCard['twitter:image'],
          _twitter_site: seoData.twitterCard['twitter:site'],
          _twitter_creator: seoData.twitterCard['twitter:creator'],
          // Rank Math SEO 플러그인 필드
          rank_math_title: seoData.meta.title,
          rank_math_description: seoData.meta.description,
          rank_math_focus_keyword: seoData.meta.keywords.join(', '),
          rank_math_robots: [seoData.meta.robots],
        };
      }

      await this.wp.posts().id(postId).update(postData);
    } catch (error) {
      throw new Error(`Failed to update post ${postId}: ${error}`);
    }
  }

  async deletePost(postId: number): Promise<void> {
    try {
      await this.wp.posts().id(postId).delete({ force: true });
    } catch (error) {
      throw new Error(`Failed to delete post ${postId}: ${error}`);
    }
  }

  async listPosts(options: {
    status?: 'publish' | 'draft' | 'all';
    limit?: number;
  } = {}): Promise<Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    date: string;
  }>> {
    try {
      const { status = 'all', limit = 10 } = options;

      let query = this.wp.posts().perPage(limit);

      if (status !== 'all') {
        query = query.param('status', status);
      } else {
        query = query.param('status', ['publish', 'draft', 'pending', 'private']);
      }

      const posts = await query;

      return posts.map((post: any) => ({
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        status: post.status,
        date: post.date,
      }));
    } catch (error) {
      throw new Error(`Failed to list posts: ${error}`);
    }
  }

  async uploadMedia(filePath: string, title?: string, alt?: string): Promise<{
    id: number;
    url: string;
  }> {
    try {
      const mediaData: Record<string, unknown> = {};

      if (title) {
        mediaData.title = title;
      }

      if (alt) {
        mediaData.alt_text = alt;
      }

      const media = await this.wp.media().file(filePath).create(mediaData);

      return {
        id: media.id,
        url: media.source_url,
      };
    } catch (error) {
      throw new Error(`Failed to upload media: ${error}`);
    }
  }

  async setFeaturedImage(postId: number, mediaId: number): Promise<void> {
    try {
      await this.wp.posts().id(postId).update({
        featured_media: mediaId,
      });
    } catch (error) {
      throw new Error(`Failed to set featured image: ${error}`);
    }
  }

  /**
   * Polylang 다국어 포스트 연결
   * 한국어와 영어 포스트를 양방향으로 연결합니다.
   *
   * ⚠️ 주의: Polylang REST API 기능은 Pro 버전에서만 공식 지원됩니다.
   * 무료 버전 사용자는 WordPress에 Polylang REST API Helper 플러그인을 설치해야 합니다.
   * 플러그인 위치: /wordpress-plugin/polylang-rest-api-helper.php
   *
   * @param koPostId - 한국어 포스트 ID
   * @param enPostId - 영어 포스트 ID
   * @throws {Error} 포스트가 존재하지 않거나 연결에 실패한 경우
   *
   * @example
   * ```typescript
   * await wp.linkTranslations(29, 26);
   * // 한국어 포스트(29)와 영어 포스트(26)가 연결됩니다
   * ```
   */
  async linkTranslations(
    koPostId: number,
    enPostId: number
  ): Promise<void> {
    try {
      // Polylang REST API Helper 플러그인의 커스텀 endpoint 사용
      const response = await fetch(
        `${this.config.url}/wp-json/polylang-helper/v1/link-translations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(
              `${this.config.username}:${this.config.password}`
            ).toString('base64'),
          },
          body: JSON.stringify({
            ko_post_id: koPostId,
            en_post_id: enPostId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        // 플러그인이 설치되지 않은 경우 (404)
        if (response.status === 404) {
          throw new Error(
            '❌ Polylang REST API Helper 플러그인이 설치되지 않았습니다.\n' +
            '\n' +
            '해결 방법:\n' +
            '1. /wordpress-plugin/polylang-rest-api-helper.php 파일을\n' +
            '2. WordPress 서버의 wp-content/plugins/ 디렉토리에 업로드\n' +
            '3. WordPress 관리자에서 플러그인 활성화\n' +
            '\n' +
            '자세한 설명: /wordpress-plugin/README.md 참고'
          );
        }

        // Polylang이 활성화되지 않은 경우
        if (error.code === 'polylang_not_active') {
          throw new Error(
            '❌ Polylang 플러그인이 활성화되지 않았습니다.\n' +
            'WordPress 관리자 → 플러그인에서 Polylang을 활성화하세요.'
          );
        }

        // 포스트가 존재하지 않는 경우
        if (error.code === 'invalid_ko_post' || error.code === 'invalid_en_post') {
          throw new Error(`❌ ${error.message}`);
        }

        throw new Error(`Failed to link translations: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // 성공 메시지
      console.log(`✅ 언어 연결 완료: 한글(${koPostId}) ↔ 영문(${enPostId})`);
      console.log(`   - 한글: ${data.data.ko_post.title}`);
      console.log(`   - 영문: ${data.data.en_post.title}`);
    } catch (error: any) {
      // 네트워크 에러나 기타 예외
      if (error.message.includes('플러그인')) {
        throw error; // 플러그인 관련 에러는 그대로 전달
      }

      throw new Error(`Failed to link translations: ${error.message || error}`);
    }
  }

  private async getCategoryIds(categories: string[]): Promise<number[]> {
    const ids: number[] = [];
    for (const cat of categories) {
      const existing = await this.wp.categories().search(cat);
      if (existing.length > 0) {
        ids.push(existing[0].id);
      } else {
        const created = await this.wp.categories().create({ name: cat });
        ids.push(created.id);
      }
    }
    return ids;
  }

  private async getTagIds(tags: string[]): Promise<number[]> {
    const ids: number[] = [];
    for (const tag of tags) {
      const existing = await this.wp.tags().search(tag);
      if (existing.length > 0) {
        ids.push(existing[0].id);
      } else {
        const created = await this.wp.tags().create({ name: tag });
        ids.push(created.id);
      }
    }
    return ids;
  }
}
