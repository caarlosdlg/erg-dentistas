import React, { useState } from 'react';
import { Search, Filter, SortAsc, Grid, List, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { FormInput, ButtonTW, Badge, Modal } from '../ui';
import { useReviews } from '../../hooks/useReviews';
import { ReviewList } from './ReviewList';
import { ReviewStats } from './ReviewStats';
import { ReviewForm } from './ReviewForm';

/**
 * ReviewsPage Component
 * Main page for browsing and managing reviews
 */
const ReviewsPage = ({
  contentType = null,
  objectId = null,
  title = 'Reseñas',
  allowCreate = true,
  allowFilters = true,
  defaultFilters = {},
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [filters, setFilters] = useState({
    rating: '',
    status: 'published',
    ...defaultFilters
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get reviews with current filters
  const {
    reviews,
    loading,
    error,
    pagination,
    createReview,
    updateReview,
    deleteReview,
    loadNextPage,
    goToPage,
    fetchReviews
  } = useReviews({
    contentType,
    objectId,
    pageSize: 12,
    ordering: sortBy,
    autoFetch: true
  });

  const handleSearch = (query) => {
    setSearchTerm(query);
    // Implement search functionality
    fetchReviews(1, { ...filters, search: query });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    fetchReviews(1, { ...filters, ordering: newSort });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchReviews(1, { ...newFilters, search: searchTerm });
  };

  const handleCreateReview = async (reviewData) => {
    try {
      await createReview(reviewData);
      setShowCreateForm(false);
    } catch (err) {
      // Error handled by hook
      throw err;
    }
  };

  const handleUpdateReview = async (reviewId, reviewData) => {
    try {
      await updateReview(reviewId, reviewData);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
    } catch (err) {
      throw err;
    }
  };

  const getSortOptions = () => [
    { value: '-created_at', label: 'Más recientes' },
    { value: 'created_at', label: 'Más antiguas' },
    { value: '-rating', label: 'Mejor calificación' },
    { value: 'rating', label: 'Peor calificación' },
    { value: '-likes_count', label: 'Más populares' }
  ];

  return (
    <div className={clsx('reviews-page', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">{title}</h1>
            <p className="text-neutral-600">
              {pagination.totalItems} reseña{pagination.totalItems !== 1 ? 's' : ''} encontrada{pagination.totalItems !== 1 ? 's' : ''}
            </p>
          </div>

          {allowCreate && (
            <ButtonTW
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              Escribir Reseña
            </ButtonTW>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <FormInput
              type="text"
              placeholder="Buscar reseñas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={Search}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-neutral-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Filters Toggle */}
            {allowFilters && (
              <ButtonTW
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={Filter}
              >
                Filtros
              </ButtonTW>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-primary-600' 
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-primary-600' 
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && allowFilters && (
          <ReviewFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          searchTerm={searchTerm}
          onRemoveFilter={(filterKey) => {
            if (filterKey === 'search') {
              setSearchTerm('');
              handleSearch('');
            } else {
              const newFilters = { ...filters };
              delete newFilters[filterKey];
              handleFilterChange(newFilters);
            }
          }}
          onClearAll={() => {
            setSearchTerm('');
            setFilters({ status: 'published' });
            fetchReviews(1, { status: 'published' });
          }}
        />
      </div>

      {/* Reviews Content */}
      <div className={clsx(
        'reviews-content',
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-6'
      )}>
        <ReviewList
          reviews={reviews}
          loading={loading}
          error={error}
          onEdit={handleUpdateReview}
          onDelete={handleDeleteReview}
          compact={viewMode === 'grid'}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <ReviewPagination
          pagination={pagination}
          onPageChange={goToPage}
          onLoadMore={loadNextPage}
          className="mt-8"
        />
      )}

      {/* Create Review Modal */}
      {showCreateForm && (
        <ReviewForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateReview}
          contentType={contentType}
          objectId={objectId}
          title="Escribir Nueva Reseña"
        />
      )}
    </div>
  );
};

/**
 * ReviewFilters Component
 * Advanced filtering panel for reviews
 */
const ReviewFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = { status: 'published' };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  return (
    <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-800">Filtros</h3>
        <ButtonTW variant="ghost" size="sm" onClick={onClose}>
          ✕
        </ButtonTW>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Rating Filter */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Calificación
          </label>
          <select
            value={localFilters.rating || ''}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="w-full text-sm border border-neutral-300 rounded px-3 py-2"
          >
            <option value="">Todas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4+ estrellas</option>
            <option value="3">3+ estrellas</option>
            <option value="2">2+ estrellas</option>
            <option value="1">1+ estrellas</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Estado
          </label>
          <select
            value={localFilters.status || 'published'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full text-sm border border-neutral-300 rounded px-3 py-2"
          >
            <option value="published">Publicadas</option>
            <option value="pending">Pendientes</option>
            <option value="reported">Reportadas</option>
            <option value="">Todas</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Fecha
          </label>
          <select
            value={localFilters.dateRange || ''}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="w-full text-sm border border-neutral-300 rounded px-3 py-2"
          >
            <option value="">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <ButtonTW variant="outline" size="sm" onClick={handleResetFilters}>
          Restablecer
        </ButtonTW>
        <ButtonTW variant="primary" size="sm" onClick={handleApplyFilters}>
          Aplicar Filtros
        </ButtonTW>
      </div>
    </div>
  );
};

/**
 * ActiveFilters Component
 * Shows currently active filters as removable badges
 */
const ActiveFilters = ({ filters, searchTerm, onRemoveFilter, onClearAll }) => {
  const getActiveFilters = () => {
    const active = [];
    
    if (searchTerm) {
      active.push({ key: 'search', label: `Búsqueda: "${searchTerm}"` });
    }
    
    if (filters.rating) {
      active.push({ key: 'rating', label: `${filters.rating}+ estrellas` });
    }
    
    if (filters.status && filters.status !== 'published') {
      active.push({ key: 'status', label: `Estado: ${filters.status}` });
    }
    
    if (filters.dateRange) {
      const dateLabels = {
        today: 'Hoy',
        week: 'Esta semana',
        month: 'Este mes',
        year: 'Este año'
      };
      active.push({ key: 'dateRange', label: dateLabels[filters.dateRange] });
    }
    
    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-neutral-200">
      <span className="text-sm text-neutral-600">Filtros activos:</span>
      
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map(filter => (
          <Badge
            key={filter.key}
            variant="secondary"
            size="sm"
            className="cursor-pointer hover:bg-red-100 hover:text-red-700"
            onClick={() => onRemoveFilter(filter.key)}
          >
            {filter.label} ✕
          </Badge>
        ))}
        
        <ButtonTW
          variant="ghost"
          size="xs"
          onClick={onClearAll}
          className="text-neutral-500 hover:text-neutral-700"
        >
          Limpiar todo
        </ButtonTW>
      </div>
    </div>
  );
};

/**
 * ReviewPagination Component
 * Pagination controls for review lists
 */
const ReviewPagination = ({ pagination, onPageChange, onLoadMore, className = '' }) => {
  const { currentPage, totalPages, hasNext, hasPrevious } = pagination;

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {/* Page Info */}
      <div className="text-sm text-neutral-600">
        Página {currentPage} de {totalPages}
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-2">
        <ButtonTW
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </ButtonTW>

        {/* Page Numbers */}
        <div className="hidden md:flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            const pageNum = Math.max(1, currentPage - 2) + index;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={clsx(
                  'w-8 h-8 text-sm rounded',
                  pageNum === currentPage
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <ButtonTW
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </ButtonTW>

        {/* Load More Option */}
        {hasNext && (
          <ButtonTW
            variant="primary"
            size="sm"
            onClick={onLoadMore}
            className="ml-2"
          >
            Cargar Más
          </ButtonTW>
        )}
      </div>
    </div>
  );
};

export { ReviewsPage, ReviewFilters, ActiveFilters, ReviewPagination };
export default ReviewsPage;
