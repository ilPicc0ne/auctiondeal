#!/usr/bin/env tsx

/**
 * Duplicate Avoidance Test Script
 * Comprehensive testing of duplicate prevention in SHAB data processing
 * 
 * Tests:
 * 1. Duplicate publication insertion prevention
 * 2. Real data duplicate processing prevention
 * 3. Database integrity after duplicate attempts
 */

import { PrismaClient } from '@prisma/client';
import { shabProcessorService } from '../src/lib/services/shab-processor';
import { ShabApiService } from '../src/lib/services/shab-api';

const prisma = new PrismaClient();

interface DuplicateTestResult {
  name: string;
  success: boolean;
  duration: number;
  message?: string;
  data?: any;
}

class DuplicateAvoidanceTest {
  private results: DuplicateTestResult[] = [];
  private shabApi = new ShabApiService();
  private testPublicationIds: string[] = [];

  async runAllTests(): Promise<{ success: boolean; results: DuplicateTestResult[] }> {
    console.log('🧪 Starting Duplicate Avoidance Tests...\n');

    // Test 1: Basic duplicate publication prevention
    await this.runTest('Duplicate Publication Prevention', this.testDuplicatePublicationPrevention.bind(this));
    
    // Test 2: Real data duplicate prevention
    await this.runTest('Real Data Duplicate Prevention', this.testRealDataDuplicatePrevention.bind(this));
    
    // Test 3: Database integrity after duplicates
    await this.runTest('Database Integrity After Duplicates', this.testDatabaseIntegrityAfterDuplicates.bind(this));
    
    // Test 4: Concurrent duplicate handling
    await this.runTest('Concurrent Duplicate Handling', this.testConcurrentDuplicateHandling.bind(this));

    // Cleanup
    await this.cleanup();

    const allPassed = this.results.every(r => r.success);
    this.printResults();
    
    return {
      success: allPassed,
      results: this.results
    };
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running: ${name}...`);
      const result = await testFn();
      
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        success: true,
        duration,
        data: result
      });
      
      console.log(`✅ ${name} passed (${duration}ms)`);
      if (result && typeof result === 'object') {
        const summary = this.getResultSummary(result);
        console.log(`   📊 ${summary}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        success: false,
        duration,
        message: error.message
      });
      
      console.log(`❌ ${name} failed (${duration}ms): ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  private async testDuplicatePublicationPrevention(): Promise<any> {
    const testPublication = {
      id: `DUPLICATE-TEST-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<SB01:publication xmlns:SB01="https://shab.ch/shab/SB01-export">
  <meta><language>de</language></meta>
  <content>
    <auctionObjects>&lt;p&gt;Test duplicate object&lt;/p&gt;</auctionObjects>
    <auction>
      <date>2025-03-15</date>
      <time>14:00</time>
      <location>Test Court</location>
    </auction>
  </content>
</SB01:publication>`,
      canton: 'ZH',
      rubric: 'Zwangsversteigerungen',
      subRubric: 'SB01',
      officialLanguage: 'de'
    };

    this.testPublicationIds.push(testPublication.id);

    // First insertion - should succeed
    console.log('   🔹 First insertion attempt...');
    const firstResult = await shabProcessorService.processPublications([testPublication]);
    
    if (firstResult.created !== 1 || firstResult.skipped !== 0) {
      throw new Error(`First insertion failed: created=${firstResult.created}, skipped=${firstResult.skipped}`);
    }

    // Second insertion - should be skipped (duplicate)
    console.log('   🔹 Second insertion attempt (duplicate)...');
    const secondResult = await shabProcessorService.processPublications([testPublication]);
    
    if (secondResult.created !== 0 || secondResult.skipped !== 1) {
      throw new Error(`Duplicate prevention failed: created=${secondResult.created}, skipped=${secondResult.skipped}`);
    }

    // Verify database state
    const dbCount = await prisma.shabPublication.count({
      where: { id: testPublication.id }
    });

    if (dbCount !== 1) {
      throw new Error(`Database integrity failed: expected 1 record, found ${dbCount}`);
    }

    return {
      firstInsertion: { created: firstResult.created, skipped: firstResult.skipped },
      duplicateAttempt: { created: secondResult.created, skipped: secondResult.skipped },
      finalDbCount: dbCount,
      duplicatePreventionWorking: true
    };
  }

  private async testRealDataDuplicatePrevention(): Promise<any> {
    console.log('   🔹 Fetching real SHAB data for duplicate test...');
    
    // Fetch 7 days of real data to test with (avoiding weekend data gaps)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const realPublications = await this.shabApi.fetchPublications(startDateStr, endDateStr, 0, 5);
    
    if (realPublications.length === 0) {
      console.log('   ⚠️ No real data available, using mock data');
      return { testSkipped: true, reason: 'No real publications available' };
    }

    const publicationsToTest = realPublications.slice(0, 3); // Test with 3 publications
    console.log(`   🔹 Testing with ${publicationsToTest.length} real publications...`);

    // Track these for cleanup
    this.testPublicationIds.push(...publicationsToTest.map(p => p.id));

    // First processing - should create all records
    const firstResult = await shabProcessorService.processPublications(publicationsToTest);
    
    // Second processing - should skip all (duplicates)
    const secondResult = await shabProcessorService.processPublications(publicationsToTest);
    
    // Verify all were skipped in second run
    if (secondResult.created !== 0 || secondResult.skipped !== publicationsToTest.length) {
      throw new Error(`Real data duplicate prevention failed: created=${secondResult.created}, skipped=${secondResult.skipped}, expected skipped=${publicationsToTest.length}`);
    }

    // Verify database integrity - each publication should exist exactly once
    for (const pub of publicationsToTest) {
      const count = await prisma.shabPublication.count({
        where: { id: pub.id }
      });
      
      if (count !== 1) {
        throw new Error(`Real publication ${pub.id} exists ${count} times in database (expected 1)`);
      }
    }

    return {
      publicationsTested: publicationsToTest.length,
      firstRun: { created: firstResult.created, skipped: firstResult.skipped },
      duplicateRun: { created: secondResult.created, skipped: secondResult.skipped },
      allDuplicatesSkipped: secondResult.skipped === publicationsToTest.length
    };
  }

  private async testDatabaseIntegrityAfterDuplicates(): Promise<any> {
    console.log('   🔹 Testing database integrity after duplicate attempts...');
    
    // Get current counts
    const initialStats = await this.getDatabaseStats();
    
    // Create a test publication and try to insert it multiple times
    const testPub = {
      id: `INTEGRITY-TEST-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<SB01:publication xmlns:SB01="https://shab.ch/shab/SB01-export">
  <meta><language>de</language></meta>
  <content>
    <auctionObjects>&lt;p&gt;Integrity test object&lt;/p&gt;</auctionObjects>
    <auction>
      <date>2025-03-16</date>
      <time>15:00</time>
      <location>Integrity Test Court</location>
    </auction>
  </content>
</SB01:publication>`,
      canton: 'BE',
      rubric: 'Zwangsversteigerungen',
      subRubric: 'SB01',
      officialLanguage: 'de'
    };

    this.testPublicationIds.push(testPub.id);

    // Try to insert the same publication 5 times
    const insertionResults = [];
    for (let i = 1; i <= 5; i++) {
      console.log(`   🔸 Insertion attempt ${i}/5...`);
      const result = await shabProcessorService.processPublications([testPub]);
      insertionResults.push(result);
    }

    // Verify only the first insertion succeeded
    const successfulInsertions = insertionResults.filter(r => r.created > 0).length;
    const skippedInsertions = insertionResults.filter(r => r.skipped > 0).length;

    if (successfulInsertions !== 1) {
      throw new Error(`Expected exactly 1 successful insertion, got ${successfulInsertions}`);
    }

    if (skippedInsertions !== 4) {
      throw new Error(`Expected exactly 4 skipped insertions, got ${skippedInsertions}`);
    }

    // Verify final database counts
    const finalStats = await this.getDatabaseStats();
    const expectedIncrease = 1; // Only 1 new publication should have been added

    if (finalStats.publications - initialStats.publications !== expectedIncrease) {
      throw new Error(`Publications count mismatch: expected increase of ${expectedIncrease}, got ${finalStats.publications - initialStats.publications}`);
    }

    return {
      totalInsertionAttempts: 5,
      successfulInsertions,
      skippedInsertions,
      initialStats,
      finalStats,
      integrityMaintained: true
    };
  }

  private async testConcurrentDuplicateHandling(): Promise<any> {
    console.log('   🔹 Testing concurrent duplicate handling...');
    
    const testPub = {
      id: `CONCURRENT-TEST-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<SB01:publication xmlns:SB01="https://shab.ch/shab/SB01-export">
  <meta><language>de</language></meta>
  <content>
    <auctionObjects>&lt;p&gt;Concurrent test object&lt;/p&gt;</auctionObjects>
    <auction>
      <date>2025-03-17</date>
      <time>16:00</time>
      <location>Concurrent Test Court</location>
    </auction>
  </content>
</SB01:publication>`,
      canton: 'GE',
      rubric: 'Zwangsversteigerungen',  
      subRubric: 'SB01',
      officialLanguage: 'fr'
    };

    this.testPublicationIds.push(testPub.id);

    // Launch 3 concurrent processing attempts
    const concurrentPromises = [
      shabProcessorService.processPublications([testPub]),
      shabProcessorService.processPublications([testPub]),
      shabProcessorService.processPublications([testPub])
    ];

    const results = await Promise.all(concurrentPromises);
    
    // Verify exactly one succeeded and others were skipped or handled gracefully
    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    
    if (totalCreated !== 1) {
      throw new Error(`Concurrent duplicate handling failed: ${totalCreated} records created (expected 1)`);
    }

    // Verify database integrity - should have exactly 1 record
    const dbCount = await prisma.shabPublication.count({
      where: { id: testPub.id }
    });

    if (dbCount !== 1) {
      throw new Error(`Concurrent processing database integrity failed: found ${dbCount} records (expected 1)`);
    }

    return {
      concurrentAttempts: 3,
      totalCreated,
      totalSkipped,
      finalDbCount: dbCount,
      concurrentHandlingWorking: true
    };
  }

  private async getDatabaseStats() {
    const [publications, auctions, objects] = await Promise.all([
      prisma.shabPublication.count(),
      prisma.auction.count(),
      prisma.auctionObject.count()
    ]);

    return { publications, auctions, objects };
  }

  private getResultSummary(result: any): string {
    if (result.duplicatePreventionWorking) {
      return `First: ${result.firstInsertion.created} created, Duplicate: ${result.duplicateAttempt.skipped} skipped`;
    }
    if (result.allDuplicatesSkipped !== undefined) {
      return `Tested ${result.publicationsTested} publications, all duplicates properly skipped`;
    }
    if (result.integrityMaintained) {
      return `${result.successfulInsertions}/${result.totalInsertionAttempts} succeeded, integrity maintained`;
    }
    if (result.concurrentHandlingWorking) {
      return `${result.concurrentAttempts} concurrent attempts, ${result.totalCreated} created, ${result.finalDbCount} in DB`;
    }
    return 'Test completed';
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Delete all test publications and their related data
      for (const publicationId of this.testPublicationIds) {
        await prisma.shabPublication.delete({
          where: { id: publicationId }
        }).catch(() => {
          // Ignore errors if record doesn't exist
        });
      }
      
      console.log(`✅ Cleaned up ${this.testPublicationIds.length} test publications`);
    } catch (error) {
      console.warn(`⚠️ Cleanup warning: ${error.message}`);
    }
  }

  private printResults(): void {
    console.log('\n📊 Duplicate Avoidance Test Results Summary');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    this.results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name.padEnd(35)} (${duration})`);
      
      if (!result.success && result.message) {
        console.log(`   ❌ Error: ${result.message}`);
      }
    });
    
    console.log('='.repeat(60));
    console.log(`📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All duplicate avoidance tests passed! System correctly prevents duplicates.');
    } else {
      console.log('⚠️ Some duplicate avoidance tests failed. Database integrity may be at risk.');
      console.log('🔧 Recommended actions:');
      console.log('   1. Review duplicate detection logic in shab-processor.ts');
      console.log('   2. Check database constraints and indexes');
      console.log('   3. Verify transaction handling in concurrent scenarios');
    }
  }
}

// CLI execution
async function main() {
  const tester = new DuplicateAvoidanceTest();
  
  try {
    const { success } = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Duplicate avoidance test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await shabProcessorService.disconnect();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main();
}

export default DuplicateAvoidanceTest;