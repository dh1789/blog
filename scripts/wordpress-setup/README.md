# WordPress 서버 자동 설치 스크립트

WordOps 기반 WordPress + Avada 테마 + Polylang 다국어 플러그인을 자동으로 설치하는 스크립트입니다.

## 📋 설치 내용

1. **WordOps + WordPress**: LEMP 스택 (Nginx, MySQL, PHP 8.1) + Redis 캐싱
2. **Cloudflare SSL**: Origin Certificate 자동 설정
3. **Avada 테마**: 프리미엄 테마 자동 설치 및 활성화
4. **Polylang 플러그인**: 한국어/영어 다국어 설정
5. **Polylang REST API Helper**: CLI 자동 연결 기능 지원

## 🚀 빠른 시작

### 1단계: 설정 파일 편집

```bash
vim scripts/wordpress-setup/config.sh
```

**필수 설정**:
- `DOMAIN`: 실제 도메인 (예: blog.example.com)
- `ADMIN_EMAIL`: 관리자 이메일
- `ADMIN_USER`: 관리자 사용자명
- `ADMIN_PASSWORD`: 강력한 비밀번호

### 2단계: SSL 인증서 준비

Cloudflare에서 Origin Certificate 발급:
1. Cloudflare 대시보드 → SSL/TLS → Origin Server
2. Create Certificate 클릭
3. `cert.pem`과 `key.pem` 다운로드
4. `scripts/wordpress-setup/` 디렉토리에 저장

```bash
cp ~/Downloads/cert.pem scripts/wordpress-setup/
cp ~/Downloads/key.pem scripts/wordpress-setup/
```

### 3단계: Avada 테마 복사

```bash
cp ref/Avada_Full_Package/Avada.zip scripts/wordpress-setup/
```

### 4단계: VPS에 업로드 및 실행

```bash
# 압축
tar -czf wordpress-setup.tar.gz -C scripts wordpress-setup

# VPS에 업로드
scp wordpress-setup.tar.gz root@YOUR_VPS_IP:/tmp/

# SSH 접속 후 실행
ssh -t root@YOUR_VPS_IP 'cd /tmp && tar -xzf wordpress-setup.tar.gz && cd wordpress-setup && sudo bash setup.sh'
```

**예상 소요 시간**: 7-12분

## 📁 파일 구조

```
scripts/wordpress-setup/
├── config.sh                           # 설정 변수
├── setup.sh                            # 메인 오케스트레이터
├── setup-wordops.sh                    # WordPress 기본 설치
├── setup-theme.sh                      # Avada 테마 설치
├── setup-polylang.sh                   # Polylang 설정 (새로 추가!)
├── add-languages.php                   # 언어 추가 PHP 스크립트
├── polylang-rest-api-helper.php        # 커스텀 REST API Helper
├── cert.pem                            # Cloudflare SSL 인증서 (사용자 제공)
├── key.pem                             # Cloudflare SSL 키 (사용자 제공)
└── Avada.zip                           # Avada 테마 (사용자 제공)
```

## ✨ Polylang 자동 설정

### 설치되는 내용

1. **Polylang 플러그인**: WordPress.org에서 자동 설치
2. **언어 설정**:
   - 한국어(ko) - 기본 언어
   - English(en)
3. **Polylang REST API Helper**: CLI 자동 연결 지원

### 설치 후 사용 방법

#### 포스트 발행

```bash
# 한국어 포스트 발행
blog publish content/posts/ko/my-post.md

# 결과: 포스트 ID 100 (예시)
```

#### 다국어 연결

```bash
# 방법 1: 발행하면서 자동 연결
blog publish content/posts/en/my-post.md --link-to 100

# 방법 2: 수동 연결
blog link-translations --ko 100 --en 101
```

#### WordPress 관리자 확인

https://your-domain.com/wp-admin/admin.php?page=mlang

- "Edit the translation in English" 링크 확인
- 언어 전환 기능 확인

## 🔧 개별 스크립트 실행

### WordPress만 재설치

```bash
sudo bash setup-wordops.sh
```

### Avada 테마만 재설치

```bash
sudo bash setup-theme.sh
```

### Polylang만 재설정

```bash
sudo bash setup-polylang.sh
```

## ⚠️ 주의사항

### 1. Cloudflare SSL 모드 설정

스크립트 실행 후 **반드시** Cloudflare SSL 모드를 변경해야 합니다:

1. Cloudflare 대시보드 접속
2. 도메인 선택 → SSL/TLS → Overview
3. SSL/TLS encryption mode를 **"Full (strict)"**로 변경

### 2. 방화벽 설정

스크립트는 자동으로 UFW 방화벽을 설정합니다:
- SSH (22/tcp)
- HTTP (80/tcp)
- HTTPS (443/tcp)

### 3. DNS 설정

스크립트 실행 전에 도메인의 A 레코드가 VPS IP를 가리켜야 합니다.

## 🐛 문제 해결

### Polylang 설치 실패

```bash
# 수동 설치
cd /var/www/YOUR_DOMAIN/htdocs
sudo -u www-data wp plugin install polylang --activate
sudo -u www-data wp eval-file /path/to/add-languages.php
```

### REST API Helper 활성화 실패

```bash
# 플러그인 파일 확인
ls -lh /var/www/YOUR_DOMAIN/htdocs/wp-content/plugins/polylang-rest-api-helper/

# 수동 활성화
sudo -u www-data wp plugin activate polylang-rest-api-helper
```

### 언어 추가 실패

WordPress 관리자에서 수동 추가:
1. 언어 메뉴 접속
2. 새 언어 추가 → 한국어 선택 → 추가
3. 새 언어 추가 → English 선택 → 추가

## 📊 검증

설치 완료 후 다음 명령어로 상태 확인:

```bash
# WordPress 사이트 정보
wo site info YOUR_DOMAIN

# 활성 플러그인 확인
sudo -u www-data wp plugin list --status=active

# 언어 목록 확인
sudo -u www-data wp eval 'print_r(pll_languages_list());'
```

## 🔄 업데이트

### Polylang REST API Helper 업데이트

플러그인 코드를 수정한 경우:

```bash
# 1. 로컬에서 플러그인 파일 업데이트
cp wordpress-plugin/polylang-rest-api-helper.php scripts/wordpress-setup/

# 2. VPS에 재배포
sudo bash setup-polylang.sh
```

## 📚 참고 자료

- [WordOps 문서](https://wordops.net/)
- [Polylang 문서](https://polylang.wordpress.com/documentation/)
- [WP-CLI 핸드북](https://make.wordpress.org/cli/handbook/)
- [Avada 문서](https://avada.theme-fusion.com/documentation/)

## 📝 라이선스

MIT License
