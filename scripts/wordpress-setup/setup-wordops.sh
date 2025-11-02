#!/bin/bash
set -euo pipefail

# WordPress 서버 설치 스크립트 (WordOps 기반)
# Ubuntu 20.04/22.04 LTS 전용

# 현재 스크립트의 디렉토리 경로 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 설정 파일 로드
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
    echo "Error: config.sh 파일을 찾을 수 없습니다."
    echo "경로: $SCRIPT_DIR/config.sh"
    exit 1
fi

source "$SCRIPT_DIR/config.sh"

# 설정 변수 검증
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "blog.example.com" ]; then
    echo "Error: config.sh에서 DOMAIN을 실제 도메인으로 수정해주세요."
    exit 1
fi

if [ -z "$ADMIN_EMAIL" ] || [ "$ADMIN_EMAIL" = "admin@example.com" ]; then
    echo "Error: config.sh에서 ADMIN_EMAIL을 실제 이메일로 수정해주세요."
    exit 1
fi

if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" = "Change-This-Secure-Password-123!" ]; then
    echo "Error: config.sh에서 ADMIN_PASSWORD를 변경해주세요."
    exit 1
fi

# Cloudflare Origin Certificate 파일 확인
if [ ! -f "$SCRIPT_DIR/cert.pem" ]; then
    echo "Error: Cloudflare Origin Certificate 파일(cert.pem)이 없습니다."
    echo "경로: $SCRIPT_DIR/cert.pem"
    echo ""
    echo "Cloudflare 대시보드에서 인증서를 발급받아 저장해주세요:"
    echo "  1. Cloudflare → SSL/TLS → Origin Server → Create Certificate"
    echo "  2. cert.pem과 key.pem을 $SCRIPT_DIR에 저장"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/key.pem" ]; then
    echo "Error: Cloudflare Private Key 파일(key.pem)이 없습니다."
    echo "경로: $SCRIPT_DIR/key.pem"
    exit 1
fi

echo "=================================="
echo "WordPress 서버 자동 설치 시작"
echo "=================================="
echo "도메인: $DOMAIN"
echo "관리자 이메일: $ADMIN_EMAIL"
echo "관리자 사용자: $ADMIN_USER"
echo "=================================="
echo ""

# root 권한 체크
if [ "$EUID" -ne 0 ]; then
    echo "Error: 이 스크립트는 root 권한으로 실행해야 합니다."
    echo "sudo bash setup-wordops.sh 명령을 사용하세요."
    exit 1
fi

# 우분투 버전 체크
if [ ! -f /etc/lsb-release ]; then
    echo "Error: Ubuntu 시스템이 아닙니다."
    exit 1
fi

source /etc/lsb-release
if [[ ! "$DISTRIB_RELEASE" =~ ^(20\.04|22\.04)$ ]]; then
    echo "Error: Ubuntu 20.04 또는 22.04 LTS가 필요합니다."
    echo "현재 버전: Ubuntu $DISTRIB_RELEASE"
    exit 1
fi

echo "[1/2] WordOps 설치 중..."
echo "-------------------------------"

# WordOps가 이미 설치되어 있는지 확인
if command -v wo &> /dev/null; then
    echo "WordOps가 이미 설치되어 있습니다."
    wo --version
else
    # WordOps 설치
    wget -qO wo wops.cc && bash wo
    if [ $? -ne 0 ]; then
        echo "Error: WordOps 설치 실패"
        exit 1
    fi
    echo "WordOps 설치 완료!"
fi

echo ""

echo "[2/5] 방화벽(UFW) 설정 중..."
echo "-------------------------------"

# UFW 설치 확인
if ! command -v ufw &> /dev/null; then
    echo "UFW 설치 중..."
    apt-get update -qq
    apt-get install -y ufw
fi

# UFW 활성화 여부 확인
if ! ufw status | grep -q "Status: active"; then
    echo "방화벽 활성화 중..."
    # SSH 먼저 허용 (중요! 연결 끊김 방지)
    ufw allow 22/tcp
    ufw --force enable
    echo "방화벽 활성화 완료"
else
    echo "방화벽이 이미 활성화되어 있습니다."
fi

# HTTP/HTTPS 포트 허용
echo "HTTP/HTTPS 포트 허용 중..."
ufw allow 80/tcp
ufw allow 443/tcp

# 설정 확인
echo "방화벽 규칙:"
ufw status numbered

echo ""

echo "[3/5] WordPress 사이트 생성 중..."
echo "-------------------------------"
echo "도메인: $DOMAIN"
echo "옵션: WordPress + PHP 8.1 + Redis 캐싱"
echo ""

# 사이트가 이미 존재하는지 확인
if wo site info "$DOMAIN" &> /dev/null; then
    echo "경고: $DOMAIN 사이트가 이미 존재합니다."
    echo "기존 사이트 정보:"
    wo site info "$DOMAIN"
    echo ""
    read -p "기존 사이트를 삭제하고 새로 생성하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        wo site delete "$DOMAIN" --no-prompt
        echo "기존 사이트 삭제 완료"
    else
        echo "사이트 생성을 취소합니다."
        exit 0
    fi
fi

# WordPress 사이트 생성 (Redis 캐싱 포함)
# --wpredis = WordPress + Redis cache
# --php81 = PHP 8.1
wo site create "$DOMAIN" --wpredis --php81

if [ $? -ne 0 ]; then
    echo "Error: WordPress 사이트 생성 실패"
    exit 1
fi

echo ""
echo "WordPress 사이트 생성 완료!"
echo ""

echo "[4/5] Cloudflare SSL 인증서 설정 중..."
echo "-------------------------------"

# SSL 디렉토리 생성
SSL_DIR="/etc/nginx/ssl/$DOMAIN"
echo "SSL 디렉토리 생성: $SSL_DIR"
mkdir -p "$SSL_DIR"

# 인증서 파일 복사
echo "인증서 파일 복사 중..."
cp "$SCRIPT_DIR/cert.pem" "$SSL_DIR/cert.pem"
cp "$SCRIPT_DIR/key.pem" "$SSL_DIR/key.pem"

# 권한 설정
chmod 644 "$SSL_DIR/cert.pem"
chmod 600 "$SSL_DIR/key.pem"
echo "인증서 설치 완료"

# Nginx 설정 파일 수정
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
echo "Nginx SSL 설정 추가 중..."

# 백업
cp "$NGINX_CONF" "${NGINX_CONF}.backup"

# listen 80을 listen 443 ssl http2로 변경
sed -i 's/listen 80;/listen 443 ssl http2;/g' "$NGINX_CONF"
sed -i 's/listen \[::\]:80;/listen [::]:443 ssl http2;/g' "$NGINX_CONF"

# server_name 다음 줄에 SSL 인증서 경로 추가
sed -i "/server_name.*$DOMAIN/a \    ssl_certificate $SSL_DIR/cert.pem;\n    ssl_certificate_key $SSL_DIR/key.pem;" "$NGINX_CONF"

# HTTP → HTTPS 리다이렉트 블록 추가 (파일 끝)
cat >> "$NGINX_CONF" << EOF

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}
EOF

# Nginx 설정 검증
echo "Nginx 설정 검증 중..."
if ! nginx -t 2>&1 | grep -q "successful"; then
    echo "Error: Nginx 설정 오류. 백업에서 복원합니다."
    mv "${NGINX_CONF}.backup" "$NGINX_CONF"
    exit 1
fi

# Nginx 재시작
echo "Nginx 재시작 중..."
systemctl reload nginx

echo "SSL 설정 완료!"
echo ""

echo "[5/5] 관리자 계정 설정 중..."
echo "-------------------------------"

SITE_DIR="/var/www/$DOMAIN/htdocs"
cd "$SITE_DIR"

# 기존 사용자 확인
echo "기존 WordPress 사용자 확인 중..."
sudo -u www-data wp user list

# WordOps가 생성한 기본 계정(ID 1)의 비밀번호를 config.sh 값으로 변경
echo ""
echo "관리자 계정 비밀번호 업데이트 중..."
echo "  - 대상: ID 1 (WordOps 기본 계정)"
echo "  - 새 비밀번호: config.sh의 ADMIN_PASSWORD 사용"

sudo -u www-data wp user update 1 \
  --user_pass="$ADMIN_PASSWORD" \
  --role=administrator

if [ $? -eq 0 ]; then
    echo "✅ 관리자 계정 비밀번호 업데이트 완료!"
    echo ""
    echo "로그인 정보:"
    ADMIN_LOGIN=$(sudo -u www-data wp user get 1 --field=user_login)
    ADMIN_EMAIL_ACTUAL=$(sudo -u www-data wp user get 1 --field=user_email)
    echo "  - 사용자명: $ADMIN_LOGIN"
    echo "  - 이메일: $ADMIN_EMAIL_ACTUAL"
    echo "  - 비밀번호: (config.sh의 ADMIN_PASSWORD)"
else
    echo "❌ 비밀번호 업데이트 실패"
    echo "수동으로 변경하세요: sudo -u www-data wp user update 1 --user_pass=\"새비밀번호\""
fi

echo ""
echo "최종 사용자 목록:"
sudo -u www-data wp user list

echo ""
echo "=================================="
echo "✅ WordPress 설치 완료!"
echo "=================================="
echo "사이트 URL: https://$DOMAIN"
echo "관리자 페이지: https://$DOMAIN/wp-admin"
echo ""
echo "🔑 관리자 로그인 정보:"
FINAL_ADMIN_LOGIN=$(sudo -u www-data wp user get 1 --field=user_login 2>/dev/null || echo "확인 필요")
FINAL_ADMIN_EMAIL=$(sudo -u www-data wp user get 1 --field=user_email 2>/dev/null || echo "확인 필요")
echo "  - 사용자명: $FINAL_ADMIN_LOGIN"
echo "  - 이메일: $FINAL_ADMIN_EMAIL"
echo "  - 비밀번호: (config.sh의 ADMIN_PASSWORD)"
echo ""
echo "💡 로그인 방법:"
echo "  1. https://$DOMAIN/wp-admin 접속"
echo "  2. 사용자명에 '$FINAL_ADMIN_LOGIN' 입력"
echo "  3. 비밀번호에 config.sh의 ADMIN_PASSWORD 입력"
echo ""
echo "🔒 SSL 설정:"
echo "  - Cloudflare Origin Certificate 적용됨"
echo "  - 방화벽(UFW): 80/tcp, 443/tcp 허용됨"
echo ""
echo "⚠️  중요: Cloudflare SSL 모드 설정 필수!"
echo "  1. Cloudflare 대시보드 접속"
echo "  2. $DOMAIN 도메인 선택"
echo "  3. SSL/TLS 메뉴 → Overview 탭"
echo "  4. SSL/TLS encryption mode를 'Full (strict)'로 설정"
echo ""
echo "WordOps 사이트 정보 확인:"
echo "  wo site info $DOMAIN"
echo "=================================="
