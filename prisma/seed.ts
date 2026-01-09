import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { seedItems } from '@/lib/seedItems'
import { seedArcs } from '@/lib/seedArcs'
import { seedQuests } from '@/lib/seedQuests'
import { seedWorkbenches } from '@/lib/workbenchesSeed'
import { seedLoadouts } from '@/lib/seedLoadouts'
import { seedDamMap } from '@/lib/damMapSeed'
import { seedStellaMontisMap } from '@/lib/stellaMontisMapSeed'
import { seedSpaceportMap } from '@/lib/spaceportMapSeed'
import { seedBuriedCityMap } from '@/lib/buriedCityMapSeed'
import { seedLabels } from '@/lib/seedLabels'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // Seed items first (ARCs and Quests depend on items for loot/rewards)
    await seedItems()

    // Seed ARCs
    await seedArcs()

    // Seed Quests (depends on items for rewards)
    await seedQuests()

    // Seed Workbenches (references items by name)
    await seedWorkbenches()

    // Seed Loadouts
    await seedLoadouts()

    // Seed Dam map markers
    await seedDamMap()

    // Seed Stella Montis map markers
    await seedStellaMontisMap()

    // Seed Spaceport map markers
    // await seedSpaceportMap()

    // Seed Buried City map markers
    // await seedBuriedCityMap()

    // Seed area labels for maps (Dam, Stella Montis)
    await seedLabels()

    // Add more seed functions here as needed
    // await seedWeapons()
    // await seedUsers()
    // etc.

    console.log('\n✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
