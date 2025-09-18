"use client";

import { motion } from "framer-motion";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import KpiCards from "./KpiCards";
import Charts from "./Charts";
import ActivityLog from "./ActivityLog";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LastUpdated from "@/components/LastUpdated";

export default function PremiumDashboard({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto p-3 md:p-6">
        <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div dir="rtl" className="glass rounded-3xl shadow-soft overflow-hidden order-1 text-right">
            <Topbar onToggleSidebar={() => setMobileOpen(true)} />
            <div className="px-4 pb-6">
              <div className="mb-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-extrabold text-gradient">
                  لوحة تحكم بريميوم
                </motion.h1>
                <div className="text-slate-600 mt-1">تجربة حديثة ومذهلة لإدارة عملك</div>
              </div>

              <KpiCards />

              <div className="mt-6">
                <LastUpdated className="mb-3" />
                <Charts />
              </div>

              <div className="mt-6">
                <ActivityLog />
              </div>

              {children && (
                <div className="mt-6 card-premium rounded-2xl shadow-soft p-4">
                  {children}
                </div>
              )}
            </div>
          </div>

          <div dir="rtl" className="order-2 hidden lg:block text-right">
            <Sidebar />
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50" onClick={() => setMobileOpen(false)} />}
        {mobileOpen && (
          <SheetContent side="right" className="z-50">
            <SheetHeader>
              <SheetTitle>القائمة</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
