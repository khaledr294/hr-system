'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { Archive, Search, RotateCcw, Download, Filter, Calendar, User, FileText, TrendingUp } from 'lucide-react';

interface ArchivedContract {
  id: string;
  originalId: string;
  workerName: string;
  workerCode: number;
  clientName: string;
  startDate: string;
  endDate: string;
  packageType: string;
  packageName?: string;
  totalAmount: number;
  status: string;
  contractNumber?: string;
  archivedAt: string;
  archiveReason: string;
  delayDays?: number;
  penaltyAmount?: number;
}

interface ArchiveStats {
  totalArchived: number;
  expiredContracts: number;
  cancelledContracts: number;
  totalValue: number;
  averageContractValue: number;
  mostCommonReason: string;
}

export default function ArchivePage() {
  const [contracts, setContracts] = useState<ArchivedContract[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterReason, filterDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterReason !== 'all') params.append('reason', filterReason);
      if (filterDate !== 'all') params.append('dateRange', filterDate);

      const [contractsRes, statsRes] = await Promise.all([
        fetch(`/api/archive?${params.toString()}`),
        fetch('/api/archive?statsOnly=true')
      ]);

      if (contractsRes.ok && statsRes.ok) {
        const contractsData = await contractsRes.json();
        const statsData = await statsRes.json();
        setContracts(contractsData.contracts || []);
        setStats(statsData.stats || null);
      }
    } catch (error) {
      console.error('Error fetching archive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (contractId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في استعادة هذا العقد من الأرشيف؟')) return;
    
    setRestoring(contractId);
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          contractId
        })
      });

      if (response.ok) {
        await fetchData();
        alert('تم استعادة العقد بنجاح');
      } else {
        alert('حدث خطأ أثناء استعادة العقد');
      }
    } catch (error) {
      console.error('Error restoring contract:', error);
      alert('حدث خطأ أثناء استعادة العقد');
    } finally {
      setRestoring(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterReason !== 'all') params.append('reason', filterReason);
      if (filterDate !== 'all') params.append('dateRange', filterDate);
      params.append('export', 'true');

      const response = await fetch(`/api/archive?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archive-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.workerCode.toString().includes(searchTerm) ||
      contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Archive className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الأرشيف</h1>
            <p className="text-gray-500">إدارة العقود المؤرشفة</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="secondary">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </div>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">إجمالي المؤرشف</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.totalArchived}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">عقود منتهية</p>
                <p className="text-3xl font-bold text-red-900 mt-1">
                  {stats.expiredContracts}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">عقود ملغاة</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {stats.cancelledContracts}
                </p>
              </div>
              <User className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث بالاسم، الرقم، أو رقم العقد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الأسباب</option>
              <option value="EXPIRED">منتهي</option>
              <option value="CANCELLED">ملغي</option>
              <option value="COMPLETED">مكتمل</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل الفترات</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="year">هذا العام</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="لا توجد عقود مؤرشفة"
          description="لم يتم العثور على عقود مطابقة للبحث والفلاتر المحددة"
        />
      ) : (
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    العامل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    تاريخ الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    القيمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    السبب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    تاريخ الأرشفة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContracts.map((contract, index) => (
                  <motion.tr
                    key={contract.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {contract.workerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          رقم: {contract.workerCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(contract.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(contract.totalAmount)}
                      </div>
                      {contract.penaltyAmount ? (
                        <div className="text-xs text-red-600 font-medium">
                          غرامة: {formatCurrency(contract.penaltyAmount)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        contract.archiveReason === 'EXPIRED'
                          ? 'bg-red-100 text-red-800'
                          : contract.archiveReason === 'CANCELLED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {contract.archiveReason === 'EXPIRED' ? 'منتهي' :
                         contract.archiveReason === 'CANCELLED' ? 'ملغي' : 'مكتمل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(contract.archivedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(contract.id)}
                        disabled={restoring === contract.id}
                      >
                        <div className="flex items-center gap-2">
                          {restoring === contract.id ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>جاري الاستعادة...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              <span>استعادة</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

