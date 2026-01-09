import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/loadouts
 * Fetch loadouts with optional filters
 *
 * Query params:
 * - userId: Filter by user ID
 * - public: Filter by public/private (true/false)
 * - tags: Comma-separated tags to filter by
 * - search: Search term for name/description
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');
    const tagsParam = searchParams.get('tags');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.is_public = isPublic === 'true';
    }

    if (tagsParam) {
      const tags = tagsParam.split(',').filter((t) => t.trim());
      if (tags.length > 0) {
        where.tags = {
          hasSome: tags,
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch loadouts
    const loadouts = await prisma.loadout.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            embark_id: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: loadouts,
    });
  } catch (error) {
    console.error('Error fetching loadouts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch loadouts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
