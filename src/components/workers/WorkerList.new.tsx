'use client';

import { useRouter } from 'next/navigation';
import Table from '@/components/ui/Table';
import Link from 'next/link';

interface Worker {
  id: string;
  code: number;
  name: string;
  nationality: string;
  residencyNumber: string;
  dateOfBirth: string;
  phone: string;
  status: string;
}

interface WorkerListProps {
  workers: Worker[];
}

export function WorkerList({ workers }: WorkerListProps) {
  const router = useRouter();

  const columns = [
    { 
      header: 'كود', 
      accessor: 'code' as const,
      render: (value: number) => String(value).padStart(4, '0')
    },
    { header: 'الاسم', accessor: 'name' as const },
    { header: 'الجنسية', accessor: 'nationality' as const },
    { header: 'رقم الإقامة', accessor: 'residencyNumber' as const },
    { header: 'رقم الجوال', accessor: 'phone' as const },
    {
      header: 'الحالة',
      accessor: 'status' as const,
      render: (value: string) => (
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
      accessor: 'id' as const,
      render: (value: string) => (
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
      <Table
        data={workers}
        columns={columns}
      />
    </div>
  );
}