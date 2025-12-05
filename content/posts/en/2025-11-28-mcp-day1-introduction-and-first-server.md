---
title: "MCP Server Development (1/5): Model Context Protocol First Server Guide"
slug: "mcp-day1-introduction-and-first-server-en"
excerpt: "Learn Model Context Protocol (MCP) and build your first MCP Server with TypeScript. AI Development guide with TDD methodology and Unit Testing. Connect to Claude Code AI Tools for real-world usage."
date: "2025-11-28"
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
  - AI Tools
  - MCP Server
  - Tool Implementation
  - Unit Testing
  - TDD
  - AI Development
featured_image: ""
status: "draft"
language: "en"
seo_title: "MCP Server Development Guide: From Model Context Protocol Concepts to First Server Implementation"
seo_description: "Complete guide to understanding MCP (Model Context Protocol) concepts and building your first MCP server with TypeScript. Includes TDD unit testing and Claude Code AI tools integration."
---

> **Translation**: This post was translated from [Korean](/mcp-day1-introduction-and-first-server).

## TL;DR

**MCP (Model Context Protocol)** is a standard protocol that enables AI Tools to access external data and functionality. It solves the most critical integration challenge in AI Development.

What you'll learn in this AI Development guide:
- Why Model Context Protocol is needed and what problems it solves
- Understanding Host, Client, and MCP Server architecture
- Building an MCP Server with TypeScript and Tool Implementation
- Writing Unit Testing using TDD methodology
- Connecting to Claude Code for real-world AI Tools usage

**Complete Code**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP Server tutorial with TDD and Unit Testing for AI Development beginners

---

## Limitations of AI Tools and the Rise of Model Context Protocol

### The Problem: AI Doesn't Know the Outside World

AI tools like Claude and GPT only have knowledge based on their training data. Accessing real-time information, local files, databases, or external APIs requires separate integration. This is a core challenge in AI development.

Limitations of existing approaches:
- **Function Calling**: Different implementation for each AI tools provider
- **Plugins/Extensions**: Separate Tool implementation needed for each AI tools
- **Custom Integration**: Repetitive individual implementations without standards

### The Solution: Model Context Protocol (MCP)

Model Context Protocol, announced by Anthropic in November 2024, solves this problem. It provides a **standardized protocol** for AI tools to access external context.

Core values of Model Context Protocol:
- **Standardization**: Build an MCP Server once, use it across multiple AI tools
- **Flexibility**: Connect various data sources with Tool implementation
- **Extensibility**: Leverage community-built MCP Server ecosystem
- **Security**: Explicit permission management and sandboxing

---

## Model Context Protocol Core Architecture

### Host, Client, MCP Server Relationship

Model Context Protocol consists of three components:

```
┌─────────────────────────────────────────────────────────┐
│                   Host (Claude Code)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Client  │  │ Client  │  │ Client  │  │ Client  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │   MCP   │  │   MCP   │  │   MCP   │  │   MCP   │
   │ Server  │  │ Server  │  │ Server  │  │ Server  │
   │ (File)  │  │ (Git)   │  │ (API)   │  │ (DB)    │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

| Component | Role | Example |
|-----------|------|---------|
| **Host** | AI tools hosting MCP clients | Claude Code, Claude Desktop |
| **Client** | Manages 1:1 connection with MCP Server | Auto-generated inside Host |
| **MCP Server** | Process providing Tool implementation | File system, GitHub, DB, etc. |

### Communication: JSON-RPC 2.0

MCP uses the **JSON-RPC 2.0** protocol. Requests and responses are clear and standardized.

```json
// Request example
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": { "a": 10, "b": 5, "operation": "add" }
  }
}

// Response example
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "10 + 5 = 15" }]
  }
}
```

---

## Three Core Features of MCP

An MCP Server can provide three types of functionality:

### 1. Tools: Functions AI Can Execute

**Tool** is a function that AI can call. It performs actual tasks like calculations, file processing, and API calls.

```typescript
// Tool registration example
server.tool(
  "calculate",                    // Tool name
  "Performs arithmetic operations", // Description
  {                               // Input schema (zod)
    a: z.number(),
    b: z.number(),
    operation: z.enum(["add", "subtract", "multiply", "divide"])
  },
  async ({ a, b, operation }) => {  // Execution function
    // Return result
  }
);
```

### 2. Resources: Data Provided to AI

**Resource** is data that AI can reference. It provides configuration files, documents, and status information.

```typescript
// Resource registration example
server.resource(
  "config://app",           // Resource URI
  "Application settings",   // Description
  async () => ({
    contents: [{ type: "text", text: JSON.stringify(config) }]
  })
);
```

### 3. Prompts: Templated Prompts

**Prompt** is a pre-defined prompt template. Useful for repetitive tasks like code review and translation.

```typescript
// Prompt registration example
server.prompt(
  "code-review",
  "Request code review",
  { code: z.string() },
  async ({ code }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Please review the following code:\n${code}` }
    }]
  })
);
```

### When to Use Each Feature?

| Feature | Use Case | Examples |
|---------|----------|----------|
| **Tool** | Performing actions | Create files, API calls, calculations |
| **Resource** | Data reference | Config files, documents, status |
| **Prompt** | Template reuse | Code review, translation requests |

---

## Development Environment Setup

### Required Tools Installation

Tools needed for MCP Server development:

```bash
# Check Node.js 20+
node --version  # v20.x.x or higher

# Create project directory
mkdir my-first-mcp
cd my-first-mcp

# Initialize npm
npm init -y
```

### TypeScript Configuration

```bash
# Install dependencies
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node vitest
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json** key settings:
```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": { "my-first-mcp": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "inspect": "npx @modelcontextprotocol/inspector dist/index.js"
  }
}
```

---

## Building Your First MCP Server

### Project Structure

Designed for testability following TDD principles:

```
my-first-mcp/
├── src/
│   ├── index.ts      # MCP Server entry point
│   ├── tools.ts      # Core logic (Pure Functions)
│   └── tools.test.ts # Unit tests
├── dist/             # Build output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Core Logic: tools.ts

Separate core logic into testable pure functions:

```typescript
// src/tools.ts

// Tool 1: Get Current Time
export type TimeFormat = "full" | "date" | "time";

export interface TimeResult {
  formatted: string;
  timezone: string;
}

export function formatTime(
  date: Date,
  timezone: string = "Asia/Seoul",
  format: TimeFormat = "full"
): TimeResult {
  let options: Intl.DateTimeFormatOptions = { timeZone: timezone };

  switch (format) {
    case "date":
      options = { ...options, dateStyle: "full" };
      break;
    case "time":
      options = { ...options, timeStyle: "long" };
      break;
    case "full":
    default:
      options = { ...options, dateStyle: "full", timeStyle: "long" };
      break;
  }

  const formatted = date.toLocaleString("en-US", options);
  return { formatted, timezone };
}

// Tool 2: Calculator
export type Operation = "add" | "subtract" | "multiply" | "divide";

export interface CalculateResult {
  result: number;
  expression: string;
  isError: boolean;
  errorMessage?: string;
}

export function calculate(
  a: number,
  b: number,
  operation: Operation
): CalculateResult {
  const symbols: Record<Operation, string> = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷",
  };

  if (operation === "divide" && b === 0) {
    return {
      result: NaN,
      expression: `${a} ${symbols[operation]} ${b}`,
      isError: true,
      errorMessage: "Error: Cannot divide by zero.",
    };
  }

  let result: number;
  switch (operation) {
    case "add": result = a + b; break;
    case "subtract": result = a - b; break;
    case "multiply": result = a * b; break;
    case "divide": result = a / b; break;
  }

  return {
    result,
    expression: `${a} ${symbols[operation]} ${b} = ${result}`,
    isError: false,
  };
}

// Tool 3: Random Number Generator
export function generateRandomNumbers(
  min: number,
  max: number,
  count: number = 1
) {
  if (min > max) {
    return {
      numbers: [],
      min, max,
      isError: true,
      errorMessage: "Error: Minimum is greater than maximum.",
    };
  }

  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return { numbers, min, max, isError: false };
}

// Tool 4: String Reverser
export function reverseString(text: string) {
  return {
    original: text,
    reversed: text.split("").reverse().join(""),
  };
}

// Tool 5: Server Info
export function getServerInfo() {
  return {
    name: "my-first-mcp",
    version: "1.0.0",
    description: "MCP Server Development Tutorial",
    tools: [
      "get_current_time - Get current time",
      "calculate - Arithmetic calculator",
      "get_random_number - Generate random numbers",
      "reverse_string - Reverse string",
      "get_server_info - Get server info",
    ],
  };
}
```

### MCP Server Entry Point: index.ts

```typescript
#!/usr/bin/env node
// src/index.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
  type TimeFormat,
  type Operation,
} from "./tools.js";

// Create MCP Server instance
const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// Tool 1: Get Current Time
server.tool(
  "get_current_time",
  "Returns current date and time. Timezone can be specified.",
  {
    timezone: z.string().optional()
      .describe("Timezone (e.g., Asia/Seoul, America/New_York)"),
    format: z.enum(["full", "date", "time"]).optional()
      .describe("Output format: full, date only, time only"),
  },
  async ({ timezone, format }) => {
    const result = formatTime(
      new Date(),
      timezone || "Asia/Seoul",
      (format || "full") as TimeFormat
    );
    return {
      content: [{
        type: "text",
        text: `Current time (${result.timezone}): ${result.formatted}`,
      }],
    };
  }
);

// Tool 2: Calculator
server.tool(
  "calculate",
  "Performs arithmetic operations on two numbers.",
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
    operation: z.enum(["add", "subtract", "multiply", "divide"])
      .describe("Operation type"),
  },
  async ({ a, b, operation }) => {
    const result = calculate(a, b, operation as Operation);

    if (result.isError) {
      return {
        content: [{ type: "text", text: result.errorMessage! }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: result.expression }],
    };
  }
);

// Tool 3: Random Number Generator
server.tool(
  "get_random_number",
  "Generates random integers within specified range.",
  {
    min: z.number().int().describe("Minimum value"),
    max: z.number().int().describe("Maximum value"),
    count: z.number().int().min(1).max(10).optional()
      .describe("Number of values to generate (1-10)"),
  },
  async ({ min, max, count }) => {
    const result = generateRandomNumbers(min, max, count || 1);

    if (result.isError) {
      return {
        content: [{ type: "text", text: result.errorMessage! }],
        isError: true,
      };
    }

    const n = result.numbers.length;
    const text = n === 1
      ? `Random number (${min}~${max}): ${result.numbers[0]}`
      : `${n} random numbers (${min}~${max}): ${result.numbers.join(", ")}`;

    return { content: [{ type: "text", text }] };
  }
);

// Tool 4: String Reverser
server.tool(
  "reverse_string",
  "Reverses the input string.",
  { text: z.string().min(1).describe("String to reverse") },
  async ({ text }) => {
    const result = reverseString(text);
    return {
      content: [{
        type: "text",
        text: `Original: ${result.original}\nReversed: ${result.reversed}`,
      }],
    };
  }
);

// Tool 5: Server Info
server.tool(
  "get_server_info",
  "Returns MCP Server info and available Tool list.",
  {},
  async () => {
    const info = getServerInfo();
    const text = `=== ${info.name} ===\nVersion: ${info.version}\n\nAvailable Tools:\n${info.tools.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
    return { content: [{ type: "text", text }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("my-first-mcp server started.");
}

main().catch((error) => {
  console.error("Server start failed:", error);
  process.exit(1);
});
```

---

## Writing Unit Testing with TDD

In AI Development, TDD (Test-Driven Development) is a core methodology that ensures quality of MCP Server Tool Implementation through systematic Unit Testing.

### TDD Principles for Unit Testing

Write Unit Testing following the **Red → Green → Refactor** cycle:
1. Write failing Unit Testing case (Red)
2. Write minimal code to pass Unit Testing (Green)
3. Improve code while maintaining Unit Testing coverage (Refactor)

**Tidy First** principle for Unit Testing:
- Separate structural changes from behavioral changes
- Verify with Unit Testing after structural changes

### vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

### Test Code: tools.test.ts

```typescript
// src/tools.test.ts
import { describe, it, expect } from "vitest";
import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
} from "./tools.js";

describe("formatTime", () => {
  it("formats with default timezone (Asia/Seoul)", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate);

    expect(result.timezone).toBe("Asia/Seoul");
    expect(result.formatted).toContain("2025");
  });

  it("supports custom timezone", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "America/New_York");

    expect(result.timezone).toBe("America/New_York");
  });
});

describe("calculate", () => {
  it("performs addition", () => {
    const result = calculate(123, 456, "add");

    expect(result.result).toBe(579);
    expect(result.expression).toBe("123 + 456 = 579");
    expect(result.isError).toBe(false);
  });

  it("handles division by zero error", () => {
    const result = calculate(100, 0, "divide");

    expect(result.isError).toBe(true);
    expect(result.errorMessage).toBe("Error: Cannot divide by zero.");
  });

  it("performs multiplication", () => {
    const result = calculate(15, 8, "multiply");

    expect(result.result).toBe(120);
    expect(result.expression).toBe("15 × 8 = 120");
  });
});

describe("generateRandomNumbers", () => {
  it("generates random number within range", () => {
    const result = generateRandomNumbers(1, 10);

    expect(result.numbers).toHaveLength(1);
    expect(result.numbers[0]).toBeGreaterThanOrEqual(1);
    expect(result.numbers[0]).toBeLessThanOrEqual(10);
  });

  it("generates multiple random numbers (lottery)", () => {
    const result = generateRandomNumbers(1, 45, 6);

    expect(result.numbers).toHaveLength(6);
    result.numbers.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(45);
    });
  });

  it("handles min > max error", () => {
    const result = generateRandomNumbers(100, 10);

    expect(result.isError).toBe(true);
    expect(result.errorMessage).toContain("Minimum is greater than maximum");
  });
});

describe("reverseString", () => {
  it("reverses English string", () => {
    const result = reverseString("hello");
    expect(result.reversed).toBe("olleh");
  });

  it("reverses string with special characters", () => {
    const result = reverseString("Hello MCP!");
    expect(result.reversed).toBe("!PCM olleH");
  });
});

describe("getServerInfo", () => {
  it("returns server name and version", () => {
    const info = getServerInfo();

    expect(info.name).toBe("my-first-mcp");
    expect(info.version).toBe("1.0.0");
  });

  it("includes 5 Tool list", () => {
    const info = getServerInfo();

    expect(info.tools).toHaveLength(5);
    expect(info.tools.some(t => t.includes("calculate"))).toBe(true);
  });
});
```

### Running Unit Testing

```bash
# Run Unit Testing
npm test

# Result
# ✓ src/tools.test.ts (31 tests) 18ms
# Test Files  1 passed (1)
# Tests       31 passed (31)
```

31 Unit Testing cases written with TDD validate all Tool Implementation. Such comprehensive Unit Testing ensures MCP Server stability in AI Development. TDD and Unit Testing are essential practices for any serious AI Development project.

---

## Testing MCP Server with MCP Inspector

MCP Inspector is the official AI Tools for testing MCP Server Tool Implementation. After completing Unit Testing with TDD, you should verify your MCP Server works correctly.

### Running Inspector

In AI Development and TDD process, MCP Inspector is an essential AI Tools. Test with Inspector before connecting to AI Tools like Claude Code. This complements your Unit Testing workflow.

```bash
# Build
npm run build

# Run Inspector
npm run inspect
# or
npx @modelcontextprotocol/inspector dist/index.js
```

Access `http://localhost:6274` in your browser to open MCP Inspector UI.

![MCP Inspector UI](./images/mcp-day1/mcp-inspector-ui.jpg)

### Testing in Inspector

1. **Check Tool list**: Verify 5 registered Tools
2. **Call Tool**: Calculate `123 + 456` with calculate Tool
3. **Check response**: Verify `123 + 456 = 579` result

![MCP Inspector Tool List](./images/mcp-day1/mcp-inspector-tools-list.jpg)

---

## Connecting to Claude Code AI Tools

### MCP Server Registration

After completing TDD unit tests and Inspector testing, you're ready to connect to Claude Code AI tools.

```bash
# Add MCP Server to Claude Code AI tools
claude mcp add my-first-mcp -- node /path/to/my-first-mcp/dist/index.js

# Check connection status
claude mcp list
# my-first-mcp: ✓ Connected
```

### Project-level Auto Connection (.mcp.json)

Adding `.mcp.json` file to your project enables Claude Code to auto-detect MCP Server:

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {}
    }
  }
}
```

Auto-detection dialog appears when entering the project directory:

![MCP Auto Detection](./images/mcp-day1/mcp-auto-detection-dialog.jpg)

### Real Usage Example

You can use MCP Tool in Claude Code:

![Claude Code Calculate Demo](./images/mcp-day1/claude-code-calculate-demo.jpg)

```
User: "Calculate 123 plus 456"
Claude: [calculate Tool call: a=123, b=456, operation="add"]
       123 + 456 = 579
```

---

## Summary

### What We Learned

1. **Model Context Protocol concept**: Standard protocol for AI Tools to access external data
2. **Architecture**: Host → Client → MCP Server structure, JSON-RPC 2.0 communication
3. **3 Features**: Tool Implementation (functions), Resources (data), Prompts (templates)
4. **MCP Server implementation**: TypeScript + @modelcontextprotocol/sdk + zod
5. **TDD and Unit Testing**: Pure function separation → Unit Testing → Refactoring

Model Context Protocol is becoming essential technology in AI Development. Use the MCP Server and Tool Implementation methods with TDD and Unit Testing practices learned in this AI Development guide to create various AI Tools.

### Project Structure

```
my-first-mcp/
├── src/
│   ├── index.ts      # MCP Server (Handler)
│   ├── tools.ts      # Tool implementation logic (Pure Functions)
│   └── tools.test.ts # Unit tests (31 tests)
├── dist/
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Key Commands

```bash
npm run build     # TypeScript build
npm test          # Run unit tests (31 tests)
npm run inspect   # Test Tool implementation with MCP Inspector
claude mcp add    # Register MCP Server to Claude Code AI tools
```

---

## Next Episode Preview

**Day 2: Production MCP Server - Project Analysis AI Tools**

- Tool implementation for file system access
- Providing project settings with Resource
- Using Prompt templates
- Automating actual project analysis

Stay tuned for the next post on AI development and Model Context Protocol!

---

## References

### Official Documentation
- [MCP Official Spec](https://modelcontextprotocol.io/specification)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Example Servers](https://github.com/anthropics/mcp-servers)

### Tools
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

*This is the first post in the MCP Server development series. Feel free to leave questions or feedback in the comments!*
