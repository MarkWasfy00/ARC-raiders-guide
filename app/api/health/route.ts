import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

interface ServiceStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  instance: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
  };
  uptime: number;
}

// Track server start time
const startTime = Date.now();

export async function GET() {
  const checks: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instance: process.env.INSTANCE_ID || 'unknown',
    services: {
      database: { healthy: false },
      redis: { healthy: false },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  // Check database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = {
      healthy: true,
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.services.database = {
      healthy: false,
      latency: Date.now() - dbStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    checks.status = 'degraded';
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    await cache.set('health-check', Date.now().toString(), 10);
    const value = await cache.get<string>('health-check');

    if (value) {
      checks.services.redis = {
        healthy: true,
        latency: Date.now() - redisStart,
      };
    } else {
      throw new Error('Redis read/write failed');
    }
  } catch (error) {
    checks.services.redis = {
      healthy: false,
      latency: Date.now() - redisStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    checks.status = 'degraded';
  }

  // Determine overall status
  const allHealthy = Object.values(checks.services).every((s) => s.healthy);
  const allUnhealthy = Object.values(checks.services).every((s) => !s.healthy);

  if (allUnhealthy) {
    checks.status = 'unhealthy';
  } else if (!allHealthy) {
    checks.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503;

  return NextResponse.json(checks, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
