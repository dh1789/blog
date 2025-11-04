#!/bin/bash
set -e

# 기존 WordPress에 Polylang만 추가하는 스크립트
# 사용법: bash install-polylang-only.sh YOUR_VPS_IP YOUR_DOMAIN

if [ $# -lt 2 ]; then
    echo "사용법: bash install-polylang-only.sh VPS_IP DOMAIN"
    echo ""
    echo "예시:"
    echo "  bash install-polylang-only.sh 123.456.78.90 beomanro.com"
    echo ""
    exit 1
fi

VPS_IP="$1"
DOMAIN="$2"

echo "============================================"
echo "  기존 WordPress에 Polylang 추가"
echo "============================================"
echo "VPS IP: $VPS_IP"
echo "도메인: $DOMAIN"
echo "============================================"
echo ""

read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "설치를 취소합니다."
    exit 0
fi

echo ""
echo "[1/4] 필요한 파일 압축 중..."
echo "-------------------------------"

# 임시 디렉토리 생성
TEMP_DIR=$(mktemp -d)
echo "임시 디렉토리: $TEMP_DIR"

# config.sh 생성
cat > "$TEMP_DIR/config.sh" << EOF
#!/bin/bash
DOMAIN="$DOMAIN"
ADMIN_EMAIL="admin@example.com"
ADMIN_USER="admin"
ADMIN_PASSWORD="unused"
AVADA_THEME_ZIP="Avada.zip"
EOF

# 필요한 파일 복사
cp setup-polylang.sh "$TEMP_DIR/"
cp add-languages.php "$TEMP_DIR/"
cp polylang-rest-api-helper.php "$TEMP_DIR/"

# 권한 설정
chmod +x "$TEMP_DIR/config.sh"
chmod +x "$TEMP_DIR/setup-polylang.sh"

# 압축
cd "$TEMP_DIR"
tar -czf polylang-only.tar.gz *
cd - > /dev/null

echo "압축 완료: $TEMP_DIR/polylang-only.tar.gz"
echo ""

echo "[2/4] VPS에 업로드 중..."
echo "-------------------------------"
scp "$TEMP_DIR/polylang-only.tar.gz" "root@$VPS_IP:/tmp/"

if [ $? -ne 0 ]; then
    echo "Error: VPS 업로드 실패"
    echo "SSH 접속이 가능한지 확인하세요: ssh root@$VPS_IP"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "업로드 완료!"
echo ""

echo "[3/4] VPS에서 Polylang 설치 실행 중..."
echo "-------------------------------"
echo "⚠️  주의: 기존 WordPress 콘텐츠는 유지됩니다."
echo ""

ssh -t "root@$VPS_IP" << 'REMOTE_SCRIPT'
cd /tmp
tar -xzf polylang-only.tar.gz
sudo bash setup-polylang.sh
rm -f polylang-only.tar.gz
REMOTE_SCRIPT

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Polylang 설치 실패"
    echo "수동으로 확인하려면: ssh root@$VPS_IP"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo ""
echo "[4/4] 정리 중..."
echo "-------------------------------"
rm -rf "$TEMP_DIR"
echo "임시 파일 삭제 완료"
echo ""

echo "============================================"
echo "  ✅ Polylang 설치 완료!"
echo "============================================"
echo ""
echo "🎉 다음 단계:"
echo ""
echo "1. WordPress 관리자 확인:"
echo "   https://$DOMAIN/wp-admin/plugins.php"
echo "   → Polylang 플러그인 활성화 확인"
echo ""
echo "2. 언어 설정 확인:"
echo "   https://$DOMAIN/wp-admin/admin.php?page=mlang"
echo "   → 한국어(기본), English 확인"
echo ""
echo "3. CLI 테스트:"
echo "   blog publish content/posts/ko/my-post.md"
echo "   blog publish content/posts/en/my-post.md --link-to <한글ID>"
echo ""
echo "============================================"
