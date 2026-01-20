import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

// Cache TTL: 1 hour (quests rarely change)
const CACHE_TTL = 3600;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Search parameter
    const search = searchParams.get('search') || '';

    // Create cache key
    const cacheKey = `quests:${JSON.stringify({ page, pageSize, search })}`;

    // Try Redis cache first (skip for searches)
    if (!search) {
      const cachedData = await cache.get<{ data: unknown; pagination: unknown }>(cacheKey);
      if (cachedData) {
        return NextResponse.json({
          success: true,
          ...cachedData,
          cached: true,
        });
      }
    }

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { objectives: { hasSome: [search] } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.quest.count({ where });

    // Fetch quests with their rewards
    const quests = await prisma.quest.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        objectives: true,
        xp: true,
        granted_items: true,
        locations: true,
        marker_category: true,
        image: true,
        guide_links: true,
        required_items: true,
        created_at: true,
        updated_at: true,
        rewards: {
          select: {
            id: true,
            quantity: true,
            itemId: true,
          },
        },
      },
    });

    const responseData = {
      data: quests,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };

    // Cache the result (skip for searches)
    if (!search) {
      await cache.set(cacheKey, responseData, CACHE_TTL);
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
