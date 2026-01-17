import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/maps/config?mapId=buried-city
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

    const config = await prisma.mapConfiguration.findUnique({
      where: { mapID: mapId },
    });

    if (!config) {
      return NextResponse.json(
        { success: true, config: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      config: {
        centerLat: config.centerLat,
        centerLng: config.centerLng,
        zoom: config.zoom,
      },
    });
  } catch (error) {
    console.error('Error fetching map configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch map configuration' },
      { status: 500 }
    );
  }
}

// POST /api/maps/config
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mapId, centerLat, centerLng, zoom } = body;

    if (!mapId || centerLat === undefined || centerLng === undefined || zoom === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert the configuration (create or update)
    const config = await prisma.mapConfiguration.upsert({
      where: { mapID: mapId },
      update: {
        centerLat,
        centerLng,
        zoom,
      },
      create: {
        mapID: mapId,
        centerLat,
        centerLng,
        zoom,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Map configuration saved successfully',
      config,
    });
  } catch (error) {
    console.error('Error saving map configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save map configuration' },
      { status: 500 }
    );
  }
}
