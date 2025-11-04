# Polylang REST API Helper Plugin

Polylang 무료 버전에서 REST API를 통해 translation을 연결할 수 있게 하는 WordPress 플러그인입니다.

## 🎯 목적

Polylang의 REST API 기능은 Pro 버전($99)에서만 공식 지원됩니다. 이 플러그인은 무료 버전에서도 프로그래밍 방식으로 translation을 연결할 수 있게 합니다.

## ✨ 기능

### 1. 커스텀 REST API Endpoint

```
POST /wp-json/polylang-helper/v1/link-translations
```

**요청 본문**:
```json
{
  "ko_post_id": 64,
  "en_post_id": 65
}
```

**응답**:
```json
{
  "success": true,
  "message": "Translation linked successfully",
  "data": {
    "ko_post": {
      "id": 64,
      "title": "도메인 구매 및 Cloudflare 무료 SSL 설정",
      "language": "ko"
    },
    "en_post": {
      "id": 65,
      "title": "Domain Purchase & Cloudflare Free SSL Setup",
      "language": "en"
    }
  }
}
```

### 2. 자동 Translation 연결 (Publish 시)

`blog publish` 명령어에서 `--link-to` 파라미터를 사용할 때 자동으로 translation을 연결합니다.

**예시**:
```bash
blog publish content/posts/en/my-post.md --link-to 64
```

이 명령어는:
1. 영어 포스트를 발행하고
2. 자동으로 포스트 64(한국어)와 translation으로 연결합니다

## 📦 설치 방법

### 방법 1: FTP/SFTP를 통한 수동 설치

1. `polylang-rest-api-helper.php` 파일을 WordPress 서버의 `wp-content/plugins/polylang-rest-api-helper/` 디렉토리에 업로드

   ```bash
   # 로컬에서 VPS로 업로드 (예: Vultr VPS)
   scp polylang-rest-api-helper.php root@your-vps-ip:/var/www/html/wp-content/plugins/polylang-rest-api-helper/
   ```

2. WordPress 관리자 → 플러그인 → "Polylang REST API Helper" 활성화

### 방법 2: WordPress 관리자 화면에서 직접 생성

1. WordPress 관리자 → 플러그인 → 플러그인 파일 편집기
2. 오른쪽 상단에서 "Polylang REST API Helper" 선택 (또는 새로 생성)
3. `polylang-rest-api-helper.php` 내용 붙여넣기
4. 저장 후 활성화

### 방법 3: WordPress SSH 접근을 통한 설치

```bash
# WordPress 서버에 SSH 접속
ssh root@your-vps-ip

# 플러그인 디렉토리 생성
mkdir -p /var/www/html/wp-content/plugins/polylang-rest-api-helper

# 플러그인 파일 생성
nano /var/www/html/wp-content/plugins/polylang-rest-api-helper/polylang-rest-api-helper.php

# 위 코드 붙여넣기 후 저장 (Ctrl+X, Y, Enter)

# 권한 설정
chown -R www-data:www-data /var/www/html/wp-content/plugins/polylang-rest-api-helper
chmod 755 /var/www/html/wp-content/plugins/polylang-rest-api-helper
chmod 644 /var/www/html/wp-content/plugins/polylang-rest-api-helper/polylang-rest-api-helper.php
```

그 다음 WordPress 관리자에서 플러그인 활성화.

## ✅ 설치 확인

### 1. 플러그인 활성화 확인

WordPress 관리자 → 플러그인 → "Polylang REST API Helper"가 활성화 상태인지 확인

### 2. REST API Endpoint 테스트

```bash
curl -X POST \
  -u "your-username:your-app-password" \
  -H "Content-Type: application/json" \
  https://your-blog.com/wp-json/polylang-helper/v1/link-translations \
  -d '{
    "ko_post_id": 64,
    "en_post_id": 65
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "message": "Translation linked successfully",
  ...
}
```

## 🔧 CLI 통합

이 플러그인을 설치한 후, `blog` CLI는 자동으로 새로운 endpoint를 사용하여 translation을 연결합니다.

**수동 연결**:
```bash
blog link-translations --ko 64 --en 65
```

**발행 시 자동 연결**:
```bash
# 한국어 포스트 먼저 발행
blog publish content/posts/ko/my-post.md
# 포스트 ID: 64

# 영어 포스트 발행하면서 자동 연결
blog publish content/posts/en/my-post.md --link-to 64
```

## 🛡️ 보안

- 인증된 사용자(edit_posts 권한)만 endpoint에 접근 가능
- WordPress Application Password 인증 사용
- 포스트 존재 여부 검증
- Polylang 활성화 상태 확인

## 📝 요구사항

- WordPress 5.0 이상
- Polylang 무료 버전 또는 Pro 버전
- PHP 7.4 이상
- REST API 활성화 (WordPress 기본 설정)

## 🤔 트러블슈팅

### 플러그인이 활성화되지 않음

- WordPress 서버의 PHP error log 확인: `/var/log/apache2/error.log` 또는 `/var/log/nginx/error.log`
- 파일 권한 확인: `644` (파일), `755` (디렉토리)
- PHP 버전 확인: `php -v`

### REST API Endpoint가 404 에러

- WordPress Permalinks 재저장: WordPress 관리자 → 설정 → 고유주소 → 변경사항 저장
- `.htaccess` 파일 확인 (Apache) 또는 Nginx 설정 확인

### Translation 연결이 안 됨

- Polylang 플러그인이 활성화되어 있는지 확인
- 한국어(ko)와 영어(en) 언어가 Polylang에 설정되어 있는지 확인
- 포스트 ID가 올바른지 확인

## 📄 라이선스

MIT License
