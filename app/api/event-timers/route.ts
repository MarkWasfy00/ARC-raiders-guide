import { NextResponse } from 'next/server';
import { EventsScheduleResponse } from '@/app/features/event-timers';
import { cache, cacheKeys } from '@/lib/redis';

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = cacheKeys.eventTimers();

    // Try Redis cache first
    const cachedData = await cache.get<EventsScheduleResponse & { fetchedAt: number }>(cacheKey);

    if (cachedData) {
      const cacheAge = Math.floor((Date.now() - cachedData.fetchedAt) / 1000);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheAge,
      });
    }

    // Fetch fresh data from MetaForge API
    const response = await fetch('https://metaforge.app/api/arc-raiders/events-schedule', {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`MetaForge API returned ${response.status}`);
    }

    const data: EventsScheduleResponse = await response.json();

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
    console.error('Error fetching event timers data:', error);

    // Try to get stale data from Redis on error
    const cacheKey = cacheKeys.eventTimers();
    const staleData = await cache.get<EventsScheduleResponse & { fetchedAt: number }>(cacheKey);

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
        error: 'Failed to fetch event timers data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
