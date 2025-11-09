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
import { DashboardDataProvider, type DashboardStats } from "@/components/DashboardDataProvider";

export default function PremiumDashboard({ 
  children, 
  data 
}: { 
  children?: React.ReactNode;
  data: DashboardStats;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto p-2 sm:p-3 md:p-6">
        <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 md:gap-4">
          <div dir="rtl" className="glass rounded-2xl md:rounded-3xl shadow-soft overflow-hidden order-1 text-right dark:bg-slate-800/50 dark:backdrop-blur-xl">
            <Topbar onToggleSidebar={() => setMobileOpen(true)} />
            <div className="px-3 sm:px-4 pb-4 sm:pb-6">
              <div className="mb-4 sm:mb-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400">
                  لوحة تحكم بريميوم
                </motion.h1>
                <div className="text-slate-600 dark:text-slate-300 mt-1 text-sm sm:text-base">تجربة حديثة ومذهلة لإدارة عملك</div>
              </div>

              <DashboardDataProvider data={data}>
                <KpiCards />

                <div className="mt-4 sm:mt-6">
                  <LastUpdated className="mb-3" />
                  <Charts />
                </div>
              </DashboardDataProvider>

              <div className="mt-4 sm:mt-6">
                <ActivityLog />
              </div>

              {children && (
                <div className="mt-4 sm:mt-6 card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50">
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
