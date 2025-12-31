import { prisma } from '../lib/prisma';

async function checkMarkers() {
  console.log('🔍 Analyzing Buried City markers in database...\n');

  // Get all markers with mapID = 'buried-city'
  const markers = await prisma.mapMarker.findMany({
    where: { mapID: 'buried-city' },
    select: { id: true, lat: true, lng: true, instanceName: true, category: true },
  });

  console.log(`📊 Total markers with mapID='buried-city': ${markers.length}`);

  if (markers.length === 0) {
    console.log('❌ NO MARKERS FOUND! Database needs to be seeded.\n');
    await prisma.$disconnect();
    return;
  }

  // Analyze coordinate ranges
  const lats = markers.map(m => m.lat);
  const lngs = markers.map(m => m.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  console.log(`\n📍 Coordinate ranges:`);
  console.log(`   Lat: ${minLat.toFixed(0)} to ${maxLat.toFixed(0)}`);
  console.log(`   Lng: ${minLng.toFixed(0)} to ${maxLng.toFixed(0)}`);

  // Check if data is correct
  const correctRange = minLat >= 5000 && maxLat <= 7000;

  if (!correctRange) {
    console.log(`\n⚠️  WARNING: MIXED OR WRONG DATA DETECTED!`);
    console.log(`   Expected lat range: 5600-6500`);
    console.log(`   Found lat range: ${minLat.toFixed(0)}-${maxLat.toFixed(0)}`);

    // Find markers outside expected range
    const wrongMarkers = markers.filter(m => m.lat < 5000 || m.lat > 7000);
    console.log(`\n❌ ${wrongMarkers.length} markers are OUTSIDE expected range:`);
    wrongMarkers.slice(0, 10).forEach(m => {
      console.log(`   - ${m.instanceName || m.category}: (${m.lat.toFixed(0)}, ${m.lng.toFixed(0)})`);
    });

    if (wrongMarkers.length > 10) {
      console.log(`   ... and ${wrongMarkers.length - 10} more`);
    }

    console.log(`\n💡 SOLUTION: Delete all markers and re-seed:`);
    console.log(`   npm run db:reset-buried-city`);
  } else {
    console.log(`\n✅ All markers are in correct range!`);
  }

  // Show sample markers
  console.log(`\n📌 Sample markers:`);
  markers.slice(0, 5).forEach(m => {
    console.log(`   - ${m.instanceName || m.category}: (${m.lat.toFixed(0)}, ${m.lng.toFixed(0)})`);
  });

  await prisma.$disconnect();
}

checkMarkers().catch(console.error);
