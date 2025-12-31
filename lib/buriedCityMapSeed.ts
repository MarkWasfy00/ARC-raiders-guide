import { prisma } from './prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import buriedCityData from './data/buried-city.json';

interface BuriedCityMarker {
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

export async function seedBuriedCityMap() {
  console.log('🗺️  Starting Buried City map markers seed...');

  try {
    // First, delete existing Buried City markers
    const deleteResult = await prisma.mapMarker.deleteMany({
      where: {
        mapID: 'buried-city',
      },
    });
    console.log(`🗑️  Deleted ${deleteResult.count} existing Buried City markers`);

    // Prepare markers for insertion
    const markers = (buriedCityData.allData as BuriedCityMarker[]).map((marker) => ({
      id: marker.id,
      lat: marker.lat,
      lng: marker.lng,
      zlayers: marker.zlayers,
      mapID: marker.mapID,
      category: marker.category,
      subcategory: marker.subcategory,
      instanceName: marker.instanceName,
      behindLockedDoor: marker.behindLockedDoor,
      // Skip eventConditionMask as requested - will use default value (1)
      lootAreas: marker.lootAreas
        ? marker.lootAreas.split(', ').map((area) => area.trim())
        : Prisma.JsonNull,
    }));

    // Insert markers in batches to avoid overwhelming the database
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < markers.length; i += batchSize) {
      const batch = markers.slice(i, i + batchSize);
      await prisma.mapMarker.createMany({
        data: batch,
        skipDuplicates: true,
      });
      insertedCount += batch.length;
      console.log(`📍 Inserted ${insertedCount}/${markers.length} markers...`);
    }

    console.log(`✅ Successfully seeded ${insertedCount} Buried City map markers!`);
    console.log(`📊 Breakdown:`);

    // Get counts by category
    const categories = await prisma.mapMarker.groupBy({
      by: ['category'],
      where: {
        mapID: 'buried-city',
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
      total: insertedCount,
      categories: categories.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
    };
  } catch (error) {
    console.error('❌ Error seeding Buried City map markers:', error);
    throw error;
  }
}
