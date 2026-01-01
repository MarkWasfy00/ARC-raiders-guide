import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check admin role
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 403 }
      );
    }

    // Get Socket.IO connected clients count
    const io = (global as any).io;
    const connectedUsers = io ? io.engine.clientsCount : 0;

    // Get database stats
    const [
      totalUsers,
      totalMarkers,
      totalListings,
      totalChats,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.mapMarker.count(),
      prisma.listing.count(),
      prisma.chat.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
    ]);

    // Get markers by map
    const markersByMap = await prisma.mapMarker.groupBy({
      by: ['mapID'],
      _count: {
        id: true,
      },
    });

    // Get listings by status
    const listingsByStatus = await prisma.listing.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        connectedUsers,
        totalUsers,
        totalMarkers,
        totalListings,
        totalChats,
        markersByMap: markersByMap.map((m) => ({
          map: m.mapID,
          count: m._count.id,
        })),
        listingsByStatus: listingsByStatus.map((l) => ({
          status: l.status,
          count: l._count.id,
        })),
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
