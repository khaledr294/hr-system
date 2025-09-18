"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import * as XLSX from 'xlsx';

type Worker = {
  id: string;
  code: number;
  name: string;
  nationality: string;
  residencyNumber: string;
  dateOfBirth: string;
  phone: string;
  status: string;
  salary?: number;
  nationalitySalary?: {
    id: string;
    nationality: string;
    salary: number;
  };
  createdAt: string;
};

type PayrollData = {
  worker: Worker;
  baseSalary: number;
  workingDays: number;
  deductions: number;
  bonuses: number;
  totalSalary: number;
};

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Load workers on component mount and when month changes
  useEffect(() => {
    const loadWorkers = async () => {
      try {
        console.log('📞 جاري تحميل العاملين...');
        
        const response = await fetch('/api/workers');
        console.log('🔗 رد API العاملين:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('👥 تم تحميل العاملين:', data.length);
          
          if (data.length > 0) {
            await calculatePayroll(data);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ فشل تحميل العاملين:', errorText);
        }
      } catch (error) {
        console.error('Failed to load workers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const calculatePayroll = async (workersData: Worker[]) => {
    console.log('🔄 بدء حساب الرواتب للشهر:', selectedMonth);
    console.log('👥 عدد العمال:', workersData.length);
    
    const payrollCalculations = await Promise.all(workersData.map(async (worker) => {
      const baseSalary = worker.nationalitySalary?.salary || worker.salary || 0;
      console.log(`💰 ${worker.name}: الراتب الأساسي = ${baseSalary}`);
      
      // Calculate working days from contracts in the selected month
      const workingDays = await calculateWorkingDaysForWorker(worker.id, selectedMonth);
      console.log(`📅 ${worker.name}: أيام العمل المحسوبة = ${workingDays}`);
      
      const deductions = 0; // Default no deductions
      const bonuses = 0; // Default no bonuses
      
      // Calculate total salary
      const dailySalary = baseSalary / 30;
      const totalSalary = Math.round((dailySalary * workingDays) + bonuses - deductions);
      console.log(`💵 ${worker.name}: إجمالي الراتب = ${totalSalary}`);

      return {
        worker,
        baseSalary,
        workingDays,
        deductions,
        bonuses,
        totalSalary
      };
    }));

    console.log('✅ انتهاء حساب الرواتب');
    setPayrollData(payrollCalculations);
  };

  // Calculate working days for a worker based on contracts in the selected month
  const calculateWorkingDaysForWorker = async (workerId: string, monthYear: string): Promise<number> => {
    try {
      console.log(`🔍 جاري البحث عن عقود للعامل ${workerId} في الشهر ${monthYear}`);
      
      // Get contracts for this worker from API
      const response = await fetch(`/api/contracts?workerId=${workerId}&month=${monthYear}`);
      console.log(`🌐 استجابة API:`, response.status, response.ok);
      
      if (!response.ok) {
        console.log(`❌ فشل في الحصول على العقود للعامل ${workerId}`);
        return 0; // No contracts found, worker didn't work
      }
      
      const contracts = await response.json();
      console.log(`📋 العقود الموجودة للعامل ${workerId}:`, contracts.length);
      
      if (!contracts || contracts.length === 0) {
        console.log(`⚠️ لا توجد عقود نشطة للعامل ${workerId}`);
        return 0; // No active contracts
      }

      // Calculate days worked in the selected month
      const [year, month] = monthYear.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0); // Last day of the month
      console.log(`📅 حساب الأيام للشهر ${month}/${year}`);
  console.log(`📊 بداية الشهر: ${monthStart.toLocaleDateString('ar-SA-u-ca-gregory')}`);
  console.log(`📊 نهاية الشهر: ${monthEnd.toLocaleDateString('ar-SA-u-ca-gregory')}`);
      
      let totalWorkingDays = 0;
      
      contracts.forEach((contract: { startDate: string; endDate: string }, index: number) => {
        console.log(`📝 معالجة العقد ${index + 1} للعامل ${workerId}:`, contract);
        
        const contractStart = new Date(contract.startDate);
        const contractEnd = new Date(contract.endDate);
        
        console.log(`📋 تواريخ العقد:`, {
          start: contractStart.toLocaleDateString('ar-SA-u-ca-gregory'),
          end: contractEnd.toLocaleDateString('ar-SA-u-ca-gregory')
        });
        
        // Find the overlap between contract period and the selected month
        const periodStart = contractStart > monthStart ? contractStart : monthStart;
        const periodEnd = contractEnd < monthEnd ? contractEnd : monthEnd;

        console.log(`⏰ الفترة المحسوبة:`, {
          periodStart: periodStart.toLocaleDateString('ar-SA-u-ca-gregory'),
          periodEnd: periodEnd.toLocaleDateString('ar-SA-u-ca-gregory'),
          validPeriod: periodStart < periodEnd
        });

        if (periodStart < periodEnd) {
          // حساب الأيام مثل الفنادق: الفرق بين اليومين بدون شمول يوم النهاية
          const startOfDay = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
          const endOfDay = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());

          const timeDifference = endOfDay.getTime() - startOfDay.getTime();
          const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24)); // بدون +1
          console.log(`🎯 أيام العمل لهذا العقد (بدون شمول يوم النهاية): ${daysDifference}`);
          totalWorkingDays += daysDifference;
        }
      });
      
      // Cap at maximum days in month
      const daysInMonth = monthEnd.getDate();
      const finalWorkingDays = Math.min(totalWorkingDays, daysInMonth);
      console.log(`✅ إجمالي أيام العمل للعامل ${workerId}: ${finalWorkingDays} (من أصل ${totalWorkingDays}, محدود بـ ${daysInMonth})`);
      
      return finalWorkingDays;
      
    } catch (error) {
      console.error('Error calculating working days for worker:', workerId, error);
      return 0; // Default to 0 if error occurs
    }
  };

  const updatePayrollItem = (workerId: string, field: keyof PayrollData, value: number) => {
    // منع تعديل أيام العمل - يتم حسابها تلقائياً من العقود
    if (field === 'workingDays') {
      console.log(`⛔ تجاهل محاولة تعديل أيام العمل للعامل ${workerId} - يتم الحساب تلقائياً`);
      return;
    }
    
    console.log(`✏️ تعديل بيانات الراتب للعامل ${workerId}: ${field} = ${value}`);
    
    setPayrollData(prev => prev.map(item => {
      if (item.worker.id === workerId) {
        const updated = { ...item, [field]: value };
        
        // Recalculate total salary
        const dailySalary = updated.baseSalary / 30;
        updated.totalSalary = Math.round((dailySalary * updated.workingDays) + updated.bonuses - updated.deductions);
        
        console.log(`💰 إعادة حساب راتب العامل ${workerId}:`, {
          baseSalary: updated.baseSalary,
          workingDays: updated.workingDays,
          dailySalary: dailySalary.toFixed(2),
          bonuses: updated.bonuses,
          deductions: updated.deductions,
          totalSalary: updated.totalSalary
        });
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotalPayroll = () => {
    return payrollData.reduce((total, item) => total + item.totalSalary, 0);
  };

  const exportPayroll = () => {
    // إنشاء محتوى CSV محسّن للعربية
    const headers = ['كود العاملة', 'الاسم', 'الجنسية', 'الراتب الأساسي', 'أيام العمل', 'الخصومات', 'المكافآت', 'إجمالي الراتب'];
    
    // تنسيق البيانات مع حماية النص العربي بعلامات اقتباس
    const csvRows = [
      headers.map(header => `"${header}"`).join(','),
      ...payrollData.map(item => [
        `"${item.worker.code.toString().padStart(4, '0')}"`,
        `"${item.worker.name || 'غير محدد'}"`,
        `"${item.worker.nationality || 'غير محدد'}"`,
        Math.round(item.baseSalary) || 0,
        item.workingDays || 0,
        Math.round(item.deductions) || 0,
        Math.round(item.bonuses) || 0,
        Math.round(item.totalSalary) || 0
      ].join(','))
    ];
    
    // إضافة سطر الإجمالي
    const totalRow = [
      '""', '""', '"الإجمالي"',
      Math.round(payrollData.reduce((sum, item) => sum + item.baseSalary, 0)),
      payrollData.reduce((sum, item) => sum + item.workingDays, 0),
      Math.round(payrollData.reduce((sum, item) => sum + item.deductions, 0)),
      Math.round(payrollData.reduce((sum, item) => sum + item.bonuses, 0)),
      Math.round(calculateTotalPayroll())
    ].join(',');
    
    csvRows.push(totalRow);
    
    // إضافة معلومات إضافية في أعلى الملف (بالتقويم الميلادي)
    const reportInfo = [
      `"تقرير الرواتب للشهر: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long', calendar: 'gregory' })}"`,
      `"تاريخ التقرير: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'gregory' })}"`,
      `"إجمالي العاملات: ${payrollData.length}"`,
      `"إجمالي الرواتب: ${Math.round(calculateTotalPayroll()).toLocaleString()} ريال"`,
      '""', // سطر فارغ
    ];
    
    const csvContent = [...reportInfo, ...csvRows].join('\n');
    
    // إضافة BOM للعربية وإنشاء الملف
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = `payroll-${selectedMonth}.csv`;
    link.download = fileName;
    link.click();
    
    // رسالة تأكيد
    alert(`تم تصدير ملف CSV بنجاح!\nاسم الملف: ${fileName}\nعدد العاملات: ${payrollData.length}\nإجمالي المبلغ: ${Math.round(calculateTotalPayroll()).toLocaleString()} ريال`);
  };

  const exportToExcel = () => {
    // إنشاء ورقة عمل جديدة
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // معلومات التقرير في أعلى الملف (بالتقويم الميلادي)
    const reportDate = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      calendar: 'gregory'
    });
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'gregory'
    });
    const totalWorkers = payrollData.length;
    const totalPayroll = Math.round(calculateTotalPayroll());
    
    // إضافة معلومات التقرير
    XLSX.utils.sheet_add_aoa(ws, [
      ['تقرير الرواتب الشهرية'],
      ['الشهر:', reportDate],
      ['تاريخ التقرير:', currentDate],
      ['إجمالي العاملات:', totalWorkers],
      ['إجمالي المبلغ:', `${totalPayroll.toLocaleString()} ريال`],
      [''], // سطر فارغ
      // رؤوس الجدول
      ['كود العاملة', 'الاسم', 'الجنسية', 'الراتب الأساسي', 'أيام العمل', 'الخصومات', 'المكافآت', 'إجمالي الراتب']
    ], { origin: 'A1' });
    
    // إضافة بيانات العاملات مع التأكد من دقة البيانات
    const employeeData = payrollData.map(item => [
      item.worker.code.toString().padStart(4, '0'),
      item.worker.name || 'غير محدد',
      item.worker.nationality || 'غير محدد',
      Math.round(item.baseSalary) || 0,
      item.workingDays || 0,
      Math.round(item.deductions) || 0,
      Math.round(item.bonuses) || 0,
      Math.round(item.totalSalary) || 0
    ]);
    
    XLSX.utils.sheet_add_aoa(ws, employeeData, { origin: 'A8' });
    
    // إضافة سطر الإجمالي
    const totalRow = [
      '', '', 'الإجمالي:', 
      Math.round(payrollData.reduce((sum, item) => sum + item.baseSalary, 0)),
      payrollData.reduce((sum, item) => sum + item.workingDays, 0),
      Math.round(payrollData.reduce((sum, item) => sum + item.deductions, 0)),
      Math.round(payrollData.reduce((sum, item) => sum + item.bonuses, 0)),
      Math.round(totalPayroll)
    ];
    
    const nextRow = 8 + employeeData.length;
    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${nextRow}` });
    
    // تعيين عرض الأعمدة
    ws['!cols'] = [
      { width: 12 }, // كود العاملة
      { width: 25 }, // الاسم
      { width: 15 }, // الجنسية
      { width: 15 }, // الراتب الأساسي
      { width: 12 }, // أيام العمل
      { width: 12 }, // الخصومات
      { width: 12 }, // المكافآت
      { width: 15 }  // إجمالي الراتب
    ];
    
    // إنشاء المصنف
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير الرواتب');
    
    // تصدير الملف
    const fileName = `تقرير_الرواتب_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    // رسالة تأكيد
    alert(`تم تصدير تقرير الرواتب بنجاح!\nاسم الملف: ${fileName}\nعدد العاملات: ${payrollData.length}\nإجمالي المبلغ: ${totalPayroll.toLocaleString()} ريال`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحميل بيانات الرواتب وحساب أيام العمل من العقود...</p>
          <p className="text-sm text-gray-500 mt-2">قد يستغرق هذا بضع ثوانٍ لحساب البيانات بدقة</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">حساب الرواتب</h1>
          <div className="flex gap-4 items-center">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold focus:text-indigo-900 focus:bg-indigo-50 focus:border-indigo-500"
            />
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
            >
              📊 تصدير Excel
            </button>
            <button
              onClick={exportPayroll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              📄 تصدير CSV
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-indigo-600 font-bold text-lg">إجمالي العاملات</p>
              <p className="text-2xl font-bold text-indigo-800">{payrollData.length}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-bold text-lg">إجمالي الرواتب</p>
              <p className="text-2xl font-bold text-indigo-800">{Math.round(calculateTotalPayroll()).toLocaleString()} ريال</p>
            </div>
            <div>
              <p className="text-indigo-600 font-bold text-lg">الشهر المحدد</p>
              <p className="text-2xl font-bold text-indigo-800">{new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long', calendar: 'gregory' })}</p>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-2 text-center font-bold text-sm">كود</th>
                <th className="py-3 px-3 text-right font-bold text-sm">الاسم</th>
                <th className="py-3 px-2 text-right font-bold text-sm">الجنسية</th>
                <th className="py-3 px-2 text-center font-bold text-sm">الراتب الأساسي</th>
                <th className="py-3 px-2 text-center font-bold text-sm">أيام العمل</th>
                <th className="py-3 px-2 text-center font-bold text-sm">الخصومات</th>
                <th className="py-3 px-2 text-center font-bold text-sm">المكافآت</th>
                <th className="py-3 px-2 text-center font-bold text-sm">إجمالي الراتب</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">لا توجد بيانات للعرض حالياً.</td>
                </tr>
              ) : (
                payrollData.map((item) => (
                  <tr key={item.worker.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 text-center text-sm font-bold text-indigo-600">
                      {item.worker.code.toString().padStart(4, '0')}
                    </td>
                    <td className="py-2 px-3 text-right text-sm font-semibold text-gray-900">{item.worker.name}</td>
                    <td className="py-2 px-2 text-right text-sm font-medium text-gray-800">{item.worker.nationality}</td>
                    <td className="py-2 px-2 text-center text-sm">
                      <div className="font-bold text-green-600">
                        {Math.round(item.baseSalary).toLocaleString()} ريال
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.worker.nationalitySalary ? 
                          `(من راتب ${item.worker.nationality})` : 
                          '(راتب فردي)'}
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <div className="flex flex-col items-center">
                        <div className="w-16 px-2 py-1 bg-gray-50 border rounded text-center text-sm text-gray-900 font-semibold">
                          {item.workingDays}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          🤖 تلقائي
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="number"
                        value={item.deductions}
                        onChange={(e) => updatePayrollItem(item.worker.id, 'deductions', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center text-sm text-gray-900 font-semibold focus:text-indigo-900 focus:bg-indigo-50 focus:border-indigo-500 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="number"
                        value={item.bonuses}
                        onChange={(e) => updatePayrollItem(item.worker.id, 'bonuses', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center text-sm text-gray-900 font-semibold focus:text-indigo-900 focus:bg-indigo-50 focus:border-indigo-500 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-2 text-center text-sm font-bold text-blue-600">
                      {Math.round(item.totalSalary).toLocaleString()} ريال
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {payrollData.length > 0 && (
              <tfoot className="bg-indigo-100">
                <tr>
                  <td colSpan={7} className="py-3 px-3 text-right font-bold text-indigo-800">إجمالي الرواتب:</td>
                  <td className="py-3 px-2 text-center font-bold text-xl text-indigo-800">
                    {Math.round(calculateTotalPayroll()).toLocaleString()} ريال
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {payrollData.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">✨ النظام التلقائي للرواتب:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>الراتب الأساسي:</strong> يُستورد تلقائياً من جدول الجنسيات والرواتب حسب جنسية كل عاملة</li>
              <li>• <strong>أيام العمل:</strong> تُحسب تلقائياً من العقود الفعلية للعاملة خلال الشهر المحدد (غير قابلة للتعديل)</li>
              <li>• <strong>الحساب الذكي:</strong> يتم حساب التقاطع بين فترة العقد والشهر المحدد بدقة</li>
              <li>• <strong>المبالغ المقربة:</strong> جميع المبالغ يتم تقريبها لأقرب ريال صحيح</li>
              <li>• <strong>المرونة:</strong> يمكن تعديل الخصومات والمكافآت يدوياً عند الحاجة</li>
              <li>• <strong>التحديث الفوري:</strong> يتم إعادة حساب الراتب الإجمالي تلقائياً عند أي تعديل</li>
              <li>• <strong>التصدير المحسّن:</strong> تصدير Excel مع تنسيق احترافي ودعم كامل للعربية + CSV محسّن</li>
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}