"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutGrid, Users, Wallet, FileText, Settings, Home, 
  UserCog, Briefcase, FolderKanban, ChevronDown,
  Archive, HardDrive, Search, Activity
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
export type Section = { title: string; items: NavItem[] };

export const sections: Section[] = [
  {
    title: "عام",
    items: [
      { href: "/dashboard", label: "الرئيسية", icon: Home },
    ],
  },
  {
    title: "العمليات",
    items: [
      { href: "/workers", label: "العمالة", icon: Users },
      { href: "/workers/new", label: "إضافة عاملة", icon: Users },
      { href: "/workers/reserve", label: "حجز العاملات", icon: Users },
      { href: "/clients", label: "العملاء", icon: LayoutGrid },
      { href: "/clients/new", label: "إضافة عميل", icon: LayoutGrid },
      { href: "/contracts", label: "العقود", icon: FileText },
      { href: "/contracts/templates", label: "قوالب العقود", icon: FolderKanban },
      { href: "/contracts/packages", label: "الباقات والخدمات", icon: Briefcase },
    ],
  },
  {
    title: "المالية",
    items: [
      { href: "/payroll", label: "الرواتب", icon: Wallet },
      { href: "/nationality-salary", label: "الجنسيات والرواتب", icon: Wallet },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/reports", label: "التقارير", icon: FileText },
      { href: "/search", label: "البحث المتقدم", icon: Search },
      { href: "/archive", label: "الأرشيف", icon: Archive },
      { href: "/backups", label: "النسخ الاحتياطية", icon: HardDrive },
      { href: "/performance", label: "الأداء", icon: Activity },
      { href: "/users", label: "المستخدمون", icon: UserCog },
  { href: "/premium/job-titles", label: "المسميات الوظيفية", icon: Briefcase },
      { href: "/settings", label: "الإعدادات", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  // Initialize all sections as open by default
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach(section => {
      initialState[section.title] = true;
    });
    return initialState;
  });
  const toggle = (title: string) => setOpen((p) => ({ ...p, [title]: !p[title] }));

  return (
  <aside dir="rtl" className="hidden lg:flex flex-col gap-2 p-3 w-64 text-right">
      <div className="glass rounded-3xl shadow-soft p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-brand ring-soft" />
        <div>
          <div className="text-sm font-bold text-slate-900">شركة ساعد</div>
          <div className="text-xs text-slate-500">لوحة التحكم</div>
        </div>
      </div>

      <nav className="glass rounded-3xl shadow-soft p-2">
        <Accordion>
          {sections.map((section) => (
            <AccordionItem key={section.title}>
              <AccordionTrigger onClick={() => toggle(section.title)}>
                <span>{section.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open[section.title] ? 'rotate-0' : '-rotate-90'}`} />
              </AccordionTrigger>
              {open[section.title] && (
                <AccordionContent>
                  {section.items.map(({ href, label, icon: Icon }) => {
                    const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
                    return (
                      <Link key={href} href={href}>
                        <motion.div whileHover={{ scale: 1.01 }} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ${active ? "bg-white shadow-soft ring-1 ring-indigo-100" : "hover:bg-white/70"}`}>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </aside>
  );
}

