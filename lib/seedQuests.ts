import { PrismaClient } from '@/lib/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Load quests data
const questsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'quests.json'), 'utf-8')
)

export async function seedQuests() {
  console.log(`🎯 Seeding ${questsData.data.length} quests...`)

  for (const quest of questsData.data) {
    // Upsert the quest
    await prisma.quest.upsert({
      where: { id: quest.id },
      update: {},
      create: {
        id: quest.id,
        name: quest.name,
        objectives: quest.objectives || [],
        xp: quest.xp ?? 0,
        granted_items: quest.granted_items || [],
        locations: quest.locations || [],
        marker_category: quest.marker_category ?? null,
        image: quest.image?.includes('cdn.metaforge.app') ? null : quest.image ?? null,
        guide_links: quest.guide_links || [],
        required_items: quest.required_items || [],
        created_at: new Date(quest.created_at),
        updated_at: new Date(quest.updated_at),
      },
    })

    // Delete existing rewards for this quest (to handle updates)
    await prisma.questReward.deleteMany({
      where: { questId: quest.id },
    })

    // Create quest rewards
    if (quest.rewards && quest.rewards.length > 0) {
      for (const reward of quest.rewards) {
        await prisma.questReward.create({
          data: {
            questId: quest.id,
            itemId: reward.item_id,
            quantity: parseInt(reward.quantity) || 1,
          },
        })
      }
    }
  }

  console.log('   ✅ Quests seeded successfully')
}
