/**
 * Search Service for DentalERP
 * Handles all search-related API calls to the Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class SearchService {
  /**
   * Search categories
   */
  async searchCategories(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        active_only: options.activeOnly || 'true',
        limit: options.limit || '20',
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
   * Search treatments
   */
  async searchTreatments(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        active_only: options.activeOnly || 'true',
        limit: options.limit || '20',
        ...options
      });
      
      const response = await fetch(`${API_BASE_URL}/categorias/api/search/tratamientos/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching treatments:', error);
      throw error;
    }
  }

  /**
   * Global search across all entities
   */
  async globalSearch(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        active_only: options.activeOnly || 'true',
        limit: options.limit || '10',
        include: options.include || 'categories,tratamientos,pacientes',
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

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(query, options = {}) {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    try {
      const results = await this.globalSearch(query, {
        ...options,
        limit: '5'
      });

      const suggestions = [];
      
      // Extract suggestions from each result type
      if (results.results?.categories?.results) {
        results.results.categories.results.forEach(cat => {
          suggestions.push({
            type: 'category',
            text: cat.name,
            value: cat.name,
            id: cat.id
          });
        });
      }

      if (results.results?.tratamientos?.results) {
        results.results.tratamientos.results.forEach(treatment => {
          suggestions.push({
            type: 'treatment',
            text: treatment.nombre,
            value: treatment.nombre,
            id: treatment.id
          });
        });
      }

      return { suggestions: suggestions.slice(0, 8) };
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { suggestions: [] };
    }
  }
}

export default new SearchService();