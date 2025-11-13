"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as ExcelJS from 'exceljs';
import { 
  DollarSign, 
  Check, 
  X, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Wallet,
  Download,
  Printer,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

type Worker = {
  id: string;
  code: number;
  name: string;
  nationality: string;
  status: string;
  salary?: number;
  nationalitySalary?: {
    salary: number;
  };
};

type PayrollData = {
  worker: Worker;
  baseSalary: number;
  workingDays: number;
  deductions: number;
  bonuses: number;
  totalSalary: number;
};

type PayrollDelivery = {
  workerId: string;
  workerCode: number;
  workerName: string;
  nationality: string;
  totalSalary: number;
  deliveredAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  deliveryStatus: 'pending' | 'partial' | 'completed';
  deliveryDate?: string;
  notes?: string;
};

export default function PayrollDeliveryPage() {
  const [deliveries, setDeliveries] = useState<Map<string, PayrollDelivery>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");

  const calculateWorkingDaysForWorker = useCallback(async (workerId: string, monthYear: string): Promise<number> => {
    try {
      const response = await fetch(`/api/contracts?workerId=${workerId}&month=${monthYear}`);
      
      if (!response.ok) {
        return 0;
      }
      
      const contracts = await response.json();
      
      if (!contracts || contracts.length === 0) {
        return 0;
      }

      const [year, month] = monthYear.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      let totalWorkingDays = 0;
      
      contracts.forEach((contract: { startDate: string; endDate: string }) => {
        const contractStart = new Date(contract.startDate);
        const contractEnd = new Date(contract.endDate);
        
        const periodStart = contractStart > monthStart ? contractStart : monthStart;
        const periodEnd = contractEnd < monthEnd ? contractEnd : monthEnd;

        if (periodStart <= periodEnd) {
          const startOfDay = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
          const endOfDay = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
          const timeDifference = endOfDay.getTime() - startOfDay.getTime();
          const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24)) + 1; // +1 لتضمين اليوم الأخير
          totalWorkingDays += daysDifference;
        }
      });
      
      const daysInMonth = monthEnd.getDate();
      return Math.min(totalWorkingDays, daysInMonth);
      
    } catch (error) {
      console.error('Error calculating working days:', error);
      return 0;
    }
  }, []);

  const loadPayrollData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📞 جاري تحميل بيانات الرواتب للشهر:', selectedMonth);
      
      // Load workers
      const response = await fetch('/api/workers');
      
      if (response.ok) {
        const workers = await response.json();
        console.log('👥 تم تحميل العاملين:', workers.length);
        
        // Calculate payroll for all workers
        const payrollCalculations = await Promise.all(workers.map(async (worker: Worker) => {
          const baseSalary = worker.nationalitySalary?.salary || worker.salary || 0;
          
          // Calculate working days from contracts
          const workingDays = await calculateWorkingDaysForWorker(worker.id, selectedMonth);
          
          const deductions = 0;
          const bonuses = 0;
          
          // Calculate total salary
          const dailySalary = baseSalary / 30;
          const totalSalary = Math.round((dailySalary * workingDays) + bonuses - deductions);

          return {
            worker,
            baseSalary,
            workingDays,
            deductions,
            bonuses,
            totalSalary
          };
        }));
        
        console.log('✅ تم حساب الرواتب:', payrollCalculations.length);
        
        // Initialize delivery data
        const initialDeliveries = new Map<string, PayrollDelivery>();
        payrollCalculations.forEach((item: PayrollData) => {
          if (item.totalSalary > 0) {
            initialDeliveries.set(item.worker.id, {
              workerId: item.worker.id,
              workerCode: item.worker.code,
              workerName: item.worker.name,
              nationality: item.worker.nationality,
              totalSalary: item.totalSalary,
              deliveredAmount: 0,
              advanceAmount: 0,
              remainingAmount: item.totalSalary,
              deliveryStatus: 'pending',
            });
          }
        });
        setDeliveries(initialDeliveries);
        console.log('💰 تم تهيئة بيانات التسليم:', initialDeliveries.size);
      }
    } catch (error) {
      console.error('Error loading payroll data:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateWorkingDaysForWorker, selectedMonth]);

  useEffect(() => {
    void loadPayrollData();
  }, [loadPayrollData]);

  const handleFullDelivery = (workerId: string) => {
    setDeliveries(prev => {
      const newDeliveries = new Map(prev);
      const delivery = newDeliveries.get(workerId);
      if (delivery) {
        newDeliveries.set(workerId, {
          ...delivery,
          deliveredAmount: delivery.totalSalary,
          remainingAmount: 0,
          deliveryStatus: 'completed',
          deliveryDate: new Date().toISOString(),
        });
      }
      return newDeliveries;
    });
  };

  const handlePartialDelivery = (workerId: string, amount: number) => {
    setDeliveries(prev => {
      const newDeliveries = new Map(prev);
      const delivery = newDeliveries.get(workerId);
      if (delivery) {
        const delivered = Math.min(amount, delivery.totalSalary - delivery.advanceAmount);
        const remaining = delivery.totalSalary - delivered - delivery.advanceAmount;
        newDeliveries.set(workerId, {
          ...delivery,
          deliveredAmount: delivered,
          remainingAmount: remaining,
          deliveryStatus: remaining > 0 ? 'partial' : 'completed',
          deliveryDate: new Date().toISOString(),
        });
      }
      return newDeliveries;
    });
  };

  const handleAdvance = (workerId: string, amount: number) => {
    setDeliveries(prev => {
      const newDeliveries = new Map(prev);
      const delivery = newDeliveries.get(workerId);
      if (delivery) {
        const advance = Math.min(amount, delivery.totalSalary);
        const remaining = delivery.totalSalary - delivery.deliveredAmount - advance;
        newDeliveries.set(workerId, {
          ...delivery,
          advanceAmount: advance,
          remainingAmount: remaining,
        });
      }
      return newDeliveries;
    });
  };

  const handleNotesChange = (workerId: string, notes: string) => {
    setDeliveries(prev => {
      const newDeliveries = new Map(prev);
      const delivery = newDeliveries.get(workerId);
      if (delivery) {
        newDeliveries.set(workerId, {
          ...delivery,
          notes,
        });
      }
      return newDeliveries;
    });
  };

  const handleReset = (workerId: string) => {
    setDeliveries(prev => {
      const newDeliveries = new Map(prev);
      const delivery = newDeliveries.get(workerId);
      if (delivery) {
        newDeliveries.set(workerId, {
          ...delivery,
          deliveredAmount: 0,
          advanceAmount: 0,
          remainingAmount: delivery.totalSalary,
          deliveryStatus: 'pending',
          deliveryDate: undefined,
          notes: undefined,
        });
      }
      return newDeliveries;
    });
  };

  const saveDeliveries = async () => {
    try {
      setSaving(true);
      
      // جمع البيانات المحدثة فقط
      const deliveriesArray = Array.from(deliveries.values()).filter(
        d => d.deliveryStatus !== 'pending'
      );
      
      if (deliveriesArray.length === 0) {
        alert('لا توجد بيانات لحفظها');
        return;
      }
      
      // حفظ البيانات في قاعدة البيانات
      const response = await fetch('/api/payroll/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          month: selectedMonth, 
          deliveries: deliveriesArray 
        }),
      });
      
      if (response.ok) {
        alert('تم حفظ بيانات تسليم الرواتب بنجاح!');
      } else {
        const error = await response.json();
        alert('حدث خطأ: ' + (error.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error saving deliveries:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('تسليم الرواتب');

      // تنسيق العنوان
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `تقرير تسليم رواتب العاملات - ${selectedMonth}`;
      titleCell.font = { name: 'Arial', size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };

      // إضافة رأس الجدول
      worksheet.addRow([]);
      const headerRow = worksheet.addRow([
        'كود العاملة',
        'الاسم',
        'الجنسية',
        'إجمالي الراتب',
        'المبلغ المستلم',
        'السلفة',
        'المتبقي',
        'الحالة',
        'ملاحظات'
      ]);

      // تنسيق رأس الجدول
      headerRow.font = { bold: true, name: 'Arial', size: 12 };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E7FF' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // إضافة البيانات
      const deliveriesArray = Array.from(deliveries.values());
      deliveriesArray.forEach((delivery) => {
        const statusText = 
          delivery.deliveryStatus === 'completed' ? 'مكتمل' :
          delivery.deliveryStatus === 'partial' ? 'جزئي' :
          'قيد الانتظار';

        const row = worksheet.addRow([
          delivery.workerCode.toString().padStart(4, '0'),
          delivery.workerName,
          delivery.nationality,
          delivery.totalSalary,
          delivery.deliveredAmount,
          delivery.advanceAmount,
          delivery.remainingAmount,
          statusText,
          delivery.notes || ''
        ]);

        row.alignment = { horizontal: 'center', vertical: 'middle' };
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // إضافة سطر الإجمالي
      const totalRow = worksheet.addRow([
        '',
        '',
        'الإجمالي',
        stats.totalAmount,
        stats.deliveredAmount,
        stats.advanceAmount,
        stats.totalAmount - stats.deliveredAmount - stats.advanceAmount,
        '',
        ''
      ]);

      totalRow.font = { bold: true, name: 'Arial', size: 12 };
      totalRow.alignment = { horizontal: 'center', vertical: 'middle' };
      totalRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // تعديل عرض الأعمدة
      worksheet.columns = [
        { width: 12 },  // كود
        { width: 20 },  // اسم
        { width: 15 },  // جنسية
        { width: 15 },  // إجمالي
        { width: 15 },  // مستلم
        { width: 12 },  // سلفة
        { width: 12 },  // متبقي
        { width: 12 },  // حالة
        { width: 25 }   // ملاحظات
      ];

      // تصدير الملف
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-delivery-${selectedMonth}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('حدث خطأ أثناء التصدير');
    }
  };

  const printReport = () => {
    window.print();
  };

  const filteredDeliveries = Array.from(deliveries.values()).filter(delivery =>
    delivery.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.workerCode.toString().includes(searchTerm) ||
    delivery.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: deliveries.size,
    completed: Array.from(deliveries.values()).filter(d => d.deliveryStatus === 'completed').length,
    partial: Array.from(deliveries.values()).filter(d => d.deliveryStatus === 'partial').length,
    pending: Array.from(deliveries.values()).filter(d => d.deliveryStatus === 'pending').length,
    totalAmount: Array.from(deliveries.values()).reduce((sum, d) => sum + d.totalSalary, 0),
    deliveredAmount: Array.from(deliveries.values()).reduce((sum, d) => sum + d.deliveredAmount, 0),
    advanceAmount: Array.from(deliveries.values()).reduce((sum, d) => sum + d.advanceAmount, 0),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gradient mb-2">تسليم الرواتب</h1>
            <p className="text-slate-600">إدارة تسليم رواتب العاملات للشهر الحالي</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={printReport}
              variant="secondary"
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button
              onClick={exportToExcel}
              variant="secondary"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير Excel
            </Button>
            <Button
              onClick={saveDeliveries}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ البيانات
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-semibold">إجمالي العاملات</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">
              المبلغ الكلي: {stats.totalAmount.toLocaleString('ar-SA')} ريال
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-semibold">تم التسليم</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-slate-500 mt-1">
              المبلغ: {stats.deliveredAmount.toLocaleString('ar-SA')} ريال
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-semibold">تسليم جزئي</span>
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.partial}</p>
            <p className="text-xs text-slate-500 mt-1">
              سلف: {stats.advanceAmount.toLocaleString('ar-SA')} ريال
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-semibold">قيد الانتظار</span>
              <AlertCircle className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-xs text-slate-500 mt-1">
              المتبقي: {(stats.totalAmount - stats.deliveredAmount - stats.advanceAmount).toLocaleString('ar-SA')} ريال
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-2xl p-4">
          <Input
            type="text"
            placeholder="البحث بالاسم، الكود، أو الجنسية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Month Selector */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-600" />
            <label className="text-sm font-semibold text-slate-700">اختر الشهر:</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* Workers List */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery, index) => {
            return (
              <motion.div
                key={delivery.workerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-6 space-y-4"
              >
                {/* Worker Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold">
                      {delivery.workerCode.toString().padStart(4, '0')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{delivery.workerName}</h3>
                      <p className="text-sm text-slate-600">{delivery.nationality}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      delivery.deliveryStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      delivery.deliveryStatus === 'partial' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }
                  >
                    {delivery.deliveryStatus === 'completed' ? 'تم التسليم' :
                     delivery.deliveryStatus === 'partial' ? 'تسليم جزئي' :
                     'قيد الانتظار'}
                  </Badge>
                </div>

                {/* Salary Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">إجمالي الراتب</p>
                    <p className="text-lg font-bold text-slate-900">
                      {delivery.totalSalary.toLocaleString('ar-SA')} <span className="text-sm">ريال</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">المبلغ المسلم</p>
                    <p className="text-lg font-bold text-green-600">
                      {delivery.deliveredAmount.toLocaleString('ar-SA')} <span className="text-sm">ريال</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">السلف</p>
                    <p className="text-lg font-bold text-orange-600">
                      {delivery.advanceAmount.toLocaleString('ar-SA')} <span className="text-sm">ريال</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">المتبقي</p>
                    <p className="text-lg font-bold text-blue-600">
                      {delivery.remainingAmount.toLocaleString('ar-SA')} <span className="text-sm">ريال</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Full Delivery */}
                  <Button
                    onClick={() => handleFullDelivery(delivery.workerId)}
                    disabled={delivery.deliveryStatus === 'completed'}
                    variant="primary"
                    className="gap-2 w-full"
                  >
                    <Check className="w-4 h-4" />
                    تسليم كامل
                  </Button>

                  {/* Partial Delivery */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="مبلغ جزئي"
                      className="flex-1"
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        if (amount > 0) {
                          handlePartialDelivery(delivery.workerId, amount);
                        }
                      }}
                    />
                  </div>

                  {/* Advance */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="سلفة"
                      className="flex-1"
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        if (amount > 0) {
                          handleAdvance(delivery.workerId, amount);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Input
                    type="text"
                    placeholder="ملاحظات..."
                    value={delivery.notes || ''}
                    onChange={(e) => handleNotesChange(delivery.workerId, e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Reset Button */}
                {delivery.deliveryStatus !== 'pending' && (
                  <Button
                    onClick={() => handleReset(delivery.workerId)}
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    إعادة تعيين
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">لا توجد بيانات رواتب متاحة للشهر المحدد</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
