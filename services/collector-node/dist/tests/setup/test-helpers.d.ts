/**
 * Test helper utilities for SHAB API and Processor tests
 * Provides common test utilities and data helpers
 */
import { getPrismaClient } from '@auctiondeal/shared-ts';
/**
 * Get test database client
 */
export declare function getTestPrismaClient(): NonNullable<ReturnType<typeof getPrismaClient>>;
/**
 * Clean test database tables
 */
export declare function cleanTestDatabase(): Promise<void>;
/**
 * Get recent date range for testing (last 7 days)
 */
export declare function getRecentDateRange(): {
    startDate: string;
    endDate: string;
};
/**
 * Get a specific test date range with known data
 */
export declare function getTestDateRange(): {
    startDate: string;
    endDate: string;
};
/**
 * Wait for a specified amount of time (for rate limiting)
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Validate SHAB publication data structure
 */
export declare function validateShabPublicationData(data: any): boolean;
/**
 * Extract auction date from XML content for testing
 */
export declare function extractTestAuctionDate(xmlContent: string): string | null;
/**
 * Check if XML contains auction objects
 */
export declare function hasAuctionObjects(xmlContent: string): boolean;
/**
 * Create test publication ID
 */
export declare function createTestPublicationId(): string;
/**
 * Validate database record structure
 */
export declare function validateDatabaseRecord(record: any, expectedFields: string[]): boolean;
declare const _default: {
    getTestPrismaClient: typeof getTestPrismaClient;
    cleanTestDatabase: typeof cleanTestDatabase;
    getRecentDateRange: typeof getRecentDateRange;
    getTestDateRange: typeof getTestDateRange;
    delay: typeof delay;
    validateShabPublicationData: typeof validateShabPublicationData;
    extractTestAuctionDate: typeof extractTestAuctionDate;
    hasAuctionObjects: typeof hasAuctionObjects;
    createTestPublicationId: typeof createTestPublicationId;
    validateDatabaseRecord: typeof validateDatabaseRecord;
};
export default _default;
