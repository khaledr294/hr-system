/**
 * Permissions System
 * نظام الصلاحيات - يستخدم لفحص صلاحيات المستخدمين بناءً على المسمى الوظيفي
 */

import { prisma } from "./prisma";

export type Permission = 
  // Workers
  | "VIEW_WORKERS"
  | "CREATE_WORKERS"
  | "EDIT_WORKERS"
  | "DELETE_WORKERS"
  | "RESERVE_WORKERS"
  // Contracts
  | "VIEW_CONTRACTS"
  | "CREATE_CONTRACTS"
  | "EDIT_CONTRACTS"
  | "DELETE_CONTRACTS"
  // Clients
  | "VIEW_CLIENTS"
  | "CREATE_CLIENTS"
  | "EDIT_CLIENTS"
  | "DELETE_CLIENTS"
  // Users
  | "VIEW_USERS"
  | "CREATE_USERS"
  | "EDIT_USERS"
  | "DELETE_USERS"
  // Reports
  | "VIEW_REPORTS"
  | "EXPORT_DATA"
  // System
  | "VIEW_LOGS"
  | "MANAGE_SETTINGS"
  | "MANAGE_JOB_TITLES";

/**
 * فحص صلاحية معينة للمستخدم
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobTitle: true }
    });

    if (!user) return false;

    // HR_MANAGER و GENERAL_MANAGER لديهم صلاحيات كاملة
    if (user.role === "HR_MANAGER" || user.role === "GENERAL_MANAGER") {
      return true;
    }

    // فحص الصلاحيات من المسمى الوظيفي
    if (user.jobTitle && user.jobTitle.isActive && user.jobTitle.permissions) {
      try {
        const permissions = JSON.parse(user.jobTitle.permissions) as Permission[];
        return permissions.includes(permission);
      } catch (parseError) {
        console.error("Error parsing permissions JSON:", parseError);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * فحص عدة صلاحيات - يجب أن تكون جميعها متوفرة
 */
export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(userId, permission))
  );
  return results.every(result => result === true);
}

/**
 * فحص عدة صلاحيات - يكفي أن تكون واحدة متوفرة
 */
export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => hasPermission(userId, permission))
  );
  return results.some(result => result === true);
}

/**
 * الحصول على جميع صلاحيات المستخدم
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobTitle: true }
    });

    if (!user) return [];

    // HR_MANAGER و GENERAL_MANAGER لديهم جميع الصلاحيات
    if (user.role === "HR_MANAGER" || user.role === "GENERAL_MANAGER") {
      return [
        "VIEW_WORKERS", "CREATE_WORKERS", "EDIT_WORKERS", "DELETE_WORKERS", "RESERVE_WORKERS",
        "VIEW_CONTRACTS", "CREATE_CONTRACTS", "EDIT_CONTRACTS", "DELETE_CONTRACTS",
        "VIEW_CLIENTS", "CREATE_CLIENTS", "EDIT_CLIENTS", "DELETE_CLIENTS",
        "VIEW_USERS", "CREATE_USERS", "EDIT_USERS", "DELETE_USERS",
        "VIEW_REPORTS", "EXPORT_DATA",
        "VIEW_LOGS", "MANAGE_SETTINGS", "MANAGE_JOB_TITLES"
      ];
    }

    // الصلاحيات من المسمى الوظيفي
    if (user.jobTitle && user.jobTitle.isActive && user.jobTitle.permissions) {
      try {
        return JSON.parse(user.jobTitle.permissions) as Permission[];
      } catch (parseError) {
        console.error("Error parsing permissions JSON:", parseError);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}
