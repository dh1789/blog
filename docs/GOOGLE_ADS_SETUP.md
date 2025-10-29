# Google Ads API 설정 가이드

이 가이드는 WordPress Content Automation CLI의 키워드 수익성 분석 기능을 사용하기 위해 Google Ads API를 설정하는 방법을 안내합니다.

## 목차

1. [개요](#개요)
2. [사전 요구사항](#사전-요구사항)
3. [Google Ads 계정 생성](#google-ads-계정-생성)
4. [Google Cloud 프로젝트 설정](#google-cloud-프로젝트-설정)
5. [OAuth 2.0 인증 설정](#oauth-20-인증-설정)
6. [개발자 토큰 발급](#개발자-토큰-발급)
7. [환경 변수 설정](#환경-변수-설정)
8. [연결 테스트](#연결-테스트)
9. [트러블슈팅](#트러블슈팅)

---

## 개요

Google Ads API를 통해 다음 키워드 데이터를 조회할 수 있습니다:

- **검색량 (Search Volume)**: 월간 검색 횟수
- **CPC (Cost Per Click)**: 클릭당 광고 비용
- **경쟁도 (Competition)**: 광고 경쟁 수준 (LOW/MEDIUM/HIGH)
- **경쟁 지수 (Competition Index)**: 0-100 범위의 경쟁 점수

이 데이터를 활용하여 블로그 주제의 수익성을 분석하고 최적의 콘텐츠를 선택할 수 있습니다.

---

## 사전 요구사항

1. **Google 계정**: Gmail 계정 필요
2. **신용카드**: Google Ads 계정 생성 시 필요 (실제 광고 집행 없이도 API 사용 가능)
3. **개발 환경**: Node.js 20+, pnpm 설치 완료

⚠️ **주의**: Google Ads API 사용은 무료이지만, 계정 생성 시 결제 정보 등록이 필요합니다. 실제 광고를 집행하지 않으면 비용이 발생하지 않습니다.

---

## Google Ads 계정 생성

### Step 1: Google Ads 계정 만들기

1. [Google Ads](https://ads.google.com/) 접속
2. 우측 상단 **"지금 시작하기"** 클릭
3. Google 계정으로 로그인
4. 비즈니스 정보 입력:
   - 비즈니스 이름: 블로그 이름 입력
   - 웹사이트: 블로그 URL 입력
   - 전화번호, 국가 등 추가 정보 입력

### Step 2: 결제 정보 등록

1. Google Ads 계정 설정 완료 후 결제 정보 등록
2. 신용카드 또는 직불카드 정보 입력
3. **중요**: 실제 광고 캠페인을 만들지 않으면 비용 발생 안 함

### Step 3: Customer ID 확인

1. Google Ads 계정 로그인
2. 우측 상단 계정 아이콘 클릭
3. **Customer ID** (형식: `123-456-7890`) 확인 및 기록
   - 환경 변수 설정 시 `-` 없이 `1234567890` 형태로 사용

---

## Google Cloud 프로젝트 설정

### Step 1: Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성:
   - 프로젝트 이름: `blog-automation` (또는 원하는 이름)
   - 조직: 없음 (개인 계정)

### Step 2: Google Ads API 활성화

1. 프로젝트 선택 후 [API 라이브러리](https://console.cloud.google.com/apis/library) 이동
2. "Google Ads API" 검색
3. **Google Ads API** 선택 → **"사용 설정"** 클릭

### Step 3: OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴 **"사용자 인증 정보"** 클릭
2. 상단 **"+ 사용자 인증 정보 만들기"** → **"OAuth 클라이언트 ID"** 선택
3. 동의 화면 구성 (처음인 경우):
   - 사용자 유형: **외부**
   - 앱 이름: `Blog Automation CLI`
   - 사용자 지원 이메일: 본인 Gmail
   - 개발자 연락처 정보: 본인 Gmail
   - **저장 후 계속**
4. 범위 추가:
   - **"범위 추가 또는 삭제"** 클릭
   - `https://www.googleapis.com/auth/adwords` 추가
   - **저장 후 계속**
5. 테스트 사용자 추가:
   - **"+ ADD USERS"** 클릭
   - 본인 Gmail 주소 입력
   - **저장 후 계속**

### Step 4: OAuth 클라이언트 ID 생성 완료

1. 애플리케이션 유형: **"데스크톱 앱"**
2. 이름: `Blog CLI OAuth Client`
3. **"만들기"** 클릭
4. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 다운로드 및 기록

---

## OAuth 2.0 인증 설정

### Step 1: Refresh Token 발급

Google Ads API 사용을 위해 **Refresh Token**을 발급받아야 합니다. 아래 스크립트를 사용하여 발급할 수 있습니다.

#### 인증 스크립트 생성

프로젝트 루트에 `scripts/google-ads-auth.js` 파일 생성:

```javascript
#!/usr/bin/env node

const readline = require('readline');
const { google } = require('googleapis');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/adwords'],
});

console.log('아래 URL을 브라우저에서 열어주세요:');
console.log(authUrl);
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('인증 코드를 입력하세요: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('');
    console.log('✅ 인증 성공!');
    console.log('');
    console.log('다음 정보를 .env 파일에 추가하세요:');
    console.log('');
    console.log(`GOOGLE_ADS_CLIENT_ID="${CLIENT_ID}"`);
    console.log(`GOOGLE_ADS_CLIENT_SECRET="${CLIENT_SECRET}"`);
    console.log(`GOOGLE_ADS_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('');
  } catch (error) {
    console.error('❌ 인증 실패:', error.message);
  } finally {
    rl.close();
  }
});
```

#### 스크립트 실행

```bash
# googleapis 패키지 설치
npm install googleapis

# 스크립트 실행
node scripts/google-ads-auth.js
```

#### 인증 프로세스

1. 스크립트가 출력한 URL을 브라우저에서 열기
2. Google 계정으로 로그인
3. **"계속"** 클릭하여 앱 승인
4. 표시된 인증 코드 복사
5. 터미널에 인증 코드 붙여넣기
6. 출력된 `REFRESH_TOKEN` 기록

---

## 개발자 토큰 발급

### Step 1: Google Ads API Center 접속

1. [Google Ads API Center](https://ads.google.com/aw/apicenter) 접속
2. Google Ads 계정으로 로그인

### Step 2: 개발자 토큰 신청

1. **"Developer Token"** 섹션에서 **"Create Token"** 클릭
2. 토큰이 즉시 생성됨 (예: `ABcdEFghIJklMNopQRst`)
3. 토큰 기록

⚠️ **주의**:
- 테스트 단계에서는 **"Test Account"** 수준의 토큰 사용
- 프로덕션 사용 시 **Basic** 또는 **Standard** 수준 승인 필요
- 테스트 계정으로도 API 호출 가능 (일일 15,000 요청 제한)

### Step 3: 프로덕션 승인 신청 (선택사항)

테스트 제한을 넘어 프로덕션 수준으로 사용하려면:

1. Google Ads API Center에서 **"Request Access"** 클릭
2. 애플리케이션 사용 목적 설명:
   - "블로그 콘텐츠 주제 선정을 위한 키워드 조사 도구"
   - "사용자: 개인 블로거"
   - "기능: 키워드 검색량, CPC, 경쟁도 조회"
3. 승인까지 1-2주 소요

---

## 환경 변수 설정

### Step 1: .env 파일 생성

프로젝트 루트에 `.env` 파일 생성 (`.env.example` 참고):

```bash
# Google Ads API 설정
GOOGLE_ADS_DEVELOPER_TOKEN="YOUR_DEVELOPER_TOKEN"
GOOGLE_ADS_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_ADS_CLIENT_SECRET="YOUR_CLIENT_SECRET"
GOOGLE_ADS_REFRESH_TOKEN="YOUR_REFRESH_TOKEN"
GOOGLE_ADS_CUSTOMER_ID="1234567890"  # Customer ID에서 - 제거
```

### Step 2: 환경 변수 값 입력

| 환경 변수 | 설명 | 예시 |
|----------|------|------|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API 개발자 토큰 | `ABcdEFghIJklMNopQRst` |
| `GOOGLE_ADS_CLIENT_ID` | OAuth 2.0 클라이언트 ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_ADS_CLIENT_SECRET` | OAuth 2.0 클라이언트 보안 비밀번호 | `GOCSPX-Abc123...` |
| `GOOGLE_ADS_REFRESH_TOKEN` | OAuth 2.0 Refresh Token | `1//0abcdefg...` |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads Customer ID (`-` 제거) | `1234567890` |

### Step 3: .gitignore 확인

`.env` 파일이 `.gitignore`에 포함되어 있는지 확인:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## 연결 테스트

### Step 1: 빌드 및 설치

```bash
# 프로젝트 빌드
pnpm build

# CLI 명령어 사용 가능 확인
blog --version
```

### Step 2: 기본 연결 테스트

```bash
# 트렌드 토픽 수집 (Google Ads API 사용 안 함)
blog trending --limit 5

# 수익성 데이터 포함 조회 (Google Ads API 사용)
blog trending --revenue --limit 3
```

### Step 3: 출력 예시

성공 시 다음과 같은 출력을 볼 수 있습니다:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   트렌드 토픽 (수익성 분석 포함)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cache stats: 0 hits, 3 misses (0.0% hit rate)
API calls saved by cache: 0 / 3

1. TypeScript 5.0 새로운 기능 (reddit)
   📊 트렌드: 85.2 | 💰 수익성: 72.4 | 🎯 종합: 80.0

   ├─ 검색량: 5,400/월
   ├─ CPC: $2.35
   ├─ 경쟁도: MEDIUM (50)
   └─ 수익성 평가: 높은 검색량, 적정 CPC, 중간 경쟁도

   https://reddit.com/r/programming/...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: 캐시 동작 확인

두 번째 실행 시 캐시가 적용되어 훨씬 빠른 응답을 볼 수 있습니다:

```bash
# 두 번째 실행 (캐시 히트)
blog trending --revenue --limit 3
```

출력:

```
Cache stats: 3 hits, 0 misses (100.0% hit rate)
API calls saved by cache: 3 / 3
```

---

## 트러블슈팅

### 1. "Missing required Google Ads API environment variables"

**원인**: 환경 변수가 설정되지 않음

**해결 방법**:
```bash
# .env 파일 확인
cat .env

# 누락된 환경 변수 추가
# 필수 변수:
# - GOOGLE_ADS_DEVELOPER_TOKEN
# - GOOGLE_ADS_CLIENT_ID
# - GOOGLE_ADS_CLIENT_SECRET
# - GOOGLE_ADS_REFRESH_TOKEN
# - GOOGLE_ADS_CUSTOMER_ID
```

### 2. "DEVELOPER_TOKEN_NOT_APPROVED"

**원인**: 개발자 토큰이 아직 테스트 계정 수준

**해결 방법**:
- 테스트 계정으로도 API 사용 가능 (일일 15,000 요청 제한)
- 프로덕션 승인은 [Google Ads API Center](https://ads.google.com/aw/apicenter)에서 신청
- 승인까지 1-2주 소요

### 3. "INVALID_CUSTOMER_ID"

**원인**: Customer ID 형식 오류

**해결 방법**:
```bash
# 잘못된 예: "123-456-7890"
GOOGLE_ADS_CUSTOMER_ID="123-456-7890"  # ❌

# 올바른 예: "1234567890"
GOOGLE_ADS_CUSTOMER_ID="1234567890"    # ✅
```

### 4. "AUTHENTICATION_ERROR"

**원인**: Refresh Token이 만료되었거나 잘못됨

**해결 방법**:
```bash
# 인증 스크립트 재실행하여 새 Refresh Token 발급
node scripts/google-ads-auth.js

# 새 토큰을 .env에 업데이트
GOOGLE_ADS_REFRESH_TOKEN="NEW_TOKEN_HERE"
```

### 5. "QUOTA_EXCEEDED"

**원인**: 일일 API 요청 한도 초과 (테스트 계정: 15,000/day)

**해결 방법**:
- 캐시 시스템이 자동으로 API 호출 절감 (기본 TTL: 24시간)
- 다음 날까지 대기 또는 프로덕션 승인 신청
- 필요시 `--limit` 옵션으로 조회 개수 제한

### 6. "PERMISSION_DENIED"

**원인**: OAuth 2.0 범위(scope)가 올바르지 않음

**해결 방법**:
```bash
# 올바른 scope 확인
# https://www.googleapis.com/auth/adwords

# OAuth 클라이언트 재생성 후 인증 스크립트 재실행
node scripts/google-ads-auth.js
```

### 7. 캐시 초기화

캐시 문제 발생 시:

```bash
# 캐시 디렉토리 삭제
rm -rf .cache/

# 다음 실행 시 캐시가 자동으로 재생성됨
blog trending --revenue --limit 3
```

---

## 추가 리소스

### 공식 문서

- [Google Ads API 공식 문서](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### 유용한 링크

- [Google Ads API Forum](https://groups.google.com/g/adwords-api) - 커뮤니티 지원
- [API Release Notes](https://developers.google.com/google-ads/api/docs/release-notes) - 최신 업데이트
- [Migration Guide](https://developers.google.com/google-ads/api/docs/migration) - AdWords API에서 마이그레이션

### 관련 문서

- [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) - 프로덕션 배포 가이드
- [troubleshooting.md](./troubleshooting.md) - 일반 문제 해결
- [workflows.md](./workflows.md) - 워크플로우 가이드

---

**마지막 업데이트**: 2025-10-29
**작성자**: WordPress Content Automation CLI Team
