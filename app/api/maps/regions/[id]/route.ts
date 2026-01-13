import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// DELETE - Delete a region
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Region ID is required' },
        { status: 400 }
      );
    }

    // Check if region exists
    const region = await prisma.mapRegion.findUnique({
      where: { id },
    });

    if (!region) {
      return NextResponse.json(
        { success: false, error: 'Region not found' },
        { status: 404 }
      );
    }

    // Delete the region
    await prisma.mapRegion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Region deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting map region:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete region' },
      { status: 500 }
    );
  }
}
