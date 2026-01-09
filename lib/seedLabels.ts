import { prisma } from './prisma';

// Dam area labels
const DAM_LABELS = [
  // Major Regions (larger font, white)
  { name: 'RED LAKES', nameAr: 'البحيرات الحمراء', lat: 2896.0, lng: 5478.0, fontSize: 18, color: '#ffffff' },
  { name: 'THE DAM', nameAr: 'السد', lat: 2624.0, lng: 4446.0, fontSize: 18, color: '#ffffff' },
  { name: 'SWAMP', nameAr: 'المستنقع', lat: 1956.0, lng: 3190.0, fontSize: 18, color: '#ffffff' },
  { name: 'VICTORY RIDGE', nameAr: 'تل النصر', lat: 1244.0, lng: 3701.0, fontSize: 18, color: '#ffffff' },

  // Loot Zones (smaller font, gold)
  { name: 'Power Generation Complex', nameAr: 'مجمع توليد الطاقة', lat: 1586.0, lng: 4641.0, fontSize: 13, color: '#ffd700' },
  { name: 'Hydrophonic Dome Complex', nameAr: 'مجمع القبة المائية', lat: 1844.0, lng: 3861.0, fontSize: 13, color: '#ffd700' },
  { name: 'Old Battleground', nameAr: 'ساحة المعركة القديمة', lat: 2218.0, lng: 2825.0, fontSize: 13, color: '#ffd700' },
  { name: 'Water Treatment Control', nameAr: 'مراقبة معالجة المياه', lat: 2698.0, lng: 3359.0, fontSize: 13, color: '#ffd700' },
  { name: 'Electrical Substation', nameAr: 'المحطة الفرعية الكهربائية', lat: 3332.0, lng: 3295.0, fontSize: 13, color: '#ffd700' },
  { name: 'Loading Bay', nameAr: 'خليج التحميل', lat: 2876.0, lng: 4001.0, fontSize: 13, color: '#ffd700' },
  { name: 'Research & Administration', nameAr: 'البحث والإدارة', lat: 3066.0, lng: 4189.0, fontSize: 13, color: '#ffd700' },
  { name: 'Control Tower', nameAr: 'برج المراقبة', lat: 2862.0, lng: 4307.0, fontSize: 13, color: '#ffd700' },
  { name: 'Testing Annex', nameAr: 'ملحق الاختبار', lat: 3478.0, lng: 4751.0, fontSize: 13, color: '#ffd700' },
];

// Stella Montis area labels (both floors combined)
const STELLA_MONTIS_LABELS = [
  // Top Floor - Landmarks
  { name: 'Assembly Line', nameAr: 'خط التجميع', lat: 1728.0, lng: 2548.0, fontSize: 14, color: '#ffffff' },
  { name: 'Central Corridor', nameAr: 'الممر المركزي', lat: 2118.0, lng: 3268.0, fontSize: 14, color: '#ffffff' },
  { name: 'Viewing Deck', nameAr: 'سطح المراقبة', lat: 3120.0, lng: 2050.0, fontSize: 14, color: '#ffffff' },
  { name: 'Cargo Dock A', nameAr: 'رصيف الشحن أ', lat: 2734.0, lng: 3184.0, fontSize: 14, color: '#ffffff' },
  { name: 'Cargo Dock B', nameAr: 'رصيف الشحن ب', lat: 2956.0, lng: 3548.0, fontSize: 14, color: '#ffffff' },
  { name: 'Cafeteria', nameAr: 'الكافيتيريا', lat: 3030.0, lng: 4204.0, fontSize: 14, color: '#ffffff' },
  { name: 'Auditorium', nameAr: 'القاعة الكبرى', lat: 2508.0, lng: 5130.0, fontSize: 14, color: '#ffffff' },
  { name: 'Business Lounge', nameAr: 'صالة الأعمال', lat: 2592.0, lng: 5410.0, fontSize: 14, color: '#ffffff' },
  { name: 'Security Bridge', nameAr: 'جسر الأمن', lat: 1832.0, lng: 4610.0, fontSize: 14, color: '#ffffff' },
  { name: 'Storage Room', nameAr: 'غرفة التخزين', lat: 2372.0, lng: 6140.0, fontSize: 14, color: '#ffffff' },

  // Top Floor - Loot Zones
  { name: 'Assembly Workshops', nameAr: 'ورش التجميع', lat: 1448.0, lng: 2970.0, fontSize: 14, color: '#ffd700' },
  { name: 'Assembly', nameAr: 'التجميع', lat: 1938.0, lng: 2928.0, fontSize: 14, color: '#ffd700' },
  { name: 'Medical Research', nameAr: 'البحث الطبي', lat: 2922.0, lng: 2470.0, fontSize: 14, color: '#ffd700' },
  { name: 'Atrium', nameAr: 'الردهة المركزية', lat: 3158.0, lng: 4488.0, fontSize: 14, color: '#ffd700' },
  { name: 'Communications', nameAr: 'الاتصالات', lat: 2786.0, lng: 4686.0, fontSize: 14, color: '#ffd700' },
  { name: 'Cultural Archives', nameAr: 'الأرشيف الثقافي', lat: 2928.0, lng: 5446.0, fontSize: 14, color: '#ffd700' },
  { name: 'Business Center', nameAr: 'مركز الأعمال', lat: 2328.0, lng: 5112.0, fontSize: 14, color: '#ffd700' },
  { name: 'Lobby', nameAr: 'اللوبي', lat: 2076.0, lng: 4564.0, fontSize: 14, color: '#ffd700' },

  // Bottom Floor - Landmarks
  { name: 'Collapsed Tunnel', nameAr: 'النفق المنهار', lat: 1716.0, lng: 3460.0, fontSize: 14, color: '#ffffff' },
  { name: 'Logistics Admin', nameAr: 'الإدارة اللوجستية', lat: 2604.0, lng: 2936.0, fontSize: 14, color: '#ffffff' },
  { name: 'Robotic Sandbox A', nameAr: 'صندوق الروبوتات أ', lat: 2448.0, lng: 4004.0, fontSize: 14, color: '#ffffff' },
  { name: 'Control Room', nameAr: 'غرفة التحكم', lat: 3028.0, lng: 4092.0, fontSize: 14, color: '#ffffff' },
  { name: 'Robotic Sandbox B', nameAr: 'صندوق الروبوتات ب', lat: 3436.0, lng: 4044.0, fontSize: 14, color: '#ffffff' },

  // Bottom Floor - Loot Zones
  { name: 'Western Tunnel', nameAr: 'النفق الغربي', lat: 1852.0, lng: 3568.0, fontSize: 14, color: '#ffd700' },
  { name: 'Loading Bay', nameAr: 'خليج التحميل', lat: 2644.0, lng: 3312.0, fontSize: 14, color: '#ffd700' },
  { name: 'Sandbox', nameAr: 'صندوق الاختبار', lat: 2776.0, lng: 4080.0, fontSize: 14, color: '#ffd700' },
  { name: 'Lobby Metro', nameAr: 'بهو المترو', lat: 1756.0, lng: 4540.0, fontSize: 14, color: '#ffd700' },
  { name: 'Eastern Tunnel', nameAr: 'النفق الشرقي', lat: 2892.0, lng: 5436.0, fontSize: 14, color: '#ffd700' },
  { name: 'Seed Vault', nameAr: 'خزنة البذور', lat: 3960.0, lng: 5132.0, fontSize: 14, color: '#ffd700' },
];

export async function seedLabels() {
  console.log('🌱 Starting area labels seeding...');

  // Clear existing labels
  console.log('🗑️  Clearing existing area labels...');
  await prisma.mapAreaLabel.deleteMany({
    where: {
      mapID: {
        in: ['dam', 'stella-montis'],
      },
    },
  });

  // Seed Dam labels
  console.log('📍 Seeding Dam area labels...');
  let damCount = 0;
  for (const label of DAM_LABELS) {
    await prisma.mapAreaLabel.create({
      data: {
        mapID: 'dam',
        name: label.name,
        nameAr: label.nameAr,
        lat: label.lat,
        lng: label.lng,
        fontSize: label.fontSize,
        color: label.color,
      },
    });
    damCount++;
  }
  console.log(`✅ Created ${damCount} Dam area labels`);

  // Seed Stella Montis labels
  console.log('📍 Seeding Stella Montis area labels...');
  let stellaCount = 0;
  for (const label of STELLA_MONTIS_LABELS) {
    await prisma.mapAreaLabel.create({
      data: {
        mapID: 'stella-montis',
        name: label.name,
        nameAr: label.nameAr,
        lat: label.lat,
        lng: label.lng,
        fontSize: label.fontSize,
        color: label.color,
      },
    });
    stellaCount++;
  }
  console.log(`✅ Created ${stellaCount} Stella Montis area labels`);

  console.log(`   Total: ${damCount + stellaCount} area labels created`);
  console.log(`   - Dam: ${damCount} labels`);
  console.log(`   - Stella Montis: ${stellaCount} labels\n`);
}
