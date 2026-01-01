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
 * Get current session with role information
 */
export async function getSessionWithRole() {
  const session = await auth();
  return session;
}
