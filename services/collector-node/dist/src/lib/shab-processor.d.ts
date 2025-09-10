/**
 * SHAB Data Processor Service
 * Handles processing and storing SHAB publications in the database
 * Includes duplicate detection and data validation
 */
import { ShabPublicationData, ProcessingResult } from '../types/shab';
export declare class ShabProcessorService {
    private shabApi;
    private prisma;
    constructor();
    /**
     * Process daily publications and store in database
     */
    processDailyPublications(): Promise<ProcessingResult>;
    /**
     * Process historical publications and store in database
     * @param daysBack Number of days to process (default: 90)
     */
    processHistoricalPublications(daysBack?: number): Promise<ProcessingResult>;
    /**
     * Process a batch of publications
     * @param publications Array of SHAB publications to process
     */
    processPublications(publications: ShabPublicationData[]): Promise<ProcessingResult>;
    /**
     * Process a single publication and create auctions
     * @param publication SHAB publication data
     */
    private processSinglePublication;
    /**
     * Parse auction date string to Date object
     * @param dateStr Date string in various Swiss formats
     */
    private parseAuctionDate;
    /**
     * Get processing statistics
     */
    getProcessingStats(): Promise<{
        totalPublications: number;
        completedPublications: number;
        pendingPublications: number;
        totalAuctions: number;
        totalAuctionObjects: number;
        lastProcessed?: Date;
    }>;
    /**
     * Clean up failed processing attempts
     */
    cleanupFailedProcessing(): Promise<number>;
    /**
     * Close database connection
     */
    disconnect(): Promise<void>;
}
export declare const shabProcessorService: ShabProcessorService;
