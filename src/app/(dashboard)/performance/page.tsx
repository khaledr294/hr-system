'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  activeUsers: number;
  requestsPerMinute: number;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-600 dark:text-green-400';
    if (value < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBg = (value: number) => {
    if (value < 50) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (value < 80) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
          <Activity className="w-8 h-8 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مراقبة الأداء</h1>
          <p className="text-gray-500 dark:text-gray-400">مراقبة أداء النظام في الوقت الفعلي</p>
        </div>
      </motion.div>

      {metrics && (
        <>
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-6 border-2 rounded-lg ${getStatusBg(metrics.cpu)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getStatusColor(metrics.cpu)}`}>المعالج (CPU)</p>
                  <p className={`text-3xl font-bold mt-1 ${getStatusColor(metrics.cpu)}`}>
                    {metrics.cpu}%
                  </p>
                </div>
                <Cpu className={`w-12 h-12 opacity-50 ${getStatusColor(metrics.cpu)}`} />
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.cpu < 50 ? 'bg-green-500' :
                    metrics.cpu < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.cpu}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-6 border-2 rounded-lg ${getStatusBg(metrics.memory)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getStatusColor(metrics.memory)}`}>الذاكرة (RAM)</p>
                  <p className={`text-3xl font-bold mt-1 ${getStatusColor(metrics.memory)}`}>
                    {metrics.memory}%
                  </p>
                </div>
                <HardDrive className={`w-12 h-12 opacity-50 ${getStatusColor(metrics.memory)}`} />
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.memory < 50 ? 'bg-green-500' :
                    metrics.memory < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.memory}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-6 border-2 rounded-lg ${getStatusBg(metrics.disk)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getStatusColor(metrics.disk)}`}>القرص الصلب</p>
                  <p className={`text-3xl font-bold mt-1 ${getStatusColor(metrics.disk)}`}>
                    {metrics.disk}%
                  </p>
                </div>
                <HardDrive className={`w-12 h-12 opacity-50 ${getStatusColor(metrics.disk)}`} />
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.disk < 50 ? 'bg-green-500' :
                    metrics.disk < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.disk}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">زمن الاستجابة</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.responseTime}ms
                  </p>
                </div>
                <Clock className="w-12 h-12 text-gray-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.activeUsers}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-gray-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الطلبات/دقيقة</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {metrics.requestsPerMinute}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-gray-400 opacity-50" />
              </div>
            </motion.div>
          </div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">حالة النظام</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</p>
              <p>• النظام يعمل بكفاءة</p>
              <p>• يتم التحديث كل 5 ثوانٍ تلقائياً</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
