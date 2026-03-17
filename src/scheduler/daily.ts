import dotenv from 'dotenv';

dotenv.config();

import { GitHubClient } from '../github/client.js';
import { LLMClient } from '../llm/client.js';
import { FlomoClient } from '../flomo/client.js';
import { config } from '../config/index.js';
import { getPrisma } from '../prisma/client.js';

const prisma = getPrisma();

export interface DailyJobResult {
  success: boolean;
  date: string;
  summary: string;
  error?: string;
}

export async function runDailyJob(date?: string): Promise<DailyJobResult> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    console.log(`[GitSum] Starting daily job for ${targetDate}`);

    // Check if already pushed for this date
    const existingRecord = await prisma.pushRecord.findFirst({
      where: {
        date: new Date(targetDate),
        status: 'success',
      },
    });

    if (existingRecord) {
      console.log(`[GitSum] Already pushed for ${targetDate}, skipping`);
      return {
        success: true,
        date: targetDate,
        summary: existingRecord.content,
      };
    }

    // Fetch GitHub contributions
    const githubClient = new GitHubClient(config.github.token, config.github.username);
    const contributions = await githubClient.fetchContributions(targetDate);

    const contributionData = JSON.stringify(contributions, null, 2);
    console.log(`[GitSum] Fetched ${contributions.commits.length} commits, ${contributions.pullRequests.length} PRs, ${contributions.issues.length} issues`);

    // Generate summary
    const llmClient = new LLMClient(config.llm);
    const summary = await llmClient.summarize(contributionData);
    console.log(`[GitSum] Generated summary: ${summary.substring(0, 50)}...`);

    // Push to Flomo
    const flomoClient = new FlomoClient(config.flomo);
    await flomoClient.push(summary);
    console.log(`[GitSum] Successfully pushed to Flomo`);

    // Save record (update if exists)
    const tags = config.flomo.defaultTags.split(' ').filter(Boolean);
    await prisma.pushRecord.upsert({
      where: {
          userId_date: {
            userId: 'default',
            date: new Date(targetDate),
          },
      },
      update: {
        content: summary,
        tags,
        status: 'success',
        errorMessage: null,
      },
      create: {
        userId: 'default',
        date: new Date(targetDate),
        content: summary,
        tags,
        status: 'success',
      },
    });

    return {
      success: true,
      date: targetDate,
      summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[GitSum] Daily job failed:`, errorMessage);

    // Save failure record (update if exists)
    try {
      await prisma.pushRecord.upsert({
        where: {
          userId_date: {
            userId: 'default',
            date: new Date(targetDate),
          },
        },
        update: {
          status: 'failed',
          errorMessage,
          content: '',
          tags: [],
        },
        create: {
          userId: 'default',
          date: new Date(targetDate),
          content: '',
          tags: [],
          status: 'failed',
          errorMessage,
        },
      });
    } catch (dbError) {
      console.error('[GitSum] Failed to save error record:', dbError);
    }

    return {
      success: false,
      date: targetDate,
      summary: '',
      error: errorMessage,
    };
  }
}

export async function createDefaultUserIfNotExists(): Promise<void> {
  const existingUser = await prisma.userConfig.findUnique({
    where: { id: 'default' },
  });

  if (!existingUser) {
    await prisma.userConfig.create({
      data: {
        id: 'default',
        githubUsername: config.github.username,
        githubToken: config.github.token,
        flomoWebhookUrl: config.flomo.webhookUrl,
        flomoDefaultTags: config.flomo.defaultTags,
      },
    });
    console.log('[GitSum] Created default user config');
  }
}
