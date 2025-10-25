/**
 * WordPress REST API 클라이언트
 */

import WPAPI from 'wpapi';
import type { WordPressConfig, PostMetadata } from '@blog/shared';

export class WordPressClient {
  private wp: WPAPI;

  constructor(config: WordPressConfig) {
    this.wp = new WPAPI({
      endpoint: `${config.url}/wp-json`,
      username: config.username,
      password: config.password,
    });
  }

  async createPost(metadata: PostMetadata, content: string): Promise<number> {
    try {
      const post = await this.wp.posts().create({
        title: metadata.title,
        content,
        slug: metadata.slug,
        excerpt: metadata.excerpt,
        status: metadata.status,
        categories: await this.getCategoryIds(metadata.categories || []),
        tags: await this.getTagIds(metadata.tags || []),
      });

      return post.id;
    } catch (error) {
      throw new Error(`Failed to create post: ${error}`);
    }
  }

  async updatePost(postId: number, metadata: PostMetadata, content: string): Promise<void> {
    try {
      await this.wp.posts().id(postId).update({
        title: metadata.title,
        content,
        slug: metadata.slug,
        excerpt: metadata.excerpt,
        status: metadata.status,
      });
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

  async uploadMedia(filePath: string): Promise<string> {
    try {
      const media = await this.wp.media().file(filePath).create();
      return media.source_url;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error}`);
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
