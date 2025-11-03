# 시리즈 [3/4]: 도메인 구매 및 Cloudflare 무료 SSL 설정 - 보안과 속도를 한 번에

> 이 포스트는 "프리미엄 WordPress 블로그 완벽 구축 가이드" 시리즈의 3편입니다.
> - 1편: [블로그로 수익 창출하기 - 시작 전 알아야 할 모든 것](#)
> - 2편: [Vultr VPS 생성 완벽 가이드](#)
> - **3편: 도메인 구매 및 Cloudflare SSL 설정** ← 현재
> - 4편: [WordPress + Avada 테마로 프리미엄 블로그 완성하기](#)

**작성일**: 2025-11-05
**예상 길이**: 1200-1500단어
**예상 작성 시간**: 2-2.5시간
**난이도**: 초급-중급
**SEO 목표**: 70점 이상

---

## Frontmatter

```yaml
title: "도메인 구매 및 Cloudflare 무료 SSL 설정: 보안과 속도를 한 번에 확보하기"
excerpt: "Namecheap에서 도메인을 구매하고 Cloudflare 무료 CDN과 SSL을 설정하는 완벽 가이드. DNS 전파부터 A 레코드 설정까지 단계별로 따라하면 WordPress 설치 준비가 완료됩니다."
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
status: publish
language: ko
```

---

## 아웃라인

### 서론 (150단어)

- **시리즈 진행 상황**
  - 1편: 블로그 목표 및 예산 계획 완료
  - 2편: Vultr VPS 생성 및 보안 설정 완료
  - 3편: 도메인 및 Cloudflare 설정 (현재)
- **왜 도메인을 먼저 설정하는가?**
  - DNS 전파 시간 절약 (1-24시간 소요 가능)
  - WordPress 설치 전에 SSL 준비
  - Cloudflare CDN으로 처음부터 빠른 속도
- **이 가이드에서 배울 내용**
  - 도메인 등록 업체 비교 및 Namecheap 선택
  - 도메인 구매 단계별 가이드
  - Cloudflare 무료 CDN 및 SSL 설정
  - DNS A 레코드로 VPS 연결

---

### Section 1: 도메인 등록 업체 비교 (300단어)

#### 주요 도메인 등록 업체 비교

| 항목 | Namecheap | GoDaddy | Cloudflare Registrar |
|------|-----------|---------|---------------------|
| **.com 가격** | $10.98/년 (첫 해) | $15-20/년 | $8-9/년 (원가) |
| **갱신 가격** | $12.98/년 | $20-25/년 | $8-9/년 |
| **WHOIS 보호** | ✅ 무료 | ❌ $10/년 추가 | ✅ 무료 |
| **한국어 지원** | ❌ 영어만 | ✅ 한국어 | ❌ 영어만 |
| **UI** | 직관적 | 복잡 (업셀링 많음) | 간단 |
| **신규 등록** | ✅ 가능 | ✅ 가능 | ❌ 불가 (이전만) |
| **결제 수단** | 카드, PayPal | 카드, PayPal | 카드 필수 |

#### Namecheap 추천 이유

**1. 가격 경쟁력**
- .com 도메인: $10.98/년 (첫 해), $12.98/년 (갱신)
- GoDaddy 대비 40-50% 저렴
- Cloudflare보다 비싸지만 신규 등록 가능

**2. WHOIS 보호 무료**
- 개인정보 보호 (이름, 이메일, 전화번호 숨김)
- GoDaddy는 연 $10 추가 비용
- 스팸 및 도메인 스캠 방지

**3. 직관적인 UI**
- 초보자도 5분 내 구매 가능
- 불필요한 업셀링 최소화
- DNS 설정 간편

**4. Cloudflare와 쉬운 연동**
- 네임서버 변경 2분이면 완료
- 자동 DNS 레코드 임포트

#### GoDaddy의 문제점
- 공격적인 업셀링 (이메일, 호스팅, SSL 등)
- 높은 갱신 가격 ($20-25/년)
- 복잡한 대시보드

#### Cloudflare Registrar의 한계
- 신규 도메인 등록 불가 (이전만 가능)
- 신용카드 필수 (PayPal 불가)
- 60일 락 기간 (이전 직후 60일간 재이전 불가)

#### 결론: Namecheap 선택
- 첫 블로그에 최적 (신규 등록 가능)
- 가격과 기능의 균형
- WHOIS 보호 무료로 개인정보 안전

---

### Section 2: 도메인 구매 단계별 가이드 (250단어)

#### Step 1: 도메인 검색

1. Namecheap (https://namecheap.com) 접속
2. 검색창에 원하는 도메인 입력
   - 예: `myblog.com`
3. 검색 결과 확인
   - ✅ 사용 가능: 즉시 구매 가능
   - ❌ 사용 중: 대안 제안 확인

**도메인 선택 팁**:
- **.com 최우선**: SEO, 신뢰성, 국제적 인지도
- **짧을수록 좋음**: 10자 이하 추천
- **기억하기 쉬움**: 발음하기 쉬운 단어
- **숫자/하이픈 피하기**: `my-blog-123.com` ❌
- **한글 도메인 피하기**: `내블로그.com` ❌ (국제적 확장성 제한)

#### Step 2: 카트에 담기 및 옵션 선택

**필수 옵션**:
- ✅ **WHOIS 보호**: 무료, 반드시 활성화
- ✅ **자동 갱신**: 활성화 (도메인 만료 방지)

**불필요한 옵션 (거부)**:
- ❌ PremiumDNS ($4.88/년): Cloudflare 무료 DNS 사용 예정
- ❌ Email Hosting ($9.88/년): Gmail 무료 사용 가능
- ❌ SSL 인증서 ($8.88/년): Cloudflare 무료 SSL 사용 예정

**1년 vs 다년 등록**:
- 1년: $10.98 (추천, 유연성)
- 2년: $23.96 (갱신 가격 적용)
- 5년: $64.90

**추천**: 1년 등록 후 필요 시 연장

#### Step 3: 계정 생성 및 결제

1. Namecheap 계정 생성
   - 이메일, 비밀번호 입력
   - 이메일 인증
2. 결제 정보 입력
   - 신용카드 또는 PayPal
   - 청구 주소 입력 (한글 OK, 영문 권장)
3. 주문 완료

**총 비용**: $10.98 (첫 해 .com 도메인)

#### Step 4: 도메인 확인

1. Namecheap 대시보드 → Domain List
2. 구매한 도메인 상태 확인: "Active"
3. WHOIS 보호 확인: "Enabled"

**체크포인트**:
- [ ] 도메인 구매 완료
- [ ] WHOIS 보호 활성화 확인
- [ ] 자동 갱신 설정 확인

---

### Section 3: Cloudflare 계정 생성 및 도메인 연결 (250단어)

#### Cloudflare란?

**무료 서비스**:
- **CDN (Content Delivery Network)**: 전 세계 300+ 서버에서 콘텐츠 배포
- **DDoS 보호**: 무제한 DDoS 공격 방어
- **SSL/TLS 암호화**: 무료 SSL 인증서
- **DNS 관리**: 초고속 DNS (1.1.1.1)
- **Web Application Firewall**: 기본 방화벽

**유료 플랜**:
- Pro ($20/월): 고급 WAF, 이미지 최적화
- Business ($200/월): 우선 지원, 고급 DDoS

**결론**: Free 플랜으로 충분! (beomanro.com도 Free 플랜 사용 중)

#### Step 1: Cloudflare 계정 생성

1. https://cloudflare.com 접속
2. "Sign Up" 클릭
3. 이메일 주소 및 비밀번호 입력
4. 이메일 인증

#### Step 2: 사이트 추가

1. "Add a Site" 버튼 클릭
2. 도메인 입력 (예: `myblog.com`)
3. "Add Site" 클릭

#### Step 3: 플랜 선택

1. **Free** 플랜 선택 ($0/월)
2. "Continue" 클릭

#### Step 4: DNS 레코드 스캔

Cloudflare가 기존 DNS 레코드를 자동으로 스캔합니다.
- 첫 도메인이므로 레코드 없음 (정상)
- "Continue" 클릭

#### Step 5: 네임서버 확인

Cloudflare가 제공하는 **2개의 네임서버** 기록:
```
abcd.ns.cloudflare.com
efgh.ns.cloudflare.com
```
(실제 네임서버는 계정마다 다름)

**중요**: 이 네임서버를 복사해두세요! (다음 섹션에서 사용)

**체크포인트**:
- [ ] Cloudflare 계정 생성 완료
- [ ] 도메인 추가 완료
- [ ] Free 플랜 선택 완료
- [ ] 네임서버 2개 복사 완료

---

### Section 4: 네임서버 변경 및 DNS 전파 확인 (200단어)

#### Step 1: Namecheap에서 네임서버 변경

1. Namecheap 대시보드 → Domain List
2. 도메인 옆 "Manage" 버튼 클릭
3. "Nameservers" 섹션 찾기
4. 드롭다운에서 **"Custom DNS"** 선택
5. Cloudflare 네임서버 2개 입력:
   ```
   Nameserver 1: abcd.ns.cloudflare.com
   Nameserver 2: efgh.ns.cloudflare.com
   ```
6. ✅ 체크 버튼 클릭 (저장)

#### Step 2: DNS 전파 대기

**DNS 전파 시간**:
- 빠르면: 5-10분
- 평균: 1-2시간
- 최대: 24시간 (드문 경우)

**DNS 전파 확인 방법**:

```bash
# 방법 1: dig 명령어 (Mac/Linux)
dig myblog.com NS

# 출력 예시:
# ;; ANSWER SECTION:
# myblog.com.  3600  IN  NS  abcd.ns.cloudflare.com.
# myblog.com.  3600  IN  NS  efgh.ns.cloudflare.com.

# 방법 2: nslookup 명령어 (Windows)
nslookup -type=NS myblog.com

# 출력에서 Cloudflare 네임서버 확인
```

**온라인 도구**:
- https://dnschecker.org (전 세계 DNS 전파 확인)
- 도메인 입력 → NS 레코드 선택 → Check

#### Step 3: Cloudflare에서 확인

1. Cloudflare 대시보드 → Overview
2. Status 확인:
   - ⏳ **Pending**: DNS 전파 대기 중
   - ✅ **Active**: 완료! Cloudflare 활성화됨

**전파 완료 시 Cloudflare에서 이메일 발송**

**체크포인트**:
- [ ] Namecheap에서 네임서버 변경 완료
- [ ] DNS 전파 확인 (dig 또는 dnschecker.org)
- [ ] Cloudflare 상태 "Active" 확인

---

### Section 5: SSL/TLS 모드 설정 및 DNS A 레코드 (250단어)

#### SSL/TLS 모드 설정

**Cloudflare SSL 모드 4가지**:

1. **Off**: 암호화 없음 (절대 사용 금지!)
2. **Flexible**: 사용자 ↔ Cloudflare만 암호화 (비추천)
3. **Full**: 양방향 암호화, 자체 서명 인증서 허용
4. **Full (strict)**: 양방향 암호화, 유효한 인증서 필수 ✅ **권장**

**Full (strict) 설정**:
1. Cloudflare 대시보드 → SSL/TLS
2. Overview → Encryption mode
3. **"Full (strict)"** 선택

**주의**: 아직 VPS에 SSL 인증서가 없어도 OK!
- 포스트 4에서 Cloudflare Origin Certificate 설정 예정
- 지금은 모드만 선택

#### DNS A 레코드 설정 (VPS IP 연결)

VPS와 도메인을 연결하는 핵심 단계!

**Step 1: VPS IP 주소 확인**
- Vultr 대시보드 → 서버 선택
- IP 주소 복사 (예: `123.456.78.90`)

**Step 2: Cloudflare A 레코드 추가**
1. Cloudflare → DNS → Records
2. "Add record" 버튼 클릭
3. 설정:
   - **Type**: A
   - **Name**: @ (루트 도메인, `myblog.com`)
   - **IPv4 address**: VPS IP 주소 입력
   - **Proxy status**: ☁️ Proxied (주황색 구름) ✅
   - **TTL**: Auto
4. "Save" 클릭

**www 서브도메인 추가 (선택)**:
1. "Add record" 다시 클릭
2. 설정:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: myblog.com (또는 @)
   - **Proxy status**: ☁️ Proxied
3. "Save" 클릭

#### Proxied vs DNS Only

- **☁️ Proxied (권장)**:
  - Cloudflare CDN 활성화
  - DDoS 보호 활성화
  - 실제 VPS IP 숨김
  - SSL/TLS 적용

- **🔗 DNS Only**:
  - Cloudflare CDN 비활성화
  - 실제 VPS IP 노출
  - 직접 연결 (속도 약간 느림)

**DNS A 레코드 전파 확인**:
```bash
# VPS IP 확인
dig myblog.com A

# 출력 예시:
# ;; ANSWER SECTION:
# myblog.com.  300  IN  A  104.21.xxx.xxx
# (Cloudflare IP, Proxied 모드이므로 Cloudflare의 IP 표시됨)

# 또는 실제 연결 테스트
ping myblog.com
```

**체크포인트**:
- [ ] SSL/TLS 모드 "Full (strict)" 설정
- [ ] DNS A 레코드 추가 (@ → VPS IP)
- [ ] Proxy status "Proxied" 확인
- [ ] www CNAME 레코드 추가 (선택)
- [ ] dig로 A 레코드 확인

---

### 결론 (150단어)

#### 지금까지 완성한 것

- ✅ Namecheap에서 도메인 구매 ($10.98/년)
- ✅ WHOIS 보호 활성화 (개인정보 보호)
- ✅ Cloudflare 무료 CDN 및 DDoS 보호 설정
- ✅ SSL/TLS 모드 "Full (strict)" 설정
- ✅ DNS A 레코드로 VPS 연결 완료

#### 도메인 준비 완료!

이제 WordPress를 설치할 모든 준비가 끝났습니다.

#### 다음 단계는?

**4편에서 배울 내용**:
- WordOps 원라이너 설치 (EasyEngine 후속)
- WordPress 사이트 생성 (`wo site create --wp --redis`)
- **Redis 캐싱 설명**: FastCGI vs Object Cache
- Cloudflare Origin Certificate 생성 및 Nginx SSL 설정
- Avada 테마 설치 (ThemeForest #1, Fusion Builder 포함)
- 성능 최적화 및 PageSpeed 측정

#### 비용 요약 (시리즈 3편까지)

- **VPS 비용**: $0 (프로모션 크레딧 $300 사용 중)
- **도메인 비용**: $10.98/년
- **Cloudflare**: 무료
- **현재까지 총 비용**: $10.98

#### 다음 작업 전 체크

- [ ] DNS 전파 완료 (1-2시간 대기)
- [ ] Cloudflare 상태 "Active" 확인
- [ ] VPS SSH 접속 가능 확인 (`ssh root@VPS_IP`)

DNS 전파가 완료되면 바로 4편으로 넘어가세요!

---

**다음 포스트 미리보기**: [4편: WordPress + Avada 테마로 프리미엄 블로그 완성하기](#)에서는 WordOps로 WordPress를 자동 설치하고, Avada 프리미엄 테마를 적용하여 블로그를 완성합니다. Redis 캐싱으로 10배 빠른 속도를 확보하고, PageSpeed 90점 이상을 달성하는 방법을 배웁니다!

> **시리즈 전체 목차**:
> - 1편: [블로그로 수익 창출하기 - 시작 전 알아야 할 모든 것](#)
> - 2편: [Vultr VPS 생성 완벽 가이드](#)
> - **3편: 도메인 구매 및 Cloudflare SSL 설정** ← 완료
> - 4편: [WordPress + Avada 테마로 프리미엄 블로그 완성하기](#) ← 다음

---

## 핵심 키워드 (SEO)

**Primary**: 도메인 구매, Cloudflare SSL, 무료 SSL 인증서
**Secondary**: Namecheap, DNS 설정, CDN, WHOIS 보호
**Long-tail**: Namecheap 도메인 구매, Cloudflare 무료 CDN 설정, DNS A 레코드

---

## 필요한 리소스

### 스크린샷 (작성 시 캡처 예정)
- Namecheap 도메인 검색 화면
- Cloudflare 네임서버 확인 화면
- DNS A 레코드 추가 화면 (Proxied 모드 강조)
- dnschecker.org DNS 전파 확인

### 참고 링크
- https://namecheap.com
- https://cloudflare.com
- https://dnschecker.org
- beomanro.com (실제 사례)

---

## 체크리스트

- [ ] 모든 코드 블록에 언어 태그 포함 (bash)
- [ ] 도메인 등록 업체 비교표 포함
- [ ] Namecheap 선택 이유 명확히
- [ ] Cloudflare Free 플랜으로 충분함 강조
- [ ] SSL/TLS 모드 4가지 설명
- [ ] Proxied 모드 장점 강조
- [ ] DNS 전파 확인 방법 (dig, nslookup)
- [ ] 독자가 따라할 수 있도록 체크포인트 포함
- [ ] SEO 점수 70점 이상 확인
- [ ] 시리즈 내부 링크 (포스트 2, 4)
- [ ] 결론에 다음 단계 명확히 제시

---

## 작성 시 주의사항

### 강조할 포인트
1. **Namecheap 선택**: WHOIS 보호 무료, 가격 합리적
2. **Cloudflare Free 플랜**: 무료로 CDN + DDoS + SSL
3. **DNS 전파 시간**: 1-2시간 대기 필요
4. **Proxied 모드**: CDN 및 보안 활성화
5. **SSL/TLS Full (strict)**: 최고 보안 수준

### 독자 대상
- 도메인을 처음 구매하는 사람
- Cloudflare를 처음 사용하는 사람
- DNS 개념이 낯선 사람도 따라할 수 있도록
- 시리즈 2편을 완료한 사람

### 예상 작성 시간
- 아웃라인 확인: 5분
- 초안 작성: 2-2.5시간 (1200-1500단어)
- 스크린샷 캡처: 20분 (선택)
- 검토 및 수정: 20분
- **총**: 2.5-3시간

### 시리즈 일관성 유지
- 포스트 2에서 생성한 VPS IP 사용
- 포스트 4에서 다룰 Origin Certificate 예고
- 비용 추적: 현재까지 $10.98 (도메인만)
- beomanro.com 실제 설정 사례 인용
