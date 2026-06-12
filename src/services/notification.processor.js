const { logger } = require('../utils/logger');

/**
 * Notification processor that handles message queue consumption.
 * BUG: Processes all messages in-memory without backpressure.
 * BUG: Template rendering loads all templates into memory.
 */
class NotificationProcessor {
  constructor() {
    this.messageBuffer = [];
    this.templates = new Map();
    // BUG: Pre-loads ALL templates into memory on startup
    this.loadAllTemplates();
  }

  /**
   * BUG: Loads all templates into memory - no lazy loading.
   * With 1000+ templates, this uses ~500MB RAM.
   */
  loadAllTemplates() {
    const templateTypes = ['email', 'sms', 'push', 'webhook', 'slack'];
    const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt', 'it', 'ru'];

    for (const type of templateTypes) {
      for (const lang of languages) {
        for (let i = 0; i < 100; i++) {
          // BUG: Stores large template strings in memory
          this.templates.set(
            `${type}:${lang}:template_${i}`,
            `<html><body>Notification template for ${type} in ${lang} - variant ${i}. ${'Content placeholder. '.repeat(200)}</body></html>`
          );
        }
      }
    }
    logger.info(`Loaded ${this.templates.size} templates into memory`);
  }

  /**
   * Process incoming message from queue.
   * BUG: No concurrency limit - processes everything at once.
   * BUG: Accumulates messages in buffer without flushing.
   */
  async processMessage(message) {
    // BUG: Buffer grows unbounded - never flushed properly
    this.messageBuffer.push(message);

    // Render template in memory
    const templateKey = `${message.type}:en:${message.template}`;
    const template = this.templates.get(templateKey) || '';

    // BUG: String concatenation in a loop - creates many intermediate strings
    let rendered = template;
    for (const [key, value] of Object.entries(message.data || {})) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    // BUG: No check for undefined variables in template
    if (rendered.includes('{{')) {
      const undefinedVar = rendered.match(/{{(\w+)}}/);
      logger.error(`Template rendering error: undefined variable ${undefinedVar ? undefinedVar[1] : 'unknown'}`);
    }

    await this.sendNotification(message.type, message.recipient, rendered);
  }

  /**
   * BUG: No connection pooling for SMTP relay.
   * Creates new connection per message.
   */
  async sendNotification(type, recipient, content) {
    switch (type) {
      case 'email':
        await this.sendEmail(recipient, content);
        break;
      case 'push':
        await this.sendPush(recipient, content);
        break;
      case 'sms':
        await this.sendSms(recipient, content);
        break;
    }
  }

  async sendEmail(to, html) {
    // BUG: New SMTP connection per email - connection exhaustion
    // BUG: No retry on SMTP relay refusal
    const connected = Math.random() > 0.1; // 10% failure rate
    if (!connected) {
      logger.error('SMTP relay connection refused - email delivery failing');
      throw new Error('SMTP relay connection refused - email delivery failing');
    }
  }

  async sendPush(to, payload) {
    // Push notification delivery
  }

  async sendSms(to, message) {
    // SMS delivery
  }

  getBufferSize() {
    return this.messageBuffer.length;
  }
}

module.exports = { notificationProcessor: new NotificationProcessor() };
