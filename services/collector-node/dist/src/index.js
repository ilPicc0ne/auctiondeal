"use strict";
/**
 * SHAB Collector Node Service
 *
 * Standalone service for collecting and processing SHAB data
 * Runs scheduled data collection and provides HTTP endpoints for manual operations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorService = void 0;
const cron = __importStar(require("node-cron"));
const winston_1 = __importDefault(require("winston"));
const shab_processor_js_1 = require("./lib/shab-processor.js");
// Configure logging
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
    })),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.colorize({ all: true })
        })
    ]
});
class CollectorService {
    constructor() {
        this.isRunning = false;
    }
    /**
     * Initialize and start the collector service
     */
    async start() {
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
        }
        catch (error) {
            logger.error('❌ Failed to start SHAB Collector Service:', error);
            process.exit(1);
        }
    }
    /**
     * Validate database connection
     */
    async validateDatabaseConnection() {
        try {
            const stats = await shab_processor_js_1.shabProcessorService.getProcessingStats();
            logger.info('🔗 Database connection validated:', {
                totalPublications: stats.totalPublications,
                totalAuctions: stats.totalAuctions
            });
        }
        catch (error) {
            throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Schedule daily SHAB data collection
     * Runs daily at 16:30 CET (after SHAB publishes new data)
     */
    scheduleDailyCollection() {
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
    scheduleCleanupJob() {
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
    async runDailyCollection() {
        if (this.isRunning) {
            logger.warn('⏳ Daily collection already in progress, skipping...');
            return;
        }
        this.isRunning = true;
        const startTime = Date.now();
        try {
            logger.info('🔄 Starting daily SHAB collection...');
            // Process daily publications
            const result = await shab_processor_js_1.shabProcessorService.processDailyPublications();
            // Get updated statistics
            const stats = await shab_processor_js_1.shabProcessorService.getProcessingStats();
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('❌ Daily SHAB collection failed:', {
                duration: `${duration}ms`,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Execute cleanup of failed processing attempts
     */
    async runCleanup() {
        try {
            logger.debug('🧹 Starting cleanup of failed processing attempts...');
            const cleanedUp = await shab_processor_js_1.shabProcessorService.cleanupFailedProcessing();
            if (cleanedUp > 0) {
                logger.info(`✅ Cleanup completed: ${cleanedUp} failed attempts cleaned up`);
            }
            else {
                logger.debug('✅ Cleanup completed: No failed attempts found');
            }
        }
        catch (error) {
            logger.error('❌ Cleanup failed:', error);
        }
    }
    /**
     * Process historical data (manual operation)
     * @param daysBack Number of days to process
     */
    async runHistoricalCollection(daysBack = 90) {
        if (this.isRunning) {
            throw new Error('Collection already in progress');
        }
        this.isRunning = true;
        const startTime = Date.now();
        try {
            logger.info(`🔄 Starting historical SHAB collection (${daysBack} days)...`);
            // Process historical publications
            const result = await shab_processor_js_1.shabProcessorService.processHistoricalPublications(daysBack);
            // Get updated statistics
            const stats = await shab_processor_js_1.shabProcessorService.getProcessingStats();
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error('❌ Historical SHAB collection failed:', {
                duration: `${duration}ms`,
                daysBack,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Get service status and statistics
     */
    async getStatus() {
        try {
            const stats = await shab_processor_js_1.shabProcessorService.getProcessingStats();
            return {
                status: 'healthy',
                isRunning: this.isRunning,
                stats
            };
        }
        catch (error) {
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
    keepAlive() {
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            logger.info('🔄 Shutting down SHAB Collector Service...');
            try {
                await shab_processor_js_1.shabProcessorService.disconnect();
                logger.info('✅ SHAB Collector Service shutdown complete');
                process.exit(0);
            }
            catch (error) {
                logger.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });
        process.on('SIGTERM', async () => {
            logger.info('🔄 Shutting down SHAB Collector Service...');
            try {
                await shab_processor_js_1.shabProcessorService.disconnect();
                logger.info('✅ SHAB Collector Service shutdown complete');
                process.exit(0);
            }
            catch (error) {
                logger.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });
        // Log service status periodically
        setInterval(async () => {
            try {
                const status = await this.getStatus();
                logger.debug('📊 Service status:', status);
            }
            catch (error) {
                logger.error('❌ Status check failed:', error);
            }
        }, 300000); // Every 5 minutes
    }
}
exports.CollectorService = CollectorService;
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
