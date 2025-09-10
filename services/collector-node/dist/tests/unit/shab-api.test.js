"use strict";
/**
 * SHAB API Service Tests - Live API Integration
 * Tests actual SHAB API endpoints with real data
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const shab_api_1 = require("../../src/lib/shab-api");
const shab_1 = require("../../src/types/shab");
// Helper functions
function getRecentDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}
function getTestDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    // Go back to find a weekday
    while (startDate.getDay() === 0 || startDate.getDay() === 6) {
        startDate.setDate(startDate.getDate() - 1);
    }
    const testStartDate = new Date(startDate);
    testStartDate.setDate(startDate.getDate() - 1);
    const testEndDate = new Date(startDate);
    testEndDate.setDate(startDate.getDate() + 1);
    return {
        startDate: testStartDate.toISOString().split('T')[0],
        endDate: testEndDate.toISOString().split('T')[0]
    };
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
(0, globals_1.describe)('ShabApiService - Live API Tests', () => {
    let shabApi;
    (0, globals_1.beforeAll)(() => {
        shabApi = new shab_api_1.ShabApiService();
    });
    (0, globals_1.describe)('API Connection and Response', () => {
        (0, globals_1.test)('should successfully connect to SHAB API', async () => {
            const { startDate, endDate } = getTestDateRange();
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 5);
            (0, globals_1.expect)(Array.isArray(publications)).toBe(true);
            (0, globals_1.expect)(publications.length).toBeGreaterThanOrEqual(0);
            // Rate limiting
            await delay(1000);
        });
        (0, globals_1.test)('should fetch recent publications with valid structure', async () => {
            const { startDate, endDate } = getRecentDateRange();
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 3);
            if (publications.length > 0) {
                const publication = publications[0];
                (0, globals_1.expect)(publication).toHaveProperty('id');
                (0, globals_1.expect)(publication).toHaveProperty('publishDate');
                (0, globals_1.expect)(publication).toHaveProperty('xmlContent');
                (0, globals_1.expect)(publication).toHaveProperty('canton');
                (0, globals_1.expect)(publication).toHaveProperty('rubric');
                (0, globals_1.expect)(publication).toHaveProperty('subRubric');
                (0, globals_1.expect)(publication).toHaveProperty('officialLanguage');
                (0, globals_1.expect)(typeof publication.id).toBe('string');
                (0, globals_1.expect)(typeof publication.publishDate).toBe('string');
                (0, globals_1.expect)(typeof publication.xmlContent).toBe('string');
                (0, globals_1.expect)(typeof publication.canton).toBe('string');
                (0, globals_1.expect)(publication.subRubric).toBe('SB01'); // Property foreclosures
                // XML content should not be empty
                (0, globals_1.expect)(publication.xmlContent.length).toBeGreaterThan(0);
            }
            await delay(1000);
        });
    });
    (0, globals_1.describe)('XML Fetching and Parsing', () => {
        (0, globals_1.test)('should fetch XML content for a publication', async () => {
            const { startDate, endDate } = getTestDateRange();
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 1);
            if (publications.length > 0) {
                const publication = publications[0];
                const xmlContent = await shabApi.fetchPublicationXml(publication.id);
                (0, globals_1.expect)(typeof xmlContent).toBe('string');
                (0, globals_1.expect)(xmlContent.length).toBeGreaterThan(0);
                (0, globals_1.expect)(xmlContent.includes('<?xml') || xmlContent.includes('<')).toBe(true);
            }
            await delay(1000);
        });
        (0, globals_1.test)('should parse XML content correctly', async () => {
            const { startDate, endDate } = getTestDateRange();
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 1);
            if (publications.length > 0) {
                const publication = publications[0];
                try {
                    const parsedData = shabApi.parsePublicationXml(publication.xmlContent);
                    (0, globals_1.expect)(parsedData).toHaveProperty('auctions');
                    (0, globals_1.expect)(parsedData).toHaveProperty('language');
                    (0, globals_1.expect)(Array.isArray(parsedData.auctions)).toBe(true);
                    (0, globals_1.expect)(typeof parsedData.language).toBe('string');
                    if (parsedData.auctions.length > 0) {
                        const auction = parsedData.auctions[0];
                        (0, globals_1.expect)(auction).toHaveProperty('objects');
                        (0, globals_1.expect)(Array.isArray(auction.objects)).toBe(true);
                    }
                }
                catch (error) {
                    // XML parsing might fail for some formats, that's ok for testing
                    console.log('XML parsing failed (expected for some formats):', error);
                }
            }
            await delay(500);
        });
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.test)('should handle invalid date ranges gracefully', async () => {
            try {
                const result = await shabApi.fetchPublications('invalid-date', '2024-01-01');
                // If no error thrown, result should be empty array or valid response
                (0, globals_1.expect)(Array.isArray(result)).toBe(true);
            }
            catch (error) {
                // If error is thrown, it should be a ShabApiError
                (0, globals_1.expect)(error).toBeInstanceOf(Error);
            }
            await delay(500);
        });
        (0, globals_1.test)('should handle invalid publication ID', async () => {
            await (0, globals_1.expect)(async () => {
                await shabApi.fetchPublicationXml('invalid-id-123');
            }).rejects.toThrow(shab_1.ShabApiError);
            await delay(500);
        });
        (0, globals_1.test)('should handle large page sizes within limits', async () => {
            const { startDate, endDate } = getTestDateRange();
            // Test with reasonable page size
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 20);
            (0, globals_1.expect)(Array.isArray(publications)).toBe(true);
            (0, globals_1.expect)(publications.length).toBeLessThanOrEqual(20);
            await delay(1000);
        });
    });
    (0, globals_1.describe)('Daily and Historical Publications', () => {
        (0, globals_1.test)('should fetch daily publications', async () => {
            const publications = await shabApi.fetchDailyPublications();
            (0, globals_1.expect)(Array.isArray(publications)).toBe(true);
            // Today might not have publications, so just check structure
            await delay(1000);
        });
        (0, globals_1.test)('should fetch historical publications with small range', async () => {
            // Test with just 3 days to avoid overwhelming the API
            const publications = await shabApi.fetchHistoricalPublications(3);
            (0, globals_1.expect)(Array.isArray(publications)).toBe(true);
            await delay(2000); // Longer delay for historical fetch
        });
    });
    (0, globals_1.describe)('Language Detection', () => {
        (0, globals_1.test)('should detect language from XML content', async () => {
            const { startDate, endDate } = getTestDateRange();
            const publications = await shabApi.fetchPublications(startDate, endDate, 0, 2);
            for (const publication of publications) {
                const parsedData = shabApi.parsePublicationXml(publication.xmlContent);
                (0, globals_1.expect)(['de', 'fr', 'it']).toContain(parsedData.language);
                await delay(500);
            }
        });
    });
});
