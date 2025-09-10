/**
 * SHAB Collector Node Service
 *
 * Standalone service for collecting and processing SHAB data
 * Runs scheduled data collection and provides HTTP endpoints for manual operations
 */
declare class CollectorService {
    private isRunning;
    /**
     * Initialize and start the collector service
     */
    start(): Promise<void>;
    /**
     * Validate database connection
     */
    private validateDatabaseConnection;
    /**
     * Schedule daily SHAB data collection
     * Runs daily at 16:30 CET (after SHAB publishes new data)
     */
    private scheduleDailyCollection;
    /**
     * Schedule cleanup job for failed processing attempts
     * Runs every 6 hours
     */
    private scheduleCleanupJob;
    /**
     * Execute daily SHAB data collection
     */
    runDailyCollection(): Promise<void>;
    /**
     * Execute cleanup of failed processing attempts
     */
    runCleanup(): Promise<void>;
    /**
     * Process historical data (manual operation)
     * @param daysBack Number of days to process
     */
    runHistoricalCollection(daysBack?: number): Promise<any>;
    /**
     * Get service status and statistics
     */
    getStatus(): Promise<{
        status: string;
        isRunning: boolean;
        stats: any;
    }>;
    /**
     * Keep the service alive
     */
    private keepAlive;
}
export { CollectorService };
