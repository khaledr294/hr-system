import {
  LayoutGrid,
  Users,
  Wallet,
  FileText,
  Settings,
  Home,
  UserCog,
  Briefcase,
  FolderKanban,
  Archive,
  HardDrive,
  Search,
  Activity,
} from "lucide-react";
import type { PermissionKey } from "@/lib/permission-keys";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: PermissionKey[];
  mode?: "all" | "any";
};

export type Section = {
  title: string;
  items: NavItem[];
};

export const baseSections: Section[] = [
  {
    title: "عام",
    items: [
      { href: "/dashboard", label: "الرئيسية", icon: Home },
    ],
  },
  {
    title: "العمليات",
    items: [
      { href: "/workers", label: "العمالة", icon: Users, permissions: ['VIEW_WORKERS'] },
      { href: "/workers/new", label: "إضافة عاملة", icon: Users, permissions: ['CREATE_WORKERS'] },
      { href: "/workers/reserve", label: "حجز العاملات", icon: Users, permissions: ['RESERVE_WORKERS'] },
      { href: "/clients", label: "العملاء", icon: LayoutGrid, permissions: ['VIEW_CLIENTS'] },
      { href: "/clients/new", label: "إضافة عميل", icon: LayoutGrid, permissions: ['CREATE_CLIENTS'] },
      { href: "/contracts", label: "العقود", icon: FileText, permissions: ['VIEW_CONTRACTS'] },
      { href: "/contracts/templates", label: "قوالب العقود", icon: FolderKanban, permissions: ['MANAGE_TEMPLATES'] },
      { href: "/contracts/packages", label: "الباقات والخدمات", icon: Briefcase, permissions: ['MANAGE_PACKAGES'] },
    ],
  },
  {
    title: "المالية",
    items: [
      { href: "/payroll", label: "حساب الرواتب", icon: Wallet, permissions: ['VIEW_PAYROLL'] },
      { href: "/payroll/delivery", label: "تسليم الرواتب", icon: Wallet, permissions: ['VIEW_PAYROLL_DELIVERY'] },
      { href: "/nationality-salary", label: "الجنسيات والرواتب", icon: Wallet, permissions: ['MANAGE_PAYROLL'] },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/reports", label: "التقارير", icon: FileText, permissions: ['VIEW_REPORTS'] },
      { href: "/search", label: "البحث المتقدم", icon: Search, permissions: ['VIEW_SEARCH'] },
      { href: "/archive", label: "الأرشيف", icon: Archive, permissions: ['VIEW_ARCHIVE'] },
      { href: "/backups", label: "النسخ الاحتياطية", icon: HardDrive, permissions: ['VIEW_BACKUPS'] },
      { href: "/performance", label: "الأداء", icon: Activity, permissions: ['VIEW_PERFORMANCE'] },
      { href: "/users", label: "المستخدمون", icon: UserCog, permissions: ['VIEW_USERS'] },
      { href: "/premium/job-titles", label: "المسميات الوظيفية", icon: Briefcase, permissions: ['MANAGE_JOB_TITLES'] },
      { href: "/settings", label: "الإعدادات", icon: Settings, permissions: ['MANAGE_SETTINGS'] },
    ],
  },
];

export function filterSectionsByPermissions(sections: Section[], permissions: readonly string[]): Section[] {
  const permissionSet = new Set(permissions);
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permissions || item.permissions.length === 0) {
          return true;
        }
        const mode = item.mode ?? "all";
        if (mode === "any") {
          return item.permissions.some((perm) => permissionSet.has(perm));
        }
        return item.permissions.every((perm) => permissionSet.has(perm));
      }),
    }))
    .filter((section) => section.items.length > 0);
}
