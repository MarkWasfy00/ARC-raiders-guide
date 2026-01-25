import { auth } from './auth';

/**
 * Check if the current session user is an admin
 * @returns Promise<boolean>
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * Check if the current session user is a moderator
 * @returns Promise<boolean>
 */
export async function isModerator(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'MODERATOR';
}

/**
 * Check if the current session user is staff (admin or moderator)
 * @returns Promise<boolean>
 */
export async function isStaff(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';
}

/**
 * Require admin role, throw error if not authorized
 * @throws Error if user is not an admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Require staff role (admin or moderator), throw error if not authorized
 * @throws Error if user is not staff
 */
export async function requireStaff(): Promise<void> {
  const staff = await isStaff();
  if (!staff) {
    throw new Error('Unauthorized: Staff access required');
  }
}

/**
 * Get current session with role information
 */
export async function getSessionWithRole() {
  const session = await auth();
  return session;
}
