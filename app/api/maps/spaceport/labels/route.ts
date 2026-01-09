import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('🗺️  Fetching Spaceport area labels from database...');

    const labels = await prisma.mapAreaLabel.findMany({
      where: {
        mapID: 'spaceport',
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        lat: true,
        lng: true,
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

    console.log(`✅ Returning ${labels.length} area labels to client\n`);

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
    const { lat, lng, name, nameAr, fontSize, color } = body;

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
        mapID: 'spaceport',
        name,
        nameAr,
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
