# GitSum

AI-powered GitHub contribution summarizer that pushes daily developer logs to Flomo.

## Features

- Fetch daily GitHub contributions (commits, PRs, issues)
- Generate structured Chinese summaries using LLM (200 chars max)
- Push to Flomo via webhook
- Daily scheduled execution (22:00, configurable)

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd git-sum
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Locally

```bash
npm run dev
```

## Deployment

### Railway (Recommended)

1. Create Railway project and link GitHub repo
2. Add environment variables from `.env`
3. Add cron job: `npx tsx src/index.ts` at schedule `0 22 * * *`

### Vercel (Alternative)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Cron is configured in `vercel.json`

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection URL |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token |
| `GITHUB_USERNAME` | Yes | Your GitHub username |
| `GROQ_API_KEY` | No | Groq API key (free) |
| `OPENAI_API_KEY` | No | OpenAI API key (alternative) |
| `FLOMO_WEBHOOK_URL` | Yes | Flomo webhook URL |
| `CRON_SCHEDULE` | No | Cron expression (default: 22:00 daily) |

## License

MIT
