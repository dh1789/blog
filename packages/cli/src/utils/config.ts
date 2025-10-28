/**
 * 설정 파일 로드
 */

import { config as loadEnv } from 'dotenv';
import type { WordPressConfig, AdConfig } from '@blog/shared';
import { WordPressConfigSchema, AdConfigSchema } from '@blog/shared';

loadEnv();

export interface AppConfig {
  wordpress: WordPressConfig;
  ads: AdConfig;
}

export async function loadConfig(): Promise<AppConfig> {
  const wordpress = WordPressConfigSchema.parse({
    url: process.env.WORDPRESS_URL,
    username: process.env.WORDPRESS_USERNAME,
    password: process.env.WORDPRESS_APP_PASSWORD,
  });

  const ads = AdConfigSchema.parse({
    clientId: process.env.ADSENSE_CLIENT_ID || '',
    slotId: process.env.ADSENSE_SLOT_ID || '',
    positions: ['after-first-h2', 'middle'],
  });

  return { wordpress, ads };
}

export function loadWordPressConfig(): WordPressConfig {
  return WordPressConfigSchema.parse({
    url: process.env.WORDPRESS_URL,
    username: process.env.WORDPRESS_USERNAME,
    password: process.env.WORDPRESS_APP_PASSWORD,
  });
}
