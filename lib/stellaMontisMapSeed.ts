import { prisma } from './prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import stellaMontisData from './data/stellaMontis.json';

interface StellaMontisMarker {
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

export async function seedStellaMontisMap() {
  console.log('🗺️  Starting Stella Montis map markers seed...');

  try {
    // First, delete existing Stella Montis markers
    const deleteResult = await prisma.mapMarker.deleteMany({
      where: {
        mapID: 'stella-montis',
      },
    });
    console.log(`🗑️  Deleted ${deleteResult.count} existing Stella Montis markers`);

    // Prepare markers for insertion
    const markers = (stellaMontisData.allData as StellaMontisMarker[]).map((marker) => ({
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

    console.log(`✅ Successfully seeded ${insertedCount} Stella Montis map markers!`);
    console.log(`📊 Breakdown:`);

    // Get counts by category
    const categories = await prisma.mapMarker.groupBy({
      by: ['category'],
      where: {
        mapID: 'stella-montis',
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
    console.error('❌ Error seeding Stella Montis map markers:', error);
    throw error;
  }
}
