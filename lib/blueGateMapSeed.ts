import { prisma } from './prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import blueGateSurfaceData from './data/blue-gate-surface.json';
import blueGateUndergroundData from './data/blue-gate-underground.json';

interface BlueGateMarker {
  id: string;
  lat: number;
  lng: number;
  zlayers: number;
  mapID: string;
  category: string;
  subcategory: string | null;
  instanceName: string | null;
  behindLockedDoor: boolean;
  eventConditionMask: number;
  lootAreas: string | null;
}

export async function seedBlueGateMap() {
  console.log('🗺️  Starting Blue Gate map markers seed...');

  try {
    // Delete existing Blue Gate markers (both floors)
    const deleteResult = await prisma.mapMarker.deleteMany({
      where: {
        mapID: {
          startsWith: 'blue-gate',
        },
      },
    });
    console.log(`🗑️  Deleted ${deleteResult.count} existing Blue Gate markers`);

    let totalInserted = 0;

    // Seed Surface floor
    if (blueGateSurfaceData.allData && blueGateSurfaceData.allData.length > 0) {
      const surfaceMarkers = (blueGateSurfaceData.allData as BlueGateMarker[]).map((marker) => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        zlayers: marker.zlayers,
        mapID: marker.mapID,
        category: marker.category,
        subcategory: marker.subcategory,
        instanceName: marker.instanceName,
        behindLockedDoor: marker.behindLockedDoor,
        lootAreas: marker.lootAreas
          ? marker.lootAreas.split(', ').map((area) => area.trim())
          : Prisma.JsonNull,
      }));

      const batchSize = 100;
      for (let i = 0; i < surfaceMarkers.length; i += batchSize) {
        const batch = surfaceMarkers.slice(i, i + batchSize);
        await prisma.mapMarker.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
      totalInserted += surfaceMarkers.length;
      console.log(`📍 Inserted ${surfaceMarkers.length} Surface markers`);
    }

    // Seed Underground floor
    if (blueGateUndergroundData.allData && blueGateUndergroundData.allData.length > 0) {
      const undergroundMarkers = (blueGateUndergroundData.allData as BlueGateMarker[]).map((marker) => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        zlayers: marker.zlayers,
        mapID: marker.mapID,
        category: marker.category,
        subcategory: marker.subcategory,
        instanceName: marker.instanceName,
        behindLockedDoor: marker.behindLockedDoor,
        lootAreas: marker.lootAreas
          ? marker.lootAreas.split(', ').map((area) => area.trim())
          : Prisma.JsonNull,
      }));

      const batchSize = 100;
      for (let i = 0; i < undergroundMarkers.length; i += batchSize) {
        const batch = undergroundMarkers.slice(i, i + batchSize);
        await prisma.mapMarker.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
      totalInserted += undergroundMarkers.length;
      console.log(`📍 Inserted ${undergroundMarkers.length} Underground markers`);
    }

    console.log(`✅ Successfully seeded ${totalInserted} Blue Gate map markers!`);
    console.log(`📊 Breakdown:`);

    // Get counts by category
    const categories = await prisma.mapMarker.groupBy({
      by: ['category'],
      where: {
        mapID: {
          startsWith: 'blue-gate',
        },
      },
      _count: {
        category: true,
      },
    });

    categories.forEach((cat) => {
      console.log(`   - ${cat.category}: ${cat._count.category} markers`);
    });

    return {
      success: true,
      total: totalInserted,
      categories: categories.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
    };
  } catch (error) {
    console.error('❌ Error seeding Blue Gate map markers:', error);
    throw error;
  }
}
