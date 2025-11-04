#!/bin/bash
set -euo pipefail

# WordPress 서버 자동 설치 메인 스크립트
# Ubuntu 20.04/22.04 LTS 전용

# 현재 스크립트의 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# root 권한 체크
if [ "$EUID" -ne 0 ]; then
    echo "Error: 이 스크립트는 root 권한으로 실행해야 합니다."
    echo "사용법: sudo bash setup.sh"
    exit 1
fi

echo "============================================"
echo "  WordPress 서버 자동 설치 시작"
echo "============================================"
echo ""
echo "이 스크립트는 다음 작업을 수행합니다:"
echo "  1. WordOps 설치"
echo "  2. WordPress 사이트 생성 (LEMP + SSL + 캐싱)"
echo "  3. Avada 테마 설치 및 활성화"
echo "  4. Polylang 다국어 플러그인 설정"
echo ""
echo "예상 소요 시간: 7-12분"
echo "============================================"
echo ""

read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "설치를 취소합니다."
    exit 0
fi

echo ""
echo "============================================"
echo "  단계 1/2: WordOps + WordPress 설치"
echo "============================================"
echo ""

# setup-wordops.sh 실행
bash "$SCRIPT_DIR/setup-wordops.sh"

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: WordOps 설치 실패"
    echo "로그를 확인하고 다시 시도해주세요."
    exit 1
fi

echo ""
echo "============================================"
echo "  단계 2/3: Avada 테마 설치"
echo "============================================"
echo ""

# setup-theme.sh 실행
bash "$SCRIPT_DIR/setup-theme.sh"

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Avada 테마 설치 실패"
    echo "WordPress는 정상적으로 설치되었으나 테마 설치에 실패했습니다."
    echo "관리자 페이지에서 수동으로 테마를 설치할 수 있습니다."
    exit 1
fi

echo ""
echo "============================================"
echo "  단계 3/3: Polylang 다국어 설정"
echo "============================================"
echo ""

# setup-polylang.sh 실행
bash "$SCRIPT_DIR/setup-polylang.sh"

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Polylang 설정 실패"
    echo "WordPress와 테마는 정상적으로 설치되었으나 Polylang 설정에 실패했습니다."
    echo "수동 설정 방법:"
    echo "  1. WordPress 관리자 → 플러그인 → 새로 추가"
    echo "  2. 'Polylang' 검색 → 설치 → 활성화"
    echo "  3. 언어 메뉴에서 한국어, English 추가"
    exit 1
fi

echo ""
echo "============================================"
echo "  🎉 모든 설치가 완료되었습니다!"
echo "============================================"
echo ""
echo "다음 단계:"
echo "  1. 브라우저에서 사이트 접속하여 확인"
echo "  2. 관리자 페이지 로그인"
echo "  3. Avada 테마 라이선스 등록"
echo "  4. blog CLI로 포스트 발행 및 다국어 연결"
echo "     - blog publish content/posts/ko/my-post.md"
echo "     - blog publish content/posts/en/my-post.md --link-to <한글ID>"
echo ""
echo "설치 정보는 config.sh 파일을 참조하세요."
echo "============================================"
