"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [marketersMonth, setMarketersMonth] = useState(new Date().toISOString().slice(0, 7));
  const [marketersData, setMarketersData] = useState<{
    marketers: Array<{ marketerName: string; contractsCount: number; totalRevenue: number; suggestedBonus: number }>;
    totalContracts: number;
    totalRevenue: number;
  } | null>(null);

  // التحقق من الصلاحيات
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const userRole = session.user.role;
    if (userRole !== 'HR_MANAGER' && userRole !== 'GENERAL_MANAGER') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "excel" | "pdf") => {
    if (!stats) {
      alert("لا توجد بيانات لتصديرها حالياً.");
      return;
    }

    setExporting(format);
    const timestamp = new Date().toISOString().split("T")[0];

    try {
      if (format === "excel") {
        const ExcelJS = await import("exceljs");
        const workbook = new ExcelJS.Workbook();

        const summarySheet = workbook.addWorksheet("Summary");
        summarySheet.columns = [
          { header: "Metric", key: "metric", width: 32 },
          { header: "Value", key: "value", width: 18 },
        ];
        summarySheet.addRows([
          { metric: "Total Contracts", value: stats.totalContracts },
          { metric: "Active Contracts", value: stats.activeContracts },
          { metric: "Expired Contracts", value: stats.expiredContracts },
          { metric: "Total Revenue", value: stats.totalRevenue },
          { metric: "Monthly Revenue", value: stats.monthlyRevenue },
          { metric: "Total Workers", value: stats.totalWorkers },
          { metric: "Available Workers", value: stats.availableWorkers },
          { metric: "Reserved Workers", value: stats.reservedWorkers },
          { metric: "Rented Workers", value: stats.rentedWorkers },
          { metric: "Total Clients", value: stats.totalClients },
          { metric: "Total Users", value: stats.totalUsers },
        ]);

        const revenueSheet = workbook.addWorksheet("RevenueByMonth");
        revenueSheet.columns = [
          { header: "Month", key: "month", width: 20 },
          { header: "Revenue", key: "revenue", width: 18 },
        ];
        revenueSheet.addRows(stats.revenueByMonth);

        const contractsSheet = workbook.addWorksheet("ContractsByMonth");
        contractsSheet.columns = [
          { header: "Month", key: "month", width: 20 },
          { header: "Contracts", key: "count", width: 18 },
        ];
        contractsSheet.addRows(stats.contractsByMonth);

        const nationalitySheet = workbook.addWorksheet("WorkersByNationality");
        nationalitySheet.columns = [
          { header: "Nationality", key: "nationality", width: 24 },
          { header: "Workers", key: "count", width: 16 },
        ];
        nationalitySheet.addRows(stats.workersByNationality);

        const packagesSheet = workbook.addWorksheet("ContractsByPackage");
        packagesSheet.columns = [
          { header: "Package", key: "package", width: 28 },
          { header: "Contracts", key: "count", width: 16 },
        ];
        packagesSheet.addRows(stats.contractsByPackage);

        const clientsSheet = workbook.addWorksheet("TopClients");
        clientsSheet.columns = [
          { header: "Client", key: "name", width: 26 },
          { header: "Contracts", key: "contracts", width: 14 },
          { header: "Revenue", key: "revenue", width: 18 },
        ];
        clientsSheet.addRows(stats.topClients);

        const buffer = await workbook.xlsx.writeBuffer();
        downloadBlob(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `reports-${timestamp}.xlsx`
        );
      } else {
        const { default: jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("HR Reports Summary", 14, 20);

        doc.setFontSize(11);
        const summaryLines = [
          `Total Contracts: ${stats.totalContracts} (Active: ${stats.activeContracts}, Expired: ${stats.expiredContracts})`,
          `Total Revenue: ${stats.totalRevenue.toLocaleString()} SAR`,
          `Monthly Revenue: ${stats.monthlyRevenue.toLocaleString()} SAR`,
          `Total Workers: ${stats.totalWorkers} | Available: ${stats.availableWorkers} | Reserved: ${stats.reservedWorkers} | Rented: ${stats.rentedWorkers}`,
          `Total Clients: ${stats.totalClients}`,
          `Total Users: ${stats.totalUsers}`,
        ];

        let yPosition = 40;
        summaryLines.forEach((line) => {
          doc.text(line, 14, yPosition);
          yPosition += 14;
        });

        if (stats.revenueByMonth.length) {
          doc.text("Revenue By Month:", 14, yPosition + 10);
          yPosition += 24;
          stats.revenueByMonth.slice(0, 6).forEach((item) => {
            doc.text(`${item.month}: ${item.revenue.toLocaleString()} SAR`, 18, yPosition);
            yPosition += 12;
          });
        }

        if (stats.topClients.length) {
          doc.text("Top Clients:", 14, yPosition + 10);
          yPosition += 24;
          stats.topClients.slice(0, 5).forEach((client) => {
            doc.text(
              `${client.name} — Contracts: ${client.contracts}, Revenue: ${client.revenue.toLocaleString()} SAR`,
              18,
              yPosition
            );
            yPosition += 12;
          });
        }

        doc.save(`reports-${timestamp}.pdf`);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("حدث خطأ أثناء التصدير. حاول مرة أخرى.");
    } finally {
      setExporting(null);
    }
  };

  const fetchMarketersData = async (month: string) => {
    try {
      const response = await fetch(`/api/reports/marketers?month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setMarketersData(data);
      }
    } catch (error) {
      console.error("Error fetching marketers data:", error);
    }
  };

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

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchMarketersData(marketersMonth);
  }, [marketersMonth]);

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
          <button
            onClick={() => handleExport("excel")}
            disabled={!stats || exporting !== null}
            aria-busy={exporting === "excel"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting === "excel" ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Download size={20} />
            )}
            {exporting === "excel" ? "جاري التصدير..." : "تصدير Excel"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!stats || exporting !== null}
            aria-busy={exporting === "pdf"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting === "pdf" ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Download size={20} />
            )}
            {exporting === "pdf" ? "جاري التصدير..." : "تصدير PDF"}
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

      {/* تقرير عقود المسوقين */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-linear-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-purple-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-purple-600" size={24} />
          <h2 className="text-lg font-semibold text-purple-900">تقرير عقود المسوقين - احتساب البونص الشهري</h2>
        </div>
        
        <p className="text-sm text-purple-700 mb-4">
          تقرير شهري يعرض عدد العقود لكل مسوق مع البونص المقترح (50 ريال لكل عقد)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الشهر
            </label>
            <input
              type="month"
              value={marketersMonth}
              onChange={(e) => setMarketersMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`/api/reports/marketers?month=${marketersMonth}&format=excel`);
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `تقرير_المسوقين_${marketersMonth}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } else {
                    alert('فشل تحميل التقرير');
                  }
                } catch (error) {
                  console.error('Error downloading report:', error);
                  alert('حدث خطأ أثناء تحميل التقرير');
                }
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Download size={20} />
              تحميل تقرير Excel
            </button>
          </div>
        </div>

        {/* Marketers Chart */}
        {marketersData && marketersData.marketers.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold mb-4 text-purple-900 flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={20} />
              عدد العقود لكل مسوق - {marketersMonth}
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: marketersData.marketers.map(m => m.marketerName),
                  datasets: [
                    {
                      label: 'عدد العقود',
                      data: marketersData.marketers.map(m => m.contractsCount),
                      backgroundColor: [
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                      ],
                      borderColor: [
                        'rgb(147, 51, 234)',
                        'rgb(79, 70, 229)',
                        'rgb(59, 130, 246)',
                        'rgb(14, 165, 233)',
                        'rgb(6, 182, 212)',
                        'rgb(20, 184, 166)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const marketer = marketersData.marketers[context.dataIndex];
                          return [
                            `عدد العقود: ${marketer.contractsCount}`,
                            `الإيرادات: ${marketer.totalRevenue.toLocaleString()} ريال`,
                            `البونص المقترح: ${marketer.suggestedBonus.toLocaleString()} ريال`,
                          ];
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">إجمالي العقود</p>
                <p className="text-2xl font-bold text-purple-900">{marketersData.totalContracts}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-indigo-900">{marketersData.totalRevenue.toLocaleString()} ريال</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">إجمالي البونص</p>
                <p className="text-2xl font-bold text-blue-900">{marketersData.marketers.reduce((sum, m) => sum + m.suggestedBonus, 0).toLocaleString()} ريال</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"
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
          className="bg-linear-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"
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
          className="bg-linear-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"
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
          className="bg-linear-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white"
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
