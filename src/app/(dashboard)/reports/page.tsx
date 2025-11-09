'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Users, FileText, Download } from 'lucide-react';

interface ReportStats {
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalWorkers: number;
  availableWorkers: number;
  totalClients: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');

  useEffect(() => {
    fetchStats();
  }, [reportType]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?type=${reportType}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/reports?type=${reportType}&export=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="جاري تحميل التقارير..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التقارير والإحصائيات</h1>
            <p className="text-gray-500 dark:text-gray-400">تقارير مفصلة عن أداء النظام</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('pdf')} variant="primary" size="sm">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </div>
          </Button>
          <Button onClick={() => handleExport('excel')} variant="secondary" size="sm">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </div>
          </Button>
        </div>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => setReportType('daily')}
            variant={reportType === 'daily' ? 'primary' : 'secondary'}
            size="sm"
          >
            يومي
          </Button>
          <Button 
            onClick={() => setReportType('weekly')}
            variant={reportType === 'weekly' ? 'primary' : 'secondary'}
            size="sm"
          >
            أسبوعي
          </Button>
          <Button 
            onClick={() => setReportType('monthly')}
            variant={reportType === 'monthly' ? 'primary' : 'secondary'}
            size="sm"
          >
            شهري
          </Button>
          <Button 
            onClick={() => setReportType('yearly')}
            variant={reportType === 'yearly' ? 'primary' : 'secondary'}
            size="sm"
          >
            سنوي
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">إجمالي العقود</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {stats.totalContracts}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                  نشط: {stats.activeContracts}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                  شهري: {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">العمال</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {stats.totalWorkers}
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                  متاح: {stats.availableWorkers}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">العملاء</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {stats.totalClients}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-500 opacity-50" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-8 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الرسوم البيانية</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">الرسوم البيانية قيد التطوير...</p>
        </div>
      </motion.div>
    </div>
  );
}
