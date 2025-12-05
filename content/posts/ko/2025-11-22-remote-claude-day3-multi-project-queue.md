---
title: "여러 프로젝트 동시 관리 (3/5): 4단계 메시지 처리와 작업 큐"
slug: "remote-claude-day3-multi-project-queue"
excerpt: "3개 프로젝트를 Slack에서 동시 작업하는 방법. 4단계 메시지 처리 파이프라인으로 Plain text, DSL, Slash Commands 모두 지원. 채널별 작업 큐 시스템으로 FIFO 보장. Claude Code가 여러 프로젝트를 순서대로 처리. 채널 = 프로젝트 패턴으로 #project-blog, #project-api 동시 관리. remote-claude 멀티 프로젝트 완벽 가이드."
status: "draft"
categories:
  - "개발"
  - "AI"
  - "DevOps"
tags:
  - "Slack"
  - "Claude Code"
  - "여러 프로젝트"
  - "작업 큐"
  - "메시지 처리"
  - "FIFO"
language: "ko"
---

# 여러 프로젝트 동시 관리 (3/5): 4단계 메시지 처리와 작업 큐

## TL;DR

- **핵심 개념**: 4단계 메시지 처리 파이프라인 + 채널별 FIFO 작업 큐
- **결과**: 여러 프로젝트를 Slack 채널로 동시 관리, FIFO 순서 보장
- **키워드**: Plain text, DSL, FIFO, 채널 = 프로젝트
- **대상**: 여러 프로젝트를 동시에 진행하는 개발자
- **소요 시간**: 이해 10분, 실습 5분

---

## 1. 왜 여러 프로젝트 동시 관리가 필요한가?

**핵심 문제: Claude Code 대기 시간**

Claude Code로 작업할 때 이런 상황이 자주 발생합니다:

```
#project-blog에서:
"포스트 초안 작성해줘"

→ Claude Code 실행 중... (예상 5분)
→ 사용자는 멍하니 대기 ⏳
→ 이 시간이 아깝다!
```

**대기 시간을 활용하면?**

여러 프로젝트를 동시에 관리하는 핵심은 **대기 시간 활용**입니다:

```
1. #project-blog에서 작업 시작
   "포스트 초안 작성해줘" (5분 소요)

2. 대기하는 동안 #project-api로 전환
   "API 에러 디버깅해줘" (3분 소요)

3. 나중에 #project-blog로 돌아오면
   → 작성된 초안 확인 가능!

결과: 8분 대신 5분 만에 여러 프로젝트에서 2개 작업 완료 ✨
```

**기존 해결책의 한계**:
- **터미널 탭 전환**: 어느 프로젝트인지 헷갈림, 컨텍스트 유실
- **VS Code 워크스페이스**: 무거움, 모바일 불가

**remote-claude의 해결책**:
```
Slack 채널 = 프로젝트

#project-blog    → /Users/idongho/proj/blog
#project-api     → /Users/idongho/proj/api
#project-frontend → /Users/idongho/proj/frontend
```

- 채널만 바꾸면 프로젝트 전환 (1초)
- 각 채널의 대화 기록 = 프로젝트 작업 기록
- 대기 시간 활용으로 **효율성 2배 이상**

---

## 2. 4단계 메시지 처리 파이프라인 심화

### 2.1 왜 4단계인가?

**메시지 처리 파이프라인 설계 목표**:
1. **유연성**: 다양한 입력 방식 지원 (Plain text, DSL, Slash Commands)
2. **우선순위**: 중요한 명령 먼저 처리
3. **안정성**: 메시지 처리 단계별 검증으로 오류 방지

**4단계 파이프라인**:
```
들어온 메시지
    ↓
Stage 1: Slack 네이티브 명령 확인 (passthrough)
    ↓ (아니면)
Stage 2: Bot 메타 명령 (/setup, /state, /cancel)
    ↓ (아니면)
Stage 3: DSL (인터랙티브 입력 응답)
    ↓ (아니면)
Stage 4: Plain text → Claude Code 실행
```

### 2.2 Stage 1: Slack 네이티브 명령 (Pass-through)

**목적**: Slack 기본 명령은 건드리지 않고 통과

**예시**:
```
/invite @remote-claude  → Slack이 직접 처리
/archive               → Slack이 직접 처리
```

**처리 로직**: 메시지 처리 파이프라인이 개입하지 않음

### 2.3 Stage 2: Bot 메타 명령

**목적**: remote-claude 자체 관리 명령

**지원 명령어**:
- `/setup <프로젝트명> <경로>`: 프로젝트 연결
- `/state`: 상태 확인 (채널, 작업 큐)
- `/cancel`: 실행 중인 작업 취소
- `/download [file]`: 파일 다운로드

**특징**: **즉시 실행** (작업 큐에 넣지 않음)

**예시**:
```
/state

→ 즉시 응답:
   현재 채널: #project-blog
   프로젝트: /Users/idongho/proj/blog
   작업 큐: 1개 대기
```

### 2.4 Stage 3: DSL (Domain-Specific Language)

**목적**: Claude Code의 화살표 키와 Enter 이벤트 전달

**문제 상황**:

Claude Code가 선택지를 보여줄 때 Slack에서는 화살표 키를 누를 수 없습니다:

```
Claude Code가 보여줍니다:
  > Create new file
    Update existing file
    Delete file

→ Slack에서는 화살표 키로 이동 불가
→ Enter로 선택 불가
→ 작업이 멈춤!
```

**해결책: DSL (5개 명령)**

```
형식: `명령어`

지원 명령어:
`r`  → 화살표 우 (→)
`l`  → 화살표 좌 (←)
`u`  → 화살표 상 (↑)
`p`  → 화살표 하 (↓)
`e`  → Enter
```

**실제 사용 예시**:

```
Claude Code가 보여줌:
  > Create new file
    Update existing file
    Delete file

Slack에서:
→ `p` 입력 (아래로 이동)

Claude Code 화면 변경:
    Create new file
  > Update existing file
    Delete file

Slack에서:
→ `p` 입력 (다시 아래로)
→ `e` 입력 (Delete file 선택)

→ 작업 계속 진행 ✅
```

**장점**:
- **Slack에서도 화살표 키 이벤트 전달 가능**
- **백틱으로 명확히 구분**
- **즉시 전달** (< 1초)

**단점**:
- **5개 명령만 가능** (r, l, u, p, e)
- **직접 타이핑 불가** (y/n, 숫자 입력 안 됨)

**사용 시나리오**:
- Claude Code가 선택지 목록 보여줄 때
- 메뉴에서 항목 선택할 때
- "Press Enter to continue" 프롬프트
- 화살표로 탐색 가능한 UI

### 2.5 Stage 4: Plain Text (Claude Code 실행)

**형식**: 그냥 말하기

**예시**:
```
"테스트 실패 원인 찾아줘"
"package.json에 새 스크립트 추가해줘"
"API 응답 시간이 느려. 최적화해줘"
```

**처리 과정**:
1. 메시지 처리 파이프라인이 Claude Code로 전달
2. 작업 큐에 추가
3. Claude Code가 컨텍스트 이해하고 실행
4. 필요시 DSL로 인터랙티브 입력 요청

**장점**:
- **자연스러움**: 명령어 외울 필요 없음
- **지능적**: AI가 의도 파악하고 최선의 방법 선택
- **컨텍스트 유지**: 이전 대화 기억
- **복잡한 작업 가능**: 디버깅, 리팩토링, 분석

**단점**:
- **느림**: Claude Code 분석 시간 필요 (10-30초)
- **불확실성**: AI가 의도를 잘못 이해할 수 있음

**사용 시나리오**:
- 복잡한 작업 (디버깅, 리팩토링)
- 정확한 명령어를 모를 때
- 여러 단계가 필요한 작업

---

## 3. Plain text vs /run vs DSL: 언제 무엇을 쓸까?

### 3.1 비교표

| 방식 | 형식 | 목적 | 처리 속도 | 사용 예시 |
|------|------|------|----------|----------|
| **Plain text** | "그냥 말하기" | 작업 요청 | 느림 (10-30초) | "버그 찾아줘" |
| **DSL** | \`r/l/u/p/e\` | 화살표/Enter 전달 | 즉시 (< 1초) | \`p\`, \`e\` |
| **/run** | /run 스니펫명 | 복잡한 명령 실행 | 중간 (2-5초) | /run deploy |

### 3.2 Plain text 추천 상황

**복잡한 분석**:
```
"API 응답 시간이 느려. 원인 찾고 최적화해줘"
→ Claude Code가 프로파일링 → 병목 찾기 → 최적화 제안
```

**코드 수정**:
```
"User 모델에 email 필드 추가하고 마이그레이션 만들어줘"
→ Claude Code가 파일 찾기 → 수정 → 마이그레이션 생성
```

### 3.3 DSL 추천 상황

**선택지 목록 탐색**:
```
Claude Code:
  > Option A
    Option B
    Option C

→ Slack에서: `p` (아래로)
→ Slack에서: `e` (선택)
```

**메뉴 탐색**:
```
Claude Code:
  [File] [Edit] [View]

→ Slack에서: `r` (오른쪽으로)
→ Slack에서: `e` (선택)
```

**Enter 프롬프트**:
```
Claude Code: "Press Enter to continue..."
→ Slack에서: `e`
```

### 3.4 /run (스니펫) 추천 상황

**자주 쓰는 복잡한 명령**:
```
/run deploy

→ 스니펫 내용:
   npm run build &&
   npm test &&
   git push &&
   ssh deploy@server "cd /app && git pull && pm2 restart app"
```

**패턴화된 작업**:
```
/run backup
/run lint-fix
/run db-migrate
```

---

## 4. 채널별 프로젝트 관리: 채널 = 프로젝트 패턴

### 4.1 설정 방법

**Step 1**: Slack 채널 생성
```
#project-blog
#project-api
#project-frontend
```

**Step 2**: 각 채널에 Slack Bot 초대
```
/invite @remote-claude
```

**Step 3**: 각 채널에서 프로젝트 연결
```
# #project-blog에서
/setup blog /Users/idongho/proj/blog

# #project-api에서
/setup api /Users/idongho/proj/api

# #project-frontend에서
/setup frontend /Users/idongho/proj/frontend
```

**완료**: 각 채널이 독립적으로 동작

### 4.2 동작 원리

**채널 식별**:
```typescript
// 간략화된 코드
const channelId = message.channel;
const projectPath = channelProjects.get(channelId);
// #project-blog → /Users/idongho/proj/blog
```

**tmux 세션 분리**:
```
각 채널마다 독립적인 tmux 세션

#project-blog    → tmux session: blog-session
#project-api     → tmux session: api-session
#project-frontend → tmux session: frontend-session
```

**작업 큐 분리**:
```
채널별로 독립적인 작업 큐

#project-blog    → Queue: [task1, task2]
#project-api     → Queue: [task3]
#project-frontend → Queue: []
```

### 4.3 채널 간 전환

**시나리오**: 블로그 작업 중 API 에러 발생

```
1. #project-blog에서 작업 중
   "포스트 작성 도와줘"
   → Claude Code 실행 중...

2. #project-api로 이동
   "API 500 에러 디버깅해줘"
   → 독립적으로 즉시 작업 시작
   → blog 세션에 영향 없음

3. 나중에 #project-blog로 돌아오면
   → 이전 컨텍스트 그대로 유지
```

---

## 5. 작업 큐 시스템: FIFO 보장

### 5.1 왜 작업 큐가 필요한가?

**문제 상황**:
```
1초 간격으로 3개 명령 전송:
1. "파일 A 수정"
2. "파일 B 수정"
3. "파일 A와 B로 테스트"

→ 동시 실행하면? 파일이 아직 수정 안 됐는데 테스트 실행!
```

**해결**: 작업 큐로 **순서 보장**

### 5.2 FIFO (First-In-First-Out) 원칙

**FIFO란?**
FIFO는 "먼저 들어온 것이 먼저 나간다"는 뜻으로, remote-claude의 작업 큐 시스템이 FIFO 방식으로 동작합니다.

**FIFO 처리 순서**:
```
메시지 도착 순서:
1. "npm run build" (10:00:00)
2. "npm test" (10:00:01)
3. "git push" (10:00:02)

FIFO 작업 큐:
[build] → [test] → [push]

FIFO 실행 순서:
build 완료 → test 시작 → test 완료 → push 시작
```

**FIFO 보장 사항**:
- 같은 채널에서는 **절대 동시 실행 안 함**
- FIFO 원칙에 따라 이전 작업 완료 후 다음 작업 시작
- 작업 취소 시 FIFO 큐에서 제거

### 5.3 채널당 1개 작업 제한

**제한 이유**:
- Claude Code는 하나의 프로젝트에서 동시에 여러 작업 불가
- 파일 충돌 방지
- 리소스 효율성

**예시**:
```
#project-blog 작업 큐: [작업1 실행 중, 작업2 대기, 작업3 대기]
#project-api 작업 큐: [작업4 실행 중]

→ 총 2개 작업이 동시 실행 (채널별 1개씩)
```

### 5.4 작업 큐 확인 및 취소

**상태 확인**:
```
/state

→ 응답:
   현재 채널: #project-blog
   프로젝트: /Users/idongho/proj/blog
   작업 큐: 2개 대기
   - 실행 중: "테스트 실행"
   - 대기: "빌드", "배포"
```

**작업 취소**:
```
/cancel

→ 실행 중인 작업 즉시 중단
→ 큐의 다음 작업 시작
```

---

## 6. 여러 프로젝트 동시 작업 실전

### 6.1 시나리오: 3개 프로젝트 동시 진행

**상황**:
- **블로그**: 새 포스트 작성 중
- **API**: 성능 이슈 발생
- **프론트엔드**: PR 리뷰 요청

**Slack 채널 구성**:
```
#project-blog
#project-api
#project-frontend
```

### 6.2 실제 워크플로우

**10:00 - 블로그 작업 시작**
```
#project-blog에서:
"Day 4 포스트 초안 작성해줘"

→ Claude Code 실행 중 (예상 5분)
```

**10:01 - API 에러 발생**
```
#project-api로 이동:
"API 응답 시간 느려. 프로파일링해줘"

→ 블로그 작업은 계속 진행 중
→ API 작업도 동시에 시작
```

**10:05 - 프론트엔드 리뷰**
```
#project-frontend로 이동:
"PR #42 리뷰해줘"

→ 3개 프로젝트 모두 진행 중
```

**10:10 - 블로그 작업 완료**
```
#project-blog로 돌아옴:
"작성된 포스트 보여줘"

→ 이전 컨텍스트 유지
→ 바로 확인 가능
```

### 6.3 프로젝트 간 전환 패턴

**빠른 전환** (모바일에서도 쉬움):
```
Slack 앱에서 채널만 바꾸면 끝

#project-blog → #project-api (터치 2번)
```

**컨텍스트 보존**:
```
각 채널의 대화 기록 = 각 프로젝트의 작업 기록
→ 나중에 돌아와도 이어서 작업 가능
```

**독립적인 작업 큐**:
```
#project-blog: [작업1 완료, 작업2 완료]
#project-api: [작업3 실행 중]
#project-frontend: [작업4 대기]

→ 서로 영향 없음
```

---

## 7. 실전 팁

### 7.1 채널 이름 규칙

**권장 패턴**:
```
#project-{프로젝트명}

예시:
#project-blog
#project-api-v2
#project-mobile-app
```

**장점**:
- 일관성
- 검색 편함 (project로 검색하면 모든 프로젝트 채널 나옴)

### 7.2 작업 큐 활용 팁

**긴 작업은 분리**:
```
❌ "빌드하고 테스트하고 배포해줘"
   → 30분 걸림, 중간에 취소 어려움

✅ 나눠서 실행:
   1. "빌드해줘" (5분)
   2. 확인 후 "테스트해줘" (10분)
   3. 성공하면 "배포해줘" (15분)
```

**우선순위 높은 작업**:
```
긴급한 경우 /cancel로 현재 작업 중단
→ 우선순위 높은 작업 먼저 처리
```

### 7.3 메시지 처리 방식 선택 가이드

**화살표 탐색 필요** → DSL
```
선택지 목록이나 메뉴 탐색:
`r`  (화살표 우)
`l`  (화살표 좌)
`u`  (화살표 상)
`p`  (화살표 하)
`e`  (Enter 선택)
```

**자주 쓰는 복잡한 명령** → /run 스니펫
```
/run deploy
/run db-backup
```

**복잡한 작업** → Plain text
```
"성능 병목 찾고 최적화해줘"
"새 기능 구현해줘"
```

---

## 8. 다음 단계

**Day 4 예고**: "생산성 극대화 (4/5): 스니펫 시스템과 인터랙티브 버튼 활용"

4단계 메시지 처리와 작업 큐를 이해했으니, 이제 생산성을 극대화하는 방법을 알아봅니다:
- 스니펫 시스템 완전 활용
- 파일 다운로드 기능
- 메시지 자동 분할
- 실전 생산성 패턴

---

## 시리즈 네비게이션

- [← Day 1: 로컬 환경을 어디서나](/ko/remote-claude-day1-local-dev-anywhere/)
- [← Day 2: Slack Bot 설정 완전 가이드](/ko/remote-claude-day2-slack-bot-setup/)
- **Day 3: 여러 프로젝트 동시 관리** (현재)
- [→ Day 4: 생산성 극대화](#) (곧 발행 예정)
- [→ Day 5: 스마트폰 최적화](#) (곧 발행 예정)

---

## 참고 자료

### 프로젝트
- [remote-claude GitHub](https://github.com/dh1789/remote-claude)
- [4단계 메시지 처리 코드](https://github.com/dh1789/remote-claude/blob/main/src/handlers/input-processor.ts)

### 공식 문서
- [Slack Message Events](https://api.slack.com/events/message)
- [tmux 세션 관리](https://github.com/tmux/tmux/wiki)
- [Claude Code](https://claude.ai/code)

### 관련 포스트
- [Day 1: 로컬 환경을 어디서나](/ko/remote-claude-day1-local-dev-anywhere/)
- [Day 2: Slack Bot 설정 완전 가이드](/ko/remote-claude-day2-slack-bot-setup/)

---

**이 포스트가 도움이 되셨나요?**

여러 프로젝트 동시 관리에 대해 궁금한 점이 있으시면 댓글로 남겨주세요! 🙌
