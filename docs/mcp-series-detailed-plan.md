# MCP 서버 개발 시리즈 - 상세 계획서

**작성일**: 2025-11-28
**상태**: 검토 대기
**예상 편수**: 5편
**예상 기간**: 2-3주

---

## 🎯 시리즈 목표

1. **실전 중심**: 이론보다 동작하는 코드 우선
2. **따라하기 쉬움**: 복사-붙여넣기로 바로 실행 가능
3. **한글 선점**: 한글 MCP 튜토리얼 검색 1위 목표
4. **실용적 결과물**: 시리즈 완료 시 npm 배포 가능한 MCP 서버 완성

---

## 📚 MCP 핵심 개념 요약

### MCP란?

**Model Context Protocol** - AI 애플리케이션에 컨텍스트를 제공하는 표준 프로토콜

```
┌─────────────────────────────────────────────────────────┐
│                      Host (Claude Code)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Client  │  │ Client  │  │ Client  │  │ Client  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │ MCP     │  │ MCP     │  │ MCP     │  │ MCP     │
   │ Server  │  │ Server  │  │ Server  │  │ Server  │
   │ (파일)  │  │ (Git)   │  │ (API)   │  │ (DB)    │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### MCP 서버의 3가지 핵심 기능

| 기능 | 설명 | 예시 |
|------|------|------|
| **Tools** | AI가 실행할 수 있는 함수 | 파일 검색, API 호출, 계산 |
| **Resources** | AI에게 제공하는 데이터 | 설정 파일, 문서, 상태 |
| **Prompts** | 템플릿화된 프롬프트 | 코드 리뷰, 번역 요청 |

### 기술 스택

- **언어**: TypeScript
- **SDK**: @modelcontextprotocol/sdk
- **스키마**: zod (입력 검증)
- **통신**: JSON-RPC 2.0 over stdio

---

## 📖 Day 1: MCP란? 개념과 아키텍처

### 목표
- MCP가 왜 필요한지 이해
- 핵심 아키텍처 파악
- 기존 MCP 서버 코드 분석

### 구조 (7개 섹션)

```markdown
1. TL;DR
   - MCP 한 줄 정의
   - 이 글에서 배우는 것

2. AI 도구의 한계와 MCP의 등장
   - 문제: AI가 외부 데이터에 접근하려면?
   - 기존 방식의 불편함
   - MCP의 해결책

3. MCP 핵심 아키텍처
   - Host, Client, Server 관계
   - JSON-RPC 2.0 통신 방식
   - 상태 유지 연결

4. MCP의 3가지 핵심 기능
   - Tools: AI가 실행하는 함수
   - Resources: AI에게 제공하는 데이터
   - Prompts: 템플릿화된 프롬프트
   - 각 기능 언제 사용하는가?

5. 실제 MCP 서버 분석
   - @anthropics/mcp-servers 저장소 클론
   - sequential-thinking 서버 구조 분석
   - filesystem 서버 구조 분석
   - 코드 예시와 설명

6. 개발 환경 준비
   - Node.js 20+ 설치
   - TypeScript 설정
   - @modelcontextprotocol/sdk 설치
   - MCP Inspector 설치

7. 다음 편 예고
   - Day 2에서 첫 MCP 서버 만들기
```

### 실습 내용
- [ ] @anthropics/mcp-servers 클론
- [ ] sequential-thinking 서버 코드 분석
- [ ] MCP Inspector로 기존 서버 테스트

### 타겟 키워드
- Primary: MCP, Model Context Protocol
- Secondary: Claude Code, AI 도구
- Long-tail: "MCP란", "MCP 개념"

---

## 📖 Day 2: 첫 MCP 서버 만들기

### 목표
- 프로젝트 처음부터 설정
- 간단한 Tool 구현
- Claude Code에 연결하여 테스트

### 구조 (8개 섹션)

```markdown
1. TL;DR
   - 10분 만에 MCP 서버 만들기
   - 완성 코드 미리보기

2. 프로젝트 초기화
   - mkdir, npm init
   - TypeScript 설정 (tsconfig.json)
   - 의존성 설치 (@modelcontextprotocol/sdk, zod)

3. 기본 서버 구조
   - McpServer 인스턴스 생성
   - StdioServerTransport 연결
   - 서버 시작 코드

4. 첫 번째 Tool: 현재 시간
   - zod 스키마 정의
   - server.tool() 등록
   - 콜백 함수 구현
   - 응답 포맷팅

5. 두 번째 Tool: 간단한 계산기
   - 여러 입력 파라미터
   - 타입 검증
   - 에러 처리

6. 빌드 및 실행
   - tsc로 빌드
   - node로 실행
   - 실행 로그 확인

7. MCP Inspector로 테스트
   - Inspector 실행
   - Tool 호출 테스트
   - 응답 확인

8. Claude Code에 연결
   - settings.json 또는 claude_desktop_config.json 설정
   - 서버 등록
   - 실제 대화에서 Tool 사용
   - 스크린샷과 함께 설명
```

### 실습 프로젝트: my-first-mcp

```typescript
// src/index.ts (핵심 코드 미리보기)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// Tool 1: 현재 시간
server.tool(
  "get_current_time",
  "현재 시간을 반환합니다",
  { timezone: z.string().optional().describe("시간대 (예: Asia/Seoul)") },
  async ({ timezone }) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || "Asia/Seoul",
      dateStyle: "full",
      timeStyle: "long",
    };
    return {
      content: [{ type: "text", text: now.toLocaleString("ko-KR", options) }],
    };
  }
);

// Tool 2: 계산기
server.tool(
  "calculate",
  "두 숫자의 사칙연산을 수행합니다",
  {
    a: z.number().describe("첫 번째 숫자"),
    b: z.number().describe("두 번째 숫자"),
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
  },
  async ({ a, b, operation }) => {
    let result: number;
    switch (operation) {
      case "add": result = a + b; break;
      case "subtract": result = a - b; break;
      case "multiply": result = a * b; break;
      case "divide": result = b !== 0 ? a / b : NaN; break;
    }
    return {
      content: [{ type: "text", text: `결과: ${result}` }],
    };
  }
);

// 서버 시작
const transport = new StdioServerTransport();
server.connect(transport);
```

### 타겟 키워드
- Primary: MCP 서버 만들기
- Secondary: TypeScript, Tool 구현
- Long-tail: "MCP 서버 개발 튜토리얼"

---

## 📖 Day 3: 실전 MCP 서버 - 프로젝트 분석 도구

### 목표
- 실용적인 MCP 서버 개발
- 파일 시스템 접근
- Resource와 Prompt 구현

### 구조 (8개 섹션)

```markdown
1. TL;DR
   - 프로젝트 분석 MCP 서버 소개
   - 제공 기능 미리보기

2. 프로젝트 소개: project-analyzer-mcp
   - 기능 목록
   - 아키텍처 설계

3. Tool 1: 프로젝트 구조 분석
   - 디렉토리 트리 생성
   - 파일 타입별 분류
   - gitignore 처리

4. Tool 2: package.json 분석
   - 의존성 목록
   - 스크립트 목록
   - 버전 정보

5. Tool 3: 코드 통계
   - 라인 수 계산
   - 파일 타입별 통계
   - 코드/주석/빈줄 분리

6. Resource 구현
   - 정적 리소스: 설정 파일
   - 동적 리소스: 프로젝트 상태
   - 리소스 구독

7. Prompt 구현
   - 코드 리뷰 프롬프트 템플릿
   - 인자 바인딩
   - 사용 예시

8. 통합 테스트
   - 실제 프로젝트에서 테스트
   - Claude Code와 연동
   - 결과 스크린샷
```

### 실습 프로젝트: project-analyzer-mcp

제공 기능:
- `analyze_structure`: 프로젝트 디렉토리 구조 분석
- `analyze_dependencies`: package.json 의존성 분석
- `count_lines`: 코드 라인 수 통계
- `project://config` Resource: 프로젝트 설정
- `code-review` Prompt: 코드 리뷰 템플릿

### 타겟 키워드
- Primary: MCP Tool 개발
- Secondary: 파일 시스템, Resource, Prompt
- Long-tail: "MCP 실전 프로젝트"

---

## 📖 Day 4: MCP 서버 배포하기

### 목표
- npm 패키지로 배포
- 사용자 설치 가이드 작성
- 버전 관리

### 구조 (7개 섹션)

```markdown
1. TL;DR
   - npm 배포 3단계
   - 완성된 패키지 구조

2. npm 패키지 구조화
   - bin 설정 (실행 파일)
   - main, types 설정
   - files 필드 (배포 파일 지정)

3. 빌드 설정
   - tsup 설정
   - 번들링 전략
   - 외부 의존성 처리

4. package.json 완성
   - 메타데이터 (description, keywords, author)
   - repository, homepage
   - license

5. npm 배포
   - npm login
   - npm publish
   - 버전 업데이트

6. README.md 작성
   - 설치 방법
   - 사용 방법
   - 설정 예시
   - 스크린샷

7. 사용자 가이드
   - npx로 실행
   - 전역 설치
   - Claude Code/Desktop 설정
```

### 배포 패키지 구조

```
project-analyzer-mcp/
├── dist/
│   └── index.js          # 번들된 실행 파일
├── src/
│   └── index.ts          # 소스 코드
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### 타겟 키워드
- Primary: MCP 서버 배포, npm 배포
- Secondary: TypeScript 패키지
- Long-tail: "MCP 서버 npm 배포"

---

## 📖 Day 5: 고급 패턴과 최적화

### 목표
- 외부 API 연동
- 캐싱 및 성능 최적화
- 보안 고려사항

### 구조 (8개 섹션)

```markdown
1. TL;DR
   - 고급 패턴 3가지
   - 프로덕션 체크리스트

2. 외부 API 연동
   - GitHub API 연동 예시
   - 인증 처리 (토큰 관리)
   - 에러 핸들링
   - 레이트 리미팅

3. 상태 관리 패턴
   - 세션 상태 (메모리)
   - 영구 저장소 (파일, DB)
   - 상태 동기화

4. 캐싱 전략
   - 인메모리 캐시
   - TTL 설정
   - 캐시 무효화

5. 성능 최적화
   - 비동기 처리
   - 배치 요청
   - 스트리밍 응답

6. 보안 고려사항
   - 입력 검증 강화
   - 경로 이탈 방지
   - 민감 정보 보호
   - 권한 관리

7. 디버깅과 로깅
   - 로그 레벨 설정
   - MCP Inspector 활용
   - 에러 추적

8. 시리즈 마무리
   - 전체 요약
   - 추가 학습 자료
   - 커뮤니티 링크
   - 다음 단계 제안
```

### 실습: GitHub 연동 MCP 서버

```typescript
// GitHub API 연동 Tool 예시
server.tool(
  "get_repo_info",
  "GitHub 저장소 정보를 조회합니다",
  {
    owner: z.string().describe("저장소 소유자"),
    repo: z.string().describe("저장소 이름"),
  },
  async ({ owner, repo }) => {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name: data.full_name,
          description: data.description,
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language,
        }, null, 2),
      }],
    };
  }
);
```

### 타겟 키워드
- Primary: MCP 고급 패턴
- Secondary: API 연동, 캐싱, 보안
- Long-tail: "MCP 프로덕션 배포"

---

## 🛠 시리즈 작성 전 준비 작업

### 필수 사전 작업

1. **Day 2 실습 프로젝트 개발**
   - [ ] my-first-mcp 서버 구현
   - [ ] Claude Code에서 테스트
   - [ ] 스크린샷 캡처

2. **Day 3 실습 프로젝트 개발**
   - [ ] project-analyzer-mcp 서버 구현
   - [ ] 파일 시스템 Tool 테스트
   - [ ] Resource, Prompt 구현

3. **Day 4 실제 배포**
   - [ ] npm 패키지로 배포
   - [ ] README.md 작성
   - [ ] 실제 설치 테스트

4. **Day 5 고급 기능**
   - [ ] GitHub API 연동
   - [ ] 캐싱 구현
   - [ ] 보안 검증

### 예상 개발 시간

| 작업 | 예상 시간 |
|------|----------|
| Day 2 실습 프로젝트 | 2-3시간 |
| Day 3 실습 프로젝트 | 4-5시간 |
| Day 4 배포 작업 | 2시간 |
| Day 5 고급 기능 | 3-4시간 |
| **총 개발 시간** | **11-14시간** |

---

## 📅 작성 일정

| 단계 | 기간 | 작업 |
|------|------|------|
| **준비** | 2-3일 | 실습 프로젝트 개발, 테스트 |
| **Day 1** | 1일 | 개념 글 작성 |
| **Day 2** | 1일 | Hello World 글 작성 |
| **Day 3** | 1-2일 | 실전 프로젝트 글 작성 |
| **Day 4** | 1일 | 배포 가이드 글 작성 |
| **Day 5** | 1일 | 고급 패턴 글 작성 |
| **총 기간** | **약 2주** | 5편 완성 |

---

## 📌 참고 자료

### 공식 문서
- [MCP 공식 스펙](https://modelcontextprotocol.io/specification/2025-06-18)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [예제 서버](https://github.com/anthropics/mcp-servers)

### 튜토리얼
- [FreeCodeCamp 핸드북](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/)
- [Hackteam 튜토리얼](https://hackteam.io/blog/build-your-first-mcp-server-with-typescript-in-under-10-minutes/)
- [DEV Community 가이드](https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28)

### 도구
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

## ✅ 다음 단계

1. **승인**: 이 계획서 검토 및 승인
2. **준비**: 실습 프로젝트 개발 시작
3. **작성**: Day 1부터 순차 작성

---

**상태**: 검토 대기
**최종 업데이트**: 2025-11-28
