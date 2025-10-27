# 트러블슈팅 가이드

@blog/cli 사용 시 발생할 수 있는 문제와 해결 방법을 안내합니다.

## 📚 목차

- [일반적인 문제](#일반적인-문제)
- [WordPress 연결 문제](#wordpress-연결-문제)
- [AI 초안 생성 문제](#ai-초안-생성-문제)
- [이미지 생성 문제](#이미지-생성-문제)
- [발행 문제](#발행-문제)
- [프리뷰 서버 문제](#프리뷰-서버-문제)
- [성능 문제](#성능-문제)
- [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)

---

## 일반적인 문제

### 문제: 명령어를 찾을 수 없음

```bash
blog: command not found
```

**원인:**
- CLI가 전역으로 설치되지 않음

**해결 방법:**

```bash
# 1. 프로젝트 디렉토리로 이동
cd /path/to/blog

# 2. 의존성 재설치
pnpm install

# 3. 빌드
pnpm build

# 4. 전역 링크
cd packages/cli
pnpm link --global

# 5. 확인
blog --version
```

**대안:**
전역 설치 없이 npx 사용:
```bash
cd /path/to/blog/packages/cli
npx blog draft create "제목" "키워드"
```

### 문제: 환경 변수를 찾을 수 없음

```
Error: WORDPRESS_URL is not defined
```

**원인:**
- `.env` 파일이 없거나 잘못된 위치에 있음

**해결 방법:**

```bash
# 1. 프로젝트 루트에 .env 파일 확인
ls -la .env

# 2. 없으면 생성
cp .env.example .env

# 3. 편집
vim .env  # 또는 code .env
```

**.env 파일 위치:**
- ✅ 올바름: `/path/to/blog/.env` (프로젝트 루트)
- ❌ 잘못됨: `/path/to/blog/packages/cli/.env`

### 문제: 권한 거부 오류

```
Error: EACCES: permission denied
```

**원인:**
- 파일/디렉토리 권한 문제

**해결 방법:**

```bash
# 1. 디렉토리 소유권 확인
ls -la content/

# 2. 소유권 변경 (필요시)
sudo chown -R $USER:$USER content/

# 3. 권한 설정
chmod -R 755 content/
```

### 문제: Node.js 버전 호환성

```
Error: The engine "node" is incompatible with this module
```

**원인:**
- Node.js 버전이 20 미만

**해결 방법:**

```bash
# 1. 현재 버전 확인
node --version

# 2. nvm 사용하여 Node.js 20 설치
nvm install 20
nvm use 20

# 3. 확인
node --version  # v20.x.x

# 4. 의존성 재설치
pnpm install
```

---

## WordPress 연결 문제

### 문제: 401 Unauthorized

```
Error: Request failed with status code 401
Unauthorized
```

**원인:**
- Application Password가 잘못됨
- 사용자 이름이 잘못됨
- Application Password 만료

**해결 방법:**

**1단계: 환경 변수 확인**
```bash
cat .env | grep WORDPRESS
```

확인 사항:
- `WORDPRESS_USERNAME`: 정확한 사용자명 (이메일 또는 username)
- `WORDPRESS_APP_PASSWORD`: 공백 없이 입력 (24자)

**2단계: Application Password 재생성**
1. WordPress 관리자 → 사용자 → 프로필
2. 기존 "blog-cli" Application Password 삭제
3. 새로 생성
4. `.env` 파일 업데이트

**3단계: curl로 직접 테스트**
```bash
curl -u "username:app-password" \
  https://your-blog.com/wp-json/wp/v2/users/me
```

정상: JSON 응답
비정상: `401 Unauthorized`

### 문제: REST API를 찾을 수 없음

```
Error: Request failed with status code 404
/wp-json/wp/v2/posts not found
```

**원인:**
- REST API가 비활성화됨
- Permalink 설정 문제
- 보안 플러그인이 차단

**해결 방법:**

**1단계: REST API 확인**
```bash
curl https://your-blog.com/wp-json/
```

**2단계: Permalink 재저장**
1. WordPress 관리자 → 설정 → 고유주소
2. 아무 변경 없이 "변경사항 저장" 클릭

**3단계: 보안 플러그인 확인**
- Wordfence: REST API 차단 해제
- iThemes Security: REST API 허용
- All In One WP Security: REST API 활성화

**4단계: .htaccess 확인**
```apache
# .htaccess에 다음 규칙이 없는지 확인
# RewriteRule ^wp-json/(.*)$ - [F,L]  # 이 줄이 있으면 제거
```

### 문제: SSL 인증서 오류

```
Error: unable to verify the first certificate
```

**원인:**
- 자체 서명 인증서 사용
- 만료된 SSL 인증서
- 잘못된 인증서 체인

**해결 방법:**

**운영 환경:**
1. Let's Encrypt로 유효한 SSL 인증서 설치
2. SSL Labs에서 인증서 검증

**개발 환경 (임시):**
```bash
# Node.js SSL 검증 비활성화 (개발 환경만!)
export NODE_TLS_REJECT_UNAUTHORIZED=0
blog config
```

> ⚠️ **경고**: 운영 환경에서는 절대 SSL 검증을 비활성화하지 마세요.

### 문제: CORS 오류

```
Error: Cross-Origin Request Blocked
```

**원인:**
- WordPress에서 CORS 헤더가 설정되지 않음

**해결 방법:**

**wp-config.php에 추가:**
```php
// CORS 허용 (REST API)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

또는 **플러그인 사용:**
- WP CORS (플러그인)

---

## AI 초안 생성 문제

### 문제: Claude API 키 오류

```
Error: Anthropic API key not configured
```

**원인:**
- ANTHROPIC_API_KEY 환경 변수가 설정되지 않음

**해결 방법:**

현재 버전에서는 Claude API 직접 사용하지 않습니다. 이 오류는 무시하세요.

향후 버전에서 지원 예정입니다.

### 문제: 초안 생성이 너무 느림

```
초안 생성 중... (5분 이상 소요)
```

**원인:**
- 긴 콘텐츠 생성 (2000+ 단어)
- API 응답 지연

**해결 방법:**

**1. 단어 수 줄이기:**
```bash
# 2000 단어 대신 1500 단어
blog draft create "제목" "키워드" --words 1500
```

**2. 여러 짧은 포스트로 분할:**
```bash
# Part 1
blog draft create "제목 Part 1" "키워드" --words 1000

# Part 2
blog draft create "제목 Part 2" "키워드" --words 1000
```

**3. 타임아웃 확인:**
```bash
# vitest.config.ts
testTimeout: 600000  # 10분
```

### 문제: 템플릿을 찾을 수 없음

```
Error: Template not found: custom-template
```

**원인:**
- `prompts/` 디렉토리에 템플릿 파일이 없음

**해결 방법:**

**1. 사용 가능한 템플릿 확인:**
```bash
ls prompts/
# blog-post.txt
# review.txt (추후 지원)
# tutorial.txt (추후 지원)
```

**2. 기본 템플릿 사용:**
```bash
blog draft create "제목" "키워드" --template blog-post
```

**3. 커스텀 템플릿 생성:**
```bash
# prompts/custom.txt 파일 생성
vim prompts/custom.txt
```

### 문제: 생성된 초안 품질이 낮음

**원인:**
- 프롬프트가 불명확함
- 키워드가 부적절함

**해결 방법:**

**1. 구체적인 주제 제공:**
```bash
# ❌ 나쁜 예
blog draft create "React" "React"

# ✅ 좋은 예
blog draft create "React Hooks를 활용한 상태 관리 완벽 가이드" \
  "React Hooks, useState, useEffect, useContext"
```

**2. 관련성 높은 키워드 사용:**
```bash
# 주제와 직접 관련된 키워드 5-7개
--keywords "React, Hooks, 상태관리, useState, useEffect"
```

**3. draft refine으로 개선:**
```bash
blog draft refine content/drafts/my-post.md \
  "실무 예제를 추가하고, 코드 설명을 더 상세하게 작성해주세요"
```

---

## 이미지 생성 문제

### 문제: OpenAI API 키 오류

```
Error: OpenAI API key is not configured
```

**원인:**
- OPENAI_API_KEY 환경 변수가 설정되지 않음

**해결 방법:**

**1. .env 파일 확인:**
```bash
cat .env | grep OPENAI
```

**2. API 키 추가:**
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

**3. OpenAI API 키 생성:**
1. [OpenAI Platform](https://platform.openai.com/) 로그인
2. API Keys 메뉴 이동
3. "Create new secret key" 클릭
4. 생성된 키 복사하여 `.env`에 추가

### 문제: 이미지 생성 실패

```
Error: Image generation failed
Your request was rejected as a result of our safety system
```

**원인:**
- DALL-E 안전 시스템이 프롬프트를 차단
- 부적절한 내용 포함

**해결 방법:**

**1. 프롬프트 수정:**
```bash
# ❌ 차단될 수 있는 프롬프트
"Violent scene with blood"

# ✅ 안전한 프롬프트
"Modern minimalist blog header with tech theme"
```

**2. 일반적인 프롬프트 사용:**
```bash
blog image generate "Professional blog header image" \
  --style natural
```

### 문제: 이미지 다운로드 실패

```
Error: Failed to download image
```

**원인:**
- 네트워크 문제
- 저장 디렉토리 권한 문제

**해결 방법:**

**1. 디렉토리 권한 확인:**
```bash
mkdir -p ./images
chmod 755 ./images
```

**2. 다시 시도:**
```bash
blog image generate "프롬프트" --output ./images
```

**3. URL 직접 다운로드:**
이미지 생성 출력에서 URL을 복사하여 직접 다운로드:
```bash
curl -o image.png "https://oaidalleapiprodscus.blob.core.windows.net/..."
```

### 문제: API 크레딧 부족

```
Error: You exceeded your current quota
```

**원인:**
- OpenAI 크레딧이 소진됨

**해결 방법:**

**1. 크레딧 확인:**
[OpenAI Platform - Usage](https://platform.openai.com/usage)에서 확인

**2. 크레딧 충전:**
1. OpenAI Platform → Billing
2. "Add payment method"
3. 크레딧 구매

**3. 비용 절감 팁:**
```bash
# HD 대신 standard 품질 사용
blog image generate "프롬프트" --quality standard

# 작은 크기 사용
blog image generate "프롬프트" --size 1024x1024
```

**DALL-E 3 가격:**
- Standard 1024x1024: $0.040/image
- Standard 1024x1792, 1792x1024: $0.080/image
- HD 1024x1024: $0.080/image
- HD 1024x1792, 1792x1024: $0.120/image

---

## 발행 문제

### 문제: SEO 메타 태그가 생성되지 않음

```
Warning: No SEO meta tags generated
```

**원인:**
- Frontmatter가 없거나 불완전함

**해결 방법:**

**1. Frontmatter 확인:**
```yaml
---
title: "포스트 제목"
description: "메타 설명 (150-160자)"
keywords: ["키워드1", "키워드2"]
---
```

**2. 필수 필드 포함:**
- `title`: 필수
- `description`: 필수 (SEO)
- `keywords`: 권장

**3. AI 초안 재생성:**
```bash
blog draft create "제목" "키워드" --words 2000
# Frontmatter가 자동 생성됨
```

### 문제: 키워드 밀도 경고

```
Warning: Keyword density too high: 3.5% (target: 0.5-2.5%)
```

**원인:**
- 키워드가 너무 많이 사용됨

**해결 방법:**

**1. 수동 조정:**
파일을 열어서 키워드 일부 제거:
```bash
code content/drafts/my-post.md
```

**2. AI로 수정:**
```bash
blog draft refine content/drafts/my-post.md \
  "키워드를 더 자연스럽고 적게 사용하도록 수정해주세요"
```

**3. 다른 표현 사용:**
- "React" → "이 라이브러리", "이 프레임워크"
- 동의어 활용

### 문제: 광고 코드가 삽입되지 않음

**원인:**
- ADSENSE_CLIENT_ID 또는 ADSENSE_SLOT_ID가 설정되지 않음

**해결 방법:**

**1. .env 파일 확인:**
```bash
cat .env | grep ADSENSE
```

**2. AdSense 정보 추가:**
```env
ADSENSE_CLIENT_ID=ca-pub-1234567890123456
ADSENSE_SLOT_ID=9876543210
```

**3. 다시 발행:**
```bash
blog publish content/drafts/my-post.md
```

### 문제: 발행 후 포스트가 보이지 않음

**원인:**
- 초안으로 발행됨 (`--draft` 옵션 사용)
- 카테고리 또는 태그 문제

**해결 방법:**

**1. 포스트 상태 확인:**
```bash
blog list --status draft
```

**2. WordPress 관리자에서 확인:**
1. WordPress 관리자 → 글 → 모든 글
2. 해당 포스트 찾기
3. 상태가 "초안"이면 "발행" 클릭

**3. 다시 발행 (공개):**
```bash
# --draft 옵션 없이 발행
blog publish content/drafts/my-post.md
```

---

## 프리뷰 서버 문제

### 문제: 포트가 이미 사용 중

```
Error: Port 3000 is already in use
```

**원인:**
- 다른 프로세스가 포트 3000 사용 중

**해결 방법:**

**1. 다른 포트 사용:**
```bash
blog preview content/posts/my-post.md --port 3001
```

**2. 사용 중인 프로세스 종료:**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 문제: Live Reload가 작동하지 않음

**원인:**
- Socket.io 연결 실패
- 파일 감시 실패

**해결 방법:**

**1. 브라우저 콘솔 확인:**
F12 → Console 탭에서 오류 확인

**2. 브라우저 수동 새로고침:**
파일 저장 후 브라우저에서 F5

**3. 프리뷰 서버 재시작:**
```bash
Ctrl+C  # 서버 종료
blog preview content/posts/my-post.md  # 재시작
```

### 문제: 스타일이 실제 블로그와 다름

**원인:**
- 프리뷰 서버는 기본 스타일만 적용
- Avada 테마의 커스텀 CSS는 미포함

**해결 방법:**

**현재 버전:**
프리뷰는 대략적인 모습만 확인용입니다.
정확한 모습은 WordPress 사이트에서 확인하세요.

**향후 버전 (Epic 6.0):**
커스텀 CSS 적용 지원 예정

---

## 성능 문제

### 문제: 명령어 실행이 느림

**원인:**
- 네트워크 지연
- API 응답 시간
- 대용량 파일 처리

**해결 방법:**

**1. 네트워크 확인:**
```bash
ping your-blog.com
```

**2. 병렬 처리 사용:**
```bash
# 여러 초안을 동시에 생성하지 말고 순차적으로
for topic in "주제1" "주제2"; do
  blog draft create "$topic" "키워드" --words 1500
  sleep 30  # API 레이트 리밋 방지
done
```

**3. 캐싱 활용:**
WordPress에 WP Rocket 등 캐싱 플러그인 설치

### 문제: 메모리 부족

```
Error: JavaScript heap out of memory
```

**원인:**
- Node.js 힙 메모리 부족

**해결 방법:**

```bash
# Node.js 힙 크기 증가
export NODE_OPTIONS="--max-old-space-size=4096"

# 명령어 실행
blog draft create "제목" "키워드" --words 3000
```

---

## 자주 묻는 질문 (FAQ)

### Q1: Application Password를 잊어버렸어요

**A:** Application Password는 복구할 수 없습니다. 새로 생성해야 합니다.

1. WordPress 관리자 → 사용자 → 프로필
2. 기존 Application Password 삭제
3. 새로 생성
4. `.env` 파일 업데이트

### Q2: 여러 WordPress 사이트를 관리할 수 있나요?

**A:** 현재 버전에서는 한 번에 하나의 사이트만 관리할 수 있습니다.

**대안:**
1. 사이트별로 `.env` 파일 복사
2. 필요시 환경 변수 교체:
   ```bash
   cp .env.site1 .env
   blog publish content/posts/my-post.md

   cp .env.site2 .env
   blog publish content/posts/my-post.md
   ```

### Q3: 발행된 포스트를 수정할 수 있나요?

**A:** 현재 버전에서는 포스트 수정 기능이 없습니다.

**대안:**
1. WordPress 관리자 페이지에서 직접 수정
2. 또는 새로 발행 후 이전 포스트 삭제:
   ```bash
   blog delete <포스트_ID>
   ```

**향후 지원 예정 (Epic 6.0)**

### Q4: DALL-E 이미지를 WordPress에 자동 업로드할 수 있나요?

**A:** 현재 버전에서는 이미지를 로컬에만 다운로드합니다.

**대안:**
1. 이미지 생성 후 로컬 저장
2. WordPress 관리자 → 미디어 → 새로 추가 → 수동 업로드
3. 또는 FTP로 업로드

**향후 지원 예정 (Epic 6.0):**
WordPress 미디어 라이브러리 자동 업로드

### Q5: 초안을 여러 번 수정할 수 있나요?

**A:** 네, `blog draft refine` 명령어를 원하는 만큼 실행할 수 있습니다.

```bash
# 첫 번째 수정
blog draft refine content/drafts/my-post.md "SEO 최적화"

# 두 번째 수정
blog draft refine content/drafts/my-post.md "실습 예제 추가"

# 세 번째 수정
blog draft refine content/drafts/my-post.md "문법 검토"
```

각 수정마다 파일이 덮어써집니다.

### Q6: 트렌드 모니터링에서 Twitter가 작동하지 않아요

**A:** Twitter API는 유료이며 Bearer Token이 필요합니다.

**해결 방법:**
1. [Twitter Developer Portal](https://developer.twitter.com/) 가입
2. App 생성
3. Bearer Token 발급
4. `.env`에 추가:
   ```env
   TWITTER_BEARER_TOKEN=AAAAAAAAAxxxxxxxxxx
   ```

**대안:**
Reddit과 Hacker News만 사용:
```bash
blog trending --sources reddit,hackernews
```

### Q7: 분석 데이터가 실시간이 아니에요

**A:** WordPress REST API는 캐싱된 데이터를 반환할 수 있습니다.

**해결 방법:**
1. WordPress 캐싱 플러그인 설정에서 `/wp-json/*` 경로 캐시 제외
2. 또는 캐시 수동 삭제 후 재시도

### Q8: 한국어 slug가 영문으로 변환되지 않아요

**A:** slug는 frontmatter의 `slug` 필드를 우선 사용합니다.

**확인:**
```yaml
---
title: "리액트 훅스 가이드"
slug: "react-hooks-guide"  # 수동 지정
---
```

slug 필드가 없으면 자동 변환됩니다.

### Q9: 테스트를 건너뛸 수 있나요?

**A:** 아니요, process-task-list.md 가이드라인에 따라 모든 테스트를 실행해야 합니다.

```bash
# 전체 테스트 실행 (필수)
pnpm test
```

테스트 타임아웃은 10분으로 설정되어 있습니다.

### Q10: 비용이 얼마나 드나요?

**A:** 주요 비용 항목:

**필수:**
- WordPress 호스팅: $5-50/월 (호스팅 업체별)
- SSL 인증서: 무료 (Let's Encrypt)

**선택사항:**
- OpenAI DALL-E 3: $0.04-0.12/이미지
- Twitter API: $100/월 (Basic tier)
- Google AdSense: 무료 (수익 창출용)

**예산 예시:**
- 최소: $5/월 (WordPress 호스팅만)
- 권장: $10/월 (호스팅 + 이미지 생성)
- 풀 기능: $110/월 (호스팅 + 이미지 + Twitter)

### Q11: Windows에서도 작동하나요?

**A:** 네, Windows, macOS, Linux 모두 지원합니다.

**Windows 사용자 주의사항:**
- Git Bash 또는 WSL 사용 권장
- PowerShell에서는 일부 스크립트가 다르게 작동할 수 있음

### Q12: 로컬 WordPress에서 테스트할 수 있나요?

**A:** 네, Local by Flywheel 또는 MAMP 사용 가능합니다.

**설정:**
```env
WORDPRESS_URL=http://localhost:8888
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxx
```

**주의:**
Application Password는 HTTPS 필요하므로 wp-config.php에 추가:
```php
define('WP_ENVIRONMENT_TYPE', 'local');
```

### Q13: 에러 로그는 어디서 확인하나요?

**A:** 현재 버전에서는 콘솔에만 출력됩니다.

**향후 지원 예정 (Epic 6.0):**
- 로그 파일 생성
- 상세 디버그 모드

**현재 대안:**
```bash
# 출력을 파일로 저장
blog publish content/drafts/my-post.md 2>&1 | tee publish.log
```

### Q14: 오픈소스인가요?

**A:** 네, MIT 라이선스로 공개되어 있습니다.

**기여 방법:**
1. GitHub Issues에 버그 리포트 또는 기능 제안
2. Pull Request 환영
3. 문서 개선 기여

### Q15: 도움을 어디서 받을 수 있나요?

**A:** 다음 리소스를 참조하세요:

- **문서**: [README.md](../README.md)
- **시작하기**: [시작하기 가이드](./getting-started.md)
- **워크플로우**: [기본 워크플로우](./workflows.md)
- **WordPress**: [WordPress 설정](./wordpress-setup.md)
- **GitHub Issues**: [버그 리포트 및 질문](https://github.com/your-username/blog/issues)

---

## 추가 도움이 필요하신가요?

위 내용으로 문제가 해결되지 않으면:

1. **GitHub Issues**: 새로운 이슈 생성
2. **로그 첨부**: 에러 메시지 전체 복사
3. **환경 정보**: Node.js 버전, OS, WordPress 버전
4. **재현 단계**: 문제 발생 과정 상세히 설명

---

**이전**: [WordPress 설정](./wordpress-setup.md) | **처음**: [시작하기](./getting-started.md)
