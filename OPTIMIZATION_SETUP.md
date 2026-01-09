# Quick Setup Guide for Performance Optimizations

Follow these steps to enable all performance optimizations in your ARC Raiders application.

## Step 1: Install Dependencies

```bash
npm install
```

This installs the new packages:
- `redis` - Redis client for server-side caching
- `@tanstack/react-query` - Client-side state management and caching
- `@tanstack/react-query-devtools` - Development tools for React Query

## Step 2: Update Environment Variables

Edit your `.env.local` file and add Redis configuration:

```env
# Redis Configuration (already added for you)
REDIS_URL=redis://localhost:6379
```

**For Production/Remote Server:**
If your Redis is on a remote server (like your PostgreSQL at 145.223.116.42):

```env
REDIS_URL=redis://145.223.116.42:6379
```

**Optional: Switch to PgBouncer**
For even better performance, update your DATABASE_URL to use PgBouncer:

```env
# Change from:
DATABASE_URL=postgresql://postgres:postgres@145.223.116.42:5432/arcraiders

# To:
DATABASE_URL=postgresql://postgres:postgres@145.223.116.42:6432/arcraiders?pgbouncer=true
```

## Step 3: Apply Database Migrations

The new composite indexes need to be added to your database:

```bash
# Generate Prisma client with new schema
npm run db:generate

# Create and apply migration for new indexes
npm run db:migrate
# When prompted, name it something like "add_performance_indexes"

# Or for production, push changes directly (no migration files)
npm run db:push
```

## Step 4: Start Redis and PgBouncer (Docker)

### For Local Development:

```bash
# Start all services including Redis and PgBouncer
docker compose up -d redis pgbouncer
```

### For Remote/Production Server:

SSH into your server (145.223.116.42) and run:

```bash
cd /path/to/your/arc-raiders-guide
docker compose up -d redis pgbouncer
```

### Verify Services are Running:

```bash
# Check Redis
docker ps | grep redis
docker exec -it arcraiders-redis redis-cli ping
# Should output: PONG

# Check PgBouncer
docker ps | grep pgbouncer
```

## Step 5: Restart Your Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Or with Docker
docker compose up -d app
```

## Step 6: Verify Everything Works

### Test Redis Connection

Create a test file `test-redis.ts`:

```typescript
import { cache } from './lib/redis'

async function testRedis() {
  console.log('Testing Redis...')

  await cache.set('test', { message: 'Hello Redis!' }, 60)
  const result = await cache.get('test')

  console.log('Redis test result:', result)
  console.log('✅ Redis is working!')
}

testRedis().catch(console.error)
```

Run it:
```bash
npx tsx test-redis.ts
```

### Check React Query DevTools

1. Start your development server: `npm run dev`
2. Open your browser to `http://localhost:3000`
3. Look for a small React Query icon in the bottom-right corner
4. Click it to see the query cache and network activity

### Monitor Cache Performance

```bash
# Connect to Redis CLI
docker exec -it arcraiders-redis redis-cli

# View all keys
KEYS *

# Get cache statistics
INFO stats

# Check memory usage
INFO memory
```

## Step 7: Update Your Existing Queries (Optional but Recommended)

### Before:
```typescript
// Old way - no caching
const items = await prisma.item.findMany()
```

### After:
```typescript
// New way - with caching
import { itemQueries } from '@/lib/cache-helpers'

const { items, total } = await itemQueries.getMany({
  page: 1,
  pageSize: 50
})
```

### Remember to Invalidate Cache After Mutations:

```typescript
import { invalidateRelated } from '@/lib/cache-helpers'

// After creating/updating
await prisma.item.update({ ... })
await invalidateRelated.item(itemId)
```

## Usage Examples

### Example 1: Cached API Route

```typescript
// app/api/items/route.ts
import { NextResponse } from 'next/server'
import { itemQueries } from '@/lib/cache-helpers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')

  const { items, total } = await itemQueries.getMany({ page })

  return NextResponse.json({ items, total })
}
```

### Example 2: React Query in Components

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function ItemsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['items', { page: 1 }],
    queryFn: async () => {
      const res = await fetch('/api/items?page=1')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data.items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Example 3: Server Action with Cache Invalidation

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { invalidateRelated } from '@/lib/cache-helpers'

export async function createItem(data: ItemData) {
  const item = await prisma.item.create({
    data,
  })

  // IMPORTANT: Invalidate cache after mutation
  await invalidateRelated.item(item.id)

  return { success: true, item }
}
```

## Troubleshooting

### Issue: Redis connection errors

**Solution:**
```bash
# Make sure Redis is running
docker compose up -d redis

# Check logs
docker logs arcraiders-redis

# Verify REDIS_URL in .env.local
cat .env.local | grep REDIS_URL
```

### Issue: PgBouncer connection fails

**Solution:**
```bash
# Check if PgBouncer is running
docker ps | grep pgbouncer

# View logs
docker logs arcraiders-pgbouncer

# If migration fails, use direct PostgreSQL connection:
# Change port 6432 back to 5432 in DATABASE_URL
```

### Issue: Application slow after enabling optimizations

**Possible causes:**
1. Cache not being used (check if queries use cache helpers)
2. Redis not running (verify with `redis-cli ping`)
3. Cache invalidation too aggressive (increase TTL values)

**Debug:**
```bash
# Check if cache is being populated
docker exec -it arcraiders-redis redis-cli
KEYS *  # Should show cached keys like "item:*", "listings:*"

# Check cache hit rate
INFO stats
# Look for "keyspace_hits" vs "keyspace_misses"
```

### Issue: React Query not caching

**Solution:**
Make sure `ReactQueryProvider` is in `app/layout.tsx` and wraps your components.

Check if queries have proper `queryKey`:
```typescript
// ✅ Good - stable queryKey
queryKey: ['items', { page: 1, type: 'WEAPON' }]

// ❌ Bad - unstable queryKey (creates new array each render)
queryKey: [Math.random()]
```

## Performance Monitoring

### Check Cache Hit Rate

```bash
docker exec -it arcraiders-redis redis-cli INFO stats | grep keyspace
```

High hit rate = good caching!
- 80%+ hit rate: Excellent
- 60-80% hit rate: Good
- <60% hit rate: Review cache strategy

### Monitor Database Connections

```bash
# Connect to PgBouncer
docker exec -it arcraiders-pgbouncer psql -h localhost -p 6432 -U postgres pgbouncer

# Inside pgbouncer shell:
SHOW POOLS;
SHOW STATS;
```

## Next Steps

1. ✅ Monitor application performance in production
2. ✅ Adjust cache TTL values based on data update frequency
3. ✅ Gradually migrate existing queries to use cache helpers
4. ✅ Set up Redis persistence for production (add to docker-compose.yml)
5. ✅ Consider Redis cluster for high availability

## Redis Persistence (Production)

For production, enable Redis data persistence:

Edit `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
  volumes:
    - redis_data:/data
```

This ensures cache survives container restarts.

## Support

For detailed information, see:
- **PERFORMANCE_OPTIMIZATIONS.md** - Complete guide to all optimizations
- **CLAUDE.md** - Project setup and architecture

For issues, check:
- Redis logs: `docker logs arcraiders-redis`
- PgBouncer logs: `docker logs arcraiders-pgbouncer`
- App logs: `docker logs arcraiders-app`
