'use client';

import React from 'react';
import Table from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
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
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center w-full">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="🔍 بحث في جميع الأعمدة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select
            value={filterNationality}
            onChange={e => setFilterNationality(e.target.value)}
            options={[{ value: '', label: 'كل الجنسيات' }, ...nationalities.map(n => ({ value: n, label: n }))]}
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'كل الحالات' },
              { value: 'AVAILABLE', label: 'متاحة' },
              { value: 'RENTED', label: 'مؤجرة' },
              { value: 'UNAVAILABLE', label: 'غير متاحة' },
            ]}
          />
        </div>
      </div>
      <Table data={filteredWorkers} columns={columns} compact stickyHeader />
      {filteredWorkers.length === 0 && (
        <div className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة للبحث أو الفلترة.</div>
      )}
    </div>
  );
}