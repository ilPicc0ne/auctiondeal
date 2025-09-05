#!/usr/bin/env tsx

/**
 * Database Connection Test Script
 * Tests Prisma connection, schema creation, and PostGIS spatial functionality
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test 1: Basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if our tables exist
    const tables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ShabPublication', 'Auction', 'AuctionObject', 'Property')
      ORDER BY table_name;
    `;
    
    console.log('📋 Application tables found:', tables.map(t => t.table_name));
    
    // Test 3: Test PostGIS extension availability
    const postgisVersion = await prisma.$queryRaw<Array<{version: string}>>`
      SELECT PostGIS_Version() as version;
    `;
    
    console.log('🗺️  PostGIS version:', postgisVersion[0]?.version);
    
    // Test 4: Create sample data with spatial coordinates
    console.log('🧪 Testing sample data creation...');
    
    // Create a test SHAB publication
    const testPublication = await prisma.shabPublication.create({
      data: {
        id: 'TEST-001',
        publishDate: new Date('2025-01-01'),
        xmlContent: '<test>Sample XML</test>',
        canton: 'ZH',
        rubric: 'Zwangsversteigerungen',
        subRubric: 'Immobilien',
        officialLanguage: 'de',
        processingStatus: 'completed'
      }
    });
    
    console.log('✅ Test publication created:', testPublication.id);
    
    // Create a test auction
    const testAuction = await prisma.auction.create({
      data: {
        shabPublicationId: testPublication.id,
        auctionDate: new Date('2025-02-15'),
        auctionLocation: 'Bezirksgericht Zürich',
        status: 'published'
      }
    });
    
    console.log('✅ Test auction created:', testAuction.id);
    
    // Create a test auction object
    const testAuctionObject = await prisma.auctionObject.create({
      data: {
        auctionId: testAuction.id,
        rawText: 'Einfamilienhaus in Zürich, Schätzwert CHF 1,200,000',
        objectOrder: 1
      }
    });
    
    console.log('✅ Test auction object created:', testAuctionObject.id);
    
    // Test 5: Create property with spatial data using raw SQL for PostGIS
    console.log('🗺️  Testing spatial coordinates...');
    
    // Zurich coordinates: 47.3769, 8.5417
    const testProperty = await prisma.$executeRaw`
      INSERT INTO "Property" (
        id, "auctionObjectId", "propertyType", "classificationConfidence",
        "estimatedValueChf", "valueConfidence", address, coordinates,
        canton, municipality, "sourceLanguage", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, 
        ${testAuctionObject.id},
        'EFH',
        0.95,
        1200000,
        0.88,
        'Musterstrasse 123, 8001 Zürich',
        ST_SetSRID(ST_MakePoint(8.5417, 47.3769), 4326),
        'ZH',
        'Zürich',
        'de',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;
    
    console.log('✅ Test property with spatial coordinates created');
    
    // Test 6: Query spatial data
    const propertyWithCoordinates = await prisma.$queryRaw<Array<{
      id: string;
      propertyType: string;
      estimatedValueChf: number;
      address: string;
      lat: number;
      lng: number;
      canton: string;
    }>>`
      SELECT 
        p.id,
        p."propertyType",
        p."estimatedValueChf",
        p.address,
        ST_Y(p.coordinates) as lat,
        ST_X(p.coordinates) as lng,
        p.canton
      FROM "Property" p
      WHERE p."auctionObjectId" = ${testAuctionObject.id};
    `;
    
    console.log('🗺️  Property with coordinates retrieved:', propertyWithCoordinates[0]);
    
    // Test 7: Test spatial query (find properties within 10km of Zurich center)
    const nearbyProperties = await prisma.$queryRaw<Array<{
      id: string;
      address: string;
      distance_km: number;
    }>>`
      SELECT 
        p.id,
        p.address,
        ST_Distance(p.coordinates, ST_SetSRID(ST_MakePoint(8.5417, 47.3769), 4326)) * 111.32 as distance_km
      FROM "Property" p
      WHERE p.coordinates IS NOT NULL
      AND ST_DWithin(p.coordinates, ST_SetSRID(ST_MakePoint(8.5417, 47.3769), 4326), 0.1)
      ORDER BY distance_km;
    `;
    
    console.log('📍 Properties within 10km of Zurich:', nearbyProperties.length);
    
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await prisma.property.deleteMany({
      where: {
        auctionObject: {
          auction: {
            shabPublicationId: testPublication.id
          }
        }
      }
    });
    
    await prisma.auctionObject.deleteMany({
      where: { auctionId: testAuction.id }
    });
    
    await prisma.auction.deleteMany({
      where: { shabPublicationId: testPublication.id }
    });
    
    await prisma.shabPublication.delete({
      where: { id: testPublication.id }
    });
    
    console.log('✅ Test data cleaned up successfully');
    console.log('🎉 All database tests passed!');
    
    return {
      success: true,
      postgisVersion: postgisVersion[0]?.version,
      tablesFound: tables.length,
      spatialFunctionalityWorking: propertyWithCoordinates.length > 0
    };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then((result) => {
      console.log('\n📊 Test Results:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export default testDatabaseConnection;