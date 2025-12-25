import { PrismaClient } from '@/lib/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Load ARCs data
const arcsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'arcs.json'), 'utf-8')
)

export async function seedArcs() {
  console.log(`🤖 Seeding ${arcsData.data.length} ARCs...`)

  for (const arc of arcsData.data) {
    // Upsert the Arc
    await prisma.arc.upsert({
      where: { id: arc.id },
      update: {
        name: arc.name,
        description: arc.description,
        icon: arc.icon?.includes('cdn.metaforge.app') ? null : arc.icon ?? null,
        image: arc.image?.includes('cdn.metaforge.app') ? null : arc.image ?? null,
        updated_at: new Date(arc.updated_at),
      },
      create: {
        id: arc.id,
        name: arc.name,
        description: arc.description,
        icon: arc.icon?.includes('cdn.metaforge.app') ? null : arc.icon ?? null,
        image: arc.image?.includes('cdn.metaforge.app') ? null : arc.image ?? null,
        created_at: new Date(arc.created_at),
        updated_at: new Date(arc.updated_at),
      },
    })

    // Delete existing loot for this ARC to avoid duplicates
    await prisma.arcLoot.deleteMany({
      where: { arcId: arc.id },
    })

    // Seed loot items for this ARC
    if (arc.loot && arc.loot.length > 0) {
      for (const loot of arc.loot) {
        // Check if the item exists in the database
        const itemExists = await prisma.item.findUnique({
          where: { id: loot.item_id },
        })

        if (itemExists) {
          await prisma.arcLoot.create({
            data: {
              arcId: arc.id,
              itemId: loot.item_id,
              created_at: new Date(loot.created_at),
            },
          })
        } else {
          console.warn(
            `   ⚠️  Warning: Item "${loot.item_id}" not found for ARC "${arc.name}". Skipping loot entry.`
          )
        }
      }

      console.log(`   ✓ ${arc.name} - ${arc.loot.length} loot items`)
    } else {
      console.log(`   ✓ ${arc.name} - no loot items`)
    }
  }

  console.log('   ✅ ARCs seeded successfully')
}
