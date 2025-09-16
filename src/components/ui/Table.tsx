interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export default function Table<T>({
  columns,
  data,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white border-2 border-slate-900">
      <table className="min-w-full">
        <thead className="bg-slate-200">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                scope="col"
                className="py-4 pr-4 text-right text-sm font-bold text-slate-900 border-b-2 border-slate-900"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-200 border-b border-slate-300' : 'hover:bg-slate-50 transition-colors duration-200 border-b border-slate-300'}
            >
              {columns.map((column) => (
                <td
                  key={String(column.accessor)}
                  className="whitespace-nowrap py-4 pr-4 text-sm text-slate-900 font-bold"
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