"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportStats {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalWorkers: number;
  availableWorkers: number;
  reservedWorkers: number;
  rentedWorkers: number;
  totalClients: number;
  totalUsers: number;
  revenueByMonth: { month: string; revenue: number }[];
  contractsByMonth: { month: string; count: number }[];
  workersByNationality: { nationality: string; count: number }[];
  contractsByPackage: { package: string; count: number }[];
  topClients: { name: string; contracts: number; revenue: number }[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchReports();
  }, [reportType, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: reportType });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // إعدادات الألوان
  const colors = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    teal: "#14b8a6",
    pink: "#ec4899",
  };

  // بيانات الرسم البياني - الإيرادات الشهرية
  const revenueChartData = {
    labels: stats?.revenueByMonth?.map((item) => item.month) || [],
    datasets: [
      {
        label: "الإيرادات (ريال)",
        data: stats?.revenueByMonth?.map((item) => item.revenue) || [],
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}33`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // بيانات الرسم البياني - العقود الشهرية
  const contractsChartData = {
    labels: stats?.contractsByMonth?.map((item) => item.month) || [],
    datasets: [
      {
        label: "عدد العقود",
        data: stats?.contractsByMonth?.map((item) => item.count) || [],
        backgroundColor: [
          colors.primary,
          colors.success,
          colors.warning,
          colors.danger,
          colors.purple,
          colors.teal,
          colors.pink,
        ],
      },
    ],
  };

  // بيانات الرسم البياني - العمال حسب الجنسية
  const nationalityChartData = {
    labels: stats?.workersByNationality?.map((item) => item.nationality) || [],
    datasets: [
      {
        label: "عدد العمال",
        data: stats?.workersByNationality?.map((item) => item.count) || [],
        backgroundColor: [
          colors.primary,
          colors.success,
          colors.warning,
          colors.danger,
          colors.purple,
          colors.teal,
          colors.pink,
        ],
      },
    ],
  };

  // بيانات الرسم البياني - حالة العمال
  const workerStatusData = {
    labels: ["متاح", "محجوز", "مؤجر"],
    datasets: [
      {
        label: "عدد العمال",
        data: [
          stats?.availableWorkers || 0,
          stats?.reservedWorkers || 0,
          stats?.rentedWorkers || 0,
        ],
        backgroundColor: [colors.success, colors.warning, colors.primary],
      },
    ],
  };

  // إعدادات الرسوم البيانية مع دعم RTL
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        rtl: true,
        labels: {
          font: {
            family: "Cairo, sans-serif",
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        reverse: true,
        ticks: {
          font: {
            family: "Cairo, sans-serif",
          },
        },
      },
      y: {
        ticks: {
          font: {
            family: "Cairo, sans-serif",
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        rtl: true,
        labels: {
          font: {
            family: "Cairo, sans-serif",
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* رأس الصفحة */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={32} />
            التقارير والإحصائيات
          </h1>
          <p className="text-gray-600 mt-1">
            تقارير شاملة عن جميع بيانات النظام
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download size={20} />
            تصدير Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            <Download size={20} />
            تصدير PDF
          </button>
        </div>
      </motion.div>

      {/* فلاتر التقارير */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold">فلاتر التقرير</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
              <option value="yearly">سنوي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </motion.div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي العقود</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalContracts || 0}</p>
              <p className="text-blue-100 text-xs mt-1">
                نشط: {stats?.activeContracts || 0} | منتهي: {stats?.expiredContracts || 0}
              </p>
            </div>
            <FileText size={48} className="opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-green-100 text-xs mt-1">
                الشهر: {stats?.monthlyRevenue?.toLocaleString() || 0} ريال
              </p>
            </div>
            <DollarSign size={48} className="opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي العمال</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalWorkers || 0}</p>
              <p className="text-purple-100 text-xs mt-1">
                متاح: {stats?.availableWorkers || 0} | محجوز: {stats?.reservedWorkers || 0}
              </p>
            </div>
            <Users size={48} className="opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">إجمالي العملاء</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalClients || 0}</p>
              <p className="text-orange-100 text-xs mt-1">
                المستخدمين: {stats?.totalUsers || 0}
              </p>
            </div>
            <TrendingUp size={48} className="opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم الإيرادات الشهرية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            الإيرادات الشهرية
          </h3>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* رسم العقود الشهرية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-green-600" size={20} />
            العقود الشهرية
          </h3>
          <div className="h-80">
            <Bar data={contractsChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* رسم العمال حسب الجنسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="text-purple-600" size={20} />
            توزيع العمال حسب الجنسية
          </h3>
          <div className="h-80">
            <Pie data={nationalityChartData} options={pieChartOptions} />
          </div>
        </motion.div>

        {/* رسم حالة العمال */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="text-orange-600" size={20} />
            حالة العمال
          </h3>
          <div className="h-80">
            <Doughnut data={workerStatusData} options={pieChartOptions} />
          </div>
        </motion.div>
      </div>

      {/* جدول أفضل 10 عملاء */}
      {stats?.topClients && stats.topClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            أفضل 10 عملاء
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عدد العقود
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجمالي الإيرادات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topClients.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.contracts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.revenue.toLocaleString()} ريال
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
