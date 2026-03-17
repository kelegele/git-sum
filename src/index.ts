import { validateConfig } from './config/index.js';
import { runDailyJob, createDefaultUserIfNotExists } from './scheduler/daily.js';

async function main() {
  // Validate configuration
  validateConfig();

  // Initialize
  await createDefaultUserIfNotExists();

  // Run with tomorrow's date for testing
  const result = await runDailyJob('2026-03-18');

  if (result.success) {
    console.log('[GitSum] Job completed successfully');
    process.exit(0);
  } else {
    console.error('[GitSum] Job failed:', result.error);
    process.exit(1);
  }
}

// For serverless deployment (Vercel)
export async function handler(_request: Request): Promise<Response> {
  try {
    await createDefaultUserIfNotExists();
    const result = await runDailyJob();

    return Response.json({
      success: result.success,
      date: result.date,
      summary: result.summary,
      error: result.error,
    });
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

// For local development or Railway cron
main().catch((error) => {
  console.error('[GitSum] Fatal error:', error);
  process.exit(1);
});
