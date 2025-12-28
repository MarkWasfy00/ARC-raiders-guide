import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);

    const rawMarkers = await prisma.mapMarker.findMany({
      where: {
        mapID: 'spaceport',
        ...(categories && categories.length > 0
          ? { category: { in: categories } }
          : {}),
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        category: true,
        subcategory: true,
        instanceName: true,
        behindLockedDoor: true,
        lootAreas: true,
      },
    });

    // Convert lootAreas to array format
    const markers = rawMarkers.map((marker) => {
      let lootAreasArray: string[] | null = null;

      if (marker.lootAreas) {
        if (typeof marker.lootAreas === 'string') {
          // If it's a string, split by comma
          lootAreasArray = marker.lootAreas
            .split(',')
            .map((area: string) => area.trim())
            .filter(Boolean);
        } else if (Array.isArray(marker.lootAreas)) {
          // If it's already an array, filter to ensure all are strings
          lootAreasArray = marker.lootAreas.filter(
            (item): item is string => typeof item === 'string'
          );
        }
      }

      return {
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        category: marker.category,
        subcategory: marker.subcategory,
        instanceName: marker.instanceName,
        behindLockedDoor: marker.behindLockedDoor,
        lootAreas: lootAreasArray,
      };
    });

    return NextResponse.json({
      success: true,
      markers,
      total: markers.length,
    });
  } catch (error) {
    console.error('Error fetching spaceport map markers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch markers' },
      { status: 500 }
    );
  }
}
