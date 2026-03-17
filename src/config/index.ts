import dotenv from 'dotenv';

dotenv.config();

// 调试：输出完整配置详情
console.log('[GitSum] Config loaded successfully');
console.log('[GitSum] GitHub Token:', process.env.GITHUB_TOKEN ? 'SET' : 'MISSING');
console.log('[GitSum] GitHub Username:', process.env.GITHUB_USERNAME ? 'SET' : 'MISSING');
console.log('[GitSum] OpenAI API Key:', process.env.OPENAI_API_KEY ? 'SET' : 'MISSING');
console.log('[GitSum] Flomo Webhook URL:', process.env.FLOMO_WEBHOOK_URL ? 'SET' : 'MISSING');

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
    username: process.env.GITHUB_USERNAME || '',
  },
  llm: {
    provider: (process.env.LLM_PROVIDER as 'groq' | 'openai') || 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'deepseek-chat',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
  },
  flomo: {
    webhookUrl: process.env.FLOMO_WEBHOOK_URL || '',
    defaultTags: process.env.FLOMO_DEFAULT_TAGS || '#coding #git #gitsum',
  },
  scheduler: {
    schedule: process.env.CRON_SCHEDULE || '0 22 * * *',
    timezone: process.env.TIMEZONE || 'Asia/Shanghai',
  },
};

export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.github.token) errors.push('GITHUB_TOKEN is required');
  if (!config.github.username) errors.push('GITHUB_USERNAME is required');
  if (!config.llm.apiKey) errors.push('OPENAI_API_KEY is required');
  if (!config.flomo.webhookUrl) errors.push('FLOMO_WEBHOOK_URL is required');

  // 数据库验证在本地测试时跳过
  if (!config.database.url) {
    console.log('[GitSum] Database URL not configured, skipping database validation for local testing');
  }

  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n${errors.join('\n')}`);
  }
}
