#!/usr/bin/env tsx

/**
 * Historical Data Backfill Script
 * Fetches and processes historical SHAB auction data (default: 90 days)
 * Can be run manually or as part of initial deployment setup
 */

import { shabProcessorService } from '../src/lib/services/shab-processor';

interface BackfillOptions {
  daysBack?: number;
  dryRun?: boolean;
  verbose?: boolean;
}

async function runHistoricalBackfill(options: BackfillOptions = {}) {
  const { daysBack = 90, dryRun = false, verbose = false } = options;
  const startTime = Date.now();

  console.log('🚀 Starting historical data backfill...');
  console.log(`📅 Processing last ${daysBack} days of auction data`);
  
  if (dryRun) {
    console.log('🧪 DRY RUN MODE - No data will be written to database');
  }

  try {
    // Get initial stats
    const initialStats = await shabProcessorService.getProcessingStats();
    console.log('📊 Initial database state:');
    console.log(`  - Publications: ${initialStats.totalPublications}`);
    console.log(`  - Auctions: ${initialStats.totalAuctions}`);
    console.log(`  - Objects: ${initialStats.totalAuctionObjects}`);
    
    if (dryRun) {
      console.log('✅ Dry run completed - no changes made');
      return {
        success: true,
        dryRun: true,
        duration: `${Date.now() - startTime}ms`
      };
    }

    // Clean up any failed processing attempts first
    console.log('🧹 Cleaning up failed processing attempts...');
    const cleanedUp = await shabProcessorService.cleanupFailedProcessing();
    
    if (cleanedUp > 0) {
      console.log(`✅ Cleaned up ${cleanedUp} failed processing attempts`);
    }

    // Start the historical processing
    console.log('🔄 Processing historical publications...');
    const result = await shabProcessorService.processHistoricalPublications(daysBack);

    // Get final stats
    const finalStats = await shabProcessorService.getProcessingStats();
    
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    // Print results
    console.log('\n🎉 Historical backfill completed!');
    console.log('📊 Processing Results:');
    console.log(`  - Processed: ${result.processed} publications`);
    console.log(`  - Created: ${result.created} new publications`);
    console.log(`  - Skipped: ${result.skipped} (already existed)`);
    console.log(`  - Errors: ${result.errors} failed`);
    
    console.log('\n📈 Database Growth:');
    console.log(`  - Publications: ${initialStats.totalPublications} → ${finalStats.totalPublications} (+${finalStats.totalPublications - initialStats.totalPublications})`);
    console.log(`  - Auctions: ${initialStats.totalAuctions} → ${finalStats.totalAuctions} (+${finalStats.totalAuctions - initialStats.totalAuctions})`);
    console.log(`  - Objects: ${initialStats.totalAuctionObjects} → ${finalStats.totalAuctionObjects} (+${finalStats.totalAuctionObjects - initialStats.totalAuctionObjects})`);
    
    console.log(`\n⏱️ Duration: ${minutes}m ${seconds}s`);

    if (verbose && result.errors > 0) {
      console.log('\n❌ Error Details:');
      const errors = result.details.filter(d => d.status === 'error');
      errors.forEach(error => {
        console.log(`  - ${error.publicationId}: ${error.message}`);
      });
    }

    return {
      success: true,
      dryRun: false,
      duration: `${duration}ms`,
      result,
      initialStats,
      finalStats
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('\n❌ Historical backfill failed:', error);
    
    return {
      success: false,
      dryRun,
      duration: `${duration}ms`,
      error: {
        message: error.message,
        name: error.name
      }
    };
  } finally {
    await shabProcessorService.disconnect();
  }
}

// CLI argument parsing
function parseArgs(): BackfillOptions {
  const args = process.argv.slice(2);
  const options: BackfillOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--days':
      case '-d':
        const daysValue = parseInt(args[i + 1]);
        if (!isNaN(daysValue) && daysValue > 0) {
          options.daysBack = daysValue;
          i++; // Skip the next argument as it's the value
        }
        break;
        
      case '--dry-run':
      case '--dry':
        options.dryRun = true;
        break;
        
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--help':
      case '-h':
        console.log(`
📋 Historical Backfill Script Usage:

npx tsx scripts/historical-backfill.ts [options]

Options:
  --days, -d <number>    Number of days to backfill (default: 90)
  --dry-run, --dry       Preview what would be done without making changes
  --verbose, -v          Show detailed error information
  --help, -h             Show this help message

Examples:
  npx tsx scripts/historical-backfill.ts                    # Backfill last 90 days
  npx tsx scripts/historical-backfill.ts --days 30          # Backfill last 30 days
  npx tsx scripts/historical-backfill.ts --dry-run          # Preview without changes
  npx tsx scripts/historical-backfill.ts -d 7 -v            # Backfill 7 days with verbose output
        `);
        process.exit(0);
    }
  }

  return options;
}

// Run the script if executed directly
if (require.main === module) {
  const options = parseArgs();
  
  runHistoricalBackfill(options)
    .then((result) => {
      console.log('\n📊 Final Result:', {
        success: result.success,
        duration: result.duration,
        ...(result.result && {
          summary: `${result.result.created} created, ${result.result.skipped} skipped, ${result.result.errors} errors`
        })
      });
      
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Script execution failed:', error);
      process.exit(1);
    });
}

export default runHistoricalBackfill;