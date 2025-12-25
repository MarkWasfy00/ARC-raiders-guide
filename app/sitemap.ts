import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to avoid database queries during build
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/items`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arcs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/traders`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/maps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trackers/blueprint`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/trackers/workshop-planner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Fetch dynamic items
  const items = await prisma.item.findMany({
    select: { id: true, updated_at: true },
  })

  const itemRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${baseUrl}/items/${item.id}`,
    lastModified: item.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch dynamic ARCs
  const arcs = await prisma.arc.findMany({
    select: { id: true, updated_at: true },
  })

  const arcRoutes: MetadataRoute.Sitemap = arcs.map((arc) => ({
    url: `${baseUrl}/arcs/${arc.id}`,
    lastModified: arc.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Fetch dynamic quests
  const quests = await prisma.quest.findMany({
    select: { id: true, updated_at: true },
  })

  const questRoutes: MetadataRoute.Sitemap = quests.map((quest) => ({
    url: `${baseUrl}/quests/${quest.id}`,
    lastModified: quest.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...itemRoutes, ...arcRoutes, ...questRoutes]
}
