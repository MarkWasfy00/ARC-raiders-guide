import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Route color mapping
const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#A8E6CF', '#FFD93D', '#6BCF7F', '#C7CEEA', '#FF8B94'
];

// GET /api/maps/routes?mapId=stella-montis
// Fetch all routes for current user + mapId
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mapId = searchParams.get('mapId');

    if (!mapId) {
      return NextResponse.json({ error: 'mapId required' }, { status: 400 });
    }

    const routes = await prisma.mapRoute.findMany({
      where: {
        userId: session.user.id,
        mapID: mapId,
      },
      orderBy: {
        routeNumber: 'asc',
      },
    });

    return NextResponse.json({ success: true, routes });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

// POST /api/maps/routes
// Create new route
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mapId, routeNumber, name, nameAr, coordinates } = body;

    // Validation
    if (!mapId || !routeNumber || !coordinates || !Array.isArray(coordinates)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (routeNumber < 1 || routeNumber > 10) {
      return NextResponse.json({ error: 'routeNumber must be 1-10' }, { status: 400 });
    }

    if (coordinates.length < 2) {
      return NextResponse.json({ error: 'Route must have at least 2 points' }, { status: 400 });
    }

    // Check if route already exists
    const existing = await prisma.mapRoute.findUnique({
      where: {
        userId_mapID_routeNumber: {
          userId: session.user.id,
          mapID: mapId,
          routeNumber,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Route slot already exists' }, { status: 409 });
    }

    // Create route
    const color = ROUTE_COLORS[routeNumber - 1];
    const route = await prisma.mapRoute.create({
      data: {
        userId: session.user.id,
        mapID: mapId,
        routeNumber,
        name: name || null,
        nameAr: nameAr || null,
        coordinates,
        color,
        visible: false, // Not visible by default
      },
    });

    return NextResponse.json({ success: true, route });
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}
