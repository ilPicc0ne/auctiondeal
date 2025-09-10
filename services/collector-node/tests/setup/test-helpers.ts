/**
 * Test helper utilities for SHAB API and Processor tests
 * Provides common test utilities and data helpers
 */

import { getPrismaClient } from '@auctiondeal/shared-ts';

/**
 * Get test database client
 */
export function getTestPrismaClient(): NonNullable<ReturnType<typeof getPrismaClient>> {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error('Failed to initialize test database connection');
  }
  return prisma;
}

/**
 * Clean test database tables
 */
export async function cleanTestDatabase() {
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
export function getRecentDateRange() {
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
export function getTestDateRange() {
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
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate SHAB publication data structure
 */
export function validateShabPublicationData(data: any): boolean {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.publishDate === 'string' &&
    typeof data.xmlContent === 'string' &&
    typeof data.canton === 'string' &&
    typeof data.rubric === 'string' &&
    typeof data.subRubric === 'string' &&
    typeof data.officialLanguage === 'string'
  );
}

/**
 * Extract auction date from XML content for testing
 */
export function extractTestAuctionDate(xmlContent: string): string | null {
  // Simple regex to find date patterns in XML
  const datePatterns = [
    /(\d{1,2}\.\s*\w+\s*\d{4})/g, // DD. Month YYYY
    /(\d{1,2}\.\d{1,2}\.\d{4})/g,  // DD.MM.YYYY
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
export function hasAuctionObjects(xmlContent: string): boolean {
  return xmlContent.includes('auctionObjects') || xmlContent.includes('Versteigerungsobjekt');
}

/**
 * Create test publication ID
 */
export function createTestPublicationId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate database record structure
 */
export function validateDatabaseRecord(record: any, expectedFields: string[]): boolean {
  if (!record) return false;
  
  return expectedFields.every(field => {
    const value = record[field];
    return value !== null && value !== undefined;
  });
}

export default {
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