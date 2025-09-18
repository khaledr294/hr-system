"use client";
type Package = {
  id: string;
  name: string;
  duration: number;
  price: number;
};
import { Worker } from '@/types/worker';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';



const contractSchema = z.object({
  workerId: z.string().min(1, 'يجب اختيار العاملة'),
  clientId: z.string().min(1, 'يجب اختيار العميل'),
  marketerId: z.string().min(1, 'يجب اختيار المسوق'),
  startDate: z.string().min(1, 'يجب تحديد تاريخ بداية العقد'),
  packageType: z.string().min(1, 'يجب اختيار الباقة'),
  totalAmount: z.number().min(1, 'يجب إدخال المبلغ'),
  notes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<Array<{ id: string; name: string; code: string; status: string }>>([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [marketers, setMarketers] = useState<Array<{ id: string; name: string }>>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [contractDuration, setContractDuration] = useState<number>(30);
  const [contractPrice, setContractPrice] = useState<number>(1000);

  const clientId = searchParams.get('clientId');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: clientId || '',
      packageType: '',
      totalAmount: 1000,
      notes: '',
    },
  });
  // جلب الباقات من API الباقات عند تحميل الصفحة
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const pkgs: Package[] = await response.json();
          setPackages(pkgs);
          if (pkgs.length > 0) {
            setSelectedPackage(pkgs[0].id);
            setContractDuration(pkgs[0].duration);
            setContractPrice(pkgs[0].price);
            setValue('packageType', pkgs[0].id);
            setValue('totalAmount', pkgs[0].price);
          }
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };
    fetchPackages();
  }, [setValue]);

  useEffect(() => {
    const fetchAvailableWorkers = async () => {
      try {
        const response = await fetch('/api/workers?status=AVAILABLE');
        if (response.ok) {
          const workers = await response.json();
          setAvailableWorkers(
            workers.map((w: Worker) => ({
              id: w.id,
              name: w.name,
              code: w.code,
              status: w.status
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching available workers:', error);
      }
    };
    fetchAvailableWorkers();
    const fetchMarketers = async () => {
      try {
        const response = await fetch('/api/marketers');
        if (response.ok) {
          const marketersList = await response.json();
          setMarketers(marketersList);
        }
      } catch (error) {
        console.error('Error fetching marketers:', error);
      }
    };
    fetchMarketers();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (response.ok) {
          const client = await response.json();
          setSelectedClient(client);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      }
    };
    fetchClient();
  }, [clientId]);

  const onSubmit = async (data: ContractFormData) => {
    try {
      setIsSubmitting(true);
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      // جلب مدة الباقة المختارة
      const pkg = packages.find((p: Package) => p.id === data.packageType);
      if (pkg) {
        endDate.setDate(startDate.getDate() + pkg.duration);
      }
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'ACTIVE',
          packageName: pkg ? pkg.name : data.packageType,
          notes: data.notes || '',
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.push(`/clients/${data.clientId}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحديث السعر والمدة تلقائياً عند تغيير الباقة
  const handlePackageChange = (value: string) => {
    setSelectedPackage(value);
    const pkg = packages.find((p: Package) => p.id === value);
    if (pkg) {
      setContractDuration(pkg.duration);
      setContractPrice(pkg.price);
      setValue('totalAmount', pkg.price);
      setValue('packageType', pkg.id);
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="max-w-2xl mx-auto text-right">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة عقد جديد</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {selectedClient ? (
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-right">
              <h2 className="font-medium text-gray-900">العميل</h2>
              <p className="text-gray-600">{selectedClient.name}</p>
            </div>
          ) : (
            <div className="text-red-600">لم يتم تحديد العميل</div>
          )}
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">بحث عن العاملة بالاسم</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-700 focus:ring-indigo-700 text-lg font-semibold text-gray-900 bg-white mb-2 text-right"
              placeholder="اكتب اسم العاملة..."
              value={workerSearch}
              onChange={e => setWorkerSearch(e.target.value)}
            />
            <label className="block text-base font-bold text-indigo-900 mb-2">العاملة</label>
            <Select
              label="العاملة"
              className="text-right"
              {...register('workerId')}
              error={errors.workerId?.message}
              options={availableWorkers
                .filter(worker => worker.status === 'AVAILABLE' && worker.name.includes(workerSearch))
                .map(worker => ({
                  value: worker.id,
                  label: `${worker.name} (${worker.code})`
                }))}
            />
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">اسم المسوق</label>
            <Select
              label="اسم المسوق"
              className="text-right"
              {...register('marketerId')}
              error={errors.marketerId?.message}
              options={marketers.map(marketer => ({
                value: marketer.id,
                label: marketer.name,
              }))}
            />
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ بداية العقد</label>
            <Input
              type="date"
              label="تاريخ بداية العقد"
              min={new Date().toISOString().split('T')[0]}
              className="text-right"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">نوع الباقة</label>
            {packages.length === 0 ? (
              <div className="text-gray-500 py-2">جاري تحميل الباقات أو لا توجد باقات مسجلة...</div>
            ) : (
              <Select
                label="نوع الباقة"
                className="text-right"
                {...register('packageType')}
                error={errors.packageType?.message}
                options={packages.map((pkg: Package) => ({ value: pkg.id, label: pkg.name }))}
                value={selectedPackage}
                onChange={e => handlePackageChange(e.target.value)}
              />
            )}
            <div className="mt-2 text-lg text-gray-800">
              مدة الباقة: <span className="font-bold">{contractDuration}</span> يوم<br />
              السعر الافتراضي: <span className="font-bold">{contractPrice}</span> ريال
            </div>
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">المبلغ الإجمالي</label>
            <Input
              type="number"
              label="المبلغ الإجمالي"
              className="text-right"
              {...register('totalAmount', { valueAsNumber: true })}
              error={errors.totalAmount?.message}
              value={contractPrice}
              onChange={e => {
                setContractPrice(Number(e.target.value));
                setValue('totalAmount', Number(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">ملاحظات (اختياري)</label>
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-700 focus:ring-indigo-700 text-lg text-gray-900 bg-white text-right"
              rows={3}
              {...register('notes')}
              placeholder="أدخل أي ملاحظات إضافية للعقد (اختياري)"
            />
          </div>

          <div className="flex justify-end flex-row-reverse gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <NewContractForm />
    </Suspense>
  );
}
