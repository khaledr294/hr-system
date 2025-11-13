import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import WorkerActions from '../../../components/workers/WorkerActions';
import WorkerStatusManager from '@/components/workers/WorkerStatusManager';
import { requireSession, getSession } from '@/lib/require';

export default async function WorkerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession(); // This will redirect if not authenticated
  const session = await getSession();

  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: {
      id,
    },
    include: {
      nationalitySalary: true,
    },
  });

  if (!worker) {
    redirect('/workers');
  }

  // إذا كان هناك حجز، جلب اسم المستخدم
  let reservedByUserName = worker.reservedBy;
  if (worker.status === 'RESERVED' && worker.reservedBy) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: worker.reservedBy },
        select: { name: true, email: true }
      });
      if (user) {
        reservedByUserName = user.name || user.email || worker.reservedBy;
      }
    } catch (error) {
      console.error('Error fetching user name for reservation:', error);
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <dd className="mt-1 text-sm text-gray-900">{worker.dateOfBirth ? new Date(worker.dateOfBirth).toLocaleDateString('ar-SA-u-ca-gregory') : '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الجوال</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الجواز</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.passportNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الحدود</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.borderNumber || '-'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العمل والمالية</h2>
            <dl className="grid grid-cols-1 gap-4">
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
                <dt className="text-sm font-medium text-gray-500">اسم المكتب</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.officeName || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الوصول</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {worker.arrivalDate
                    ? new Date(worker.arrivalDate).toLocaleDateString('ar-SA-u-ca-gregory')
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الآيبان</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{worker.iban || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الديانة</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {worker.religion === 'Muslim' ? 'مسلم' :
                   worker.religion === 'Non-Muslim' ? 'غير مسلم' :
                   worker.religion || 'غير محدد'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">فرع الإقامة</dt>
                <dd className="mt-1 text-sm text-gray-900">{worker.residenceBranch || 'غير محدد'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">الحالة والمعلومات الإضافية</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">الحالة</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-sm rounded ${
                      worker.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : worker.status === 'RENTED'
                        ? 'bg-blue-100 text-blue-800'
                        : worker.status === 'RESERVED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {worker.status === 'AVAILABLE' 
                     ? 'متاحة' 
                     : worker.status === 'RENTED' 
                     ? 'تم التأجير'
                     : worker.status === 'RESERVED'
                     ? 'محجوزة'
                     : 'غير متاحة'}
                  </span>
                  {worker.status === 'RESERVED' && worker.reservedBy && (
                    <div className="mt-1 text-xs text-gray-600">
                      محجوزة بواسطة: {reservedByUserName}
                    </div>
                  )}
                  {worker.status === 'RESERVED' && worker.reservedAt && (
                    <div className="text-xs text-gray-500">
                      تاريخ الحجز: {new Date(worker.reservedAt).toLocaleDateString('ar')}
                    </div>
                  )}
                  {worker.status === 'RESERVED' && worker.reservationNotes && (
                    <div className="text-xs text-gray-600 mt-1">
                      ملاحظة: {worker.reservationNotes}
                    </div>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الإضافة</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(worker.createdAt).toLocaleDateString('ar-SA-u-ca-gregory')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">آخر تحديث</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(worker.updatedAt).toLocaleDateString('ar-SA-u-ca-gregory')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* مكون إدارة حالة العاملة */}
        <div className="mt-8">
          <WorkerStatusManager 
            workerId={worker.id} 
            currentStatus={worker.status}
            isHRManager={session?.user?.role === 'HR_MANAGER'}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}