import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown,
  Settings 
} from 'lucide-react';

/**
 * HierarchicalFilter Component - Advanced filtering for hierarchical categories
 */
const HierarchicalFilter = ({ 
  categories = [], 
  onFilterChange, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    nivel_1: '',
    nivel_2: '',
    nivel_3: '',
    nivel_4: '',
    include_subcategorias: true,
    popular_only: false,
    precio_min: '',
    precio_max: '',
    duracion_max: '',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryLevels, setCategoryLevels] = useState({
    nivel_1: [],
    nivel_2: [],
    nivel_3: [],
    nivel_4: []
  });

  // Build category levels from hierarchical data
  useEffect(() => {
    const buildLevels = () => {
      const levels = {
        nivel_1: [],
        nivel_2: [],
        nivel_3: [],
        nivel_4: []
      };

      const extractCategories = (cats, level = 1) => {
        cats.forEach(cat => {
          if (level <= 4) {
            levels[`nivel_${level}`].push({
              id: cat.id,
              nombre: cat.nombre || cat.name,
              parent_id: cat.parent?.id || cat.parent_id,
              level: level
            });

            if (cat.children && cat.children.length > 0) {
              extractCategories(cat.children, level + 1);
            }
          }
        });
      };

      extractCategories(categories);
      setCategoryLevels(levels);
    };

    if (categories.length > 0) {
      buildLevels();
    }
  }, [categories]);

  // Filter lower-level categories based on parent selection
  const getFilteredOptions = (level) => {
    const allOptions = categoryLevels[`nivel_${level}`] || [];
    
    if (level === 1) {
      return allOptions.filter(cat => !cat.parent_id);
    }

    const parentLevel = level - 1;
    const parentId = filters[`nivel_${parentLevel}`];
    
    if (!parentId) {
      return [];
    }

    return allOptions.filter(cat => cat.parent_id === parentId);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear dependent filters when parent changes
    if (key === 'nivel_1') {
      newFilters.nivel_2 = '';
      newFilters.nivel_3 = '';
      newFilters.nivel_4 = '';
    } else if (key === 'nivel_2') {
      newFilters.nivel_3 = '';
      newFilters.nivel_4 = '';
    } else if (key === 'nivel_3') {
      newFilters.nivel_4 = '';
    }

    setFilters(newFilters);
    
    // Call parent callback
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      nivel_1: '',
      nivel_2: '',
      nivel_3: '',
      nivel_4: '',
      include_subcategorias: true,
      popular_only: false,
      precio_min: '',
      precio_max: '',
      duracion_max: ''
    };
    
    setFilters(clearedFilters);
    
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== true && value !== false
  );

  return (
    <div className="hierarchical-filter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filtros de Categorías
          </h3>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Activos
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Filtros avanzados"
          >
            <Settings className="w-4 h-4" />
            Avanzado
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Category Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Level 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría Principal
          </label>
          <select
            value={filters.nivel_1}
            onChange={(e) => handleFilterChange('nivel_1', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las categorías</option>
            {getFilteredOptions(1).map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategoría
          </label>
          <select
            value={filters.nivel_2}
            onChange={(e) => handleFilterChange('nivel_2', e.target.value)}
            disabled={!filters.nivel_1}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las subcategorías</option>
            {getFilteredOptions(2).map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidad
          </label>
          <select
            value={filters.nivel_3}
            onChange={(e) => handleFilterChange('nivel_3', e.target.value)}
            disabled={!filters.nivel_2}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las especialidades</option>
            {getFilteredOptions(3).map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Level 4 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo Específico
          </label>
          <select
            value={filters.nivel_4}
            onChange={(e) => handleFilterChange('nivel_4', e.target.value)}
            disabled={!filters.nivel_3}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos los tipos</option>
            {getFilteredOptions(4).map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Include Subcategories Option */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.include_subcategorias}
            onChange={(e) => handleFilterChange('include_subcategorias', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Incluir tratamientos de subcategorías
          </span>
        </label>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Filtros Avanzados
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Popular Filter */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.popular_only}
                  onChange={(e) => handleFilterChange('popular_only', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Solo tratamientos populares
                </span>
              </label>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Mínimo ($)
              </label>
              <input
                type="number"
                value={filters.precio_min}
                onChange={(e) => handleFilterChange('precio_min', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Máximo ($)
              </label>
              <input
                type="number"
                value={filters.precio_max}
                onChange={(e) => handleFilterChange('precio_max', e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración Máxima (min)
              </label>
              <input
                type="number"
                value={filters.duracion_max}
                onChange={(e) => handleFilterChange('duracion_max', e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Filtros Activos:
          </h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === true || value === false) return null;
              
              let label = key;
              let displayValue = value;
              
              // Convert filter keys to readable labels
              const labelMap = {
                nivel_1: 'Categoría',
                nivel_2: 'Subcategoría', 
                nivel_3: 'Especialidad',
                nivel_4: 'Tipo',
                precio_min: 'Precio mín',
                precio_max: 'Precio máx',
                duracion_max: 'Duración máx'
              };
              
              if (labelMap[key]) {
                label = labelMap[key];
              }
              
              // For category filters, show the category name
              if (key.startsWith('nivel_')) {
                const level = parseInt(key.split('_')[1]);
                const category = categoryLevels[key]?.find(cat => cat.id === value);
                displayValue = category?.nombre || value;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {label}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalFilter;
