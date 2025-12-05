---
title: "MCP Server Day 5: Advanced Patterns and Optimization for Production"
slug: "mcp-day5-advanced-patterns-optimization"
excerpt: "Master MCP advanced patterns for production-level servers. Learn GitHub API integration, caching strategies, security best practices, and optimization techniques for Claude Code."
status: "publish"
categories:
  - "MCP"
  - "Development"
tags:
  - "MCP Server"
  - "MCP Advanced Patterns"
  - "GitHub API"
  - "Caching"
  - "Security"
  - "Claude Code"
  - "TypeScript"
language: "en"
---

## TL;DR

Taking your **MCP server** to production requires **MCP advanced patterns**:
- **External API integration**: Connect to services like GitHub API
- **Caching strategies**: In-memory caching for performance optimization
- **Security considerations**: Input validation and path traversal prevention

What you'll learn about **MCP advanced patterns**:
- **GitHub API integration**: Token management and rate limiting for **Claude Code**
- **MCP server caching**: TTL-based cache for faster **Claude Code** responses
- **Security hardening**: Production-level input validation for safe **MCP advanced patterns**

**Complete code**: [my-first-mcp](https://github.com/dh1789/my-first-mcp) - Full source code for this MCP server series

---

## External API Integration

The true power of an **MCP server** comes from integrating external APIs. Let's explore **MCP advanced patterns** using **GitHub API** integration. This is a core **MCP advanced patterns** technique for leveraging external data in **Claude Code**.

### GitHub API Tool Implementation

Here's a Tool that queries repository information using **GitHub API**:

```typescript
import { z } from "zod";

// GitHub repository info Tool
server.tool(
  "get_repo_info",
  "Get GitHub repository information",
  {
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
  },
  async ({ owner, repo }) => {
    const token = process.env.GITHUB_TOKEN;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: token ? `token ${token}` : "",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MCP-Server",
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
          updated_at: data.updated_at,
        }, null, 2),
      }],
    };
  }
);
```

### Environment Variable Management

For **security** best practices, manage sensitive information in your **MCP server** using environment variables:

```typescript
// Environment variable validation
function validateEnv(): void {
  const requiredVars = ["GITHUB_TOKEN"];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(", ")}`);
    console.warn("Some features may be limited.");
  }
}

// Validate on server start
validateEnv();
```

Setting environment variables in **Claude Code**:

```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

### Rate Limiting Handling

**GitHub API** limits requests per hour. Here's how to handle this in your **MCP server**:

```typescript
// Rate limit state tracking
let rateLimitRemaining = 60;
let rateLimitReset = 0;

async function fetchWithRateLimit(url: string, options: RequestInit) {
  // Wait if rate limit reached
  if (rateLimitRemaining <= 1) {
    const waitTime = rateLimitReset - Date.now();
    if (waitTime > 0) {
      throw new Error(
        `API request limit reached. Retry in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }
  }

  const response = await fetch(url, options);

  // Update rate limit headers
  rateLimitRemaining = parseInt(
    response.headers.get("X-RateLimit-Remaining") || "60"
  );
  rateLimitReset = parseInt(
    response.headers.get("X-RateLimit-Reset") || "0"
  ) * 1000;

  return response;
}
```

---

## Caching Strategies

Implementing **caching** significantly improves **MCP server** performance. This is one of the essential **MCP advanced patterns** for production. Reduce repeated API calls and speed up **Claude Code** responses.

### In-Memory Cache Implementation

A simple yet effective TTL-based **caching** class:

```typescript
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTTL = ttlSeconds * 1000;
  }

  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }
}

// Global cache instance
const repoCache = new Cache<any>(600); // 10-minute TTL
```

### Cache-Enabled Tool

**GitHub API** Tool with **caching** applied:

```typescript
server.tool(
  "get_repo_info_cached",
  "Get GitHub repository information (with caching)",
  {
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    noCache: z.boolean().optional().describe("Bypass cache"),
  },
  async ({ owner, repo, noCache }) => {
    const cacheKey = `repo:${owner}/${repo}`;

    // Check cache
    if (!noCache) {
      const cached = repoCache.get(cacheKey);
      if (cached) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ ...cached, _cached: true }, null, 2),
          }],
        };
      }
    }

    // API call
    const response = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: getGitHubHeaders() }
    );

    const data = await response.json();
    const result = {
      name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
    };

    // Save to cache
    repoCache.set(cacheKey, result);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ ...result, _cached: false }, null, 2),
      }],
    };
  }
);
```

### Cache Management Tool

A Tool to manage **MCP server** **caching** state:

```typescript
server.tool(
  "clear_cache",
  "Clear MCP server cache",
  {},
  async () => {
    repoCache.clear();
    return {
      content: [{
        type: "text",
        text: "Cache has been cleared.",
      }],
    };
  }
);
```

---

## Security Considerations

**Security** is paramount for production **MCP servers**. Just like **GitHub API** integration requires token management, **Claude Code** Tool implementations need robust **security** patterns from input validation to path traversal prevention.

### Enhanced Input Validation

Thorough input validation using Zod:

```typescript
// Path validation schema
const safePathSchema = z.string()
  .min(1)
  .max(500)
  .refine(
    (path) => !path.includes(".."),
    "Parent directory references (..) are not allowed"
  )
  .refine(
    (path) => !path.startsWith("/"),
    "Absolute paths are not allowed"
  );

// GitHub username validation
const githubUsernameSchema = z.string()
  .min(1)
  .max(39)
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    "Invalid GitHub username"
  );
```

### Path Traversal Prevention

Path validation for **security** when accessing the file system:

```typescript
import * as path from "path";

function validatePath(basePath: string, targetPath: string): string {
  // Convert to absolute path
  const resolved = path.resolve(basePath, targetPath);

  // Verify within base path
  if (!resolved.startsWith(path.resolve(basePath))) {
    throw new Error("Path traversal attempt detected");
  }

  return resolved;
}

// Usage example
server.tool(
  "read_project_file",
  "Read a project file",
  {
    filePath: safePathSchema.describe("File path to read"),
  },
  async ({ filePath }) => {
    const projectRoot = process.cwd();
    const safePath = validatePath(projectRoot, filePath);

    const content = await fs.readFile(safePath, "utf-8");
    return {
      content: [{ type: "text", text: content }],
    };
  }
);
```

### Sensitive Information Protection

How to filter sensitive information in your **MCP server**:

```typescript
// Define sensitive patterns
const sensitivePatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /token\s*[:=]\s*['"][^'"]+['"]/gi,
];

function sanitizeContent(content: string): string {
  let sanitized = content;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

// Use in Tool
server.tool(
  "read_config",
  "Read configuration file (sensitive data masked)",
  {
    configPath: safePathSchema,
  },
  async ({ configPath }) => {
    const content = await fs.readFile(configPath, "utf-8");
    return {
      content: [{
        type: "text",
        text: sanitizeContent(content),
      }],
    };
  }
);
```

---

## Performance Optimization

Techniques to improve **MCP server** response times.

### Async Parallel Processing

Improve performance by processing multiple tasks simultaneously:

```typescript
server.tool(
  "analyze_repos",
  "Analyze multiple repositories simultaneously",
  {
    repos: z.array(z.string()).max(5).describe("Repository list (owner/repo)"),
  },
  async ({ repos }) => {
    // Parallel processing
    const results = await Promise.all(
      repos.map(async (repo) => {
        const [owner, name] = repo.split("/");
        try {
          const response = await fetchWithRateLimit(
            `https://api.github.com/repos/${owner}/${name}`,
            { headers: getGitHubHeaders() }
          );
          return { repo, success: true, data: await response.json() };
        } catch (error) {
          return { repo, success: false, error: String(error) };
        }
      })
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2),
      }],
    };
  }
);
```

### Response Streaming

Handle large data with streaming:

```typescript
// Process large files in chunks
server.tool(
  "read_large_file",
  "Read a large file",
  {
    filePath: safePathSchema,
    maxLines: z.number().max(1000).default(100),
  },
  async ({ filePath, maxLines }) => {
    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    const lines: string[] = [];
    let lineCount = 0;

    for await (const chunk of fileStream) {
      const chunkLines = chunk.toString().split("\n");
      for (const line of chunkLines) {
        if (lineCount >= maxLines) break;
        lines.push(line);
        lineCount++;
      }
      if (lineCount >= maxLines) break;
    }

    return {
      content: [{
        type: "text",
        text: lines.join("\n"),
      }],
    };
  }
);
```

---

## Debugging and Logging

Debugging tools for quickly resolving **MCP server** issues with **MCP advanced patterns**.

### Logging System

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLogLevel = process.env.LOG_LEVEL
  ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel]
  : LogLevel.INFO;

function log(level: LogLevel, message: string, data?: any): void {
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  const logMessage = `[${timestamp}] [${levelName}] ${message}`;

  if (data) {
    console.error(logMessage, JSON.stringify(data));
  } else {
    console.error(logMessage);
  }
}

// Usage examples
log(LogLevel.INFO, "Server started");
log(LogLevel.DEBUG, "Tool called", { name: "get_repo_info", args: { owner, repo } });
log(LogLevel.ERROR, "API error", { status: response.status });
```

### Using MCP Inspector

Debug your server with **MCP Inspector**:

```bash
# Run MCP Inspector
npx @modelcontextprotocol/inspector dist/index.js

# Access http://localhost:5173 in browser
# - View Tools list
# - Test Tool calls directly
# - Verify response formats
```

### Error Tracking Tool

A Tool to diagnose server status:

```typescript
server.tool(
  "server_status",
  "Check MCP server status",
  {},
  async () => {
    const status = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cacheSize: repoCache.size,
      rateLimitRemaining,
      nodeVersion: process.version,
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(status, null, 2),
      }],
    };
  }
);
```

---

## Production Checklist

Things to verify before deploying your **MCP server** with **MCP advanced patterns** to production. Ensure stable operation with **Claude Code**:

### Required Items

- [ ] Apply Zod schemas to all inputs
- [ ] Implement path traversal prevention validation
- [ ] Separate sensitive information into environment variables
- [ ] No sensitive information exposure in error messages
- [ ] Rate limiting handling
- [ ] Logging system implementation

### Recommended Items

- [ ] Implement in-memory **caching**
- [ ] Performance optimization with parallel processing
- [ ] Implement health check Tool
- [ ] Document **security** considerations in README.md
- [ ] Maintain version control and CHANGELOG.md

### Test Items

- [ ] Normal input tests
- [ ] Abnormal input tests (boundary values, wrong types)
- [ ] Path traversal attempt tests
- [ ] Rate limit reached behavior tests
- [ ] **Caching** behavior tests

---

## Summary

We conclude the MCP server development series with **MCP advanced patterns**. Build a more powerful development environment with **Claude Code**:

| Day | Topic | Key Content |
|-----|-------|-------------|
| Day 1 | MCP Concepts | Architecture and core features |
| Day 2 | Resources and Prompts | Data provision and template usage |
| Day 3 | Practical Project | Project analyzer MCP server |
| Day 4 | npm Deployment | Package structuring and publishing |
| Day 5 | **Advanced Patterns** | API integration, **caching**, **security** |

### Next Steps

To learn more about **MCP server** development:
- Read the [MCP Official Spec](https://modelcontextprotocol.io)
- Analyze [anthropics/mcp-servers](https://github.com/anthropics/mcp-servers)
- Implement your own **MCP server** ideas

Boost your development productivity with **Claude Code** and **MCP servers**!

---

## Series Navigation

- [Day 1: What is MCP? Concepts and First Server](/en/mcp-day1-introduction-and-first-server-en)
- [Day 2: Mastering Resources and Prompts](/en/mcp-day2-resource-and-prompt-en)
- [Day 3: Practical Project - Project Analyzer MCP Server](/en/mcp-day3-practical-project-analyzer-en)
- [Day 4: Publishing to npm](/en/mcp-day4-npm-package-deployment-en)
- **Day 5: Advanced Patterns and Optimization** (Current)
