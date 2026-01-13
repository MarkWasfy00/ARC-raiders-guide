import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/maps/routes/visibility
// Set one route visible, hide all others for user+map
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { routeId, mapId } = body;

    if (!routeId || !mapId) {
      return NextResponse.json({ error: 'routeId and mapId required' }, { status: 400 });
    }

    // Verify ownership
    const route = await prisma.mapRoute.findUnique({
      where: { id: routeId },
    });

    if (!route || route.userId !== session.user.id || route.mapID !== mapId) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Toggle behavior: if route is visible, hide it; otherwise show it (hiding all others)
    const isCurrentlyVisible = route.visible;

    await prisma.$transaction(async (tx) => {
      if (isCurrentlyVisible) {
        // If currently visible, just hide it
        await tx.mapRoute.update({
          where: { id: routeId },
          data: {
            visible: false,
          },
        });
      } else {
        // If currently hidden, hide all routes for this user+map
        await tx.mapRoute.updateMany({
          where: {
            userId: session.user.id,
            mapID: mapId,
          },
          data: {
            visible: false,
          },
        });

        // Then show the selected route
        await tx.mapRoute.update({
          where: { id: routeId },
          data: {
            visible: true,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    return NextResponse.json({ error: 'Failed to toggle visibility' }, { status: 500 });
  }
}
