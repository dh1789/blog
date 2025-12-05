---
title: "Slack으로 Claude Code 원격 제어하기: 모바일에서도 AI 코딩이 가능하다"
slug: "remote-claude-slack-mobile-coding"
excerpt: "토요일 오후, 카페에서 프로덕션 에러 발생. 노트북은 집에 두고 나왔다. 10분 후, 스마트폰 Slack 앱으로 버그 수정 완료. Slack + tmux + Claude Code 통합으로 어디서나 AI 코딩이 가능하다."
status: "draft"
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

- **문제**: 외출 중 긴급 프로덕션 에러, 노트북 없음
- **해결**: Slack + tmux + Claude Code로 스마트폰에서 AI가 코딩
- **성과**: 10분 만에 버그 수정 완료, 어디서나 개발 가능

---

## 1. 토요일 오후, 프로덕션 에러 발생

토요일 오후 3시, 카페에서 커피를 마시던 중 Slack 메시지가 울렸다.

```
@channel 긴급! 프로덕션 에러 발생
Error: Database connection timeout
영향: 전체 사용자 로그인 불가
```

**문제**:
- 노트북은 집에 두고 나옴
- 집까지 30분 거리
- 지금 당장 수정 필요

**기존 해결책의 한계**:
- **SSH 모바일 앱**: 화면 작고 편집 거의 불가능
- **GitHub Codespaces**: 월 $10 + 즉시 사용 어려움
- **TeamViewer**: 느리고 모바일에서 불편

그때 생각했다: **"Slack에서 바로 Claude Code를 쓸 수 있다면?"**

### 10분 후, 문제 해결

스마트폰 Slack 앱을 열고:

```
/ask "Analyze database timeout in src/server.ts"
```

5초 후:

```
🔍 분석 완료
- server.ts:45 - pool size 10 (너무 작음)
- 권장: 50으로 증가
```

바로 수정:

```
/run "Update pool size to 50"
```

```
✅ 수정 완료
- src/server.ts:45 변경
- Git commit 완료
```

배포:

```
/run deploy
```

```
✅ 배포 완료
- 테스트 통과
- 사용자 로그인 정상화
```

**소요 시간**: 10분
**사용 도구**: 스마트폰 Slack 앱
**비용**: $0

이게 가능했던 이유는 **remote-claude** 시스템이다.

---

## 2. remote-claude란?

### 핵심 아이디어

**Slack 채널 = 프로젝트**

```
#project-blog    → /Users/idongho/proj/blog
#project-api     → /Users/idongho/proj/api
```

각 채널에서 명령하면, 해당 디렉토리에서 Claude Code가 실행된다.

### 시스템 구조

```
Slack 채널 명령
    ↓ (Socket Mode)
Slack Bot (Node.js)
    ↓
작업 큐 (FIFO)
    ↓
tmux 세션 (프로젝트별)
    ↓
Claude Code CLI
    ↓ (5초 폴링)
실시간 진행 상황 → Slack 업데이트
```

**핵심 기술**:
1. **Slack Socket Mode**: 실시간 양방향 통신
2. **tmux**: 백그라운드 세션 유지 (연결 끊어져도 계속 실행)
3. **작업 큐**: 채널별 순서 보장
4. **폴링**: 5초마다 Claude Code 출력 확인

### 왜 이 조합인가?

**Slack**:
- 모바일 네이티브 앱 (어디서나 접근)
- 인터랙티브 버튼 (y/n 응답 쉬움)
- 팀 협업 도구와 자연스러운 통합

**tmux**:
- Claude Code는 대화형 CLI (사용자 입력 대기)
- SSH 연결 끊어져도 세션 유지
- 언제든 다시 attach 가능

**Claude Code**:
- AI가 코드 분석하고 수정
- 복잡한 작업도 자연어로 요청
- 컨텍스트 유지

---

## 3. 5분 만에 시작하기

### 3.1 사전 준비

```bash
# 1. tmux 설치
brew install tmux  # macOS
apt-get install tmux  # Ubuntu

# 2. Claude Code CLI 설치
# (Anthropic 공식 문서 참조)

# 3. Node.js 20+ 설치
node --version  # v20.0.0 이상
```

### 3.2 Slack App 생성 (1분)

**방법: Manifest 사용 (권장)**

1. https://api.slack.com → "Create New App"
2. "From an app manifest" 선택
3. 다음 manifest 붙여넣기:

```yaml
display_information:
  name: Remote Claude
features:
  bot_user:
    display_name: Remote Claude
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - chat:write
      - commands
      - files:write
settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - message.channels
  socket_mode_enabled: true
```

4. "Create" 클릭
5. "Install to Workspace"

### 3.3 remote-claude 설치 (2분)

```bash
# GitHub 클론
git clone https://github.com/dh1789/remote-claude.git
cd remote-claude

# 설치 및 빌드
npm install
npm run build
```

### 3.4 환경 변수 설정 (1분)

`.env` 파일 생성:

```bash
# Slack 토큰 (api.slack.com에서 복사)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

### 3.5 실행 (1분)

```bash
# 백그라운드 실행
npm install -g pm2
pm2 start dist/index.js --name remote-claude

# 로그 확인
pm2 logs remote-claude
```

---

## 4. 실전 명령어 Top 4

### 4.1 `/ask` - AI 분석 요청

**사용법**:
```
/ask "성능 병목 찾아줘"
```

**실제 예시**:
```
🔄 분석 중...

🔍 발견 (src/api/users.ts:127)
- O(n²) 알고리즘 → Map 사용으로 O(n) 개선 가능
- 불필요한 DB 쿼리 3개 → 배치 처리 권장

💡 예상 효과
- 응답 시간: 2.5s → 0.3s (88% 개선)
- DB 부하: 90% 감소

✅ 완료 (45초 소요)
```

### 4.2 `/run` - 스니펫 실행

**스니펫 등록**:
```
/snippet add test "npm run build && npm test"
```

**실행**:
```
/run test
```

**출력**:
```
🔄 실행: npm run build && npm test

> build
✔ TypeScript 컴파일 (3.2s)

> test
✔ 42 tests passed (8.5s)

✅ 완료
```

**미리 등록하면 유용한 스니펫**:
- `deploy`: 배포 스크립트
- `lint-fix`: 린트 자동 수정
- `preview`: 로컬 서버 시작

### 4.3 `/download` - 파일 다운로드

**사용법**:
```
/download logs/error.log
```

**출력**:
```
📥 다운로드 준비...
✅ error.log (2.3 MB)
[다운로드 버튼]
```

**보안 제약**:
- 10MB 이하만 허용
- `.env`, `*.key` 등 차단
- 프로젝트 디렉토리 내부만

### 4.4 `/state` - 상태 확인

**사용법**:
```
/state
```

**출력**:
```
📊 Remote Claude 상태

프로젝트: /Users/idongho/proj/blog
작업 큐: 0개 대기
마지막 실행: 2분 전
tmux 세션: active

등록된 스니펫: 5개
- test, deploy, lint-fix, preview, backup
```

---

## 5. 실제 활용 사례

### 사례 1: 긴급 버그 수정 (도입부)

- **상황**: 주말 외출 중 프로덕션 에러
- **소요 시간**: 10분
- **성과**: 노트북 없이 해결

### 사례 2: 코드 리뷰 자동화

**Slack 명령**:
```
/ask "PR #42 리뷰해줘 (보안, 성능 중심)"
```

**Claude Code 분석**:
```
✅ PR #42 리뷰 완료

🔒 보안: 이슈 없음

⚡ 성능 개선 제안:
- useCallback 권장 (3곳)
- 불필요한 re-render 방지

📊 품질:
- ESLint: 통과
- 테스트 커버리지: 94%
```

**효과**:
- 리뷰 시간: 20분 → 5분 (75% 절감)
- 외출 중에도 리뷰 가능

---

## 6. 성과 및 다음 단계

### 성과

**시간 절약**:
- 긴급 대응: 30분 → 10분 (67% 절감)
- 코드 리뷰: 20분 → 5분 (75% 절감)

**생산성 향상**:
- 어디서나 개발 가능 (카페, 이동 중, 침대)
- 노트북 없이도 프로덕션 관리

**비용 절감**:
- GitHub Codespaces 불필요 ($10/월)
- 원격 데스크톱 솔루션 불필요

### 다음 단계

**추가 기능 계획**:
1. 멀티 채널 동시 작업
2. 작업 스케줄링 (cron)
3. 웹 대시보드

**오픈소스 기여**:
```bash
# GitHub 저장소
git clone https://github.com/dh1789/remote-claude.git

# 이슈 및 PR 환영
https://github.com/dh1789/remote-claude/issues
```

---

## 참고 자료

### 프로젝트
- [remote-claude GitHub](https://github.com/dh1789/remote-claude)

### 공식 문서
- [Slack API](https://api.slack.com/)
- [Slack Socket Mode](https://api.slack.com/apis/connections/socket)
- [tmux](https://github.com/tmux/tmux)
- [Claude Code](https://claude.ai/code)

### 관련 포스트
- [오픈소스 프로젝트 공개 전 체크리스트](../opensource-project-preparation-checklist)

---

**이 포스트가 도움이 되셨나요?**

질문이나 제안이 있으시면 댓글로 남겨주세요! 🙌
