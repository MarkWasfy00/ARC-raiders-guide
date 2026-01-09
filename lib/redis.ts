import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let isConnecting = false

/**
 * Get or create Redis client instance
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return getRedisClient()
  }

  isConnecting = true

  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'

    redisClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max reconnection attempts reached')
            return new Error('Max reconnection attempts reached')
          }
          return Math.min(retries * 100, 3000)
        }
      }
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis connected')
    })

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })

    await redisClient.connect()
    isConnecting = false
    return redisClient
  } catch (error) {
    isConnecting = false
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient()
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  },

  /**
   * Set cached value with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const client = await getRedisClient()
      const serialized = JSON.stringify(value)

      if (ttl) {
        await client.setEx(key, ttl, serialized)
      } else {
        await client.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  },

  /**
   * Delete cached value
   */
  async del(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      await client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  },

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const client = await getRedisClient()
      const keys = await client.keys(pattern)

      if (keys.length === 0) return 0

      await client.del(keys)
      return keys.length
    } catch (error) {
      console.error('Redis DEL PATTERN error:', error)
      return 0
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  },

  /**
   * Set expiration on existing key (in seconds)
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const client = await getRedisClient()
      await client.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return false
    }
  },

  /**
   * Increment numeric value
   */
  async incr(key: string): Promise<number> {
    try {
      const client = await getRedisClient()
      return await client.incr(key)
    } catch (error) {
      console.error('Redis INCR error:', error)
      throw error
    }
  },

  /**
   * Decrement numeric value
   */
  async decr(key: string): Promise<number> {
    try {
      const client = await getRedisClient()
      return await client.decr(key)
    } catch (error) {
      console.error('Redis DECR error:', error)
      throw error
    }
  }
}

/**
 * Cache key builders for consistency
 */
export const cacheKeys = {
  item: (id: string) => `item:${id}`,
  items: (filters: string) => `items:${filters}`,
  listing: (id: string) => `listing:${id}`,
  listings: (filters: string) => `listings:${filters}`,
  user: (id: string) => `user:${id}`,
  chat: (id: string) => `chat:${id}`,
  trader: (id: string) => `trader:${id}`,
  traders: () => `traders:all`,
  eventTimers: () => `event-timers:all`,
  mapMarkers: (mapId: string) => `map-markers:${mapId}`,
  guide: (slug: string) => `guide:${slug}`,
  guides: (filters: string) => `guides:${filters}`,
  blog: (slug: string) => `blog:${slug}`,
  blogs: (filters: string) => `blogs:${filters}`,
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    redisClient = null
    console.log('Redis connection closed')
  }
}
