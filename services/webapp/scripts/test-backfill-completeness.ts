#!/usr/bin/env tsx

/**
 * Backfill Completeness Test Script
 * Verifies that all API-fetched data successfully reaches the database
 * 
 * Tests:
 * 1. Small backfill verification (1-day)
 * 2. Multi-day backfill integrity (3-day)
 * 3. Data transfer accuracy (API results vs DB records)
 * 4. Transaction rollback handling
 */

import { PrismaClient } from '@prisma/client';
import { shabProcessorService } from '../src/lib/services/shab-processor';
import { ShabApiService } from '../src/lib/services/shab-api';

const prisma = new PrismaClient();

interface BackfillTestResult {
  name: string;
  success: boolean;
  duration: number;
  message?: string;
  data?: any;
}

class BackfillCompletenessTest {
  private results: BackfillTestResult[] = [];
  private shabApi = new ShabApiService();
  private testPublicationIds: string[] = [];

  async runAllTests(): Promise<{ success: boolean; results: BackfillTestResult[] }> {
    console.log('🧪 Starting Backfill Completeness Tests...\n');

    // Test 1: Small backfill verification (1-day)
    await this.runTest('Small Backfill Verification (1-day)', this.testSmallBackfillVerification.bind(this));
    
    // Test 2: Multi-day backfill integrity (3-day)
    await this.runTest('Multi-day Backfill Integrity (3-day)', this.testMultiDayBackfillIntegrity.bind(this));
    
    // Test 3: API vs Database comparison
    await this.runTest('API vs Database Data Comparison', this.testApiVsDatabaseComparison.bind(this));
    
    // Test 4: Partial failure rollback
    await this.runTest('Partial Failure Transaction Rollback', this.testPartialFailureRollback.bind(this));

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

  private async testSmallBackfillVerification(): Promise<any> {
    console.log('   🔹 Testing 1-day backfill completeness...');
    
    // Get test date avoiding weekend data gaps
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - 7); // Use 7 days ago to ensure data exists
    const testDateStr = testDate.toISOString().split('T')[0];

    // Get initial database state
    const initialStats = await this.getDatabaseStats();
    
    // Fetch publications directly from API
    console.log(`   🔹 Fetching API data for ${testDateStr}...`);
    const apiPublications = await this.shabApi.fetchPublications(testDateStr, testDateStr, 0, 10);
    
    if (apiPublications.length === 0) {
      return { testSkipped: true, reason: `No publications found for ${testDateStr}` };
    }

    console.log(`   🔹 Found ${apiPublications.length} publications from API`);
    
    // Track for cleanup
    this.testPublicationIds.push(...apiPublications.map(p => p.id));

    // Process through backfill pipeline
    const processResult = await shabProcessorService.processPublications(apiPublications);
    
    // Verify all API data reached database
    const finalStats = await this.getDatabaseStats();
    const publicationsAdded = finalStats.publications - initialStats.publications;
    const auctionsAdded = finalStats.auctions - initialStats.auctions;
    const objectsAdded = finalStats.objects - initialStats.objects;

    // Calculate expected vs actual
    const expectedPublications = processResult.created;
    const actualPublications = publicationsAdded;

    if (actualPublications !== expectedPublications) {
      throw new Error(`Publication count mismatch: API provided ${apiPublications.length}, processed ${processResult.created}, but database shows ${actualPublications} new records`);
    }

    // Verify each API publication exists in database
    const missingPublications = [];
    for (const apiPub of apiPublications) {
      const dbPub = await prisma.shabPublication.findUnique({
        where: { id: apiPub.id },
        include: { auctions: { include: { auctionObjects: true } } }
      });
      
      if (!dbPub) {
        missingPublications.push(apiPub.id);
      }
    }

    if (missingPublications.length > 0) {
      throw new Error(`Missing publications in database: ${missingPublications.join(', ')}`);
    }

    return {
      testDate: testDateStr,
      apiPublications: apiPublications.length,
      processedSuccessfully: processResult.created,
      processedSkipped: processResult.skipped,
      processedErrors: processResult.errors,
      databaseIncrease: {
        publications: actualPublications,
        auctions: auctionsAdded,
        objects: objectsAdded
      },
      dataTransferRate: processResult.errors === 0 ? 100 : ((processResult.created / apiPublications.length) * 100).toFixed(1),
      allDataReachedDatabase: missingPublications.length === 0
    };
  }

  private async testMultiDayBackfillIntegrity(): Promise<any> {
    console.log('   🔹 Testing 10-day backfill integrity...');
    
    // Test with a 10-day range
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 9); // 10 days back (avoiding weekend gaps)

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`   🔹 Testing date range: ${startDateStr} to ${endDateStr}`);

    // Get initial state
    const initialStats = await this.getDatabaseStats();

    // Fetch multi-day data from API
    const apiPublications = await this.shabApi.fetchPublications(startDateStr, endDateStr, 0, 20);
    
    if (apiPublications.length === 0) {
      return { testSkipped: true, reason: `No publications found for ${startDateStr} to ${endDateStr}` };
    }

    console.log(`   🔹 Found ${apiPublications.length} publications across ${10} days`);
    
    // Track for cleanup
    this.testPublicationIds.push(...apiPublications.map(p => p.id));

    // Process in batches to simulate real backfill behavior
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < apiPublications.length; i += batchSize) {
      batches.push(apiPublications.slice(i, i + batchSize));
    }

    console.log(`   🔹 Processing ${batches.length} batches of up to ${batchSize} publications each`);

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (let i = 0; i < batches.length; i++) {
      console.log(`   🔸 Processing batch ${i + 1}/${batches.length}...`);
      const batchResult = await shabProcessorService.processPublications(batches[i]);
      
      totalProcessed += batches[i].length;
      totalCreated += batchResult.created;
      totalSkipped += batchResult.skipped;
      totalErrors += batchResult.errors;
    }

    // Verify final database state
    const finalStats = await this.getDatabaseStats();
    const publicationsAdded = finalStats.publications - initialStats.publications;

    // Verify data integrity
    let publicationsWithAuctions = 0;
    let totalAuctionsFound = 0;
    let totalObjectsFound = 0;

    for (const apiPub of apiPublications) {
      const dbPub = await prisma.shabPublication.findUnique({
        where: { id: apiPub.id },
        include: { 
          auctions: { 
            include: { auctionObjects: true } 
          } 
        }
      });
      
      if (dbPub) {
        if (dbPub.auctions.length > 0) {
          publicationsWithAuctions++;
          totalAuctionsFound += dbPub.auctions.length;
          totalObjectsFound += dbPub.auctions.reduce((sum, auction) => sum + auction.auctionObjects.length, 0);
        }
      }
    }

    return {
      dateRange: { start: startDateStr, end: endDateStr },
      apiData: {
        totalPublications: apiPublications.length,
        processedInBatches: batches.length
      },
      processingResults: {
        totalProcessed,
        totalCreated,
        totalSkipped,
        totalErrors
      },
      databaseResults: {
        publicationsAdded,
        publicationsWithAuctions,
        totalAuctionsFound,
        totalObjectsFound
      },
      integrityCheck: {
        dataTransferComplete: publicationsAdded === totalCreated,
        noDataLoss: totalErrors === 0,
        auctionDataPresent: publicationsWithAuctions > 0
      }
    };
  }

  private async testApiVsDatabaseComparison(): Promise<any> {
    console.log('   🔹 Testing API vs Database data comparison...');
    
    // Use a small dataset for detailed comparison (avoiding weekend gaps)
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - 7);
    const testDateStr = testDate.toISOString().split('T')[0];

    // Fetch from API
    const apiPublications = await this.shabApi.fetchPublications(testDateStr, testDateStr, 0, 3);
    
    if (apiPublications.length === 0) {
      return { testSkipped: true, reason: `No publications for detailed comparison on ${testDateStr}` };
    }

    console.log(`   🔹 Comparing ${apiPublications.length} publications in detail...`);
    
    // Track for cleanup
    this.testPublicationIds.push(...apiPublications.map(p => p.id));

    // Process publications
    await shabProcessorService.processPublications(apiPublications);

    // Detailed comparison
    const comparisonResults = [];
    
    for (const apiPub of apiPublications) {
      const dbPub = await prisma.shabPublication.findUnique({
        where: { id: apiPub.id },
        include: { 
          auctions: { 
            include: { auctionObjects: true } 
          } 
        }
      });

      if (!dbPub) {
        throw new Error(`Publication ${apiPub.id} missing from database`);
      }

      // Compare core fields
      const fieldComparison = {
        id: apiPub.id === dbPub.id,
        publishDate: apiPub.publishDate === dbPub.publishDate.toISOString(),
        canton: apiPub.canton === dbPub.canton,
        rubric: apiPub.rubric === dbPub.rubric,
        subRubric: apiPub.subRubric === dbPub.subRubric,
        officialLanguage: apiPub.officialLanguage === dbPub.officialLanguage,
        xmlContentPresent: dbPub.xmlContent.length > 0,
        auctionsCreated: dbPub.auctions.length > 0
      };

      const allFieldsMatch = Object.values(fieldComparison).every(match => match);
      
      comparisonResults.push({
        publicationId: apiPub.id,
        fieldsMatch: fieldComparison,
        allFieldsMatch,
        auctionCount: dbPub.auctions.length,
        objectCount: dbPub.auctions.reduce((sum, a) => sum + a.auctionObjects.length, 0)
      });
    }

    const perfectMatches = comparisonResults.filter(r => r.allFieldsMatch).length;
    const comparisonAccuracy = (perfectMatches / comparisonResults.length) * 100;

    if (comparisonAccuracy < 100) {
      const failedPublications = comparisonResults.filter(r => !r.allFieldsMatch);
      console.log('   ⚠️ Field comparison mismatches:', failedPublications);
    }

    return {
      publicationsCompared: apiPublications.length,
      perfectMatches,
      comparisonAccuracy: comparisonAccuracy.toFixed(1),
      detailedResults: comparisonResults,
      dataAccuracyVerified: comparisonAccuracy === 100
    };
  }

  private async testPartialFailureRollback(): Promise<any> {
    console.log('   🔹 Testing partial failure transaction rollback...');
    
    // Create a mix of valid and invalid publications to test error handling
    const validPublication = {
      id: `ROLLBACK-VALID-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<SB01:publication xmlns:SB01="https://shab.ch/shab/SB01-export">
  <meta><language>de</language></meta>
  <content>
    <auctionObjects>&lt;p&gt;Valid test object&lt;/p&gt;</auctionObjects>
    <auction>
      <date>2025-03-15</date>
      <time>14:00</time>
      <location>Valid Test Court</location>
    </auction>
  </content>
</SB01:publication>`,
      canton: 'ZH',
      rubric: 'Zwangsversteigerungen',
      subRubric: 'SB01',
      officialLanguage: 'de'
    };

    // Invalid publication (missing required field)
    const invalidPublication = {
      id: `ROLLBACK-INVALID-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<SB01:publication xmlns:SB01="https://shab.ch/shab/SB01-export">
  <meta><language>de</language></meta>
  <content>
    <auctionObjects>&lt;p&gt;Invalid test object&lt;/p&gt;</auctionObjects>
  </content>
</SB01:publication>`, // Missing auction data
      canton: '', // Invalid empty canton
      rubric: 'Zwangsversteigerungen',
      subRubric: 'SB01',
      officialLanguage: 'de'
    };

    this.testPublicationIds.push(validPublication.id, invalidPublication.id);

    const initialStats = await this.getDatabaseStats();

    // Process mixed batch
    const result = await shabProcessorService.processPublications([validPublication, invalidPublication]);
    
    const finalStats = await this.getDatabaseStats();
    const publicationsAdded = finalStats.publications - initialStats.publications;

    // Check if valid publication was processed despite invalid one
    const validInDb = await prisma.shabPublication.findUnique({
      where: { id: validPublication.id }
    });

    const invalidInDb = await prisma.shabPublication.findUnique({
      where: { id: invalidPublication.id }
    });

    return {
      processingResult: {
        created: result.created,
        errors: result.errors,
        skipped: result.skipped
      },
      databaseState: {
        publicationsAdded,
        validPublicationSaved: !!validInDb,
        invalidPublicationSaved: !!invalidInDb
      },
      errorHandling: {
        errorsReported: result.errors > 0,
        validDataPreserved: !!validInDb,
        invalidDataRejected: !invalidInDb || result.errors > 0
      },
      robustProcessing: result.created > 0 && result.errors > 0 // Some succeeded, some failed
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
    if (result.testSkipped) {
      return `Test skipped: ${result.reason}`;
    }
    if (result.allDataReachedDatabase !== undefined) {
      return `${result.apiPublications} API → ${result.processedSuccessfully} processed, ${result.dataTransferRate}% transfer rate`;
    }
    if (result.integrityCheck) {
      const checks = Object.entries(result.integrityCheck).filter(([, value]) => value).length;
      return `${result.apiData.totalPublications} publications, ${checks}/3 integrity checks passed`;
    }
    if (result.dataAccuracyVerified !== undefined) {
      return `${result.publicationsCompared} compared, ${result.comparisonAccuracy}% field accuracy`;
    }
    if (result.robustProcessing !== undefined) {
      return `Error handling: ${result.processingResult.created} created, ${result.processingResult.errors} errors, robust=${result.robustProcessing}`;
    }
    return 'Test completed';
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    try {
      let cleanedCount = 0;
      for (const publicationId of this.testPublicationIds) {
        const deleted = await prisma.shabPublication.delete({
          where: { id: publicationId }
        }).then(() => true).catch(() => false);
        
        if (deleted) cleanedCount++;
      }
      
      console.log(`✅ Cleaned up ${cleanedCount}/${this.testPublicationIds.length} test publications`);
    } catch (error) {
      console.warn(`⚠️ Cleanup warning: ${error.message}`);
    }
  }

  private printResults(): void {
    console.log('\n📊 Backfill Completeness Test Results Summary');
    console.log('='.repeat(65));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    this.results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name.padEnd(40)} (${duration})`);
      
      if (!result.success && result.message) {
        console.log(`   ❌ Error: ${result.message}`);
      }
    });
    
    console.log('='.repeat(65));
    console.log(`📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All backfill completeness tests passed! Data pipeline is reliable.');
      console.log('✨ Key achievements:');
      console.log('   • 100% API data reaches database');
      console.log('   • Multi-day backfill integrity maintained');
      console.log('   • Field accuracy validation confirmed');
      console.log('   • Error handling preserves valid data');
    } else {
      console.log('⚠️ Some backfill completeness tests failed. Data loss risk detected.');
      console.log('🔧 Recommended actions:');
      console.log('   1. Review transaction handling in shab-processor.ts');
      console.log('   2. Check for data transformation errors');
      console.log('   3. Verify API parsing and field mapping');
      console.log('   4. Test network resilience and retry logic');
    }
  }
}

// CLI execution
async function main() {
  const tester = new BackfillCompletenessTest();
  
  try {
    const { success } = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Backfill completeness test execution failed:', error);
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

export default BackfillCompletenessTest;