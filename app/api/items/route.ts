import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ItemType, Rarity } from '@/lib/generated/prisma/enums';
import { cache, cacheKeys } from '@/lib/redis';

// Cache TTL: 1 hour (items rarely change)
const CACHE_TTL = 3600;

/**
 * Converts an icon value to a valid image URL
 */
function getImageUrl(icon: string | null): string | null {
  if (!icon || icon.trim() === '') {
    return null;
  }

  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  const iconId = icon.endsWith('.webp') ? icon : `${icon}.webp`;
  return `https://cdn.metaforge.app/arc-raiders/icons/${iconId}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Search parameter
    const search = searchParams.get('search') || '';

    // Filter parameters
    const typeFilter = searchParams.get('type') as ItemType | null;
    const rarityFilter = searchParams.get('rarity') as Rarity | null;

    // Create cache key from query params
    const cacheKey = cacheKeys.items(JSON.stringify({ page, pageSize, search, typeFilter, rarityFilter }));

    // Try Redis cache first (skip for searches to ensure fresh results)
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
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeFilter) {
      where.item_type = typeFilter;
    }

    if (rarityFilter) {
      where.rarity = rarityFilter;
    }

    // Get total count for pagination
    const totalCount = await prisma.item.count({ where });

    // Fetch items
    const items = await prisma.item.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        item_type: true,
        icon: true,
        rarity: true,
        value: true,
        stat_block: true,
      },
    });

    // Calculate weight from stat_block and fix icon URLs
    const itemsWithWeight = items.map(item => {
      const statBlock = item.stat_block as Record<string, unknown> | null;
      const weight = (statBlock?.weight as number) || 0;

      return {
        ...item,
        icon: getImageUrl(item.icon),
        weight,
      };
    });

    const responseData = {
      data: itemsWithWeight,
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
    console.error('Error fetching items:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
