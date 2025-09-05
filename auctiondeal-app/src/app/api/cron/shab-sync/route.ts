/**
 * Daily SHAB Synchronization Cron Job
 * Runs daily at 16:30 CET to fetch new auction publications
 * Vercel Cron: 30 16 * * * (4:30 PM CET daily)
 */

import { NextRequest, NextResponse } from 'next/server';
import { shabProcessorService } from '@/lib/services/shab-processor';

// Verify this is a legitimate cron request
function verifyCronRequest(request: NextRequest): boolean {
  // In production, verify the cron secret
  const cronSecret = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
    return false;
  }

  // Also check Vercel cron headers
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  return vercelCronHeader === '1' || process.env.NODE_ENV === 'development';
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify this is a legitimate cron request
    if (!verifyCronRequest(request)) {
      console.warn('🚫 Unauthorized cron request blocked');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕓 Starting daily SHAB synchronization...');

    // Process daily publications
    const result = await shabProcessorService.processDailyPublications();

    // Get processing statistics
    const stats = await shabProcessorService.getProcessingStats();

    // Clean up any failed processing attempts
    const cleanedUp = await shabProcessorService.cleanupFailedProcessing();

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      result: {
        processed: result.processed,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
        cleanedUp
      },
      stats: {
        totalPublications: stats.totalPublications,
        totalAuctions: stats.totalAuctions,
        totalObjects: stats.totalAuctionObjects,
        lastProcessed: stats.lastProcessed
      }
    };

    console.log('✅ Daily SHAB synchronization completed:', response.result);

    // Return success response
    return NextResponse.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('❌ Daily SHAB synchronization failed:', error);

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Also handle POST requests for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}