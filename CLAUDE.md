# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GitSum** - AI-powered GitHub contribution summarizer that:
- Fetches developer activity from GitHub API (commits, PRs, issues)
- Generates structured daily logs via LLM (Claude recommended)
- Pushes summaries to Flomo for daily tracking
- Target: MVP supporting Flomo push only

## Tech Stack

- **Language**: Node.js / TypeScript
- **Runtime**: Vercel or Railway (serverless deployment for scheduled tasks)
- **Database**: Supabase or MongoDB (user configs, push records)
- **LLM**: OpenAI GPT-4 or Claude (Claude 3.5 Sonnet recommended for strong code understanding)

## High-Level Architecture

```
┌─────────────┐
│  GitHub API │────→│  GitSum Core  │
│  (Data Source) │     │  (Main Logic)  │
└─────────────┘     └──────┬──────┘
                      │
                      ↓
                    ┌─────────────┐
                    │  LLM API     │
                    │ (Summarizer)  │
                    └─────────────┘
                          │
                          ↓
                      ┌─────────────┐
                      │  Flomo API     │
                      │ (Push Target)  │
                      └─────────────┘
```

### Core Modules

```
gitsum/
├── src/
│   ├── github/           # GitHub API wrapper
│   │   ├── client.ts      # API client
│   │   ├── parser.ts      # Contribution data parser
│   │   └── types.ts       # TypeScript interfaces
│   ├── llm/              # AI summarizer
│   │   ├── prompt.ts      # Prompt templates
│   │   ├── client.ts      # LLM API wrapper
│   │   └── formatter.ts   # Summary output format
│   ├── flomo/             # Flomo push module
│   │   ├── client.ts      # Flomo API wrapper
│   │   └── templates.ts   # Content templates
│   ├── scheduler/        # Scheduled tasks
│   │   └── daily.ts       # Daily summary task
│   └── config/           # Configuration management
│       └── index.ts
├── prisma/              # Database schema (if using ORM)
├── scripts/             # Deployment/init scripts
├── .env.example         # Environment variable template
├── package.json
└── README.md
```

### Data Flow

1. **GitHub API → Parser** → Extract structured contribution data
2. **Parser → LLM Client** → Generate summarized log
3. **LLM Client → Formatter** → Format as Flomo-compatible content
4. **Formatter → Flomo API** → Create memo with tags

## Common Commands

### Building
```bash
npm install          # Install dependencies
npm run build        # Build TypeScript (if configured)
```

### Linting
```bash
npm run lint        # Run ESLint
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- github/client.test.ts

# Run with coverage
npm run test:cov
```

### Type Checking
```bash
npm run type-check  # Run TypeScript compiler for type validation
```

### Environment Setup
```bash
cp .env.example .env  # Copy env template and fill values
```

### Deployment
```bash
vercel deploy          # Deploy to Vercel
railway up              # Deploy to Railway
```

## Key Data Structures

### Contribution Data
```typescript
interface ContributionData {
  date: string;
  commits: Array<{
    repo: string;
    message: string;
    files_changed: number;
    additions: number;
    deletions: number;
  }>;
  pull_requests: Array<{
    title: string;
    state: 'open' | 'merged' | 'closed';
    description: string;
  }>;
  issues: Array<{
    title: string;
    state: string;
    comments_count: number;
  }>;
}
```

### LLM Prompt Template
```typescript
const SYSTEM_PROMPT = `你是一个技术日志助手。请将以下 GitHub 提交记录总结为开发者日志。

要求：
1. 用第一人称"我"叙述
2. 开头用一句话概括今日开发主题
3. 列出 3-5 个关键改动点（用 - 标记）
4. 如有技术难点或突破，单独标注"💡 亮点"
5. 总字数控制在 200 字以内，适合快速回顾

原始数据：
{{contribution_data}}

请生成中文日志：`;
```

## Environment Variables

Required environment variables (create `.env` from `.env.example`):

```env
# GitHub App credentials
GITHUB_APP_ID=xxx
GITHUB_PRIVATE_KEY=xxx
GITHUB_WEBHOOK_SECRET=xxx

# LLM API
OPENAI_API_KEY=sk-xxx  # or ANTHROPIC_API_KEY

# Flomo push
FLOMO_WEBHOOK_URL=https://flomoapp.com/iwh/xxx/xxx/xxx
FLOMO_DEFAULT_TAGS=#coding #git

# Scheduled task
CRON_SCHEDULE=0 22 * * *  # Run at 22:00 daily
```

## Development Guidelines

- **Type Safety**: All code must pass TypeScript type checking
- **Error Handling**: API failures must be handled gracefully with retries and exponential backoff
- **Configuration Management**: Use environment variables for all sensitive data
- **Prompt Engineering**: Optimize prompts for Claude's code understanding capabilities
- **Rate Limiting**: Respect GitHub API rate limits and LLM rate limits

## Testing Notes

- Unit tests for each module's core functions
- Integration tests for full data flow (GitHub → LLM → Flomo)
- Mock external API clients (GitHub, LLM, Flomo) for testing
- Test prompt template rendering with various contribution data scenarios
