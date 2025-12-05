---
title: "MCP Server Development (3/5): Building a Practical Project Analyzer Tool"
slug: "mcp-day3-practical-project-analyzer-en"
excerpt: "Build practical project analysis tools with MCP Server. Learn filesystem access, directory structure analysis, and code statistics implementation in TypeScript. A hands-on MCP development tutorial for Claude Code integration."
date: "2025-12-02"
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
  - Project Analysis
  - File System
  - AI Development
  - MCP Development
  - AI Tools
featured_image: ""
status: "publish"
language: "en"
seo_title: "MCP Project Analyzer Tool: Building File System Tools with TypeScript"
seo_description: "Build project analysis tools with MCP Server. Learn filesystem access, directory structure analysis, and code statistics Tool implementation."
---

> **Translation**: This article was translated from [Korean](/mcp-day3-practical-project-analyzer).

## TL;DR

Build practical **project analysis** tools with **MCP (Model Context Protocol)** Server. After learning MCP Server concepts in Day 1 and Resources/Prompts in Day 2, now we implement real-world Tools you can use immediately in AI development.

What you'll learn:
- Hands-on AI development - Building filesystem access Tools with MCP development
- Automating project analysis workflows with MCP Server
- Developing directory structure analysis, dependency analysis, and code statistics Tools in TypeScript
- Using Model Context Protocol-based Tools in Claude Code AI tools
- Essential security considerations for AI development

**Full Code**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - MCP development tutorial with project analysis extension

**Series**: [Day 1: Model Context Protocol Concepts](/mcp-day1-introduction-and-first-server-en) | [Day 2: Resources and Prompts](/mcp-day2-resource-and-prompt-en) | **Day 3: Practical Project Analysis** | Day 4: npm Publishing (Coming Soon)

---

## Why Project Analysis MCP Server?

### The Importance of Context in AI Development

When developing with AI tools like Claude Code, **context** is everything. The AI needs to understand your project structure, what dependencies you're using, and how large your codebase is to provide more accurate assistance.

Building a project analysis tool with MCP Server:

```
┌─────────────────────────────────────────────────────────────┐
│                Project Analysis MCP Server                   │
├─────────────────────────────────────────────────────────────┤
│  Tool 1: analyze_structure                                   │
│  → Analyzes directory structure in tree format               │
│                                                              │
│  Tool 2: analyze_dependencies                                │
│  → Analyzes package.json dependencies                        │
│                                                              │
│  Tool 3: count_lines                                         │
│  → Code line statistics                                      │
├─────────────────────────────────────────────────────────────┤
│  Claude Code provides more accurate analysis with this info  │
└─────────────────────────────────────────────────────────────┘
```

With Model Context Protocol, AI tools can safely access the filesystem. MCP development enables automation of AI development workflows.

---

## Project Extension Setup

### Extending the Existing my-first-mcp Project

We'll add project analysis features to the MCP Server created in Day 1. We maintain the existing TypeScript project structure while adding new Tools that integrate with Claude Code AI tools. The key to Model Context Protocol-based AI development is extensible design.

```bash
# Navigate to existing project
cd my-first-mcp

# Add filesystem-related dependency
npm install glob

# Add type definitions
npm install -D @types/node
```

### Extended File Structure

Modularizing code is best practice in MCP development:

```
my-first-mcp/
├── src/
│   ├── index.ts              # Main server
│   ├── tools/
│   │   ├── time.ts           # Time-related Tool
│   │   ├── calculator.ts     # Calculator Tool
│   │   └── project-analyzer.ts  # Project Analysis Tool (new)
│   └── utils/
│       └── file-system.ts    # Filesystem utilities
├── package.json
└── tsconfig.json
```

---

## Tool 1: Project Structure Analysis

### Implementing the analyze_structure Tool

This is the first project analysis Tool for our MCP Server. It analyzes directory structure in tree format, enabling AI tools to understand the overall project structure.

```typescript
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Project structure analysis Tool - Core MCP development feature
server.tool(
  "analyze_structure",
  "Analyzes project directory structure",
  {
    targetPath: z.string().describe("Directory path to analyze"),
    maxDepth: z.number().optional().default(3).describe("Maximum traversal depth"),
    includeHidden: z.boolean().optional().default(false).describe("Include hidden files"),
  },
  async ({ targetPath, maxDepth, includeHidden }) => {
    // Path security validation - Required for filesystem access
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [{ type: "text", text: `Error: Path not found - ${resolvedPath}` }],
        isError: true,
      };
    }

    const structure = buildDirectoryTree(resolvedPath, maxDepth, includeHidden);

    return {
      content: [{
        type: "text",
        text: `## Project Structure Analysis\n\nPath: ${resolvedPath}\n\n\`\`\`\n${structure}\n\`\`\``,
      }],
    };
  }
);
```

### Directory Tree Generation Function

A utility function that traverses the filesystem and generates a tree structure. This is a common pattern in MCP development.

```typescript
// Filesystem tree generation - Essential for project analysis in AI development
function buildDirectoryTree(
  dirPath: string,
  maxDepth: number,
  includeHidden: boolean,
  currentDepth: number = 0,
  prefix: string = ""
): string {
  if (currentDepth >= maxDepth) {
    return prefix + "...\n";
  }

  let result = "";
  const items = fs.readdirSync(dirPath);

  // Filter hidden files
  const filteredItems = includeHidden
    ? items
    : items.filter(item => !item.startsWith("."));

  // Exclude node_modules, dist, etc. (MCP Server performance optimization)
  const excludeDirs = ["node_modules", "dist", ".git", "coverage"];
  const finalItems = filteredItems.filter(item => !excludeDirs.includes(item));

  finalItems.forEach((item, index) => {
    const itemPath = path.join(dirPath, item);
    const isLast = index === finalItems.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      result += prefix + connector + item + "/\n";
      result += buildDirectoryTree(itemPath, maxDepth, includeHidden, currentDepth + 1, newPrefix);
    } else {
      result += prefix + connector + item + "\n";
    }
  });

  return result;
}
```

### Usage Example

Result of calling the MCP Server's project analysis Tool from Claude Code AI tool:

```
User: "Analyze this project structure"

Claude Code: Calling analyze_structure Tool
→ Path: /Users/dev/my-project

## Project Structure Analysis

Path: /Users/dev/my-project

├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── index.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Tool 2: Dependency Analysis

### Implementing the analyze_dependencies Tool

This Tool analyzes package.json to provide project dependency information. It's useful for MCP Server to understand the technology stack of TypeScript projects.

```typescript
// package.json dependency analysis - Using Model Context Protocol
server.tool(
  "analyze_dependencies",
  "Analyzes package.json dependencies",
  {
    targetPath: z.string().describe("Directory path containing package.json"),
    includeDevDeps: z.boolean().optional().default(true).describe("Include devDependencies"),
  },
  async ({ targetPath, includeDevDeps }) => {
    const packageJsonPath = path.join(path.resolve(targetPath), "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      return {
        content: [{ type: "text", text: `Error: package.json not found - ${packageJsonPath}` }],
        isError: true,
      };
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const result = formatDependencyAnalysis(packageJson, includeDevDeps);

    return {
      content: [{ type: "text", text: result }],
    };
  }
);
```

### Dependency Formatting Function

In MCP development, we format data in a way that AI tools can easily parse:

```typescript
// Dependency analysis result formatting - AI development friendly output
function formatDependencyAnalysis(packageJson: any, includeDevDeps: boolean): string {
  let result = `## Dependency Analysis Results\n\n`;

  // Project basic info
  result += `### Project Info\n`;
  result += `- **Name**: ${packageJson.name || "N/A"}\n`;
  result += `- **Version**: ${packageJson.version || "N/A"}\n`;
  result += `- **Description**: ${packageJson.description || "N/A"}\n\n`;

  // Production dependencies
  const deps = packageJson.dependencies || {};
  const depCount = Object.keys(deps).length;

  result += `### Production Dependencies (${depCount})\n`;
  if (depCount > 0) {
    result += "| Package | Version |\n|---------|----------|\n";
    Object.entries(deps).forEach(([name, version]) => {
      result += `| ${name} | ${version} |\n`;
    });
  } else {
    result += "No production dependencies\n";
  }
  result += "\n";

  // Dev dependencies
  if (includeDevDeps) {
    const devDeps = packageJson.devDependencies || {};
    const devDepCount = Object.keys(devDeps).length;

    result += `### Dev Dependencies (${devDepCount})\n`;
    if (devDepCount > 0) {
      result += "| Package | Version |\n|---------|----------|\n";
      Object.entries(devDeps).forEach(([name, version]) => {
        result += `| ${name} | ${version} |\n`;
      });
    } else {
      result += "No dev dependencies\n";
    }
    result += "\n";
  }

  // Scripts
  const scripts = packageJson.scripts || {};
  const scriptCount = Object.keys(scripts).length;

  result += `### NPM Scripts (${scriptCount})\n`;
  if (scriptCount > 0) {
    Object.entries(scripts).forEach(([name, command]) => {
      result += `- \`npm run ${name}\`: ${command}\n`;
    });
  }

  return result;
}
```

---

## Tool 3: Code Statistics

### Implementing the count_lines Tool

This Tool analyzes code line counts in a project. When MCP Server understands codebase size, AI tools can provide more appropriate analysis.

```typescript
import { glob } from "glob";

// Code line statistics - MCP development project analysis Tool
server.tool(
  "count_lines",
  "Analyzes project code line counts",
  {
    targetPath: z.string().describe("Directory path to analyze"),
    extensions: z.array(z.string()).optional()
      .default(["ts", "tsx", "js", "jsx"])
      .describe("File extensions to analyze"),
  },
  async ({ targetPath, extensions }) => {
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        content: [{ type: "text", text: `Error: Path not found` }],
        isError: true,
      };
    }

    const stats = await analyzeCodeLines(resolvedPath, extensions);

    return {
      content: [{ type: "text", text: formatCodeStats(stats) }],
    };
  }
);
```

### Code Line Analysis Function

Traverses the filesystem to classify code, comments, and blank lines:

```typescript
interface CodeStats {
  totalFiles: number;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  byExtension: Record<string, { files: number; lines: number }>;
}

// Traverse filesystem to collect code statistics - TypeScript implementation
async function analyzeCodeLines(
  dirPath: string,
  extensions: string[]
): Promise<CodeStats> {
  const pattern = `**/*.{${extensions.join(",")}}`;
  const files = await glob(pattern, {
    cwd: dirPath,
    ignore: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  });

  const stats: CodeStats = {
    totalFiles: 0,
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    byExtension: {},
  };

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const ext = path.extname(file).slice(1);
    if (!stats.byExtension[ext]) {
      stats.byExtension[ext] = { files: 0, lines: 0 };
    }

    stats.totalFiles++;
    stats.byExtension[ext].files++;

    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      stats.totalLines++;
      stats.byExtension[ext].lines++;

      if (trimmed === "") {
        stats.blankLines++;
      } else if (inBlockComment) {
        stats.commentLines++;
        if (trimmed.includes("*/")) {
          inBlockComment = false;
        }
      } else if (trimmed.startsWith("/*")) {
        stats.commentLines++;
        if (!trimmed.includes("*/")) {
          inBlockComment = true;
        }
      } else if (trimmed.startsWith("//")) {
        stats.commentLines++;
      } else {
        stats.codeLines++;
      }
    }
  }

  return stats;
}

// Code statistics formatting - AI development friendly output
function formatCodeStats(stats: CodeStats): string {
  let result = `## Code Statistics Analysis\n\n`;

  result += `### Summary\n`;
  result += `- **Total Files**: ${stats.totalFiles}\n`;
  result += `- **Total Lines**: ${stats.totalLines.toLocaleString()}\n`;
  result += `- **Code Lines**: ${stats.codeLines.toLocaleString()} (${((stats.codeLines / stats.totalLines) * 100).toFixed(1)}%)\n`;
  result += `- **Comment Lines**: ${stats.commentLines.toLocaleString()} (${((stats.commentLines / stats.totalLines) * 100).toFixed(1)}%)\n`;
  result += `- **Blank Lines**: ${stats.blankLines.toLocaleString()} (${((stats.blankLines / stats.totalLines) * 100).toFixed(1)}%)\n\n`;

  result += `### Statistics by Extension\n`;
  result += "| Extension | Files | Lines |\n|-----------|-------|-------|\n";

  Object.entries(stats.byExtension)
    .sort((a, b) => b[1].lines - a[1].lines)
    .forEach(([ext, data]) => {
      result += `| .${ext} | ${data.files} | ${data.lines.toLocaleString()} |\n`;
    });

  return result;
}
```

---

## Filesystem Security Considerations

### The Importance of Security in MCP Development

Security is crucial when MCP Server accesses the filesystem. These are essential considerations when developing Model Context Protocol-based servers.

```typescript
// Path security validation utility - MCP Server security essential
function validatePath(inputPath: string, allowedBase?: string): string {
  // Path normalization
  const resolved = path.resolve(inputPath);

  // Prevent path traversal (Block Path Traversal attacks)
  if (allowedBase) {
    const normalizedBase = path.resolve(allowedBase);
    if (!resolved.startsWith(normalizedBase)) {
      throw new Error(`Security error: Path is outside allowed scope`);
    }
  }

  // Check symbolic links
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) {
    const realPath = fs.realpathSync(resolved);
    if (allowedBase && !realPath.startsWith(path.resolve(allowedBase))) {
      throw new Error(`Security error: Symbolic link points outside allowed scope`);
    }
  }

  return resolved;
}
```

### Sensitive File Filtering

Filter files that should not be exposed to AI tools:

```typescript
// Sensitive file patterns - MCP development security settings
const SENSITIVE_PATTERNS = [
  /\.env$/,           // Environment variables
  /\.env\..+$/,       // .env.local, .env.production, etc.
  /credentials/i,     // Credentials
  /secrets?/i,        // Secret files
  /\.pem$/,           // Certificates
  /\.key$/,           // Key files
  /password/i,        // Password-related
];

function isSensitiveFile(filename: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(filename));
}

// Exclude sensitive files when accessing filesystem
function filterSensitiveFiles(files: string[]): string[] {
  return files.filter(file => !isSensitiveFile(file));
}
```

---

## Integration Testing

### Testing with MCP Inspector

Test the project analysis Tools with MCP Inspector:

```bash
# Build
npm run build

# Run Inspector
npm run inspect
# Open http://localhost:6274 in browser
```

### Test Scenarios

```
1. Click Tools tab
2. Select analyze_structure
   - targetPath: "." (current directory)
   - maxDepth: 3
   - includeHidden: false
3. Click Run Tool
4. Verify directory tree result

5. Select analyze_dependencies
   - targetPath: "."
   - includeDevDeps: true
6. Click Run Tool
7. Verify dependency list

8. Select count_lines
   - targetPath: "."
   - extensions: ["ts", "js"]
9. Click Run Tool
10. Verify code statistics
```

### Using with Claude Code

After connecting the MCP Server to Claude Code AI tool:

```
User: "Analyze this project"

Claude Code:
1. analyze_structure to understand overall structure
2. analyze_dependencies to check technology stack
3. count_lines to analyze codebase size

→ Provides comprehensive project analysis report
```

---

## Full Code Integration

### src/tools/project-analyzer.ts

Complete code for Model Context Protocol-based project analysis Tools:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Project analysis Tool registration function - MCP development modularization
export function registerProjectAnalyzerTools(server: McpServer) {
  // Tool 1: Structure analysis
  server.tool(
    "analyze_structure",
    "Analyzes project directory structure",
    {
      targetPath: z.string().describe("Directory path to analyze"),
      maxDepth: z.number().optional().default(3),
      includeHidden: z.boolean().optional().default(false),
    },
    async ({ targetPath, maxDepth, includeHidden }) => {
      const resolved = path.resolve(targetPath);
      if (!fs.existsSync(resolved)) {
        return { content: [{ type: "text", text: "Path not found" }], isError: true };
      }
      const tree = buildDirectoryTree(resolved, maxDepth!, includeHidden!);
      return { content: [{ type: "text", text: `## Project Structure\n\n\`\`\`\n${tree}\`\`\`` }] };
    }
  );

  // Tool 2: Dependency analysis
  server.tool(
    "analyze_dependencies",
    "Analyzes package.json dependencies",
    {
      targetPath: z.string().describe("Path containing package.json"),
      includeDevDeps: z.boolean().optional().default(true),
    },
    async ({ targetPath, includeDevDeps }) => {
      const pkgPath = path.join(path.resolve(targetPath), "package.json");
      if (!fs.existsSync(pkgPath)) {
        return { content: [{ type: "text", text: "package.json not found" }], isError: true };
      }
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      return { content: [{ type: "text", text: formatDependencyAnalysis(pkg, includeDevDeps!) }] };
    }
  );

  // Tool 3: Code statistics
  server.tool(
    "count_lines",
    "Analyzes code line counts",
    {
      targetPath: z.string().describe("Directory to analyze"),
      extensions: z.array(z.string()).optional().default(["ts", "tsx", "js", "jsx"]),
    },
    async ({ targetPath, extensions }) => {
      const resolved = path.resolve(targetPath);
      if (!fs.existsSync(resolved)) {
        return { content: [{ type: "text", text: "Path not found" }], isError: true };
      }
      const stats = await analyzeCodeLines(resolved, extensions!);
      return { content: [{ type: "text", text: formatCodeStats(stats) }] };
    }
  );
}

// ... Helper functions (defined above)
```

### src/index.ts Update

Register project analysis Tools in the MCP Server main file:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProjectAnalyzerTools } from "./tools/project-analyzer.js";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

// Existing Tools (from Day 1)
// ...

// Register Project Analysis Tools (Day 3)
registerProjectAnalyzerTools(server);

// Resources and Prompts (from Day 2)
// ...

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
console.error("MCP Server started!");
```

---

## Summary

Key MCP development concepts learned in Day 3:

1. **Practical Project Analysis Tool Implementation**
   - `analyze_structure`: Provides context to AI tools through directory structure analysis
   - `analyze_dependencies`: Understands technology stack through package.json analysis
   - `count_lines`: Analyzes project size through code statistics

2. **Filesystem Access Patterns**
   - TypeScript-based file handling with Node.js fs module
   - Efficient file traversal with glob pattern matching
   - MCP Server performance optimization (excluding unnecessary directories)

3. **Security Considerations**
   - Path traversal prevention (blocking Path Traversal attacks)
   - Sensitive file filtering
   - Safe filesystem access based on Model Context Protocol

### Core MCP Development Pattern

```typescript
// Filesystem Tool pattern - Model Context Protocol
server.tool(
  "tool_name",
  "description",
  { targetPath: z.string(), ...options },
  async ({ targetPath, ...options }) => {
    // 1. Path validation
    const resolved = path.resolve(targetPath);
    // 2. Filesystem access
    // 3. Result formatting
    return { content: [{ type: "text", text: result }] };
  }
);
```

---

## Next Episode Preview

**Day 4: Publishing MCP Server to npm**

In Day 4, we'll share our MCP development results with the world:

- npm package structuring and publishing setup
- TypeScript build optimization
- README.md writing guide
- Creating an MCP Server that runs directly with npx
- User installation and configuration guide

---

## References

### Official Documentation
- [MCP Official Spec - Server](https://modelcontextprotocol.io/specification/2025-06-18/server)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Node.js fs Module](https://nodejs.org/api/fs.html)

### Series Links
- [Day 1: Model Context Protocol Concepts and First Server](/mcp-day1-introduction-and-first-server-en)
- [Day 2: Resources and Prompts Implementation](/mcp-day2-resource-and-prompt-en)
- Day 4: npm Publishing (Coming Soon)
- Day 5: Advanced Patterns (Coming Soon)
