"use strict";
/**
 * Test helper utilities for SHAB API and Processor tests
 * Provides common test utilities and data helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestPrismaClient = getTestPrismaClient;
exports.cleanTestDatabase = cleanTestDatabase;
exports.getRecentDateRange = getRecentDateRange;
exports.getTestDateRange = getTestDateRange;
exports.delay = delay;
exports.validateShabPublicationData = validateShabPublicationData;
exports.extractTestAuctionDate = extractTestAuctionDate;
exports.hasAuctionObjects = hasAuctionObjects;
exports.createTestPublicationId = createTestPublicationId;
exports.validateDatabaseRecord = validateDatabaseRecord;
const shared_ts_1 = require("@auctiondeal/shared-ts");
/**
 * Get test database client
 */
function getTestPrismaClient() {
    const prisma = (0, shared_ts_1.getPrismaClient)();
    if (!prisma) {
        throw new Error('Failed to initialize test database connection');
    }
    return prisma;
}
/**
 * Clean test database tables
 */
async function cleanTestDatabase() {
    const prisma = getTestPrismaClient();
    // Delete in order to respect foreign key constraints
    await prisma.property.deleteMany();
    await prisma.auctionObject.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.shabPublication.deleteMany();
}
/**
 * Get recent date range for testing (last 7 days)
 */
function getRecentDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return {
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0]
    };
}
/**
 * Get a specific test date range with known data
 */
function getTestDateRange() {
    // Use a date range that's likely to have SHAB data (weekdays)
    const endDate = new Date();
    const startDate = new Date();
    // Go back to find a weekday
    while (startDate.getDay() === 0 || startDate.getDay() === 6) {
        startDate.setDate(startDate.getDate() - 1);
    }
    // Get a 3-day range around the weekday
    const testStartDate = new Date(startDate);
    testStartDate.setDate(startDate.getDate() - 1);
    const testEndDate = new Date(startDate);
    testEndDate.setDate(startDate.getDate() + 1);
    return {
        startDate: testStartDate.toISOString().split('T')[0],
        endDate: testEndDate.toISOString().split('T')[0]
    };
}
/**
 * Wait for a specified amount of time (for rate limiting)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Validate SHAB publication data structure
 */
function validateShabPublicationData(data) {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.publishDate === 'string' &&
        typeof data.xmlContent === 'string' &&
        typeof data.canton === 'string' &&
        typeof data.rubric === 'string' &&
        typeof data.subRubric === 'string' &&
        typeof data.officialLanguage === 'string');
}
/**
 * Extract auction date from XML content for testing
 */
function extractTestAuctionDate(xmlContent) {
    // Simple regex to find date patterns in XML
    const datePatterns = [
        /(\d{1,2}\.\s*\w+\s*\d{4})/g, // DD. Month YYYY
        /(\d{1,2}\.\d{1,2}\.\d{4})/g, // DD.MM.YYYY
    ];
    for (const pattern of datePatterns) {
        const match = xmlContent.match(pattern);
        if (match) {
            return match[0];
        }
    }
    return null;
}
/**
 * Check if XML contains auction objects
 */
function hasAuctionObjects(xmlContent) {
    return xmlContent.includes('auctionObjects') || xmlContent.includes('Versteigerungsobjekt');
}
/**
 * Create test publication ID
 */
function createTestPublicationId() {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Validate database record structure
 */
function validateDatabaseRecord(record, expectedFields) {
    if (!record)
        return false;
    return expectedFields.every(field => {
        const value = record[field];
        return value !== null && value !== undefined;
    });
}
exports.default = {
    getTestPrismaClient,
    cleanTestDatabase,
    getRecentDateRange,
    getTestDateRange,
    delay,
    validateShabPublicationData,
    extractTestAuctionDate,
    hasAuctionObjects,
    createTestPublicationId,
    validateDatabaseRecord
};
