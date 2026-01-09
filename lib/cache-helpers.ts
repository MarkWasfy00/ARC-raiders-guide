import { cache, cacheKeys } from './redis'
import { prisma } from './prisma'
import type { Item, Listing, User } from './generated/prisma/client'

/**
 * Generic cache wrapper for database queries
 *
 * @param key - Cache key
 * @param ttl - Time to live in seconds
 * @param fetcher - Function that fetches data from database
 * @returns Cached or fresh data
 */
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Cache miss - fetch from database
  const data = await fetcher()

  // Store in cache
  await cache.set(key, data, ttl)

  return data
}

/**
 * Optimized item queries with caching
 */
export const itemQueries = {
  /**
   * Get single item by ID with caching (1 hour)
   */
  async getById(id: string): Promise<Item | null> {
    return cachedQuery(
      cacheKeys.item(id),
      3600, // 1 hour
      async () => {
        return prisma.item.findUnique({
          where: { id },
          // Select only needed fields for better performance
          select: {
            id: true,
            name: true,
            description: true,
            item_type: true,
            icon: true,
            rarity: true,
            value: true,
            workbench: true,
            stat_block: true,
            flavor_text: true,
            subcategory: true,
            shield_type: true,
            loot_area: true,
            sources: true,
            ammo_type: true,
            locations: true,
            created_at: true,
            updated_at: true,
          },
        })
      }
    )
  },

  /**
   * Get items with filters and pagination (5 minutes cache)
   */
  async getMany(params: {
    page?: number
    pageSize?: number
    itemType?: string
    rarity?: string
    search?: string
  }): Promise<{ items: Item[]; total: number }> {
    const { page = 1, pageSize = 50, itemType, rarity, search } = params
    const skip = (page - 1) * pageSize

    // Create cache key from filters
    const filterKey = JSON.stringify({ page, pageSize, itemType, rarity, search })
    const cacheKey = cacheKeys.items(filterKey)

    return cachedQuery(
      cacheKey,
      300, // 5 minutes
      async () => {
        const where: any = {}

        if (itemType) where.item_type = itemType
        if (rarity) where.rarity = rarity
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }

        const [items, total] = await Promise.all([
          prisma.item.findMany({
            where,
            select: {
              id: true,
              name: true,
              description: true,
              item_type: true,
              icon: true,
              rarity: true,
              value: true,
              workbench: true,
              loot_area: true,
            },
            skip,
            take: pageSize,
            orderBy: { name: 'asc' },
          }),
          prisma.item.count({ where }),
        ])

        return { items, total }
      }
    )
  },

  /**
   * Invalidate item cache
   */
  async invalidate(id?: string): Promise<void> {
    if (id) {
      await cache.del(cacheKeys.item(id))
    } else {
      // Invalidate all item list caches
      await cache.delPattern('items:*')
    }
  },
}

/**
 * Optimized listing queries with caching
 */
export const listingQueries = {
  /**
   * Get active listings with pagination (1 minute cache - frequently changing data)
   */
  async getActive(params: {
    page?: number
    pageSize?: number
    type?: 'WTS' | 'WTB'
  }): Promise<{ listings: any[]; total: number }> {
    const { page = 1, pageSize = 20, type } = params
    const skip = (page - 1) * pageSize

    const filterKey = JSON.stringify({ page, pageSize, type })
    const cacheKey = cacheKeys.listings(filterKey)

    return cachedQuery(
      cacheKey,
      60, // 1 minute (short TTL for marketplace data)
      async () => {
        const where: any = { status: 'ACTIVE' }
        if (type) where.type = type

        const [listings, total] = await Promise.all([
          prisma.listing.findMany({
            where,
            select: {
              id: true,
              type: true,
              status: true,
              quantity: true,
              paymentType: true,
              seedsAmount: true,
              description: true,
              created_at: true,
              item: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  rarity: true,
                  item_type: true,
                },
              },
              user: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
              paymentItems: {
                select: {
                  quantity: true,
                  item: {
                    select: {
                      id: true,
                      name: true,
                      icon: true,
                      rarity: true,
                    },
                  },
                },
              },
            },
            skip,
            take: pageSize,
            orderBy: { created_at: 'desc' },
          }),
          prisma.listing.count({ where }),
        ])

        return { listings, total }
      }
    )
  },

  /**
   * Invalidate listing caches
   */
  async invalidate(): Promise<void> {
    await cache.delPattern('listings:*')
    await cache.delPattern('listing:*')
  },
}

/**
 * Optimized user queries with caching
 */
export const userQueries = {
  /**
   * Get user profile with ratings (10 minutes cache)
   */
  async getProfile(userId: string): Promise<any> {
    return cachedQuery(
      cacheKeys.user(userId),
      600, // 10 minutes
      async () => {
        return prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            embark_id: true,
            discord_username: true,
            created_at: true,
            ratingsReceived: {
              select: {
                score: true,
                honest: true,
                comment: true,
                created_at: true,
                fromUser: {
                  select: {
                    username: true,
                    image: true,
                  },
                },
              },
              orderBy: { created_at: 'desc' },
              take: 10,
            },
            _count: {
              select: {
                listings: true,
                tradesAsSeller: true,
                tradesAsBuyer: true,
              },
            },
          },
        })
      }
    )
  },

  /**
   * Invalidate user cache
   */
  async invalidate(userId: string): Promise<void> {
    await cache.del(cacheKeys.user(userId))
  },
}

/**
 * Cache invalidation helper for related entities
 * Call this after mutations (create, update, delete)
 */
export const invalidateRelated = {
  async item(itemId: string): Promise<void> {
    await itemQueries.invalidate(itemId)
    // Also invalidate listings that reference this item
    await listingQueries.invalidate()
  },

  async listing(listingId: string): Promise<void> {
    await listingQueries.invalidate()
  },

  async user(userId: string): Promise<void> {
    await userQueries.invalidate(userId)
  },
}
