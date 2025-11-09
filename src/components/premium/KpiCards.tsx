"use client";

import { useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";

type DashboardStats = {
  workers: number;
  clients: number;
  contracts: number;
  marketers: number;
  contractsToday: number;
  contractsMonth: number;
};

type Kpi = { label: string; value: number; hint?: string; color: string };

function KpiCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    fetch("/api/dashboard", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (mounted && json) {
          setStats(json);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching dashboard stats:', err);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const kpis: Kpi[] = useMemo(() => {
    return [
      { label: "العمالة", value: stats?.workers ?? 0, color: "from-indigo-500 to-sky-400" },
      { label: "العملاء", value: stats?.clients ?? 0, color: "from-emerald-500 to-teal-400" },
      { label: "العقود", value: stats?.contracts ?? 0, hint: `اليوم: ${(stats?.contractsToday ?? 0).toLocaleString('ar-SA')}` , color: "from-fuchsia-500 to-pink-400" },
      { label: "عقود هذا الشهر", value: stats?.contractsMonth ?? 0, color: "from-amber-500 to-orange-400" },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 sm:h-28 card-premium shadow-soft rounded-xl sm:rounded-2xl animate-pulse dark:bg-slate-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="kpi card-premium shadow-soft hover:shadow-hover border-gradient p-3 sm:p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50"
        >
          <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white bg-gradient-to-tr ${kpi.color} inline-flex min-w-[2.5rem] sm:min-w-[3rem] justify-center items-center mb-2 sm:mb-3 shadow-lg`}>
            {kpi.hint && <div className="text-xs font-bold text-center">{kpi.hint}</div>}
          </div>
          <div className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {kpi.value.toLocaleString('ar-SA')}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">{kpi.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(KpiCards);
