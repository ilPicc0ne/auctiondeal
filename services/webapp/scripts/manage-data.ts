#!/usr/bin/env tsx

/**
 * Data Management Script for AuctionDeal
 * 
 * Usage:
 *   npm run data:backfill     - Backfill 90 days of SHAB data
 *   npm run data:backfill 30  - Backfill specific number of days
 *   npm run data:clear        - Clear all data (with confirmation)
 *   npm run data:status       - Show database status
 * 
 * Direct usage:
 *   npx tsx scripts/manage-data.ts backfill [days]
 *   npx tsx scripts/manage-data.ts clear
 *   npx tsx scripts/manage-data.ts status
 */

import { PrismaClient } from '@prisma/client';
import { shabProcessorService } from '../src/lib/services/shab-processor';
import { createInterface } from 'readline';

const prisma = new PrismaClient();

interface CommandOptions {
  force?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

class DataManager {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  /**
   * Main command router
   */
  async runCommand(command: string, args: string[] = [], options: CommandOptions = {}): Promise<void> {
    try {
      console.log(`🚀 AuctionDeal Data Manager`);
      console.log(`📅 ${new Date().toLocaleString()}\n`);

      switch (command) {
        case 'backfill':
          await this.handleBackfill(args, options);
          break;
        case 'clear':
          await this.handleClear(options);
          break;
        case 'status':
          await this.handleStatus();
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Command failed:', (error as Error).message);
      process.exit(1);
    } finally {
      this.rl.close();
      await prisma.$disconnect();
      await shabProcessorService.disconnect();
    }
  }

  /**
   * Handle backfill command
   */
  private async handleBackfill(args: string[], options: CommandOptions): Promise<void> {
    const days = args[0] ? parseInt(args[0]) : 90;
    
    if (isNaN(days) || days <= 0) {
      throw new Error('Invalid number of days. Must be a positive integer.');
    }

    console.log(`📥 Starting backfill for ${days} days...`);

    if (options.dryRun) {
      console.log('🧪 DRY RUN MODE - No data will be written');
    }

    // Show current status
    const initialStats = await this.getDetailedStats();
    console.log('📊 Initial database status:');
    this.printStats(initialStats);

    if (!options.force && !options.dryRun) {
      const confirm = await this.askConfirmation(`\nProceed with ${days}-day backfill?`);
      if (!confirm) {
        console.log('❌ Backfill cancelled');
        return;
      }
    }

    if (options.dryRun) {
      console.log(`✅ Dry run completed - would backfill ${days} days`);
      return;
    }

    const startTime = Date.now();
    
    // Perform backfill
    console.log('\n🔄 Processing historical publications...');
    const result = await shabProcessorService.processHistoricalPublications(days);

    // Get final stats
    const finalStats = await this.getDetailedStats();
    const duration = Date.now() - startTime;

    // Print results
    console.log('\n🎉 Backfill completed!');
    console.log('\n📊 Processing Results:');
    console.log(`  ✅ Processed: ${result.processed} publications`);
    console.log(`  🆕 Created: ${result.created} new records`);
    console.log(`  ⏭️  Skipped: ${result.skipped} (already existed)`);
    console.log(`  ❌ Errors: ${result.errors} failed`);

    console.log('\n📈 Database Growth:');
    console.log(`  📄 Publications: ${initialStats.publications} → ${finalStats.publications} (+${finalStats.publications - initialStats.publications})`);
    console.log(`  🏛️ Auctions: ${initialStats.auctions} → ${finalStats.auctions} (+${finalStats.auctions - initialStats.auctions})`);
    console.log(`  📦 Objects: ${initialStats.objects} → ${finalStats.objects} (+${finalStats.objects - initialStats.objects})`);

    console.log(`\n⏱️ Duration: ${this.formatDuration(duration)}`);

    if (options.verbose && result.errors > 0) {
      console.log('\n❌ Error Details:');
      const errors = result.details.filter(d => d.status === 'error');
      errors.forEach(error => {
        console.log(`  • ${error.publicationId}: ${error.message}`);
      });
    }
  }

  /**
   * Handle clear command
   */
  private async handleClear(options: CommandOptions): Promise<void> {
    console.log('🧹 Database cleanup requested');

    // Show current status
    const stats = await this.getDetailedStats();
    console.log('\n📊 Current database status:');
    this.printStats(stats);

    if (stats.publications === 0) {
      console.log('✨ Database is already empty');
      return;
    }

    if (!options.force) {
      console.log('\n⚠️  WARNING: This will delete ALL auction data from the database!');
      const confirm = await this.askConfirmation('Are you sure you want to continue?');
      if (!confirm) {
        console.log('❌ Clear operation cancelled');
        return;
      }

      // Double confirmation for safety
      const doubleConfirm = await this.askConfirmation('Type "DELETE" to confirm');
      if (doubleConfirm !== 'DELETE') {
        console.log('❌ Clear operation cancelled - confirmation failed');
        return;
      }
    }

    const startTime = Date.now();

    console.log('\n🧹 Clearing database...');
    
    // Clear in reverse dependency order
    console.log('  Deleting properties...');
    const propertiesDeleted = await prisma.property.deleteMany();
    
    console.log('  Deleting auction objects...');
    const objectsDeleted = await prisma.auctionObject.deleteMany();
    
    console.log('  Deleting auctions...');
    const auctionsDeleted = await prisma.auction.deleteMany();
    
    console.log('  Deleting SHAB publications...');
    const publicationsDeleted = await prisma.shabPublication.deleteMany();

    const duration = Date.now() - startTime;

    console.log('\n✅ Database cleared successfully!');
    console.log('📊 Deleted records:');
    console.log(`  📄 Publications: ${publicationsDeleted.count}`);
    console.log(`  🏛️ Auctions: ${auctionsDeleted.count}`);
    console.log(`  📦 Objects: ${objectsDeleted.count}`);
    console.log(`  🏠 Properties: ${propertiesDeleted.count}`);
    console.log(`\n⏱️ Duration: ${this.formatDuration(duration)}`);
  }

  /**
   * Handle status command
   */
  private async handleStatus(): Promise<void> {
    console.log('📊 Database Status Report\n');

    const stats = await this.getDetailedStats();
    this.printStats(stats);

    // Show recent activity
    const recentPublications = await prisma.shabPublication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publishDate: true,
        canton: true,
        processingStatus: true,
        createdAt: true
      }
    });

    if (recentPublications.length > 0) {
      console.log('\n📅 Recent Publications:');
      recentPublications.forEach(pub => {
        console.log(`  • ${pub.id} (${pub.canton}) - ${pub.processingStatus} - ${pub.createdAt.toLocaleDateString()}`);
      });
    }

    // Show processing summary
    const processingStats = await shabProcessorService.getProcessingStats();
    console.log('\n🔄 Processing Summary:');
    console.log(`  📄 Total: ${processingStats.totalPublications}`);
    console.log(`  ✅ Completed: ${processingStats.completedPublications}`);
    console.log(`  ⏳ Pending: ${processingStats.pendingPublications}`);
    
    if (processingStats.lastProcessed) {
      console.log(`  📅 Last Processed: ${processingStats.lastProcessed.toLocaleString()}`);
    }
  }

  /**
   * Get detailed database statistics
   */
  private async getDetailedStats(): Promise<{
    publications: number;
    auctions: number;
    objects: number;
    properties: number;
  }> {
    const [publications, auctions, objects, properties] = await Promise.all([
      prisma.shabPublication.count(),
      prisma.auction.count(),
      prisma.auctionObject.count(),
      prisma.property.count()
    ]);

    return { publications, auctions, objects, properties };
  }

  /**
   * Print statistics in a formatted way
   */
  private printStats(stats: { publications: number; auctions: number; objects: number; properties: number }): void {
    console.log(`  📄 Publications: ${stats.publications.toLocaleString()}`);
    console.log(`  🏛️ Auctions: ${stats.auctions.toLocaleString()}`);
    console.log(`  📦 Objects: ${stats.objects.toLocaleString()}`);
    console.log(`  🏠 Properties: ${stats.properties.toLocaleString()}`);
  }

  /**
   * Format duration in a human-readable way
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Ask for user confirmation
   */
  private async askConfirmation(question: string): Promise<string | boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${question} (y/N): `, (answer) => {
        const response = answer.trim().toLowerCase();
        if (question.includes('DELETE')) {
          resolve(answer.trim());
        } else {
          resolve(response === 'y' || response === 'yes');
        }
      });
    });
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
📖 AuctionDeal Data Manager - Usage Guide

Available Commands:
  backfill [days]  Backfill SHAB auction data (default: 90 days)
  clear            Clear all data from database (with safety prompts)
  status           Show current database status and statistics

Options:
  --force          Skip confirmation prompts
  --dry-run        Preview operations without making changes
  --verbose        Show detailed error information

Examples:
  npx tsx scripts/manage-data.ts backfill        # Backfill 90 days
  npx tsx scripts/manage-data.ts backfill 30     # Backfill 30 days
  npx tsx scripts/manage-data.ts clear           # Clear all data
  npx tsx scripts/manage-data.ts status          # Show status

NPM Scripts (add to package.json):
  "data:backfill": "tsx scripts/manage-data.ts backfill",
  "data:clear": "tsx scripts/manage-data.ts clear",
  "data:status": "tsx scripts/manage-data.ts status"

Usage:
  npm run data:backfill
  npm run data:clear
  npm run data:status
`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    new DataManager().showHelp();
    process.exit(0);
  }

  // Parse options
  const options: CommandOptions = {
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };

  // Filter out options from args
  const commandArgs = args.slice(1).filter(arg => !arg.startsWith('--'));

  const manager = new DataManager();
  await manager.runCommand(command, commandArgs, options);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export default DataManager;