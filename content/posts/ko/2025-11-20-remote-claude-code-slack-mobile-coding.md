---
title: "Slack으로 Claude Code 원격 제어하기: 모바일에서도 AI 코딩이 가능하다"
slug: "remote-claude-code-slack-mobile-coding"
excerpt: "외출 중 긴급 버그 수정 요청? 노트북 없어도 괜찮습니다. Slack + tmux + Claude Code로 스마트폰에서도 AI 코딩이 가능합니다. 채널별 작업 큐, 실시간 진행 상황, 인터랙티브 버튼 UI까지. 실전 설정 가이드 및 사용법 공개."
status: "publish"
categories:
  - "개발"
  - "AI"
  - "DevOps"
tags:
  - "Slack"
  - "Claude Code"
  - "원격개발"
  - "모바일코딩"
  - "tmux"
  - "자동화"
language: "ko"
---

# Slack으로 Claude Code 원격 제어하기: 모바일에서도 AI 코딩이 가능하다

## TL;DR

- **문제**: 외출 중 긴급 버그 수정 요청, 노트북 없음
- **해결**: Slack + tmux + Claude Code 통합으로 모바일에서도 AI 코딩 가능
- **성과**: 10분 만에 프로덕션 버그 수정, 어디서나 개발 가능

---

## 1. 토요일 오후, 프로덕션 에러 발생

토요일 오후 3시, 카페에서 커피를 마시며 여유를 즐기던 중 Slack 메시지가 울렸습니다.

```
@channel 긴급! 프로덕션 에러 발생
Error: Database connection timeout
영향: 전체 사용자 로그인 불가
```

**문제**:
- 노트북은 집에 두고 나옴
- 집까지 30분 거리
- 지금 당장 수정이 필요

**기존 해결책의 한계**:
1. **SSH 모바일 앱**: 터미널 UI가 불편, 코드 편집 거의 불가능
2. **GitHub Codespaces**: 월 $10, 즉시 사용 어려움
3. **TeamViewer**: 느리고 복잡, 모바일에서 사용 불편

그때 떠오른 아이디어: **"Slack에서 바로 Claude Code를 실행할 수 있다면?"**

---

## 2. 10분 만에 버그 수정 완료

스마트폰 Slack 앱을 열고:

```
/ask "Analyze database connection timeout in src/server.ts"
```

5초 후, Claude Code가 분석을 시작했습니다:

```
🔍 분석 중...
- server.ts:45 - connection pool size too small (10)
- Recommendation: Increase to 50 for production load
```

즉시 수정 명령:

```
/run "Update connection pool size to 50 in src/server.ts"
```

```
✅ 수정 완료
- src/server.ts:45 변경됨
- Commit message: "Fix: Increase DB connection pool to 50"
```

Git push까지 자동으로:

```
/run git-deploy
```

```
✅ 배포 완료
- Tests passed
- Production deployed
- 사용자 로그인 정상화
```

**소요 시간**: 10분
**사용 도구**: 스마트폰 Slack 앱
**비용**: $0

이게 가능했던 비결은 **remote-claude** 시스템입니다.

---

## 3. remote-claude 아키텍처

### 3.1 핵심 아이디어

**Slack 채널 = 프로젝트**

```
#project-blog       → /Users/idongho/proj/blog
#project-api        → /Users/idongho/proj/api
#project-frontend   → /Users/idongho/proj/frontend
```

각 채널에서 명령을 실행하면, 해당 프로젝트 디렉토리에서 Claude Code가 작동합니다.

### 3.2 시스템 구조

```
Slack 채널
    ↓ (Socket Mode)
Slack Bot (Node.js + TypeScript)
    ↓
작업 큐 (FIFO)
    ↓
tmux 세션 (프로젝트별 독립)
    ↓
Claude Code CLI
    ↓ (5초 폴링)
실시간 진행 상황 → Slack 메시지 업데이트
```

**핵심 기술**:
1. **Slack Socket Mode**: 실시간 양방향 통신
2. **tmux**: 각 프로젝트를 독립적인 세션으로 관리
3. **작업 큐**: 채널별 FIFO 처리로 순서 보장
4. **폴링**: 5초마다 Claude Code 출력 확인 및 Slack 업데이트

### 3.3 왜 tmux인가?

**문제**: Claude Code는 대화형 CLI (interactive)
- 사용자 입력 대기 (y/n)
- 장시간 실행
- 중간에 연결 끊김 시 복구 필요

**해결**: tmux 세션
- 백그라운드에서 계속 실행
- SSH 연결 끊어져도 세션 유지
- 언제든지 다시 attach 가능

---

## 4. 단계별 설정 가이드

### 4.1 사전 준비

```bash
# 1. tmux 설치
brew install tmux  # macOS
apt-get install tmux  # Ubuntu

# 2. Claude Code CLI 설치
# (Anthropic 공식 문서 참조)

# 3. Node.js 20+ 설치
node --version  # v20.0.0 이상
```

### 4.2 Slack App 생성

**방법 1: Manifest 사용 (권장)**

1. https://api.slack.com 접속
2. "Create New App" 클릭
3. "From an app manifest" 선택
4. 워크스페이스 선택
5. 다음 manifest 붙여넣기:

```yaml
display_information:
  name: Remote Claude
features:
  bot_user:
    display_name: Remote Claude
    always_online: false
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - channels:read
      - chat:write
      - commands
      - files:write
      - im:history
      - im:read
      - im:write
settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - message.channels
      - message.im
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
```

6. "Create" 클릭

**방법 2: 수동 설정**

1. Basic Information → Socket Mode 활성화
2. "App-Level Tokens" 생성 (`connections:write` 스코프)
3. OAuth & Permissions → Bot Token Scopes 추가
4. Interactivity & Shortcuts → Interactivity 활성화

### 4.3 remote-claude 설치

```bash
# GitHub에서 클론
git clone https://github.com/dh1789/remote-claude.git
cd remote-claude

# 의존성 설치
npm install

# 빌드
npm run build
```

### 4.4 환경 변수 설정

`.env` 파일 생성:

```bash
# Slack Tokens (api.slack.com에서 복사)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token

# 설정 디렉토리 (선택사항)
CONFIG_DIR=~/.remote-claude

# 로그 레벨 (선택사항)
LOG_LEVEL=info
```

### 4.5 실행

```bash
# 포그라운드 실행 (테스트용)
npm start

# 또는 개발 모드
npm run dev
```

**백그라운드 실행 (프로덕션)**:

```bash
# pm2 설치
npm install -g pm2

# 백그라운드 실행
pm2 start dist/index.js --name remote-claude

# 로그 확인
pm2 logs remote-claude

# 재시작 설정 (서버 재부팅 시 자동 실행)
pm2 startup
pm2 save
```

---

## 5. 실전 사용법

### 5.1 프로젝트 설정

Slack 채널에서:

```
/setup my-blog /Users/idongho/proj/blog
```

```
✅ 채널 #my-blog를 프로젝트 /Users/idongho/proj/blog에 연결했습니다.
```

이제 이 채널의 모든 명령은 해당 디렉토리에서 실행됩니다.

### 5.2 기본 명령어

#### `/ask` - 즉석 프롬프트

```
/ask "Analyze performance bottlenecks in src/server.ts"
```

Claude Code가 즉시 분석을 시작하고, 실시간으로 진행 상황이 업데이트됩니다:

```
🔄 작업 시작 (2025-11-20 15:30:45)

🔍 src/server.ts 분석 중...
- 발견: O(n²) 알고리즘 (line 127)
- 발견: 불필요한 DB 쿼리 (line 245)

💡 개선 제안:
1. Map 자료구조 사용으로 O(n) 개선
2. 쿼리 배치 처리로 DB 호출 90% 감소

✅ 완료 (소요 시간: 45초)
```

#### `/run` - 스니펫 실행

먼저 스니펫 등록:

```
/snippet add build-test "npm run build && npm test"
```

```
✅ 스니펫 'build-test' 저장됨
```

실행:

```
/run build-test
```

```
🔄 실행 중: npm run build && npm test

> build
✔ TypeScript 컴파일 완료

> test
✔ 42 tests passed

✅ 완료
```

#### `/download` - 파일 다운로드

```
/download logs/error.log
```

```
📥 다운로드 준비 중...
✅ error.log (2.3 MB)
[다운로드 버튼]
```

**보안 제약**:
- 파일 크기: 10MB 이하
- 차단 파일: `.env`, `*.key`, `*.pem`, `credentials.*`
- Path traversal 방지: 프로젝트 디렉토리 내부만 허용

#### `/state` - 현재 상태 확인

```
/state
```

```
📊 Remote Claude 상태

프로젝트: /Users/idongho/proj/blog
작업 큐: 0개 대기 중
마지막 실행: 2분 전
tmux 세션: active

설정된 스니펫: 5개
- build-test
- git-deploy
- lint-fix
- test-watch
- preview
```

### 5.3 인터랙티브 버튼 UI

Claude Code가 사용자 입력을 요청하면 (y/n), Slack 버튼이 자동으로 나타납니다:

```
⚠️ Claude Code가 입력을 기다리고 있습니다:

"src/components/Header.tsx를 수정하시겠습니까?"

[Yes] [No] [Cancel Task]
```

모바일에서도 버튼 클릭만으로 응답 가능!

### 5.4 한글 명령어 자동 변환

한글 자판 상태에서 영어 명령어를 입력해도 자동 변환:

```
/ㄴㅅㅁ션  → /state
/애쥐ㅐㅁㅇ  → /download
```

실수로 한글 입력해도 걱정 없습니다!

---

## 6. 고급 기능

### 6.1 작업 큐 시스템

채널당 하나의 작업만 실행되므로, 여러 명령을 연속으로 입력하면 큐에 쌓입니다:

```
/run build-test  (실행 중)
/run deploy      (큐 1번)
/run analytics   (큐 2번)
```

```
📋 작업 큐 (2개 대기)
1. deploy (대기 중)
2. analytics (대기 중)

[Cancel Queue]
```

### 6.2 상태 복구

시스템 재시작 시 자동으로 이전 상태 복구:

```bash
pm2 restart remote-claude
```

```
🔄 상태 복구 중...
✅ 프로젝트 3개 복원됨
✅ 스니펫 12개 복원됨
✅ 실행 중이던 작업 1개 재시작
```

### 6.3 멀티 프로젝트 관리

여러 채널을 생성하여 프로젝트별로 관리:

```
#blog-project    → /Users/idongho/proj/blog
#api-project     → /Users/idongho/proj/api
#docs-project    → /Users/idongho/proj/docs
```

각 채널은 독립적인 큐와 tmux 세션을 가집니다.

---

## 7. 트러블슈팅

### 7.1 tmux 세션 확인

```bash
# 모든 tmux 세션 확인
tmux ls

# 특정 세션 attach
tmux attach -t remote-claude-blog-project
```

### 7.2 로그 확인

```bash
# 실시간 로그
tail -f ~/.remote-claude/logs/combined.log

# 에러 로그만
tail -f ~/.remote-claude/logs/error.log

# pm2 로그
pm2 logs remote-claude
```

### 7.3 설정 초기화

문제가 계속되면 설정 초기화:

```bash
# 설정 디렉토리 삭제
rm -rf ~/.remote-claude

# remote-claude 재시작
pm2 restart remote-claude
```

재시작 시 자동으로 설정 파일이 재생성됩니다.

### 7.4 Socket Mode 연결 실패

**증상**: Slack 명령에 반응 없음

**해결**:
1. `.env` 파일의 토큰 확인
2. Slack App 설정에서 Socket Mode 활성화 확인
3. App-Level Token 스코프 확인 (`connections:write`)

```bash
# 토큰 테스트
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  https://slack.com/api/auth.test
```

### 7.5 Claude Code 응답 없음

**증상**: 작업은 시작되지만 진행 상황 업데이트 안 됨

**해결**:
1. tmux 세션 확인
2. Claude Code CLI 정상 작동 여부 확인
3. 폴링 주기 조정 (기본 5초)

```bash
# tmux 세션에서 직접 확인
tmux attach -t remote-claude-project-name

# Ctrl+B, D로 detach
```

---

## 8. 실제 활용 사례

### 사례 1: 긴급 버그 수정 (도입부 사례)

- **상황**: 주말 외출 중 프로덕션 에러
- **소요 시간**: 10분
- **사용 도구**: 스마트폰 Slack 앱
- **성과**: 노트북 없이 버그 수정 및 배포

### 사례 2: 코드 리뷰 자동화

```
# 새 PR 생성 시 자동 리뷰
/ask "Review pull request #42 for security issues and performance"
```

```
✅ PR #42 리뷰 완료

🔒 보안 이슈: 없음
⚡ 성능 개선 제안:
- useCallback 사용 권장 (3곳)
- 불필요한 re-render 방지

📝 코드 품질:
- ESLint: 통과
- TypeScript: 통과
- 테스트 커버리지: 94%
```

### 사례 3: 일괄 배치 작업

매일 새벽 자동 배치 작업:

```bash
# crontab 설정
0 2 * * * curl -X POST -H "Content-Type: application/json" \
  -d '{"channel":"blog-project","text":"/run daily-backup"}' \
  $SLACK_WEBHOOK_URL
```

---

## 9. 성과 및 배운 점

### 성과

**시간 절약**:
- 긴급 대응 시간: 30분 → 10분 (67% 절감)
- 코드 리뷰 시간: 20분 → 5분 (75% 절감)

**생산성 향상**:
- 어디서나 개발 가능 (카페, 이동 중, 침대에서)
- 노트북 없이도 프로덕션 관리

**비용 절감**:
- GitHub Codespaces 불필요 ($10/월 절감)
- 별도 원격 데스크톱 솔루션 불필요

### 배운 점

**1. Slack은 강력한 개발 플랫폼**
- 모바일 친화적 UI
- 인터랙티브 버튼으로 UX 개선
- 팀 협업 도구와 자연스러운 통합

**2. tmux는 필수 도구**
- 세션 관리의 중요성
- 백그라운드 작업 안정성
- 상태 복구 메커니즘

**3. 작업 큐는 안정성의 핵심**
- 순차 처리로 충돌 방지
- FIFO 보장으로 예측 가능성
- 에러 처리 및 재시도 로직

**4. 보안은 항상 우선**
- 파일 다운로드 검증
- Path traversal 방지
- 환경 변수 노출 차단

---

## 10. 다음 단계

### 추가 기능 계획

1. **멀티 채널 동시 작업**
   - 현재: 채널당 1개 작업
   - 계획: 동시 실행 옵션 추가

2. **작업 스케줄링**
   - cron 표현식으로 정기 작업
   - Slack에서 직접 스케줄 설정

3. **결과 알림 강화**
   - 작업 완료 시 @mention
   - 에러 발생 시 자동 알림

4. **웹 대시보드**
   - 실시간 작업 모니터링
   - 통계 및 분석

### 기여 방법

이 프로젝트는 오픈소스입니다!

```bash
# GitHub 저장소
git clone https://github.com/dh1789/remote-claude.git

# 이슈 및 PR 환영
https://github.com/dh1789/remote-claude/issues
```

**기여 아이디어**:
- 새로운 명령어 추가
- 다른 AI 도구 통합 (GitHub Copilot, etc.)
- UI/UX 개선
- 문서 번역

---

## 11. 결론

**Slack + tmux + Claude Code = 어디서나 AI 코딩**

이제 노트북 없이도:
- ✅ 긴급 버그 수정
- ✅ 코드 리뷰
- ✅ 배포 및 모니터링
- ✅ 프로젝트 관리

모두 스마트폰 하나로 가능합니다.

**시작하기**:

```bash
git clone https://github.com/dh1789/remote-claude.git
cd remote-claude
npm install
npm run build

# .env 설정 후
npm start
```

**첫 명령어**:

```
/setup my-project /path/to/project
/ask "Hello, Claude!"
```

이제 당신도 카페에서 커피 마시며 프로덕션 에러를 수정할 수 있습니다. ☕️

---

## 참고 자료

### 프로젝트

- [remote-claude GitHub](https://github.com/dh1789/remote-claude)
- [이슈 및 토론](https://github.com/dh1789/remote-claude/issues)

### 공식 문서

- [Slack API](https://api.slack.com/)
- [Slack Socket Mode](https://api.slack.com/apis/connections/socket)
- [tmux](https://github.com/tmux/tmux)
- [Claude Code](https://claude.ai/code)

### 관련 포스트

- [Claude Code로 2주만에 블로그 자동화 만들기](../claude-code-blog-automation-project)
- [AI 시대의 개발자: Claude Code 통합 5가지 방법](../ai-developer-claude-code-integration)

---

**이 포스트가 도움이 되셨나요?**

질문이나 제안이 있으시면 댓글로 남겨주세요! 🙌
