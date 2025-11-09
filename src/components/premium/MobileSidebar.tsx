"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sections } from "./Sidebar";

type DashboardStats = { workers: number; clients: number; contracts: number; marketers: number };

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  // Initialize all sections as open by default
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    sections.forEach(section => {
      initialState[section.title] = true;
    });
    console.log('MobileSidebar - sections:', sections.length, 'initialState:', initialState);
    return initialState;
  });
  
  const toggle = (title: string) => setOpen((p) => ({ ...p, [title]: !p[title] }));

  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    let mounted = true;
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(j => mounted && setStats(j))
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, [isOpen]);

  const counts = useMemo(() => ({
    workers: stats?.workers ?? 0,
    clients: stats?.clients ?? 0,
    contracts: stats?.contracts ?? 0,
    marketers: stats?.marketers ?? 0,
  }), [stats]);

  const getBadgeFor = (href: string) => {
    if (href.startsWith('/workers') && !href.includes('/new')) return counts.workers;
    if (href.startsWith('/clients') && !href.includes('/new')) return counts.clients;
    if (href.startsWith('/contracts') && !href.includes('/new')) return counts.contracts;
    if (href.startsWith('/marketers') && !href.includes('/new')) return counts.marketers;
    return undefined;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        dir="rtl"
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden flex flex-col text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600" />
            <div>
              <div className="text-sm font-bold text-slate-900">شركة ساعد</div>
              <div className="text-xs text-slate-500">القائمة الجانبية</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {sections.map((section) => {
              console.log('Rendering section:', section.title, 'open:', open[section.title], 'items:', section.items.length);
              return (
                <div key={section.title} className="space-y-2">
                  <button
                    onClick={() => toggle(section.title)}
                    className="flex items-center justify-between w-full p-2 text-right rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-sm">{section.title}</span>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        open[section.title] ? 'rotate-0' : '-rotate-90'
                      }`} 
                    />
                  </button>
                  
                  {open[section.title] && (
                    <div className="space-y-1 mr-2">
                      {section.items.map(({ href, label, icon: Icon }) => {
                        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
                        const badge = getBadgeFor(href);
                        
                        return (
                          <Link key={href} href={href} onClick={onClose}>
                            <motion.div 
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                active 
                                  ? "bg-indigo-50 border border-indigo-200 text-indigo-700" 
                                  : "hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                                <span className={`text-sm font-medium ${active ? 'text-indigo-700' : 'text-slate-600'}`}>
                                  {label}
                                </span>
                              </div>
                              {typeof badge === 'number' && badge > 0 && (
                                <span className="text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded-full min-w-[20px] text-center">
                                  {badge.toLocaleString('ar-SA')}
                                </span>
                              )}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-xs text-center text-slate-400">
            شركة ساعد للموارد البشرية
          </div>
        </div>
      </motion.aside>
    </>
  );
}
