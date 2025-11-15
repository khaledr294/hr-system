"use client";

import { useEffect, useState, memo } from "react";
import { formatDateTime } from "@/lib/date";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  UserPlus, UserX, Edit, FileText, Trash2, 
  Shield, CheckCircle, XCircle, AlertTriangle,
  Users, Calendar, Package
} from "lucide-react";

// ترجمة العمليات إلى العربية مع الأيقونات
const getActionDetails = (action: string) => {
  const details: Record<string, { label: string; icon: typeof UserPlus; color: string }> = {
    // عمليات العمال
    'WORKER_CREATED': { label: 'إضافة عاملة', icon: UserPlus, color: 'text-green-600 bg-green-50' },
    'WORKER_UPDATED': { label: 'تحديث بيانات عاملة', icon: Edit, color: 'text-blue-600 bg-blue-50' },
    'WORKER_DELETED': { label: 'حذف عاملة', icon: UserX, color: 'text-red-600 bg-red-50' },
    'WORKER_STATUS_CHANGED': { label: 'تغيير حالة عاملة', icon: Shield, color: 'text-purple-600 bg-purple-50' },
    
    // عمليات العقود
    'CONTRACT_CREATED': { label: 'إنشاء عقد جديد', icon: FileText, color: 'text-green-600 bg-green-50' },
    'CONTRACT_UPDATED': { label: 'تحديث عقد', icon: Edit, color: 'text-blue-600 bg-blue-50' },
    'CONTRACT_DELETED': { label: 'حذف عقد', icon: Trash2, color: 'text-red-600 bg-red-50' },
    'CONTRACT_EXTENDED': { label: 'تمديد عقد', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
    'CONTRACT_TERMINATED': { label: 'إنهاء عقد', icon: XCircle, color: 'text-orange-600 bg-orange-50' },
    
    // عمليات المستخدمين
    'USER_CREATED': { label: 'إضافة مستخدم', icon: UserPlus, color: 'text-green-600 bg-green-50' },
    'USER_UPDATED': { label: 'تحديث مستخدم', icon: Edit, color: 'text-blue-600 bg-blue-50' },
    'USER_DELETED': { label: 'حذف مستخدم', icon: UserX, color: 'text-red-600 bg-red-50' },
    
    // عمليات العملاء
    'CLIENT_CREATED': { label: 'إضافة عميل', icon: Users, color: 'text-green-600 bg-green-50' },
    'CLIENT_UPDATED': { label: 'تحديث بيانات عميل', icon: Edit, color: 'text-blue-600 bg-blue-50' },
    'CLIENT_DELETED': { label: 'حذف عميل', icon: UserX, color: 'text-red-600 bg-red-50' },
    
    // عمليات الحجز
    'WORKER_RESERVED': { label: 'حجز عاملة', icon: Shield, color: 'text-purple-600 bg-purple-50' },
    'WORKER_RESERVATION_CANCELLED': { label: 'إلغاء حجز عاملة', icon: XCircle, color: 'text-orange-600 bg-orange-50' },
    
    // عمليات النظام
    'UPDATE_SETTINGS': { label: 'تحديث إعدادات النظام', icon: Shield, color: 'text-indigo-600 bg-indigo-50' },
    'BACKUP_CREATED': { label: 'إنشاء نسخة احتياطية', icon: Package, color: 'text-green-600 bg-green-50' },
    'BACKUP_RESTORED': { label: 'استعادة نسخة احتياطية', icon: Package, color: 'text-blue-600 bg-blue-50' },
    
    // عمليات الصلاحيات
    'PERMISSION_DENIED': { label: 'رفض صلاحية', icon: Shield, color: 'text-red-600 bg-red-50' },
    'LOGIN': { label: 'تسجيل دخول', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    'LOGOUT': { label: 'تسجيل خروج', icon: XCircle, color: 'text-slate-600 bg-slate-50' },
  };
  
  return details[action] || { 
    label: action.replace(/_/g, ' '), 
    icon: AlertTriangle, 
    color: 'text-slate-600 bg-slate-50' 
  };
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
          {logs.map((log, i) => {
            const details = getActionDetails(log.action);
            const Icon = details.icon;
            
            return (
              <div key={log.id || i} className="rounded-lg sm:rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all p-2 sm:p-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* الأيقونة */}
                  <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${details.color}`}>
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* العنوان والمستخدم */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {details.label}
                        </div>
                        {log.user && (
                          <div className="text-xs text-slate-600 mt-0.5">
                            بواسطة: <span className="font-semibold text-slate-700">{log.user.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                    
                    {/* الرسالة */}
                    {log.message && !log.message.startsWith('API ') && !log.message.startsWith('Blocked API') && (
                      <div className="text-slate-700 text-xs mt-1.5 bg-slate-50 px-2 py-1 rounded">
                        {log.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default memo(ActivityLog);

