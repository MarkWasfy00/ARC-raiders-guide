import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logMapMarkerAdded } from '@/lib/services/activity-logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);

    console.log('🗺️  Fetching Dam markers from database...');

    const rawMarkers = await prisma.mapMarker.findMany({
      where: {
        mapID: 'dam',
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
        addedBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        created_at: true,
      },
    });

    console.log(`📊 Found ${rawMarkers.length} markers from database`);

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
        addedBy: marker.addedBy,
        created_at: marker.created_at,
      };
    });

    console.log(`✅ Returning ${markers.length} markers to client\n`);

    return NextResponse.json({
      success: true,
      markers,
      total: markers.length,
    });
  } catch (error) {
    console.error('Error fetching map markers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch markers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لإضافة علامات' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { lat, lng, category, subcategory, instanceName, behindLockedDoor } = body;

    if (!lat || !lng || !category) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    const marker = await prisma.mapMarker.create({
      data: {
        lat,
        lng,
        mapID: 'dam',
        category,
        subcategory: subcategory || null,
        instanceName: instanceName || null,
        behindLockedDoor: behindLockedDoor || false,
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

    console.log(`✅ Marker created by ${session.user.username || session.user.email} at (${lat}, ${lng})`);

    // Log marker addition
    await logMapMarkerAdded(
      session.user.id,
      marker.id,
      'dam'
    );

    return NextResponse.json({
      success: true,
      marker,
    });
  } catch (error) {
    console.error('Error creating marker:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إضافة العلامة' },
      { status: 500 }
    );
  }
}
