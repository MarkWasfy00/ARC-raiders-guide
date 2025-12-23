import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ItemType, Rarity } from '@/lib/generated/prisma/enums';

export const dynamic = 'force-dynamic';

/**
 * Converts an icon value to a valid image URL
 */
function getImageUrl(icon: string | null): string | null {
  // If no icon, return null (component will show fallback)
  if (!icon || icon.trim() === '') {
    return null;
  }

  // If already a full URL, return as-is
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  // If it's just an ID or partial path, construct full CDN URL
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

    // Build where clause
    const where: any = {};

    // Search filter (searches name and description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Type filter
    if (typeFilter) {
      where.item_type = typeFilter;
    }

    // Rarity filter
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
      const statBlock = item.stat_block as any;
      const weight = statBlock?.weight || 0;

      return {
        ...item,
        icon: getImageUrl(item.icon),
        weight,
      };
    });

    return NextResponse.json({
      success: true,
      data: itemsWithWeight,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
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
