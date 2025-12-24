---
title: "RAG Day 1: RAG Concepts and Architecture - Building AI That Knows Your Documents"
slug: "rag-day1-introduction-en"
excerpt: "What is RAG (Retrieval Augmented Generation)? Learn how to solve LLM hallucination problems using vector databases to build an AI chatbot system that answers based on your documents."
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

> **🌐 Translation**: Translated from [Korean](/ko/rag-day1-introduction).

## TL;DR

- **RAG** (Retrieval Augmented Generation) is a technology that allows LLMs to search and answer from external documents
- Solves LLM **hallucination** problems and lack of up-to-date information
- Store documents in a **vector database**, find content similar to the question, and pass it to the LLM
- In this series, we build a complete Retrieval Augmented Generation system and **AI chatbot** with TypeScript
- GitHub: [my-first-rag](https://github.com/dh1789/my-first-rag)

---

## 1. What is RAG?

### LLM Limitations: Hallucination and Information Gap

**LLMs** (Large Language Models) like ChatGPT and Claude show remarkable capabilities. However, they have critical limitations.

**First Problem: Hallucination**

What happens if you ask an LLM, "What's our company's vacation policy?" The LLM answers confidently. But that content is completely made up. This is the **hallucination** problem. LLMs tend to answer confidently even when they don't know.

**Second Problem: Lack of Up-to-date Information**

LLMs only know data up to their training point. A model trained in 2024 doesn't know libraries released in 2025 or changed APIs. It certainly doesn't know your internal documents or latest product information.

### How RAG Solves These Problems

**RAG** stands for **Retrieval Augmented Generation**. The core idea of RAG is simple:

> "Before the LLM answers, let it first search and read relevant documents"

Let's look at how this system works:

1. User asks a question: "What's our company's vacation policy?"
2. The system searches for relevant documents in the **vector database**
3. Passes the retrieved documents (e.g., company policy handbook) to the LLM
4. The LLM generates accurate answers by referencing the documents

This significantly reduces LLM hallucination problems. If content isn't in the documents, we can guide the LLM to answer "I cannot find this in the documents."

### Real-World RAG Applications

RAG technology is already being used in various places:

- **Enterprise AI Chatbots**: Q&A based on internal documents
- **Customer Support Bots**: Automatic responses based on FAQs and manuals
- **Legal/Medical AI**: Information provision based on case law or papers
- **Code Assistants**: Coding support based on project documentation

The system we'll build in this series will also be the foundation for such **AI chatbots**.

---

## 2. Retrieval Augmented Generation vs Fine-tuning: What to Choose?

There are two main ways to improve LLMs for specific domains.

### Fine-tuning Approach

Fine-tuning is a method of additionally training the LLM itself.

**Pros:**
- Model "internalizes" domain knowledge
- No additional search step needed during inference

**Cons:**
- GPU resources and time needed for training
- Retraining required when adding new information
- Costs increase as model size grows

### Retrieval Augmented Generation Approach

Retrieval Augmented Generation provides external knowledge through search without modifying the LLM.

**Pros:**
- Document additions/modifications are immediately reflected
- No GPU training needed, cost-effective
- Can clearly show sources
- Mitigates LLM hallucination problems

**Cons:**
- Depends on search quality
- Requires vector database operation
- Context window limitations

### When to Choose Retrieval Augmented Generation?

| Situation | Recommended Approach |
|-----------|---------------------|
| Documents update frequently | **Retrieval Augmented Generation** |
| Source citation needed | **Retrieval Augmented Generation** |
| Quick deployment needed | **Retrieval Augmented Generation** |
| Domain language style change | Fine-tuning |
| Offline environment | Fine-tuning |

For most enterprise **AI chatbot** projects, Retrieval Augmented Generation is the more practical choice. We'll build our system using this approach in this series.

---

## 3. Retrieval Augmented Generation Architecture in Detail

A Retrieval Augmented Generation system consists of two main pipelines.

### 3.1 Indexing Pipeline (Offline)

This is the process of storing documents in the **vector database**. Once executed, documents become searchable.

```
[Documents] → [Chunking] → [Embedding] → [Vector Database Storage]
```

**Step-by-step explanation:**

1. **Document Loading**: Convert various format documents (PDF, markdown, web pages) to text
2. **Chunking**: Split long documents into smaller pieces (chunks). Usually 500-1000 tokens
3. **Embedding**: Convert each chunk into a vector (number array). Similar meaning texts become similar vectors
4. **Storage**: Store vectors in the **vector database**. Use Supabase, Pinecone, etc.

### 3.2 Retrieval Pipeline (Online)

This is the process of answering user questions. It operates in real-time.

```
[Question] → [Embedding] → [Vector Search] → [Context Construction] → [LLM Answer Generation]
```

**Step-by-step explanation:**

1. **Question Embedding**: Convert user question into a vector
2. **Vector Search**: Search for document chunks similar to the question vector in the **vector database**
3. **Context Construction**: Include retrieved chunks in the LLM prompt
4. **Answer Generation**: LLM generates answers referencing the context

### 3.3 Overall System Structure

```typescript
// Basic System Interface
interface RAGSystem {
  // Indexing Pipeline
  ingest(documents: Document[]): Promise<void>;

  // Retrieval Pipeline
  query(question: string): Promise<Answer>;
}

interface Document {
  content: string;
  metadata: {
    source: string;
    title?: string;
    [key: string]: unknown;
  };
}

interface Answer {
  text: string;
  sources: Source[];
}

interface Source {
  content: string;
  metadata: Document['metadata'];
  score: number;
}
```

This interface is the skeleton of the Retrieval Augmented Generation system we'll implement over 6 days.

---

## 4. Project Setup

Let's start building our project now.

### 4.1 Create Repository

```bash
# Create project directory
mkdir my-first-rag
cd my-first-rag

# Initialize Git
git init

# Create package.json
npm init -y
```

### 4.2 TypeScript Configuration

```bash
# Install TypeScript and essential packages
npm install typescript @types/node tsx -D

# Create tsconfig.json
npx tsc --init
```

Modify `tsconfig.json` as follows:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 Install Required Packages

```bash
# Anthropic Claude SDK (LLM)
npm install @anthropic-ai/sdk

# Document processing
npm install pdf-parse gray-matter

# Embedding and Vector DB (detailed in Day 3)
npm install @supabase/supabase-js

# Utilities
npm install dotenv zod
```

### 4.4 Project Structure

```
my-first-rag/
├── src/
│   ├── index.ts              # Entry point
│   ├── rag/
│   │   ├── simple-rag.ts     # Basic class
│   │   ├── document-loader.ts # Document loader
│   │   ├── chunker.ts        # Chunking
│   │   ├── embedder.ts       # Embedding
│   │   ├── vector-store.ts   # Vector store
│   │   ├── retriever.ts      # Retrieval
│   │   └── generator.ts      # Answer generation
│   └── utils/
│       └── logger.ts         # Logging
├── examples/
│   └── day1-basic.ts         # Day 1 example
├── documents/                 # Documents to index
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

### 4.5 Environment Variables Setup

Create a `.env` file:

```bash
# Anthropic API (Claude)
ANTHROPIC_API_KEY=your-api-key-here

# Supabase (Vector Database)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# Voyage AI (Embedding) - Used in Day 3
VOYAGE_API_KEY=your-voyage-api-key
```

### 4.6 Basic Skeleton Code

`src/rag/simple-rag.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export interface RAGConfig {
  anthropicApiKey: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class SimpleRAG {
  private client: Anthropic;

  constructor(config: RAGConfig) {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }

  // Implement in Day 2: Document indexing
  async ingest(documents: string[]): Promise<void> {
    console.log(`📚 ${documents.length} documents to be indexed`);
    // TODO: Chunking → Embedding → Storage
  }

  // Complete in Day 5: Q&A
  async query(question: string): Promise<string> {
    console.log(`❓ Question: ${question}`);

    // TODO: Find relevant documents via vector search
    const relevantDocs = '(Retrieved documents go here)';

    // Ask LLM with context
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please answer the question by referring to the following documents.

Documents:
${relevantDocs}

Question: ${question}

If the content is not in the documents, please answer "I cannot find this in the documents."`,
        },
      ],
    });

    const textBlock = response.content[0];
    if (textBlock.type === 'text') {
      return textBlock.text;
    }
    return 'Unable to generate an answer.';
  }
}
```

`src/index.ts`:

```typescript
import { SimpleRAG } from './rag/simple-rag';
import 'dotenv/config';

async function main() {
  const rag = new SimpleRAG({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Day 1: Verify basic structure
  console.log('🚀 System initialization complete');

  // Test question (no search functionality yet)
  const answer = await rag.query('What is retrieval augmented generation?');
  console.log('💬 Answer:', answer);
}

main().catch(console.error);
```

Let's run it:

```bash
npx tsx src/index.ts
```

Since there's no **vector database** search functionality yet, meaningful answers won't come out. From Day 2, we'll implement each component in earnest.

---

## 5. Extending to an AI Chatbot

The Retrieval Augmented Generation system we're building becomes the core engine of an **AI chatbot**. In Day 6, we'll extend this system as follows:

- **Conversation History Management**: Maintain previous conversation context
- **Streaming Responses**: Real-time answer output
- **Source Display**: Provide links to source documents for answers
- **API Server**: Provide **AI chatbot** service via REST API

Here's why Retrieval Augmented Generation is important when building an **AI chatbot**:

| Regular Chatbot | Retrieval-based AI Chatbot |
|-----------------|---------------------|
| Relies only on training data | Can search latest documents |
| Serious hallucination problems | Accurate answers based on documents |
| Unclear sources | Clear source provision |
| Difficult to update | Immediate reflection by adding documents |

---

## 6. Conclusion and Preview

Let's summarize what we learned today:

### Key Points

1. **RAG** (Retrieval Augmented Generation) solves LLM hallucination and information gap problems
2. RAG Architecture: Indexing Pipeline + Retrieval Pipeline
3. Store documents in **vector database** and search based on similarity
4. More flexible and cost-effective than fine-tuning
5. Core technology for **AI chatbot** development

### Day 2 Preview: Document Processing and Chunking Strategies

In the next article, we'll cover document processing, the first step of this approach:

- Loading PDF, markdown, and text files
- Effective chunking strategies (fixed-size vs semantic-based)
- Improving search quality with metadata management

**Check out the full code on GitHub:**
[https://github.com/dh1789/my-first-rag](https://github.com/dh1789/my-first-rag)

