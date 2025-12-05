---
title: 'Slack Bot Setup Guide (2/5): Socket Mode & Bot Token Config'
slug: remote-claude-day2-slack-bot-setup-en
excerpt: >-
  Master Slack Bot setup with Socket Mode and Bot Token configuration in 10
  minutes. Complete guide covering Event Subscriptions, Interactive Components,
  6 Slash Commands, and troubleshooting connection failures. Perfect for
  remote-claude deployment.
status: publish
categories:
  - 개발
  - AI
  - DevOps
tags:
  - Slack
  - Slack Bot
  - Socket Mode
  - Bot Token
  - Event Subscriptions
  - Interactive Components
language: en
---
> **🌐 Translation**: Translated from [Korean](/ko/remote-claude-day2-slack-bot-setup).

# Complete Guide to Slack Bot Setup (2/5): Socket Mode and Bot Token Configuration

## TL;DR

- **Target Audience**: Those who struggled with Slack Bot setup in Day 1
- **Core Content**: Complete analysis of Slack Bot permissions, Socket Mode, and Bot Token
- **Result**: Perfect Slack Bot setup for remote-claude
- **Time Required**: 10 minutes

---

## 1. Why Is Slack Bot Setup Difficult?

Many people got stuck following the Slack Bot setup instructions in Day 1.

**Common Issues**:
- "I don't understand what a Bot Token is"
- "Why do I need Socket Mode?"
- "Event Subscriptions setup is too complex"
- "How much permission should I grant?"

This post will **explain every Slack Bot setting in detail**.

---

## 2. Slack Bot Permission System: Complete Analysis of Bot Token Scopes

### 2.1 What Is a Bot Token?

A **Bot Token** is an authentication key for the Slack Bot to access your workspace.

```
xoxb-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
```

- Starts with `xoxb-` (Bot Token)
- Used when remote-claude calls the Slack API
- **Never make it public** (don't upload to GitHub)

### 2.2 Essential Bot Token Scopes (8 scopes)

Here's the minimal list of permissions needed for the Slack Bot.

| Scope | Role | Necessity |
|-------|------|-----------|
| `app_mentions:read` | Read @mentions | Detect Slack Bot calls |
| `channels:history` | Read channel messages | Process channel messages |
| `channels:read` | Read channel info | Verify project connections |
| `chat:write` | Send messages | Send Claude Code responses |
| `commands` | Handle Slash Commands | /setup, /run, etc. |
| `files:write` | Upload files | /download command |
| `im:history` | Read DM messages | Handle private messages (optional) |
| `im:write` | Send DMs | Respond to private messages (optional) |

**Principle of Least Privilege**:
- Grant only necessary permissions (security)
- Can add permissions later for new features

### 2.3 How to Issue a Bot Token

```bash
# 1. Go to Slack API website
https://api.slack.com/apps

# 2. Select App → "OAuth & Permissions"

# 3. Add permissions in "Bot Token Scopes" section

# 4. Click "Install to Workspace"

# 5. Copy Bot Token (xoxb-...)
```

**Environment Variable Setup**:
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

---

## 3. Event Subscriptions Setup: The Core of Message Processing

### 3.1 What Are Event Subscriptions?

**Event Subscriptions** is how the Slack Bot receives events from Slack.

**Core Events** (2 events):
1. `message.channels`: When a message is posted in a channel
2. `app_mention`: When the Slack Bot is @mentioned

### 3.2 Why Do We Need Both Events?

**`message.channels`**:
- Receives all messages in the channel
- Essential for remote-claude's "Plain text execution" feature
- Executes Claude Code without commands, just by talking

**`app_mention`**:
- Explicitly call with @remote-claude
- Can invoke Slack Bot during other conversations
- Useful in multi-project environments

### 3.3 Event Subscriptions Configuration

```bash
# 1. Slack API website → "Event Subscriptions"

# 2. Toggle "Enable Events" ON

# 3. Add in "Subscribe to bot events" section:
#    - message.channels
#    - app_mention

# 4. "Save Changes"
```

**Important**: Request URL not needed when using Socket Mode!

---

## 4. Slash Commands Registration: Complete Guide to 6 Commands

### 4.1 remote-claude Slash Commands

| Command | Role | Example |
|---------|------|---------|
| `/setup` | Connect project | `/setup /Users/idongho/proj/blog` |
| `/run` | Execute snippet | `/run test` |
| `/ask` | (Deprecated) Replaced by Plain text | - |
| `/download` | Download file | `/download logs/error.log` |
| `/state` | Check status | `/state` |
| `/cancel` | Cancel task | `/cancel` |

**Note**: Latest version recommends Plain text execution, so `/ask` is not used.

### 4.2 How to Register Slash Commands

```bash
# 1. Slack API website → "Slash Commands"

# 2. Click "Create New Command"

# 3. Enter information for each command:
#    Command: /setup
#    Request URL: (Leave blank when using Socket Mode)
#    Short Description: Connect project directory
#    Usage Hint: /setup [directory]

# 4. Register remaining commands the same way
```

**Socket Mode Advantage**: No need to set Request URL (works without a server)

---

## 5. Interactive Components: Command Shortcut Buttons

### 5.1 What Are Interactive Components?

**Interactive Components** add buttons to Slack messages for quick command execution.

**remote-claude's 3 Shortcut Buttons**:
```
📊 [Check Status]    → Execute /state (check channel status + task queue)
❌ [Cancel Task]     → Execute /cancel (stop running task)
📎 [Download File]   → Show file list modal and download
```

### 5.2 Why Are They Needed?

**User Experience Improvement**:
- **No Command Typing**: Click button instead of typing `/state`
- **Smartphone Optimized**: Execute immediately with one tap
- **Error Prevention**: No worry about command typos
- **Quick Execution**: Execute frequently used commands instantly

### 5.3 Button Usage Example

**Scenario**: Quickly check task progress

```
1. Click 📊 [Check Status] button in Slack channel

2. Immediate response:
   Current channel: #project-blog
   Project: /Users/idongho/proj/blog
   Task queue: 0 waiting
   Last execution: 2 minutes ago
```

**Advantage**: Complete with one button click without typing `/state` command

### 5.4 Interactive Components Setup

```bash
# 1. Slack API website → "Interactivity & Shortcuts"

# 2. Toggle "Interactivity" ON

# 3. Request URL: (Leave blank when using Socket Mode)

# 4. "Save Changes"
```

**When Using Socket Mode**: No Request URL needed, button click events automatically handled via WebSocket

---

## 6. Socket Mode vs Webhooks: Why Socket Mode?

### 6.1 Two Communication Methods

**Webhooks (Traditional Method)**:
- Slack → HTTP POST request to developer server
- Public URL required (ngrok, cloud server)
- Request URL setup mandatory

**Socket Mode (Modern Method)**:
- Slack ↔ Developer server WebSocket connection
- No public URL required (runs locally)
- No Request URL setup needed

### 6.2 Socket Mode Advantages

| Item | Webhooks | Socket Mode |
|------|----------|-------------|
| Public URL | Required | Not required |
| Server Operation | Required | Not required |
| Setup Complexity | High | Low |
| Security | Public exposure | Local execution |
| Cost | Server costs | Free |

**Why remote-claude Chose Socket Mode**:
1. Can run directly in local environment
2. No server setup required (low entry barrier)
3. Security (no public URL needed)

### 6.3 Socket Mode Setup

```bash
# 1. Slack API website → "Socket Mode"

# 2. Toggle "Enable Socket Mode" ON

# 3. Generate "App-Level Token"
#    Token Name: remote-claude
#    Scope: connections:write

# 4. Copy Token (xapp-...)
```

**Environment Variable Setup**:
```bash
SLACK_APP_TOKEN=xapp-your-app-token
```

**Important**: Distinguish between Bot Token (xoxb-) and App Token (xapp-)!

---

## 7. Troubleshooting: Resolving Bot Token and Permission Errors

### 7.1 Bot Token Related Issues

**Error**: `invalid_auth`

**Cause**:
- Incorrect Bot Token (doesn't start with xoxb-)
- Confused with App Token (xapp- is App Token)

**Solution**:
```bash
# Check .env file
SLACK_BOT_TOKEN=xoxb-...  # Bot Token (xoxb-)
SLACK_APP_TOKEN=xapp-...  # App Token (xapp-)
```

### 7.2 Permission Errors

**Error**: `missing_scope`

**Cause**:
- Missing required Bot Token Scope
- Example: Attempting to send message without `chat:write`

**Solution**:
```bash
# 1. Slack API website → "OAuth & Permissions"
# 2. Add missing permission in "Bot Token Scopes"
# 3. "Reinstall to Workspace" (reinstall required!)
```

**Caution**: Must reinstall after adding permissions!

### 7.3 Socket Mode Connection Failure

**Error**: `connection_failed`

**Cause**:
- Incorrect App Token
- Missing `connections:write` permission

**Solution**:
```bash
# 1. Slack API website → "Basic Information"
# 2. "App-Level Tokens" → Delete existing token
# 3. Generate new token (Scope: connections:write)
# 4. Update .env file
```

### 7.4 Event Subscriptions Not Working

**Symptom**: Slack Bot doesn't respond when messages are sent to channel

**Cause**:
- Event Subscriptions disabled
- Slack Bot not invited to channel

**Solution**:
```bash
# 1. In Slack channel: /invite @remote-claude
# 2. Slack API website → Check "Event Subscriptions"
# 3. Verify message.channels, app_mention events
```

### 7.5 Interactive Components Not Working

**Symptom**: Buttons not displayed

**Cause**:
- Interactive Components disabled

**Solution**:
```bash
# Slack API website → "Interactivity & Shortcuts"
# Verify "Interactivity" toggle is ON
```

---

## 8. Complete Slack Bot Setup Checklist

### 8.1 Essential Setup (5 Steps)

- [ ] **Bot Token Scopes** (8 permissions)
  - app_mentions:read, channels:history, channels:read
  - chat:write, commands, files:write
  - im:history (optional), im:write (optional)

- [ ] **Event Subscriptions** (2 events)
  - message.channels
  - app_mention

- [ ] **Slash Commands** (6 commands)
  - /setup, /run, /download, /state, /cancel
  - /ask (optional, Deprecated)

- [ ] **Interactive Components**
  - Interactivity toggle ON

- [ ] **Socket Mode**
  - Socket Mode toggle ON
  - App-Level Token generated (xapp-)

### 8.2 Environment Variables Verification

```bash
# .env file
SLACK_BOT_TOKEN=xoxb-...  # Copy from OAuth & Permissions
SLACK_APP_TOKEN=xapp-...  # Copy from App-Level Token
```

### 8.3 Final Testing

```bash
# 1. Run remote-claude
npm start

# 2. Invite Slack Bot to Slack channel
/invite @remote-claude

# 3. Test Plain text execution
"Hello Claude"

# 4. Test Slash Command
/state

# 5. Test Interactive Components
# (Click button when Claude Code asks y/n)
```

**If all succeed**: Slack Bot setup complete! 🎉

---

## 9. Next Steps

**Day 3 Preview**: "Managing Multiple Projects Simultaneously (3/5): 4-Stage Message Processing and Task Queue"

Now that Slack Bot setup is complete, let's dive into the core features of remote-claude:
- Deep dive into 4-stage message processing pipeline
- Channel-based project management
- FIFO task queue system
- Multiple project concurrent work patterns

---

## Series Navigation

- [← Day 1: Local Dev Anywhere](../2025-11-20-remote-claude-day1-local-dev-anywhere)
- **Day 2: Complete Guide to Slack Bot Setup** (Current)
- [→ Day 3: Managing Multiple Projects](#) (Coming Soon)
- [→ Day 4: Maximizing Productivity](#) (Coming Soon)
- [→ Day 5: Smartphone Optimization](#) (Coming Soon)

---

## References

### Official Documentation
- [Slack API Documentation](https://api.slack.com/)
- [Socket Mode Guide](https://api.slack.com/apis/connections/socket)
- [Bot Token Scopes Reference](https://api.slack.com/scopes)
- [Event Subscriptions Guide](https://api.slack.com/events-api)
- [Interactive Components Documentation](https://api.slack.com/interactivity)

### Project
- [remote-claude GitHub](https://github.com/dh1789/remote-claude)

### Related Posts
- [Day 1: Local Dev Anywhere](../2025-11-20-remote-claude-day1-local-dev-anywhere)

---

**Was this post helpful?**

If you got stuck with Slack Bot setup, please ask in the comments! 🙌
