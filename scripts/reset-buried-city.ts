import { seedBuriedCityMap } from '../lib/buriedCityMapSeed';

async function reset() {
  console.log('🗑️  Resetting Buried City markers...\n');

  try {
    await seedBuriedCityMap();
    console.log('\n✅ Buried City markers reset successfully!');
    console.log('   Restart your dev server to see the changes.');
  } catch (error) {
    console.error('❌ Error resetting markers:', error);
    process.exit(1);
  }
}

reset();
