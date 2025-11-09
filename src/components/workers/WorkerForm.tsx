import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export interface WorkerFormData {
    name: string;
    nationality: string;
    passportNumber: string;
    dateOfBirth: string;
    specialization: string;
    baseSalary: number;
    experience: number;
    visaStatus: string;
    medicalStatus: string;
}

interface WorkerFormProps {
    onSubmit: (data: WorkerFormData) => void;
    initialData?: Partial<WorkerFormData>;
}

export function WorkerForm({ onSubmit, initialData }: WorkerFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<WorkerFormData>({
        defaultValues: initialData,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="اسم العاملة"
                    {...register('name', { required: 'اسم العاملة مطلوب' })}
                    error={errors.name?.message}
                />
                <Select
                    label="الجنسية"
                    {...register('nationality', { required: 'الجنسية مطلوبة' })}
                    error={errors.nationality?.message}
                    options={[
                        { label: 'اختر الجنسية', value: '' },
                        { label: 'فلبينية', value: 'Filipino' },
                        { label: 'اندونيسية', value: 'Indonesian' },
                        { label: 'هندية', value: 'Indian' },
                        { label: 'بنغلاديشية', value: 'Bangladeshi' },
                    ]}
                />
                <Input
                    label="رقم الجواز"
                    {...register('passportNumber', { required: 'رقم الجواز مطلوب' })}
                    error={errors.passportNumber?.message}
                />
                <Input
                    type="date"
                    label="تاريخ الميلاد"
                    {...register('dateOfBirth', { required: 'تاريخ الميلاد مطلوب' })}
                    error={errors.dateOfBirth?.message}
                />
                <Select
                    label="التخصص"
                    {...register('specialization', { required: 'التخصص مطلوب' })}
                    error={errors.specialization?.message}
                    options={[
                        { label: 'اختر التخصص', value: '' },
                        { label: 'تنظيف', value: 'Housekeeping' },
                        { label: 'رعاية أطفال', value: 'Childcare' },
                        { label: 'رعاية كبار السن', value: 'Elderly Care' },
                        { label: 'طبخ', value: 'Cooking' },
                        { label: 'أعمال عامة', value: 'General Work' },
                    ]}
                />
                <Input
                    type="number"
                    label="الراتب الأساسي"
                    {...register('baseSalary', { required: 'الراتب مطلوب', valueAsNumber: true })}
                    error={errors.baseSalary?.message}
                />
                <Input
                    type="number"
                    label="سنوات الخبرة"
                    {...register('experience', { required: 'الخبرة مطلوبة', valueAsNumber: true })}
                    error={errors.experience?.message}
                />
                <Select
                    label="حالة الفيزا"
                    {...register('visaStatus', { required: 'حالة الفيزا مطلوبة' })}
                    error={errors.visaStatus?.message}
                    options={[
                        { label: 'اختر الحالة', value: '' },
                        { label: 'سارية', value: 'Valid' },
                        { label: 'معلقة', value: 'Pending' },
                        { label: 'منتهية', value: 'Expired' },
                    ]}
                />
                <Select
                    label="الحالة الطبية"
                    {...register('medicalStatus', { required: 'الحالة الطبية مطلوبة' })}
                    error={errors.medicalStatus?.message}
                    options={[
                        { label: 'اختر الحالة', value: '' },
                        { label: 'لائق', value: 'Fit' },
                        { label: 'معلق', value: 'Pending' },
                        { label: 'غير لائق', value: 'Unfit' },
                    ]}
                />
            </div>
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                    إلغاء
                </Button>
                <Button type="submit" variant="primary">
                    {initialData ? 'تحديث بيانات العاملة' : 'تسجيل عاملة جديدة'}
                </Button>
            </div>
        </form>
    );
}
