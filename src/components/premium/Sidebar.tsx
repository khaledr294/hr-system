"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { baseSections, filterSectionsByPermissions } from "./navigation-data";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Initialize all sections as open by default
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    baseSections.forEach(section => {
      initialState[section.title] = true;
    });
    return initialState;
  });
  const toggle = (title: string) => {
    setOpen((p) => ({ ...p, [title]: !p[title] }));
  };

  const filteredSections = useMemo(() => {
    const permissions = (session?.user?.permissions ?? []) as string[];
    return filterSectionsByPermissions(baseSections, permissions);
  }, [session?.user?.permissions]);

  return (
  <aside dir="rtl" className="hidden lg:flex flex-col gap-2 p-3 w-64 text-right">
      <Link href="/settings" className="glass rounded-3xl shadow-soft p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-2xl gradient-brand ring-soft" />
        <div>
          <div className="text-sm font-bold text-slate-900">شركة ساعد للإستقدام</div>
          <div className="text-xs text-slate-500">لوحة التحكم</div>
        </div>
      </Link>

      <nav className="glass rounded-3xl shadow-soft p-2">
        <div className="space-y-2">
          {filteredSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-200">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle(section.title);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] tracking-wide font-extrabold text-slate-600 uppercase"
              >
                <span>{section.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open[section.title] ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {open[section.title] && (
                <div className="px-2 pb-2">
                  {section.items.map(({ href, label, icon: Icon }) => {
                    const active = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
                    return (
                      <Link key={href} href={href} prefetch={true}>
                        <motion.div 
                          whileHover={{ scale: 1.01 }} 
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ${active ? "bg-white shadow-soft ring-1 ring-indigo-100" : "hover:bg-white/70"}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

