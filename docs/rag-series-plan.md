# RAG 시리즈 참고 문서

**작성일**: 2024-12-15
**시리즈**: RAG 실전 가이드 (6일)
**총 Day 수**: 6
**GitHub**: https://github.com/dh1789/my-first-rag
**상태**: 작업 준비 완료

---

## 📌 핵심 참고 링크

### 공식 문서 및 리소스
| 리소스 | URL |
|--------|-----|
| **Anthropic SDK** | https://github.com/anthropics/anthropic-sdk-typescript |
| **Claude API Docs** | https://docs.anthropic.com/en/api |
| **Voyage AI (Embeddings)** | https://docs.voyageai.com/ |
| **Supabase Vector** | https://supabase.com/docs/guides/ai |
| **Pinecone** | https://docs.pinecone.io/ |
| **LangChain.js RAG** | https://js.langchain.com/docs/tutorials/rag |

### 관련 프로젝트
| 프로젝트 | URL | 용도 |
|---------|-----|------|
| **my-first-rag** | https://github.com/dh1789/my-first-rag | 🆕 이 시리즈 프로젝트 (생성 필요) |
| my-first-mcp | https://github.com/dh1789/my-first-mcp | MCP 시리즈 (참고) |
| my-first-agent | https://github.com/dh1789/my-first-agent | Agent SDK 시리즈 (참고) |

---

## 🔗 URL 링크 정의 (확정)

### ⚠️ URL 규칙 (필수 준수)
- **한국어**: `/ko/{slug}` (접미사 없음)
- **영어**: `/en/{slug}-en` (`-en` 접미사 필수)

### 시리즈 내비게이션 링크

#### 한국어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `rag-day1-introduction` | `/ko/rag-day1-introduction` |
| Day 2 | `rag-day2-document-processing` | `/ko/rag-day2-document-processing` |
| Day 3 | `rag-day3-embedding-vectordb` | `/ko/rag-day3-embedding-vectordb` |
| Day 4 | `rag-day4-search-optimization` | `/ko/rag-day4-search-optimization` |
| Day 5 | `rag-day5-claude-integration` | `/ko/rag-day5-claude-integration` |
| Day 6 | `rag-day6-production` | `/ko/rag-day6-production` |

#### 영어 URL
| Day | Slug | 전체 URL |
|-----|------|----------|
| Day 1 | `rag-day1-introduction-en` | `/en/rag-day1-introduction-en` |
| Day 2 | `rag-day2-document-processing-en` | `/en/rag-day2-document-processing-en` |
| Day 3 | `rag-day3-embedding-vectordb-en` | `/en/rag-day3-embedding-vectordb-en` |
| Day 4 | `rag-day4-search-optimization-en` | `/en/rag-day4-search-optimization-en` |
| Day 5 | `rag-day5-claude-integration-en` | `/en/rag-day5-claude-integration-en` |
| Day 6 | `rag-day6-production-en` | `/en/rag-day6-production-en` |

---

## 📁 파일 명명 규칙

### 마크다운 파일 경로
```
content/posts/ko/YYYY-MM-DD-rag-dayN-{topic}.md
content/posts/en/YYYY-MM-DD-rag-dayN-{topic}-en.md
```

### 예상 파일 목록

**일정 규칙**: 주중(월~금)만 작업, 주말 제외

```
content/posts/ko/2025-12-16-rag-day1-introduction.md           # 월 12/16
content/posts/ko/2025-12-17-rag-day2-document-processing.md    # 화 12/17
content/posts/ko/2025-12-18-rag-day3-embedding-vectordb.md     # 수 12/18
content/posts/ko/2025-12-19-rag-day4-search-optimization.md    # 목 12/19
content/posts/ko/2025-12-20-rag-day5-claude-integration.md     # 금 12/20
content/posts/ko/2025-12-23-rag-day6-production.md             # 월 12/23 (주말 건너뜀)

content/posts/en/2025-12-16-rag-day1-introduction-en.md
content/posts/en/2025-12-17-rag-day2-document-processing-en.md
content/posts/en/2025-12-18-rag-day3-embedding-vectordb-en.md
content/posts/en/2025-12-19-rag-day4-search-optimization-en.md
content/posts/en/2025-12-20-rag-day5-claude-integration-en.md
content/posts/en/2025-12-23-rag-day6-production-en.md
```

---

## 📋 시리즈 네비게이션

### 한국어 URL 및 제목 매핑

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)

### 영어 URL 및 제목 매핑

- [Day 1: RAG Concepts and Architecture](/en/rag-day1-introduction-en)
- [Day 2: Document Processing and Chunking](/en/rag-day2-document-processing-en)
- [Day 3: Embeddings and Vector Database](/en/rag-day3-embedding-vectordb-en)
- [Day 4: Search Optimization and Reranking](/en/rag-day4-search-optimization-en)
- [Day 5: Claude Integration and Answer Generation](/en/rag-day5-claude-integration-en)
- [Day 6: Production Deployment and Optimization](/en/rag-day6-production-en)

---

## 📋 시리즈 네비게이션 템플릿 (복사용)

### 한국어 네비게이션 (복사용)
```markdown
---

## 시리즈 네비게이션

- [Day 1: RAG 개념과 아키텍처](/ko/rag-day1-introduction)
- [Day 2: 문서 처리와 청킹 전략](/ko/rag-day2-document-processing)
- [Day 3: 임베딩과 벡터 데이터베이스](/ko/rag-day3-embedding-vectordb)
- [Day 4: 검색 최적화와 리랭킹](/ko/rag-day4-search-optimization)
- [Day 5: Claude 통합과 답변 생성](/ko/rag-day5-claude-integration)
- [Day 6: 프로덕션 배포와 최적화](/ko/rag-day6-production)
```

### 영어 네비게이션 (복사용)
```markdown
---

## Series Navigation

- [Day 1: RAG Concepts and Architecture](/en/rag-day1-introduction-en)
- [Day 2: Document Processing and Chunking](/en/rag-day2-document-processing-en)
- [Day 3: Embeddings and Vector Database](/en/rag-day3-embedding-vectordb-en)
- [Day 4: Search Optimization and Reranking](/en/rag-day4-search-optimization-en)
- [Day 5: Claude Integration and Answer Generation](/en/rag-day5-claude-integration-en)
- [Day 6: Production Deployment and Optimization](/en/rag-day6-production-en)
```

---

## 📝 Day별 상세 구조

### Day 1: RAG 개념과 아키텍처

**한국어 제목**: "RAG Day 1: RAG 개념과 아키텍처 - 내 문서를 아는 AI 만들기"
**영어 제목**: "RAG Day 1: RAG Concepts and Architecture - Building AI That Knows Your Documents"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 1: RAG 개념과 아키텍처 - 내 문서를 아는 AI 만들기"
slug: "rag-day1-introduction"
excerpt: "RAG(Retrieval Augmented Generation)란 무엇인가? LLM의 환각 문제를 해결하고 내 문서를 기반으로 답변하는 AI 시스템의 아키텍처를 알아봅니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Retrieval Augmented Generation"
  - "LLM"
  - "벡터 데이터베이스"
  - "AI 챗봇"
language: "ko"
---
```

**Frontmatter (영어)**:
```yaml
---
title: "RAG Day 1: RAG Concepts and Architecture - Building AI That Knows Your Documents"
slug: "rag-day1-introduction-en"
excerpt: "What is RAG (Retrieval Augmented Generation)? Learn how to solve LLM hallucination problems and build AI systems that answer based on your own documents."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Retrieval Augmented Generation"
  - "LLM"
  - "Vector Database"
  - "AI Chatbot"
language: "en"
---
```

**핵심 내용**:
1. RAG란 무엇인가?
   - LLM의 한계 (환각, 최신 정보 부족)
   - RAG가 해결하는 문제
   - RAG vs Fine-tuning 비교
2. RAG 아키텍처
   - 인덱싱 파이프라인 (문서 → 청크 → 임베딩 → 저장)
   - 검색 파이프라인 (질문 → 검색 → 컨텍스트 주입 → 답변)
3. 프로젝트 셋업
   - my-first-rag 저장소 생성
   - TypeScript 프로젝트 구조
   - 필요한 패키지 설치

**코드 예제**:
```typescript
// RAG 시스템 기본 구조
interface RAGSystem {
  // 인덱싱
  ingest(documents: Document[]): Promise<void>;

  // 검색 + 답변
  query(question: string): Promise<Answer>;
}

// Day 1에서 만들 기본 스켈레톤
const rag = new SimpleRAG({
  embeddingModel: "voyage-3",
  vectorStore: "supabase",
  llm: "claude-sonnet-4-20250514",
});
```

**타겟 키워드**: RAG, Retrieval Augmented Generation, LLM 환각, 벡터 데이터베이스, AI 챗봇

---

### Day 2: 문서 처리와 청킹 전략

**한국어 제목**: "RAG Day 2: 문서 처리와 청킹 전략 - 효과적인 텍스트 분할"
**영어 제목**: "RAG Day 2: Document Processing and Chunking - Effective Text Splitting"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 2: 문서 처리와 청킹 전략 - 효과적인 텍스트 분할"
slug: "rag-day2-document-processing"
excerpt: "PDF, 마크다운, 텍스트 파일을 RAG 시스템에 적합하게 처리하는 방법을 알아봅니다. 청킹 전략과 메타데이터 관리로 검색 품질을 높입니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "문서 처리"
  - "청킹"
  - "텍스트 분할"
  - "Document Processing"
language: "ko"
---
```

**핵심 내용**:
1. 문서 로딩
   - PDF 파싱 (pdf-parse)
   - 마크다운 파싱 (gray-matter, unified)
   - 웹 페이지 크롤링
2. 청킹 전략
   - 고정 크기 청킹
   - 의미 기반 청킹 (문단, 섹션)
   - 재귀적 청킹
   - 청크 크기 최적화 (512 vs 1024 토큰)
3. 메타데이터 관리
   - 출처 추적
   - 계층 구조 보존
   - 필터링용 태그

**타겟 키워드**: 문서 처리, 청킹, 텍스트 분할, PDF 파싱, RAG 전처리

---

### Day 3: 임베딩과 벡터 데이터베이스

**한국어 제목**: "RAG Day 3: 임베딩과 벡터 데이터베이스 - 텍스트를 숫자로"
**영어 제목**: "RAG Day 3: Embeddings and Vector Database - Text to Numbers"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 3: 임베딩과 벡터 데이터베이스 - 텍스트를 숫자로"
slug: "rag-day3-embedding-vectordb"
excerpt: "텍스트를 벡터로 변환하는 임베딩 모델과 벡터 데이터베이스 설정 방법을 알아봅니다. Voyage AI와 Supabase로 실습합니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "임베딩"
  - "벡터 데이터베이스"
  - "Supabase"
  - "Voyage AI"
language: "ko"
---
```

**핵심 내용**:
1. 임베딩 이해
   - 임베딩이란? (텍스트 → 벡터)
   - 임베딩 모델 비교 (OpenAI, Voyage AI, Cohere)
   - Voyage AI 설정 및 사용
2. 벡터 데이터베이스
   - 벡터 DB 종류 (Supabase, Pinecone, Chroma)
   - Supabase Vector 설정
   - pgvector 기초
3. 인덱싱 파이프라인 구현
   - 문서 → 청크 → 임베딩 → 저장
   - 배치 처리
   - 중복 처리

**타겟 키워드**: 임베딩, 벡터 데이터베이스, Supabase, Voyage AI, pgvector

---

### Day 4: 검색 최적화와 리랭킹

**한국어 제목**: "RAG Day 4: 검색 최적화와 리랭킹 - 관련 문서 정확히 찾기"
**영어 제목**: "RAG Day 4: Search Optimization and Reranking - Finding Relevant Documents"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 4: 검색 최적화와 리랭킹 - 관련 문서 정확히 찾기"
slug: "rag-day4-search-optimization"
excerpt: "시맨틱 검색, 키워드 검색, 하이브리드 검색을 비교하고 리랭킹으로 검색 품질을 높이는 방법을 알아봅니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "시맨틱 검색"
  - "하이브리드 검색"
  - "리랭킹"
  - "검색 최적화"
language: "ko"
---
```

**핵심 내용**:
1. 검색 방식 비교
   - 시맨틱 검색 (벡터 유사도)
   - 키워드 검색 (BM25)
   - 하이브리드 검색 (둘 다 합치기)
2. 검색 파라미터 튜닝
   - top-k 설정
   - 유사도 임계값
   - 필터링 (메타데이터 기반)
3. 리랭킹
   - 왜 리랭킹이 필요한가?
   - Cohere Rerank / Cross-encoder
   - 구현 및 성능 비교

**타겟 키워드**: 시맨틱 검색, 하이브리드 검색, 리랭킹, BM25, 검색 최적화

---

### Day 5: Claude 통합과 답변 생성

**한국어 제목**: "RAG Day 5: Claude 통합과 답변 생성 - 검색 결과로 답변 만들기"
**영어 제목**: "RAG Day 5: Claude Integration and Answer Generation - Creating Answers from Search Results"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 5: Claude 통합과 답변 생성 - 검색 결과로 답변 만들기"
slug: "rag-day5-claude-integration"
excerpt: "검색된 문서를 Claude에게 전달하여 정확한 답변을 생성하는 방법을 알아봅니다. 프롬프트 설계와 출처 표시 구현."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "Claude"
  - "답변 생성"
  - "프롬프트 엔지니어링"
  - "출처 표시"
language: "ko"
---
```

**핵심 내용**:
1. 컨텍스트 주입
   - 검색 결과를 프롬프트에 포함
   - 컨텍스트 윈도우 관리
   - 긴 컨텍스트 처리
2. RAG 프롬프트 설계
   - 기본 RAG 프롬프트 템플릿
   - 출처 표시 요청
   - "모르면 모른다고 해" 지시
3. 답변 생성
   - 스트리밍 응답
   - 출처 추출 및 표시
   - 후처리

**타겟 키워드**: Claude, 답변 생성, 컨텍스트 주입, RAG 프롬프트, 출처 표시

---

### Day 6: 프로덕션 배포와 최적화

**한국어 제목**: "RAG Day 6: 프로덕션 배포와 최적화 - 실서비스 준비"
**영어 제목**: "RAG Day 6: Production Deployment and Optimization - Ready for Real Service"

**Frontmatter (한국어)**:
```yaml
---
title: "RAG Day 6: 프로덕션 배포와 최적화 - 실서비스 준비"
slug: "rag-day6-production"
excerpt: "RAG 시스템을 프로덕션에 배포하기 위한 평가 지표, 비용 최적화, 모니터링 방법을 알아봅니다."
status: "publish"
categories:
  - "RAG"
  - "AI Development"
tags:
  - "RAG"
  - "프로덕션 배포"
  - "비용 최적화"
  - "RAG 평가"
  - "모니터링"
language: "ko"
---
```

**핵심 내용**:
1. RAG 평가
   - 평가 지표 (정확도, 관련성, 충실도)
   - 테스트 데이터셋 구축
   - 자동화된 평가 파이프라인
2. 비용 최적화
   - 임베딩 캐싱
   - 청크 크기 최적화
   - 모델 선택 (비용 vs 품질)
3. 프로덕션 배포
   - API 서버 구축
   - 에러 처리
   - 모니터링 및 로깅

**타겟 키워드**: RAG 평가, 프로덕션 배포, 비용 최적화, RAG 모니터링

---

## 🎯 SEO 전략

### Primary Keywords (시리즈 공통)
- RAG
- Retrieval Augmented Generation
- RAG 튜토리얼
- TypeScript RAG
- 벡터 데이터베이스

### Secondary Keywords (Day별)
| Day | Keywords |
|-----|----------|
| Day 1 | RAG 아키텍처, LLM 환각, RAG vs Fine-tuning |
| Day 2 | 문서 처리, 청킹, 텍스트 분할, PDF 파싱 |
| Day 3 | 임베딩, 벡터 DB, Supabase, Voyage AI |
| Day 4 | 시맨틱 검색, 하이브리드 검색, 리랭킹 |
| Day 5 | Claude 통합, 답변 생성, 컨텍스트 주입 |
| Day 6 | RAG 평가, 프로덕션 배포, 비용 최적화 |

### Long-tail Keywords
- "RAG 시스템 만들기"
- "TypeScript RAG 튜토리얼"
- "Claude RAG 연동"
- "벡터 데이터베이스 선택"
- "RAG 검색 최적화"
- "문서 기반 AI 챗봇"

---

## 📦 프로젝트 구조

### my-first-rag 저장소 구조
```
my-first-rag/
├── src/
│   ├── index.ts                 # 진입점
│   ├── rag/
│   │   ├── simple-rag.ts        # Day 1: 기본 RAG 클래스
│   │   ├── document-loader.ts   # Day 2: 문서 로더
│   │   ├── chunker.ts           # Day 2: 청킹
│   │   ├── embedder.ts          # Day 3: 임베딩
│   │   ├── vector-store.ts      # Day 3: 벡터 저장소
│   │   ├── retriever.ts         # Day 4: 검색
│   │   ├── reranker.ts          # Day 4: 리랭킹
│   │   └── generator.ts         # Day 5: 답변 생성
│   ├── integrations/
│   │   ├── voyage.ts            # Voyage AI 연동
│   │   ├── supabase.ts          # Supabase 연동
│   │   └── claude.ts            # Claude 연동
│   └── utils/
│       ├── logger.ts            # 로깅
│       └── metrics.ts           # 메트릭
├── examples/
│   ├── day1-basic-rag.ts
│   ├── day2-document-processing.ts
│   ├── day3-embedding-demo.ts
│   ├── day4-search-demo.ts
│   ├── day5-full-rag.ts
│   └── day6-production-rag.ts
├── tests/
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✅ 체크리스트

### 시작 전
- [ ] my-first-rag GitHub 저장소 생성
- [ ] Voyage AI API 키 발급
- [ ] Supabase 프로젝트 생성
- [ ] Anthropic API 키 확인

### Day 1 작성 시
- [ ] SEO 점수 70점 이상 확인
- [ ] 각 태그 키워드 본문에 최소 5회 이상 출현
- [ ] 키워드 밀도 0.5-2.5% 범위
- [ ] GitHub 링크 포함: https://github.com/dh1789/my-first-rag
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
- [Anthropic Claude API](https://docs.anthropic.com/en/api)
- [Voyage AI Embeddings](https://docs.voyageai.com/)
- [Supabase Vector](https://supabase.com/docs/guides/ai)
- [Pinecone Documentation](https://docs.pinecone.io/)

### 튜토리얼
- [LangChain.js RAG Tutorial](https://js.langchain.com/docs/tutorials/rag)
- [Supabase AI & Vectors](https://supabase.com/docs/guides/ai)

### 기존 프로젝트
- [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP 시리즈
- [my-first-agent](https://github.com/dh1789/my-first-agent) - Agent SDK 시리즈

---

## 📝 버전 기록

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| v1.0 | 2024-12-15 | 초기 문서 작성 |

---

**문서 상태**: ✅ 작업 준비 완료
**다음 단계**: my-first-rag 저장소 생성 → Day 1 한국어 포스트 작성
