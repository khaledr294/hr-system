"use client";

import { motion } from "framer-motion";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import KpiCards from "./KpiCards";
import Charts from "./Charts";
import ActivityLog from "./ActivityLog";
import { useState } from "react";
import LastUpdated from "@/components/LastUpdated";

export default function PremiumDashboard({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-[1400px] mx-auto p-2 sm:p-3 md:p-6">
        <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 md:gap-4">
          <div dir="rtl" className="glass rounded-2xl md:rounded-3xl shadow-soft overflow-hidden order-1 text-right">
            <Topbar onToggleSidebar={() => setMobileOpen(true)} />
            <div className="px-3 sm:px-4 pb-4 sm:pb-6">
              <div className="mb-4 sm:mb-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient">
                  لوحة تحكم بريميوم
                </motion.h1>
                <div className="text-slate-600 mt-1 text-sm sm:text-base">تجربة حديثة ومذهلة لإدارة عملك</div>
              </div>

              <KpiCards />

              <div className="mt-4 sm:mt-6">
                <LastUpdated className="mb-3" />
                <Charts />
              </div>

              <div className="mt-4 sm:mt-6">
                <ActivityLog />
              </div>

              {children && (
                <div className="mt-4 sm:mt-6 card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4">
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

      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
