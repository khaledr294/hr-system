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
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';



const contractSchema = z.object({
  workerId: z.string().min(1, 'يجب اختيار العاملة'),
  clientId: z.string().min(1, 'يجب اختيار العميل'),
  marketerId: z.string().min(1, 'يجب اختيار المسوق'),
  startDate: z.string()
    .min(1, 'يجب تحديد تاريخ بداية العقد')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'يجب أن يكون التاريخ بصيغة يوم/شهر/سنة (مثال: 15/03/2024)'),
  endDate: z.string().optional(),
  packageType: z.string().min(1, 'يجب اختيار الباقة'),
  totalAmount: z.number().min(1, 'يجب إدخال المبلغ'),
  notes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<Array<{ id: string; name: string; code: string; status: string }>>([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [marketers, setMarketers] = useState<Array<{ id: string; name: string }>>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [contractDuration, setContractDuration] = useState<number>(30);
  const [contractPrice, setContractPrice] = useState<number>(1000);
  const [customEndDate, setCustomEndDate] = useState<boolean>(false);
  const [endDateValue, setEndDateValue] = useState<string>('');
  const [currentUserJobTitle, setCurrentUserJobTitle] = useState<string | null>(null);
  const [isCurrentUserMarketer, setIsCurrentUserMarketer] = useState(false);

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
    
    // جلب المسوقين من Users حسب JobTitle
    const fetchMarketers = async () => {
      try {
        const response = await fetch('/api/users/marketers');
        if (response.ok) {
          const marketersList = await response.json();
          setMarketers(marketersList);
          
          // التحقق من JobTitle للمستخدم الحالي
          if (session?.user?.id) {
            const userResponse = await fetch(`/api/users/${session.user.id}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentUserJobTitle(userData.jobTitle?.nameAr || null);
              
              // إذا كان المستخدم الحالي مسوقاً
              const isMarketer = userData.jobTitle?.nameAr === 'مسوق';
              setIsCurrentUserMarketer(isMarketer);
              
              if (isMarketer) {
                // تعيين المسوق الحالي تلقائياً
                setValue('marketerId', session.user.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching marketers:', error);
      }
    };
    fetchMarketers();
  }, [session, setValue]);

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
      // تحويل التاريخ من نمط dd/mm/yyyy إلى Date
      const dateMatch = data.startDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!dateMatch) {
        alert('يرجى إدخال التاريخ بالصيغة الصحيحة: يوم/شهر/سنة');
        setIsSubmitting(false);
        return;
      }
      const [, day, month, year] = dateMatch;
      const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (isNaN(startDate.getTime())) {
        alert('التاريخ المدخل غير صحيح');
        setIsSubmitting(false);
        return;
      }
      
      let endDate: Date;
      
      if (customEndDate && data.endDate) {
        // استخدام تاريخ النهاية المخصص
        const endDateMatch = data.endDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!endDateMatch) {
          alert('يرجى إدخال تاريخ النهاية بالصيغة الصحيحة: يوم/شهر/سنة');
          setIsSubmitting(false);
          return;
        }
        const [, endDay, endMonth, endYear] = endDateMatch;
        endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
        
        if (isNaN(endDate.getTime())) {
          alert('تاريخ النهاية المدخل غير صحيح');
          setIsSubmitting(false);
          return;
        }
        
        if (endDate <= startDate) {
          alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
          setIsSubmitting(false);
          return;
        }
      } else {
        // حساب تاريخ النهاية من مدة الباقة
        endDate = new Date(startDate);
        const pkg = packages.find((p: Package) => p.id === data.packageType);
        if (pkg) {
          endDate.setDate(startDate.getDate() + pkg.duration);
        }
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
          packageName: packages.find((p: Package) => p.id === data.packageType)?.name || data.packageType,
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
            {isCurrentUserMarketer ? (
              // إذا كان المستخدم مسوقاً: إظهار اسمه فقط (غير قابل للتغيير)
              <div className="block w-full rounded-md border-2 border-gray-300 bg-gray-100 shadow-sm px-3 py-2 text-lg font-semibold text-gray-700">
                {session?.user?.name || 'المسوق الحالي'}
              </div>
            ) : (
              // إذا كان HR_MANAGER: يختار من القائمة
              <Select
                label="اسم المسوق"
                className="text-right"
                {...register('marketerId')}
                error={errors.marketerId?.message}
                disabled={isCurrentUserMarketer}
                options={marketers.map(marketer => ({
                  value: marketer.id,
                  label: marketer.name,
                }))}
              />
            )}
            {errors.marketerId && (
              <p className="mt-1 text-sm text-red-600">{errors.marketerId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ بداية العقد</label>
            <Input
              type="text"
              label="تاريخ بداية العقد"
              placeholder="يوم/شهر/سنة (مثال: 15/03/2024)"
              pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
              maxLength={10}
              className="text-right"
              {...register('startDate')}
              error={errors.startDate?.message}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                let value = input.value.replace(/\D/g, ''); // إزالة غير الأرقام
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2);
                }
                if (value.length >= 5) {
                  value = value.slice(0, 5) + '/' + value.slice(5, 9);
                }
                input.value = value;
              }}
            />
            <div className="text-sm text-gray-600 mt-1">
              أدخل التاريخ بصيغة يوم/شهر/سنة (مثال: 15/03/2024)
            </div>
          </div>

          {/* خيار تحديد تاريخ النهاية */}
          <div>
            <label className="flex items-center gap-2 text-base font-bold text-indigo-900 mb-4">
              <input
                type="checkbox"
                checked={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.checked);
                  if (!e.target.checked) {
                    setEndDateValue('');
                    setValue('endDate', '');
                  }
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              تحديد تاريخ نهاية مخصص للعقد
            </label>
            
            {customEndDate && (
              <div>
                <label className="block text-base font-bold text-indigo-900 mb-2">تاريخ نهاية العقد</label>
                <Input
                  type="text"
                  label="تاريخ نهاية العقد"
                  placeholder="يوم/شهر/سنة (مثال: 15/06/2025)"
                  pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                  maxLength={10}
                  className="text-right"
                  {...register('endDate')}
                  value={endDateValue}
                  onChange={(e) => setEndDateValue(e.target.value)}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    let value = input.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2);
                    }
                    if (value.length >= 5) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9);
                    }
                    input.value = value;
                    setEndDateValue(value);
                    setValue('endDate', value);
                  }}
                />
                <div className="text-sm text-gray-600 mt-1">
                  أدخل التاريخ بصيغة يوم/شهر/سنة (مثال: 15/06/2025)
                </div>
              </div>
            )}
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
              مدة الباقة: <span className="font-bold">{contractDuration}</span> يوم
              {customEndDate && (
                <span className="text-amber-600 text-sm"> (سيتم تجاهلها لصالح التاريخ المخصص)</span>
              )}<br />
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

