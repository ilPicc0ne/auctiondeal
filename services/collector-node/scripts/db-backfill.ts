#!/usr/bin/env tsx

/**
 * Historical Database Backfill Script
 * Populates SHAB publications table with historical data
 * 
 * Usage:
 *   npm run db:backfill [days]     - Backfill specified days (default: 90)
 *   npx tsx scripts/db-backfill.ts [days]
 */

import 'dotenv/config';
import { ShabProcessorService } from '../src/lib/shab-processor.js';

class DatabaseBackfillService {
  private processor: ShabProcessorService;

  constructor() {
    this.processor = new ShabProcessorService();
  }

  /**
   * Run historical backfill for specified number of days
   */
  async backfill(daysBack: number = 90): Promise<void> {
    const startTime = Date.now();
    
    console.log('🚀 AuctionDeal Database Backfill');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`📊 Backfilling ${daysBack} days of SHAB publications...\n`);

    try {
      // Get initial stats
      const initialStats = await this.processor.getProcessingStats();
      console.log('📈 Initial database stats:', {
        publications: initialStats.totalPublications,
        auctions: initialStats.totalAuctions,
        objects: initialStats.totalAuctionObjects
      });

      // Run historical processing
      console.log(`\n🔄 Starting historical collection for ${daysBack} days...`);
      const result = await this.processor.processHistoricalPublications(daysBack);

      // Get final stats
      const finalStats = await this.processor.getProcessingStats();
      const duration = Date.now() - startTime;

      console.log('\n✅ Backfill completed successfully!');
      console.log('📊 Processing Results:', {
        processed: result.processed,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
        duration: `${duration}ms`
      });

      console.log('\n📈 Final database stats:', {
        publications: finalStats.totalPublications,
        auctions: finalStats.totalAuctions,
        objects: finalStats.totalAuctionObjects
      });

      console.log(`\n📈 New records added: ${finalStats.totalPublications - initialStats.totalPublications} publications`);

      if (result.errors > 0) {
        console.log('\n⚠️  Some errors occurred during processing:');
        result.details
          .filter(d => d.status === 'error')
          .forEach(detail => {
            console.log(`  - ${detail.publicationId}: ${detail.message}`);
          });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('\n❌ Backfill failed:', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);

    } finally {
      await this.processor.disconnect();
    }
  }
}

// Parse command line arguments
const daysArg = process.argv[2];
const daysBack = daysArg ? parseInt(daysArg, 10) : 90;

if (isNaN(daysBack) || daysBack <= 0) {
  console.error('❌ Invalid days argument. Please provide a positive number.');
  process.exit(1);
}

// Run backfill
const service = new DatabaseBackfillService();
service.backfill(daysBack).catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});