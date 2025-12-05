---
title: "Slack으로 Claude Code 원격 제어 (1/5): 로컬 환경을 어디서나"
slug: "remote-claude-day1-local-dev-anywhere"
excerpt: "카페에서 개발하고 싶은데 DB는? 웹 에이전트는 GitHub만 접근, 로컬 환경 불가. Slack + Claude Code로 해결. 원격개발로 로컬 DB, 테스트, 웹서버 어디서나 사용. 여러 프로젝트 동시 작업. 5분 설정으로 시작."
status: "publish"
categories:
  - "개발"
  - "AI"
  - "DevOps"
tags:
  - "Slack"
  - "Claude Code"
  - "원격개발"
  - "로컬환경"
  - "tmux"
  - "자동화"
  - "Slack Bot"
language: "ko"
---

# Slack으로 Claude Code 원격 제어 (1/5): 로컬 환경을 어디서나

## TL;DR

- **문제**: 집 밖에서 Claude Code 개발하고 싶은데 로컬 환경(DB, 웹서버, 테스트) 필요
- **기존 해결책의 한계**: 웹 에이전트는 GitHub만 접근, 로컬 환경 불가
- **해결**: Slack + tmux + Claude Code로 로컬 개발 환경 원격 제어
- **성과**: 어디서나 개발 가능, 여러 프로젝트 동시 관리

---

## 1. 카페에서 개발하고 싶은데...

일요일 오후, 카페에서 노트북을 열었다. 새로운 기능 아이디어가 떠올라서 바로 작업하고 싶었다.

**문제**: 이 기능은 로컬 개발 환경이 필요했다.
- PostgreSQL 데이터베이스 연결
- Redis 캐시 서버
- 테스트 코드 실행 (Jest + DB 픽스처)
- 로컬 웹서버에서 동작 확인

**웹 에이전트 (Cursor, Bolt 등)로는?**

최근 많은 AI 개발 도구들이 "웹에서 바로 GitHub 코드 수정"을 지원한다:
- Cursor: GitHub 저장소 직접 수정
- Bolt: 웹에서 바로 코딩하고 커밋

하지만 **로컬 환경은 접근 불가**:
- ❌ 로컬 DB 연결 불가
- ❌ 로컬 웹서버 실행 불가
- ❌ 환경별 설정 파일 (.env.local) 접근 불가
- ❌ 테스트 실행 불가 (DB 의존성)

**결론**: 로컬 개발 환경을 원격으로 제어해야 한다.

### 여러 프로젝트 동시 작업도 필요

개인 프로젝트만 해도 3개:
- `blog`: WordPress 자동화 블로그
- `api`: 백엔드 API 서버
- `docs`: 문서 사이트

각 프로젝트마다:
- 다른 DB 연결
- 다른 환경 변수
- 다른 테스트 설정

한 프로젝트에서만 작업하는 게 아니라, **여러 프로젝트를 오가며 동시에 작업**하고 싶었다.

---

## 2. 왜 독자 플랫폼 대신 Slack인가?

처음엔 "원격 개발 전용 앱을 만들까?" 생각했다.

### 독자 플랫폼의 문제

**개발 리소스**:
- 웹 앱 (React + 백엔드)
- iOS 네이티브 앱
- Android 네이티브 앱
- 각각 테스트 및 배포

**유지보수**:
- 버그 수정
- 보안 업데이트
- OS별 대응 (iOS 17, Android 14...)

**예상 투입 시간**: 수백 시간

"이건 아니다. 더 간단한 방법이 있을 거야."

### Slack을 선택한 이유

**이미 팀에서 사용 중**:
- 개발팀 커뮤니케이션 도구
- 이미 모든 디바이스에 설치됨
- 추가 앱 설치 불필요

**멀티 디바이스 네이티브 앱**:
- iOS, Android, 웹, 데스크톱 모두 지원
- Slack이 알아서 유지보수
- 나는 Bot만 만들면 됨

**인터랙티브 UI**:
- 버튼 (y/n 응답)
- 파일 업로드/다운로드
- 실시간 메시지 업데이트
- 멘션, 스레드 등

**Socket Mode로 간단한 통합**:
- 웹훅 서버 불필요
- 로컬에서 Bot 실행
- WebSocket으로 실시간 통신

### 채널 = 프로젝트

Slack의 채널 시스템을 활용하면:

```
#project-blog    → /Users/idongho/proj/blog
#project-api     → /Users/idongho/proj/api
#project-docs    → /Users/idongho/proj/docs
```

각 채널에서 명령하면, 해당 프로젝트 디렉토리에서 Claude Code가 실행된다.

**장점**:
- 여러 프로젝트 동시 관리
- 채널별 독립적인 작업 큐
- 팀원과 함께 사용 가능 (향후)

---

## 3. 핵심 아키텍처

### 3.1 시스템 구조

```
Slack 채널 메시지
    ↓ (Socket Mode WebSocket)
Slack Bot (Node.js + TypeScript)
    ↓
4단계 메시지 처리 파이프라인
    ↓
작업 큐 (FIFO, 채널별)
    ↓
tmux 세션 (프로젝트별 독립)
    ↓
Claude Code CLI
    ↓ (5초 폴링)
실시간 진행 상황 → Slack 메시지 업데이트
```

### 3.2 4단계 메시지 처리 파이프라인

처음엔 "/ask 명령어만 지원"하려 했는데, 사용하다 보니 불편했다.

**현재는 4단계 파이프라인**으로 진화:

| Stage | 패턴 | 예시 | 설명 |
|-------|------|------|------|
| **1** | Slack 네이티브 | /remind, /invite | Slack이 처리 |
| **2** | Bot 메타 명령 | /setup, /status, /help | Bot 설정 |
| **3** | DSL 명령 | `` `build` `` | Backtick 감싼 명령 |
| **4** | **Plain text** | "테스트 실행해줘" | **Claude Code 실행** |

**핵심**: Stage 4에서 **명령어 없이 그냥 말하면 됨**!

```
# 이제 이렇게 쓸 수 있음
"프로젝트 구조 분석해줘"
"성능 병목 찾아줘"
"테스트 실행하고 결과 알려줘"
```

Slack mention만 필터링하고, 나머지는 그대로 Claude Code로 전달된다.

### 3.3 각 컴포넌트의 역할

**Slack (UI 플랫폼)**:
- 사용자 입력 받기
- 진행 상황 표시
- 인터랙티브 버튼 (y/n)
- 파일 다운로드

**tmux (세션 관리)**:
- Claude Code는 대화형 CLI (사용자 입력 대기)
- SSH 연결 끊어져도 세션 유지
- 프로젝트별 독립 세션

**작업 큐 (순차 처리)**:
- 채널당 1개 작업만 실행
- FIFO 보장 (순서대로)
- 동시 실행 방지

**폴링 (실시간 업데이트)**:
- 5초마다 Claude Code 출력 확인
- Slack 메시지 자동 업데이트
- 완료/에러 알림

---

## 4. 5분 설정 가이드

### 4.1 사전 준비 (1분)

```bash
# 1. tmux 설치
brew install tmux  # macOS
apt-get install tmux  # Ubuntu

# 2. Claude Code CLI 설치
# (Anthropic 공식 문서 참조: https://claude.ai/code)

# 3. Node.js 20+ 설치
node --version  # v20.0.0 이상
```

### 4.2 Slack App 생성 및 Bot 설정 (2분)

**Step 1: App 생성**

1. https://api.slack.com/apps → "Create New App" 클릭
2. "From an app manifest" 선택
3. 워크스페이스 선택
4. 다음 manifest 붙여넣기:

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
      - channels:read
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

5. "Create" 클릭

**Step 2: Bot Token 발급**

1. 왼쪽 메뉴 → "OAuth & Permissions" 클릭
2. "Bot User OAuth Token" 복사 (`xoxb-...`)
3. 안전한 곳에 저장

**Step 3: App-Level Token 생성**

1. 왼쪽 메뉴 → "Basic Information" 클릭
2. "App-Level Tokens" 섹션 → "Generate Token and Scopes" 클릭
3. Token Name: `socket-token` (아무 이름이나)
4. Scope 추가: `connections:write`
5. "Generate" 클릭
6. Token 복사 (`xapp-...`)
7. 안전한 곳에 저장

**Step 4: 워크스페이스에 설치**

1. 왼쪽 메뉴 → "Install App" 클릭
2. "Install to Workspace" 클릭
3. 권한 승인

**완료!** 이제 Slack Bot이 준비되었습니다.

**문제 해결**:
- Bot Token이 안 보이면? → "Install to Workspace" 먼저 실행
- App-Level Token 권한 에러? → `connections:write` 스코프 확인
- 상세 설정은 [Day 2: Slack Bot 설정 완전 가이드](#)에서 다룹니다

### 4.3 remote-claude 설치 (1분)

```bash
# GitHub 클론
git clone https://github.com/dh1789/remote-claude.git
cd remote-claude

# 설치 및 빌드
npm install
npm run build
```

**참고**: [GitHub 저장소](https://github.com/dh1789/remote-claude)

### 4.4 환경 변수 설정 (30초)

`.env` 파일 생성:

```bash
# Slack 토큰 (4.2에서 복사한 값)
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

### 4.5 실행 (30초)

```bash
# 백그라운드 실행 (프로덕션)
npm install -g pm2
pm2 start dist/index.js --name remote-claude

# 로그 확인
pm2 logs remote-claude

# 또는 포그라운드 (테스트용)
npm start
```

**성공 메시지**:
```
✅ Slack Bot connected
✅ Listening for messages...
```

---

## 5. 첫 명령어 실행

### 5.1 Bot을 채널에 초대

1. Slack에서 채널 생성: `#my-blog`
2. 채널에서 `/invite @Remote Claude` 입력
3. Bot이 채널에 추가됨

### 5.2 프로젝트 연결

```
/setup my-blog /Users/idongho/proj/blog
```

```
✅ 채널 #my-blog를 프로젝트 /Users/idongho/proj/blog에 연결했습니다.
```

### 5.3 Plain text로 바로 실행

이제 **명령어 없이 그냥 말하면** 됨:

```
프로젝트 구조 분석해줘
```

**5초 후**:

```
🔄 작업 시작

📂 프로젝트 구조 분석 중...

blog/
├── packages/
│   ├── cli/          # CLI 도구
│   ├── core/         # 핵심 로직
│   └── shared/       # 공유 타입
├── content/          # 마크다운 콘텐츠
└── README.md

✅ 완료 (8초 소요)
```

### 5.4 스니펫 등록 및 실행

자주 쓰는 명령은 스니펫으로 저장:

```
/snippet add test "npm run build && npm test"
```

```
✅ 스니펫 'test' 저장됨
```

실행:

```
/run test
```

```
🔄 실행: npm run build && npm test

> build
✔ TypeScript 컴파일 (3.2s)

> test
✔ 42 tests passed (8.5s)

✅ 완료
```

### 5.5 인터랙티브 응답

Claude Code가 확인을 요청하면:

```
⚠️ 확인 필요:

"src/server.ts 수정하시겠습니까?"

응답: y 또는 n
```

그냥 `y` 또는 `n` 입력:

```
y
```

```
✅ 수정 완료
```

### 5.6 명령어 비교

| 방법 | 예시 | 사용 시기 |
|------|------|-----------|
| **Plain text** | "테스트 실행해줘" | 즉석 요청 |
| **`/run`** | /run build-test | 반복 작업 |
| **`/snippet`** | /snippet add ... | 스니펫 관리 |
| **`/download`** | /download logs/app.log | 파일 확인 |
| **`/state`** | /state | 상태 확인 |

---

## 6. 많은 시행착오 끝에

처음엔 "/ask 명령어만" 지원했다. 사용하다 보니:
- 매번 `/ask "..."` 타이핑이 불편
- 스마트폰에서 따옴표 입력 어려움
- 여러 명령어 체계가 필요

**4단계 파이프라인으로 진화**:
1. Slack 네이티브 → 통과
2. Bot 메타 명령 → 설정
3. DSL 명령 → 간결함
4. Plain text → **자연스러움**

**스마트폰 최적화**:
- 인터랙티브 버튼 (y/n)
- 한글 자판 오타 자동 변환 (`/ㄴㅅㅁ션` → `/state`)
- 메시지 자동 분할 (3500자 제한)
- 파일 다운로드 간편화

**현재 상태**: 스마트폰에서도 편리하게 사용 가능한 수준까지 완성!

자세한 시행착오와 해결책은 **Day 5: 스마트폰 최적화 편**에서 공유하겠습니다.

---

## 📚 시리즈 목차

1. **소개 + 빠른 시작** ← 현재 글
2. [Slack Bot 설정 완전 가이드](#) (곧 발행 예정)
3. [여러 프로젝트 동시 관리](#) (곧 발행 예정)
4. [생산성 극대화: 스니펫과 인터랙티브](#) (곧 발행 예정)
5. [스마트폰 최적화와 시행착오](#) (곧 발행 예정)

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
- [오픈소스 프로젝트 공개 전 체크리스트](../opensource-project-preparation-checklist)

---

**다음 단계**:
- **[Day 2: Slack Bot 설정 완전 가이드](#)** 읽기 (곧 발행)
- [GitHub 저장소](https://github.com/dh1789/remote-claude)에서 이슈 보고
- 댓글로 질문 남기기

**이 포스트가 도움이 되셨나요?**

Day 2에서는 Slack Bot 권한 설정, Event Subscriptions, Slash Commands 등록 등 상세한 설정 가이드를 다룹니다. 질문이나 제안이 있으시면 댓글로 남겨주세요! 🙌
