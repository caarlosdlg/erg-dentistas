import React from 'react';
import { clsx } from 'clsx';

/**
 * Table component using Tailwind CSS
 * Componente de tabla mejorado para mostrar datos en DentalERP
 */
const Table = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      striped = false,
      bordered = true,
      hoverable = true,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'w-full text-left';
    
    const variantClasses = {
      default: 'bg-white',
      minimal: 'bg-transparent',
      filled: 'bg-neutral-50',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table
          ref={ref}
          className={clsx(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

/**
 * Table Header component
 */
const TableHeader = React.forwardRef(({ children, className, ...props }, ref) => (
  <thead
    ref={ref}
    className={clsx('bg-neutral-50 border-b border-neutral-200', className)}
    {...props}
  >
    {children}
  </thead>
));

TableHeader.displayName = 'Table.Header';

/**
 * Table Body component
 */
const TableBody = React.forwardRef(({ children, striped, className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={clsx(
      'bg-white divide-y divide-neutral-200',
      striped && '[&>tr:nth-child(even)]:bg-neutral-50',
      className
    )}
    {...props}
  >
    {children}
  </tbody>
));

TableBody.displayName = 'Table.Body';

/**
 * Table Row component
 */
const TableRow = React.forwardRef(
  ({ children, clickable, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'border-b border-neutral-200 last:border-b-0',
        clickable && 'cursor-pointer hover:bg-neutral-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'Table.Row';

/**
 * Table Header Cell component
 */
const TableHeaderCell = React.forwardRef(
  (
    { 
      children, 
      sortable, 
      sortDirection, 
      onSort, 
      align = 'left',
      className, 
      ...props 
    }, 
    ref
  ) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <th
        ref={ref}
        className={clsx(
          'px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider',
          alignClasses[align],
          sortable && 'cursor-pointer hover:text-neutral-700 select-none',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortable && (
            <svg 
              className={clsx(
                'w-4 h-4 transition-transform',
                sortDirection === 'asc' && 'rotate-180',
                !sortDirection && 'text-neutral-300'
              )}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
      </th>
    );
  }
);

TableHeaderCell.displayName = 'Table.HeaderCell';

/**
 * Table Cell component
 */
const TableCell = React.forwardRef(
  ({ children, align = 'left', className, ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <td
        ref={ref}
        className={clsx(
          'px-6 py-4 whitespace-nowrap text-sm text-neutral-900',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'Table.Cell';

/**
 * Table Footer component
 */
const TableFooter = React.forwardRef(({ children, className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={clsx('bg-neutral-50 border-t border-neutral-200', className)}
    {...props}
  >
    {children}
  </tfoot>
));

TableFooter.displayName = 'Table.Footer';

/**
 * Table Caption component
 */
const TableCaption = React.forwardRef(({ children, className, ...props }, ref) => (
  <caption
    ref={ref}
    className={clsx('py-2 text-sm text-neutral-500', className)}
    {...props}
  >
    {children}
  </caption>
));

TableCaption.displayName = 'Table.Caption';

// Assign sub-components
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;
Table.Footer = TableFooter;
Table.Caption = TableCaption;

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableFooter,
  TableCaption,
};

export default Table;
