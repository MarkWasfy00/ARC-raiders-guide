import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/maps/routes/[id]
// Update route (coordinates or name)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { coordinates, name, nameAr } = body;

    // Verify ownership
    const route = await prisma.mapRoute.findUnique({
      where: { id },
    });

    if (!route || route.userId !== session.user.id) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Update
    const updated = await prisma.mapRoute.update({
      where: { id },
      data: {
        ...(coordinates && { coordinates }),
        ...(name !== undefined && { name: name || null }),
        ...(nameAr !== undefined && { nameAr: nameAr || null }),
      },
    });

    return NextResponse.json({ success: true, route: updated });
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

// DELETE /api/maps/routes/[id]
// Delete route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const route = await prisma.mapRoute.findUnique({
      where: { id },
    });

    if (!route || route.userId !== session.user.id) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Delete
    await prisma.mapRoute.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
