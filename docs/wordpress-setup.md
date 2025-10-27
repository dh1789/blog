# WordPress 설정 가이드

@blog/cli와 WordPress를 연동하기 위한 상세 설정 가이드입니다.

## 📚 목차

- [WordPress 요구사항](#wordpress-요구사항)
- [REST API 활성화](#rest-api-활성화)
- [Application Password 생성](#application-password-생성)
- [환경 변수 설정](#환경-변수-설정)
- [Google AdSense 설정](#google-adsense-설정)
- [Avada 테마 설정](#avada-테마-설정)
- [권장 플러그인](#권장-플러그인)
- [보안 설정](#보안-설정)
- [연결 테스트](#연결-테스트)

---

## WordPress 요구사항

@blog/cli를 사용하려면 다음 요구사항을 충족해야 합니다:

### 필수 요구사항

- **WordPress 버전**: 5.6 이상 (REST API 지원)
- **PHP 버전**: 7.4 이상
- **HTTPS**: SSL 인증서 설치 권장 (Application Password 사용 시 필수)
- **REST API**: 활성화 필요 (기본적으로 활성화됨)

### 권장 사항

- **WordPress 버전**: 최신 버전 (6.0+)
- **테마**: Avada 테마 (최적화됨)
- **호스팅**: 안정적인 호스팅 (WP Engine, Kinsta, SiteGround 등)
- **백업**: 정기적인 백업 설정

---

## REST API 활성화

WordPress REST API는 기본적으로 활성화되어 있지만, 일부 보안 플러그인이 차단할 수 있습니다.

### 1. REST API 활성화 확인

브라우저에서 다음 URL에 접속합니다:

```
https://your-blog.com/wp-json/
```

정상적이라면 JSON 응답을 볼 수 있습니다:

```json
{
  "name": "Your Blog Name",
  "description": "Just another WordPress site",
  "url": "https://your-blog.com",
  "home": "https://your-blog.com",
  "namespaces": [
    "oembed/1.0",
    "wp/v2",
    ...
  ]
}
```

### 2. REST API가 차단된 경우

**원인 1: 보안 플러그인**

일부 보안 플러그인이 REST API를 차단할 수 있습니다:

- Wordfence
- iThemes Security
- All In One WP Security

**해결 방법:**
1. 플러그인 설정에서 REST API 차단 해제
2. 또는 특정 IP (개발 환경)만 허용

**Wordfence 예시:**
```
Wordfence → Firewall → Rate Limiting
→ "Disable REST API for non-logged in users" 옵션 끄기
```

**원인 2: .htaccess 규칙**

`.htaccess` 파일에 REST API 차단 규칙이 있을 수 있습니다.

**해결 방법:**
```apache
# .htaccess 파일에서 다음과 같은 규칙 제거 또는 주석 처리
# RewriteRule ^wp-json/(.*)$ - [F,L]
```

### 3. REST API 활성화 플러그인 (대안)

REST API가 완전히 비활성화된 경우, 플러그인으로 활성화:

- **플러그인 이름**: "Disable REST API"의 반대 설정
- 또는 `functions.php`에 코드 추가:

```php
// functions.php
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }
    return true;
});
```

---

## Application Password 생성

@blog/cli는 WordPress Application Password를 사용하여 인증합니다.

> **중요**: Application Password는 WordPress 5.6+에서만 사용 가능합니다.

### 1. Application Password 기능 확인

WordPress 관리자 페이지 로그인:

```
https://your-blog.com/wp-admin
```

**사용자 → 프로필** 메뉴로 이동하여 페이지 하단으로 스크롤합니다.

**"Application Passwords"** 섹션이 보이면 사용 가능합니다.

### 2. Application Password 생성

1. **New Application Password Name** 필드에 이름 입력:
   ```
   blog-cli
   ```

2. **Add New Application Password** 버튼 클릭

3. 생성된 비밀번호 복사:
   ```
   xxxx xxxx xxxx xxxx xxxx xxxx
   ```

   > **중요**: 이 비밀번호는 한 번만 표시됩니다. 반드시 안전한 곳에 저장하세요.

4. 공백을 제거하여 `.env` 파일에 저장:
   ```
   WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Application Password가 보이지 않는 경우

**원인 1: HTTPS 미사용**

Application Password는 HTTPS 사이트에서만 활성화됩니다.

**해결 방법:**
- SSL 인증서 설치 (Let's Encrypt 무료)
- 또는 로컬 개발 환경에서 강제 활성화:

```php
// wp-config.php에 추가
define('WP_ENVIRONMENT_TYPE', 'local');
```

**원인 2: 플러그인 충돌**

일부 보안 플러그인이 Application Password를 비활성화할 수 있습니다.

**해결 방법:**
1. 보안 플러그인 일시 비활성화
2. Application Password 생성
3. 보안 플러그인 재활성화

**원인 3: 사용자 권한 부족**

Application Password는 관리자 권한이 필요합니다.

**해결 방법:**
- 관리자 계정으로 로그인
- 또는 사용자에게 관리자 권한 부여

### 4. Application Password 테스트

생성한 Application Password를 테스트합니다:

```bash
curl -u "your-username:xxxxxxxxxxxxxxxxxxxx" \
  https://your-blog.com/wp-json/wp/v2/users/me
```

정상적이라면 사용자 정보가 JSON으로 반환됩니다.

---

## 환경 변수 설정

`.env` 파일에 WordPress 연결 정보를 설정합니다.

### 1. .env 파일 생성

프로젝트 루트에서:

```bash
cp .env.example .env
```

### 2. WordPress 연결 정보 입력

```env
# WordPress 연결 (필수)
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxx
```

**설정 항목 설명:**

| 항목 | 설명 | 예시 |
|------|------|------|
| `WORDPRESS_URL` | WordPress 사이트 URL (프로토콜 포함) | `https://blog.example.com` |
| `WORDPRESS_USERNAME` | WordPress 사용자 이름 (관리자) | `admin` 또는 `your-email@example.com` |
| `WORDPRESS_APP_PASSWORD` | Application Password (공백 제거) | `xxxxxxxxxxxxxxxxxxxx` |

> **주의**: 일반 WordPress 비밀번호가 아닌 Application Password를 사용해야 합니다.

### 3. 환경 변수 보안

`.env` 파일은 절대 Git에 커밋하지 마세요.

**확인:**
```bash
cat .gitignore | grep .env
```

출력:
```
.env
```

만약 `.gitignore`에 `.env`가 없다면 추가:
```bash
echo ".env" >> .gitignore
```

---

## Google AdSense 설정

@blog/cli는 자동으로 AdSense 코드를 삽입합니다.

### 1. AdSense 계정 준비

1. [Google AdSense](https://www.google.com/adsense) 가입
2. 사이트 추가 및 승인 대기
3. 광고 단위 생성

### 2. AdSense 정보 확인

AdSense 관리 페이지에서 다음 정보 확인:

**광고 코드 예시:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="9876543210"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

**필요한 정보:**
- `data-ad-client`: `ca-pub-1234567890123456`
- `data-ad-slot`: `9876543210`

### 3. .env 파일에 AdSense 정보 추가

```env
# Google AdSense (선택사항)
ADSENSE_CLIENT_ID=ca-pub-1234567890123456
ADSENSE_SLOT_ID=9876543210
```

### 4. AdSense 삽입 위치

@blog/cli는 자동으로 다음 위치에 광고를 삽입합니다:

1. **첫 번째 H2 제목 뒤** - 상단 광고
2. **콘텐츠 중간** - 중간 광고

**프리뷰에서 확인:**
```bash
blog preview content/posts/my-post.md --show-ads
```

광고 위치에 시각적 인디케이터가 표시됩니다.

### 5. AdSense 정책 준수

- 한 페이지당 광고 3개 이하 권장
- 콘텐츠와 광고 명확히 구분
- 클릭 유도 금지 ("광고를 클릭하세요" 등)
- 충분한 콘텐츠 제공 (최소 300단어)

---

## Avada 테마 설정

@blog/cli는 Avada 테마에 최적화되어 있습니다.

### 1. Avada 테마 설치

1. [ThemeFusion](https://theme-fusion.com/)에서 Avada 구매
2. WordPress 관리자 → **외모 → 테마 → 새로 추가 → 업로드**
3. Avada.zip 업로드 및 활성화

### 2. Avada 권장 설정

**Avada → Theme Options → Blog:**

```
Blog Layout: Large Alternate
Blog Archive Layout: Grid
Excerpt/Content: Auto
Excerpt Length: 55 words
```

**Avada → Theme Options → Social Media:**

```
Social Sharing Box: ON
Sharing Box Position: Below Content
Social Networks: Facebook, Twitter, LinkedIn
```

**Avada → Theme Options → Performance:**

```
CSS Compiling Method: File
Emoji Script: Disable
Google Fonts: Enable
```

### 3. 프리뷰 스타일 동기화

@blog/cli의 프리뷰 서버는 Avada 스타일을 모방합니다.

실제 블로그와 동일하게 보이도록 커스텀 CSS를 추가할 수 있습니다:

**프리뷰 서버 커스텀 스타일 (추후 지원 예정):**
```css
/* custom-preview.css */
.post-content {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.8;
}
```

### 4. Avada 없이 사용

Avada 테마가 없어도 @blog/cli를 사용할 수 있습니다.

다른 테마를 사용하는 경우:
- 프리뷰 서버의 스타일이 실제 블로그와 다를 수 있음
- 발행 기능은 정상 작동
- SEO 및 광고 삽입 기능도 정상 작동

---

## 권장 플러그인

@blog/cli와 함께 사용하면 좋은 WordPress 플러그인입니다.

### SEO 플러그인

**Yoast SEO** 또는 **Rank Math**

- @blog/cli가 생성한 메타 태그와 호환
- 추가 SEO 최적화 기능 제공
- XML 사이트맵 자동 생성

**설정:**
```
Yoast SEO → 일반 → 기능
→ "REST API: 헤드 엔드포인트" 활성화
```

### 캐싱 플러그인

**WP Rocket** 또는 **W3 Total Cache**

- 페이지 로딩 속도 향상
- AdSense 수익 증대 효과

**주의:**
- REST API 엔드포인트는 캐시에서 제외
- `/wp-json/*` 경로 캐시 제외 설정

### 이미지 최적화

**Smush** 또는 **ShortPixel**

- 자동 이미지 최적화
- WebP 변환
- DALL-E로 생성한 이미지도 자동 최적화

### 보안 플러그인

**Wordfence** 또는 **Sucuri Security**

- 악성코드 스캔
- 방화벽
- 로그인 보안 강화

**주의:**
- REST API 차단 해제 필수
- Application Password 허용 설정

### 백업 플러그인

**UpdraftPlus** 또는 **BackupBuddy**

- 정기적인 자동 백업
- 클라우드 스토리지 연동
- 원클릭 복원

---

## 보안 설정

WordPress 사이트의 보안을 강화합니다.

### 1. HTTPS 강제

**wp-config.php에 추가:**
```php
// HTTPS 강제
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

define('FORCE_SSL_ADMIN', true);
```

### 2. wp-config.php 보안

**파일 권한 설정:**
```bash
chmod 600 wp-config.php
```

**보안 키 변경:**
```php
// wp-config.php
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
// ... (총 8개)
```

[WordPress.org 키 생성기](https://api.wordpress.org/secret-key/1.1/salt/)에서 생성

### 3. Application Password 관리

**정기적인 회전:**
- 3-6개월마다 Application Password 재생성
- 사용하지 않는 Application Password 삭제

**사용 현황 확인:**
```
WordPress 관리자 → 사용자 → 프로필
→ Application Passwords 섹션에서 "Last Used" 확인
```

### 4. IP 화이트리스트 (선택사항)

개발 환경에서만 REST API 접근 허용:

**.htaccess에 추가:**
```apache
<FilesMatch "wp-json">
    Order Deny,Allow
    Deny from all
    Allow from 123.456.789.0  # 개발 서버 IP
    Allow from 127.0.0.1      # 로컬호스트
</FilesMatch>
```

### 5. 로그 모니터링

**플러그인 사용:**
- WP Activity Log
- Simple History

**확인 사항:**
- 비정상적인 API 호출
- 실패한 로그인 시도
- Application Password 사용 내역

---

## 연결 테스트

WordPress와 @blog/cli의 연결을 테스트합니다.

### 1. 환경 변수 확인

```bash
# .env 파일 확인
cat .env | grep WORDPRESS
```

출력:
```env
WORDPRESS_URL=https://your-blog.com
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 연결 테스트

```bash
blog config
```

**성공 시 출력:**
```
✓ WordPress 연결 확인 완료!

사이트 정보:
- 이름: Your Blog Name
- URL: https://your-blog.com
- 사용자: your-username
- REST API: 활성화됨 ✓
```

**실패 시 출력:**
```
✗ WordPress 연결 실패

오류: Unauthorized (401)
- Application Password를 확인하세요
- WORDPRESS_USERNAME이 정확한지 확인하세요
```

### 3. REST API 직접 테스트

curl로 직접 테스트:

```bash
# 사용자 정보 확인
curl -u "your-username:xxxxxxxxxxxxxxxxxxxx" \
  https://your-blog.com/wp-json/wp/v2/users/me

# 포스트 목록 확인
curl -u "your-username:xxxxxxxxxxxxxxxxxxxx" \
  https://your-blog.com/wp-json/wp/v2/posts?per_page=5
```

### 4. 테스트 포스트 발행

실제로 포스트를 발행하여 테스트:

```bash
# 테스트 초안 생성
blog draft create "테스트 포스트" "테스트, 연결" --words 500 --language ko

# 초안으로 발행 (공개 안 함)
blog publish content/drafts/2025-10-27-test.md --draft

# WordPress 관리자 페이지에서 확인
# → 글 → 모든 글 → "테스트 포스트" 확인

# 테스트 후 삭제
blog list --status draft
blog delete <포스트_ID>
```

### 5. 문제 해결

**연결 실패 시 체크리스트:**

- [ ] WORDPRESS_URL이 정확한가? (https:// 포함, 끝에 슬래시 없음)
- [ ] WORDPRESS_USERNAME이 정확한가? (이메일 또는 사용자명)
- [ ] WORDPRESS_APP_PASSWORD가 정확한가? (공백 제거)
- [ ] REST API가 활성화되어 있는가? (`/wp-json/` 접속 테스트)
- [ ] Application Password가 유효한가? (만료되지 않음)
- [ ] 보안 플러그인이 차단하지 않는가?
- [ ] 방화벽이 차단하지 않는가?
- [ ] HTTPS 인증서가 유효한가?

자세한 문제 해결은 [트러블슈팅 가이드](./troubleshooting.md)를 참조하세요.

---

## 고급 설정

### Custom Post Type 지원

기본적으로 `post` 타입만 지원합니다. Custom Post Type을 사용하려면:

**추후 버전에서 지원 예정 (Epic 6.0)**

### 멀티사이트 지원

WordPress 멀티사이트 환경에서는:

**추후 버전에서 지원 예정 (Epic 6.0)**

### 커스텀 필드

Advanced Custom Fields (ACF) 등의 커스텀 필드:

**추후 버전에서 지원 예정 (Epic 6.0)**

---

## 다음 단계

- **기본 워크플로우**: [기본 워크플로우 가이드](./workflows.md)
- **트러블슈팅**: [트러블슈팅 가이드](./troubleshooting.md)
- **시작하기**: [시작하기 가이드](./getting-started.md)

---

**이전**: [기본 워크플로우](./workflows.md) | **다음**: [트러블슈팅](./troubleshooting.md)
