import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, formatUserPrompt } from './prompt.js';

export interface LLMConfig {
  provider: 'groq' | 'openai';
  apiKey: string;
  model: string;
  baseURL?: string;
}

export class LLMClient {
  private client: Groq;
  private model: string;

  constructor(config: LLMConfig) {
    if (config.provider === 'groq') {
      this.client = new Groq({ apiKey: config.apiKey });
    } else {
      this.client = new Groq({
        apiKey: config.apiKey,
        baseURL: config.baseURL || 'https://api.openai.com/v1',
      });
    }
    this.model = config.model;
  }

  async summarize(contributionData: string): Promise<string> {
    const userPrompt = formatUserPrompt(contributionData);

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content?.trim() || '今日无提交记录';
    } catch (error) {
      console.error('LLM summarization failed:', error);
      throw new Error('Failed to generate summary');
    }
  }
}
