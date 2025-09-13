'use client';

import Table from '@/components/ui/Table';
import Link from 'next/link';
import { type Column } from '@/components/ui/Table';
import { type Worker } from '@/types/worker';

interface WorkerListProps {
  workers: Worker[];
}

export function WorkerList({ workers }: WorkerListProps) {
  const columns: Column<Worker>[] = [
    { 
      header: 'كود', 
      accessor: 'code',
      render: (value: string | number) => value.toString().padStart(4, '0')
    },
    { header: 'الاسم', accessor: 'name' },
    { header: 'الجنسية', accessor: 'nationality' },
    { header: 'رقم الإقامة', accessor: 'residencyNumber' },
    { header: 'رقم الجوال', accessor: 'phone' },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (value: string | number) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            value === 'AVAILABLE'
              ? 'bg-green-100 text-green-800'
              : value === 'RENTED'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'AVAILABLE' ? 'متاحة' : value === 'RENTED' ? 'مؤجرة' : 'غير متاحة'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      accessor: 'id',
      render: (value: string | number) => (
        <div className="flex space-x-2 space-x-reverse">
          <Link
            href={`/workers/${value}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            عرض
          </Link>
          <Link
            href={`/workers/${value}/edit`}
            className="text-blue-600 hover:text-blue-900 mr-2"
          >
            تعديل
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8">
      <Table data={workers} columns={columns} />
    </div>
  );
}