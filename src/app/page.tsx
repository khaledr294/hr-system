"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type StatusCount = { status: string; _count: { status: number } };

export default function Home() {
  type DashboardStats = {
    workers: number;
    clients: number;
    contracts: number;
    marketers: number;
    contractsToday: number;
    contractsMonth: number;
    statusCounts: { status: string; _count: { status: number } }[];
  };
  type Log = { id: string; action: string; entity?: string; entityId?: string; message?: string; createdAt: string };
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'HR') {
      setLogsLoading(true);
      fetch('/api/logs')
        .then(res => res.ok ? res.json() : [])
        .then(setLogs)
        .finally(() => setLogsLoading(false));
    }
  }, [session]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header عصري مع تأثيرات بصرية */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 mb-6 animate-scale-in">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3 text-gradient">
            لوحة القيادة التنفيذية
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            نظرة شاملة على أداء شركة ساعد للاستقدام
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-spin mb-4">
              <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <div className="text-slate-700 font-semibold text-xl">جاري تحميل البيانات...</div>
          </div>
        ) : stats ? (
          <>
            {/* البطاقات الرئيسية بتصميم عصري */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
              <StatCard color="blue" label="العمالة" value={stats.workers} icon="users" />
              <StatCard color="green" label="العملاء" value={stats.clients} icon="userGroup" />
              <StatCard color="purple" label="العقود" value={stats.contracts} icon="document" />
              <StatCard color="orange" label="المسوقون" value={stats.marketers} icon="briefcase" />
            </div>

            {/* بطاقات الأداء اليومي والشهري */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in">
              <StatCard color="indigo" label="عقود اليوم" value={stats.contractsToday} icon="calendar" trend="+12%" />
              <StatCard color="cyan" label="عقود الشهر" value={stats.contractsMonth} icon="chartBar" trend="+8%" />
              
              {/* بطاقة توزيع العقود المحسنة */}
              <div className="card-modern rounded-2xl p-8 flex flex-col items-center interactive-hover animate-scale-in">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">توزيع العقود</h3>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {stats.statusCounts.map((s: StatusCount, index: number) => (
                    <div 
                      key={s.status} 
                      className={`px-5 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in`}
                      style={{
                        backgroundColor: s.status === 'ACTIVE' ? '#3b82f6' : s.status === 'COMPLETED' ? '#10b981' : '#ef4444',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{s._count.status}</div>
                        <div className="text-xs opacity-90">
                          {s.status === 'ACTIVE' ? 'نشط' : s.status === 'COMPLETED' ? 'منتهي' : 'ملغي'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* سجل العمليات المحسن */}
            {(session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'HR') && (
              <div className="mt-16 animate-fade-in">
                <div className="card-modern rounded-2xl p-8 interactive-hover">
                  <div className="flex items-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">سجل العمليات الحديثة</h2>
                      <p className="text-slate-700 font-bold">آخر الأنشطة والتحديثات في النظام</p>
                    </div>
                  </div>
                  
                  {logsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-spin mb-4">
                        <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent"></div>
                      </div>
                      <div className="text-slate-900 font-bold">جاري تحميل السجل...</div>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-slate-900 font-bold">لا توجد عمليات حديثة</div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {logs.map((log, i) => (
                        <div 
                          key={log.id || i} 
                          className="bg-slate-100 p-5 hover:bg-slate-200 transition-all duration-200 border-2 border-slate-300"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="w-2 h-2 bg-slate-900 mr-2"></div>
                                <span className="text-slate-900 font-bold text-sm">{log.action}</span>
                                {log.entity && (
                                  <span className="bg-slate-900 text-white px-2 py-1 text-xs font-bold mr-2 border-2 border-slate-700">
                                    {log.entity}
                                  </span>
                                )}
                              </div>
                              {log.message && (
                                <div className="text-slate-800 text-sm mb-2 pr-4 font-bold">{log.message}</div>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 font-bold">
                              {new Date(log.createdAt).toLocaleString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-red-800 font-bold text-xl mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>تعذر تحميل البيانات</div>
            <div className="text-red-700 text-sm font-medium" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  color, 
  label, 
  value, 
  icon, 
  trend 
}: { 
  color: string; 
  label: string; 
  value: number; 
  icon?: string; 
  trend?: string; 
}) {
  const getIcon = (iconName?: string) => {
    const iconProps = "w-6 h-6 text-slate-900";
    switch(iconName) {
      case 'users':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'userGroup':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'document':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'briefcase':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" /></svg>;
      case 'calendar':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'chartBar':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      default:
        return <div className="w-6 h-6 bg-slate-900"></div>;
    }
  };

  return (
    <div className={`bg-${color}-600 text-white p-6 border-2 border-slate-900 transition-all duration-200 hover:bg-${color}-700`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-white border-2 border-slate-900 flex items-center justify-center`}>
          <div className="text-slate-900">
            {getIcon(icon)}
          </div>
        </div>
        {trend && (
          <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold border-2 border-white">
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString('ar-SA')}</div>
        <div className="text-sm font-bold">{label}</div>
      </div>
    </div>
  );
}
