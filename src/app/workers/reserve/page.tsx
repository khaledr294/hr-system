"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Worker {
  id: string;
  name: string;
  code: number;
  nationality: string;
  residencyNumber: string;
  phone: string;
  status: string;
  salary?: number;
  reservationNotes?: string;
  reservedAt?: string;
  reservedBy?: string;
  reservedByUserName?: string;
}

export default function ReserveWorkerPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [reservationNotes, setReservationNotes] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [error, setError] = useState('');

  // جلب العاملات المتاحة
  useEffect(() => {
    fetchWorkers();
  }, []);

  // تصفية العاملات حسب البحث
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWorkers(workers);
    } else {
      const filtered = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.residencyNumber.includes(searchTerm) ||
        worker.code.toString().includes(searchTerm)
      );
      setFilteredWorkers(filtered);
    }
  }, [workers, searchTerm]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workers');
      if (response.ok) {
        const data = await response.json();
        // عرض العاملات المتاحة والمحجوزة فقط
        const availableAndReserved = data.filter((worker: Worker) => 
          worker.status === 'AVAILABLE' || worker.status === 'RESERVED'
        );
        setWorkers(availableAndReserved);
      } else {
        setError('فشل في جلب بيانات العاملات');
      }
    } catch (error) {
      setError('حدث خطأ في جلب البيانات');
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (worker: Worker) => {
    setSelectedWorker(worker);
    setReservationNotes('');
    setShowReserveModal(true);
    setError('');
  };

  const confirmReservation = async () => {
    if (!selectedWorker) return;

    try {
      setReserving(selectedWorker.id);
      const response = await fetch('/api/workers/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          reservationNotes
        }),
      });

      if (response.ok) {
        setShowReserveModal(false);
        setSelectedWorker(null);
        setReservationNotes('');
        await fetchWorkers(); // إعادة جلب البيانات
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في حجز العاملة');
      }
    } catch (error) {
      setError('حدث خطأ في حجز العاملة');
      console.error('Error reserving worker:', error);
    } finally {
      setReserving(null);
    }
  };

  const handleCancelReservation = async (workerId: string) => {
    try {
      setReserving(workerId);
      const response = await fetch(`/api/workers/reserve?workerId=${workerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchWorkers(); // إعادة جلب البيانات
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إلغاء حجز العاملة');
      }
    } catch (error) {
      setError('حدث خطأ في إلغاء حجز العاملة');
      console.error('Error canceling reservation:', error);
    } finally {
      setReserving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONTRACTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'متاحة';
      case 'RESERVED':
        return 'محجوزة';
      case 'CONTRACTED':
        return 'متعاقد عليها';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">جارٍ التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">حجز العاملات</h1>
          <p className="text-gray-600">يمكنك حجز العاملات المتاحة أو إدارة حجوزاتك الحالية</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* شريط البحث */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="البحث بالاسم، الجنسية، رقم الإقامة، أو الكود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* قائمة العاملات */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكود
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الجنسية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الإقامة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الراتب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.nationality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.residencyNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.salary ? `${worker.salary.toLocaleString()} ر.س` : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(worker.status)}`}>
                        {getStatusText(worker.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {worker.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => handleReserve(worker)}
                          disabled={reserving === worker.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                        >
                          {reserving === worker.id ? 'جارٍ الحجز...' : 'حجز'}
                        </button>
                      ) : worker.status === 'RESERVED' ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCancelReservation(worker.id)}
                            disabled={reserving === worker.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                          >
                            {reserving === worker.id ? 'جارٍ الإلغاء...' : 'إلغاء الحجز'}
                          </button>
                          {worker.reservationNotes && (
                            <div className="text-xs text-gray-600">
                              <strong>ملاحظة:</strong> {worker.reservationNotes}
                            </div>
                          )}
                          {worker.reservedAt && (
                            <div className="text-xs text-gray-500">
                              محجوزة في: {new Date(worker.reservedAt).toLocaleDateString('ar')}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'لا توجد عاملات تطابق البحث' : 'لا توجد عاملات متاحة'}
            </div>
          )}
        </div>

        {/* مودال تأكيد الحجز */}
        {showReserveModal && selectedWorker && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  تأكيد حجز العاملة
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    هل تريد حجز العاملة: <strong>{selectedWorker.name}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    الكود: <strong>{selectedWorker.code}</strong>
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات الحجز (اختياري)
                  </label>
                  <textarea
                    value={reservationNotes}
                    onChange={(e) => setReservationNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أضف أي ملاحظات حول الحجز..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowReserveModal(false);
                      setSelectedWorker(null);
                      setReservationNotes('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 ml-2"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmReservation}
                    disabled={reserving === selectedWorker.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {reserving === selectedWorker.id ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}