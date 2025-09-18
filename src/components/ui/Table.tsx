"use client";

import { useTheme } from "@/components/ThemeProvider";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  compact?: boolean;
  stickyHeader?: boolean;
}

export default function Table<T>({
  columns,
  data,
  onRowClick,
  compact = false,
  stickyHeader = false,
}: TableProps<T>) {
  const { theme } = useTheme();
  const isPremium = theme === 'premium';
  return (
    <div className={isPremium ? 'overflow-x-auto glass ring-soft rounded-2xl' : 'overflow-x-auto bg-white border-2 border-slate-900'}>
      <table className="min-w-full">
        <thead className={
          [
            isPremium ? 'bg-white/70' : 'bg-slate-200',
            stickyHeader ? 'sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60' : ''
          ].join(' ').trim()
        }>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                scope="col"
                className={
                  [
                    'text-right text-sm font-bold text-slate-900',
                    isPremium ? 'border-b border-white/60' : 'border-b-2 border-slate-900',
                    compact ? 'py-2 pr-3' : 'py-4 pr-4'
                  ].join(' ')
                }
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={isPremium ? 'bg-white/70' : 'bg-white'}>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={
                isPremium
                  ? (onRowClick ? 'cursor-pointer hover:bg-white/80 transition-colors duration-200 border-b border-white/50' : 'hover:bg-white/75 transition-colors duration-200 border-b border-white/50')
                  : (onRowClick ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-200 border-b border-slate-300' : 'hover:bg-slate-50 transition-colors duration-200 border-b border-slate-300')
              }
            >
              {columns.map((column) => (
                <td
                  key={String(column.accessor)}
                  className={[
                    'whitespace-nowrap text-sm text-slate-900 font-bold',
                    compact ? 'py-2 pr-3' : 'py-4 pr-4'
                  ].join(' ')}
                >
                  {column.render
                    ? column.render(item[column.accessor], item)
                    : (item[column.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}