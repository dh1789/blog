# 기존 WordPress에 Polylang만 추가하기

⚠️ **주의**: 이 가이드는 **이미 WordPress가 설치되어 있는 경우**에만 사용합니다.

새로 설치하는 경우 `setup.sh`를 실행하세요.

## 📋 사전 준비

### 1. 필요한 파일 확인

```bash
ls scripts/wordpress-setup/
# 다음 파일들이 있어야 합니다:
# - setup-polylang.sh
# - add-languages.php
# - polylang-rest-api-helper.php
# - config.sh
```

### 2. config.sh 설정

```bash
vim scripts/wordpress-setup/config.sh
```

**필수 설정**:
- `DOMAIN`: 실제 도메인 (예: beomanro.com)

다른 설정(ADMIN_EMAIL, ADMIN_PASSWORD 등)은 Polylang 설치 시 사용되지 않으므로 변경하지 않아도 됩니다.

## 🚀 Polylang 설치 (방법 1: 로컬에서 VPS 원격 실행)

### 단계 1: VPS에 파일 업로드

```bash
# 현재 디렉토리: /Users/idongho/proj/blog

# 필요한 파일만 압축
cd scripts/wordpress-setup
tar -czf polylang-only.tar.gz \
    setup-polylang.sh \
    add-languages.php \
    polylang-rest-api-helper.php \
    config.sh

# VPS에 업로드
scp polylang-only.tar.gz root@YOUR_VPS_IP:/tmp/

# 정리
rm polylang-only.tar.gz
cd ../..
```

### 단계 2: VPS에서 실행

```bash
# SSH 접속
ssh root@YOUR_VPS_IP

# 압축 해제
cd /tmp
tar -xzf polylang-only.tar.gz

# Polylang 설치 실행
sudo bash setup-polylang.sh
```

**예상 소요 시간**: 2-3분

## 🚀 Polylang 설치 (방법 2: VPS에서 직접 실행)

### 단계 1: VPS에 SSH 접속

```bash
ssh root@YOUR_VPS_IP
```

### 단계 2: 작업 디렉토리 생성

```bash
mkdir -p /tmp/polylang-setup
cd /tmp/polylang-setup
```

### 단계 3: 파일 생성

#### config.sh 생성

```bash
cat > config.sh << 'EOF'
#!/bin/bash

# WordPress 도메인 (필수)
DOMAIN="beomanro.com"

# 나머지 설정은 Polylang 설치 시 사용되지 않음
ADMIN_EMAIL="admin@example.com"
ADMIN_USER="admin"
ADMIN_PASSWORD="unused"
AVADA_THEME_ZIP="Avada.zip"
EOF

chmod +x config.sh
```

**중요**: `DOMAIN="beomanro.com"` 부분을 실제 도메인으로 수정하세요!

#### setup-polylang.sh 다운로드

GitHub나 로컬에서 복사, 또는 직접 생성:

```bash
# 로컬에서 파일 내용 복사하여 VPS에 붙여넣기
nano setup-polylang.sh
# (setup-polylang.sh 내용 붙여넣기)

chmod +x setup-polylang.sh
```

#### add-languages.php 다운로드

```bash
nano add-languages.php
# (add-languages.php 내용 붙여넣기)
```

#### polylang-rest-api-helper.php 다운로드

```bash
nano polylang-rest-api-helper.php
# (polylang-rest-api-helper.php 내용 붙여넣기)
```

### 단계 4: 실행

```bash
sudo bash setup-polylang.sh
```

## ✅ 설치 확인

### 1. WordPress 관리자에서 확인

https://beomanro.com/wp-admin/plugins.php

**확인 사항**:
- ✅ Polylang 플러그인 활성화됨
- ✅ Polylang REST API Helper 활성화됨

### 2. 언어 설정 확인

https://beomanro.com/wp-admin/admin.php?page=mlang

**확인 사항**:
- ✅ 한국어 (기본 언어)
- ✅ English

### 3. CLI 테스트

로컬에서:

```bash
# 한국어 포스트 발행
blog publish content/posts/ko/test-post.md

# 영어 포스트 발행하면서 연결
blog publish content/posts/en/test-post.md --link-to <한글포스트ID>

# 수동 연결
blog link-translations --ko <한글ID> --en <영문ID>
```

## 🐛 문제 해결

### 오류: config.sh 파일을 찾을 수 없습니다

```bash
# setup-polylang.sh와 같은 디렉토리에 config.sh가 있는지 확인
ls -lh
```

### 오류: WordPress 사이트 디렉토리를 찾을 수 없습니다

```bash
# 도메인 확인
cat config.sh | grep DOMAIN

# WordPress 디렉토리 확인
ls -lh /var/www/YOUR_DOMAIN/htdocs
```

config.sh의 `DOMAIN` 값을 실제 도메인으로 수정하세요.

### Polylang 플러그인 활성화 실패

WordPress 관리자에서 수동 활성화:
1. 플러그인 → 설치된 플러그인
2. Polylang 찾기 → 활성화

### 언어 추가 실패

WordPress 관리자에서 수동 추가:
1. 언어 메뉴 접속
2. 새 언어 추가 → 한국어 선택 → 추가
3. 새 언어 추가 → English 선택 → 추가

## ⚠️ 주의사항

### 데이터 안전

- ✅ **안전**: `setup-polylang.sh`는 **기존 콘텐츠를 건드리지 않습니다**
- ✅ **안전**: 플러그인만 설치하고 언어 설정만 추가합니다
- ✅ **안전**: 기존 포스트, 페이지, 미디어는 그대로 유지됩니다

### 백업 권장 (선택)

만약의 경우를 대비한 백업:

```bash
# WordPress 데이터베이스 백업
sudo -u www-data wp db export /tmp/backup-$(date +%Y%m%d).sql

# 플러그인 디렉토리 백업
tar -czf /tmp/plugins-backup-$(date +%Y%m%d).tar.gz /var/www/YOUR_DOMAIN/htdocs/wp-content/plugins/
```

## 📚 참고

- 전체 설치 가이드: [README.md](README.md)
- Polylang 문서: https://polylang.wordpress.com/documentation/
