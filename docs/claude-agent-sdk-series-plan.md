# Claude Agent SDK 시리즈 참고 문서

**작성일**: 2024-12-05
**시리즈**: Claude Agent SDK (5일)
**상태**: 작업 준비 완료

---

## 📌 핵심 참고 링크

### 공식 문서 및 리소스
| 리소스 | URL |
|--------|-----|
| **GitHub Repository** | https://github.com/anthropics/claude-agent-sdk-typescript |
| **Agent SDK Overview** | https://platform.claude.com/docs/en/agent-sdk/overview |
| **TypeScript API Reference** | https://docs.claude.com/en/api/agent-sdk/typescript |
| **Migration Guide** | https://docs.claude.com/en/docs/claude-code/sdk/migration-guide |

### 관련 프로젝트
| 프로젝트 | URL | 용도 |
|---------|-----|------|
| my-first-mcp | https://github.com/dh1789/my-first-mcp | Day 2 MCP 연동 예제 |
| **my-first-agent** | https://github.com/dh1789/my-first-agent | 🆕 이 시리즈 프로젝트 (생성 필요) |

---

## 🔗 URL 링크 정의 (확정)

### ⚠️ URL 규칙 (필수 준수)
- **한국어**: `/ko/{slug}` (접미사 없음)
- **영어**: `/en/{slug}-en` (`-en` 접미사 필수)

### 시리즈 내비게이션 링크

#### 한국어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `claude-agent-sdk-day1-introduction` | `/ko/claude-agent-sdk-day1-introduction` |
| Day 2 | `claude-agent-sdk-day2-tool-use-mcp` | `/ko/claude-agent-sdk-day2-tool-use-mcp` |
| Day 3 | `claude-agent-sdk-day3-memory-context` | `/ko/claude-agent-sdk-day3-memory-context` |
| Day 4 | `claude-agent-sdk-day4-multi-agent` | `/ko/claude-agent-sdk-day4-multi-agent` |
| Day 5 | `claude-agent-sdk-day5-production` | `/ko/claude-agent-sdk-day5-production` |

#### 영어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `claude-agent-sdk-day1-introduction-en` | `/en/claude-agent-sdk-day1-introduction-en` |
| Day 2 | `claude-agent-sdk-day2-tool-use-mcp-en` | `/en/claude-agent-sdk-day2-tool-use-mcp-en` |
| Day 3 | `claude-agent-sdk-day3-memory-context-en` | `/en/claude-agent-sdk-day3-memory-context-en` |
| Day 4 | `claude-agent-sdk-day4-multi-agent-en` | `/en/claude-agent-sdk-day4-multi-agent-en` |
| Day 5 | `claude-agent-sdk-day5-production-en` | `/en/claude-agent-sdk-day5-production-en` |

---

## 📁 파일 명명 규칙

### 마크다운 파일 경로
```
content/posts/ko/YYYY-MM-DD-claude-agent-sdk-dayN-{topic}.md
content/posts/en/YYYY-MM-DD-claude-agent-sdk-dayN-{topic}.md
```

### 예상 파일 목록
```
content/posts/ko/2025-12-06-claude-agent-sdk-day1-introduction.md
content/posts/ko/2025-12-07-claude-agent-sdk-day2-tool-use-mcp.md
content/posts/ko/2025-12-08-claude-agent-sdk-day3-memory-context.md
content/posts/ko/2025-12-09-claude-agent-sdk-day4-multi-agent.md
content/posts/ko/2025-12-10-claude-agent-sdk-day5-production.md

content/posts/en/2025-12-06-claude-agent-sdk-day1-introduction.md
content/posts/en/2025-12-07-claude-agent-sdk-day2-tool-use-mcp.md
content/posts/en/2025-12-08-claude-agent-sdk-day3-memory-context.md
content/posts/en/2025-12-09-claude-agent-sdk-day4-multi-agent.md
content/posts/en/2025-12-10-claude-agent-sdk-day5-production.md
```

---

## 📋 시리즈 네비게이션 템플릿

### 한국어 네비게이션 (복사용)
```markdown
---

## 시리즈 네비게이션

- [Day 1: Agent 개념과 아키텍처](/ko/claude-agent-sdk-day1-introduction)
- [Day 2: 도구 사용과 MCP 연동](/ko/claude-agent-sdk-day2-tool-use-mcp)
- [Day 3: 메모리와 컨텍스트 관리](/ko/claude-agent-sdk-day3-memory-context)
- [Day 4: 멀티 에이전트 오케스트레이션](/ko/claude-agent-sdk-day4-multi-agent)
- [Day 5: 프로덕션 배포와 최적화](/ko/claude-agent-sdk-day5-production)
```

### 영어 네비게이션 (복사용)
```markdown
---

## Series Navigation

- [Day 1: Agent Concepts and Architecture](/en/claude-agent-sdk-day1-introduction-en)
- [Day 2: Tool Use and MCP Integration](/en/claude-agent-sdk-day2-tool-use-mcp-en)
- [Day 3: Memory and Context Management](/en/claude-agent-sdk-day3-memory-context-en)
- [Day 4: Multi-Agent Orchestration](/en/claude-agent-sdk-day4-multi-agent-en)
- [Day 5: Production Deployment and Optimization](/en/claude-agent-sdk-day5-production-en)
```

---

## 📝 Day별 상세 구조

### Day 1: Agent 개념과 아키텍처

**한국어 제목**: "Claude Agent SDK Day 1: Agent 개념과 첫 번째 Agent 만들기"
**영어 제목**: "Claude Agent SDK Day 1: Agent Concepts and Building Your First Agent"

**Frontmatter (한국어)**:
```yaml
---
title: "Claude Agent SDK Day 1: Agent 개념과 첫 번째 Agent 만들기"
slug: "claude-agent-sdk-day1-introduction"
excerpt: "AI Agent란 무엇인가? Claude Agent SDK를 사용하여 첫 번째 Agent를 만들어봅니다. SDK 설치부터 간단한 Agent 구현까지."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "AI Agent"
  - "AI 에이전트"
  - "TypeScript"
  - "Anthropic"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "Claude Agent SDK Day 1: Agent Concepts and Building Your First Agent"
slug: "claude-agent-sdk-day1-introduction-en"
excerpt: "What is an AI Agent? Learn to build your first Agent with Claude Agent SDK. From SDK installation to implementing a simple Agent."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "AI Agent"
  - "TypeScript"
  - "Anthropic"
language: "en"
---
```

**핵심 내용**:
1. AI Agent란 무엇인가?
   - LLM vs Agent의 차이
   - Agent의 구성 요소 (LLM, Tools, Memory, Planning)
2. Claude Agent SDK 소개
   - 왜 Claude Agent SDK인가?
   - 설치 및 환경 설정
3. 첫 번째 Agent 구현
   - 기본 Agent 생성
   - 간단한 대화 Agent

**코드 예제**:
```typescript
import { Agent } from "@anthropic-ai/claude-agent-sdk";

const agent = new Agent({
  model: "claude-sonnet-4-5-20250929",
  systemPrompt: "당신은 친절한 코딩 도우미입니다."
});

const response = await agent.query("안녕하세요!");
```

**타겟 키워드**: Claude Agent SDK, AI Agent, AI 에이전트, 에이전트 개발

---

### Day 2: 도구 사용과 MCP 연동

**한국어 제목**: "Claude Agent SDK Day 2: Tool Use와 MCP 서버 연동"
**영어 제목**: "Claude Agent SDK Day 2: Tool Use and MCP Server Integration"

**Frontmatter (한국어)**:
```yaml
---
title: "Claude Agent SDK Day 2: Tool Use와 MCP 서버 연동"
slug: "claude-agent-sdk-day2-tool-use-mcp"
excerpt: "Agent가 도구를 사용하는 방법을 알아봅니다. MCP 서버를 Agent 도구로 연동하여 기능을 확장합니다."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Tool Use"
  - "MCP"
  - "Function Calling"
  - "AI Agent"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "Claude Agent SDK Day 2: Tool Use and MCP Server Integration"
slug: "claude-agent-sdk-day2-tool-use-mcp-en"
excerpt: "Learn how Agents use tools. Extend capabilities by integrating MCP servers as Agent tools."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Tool Use"
  - "MCP"
  - "Function Calling"
  - "AI Agent"
language: "en"
---
```

**핵심 내용**:
1. Tool Use 개념
   - Function Calling이란?
   - Tool 정의 방법
2. 커스텀 Tool 구현
   - Zod 스키마로 Tool 정의
   - Tool 실행 로직
3. **MCP 서버 연동** (하이라이트)
   - my-first-mcp를 Agent 도구로 연동
   - MCP 서버 → Agent 파이프라인

**타겟 키워드**: Tool Use, Function Calling, MCP, MCP 연동, Agent Tool

---

### Day 3: 메모리와 컨텍스트 관리

**한국어 제목**: "Claude Agent SDK Day 3: 메모리와 컨텍스트 관리"
**영어 제목**: "Claude Agent SDK Day 3: Memory and Context Management"

**Frontmatter (한국어)**:
```yaml
---
title: "Claude Agent SDK Day 3: 메모리와 컨텍스트 관리"
slug: "claude-agent-sdk-day3-memory-context"
excerpt: "Agent의 메모리 시스템과 컨텍스트 관리 전략을 알아봅니다. 대화 히스토리, 장기 메모리, 상태 관리 기법."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Agent Memory"
  - "Context Management"
  - "AI Agent"
  - "상태 관리"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "Claude Agent SDK Day 3: Memory and Context Management"
slug: "claude-agent-sdk-day3-memory-context-en"
excerpt: "Explore Agent memory systems and context management strategies. Conversation history, long-term memory, and state management techniques."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Agent Memory"
  - "Context Management"
  - "AI Agent"
  - "State Management"
language: "en"
---
```

**핵심 내용**:
1. Agent 메모리 유형
   - Short-term Memory (대화 히스토리)
   - Long-term Memory (지속성 저장소)
   - Working Memory (현재 작업 컨텍스트)
2. 컨텍스트 윈도우 관리
   - 토큰 제한 처리
   - 요약 전략
3. 상태 관리 패턴
   - 세션 상태
   - 사용자 선호도 저장

**타겟 키워드**: Agent Memory, Context Management, 컨텍스트 관리, 상태 관리

---

### Day 4: 멀티 에이전트 오케스트레이션

**한국어 제목**: "Claude Agent SDK Day 4: 멀티 에이전트 오케스트레이션"
**영어 제목**: "Claude Agent SDK Day 4: Multi-Agent Orchestration"

**Frontmatter (한국어)**:
```yaml
---
title: "Claude Agent SDK Day 4: 멀티 에이전트 오케스트레이션"
slug: "claude-agent-sdk-day4-multi-agent"
excerpt: "여러 Agent가 협업하는 멀티 에이전트 시스템을 구축합니다. Orchestration 패턴, Agent 간 통신, 작업 분배 전략."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Multi Agent"
  - "멀티 에이전트"
  - "Orchestration"
  - "AI Agent"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "Claude Agent SDK Day 4: Multi-Agent Orchestration"
slug: "claude-agent-sdk-day4-multi-agent-en"
excerpt: "Build multi-agent systems where multiple Agents collaborate. Orchestration patterns, inter-agent communication, and task distribution strategies."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Multi Agent"
  - "Orchestration"
  - "AI Agent"
language: "en"
---
```

**핵심 내용**:
1. 멀티 에이전트 패턴
   - Supervisor 패턴
   - Peer-to-Peer 패턴
   - Pipeline 패턴
2. Agent 간 통신
   - 메시지 전달
   - 공유 상태
3. 코드 리뷰 Agent 시스템 구현
   - Analyzer Agent
   - Reviewer Agent
   - Summarizer Agent

**타겟 키워드**: Multi Agent, 멀티 에이전트, Orchestration, Agent Collaboration

---

### Day 5: 프로덕션 배포와 최적화

**한국어 제목**: "Claude Agent SDK Day 5: 프로덕션 배포와 최적화"
**영어 제목**: "Claude Agent SDK Day 5: Production Deployment and Optimization"

**Frontmatter (한국어)**:
```yaml
---
title: "Claude Agent SDK Day 5: 프로덕션 배포와 최적화"
slug: "claude-agent-sdk-day5-production"
excerpt: "Agent를 프로덕션 환경에 배포하는 방법과 최적화 전략. 에러 처리, 모니터링, 비용 최적화, 보안 고려사항."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Production"
  - "프로덕션 배포"
  - "AI Agent"
  - "최적화"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "Claude Agent SDK Day 5: Production Deployment and Optimization"
slug: "claude-agent-sdk-day5-production-en"
excerpt: "Deploy Agents to production environments with optimization strategies. Error handling, monitoring, cost optimization, and security considerations."
status: "publish"
categories:
  - "Claude Agent SDK"
  - "AI Development"
tags:
  - "Claude Agent SDK"
  - "Production"
  - "Deployment"
  - "AI Agent"
  - "Optimization"
language: "en"
---
```

**핵심 내용**:
1. 에러 처리 및 복구
   - Retry 전략
   - Fallback 메커니즘
   - Graceful Degradation
2. 모니터링 및 로깅
   - Agent 활동 추적
   - 성능 메트릭
3. 비용 최적화
   - 토큰 사용량 관리
   - 캐싱 전략
4. 보안 고려사항
   - 입력 검증
   - 권한 관리

**타겟 키워드**: Production, 프로덕션 배포, 최적화, Monitoring, Cost Optimization

---

## 🎯 SEO 전략

### Primary Keywords (시리즈 공통)
- Claude Agent SDK
- AI Agent
- AI 에이전트
- Agent 개발

### Secondary Keywords (Day별)
| Day | Keywords |
|-----|----------|
| Day 1 | Agent 아키텍처, SDK 설치, 첫 Agent |
| Day 2 | Tool Use, Function Calling, MCP 연동 |
| Day 3 | Agent Memory, Context Management, 상태 관리 |
| Day 4 | Multi Agent, 멀티 에이전트, Orchestration |
| Day 5 | Production, 프로덕션 배포, 최적화, Monitoring |

### Long-tail Keywords
- "Claude Agent SDK 튜토리얼"
- "AI 에이전트 만들기"
- "Claude Agent 예제"
- "MCP Agent 연동"
- "멀티 에이전트 구현"

---

## 📦 프로젝트 구조 (예정)

### my-first-agent 저장소 구조
```
my-first-agent/
├── src/
│   ├── index.ts                 # 진입점
│   ├── agents/
│   │   ├── basic-agent.ts       # Day 1: 기본 Agent
│   │   ├── tool-agent.ts        # Day 2: Tool 사용 Agent
│   │   └── multi-agent.ts       # Day 4: 멀티 에이전트
│   ├── tools/
│   │   ├── calculator.ts        # 커스텀 Tool 예제
│   │   └── mcp-bridge.ts        # Day 2: MCP 연동
│   ├── memory/
│   │   ├── conversation.ts      # Day 3: 대화 히스토리
│   │   └── persistent.ts        # Day 3: 영속 메모리
│   └── utils/
│       ├── logger.ts            # Day 5: 로깅
│       └── cost-tracker.ts      # Day 5: 비용 추적
├── examples/
│   ├── day1-hello-agent.ts
│   ├── day2-mcp-integration.ts
│   ├── day3-memory-demo.ts
│   ├── day4-code-review-system.ts
│   └── day5-production-agent.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✅ 체크리스트

### 시작 전
- [ ] my-first-agent GitHub 저장소 생성
- [ ] Claude Agent SDK 설치 및 테스트
- [ ] 공식 문서 숙독

### Day 1 작성 시
- [ ] SEO 점수 70점 이상 확인
- [ ] 각 태그 키워드 본문에 최소 5회 이상 출현
- [ ] 키워드 밀도 0.5-2.5% 범위
- [ ] GitHub 링크 포함: https://github.com/dh1789/my-first-agent
- [ ] 시리즈 네비게이션 추가 (하단)
- [ ] **영문 번역 시 `-en` 접미사 확인**

### 각 Day 공통
- [ ] TL;DR 섹션에 GitHub 링크 포함
- [ ] 코드 예제는 실제 실행 가능한 코드
- [ ] 시리즈 네비게이션 링크 정확성 검증
- [ ] 한영 URL 접미사 규칙 준수

---

## 📚 참고 자료

### 공식 문서
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript API Reference](https://docs.claude.com/en/api/agent-sdk/typescript)
- [Migration Guide](https://docs.claude.com/en/docs/claude-code/sdk/migration-guide)
- [GitHub Repository](https://github.com/anthropics/claude-agent-sdk-typescript)

### 튜토리얼
- [DataCamp Tutorial](https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk)
- [Build Claude-Code-Like Agent](https://docs.kanaries.net/topics/AICoding/build-claude-code-with-claude-agent-sdk)
- [Step-by-Step Tutorial](https://skywork.ai/blog/how-to-use-claude-agent-sdk-step-by-step-ai-agent-tutorial/)

### 기존 프로젝트
- [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP 서버 (Day 2 연동용)

---

## 📝 버전 기록

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| v1.0 | 2024-12-05 | 초기 문서 작성 |

---

**문서 상태**: ✅ 작업 준비 완료
**다음 단계**: Day 1 한국어 포스트 작성
