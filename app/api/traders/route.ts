import { NextResponse } from 'next/server';
import { ArcRaidersAPIResponse } from '@/app/features/traders/types';
import { cache, cacheKeys } from '@/lib/redis';

// Cache TTL: 24 hours
const CACHE_TTL = 24 * 60 * 60;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = cacheKeys.traders();

    // Try Redis cache first
    const cachedData = await cache.get<ArcRaidersAPIResponse & { fetchedAt: number }>(cacheKey);

    if (cachedData) {
      const cacheAge = Math.floor((Date.now() - cachedData.fetchedAt) / 1000);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheAge,
      });
    }

    // Fetch fresh data from MetaForge API
    const response = await fetch('https://metaforge.app/api/arc-raiders/traders', {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`MetaForge API returned ${response.status}`);
    }

    const data: ArcRaidersAPIResponse = await response.json();

    // Store in Redis with timestamp
    const dataWithTimestamp = {
      ...data,
      fetchedAt: Date.now(),
    };

    await cache.set(cacheKey, dataWithTimestamp, CACHE_TTL);

    return NextResponse.json({
      ...data,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    console.error('Error fetching traders data:', error);

    // Try to get stale data from Redis on error
    const cacheKey = cacheKeys.traders();
    const staleData = await cache.get<ArcRaidersAPIResponse & { fetchedAt: number }>(cacheKey);

    if (staleData) {
      return NextResponse.json({
        ...staleData,
        cached: true,
        stale: true,
        cacheAge: Math.floor((Date.now() - staleData.fetchedAt) / 1000),
      });
    }

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
