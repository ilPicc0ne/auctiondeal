/**
 * Daily SHAB Synchronization Cron Job Proxy
 * Runs daily at 16:30 CET to trigger collector service
 * Vercel Cron: 30 16 * * * (4:30 PM CET daily)
 * 
 * Note: This is now a proxy to the collector-node service
 * The actual SHAB processing happens in the collector service
 */

import { NextRequest, NextResponse } from 'next/server';

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

    console.log('🕓 Triggering SHAB collector service...');

    // In the future, this could call the collector service HTTP API
    // For now, we'll return a success response since the collector
    // service handles its own scheduling
    
    const duration = Date.now() - startTime;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      message: 'SHAB collection handled by collector-node service',
      note: 'The collector-node service runs its own cron schedule at 16:30 CET'
    };

    console.log('✅ SHAB collector service trigger completed:', response.message);

    // Return success response
    return NextResponse.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('❌ SHAB collector trigger failed:', error);

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Also handle POST requests for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}