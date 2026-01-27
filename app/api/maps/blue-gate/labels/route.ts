import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor'); // 'surface', 'underground', or null for all

    console.log(`🗺️  Fetching Blue Gate area labels from database (floor: ${floor || 'all'})...`);

    // Build where clause with floor filtering
    // zlayers: 1 = underground, 2 = surface, 2147483647 = all floors
    const whereClause: { mapID: string; zlayers?: { in: number[] } } = {
      mapID: 'blue-gate',
    };

    if (floor === 'surface') {
      whereClause.zlayers = { in: [2, 2147483647] }; // Show surface + all-floor labels
    } else if (floor === 'underground') {
      whereClause.zlayers = { in: [1, 2147483647] }; // Show underground + all-floor labels
    }

    const labels = await prisma.mapAreaLabel.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        nameAr: true,
        lat: true,
        lng: true,
        zlayers: true,
        fontSize: true,
        color: true,
        addedBy: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`✅ Returning ${labels.length} area labels to client (floor: ${floor || 'all'})\n`);

    return NextResponse.json({
      success: true,
      labels,
      total: labels.length,
    });
  } catch (error) {
    console.error('Error fetching area labels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch area labels' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لإضافة عناوين' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { lat, lng, name, nameAr, fontSize, color, zlayers } = body;

    if (!lat || !lng || !name || !nameAr) {
      return NextResponse.json(
        { success: false, error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    const label = await prisma.mapAreaLabel.create({
      data: {
        lat,
        lng,
        mapID: 'blue-gate',
        name,
        nameAr,
        zlayers: zlayers || 2147483647, // Default to all floors if not specified
        fontSize: fontSize || 14,
        color: color || '#ffffff',
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

    console.log(`✅ Area label created by ${session.user.username || session.user.email} at (${lat}, ${lng})`);

    return NextResponse.json({
      success: true,
      label,
    });
  } catch (error) {
    console.error('Error creating area label:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إضافة العنوان' },
      { status: 500 }
    );
  }
}
