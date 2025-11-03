# Polylang 자동 언어 연결 구현 사양서

**작성일**: 2025-11-03
**목적**: Polylang 플러그인을 사용한 한영 포스트 자동 연결 기능 구현
**우선순위**: HIGH
**예상 구현 시간**: 2-3시간

---

## 📋 개요

### 현재 문제점

한국어와 영어 포스트를 발행한 후 WordPress 관리자에서 수동으로 연결해야 함:

1. WordPress 관리자 → Posts → All Posts
2. 한글 포스트 편집
3. Polylang 메타박스에서 영문 포스트 선택
4. 저장

**문제점**:
- 수작업으로 인한 시간 소요 및 실수 가능성
- Polylang UI가 직관적이지 않음
- 자동화 워크플로우 구축 불가능

### 목표

CLI 명령어로 Polylang 언어 연결을 자동화:

```bash
# 방법 1: 독립적인 연결 명령어
blog link-translations --ko 29 --en 26

# 방법 2: publish 명령어에 통합
blog publish content/posts/en/my-post.md --link-to 29

# 방법 3: 자동 매칭 (향후)
blog link-translations --auto
```

---

## 🔍 Polylang API 조사

### Polylang 데이터 구조

Polylang은 WordPress의 `post_meta`와 `term_taxonomy` 테이블을 사용하여 언어 정보를 저장합니다.

#### 1. 포스트 언어 정보

각 포스트는 `wp_term_relationships` 테이블을 통해 언어 term과 연결됩니다.

**테이블 구조**:
```sql
-- 언어 정보 (term_taxonomy)
wp_term_taxonomy
  - term_taxonomy_id
  - term_id (언어 코드: ko, en 등)
  - taxonomy = 'language'

-- 포스트-언어 연결 (term_relationships)
wp_term_relationships
  - object_id (post_id)
  - term_taxonomy_id (언어 term_taxonomy_id)
```

#### 2. 번역 관계 정보

번역 관계는 `pll_translations` custom taxonomy를 사용하여 저장됩니다.

**데이터 형식**:
```php
// term_description 필드에 직렬화된 배열 저장
array(
    'ko' => 29,  // 한국어 post ID
    'en' => 26   // 영어 post ID
)
```

---

## 🔧 구현 방안

### 방안 1: WordPress REST API 사용 (권장)

WordPress REST API를 통해 post meta를 업데이트합니다.

**장점**:
- 기존 `WordPressClient` 클래스 재사용
- REST API는 안정적이고 문서화가 잘 되어 있음
- 권한 관리 자동 처리

**단점**:
- Polylang이 REST API를 직접 지원하지 않을 수 있음
- Custom endpoint 필요할 수 있음

**구현 방법**:

1. **Polylang REST API 확인**

Polylang Pro는 REST API를 지원합니다:
```
GET /wp-json/pll/v1/posts/<post_id>
POST /wp-json/pll/v1/posts/<post_id>
```

무료 버전은 제한적이므로, 직접 meta 업데이트 방식 사용:

```typescript
// packages/core/src/wordpress.ts

async linkTranslations(
  koPostId: number,
  enPostId: number
): Promise<void> {
  try {
    // 1. 한국어 포스트에 영어 번역 연결
    await this.wp.posts().id(koPostId).update({
      meta: {
        pll_translations: JSON.stringify({
          ko: koPostId,
          en: enPostId
        })
      }
    });

    // 2. 영어 포스트에 한국어 원본 연결 (양방향)
    await this.wp.posts().id(enPostId).update({
      meta: {
        pll_translations: JSON.stringify({
          ko: koPostId,
          en: enPostId
        })
      }
    });

    console.log(`✅ 언어 연결 완료: 한글(${koPostId}) ↔ 영문(${enPostId})`);
  } catch (error) {
    throw new Error(`Failed to link translations: ${error}`);
  }
}
```

2. **CLI 명령어 구현**

```typescript
// packages/cli/src/commands/link-translations.ts

import { WordPressClient } from '@blog/core';
import { loadConfig } from '../utils/config';

export interface LinkTranslationsOptions {
  ko: string;   // 한글 post ID
  en: string;   // 영문 post ID
  auto?: boolean;  // 자동 매칭 (향후)
}

export async function linkTranslationsCommand(options: LinkTranslationsOptions) {
  const spinner = ora('Polylang 언어 연결 중...').start();

  try {
    // 설정 로드
    const config = loadConfig();
    const wp = new WordPressClient(config);

    // Post ID 파싱
    const koId = parseInt(options.ko, 10);
    const enId = parseInt(options.en, 10);

    if (isNaN(koId) || isNaN(enId)) {
      spinner.fail(chalk.red('잘못된 Post ID입니다.'));
      process.exit(1);
    }

    // 언어 연결
    await wp.linkTranslations(koId, enId);

    spinner.succeed(chalk.green('언어 연결 완료!'));

    console.log(chalk.cyan('\n=== 연결 결과 ==='));
    console.log(`한글 포스트: ID ${koId}`);
    console.log(`영문 포스트: ID ${enId}`);
    console.log(`\nWordPress 관리자에서 확인하세요:`);
    console.log(`${config.url}/wp-admin/post.php?post=${koId}&action=edit`);

  } catch (error) {
    spinner.fail(chalk.red('언어 연결 실패'));
    console.error(chalk.red(`\n오류: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}
```

3. **명령어 등록**

```typescript
// packages/cli/src/index.ts

import { linkTranslationsCommand } from './commands/link-translations';

program
  .command('link-translations')
  .description('Polylang 언어 연결 (한글 ↔ 영문)')
  .requiredOption('--ko <id>', '한국어 포스트 ID')
  .requiredOption('--en <id>', '영어 포스트 ID')
  .option('--auto', '자동 매칭 (slug 기반, 향후 구현)')
  .action(linkTranslationsCommand);
```

---

### 방안 2: publish 명령어에 통합

영문 포스트 발행 시 즉시 연결합니다.

**장점**:
- 워크플로우가 더 간결함
- 별도 명령어 실행 불필요
- 실수 방지

**단점**:
- publish 명령어가 복잡해짐
- 한글 post ID를 반드시 기억해야 함

**구현 방법**:

```typescript
// packages/cli/src/commands/publish.ts

interface PublishOptions {
  draft: boolean;
  language: 'ko' | 'en';
  dryRun: boolean;
  linkTo?: string;  // 연결할 포스트 ID (영문 발행 시 사용)
}

export async function publishCommand(file: string, options: PublishOptions) {
  // ... 기존 발행 로직 ...

  const postId = await wp.createPost(metadata, htmlContent, seoData);

  // 언어 연결 (영문 포스트이고 --link-to 옵션이 있는 경우)
  if (metadata.language === 'en' && options.linkTo) {
    const koPostId = parseInt(options.linkTo, 10);
    if (!isNaN(koPostId)) {
      spinner.text = 'Polylang 언어 연결 중...';
      await wp.linkTranslations(koPostId, postId);
      console.log(chalk.green(`\n✅ 언어 연결 완료: 한글(${koPostId}) ↔ 영문(${postId})`));
    }
  }

  // ...
}
```

**사용 예시**:
```bash
# 1. 한글 발행
blog publish content/posts/ko/my-post.md
# ✔ 포스트 발행 완료! (ID: 29)

# 2. 영문 발행 + 자동 연결
blog publish content/posts/en/my-post.md --link-to 29
# ✔ 포스트 발행 완료! (ID: 26)
# ✅ 언어 연결 완료: 한글(29) ↔ 영문(26)
```

---

### 방안 3: 자동 매칭 (향후 구현)

Slug 또는 파일명 기반으로 자동 매칭합니다.

**장점**:
- 완전 자동화
- 사용자 입력 최소화

**단점**:
- 구현 복잡도 높음
- WordPress API로 한글 포스트 검색 필요
- 매칭 실패 가능성

**구현 방법**:

```typescript
async function autoLinkTranslations(enPostId: number, originalSlug: string): Promise<void> {
  // 1. slug로 한국어 포스트 검색
  const posts = await wp.posts().param('slug', originalSlug).param('lang', 'ko');

  if (posts.length === 0) {
    console.warn('⚠️  매칭되는 한국어 포스트를 찾을 수 없습니다.');
    return;
  }

  const koPostId = posts[0].id;

  // 2. 언어 연결
  await wp.linkTranslations(koPostId, enPostId);
}
```

---

## 🧪 테스트 계획

### 1. 단위 테스트

```typescript
// packages/core/src/wordpress.test.ts

describe('WordPressClient.linkTranslations', () => {
  it('should link Korean and English posts', async () => {
    const wp = new WordPressClient(config);

    await wp.linkTranslations(29, 26);

    // 연결 확인: 한글 포스트의 meta 확인
    const koPost = await wp.posts().id(29);
    expect(koPost.meta.pll_translations).toContain('en');
  });

  it('should throw error for invalid post IDs', async () => {
    const wp = new WordPressClient(config);

    await expect(wp.linkTranslations(9999, 26)).rejects.toThrow();
  });
});
```

### 2. 통합 테스트

```bash
# 1. 한글 포스트 발행
blog publish content/posts/ko/test-post.md
# → Post ID: 100

# 2. 영문 포스트 발행
blog publish content/posts/en/test-post.md
# → Post ID: 101

# 3. 언어 연결
blog link-translations --ko 100 --en 101

# 4. WordPress에서 확인
# - Posts → All Posts
# - 한글 포스트 옆에 영문 포스트 링크 표시 확인
# - 실제 페이지에서 언어 전환 버튼 작동 확인
```

### 3. 에러 케이스 테스트

```bash
# 존재하지 않는 Post ID
blog link-translations --ko 9999 --en 26
# → 에러 메시지 출력, 명확한 안내

# 잘못된 ID 형식
blog link-translations --ko abc --en 26
# → "잘못된 Post ID입니다" 에러

# 이미 연결된 포스트
blog link-translations --ko 29 --en 26
# → 기존 연결 덮어쓰기 (경고 메시지)
```

---

## 🚨 주의사항

### 1. Polylang 버전 호환성

Polylang Free vs Pro:
- **Free**: REST API 제한적, meta 직접 업데이트 필요
- **Pro**: REST API 완벽 지원

**확인 필요**:
```bash
# WordPress에서 Polylang 버전 확인
wp-admin → Plugins → Polylang
```

현재 사용 중인 버전에 맞게 구현 방법 선택.

### 2. Meta 필드 이름

Polylang 버전에 따라 meta 필드 이름이 다를 수 있음:
- `pll_translations`
- `_pll_translations`
- 다른 커스텀 필드

**확인 방법**:
```bash
# WordPress DB에서 직접 확인
SELECT * FROM wp_postmeta WHERE post_id = 29 AND meta_key LIKE '%pll%';
```

### 3. 권한 문제

WordPress Application Password가 meta 업데이트 권한을 가져야 함.

**확인**:
- WordPress 사용자 역할: Administrator
- Application Password 권한: edit_posts, edit_published_posts

### 4. 양방향 연결

한글 → 영문, 영문 → 한글 양방향으로 meta를 업데이트해야 Polylang이 올바르게 인식합니다.

---

## 📊 구현 우선순위 및 일정

### Phase 1: 기본 구현 (2-3시간)

- [ ] `WordPressClient.linkTranslations()` 메서드 구현
- [ ] Polylang meta 필드 조사 (WordPress DB 확인)
- [ ] 단위 테스트 작성
- [ ] `blog link-translations` CLI 명령어 구현
- [ ] 통합 테스트

### Phase 2: 통합 개선 (1-2시간)

- [ ] `publish` 명령어에 `--link-to` 옵션 추가
- [ ] 에러 처리 및 검증 강화
- [ ] 사용자 피드백 개선 (진행 상태, 성공 메시지)

### Phase 3: 자동화 (향후)

- [ ] 자동 매칭 기능 (`--auto`)
- [ ] 배치 연결 기능 (여러 포스트 동시 연결)
- [ ] 연결 검증 및 복구 기능

---

## 🔗 참고 자료

### Polylang 문서
- [Polylang Developer Documentation](https://polylang.pro/documentation/documentation-for-developers/)
- [Polylang Functions Reference](https://polylang.pro/doc/function-reference/)

### WordPress REST API
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Post Meta Fields](https://developer.wordpress.org/rest-api/reference/posts/#update-a-post)

### 관련 파일
- `packages/core/src/wordpress.ts`: WordPress API 클라이언트
- `packages/cli/src/commands/publish.ts`: Publish 명령어
- `ISSUES.md`: 이슈 [WF-001]
- `WORKFLOW-GUIDE.md`: 권장 워크플로우

---

## ✅ 체크리스트

### 구현 전 준비
- [ ] WordPress Polylang 플러그인 버전 확인
- [ ] Polylang meta 필드 이름 확인 (DB 조회)
- [ ] WordPress Application Password 권한 확인
- [ ] 테스트용 한영 포스트 준비

### 구현 중
- [ ] `linkTranslations()` 메서드 구현
- [ ] 양방향 연결 확인 (한글 → 영문, 영문 → 한글)
- [ ] 에러 처리 (존재하지 않는 ID, 권한 오류 등)
- [ ] CLI 명령어 구현 및 테스트

### 구현 후
- [ ] WordPress 관리자에서 연결 확인
- [ ] 실제 페이지에서 언어 전환 테스트
- [ ] 문서 업데이트 (ISSUES.md, WORKFLOW-GUIDE.md)
- [ ] README.md에 새 명령어 추가

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-11-03
**구현 상태**: 📋 설계 완료, 구현 대기
