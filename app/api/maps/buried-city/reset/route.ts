import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    console.log('🗑️  Deleting all Buried City markers...');

    const result = await prisma.mapMarker.deleteMany({
      where: {
        mapID: 'buried-city',
      },
    });

    console.log(`✅ Successfully deleted ${result.count} Buried City markers`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} Buried City markers`,
    });
  } catch (error) {
    console.error('❌ Error deleting markers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete markers' },
      { status: 500 }
    );
  }
}
