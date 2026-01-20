import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file first before importing prisma
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface MapMarkerExport {
  id: string;
  lat: number;
  lng: number;
  zlayers: number;
  mapID: string;
  category: string;
  subcategory: string | null;
  instanceName: string | null;
  added_by: string | null;
  behindLockedDoor: boolean;
  last_edited_by: string | null;
  updated_at: string;
  eventConditionMask: number;
  lootAreas: string | null;
}

// Maps to export with their mapID patterns
const MAPS_TO_EXPORT = [
  { name: 'spaceport', mapID: 'spaceport', fileName: 'spaceport.json' },
  { name: 'buried-city', mapID: 'buried-city', fileName: 'buried-city.json' },
  { name: 'blue-gate-surface', mapID: 'blue-gate-surface', fileName: 'blue-gate-surface.json' },
  { name: 'blue-gate-underground', mapID: 'blue-gate-underground', fileName: 'blue-gate-underground.json' },
];

async function exportMapData() {
  // Dynamic import after dotenv is loaded
  const { prisma } = await import('../lib/prisma');

  console.log('📤 Starting map data export...\n');

  const dataDir = path.join(process.cwd(), 'lib', 'data');

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const mapConfig of MAPS_TO_EXPORT) {
    console.log(`🗺️  Exporting ${mapConfig.name}...`);

    try {
      const markers = await prisma.mapMarker.findMany({
        where: {
          mapID: mapConfig.mapID,
        },
        select: {
          id: true,
          lat: true,
          lng: true,
          zlayers: true,
          mapID: true,
          category: true,
          subcategory: true,
          instanceName: true,
          behindLockedDoor: true,
          eventConditionMask: true,
          lootAreas: true,
          addedByUserId: true,
          updated_at: true,
        },
      });

      if (markers.length === 0) {
        console.log(`   ⚠️  No markers found for ${mapConfig.name}, skipping...`);
        continue;
      }

      // Transform markers to export format
      const exportData: MapMarkerExport[] = markers.map((marker) => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        zlayers: marker.zlayers,
        mapID: marker.mapID,
        category: marker.category,
        subcategory: marker.subcategory,
        instanceName: marker.instanceName,
        added_by: marker.addedByUserId,
        behindLockedDoor: marker.behindLockedDoor,
        last_edited_by: null,
        updated_at: marker.updated_at.toISOString(),
        eventConditionMask: marker.eventConditionMask,
        lootAreas: Array.isArray(marker.lootAreas)
          ? (marker.lootAreas as string[]).join(', ')
          : null,
      }));

      const jsonData = {
        allData: exportData,
      };

      const filePath = path.join(dataDir, mapConfig.fileName);
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      console.log(`   ✅ Exported ${markers.length} markers to ${mapConfig.fileName}`);

      // Show category breakdown
      const categoryCount: Record<string, number> = {};
      markers.forEach((m) => {
        categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
      });
      Object.entries(categoryCount).forEach(([cat, count]) => {
        console.log(`      - ${cat}: ${count} markers`);
      });
    } catch (error) {
      console.error(`   ❌ Error exporting ${mapConfig.name}:`, error);
    }
  }

  console.log('\n✅ Map data export completed!');
  await prisma.$disconnect();
}

exportMapData()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  });
