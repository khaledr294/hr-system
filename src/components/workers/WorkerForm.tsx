import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const workerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    passportNumber: z.string().min(1, 'Passport number is required'),
    dateOfBirth: z.string().refine((date) => {
        const age = new Date().getFullYear() - new Date(date).getFullYear();
        return age >= 21 && age <= 45;
    }, 'Worker must be between 21 and 45 years old'),
    specialization: z.string().min(1, 'Specialization is required'),
    baseSalary: z.number().min(0, 'Salary must be a positive number'),
    skills: z.array(z.string()),
    languages: z.array(z.string()),
    experience: z.number().min(0, 'Experience must be a positive number'),
    visaStatus: z.string().min(1, 'Visa status is required'),
    medicalStatus: z.string().min(1, 'Medical status is required'),
});

type WorkerFormData = z.infer<typeof workerSchema>;

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
        resolver: zodResolver(workerSchema),
        defaultValues: initialData,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Input
                        label="Full Name"
                        {...register('name')}
                        error={errors.name?.message}
                    />
                </div>
                <div>
                    <Select
                        label="Nationality"
                        {...register('nationality')}
                        error={errors.nationality?.message}
                    >
                        <option value="">Select Nationality</option>
                        <option value="Filipino">Filipino</option>
                        <option value="Indonesian">Indonesian</option>
                        <option value="Indian">Indian</option>
                        <option value="Bangladeshi">Bangladeshi</option>
                    </Select>
                </div>
                <div>
                    <Input
                        label="Passport Number"
                        {...register('passportNumber')}
                        error={errors.passportNumber?.message}
                    />
                </div>
                <div>
                    <Input
                        type="date"
                        label="Date of Birth"
                        {...register('dateOfBirth')}
                        error={errors.dateOfBirth?.message}
                    />
                </div>
                <div>
                    <Select
                        label="Specialization"
                        {...register('specialization')}
                        error={errors.specialization?.message}
                    >
                        <option value="">Select Specialization</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Childcare">Childcare</option>
                        <option value="Elderly Care">Elderly Care</option>
                        <option value="Cooking">Cooking</option>
                        <option value="General Work">General Work</option>
                    </Select>
                </div>
                <div>
                    <Input
                        type="number"
                        label="Base Salary"
                        {...register('baseSalary', { valueAsNumber: true })}
                        error={errors.baseSalary?.message}
                    />
                </div>
                <div>
                    <Input
                        type="number"
                        label="Years of Experience"
                        {...register('experience', { valueAsNumber: true })}
                        error={errors.experience?.message}
                    />
                </div>
                <div>
                    <Select
                        label="Visa Status"
                        {...register('visaStatus')}
                        error={errors.visaStatus?.message}
                    >
                        <option value="">Select Visa Status</option>
                        <option value="Valid">Valid</option>
                        <option value="Pending">Pending</option>
                        <option value="Expired">Expired</option>
                    </Select>
                </div>
                <div>
                    <Select
                        label="Medical Status"
                        {...register('medicalStatus')}
                        error={errors.medicalStatus?.message}
                    >
                        <option value="">Select Medical Status</option>
                        <option value="Fit">Fit</option>
                        <option value="Pending">Pending</option>
                        <option value="Unfit">Unfit</option>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? 'Update Worker' : 'Register Worker'}
                </Button>
            </div>
        </form>
    );
}