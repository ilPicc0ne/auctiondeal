#!/usr/bin/env tsx

/**
 * Database Status Script
 * Shows detailed database statistics and health information
 * 
 * Usage:
 *   npm run db:status
 *   npx tsx scripts/db-status.ts
 */

import 'dotenv/config';
import { getPrismaClient } from '@auctiondeal/shared-ts';

class DatabaseStatusService {
  private prisma: NonNullable<ReturnType<typeof getPrismaClient>>;

  constructor() {
    const client = getPrismaClient();
    
    if (!client) {
      throw new Error('Failed to initialize database connection');
    }
    
    this.prisma = client;
  }

  /**
   * Get comprehensive database statistics
   */
  async getDetailedStats(): Promise<void> {
    const startTime = Date.now();
    
    console.log('📊 AuctionDeal Database Status');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    try {
      console.log('🔍 Collecting database statistics...\n');

      // Basic counts
      const [publications, auctions, objects, properties] = await Promise.all([
        this.prisma.shabPublication.count(),
        this.prisma.auction.count(),
        this.prisma.auctionObject.count(),
        this.prisma.property.count()
      ]);

      // Publication statistics
      const publicationStats = await this.prisma.shabPublication.groupBy({
        by: ['processingStatus'],
        _count: true
      });

      const publicationsByLanguage = await this.prisma.shabPublication.groupBy({
        by: ['officialLanguage'],
        _count: true
      });

      const publicationsByCanton = await this.prisma.shabPublication.groupBy({
        by: ['canton'],
        _count: true,
        orderBy: {
          _count: {
            canton: 'desc'
          }
        },
        take: 10
      });

      // Date ranges
      const dateRanges = await this.prisma.shabPublication.aggregate({
        _min: { publishDate: true, createdAt: true },
        _max: { publishDate: true, createdAt: true }
      });

      // Property statistics
      const propertiesByType = await this.prisma.property.groupBy({
        by: ['propertyType'],
        _count: true,
        orderBy: {
          _count: {
            propertyType: 'desc'
          }
        }
      });

      const propertiesWithValues = await this.prisma.property.count({
        where: {
          estimatedValueChf: { not: null }
        }
      });

      const valueStats = await this.prisma.property.aggregate({
        _min: { estimatedValueChf: true },
        _max: { estimatedValueChf: true },
        _avg: { estimatedValueChf: true },
        _count: { estimatedValueChf: true }
      });

      const duration = Date.now() - startTime;

      // Display results
      console.log('📈 RECORD COUNTS');
      console.log('─'.repeat(50));
      console.log(`📄 SHAB Publications:    ${publications.toLocaleString()}`);
      console.log(`🏛️  Auctions:             ${auctions.toLocaleString()}`);
      console.log(`📦 Auction Objects:      ${objects.toLocaleString()}`);
      console.log(`🏠 Properties:           ${properties.toLocaleString()}`);
      console.log(`📊 Total Records:        ${(publications + auctions + objects + properties).toLocaleString()}`);

      console.log('\n📄 PUBLICATION ANALYSIS');
      console.log('─'.repeat(50));
      console.log('Processing Status:');
      publicationStats.forEach(stat => {
        console.log(`  ${stat.processingStatus}: ${stat._count.toLocaleString()}`);
      });

      console.log('\nOfficial Languages:');
      publicationsByLanguage.forEach(stat => {
        console.log(`  ${stat.officialLanguage}: ${stat._count.toLocaleString()}`);
      });

      console.log('\nTop 10 Cantons:');
      publicationsByCanton.forEach(stat => {
        console.log(`  ${stat.canton}: ${stat._count.toLocaleString()}`);
      });

      if (dateRanges._min.publishDate && dateRanges._max.publishDate) {
        console.log('\n📅 DATE RANGES');
        console.log('─'.repeat(50));
        console.log(`Publish Date Range:`);
        console.log(`  From: ${dateRanges._min.publishDate.toISOString().split('T')[0]}`);
        console.log(`  To:   ${dateRanges._max.publishDate.toISOString().split('T')[0]}`);
        
        if (dateRanges._min.createdAt && dateRanges._max.createdAt) {
          console.log(`Database Record Range:`);
          console.log(`  From: ${dateRanges._min.createdAt.toISOString().split('T')[0]}`);
          console.log(`  To:   ${dateRanges._max.createdAt.toISOString().split('T')[0]}`);
        }
      }

      if (properties > 0) {
        console.log('\n🏠 PROPERTY ANALYSIS');
        console.log('─'.repeat(50));
        console.log('Property Types:');
        propertiesWithValues && propertiesByType.forEach(stat => {
          console.log(`  ${stat.propertyType}: ${stat._count.toLocaleString()}`);
        });

        console.log(`\nValue Statistics:`);
        console.log(`  Properties with values: ${propertiesWithValues.toLocaleString()} (${((propertiesWithValues / properties) * 100).toFixed(1)}%)`);
        
        if (valueStats._count.estimatedValueChf && valueStats._count.estimatedValueChf > 0) {
          console.log(`  Min value: CHF ${valueStats._min.estimatedValueChf?.toLocaleString() || 'N/A'}`);
          console.log(`  Max value: CHF ${valueStats._max.estimatedValueChf?.toLocaleString() || 'N/A'}`);
          console.log(`  Avg value: CHF ${valueStats._avg.estimatedValueChf?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}`);
        }
      }

      console.log('\n🔧 SYSTEM INFO');
      console.log('─'.repeat(50));
      console.log(`Query duration: ${duration}ms`);
      console.log(`Database connection: ✅ Connected`);
      
      // Test database health
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        console.log(`Database health: ✅ Healthy`);
      } catch (error) {
        console.log(`Database health: ❌ Error - ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check PostGIS if available
      try {
        const postgisVersion = await this.prisma.$queryRaw<Array<{postgis_version: string}>>`SELECT PostGIS_Version() as postgis_version`;
        if (postgisVersion.length > 0) {
          console.log(`PostGIS version: ${postgisVersion[0].postgis_version}`);
        }
      } catch (error) {
        console.log(`PostGIS: Not available or error`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('\n❌ Status check failed:', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);

    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run status check
const service = new DatabaseStatusService();
service.getDetailedStats().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});