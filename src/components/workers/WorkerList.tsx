'use client';

import React from 'react';
import Table from '@/components/ui/Table';
import Link from 'next/link';
import { type Worker } from '@/types/worker';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface WorkerListProps {
  workers: Worker[];
}

export function WorkerList({ workers }: WorkerListProps) {
  // بحث وفلترة
  const [search, setSearch] = React.useState('');
  const [filterNationality, setFilterNationality] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');

  // استخراج الجنسيات الفريدة
  const nationalities = Array.from(new Set(workers.map(w => w.nationality))).filter(Boolean);

  // فلترة و بحث
  const filteredWorkers = workers.filter(worker => {
    // بحث شامل
    const searchMatch = search.trim() === '' || Object.values(worker).some(val => val && val.toString().toLowerCase().includes(search.toLowerCase()));
    // فلترة الجنسية
    const nationalityMatch = !filterNationality || worker.nationality === filterNationality;
    // فلترة الحالة
    const statusMatch = !filterStatus || worker.status === filterStatus;
    return searchMatch && nationalityMatch && statusMatch;
  });

  const columns: Column<Worker>[] = [
    { 
      header: 'كود', 
      accessor: 'code' as keyof Worker,
      render: (value: Worker[keyof Worker]) => value?.toString().padStart(4, '0')
    },
    { header: 'الاسم', accessor: 'name' as keyof Worker },
    { header: 'الجنسية', accessor: 'nationality' as keyof Worker },
    { header: 'رقم الإقامة', accessor: 'residencyNumber' as keyof Worker },
    { header: 'رقم الجوال', accessor: 'phone' as keyof Worker },
    {
      header: 'الحالة',
      accessor: 'status' as keyof Worker,
      render: (value: Worker[keyof Worker]) => (
        <span
          className={`px-2 py-1 border-2 border-slate-900 text-sm font-bold ${
            value === 'AVAILABLE'
              ? 'bg-green-600 text-white'
              : value === 'RENTED'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-white'
          }`}
        >
          {value === 'AVAILABLE' ? 'متاحة' : value === 'RENTED' ? 'مؤجرة' : 'غير متاحة'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      accessor: 'id' as keyof Worker,
      render: (value: Worker[keyof Worker]) => (
        <div className="flex space-x-2 space-x-reverse">
          <Link
            href={`/workers/${value}`}
            className="inline-flex items-center px-3 py-1 border-2 border-slate-900 text-white bg-blue-600 hover:bg-blue-700 text-sm font-bold transition-colors duration-200"
          >
            عرض
          </Link>
          <Link
            href={`/workers/${value}/edit`}
            className="inline-flex items-center px-3 py-1 border-2 border-slate-900 text-white bg-blue-600 hover:bg-blue-700 text-sm font-bold transition-colors duration-200 mr-2"
          >
            تعديل
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="🔍 بحث في جميع الأعمدة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border-2 border-slate-900 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold placeholder-slate-600"
        />
        <select
          value={filterNationality}
          onChange={e => setFilterNationality(e.target.value)}
          className="px-4 py-2 border-2 border-slate-900 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
        >
          <option value="" className="text-slate-700">كل الجنسيات</option>
          {nationalities.map(nat => (
            <option key={nat} value={nat} className="text-slate-700">{nat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-slate-900 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
        >
          <option value="" className="text-gray-700">كل الحالات</option>
          <option value="AVAILABLE" className="text-green-700">متاحة</option>
          <option value="RENTED" className="text-blue-700">مؤجرة</option>
          <option value="UNAVAILABLE" className="text-gray-700">غير متاحة</option>
        </select>
      </div>
      <Table data={filteredWorkers} columns={columns} />
      {filteredWorkers.length === 0 && (
        <div className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة للبحث أو الفلترة.</div>
      )}
    </div>
  );
}