import { useState, useEffect, useMemo } from 'react';
import categoryService from '../services/categoryService';

/**
 * Custom hook for managing categories
 * Provides category tree data, search functionality, and state management
 */
export const useCategories = (options = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { autoFetch = true, includeStats = false } = options;

  // Fetch categories on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoryData, statsData] = await Promise.all([
        categoryService.getCategoryTree(),
        includeStats ? categoryService.getCategoryStats() : Promise.resolve(null)
      ]);
      
      setCategories(categoryData);
      if (statsData) setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Memoized category utilities
  const categoryUtils = useMemo(() => {
    const findCategoryById = (id, cats = categories) => {
      for (const category of cats) {
        if (category.id === id) return category;
        if (category.children && category.children.length > 0) {
          const found = findCategoryById(id, category.children);
          if (found) return found;
        }
      }
      return null;
    };

    const findCategoryBySlug = (slug, cats = categories) => {
      for (const category of cats) {
        if (category.slug === slug) return category;
        if (category.children && category.children.length > 0) {
          const found = findCategoryBySlug(slug, category.children);
          if (found) return found;
        }
      }
      return null;
    };

    const getCategoryPath = (categoryId) => {
      const category = findCategoryById(categoryId);
      if (!category) return [];
      
      const path = [category];
      let current = category;
      
      while (current.parent) {
        const parent = findCategoryById(current.parent);
        if (parent) {
          path.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }
      
      return path;
    };

    const getChildCategories = (categoryId) => {
      const category = findCategoryById(categoryId);
      return category ? category.children || [] : [];
    };

    const getRootCategories = () => {
      return categories.filter(cat => !cat.parent);
    };

    const flattenCategories = (cats = categories) => {
      const flattened = [];
      
      const flatten = (categories) => {
        categories.forEach(category => {
          flattened.push(category);
          if (category.children && category.children.length > 0) {
            flatten(category.children);
          }
        });
      };
      
      flatten(cats);
      return flattened;
    };

    const searchCategories = (query) => {
      const lowercaseQuery = query.toLowerCase();
      const allCategories = flattenCategories();
      
      return allCategories.filter(category => 
        category.name.toLowerCase().includes(lowercaseQuery) ||
        (category.description && category.description.toLowerCase().includes(lowercaseQuery))
      );
    };

    return {
      findCategoryById,
      findCategoryBySlug,
      getCategoryPath,
      getChildCategories,
      getRootCategories,
      flattenCategories,
      searchCategories
    };
  }, [categories]);

  return {
    categories,
    loading,
    error,
    stats,
    fetchCategories,
    ...categoryUtils
  };
};

/**
 * Hook for category search with debouncing
 */
export const useCategorySearch = (initialQuery = '', debounceMs = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const searchResults = await categoryService.searchCategories(query);
        setResults(searchResults.results || []);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    error
  };
};

/**
 * Hook for managing a single category with its treatments
 */
export const useCategory = (categoryId) => {
  const [category, setCategory] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setCategory(null);
      setTreatments([]);
      setLoading(false);
      return;
    }

    fetchCategoryData();
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoryData, treatmentsData] = await Promise.all([
        categoryService.getCategoryById(categoryId),
        categoryService.getTreatmentsByCategory(categoryId)
      ]);
      
      setCategory(categoryData);
      setTreatments(treatmentsData.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    category,
    treatments,
    loading,
    error,
    refetch: fetchCategoryData
  };
};
