"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PenaltyCalculatorProps {
  contractId: string;
  endDate: string;
  currentStatus: string;
  clientName: string;
  workerName: string;
}

export default function PenaltyCalculator({ 
  contractId, 
  endDate, 
  currentStatus, 
  clientName, 
  workerName 
}: PenaltyCalculatorProps) {
  const router = useRouter();
  const [returnDate, setReturnDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    delayDays: number;
    penaltyAmount: number;
    message: string;
  } | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  // إذا كان العقد منتهياً بالفعل، لا نظهر الآلة الحاسبة
  if (currentStatus !== 'ACTIVE') {
    return null;
  }

  const handleCalculatePenalty = async () => {
    if (!returnDate) {
      alert('يرجى تحديد تاريخ الإرجاع');
      return;
    }

    try {
      setIsCalculating(true);
      const response = await fetch('/api/contracts/penalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          returnDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        router.refresh(); // إعادة تحديث الصفحة لإظهار التغييرات
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'حدث خطأ في حساب الغرامة');
      }
    } catch (error) {
      console.error('Error calculating penalty:', error);
      alert('حدث خطأ في حساب الغرامة');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatDate = (date: string) => {
    const input = date.replace(/\D/g, '');
    let formatted = input;
    if (input.length >= 2) {
      formatted = input.slice(0, 2) + '/' + input.slice(2);
    }
    if (input.length >= 4) {
      formatted = formatted.slice(0, 5) + '/' + input.slice(4, 8);
    }
    return formatted;
  };

  const parseDate = (dateStr: string) => {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  };

  // حساب الغرامة المحتملة للعرض
  const calculatePotentialPenalty = () => {
    if (!returnDate) return null;
    
    const actualReturnDate = parseDate(returnDate);
    const contractEndDate = new Date(endDate);
    
    if (!actualReturnDate || actualReturnDate <= contractEndDate) {
      return { days: 0, amount: 0 };
    }
    
    const timeDiff = actualReturnDate.getTime() - contractEndDate.getTime();
    const delayDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const penaltyAmount = delayDays * 120; // 120 ريال لكل يوم
    
    return { days: delayDays, amount: penaltyAmount };
  };

  const potentialPenalty = calculatePotentialPenalty();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-yellow-800">
          حساب غرامة التأخير وإنهاء العقد
        </h3>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="text-yellow-700 hover:text-yellow-900 font-medium"
        >
          {showCalculator ? 'إخفاء' : 'إظهار'} حاسبة الغرامة
        </button>
      </div>

      {showCalculator && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>العميل:</strong> {clientName}
            </div>
            <div>
              <strong>العاملة:</strong> {workerName}
            </div>
            <div>
              <strong>تاريخ انتهاء العقد:</strong> {new Date(endDate).toLocaleDateString('ar')}
            </div>
            <div>
              <strong>معدل الغرامة:</strong> 120 ريال/يوم
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الإرجاع الفعلي
            </label>
            <input
              type="text"
              placeholder="يوم/شهر/سنة (مثال: 15/03/2024)"
              value={returnDate}
              onChange={(e) => {
                const formatted = formatDate(e.target.value);
                setReturnDate(formatted);
              }}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-right"
            />
            <div className="text-xs text-gray-600 mt-1">
              أدخل التاريخ بصيغة يوم/شهر/سنة
            </div>
          </div>

          {potentialPenalty && returnDate && (
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <h4 className="font-medium text-gray-900 mb-2">معاينة الحساب:</h4>
              {potentialPenalty.days > 0 ? (
                <div className="text-sm space-y-1">
                  <div>أيام التأخير: <span className="font-bold text-red-600">{potentialPenalty.days} يوم</span></div>
                  <div>الغرامة المحسوبة: <span className="font-bold text-red-600">{potentialPenalty.amount.toLocaleString()} ريال</span></div>
                  <div className="text-xs text-gray-600">
                    ({potentialPenalty.days} يوم × 120 ريال = {potentialPenalty.amount.toLocaleString()} ريال)
                  </div>
                </div>
              ) : (
                <div className="text-sm text-green-600 font-medium">
                  لا توجد غرامة تأخير - تم الإرجاع في الموعد
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleCalculatePenalty}
              disabled={isCalculating || !returnDate}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isCalculating ? 'جارٍ الحساب...' : 'إنهاء العقد وحساب الغرامة'}
            </button>
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
              <h4 className="font-medium text-green-800 mb-2">تم إنهاء العقد بنجاح!</h4>
              <div className="text-sm text-green-700">
                {result.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}