#!/bin/bash
set -euo pipefail

# Avada 테마 설치 스크립트
# WordOps + WP-CLI 기반

# 현재 스크립트의 디렉토리 경로 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 설정 파일 로드
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
    echo "Error: config.sh 파일을 찾을 수 없습니다."
    echo "경로: $SCRIPT_DIR/config.sh"
    exit 1
fi

source "$SCRIPT_DIR/config.sh"

# root 권한 체크
if [ "$EUID" -ne 0 ]; then
    echo "Error: 이 스크립트는 root 권한으로 실행해야 합니다."
    echo "sudo bash setup-theme.sh 명령을 사용하세요."
    exit 1
fi

# Avada 테마 파일 확인
if [ ! -f "$SCRIPT_DIR/$AVADA_THEME_ZIP" ]; then
    echo "Error: Avada 테마 파일을 찾을 수 없습니다."
    echo "경로: $SCRIPT_DIR/$AVADA_THEME_ZIP"
    echo "ref/Avada_Full_Package/Avada.zip 파일을 복사해주세요."
    exit 1
fi

# WordPress 사이트 디렉토리
SITE_DIR="/var/www/$DOMAIN/htdocs"

if [ ! -d "$SITE_DIR" ]; then
    echo "Error: WordPress 사이트 디렉토리를 찾을 수 없습니다."
    echo "경로: $SITE_DIR"
    echo "setup-wordops.sh를 먼저 실행해주세요."
    exit 1
fi

echo "=================================="
echo "Avada 테마 설치"
echo "=================================="
echo "도메인: $DOMAIN"
echo "테마 파일: $AVADA_THEME_ZIP"
echo "=================================="
echo ""

# WordPress themes 디렉토리로 이동
THEMES_DIR="$SITE_DIR/wp-content/themes"
cd "$THEMES_DIR"

echo "[1/2] Avada 테마 압축 해제 중..."
echo "-------------------------------"

# Avada 테마 압축 해제 (www-data 사용자로 실행)
sudo -u www-data unzip -q "$SCRIPT_DIR/$AVADA_THEME_ZIP"

if [ $? -ne 0 ]; then
    echo "Error: Avada 테마 압축 해제 실패"
    exit 1
fi

# Avada 디렉토리 존재 확인
if [ ! -d "$THEMES_DIR/Avada" ]; then
    echo "Error: Avada 테마 디렉토리를 찾을 수 없습니다."
    echo "압축 파일 내용을 확인해주세요."
    exit 1
fi

echo "Avada 테마 압축 해제 완료!"
echo ""

echo "[2/2] Avada 테마 활성화 중..."
echo "-------------------------------"

# 테마 활성화
sudo -u www-data wp theme activate Avada

if [ $? -ne 0 ]; then
    echo "Error: Avada 테마 활성화 실패"
    exit 1
fi

echo "Avada 테마 활성화 완료!"
echo ""

# 현재 활성화된 테마 확인
echo "현재 활성화된 테마:"
sudo -u www-data wp theme list --status=active

echo ""
echo "=================================="
echo "Avada 테마 설치 완료!"
echo "=================================="
echo "사이트를 방문하여 테마를 확인하세요: https://$DOMAIN"
echo "=================================="
