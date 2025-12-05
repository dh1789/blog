---
title: "Slack Bot 설정 완전 가이드 (2/5): Socket Mode와 Bot Token 설정"
slug: "remote-claude-day2-slack-bot-setup"
excerpt: "Day 1에서 Slack Bot 설정이 어려웠나요? Socket Mode 연결부터 Bot Token 권한까지 완전 정복 가이드. Event Subscriptions 이벤트 처리, Interactive Components 버튼 설정, Slash Commands 6가지 명령어 등록 방법 상세 설명. Bot Token 권한 에러와 Socket Mode 연결 실패 트러블슈팅 포함. remote-claude를 10분 만에 완벽 설정하세요."
status: "publish"
categories:
  - "개발"
  - "AI"
  - "DevOps"
tags:
  - "Slack"
  - "Slack Bot"
  - "Socket Mode"
  - "Bot Token"
  - "Event Subscriptions"
  - "Interactive Components"
language: "ko"
---

# Slack Bot 설정 완전 가이드 (2/5): Socket Mode와 Bot Token 설정

## TL;DR

- **대상**: Day 1에서 Slack Bot 설정이 어려웠던 분들
- **핵심 내용**: Slack Bot 권한, Socket Mode, Bot Token 완전 분석
- **결과**: remote-claude를 위한 Slack Bot 완벽 설정
- **소요 시간**: 10분

---

## 1. 왜 Slack Bot 설정이 어려운가?

Day 1에서 Slack Bot 설정을 따라하다가 막힌 분들이 많을 것입니다.

**흔한 문제들**:
- "Bot Token이 뭔지 모르겠어요"
- "Socket Mode는 왜 필요한가요?"
- "Event Subscriptions 설정이 복잡해요"
- "권한을 어디까지 줘야 하나요?"

이 포스트에서는 **Slack Bot의 모든 설정을 상세히 설명**합니다.

---

## 2. Slack Bot 권한 체계: Bot Token Scopes 완전 분석

### 2.1 Bot Token이란?

**Bot Token**은 Slack Bot이 워크스페이스에 접근하기 위한 인증 키입니다.

```
xoxb-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
```

- `xoxb-`로 시작 (Bot Token)
- remote-claude가 Slack API를 호출할 때 사용
- **절대 공개하지 마세요** (GitHub에 올리지 않기)

### 2.2 필수 Bot Token Scopes (8개)

Slack Bot에 최소한으로 필요한 권한 목록입니다.

| Scope | 역할 | 필요성 |
|-------|------|--------|
| `app_mentions:read` | @mention 읽기 | Slack Bot 호출 감지 |
| `channels:history` | 채널 메시지 읽기 | 채널 메시지 처리 |
| `channels:read` | 채널 정보 읽기 | 프로젝트 연결 확인 |
| `chat:write` | 메시지 전송 | Claude Code 응답 전송 |
| `commands` | Slash Commands 처리 | /setup, /run 등 |
| `files:write` | 파일 업로드 | /download 명령 |
| `im:history` | DM 메시지 읽기 | 개인 메시지 처리 (선택) |
| `im:write` | DM 전송 | 개인 메시지 응답 (선택) |

**최소 권한 원칙**:
- 필요한 권한만 부여 (보안)
- 향후 기능 추가 시 권한 추가 가능

### 2.3 Bot Token 발급 방법

```bash
# 1. Slack API 사이트 접속
https://api.slack.com/apps

# 2. App 선택 → "OAuth & Permissions"

# 3. "Bot Token Scopes" 섹션에서 권한 추가

# 4. "Install to Workspace" 클릭

# 5. Bot Token 복사 (xoxb-...)
```

**환경 변수 설정**:
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

---

## 3. Event Subscriptions 설정: 메시지 처리의 핵심

### 3.1 Event Subscriptions란?

**Event Subscriptions**는 Slack에서 발생하는 이벤트를 Slack Bot이 수신하는 방식입니다.

**핵심 이벤트** (2개):
1. `message.channels`: 채널에 메시지가 올라올 때
2. `app_mention`: Slack Bot이 @mention될 때

### 3.2 왜 두 개 이벤트가 필요한가?

**`message.channels`**:
- 채널의 모든 메시지 수신
- remote-claude의 "Plain text 실행" 기능에 필수
- 명령어 없이 그냥 말하면 Claude Code 실행

**`app_mention`**:
- @remote-claude로 명시적 호출
- 다른 대화 중에도 Slack Bot 호출 가능
- 멀티 프로젝트 환경에서 유용

### 3.3 Event Subscriptions 설정

```bash
# 1. Slack API 사이트 → "Event Subscriptions"

# 2. "Enable Events" 토글 ON

# 3. "Subscribe to bot events" 섹션에서 추가:
#    - message.channels
#    - app_mention

# 4. "Save Changes"
```

**중요**: Socket Mode 사용 시 Request URL 불필요!

---

## 4. Slash Commands 등록: 6가지 명령어 완전 가이드

### 4.1 remote-claude Slash Commands

| 명령어 | 역할 | 예시 |
|--------|------|------|
| `/setup` | 프로젝트 연결 | `/setup /Users/idongho/proj/blog` |
| `/run` | 스니펫 실행 | `/run test` |
| `/ask` | (Deprecated) Plain text로 대체 | - |
| `/download` | 파일 다운로드 | `/download logs/error.log` |
| `/state` | 상태 확인 | `/state` |
| `/cancel` | 작업 취소 | `/cancel` |

**참고**: 최신 버전은 Plain text 실행을 권장하므로 `/ask`는 사용하지 않습니다.

### 4.2 Slash Commands 등록 방법

```bash
# 1. Slack API 사이트 → "Slash Commands"

# 2. "Create New Command" 클릭

# 3. 각 명령어 정보 입력:
#    Command: /setup
#    Request URL: (Socket Mode 사용 시 비워둠)
#    Short Description: Connect project directory
#    Usage Hint: /setup [directory]

# 4. 나머지 명령어도 동일하게 등록
```

**Socket Mode 장점**: Request URL 설정 불필요 (서버 없이 동작)

---

## 5. Interactive Components: 단축 명령 버튼

### 5.1 Interactive Components란?

**Interactive Components**는 Slack 메시지에 버튼을 추가하여 명령어를 빠르게 실행하는 기능입니다.

**remote-claude의 3가지 단축 버튼**:
```
📊 [상태 확인]    → /state 실행 (채널 상태 + 작업 큐 확인)
❌ [작업 취소]    → /cancel 실행 (실행 중인 작업 중단)
📎 [파일 다운로드] → 파일 목록 모달 표시 후 다운로드
```

### 5.2 왜 필요한가?

**사용자 경험 개선**:
- **명령어 입력 불필요**: `/state` 타이핑 대신 버튼 클릭
- **스마트폰 최적화**: 터치 한 번으로 즉시 실행
- **오타 방지**: 명령어 철자 틀릴 걱정 없음
- **빠른 실행**: 자주 쓰는 명령을 즉시 실행

### 5.3 버튼 사용 예시

**시나리오**: 작업 진행 상황 빠르게 확인하기

```
1. Slack 채널에서 📊 [상태 확인] 버튼 클릭

2. 즉시 응답:
   현재 채널: #project-blog
   프로젝트: /Users/idongho/proj/blog
   작업 큐: 0개 대기
   마지막 실행: 2분 전
```

**장점**: `/state` 명령어 입력 없이 버튼 한 번으로 완료

### 5.4 Interactive Components 설정

```bash
# 1. Slack API 사이트 → "Interactivity & Shortcuts"

# 2. "Interactivity" 토글 ON

# 3. Request URL: (Socket Mode 사용 시 비워둠)

# 4. "Save Changes"
```

**Socket Mode 사용 시**: Request URL 불필요, WebSocket으로 버튼 클릭 이벤트 자동 처리

---

## 6. Socket Mode vs Webhooks: 왜 Socket Mode인가?

### 6.1 두 가지 통신 방식

**Webhooks (전통적 방식)**:
- Slack → 개발자 서버로 HTTP POST 요청
- 공개 URL 필요 (ngrok, 클라우드 서버)
- Request URL 설정 필수

**Socket Mode (최신 방식)**:
- Slack ↔ 개발자 서버 WebSocket 연결
- 공개 URL 불필요 (로컬에서 실행)
- Request URL 설정 불필요

### 6.2 Socket Mode 장점

| 항목 | Webhooks | Socket Mode |
|------|----------|-------------|
| 공개 URL | 필요 | 불필요 |
| 서버 운영 | 필요 | 불필요 |
| 설정 복잡도 | 높음 | 낮음 |
| 보안 | 공개 노출 | 로컬 실행 |
| 비용 | 서버 비용 | 무료 |

**remote-claude가 Socket Mode를 선택한 이유**:
1. 로컬 환경에서 바로 실행 가능
2. 서버 설정 불필요 (진입 장벽 낮음)
3. 보안 (공개 URL 불필요)

### 6.3 Socket Mode 설정

```bash
# 1. Slack API 사이트 → "Socket Mode"

# 2. "Enable Socket Mode" 토글 ON

# 3. "App-Level Token" 생성
#    Token Name: remote-claude
#    Scope: connections:write

# 4. Token 복사 (xapp-...)
```

**환경 변수 설정**:
```bash
SLACK_APP_TOKEN=xapp-your-app-token
```

**중요**: Bot Token (xoxb-)과 App Token (xapp-) 구분!

---

## 7. 트러블슈팅: Bot Token과 권한 에러 해결

### 7.1 Bot Token 관련 이슈

**에러**: `invalid_auth`

**원인**:
- Bot Token이 잘못됨 (xoxb-로 시작하지 않음)
- App Token과 혼동 (xapp-는 App Token)

**해결**:
```bash
# .env 파일 확인
SLACK_BOT_TOKEN=xoxb-...  # Bot Token (xoxb-)
SLACK_APP_TOKEN=xapp-...  # App Token (xapp-)
```

### 7.2 권한 에러

**에러**: `missing_scope`

**원인**:
- 필요한 Bot Token Scope가 없음
- 예: `chat:write` 없이 메시지 전송 시도

**해결**:
```bash
# 1. Slack API 사이트 → "OAuth & Permissions"
# 2. "Bot Token Scopes"에서 누락된 권한 추가
# 3. "Reinstall to Workspace" (재설치 필요!)
```

**주의**: 권한 추가 후 반드시 재설치!

### 7.3 Socket Mode 연결 실패

**에러**: `connection_failed`

**원인**:
- App Token이 잘못됨
- `connections:write` 권한 누락

**해결**:
```bash
# 1. Slack API 사이트 → "Basic Information"
# 2. "App-Level Tokens" → 기존 토큰 삭제
# 3. 새 토큰 생성 (Scope: connections:write)
# 4. .env 파일 업데이트
```

### 7.4 Event Subscriptions 미작동

**증상**: 채널에 메시지를 보내도 Slack Bot이 반응 안 함

**원인**:
- Event Subscriptions 비활성화
- Slack Bot을 채널에 초대하지 않음

**해결**:
```bash
# 1. Slack 채널에서 /invite @remote-claude
# 2. Slack API 사이트 → "Event Subscriptions" 확인
# 3. message.channels, app_mention 이벤트 확인
```

### 7.5 Interactive Components 미작동

**증상**: 버튼이 표시되지 않음

**원인**:
- Interactive Components 비활성화

**해결**:
```bash
# Slack API 사이트 → "Interactivity & Shortcuts"
# "Interactivity" 토글 ON 확인
```

---

## 8. 완전한 Slack Bot 설정 체크리스트

### 8.1 필수 설정 (5단계)

- [ ] **Bot Token Scopes** (8개 권한)
  - app_mentions:read, channels:history, channels:read
  - chat:write, commands, files:write
  - im:history (선택), im:write (선택)

- [ ] **Event Subscriptions** (2개 이벤트)
  - message.channels
  - app_mention

- [ ] **Slash Commands** (6개 명령어)
  - /setup, /run, /download, /state, /cancel
  - /ask (선택, Deprecated)

- [ ] **Interactive Components**
  - Interactivity 토글 ON

- [ ] **Socket Mode**
  - Socket Mode 토글 ON
  - App-Level Token 생성 (xapp-)

### 8.2 환경 변수 확인

```bash
# .env 파일
SLACK_BOT_TOKEN=xoxb-...  # OAuth & Permissions에서 복사
SLACK_APP_TOKEN=xapp-...  # App-Level Token에서 복사
```

### 8.3 최종 테스트

```bash
# 1. remote-claude 실행
npm start

# 2. Slack 채널에 Slack Bot 초대
/invite @remote-claude

# 3. Plain text 실행 테스트
"Hello Claude"

# 4. Slash Command 테스트
/state

# 5. Interactive Components 테스트
# (Claude Code가 y/n 물어볼 때 버튼 클릭)
```

**모두 성공하면**: Slack Bot 설정 완료! 🎉

---

## 9. 다음 단계

**Day 3 예고**: "여러 프로젝트 동시 관리 (3/5): 4단계 메시지 처리와 작업 큐"

Slack Bot 설정이 완료되었으니, 이제 본격적으로 remote-claude의 핵심 기능을 알아봅니다:
- 4단계 메시지 처리 파이프라인 심화
- 채널별 프로젝트 관리
- FIFO 작업 큐 시스템
- 여러 프로젝트 동시 작업 패턴

---

## 시리즈 네비게이션

- [← Day 1: 로컬 환경을 어디서나](../2025-11-20-remote-claude-day1-local-dev-anywhere)
- **Day 2: Slack Bot 설정 완전 가이드** (현재)
- [→ Day 3: 여러 프로젝트 동시 관리](#) (곧 발행 예정)
- [→ Day 4: 생산성 극대화](#) (곧 발행 예정)
- [→ Day 5: 스마트폰 최적화](#) (곧 발행 예정)

---

## 참고 자료

### 공식 문서
- [Slack API 문서](https://api.slack.com/)
- [Socket Mode 가이드](https://api.slack.com/apis/connections/socket)
- [Bot Token Scopes 레퍼런스](https://api.slack.com/scopes)
- [Event Subscriptions 가이드](https://api.slack.com/events-api)
- [Interactive Components 문서](https://api.slack.com/interactivity)

### 프로젝트
- [remote-claude GitHub](https://github.com/dh1789/remote-claude)

### 관련 포스트
- [Day 1: 로컬 환경을 어디서나](../2025-11-20-remote-claude-day1-local-dev-anywhere)

---

**이 포스트가 도움이 되셨나요?**

Slack Bot 설정에서 막히셨다면 댓글로 질문해주세요! 🙌
