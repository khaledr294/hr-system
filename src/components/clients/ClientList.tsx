'use client';

import { useState } from 'react';
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
  const [search, setSearch] = useState('');

  // تصفية العملاء بناءً على البحث
  const filteredClients = clients.filter((client) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.idNumber.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      client.address.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="space-y-4">
      {/* شريط البحث */}
      <div className="bg-white border-2 border-slate-900 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث في جميع الأعمدة (الاسم، رقم الهوية، الجوال، البريد، العنوان)..."
          className="w-full px-4 py-3 border-2 border-slate-900 focus:outline-none focus:border-blue-600 text-right"
        />
        {search && (
          <p className="mt-2 text-sm text-gray-600 text-right">
            عدد النتائج: {filteredClients.length} من {clients.length}
          </p>
        )}
      </div>

      {/* جدول العملاء */}
      <div className="bg-white border-2 border-slate-900">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء'}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredClients}
          />
        )}
      </div>
    </div>
  );
}
