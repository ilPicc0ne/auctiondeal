/**
 * End-to-End Integration Tests
 * Tests the complete pipeline from SHAB API to database storage
 */

import { ShabApiService } from '../../src/lib/shab-api';
import { ShabProcessorService } from '../../src/lib/shab-processor';
import { getPrismaClient } from '@auctiondeal/shared-ts';

describe('End-to-End Pipeline Integration Tests', () => {
  let shabApi: ShabApiService;
  let processor: ShabProcessorService;
  let prisma: NonNullable<ReturnType<typeof getPrismaClient>>;

  beforeAll(async () => {
    shabApi = new ShabApiService();
    processor = new ShabProcessorService();
    
    const client = getPrismaClient();
    if (!client) {
      throw new Error('Failed to initialize database connection for integration tests');
    }
    prisma = client;
    
    console.log('🧪 [INTEGRATION] Setting up end-to-end pipeline tests...');
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    await processor.disconnect();
    console.log('🧪 [INTEGRATION] End-to-end pipeline tests cleanup complete');
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.property.deleteMany();
    await prisma.auctionObject.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.shabPublication.deleteMany();
  });

  describe('Complete Data Flow', () => {
    test('should fetch real data from API and process it end-to-end', async () => {
      // 1. Fetch real data from SHAB API
      const publications = await shabApi.fetchHistoricalPublications(3); // Last 3 days
      
      expect(Array.isArray(publications)).toBe(true);
      console.log(`🧪 [INTEGRATION] Fetched ${publications.length} publications from API`);

      if (publications.length === 0) {
        console.log('🧪 [INTEGRATION] No publications found, skipping processing test');
        return;
      }

      // Take first publication for processing test
      const testPublications = publications.slice(0, 1);
      
      // 2. Process through complete pipeline
      const result = await processor.processPublications(testPublications);
      
      // 3. Verify processing results
      expect(result.processed).toBe(1);
      expect(result.created + result.skipped).toBe(1);
      expect(result.errors).toBe(0);

      // 4. Verify data was stored correctly
      const storedPublications = await prisma.shabPublication.count();
      expect(storedPublications).toBeGreaterThan(0);

      console.log(`✅ [INTEGRATION] End-to-end test complete: ${result.created} created, ${result.skipped} skipped`);
    }, 30000); // 30 second timeout for real API calls

    test('should handle API-to-database error scenarios', async () => {
      // Create a publication with valid structure but potential parsing issues
      const testPublication = {
        id: 'integration-test-' + Date.now(),
        publishDate: new Date().toISOString(),
        xmlContent: '<?xml version="1.0" encoding="UTF-8"?><root><test>minimal content</test></root>',
        canton: 'ZH',
        rubric: 'SB',
        subRubric: 'SB01',
        officialLanguage: 'de'
      };

      // Process through pipeline
      const result = await processor.processPublications([testPublication]);
      
      // Should process without throwing but may not create auctions due to minimal content
      expect(result.processed).toBe(1);
      expect(result.errors).toBe(0);

      // Verify publication was stored even with minimal auction data
      const storedPublication = await prisma.shabPublication.findUnique({
        where: { id: testPublication.id }
      });
      
      expect(storedPublication).toBeTruthy();
      expect(storedPublication?.processingStatus).toBe('completed');
      
      console.log('✅ [INTEGRATION] Error scenario handling verified');
    }, 15000);
  });

  describe('Data Integrity', () => {
    test('should maintain referential integrity across all tables', async () => {
      // Get a real publication and process it
      const publications = await shabApi.fetchHistoricalPublications(5);
      
      if (publications.length === 0) {
        console.log('🧪 [INTEGRATION] No publications for integrity test, creating synthetic data');
        
        // Create synthetic test data that will definitely create related records
        const syntheticPublication = {
          id: 'integrity-test-' + Date.now(),
          publishDate: new Date().toISOString(),
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <auction>
    <date>15.12.2025</date>
    <location>Test Location</location>
    <objects>
      <object order="1">Test auction object with real estate</object>
    </objects>
  </auction>
</root>`,
          canton: 'ZH',
          rubric: 'SB',
          subRubric: 'SB01',
          officialLanguage: 'de'
        };
        
        await processor.processPublications([syntheticPublication]);
      } else {
        const testPublication = publications.slice(0, 1);
        await processor.processPublications(testPublication);
      }

      // Verify all related data exists and is properly linked
      const publicationCount = await prisma.shabPublication.count();
      const auctionCount = await prisma.auction.count();
      const objectCount = await prisma.auctionObject.count();
      
      expect(publicationCount).toBeGreaterThan(0);
      
      if (auctionCount > 0) {
        // If auctions were created, verify they're properly linked
        const auctions = await prisma.auction.findMany({
          include: {
            shabPublication: true,
            auctionObjects: true
          }
        });
        
        // Verify each auction has a valid publication reference
        auctions.forEach(auction => {
          expect(auction.shabPublication).toBeTruthy();
          expect(auction.shabPublication.id).toBeTruthy();
        });
        
        console.log(`✅ [INTEGRATION] Referential integrity verified: ${publicationCount} publications, ${auctionCount} auctions, ${objectCount} objects`);
      } else {
        console.log(`✅ [INTEGRATION] Basic integrity verified: ${publicationCount} publications (no auctions created from test data)`);
      }
    }, 25000);

    test('should handle concurrent processing safely', async () => {
      // Create multiple synthetic publications for concurrent test
      const publications = Array.from({ length: 3 }, (_, i) => ({
        id: `concurrent-test-${Date.now()}-${i}`,
        publishDate: new Date().toISOString(),
        xmlContent: `<?xml version="1.0"?><root><test>Publication ${i}</test></root>`,
        canton: 'ZH',
        rubric: 'SB', 
        subRubric: 'SB01',
        officialLanguage: 'de'
      }));

      // Process concurrently
      const promises = publications.map(pub => 
        processor.processPublications([pub])
      );
      
      const results = await Promise.all(promises);
      
      // Verify all processed successfully
      results.forEach(result => {
        expect(result.processed).toBe(1);
        expect(result.errors).toBe(0);
      });
      
      // Verify all publications were stored
      const storedCount = await prisma.shabPublication.count();
      expect(storedCount).toBe(3);
      
      console.log('✅ [INTEGRATION] Concurrent processing safety verified');
    }, 20000);
  });

  describe('Performance and Scale', () => {
    test('should process multiple publications efficiently', async () => {
      const startTime = Date.now();
      
      // Get real publications or create synthetic ones
      let publications = await shabApi.fetchHistoricalPublications(10);
      
      if (publications.length < 5) {
        // Create synthetic publications if not enough real data
        const syntheticPubs = Array.from({ length: 5 }, (_, i) => ({
          id: `perf-test-${Date.now()}-${i}`,
          publishDate: new Date().toISOString(),
          xmlContent: `<?xml version="1.0"?><root><test>Performance test ${i}</test></root>`,
          canton: 'ZH',
          rubric: 'SB',
          subRubric: 'SB01', 
          officialLanguage: 'de'
        }));
        publications = publications.concat(syntheticPubs);
      }
      
      const testPublications = publications.slice(0, 5);
      
      // Process batch
      const result = await processor.processPublications(testPublications);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Verify results
      expect(result.processed).toBe(5);
      expect(result.errors).toBe(0);
      
      // Performance assertion (should process 5 publications in under 10 seconds)
      expect(processingTime).toBeLessThan(10000);
      
      console.log(`✅ [INTEGRATION] Performance test: processed 5 publications in ${processingTime}ms`);
    }, 15000);
  });
});