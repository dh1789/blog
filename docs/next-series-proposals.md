# 다음 블로그 시리즈 제안서

**작성일**: 2024-12-15
**상태**: 검토 대기

---

## 📊 기존 완료 시리즈

| 시리즈 | 분량 | 기간 | GitHub |
|--------|------|------|--------|
| ✅ MCP 시리즈 | 5편 | 2025-11-28 ~ 12-04 | [my-first-mcp](https://github.com/dh1789/my-first-mcp) |
| ✅ Claude Agent SDK 시리즈 | 5편 | 2025-12-08 ~ 12-12 | [my-first-agent](https://github.com/dh1789/my-first-agent) |

---

## 📋 새로운 시리즈 제안

| 순위 | 시리즈명 | 분량 | 추천도 | 준비도 |
|------|----------|------|--------|--------|
| 🥇 | **RAG 실전 가이드** | 5-6편 | ⭐⭐⭐⭐⭐ | 중간 |
| 🥈 | AI 자동화 워크플로우 | 4-5편 | ⭐⭐⭐⭐ | 높음 |
| 🥉 | Prompt Engineering 마스터 | 5-6편 | ⭐⭐⭐⭐ | 높음 |
| 4위 | TypeScript AI 라이브러리 비교 | 4-5편 | ⭐⭐⭐ | 중간 |
| 5위 | 로컬 LLM + 클라우드 하이브리드 | 4-5편 | ⭐⭐⭐ | 낮음 |

---

## 🥇 1순위: RAG (Retrieval Augmented Generation) 실전 가이드

### 왜 RAG인가?

**시장 현황:**
- 기업용 AI 필수 기술 (LLM 환각 해결책)
- 지속적으로 높은 검색량
- 대부분 Python 기반 → **TypeScript 기반 차별화**

**개인 강점:**
- ✅ Claude API 사용 경험 (Agent SDK 시리즈)
- ✅ TypeScript 전문성
- ✅ 프로덕션 배포 경험
- ⚠️ 벡터 DB 학습 필요 (Pinecone, Supabase 등)

**시너지:**
```
MCP 시리즈 → Claude Agent SDK 시리즈 → RAG 시리즈
                                         ↓
                              "AI Agent + RAG" 통합 가능
```

### 시리즈 구성 (6편)

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | RAG 개념과 아키텍처 | RAG란?, 구성요소, 워크플로우, 사용 사례 |
| Day 2 | 문서 처리와 청킹 | 텍스트 추출, 청킹 전략, 메타데이터 처리 |
| Day 3 | 임베딩과 벡터 DB | 임베딩 모델, Supabase/Pinecone, 저장/검색 |
| Day 4 | 검색 최적화 | 시맨틱 검색, 하이브리드 검색, 리랭킹 |
| Day 5 | Claude 통합 | 프롬프트 설계, 컨텍스트 주입, 답변 생성 |
| Day 6 | 프로덕션 배포 | 평가 지표, 비용 최적화, 모니터링 |

### 관련 GitHub 저장소

| 저장소 | URL | 용도 |
|--------|-----|------|
| **my-first-rag** | (생성 예정) | 시리즈 메인 프로젝트 |
| Anthropic SDK | https://github.com/anthropics/anthropic-sdk-typescript | Claude API |
| LangChain.js | https://github.com/langchain-ai/langchainjs | 참고 |

### URL 구조 (확정)

**한국어:**
| Day | Slug | URL |
|-----|------|-----|
| Day 1 | `rag-day1-introduction` | `/ko/rag-day1-introduction` |
| Day 2 | `rag-day2-document-processing` | `/ko/rag-day2-document-processing` |
| Day 3 | `rag-day3-embedding-vectordb` | `/ko/rag-day3-embedding-vectordb` |
| Day 4 | `rag-day4-search-optimization` | `/ko/rag-day4-search-optimization` |
| Day 5 | `rag-day5-claude-integration` | `/ko/rag-day5-claude-integration` |
| Day 6 | `rag-day6-production` | `/ko/rag-day6-production` |

**영어:**
| Day | Slug | URL |
|-----|------|-----|
| Day 1 | `rag-day1-introduction-en` | `/en/rag-day1-introduction-en` |
| Day 2 | `rag-day2-document-processing-en` | `/en/rag-day2-document-processing-en` |
| Day 3 | `rag-day3-embedding-vectordb-en` | `/en/rag-day3-embedding-vectordb-en` |
| Day 4 | `rag-day4-search-optimization-en` | `/en/rag-day4-search-optimization-en` |
| Day 5 | `rag-day5-claude-integration-en` | `/en/rag-day5-claude-integration-en` |
| Day 6 | `rag-day6-production-en` | `/en/rag-day6-production-en` |

### SEO 키워드

**Primary:**
- RAG
- Retrieval Augmented Generation
- RAG 튜토리얼
- TypeScript RAG

**Secondary:**
- 벡터 데이터베이스
- 임베딩
- Claude RAG
- LLM 환각 해결

---

## 🥈 2순위: AI 자동화 워크플로우 시리즈

### 왜 이 시리즈인가?

**시장 현황:**
- n8n, Zapier, Make 등 자동화 도구 인기
- AI + 자동화 조합 수요 급증
- 실용적 콘텐츠로 독자 관심 높음

**개인 강점:**
- ✅ 블로그 CLI 자동화 도구 개발 경험 (현재 프로젝트)
- ✅ WordPress REST API 연동 경험
- ✅ Claude API 통합 경험

### 시리즈 구성 (5편)

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | AI 자동화 개요 | 자동화 패턴, 도구 비교, 아키텍처 |
| Day 2 | n8n + Claude 연동 | n8n 설정, Claude 노드, 워크플로우 설계 |
| Day 3 | 콘텐츠 자동화 파이프라인 | 블로그 자동화, SEO 최적화, 번역 |
| Day 4 | 알림 및 모니터링 | Slack/Discord 연동, 에러 처리 |
| Day 5 | 커스텀 자동화 도구 | Node.js CLI, 스케줄링, 프로덕션 |

### 관련 GitHub 저장소

| 저장소 | URL | 용도 |
|--------|-----|------|
| **blog** (현재) | 블로그 CLI 도구 | 실제 자동화 예제 |
| n8n | https://github.com/n8n-io/n8n | 자동화 플랫폼 |

### URL 구조 (확정)

**한국어:** `/ko/ai-automation-day{N}-{topic}`
**영어:** `/en/ai-automation-day{N}-{topic}-en`

---

## 🥉 3순위: Prompt Engineering 마스터 시리즈

### 왜 이 시리즈인가?

**시장 현황:**
- AI 활용의 핵심 스킬
- 지속적 검색 수요
- 실용적 + 이론적 균형 가능

**개인 강점:**
- ✅ Claude 프롬프트 작성 경험 풍부
- ✅ Agent 시스템 프롬프트 설계 경험
- ✅ 다양한 프롬프트 패턴 실험

### 시리즈 구성 (5편)

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | 프롬프트 엔지니어링 기초 | 원리, 구조, 기본 패턴 |
| Day 2 | 고급 프롬프트 기법 | Chain-of-Thought, Few-shot, Self-consistency |
| Day 3 | Claude 특화 프롬프트 | System prompt, Claude 강점 활용 |
| Day 4 | Agent용 프롬프트 설계 | Tool use, 역할 정의, 오케스트레이션 |
| Day 5 | 프롬프트 최적화 | 평가, A/B 테스트, 비용 최적화 |

### URL 구조 (확정)

**한국어:** `/ko/prompt-engineering-day{N}-{topic}`
**영어:** `/en/prompt-engineering-day{N}-{topic}-en`

---

## 4순위: TypeScript AI 라이브러리 비교 시리즈

### 시리즈 구성 (5편)

| Day | 주제 | 대상 |
|-----|------|------|
| Day 1 | Anthropic SDK 심화 | 공식 SDK |
| Day 2 | Vercel AI SDK | Vercel 생태계 |
| Day 3 | LangChain.js | 범용 프레임워크 |
| Day 4 | OpenAI SDK vs Anthropic SDK | 비교 분석 |
| Day 5 | 선택 가이드 | 용도별 추천 |

---

## 5순위: 로컬 LLM + 클라우드 하이브리드 시리즈

### 시리즈 구성 (4편)

| Day | 주제 | 핵심 내용 |
|-----|------|----------|
| Day 1 | 로컬 LLM 소개 | Ollama, LM Studio, 모델 선택 |
| Day 2 | 로컬 LLM 설정 | 설치, API 서버, 성능 튜닝 |
| Day 3 | 하이브리드 아키텍처 | 로컬 + 클라우드 라우팅, 비용 최적화 |
| Day 4 | 프로덕션 배포 | 보안, 모니터링, 스케일링 |

---

## 📋 최종 추천

### 추천 순서

```
1순위: RAG 실전 가이드 (6편)
   - 기업 수요 높음
   - TypeScript 차별화
   - 기존 시리즈와 자연스러운 연결

2순위: AI 자동화 워크플로우 (5편)
   - 현재 블로그 CLI 경험 활용
   - 실용적 콘텐츠

3순위: Prompt Engineering (5편)
   - 안정적 검색 수요
   - 기존 경험 충분
```

### 학습 경로 완성

```
MCP 시리즈 (완료)
     ↓
Claude Agent SDK 시리즈 (완료)
     ↓
┌────────────────────────────────┐
│  다음 시리즈 선택:              │
│  • RAG 실전 가이드 (추천)       │
│  • AI 자동화 워크플로우         │
│  • Prompt Engineering          │
└────────────────────────────────┘
     ↓
고급 AI 시스템 (향후)
```

---

## ✅ 선택 후 다음 단계

주제 선택 시 다음 작업 진행:

1. [ ] 시리즈 참조 문서 생성 (`docs/{series}-series-plan.md`)
2. [ ] GitHub 저장소 생성 (필요 시)
3. [ ] Day 1 포스트 작성
4. [ ] SEO 검토 및 발행

---

**문서 상태**: 📋 검토 대기
**결정 필요**: 시리즈 선택
