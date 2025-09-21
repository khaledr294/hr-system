import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import WorkerActions from '../../../components/workers/WorkerActions';
import { requireSession } from '@/lib/require';

export default async function WorkerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession(); // This will redirect if not authenticated

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
                <dd className="mt-1 text-sm text-gray-900">{(worker as any).passportNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الحدود</dt>
                <dd className="mt-1 text-sm text-gray-900">{(worker as any).borderNumber || '-'}</dd>
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
                <dd className="mt-1 text-sm text-gray-900">{(worker as any).officeName || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">تاريخ الوصول</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(worker as any).arrivalDate 
                    ? new Date((worker as any).arrivalDate).toLocaleDateString('ar-SA-u-ca-gregory') 
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">رقم الآيبان</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{(worker as any).iban || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">الديانة</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <select 
                    value={(worker as any).religion || ''} 
                    className="text-sm border rounded px-2 py-1"
                    disabled
                  >
                    <option value="">غير محدد</option>
                    <option value="Muslim">مسلم</option>
                    <option value="Christian">مسيحي</option>
                    <option value="Buddhist">بوذي</option>
                    <option value="Hindu">هندوسي</option>
                    <option value="Other">أخرى</option>
                  </select>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">فرع الإقامة</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <select 
                    value={(worker as any).residenceBranch || ''} 
                    className="text-sm border rounded px-2 py-1"
                    disabled
                  >
                    <option value="">غير محدد</option>
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة">مكة</option>
                    <option value="المدينة">المدينة</option>
                    <option value="الطائف">الطائف</option>
                    <option value="أبها">أبها</option>
                    <option value="تبوك">تبوك</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </dd>
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
                  {worker.status === 'RESERVED' && (worker as any).reservedBy && (
                    <div className="mt-1 text-xs text-gray-600">
                      محجوزة بواسطة: {(worker as any).reservedBy}
                    </div>
                  )}
                  {worker.status === 'RESERVED' && (worker as any).reservedAt && (
                    <div className="text-xs text-gray-500">
                      تاريخ الحجز: {new Date((worker as any).reservedAt).toLocaleDateString('ar')}
                    </div>
                  )}
                  {worker.status === 'RESERVED' && (worker as any).reservationNotes && (
                    <div className="text-xs text-gray-600 mt-1">
                      ملاحظة: {(worker as any).reservationNotes}
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
      </div>
    </DashboardLayout>
  );
}