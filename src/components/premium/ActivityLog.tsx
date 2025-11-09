"use client";

import { useEffect, useState, memo } from "react";
import { formatDateTime } from "@/lib/date";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// ترجمة العمليات إلى العربية
const getActionInArabic = (action: string) => {
  const translations: Record<string, string> = {
    'WORKER_CREATED': 'إضافة عامل',
    'WORKER_UPDATED': 'تحديث عامل',
    'WORKER_DELETED': 'حذف عامل',
    'LOGIN': 'تسجيل دخول',
    'LOGOUT': 'تسجيل خروج',
    'CREATE_WORKER': 'إضافة عامل',
    'UPDATE_CONTRACT': 'تحديث عقد',
    'DELETE_USER': 'حذف مستخدم',
    'VIEW_DASHBOARD': 'عرض لوحة التحكم',
    'CREATE_USER': 'إضافة مستخدم',
    'UPDATE_USER': 'تحديث مستخدم'
  };
  return translations[action] || action;
};

type Log = { 
  id?: string; 
  action: string; 
  entity?: string; 
  entityId?: string; 
  message?: string; 
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string };
};

function ActivityLog() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = session?.user?.role;
    if (!['ADMIN', 'GENERAL_MANAGER', 'HR_MANAGER'].includes(role || '')) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const controller = new AbortController();
    
    fetch("/api/logs", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { logs: [] }))
      .then((json) => {
        if (mounted) {
          setLogs(json.logs || []);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching logs:', err);
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
  }, [session]);

  const role = session?.user?.role;
  if (!['ADMIN', 'GENERAL_MANAGER', 'HR_MANAGER'].includes(role || '')) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="card-premium rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-900 font-extrabold text-sm sm:text-base">سجل العمليات</div>
        <div className="text-slate-500 text-xs font-semibold">آخر الأنشطة</div>
      </div>

      {loading ? (
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-slate-500 text-sm">لا توجد عمليات حديثة</div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={log.id || i} className="rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 transition p-2 sm:p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm sm:text-base">
                    <span className="truncate block">{getActionInArabic(log.action)}</span>
                  </div>
                  {log.user && (
                    <div className="text-xs text-slate-600 mt-1">
                      بواسطة: <span className="font-medium">{log.user.name}</span>
                    </div>
                  )}
                  {log.entity && (
                    <span className="inline-block mt-1 text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                      {log.entity}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </div>
              </div>
              {log.message && (
                <div className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2">
                  {log.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default memo(ActivityLog);

