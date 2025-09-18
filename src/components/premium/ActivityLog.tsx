"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/date";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

type Log = { id?: string; action: string; entity?: string; entityId?: string; message?: string; createdAt: string };

export default function ActivityLog() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = session?.user?.role;
    if (role !== 'GENERAL_MANAGER' && role !== 'HR') {
      setLoading(false);
      return;
    }
    let mounted = true;
    fetch("/api/logs")
      .then((r) => (r.ok ? r.json() : []))
      .then((json) => mounted && setLogs(json))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [session]);

  const role = session?.user?.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'HR') return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium rounded-2xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-900 font-extrabold">سجل العمليات</div>
        <div className="text-slate-500 text-xs font-semibold">آخر الأنشطة</div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-slate-500 text-sm">لا توجد عمليات حديثة</div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {logs.map((log, i) => (
            <div key={log.id || i} className="rounded-xl bg-slate-50 hover:bg-slate-100 transition p-3">
              <div className="flex items-start justify-between">
                <div className="font-semibold text-slate-800">
                  {log.action}
                  {log.entity && <span className="ml-2 text-xs bg-slate-900 text-white px-2 py-1 rounded">{log.entity}</span>}
                </div>
                <div className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</div>
              </div>
              {log.message && <div className="text-slate-600 text-sm mt-1">{log.message}</div>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
