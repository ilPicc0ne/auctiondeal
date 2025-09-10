/**
 * SHAB API Client Service
 * Handles communication with Swiss Commercial Gazette API
 * Includes XML parsing, error handling, and retry logic
 */
import { ShabPublicationData } from '../types/shab';
export declare class ShabApiService {
    private readonly baseUrl;
    private readonly xmlParser;
    private readonly maxRetries;
    private readonly retryDelayMs;
    constructor();
    /**
     * Fetch publications for a specific date range
     * @param startDate Start date (YYYY-MM-DD)
     * @param endDate End date (YYYY-MM-DD)
     * @param page Page number (default: 0)
     * @param size Items per page (default: 100)
     */
    fetchPublications(startDate: string, endDate: string, page?: number, size?: number): Promise<ShabPublicationData[]>;
    /**
     * Fetch full XML content for a specific publication
     * @param metaId Publication meta ID
     */
    fetchPublicationXml(metaId: string): Promise<string>;
    /**
     * Fetch full structured content for a specific publication (legacy method)
     * @param metaId Publication meta ID
     */
    fetchPublicationContent(metaId: string): Promise<string>;
    /**
     * Fetch daily publications (today's publications)
     */
    fetchDailyPublications(): Promise<ShabPublicationData[]>;
    /**
     * Fetch historical publications for a date range
     * @param daysBack Number of days to go back from today
     */
    fetchHistoricalPublications(daysBack?: number): Promise<ShabPublicationData[]>;
    /**
     * Parse XML content to extract auction information
     * @param xmlContent Raw XML string from SHAB
     */
    parsePublicationXml(xmlContent: string): {
        auctions: Array<{
            date?: string;
            location?: string;
            objects: Array<{
                text: string;
                order: number;
            }>;
        }>;
        language: string;
    };
    /**
     * Make HTTP request with retry logic
     */
    private makeRequest;
    /**
     * Simple delay utility
     */
    private delay;
    /**
     * Detect language from XML content
     */
    private detectLanguage;
    /**
     * Format auction date and time
     */
    private formatAuctionDate;
}
