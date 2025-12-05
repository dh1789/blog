---
title: "MCP Server Day 4: npm Package Publishing Complete Guide"
slug: "mcp-day4-npm-package-deployment"
excerpt: "Complete guide to npm package publishing for MCP servers. From package.json to npm publish, learn every step of package publishing for Claude Code integration."
status: "publish"
categories:
  - "MCP"
  - "Development"
tags:
  - "MCP Server"
  - "npm Package"
  - "npm Publish"
  - "TypeScript"
  - "npm Deployment"
  - "Claude Code"
  - "Package Publishing"
language: "en"
---

## TL;DR

**Package publishing** for MCP servers is easier than you think:
- **npm package publishing** enables instant execution with `npx my-mcp-server`
- **3 steps**: package.json setup → npm publish → README documentation
- Your **MCP package** can now be shared with developers worldwide through **package publishing**

What you'll learn:
- **npm package structure**: bin, main, files configuration for **package publishing**
- **MCP server deployment**: Complete npm publish process
- **User guide creation**: Claude Code connection instructions

---

## npm Package Structure

To complete **package publishing** for an MCP server, you need to properly configure package.json. The first step in successful **package publishing** is organizing the package structure.

### Recommended Directory Structure

Here's the recommended structure for **MCP package** deployment:

```
my-first-mcp/
├── dist/                    # Build output (deployment target)
│   └── index.js             # Bundled executable
├── src/                     # Source code (development only)
│   ├── index.ts             # Entry point
│   ├── tools.ts             # Tool logic
│   └── tools.test.ts        # Tests
├── package.json             # Package configuration (critical!)
├── tsconfig.json            # TypeScript configuration
├── README.md                # User guide
├── LICENSE                  # License file
└── CHANGELOG.md             # Change history
```

For **npm deployment**, only `dist/`, `README.md`, `LICENSE`, and `package.json` are included.

### bin Configuration: CLI Executable

Configure the `bin` field to make your **MCP server** executable from the command line:

```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "bin": {
    "my-first-mcp": "dist/index.js"
  }
}
```

With this configuration, after **MCP server installation**, you can run it like this:

```bash
# After global installation
npm install -g my-first-mcp
my-first-mcp  # Direct execution

# Instant execution with npx (no installation needed)
npx my-first-mcp
```

**Important**: Add a shebang at the top of dist/index.js:

```javascript
#!/usr/bin/env node
// Top of dist/index.js
```

In TypeScript, add it to src/index.ts:

```typescript
#!/usr/bin/env node
/**
 * MCP Server entry point
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// ...
```

### files Field: Specifying Deployment Files

Explicitly specify which files to include in **npm deployment**:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

**Benefits of the files field**:
- Automatically excludes unnecessary files (src/, test/, node_modules/)
- Minimizes **npm package** size
- Prevents accidental exposure of sensitive files

---

## Complete package.json

Here's a complete package.json example for **MCP server deployment**:

```json
{
  "name": "my-first-mcp",
  "version": "1.0.0",
  "description": "MCP Server Tutorial - Project Analysis Tool",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "my-first-mcp": "dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "claude",
    "claude-code",
    "ai-tools",
    "typescript"
  ],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/my-first-mcp.git"
  },
  "homepage": "https://github.com/username/my-first-mcp#readme",
  "bugs": {
    "url": "https://github.com/username/my-first-mcp/issues"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

### Key Field Descriptions

| Field | Purpose | MCP Server Deployment Tips |
|-------|---------|---------------------------|
| `name` | Package name | Must be unique on npm |
| `version` | Version | Follow semver |
| `description` | Description | Summarize **MCP server** features |
| `bin` | CLI executable | Required for **Claude Code** connection |
| `files` | Deployment files | Include only dist recommended |
| `keywords` | Search keywords | Include mcp, claude |
| `engines` | Node.js version | 20+ recommended |

### prepublishOnly Script

Automatically builds before **npm publish**:

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test"
  }
}
```

This ensures the latest build and tests run before every **npm deployment**.

---

## Build Configuration

### tsc vs tsup

There are two main options for building **TypeScript packages**:

**tsc (TypeScript Compiler)**:
- Pros: Simple configuration, no additional dependencies
- Cons: Slower build, no bundling support

**tsup (esbuild-based)**:
- Pros: Very fast, bundling support, tree shaking
- Cons: Additional dependency required

For MCP servers with simple structures, **tsc** is sufficient:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### Build Verification

Verify the build output before **npm deployment**:

```bash
# Build
npm run build

# Check results
ls -la dist/
# index.js
# index.d.ts (type definitions)

# Local test
node dist/index.js
```

---

## npm Publishing

### 1. Prepare npm Account

You need an account for **npm deployment**:

```bash
# Create account (also available on website)
npm adduser

# Verify login
npm whoami
```

### 2. Check Package Name

Verify that your **npm package** name is available:

```bash
# Search for name
npm search my-first-mcp

# Or direct lookup
npm view my-first-mcp
# 404 error means it's available
```

### 3. Pre-deployment Testing

Test locally before **npm deployment**:

```bash
# Package pack (deployment simulation)
npm pack

# Check results
tar -tzf my-first-mcp-1.0.0.tgz
# package/dist/index.js
# package/README.md
# package/LICENSE
# package/package.json

# Cleanup
rm my-first-mcp-1.0.0.tgz
```

### 4. Run npm publish

Finally, deploy with **npm publish**:

```bash
# Deploy
npm publish

# Success message
# + my-first-mcp@1.0.0
```

**For public package publishing**:

```bash
npm publish --access public
```

### 5. Verify Deployment

Confirm your **MCP package** was deployed successfully:

```bash
# Check on npm
npm view my-first-mcp

# Test installation
npx my-first-mcp
```

---

## Version Management

**npm package** versions follow Semantic Versioning:

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes
  │     └──────── New features (backward compatible)
  └────────────── Breaking changes
```

### Version Updates

```bash
# Patch update (1.0.0 → 1.0.1)
npm version patch

# Minor update (1.0.1 → 1.1.0)
npm version minor

# Major update (1.1.0 → 2.0.0)
npm version major

# Deploy
npm publish
```

### CHANGELOG.md

Document change history for **MCP server deployment**:

```markdown
# Changelog

## [1.1.0] - 2024-12-03

### Added
- New Tool: analyze_structure
- Resource support added

### Fixed
- Timezone calculation bug fixed

## [1.0.0] - 2024-12-01

### Added
- Initial release
- get_current_time, calculate Tool implementation
```

---

## README.md Creation

README.md is the face of your **npm package**. Clear **MCP server installation** instructions are essential.

### Required README Sections

```markdown
# my-first-mcp

MCP (Model Context Protocol) Server - Project Analysis Tool

## Installation

### Instant execution with npx

​```bash
npx my-first-mcp
​```

### Global installation

​```bash
npm install -g my-first-mcp
my-first-mcp
​```

## Claude Code Connection

### Method 1: claude mcp add command

​```bash
claude mcp add my-first-mcp -- npx my-first-mcp
​```

### Method 2: Direct configuration file edit

~/.claude/claude_desktop_config.json:

​```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
​```

## Features

### Tools

| Tool | Description |
|------|-------------|
| `get_current_time` | Get current time |
| `calculate` | Basic arithmetic calculator |
| `analyze_structure` | Analyze project structure |

### Resources

| URI | Description |
|-----|-------------|
| `project://config` | Project configuration info |

## License

MIT
```

### Adding Badges

Adding badges at the top of README increases credibility:

```markdown
[![npm version](https://badge.fury.io/js/my-first-mcp.svg)](https://www.npmjs.com/package/my-first-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
```

---

## User Guide

Provide detailed instructions for connecting to **Claude Code** after **MCP server installation**.

### Claude Code Connection (Recommended)

The easiest connection method in **Claude Code**:

```bash
# Add MCP server
claude mcp add my-first-mcp -- npx my-first-mcp

# Verify registration
claude mcp list

# Result
# my-first-mcp: npx my-first-mcp
```

### Claude Desktop Connection

To use with the Claude Desktop app, edit the configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
```

### Project-specific Configuration (.mcp.json)

Creating a `.mcp.json` file in your project root enables the **MCP server** only for that project:

```json
{
  "mcpServers": {
    "my-first-mcp": {
      "command": "npx",
      "args": ["my-first-mcp"]
    }
  }
}
```

When **Claude Code** opens the project folder, it automatically detects the **MCP package** and suggests connection.

### Connection Test

Test in Claude after **MCP server installation** is complete:

```
User: "What time is it?"
Claude: [Calls get_current_time Tool]
        "The current time is Tuesday, December 3, 2024, 3:30 PM."

User: "Calculate 123 + 456"
Claude: [Calls calculate Tool]
        "123 + 456 = 579."
```

---

## Deployment Checklist

Checklist before **npm deployment**:

### Required Items

- [ ] Set name, version, description in package.json
- [ ] Configure executable file path in bin field
- [ ] Limit deployment files with files field
- [ ] Add shebang (`#!/usr/bin/env node`)
- [ ] Complete README.md
- [ ] Include LICENSE file
- [ ] Pass npm test
- [ ] Verify deployment files with npm pack

### Recommended Items

- [ ] Set repository, homepage URLs
- [ ] Include mcp, claude in keywords
- [ ] Specify Node.js version with engines field
- [ ] Write CHANGELOG.md
- [ ] Include TypeScript type definitions (types field)

---

## Summary

Key takeaways for successful **package publishing**:

1. **package.json configuration**: Structure your **npm package** with bin, files, keywords for **package publishing**
2. **npm publish**: Simple 3-step **package publishing** process
3. **User guide**: Clear **Claude Code** connection instructions

Your **MCP package** is now deployed to npm through **package publishing**, ready for developers worldwide to use with `npx`!

## Next Episode Preview

In **Day 5: Advanced Patterns and Optimization**:
- External API integration (GitHub API)
- Caching strategies
- Security considerations
- Production checklist

---

## Series Navigation

- [Day 1: What is MCP? Concepts and First Server](/en/mcp-day1-introduction-and-first-server)
- [Day 2: Mastering Resources and Prompts](/en/mcp-day2-resource-and-prompt)
- [Day 3: Practical Project - Project Analyzer MCP Server](/en/mcp-day3-practical-project-analyzer)
- **Day 4: Publishing to npm** (Current)
- Day 5: Advanced Patterns and Optimization (Coming Soon)
