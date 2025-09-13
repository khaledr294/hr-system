import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import TerminateContractButton from '@/components/contracts/TerminateContractButton';
import React from 'react';

export default async function ContractDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      worker: true,
    },
  });

  if (!contract) {
    redirect('/contracts');
  }

  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل العقد</h1>
          <div className="flex gap-2">
            <Link
              href={`/contracts/${contract.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              تعديل العقد
            </Link>
            <TerminateContractButton contractId={contract.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">الاسم</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.client.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الهوية</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.client.idNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الجوال</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.client.phone}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العاملة</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">الاسم</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.worker.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الكود</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.worker.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الجنسية</dt>
                <dd className="mt-1 text-sm text-gray-900">{contract.worker.nationality}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل العقد</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">تاريخ البداية</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(contract.startDate).toLocaleDateString('ar-SA')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">تاريخ النهاية</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(contract.endDate).toLocaleDateString('ar-SA')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">نوع الباقة</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {contract.packageType === 'MONTHLY' ? 'شهري' 
                 : contract.packageType === 'QUARTERLY' ? 'ربع سنوي'
                 : 'سنوي'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">المبلغ الإجمالي</dt>
              <dd className="mt-1 text-sm text-gray-900">{contract.totalAmount.toLocaleString('ar-SA')} ريال</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">الحالة</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded ${
                    contract.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : contract.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {contract.status === 'ACTIVE' ? 'نشط'
                   : contract.status === 'COMPLETED' ? 'منتهي'
                   : 'ملغي'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}