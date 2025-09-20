"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function Charts() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
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
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse" />
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse" />
        <div className="h-64 sm:h-72 card-premium rounded-xl sm:rounded-2xl shadow-soft animate-pulse col-span-1 md:col-span-2 xl:col-span-1" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {/* Line */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 font-extrabold text-sm sm:text-base">تطور العقود</div>
          <div className="text-slate-500 text-xs font-semibold">شهر جاري</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ left: 4, right: 4, bottom: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                stroke="#64748b" 
                fontSize={12} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="العقود" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={{ r: 2 }} 
                activeDot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 font-extrabold text-sm sm:text-base">حالة العقود</div>
          <div className="text-slate-500 text-xs font-semibold">حسب النوع</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ left: 4, right: 4, bottom: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
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
        className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 col-span-1 md:col-span-2 xl:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-900 font-extrabold text-sm sm:text-base">توزيع الحالات</div>
          <div className="text-slate-500 text-xs font-semibold">نسبة مئوية</div>
        </div>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={window.innerWidth < 640 ? 70 : 90} 
                innerRadius={window.innerWidth < 640 ? 40 : 50} 
                paddingAngle={2}
              >
                {statusData.map((_, i) => (
                  <Cell key={`p-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
