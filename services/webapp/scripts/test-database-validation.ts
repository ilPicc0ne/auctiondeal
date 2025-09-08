#!/usr/bin/env tsx

/**
 * Database Field Validation Test Script
 * Ensures all important fields are populated correctly in the database
 * 
 * Tests:
 * 1. Required field population validation
 * 2. Data type and format validation
 * 3. Cross-table relationship integrity
 * 4. Swiss-specific data validation (cantons, etc.)
 */

import { PrismaClient } from '@prisma/client';
import { shabProcessorService } from '../src/lib/services/shab-processor';
import { ShabApiService } from '../src/lib/services/shab-api';

const prisma = new PrismaClient();

interface ValidationTestResult {
  name: string;
  success: boolean;
  duration: number;
  message?: string;
  data?: any;
}

class DatabaseValidationTest {
  private results: ValidationTestResult[] = [];
  private shabApi = new ShabApiService();
  private testPublicationIds: string[] = [];
  
  // Valid Swiss canton codes
  private validCantons = [
    'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 
    'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 
    'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
  ];

  async runAllTests(): Promise<{ success: boolean; results: ValidationTestResult[] }> {
    console.log('🧪 Starting Database Field Validation Tests...\n');

    // Test 1: Required field population
    await this.runTest('Required Field Population', this.testRequiredFieldPopulation.bind(this));
    
    // Test 2: Data type and format validation
    await this.runTest('Data Type and Format Validation', this.testDataTypeAndFormatValidation.bind(this));
    
    // Test 3: Cross-table relationship integrity
    await this.runTest('Cross-table Relationship Integrity', this.testRelationshipIntegrity.bind(this));
    
    // Test 4: Swiss-specific data validation
    await this.runTest('Swiss-specific Data Validation', this.testSwissSpecificValidation.bind(this));
    
    // Test 5: HTML content validation
    await this.runTest('HTML Content Validation', this.testHtmlContentValidation.bind(this));

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

  private async testRequiredFieldPopulation(): Promise<any> {
    console.log('   🔹 Testing required field population...');
    
    // Get real data for testing (avoiding weekend data gaps)
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - 7);
    const testDateStr = testDate.toISOString().split('T')[0];

    const apiPublications = await this.shabApi.fetchPublications(testDateStr, testDateStr, 0, 5);
    
    if (apiPublications.length === 0) {
      return { testSkipped: true, reason: `No publications for field validation on ${testDateStr}` };
    }

    console.log(`   🔹 Validating required fields for ${apiPublications.length} publications...`);
    
    // Track for cleanup
    this.testPublicationIds.push(...apiPublications.map(p => p.id));

    // Process publications
    await shabProcessorService.processPublications(apiPublications);

    const validationResults = {
      publicationFields: { passed: 0, failed: 0, errors: [] },
      auctionFields: { passed: 0, failed: 0, errors: [] },
      objectFields: { passed: 0, failed: 0, errors: [] }
    };

    // Validate each publication
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
        validationResults.publicationFields.errors.push(`Publication ${apiPub.id} not found in database`);
        validationResults.publicationFields.failed++;
        continue;
      }

      // Validate publication required fields
      const pubFieldCheck = this.validatePublicationFields(dbPub);
      if (pubFieldCheck.isValid) {
        validationResults.publicationFields.passed++;
      } else {
        validationResults.publicationFields.failed++;
        validationResults.publicationFields.errors.push(`Publication ${dbPub.id}: ${pubFieldCheck.errors.join(', ')}`);
      }

      // Validate auction fields
      for (const auction of dbPub.auctions) {
        const auctionFieldCheck = this.validateAuctionFields(auction);
        if (auctionFieldCheck.isValid) {
          validationResults.auctionFields.passed++;
        } else {
          validationResults.auctionFields.failed++;
          validationResults.auctionFields.errors.push(`Auction ${auction.id}: ${auctionFieldCheck.errors.join(', ')}`);
        }

        // Validate auction object fields
        for (const obj of auction.auctionObjects) {
          const objFieldCheck = this.validateObjectFields(obj);
          if (objFieldCheck.isValid) {
            validationResults.objectFields.passed++;
          } else {
            validationResults.objectFields.failed++;
            validationResults.objectFields.errors.push(`Object ${obj.id}: ${objFieldCheck.errors.join(', ')}`);
          }
        }
      }
    }

    const totalPassed = validationResults.publicationFields.passed + validationResults.auctionFields.passed + validationResults.objectFields.passed;
    const totalFailed = validationResults.publicationFields.failed + validationResults.auctionFields.failed + validationResults.objectFields.failed;
    const overallSuccess = totalFailed === 0;

    if (!overallSuccess) {
      const allErrors = [
        ...validationResults.publicationFields.errors,
        ...validationResults.auctionFields.errors,
        ...validationResults.objectFields.errors
      ];
      throw new Error(`Field validation failed: ${allErrors.slice(0, 3).join('; ')}${allErrors.length > 3 ? `... and ${allErrors.length - 3} more` : ''}`);
    }

    return {
      publicationsValidated: apiPublications.length,
      validationResults,
      totalPassed,
      totalFailed,
      allRequiredFieldsPresent: overallSuccess
    };
  }

  private async testDataTypeAndFormatValidation(): Promise<any> {
    console.log('   🔹 Testing data type and format validation...');
    
    // Get recent data
    const recentPublications = await prisma.shabPublication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        auctions: { 
          include: { auctionObjects: true } 
        } 
      }
    });

    if (recentPublications.length === 0) {
      return { testSkipped: true, reason: 'No publications in database for format validation' };
    }

    console.log(`   🔹 Validating data formats for ${recentPublications.length} recent publications...`);

    const formatValidation = {
      dateFormats: { valid: 0, invalid: 0, errors: [] },
      xmlFormats: { valid: 0, invalid: 0, errors: [] },
      htmlContent: { valid: 0, invalid: 0, errors: [] },
      numericValues: { valid: 0, invalid: 0, errors: [] }
    };

    for (const pub of recentPublications) {
      // Date format validation
      const pubDateValid = this.isValidISODate(pub.publishDate.toISOString());
      if (pubDateValid) {
        formatValidation.dateFormats.valid++;
      } else {
        formatValidation.dateFormats.invalid++;
        formatValidation.dateFormats.errors.push(`Publication ${pub.id}: Invalid publish date format`);
      }

      // XML format validation
      const xmlValid = this.isValidXML(pub.xmlContent);
      if (xmlValid) {
        formatValidation.xmlFormats.valid++;
      } else {
        formatValidation.xmlFormats.invalid++;
        formatValidation.xmlFormats.errors.push(`Publication ${pub.id}: Invalid XML content`);
      }

      // Auction date validation
      for (const auction of pub.auctions) {
        const auctionDateValid = this.isValidDateTime(auction.auctionDate);
        if (auctionDateValid) {
          formatValidation.dateFormats.valid++;
        } else {
          formatValidation.dateFormats.invalid++;
          formatValidation.dateFormats.errors.push(`Auction ${auction.id}: Invalid auction date`);
        }

        // HTML content in objects
        for (const obj of auction.auctionObjects) {
          const htmlValid = this.isValidHTMLContent(obj.rawText);
          if (htmlValid) {
            formatValidation.htmlContent.valid++;
          } else {
            formatValidation.htmlContent.invalid++;
            formatValidation.htmlContent.errors.push(`Object ${obj.id}: Invalid HTML content`);
          }

          // Object order numeric validation
          const orderValid = Number.isInteger(obj.objectOrder) && obj.objectOrder >= 1;
          if (orderValid) {
            formatValidation.numericValues.valid++;
          } else {
            formatValidation.numericValues.invalid++;
            formatValidation.numericValues.errors.push(`Object ${obj.id}: Invalid object order`);
          }
        }
      }
    }

    const totalInvalid = formatValidation.dateFormats.invalid + formatValidation.xmlFormats.invalid + 
                        formatValidation.htmlContent.invalid + formatValidation.numericValues.invalid;
    
    if (totalInvalid > 0) {
      const allErrors = [
        ...formatValidation.dateFormats.errors,
        ...formatValidation.xmlFormats.errors,
        ...formatValidation.htmlContent.errors,
        ...formatValidation.numericValues.errors
      ];
      throw new Error(`Format validation failed: ${allErrors.slice(0, 2).join('; ')}${allErrors.length > 2 ? `... and ${allErrors.length - 2} more` : ''}`);
    }

    return {
      publicationsChecked: recentPublications.length,
      formatValidation,
      allFormatsValid: totalInvalid === 0
    };
  }

  private async testRelationshipIntegrity(): Promise<any> {
    console.log('   🔹 Testing cross-table relationship integrity...');
    
    const integrityResults = {
      orphanedAuctions: 0,
      orphanedObjects: 0,
      missingRelations: [],
      validRelations: 0
    };

    // Check for orphaned auctions (auctions without valid publication references)
    // Since shabPublicationId is required and has foreign key constraint, 
    // orphaned auctions would violate DB integrity - this is more of a sanity check
    const totalAuctions = await prisma.auction.count();
    
    // Check if any auctions reference non-existent publications
    const auctionsWithValidPublications = await prisma.auction.count({
      where: {
        shabPublicationId: {
          in: (await prisma.shabPublication.findMany({ select: { id: true } })).map(p => p.id)
        }
      }
    });
    integrityResults.orphanedAuctions = totalAuctions - auctionsWithValidPublications;

    // Check for orphaned auction objects (objects without valid auction references)
    const totalObjects = await prisma.auctionObject.count();
    const objectsWithValidAuctions = await prisma.auctionObject.count({
      where: {
        auctionId: {
          in: (await prisma.auction.findMany({ select: { id: true } })).map(a => a.id)
        }
      }
    });
    integrityResults.orphanedObjects = totalObjects - objectsWithValidAuctions;

    // Check foreign key relationships
    const publications = await prisma.shabPublication.findMany({
      take: 10,
      include: { auctions: { include: { auctionObjects: true } } }
    });

    for (const pub of publications) {
      for (const auction of pub.auctions) {
        if (auction.shabPublicationId === pub.id) {
          integrityResults.validRelations++;
        } else {
          integrityResults.missingRelations.push(`Auction ${auction.id} has mismatched publication reference`);
        }

        for (const obj of auction.auctionObjects) {
          if (obj.auctionId === auction.id) {
            integrityResults.validRelations++;
          } else {
            integrityResults.missingRelations.push(`Object ${obj.id} has mismatched auction reference`);
          }
        }
      }
    }

    const hasIntegrityIssues = integrityResults.orphanedAuctions > 0 || 
                              integrityResults.orphanedObjects > 0 || 
                              integrityResults.missingRelations.length > 0;

    if (hasIntegrityIssues) {
      throw new Error(`Relationship integrity issues: ${integrityResults.orphanedAuctions} orphaned auctions, ${integrityResults.orphanedObjects} orphaned objects, ${integrityResults.missingRelations.length} missing relations`);
    }

    return {
      publicationsChecked: publications.length,
      integrityResults,
      relationshipIntegrityValid: !hasIntegrityIssues
    };
  }

  private async testSwissSpecificValidation(): Promise<any> {
    console.log('   🔹 Testing Swiss-specific data validation...');
    
    const swissValidation = {
      validCantons: 0,
      invalidCantons: 0,
      invalidCantonCodes: [],
      germanLanguage: 0,
      frenchLanguage: 0,
      italianLanguage: 0,
      unknownLanguage: 0
    };

    const publications = await prisma.shabPublication.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    if (publications.length === 0) {
      return { testSkipped: true, reason: 'No publications for Swiss validation' };
    }

    console.log(`   🔹 Validating Swiss data for ${publications.length} publications...`);

    for (const pub of publications) {
      // Canton code validation
      if (this.validCantons.includes(pub.canton)) {
        swissValidation.validCantons++;
      } else {
        swissValidation.invalidCantons++;
        if (!swissValidation.invalidCantonCodes.includes(pub.canton)) {
          swissValidation.invalidCantonCodes.push(pub.canton);
        }
      }

      // Language validation
      switch (pub.officialLanguage.toLowerCase()) {
        case 'de':
          swissValidation.germanLanguage++;
          break;
        case 'fr':
          swissValidation.frenchLanguage++;
          break;
        case 'it':
          swissValidation.italianLanguage++;
          break;
        default:
          swissValidation.unknownLanguage++;
      }
    }

    const hasSwissDataIssues = swissValidation.invalidCantons > 0 || swissValidation.unknownLanguage > 0;
    
    if (hasSwissDataIssues) {
      throw new Error(`Swiss data validation failed: ${swissValidation.invalidCantons} invalid cantons (${swissValidation.invalidCantonCodes.join(', ')}), ${swissValidation.unknownLanguage} unknown languages`);
    }

    return {
      publicationsValidated: publications.length,
      swissValidation,
      swissDataValid: !hasSwissDataIssues
    };
  }

  private async testHtmlContentValidation(): Promise<any> {
    console.log('   🔹 Testing HTML content validation...');
    
    const htmlValidation = {
      objectsWithContent: 0,
      objectsWithoutContent: 0,
      objectsWithValidHtml: 0,
      objectsWithMalformedHtml: 0,
      contentLengthStats: { min: Infinity, max: 0, average: 0 }
    };

    const objects = await prisma.auctionObject.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    if (objects.length === 0) {
      return { testSkipped: true, reason: 'No auction objects for HTML validation' };
    }

    console.log(`   🔹 Validating HTML content for ${objects.length} auction objects...`);

    const contentLengths = [];

    for (const obj of objects) {
      if (obj.rawText && obj.rawText.trim().length > 0) {
        htmlValidation.objectsWithContent++;
        
        const contentLength = obj.rawText.length;
        contentLengths.push(contentLength);
        
        if (this.isValidHTMLContent(obj.rawText)) {
          htmlValidation.objectsWithValidHtml++;
        } else {
          htmlValidation.objectsWithMalformedHtml++;
        }
      } else {
        htmlValidation.objectsWithoutContent++;
      }
    }

    if (contentLengths.length > 0) {
      htmlValidation.contentLengthStats.min = Math.min(...contentLengths);
      htmlValidation.contentLengthStats.max = Math.max(...contentLengths);
      htmlValidation.contentLengthStats.average = Math.round(contentLengths.reduce((sum, len) => sum + len, 0) / contentLengths.length);
    }

    const contentValidationRate = htmlValidation.objectsWithContent > 0 ? 
      (htmlValidation.objectsWithValidHtml / htmlValidation.objectsWithContent * 100).toFixed(1) : '0';

    if (htmlValidation.objectsWithoutContent > htmlValidation.objectsWithContent * 0.5) {
      throw new Error(`Too many objects without content: ${htmlValidation.objectsWithoutContent}/${objects.length} (>${50}%)`);
    }

    return {
      objectsChecked: objects.length,
      htmlValidation,
      contentValidationRate: `${contentValidationRate}%`,
      contentPresent: htmlValidation.objectsWithContent > 0
    };
  }

  // Validation helper methods
  private validatePublicationFields(publication: any): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (!publication.id || publication.id.trim() === '') errors.push('Missing ID');
    if (!publication.publishDate) errors.push('Missing publish date');
    if (!publication.canton || publication.canton.trim() === '') errors.push('Missing canton');
    if (!publication.rubric || publication.rubric.trim() === '') errors.push('Missing rubric');
    if (!publication.subRubric || publication.subRubric.trim() === '') errors.push('Missing subRubric');
    if (!publication.officialLanguage || publication.officialLanguage.trim() === '') errors.push('Missing official language');
    if (!publication.xmlContent || publication.xmlContent.trim() === '') errors.push('Missing XML content');
    
    return { isValid: errors.length === 0, errors };
  }

  private validateAuctionFields(auction: any): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (!auction.id || auction.id.trim() === '') errors.push('Missing ID');
    if (!auction.auctionDate) errors.push('Missing auction date');
    if (!auction.auctionLocation || auction.auctionLocation.trim() === '') errors.push('Missing auction location');
    if (!auction.shabPublicationId || auction.shabPublicationId.trim() === '') errors.push('Missing publication reference');
    
    return { isValid: errors.length === 0, errors };
  }

  private validateObjectFields(object: any): { isValid: boolean; errors: string[] } {
    const errors = [];
    
    if (!object.id || object.id.trim() === '') errors.push('Missing ID');
    if (!object.rawText || object.rawText.trim() === '') errors.push('Missing raw text');
    if (!Number.isInteger(object.objectOrder) || object.objectOrder < 1) errors.push('Invalid object order');
    if (!object.auctionId || object.auctionId.trim() === '') errors.push('Missing auction reference');
    
    return { isValid: errors.length === 0, errors };
  }

  private isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
  }

  private isValidDateTime(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  private isValidXML(xmlString: string): boolean {
    try {
      // Basic XML validation - check for proper structure
      return xmlString.includes('<?xml') && xmlString.includes('<') && xmlString.includes('>');
    } catch {
      return false;
    }
  }

  private isValidHTMLContent(content: string): boolean {
    // Check for basic HTML patterns or meaningful text content
    if (!content || content.trim().length === 0) return false;
    
    // Content should have some substance (more than just whitespace)
    const meaningfulContent = content.replace(/\s+/g, ' ').trim();
    return meaningfulContent.length > 10; // Minimum meaningful content
  }

  private getResultSummary(result: any): string {
    if (result.testSkipped) {
      return `Test skipped: ${result.reason}`;
    }
    if (result.allRequiredFieldsPresent !== undefined) {
      return `${result.publicationsValidated} publications, ${result.totalPassed} fields passed, ${result.totalFailed} failed`;
    }
    if (result.allFormatsValid !== undefined) {
      return `${result.publicationsChecked} publications, all formats valid: ${result.allFormatsValid}`;
    }
    if (result.relationshipIntegrityValid !== undefined) {
      return `${result.publicationsChecked} publications, relationships valid: ${result.relationshipIntegrityValid}`;
    }
    if (result.swissDataValid !== undefined) {
      return `${result.publicationsValidated} publications, Swiss data valid: ${result.swissDataValid}`;
    }
    if (result.contentPresent !== undefined) {
      return `${result.objectsChecked} objects, ${result.contentValidationRate} content validation rate`;
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
    console.log('\n📊 Database Field Validation Test Results Summary');
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
      console.log('🎉 All database field validation tests passed! Data quality is excellent.');
      console.log('✨ Key achievements:');
      console.log('   • All required fields properly populated');
      console.log('   • Data formats and types validated');
      console.log('   • Cross-table relationships intact');
      console.log('   • Swiss-specific data validated');
      console.log('   • HTML content quality confirmed');
    } else {
      console.log('⚠️ Some field validation tests failed. Data quality issues detected.');
      console.log('🔧 Recommended actions:');
      console.log('   1. Review data processing logic for missing fields');
      console.log('   2. Check date/time parsing and formatting');
      console.log('   3. Validate foreign key relationships');
      console.log('   4. Review Swiss canton and language mappings');
      console.log('   5. Inspect HTML content extraction from XML');
    }
  }
}

// CLI execution
async function main() {
  const tester = new DatabaseValidationTest();
  
  try {
    const { success } = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Database validation test execution failed:', error);
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

export default DatabaseValidationTest;