/**
 * API Service for Categories
 * Handles all category-related API calls to the Django backend
 */

import connectivityService from './connectivityService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class CategoryService {
  /**
   * Get the full category tree structure
   */
  async getCategoryTree() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/public/tree/`, {
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn('API not available, using mock data:', error.message);
      // Return mock data when API is not available
      return connectivityService.getMockCategoryData();
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/public/stats/`, {
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API not available, using mock stats:', error.message);
      return {
        total_categories: 4,
        total_treatments: 8,
        categories_with_treatments: 3,
      };
    }
  }

  /**
   * Search categories by query
   */
  async searchCategories(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...options
      });
      
      const response = await fetch(`${API_BASE_URL}/categorias/api/search/categories/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  /**
   * Get detailed category information by ID
   */
  async getCategoryById(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias/api/categories/${categoryId}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  }

  /**
   * Get treatments/services for a specific category
   */
  async getTreatmentsByCategory(categoryId, options = {}) {
    try {
      const params = new URLSearchParams({
        category: categoryId,
        ...options
      });
      
      const response = await fetch(`${API_BASE_URL}/tratamientos/api/treatments/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching treatments by category:', error);
      throw error;
    }
  }

  /**
   * Global search across categories and treatments
   */
  async globalSearch(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...options
      });
      
      const response = await fetch(`${API_BASE_URL}/categorias/api/search/global/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error performing global search:', error);
      throw error;
    }
  }
}

export default new CategoryService();
