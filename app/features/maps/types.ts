export interface MapData {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  category: string;
  subcategory: string | null;
  instanceName: string | null;
  behindLockedDoor: boolean;
  lootAreas: string[] | null;
  addedBy?: {
    id: string;
    username: string | null;
    image: string | null;
  } | null;
  created_at?: Date | string;
}

export interface MarkerCategory {
  id: string;
  label: string;
  enabled: boolean;
  color: string;
  icon?: string;
}

export interface AreaLabel {
  id: string;
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
  fontSize?: number;
  color?: string;
}

export const MARKER_CATEGORIES: Record<string, { label: string; color: string; subcategories?: string[] }> = {
  arc: {
    label: 'الأعداء',
    color: '#ef4444',
    subcategories: ['tick', 'rocketeer', 'rollbot', 'bastion', 'bombardier', 'fireball', 'hornet ', 'matriarch', 'queen', 'sentinel', 'snitch', 'turret', 'wasp', 'bison', 'pop'],
  },
  containers: {
    label: 'الحاويات',
    color: '#3b82f6',
    subcategories: ['breachable_container', 'base_container', 'arc_courier', 'arc_probe', 'baron_husk', 'basket', 'ammo_crate', 'med_crate', 'utility_crate', 'weapon_case', 'raider_cache', 'car', 'security_breach', 'locker'],
  },
  events: {
    label: 'الأحداث',
    color: '#a855f7',
    subcategories: ['harvester'],
  },
  locations: {
    label: 'المواقع',
    color: '#22c55e',
    subcategories: ['supply_station', 'raider_camp', 'extraction', 'breach_room', 'locked_room', 'hatch', 'button', 'player_spawn', 'field_crate', 'field_depot'],
  },
  nature: {
    label: 'الموارد',
    color: '#84cc16',
    subcategories: ['agave', 'apricot', 'candleberries', 'great-mullein', 'moss', 'mushroom', 'olive', 'prickly-pear', 'roots', 'snow_pile', 'espresso', 'fertilizer'],
  },
  quests: {
    label: 'المهام',
    color: '#f59e0b',
    subcategories: [
      'a-balanced-harvest',
      'a-new-type-of-plant',
      'a-symbol-of-unification',
      'a-toxic-trail',
      'back-on-top',
      'broken-monument',
      'celestes-journals',
      'dormant-barons',
      'echoes-of-victory-ridge',
      'eyes-in-the-sky',
      'flickering-threat',
      'greasing-her-palms',
      'keeping-the-memory',
      'medical-merchandise',
      'our-presence-up-there',
      'paving-the-way',
      'source-of-the-contamination',
      'straight-record',
      'the-majors-footlocker',
      'untended-garden',
      'water-troubles',
      'what-we-left-behind',
    ],
  },
};

// Subcategory icon mapping to image paths
export const SUBCATEGORY_ICONS: Record<string, string> = {
  // ARCs
  tick: '/icons/arcs/tick_mf.png',
  rocketeer: '/icons/arcs/rocketeer_mf.png',
  rollbot: '/icons/arcs/rollbot1.webp',
  bastion: '/icons/arcs/bastion_mf.png',
  bombardier: '/icons/arcs/Bombardier.png',
  fireball: '/icons/arcs/Fireball_new256.png',
  'hornet ': '/icons/arcs/hornet_mf.png',
  matriarch: '/icons/arcs/matriarch256.png',
  queen: '/icons/arcs/queen_mf.png',
  sentinel: '/icons/arcs/sentinel_mp.png',
  snitch: '/icons/arcs/snitch_mf.png',
  turret: '/icons/arcs/turret_mf.png',
  wasp: '/icons/arcs/wasp_mf.png',
  bison: '/icons/arcs/bison_mf.png',

  // Containers
  breachable_container: '/icons/containers/breachable_container_mf.png',
  base_container: '/icons/containers/container_mf.png',
  arc_courier: '/icons/containers/arc_courier_mf.png',
  arc_probe: '/icons/containers/arc_probe_mf64.png',
  baron_husk: '/icons/containers/baron_husk_mf.png',
  basket: '/icons/containers/basket_mf.png',
  ammo_crate: '/icons/containers/ammo_crate_mf.png',
  med_crate: '/icons/containers/med_crate_mf.png',
  utility_crate: '/icons/containers/utility_crate_mf.png',
  weapon_case: '/icons/containers/weapon_crate_mf.png',
  raider_cache: '/icons/containers/raider_cache_mf.png',
  car: '/icons/containers/car_boot.png',
  security_breach: '/icons/containers/Security_Breach.png',
  locker: '/icons/containers/lootbox.png',

  // Locations
  supply_station: '/icons/locations/supply_beacon_mf.png',
  raider_camp: '/icons/locations/raider_camp_mf.png',
  extraction: '/icons/locations/extraction_mf.png',
  breach_room: '/icons/locations/breach_room.Dx2gbueW.png',
  locked_room: '/icons/locations/locked_room_mf.png',
  hatch: '/icons/locations/raider_hatch_mf.png',
  button: '/icons/locations/press-button.png',
  player_spawn: '/icons/locations/spawn_mf.png',
  field_crate: '/icons/locations/field_crate_mf.png',
  field_depot: '/icons/locations/field_depot_mf.png',

  // Nature
  agave: '/icons/nature/agave.png',
  apricot: '/icons/nature/apricot.png',
  candleberries: '/icons/nature/berry.png',
  'great-mullein': '/icons/nature/fern.png',
  moss: '/icons/nature/moss.png',
  mushroom: '/icons/nature/mushroom.png',
  olive: '/icons/nature/olive.png',
  pop: '/icons/arcs/pop256.png',
  'prickly-pear': '/icons/nature/pear.png',
  roots: '/icons/nature/roots.png',
  snow_pile: '/icons/events/snowflake.png',
  espresso: '/icons/nature/lemon.png',
  fertilizer: '/icons/nature/fertilizer.png',

  // Events
  harvester: '/icons/events/harvester_event_mf.png',

  // Quests (all use same icon)
  'a-balanced-harvest': '/icons/quests/quest_icon_mf.png',
  'a-new-type-of-plant': '/icons/quests/quest_icon_mf.png',
  'a-symbol-of-unification': '/icons/quests/quest_icon_mf.png',
  'a-toxic-trail': '/icons/quests/quest_icon_mf.png',
  'back-on-top': '/icons/quests/quest_icon_mf.png',
  'broken-monument': '/icons/quests/quest_icon_mf.png',
  'celestes-journals': '/icons/quests/quest_icon_mf.png',
  'dormant-barons': '/icons/quests/quest_icon_mf.png',
  'echoes-of-victory-ridge': '/icons/quests/quest_icon_mf.png',
  'eyes-in-the-sky': '/icons/quests/quest_icon_mf.png',
  'flickering-threat': '/icons/quests/quest_icon_mf.png',
  'greasing-her-palms': '/icons/quests/quest_icon_mf.png',
  'keeping-the-memory': '/icons/quests/quest_icon_mf.png',
  'medical-merchandise': '/icons/quests/quest_icon_mf.png',
  'our-presence-up-there': '/icons/quests/quest_icon_mf.png',
  'paving-the-way': '/icons/quests/quest_icon_mf.png',
  'source-of-the-contamination': '/icons/quests/quest_icon_mf.png',
  'straight-record': '/icons/quests/quest_icon_mf.png',
  'the-majors-footlocker': '/icons/quests/quest_icon_mf.png',
  'untended-garden': '/icons/quests/quest_icon_mf.png',
  'water-troubles': '/icons/quests/quest_icon_mf.png',
  'what-we-left-behind': '/icons/quests/quest_icon_mf.png',
};

// Dam area labels with coordinates
// Click on the map to get coordinates in the console, then add labels here
export const DAM_AREA_LABELS: AreaLabel[] = [
  // Major Regions (larger font)
  { id: 'red-lakes', name: 'RED LAKES', nameAr: 'البحيرات الحمراء', lat: 2896.0, lng: 5478.0, fontSize: 18, color: '#ffffff' },
  { id: 'the-dam', name: 'THE DAM', nameAr: 'السد', lat: 2624.0, lng: 4446.0, fontSize: 18, color: '#ffffff' },
  { id: 'swamp', name: 'SWAMP', nameAr: 'المستنقع', lat: 1956.0, lng: 3190.0, fontSize: 18, color: '#ffffff' },
  { id: 'victory-ridge', name: 'VICTORY RIDGE', nameAr: 'تل النصر', lat: 1244.0, lng: 3701.0, fontSize: 18, color: '#ffffff' },

  // Loot Zones (smaller font)
  { id: 'power-generation', name: 'Power Generation Complex', nameAr: 'مجمع توليد الطاقة', lat: 1586.0, lng: 4641.0, fontSize: 13, color: '#ffd700' },
  { id: 'hydrophonic-dome', name: 'Hydrophonic Dome Complex', nameAr: 'مجمع القبة المائية', lat: 1844.0, lng: 3861.0, fontSize: 13, color: '#ffd700' },
  { id: 'old-battleground', name: 'Old Battleground', nameAr: 'ساحة المعركة القديمة', lat: 2218.0, lng: 2825.0, fontSize: 13, color: '#ffd700' },
  { id: 'water-treatment', name: 'Water Treatment Control', nameAr: 'مراقبة معالجة المياه', lat: 2698.0, lng: 3359.0, fontSize: 13, color: '#ffd700' },
  { id: 'electrical-substation', name: 'Electrical Substation', nameAr: 'المحطة الفرعية الكهربائية', lat: 3332.0, lng: 3295.0, fontSize: 13, color: '#ffd700' },
  { id: 'loading-bay', name: 'Loading Bay', nameAr: 'خليج التحميل', lat: 2876.0, lng: 4001.0, fontSize: 13, color: '#ffd700' },
  { id: 'research-admin', name: 'Research & Administration', nameAr: 'البحث والإدارة', lat: 3066.0, lng: 4189.0, fontSize: 13, color: '#ffd700' },
  { id: 'control-tower', name: 'Control Tower', nameAr: 'برج المراقبة', lat: 2862.0, lng: 4307.0, fontSize: 13, color: '#ffd700' },
  { id: 'testing-annex', name: 'Testing Annex', nameAr: 'ملحق الاختبار', lat: 3478.0, lng: 4751.0, fontSize: 13, color: '#ffd700' },
];

// Stella Montis area labels with coordinates
// Click on the map to get coordinates in the console, then add labels here

// Top Floor Labels
export const STELLA_MONTIS_TOP_FLOOR_LABELS: AreaLabel[] = [
  // Landmarks
  { id: 'assembly-line', name: 'Assembly Line', nameAr: 'خط التجميع', lat: 1728.0, lng: 2548.0, fontSize: 14 },
  { id: 'central-corridor', name: 'Central Corridor', nameAr: 'الممر المركزي', lat: 2118.0, lng: 3268.0, fontSize: 14 },
  { id: 'viewing-deck', name: 'Viewing Deck', nameAr: 'سطح المراقبة', lat: 3120.0, lng: 2050.0, fontSize: 14 },
  { id: 'cargo-dock-a', name: 'Cargo Dock A', nameAr: 'رصيف الشحن أ', lat: 2734.0, lng: 3184.0, fontSize: 14 },
  { id: 'cargo-dock-b', name: 'Cargo Dock B', nameAr: 'رصيف الشحن ب', lat: 2956.0, lng: 3548.0, fontSize: 14 },
  { id: 'cafeteria', name: 'Cafeteria', nameAr: 'الكافيتيريا', lat: 3030.0, lng: 4204.0, fontSize: 14 },
  { id: 'auditorium', name: 'Auditorium', nameAr: 'القاعة الكبرى', lat: 2508.0, lng: 5130.0, fontSize: 14 },
  { id: 'business-lounge', name: 'Business Lounge', nameAr: 'صالة الأعمال', lat: 2592.0, lng: 5410.0, fontSize: 14 },
  { id: 'security-bridge', name: 'Security Bridge', nameAr: 'جسر الأمن', lat: 1832.0, lng: 4610.0, fontSize: 14 },
  { id: 'storage-room', name: 'Storage Room', nameAr: 'غرفة التخزين', lat: 2372.0, lng: 6140.0, fontSize: 14 },

  // Loot Zones
  { id: 'assembly-workshops', name: 'Assembly Workshops', nameAr: 'ورش التجميع', lat: 1448.0, lng: 2970.0, fontSize: 14, color: '#ffd700' },
  { id: 'assembly', name: 'Assembly', nameAr: 'التجميع', lat: 1938.0, lng: 2928.0, fontSize: 14, color: '#ffd700' },
  { id: 'medical-research', name: 'Medical Research', nameAr: 'البحث الطبي', lat: 2922.0, lng: 2470.0, fontSize: 14, color: '#ffd700' },
  { id: 'atrium', name: 'Atrium', nameAr: 'الردهة المركزية', lat: 3158.0, lng: 4488.0, fontSize: 14, color: '#ffd700' },
  { id: 'communications', name: 'Communications', nameAr: 'الاتصالات', lat: 2786.0, lng: 4686.0, fontSize: 14, color: '#ffd700' },
  { id: 'cultural-archives', name: 'Cultural Archives', nameAr: 'الأرشيف الثقافي', lat: 2928.0, lng: 5446.0, fontSize: 14, color: '#ffd700' },
  { id: 'business-center', name: 'Business Center', nameAr: 'مركز الأعمال', lat: 2328.0, lng: 5112.0, fontSize: 14, color: '#ffd700' },
  { id: 'lobby', name: 'Lobby', nameAr: 'اللوبي', lat: 2076.0, lng: 4564.0, fontSize: 14, color: '#ffd700' },
];

// Bottom Floor Labels
export const STELLA_MONTIS_BOTTOM_FLOOR_LABELS: AreaLabel[] = [
  // Landmarks
  { id: 'collapsed-tunnel', name: 'Collapsed Tunnel', nameAr: 'النفق المنهار', lat: 1716.0, lng: 3460.0, fontSize: 14 },
  { id: 'logistics-admin', name: 'Logistics Admin', nameAr: 'الإدارة اللوجستية', lat: 2604.0, lng: 2936.0, fontSize: 14 },
  { id: 'robotic-sandbox-a', name: 'Robotic Sandbox A', nameAr: 'صندوق الروبوتات أ', lat: 2448.0, lng: 4004.0, fontSize: 14 },
  { id: 'control-room', name: 'Control Room', nameAr: 'غرفة التحكم', lat: 3028.0, lng: 4092.0, fontSize: 14 },
  { id: 'robotic-sandbox-b', name: 'Robotic Sandbox B', nameAr: 'صندوق الروبوتات ب', lat: 3436.0, lng: 4044.0, fontSize: 14 },

  // Loot Zones
  { id: 'western-tunnel', name: 'Western Tunnel', nameAr: 'النفق الغربي', lat: 1852.0, lng: 3568.0, fontSize: 14, color: '#ffd700' },
  { id: 'loading-bay', name: 'Loading Bay', nameAr: 'خليج التحميل', lat: 2644.0, lng: 3312.0, fontSize: 14, color: '#ffd700' },
  { id: 'sandbox', name: 'Sandbox', nameAr: 'صندوق الاختبار', lat: 2776.0, lng: 4080.0, fontSize: 14, color: '#ffd700' },
  { id: 'lobby-metro', name: 'Lobby Metro', nameAr: 'بهو المترو', lat: 1756.0, lng: 4540.0, fontSize: 14, color: '#ffd700' },
  { id: 'eastern-tunnel', name: 'Eastern Tunnel', nameAr: 'النفق الشرقي', lat: 2892.0, lng: 5436.0, fontSize: 14, color: '#ffd700' },
  { id: 'seed-vault', name: 'Seed Vault', nameAr: 'خزنة البذور', lat: 3960.0, lng: 5132.0, fontSize: 14, color: '#ffd700' },
];
