import { NextResponse } from 'next/server';
import { ArcRaidersAPIResponse } from '@/app/features/traders/types';

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds
let cachedData: ArcRaidersAPIResponse | null = null;
let lastFetchTime: number = 0;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = Date.now();
    const cacheAge = now - lastFetchTime;

    // Return cached data if it's still fresh
    if (cachedData && cacheAge < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheAge: Math.floor(cacheAge / 1000), // in seconds
      });
    }

    // Fetch fresh data from MetaForge API
    const response = await fetch('https://metaforge.app/api/arc-raiders/traders', {
      next: { revalidate: 86400 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      throw new Error(`MetaForge API returned ${response.status}`);
    }

    const data: ArcRaidersAPIResponse = await response.json();

    // Update cache
    cachedData = data;
    lastFetchTime = now;

    return NextResponse.json({
      ...data,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    console.error('Error fetching traders data:', error);

    // Return cached data if available, even if stale
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        stale: true,
        cacheAge: Math.floor((Date.now() - lastFetchTime) / 1000),
      });
    }

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch traders data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
