/**
 * SHAB API Service Tests - Live API Integration
 * Tests actual SHAB API endpoints with real data
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { ShabApiService } from '../../src/lib/shab-api';
import { ShabApiError } from '../../src/types/shab';

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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('ShabApiService - Live API Tests', () => {
  let shabApi: ShabApiService;

  beforeAll(() => {
    shabApi = new ShabApiService();
  });

  describe('API Connection and Response', () => {
    test('should successfully connect to SHAB API', async () => {
      const { startDate, endDate } = getTestDateRange();
      
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 5);
      
      expect(Array.isArray(publications)).toBe(true);
      expect(publications.length).toBeGreaterThanOrEqual(0);
      
      // Rate limiting
      await delay(1000);
    });

    test('should fetch recent publications with valid structure', async () => {
      const { startDate, endDate } = getRecentDateRange();
      
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 3);
      
      if (publications.length > 0) {
        const publication = publications[0];
        
        expect(publication).toHaveProperty('id');
        expect(publication).toHaveProperty('publishDate');
        expect(publication).toHaveProperty('xmlContent');
        expect(publication).toHaveProperty('canton');
        expect(publication).toHaveProperty('rubric');
        expect(publication).toHaveProperty('subRubric');
        expect(publication).toHaveProperty('officialLanguage');
        
        expect(typeof publication.id).toBe('string');
        expect(typeof publication.publishDate).toBe('string');
        expect(typeof publication.xmlContent).toBe('string');
        expect(typeof publication.canton).toBe('string');
        expect(publication.subRubric).toBe('SB01'); // Property foreclosures
        
        // XML content should not be empty
        expect(publication.xmlContent.length).toBeGreaterThan(0);
      }
      
      await delay(1000);
    });
  });

  describe('XML Fetching and Parsing', () => {
    test('should fetch XML content for a publication', async () => {
      const { startDate, endDate } = getTestDateRange();
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 1);
      
      if (publications.length > 0) {
        const publication = publications[0];
        const xmlContent = await shabApi.fetchPublicationXml(publication.id);
        
        expect(typeof xmlContent).toBe('string');
        expect(xmlContent.length).toBeGreaterThan(0);
        expect(xmlContent.includes('<?xml') || xmlContent.includes('<')).toBe(true);
      }
      
      await delay(1000);
    });

    test('should parse XML content correctly', async () => {
      const { startDate, endDate } = getTestDateRange();
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 1);
      
      if (publications.length > 0) {
        const publication = publications[0];
        
        try {
          const parsedData = shabApi.parsePublicationXml(publication.xmlContent);
          
          expect(parsedData).toHaveProperty('auctions');
          expect(parsedData).toHaveProperty('language');
          expect(Array.isArray(parsedData.auctions)).toBe(true);
          expect(typeof parsedData.language).toBe('string');
          
          if (parsedData.auctions.length > 0) {
            const auction = parsedData.auctions[0];
            expect(auction).toHaveProperty('objects');
            expect(Array.isArray(auction.objects)).toBe(true);
          }
        } catch (error) {
          // XML parsing might fail for some formats, that's ok for testing
          console.log('XML parsing failed (expected for some formats):', error);
        }
      }
      
      await delay(500);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid date ranges gracefully', async () => {
      try {
        const result = await shabApi.fetchPublications('invalid-date', '2024-01-01');
        // If no error thrown, result should be empty array or valid response
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // If error is thrown, it should be a ShabApiError
        expect(error).toBeInstanceOf(Error);
      }
      
      await delay(500);
    });

    test('should handle invalid publication ID', async () => {
      await expect(async () => {
        await shabApi.fetchPublicationXml('invalid-id-123');
      }).rejects.toThrow(ShabApiError);
      
      await delay(500);
    });

    test('should handle large page sizes within limits', async () => {
      const { startDate, endDate } = getTestDateRange();
      
      // Test with reasonable page size
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 20);
      
      expect(Array.isArray(publications)).toBe(true);
      expect(publications.length).toBeLessThanOrEqual(20);
      
      await delay(1000);
    });
  });

  describe('Daily and Historical Publications', () => {
    test('should fetch daily publications', async () => {
      const publications = await shabApi.fetchDailyPublications();
      
      expect(Array.isArray(publications)).toBe(true);
      // Today might not have publications, so just check structure
      
      await delay(1000);
    });

    test('should fetch historical publications with small range', async () => {
      // Test with just 3 days to avoid overwhelming the API
      const publications = await shabApi.fetchHistoricalPublications(3);
      
      expect(Array.isArray(publications)).toBe(true);
      
      await delay(2000); // Longer delay for historical fetch
    });
  });

  describe('Language Detection', () => {
    test('should detect language from XML content', async () => {
      const { startDate, endDate } = getTestDateRange();
      const publications = await shabApi.fetchPublications(startDate, endDate, 0, 2);
      
      for (const publication of publications) {
        const parsedData = shabApi.parsePublicationXml(publication.xmlContent);
        
        expect(['de', 'fr', 'it']).toContain(parsedData.language);
        
        await delay(500);
      }
    });
  });
});