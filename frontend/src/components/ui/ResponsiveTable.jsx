import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Badge, Button } from './index';

/**
 * Responsive Table Component
 * Automatically converts to card layout on mobile devices
 */
const ResponsiveTable = React.forwardRef(
  (
    {
      data = [],
      columns = [],
      mobileBreakpoint = 'md',
      variant = 'default',
      striped = false,
      hoverable = true,
      className,
      emptyMessage = 'No data available',
      loading = false,
      ...props
    },
    ref
  ) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const variantClasses = {
      default: 'bg-white border border-gray-200',
      minimal: 'bg-white',
      bordered: 'bg-white border-2 border-gray-300',
      elevated: 'bg-white shadow-lg rounded-lg overflow-hidden',
    };

    const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
      if (!sortConfig.key) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }, [data, sortConfig]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!data.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx('responsive-table-container', className)} {...props}>
        {/* Desktop Table View */}
        <div className={clsx('hidden', `${mobileBreakpoint}:block`)}>
          <div className={clsx('overflow-x-auto', variantClasses[variant])}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.key || index}
                      className={clsx(
                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        column.sortable && 'cursor-pointer hover:bg-gray-100',
                        column.className
                      )}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {column.sortable && sortConfig.key === column.key && (
                          <span className="text-primary-600">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={clsx('bg-white divide-y divide-gray-200', striped && 'divide-y-0')}>
                {sortedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={clsx(
                      'transition-colors',
                      striped && rowIndex % 2 === 0 && 'bg-gray-50',
                      hoverable && 'hover:bg-gray-50'
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.key || colIndex}
                        className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          column.cellClassName
                        )}
                      >
                        {column.render 
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className={clsx('block', `${mobileBreakpoint}:hidden`, 'space-y-4')}>
          {sortedData.map((row, index) => (
            <div
              key={row.id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {columns.map((column, colIndex) => {
                if (column.hideOnMobile) return null;
                
                return (
                  <div key={column.key || colIndex} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500 mb-1 block">
                        {column.header}
                      </span>
                      <div className="text-sm text-gray-900">
                        {column.render 
                          ? column.render(row[column.key], row, index)
                          : row[column.key]
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ResponsiveTable.displayName = 'ResponsiveTable';

/**
 * Table Action Components
 */
const TableActions = ({ children, className }) => (
  <div className={clsx('flex items-center space-x-2', className)}>
    {children}
  </div>
);

const TableAction = ({ 
  children, 
  onClick, 
  variant = 'ghost', 
  size = 'xs',
  disabled = false,
  ...props 
}) => (
  <Button
    onClick={onClick}
    variant={variant}
    size={size}
    disabled={disabled}
    className="touch-manipulation"
    {...props}
  >
    {children}
  </Button>
);

/**
 * Predefined column types for common use cases
 */
const createStatusColumn = (key, header = 'Status') => ({
  key,
  header,
  render: (value) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      pending: { variant: 'warning', label: 'Pending' },
      confirmed: { variant: 'success', label: 'Confirmed' },
      cancelled: { variant: 'error', label: 'Cancelled' },
      completed: { variant: 'info', label: 'Completed' },
    };

    const config = statusConfig[value] || { variant: 'secondary', label: value };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }
});

const createActionColumn = (actions = []) => ({
  key: 'actions',
  header: 'Actions',
  render: (_, row) => (
    <TableActions>
      {actions.map((action, index) => (
        <TableAction
          key={index}
          onClick={() => action.onClick(row)}
          variant={action.variant || 'ghost'}
          disabled={action.disabled?.(row)}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label && <span className="ml-1">{action.label}</span>}
        </TableAction>
      ))}
    </TableActions>
  ),
  cellClassName: 'text-right',
  hideOnMobile: false,
});

const createDateColumn = (key, header, format = 'short') => ({
  key,
  header,
  render: (value) => {
    if (!value) return '-';
    
    const date = new Date(value);
    const options = {
      short: { 
        year: '2-digit', 
        month: 'short', 
        day: 'numeric' 
      },
      long: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit'
      }
    };

    return date.toLocaleDateString('es-ES', options[format]);
  },
  sortable: true,
});

export { 
  ResponsiveTable, 
  TableActions, 
  TableAction,
  createStatusColumn,
  createActionColumn,
  createDateColumn
};
export default ResponsiveTable;
