import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import TerminateContractButton from '@/components/contracts/TerminateContractButton';
import DeleteContractButton from '@/components/contracts/DeleteContractButton';
import GenerateWordButton from '@/components/contracts/GenerateWordButton';
import PenaltyCalculator from '@/components/contracts/PenaltyCalculator';
import ExtendContractButton from '@/components/contracts/ExtendContractButton';
import React from 'react';

// نوع مؤقت للعقد مع الحقول الجديدة (اختياري للتوافق مع النسخة القديمة)
type ContractWithPenalty = {
  delayDays?: number;
  penaltyAmount?: number;
  penaltyRate?: number;
};

export default async function ContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: true,
      worker: true,
    }
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
            {/* إظهار الأزرار فقط إذا لم يكن العقد منتهي */}
            {contract.status === 'ACTIVE' && (
              <>
                <Link
                  href={`/contracts/${contract.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  تعديل العقد
                </Link>
                <ExtendContractButton 
                  contractId={contract.id} 
                  isActive={contract.status === 'ACTIVE'} 
                />
                <TerminateContractButton contractId={contract.id} />
              </>
            )}
            <div className="flex gap-3">
              <GenerateWordButton 
                contractId={contract.id}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors"
              >
                📄 إنتاج وثيقة العقد (Word)
              </GenerateWordButton>
            </div>
          </div>
        </div>

        {/* زر حذف العقد - متاح فقط لمدير الموارد البشرية */}
        <DeleteContractButton 
          contractId={contract.id} 
          isHRManager={session.user.role === 'HR_MANAGER'} 
        />

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
              <dt className="text-sm font-medium text-gray-500">رقم العقد الرسمي</dt>
              <dd className="mt-1 text-sm text-gray-900">{contract.contractNumber || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">تاريخ البداية</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(contract.startDate).toLocaleDateString('ar-SA-u-ca-gregory')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">تاريخ النهاية</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(contract.endDate).toLocaleDateString('ar-SA-u-ca-gregory')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">نوع الباقة</dt>
              <dd className="mt-1 text-sm text-gray-900">{contract.packageName || contract.packageType}</dd>
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

        {/* قسم الملاحظات */}
        {contract.notes && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ملاحظات العقد</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {contract.notes}
              </p>
            </div>
          </div>
        )}

        {/* قسم غرامة التأخير */}
        {(() => {
          const contractWithPenalty = contract as typeof contract & ContractWithPenalty;
          return (contractWithPenalty.delayDays && contractWithPenalty.delayDays > 0) || contractWithPenalty.penaltyAmount ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">غرامة التأخير</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-red-700">عدد أيام التأخير</dt>
                    <dd className="mt-1 text-lg font-bold text-red-900">{contractWithPenalty.delayDays || 0} يوم</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-red-700">إجمالي الغرامة</dt>
                    <dd className="mt-1 text-lg font-bold text-red-900">
                      {(contractWithPenalty.penaltyAmount || 0).toLocaleString('ar-SA')} ريال
                    </dd>
                  </div>
                </div>
                {contractWithPenalty.delayDays && contractWithPenalty.delayDays > 0 && (
                  <div className="mt-3 text-sm text-red-700">
                    معدل الغرامة: {contractWithPenalty.penaltyRate || 120} ريال لكل يوم تأخير
                  </div>
                )}
              </div>
            </div>
          ) : null;
        })()}

        {/* حاسبة غرامة التأخير - للعقود النشطة فقط */}
        <div className="mb-8">
          <PenaltyCalculator
            contractId={contract.id}
            endDate={contract.endDate.toISOString()}
            currentStatus={contract.status}
            clientName={contract.client.name}
            workerName={contract.worker.name}
          />
        </div>

        {/* زر حذف العقد - متاح فقط لمدير الموارد البشرية */}
        <DeleteContractButton 
          contractId={contract.id} 
          isHRManager={session.user.role === 'HR_MANAGER' || session.user.role === 'HR'} 
        />
      </div>
    </DashboardLayout>
  );
}