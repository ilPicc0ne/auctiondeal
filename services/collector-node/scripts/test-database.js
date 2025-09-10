#!/usr/bin/env node
/**
 * Manual Database Testing Script
 * Tests database connectivity and processor functionality
 */

import { ShabProcessorService } from '../dist/lib/shab-processor.js';
import { getPrismaClient } from '@auctiondeal/shared-ts';
import dotenv from 'dotenv';

// Load environment variables from test environment
dotenv.config({ path: '.env.test' });

async function testDatabase() {
  console.log('🗃️  Manual Database Testing Script');
  console.log('=====================================\n');

  let processor;
  let prisma;

  try {
    // Initialize services
    processor = new ShabProcessorService();
    prisma = getPrismaClient();

    if (!prisma) {
      throw new Error('Failed to initialize database connection');
    }

    // Test 1: Database connectivity
    console.log('🔗 Test 1: Database connectivity...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Test 2: Schema validation
    console.log('📋 Test 2: Schema validation...');
    const tableChecks = await Promise.all([
      prisma.shabPublication.findMany({ take: 1 }),
      prisma.auction.findMany({ take: 1 }),
      prisma.auctionObject.findMany({ take: 1 }),
      prisma.property.findMany({ take: 1 })
    ]);
    console.log('✅ All database tables accessible\n');

    // Test 3: Current database state
    console.log('📊 Test 3: Current database statistics...');
    const [pubCount, auctionCount, objectCount, propertyCount] = await Promise.all([
      prisma.shabPublication.count(),
      prisma.auction.count(),
      prisma.auctionObject.count(),
      prisma.property.count()
    ]);
    
    console.log(`   Publications: ${pubCount}`);
    console.log(`   Auctions: ${auctionCount}`);
    console.log(`   Auction Objects: ${objectCount}`);
    console.log(`   Properties: ${propertyCount}\n`);

    // Test 4: Processing stats from service
    console.log('📈 Test 4: Processor service statistics...');
    const stats = await processor.getProcessingStats();
    console.log(`   Total Publications: ${stats.totalPublications}`);
    console.log(`   Completed: ${stats.completedPublications}`);
    console.log(`   Pending: ${stats.pendingPublications}`);
    console.log(`   Total Auctions: ${stats.totalAuctions}`);
    console.log(`   Total Objects: ${stats.totalAuctionObjects}`);
    if (stats.lastProcessed) {
      console.log(`   Last Processed: ${stats.lastProcessed.toISOString()}`);
    }
    console.log();

    // Test 5: Test publication processing (dry run)
    console.log('🧪 Test 5: Test publication processing...');
    const testPublication = {
      id: 'test-' + Date.now(),
      publishDate: new Date().toISOString(),
      xmlContent: '<?xml version="1.0"?><root><test>Database connectivity test</test></root>',
      canton: 'ZH',
      rubric: 'SB',
      subRubric: 'SB01',
      officialLanguage: 'de'
    };

    const result = await processor.processPublications([testPublication]);
    console.log(`✅ Test processing completed:`);
    console.log(`   Processed: ${result.processed}`);
    console.log(`   Created: ${result.created}`);
    console.log(`   Skipped: ${result.skipped}`);
    console.log(`   Errors: ${result.errors}\n`);

    // Clean up test data
    await prisma.shabPublication.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    console.log('🧹 Test data cleaned up\n');

    // Test 6: Recent activity
    console.log('⏰ Test 6: Recent activity check...');
    const recentPubs = await prisma.shabPublication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        canton: true,
        publishDate: true,
        processingStatus: true,
        createdAt: true
      }
    });

    if (recentPubs.length > 0) {
      console.log('Recent publications:');
      recentPubs.forEach((pub, i) => {
        console.log(`   ${i + 1}. ${pub.id.substring(0, 8)}... (${pub.canton}) - ${pub.processingStatus}`);
      });
    } else {
      console.log('   No publications found in database');
    }
    console.log();

    // Test 7: Database health check
    console.log('🏥 Test 7: Database health check...');
    const { DatabaseUtils } = await import('@auctiondeal/shared-ts');
    const isHealthy = await DatabaseUtils.healthCheck();
    console.log(`✅ Database health: ${isHealthy ? 'Good' : 'Issues detected'}\n`);

    console.log('🎉 All database tests completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Run processor daily to keep data current');
    console.log('   - Monitor processing status for failed items');
    console.log('   - Check database size growth over time');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Clean up connections
    if (prisma) {
      await prisma.$disconnect();
    }
    if (processor) {
      await processor.disconnect();
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Manual Database Testing Script');
  console.log('Usage: node scripts/test-database.js [--help]');
  console.log('');
  console.log('This script tests database connectivity and processor functionality.');
  console.log('Requires DATABASE_URL to be set in environment.');
  process.exit(0);
}

// Check environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Set it in .env file or export DATABASE_URL="your-connection-string"');
  process.exit(1);
}

// Run the tests
testDatabase().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});