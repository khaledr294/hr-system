'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, TrendingUp, RefreshCw, Zap, HardDrive } from 'lucide-react';

interface PerformanceData {
  cache: {
    totalKeys: number;
    hitRate: number;
    memoryUsage: number;
  };
  database: {
    connectionCount: number;
    slowQueries: number;
    avgResponseTime: number;
  };
  timestamp: string;
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/performance');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في مسح الكاش؟')) return;
    
    setClearing(true);
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache' })
      });

      if (response.ok) {
        await fetchMetrics();
        alert('تم مسح الكاش بنجاح');
      } else {
        alert('حدث خطأ أثناء مسح الكاش');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('حدث خطأ أثناء مسح الكاش');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-center">
          <Activity className="w-20 h-20 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">صفحة مراقبة الأداء</h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            هذه الصفحة تعرض معلومات حية عن أداء النظام، بما في ذلك:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right max-w-2xl mx-auto">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-bold text-indigo-900 mb-2">📊 إحصائيات الكاش</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• عدد العناصر المخزنة</li>
                <li>• معدل نجاح الكاش</li>
                <li>• استخدام الذاكرة</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-bold text-indigo-900 mb-2">🗄️ صحة قاعدة البيانات</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• عدد الاتصالات النشطة</li>
                <li>• الاستعلامات البطيئة</li>
                <li>• متوسط زمن الاستجابة</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>ملاحظة:</strong> إذا لم تظهر البيانات، قد يكون هناك مشكلة في الاتصال بنظام الكاش أو قاعدة البيانات.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          آخر تحديث: {new Date(data.timestamp).toLocaleString('ar-SA')}
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMetrics} variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={handleClearCache} variant="primary" size="sm" disabled={clearing}>
            {clearing ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4 ml-2" />}
            مسح الكاش
          </Button>
        </div>
      </div>

      {/* Cache Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border-2 border-indigo-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-indigo-600">الكاش</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.cache.totalKeys}
              </p>
              <p className="text-xs text-gray-500 mt-1">إجمالي المفاتيح</p>
            </div>
            <HardDrive className="w-12 h-12 text-indigo-500 opacity-50" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>معدل النجاح</span>
              <span className="font-bold">{data.cache.hitRate}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${data.cache.hitRate}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white border-2 border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-600">استخدام الذاكرة</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(data.cache.memoryUsage / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Database className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border-2 border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600">زمن الاستجابة</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.database.avgResponseTime}ms
              </p>
            </div>
            <Clock className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Database Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-white border-2 border-gray-200 rounded-lg"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          قاعدة البيانات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">الاتصالات النشطة</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.database.connectionCount}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">الاستعلامات البطيئة</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data.database.slowQueries}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-indigo-900 mb-2">نصائح لتحسين الأداء</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• معدل نجاح الكاش الجيد يجب أن يكون أعلى من 80%</li>
              <li>• زمن الاستجابة المثالي أقل من 200ms</li>
              <li>• يُنصح بمسح الكاش بشكل دوري لتحسين الأداء</li>
              <li>• راقب الاستعلامات البطيئة وقم بتحسينها</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
