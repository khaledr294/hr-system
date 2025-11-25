'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import { Archive, RotateCcw, Search } from 'lucide-react';
import { Permission } from '@prisma/client';

interface ArchivedWorker {
  id: string;
  originalId: string;
  name: string;
  code: number;
  archiveReason: string;
  archivedAt: Date;
  archivedBy: string | null;
  contractsCount: number;
}

export default function ArchivedWorkersClientPage() {
  const { data: session } = useSession();
  const [workers, setWorkers] = useState<ArchivedWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);

  const canManageArchive = session?.user?.permissions?.includes(Permission.MANAGE_ARCHIVE);

  useEffect(() => {
    fetchArchivedWorkers();
  }, []);

  const fetchArchivedWorkers = async () => {
    try {
      const response = await fetch('/api/archive/worker');
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (error) {
      console.error('Error fetching archived workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (archivedWorkerId: string) => {
    if (!confirm('هل أنت متأكد من استرجاع هذه العاملة؟')) {
      return;
    }

    setRestoring(archivedWorkerId);
    try {
      const response = await fetch('/api/archive/worker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivedWorkerId }),
      });

      if (response.ok) {
        alert('تم استرجاع العاملة بنجاح');
        fetchArchivedWorkers();
      } else {
        const error = await response.text();
        alert(`فشل استرجاع العاملة: ${error}`);
      }
    } catch (error) {
      console.error('Error restoring worker:', error);
      alert('حدث خطأ أثناء استرجاع العاملة');
    } finally {
      setRestoring(null);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const search = searchTerm.toLowerCase();
    return (
      worker.name.toLowerCase().includes(search) ||
      worker.code.toString().includes(search) ||
      worker.archiveReason.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Archive className="w-8 h-8" />
              أرشيف العاملات
            </h1>
            <p className="text-gray-600 mt-1">
              عرض العاملات المؤرشفات (المغادرات والمنقولات)
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الكود أو سبب الأرشفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">إجمالي العاملات المؤرشفات</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{workers.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">العقود المرتبطة</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {workers.reduce((sum, w) => sum + w.contractsCount, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">نتائج البحث</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{filteredWorkers.length}</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">لا توجد عاملات مؤرشفات</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الكود
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الاسم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      سبب الأرشفة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      عدد العقود
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تاريخ الأرشفة
                    </th>
                    {canManageArchive && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الإجراءات
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {worker.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {worker.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {worker.archiveReason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {worker.contractsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(worker.archivedAt)}
                      </td>
                      {canManageArchive && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRestore(worker.id)}
                            disabled={restoring === worker.id}
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {restoring === worker.id ? 'جاري الاسترجاع...' : 'استرجاع'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
