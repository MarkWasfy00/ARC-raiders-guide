import { PrismaClient, ItemType, Rarity, Workbench, LootArea, AmmoType } from '@/lib/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Load items data
const itemsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'items.json'), 'utf-8')
)

/* ----------------------------------------
   ENUM NORMALIZERS
---------------------------------------- */

const ITEM_TYPE_MAP: Record<string, ItemType> = {
  'Advanced Material': 'ADVANCED_MATERIAL',
  'Ammunition': 'AMMUNITION',
  'Augment': 'AUGMENT',
  'Basic Material': 'BASIC_MATERIAL',
  'Blueprint': 'BLUEPRINT',
  'Consumable': 'CONSUMABLE',
  'Cosmetic': 'COSMETIC',
  'Gadget': 'GADGET',
  'Key': 'KEY',
  'Material': 'MATERIAL',
  'Medical': 'MEDICAL',
  'Misc': 'MISC',
  'Modification': 'MODIFICATION',
  'Mods': 'MODS',
  'Nature': 'NATURE',
  'Quest Item': 'QUEST_ITEM',
  'Quick Use': 'QUICK_USE',
  'Recyclable': 'RECYCLABLE',
  'Refined Material': 'REFINED_MATERIAL',
  'Refinement': 'REFINEMENT',
  'Shield': 'SHIELD',
  'Throwable': 'THROWABLE',
  'Topside Material': 'TOPSIDE_MATERIAL',
  'Trinket': 'TRINKET',
  'Weapon': 'WEAPON',
}

const RARITY_MAP: Record<string, Rarity> = {
  'Common': 'COMMON',
  'Uncommon': 'UNCOMMON',
  'Rare': 'RARE',
  'Epic': 'EPIC',
  'Legendary': 'LEGENDARY',
}

const WORKBENCH_MAP: Record<string, Workbench> = {
  'Scrappy': 'SCRAPPY',
  'Gunsmith': 'GUNSMITH',
  'Gear Bench': 'GEAR_BENCH',
  'Medical Lab': 'MEDICAL_LAB',
  'Explosives Station': 'EXPLOSIVES_STATION',
  'Utility Station': 'UTILITY_STATION',
  'Refiner': 'REFINER',
}

const LOOT_AREA_MAP: Record<string, LootArea> = {
  'ARC': 'ARC',
  'Commercial': 'COMMERCIAL',
  'Medical': 'MEDICAL',
  'Residential': 'RESIDENTIAL',
  'Electrical': 'ELECTRICAL',
  'Technological': 'TECHNOLOGICAL',
  'Exodus': 'EXODUS',
  'Industrial': 'INDUSTRIAL',
  'Mechanical': 'MECHANICAL',
  'Nature': 'NATURE',
  'Old World': 'OLD_WORLD',
  'Raider': 'RAIDER',
  'Security': 'SECURITY',
}

const AMMO_TYPE_MAP: Record<string, AmmoType> = {
  'Shotgun': 'SHOTGUN',
  'energy': 'ENERGY',
  'heavy': 'HEAVY',
  'launcher': 'LAUNCHER',
  'light': 'LIGHT',
  'medium': 'MEDIUM',
}

export async function seedItems() {
  console.log(`📦 Seeding ${itemsData.data.length} items...`)

  for (const item of itemsData.data) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        description: item.description ?? '',
        item_type: item.item_type ? ITEM_TYPE_MAP[item.item_type] : null,
        loadout_slots: [],
        icon: item.icon?.includes('cdn.metaforge.app') ? null : item.icon,
        rarity: item.rarity ? RARITY_MAP[item.rarity] : null,
        value: item.value ?? 0,
        workbench: item.workbench ? WORKBENCH_MAP[item.workbench] : null,
        stat_block: item.stat_block ?? {},
        flavor_text: item.flavor_text ?? '',
        subcategory: item.subcategory ?? null,
        shield_type: item.shield_type ?? null,
        loot_area: item.loot_area ? LOOT_AREA_MAP[item.loot_area] : null,
        sources: item.sources,
        ammo_type: item.ammo_type ? AMMO_TYPE_MAP[item.ammo_type] : null,
        locations: [],
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      },
    })
  }

  console.log('   ✅ Items seeded successfully')
}
  