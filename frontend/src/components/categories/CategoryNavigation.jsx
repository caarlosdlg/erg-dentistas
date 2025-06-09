import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { clsx } from 'clsx';
import { useCategorySearch } from '../../hooks/useCategories';
import { FormInput, ButtonTW, Badge } from '../ui';
import CategoryTree from './CategoryTree';

/**
 * CategoryNavigation Component
 * Main navigation component for categories with search and filtering
 */
const CategoryNavigation = ({
  categories = [],
  onCategorySelect,
  selectedCategoryId = null,
  showSearch = true,
  showFilters = true,
  viewMode = 'tree', // 'tree' | 'grid' | 'list'
  onViewModeChange,
  className = '',
  searchPlaceholder = 'Buscar categorías...',
  compact = false
}) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading: searchLoading,
    error: searchError
  } = useCategorySearch();

  const [showFiltersPanel, setShowFiltersPanel] = React.useState(false);
  
  const displayCategories = searchTerm ? searchResults : categories;

  const handleCategorySelect = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const getCategoryStats = () => {
    const totalCategories = categories.length;
    const totalTreatments = categories.reduce((sum, cat) => sum + (cat.treatment_count || 0), 0);
    return { totalCategories, totalTreatments };
  };

  const stats = getCategoryStats();

  return (
    <div className={clsx('category-navigation', className)}>
      {/* Header */}
      <div className="category-nav-header mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">
            Categorías
          </h2>
          
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('tree')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'tree' 
                    ? 'bg-white shadow-sm text-primary-600' 
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
                title="Vista de árbol"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={clsx(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-primary-600' 
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
                title="Vista de grilla"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
          <Badge variant="info" size="sm">
            {stats.totalCategories} categorías
          </Badge>
          <Badge variant="secondary" size="sm">
            {stats.totalTreatments} tratamientos
          </Badge>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="space-y-3">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <FormInput
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  className="w-full"
                  size={compact ? 'sm' : 'md'}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            )}

            {/* Search Results Indicator */}
            {searchTerm && (
              <div className="text-sm text-neutral-600">
                {searchError ? (
                  <span className="text-red-600">Error en la búsqueda</span>
                ) : (
                  <span>
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} 
                    para "{searchTerm}"
                  </span>
                )}
              </div>
            )}

            {/* Filters Toggle */}
            {showFilters && (
              <div className="flex items-center space-x-2">
                <ButtonTW
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  leftIcon={Filter}
                >
                  Filtros
                </ButtonTW>
                
                {searchTerm && (
                  <ButtonTW
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar búsqueda
                  </ButtonTW>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFiltersPanel && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg border">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Filtrar por:</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Número de tratamientos
                </label>
                <div className="flex items-center space-x-2">
                  <select className="text-sm border border-neutral-300 rounded px-2 py-1">
                    <option value="">Todos</option>
                    <option value="0">Sin tratamientos</option>
                    <option value="1-5">1-5 tratamientos</option>
                    <option value="6-20">6-20 tratamientos</option>
                    <option value="21+">Más de 20</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <ButtonTW
                  variant="outline"
                  size="xs"
                  onClick={() => setShowFiltersPanel(false)}
                  fullWidth
                >
                  Aplicar filtros
                </ButtonTW>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Display */}
      <div className="category-nav-content">
        {viewMode === 'tree' ? (
          <CategoryTree
            categories={displayCategories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            searchTerm={searchTerm}
            compact={compact}
            showItemCount={true}
          />
        ) : viewMode === 'grid' ? (
          <CategoryGrid
            categories={displayCategories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            compact={compact}
          />
        ) : (
          <CategoryList
            categories={displayCategories}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            compact={compact}
          />
        )}
      </div>
    </div>
  );
};

/**
 * CategoryGrid Component
 * Grid view for categories
 */
const CategoryGrid = ({ categories, onCategorySelect, selectedCategoryId, compact }) => {
  const flattenCategories = (categories) => {
    let flattened = [];
    categories.forEach(category => {
      flattened.push(category);
      if (category.children) {
        flattened = flattened.concat(flattenCategories(category.children));
      }
    });
    return flattened;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className={clsx(
      'grid gap-3',
      compact 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    )}>
      {flatCategories.map(category => (
        <div
          key={category.id}
          onClick={() => onCategorySelect(category)}
          className={clsx(
            'p-4 border rounded-lg cursor-pointer transition-all duration-200',
            {
              'border-primary-300 bg-primary-50': category.id === selectedCategoryId,
              'border-neutral-200 hover:border-neutral-300 hover:shadow-sm': category.id !== selectedCategoryId
            }
          )}
        >
          <h4 className="font-medium text-neutral-800 mb-1">{category.name}</h4>
          {category.description && (
            <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
              {category.description}
            </p>
          )}
          {category.treatment_count > 0 && (
            <Badge variant="secondary" size="sm">
              {category.treatment_count} tratamientos
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * CategoryList Component
 * List view for categories
 */
const CategoryList = ({ categories, onCategorySelect, selectedCategoryId, compact }) => {
  const flattenCategories = (categories, depth = 0) => {
    let flattened = [];
    categories.forEach(category => {
      flattened.push({ ...category, depth });
      if (category.children) {
        flattened = flattened.concat(flattenCategories(category.children, depth + 1));
      }
    });
    return flattened;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-1">
      {flatCategories.map(category => (
        <div
          key={category.id}
          onClick={() => onCategorySelect(category)}
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
            `ml-${Math.min(category.depth * 4, 16)}`,
            {
              'bg-primary-50 text-primary-700': category.id === selectedCategoryId,
              'hover:bg-neutral-50': category.id !== selectedCategoryId
            }
          )}
        >
          <div>
            <h4 className="font-medium">{category.name}</h4>
            {category.description && (
              <p className="text-sm text-neutral-600 mt-1">{category.description}</p>
            )}
          </div>
          
          {category.treatment_count > 0 && (
            <Badge variant="secondary" size="sm">
              {category.treatment_count}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryNavigation;
