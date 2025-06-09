import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * CategoryTree Component
 * Displays hierarchical category structure as a navigable tree
 */
const CategoryTree = ({ 
  categories = [], 
  onCategorySelect, 
  selectedCategoryId = null,
  searchTerm = '',
  className = '',
  maxDepth = null,
  showItemCount = true,
  compact = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (categoryId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const isNodeExpanded = (categoryId) => expandedNodes.has(categoryId);

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    
    // Auto-expand clicked category if it has children
    if (category.children && category.children.length > 0) {
      toggleNode(category.id);
    }
  };

  const filterCategories = (categories, searchTerm, currentDepth = 0) => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasMatchingChildren = category.children?.some(child => 
        filterCategories([child], searchTerm, currentDepth + 1).length > 0
      );
      
      return matchesSearch || hasMatchingChildren;
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children, searchTerm, currentDepth + 1) : []
    }));
  };

  const renderCategory = (category, depth = 0) => {
    // Check max depth
    if (maxDepth !== null && depth >= maxDepth) {
      return null;
    }

    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = isNodeExpanded(category.id);
    const isSelected = category.id === selectedCategoryId;
    
    const indentClass = compact ? 
      `ml-${Math.min(depth * 3, 12)}` : 
      `ml-${Math.min(depth * 4, 16)}`;

    return (
      <div key={category.id} className="category-node">
        <div
          className={clsx(
            'flex items-center py-2 px-3 cursor-pointer transition-colors duration-200 rounded-md',
            indentClass,
            {
              'bg-primary-50 text-primary-700 border border-primary-200': isSelected,
              'hover:bg-neutral-50': !isSelected,
              'text-sm': compact,
              'text-base': !compact
            }
          )}
          onClick={() => handleCategoryClick(category)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(category.id);
                }}
                className="p-0.5 rounded hover:bg-neutral-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Category Icon */}
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary-500" />
              ) : (
                <Folder className="w-4 h-4 text-neutral-500" />
              )
            ) : (
              <div className="w-2 h-2 bg-neutral-300 rounded-full" />
            )}
          </div>

          {/* Category Name */}
          <span className={clsx(
            'flex-1 font-medium',
            {
              'text-primary-700': isSelected,
              'text-neutral-700': !isSelected
            }
          )}>
            {category.name}
          </span>

          {/* Item Count */}
          {showItemCount && category.treatment_count > 0 && (
            <span className={clsx(
              'ml-2 px-2 py-1 text-xs rounded-full',
              {
                'bg-primary-100 text-primary-600': isSelected,
                'bg-neutral-100 text-neutral-600': !isSelected
              }
            )}>
              {category.treatment_count}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="category-children">
            {category.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories, searchTerm);

  if (filteredCategories.length === 0) {
    return (
      <div className={clsx('p-6 text-center text-neutral-500', className)}>
        {searchTerm ? (
          <>
            <Folder className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>No se encontraron categorías que coincidan con "{searchTerm}"</p>
          </>
        ) : (
          <>
            <Folder className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>No hay categorías disponibles</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('category-tree', className)}>
      {filteredCategories.map(category => renderCategory(category))}
    </div>
  );
};

export default CategoryTree;
