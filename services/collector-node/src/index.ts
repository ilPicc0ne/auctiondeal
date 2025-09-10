/**
 * SHAB Collector Node Service
 * 
 * Standalone service for collecting and processing SHAB data
 * Runs scheduled data collection and provides HTTP endpoints for manual operations
 */

import * as cron from 'node-cron';
import winston from 'winston';
import { shabProcessorService } from './lib/shab-processor.js';

// Configure logging
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize({ all: true })
    })
  ]
});

class CollectorService {
  private isRunning = false;

  /**
   * Initialize and start the collector service
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting SHAB Collector Service...');

    try {
      // Validate database connection
      await this.validateDatabaseConnection();

      // Schedule daily collection job
      this.scheduleDailyCollection();

      // Schedule cleanup job
      this.scheduleCleanupJob();

      logger.info('✅ SHAB Collector Service started successfully');
      
      // Keep the process running
      this.keepAlive();

    } catch (error) {
      logger.error('❌ Failed to start SHAB Collector Service:', error);
      process.exit(1);
    }
  }

  /**
   * Validate database connection
   */
  private async validateDatabaseConnection(): Promise<void> {
    try {
      const stats = await shabProcessorService.getProcessingStats();
      logger.info('🔗 Database connection validated:', {
        totalPublications: stats.totalPublications,
        totalAuctions: stats.totalAuctions
      });
    } catch (error) {
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule daily SHAB data collection
   * Runs daily at 16:30 CET (after SHAB publishes new data)
   */
  private scheduleDailyCollection(): void {
    // Run daily at 16:30 CET (4:30 PM)
    cron.schedule('30 16 * * *', async () => {
      await this.runDailyCollection();
    }, {
      scheduled: true,
      timezone: 'Europe/Zurich'
    });

    logger.info('📅 Scheduled daily SHAB collection at 16:30 CET');
  }

  /**
   * Schedule cleanup job for failed processing attempts
   * Runs every 6 hours
   */
  private scheduleCleanupJob(): void {
    cron.schedule('0 */6 * * *', async () => {
      await this.runCleanup();
    }, {
      scheduled: true,
      timezone: 'Europe/Zurich'
    });

    logger.info('🧹 Scheduled cleanup job every 6 hours');
  }

  /**
   * Execute daily SHAB data collection
   */
  async runDailyCollection(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⏳ Daily collection already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('🔄 Starting daily SHAB collection...');

      // Process daily publications
      const result = await shabProcessorService.processDailyPublications();

      // Get updated statistics
      const stats = await shabProcessorService.getProcessingStats();

      const duration = Date.now() - startTime;

      logger.info('✅ Daily SHAB collection completed:', {
        duration: `${duration}ms`,
        processed: result.processed,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
        totalPublications: stats.totalPublications,
        totalAuctions: stats.totalAuctions
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('❌ Daily SHAB collection failed:', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute cleanup of failed processing attempts
   */
  async runCleanup(): Promise<void> {
    try {
      logger.debug('🧹 Starting cleanup of failed processing attempts...');

      const cleanedUp = await shabProcessorService.cleanupFailedProcessing();

      if (cleanedUp > 0) {
        logger.info(`✅ Cleanup completed: ${cleanedUp} failed attempts cleaned up`);
      } else {
        logger.debug('✅ Cleanup completed: No failed attempts found');
      }

    } catch (error) {
      logger.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Process historical data (manual operation)
   * @param daysBack Number of days to process
   */
  async runHistoricalCollection(daysBack: number = 90): Promise<any> {
    if (this.isRunning) {
      throw new Error('Collection already in progress');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info(`🔄 Starting historical SHAB collection (${daysBack} days)...`);

      // Process historical publications
      const result = await shabProcessorService.processHistoricalPublications(daysBack);

      // Get updated statistics
      const stats = await shabProcessorService.getProcessingStats();

      const duration = Date.now() - startTime;

      logger.info('✅ Historical SHAB collection completed:', {
        duration: `${duration}ms`,
        daysBack,
        processed: result.processed,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
        totalPublications: stats.totalPublications,
        totalAuctions: stats.totalAuctions
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('❌ Historical SHAB collection failed:', {
        duration: `${duration}ms`,
        daysBack,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      throw error;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get service status and statistics
   */
  async getStatus(): Promise<{
    status: string;
    isRunning: boolean;
    stats: any;
  }> {
    try {
      const stats = await shabProcessorService.getProcessingStats();
      
      return {
        status: 'healthy',
        isRunning: this.isRunning,
        stats
      };
    } catch (error) {
      return {
        status: 'error',
        isRunning: this.isRunning,
        stats: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Keep the service alive
   */
  private keepAlive(): void {
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🔄 Shutting down SHAB Collector Service...');
      
      try {
        await shabProcessorService.disconnect();
        logger.info('✅ SHAB Collector Service shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      logger.info('🔄 Shutting down SHAB Collector Service...');
      
      try {
        await shabProcessorService.disconnect();
        logger.info('✅ SHAB Collector Service shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Log service status periodically
    setInterval(async () => {
      try {
        const status = await this.getStatus();
        logger.debug('📊 Service status:', status);
      } catch (error) {
        logger.error('❌ Status check failed:', error);
      }
    }, 300000); // Every 5 minutes
  }
}

// Start the service
const service = new CollectorService();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled promise rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Start the service
service.start().catch((error) => {
  logger.error('❌ Failed to start service:', error);
  process.exit(1);
});

export { CollectorService };