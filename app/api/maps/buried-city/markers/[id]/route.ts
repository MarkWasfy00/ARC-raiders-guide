import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 403 }
      );
    }

    const { id: markerId } = await params;

    // Verify marker exists and belongs to buried-city map
    const marker = await prisma.mapMarker.findUnique({
      where: { id: markerId },
      select: { mapID: true },
    });

    if (!marker) {
      return NextResponse.json(
        { success: false, error: 'العلامة غير موجودة' },
        { status: 404 }
      );
    }

    if (marker.mapID !== 'buried-city') {
      return NextResponse.json(
        { success: false, error: 'العلامة لا تنتمي لهذه الخريطة' },
        { status: 400 }
      );
    }

    // Delete the marker
    await prisma.mapMarker.delete({
      where: { id: markerId },
    });

    console.log(`✅ Marker ${markerId} deleted by admin ${session.user.username || session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'تم حذف العلامة بنجاح',
    });
  } catch (error) {
    console.error('Error deleting marker:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف العلامة' },
      { status: 500 }
    );
  }
}
