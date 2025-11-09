"use client";

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
  return (
    <div className="overflow-x-auto glass ring-soft rounded-2xl">
      <table className="min-w-full">
        <thead className={
          [
            'bg-white/70',
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
                    'border-b border-white/60',
                    compact ? 'py-2 pr-3' : 'py-4 pr-4'
                  ].join(' ')
                }
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white/70">
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={
                onRowClick ? 'cursor-pointer hover:bg-white/80 transition-colors duration-200 border-b border-white/50' : 'hover:bg-white/75 transition-colors duration-200 border-b border-white/50'
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
