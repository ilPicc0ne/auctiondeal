#!/usr/bin/env tsx

/**
 * SHAB Volume Test Script
 * Tests API result counts for different date ranges
 * Expected results as of 2025-09-05: 
 * - Today: 5 results
 * - Last 7 days: 11 results  
 * - Last 30 days: 68 results
 */

import { ShabApiService } from '../src/lib/services/shab-api';

interface VolumeTestResult {
  period: string;
  expected: number;
  actual: number;
  passed: boolean;
  tolerance: number;
  startDate: string;
  endDate: string;
}

class ShabVolumeTest {
  private shabApi = new ShabApiService();
  private results: VolumeTestResult[] = [];
  private testDate = '2025-09-05'; // Reference date for expected results

  async runVolumeTests(): Promise<void> {
    console.log('🧪 Starting SHAB Volume Tests');
    console.log(`📅 Test reference date: ${this.testDate}\n`);

    // Test today's results
    await this.testPeriod('today', 1, 5, 2);
    
    // Test last 7 days
    await this.testPeriod('7days', 7, 11, 3);
    
    // Test last 30 days  
    await this.testPeriod('30days', 30, 68, 10);

    this.printResults();
  }

  private async testPeriod(
    period: string, 
    daysBack: number, 
    expected: number, 
    tolerance: number
  ): Promise<void> {
    console.log(`🔄 Testing ${period} (${daysBack} days back)...`);

    const endDate = new Date(this.testDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - daysBack + 1); // +1 to include today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      const publications = await this.shabApi.fetchPublications(
        startDateStr, 
        endDateStr, 
        0, 
        200 // Higher limit to capture all results
      );

      const actual = publications.length;
      const passed = Math.abs(actual - expected) <= tolerance;

      const result: VolumeTestResult = {
        period,
        expected,
        actual,
        passed,
        tolerance,
        startDate: startDateStr,
        endDate: endDateStr
      };

      this.results.push(result);

      const status = passed ? '✅' : '❌';
      const diff = actual - expected;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      
      console.log(`${status} ${period}: ${actual} results (expected: ${expected} ±${tolerance}, diff: ${diffStr})`);
      console.log(`   📅 Range: ${startDateStr} to ${endDateStr}`);

      if (publications.length > 0) {
        // Show breakdown by canton
        const cantons = publications.reduce((acc, p) => {
          acc[p.canton] = (acc[p.canton] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const cantonList = Object.entries(cantons)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([canton, count]) => `${canton}(${count})`)
          .join(', ');
        
        console.log(`   🌍 Top cantons: ${cantonList}`);
      }

    } catch (error) {
      console.error(`❌ ${period} test failed:`, error.message);
      
      this.results.push({
        period,
        expected,
        actual: -1,
        passed: false,
        tolerance,
        startDate: startDateStr,
        endDate: endDateStr
      });

      if (error.message.includes('ECONNREFUSED')) {
        console.log('🌐 Network connectivity issue detected');
      }
    }

    console.log(''); // Empty line for readability
  }

  private printResults(): void {
    console.log('📊 SHAB Volume Test Results Summary');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = Math.round((passed / total) * 100);

    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const actualStr = result.actual === -1 ? 'ERROR' : result.actual.toString();
      
      console.log(`${status} ${result.period.padEnd(8)} | Expected: ${result.expected.toString().padEnd(3)} ±${result.tolerance} | Actual: ${actualStr.padEnd(5)} | ${result.startDate} to ${result.endDate}`);
    });

    console.log('='.repeat(50));
    console.log(`📈 Overall: ${passed}/${total} tests passed (${passRate}%)`);

    if (passed === total) {
      console.log('🎉 All volume tests passed! SHAB API is returning expected data volumes.');
    } else {
      console.log('⚠️  Some volume tests failed. This may indicate:');
      console.log('   • Network connectivity issues');
      console.log('   • API changes or temporary issues');  
      console.log('   • Expected volumes have changed since test was written');
      console.log('   • Date range calculation differences');
    }

    // Additional insights
    const successfulResults = this.results.filter(r => r.actual >= 0);
    if (successfulResults.length > 1) {
      console.log('\n📈 Volume Analysis:');
      
      const dailyAverage = successfulResults.find(r => r.period === '30days');
      if (dailyAverage && dailyAverage.actual > 0) {
        const avgPerDay = (dailyAverage.actual / 30).toFixed(1);
        console.log(`   📊 Average publications per day: ${avgPerDay}`);
      }
    }
  }
}

// CLI execution
async function main() {
  const tester = new ShabVolumeTest();
  
  try {
    await tester.runVolumeTests();
    process.exit(0);
  } catch (error) {
    console.error('💥 Volume test execution failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export default ShabVolumeTest;