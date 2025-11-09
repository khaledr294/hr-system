import { LucideIcon, Search, Package } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

// Empty State للبحث
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="لا توجد نتائج"
      description={`لم نجد أي نتائج لـ "${query}". جرب كلمات بحث أخرى.`}
    />
  );
}

// Empty State للجداول
export function TableEmptyState({ entity }: { entity: string }) {
  return (
    <EmptyState
      icon={Package}
      title={`لا توجد ${entity} بعد`}
      description={`ابدأ بإضافة ${entity} جديدة للنظام`}
    />
  );
}

