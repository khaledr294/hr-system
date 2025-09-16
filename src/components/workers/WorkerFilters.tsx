import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface WorkerFilterProps {
    onFilterChange: (filters: Record<string, string>) => void;
    filters: {
        status: string;
        nationality: string;
        search: string;
    };
}

export function WorkerFilters({ onFilterChange, filters }: WorkerFilterProps) {
    const handleChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('search', e.target.value)}
                className="max-w-xs"
            />
            <Select
                value={filters.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('status', e.target.value)}
                options={[{label: 'All Statuses', value: ''}, {label: 'Available', value: 'AVAILABLE'}, {label: 'Rented', value: 'RENTED'}, {label: 'On Leave', value: 'ON_LEAVE'}, {label: 'Unavailable', value: 'UNAVAILABLE'}]}
                className="max-w-xs"
            />
            <Select
                value={filters.nationality}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('nationality', e.target.value)}
                options={[{label: 'All Nationalities', value: ''}, {label: 'Filipino', value: 'Filipino'}, {label: 'Indonesian', value: 'Indonesian'}, {label: 'Indian', value: 'Indian'}, {label: 'Bangladeshi', value: 'Bangladeshi'}]}
                className="max-w-xs"
            />
            <Button
                onClick={() => onFilterChange({ status: '', nationality: '', search: '' })}
                variant="secondary"
            >
                Clear Filters
            </Button>
        </div>
    );
}