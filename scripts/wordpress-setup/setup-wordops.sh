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

echo "[2/2] WordPress 사이트 생성 중..."
echo "-------------------------------"
echo "도메인: $DOMAIN"
echo "옵션: WordPress + PHP 8.1 + Let's Encrypt SSL + Redis 캐싱"
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

# WordPress 사이트 생성 (관리자 계정 포함)
wo site create "$DOMAIN" \
    --wp \
    --php81 \
    --letsencrypt \
    --redis \
    --user="$ADMIN_USER" \
    --pass="$ADMIN_PASSWORD" \
    --email="$ADMIN_EMAIL"

if [ $? -ne 0 ]; then
    echo "Error: WordPress 사이트 생성 실패"
    exit 1
fi

echo ""
echo "=================================="
echo "WordPress 설치 완료!"
echo "=================================="
echo "사이트 URL: https://$DOMAIN"
echo "관리자 페이지: https://$DOMAIN/wp-admin"
echo ""
echo "관리자 계정 정보:"
echo "  - 사용자명: $ADMIN_USER"
echo "  - 이메일: $ADMIN_EMAIL"
echo "  - 비밀번호: (config.sh 참조)"
echo "=================================="
