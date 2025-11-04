#!/bin/bash
set -euo pipefail

# Polylang 다국어 플러그인 자동 설정 스크립트
# WordOps + WP-CLI 기반

# 현재 스크립트의 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 설정 파일 로드
if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
    echo "Error: config.sh 파일을 찾을 수 없습니다."
    echo "경로: $SCRIPT_DIR/config.sh"
    exit 1
fi

source "$SCRIPT_DIR/config.sh"

echo "=================================="
echo "Polylang 다국어 설정"
echo "=================================="
echo "도메인: $DOMAIN"
echo "=================================="
echo ""

# root 권한 체크
if [ "$EUID" -ne 0 ]; then
    echo "Error: 이 스크립트는 root 권한으로 실행해야 합니다."
    echo "sudo bash setup-polylang.sh 명령을 사용하세요."
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

echo "[1/4] Polylang 플러그인 설치 중..."
echo "-------------------------------"

cd "$SITE_DIR"

# Polylang 플러그인이 이미 설치되어 있는지 확인
if sudo -u www-data wp plugin is-installed polylang; then
    echo "Polylang 플러그인이 이미 설치되어 있습니다."

    # 활성화 상태 확인
    if sudo -u www-data wp plugin is-active polylang; then
        echo "Polylang 플러그인이 이미 활성화되어 있습니다."
    else
        echo "Polylang 플러그인을 활성화합니다..."
        sudo -u www-data wp plugin activate polylang

        if [ $? -ne 0 ]; then
            echo "Error: Polylang 플러그인 활성화 실패"
            exit 1
        fi
        echo "Polylang 플러그인 활성화 완료!"
    fi
else
    echo "Polylang 플러그인을 설치합니다..."
    sudo -u www-data wp plugin install polylang --activate

    if [ $? -ne 0 ]; then
        echo "Error: Polylang 플러그인 설치 실패"
        echo ""
        echo "수동 설치 방법:"
        echo "  1. WordPress 관리자 → 플러그인 → 새로 추가"
        echo "  2. 'Polylang' 검색 → 설치 → 활성화"
        exit 1
    fi
    echo "Polylang 플러그인 설치 완료!"
fi

# 설치된 Polylang 버전 확인
POLYLANG_VERSION=$(sudo -u www-data wp plugin get polylang --field=version)
echo "설치된 Polylang 버전: $POLYLANG_VERSION"

echo ""
echo "Polylang 플러그인 설치 및 활성화 완료!"
echo ""

echo "[2/4] 언어 설정 중..."
echo "-------------------------------"

# add-languages.php 스크립트 존재 확인
if [ ! -f "$SCRIPT_DIR/add-languages.php" ]; then
    echo "Error: add-languages.php 파일을 찾을 수 없습니다."
    echo "경로: $SCRIPT_DIR/add-languages.php"
    exit 1
fi

# WP-CLI eval-file로 PHP 스크립트 실행
echo "한국어(ko)와 영어(en) 언어를 추가합니다..."
sudo -u www-data wp eval-file "$SCRIPT_DIR/add-languages.php"

if [ $? -ne 0 ]; then
    echo "Error: 언어 추가 실패"
    echo ""
    echo "수동 설정 방법:"
    echo "  1. WordPress 관리자 → 언어"
    echo "  2. 새 언어 추가 → 한국어 선택 → 추가"
    echo "  3. 새 언어 추가 → English 선택 → 추가"
    exit 1
fi

echo ""
echo "언어 설정 완료!"
echo ""

echo "[3/4] Polylang REST API Helper 플러그인 설치 중..."
echo "-------------------------------"

# 커스텀 플러그인 파일 경로 (스크립트와 같은 디렉토리에 있어야 함)
CUSTOM_PLUGIN_FILE="$SCRIPT_DIR/polylang-rest-api-helper.php"

if [ ! -f "$CUSTOM_PLUGIN_FILE" ]; then
    echo "Error: Polylang REST API Helper 플러그인 파일을 찾을 수 없습니다."
    echo "경로: $CUSTOM_PLUGIN_FILE"
    echo ""
    echo "설정 방법:"
    echo "  cp wordpress-plugin/polylang-rest-api-helper.php scripts/wordpress-setup/"
    exit 1
fi

# WordPress 플러그인 디렉토리
PLUGINS_DIR="$SITE_DIR/wp-content/plugins"
CUSTOM_PLUGIN_DIR="$PLUGINS_DIR/polylang-rest-api-helper"

# 플러그인 디렉토리 생성
echo "플러그인 디렉토리 생성: $CUSTOM_PLUGIN_DIR"
mkdir -p "$CUSTOM_PLUGIN_DIR"

# 플러그인 파일 복사
echo "플러그인 파일 복사 중..."
cp "$CUSTOM_PLUGIN_FILE" "$CUSTOM_PLUGIN_DIR/polylang-rest-api-helper.php"

# 소유자 및 권한 설정
chown -R www-data:www-data "$CUSTOM_PLUGIN_DIR"
chmod 755 "$CUSTOM_PLUGIN_DIR"
chmod 644 "$CUSTOM_PLUGIN_DIR/polylang-rest-api-helper.php"

echo "파일 복사 완료!"

# 플러그인 활성화
echo "플러그인 활성화 중..."
sudo -u www-data wp plugin activate polylang-rest-api-helper

if [ $? -ne 0 ]; then
    echo "Error: Polylang REST API Helper 플러그인 활성화 실패"
    echo ""
    echo "수동 활성화 방법:"
    echo "  1. WordPress 관리자 → 플러그인"
    echo "  2. 'Polylang REST API Helper' 찾기 → 활성화"
    exit 1
fi

echo "플러그인 활성화 완료!"

# 플러그인 활성화 상태 확인
if sudo -u www-data wp plugin is-active polylang-rest-api-helper; then
    echo "✅ Polylang REST API Helper 플러그인이 활성화되었습니다."
else
    echo "Warning: 플러그인 활성화 상태를 확인할 수 없습니다."
fi

echo ""
echo "Polylang REST API Helper 설치 완료!"
echo ""

echo "[4/4] 설정 검증 중..."
echo "-------------------------------"

# 1. Polylang 플러그인 활성화 확인
echo "1. Polylang 플러그인 상태 확인..."
if sudo -u www-data wp plugin is-active polylang; then
    echo "   ✅ Polylang 활성화됨"
else
    echo "   ❌ Polylang 비활성화됨"
fi

# 2. 언어 목록 확인
echo "2. 언어 설정 확인..."
LANGUAGES=$(sudo -u www-data wp eval 'echo implode(", ", pll_languages_list());' 2>/dev/null || echo "")
if [ -n "$LANGUAGES" ]; then
    echo "   ✅ 설정된 언어: $LANGUAGES"
else
    echo "   ⚠️  언어 정보를 가져올 수 없습니다"
fi

# 3. Polylang REST API Helper 플러그인 활성화 확인
echo "3. Polylang REST API Helper 상태 확인..."
if sudo -u www-data wp plugin is-active polylang-rest-api-helper; then
    echo "   ✅ Polylang REST API Helper 활성화됨"
else
    echo "   ❌ Polylang REST API Helper 비활성화됨"
fi

# 4. REST API endpoint 테스트
echo "4. REST API endpoint 테스트..."
# 간단한 존재 확인 (실제 연결 테스트는 포스트 발행 시)
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/wp-json/polylang-helper/v1/link-translations" 2>/dev/null || echo "000")
if [ "$API_TEST" = "405" ] || [ "$API_TEST" = "401" ]; then
    # 405 = Method Not Allowed (POST 필요), 401 = Unauthorized (정상, 인증 필요)
    echo "   ✅ REST API endpoint 존재함 (HTTP $API_TEST)"
elif [ "$API_TEST" = "404" ]; then
    echo "   ❌ REST API endpoint 없음 (HTTP 404)"
else
    echo "   ⚠️  REST API 상태 확인 불가 (HTTP $API_TEST)"
fi

echo ""
echo "=================================="
echo "✅ Polylang 설정 완료!"
echo "=================================="
echo ""
echo "📊 설정 요약:"
echo "  - Polylang 버전: $POLYLANG_VERSION"
echo "  - 언어: 한국어(기본), English"
echo "  - REST API Helper: 활성화됨"
echo ""
echo "🚀 다음 단계:"
echo "  1. 블로그 포스트 발행:"
echo "     blog publish content/posts/ko/my-post.md"
echo ""
echo "  2. 다국어 연결:"
echo "     blog publish content/posts/en/my-post.md --link-to <한글포스트ID>"
echo "     또는"
echo "     blog link-translations --ko <한글ID> --en <영문ID>"
echo ""
echo "  3. WordPress 관리자에서 확인:"
echo "     https://$DOMAIN/wp-admin/admin.php?page=mlang"
echo ""
echo "=================================="

