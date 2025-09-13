'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const packageTypes = [
  { value: 'MONTHLY', label: 'شهري' },
  { value: 'QUARTERLY', label: 'ربع سنوي' },
  { value: 'YEARLY', label: 'سنوي' },
];

const contractSchema = z.object({
  workerId: z.string().min(1, 'يجب اختيار العاملة'),
  clientId: z.string().min(1, 'يجب اختيار العميل'),
  marketerId: z.string().min(1, 'يجب اختيار المسوق'),
  startDate: z.string().min(1, 'يجب تحديد تاريخ بداية العقد'),
  packageType: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  totalAmount: z
    .number()
    .min(1, 'يجب إدخال المبلغ'),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [marketers, setMarketers] = useState<Array<{ id: string; name: string }>>([]);

  const clientId = searchParams.get('clientId');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: clientId || '',
    },
  });

  // Fetch available workers when the component mounts
  useEffect(() => {
    const fetchAvailableWorkers = async () => {
      try {
        const response = await fetch('/api/workers?status=AVAILABLE');
        if (response.ok) {
          const workers = await response.json();
          setAvailableWorkers(workers);
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

  // Fetch client details if we have a clientId
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

      // Calculate end date based on package type
      const startDate = new Date(data.startDate);
      const endDate = new Date(startDate);
      
      switch (data.packageType) {
        case 'MONTHLY':
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          endDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'YEARLY':
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
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
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      router.push(`/clients/${data.clientId}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating contract:', error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">إضافة عقد جديد</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {selectedClient ? (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="font-medium text-gray-900">العميل</h2>
              <p className="text-gray-600">{selectedClient.name}</p>
            </div>
          ) : (
            <div className="text-red-600">لم يتم تحديد العميل</div>
          )}


          <div>
            <Select
              label="العاملة"
              {...register('workerId')}
              error={errors.workerId?.message}
              options={availableWorkers.map(worker => ({
                value: worker.id,
                label: `${worker.name} (${worker.code})`,
              }))}
            />
          </div>

          <div>
            <Select
              label="اسم المسوق"
              {...register('marketerId')}
              error={errors.marketerId?.message}
              options={marketers.map(marketer => ({
                value: marketer.id,
                label: marketer.name,
              }))}
            />
          </div>

          <div>
            <Input
              type="date"
              label="تاريخ بداية العقد"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>

          <div>
            <Select
              label="نوع الباقة"
              {...register('packageType')}
              error={errors.packageType?.message}
              options={packageTypes}
            />
          </div>

          <div>
            <Input
              type="number"
              label="المبلغ الإجمالي"
              {...register('totalAmount', { valueAsNumber: true })}
              error={errors.totalAmount?.message}
            />
          </div>

          <div className="flex justify-end space-x-4">
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