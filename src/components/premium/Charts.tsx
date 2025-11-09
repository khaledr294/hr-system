"use client";

import { useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type StatusCount = { status: string; _count: { status: number } };
type DashboardData = {
  contractsToday: number;
  contractsMonth: number;
  statusCounts: StatusCount[];
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f472b6"];

function Charts() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    fetch("/api/dashboard", { 
      signal: controller.signal,
      headers: { 'Cache-Control': 'max-age=60' }
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (mounted && json) {
          setData(json);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching chart data:', err);
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

  const statusData = useMemo(() => {
    if (!data?.statusCounts) return [] as { name: string; value: number }[];
    return data.statusCounts.map((s) => ({
      name: s.status === "ACTIVE" ? "نشط" : s.status === "COMPLETED" ? "منتهي" : s.status,
      value: s._count.status,
    }));
  }, [data]);

  const lineData = useMemo(() => {
    // Minimal line series using available numbers
    const today = data?.contractsToday ?? 0;
    const month = data?.contractsMonth ?? 0;
    return [
      { label: "بداية الشهر", العقود: Math.max(0, Math.round(month * 0.2)) },
      { label: "منتصف الشهر", العقود: Math.max(0, Math.round(month * 0.6)) },
      { label: "اليوم", العقود: today },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse dark:bg-slate-800/50" />
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse dark:bg-slate-800/50" />
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse dark:bg-slate-800/50 col-span-1 md:col-span-2 xl:col-span-1" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {/* Line */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base">تطور العقود</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">شهر جاري</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ left: 4, right: 4, bottom: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="label" 
                stroke="#64748b" 
                fontSize={12} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                className="dark:stroke-slate-400"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12, fill: '#64748b' }}
                className="dark:stroke-slate-400"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="العقود" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 3 }} 
                activeDot={{ r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base">حالة العقود</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">حسب النوع</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ left: 4, right: 4, bottom: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12, fill: '#64748b' }}
                className="dark:stroke-slate-400"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12, fill: '#64748b' }}
                className="dark:stroke-slate-400"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((_, i) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50 col-span-1 md:col-span-2 xl:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base">توزيع الحالات</div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">نسبة مئوية</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 90} 
                innerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 50} 
                paddingAngle={2}
              >
                {statusData.map((_, i) => (
                  <Cell key={`p-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(Charts);
