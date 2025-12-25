import { PrismaClient, Workbench } from '@/lib/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Load workbenches data
const workbenchesData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'workbenches.json'), 'utf-8')
)

/* ----------------------------------------
   WORKBENCH ENUM MAPPING
---------------------------------------- */

const WORKBENCH_TYPE_MAP: Record<string, Workbench> = {
  'Workbench': 'WORKBENCH',
  'Gunsmith': 'GUNSMITH',
  'Gear Bench': 'GEAR_BENCH',
  'Medical Lab': 'MEDICAL_LAB',
  'Explosives Station': 'EXPLOSIVES_STATION',
  'Utility Station': 'UTILITY_STATION',
  'Refiner': 'REFINER',
  'Scrappy': 'SCRAPPY',
}

interface WorkbenchRequirement {
  quantity: number
  item: string
}

interface WorkbenchLevel {
  level: number | string
  requirements: WorkbenchRequirement[]
  crafts?: string[]
  rates?: string
}

interface WorkbenchData {
  name: string
  description?: string
  levels: WorkbenchLevel[]
  passiveItems?: string[]
}

/**
 * Find an item by name, handling tier variations
 * 1. Try exact match first
 * 2. If not found, try matching items that start with name + " " (e.g., "Ferro" -> "Ferro I")
 * 3. Return the lowest tier for crafts (I/Mk. 1)
 */
async function findItemByName(itemName: string): Promise<string> {
  // Try exact match first
  let item = await prisma.item.findFirst({
    where: { name: itemName },
  })

  if (item) return itemName

  // Try with tier suffix patterns (prefer tier I/Mk. 1)
  const tierPatterns = [
    `${itemName} I`,
    `${itemName} Mk. 1`,
    `${itemName} 1`,
  ]

  for (const pattern of tierPatterns) {
    item = await prisma.item.findFirst({
      where: { name: pattern },
    })
    if (item) return item.name
  }

  // Try finding any item that starts with the name
  item = await prisma.item.findFirst({
    where: {
      name: {
        startsWith: itemName,
      },
    },
    orderBy: {
      name: 'asc', // Get the first one alphabetically
    },
  })

  if (item) return item.name

  // Return original name if no match found
  return itemName
}

export async function seedWorkbenches() {
  console.log('🔧 Seeding workbenches...')

  // Seed regular workbenches
  for (const workbenchData of workbenchesData.workbenches as WorkbenchData[]) {
    const workbenchType = WORKBENCH_TYPE_MAP[workbenchData.name]

    if (!workbenchType) {
      console.warn(`⚠️  Unknown workbench type: ${workbenchData.name}`)
      continue
    }

    console.log(`   📦 Seeding ${workbenchData.name}...`)

    // Create or update workbench
    const workbench = await prisma.workbenchPlanner.upsert({
      where: { name: workbenchData.name },
      update: {
        description: workbenchData.description || null,
        type: workbenchType,
      },
      create: {
        name: workbenchData.name,
        description: workbenchData.description || null,
        type: workbenchType,
      },
    })

    // Seed levels for this workbench
    for (const levelData of workbenchData.levels) {
      const levelNumber = typeof levelData.level === 'number'
        ? levelData.level
        : parseInt(levelData.level.toString().split(' ')[0]) // Extract number from "1 - Fledgling"

      const levelName = typeof levelData.level === 'string'
        ? levelData.level
        : null

      const level = await prisma.workbenchPlannerLevel.upsert({
        where: {
          workbenchId_level: {
            workbenchId: workbench.id,
            level: levelNumber,
          },
        },
        update: {
          levelName: levelName,
          rates: levelData.rates || null,
        },
        create: {
          workbenchId: workbench.id,
          level: levelNumber,
          levelName: levelName,
          rates: levelData.rates || null,
        },
      })

      // Seed requirements for this level
      for (const req of levelData.requirements) {
        const matchedItemName = await findItemByName(req.item)

        await prisma.workbenchPlannerRequirement.upsert({
          where: {
            id: `${level.id}-${req.item}`, // Composite unique identifier
          },
          update: {
            itemName: matchedItemName,
            quantity: req.quantity,
          },
          create: {
            id: `${level.id}-${req.item}`,
            workbenchLevelId: level.id,
            itemName: matchedItemName,
            quantity: req.quantity,
          },
        })
      }

      // Seed crafts for this level
      if (levelData.crafts) {
        for (const craftItemName of levelData.crafts) {
          const matchedItemName = await findItemByName(craftItemName)

          await prisma.workbenchPlannerCraft.upsert({
            where: {
              id: `${level.id}-${craftItemName}`, // Composite unique identifier
            },
            update: {
              itemName: matchedItemName,
            },
            create: {
              id: `${level.id}-${craftItemName}`,
              workbenchLevelId: level.id,
              itemName: matchedItemName,
            },
          })
        }
      }
    }

    console.log(`      ✅ ${workbenchData.name} seeded with ${workbenchData.levels.length} levels`)
  }

  // Seed Scrappy (special workbench/pet)
  if (workbenchesData.scrappy) {
    console.log('   🐔 Seeding Scrappy...')

    const scrappyData = workbenchesData.scrappy as WorkbenchData
    const workbenchType = WORKBENCH_TYPE_MAP['Scrappy']

    const scrappy = await prisma.workbenchPlanner.upsert({
      where: { name: scrappyData.name },
      update: {
        description: scrappyData.description || null,
        type: workbenchType,
      },
      create: {
        name: scrappyData.name,
        description: scrappyData.description || null,
        type: workbenchType,
      },
    })

    // Seed Scrappy levels
    for (const levelData of scrappyData.levels) {
      const levelNumber = typeof levelData.level === 'string'
        ? parseInt(levelData.level.split(' ')[0])
        : levelData.level

      const level = await prisma.workbenchPlannerLevel.upsert({
        where: {
          workbenchId_level: {
            workbenchId: scrappy.id,
            level: levelNumber,
          },
        },
        update: {
          levelName: levelData.level.toString(),
          rates: levelData.rates || null,
        },
        create: {
          workbenchId: scrappy.id,
          level: levelNumber,
          levelName: levelData.level.toString(),
          rates: levelData.rates || null,
        },
      })

      // Seed requirements for this level
      for (const req of levelData.requirements) {
        const matchedItemName = await findItemByName(req.item)

        await prisma.workbenchPlannerRequirement.upsert({
          where: {
            id: `${level.id}-${req.item}`,
          },
          update: {
            itemName: matchedItemName,
            quantity: req.quantity,
          },
          create: {
            id: `${level.id}-${req.item}`,
            workbenchLevelId: level.id,
            itemName: matchedItemName,
            quantity: req.quantity,
          },
        })
      }
    }

    console.log(`      ✅ Scrappy seeded with ${scrappyData.levels.length} levels`)
  }

  console.log('✅ All workbenches seeded successfully')
}
