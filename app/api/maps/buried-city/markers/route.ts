import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);

    console.log('🗺️  Fetching Buried City markers from database...');

    const rawMarkers = await prisma.mapMarker.findMany({
      where: {
        mapID: 'buried-city',
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

    if (rawMarkers.length > 0) {
      const lats = rawMarkers.map(m => m.lat);
      const lngs = rawMarkers.map(m => m.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      console.log('📍 Coordinate ranges:');
      console.log(`   Lat: ${minLat.toFixed(0)} to ${maxLat.toFixed(0)}`);
      console.log(`   Lng: ${minLng.toFixed(0)} to ${maxLng.toFixed(0)}`);

      console.log('📌 Sample markers:');
      rawMarkers.slice(0, 3).forEach(m => {
        console.log(`   - ${m.instanceName || m.subcategory}: (${m.lat.toFixed(0)}, ${m.lng.toFixed(0)})`);
      });

      // Verify these are Buried City coordinates
      if (minLat < 3000) {
        console.error('⚠️  WARNING: These look like DAM coordinates, not Buried City!');
        console.error('⚠️  Expected lat range: 5600-6500, got:', minLat.toFixed(0), 'to', maxLat.toFixed(0));
      } else {
        console.log('✅ Coordinates confirmed as Buried City (lat > 5000)');
      }
    } else {
      console.error('❌ NO MARKERS FOUND! Database may not be seeded.');
    }

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
        mapID: 'buried-city',
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
