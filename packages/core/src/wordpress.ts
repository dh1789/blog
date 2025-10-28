/**
 * WordPress REST API 클라이언트
 */

import WPAPI from 'wpapi';
import type { WordPressConfig, PostMetadata, SeoData } from '@blog/shared';

export class WordPressClient {
  private wp: WPAPI;

  constructor(config: WordPressConfig) {
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
