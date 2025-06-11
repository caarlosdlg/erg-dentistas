import React, { memo, useCallback, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAccessibility, useFeedback } from '../ux';

/**
 * Optimized Data Table with performance enhancements
 */
const DataTable = memo(({
  data = [],
  columns = [],
  loading = false,
  error = null,
  sortable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  onSort,
  onFilter,
  onRowClick,
  className = '',
  emptyMessage = 'No hay datos disponibles',
  loadingRows = 5,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { announce } = useAccessibility();

  // Handle sorting
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    onSort?.({ key, direction });
    announce(`Tabla ordenada por ${key} ${direction === 'asc' ? 'ascendente' : 'descendente'}`);
  }, [sortable, sortConfig, onSort, announce]);

  // Handle filtering
  const handleFilter = useCallback((columnKey, value) => {
    if (!filterable) return;
    
    const newFilters = { ...filters, [columnKey]: value };
    if (!value) delete newFilters[columnKey];
    
    setFilters(newFilters);
    setCurrentPage(1);
    onFilter?.(newFilters);
  }, [filterable, filters, onFilter]);

  // Filtered and sorted data
  const processedData = React.useMemo(() => {
    let result = [...data];
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [data, filters, sortConfig]);

  // Paginated data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <tbody>
      {Array.from({ length: loadingRows }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          {columns.map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
              <div className="h-4 bg-gray-200 rounded"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">⚠️ Error al cargar datos</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Filters */}
      {filterable && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {columns.filter(col => col.filterable !== false).map(column => (
            <div key={column.key}>
              <input
                type="text"
                placeholder={`Filtrar por ${column.header}`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilter(column.key, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300" role="table">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                  aria-sort={
                    sortConfig.key === column.key 
                      ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && (
                      <span className="flex flex-col">
                        <span className={clsx(
                          'text-xs',
                          sortConfig.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-primary-600' : 'text-gray-400'
                        )}>▲</span>
                        <span className={clsx(
                          'text-xs -mt-1',
                          sortConfig.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-primary-600' : 'text-gray-400'
                        )}>▼</span>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {loading ? (
            <LoadingSkeleton />
          ) : paginatedData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={clsx(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render 
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, processedData.length)}
            </span>{' '}
            de <span className="font-medium">{processedData.length}</span> resultados
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            
            <span className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-primary-50 text-primary-600">
              {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              aria-label="Página siguiente"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;
