#!/usr/bin/env node
/**
 * Manual SHAB API Testing Script
 * Allows manual testing of API endpoints with different parameters
 */

import { ShabApiService } from '../dist/lib/shab-api.js';

async function testApi() {
  console.log('🧪 Manual SHAB API Testing Script');
  console.log('=====================================\n');

  const shabApi = new ShabApiService();

  try {
    // Test 1: Fetch today's publications
    console.log('📅 Test 1: Fetching today\'s publications...');
    const todayPubs = await shabApi.fetchDailyPublications();
    console.log(`✅ Found ${todayPubs.length} publications for today\n`);

    if (todayPubs.length > 0) {
      const firstPub = todayPubs[0];
      console.log('📄 Sample Publication:');
      console.log(`   ID: ${firstPub.id}`);
      console.log(`   Date: ${firstPub.publishDate}`);
      console.log(`   Canton: ${firstPub.canton}`);
      console.log(`   Rubric: ${firstPub.rubric}/${firstPub.subRubric}`);
      console.log(`   Language: ${firstPub.officialLanguage}`);
      console.log(`   XML Length: ${firstPub.xmlContent.length} characters\n`);
    }

    // Test 2: Fetch historical publications (last 5 days)
    console.log('📈 Test 2: Fetching historical publications (last 5 days)...');
    const historicalPubs = await shabApi.fetchHistoricalPublications(5);
    console.log(`✅ Found ${historicalPubs.length} historical publications\n`);

    // Test 3: Test XML parsing
    if (todayPubs.length > 0 || historicalPubs.length > 0) {
      const testPub = todayPubs[0] || historicalPubs[0];
      console.log('🔍 Test 3: Parsing XML content...');
      
      try {
        const parsedData = shabApi.parsePublicationXml(testPub.xmlContent);
        console.log(`✅ XML parsed successfully:`);
        console.log(`   Auctions found: ${parsedData.auctions.length}`);
        
        if (parsedData.auctions.length > 0) {
          const firstAuction = parsedData.auctions[0];
          console.log(`   First auction:`);
          console.log(`     Date: ${firstAuction.date || 'Not specified'}`);
          console.log(`     Location: ${firstAuction.location || 'Not specified'}`);
          console.log(`     Objects: ${firstAuction.objects.length}`);
        }
      } catch (parseError) {
        console.log(`⚠️  XML parsing encountered issue: ${parseError.message}`);
      }
      console.log();
    }

    // Test 4: Test error handling with invalid dates
    console.log('❌ Test 4: Testing error handling...');
    try {
      const invalidDate = new Date('invalid');
      await shabApi.fetchPublications(invalidDate, new Date(), 0, 1);
      console.log('⚠️  Expected error handling did not occur');
    } catch (error) {
      console.log(`✅ Error handling working correctly: ${error.message.substring(0, 100)}...`);
    }
    console.log();

    // Test 5: Performance test
    console.log('⚡ Test 5: Performance test (fetching 10 publications)...');
    const startTime = Date.now();
    const perfPubs = await shabApi.fetchHistoricalPublications(3);
    const endTime = Date.now();
    console.log(`✅ Fetched ${perfPubs.length} publications in ${endTime - startTime}ms\n`);

    console.log('🎉 All API tests completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Run during business hours for more data');
    console.log('   - SHAB publishes Monday-Friday');
    console.log('   - Historical data goes back several months');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Manual SHAB API Testing Script');
  console.log('Usage: node scripts/test-api.js [--help]');
  console.log('');
  console.log('This script tests the SHAB API integration with live data.');
  console.log('No arguments needed - it runs all test scenarios automatically.');
  process.exit(0);
}

// Run the tests
testApi().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});