"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { formatDate } from '@/lib/date';

interface Contract {
  id: string;
  status: string;
  startDate: Date;
  endDate: Date;
  packageType: string;
  packageName?: string | null;
  contractNumber?: string | null;
  client: {
    id: string;
    name: string;
    idNumber: string;
  };
  worker: {
    id: string;
    name: string;
    residencyNumber: string;
  };
}

interface ContractsWithSearchProps {
  contracts: Contract[];
}

export default function ContractsWithSearch({ contracts }: ContractsWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // فلترة العقود بناءً على البحث
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;

    const query = searchQuery.toLowerCase().trim();
    return contracts.filter(contract => 
      contract.client.name.toLowerCase().includes(query) ||
      contract.client.idNumber.includes(query) ||
      contract.worker.name.toLowerCase().includes(query) ||
      contract.worker.residencyNumber.includes(query) ||
      (contract.contractNumber && contract.contractNumber.toLowerCase().includes(query))
    );
  }, [contracts, searchQuery]);

  // عقود على وشك الانتهاء (أقل من 3 أيام)
  const expiringSoon = useMemo(() => {
    const now = Date.now();
    return filteredContracts.filter(contract => {
      if (contract.status !== 'ACTIVE') return false;
      const end = new Date(contract.endDate);
      const diffTime = end.getTime() - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  }, [filteredContracts]);
  
  // عقود نشطة (باستثناء التي على وشك الانتهاء)
  const active = useMemo(() => {
    const now = Date.now();
    return filteredContracts.filter(contract => {
      if (contract.status !== 'ACTIVE') return false;
      const end = new Date(contract.endDate);
      const diffTime = end.getTime() - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 3;
    });
  }, [filteredContracts]);
  
  // عقود منتهية (تاريخياً لكن لم يتم إنهاؤها رسمياً)
  const expired = useMemo(() => {
    const now = Date.now();
    return filteredContracts.filter(contract => 
      contract.status === 'EXPIRED' || 
      (contract.status === 'ACTIVE' && new Date(contract.endDate).getTime() < now)
    );
  }, [filteredContracts]);
  
  // عقود مكتملة (تم إنهاؤها رسمياً)
  const completed = useMemo(() => {
    return filteredContracts.filter(contract => 
      contract.status === 'COMPLETED'
    );
  }, [filteredContracts]);
  
  // عقود ملغاة
  const cancelled = useMemo(() => {
    return filteredContracts.filter(contract => 
      contract.status === 'CANCELLED'
    );
  }, [filteredContracts]);

  function renderTable(list: Contract[], title: string) {
    return (
      <div className="mb-8">
        <h2 className="font-bold text-xl mb-4 text-gray-900 tracking-wide">
          {title} ({list.length})
        </h2>
        <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-linear-to-r from-indigo-100 to-blue-100">
              <tr>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">رقم العقد</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">رقم الهوية</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">العاملة</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">رقم الإقامة</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">تاريخ البداية</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">تاريخ النهاية</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">نوع الباقة</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-right text-base font-bold text-indigo-900 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {list.map((contract: Contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contractNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.client?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {contract.client?.idNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.worker?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {contract.worker?.residencyNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(contract.startDate, { numberingSystem: 'latn' }, 'en-GB')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(contract.endDate, { numberingSystem: 'latn' }, 'en-GB')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.packageName || contract.packageType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        contract.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : contract.status === 'EXPIRED'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : contract.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : contract.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contract.status === 'ACTIVE' ? '🟢 نشط'
                        : contract.status === 'EXPIRED' ? '⏰ منتهي'
                        : contract.status === 'COMPLETED' ? '✅ مكتمل'
                        : contract.status === 'CANCELLED' ? '❌ ملغي'
                        : contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'لم يتم العثور على عقود تطابق البحث' : 'لا يوجد عقود في هذا القسم'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <section dir="rtl">
      {/* شريط البحث */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">البحث في العقود</h2>
          <p className="text-sm text-gray-600 mb-4">
            يمكنك البحث بـ: اسم العميل، رقم الهوية، اسم العاملة، رقم الإقامة، أو رقم العقد
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="اكتب هنا للبحث في العقود..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              مسح البحث
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mt-4 text-sm text-gray-600">
            تم العثور على <strong>{filteredContracts.length}</strong> عقد من أصل <strong>{contracts.length}</strong>
          </div>
        )}
      </div>

      {/* عرض النتائج */}
      {searchQuery && filteredContracts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-yellow-700">
            لم يتم العثور على أي عقود تطابق &ldquo;<strong>{searchQuery}</strong>&rdquo;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
          >
            عرض جميع العقود
          </button>
        </div>
      ) : (
        <>
          {expiringSoon.length > 0 && renderTable(expiringSoon, '⚠️ عقود على وشك الانتهاء (متبقي 3 أيام أو أقل)')}
          {renderTable(active, '✅ العقود النشطة')}
          {renderTable(expired, '⏰ العقود المنتهية (تحتاج إنهاء رسمي)')}
          {renderTable(completed, '✔️ العقود المكتملة (تم إنهاؤها رسمياً)')}
          {renderTable(cancelled, '❌ العقود الملغاة')}
        </>
      )}
    </section>
  );
}
