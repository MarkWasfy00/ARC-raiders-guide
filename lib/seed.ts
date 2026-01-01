import { seedItems } from './seedItems'
import { seedDamMap } from './damMapSeed'
import { seedSpaceportMap } from './spaceportMapSeed'
import { seedStellaMontisMap } from './stellaMontisMapSeed'
import { seedBuriedCityMap } from './buriedCityMapSeed'

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Seed items
  await seedItems()
  console.log('')

  // Seed map markers
  await seedDamMap()
  console.log('')

  await seedSpaceportMap()
  console.log('')

  await seedStellaMontisMap()
  console.log('')

  await seedBuriedCityMap()
  console.log('')

  console.log('🎉 All seeds completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
