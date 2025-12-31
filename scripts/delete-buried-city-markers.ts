import { prisma } from '../lib/prisma';

async function deleteBuriedCityMarkers() {
  try {
    console.log('🗑️  Deleting all Buried City markers...');

    const result = await prisma.mapMarker.deleteMany({
      where: {
        mapID: 'buried-city',
      },
    });

    console.log(`✅ Successfully deleted ${result.count} Buried City markers`);
  } catch (error) {
    console.error('❌ Error deleting markers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteBuriedCityMarkers();
