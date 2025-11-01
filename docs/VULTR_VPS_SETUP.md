# Vultr VPS 생성 및 WordPress 설치 가이드

## 📋 목차
1. [Vultr 회원가입 및 크레딧](#1-vultr-회원가입)
2. [VPS 서버 생성](#2-vps-서버-생성)
3. [SSH 접속](#3-ssh-접속)
4. [WordPress 자동 설치](#4-wordpress-자동-설치)
5. [도메인 연결](#5-도메인-연결)
6. [테스트 및 확인](#6-테스트-및-확인)

---

## 1. Vultr 회원가입

### 1-1. 회원가입
```
1. https://www.vultr.com 접속
2. "Sign Up" 클릭
3. 이메일, 비밀번호 입력
4. 이메일 인증
```

### 1-2. 결제 정보 등록
```
옵션 1: 신용카드
- $10 최소 충전 (2개월 사용 가능)

옵션 2: PayPal
- $10 최소 충전

💡 프로모션 코드 검색하면 $100-300 무료 크레딧 가능
   (검색: "vultr promo code 2025")
```

---

## 2. VPS 서버 생성

### 2-1. Deploy 시작
```
1. Vultr 대시보드 로그인
2. 왼쪽 메뉴 "Products" → "+" 버튼 클릭
3. "Deploy New Server" 선택
```

### 2-2. 서버 스펙 선택

#### ① Choose Server Type
```
선택: Cloud Compute - Shared CPU
(가장 저렴하고 WordPress에 충분)
```

#### ② Choose Location
```
추천: Tokyo, Japan (도쿄)
이유: 한국과 가장 가까움 (레이턴시 ~50ms)

대안:
- Singapore (싱가포르): 레이턴시 ~80ms
- Seoul (서울): 현재 Vultr에는 없음
```

#### ③ Choose Image
```
선택: Ubuntu 22.04 LTS x64

❗ 중요: 반드시 22.04 또는 20.04 선택
(우리 스크립트는 이 버전만 지원)
```

#### ④ Choose Server Size
```
추천: $6/월 플랜
- CPU: 1 vCore
- RAM: 2 GB
- Storage: 55 GB SSD
- Bandwidth: 2 TB (무제한 인바운드)

💡 WordPress 블로그에 충분한 스펙
   월 10만 방문까지 문제없음
```

#### ⑤ Additional Features (선택사항)
```
✅ 추천 선택:
- Enable Auto Backups: +$1.20/월
  (일일 자동 백업, 복구 용이)

❌ 선택 안 함:
- IPv6
- Private Networking
- DDoS Protection (기본 제공됨)
```

#### ⑥ Server Hostname & Label
```
Hostname: blog.yourdomain.com
Label: wordpress-blog
(나중에 식별하기 쉽게)
```

### 2-3. 배포 완료
```
1. "Deploy Now" 클릭
2. 2-3분 대기 (Status: Running 될 때까지)
3. IP 주소 확인 (예: 123.45.67.89)
```

---

## 3. SSH 접속

### 3-1. SSH 정보 확인
```
1. Vultr 대시보드에서 생성한 서버 클릭
2. 확인할 정보:
   - IP Address: 123.45.67.89
   - Username: root
   - Password: (자동 생성된 비밀번호)
```

### 3-2. 로컬에서 SSH 접속

#### macOS/Linux
```bash
# 터미널 열기
ssh root@123.45.67.89

# 비밀번호 입력 (Vultr에서 복사)
# 처음 접속 시 fingerprint 확인 → yes 입력
```

#### Windows
```bash
# PowerShell 또는 CMD
ssh root@123.45.67.89

# 또는 PuTTY 사용:
# Host: 123.45.67.89
# Port: 22
# Username: root
# Password: (Vultr 비밀번호)
```

### 3-3. 접속 확인
```bash
# 접속 성공하면 이런 화면:
root@vultr:~#

# 우분투 버전 확인
lsb_release -a
# → Ubuntu 22.04 확인
```

---

## 4. WordPress 자동 설치

### 4-1. 로컬에서 스크립트 패키징

```bash
# 로컬 터미널 (blog 프로젝트 루트에서)
cd /Users/idongho/proj/blog

# config.sh 설정 (필수!)
vim scripts/wordpress-setup/config.sh
```

#### config.sh 수정 예시
```bash
#!/bin/bash
# WordPress 설치 설정

# 실제 도메인으로 변경 (DNS 설정 완료된 도메인)
# 또는 테스트용: blog.yourname.com
DOMAIN="blog.example.com"

# 실제 이메일로 변경 (Let's Encrypt 알림 수신)
ADMIN_EMAIL="your-email@gmail.com"

# WordPress 관리자 계정
ADMIN_USER="admin"
ADMIN_PASSWORD="YourSecurePassword123!@#"

# Avada 테마 (이미 복사됨)
AVADA_THEME_ZIP="avada.zip"
```

**⚠️ 중요:**
- `DOMAIN`: 실제 도메인 또는 IP 주소 (DNS 설정 필요)
- `ADMIN_PASSWORD`: 강력한 비밀번호로 변경!

#### 패키징
```bash
# wordpress-setup 디렉토리를 압축
cd scripts
tar -czf wordpress-setup.tar.gz wordpress-setup/

# 확인
ls -lh wordpress-setup.tar.gz
# → 약 9.5MB (avada.zip 포함)
```

### 4-2. VPS로 업로드

```bash
# 로컬 터미널에서 (scripts 디렉토리에서)
scp wordpress-setup.tar.gz root@123.45.67.89:/root/

# 비밀번호 입력
# 업로드 완료: wordpress-setup.tar.gz 100% 9.5MB
```

### 4-3. VPS에서 설치 실행

```bash
# SSH 접속된 VPS 터미널에서
cd /root

# 압축 해제
tar -xzf wordpress-setup.tar.gz

# 디렉토리 확인
ls wordpress-setup/
# → config.sh  setup-theme.sh  setup-wordops.sh  setup.sh  avada.zip

# 설치 실행 (5-10분 소요)
cd wordpress-setup
sudo bash setup.sh
```

### 4-4. 설치 진행 과정
```bash
============================================
  WordPress 서버 자동 설치 시작
============================================

이 스크립트는 다음 작업을 수행합니다:
  1. WordOps 설치
  2. WordPress 사이트 생성 (LEMP + SSL + 캐싱)
  3. Avada 테마 설치 및 활성화

예상 소요 시간: 5-10분
============================================

계속 진행하시겠습니까? (y/N): y

# ↓ 자동 진행
[1/2] WordOps 설치 중...
[2/2] WordPress 사이트 생성 중...
[1/2] Avada 테마 업로드 중...
[2/2] Avada 테마 활성화 중...

============================================
  🎉 모든 설치가 완료되었습니다!
============================================
```

---

## 5. 도메인 연결

### 5-1. DNS 설정 (필수)

#### 도메인이 있는 경우
```
1. 도메인 DNS 관리 페이지 접속
   (Cloudflare, Cafe24, GoDaddy 등)

2. A 레코드 추가:
   Type: A
   Name: @ (또는 blog)
   Value: 123.45.67.89 (VPS IP)
   TTL: 자동 또는 3600

3. 저장 후 전파 대기 (5분-1시간)
```

#### 도메인이 없는 경우 (테스트)
```
IP 주소로 직접 접속 가능하나 SSL 안 됨
→ http://123.45.67.89

실제 운영은 도메인 필수!
```

### 5-2. DNS 전파 확인
```bash
# 로컬 터미널에서
nslookup blog.example.com

# 또는
dig blog.example.com

# VPS IP가 나오면 성공
```

---

## 6. 테스트 및 확인

### 6-1. WordPress 사이트 접속
```bash
# 브라우저에서
https://blog.example.com

# ✅ 확인사항:
- SSL 인증서 자동 적용 (자물쇠 아이콘)
- Avada 테마 적용
- 빠른 로딩 속도 (1-2초)
```

### 6-2. 관리자 페이지 로그인
```bash
# 브라우저에서
https://blog.example.com/wp-admin

# 로그인 정보 (config.sh에 설정한 값)
Username: admin
Password: YourSecurePassword123!@#
```

### 6-3. 설치 확인 체크리스트
```
✅ WordPress 접속 성공
✅ SSL (HTTPS) 적용 확인
✅ 관리자 로그인 성공
✅ Avada 테마 활성화 확인
✅ 페이지 로딩 속도 1-2초
```

---

## 7. 다음 단계: blog CLI 테스트

### 7-1. 로컬에서 WordPress 연결 설정
```bash
# 로컬 프로젝트 루트에서
cd /Users/idongho/proj/blog

# .env 파일 수정
vim .env
```

#### .env 설정
```bash
# WordPress 연결 설정
WORDPRESS_URL=https://blog.example.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=생성한_애플리케이션_비밀번호

# 광고 설정 (선택)
ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
ADSENSE_SLOT_ID=xxxxxxxxxx
```

### 7-2. WordPress Application Password 생성
```
1. WordPress 관리자 페이지 로그인
2. 사용자 → 프로필
3. "Application Passwords" 섹션
4. 새 애플리케이션 이름: "blog-cli"
5. "Add New Application Password" 클릭
6. 생성된 비밀번호 복사 (공백 제거)
7. .env 파일의 WORDPRESS_APP_PASSWORD에 붙여넣기
```

### 7-3. 테스트 포스트 발행
```bash
# 로컬 터미널
cd /Users/idongho/proj/blog

# 테스트 포스트 작성
cat > content/posts/ko/test-post.md << 'EOF'
---
title: "VPS WordPress 설치 테스트"
slug: "vps-wordpress-test"
excerpt: "Vultr VPS에 WordPress 자동 설치 성공!"
status: "publish"
categories:
  - "기술"
tags:
  - "WordPress"
  - "VPS"
language: "ko"
---

# 테스트 포스트

Vultr VPS에 WordPress를 자동으로 설치했습니다!

- WordOps 설치 ✅
- Avada 테마 ✅
- SSL 인증서 ✅
- Redis 캐싱 ✅

빠르고 간단합니다!
EOF

# blog CLI로 발행
pnpm build
pnpm --filter @blog/cli start publish content/posts/ko/test-post.md
```

### 7-4. 발행 확인
```bash
# 브라우저에서
https://blog.example.com

# 새 포스트 확인
# → "VPS WordPress 설치 테스트" 포스트 보임
```

---

## 🎯 트러블슈팅

### 문제 1: DNS 전파 안 됨
```bash
# 증상: 도메인 접속 안 됨

# 해결:
1. DNS 설정 재확인 (A 레코드 정확한지)
2. 1-2시간 대기
3. 급하면 /etc/hosts 수정 (임시)
```

### 문제 2: SSL 인증서 발급 실패
```bash
# 증상: HTTPS 접속 안 됨

# 해결:
# VPS SSH 접속 후
sudo wo site update blog.example.com --letsencrypt

# 또는 수동 발급
sudo certbot --nginx -d blog.example.com
```

### 문제 3: 메모리 부족
```bash
# 증상: 사이트 느림, 502 에러

# 해결:
# VPS에서 swap 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 적용
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 문제 4: Avada 테마 활성화 실패
```bash
# 증상: 테마가 Twenty Twenty-Three

# 해결:
# VPS SSH에서
cd /var/www/blog.example.com/htdocs
sudo -u www-data wp theme activate Avada
```

---

## 💰 비용 계산

### Vultr 월 비용
```
서버: $6/월
자동 백업: $1.20/월 (선택)
─────────────
총: $7.20/월

연간: $86.4
```

### 추가 비용
```
도메인: $10-15/년 (Namecheap, Cloudflare)
Avada 테마: $69 (평생, 이미 보유)
─────────────
첫 해 총: ~$110
```

---

## ✅ 완료 체크리스트

설치 완료 후 확인:
- [ ] Vultr VPS 생성 완료
- [ ] SSH 접속 성공
- [ ] WordPress 자동 설치 완료
- [ ] 도메인 DNS 설정 완료
- [ ] HTTPS 접속 확인
- [ ] Avada 테마 활성화
- [ ] 관리자 로그인 성공
- [ ] blog CLI 연동 완료
- [ ] 테스트 포스트 발행 성공

---

## 🚀 다음 단계

VPS 설치가 완료되면:

1. **콘텐츠 작성 시작**: blog CLI로 마크다운 → WordPress 발행
2. **성능 최적화**: Redis 캐싱 확인, Cloudflare CDN 연동
3. **SEO 설정**: Yoast SEO 플러그인 설치
4. **Google Analytics 연동**: 트래픽 분석
5. **AdSense 설정**: 광고 수익 시작

---

**작성일**: 2025-10-31
**버전**: 1.0
