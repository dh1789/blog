---
title: "도메인 구매 및 Cloudflare 무료 SSL 설정: 보안과 속도를 한 번에 확보하기"
slug: "domain-cloudflare-ssl-setup"
excerpt: "Namecheap에서 도메인을 구매하고 Cloudflare 무료 CDN과 SSL을 설정하는 완벽 가이드. DNS 전파부터 A 레코드 설정까지 단계별로 따라하면 20분 안에 WordPress 설치 준비가 완료됩니다."
status: "draft"
categories:
  - "도메인"
  - "보안"
  - "CDN"
tags:
  - "도메인 구매"
  - "Cloudflare"
  - "무료 SSL"
  - "CDN"
  - "DNS 설정"
  - "Namecheap"
language: "ko"
---

# 도메인 구매 및 Cloudflare 무료 SSL 설정: 보안과 속도를 한 번에

> 이 포스트는 "프리미엄 WordPress 블로그 완벽 구축 가이드" 시리즈의 3편입니다.
>
> **시리즈 구성**:
> 1. [블로그 시작 가이드 - 목표 설정과 기술 스택 선택](#)
> 2. [Vultr VPS 생성 완벽 가이드](#) ← 이전
> 3. **[현재 글]** 도메인 + Cloudflare 설정
> 4. WordPress + Avada 테마 완벽 세팅 (다음)

## 20분 만에 도메인 + CDN + SSL 확보하기

[2편](링크)에서 우리는 Vultr VPS Seoul 리전을 생성하고 기본 보안 설정을 완료했습니다. 이제 블로그에 접속할 수 있는 **도메인**과 전 세계 어디서나 빠른 속도를 보장하는 **Cloudflare CDN**, 그리고 Google이 요구하는 **HTTPS 암호화**를 설정하겠습니다.

### 왜 WordPress 설치 전에 도메인을 먼저 설정하나요?

1. **DNS 전파 시간 절약**: DNS 설정 후 전 세계 전파까지 1-24시간 소요. 미리 설정하면 WordPress 설치 시 바로 사용 가능
2. **SSL 인증서 준비**: Cloudflare에서 SSL 인증서를 미리 발급받아 WordPress 설치 시 즉시 HTTPS 적용
3. **Cloudflare CDN**: 처음부터 전 세계 300+ 데이터센터를 통해 빠른 속도 확보

**이 가이드에서 배울 내용**:
- ✅ 도메인 등록 업체 비교 및 Namecheap 선택 이유
- ✅ 도메인 구매 4단계 ($10.98/년)
- ✅ Cloudflare 무료 CDN + DDoS + SSL 설정
- ✅ DNS 네임서버 변경 및 전파 확인
- ✅ DNS A 레코드로 VPS 연결

**예상 소요 시간**: 20분 (+ DNS 전파 대기 1-2시간)

---

## 1. 도메인 등록 업체 비교 - 왜 Namecheap인가?

도메인은 블로그의 주소입니다. 적절한 등록 업체 선택이 중요합니다.

### 주요 도메인 등록 업체 비교

| 항목 | Namecheap | GoDaddy | Cloudflare Registrar |
|------|-----------|---------|---------------------|
| **.com 첫 해 가격** | $10.98 | $15-20 | $8-9 (원가) |
| **갱신 가격** | $12.98 | $20-25 | $8-9 |
| **WHOIS 보호** | ✅ 무료 | ❌ $10/년 추가 | ✅ 무료 |
| **한국어 지원** | ❌ 영어만 | ✅ 한국어 | ❌ 영어만 |
| **UI** | 직관적 | 복잡 (업셀링 많음) | 간단 |
| **신규 등록** | ✅ 가능 | ✅ 가능 | ❌ 불가 (이전만) |
| **결제 수단** | 카드, PayPal | 카드, PayPal | 카드 필수 |

### Namecheap을 선택해야 하는 4가지 이유

#### 1. 가격 경쟁력

**첫 해 비용**:
- Namecheap: **$10.98**
- GoDaddy: $15-20 (40-50% 비쌈)
- Cloudflare: $8-9 (가장 저렴하지만 신규 등록 불가)

**갱신 비용**:
- Namecheap: **$12.98/년**
- GoDaddy: $20-25/년 (거의 2배!)
- Cloudflare: $8-9/년

**결론**: Namecheap은 Cloudflare보다 약간 비싸지만 **신규 도메인 등록이 가능**하므로 첫 블로그에 최적입니다.

#### 2. WHOIS 보호 무료

**WHOIS란?**
도메인 등록 시 제공하는 개인정보 (이름, 이메일, 전화번호, 주소)가 공개 데이터베이스에 등록됩니다. WHOIS 보호는 이 정보를 숨겨줍니다.

**WHOIS 보호가 중요한 이유**:
- **스팸 방지**: 이메일, 전화 스팸 차단
- **도메인 스캠 방지**: 도메인 만료 전 사기 이메일 차단
- **개인정보 보호**: 이름, 주소 공개 방지

**비용 비교**:
- Namecheap: **무료** ✅
- GoDaddy: **$10/년 추가** ❌
- Cloudflare: 무료

#### 3. 직관적인 UI

**Namecheap**:
- 초보자도 5분 내 도메인 구매 가능
- 불필요한 업셀링 최소화 (이메일, 호스팅, SSL 등)
- DNS 설정 간편

**GoDaddy의 문제점**:
- 공격적인 업셀링 (체크아웃 시 수십 개 옵션)
- 복잡한 대시보드
- 높은 갱신 가격

#### 4. Cloudflare와 쉬운 연동

Namecheap에서 구매한 도메인을 Cloudflare와 연동하는 것은 매우 간단합니다:
- 네임서버 변경: **2분**
- 자동 DNS 레코드 임포트
- 즉시 CDN + SSL 활성화

### Cloudflare Registrar의 한계

Cloudflare는 2018년부터 도메인 등록 서비스를 제공하지만:
- ❌ **신규 도메인 등록 불가** (다른 업체에서 이전만 가능)
- ❌ 신용카드 필수 (PayPal 불가)
- ❌ 60일 락 기간 (이전 후 60일간 재이전 불가)

**결론**: 첫 블로그라면 Namecheap에서 구매 → 나중에 Cloudflare로 이전 (선택)

---

## 2. Namecheap에서 도메인 구매하기 (4단계)

### Step 1: 도메인 검색

1. https://namecheap.com 접속
2. 검색창에 원하는 도메인 입력
   - 예: `myblog.com`
3. 검색 결과 확인:
   - ✅ **Available**: 즉시 구매 가능
   - ❌ **Taken**: 사용 중 (대안 제안 확인)

#### 좋은 도메인 선택 팁

**DO (추천)**:
- ✅ **.com 최우선**: SEO, 신뢰성, 국제적 인지도 최고
- ✅ **짧을수록 좋음**: 10자 이하 추천
- ✅ **기억하기 쉬움**: 발음하기 쉬운 단어
- ✅ **브랜드 가능성**: 독특하고 기억에 남는 이름

**DON'T (피해야 함)**:
- ❌ 숫자 포함: `myblog123.com`
- ❌ 하이픈 포함: `my-blog.com`
- ❌ 한글 도메인: `내블로그.com` (국제적 확장성 제한)
- ❌ 너무 긴 이름: `myawesomepersonalblog.com`

---

### Step 2: 카트에 담기 및 옵션 선택

도메인을 카트에 담으면 **추가 옵션 선택** 화면이 나옵니다.

#### 필수 옵션 (반드시 활성화)

- ✅ **WhoisGuard (WHOIS 보호)**: 무료, 반드시 활성화 ✅
- ✅ **Auto-Renew (자동 갱신)**: 활성화 (도메인 만료 방지)

#### 불필요한 옵션 (모두 거부)

- ❌ **PremiumDNS** ($4.88/년): Cloudflare 무료 DNS 사용 예정
- ❌ **Email Hosting** ($9.88/년): Gmail 무료로 충분
- ❌ **SSL Certificate** ($8.88/년): Cloudflare 무료 SSL 사용 예정
- ❌ **Domain Privacy** ($0 - 이미 WhoisGuard 포함)

#### 등록 기간 선택

| 기간 | 비용 | 추천 여부 |
|------|------|----------|
| **1년** | $10.98 | ✅ 추천 (유연성) |
| 2년 | $23.96 (갱신 가격) | 괜찮음 |
| 5년 | $64.90 | 장기 확신 시 |

**추천**: **1년 등록** 후 필요 시 연장. 블로그 운영을 시작해보고 결정하세요.

---

### Step 3: 계정 생성 및 결제

1. **Namecheap 계정 생성**
   - 이메일 주소, 비밀번호 입력
   - 이메일 인증 (받은 편지함 확인)

2. **결제 정보 입력**
   - 신용카드 또는 PayPal 선택
   - 청구 주소 입력 (한글 OK, 영문 권장)

3. **주문 완료**
   - "Confirm Order" 클릭
   - 주문 확인 이메일 수신

**총 비용**: **$10.98** (첫 해 .com 도메인)

---

### Step 4: 도메인 확인

1. Namecheap 대시보드 → **Domain List**
2. 구매한 도메인 상태 확인: **"Active"** ✅
3. WHOIS 보호 확인: **"Enabled"** ✅

### 체크포인트

작업을 완료했는지 확인하세요:
- [ ] 도메인 구매 완료 (예: myblog.com)
- [ ] WHOIS 보호 활성화 확인
- [ ] 자동 갱신 설정 확인

---

## 3. Cloudflare 계정 생성 및 도메인 연결 (5단계)

### Cloudflare란?

**Cloudflare**는 전 세계 300+ 데이터센터를 운영하는 CDN 및 보안 서비스입니다.

#### 무료 플랜 (Free)에 포함된 서비스

- **CDN (Content Delivery Network)**: 전 세계 사용자에게 빠른 콘텐츠 배포
- **DDoS 보호**: 무제한 DDoS 공격 방어
- **SSL/TLS 암호화**: 무료 SSL 인증서
- **DNS 관리**: 초고속 DNS (1.1.1.1)
- **Web Application Firewall (WAF)**: 기본 방화벽

#### 유료 플랜 (참고)

- **Pro**: $20/월 (고급 WAF, 이미지 최적화)
- **Business**: $200/월 (우선 지원, 고급 DDoS)

**결론**: **Free 플랜으로 충분합니다!** 제 블로그 [beomanro.com](https://beomanro.com)도 Free 플랜을 사용 중이며, 월 5,000명 트래픽을 문제없이 처리하고 있습니다.

---

### Step 1: Cloudflare 계정 생성

1. https://cloudflare.com 접속
2. 우측 상단 **"Sign Up"** 클릭
3. 이메일 주소 및 비밀번호 입력
4. 이메일 인증 완료

---

### Step 2: 사이트 추가

1. 대시보드에서 **"Add a Site"** 버튼 클릭
2. 도메인 입력 (예: `myblog.com`)
3. **"Add Site"** 클릭

---

### Step 3: 플랜 선택

1. **Free** 플랜 선택 ($0/월) ✅
2. **"Continue"** 클릭

---

### Step 4: DNS 레코드 스캔

Cloudflare가 기존 DNS 레코드를 자동으로 스캔합니다.
- 첫 도메인이므로 레코드 없음 (정상)
- **"Continue"** 클릭

---

### Step 5: 네임서버 확인

Cloudflare가 제공하는 **2개의 네임서버**가 표시됩니다:

```
abcd.ns.cloudflare.com
efgh.ns.cloudflare.com
```

(실제 네임서버는 계정마다 다릅니다)

**중요**: 이 네임서버 2개를 **복사해두세요!** 다음 섹션에서 Namecheap에 입력해야 합니다.

### 체크포인트

작업을 완료했는지 확인하세요:
- [ ] Cloudflare 계정 생성 완료
- [ ] 도메인 추가 완료 (예: myblog.com)
- [ ] Free 플랜 선택 완료
- [ ] 네임서버 2개 복사 완료

---

## 4. 네임서버 변경 및 DNS 전파 확인

### Step 1: Namecheap에서 네임서버 변경

1. Namecheap 대시보드 → **Domain List**
2. 도메인 옆 **"Manage"** 버튼 클릭
3. **"Nameservers"** 섹션 찾기
4. 드롭다운에서 **"Custom DNS"** 선택
5. Cloudflare 네임서버 2개 입력:
   ```
   Nameserver 1: abcd.ns.cloudflare.com
   Nameserver 2: efgh.ns.cloudflare.com
   ```
6. ✅ 체크 버튼 클릭 (저장)

---

### Step 2: DNS 전파 대기

네임서버 변경 후 **DNS 전파**까지 시간이 소요됩니다:
- **빠르면**: 5-10분
- **평균**: 1-2시간
- **최대**: 24시간 (매우 드문 경우)

#### DNS 전파 확인 방법

**방법 1: dig 명령어 (Mac/Linux)**

```bash
dig myblog.com NS

# 출력 예시:
# ;; ANSWER SECTION:
# myblog.com.  3600  IN  NS  abcd.ns.cloudflare.com.
# myblog.com.  3600  IN  NS  efgh.ns.cloudflare.com.
```

**방법 2: nslookup 명령어 (Windows)**

```bash
nslookup -type=NS myblog.com

# 출력에서 Cloudflare 네임서버 확인
```

**방법 3: 온라인 도구**

- https://dnschecker.org 접속
- 도메인 입력 → **NS** 레코드 선택 → **Check**
- 전 세계 DNS 서버에서 Cloudflare 네임서버 확인

---

### Step 3: Cloudflare에서 확인

1. Cloudflare 대시보드 → **Overview**
2. **Status** 확인:
   - ⏳ **Pending Nameserver Update**: DNS 전파 대기 중
   - ✅ **Active**: 완료! Cloudflare가 활성화되었습니다

**DNS 전파 완료 시 Cloudflare에서 이메일을 발송합니다.**

### 체크포인트

작업을 완료했는지 확인하세요:
- [ ] Namecheap에서 네임서버 변경 완료
- [ ] DNS 전파 확인 (dig 또는 dnschecker.org)
- [ ] Cloudflare 상태 **"Active"** 확인

---

## 5. SSL/TLS 모드 설정 및 DNS A 레코드

### SSL/TLS 모드 설정

HTTPS 암호화는 Google SEO 필수 요소이며, 사용자 신뢰를 높입니다.

#### Cloudflare SSL 모드 4가지

1. **Off**: 암호화 없음 (절대 사용 금지!) ❌
2. **Flexible**: 사용자 ↔ Cloudflare만 암호화 (비추천) ⚠️
3. **Full**: 양방향 암호화, 자체 서명 인증서 허용
4. **Full (strict)**: 양방향 암호화, 유효한 인증서 필수 ✅ **권장**

#### Full (strict) 모드 설정

1. Cloudflare 대시보드 → **SSL/TLS**
2. **Overview** → **Encryption mode**
3. **"Full (strict)"** 선택 ✅

⚠️ **주의**: 아직 VPS에 SSL 인증서가 없어도 괜찮습니다!
- 다음 포스트 (Post 4)에서 **Cloudflare Origin Certificate**를 생성하여 VPS에 설치할 예정입니다
- 지금은 모드만 선택해두세요

---

### DNS A 레코드 설정 (VPS IP 연결)

이제 도메인과 VPS를 연결하는 **가장 중요한 단계**입니다.

#### Step 1: VPS IP 주소 확인

1. Vultr 대시보드 → 서버 선택
2. **IP Address** 복사 (예: `123.456.78.90`)

#### Step 2: Cloudflare A 레코드 추가

1. Cloudflare → **DNS** → **Records**
2. **"Add record"** 버튼 클릭
3. 다음과 같이 설정:
   - **Type**: A
   - **Name**: @ (루트 도메인, `myblog.com`)
   - **IPv4 address**: VPS IP 주소 입력
   - **Proxy status**: ☁️ **Proxied** (주황색 구름) ✅
   - **TTL**: Auto
4. **"Save"** 클릭

#### Step 3: www 서브도메인 추가 (선택 사항)

`www.myblog.com`도 작동하도록 CNAME 레코드를 추가합니다:

1. **"Add record"** 다시 클릭
2. 다음과 같이 설정:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: @ (또는 `myblog.com`)
   - **Proxy status**: ☁️ **Proxied**
3. **"Save"** 클릭

---

### Proxied vs DNS Only

DNS A 레코드 추가 시 **Proxy status**를 선택해야 합니다:

#### ☁️ Proxied (권장) ✅

- Cloudflare CDN 활성화
- DDoS 보호 활성화
- 실제 VPS IP 숨김 (보안 강화)
- SSL/TLS 적용
- 전 세계 300+ 서버에서 콘텐츠 배포

#### 🔗 DNS Only

- Cloudflare CDN 비활성화
- 실제 VPS IP 노출
- 직접 연결 (CDN 없어 약간 느림)

**결론**: 항상 **Proxied** 모드를 사용하세요! ☁️

---

### DNS A 레코드 전파 확인

```bash
# VPS IP 확인
dig myblog.com A

# 출력 예시:
# ;; ANSWER SECTION:
# myblog.com.  300  IN  A  104.21.xxx.xxx
# (Cloudflare IP가 표시됨, Proxied 모드이므로 Cloudflare의 IP가 나옴)

# 실제 연결 테스트
ping myblog.com
# Cloudflare IP로 응답하면 성공!
```

### 체크포인트

작업을 완료했는지 확인하세요:
- [ ] SSL/TLS 모드 **"Full (strict)"** 설정
- [ ] DNS A 레코드 추가 (@ → VPS IP)
- [ ] Proxy status **"Proxied"** (☁️ 주황색 구름) 확인
- [ ] www CNAME 레코드 추가 (선택)
- [ ] dig로 A 레코드 전파 확인

---

## 마무리: 우리가 완성한 것

축하합니다! 🎉 20분 만에 도메인 + CDN + SSL을 완벽히 설정했습니다.

### 완성한 작업

- ✅ **Namecheap에서 도메인 구매** ($10.98/년)
- ✅ **WHOIS 보호 활성화** (개인정보 보호)
- ✅ **Cloudflare 무료 CDN + DDoS 보호 설정**
- ✅ **SSL/TLS 모드 "Full (strict)" 설정**
- ✅ **DNS A 레코드로 VPS 연결 완료**

### 도메인 준비 완료!

이제 WordPress를 설치할 모든 준비가 끝났습니다. DNS 전파가 완료되는 동안 (1-2시간) 잠시 휴식을 취하거나 다음 포스트를 미리 읽어보세요.

---

## 다음 단계: WordPress + Avada 테마 완성

**4편 (마지막 편)에서 배울 내용**:
- **WordOps 원라이너 설치**: WordPress 자동화 도구 (EasyEngine 후속)
- **WordPress 사이트 생성**: `wo site create myblog.com --wp --redis`
- **Redis 캐싱 설명**: FastCGI vs Object Cache 차이 (10배 속도!)
- **Cloudflare Origin Certificate**: 15년 유효 SSL 인증서 생성 및 Nginx 설정
- **Avada 테마 설치**: ThemeForest #1, Fusion Builder 포함 ($60, 평생 라이선스)
- **성능 최적화**: PageSpeed 90점 이상 달성
- **beomanro.com 설정 공유**: 실제 운영 중인 블로그의 모든 설정

### DNS 전파 완료 확인 후 진행하세요

다음 작업 전 체크:
- [ ] DNS 전파 완료 (1-2시간 대기)
- [ ] Cloudflare 상태 **"Active"** 확인
- [ ] VPS SSH 접속 가능 확인: `ssh root@VPS_IP`
- [ ] `ping myblog.com` 응답 확인

DNS 전파가 완료되면 바로 4편으로 넘어가세요!

---

### 비용 요약 (시리즈 3편까지)

| 항목 | 비용 | 기간 | 프로모션 적용 후 |
|------|------|------|----------------|
| **Vultr VPS** | $6/월 | 평생 | **$0** (처음 4년, $300 크레딧) |
| **도메인 (Namecheap)** | $10.98 | 첫 해 | 할인 불가 |
| **Cloudflare** | $0 | 평생 | 무료 |
| **현재까지 총 비용** | **$10.98** | - | - |

**다음 편 추가 비용**: Avada 테마 $60 (1회, 평생 라이선스)
**최종 총 비용**: $70.98

---

**이 포스트가 도움이 되셨다면**:
- ⭐ 북마크에 추가하기
- 📧 이메일 뉴스레터 구독 (시리즈 마지막 편 알림)
- 💬 댓글로 질문 남기기 (24시간 내 답변)

**시리즈 전체 보기**:
1. [블로그 시작 가이드 - 목표 설정과 기술 스택 선택](#)
2. [Vultr VPS 생성 완벽 가이드](#)
3. **[현재 글]** 도메인 + Cloudflare 설정 ← 완료
4. WordPress + Avada 테마 완벽 세팅 (다음, 마지막)
