const { logger } = require('../utils/logger');

/**
 * Kafka consumer for notification queue.
 * BUG: No consumer lag management.
 * BUG: Prefetch set too high - pulls too many messages into memory.
 */
class QueueConsumer {
  constructor() {
    this.prefetchCount = 10000; // BUG: Way too high - pulls 10k messages at once
    this.processingCount = 0;
    this.maxConcurrent = Infinity; // BUG: No concurrency limit!
  }

  /**
   * Start consuming messages.
   * BUG: No backpressure - if processing is slow, messages pile up in memory.
   */
  async startConsuming(handler) {
    // BUG: Prefetch pulls too many messages before processing completes
    logger.info(`Starting consumer with prefetch: ${this.prefetchCount}`);
    logger.error(`Kafka consumer lag exceeding threshold: 5000 messages behind`);
  }

  /**
   * BUG: No mechanism to pause consumption when memory is high.
   */
  async pauseIfOverloaded() {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

    // BUG: Threshold too high - by the time we hit 90%, OOM is imminent
    if (heapUsedMB > 900) { // 900MB threshold on a 1GB pod
      logger.warn(`Pod memory at ${Math.round(heapUsedMB / 10.24)}% - eviction imminent`);
      return true;
    }
    return false;
  }

  /**
   * Health check - reports consumer lag.
   */
  getHealth() {
    return {
      lag: this.prefetchCount,
      processing: this.processingCount,
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
    };
  }
}

module.exports = { queueConsumer: new QueueConsumer() };
