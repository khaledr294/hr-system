import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export type UserRole = 'HR' | 'GENERAL_MANAGER' | 'MARKETER';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Requires an authenticated session, redirects to login if none
 * @returns The current user session
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user as SessionUser;
}

/**
 * Requires a specific role, redirects to dashboard if insufficient permissions
 * @param allowedRoles - Array of roles that can access this resource
 * @returns The current user session if role is allowed
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireSession();
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect('/dashboard?error=insufficient_permissions');
  }
  
  return user;
}

/**
 * Helper for HR-only access
 */
export async function requireHR(): Promise<SessionUser> {
  return requireRole(['HR']);
}

/**
 * Helper for General Manager-only access
 */
export async function requireGeneralManager(): Promise<SessionUser> {
  return requireRole(['GENERAL_MANAGER']);
}

/**
 * Helper for HR or General Manager access
 */
export async function requireHROrManager(): Promise<SessionUser> {
  return requireRole(['HR', 'GENERAL_MANAGER']);
}

/**
 * Helper for Marketer access
 */
export async function requireMarketer(): Promise<SessionUser> {
  return requireRole(['MARKETER']);
}