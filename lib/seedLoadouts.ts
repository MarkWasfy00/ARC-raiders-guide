import { prisma } from './prisma';
import * as fs from 'fs';
import * as path from 'path';

interface LoadoutData {
  uuid: string;
  name: string;
  description?: string;
  tags: string[];
  is_public: boolean;
  user: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
  };
  loadout_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export async function seedLoadouts() {
  console.log('📦 Starting loadouts seed...');

  try {
    // Load loadouts data from JSON
    const loadoutsData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'loadouts.json'), 'utf-8')
    ) as LoadoutData[];

    console.log(`📊 Found ${loadoutsData.length} loadouts to seed`);

    // First, delete existing loadouts with null userId (imported data)
    const deleteResult = await prisma.loadout.deleteMany({
      where: {
        userId: null,
      },
    });
    console.log(`🗑️  Deleted ${deleteResult.count} existing imported loadouts`);

    // Prepare loadouts for insertion
    const loadouts = loadoutsData.map((loadout) => {
      try {
        return {
          uuid: loadout.uuid || null,
          name: loadout.name || 'Unnamed Loadout',
          description: loadout.description || null,
          tags: loadout.tags || [],
          is_public: loadout.is_public !== undefined ? loadout.is_public : true,
          userId: null, // Imported data doesn't link to users
          profileData: loadout.profile || null,
          loadoutData: loadout.loadout_data || {},
          created_at: loadout.created_at ? new Date(loadout.created_at) : new Date(),
          updated_at: loadout.updated_at ? new Date(loadout.updated_at) : new Date(),
        };
      } catch (error) {
        console.warn(`⚠️  Warning: Skipping invalid loadout "${loadout.name}":`, error);
        return null;
      }
    }).filter((loadout): loadout is NonNullable<typeof loadout> => loadout !== null);

    console.log(`✅ Prepared ${loadouts.length} valid loadouts for insertion`);

    // Insert loadouts in batches to avoid overwhelming the database
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < loadouts.length; i += batchSize) {
      const batch = loadouts.slice(i, i + batchSize);
      await prisma.loadout.createMany({
        data: batch,
        skipDuplicates: true,
      });
      insertedCount += batch.length;
      console.log(`📦 Inserted ${insertedCount}/${loadouts.length} loadouts...`);
    }

    console.log(`✅ Successfully seeded ${insertedCount} loadouts!`);
    console.log(`📊 Breakdown:`);

    // Get counts by public/private
    const publicCount = await prisma.loadout.count({
      where: { is_public: true },
    });
    const privateCount = await prisma.loadout.count({
      where: { is_public: false },
    });

    console.log(`   - Public loadouts: ${publicCount}`);
    console.log(`   - Private loadouts: ${privateCount}`);

    // Get tag statistics
    const allLoadouts = await prisma.loadout.findMany({
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    allLoadouts.forEach((loadout) => {
      loadout.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    console.log(`📋 Popular tags:`);
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([tag, count]) => {
        console.log(`   - ${tag}: ${count} loadouts`);
      });

    return {
      success: true,
      inserted: insertedCount,
      publicCount,
      privateCount,
    };
  } catch (error) {
    console.error('❌ Error seeding loadouts:', error);
    throw error;
  }
}
