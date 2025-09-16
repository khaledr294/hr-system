import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import WorkerActions from '../../../components/workers/WorkerActions';

export default async function WorkerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const worker = await prisma.worker.findUnique({
    where: {
      id: params.id,
    },
    include: {
      nationalitySalary: true,
    },
  });

  if (!worker) {
    redirect('/workers');
  }


  return (
    <DashboardLayout>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <WorkerActions workerId={worker.id} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {worker.name}
          </h1>
          <p className="text-sm text-gray-500">كود العاملة: {worker.code}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">الجنسية</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.nationality}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الإقامة</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.residencyNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الميلاد</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.dateOfBirth ? new Date(worker.dateOfBirth).toLocaleDateString('en-US') : '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الجوال</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الراتب الأساسي</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="font-bold text-green-700 text-lg">
                    {worker.salary
                      ? `${Math.round(worker.salary)} ريال`
                      : worker.nationalitySalary?.salary
                        ? `${Math.round(worker.nationalitySalary.salary)} ريال`
                        : '-'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {worker.salary
                      ? '(راتب فردي محدد)' 
                      : worker.nationalitySalary?.salary
                        ? `(راتب ${worker.nationality} حسب جدول الجنسيات)`
                        : '(لا يوجد راتب محدد)'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الحالة</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-sm rounded ${
                      worker.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : worker.status === 'RENTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {worker.status === 'AVAILABLE' ? 'متاحة' 
                     : worker.status === 'RENTED' ? 'تم التأجير'
                     : 'غير متاحة'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الإضافة</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(worker.createdAt).toLocaleDateString('ar-SA')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">آخر تحديث</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(worker.updatedAt).toLocaleDateString('ar-SA')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}