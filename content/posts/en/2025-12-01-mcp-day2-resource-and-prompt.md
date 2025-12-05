---
title: "MCP Server Development (2/5): Complete Guide to Resource and Prompt"
slug: "mcp-day2-resource-and-prompt-en"
excerpt: "Learn how to implement MCP Server Resources and Prompts with TypeScript. From static Resources to dynamic templates, master MCP Development with practical examples. Complete guide to using Resources and Prompts in Claude Code."
date: "2025-12-01"
author: "idongho"
categories:
  - "MCP"
  - "AI Tools"
  - "Tutorial"
tags:
  - MCP
  - Model Context Protocol
  - Claude Code
  - TypeScript
  - MCP Server
  - Resource Implementation
  - Prompt Implementation
  - AI Development
  - MCP Development
  - AI Tools
featured_image: ""
status: "publish"
language: "en"
seo_title: "MCP Resource and Prompt Implementation Guide: Complete Your MCP Server with TypeScript"
seo_description: "Complete guide to implementing MCP Server Resources and Prompts with TypeScript. Static/dynamic Resources and Prompt templates with practical examples."
---

> **🌐 Translation**: Translated from [Korean](/mcp-day2-resource-and-prompt).

## TL;DR

**MCP (Model Context Protocol)** servers provide **Resource** and **Prompt** capabilities beyond just Tools. This guide covers how to add Resource Implementation and Prompt Implementation to your MCP Server. For AI Development with Model Context Protocol, understanding all three features is essential.

What you'll learn:
- MCP Development essentials - Resource Implementation to provide data to AI Tools
- MCP Development essentials - Prompt Implementation for reusable templates with TypeScript
- Differences between static and dynamic Resources (Templates)
- How to use Resources and Prompts in Claude Code AI Tools
- Practical AI Development with Model Context Protocol

**Complete Code**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP Development tutorial with Resource Implementation and Prompt Implementation

**Series**: [Day 1: Model Context Protocol Concepts](/mcp-day1-introduction-and-first-server-en) | **Day 2: Resource and Prompt** | Day 3: Real-world Project (Coming Soon)

---

## Tool vs Resource vs Prompt Review

In [Day 1](/mcp-day1-introduction-and-first-server-en), we introduced the three core features of Model Context Protocol based MCP Servers. In AI Development and MCP Development, clearly distinguishing these three is crucial. Understanding how each feature works in AI Tools like Claude Code is essential.

| Feature | Description | AI Tools Perspective | Use Cases |
|---------|-------------|---------------------|-----------|
| **Tool** | Functions AI can execute | "Perform this task" | Calculations, searches, API calls |
| **Resource** | Data provided to AI | "Reference this information" | Config files, docs, state |
| **Prompt** | Pre-defined templates | "Work in this format" | Code review, translation requests |

Day 1 focused on Tool Implementation. Today, we'll complete our Model Context Protocol based MCP Server with Resource Implementation and Prompt Implementation. We'll also cover practical AI Development examples using these features in Claude Code and other AI Tools.

---

## What is a Resource? Providing Data to AI Tools

### The Role of Resources

MCP Resources are **read-only data** that AI Tools can reference. In AI Development, providing context is key, and Resources serve exactly that purpose.

Key considerations for Resource Implementation:
- **URI Format**: Identified as `protocol://path` format
- **Read-only**: Resources only provide data (no modifications)
- **Structured Data**: Supports JSON, text, binary, and various formats

### Static vs Dynamic Resources

There are two approaches to Resource Implementation in MCP Servers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Resource Types                            │
├─────────────────────────────┬───────────────────────────────┤
│       Static Resource        │       Dynamic Resource         │
│  (Fixed Resource)            │  (Resource Template)           │
├─────────────────────────────┼───────────────────────────────┤
│  Fixed URI                   │  URI template with variables   │
│  config://settings           │  file:///{path}                │
│  server.resource()           │  server.resource() + template  │
│  Config files, constants     │  File system, DB records       │
└─────────────────────────────┴───────────────────────────────┘
```

---

## Static Resource Implementation

### Creating a Server Info Resource

Let's start with the simplest Resource Implementation. A static Resource that provides MCP Server information.

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// Static Resource registration
server.resource(
  "server-info",                    // Resource name
  "server://info",                  // URI
  {
    description: "Provides MCP Server information",
    mimeType: "application/json",
  },
  async () => {
    const serverInfo = {
      name: "my-first-mcp",
      version: "1.0.0",
      description: "MCP Development tutorial server",
      author: "idongho",
      tools: [
        "get_current_time",
        "calculate",
        "get_random_number",
        "reverse_string",
        "get_server_info",
      ],
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
      },
    };

    return {
      contents: [{
        uri: "server://info",
        mimeType: "application/json",
        text: JSON.stringify(serverInfo, null, 2),
      }],
    };
  }
);
```

### Key Points for Resource Implementation

Essential knowledge for MCP Resource Implementation:

1. **URI Design**: Clear `protocol://path` format
2. **mimeType Specification**: `application/json`, `text/plain`, etc.
3. **contents Array**: Can return multiple contents
4. **Async Processing**: Implement as async functions

### Adding a Config Resource

A commonly used config Resource Implementation in practice:

```typescript
// Config Resource - AI Tools can reference current settings
server.resource(
  "config",
  "config://settings",
  {
    description: "MCP Server configuration",
    mimeType: "application/json",
  },
  async () => {
    const config = {
      timezone: "Asia/Seoul",
      language: "en",
      features: {
        calculation: true,
        timeQuery: true,
        stringManipulation: true,
      },
      limits: {
        maxRandomNumber: 1000,
        maxStringLength: 10000,
      },
    };

    return {
      contents: [{
        uri: "config://settings",
        mimeType: "application/json",
        text: JSON.stringify(config, null, 2),
      }],
    };
  }
);
```

---

## Dynamic Resource Implementation (Resource Template)

### What is a Resource Template?

Dynamic Resources use **URI templates**. Variables are substituted at request time, enabling diverse data access. In MCP Development, this is used for file system access, DB queries, and more.

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Dynamic Resource Template
server.resource(
  "help",
  new ResourceTemplate("help://topic/{topic}", { list: undefined }),
  {
    description: "Retrieves help topics",
    mimeType: "text/plain",
  },
  async (uri, { topic }) => {
    const helpTopics: Record<string, string> = {
      tools: `
## Available Tool List

1. **get_current_time**: Gets the current time
   - timezone: Timezone (e.g., Asia/Seoul)

2. **calculate**: Performs arithmetic operations
   - a: First number
   - b: Second number
   - operation: add, subtract, multiply, divide

3. **get_random_number**: Generates a random number
   - min: Minimum value (default: 0)
   - max: Maximum value (default: 100)

4. **reverse_string**: Reverses a string
   - text: String to reverse

5. **get_server_info**: Gets MCP Server information
`,
      resources: `
## Resource List

1. **server://info**: MCP Server information
2. **config://settings**: Server configuration
3. **help://topic/{topic}**: Help (tools, resources, prompts)
`,
      prompts: `
## Prompt Template List

1. **code-review**: Code review request template
2. **explain-code**: Code explanation request template
`,
    };

    const content = helpTopics[topic as string] ||
      `Unknown topic. Available: tools, resources, prompts`;

    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/plain",
        text: content,
      }],
    };
  }
);
```

### URI Template Syntax

URI patterns used in MCP Resource Templates:

| Pattern | Description | Example |
|---------|-------------|---------|
| `{variable}` | Required variable | `file:///{path}` |
| `{+variable}` | Include reserved chars | `file:///{+path}` (allows slashes) |
| `{?param}` | Query parameter | `api://data{?format}` |

---

## Prompt Implementation: Reusable Templates

### What is a Prompt?

MCP Prompts are pre-defined **prompt templates**. In AI Development, you can templateize repetitive tasks to get consistent results.

Benefits of Prompt Implementation:
- **Consistency**: Repeat same format requests
- **Reusability**: Define once, use multiple times
- **Parameterization**: Generate prompts dynamically with arguments

### Creating a Code Review Prompt

The most practical Prompt Implementation example:

```typescript
import { z } from "zod";

// Code Review Prompt
server.prompt(
  "code-review",
  "Requests a code review",
  {
    code: z.string().describe("Code to review"),
    language: z.string().optional().describe("Programming language"),
    focusAreas: z.string().optional().describe("Focus areas (comma-separated)"),
  },
  async ({ code, language, focusAreas }) => {
    const lang = language || "unknown";
    const focus = focusAreas || "overall code quality";

    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please review the following ${lang} code.

## Focus Areas
${focus}

## Code
\`\`\`${lang}
${code}
\`\`\`

## Request
1. Code quality rating (1-10)
2. Areas needing improvement
3. Well-written parts
4. Specific improvement suggestions
`,
        },
      }],
    };
  }
);
```

### Adding a Code Explanation Prompt

Another Prompt Implementation example commonly used in AI Tools:

```typescript
// Code Explanation Prompt
server.prompt(
  "explain-code",
  "Requests code explanation",
  {
    code: z.string().describe("Code to explain"),
    level: z.enum(["beginner", "intermediate", "advanced"])
      .optional()
      .describe("Explanation level"),
  },
  async ({ code, level }) => {
    const levelText = {
      beginner: "simply so programming beginners can understand",
      intermediate: "for someone with basic programming knowledge",
      advanced: "in-depth for experienced developers",
    };

    const explanation = levelText[level || "intermediate"];

    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please explain the following code ${explanation}.

\`\`\`
${code}
\`\`\`

## Explanation Format
1. Purpose of the code
2. Step-by-step explanation of main logic
3. Patterns or techniques used
4. Points to note
`,
        },
      }],
    };
  }
);
```

### Key Points for Prompt Implementation

Important considerations for MCP Prompt Implementation:

1. **Clear Names**: Use names that indicate purpose
2. **zod Schema**: Define parameter types and descriptions
3. **messages Array**: role and content format
4. **Markdown Usage**: Write structured prompts

---

## Complete MCP Server Code

Complete MCP Server with both Resource Implementation and Prompt Implementation:

```typescript
// src/index.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server
const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// ===== Tools (from Day 1) =====

server.tool(
  "get_current_time",
  "Returns the current time",
  { timezone: z.string().optional().describe("Timezone") },
  async ({ timezone }) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || "Asia/Seoul",
      dateStyle: "full",
      timeStyle: "long",
    };
    return {
      content: [{ type: "text", text: now.toLocaleString("en-US", options) }],
    };
  }
);

// ... other Tools ...

// ===== Resources (Day 2) =====

// Static Resource: Server info
server.resource(
  "server-info",
  "server://info",
  { description: "MCP Server info", mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "server://info",
      mimeType: "application/json",
      text: JSON.stringify({
        name: "my-first-mcp",
        version: "1.0.0",
        capabilities: { tools: true, resources: true, prompts: true },
      }, null, 2),
    }],
  })
);

// Static Resource: Config
server.resource(
  "config",
  "config://settings",
  { description: "Server config", mimeType: "application/json" },
  async () => ({
    contents: [{
      uri: "config://settings",
      mimeType: "application/json",
      text: JSON.stringify({
        timezone: "Asia/Seoul",
        language: "en",
      }, null, 2),
    }],
  })
);

// ===== Prompts (Day 2) =====

// Code Review Prompt
server.prompt(
  "code-review",
  "Requests a code review",
  {
    code: z.string().describe("Code to review"),
    language: z.string().optional().describe("Programming language"),
  },
  async ({ code, language }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review the following ${language || ''} code:\n\n\`\`\`\n${code}\n\`\`\``,
      },
    }],
  })
);

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
console.error("MCP Server started!");
```

---

## Testing Resources and Prompts with MCP Inspector

### Running the Inspector

```bash
npm run inspect
# Open http://localhost:6274 in browser
```

### Testing Resources

1. Click **Resources tab**
2. Check registered Resource list
3. Select `server://info`
4. Click **Read Resource**
5. Verify JSON response

### Testing Prompts

1. Click **Prompts tab**
2. Select `code-review`
3. Enter parameters:
   - code: `function add(a, b) { return a + b; }`
   - language: `javascript`
4. Click **Get Prompt**
5. Verify generated prompt message

---

## Using Resources and Prompts in Claude Code

### Referencing Resources

Example of referencing Resources in Claude Code AI Tools:

```
User: "Tell me about the MCP server"

Claude Code: Reads server://info Resource to provide information.
→ Responds with MCP Server name, version, available features, etc.
```

### Using Prompts

Using Prompt Implementation templates in Claude Code:

```
User: "Review this code: function multiply(x, y) { return x * y; }"

Claude Code: Uses code-review Prompt for structured review.
→ Responds with code quality rating, improvements, strengths in format
```

---

## Summary

Model Context Protocol based MCP Development essentials learned in Day 2:

1. **Resource Implementation**: Provide read-only data to AI Tools
   - Static Resource: Fixed URI for config, state information
   - Dynamic Resource: URI templates for flexible data access
   - Core of context provision in AI Development

2. **Prompt Implementation**: Reusable prompt templates
   - Parameterized templates for consistent requests
   - Type safety with zod schema
   - Essential feature in MCP Development

3. **Complete MCP Server**: Tool + Resource + Prompt
   - Full integration with AI Tools
   - Using Model Context Protocol in Claude Code
   - AI Development workflow automation

### MCP Development Core Code Patterns

```typescript
// Resource Implementation pattern (Model Context Protocol)
server.resource(name, uri, metadata, handler);

// Prompt Implementation pattern (AI Development essential)
server.prompt(name, description, schema, handler);
```

---

## Next Episode Preview

**Day 3: Real-world MCP Server - Project Analysis Tool**

Day 3 covers practical MCP Development with Model Context Protocol:

- Practical MCP Server development - Tools ready for AI Development in the field
- File system access Tool Implementation - Integration with Claude Code AI Tools
- Project structure analysis features
- Dependency analysis, code statistics, and more MCP Development examples

---

## References

### Official Documentation
- [MCP Official Spec - Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [MCP Official Spec - Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### Series Links
- [Day 1: Model Context Protocol Concepts and First Server](/mcp-day1-introduction-and-first-server-en)
- Day 3: Real-world Project (Coming Soon)
- Day 4: npm Publishing (Coming Soon)
- Day 5: Advanced Patterns (Coming Soon)
