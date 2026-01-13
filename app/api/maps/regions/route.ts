import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch all regions for a specific map
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json(
        { success: false, error: 'mapId is required' },
        { status: 400 }
      );
    }

    const regions = await prisma.mapRegion.findMany({
      where: {
        mapID: mapId,
      },
      include: {
        addedBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      regions,
      total: regions.length,
    });
  } catch (error) {
    console.error('Error fetching map regions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}

// POST - Create a new region
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      mapId,
      name,
      nameAr,
      description,
      coordinates,
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight,
    } = body;

    // Validate required fields
    if (!mapId || !name || !coordinates || !Array.isArray(coordinates)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate coordinates array
    if (coordinates.length < 3) {
      return NextResponse.json(
        { success: false, error: 'A region must have at least 3 points' },
        { status: 400 }
      );
    }

    const region = await prisma.mapRegion.create({
      data: {
        mapID: mapId,
        name,
        nameAr: nameAr || null,
        description: description || null,
        coordinates,
        fillColor: fillColor || '#ff0000',
        fillOpacity: fillOpacity !== undefined ? fillOpacity : 0.3,
        strokeColor: strokeColor || '#ff0000',
        strokeWeight: strokeWeight || 2,
        addedByUserId: session.user.id,
      },
      include: {
        addedBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      region,
    });
  } catch (error) {
    console.error('Error creating map region:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create region' },
      { status: 500 }
    );
  }
}
