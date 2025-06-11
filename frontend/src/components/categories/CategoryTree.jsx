import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * CategoryTree Component
 * Displays hierarchical category structure as a navigable tree for treatments
 */
const CategoryTree = ({ 
  categories = [], 
  onCategorySelect, 
  selectedCategoryId = null,
  searchTerm = '',
  className = '',
  maxDepth = 4,
  showItemCount = true,
  compact = false,
  showTreatmentCount = true
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Auto-expand path to selected category
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const findCategoryPath = (cats, targetId, path = []) => {
        for (const cat of cats) {
          const currentPath = [...path, cat.id];
          if (cat.id === targetId) {
            return currentPath;
          }
          if (cat.children && cat.children.length > 0) {
            const found = findCategoryPath(cat.children, targetId, currentPath);
            if (found) return found;
          }
        }
        return null;
      };

      const path = findCategoryPath(categories, selectedCategoryId);
      if (path) {
        setExpandedNodes(new Set(path.slice(0, -1)));
      }
    }
  }, [selectedCategoryId, categories]);

  const toggleNode = (categoryId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const getAllIds = (cats) => {
      let ids = [];
      cats.forEach(cat => {
        ids.push(cat.id);
        if (cat.children && cat.children.length > 0) {
          ids = ids.concat(getAllIds(cat.children));
        }
      });
      return ids;
    };
    setExpandedNodes(new Set(getAllIds(categories)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
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
      const matchesSearch = (category.nombre || category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.descripcion || category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasMatchingChildren = category.children?.some(child => 
        filterCategories([child], searchTerm, currentDepth + 1).length > 0
      );
      
      return matchesSearch || hasMatchingChildren;
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children, searchTerm, currentDepth + 1) : []
    }));
  };

  const renderTreeNode = (category, depth = 0) => {
    if (maxDepth !== null && depth > maxDepth) return null;
    
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = isNodeExpanded(category.id);
    const isSelected = selectedCategoryId === category.id;
    
    const nodeClass = clsx(
      'flex items-center py-3 px-3 rounded-lg cursor-pointer transition-all duration-200',
      'hover:bg-gray-50',
      {
        'bg-primary-50 border-l-4 border-primary-500': isSelected,
        'text-primary-700': isSelected,
        'text-gray-900': !isSelected,
        'text-sm': !compact,
        'text-xs': compact,
        'py-2': compact
      }
    );
    
    const indent = depth * (compact ? 16 : 20);
    
    return (
      <div key={category.id} className="category-node">
        <div
          className={nodeClass}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => handleCategoryClick(category)}
        >
          {/* Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode(category.id);
            }}
            className={clsx(
              'mr-2 p-1 rounded-lg transition-colors duration-200',
              {
                'hover:bg-gray-200': hasChildren,
                'invisible': !hasChildren
              }
            )}
            disabled={!hasChildren}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )
            )}
          </button>

          {/* Folder Icon */}
          <div className="mr-3">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen 
                  className="w-5 h-5" 
                  style={{ color: category.color || '#6B7280' }}
                />
              ) : (
                <Folder 
                  className="w-5 h-5" 
                  style={{ color: category.color || '#6B7280' }}
                />
              )
            ) : (
              <div 
                className="w-5 h-5 rounded border-2"
                style={{ 
                  borderColor: category.color || '#6B7280',
                  backgroundColor: `${category.color || '#6B7280'}20`
                }}
              />
            )}
          </div>

          {/* Category Icon (emoji) */}
          {category.icono && (
            <span className="mr-2 text-lg">{category.icono}</span>
          )}

          {/* Category Name */}
          <span className="flex-1 font-medium truncate">
            {category.nombre || category.name}
          </span>

          {/* Treatment Count Badge */}
          {showTreatmentCount && (category.treatments_count > 0 || category.total_tratamientos > 0 || category.treatment_count > 0) && (
            <span className={clsx(
              'ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full',
              {
                'bg-primary-100 text-primary-800': isSelected,
                'bg-gray-100 text-gray-600': !isSelected
              }
            )}>
              {category.treatments_count || category.total_tratamientos || category.treatment_count || 0}
            </span>
          )}

          {/* Level Indicator */}
          <span className="ml-2 text-xs text-gray-400">
            L{depth}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="children">
            {category.children.map((child) => 
              renderTreeNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories, searchTerm);

  if (filteredCategories.length === 0) {
    return (
      <div className={clsx('p-6 text-center text-gray-500', className)}>
        {searchTerm ? (
          <>
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No se encontraron categorías que coincidan con "{searchTerm}"</p>
          </>
        ) : (
          <>
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay categorías disponibles</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('category-tree', className)}>
      {/* Tree Controls */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-800">
          Categorías de Tratamientos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Expandir
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Contraer
          </button>
        </div>
      </div>

      {/* Tree Nodes */}
      <div className="tree-container space-y-1 max-h-96 overflow-y-auto">
        {filteredCategories.map(category => renderTreeNode(category))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Total: {categories.length}</span>
          <span>Expandidas: {expandedNodes.size}</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryTree;
