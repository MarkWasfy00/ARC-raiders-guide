import { prisma } from "@/lib/prisma";
import { getCachedSettingValue } from "./settings-cache";

const LOCKOUT_DURATION_MINUTES = 15;

// In-memory IP-based login attempt tracking
interface IpAttemptEntry {
  count: number;
  lockedUntil: number | null;
}

const ipAttempts = new Map<string, IpAttemptEntry>();

// Clean up expired IP entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipAttempts.entries()) {
    // Remove if lockout expired and no recent attempts
    if (entry.lockedUntil && entry.lockedUntil < now) {
      ipAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if an IP is locked out
 */
export async function isIpLockedOut(ip: string): Promise<{
  locked: boolean;
  remainingMinutes?: number;
}> {
  const entry = ipAttempts.get(ip);

  if (!entry?.lockedUntil) {
    return { locked: false };
  }

  const now = Date.now();
  if (entry.lockedUntil > now) {
    const remainingMs = entry.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { locked: true, remainingMinutes };
  }

  // Lockout expired, clear it
  ipAttempts.delete(ip);
  return { locked: false };
}

/**
 * Record a failed login attempt for an IP
 */
export async function recordIpFailedLogin(ip: string): Promise<{
  locked: boolean;
  attemptsRemaining: number;
}> {
  const maxAttempts = await getCachedSettingValue<number>("max_login_attempts", 5);

  const entry = ipAttempts.get(ip) || { count: 0, lockedUntil: null };
  entry.count++;

  if (entry.count >= maxAttempts) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000;
    ipAttempts.set(ip, entry);
    return { locked: true, attemptsRemaining: 0 };
  }

  ipAttempts.set(ip, entry);
  return { locked: false, attemptsRemaining: maxAttempts - entry.count };
}

/**
 * Reset IP failed login attempts
 */
export function resetIpFailedLogins(ip: string): void {
  ipAttempts.delete(ip);
}

/**
 * Check if a user is currently locked out (by email)
 */
export async function isUserLockedOut(email: string): Promise<{
  locked: boolean;
  lockedUntil?: Date;
  remainingMinutes?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  });

  if (!user?.lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (user.lockedUntil > now) {
    const remainingMs = user.lockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      locked: true,
      lockedUntil: user.lockedUntil,
      remainingMinutes,
    };
  }

  // Lockout expired, clear it
  await prisma.user.update({
    where: { email },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
  });

  return { locked: false };
}

/**
 * Record a failed login attempt
 * Returns true if user is now locked out
 */
export async function recordFailedLogin(email: string): Promise<{
  locked: boolean;
  attemptsRemaining: number;
}> {
  const maxAttempts = await getCachedSettingValue<number>("max_login_attempts", 5);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, failedLoginAttempts: true },
  });

  if (!user) {
    // Don't reveal if user exists
    return { locked: false, attemptsRemaining: maxAttempts };
  }

  const newAttempts = user.failedLoginAttempts + 1;

  if (newAttempts >= maxAttempts) {
    // Lock the user
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil,
      },
    });
    return { locked: true, attemptsRemaining: 0 };
  }

  // Just increment the counter
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: newAttempts },
  });

  return {
    locked: false,
    attemptsRemaining: maxAttempts - newAttempts,
  };
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLogins(email: string): Promise<void> {
  await prisma.user.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      loginCount: { increment: 1 },
    },
  });
}

/**
 * Get session timeout in seconds from settings
 */
export async function getSessionTimeoutSeconds(): Promise<number> {
  const hours = await getCachedSettingValue<number>("session_timeout_hours", 720);
  return hours * 60 * 60; // Convert hours to seconds
}
