import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * CategoryBreadcrumb Component - Navigation breadcrumbs for hierarchical categories
 */
const CategoryBreadcrumb = ({ 
  breadcrumbs = [], 
  onNavigate, 
  showHome = true,
  className = '' 
}) => {
  const handleNavigate = (crumb, index) => {
    if (onNavigate) {
      onNavigate(crumb, index);
    }
  };

  if (breadcrumbs.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {/* Home/Root */}
        {showHome && (
          <li className="inline-flex items-center">
            <button
              onClick={() => handleNavigate(null, -1)}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Todas las categorías
            </button>
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.id || index}>
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
              {index === breadcrumbs.length - 1 ? (
                // Last item (current page) - not clickable
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {crumb.icono && <span className="mr-1">{crumb.icono}</span>}
                  {crumb.nombre || crumb.name}
                </span>
              ) : (
                // Clickable breadcrumb item
                <button
                  onClick={() => handleNavigate(crumb, index)}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  {crumb.icono && <span className="mr-1">{crumb.icono}</span>}
                  {crumb.nombre || crumb.name}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * CategoryPath Component - Display the full path of a category
 */
const CategoryPath = ({ 
  category, 
  separator = ' > ',
  className = '',
  showIcons = true 
}) => {
  if (!category) return null;

  const getFullPath = () => {
    if (category.full_path) {
      return category.full_path;
    }
    
    if (category.breadcrumbs) {
      return category.breadcrumbs
        .map(crumb => 
          showIcons && crumb.icono 
            ? `${crumb.icono} ${crumb.nombre}` 
            : crumb.nombre
        )
        .join(separator);
    }
    
    return category.nombre || category.name;
  };

  return (
    <span className={`category-path text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {getFullPath()}
    </span>
  );
};

/**
 * CategoryLevel Component - Display the category level with styling
 */
const CategoryLevel = ({ 
  level, 
  className = '',
  showLabel = true 
}) => {
  const levelColors = {
    0: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    3: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    4: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const levelLabels = {
    0: 'Principal',
    1: 'Subcategoría',
    2: 'Especialidad',
    3: 'Tipo',
    4: 'Específico'
  };

  const colorClass = levelColors[level] || levelColors[4];
  const label = levelLabels[level] || `Nivel ${level}`;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${colorClass} ${className}`}>
      {showLabel ? label : `L${level}`}
    </span>
  );
};

export { CategoryBreadcrumb, CategoryPath, CategoryLevel };
export default CategoryBreadcrumb;
