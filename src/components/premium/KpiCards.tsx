"use client";

import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "@/components/DashboardDataProvider";

type Kpi = { label: string; value: number; hint?: string; color: string };

function KpiCards() {
  const { data: stats } = useDashboardData();

  const kpis: Kpi[] = useMemo(() => {
    return [
      { label: "العمالة", value: stats.workers, color: "from-indigo-500 to-sky-400" },
      { label: "العملاء", value: stats.clients, color: "from-emerald-500 to-teal-400" },
      { label: "العقود", value: stats.contracts, hint: `اليوم: ${stats.contractsToday.toLocaleString('ar-SA')}` , color: "from-fuchsia-500 to-pink-400" },
      { label: "عقود هذا الشهر", value: stats.contractsMonth, color: "from-amber-500 to-orange-400" },
    ];
  }, [stats]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="kpi card-premium shadow-soft hover:shadow-hover border-gradient p-3 sm:p-4"
        >
          <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white bg-linear-to-tr ${kpi.color} inline-flex min-w-10 sm:min-w-12 justify-center items-center mb-2 sm:mb-3 shadow-lg`}>
            {kpi.hint && <div className="text-xs font-bold text-center">{kpi.hint}</div>}
          </div>
          <div className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {kpi.value.toLocaleString('ar-SA')}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 font-semibold">{kpi.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(KpiCards);

