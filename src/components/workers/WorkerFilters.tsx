import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface WorkerFilterProps {
    onFilterChange: (filters: any) => void;
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
                onChange={(e) => handleChange('search', e.target.value)}
                className="max-w-xs"
            />
            <Select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="max-w-xs"
            >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="UNAVAILABLE">Unavailable</option>
            </Select>
            <Select
                value={filters.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                className="max-w-xs"
            >
                <option value="">All Nationalities</option>
                <option value="Filipino">Filipino</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Indian">Indian</option>
                <option value="Bangladeshi">Bangladeshi</option>
            </Select>
            <Button
                onClick={() => onFilterChange({ status: '', nationality: '', search: '' })}
                variant="outline"
            >
                Clear Filters
            </Button>
        </div>
    );
}