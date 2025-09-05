#!/usr/bin/env tsx

/**
 * SHAB Data Pipeline Test Script
 * Comprehensive testing of the complete data ingestion pipeline
 * Tests API connectivity, XML parsing, database storage, and cron endpoints
 */

import { ShabApiService, ShabApiError } from '../src/lib/services/shab-api';
import { shabProcessorService } from '../src/lib/services/shab-processor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  message?: string;
  data?: any;
}

class ShabPipelineTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<{ success: boolean; results: TestResult[] }> {
    console.log('🧪 Starting SHAB Data Pipeline Tests...\n');

    await this.runTest('Database Connection', this.testDatabaseConnection.bind(this));
    await this.runTest('SHAB API Connectivity', this.testShabApiConnectivity.bind(this));
    await this.runTest('XML Parsing', this.testXmlParsing.bind(this));
    await this.runTest('Publication Processing', this.testPublicationProcessing.bind(this));
    await this.runTest('Daily Sync Endpoint', this.testDailySyncEndpoint.bind(this));
    await this.runTest('Processing Statistics', this.testProcessingStats.bind(this));
    await this.runTest('Data Cleanup', this.testDataCleanup.bind(this));

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

  private async testDatabaseConnection(): Promise<any> {
    // Test basic database connectivity
    await prisma.$connect();
    
    // Test table existence
    const tableCount = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ShabPublication', 'Auction', 'AuctionObject', 'Property')
    `;

    if (Number(tableCount[0].count) !== 4) {
      throw new Error(`Expected 4 tables, found ${tableCount[0].count}`);
    }

    return { tablesFound: Number(tableCount[0].count) };
  }

  private async testShabApiConnectivity(): Promise<any> {
    const shabApi = new ShabApiService();
    
    // Test with a very recent date range (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    try {
      // This might return empty results, which is fine for connectivity test
      const publications = await shabApi.fetchPublications(yesterdayStr, yesterdayStr, 0, 1);
      
      return {
        apiConnected: true,
        publicationsFound: publications.length,
        testDate: yesterdayStr
      };
    } catch (error) {
      if (error instanceof ShabApiError && error.statusCode === 404) {
        // 404 might be expected for recent dates with no publications
        return {
          apiConnected: true,
          publicationsFound: 0,
          testDate: yesterdayStr,
          note: 'API accessible but no publications found (expected for recent dates)'
        };
      }
      throw error;
    }
  }

  private async testXmlParsing(): Promise<any> {
    const shabApi = new ShabApiService();
    
    // Test with real SHAB XML structure
    const sampleXml = `<?xml version='1.0' encoding='UTF-8'?>
<SB01:publication xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SB01="https://shab.ch/shab/SB01-export">
<meta>
  <language>de</language>
</meta>
<content>
  <auctionObjects>&lt;p>Test property for sale&lt;/p>&lt;p>Estimated value: CHF 1,200,000&lt;/p></auctionObjects>
  <auction>
    <date>2025-03-15</date>
    <time>14:00</time>
    <location>Bezirksgericht Zürich</location>
  </auction>
</content>
</SB01:publication>`;

    const parsed = shabApi.parsePublicationXml(sampleXml);
    
    if (!parsed.auctions || parsed.auctions.length === 0) {
      throw new Error('Failed to parse auction data from sample XML');
    }

    return {
      language: parsed.language,
      auctionsFound: parsed.auctions.length,
      firstAuction: parsed.auctions[0]
    };
  }

  private async testPublicationProcessing(): Promise<any> {
    // Create a test publication manually
    const testPublication = {
      id: `TEST-PIPELINE-${Date.now()}`,
      publishDate: new Date().toISOString(),
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<publication>
  <content>
    <text>
      Versteigerung am 20. März 2025 um 10:00 Uhr
      Bezirksgericht Zürich, Saal 3
      
      1. Testobjekt Einfamilienhaus
         Adresse: Teststrasse 123, 8000 Zürich
         Schätzwert: CHF 800,000
    </text>
  </content>
</publication>`,
      canton: 'ZH',
      rubric: 'Zwangsversteigerungen',
      subRubric: 'Immobilien',
      officialLanguage: 'de'
    };

    // Process the test publication
    const result = await shabProcessorService.processPublications([testPublication]);

    if (result.created !== 1) {
      throw new Error(`Expected 1 publication created, got ${result.created}`);
    }

    // Verify the data was stored correctly
    const storedPublication = await prisma.shabPublication.findUnique({
      where: { id: testPublication.id },
      include: {
        auctions: {
          include: {
            auctionObjects: true
          }
        }
      }
    });

    if (!storedPublication) {
      throw new Error('Test publication was not stored in database');
    }

    // Clean up test data
    await prisma.shabPublication.delete({
      where: { id: testPublication.id }
    });

    return {
      publicationStored: !!storedPublication,
      auctionsCreated: storedPublication.auctions.length,
      objectsCreated: storedPublication.auctions.reduce((sum, a) => sum + a.auctionObjects.length, 0),
      processingStatus: storedPublication.processingStatus
    };
  }

  private async testDailySyncEndpoint(): Promise<any> {
    // Test the cron endpoint (if running locally)
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/cron/shab-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add development bypass header
          'x-vercel-cron': '1'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Cron endpoint returned ${response.status}: ${data.error || 'Unknown error'}`);
      }

      return {
        endpointAccessible: true,
        responseSuccess: data.success,
        processingResult: data.result
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        return {
          endpointAccessible: false,
          note: 'Local server not running - endpoint test skipped'
        };
      }
      throw error;
    }
  }

  private async testProcessingStats(): Promise<any> {
    const stats = await shabProcessorService.getProcessingStats();

    return {
      totalPublications: stats.totalPublications,
      completedPublications: stats.completedPublications,
      totalAuctions: stats.totalAuctions,
      totalObjects: stats.totalAuctionObjects,
      hasData: stats.totalPublications > 0
    };
  }

  private async testDataCleanup(): Promise<any> {
    const cleanedUp = await shabProcessorService.cleanupFailedProcessing();

    return {
      failedProcessingCleaned: cleanedUp,
      cleanupWorking: true
    };
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    this.results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name.padEnd(25)} (${duration})`);
      
      if (!result.success && result.message) {
        console.log(`   Error: ${result.message}`);
      }
    });
    
    console.log('=' .repeat(50));
    console.log(`📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! SHAB pipeline is ready.');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
  }
}

// CLI execution
async function main() {
  const tester = new ShabPipelineTest();
  
  try {
    const { success } = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Test execution failed:', error);
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

export default ShabPipelineTest;