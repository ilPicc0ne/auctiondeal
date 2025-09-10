#!/usr/bin/env tsx

/**
 * Database Clear Script
 * Clears all data from the database with confirmation prompts
 * 
 * Usage:
 *   npm run db:clear              - Clear with confirmation
 *   npm run db:clear -- --force   - Clear without confirmation
 *   npx tsx scripts/db-clear.ts [--force]
 */

import 'dotenv/config';
import { getPrismaClient } from '@auctiondeal/shared-ts';
import { createInterface } from 'readline';

class DatabaseClearService {
  private prisma: NonNullable<ReturnType<typeof getPrismaClient>>;
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  constructor() {
    const client = getPrismaClient();
    
    if (!client) {
      throw new Error('Failed to initialize database connection');
    }
    
    this.prisma = client;
  }

  /**
   * Get database statistics before clearing
   */
  async getStats(): Promise<{
    publications: number;
    auctions: number;
    objects: number;
    properties: number;
  }> {
    const [publications, auctions, objects, properties] = await Promise.all([
      this.prisma.shabPublication.count(),
      this.prisma.auction.count(),
      this.prisma.auctionObject.count(),
      this.prisma.property.count()
    ]);

    return { publications, auctions, objects, properties };
  }

  /**
   * Ask user for confirmation
   */
  private async askConfirmation(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * Clear all database tables
   */
  async clearDatabase(force: boolean = false): Promise<void> {
    const startTime = Date.now();
    
    console.log('🗑️  AuctionDeal Database Clear');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    try {
      // Get current stats
      const stats = await this.getStats();
      const totalRecords = stats.publications + stats.auctions + stats.objects + stats.properties;
      
      console.log('📊 Current database contents:');
      console.log(`  📄 SHAB Publications: ${stats.publications}`);
      console.log(`  🏛️  Auctions: ${stats.auctions}`);
      console.log(`  📦 Auction Objects: ${stats.objects}`);
      console.log(`  🏠 Properties: ${stats.properties}`);
      console.log(`  📊 Total Records: ${totalRecords}\n`);

      if (totalRecords === 0) {
        console.log('✅ Database is already empty. Nothing to clear.');
        return;
      }

      // Confirmation prompt
      if (!force) {
        const confirmed = await this.askConfirmation(
          `⚠️  Are you sure you want to DELETE ALL ${totalRecords} records?`
        );
        
        if (!confirmed) {
          console.log('❌ Database clear cancelled by user.');
          return;
        }

        const doubleConfirm = await this.askConfirmation(
          '🚨 Last chance! This action CANNOT be undone. Proceed with deletion?'
        );
        
        if (!doubleConfirm) {
          console.log('❌ Database clear cancelled by user.');
          return;
        }
      }

      console.log('\n🔄 Starting database clear...');

      // Clear tables in correct order (respecting foreign key constraints)
      console.log('🗑️  Deleting Properties...');
      const deletedProperties = await this.prisma.property.deleteMany({});
      console.log(`   ✅ Deleted ${deletedProperties.count} properties`);

      console.log('🗑️  Deleting Auction Objects...');
      const deletedObjects = await this.prisma.auctionObject.deleteMany({});
      console.log(`   ✅ Deleted ${deletedObjects.count} auction objects`);

      console.log('🗑️  Deleting Auctions...');
      const deletedAuctions = await this.prisma.auction.deleteMany({});
      console.log(`   ✅ Deleted ${deletedAuctions.count} auctions`);

      console.log('🗑️  Deleting SHAB Publications...');
      const deletedPublications = await this.prisma.shabPublication.deleteMany({});
      console.log(`   ✅ Deleted ${deletedPublications.count} publications`);

      const duration = Date.now() - startTime;
      const totalDeleted = deletedProperties.count + deletedObjects.count + 
                          deletedAuctions.count + deletedPublications.count;

      console.log('\n✅ Database cleared successfully!');
      console.log('📊 Deletion Summary:', {
        publications: deletedPublications.count,
        auctions: deletedAuctions.count,
        objects: deletedObjects.count,
        properties: deletedProperties.count,
        totalDeleted,
        duration: `${duration}ms`
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('\n❌ Database clear failed:', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);

    } finally {
      this.rl.close();
      await this.prisma.$disconnect();
    }
  }
}

// Parse command line arguments
const forceFlag = process.argv.includes('--force');

// Run clear
const service = new DatabaseClearService();
service.clearDatabase(forceFlag).catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});