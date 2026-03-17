export interface FlomoConfig {
  webhookUrl: string;
  defaultTags: string;
}

export class FlomoClient {
  private webhookUrl: string;
  private defaultTags: string;

  constructor(config: FlomoConfig) {
    this.webhookUrl = config.webhookUrl;
    this.defaultTags = config.defaultTags;
  }

  async push(content: string): Promise<void> {
    const tags = this.defaultTags || '#coding #git #gitsum';
    const payload = {
      content: `${content}\n${tags}`,
    };

    try {
      console.log(`[Flomo] Sending to webhook: ${this.webhookUrl}`);
      console.log(`[Flomo] Payload:`, payload);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`[Flomo] Response status: ${response.status}`);
      console.log(`[Flomo] Response body:`, responseText);

      if (!response.ok) {
        throw new Error(`Flomo push failed: ${response.status} - ${responseText}`);
      }

      console.log('[Flomo] Successfully pushed to Flomo');
    } catch (error) {
      console.error('[Flomo] Push failed:', error);
      throw new Error('Failed to push to Flomo');
    }
  }
}
