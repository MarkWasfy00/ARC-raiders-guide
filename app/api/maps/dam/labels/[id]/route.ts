import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'يجب أن تكون مسؤولاً لحذف العناوين' },
        { status: 403 }
      );
    }

    // Await params in Next.js 15+
    const { id } = await params;

    // Check if label exists and belongs to this map
    const label = await prisma.mapAreaLabel.findUnique({
      where: { id },
    });

    if (!label) {
      return NextResponse.json(
        { success: false, error: 'العنوان غير موجود' },
        { status: 404 }
      );
    }

    if (label.mapID !== 'dam') {
      return NextResponse.json(
        { success: false, error: 'العنوان لا ينتمي لهذه الخريطة' },
        { status: 400 }
      );
    }

    // Delete the label
    await prisma.mapAreaLabel.delete({
      where: { id },
    });

    console.log(`✅ Area label deleted by ${session.user.username || session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'تم حذف العنوان بنجاح',
    });
  } catch (error) {
    console.error('Error deleting area label:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف العنوان' },
      { status: 500 }
    );
  }
}
