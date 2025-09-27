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
      setError(''); // مسح أي أخطاء سابقة
      
      // إضافة timestamp لمنع الـ caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/workers?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched workers data:', data.length, 'workers');
        
        // عرض العاملات المتاحة والمحجوزة فقط
        const availableAndReserved = data.filter((worker: Worker) => 
          worker.status === 'AVAILABLE' || worker.status === 'RESERVED'
        );
        
        console.log('Available and Reserved workers:', availableAndReserved.length);
        setWorkers(availableAndReserved);
      } else {
        setError('فشل في جلب بيانات العاملات');
        console.error('Failed to fetch workers:', response.status);
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
      setError(''); // مسح أي أخطاء سابقة
      
      const response = await fetch('/api/workers/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          reservationNotes
        }),
      });

      if (response.ok) {
        console.log('Worker reserved successfully, refreshing data...');
        setShowReserveModal(false);
        setSelectedWorker(null);
        setReservationNotes('');
        
        // تحديث الحالة محلياً فوراً
        setWorkers(prev => 
          prev.map(worker => 
            worker.id === selectedWorker.id 
              ? { 
                  ...worker, 
                  status: 'RESERVED' as const, 
                  reservationNotes,
                  reservedAt: new Date().toISOString()
                } 
              : worker
          )
        );
        
        // ثم جلب البيانات من الخادم للتأكد
        await fetchWorkers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في حجز العاملة');
        console.error('Failed to reserve worker:', errorData);
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
      setError(''); // مسح أي أخطاء سابقة
      
      const response = await fetch(`/api/workers/reserve?workerId=${workerId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (response.ok) {
        console.log('Reservation cancelled successfully, refreshing data...');
        
        // تحديث الحالة محلياً فوراً للحصول على ردة فعل سريعة
        setWorkers(prev => 
          prev.map(worker => 
            worker.id === workerId 
              ? { 
                  ...worker, 
                  status: 'AVAILABLE' as const, 
                  reservedBy: undefined, 
                  reservedByUserName: undefined,
                  reservedAt: undefined,
                  reservationNotes: undefined
                } 
              : worker
          )
        );
        
        // ثم جلب البيانات من الخادم للتأكد
        await fetchWorkers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إلغاء حجز العاملة');
        console.error('Failed to cancel reservation:', errorData);
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
          <p className="text-gray-600 mb-6">يمكنك حجز العاملات المتاحة أو إدارة حجوزاتك الحالية</p>
          
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <div className="mr-4">
                  <div className="text-2xl font-bold text-green-600">
                    {workers.filter(w => w.status === 'AVAILABLE').length}
                  </div>
                  <div className="text-gray-600 text-sm">عاملات متاحة</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-600 rounded"></div>
                </div>
                <div className="mr-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {workers.filter(w => w.status === 'RESERVED').length}
                  </div>
                  <div className="text-gray-600 text-sm">عاملات محجوزة</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
                <div className="mr-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {workers.length}
                  </div>
                  <div className="text-gray-600 text-sm">إجمالي العاملات</div>
                </div>
              </div>
            </div>
          </div>
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
                    محجوزة بواسطة
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.status === 'RESERVED' && worker.reservedByUserName ? (
                        <div className="space-y-1">
                          <div className="font-medium text-blue-600">
                            {worker.reservedByUserName}
                          </div>
                          {worker.reservedAt && (
                            <div className="text-xs text-gray-500">
                              {new Date(worker.reservedAt).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
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
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 w-full"
                          >
                            {reserving === worker.id ? 'جارٍ الإلغاء...' : 'إلغاء الحجز'}
                          </button>
                          {worker.reservationNotes && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
                              <div className="font-medium text-amber-800 mb-1">ملاحظة الحجز:</div>
                              <div className="text-amber-700">{worker.reservationNotes}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">غير متاحة</span>
                      )}
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