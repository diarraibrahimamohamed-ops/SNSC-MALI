import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  className?: string;
}

export function Table({ data, columns, loading = false, className = '' }: TableProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="h-12 bg-gray-200"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row) : getNestedValue(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
