#!/usr/bin/env tsx

/**
 * Direct SHAB API Test
 * Tests the actual SHAB API to understand authentication and response format
 */

async function testShabApiDirect() {
  const baseUrl = 'https://www.shab.ch/api/v1/publications';
  
  console.log('🔍 Testing SHAB API directly...');
  
  // Test basic API endpoint
  console.log('📡 Testing API endpoint accessibility...');
  
  // Use last 7 days like the working example
  const endDate = '2025-09-05';
  const startDate = '2025-08-30';
  const params = new URLSearchParams({
    'allowRubricSelection': 'true',
    'includeContent': 'false',
    'pageRequest.page': '0',
    'pageRequest.size': '5',
    'publicationDate.start': startDate,
    'publicationDate.end': endDate,
    'publicationStates': 'PUBLISHED,CANCELLED',
    'searchPeriod': 'LAST7DAYS',
    'subRubrics': 'SB01'
  });

  const url = `${baseUrl}?${params.toString()}`;
  console.log('🔗 Request URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://shab.ch/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('📊 Response status:', response.status, response.statusText);
    console.log('📋 Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const responseText = await response.text();
    console.log('📄 Response body (first 500 chars):', responseText.substring(0, 500));

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ Successfully parsed JSON response');
        console.log('📊 Response structure:', Object.keys(jsonData));
        
        if (jsonData.content) {
          console.log(`📝 Found ${jsonData.content.length} publications`);
          if (jsonData.content.length > 0) {
            console.log('📋 First publication structure:', Object.keys(jsonData.content[0]));
          }
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON:', parseError.message);
      }
    } else {
      console.log('❌ API request failed');
    }

  } catch (error) {
    console.error('💥 Request failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 DNS resolution failed - check if shab.ch is accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🚫 Connection refused - API might be down');
    }
  }
}

// Run the test
testShabApiDirect()
  .then(() => {
    console.log('✅ Direct API test completed');
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
  });