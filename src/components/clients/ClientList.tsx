'use client';

import Table from '@/components/ui/Table';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  idNumber: string;
}

interface ClientListProps {
  clients: Client[];
}

export default function ClientList({ clients }: ClientListProps) {
  const columns = [
    { header: 'الاسم', accessor: 'name' as keyof Client },
    { header: 'رقم الهوية', accessor: 'idNumber' as keyof Client },
    { header: 'رقم الجوال', accessor: 'phone' as keyof Client },
    { 
      header: 'البريد الإلكتروني', 
      accessor: 'email' as keyof Client,
      render: (value: string | null) => value || '-'
    },
    { header: 'العنوان', accessor: 'address' as keyof Client },
    {
      header: 'الإجراءات',
      accessor: 'id' as keyof Client,
      render: (_: unknown, item: Client) => (
        <Link
          href={`/clients/${item.id}`}
          className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 border-2 border-slate-900 font-bold transition-colors duration-200"
        >
          عرض التفاصيل
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white border-2 border-slate-900">
      <Table
        columns={columns}
        data={clients}
      />
    </div>
  );
}
