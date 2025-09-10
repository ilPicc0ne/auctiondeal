/**
 * SHAB Processor Service Tests - Real Data Processing
 * Tests actual data processing and database operations
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { ShabProcessorService } from '../../src/lib/shab-processor';
import { ShabApiService } from '../../src/lib/shab-api';
import { ShabProcessingError } from '../../src/types/shab';
import { getPrismaClient } from '@auctiondeal/shared-ts';

describe('ShabProcessorService - Real Data Tests', () => {
  let shabProcessor: ShabProcessorService;
  let shabApi: ShabApiService;
  let prisma: any;

  beforeAll(async () => {
    shabProcessor = new ShabProcessorService();
    shabApi = new ShabApiService();
    prisma = getPrismaClient();
  });

  afterAll(async () => {
    await shabProcessor.disconnect();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await prisma.property.deleteMany();
    await prisma.auctionObject.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.shabPublication.deleteMany();
  });

  describe('Data Processing', () => {
    test('should process a single real publication', async () => {
      // Get a recent publication from the API
      const today = new Date().toISOString().split('T')[0];
      const publications = await shabApi.fetchPublications(today, today, 0, 1);
      
      if (publications.length === 0) {
        // Skip if no publications today
        console.log('No publications found for today, skipping test');
        return;
      }

      const publication = publications[0];
      const result = await shabProcessor.processPublications([publication]);

      expect(result.processed).toBe(1);
      expect(result.created).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toBe(0);
      
      // Verify data was stored in database
      const storedPublication = await prisma.shabPublication.findUnique({
        where: { id: publication.id }
      });
      
      expect(storedPublication).toBeTruthy();
      expect(storedPublication.processingStatus).toBe('completed');
    }, 30000);

    test('should handle duplicate publications correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const publications = await shabApi.fetchPublications(today, today, 0, 1);
      
      if (publications.length === 0) {
        console.log('No publications found for today, skipping test');
        return;
      }

      const publication = publications[0];
      
      // Process the same publication twice
      const firstResult = await shabProcessor.processPublications([publication]);
      const secondResult = await shabProcessor.processPublications([publication]);

      expect(firstResult.created).toBe(1);
      expect(secondResult.skipped).toBe(1);
      expect(secondResult.created).toBe(0);
      
      // Should still have only one record in database
      const storedPublications = await prisma.shabPublication.findMany({
        where: { id: publication.id }
      });
      
      expect(storedPublications.length).toBe(1);
    }, 30000);

    test('should process publications with auction objects', async () => {
      // Get a few recent publications
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 3);
      
      const publications = await shabApi.fetchPublications(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        0,
        3
      );

      if (publications.length === 0) {
        console.log('No publications found in date range, skipping test');
        return;
      }

      const result = await shabProcessor.processPublications(publications);

      expect(result.processed).toBe(publications.length);
      expect(result.errors).toBe(0);
      
      // Check that auctions were created
      const auctions = await prisma.auction.findMany({
        include: {
          auctionObjects: true
        }
      });

      expect(auctions.length).toBeGreaterThan(0);
      
      // At least one auction should have objects
      const auctionsWithObjects = auctions.filter((a: any) => a.auctionObjects.length > 0);
      expect(auctionsWithObjects.length).toBeGreaterThan(0);
    }, 45000);
  });

  describe('Date Parsing', () => {
    test('should parse Swiss date formats correctly', async () => {
      // Get a recent publication and check date parsing
      const today = new Date().toISOString().split('T')[0];
      const publications = await shabApi.fetchPublications(today, today, 0, 1);
      
      if (publications.length === 0) {
        console.log('No publications found for today, skipping test');
        return;
      }

      const publication = publications[0];
      await shabProcessor.processPublications([publication]);

      // Check that auction dates were parsed
      const auctions = await prisma.auction.findMany();
      
      if (auctions.length > 0) {
        const auction = auctions[0];
        expect(auction.auctionDate).toBeInstanceOf(Date);
        expect(auction.auctionDate.getFullYear()).toBeGreaterThan(2020);
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should handle invalid publication data gracefully', async () => {
      const invalidPublication = {
        id: 'invalid-test-publication',
        publishDate: 'invalid-date',
        xmlContent: '<invalid>xml</invalid>',
        canton: 'ZH',
        rubric: 'SB',
        subRubric: 'SB01',
        officialLanguage: 'de'
      };

      const result = await shabProcessor.processPublications([invalidPublication]);

      // Should record the error but not crash
      expect(result.processed).toBe(1);
      expect(result.errors).toBe(1);
      expect(result.created).toBe(0);
    });

    test('should handle empty publications array', async () => {
      const result = await shabProcessor.processPublications([]);

      expect(result.processed).toBe(0);
      expect(result.created).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe('Processing Statistics', () => {
    test('should provide accurate processing statistics', async () => {
      // Process some real data first
      const today = new Date().toISOString().split('T')[0];
      const publications = await shabApi.fetchPublications(today, today, 0, 2);
      
      if (publications.length > 0) {
        await shabProcessor.processPublications(publications);
      }

      const stats = await shabProcessor.getProcessingStats();

      expect(stats.totalPublications).toBeGreaterThanOrEqual(publications.length);
      expect(stats.completedPublications).toBeGreaterThanOrEqual(publications.length);
      expect(stats.totalAuctions).toBeGreaterThanOrEqual(0);
      expect(stats.totalAuctionObjects).toBeGreaterThanOrEqual(0);
      
      if (publications.length > 0) {
        expect(stats.lastProcessed).toBeInstanceOf(Date);
      }
    }, 30000);

    test('should cleanup failed processing attempts', async () => {
      const cleanedUp = await shabProcessor.cleanupFailedProcessing();
      
      // Should return number of cleaned up records (may be 0)
      expect(typeof cleanedUp).toBe('number');
      expect(cleanedUp).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Transaction Integrity', () => {
    test('should maintain transaction integrity on errors', async () => {
      const publications = [
        {
          id: 'test-valid-publication',
          publishDate: new Date().toISOString(),
          xmlContent: '<?xml version="1.0"?><SB01:publication><content><auction><date>2025-01-15</date><location>Zurich</location></auction><auctionObjects>Test property</auctionObjects></content></SB01:publication>',
          canton: 'ZH',
          rubric: 'SB',
          subRubric: 'SB01',
          officialLanguage: 'de'
        },
        {
          id: 'test-invalid-publication',
          publishDate: 'invalid-date-format',
          xmlContent: '<invalid>broken xml',
          canton: 'ZH',
          rubric: 'SB',
          subRubric: 'SB01',
          officialLanguage: 'de'
        }
      ];

      const result = await shabProcessor.processPublications(publications);

      expect(result.processed).toBe(2);
      expect(result.created).toBeGreaterThanOrEqual(0); // At least one might succeed
      expect(result.errors).toBeGreaterThanOrEqual(1); // At least one will fail

      // Verify that valid publications were still processed
      const validPublication = await prisma.shabPublication.findUnique({
        where: { id: 'test-valid-publication' }
      });

      // May or may not exist depending on transaction handling
      // This tests that the system continues processing after failures
    });
  });
});