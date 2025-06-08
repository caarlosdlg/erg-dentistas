import React from 'react';
import clsx from 'clsx';

const Table = ({
  data = [],
  columns = [],
  variant = 'default',
  size = 'md',
  striped = false,
  hoverable = true,
  loading = false,
  emptyMessage = 'No data available',
  className,
  ...props
}) => {
  const variantClasses = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    borderless: '',
    elevated: 'shadow-lg border border-gray-200'
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  if (loading) {
    return (
      <div className="w-full border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 h-4 bg-gray-300 rounded" />
              ))}
            </div>
          </div>
          {/* Body skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-200 p-4">
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex-1 h-4 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={clsx(
        'w-full rounded-lg border border-gray-200 bg-white',
        className
      )}>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg 
            className="w-12 h-12 mb-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'w-full overflow-hidden rounded-lg bg-white',
      variantClasses[variant],
      className
    )} {...props}>
      <div className="overflow-x-auto">
        <table className={clsx(
          'w-full',
          sizeClasses[size]
        )}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={clsx(
                    'text-left font-semibold text-gray-900 uppercase tracking-wider',
                    paddingClasses[size],
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={clsx(
                  striped && rowIndex % 2 === 1 && 'bg-gray-50',
                  hoverable && 'hover:bg-gray-50 transition-colors duration-150'
                )}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className={clsx(
                      'text-gray-900',
                      paddingClasses[size],
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.cellClassName
                    )}
                  >
                    {column.render 
                      ? column.render(row[column.dataIndex], row, rowIndex)
                      : row[column.dataIndex]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Table subcomponents for more flexible usage
Table.Header = ({ children, className }) => (
  <thead className={clsx('bg-gray-50 border-b border-gray-200', className)}>
    {children}
  </thead>
);

Table.Body = ({ children, className }) => (
  <tbody className={clsx('divide-y divide-gray-200', className)}>
    {children}
  </tbody>
);

Table.Row = ({ children, className, hoverable = true, ...props }) => (
  <tr 
    className={clsx(
      hoverable && 'hover:bg-gray-50 transition-colors duration-150',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

Table.HeaderCell = ({ children, className, ...props }) => (
  <th 
    className={clsx(
      'px-4 py-3 text-left font-semibold text-gray-900 uppercase tracking-wider',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

Table.Cell = ({ children, className, ...props }) => (
  <td 
    className={clsx(
      'px-4 py-3 text-gray-900',
      className
    )}
    {...props}
  >
    {children}
  </td>
);

export default Table;
