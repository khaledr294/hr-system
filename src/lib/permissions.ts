import { Permission } from "@prisma/client";
export { Permission };
import type { Session } from "next-auth";
import { prisma } from "./prisma";

export type PermissionList = Permission[];

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_WORKERS: "عرض بيانات العاملات",
  CREATE_WORKERS: "إضافة عاملات",
  EDIT_WORKERS: "تعديل بيانات العاملات",
  DELETE_WORKERS: "حذف العاملات",
  RESERVE_WORKERS: "حجز العاملات",
  VIEW_CONTRACTS: "عرض العقود",
  CREATE_CONTRACTS: "إنشاء العقود",
  EDIT_CONTRACTS: "تعديل العقود",
  DELETE_CONTRACTS: "حذف العقود",
  VIEW_CLIENTS: "عرض العملاء",
  CREATE_CLIENTS: "إضافة العملاء",
  EDIT_CLIENTS: "تعديل العملاء",
  DELETE_CLIENTS: "حذف العملاء",
  VIEW_USERS: "عرض المستخدمين",
  CREATE_USERS: "إضافة المستخدمين",
  EDIT_USERS: "تعديل المستخدمين",
  DELETE_USERS: "حذف المستخدمين",
  VIEW_REPORTS: "عرض التقارير",
  MANAGE_REPORTS: "إدارة وإصدار التقارير",
  EXPORT_DATA: "تصدير البيانات",
  VIEW_LOGS: "عرض السجلات",
  MANAGE_SETTINGS: "إدارة الإعدادات",
  MANAGE_JOB_TITLES: "إدارة المسميات الوظيفية",
  VIEW_PAYROLL: "عرض الرواتب",
  MANAGE_PAYROLL: "إدارة الرواتب",
  VIEW_PAYROLL_DELIVERY: "عرض تسليم الرواتب",
  MANAGE_PAYROLL_DELIVERY: "إدارة تسليم الرواتب",
  VIEW_BACKUPS: "عرض النسخ الاحتياطية",
  MANAGE_BACKUPS: "إدارة النسخ الاحتياطية",
  VIEW_ARCHIVE: "عرض الأرشيف",
  MANAGE_ARCHIVE: "إدارة الأرشيف",
  MANAGE_TEMPLATES: "إدارة القوالب",
  VIEW_PERFORMANCE: "عرض الأداء",
  VIEW_SEARCH: "الوصول للبحث المتقدم",
  MANAGE_PACKAGES: "إدارة الباقات",
};

export async function resolveUserPermissions(userId: string): Promise<PermissionList> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { jobTitle: true },
  });

  if (!user?.jobTitle?.isActive) {
    return [];
  }

  return user.jobTitle.permissions ?? [];
}

export function hasPermission(permissions: PermissionList, permission: Permission): boolean;
export function hasPermission(userId: string, permission: Permission): Promise<boolean>;
export function hasPermission(arg: PermissionList | string, permission: Permission): boolean | Promise<boolean> {
  if (typeof arg === 'string') {
    return resolveUserPermissions(arg).then((perms) => perms.includes(permission));
  }
  return arg.includes(permission);
}

export function hasAllPermissions(permissions: PermissionList, required: Permission[]): boolean;
export function hasAllPermissions(userId: string, required: Permission[]): Promise<boolean>;
export function hasAllPermissions(arg: PermissionList | string, required: Permission[]): boolean | Promise<boolean> {
  if (typeof arg === 'string') {
    return resolveUserPermissions(arg).then((perms) => required.every((perm) => perms.includes(perm)));
  }
  return required.every((perm) => arg.includes(perm));
}

export function hasAnyPermission(permissions: PermissionList, required: Permission[]): boolean;
export function hasAnyPermission(userId: string, required: Permission[]): Promise<boolean>;
export function hasAnyPermission(arg: PermissionList | string, required: Permission[]): boolean | Promise<boolean> {
  if (typeof arg === 'string') {
    return resolveUserPermissions(arg).then((perms) => required.some((perm) => perms.includes(perm)));
  }
  return required.some((perm) => arg.includes(perm));
}

export function diffPermissions(current: PermissionList, target: PermissionList) {
  const missing = target.filter((perm) => !current.includes(perm));
  const extra = current.filter((perm) => !target.includes(perm));
  return { missing, extra };
}

export function sessionHasPermission(session: Session | null | undefined, permission: Permission): boolean {
  return hasPermission(session?.user?.permissions ?? [], permission);
}

export function sessionHasAll(session: Session | null | undefined, perms: Permission[]): boolean {
  return hasAllPermissions(session?.user?.permissions ?? [], perms);
}

export function sessionHasAny(session: Session | null | undefined, perms: Permission[]): boolean {
  return hasAnyPermission(session?.user?.permissions ?? [], perms);
}
