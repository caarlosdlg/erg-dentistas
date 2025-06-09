import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import SearchInput from '../components/search/SearchInput';
import SearchResults from '../components/search/SearchResults';
import searchService from '../services/searchService';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    activeOnly: true,
    include: ['categories', 'tratamientos', 'pacientes'],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Perform search
  const performSearch = async (searchQuery) => {
    if (!searchQuery?.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchService.globalSearch(searchQuery, {
        activeOnly: filters.activeOnly,
        include: filters.include.join(','),
        limit: '20'
      });
      setResults(searchResults);
      
      // Update URL
      setSearchParams({ q: searchQuery });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ total_results: 0, results: {} });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Re-search with new filters if we have a query
    if (query) {
      performSearch(query);
    }
  };

  // Handle include filter toggle
  const handleIncludeToggle = (type) => {
    const newInclude = filters.include.includes(type)
      ? filters.include.filter(t => t !== type)
      : [...filters.include, type];
    
    handleFilterChange('include', newInclude);
  };

  // Initial search from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, []);

  // Navigation handlers
  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // Navigate to category detail page
  };

  const handleTreatmentClick = (treatment) => {
    console.log('Treatment clicked:', treatment);
    // Navigate to treatment detail page
  };

  const handlePatientClick = (patient) => {
    console.log('Patient clicked:', patient);
    // Navigate to patient detail page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Búsqueda en DentalERP
          </h1>
          <p className="text-gray-600">
            Encuentra categorías, tratamientos y pacientes en el sistema
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="Buscar categorías, tratamientos, pacientes..."
            autoFocus
            size="lg"
            className="max-w-2xl"
          />
        </div>

        {/* Filters Bar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <div className="flex items-center space-x-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="relevance">Relevancia</option>
                <option value="name">Nombre</option>
                <option value="created">Fecha de creación</option>
              </select>

              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-gray-600 hover:text-gray-800"
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Active Only Filter */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.activeOnly}
                      onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Solo elementos activos</span>
                  </label>
                </div>

                {/* Include Types */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Incluir en búsqueda:</div>
                  <div className="space-y-1">
                    {[
                      { key: 'categories', label: 'Categorías' },
                      { key: 'tratamientos', label: 'Tratamientos' },
                      { key: 'pacientes', label: 'Pacientes' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.include.includes(key)}
                          onChange={() => handleIncludeToggle(key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
          onCategoryClick={handleCategoryClick}
          onTreatmentClick={handleTreatmentClick}
          onPatientClick={handlePatientClick}
        />

      </div>
    </div>
  );
};

export default SearchPage;
