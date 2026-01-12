/**
 * RAG (Retrieval-Augmented Generation) 모듈
 *
 * 검색된 문서를 LLM에게 전달하여 답변을 생성하는 핵심 기능을 제공합니다.
 * - 컨텍스트 주입 (Context Injection)
 * - RAG 프롬프트 설계
 * - 출처 추출 및 표시
 * - 답변 포맷팅
 */

/**
 * 문서 인터페이스
 */
export interface Document {
  content: string;
  title?: string;
  source: string;
}

/**
 * RAG 컨텍스트 인터페이스
 */
export interface RAGContext {
  query: string;
  documents: Document[];
  maxTokens: number;
}

/**
 * 출처 인터페이스
 */
export interface Citation {
  documentIndex: number;
  documentTitle: string;
  source: string;
}

/**
 * 포맷팅된 답변 인터페이스
 */
export interface FormattedAnswer {
  content: string;
  citations: Citation[];
  metadata: {
    model: string;
    documentsUsed: number;
    generatedAt: string;
  };
}

/**
 * RAG Generator 설정 인터페이스
 */
export interface RAGConfig {
  anthropicApiKey: string;
  model?: string;
  maxContextTokens?: number;
  temperature?: number;
}

/**
 * 토큰 수 추정 (대략 4자 = 1토큰)
 */
export function estimateTokens(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * 컨텍스트 윈도우 관리 - 토큰 제한에 맞게 문서 선택
 */
export function manageContextWindow(
  documents: Document[],
  maxTokens: number
): Document[] {
  if (maxTokens <= 0) return [];

  let totalTokens = 0;
  const selectedDocs: Document[] = [];

  for (const doc of documents) {
    const docTokens = estimateTokens(doc.content);

    if (totalTokens + docTokens > maxTokens) {
      break;
    }

    selectedDocs.push(doc);
    totalTokens += docTokens;
  }

  return selectedDocs;
}

/**
 * 컨텍스트 주입 - 검색된 문서를 프롬프트에 포함시키는 형식으로 변환
 */
export function injectContext(context: RAGContext): string {
  const { query, documents } = context;

  if (documents.length === 0) {
    return `다음 문서들을 참고하여 질문에 답하세요:

(참고할 문서가 없습니다)

질문: ${query}`;
  }

  const contextText = documents
    .map((doc, i) => `[문서 ${i + 1}]
${doc.content}
출처: ${doc.source}`)
    .join('\n\n');

  return `다음 문서들을 참고하여 질문에 답하세요:

${contextText}

질문: ${query}`;
}

/**
 * RAG 시스템 프롬프트
 */
const RAG_SYSTEM_PROMPT = `당신은 제공된 문서를 기반으로 정확하게 답변하는 AI 어시스턴트입니다.

## 핵심 규칙

1. **문서 기반 답변**: 반드시 제공된 문서의 정보만 사용하세요.
2. **출처 표시**: 답변에 사용한 정보의 출처를 [문서 N] 형식으로 표시하세요.
3. **모르면 인정**: 문서에 없는 정보는 "제공된 문서에서 해당 정보를 찾을 수 없습니다"라고 답하세요.
4. **추측 금지**: 문서에 명시되지 않은 내용을 추측하거나 만들어내지 마세요.

## 답변 형식

- 명확하고 구조화된 답변
- 필요시 마크다운 사용 (리스트, 코드 블록 등)
- 답변 끝에 참고한 문서 번호 명시`;

/**
 * RAG 프롬프트 빌더 - 완전한 프롬프트 구성
 */
export function buildRAGPrompt(query: string, documents: Document[]): string {
  const contextSection = documents
    .map((doc, i) => `[문서 ${i + 1}]
제목: ${doc.title || 'N/A'}
내용: ${doc.content}
출처: ${doc.source}`)
    .join('\n\n---\n\n');

  return `${RAG_SYSTEM_PROMPT}

---

## 참고 문서

${contextSection || '(참고할 문서가 없습니다)'}

---

## 질문

${query}

---

위 문서들을 참고하여 질문에 답변해주세요.`;
}

/**
 * 답변에서 출처 정보 추출
 */
export function extractCitations(
  answer: string,
  documents: Document[]
): Citation[] {
  // [문서 N] 패턴 매칭 (공백 허용)
  const citationPattern = /\[문서\s*(\d+)\]/g;
  const matches = answer.matchAll(citationPattern);

  const citedIndices = new Set<number>();

  for (const match of matches) {
    const index = parseInt(match[1], 10) - 1;
    if (index >= 0 && index < documents.length) {
      citedIndices.add(index);
    }
  }

  return Array.from(citedIndices).map(index => ({
    documentIndex: index + 1,
    documentTitle: documents[index].title || `문서 ${index + 1}`,
    source: documents[index].source,
  }));
}

/**
 * 답변 포맷팅 - 출처 정보 포함한 최종 답변 생성
 */
export function formatAnswer(
  rawAnswer: string,
  documents: Document[],
  model: string
): FormattedAnswer {
  const citations = extractCitations(rawAnswer, documents);

  // 출처 섹션 추가 (없으면)
  let content = rawAnswer;
  if (!rawAnswer.includes('📚 참고 문서') && citations.length > 0) {
    content += '\n\n---\n📚 **참고 문서:**\n';
    content += citations
      .map(c => `- [문서 ${c.documentIndex}] ${c.documentTitle}`)
      .join('\n');
  }

  return {
    content,
    citations,
    metadata: {
      model,
      documentsUsed: citations.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * RAG Generator 클래스
 * 전체 RAG 파이프라인을 관리합니다.
 */
export class RAGGenerator {
  private config: Required<RAGConfig>;

  constructor(config: RAGConfig) {
    this.config = {
      anthropicApiKey: config.anthropicApiKey,
      model: config.model || 'claude-sonnet-4-20250514',
      maxContextTokens: config.maxContextTokens || 100000,
      temperature: config.temperature ?? 0,
    };
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): Required<RAGConfig> {
    return { ...this.config };
  }

  /**
   * RAG 답변 생성
   */
  async generate(
    query: string,
    documents: Document[]
  ): Promise<FormattedAnswer> {
    // 1. 컨텍스트 관리
    const selectedDocs = manageContextWindow(
      documents,
      this.config.maxContextTokens
    );

    // 2. 프롬프트 구성
    const prompt = buildRAGPrompt(query, selectedDocs);

    // 3. Claude 호출 (실제 구현은 외부에서 주입)
    // 여기서는 테스트를 위한 기본 구조만 제공
    const rawAnswer = await this.callClaude(prompt);

    // 4. 포맷팅 및 출처 추출
    return formatAnswer(rawAnswer, selectedDocs, this.config.model);
  }

  /**
   * Claude API 호출 (테스트를 위해 분리)
   */
  protected async callClaude(prompt: string): Promise<string> {
    // 실제 구현에서는 Anthropic SDK 사용
    // 테스트에서는 모킹됨
    throw new Error('Not implemented - requires Anthropic SDK');
  }
}
