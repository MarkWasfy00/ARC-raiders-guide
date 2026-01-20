# Performance Optimization Plan for 30k Concurrent Users

## Current State Analysis

**Infrastructure (Good foundations):**
- PgBouncer configured (max 1000 client connections, pool size 25)
- Redis running (256mb memory - needs increase)
- MinIO for static assets
- Single app instance (needs horizontal scaling)

**Critical Issues for 30k Users:**
1. Single Next.js instance - cannot handle 30k concurrent
2. No load balancer (nginx) configured
3. Redis caching infrastructure exists but NOT integrated into API routes
4. Socket.IO won't scale without Redis adapter
5. N+1 query issues causing unnecessary database load
6. No rate limiting

---

## Phase 1: Infrastructure Scaling (Critical)

### 1.1 Add Nginx Load Balancer + Multiple App Instances

**File to create:** `nginx.conf`

```nginx
upstream nextjs_cluster {
    least_conn;
    server app1:3001;
    server app2:3001;
    server app3:3001;
    server app4:3001;
    keepalive 64;
}

upstream socket_cluster {
    ip_hash;  # Sticky sessions for WebSocket
    server app1:3001;
    server app2:3001;
    server app3:3001;
    server app4:3001;
}

server {
    listen 80;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # Static assets - serve from MinIO or cache aggressively
    location /_next/static/ {
        proxy_pass http://nextjs_cluster;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # WebSocket connections
    location /api/socket {
        proxy_pass http://socket_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # API routes
    location /api/ {
        proxy_pass http://nextjs_cluster;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other routes
    location / {
        proxy_pass http://nextjs_cluster;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Docker Compose changes:**

```yaml
# Add nginx service
nginx:
  image: nginx:alpine
  container_name: arcraiders-nginx
  restart: unless-stopped
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
  depends_on:
    - app1
    - app2
    - app3
    - app4
  networks:
    - arcraiders-network

# Scale app to multiple instances
app1:
  <<: *app-base
  container_name: arcraiders-app1

app2:
  <<: *app-base
  container_name: arcraiders-app2

app3:
  <<: *app-base
  container_name: arcraiders-app3

app4:
  <<: *app-base
  container_name: arcraiders-app4
```

### 1.2 Socket.IO Redis Adapter (Critical for Chat)

**File to modify:** `app/api/socket/route.ts`

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Create pub/sub clients for Socket.IO adapter
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

// Apply Redis adapter - enables cross-instance communication
io.adapter(createAdapter(pubClient, subClient));
```

**Required package:** `npm install @socket.io/redis-adapter`

**Impact:** Enables WebSocket events to broadcast across all app instances.

### 1.3 Increase PgBouncer Limits

**File to modify:** `docker-compose.yml`

```yaml
pgbouncer:
  environment:
    PGBOUNCER_MAX_CLIENT_CONN: 5000    # Was 1000
    PGBOUNCER_DEFAULT_POOL_SIZE: 50    # Was 25
    PGBOUNCER_RESERVE_POOL_SIZE: 25    # Was 5
```

### 1.4 Increase Redis Memory

**File to modify:** `docker-compose.yml`

```yaml
redis:
  command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
  # Was 256mb
```

---

## Phase 2: Redis Caching Integration (High Impact)

### 2.1 Integrate Redis into API Routes

The caching infrastructure already exists in `lib/redis.ts` and `lib/cache-helpers.ts` but is NOT being used by API routes.

**Files to modify:**

#### `app/api/traders/route.ts`
```typescript
import { cache, cacheKeys } from '@/lib/redis';

export async function GET() {
  const cacheKey = cacheKeys.traders();

  // Try Redis cache first
  const cached = await cache.get<TraderData[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  // Fetch from external API
  const data = await fetchTradersFromAPI();

  // Cache for 24 hours
  await cache.set(cacheKey, data, 86400);

  return NextResponse.json({ data });
}
```

#### `app/api/event-timers/route.ts`
```typescript
import { cache, cacheKeys } from '@/lib/redis';

export async function GET() {
  const cacheKey = cacheKeys.eventTimers();

  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await fetchEventTimers();
  await cache.set(cacheKey, data, 300); // 5 minutes

  return NextResponse.json(data);
}
```

#### `app/api/marketplace/listings/route.ts`
```typescript
import { cachedQuery, cacheKeys } from '@/lib/cache-helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const cacheKey = cacheKeys.listings(JSON.stringify({ type }));

  const data = await cachedQuery(cacheKey, 60, async () => {
    return prisma.listing.findMany({
      // existing query...
    });
  });

  return NextResponse.json(data);
}
```

#### `app/api/items/route.ts`
```typescript
import { cachedQuery, cacheKeys } from '@/lib/cache-helpers';

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(searchParams);
  const cacheKey = cacheKeys.items(JSON.stringify(params));

  const data = await cachedQuery(cacheKey, 3600, async () => {
    return prisma.item.findMany({ /* query */ });
  });

  return NextResponse.json(data);
}
```

---

## Phase 3: Database Query Optimizations

### 3.1 Fix Featured Items N+1 Query (23 queries → 1)

**File:** `app/features/items/services/items-actions.ts`

**Current problematic code (lines 60-81):**
```typescript
// BAD: 23 separate queries
for (const type of featuredTypes) {
  const typeItems = await prisma.item.findMany({
    where: { item_type: type },
    take: 2,
  });
}
```

**Optimized solution:**
```typescript
// GOOD: Single query
const allItems = await prisma.item.findMany({
  where: {
    item_type: { in: featuredTypes },
  },
  orderBy: [
    { item_type: 'asc' },
    { rarity: 'desc' },
    { value: 'desc' },
  ],
  select: {
    id: true,
    name: true,
    description: true,
    item_type: true,
    icon: true,
    rarity: true,
    value: true,
    stat_block: true,
  },
});

// Post-process: get 2 items per type
const itemsByType = new Map<ItemType, Item[]>();
for (const item of allItems) {
  const existing = itemsByType.get(item.item_type) || [];
  if (existing.length < 2) {
    existing.push(item);
    itemsByType.set(item.item_type, existing);
  }
}

const featuredItems = Array.from(itemsByType.values()).flat();
```

### 3.2 Fix Loadouts N+1 Query (12+ queries → 2)

**File:** `app/features/loadouts/services/loadouts-actions.ts`

**Current problematic code (lines 350-360):**
```typescript
// BAD: N+1 queries
const loadoutsWithTotals = await Promise.all(
  loadouts.map(async (loadout) => {
    const totals = await calculateLoadoutTotals(loadout.loadoutData);
    return { ...loadout, ...totals };
  })
);
```

**Optimized solution:**
```typescript
// GOOD: Batch all item IDs, single query
function extractItemIds(loadoutData: LoadoutData): string[] {
  // Extract all item IDs from loadout structure
  const ids: string[] = [];
  // ... extraction logic
  return ids;
}

// Get all unique item IDs from all loadouts
const allItemIds = new Set<string>();
loadouts.forEach(loadout => {
  extractItemIds(loadout.loadoutData).forEach(id => allItemIds.add(id));
});

// Single query for all items
const itemsMap = new Map<string, Item>();
if (allItemIds.size > 0) {
  const items = await prisma.item.findMany({
    where: { id: { in: Array.from(allItemIds) } },
    select: { id: true, value: true, stat_block: true },
  });
  items.forEach(item => itemsMap.set(item.id, item));
}

// Calculate totals using the map (no additional queries)
const loadoutsWithTotals = loadouts.map(loadout => {
  const totals = calculateTotalsFromMap(loadout.loadoutData, itemsMap);
  return { ...loadout, totalWeight: totals.weight, totalPrice: totals.price };
});
```

### 3.3 Add Database Indexes

**File:** `prisma/schema.prisma`

```prisma
model User {
  // ... existing fields

  @@index([email, banned])  // For login queries
}

model ListingItem {
  // ... existing fields

  @@index([listingId, itemId])  // Composite for joins
}
```

**Apply migration:**
```bash
npm run db:generate && npm run db:migrate
```

### 3.4 Optimize Ratings Calculation

**File:** `app/api/marketplace/listings/route.ts`

**Current approach (inefficient):**
```typescript
// Fetches all ratings, aggregates in JS
const ratings = listing.user.ratingsReceived;
const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
```

**Optimized approach:**
```typescript
// Aggregate in database
const userIds = [...new Set(listings.map(l => l.userId))];

const ratingsStats = await prisma.rating.groupBy({
  by: ['toUserId'],
  where: { toUserId: { in: userIds } },
  _avg: { score: true },
  _count: { id: true },
});

const ratingsMap = new Map(ratingsStats.map(r => [
  r.toUserId,
  { avg: r._avg.score || 0, count: r._count.id }
]));
```

---

## Phase 4: Rate Limiting & Protection

### 4.1 Create Rate Limiting Utility

**File to create:** `lib/rate-limit.ts`

```typescript
import { cache } from './redis';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;

  const current = await cache.incr(key);

  if (current === 1) {
    await cache.expire(key, windowSeconds);
  }

  const ttl = await cache.ttl(key);

  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + (ttl * 1000),
  };
}

// Preset limits
export const limits = {
  api: { limit: 100, window: 60 },      // 100 req/min
  auth: { limit: 5, window: 60 },       // 5 req/min
  chat: { limit: 30, window: 60 },      // 30 msg/min
  upload: { limit: 10, window: 60 },    // 10 uploads/min
};
```

### 4.2 Apply Rate Limiting to API Routes

**Example usage in routes:**

```typescript
import { rateLimit, limits } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const ip = headers().get('x-forwarded-for') || 'unknown';

  const { success, remaining } = await rateLimit(
    `api:${ip}`,
    limits.api.limit,
    limits.api.window
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() }
      }
    );
  }

  // Continue with request...
}
```

---

## Phase 5: Frontend Optimizations

### 5.1 Lazy Load TipTap Editor

**File:** `app/features/blog/components/BlogForm.tsx`

```typescript
import dynamic from 'next/dynamic';

const BlogEditor = dynamic(
  () => import('./BlogEditor').then(mod => ({ default: mod.BlogEditor })),
  {
    loading: () => (
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);
```

**Also apply to:** `app/features/guides/components/GuideForm.tsx`

### 5.2 Add Suspense Boundaries

**File:** `app/page.tsx`

```typescript
import { Suspense } from 'react';

export default function Home() {
  return (
    <main>
      <Hero />

      <Suspense fallback={<ExploreRaidersSkeleton />}>
        <ExploreRaiders />
      </Suspense>

      <Suspense fallback={<ItemsGridSkeleton />}>
        <FeaturedItems />
      </Suspense>

      <Suspense fallback={<BlogsSkeleton />}>
        <RecentBlogs limit={8} />
      </Suspense>
    </main>
  );
}
```

### 5.3 Static Asset Caching Headers

**File:** `next.config.ts`

```typescript
async headers() {
  return [
    {
      source: '/imagesmaps/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
    {
      source: '/_next/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
    {
      source: '/images/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=86400, stale-while-revalidate=604800',
      }],
    },
  ];
}
```

---

## Phase 6: Monitoring & Health Checks

### 6.1 Health Check Endpoint

**File to create:** `app/api/health/route.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, boolean>,
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = true;
  } catch {
    checks.services.database = false;
    checks.status = 'degraded';
  }

  // Redis check
  try {
    await cache.set('health-check', 'ok', 10);
    checks.services.redis = true;
  } catch {
    checks.services.redis = false;
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

---

## Implementation Order (Priority)

| Step | Task | Impact | Effort | Est. Time |
|------|------|--------|--------|-----------|
| 1 | Nginx + multiple app instances | Critical | High | 2-3 hours |
| 2 | Socket.IO Redis adapter | Critical | Medium | 1 hour |
| 3 | Increase PgBouncer + Redis limits | High | Low | 15 min |
| 4 | Redis cache integration (APIs) | High | Medium | 2 hours |
| 5 | Fix N+1 queries (items, loadouts) | High | Medium | 2 hours |
| 6 | Add rate limiting | High | Medium | 1 hour |
| 7 | Database indexes | Medium | Low | 30 min |
| 8 | Lazy load TipTap | Medium | Low | 30 min |
| 9 | Suspense boundaries | Medium | Medium | 1 hour |
| 10 | Health check endpoint | Medium | Low | 30 min |

---

## Critical Files Summary

| File | Changes Required |
|------|-----------------|
| `docker-compose.yml` | Add nginx, scale app to 4+, increase limits |
| `nginx.conf` (new) | Load balancer configuration |
| `app/api/socket/route.ts` | Add Redis adapter |
| `app/api/traders/route.ts` | Add Redis caching |
| `app/api/event-timers/route.ts` | Add Redis caching |
| `app/api/marketplace/listings/route.ts` | Add Redis caching + optimize ratings |
| `app/api/items/route.ts` | Add Redis caching |
| `app/features/items/services/items-actions.ts` | Fix N+1 query |
| `app/features/loadouts/services/loadouts-actions.ts` | Fix N+1 query |
| `prisma/schema.prisma` | Add indexes |
| `lib/rate-limit.ts` (new) | Rate limiting utility |
| `app/api/health/route.ts` (new) | Health check endpoint |

---

## Verification & Testing

### Load Testing with k6

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp to 1k users
    { duration: '5m', target: 5000 },   // Ramp to 5k users
    { duration: '10m', target: 30000 }, // Ramp to 30k users
    { duration: '5m', target: 30000 },  // Stay at 30k
    { duration: '2m', target: 0 },      // Ramp down
  ],
};

export default function () {
  const res = http.get('http://your-server/api/items');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Redis Cache Monitoring

```bash
# Watch cache operations in real-time
docker exec -it arcraiders-redis redis-cli MONITOR

# Check hit/miss statistics
docker exec -it arcraiders-redis redis-cli INFO stats | grep keyspace
```

### Database Query Logging

```typescript
// In development, enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Expected Results After Implementation

- ✅ Handle 30,000+ concurrent users
- ✅ 90%+ cache hit rate for frequently accessed data
- ✅ Database queries reduced by 80%+ (N+1 fixes)
- ✅ WebSocket chat working across all instances
- ✅ Protection against abuse via rate limiting
- ✅ Sub-100ms response times for cached endpoints
- ✅ Graceful degradation under extreme load
