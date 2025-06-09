import React, { useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import SearchInput from '../components/search/SearchInput';
import SearchResults from '../components/search/SearchResults';
import QuickHelpModal from '../components/QuickHelpModal';

// Mock data for development testing
const mockSearchResults = {
  total_results: 15,
  results: {
    categories: [
      {
        id: 1,
        name: "Ortodoncia",
        description: "Tratamientos de corrección dental",
        is_active: true,
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        name: "Endodoncia",
        description: "Tratamientos de conducto",
        is_active: true,
        created_at: "2024-01-10T14:30:00Z"
      }
    ],
    tratamientos: [
      {
        id: 1,
        name: "Limpieza Dental",
        description: "Profilaxis dental completa",
        price: "150.00",
        duration: "45",
        category: "Prevención",
        is_active: true
      },
      {
        id: 2,
        name: "Extracción Simple",
        description: "Extracción de pieza dental",
        price: "200.00",
        duration: "30",
        category: "Cirugía",
        is_active: true
      }
    ],
    pacientes: [
      {
        id: 1,
        first_name: "Carlos",
        last_name: "Delgado",
        email: "carlos@example.com",
        phone: "+1234567890",
        is_active: true,
        last_visit: "2024-01-20T16:00:00Z"
      },
      {
        id: 2,
        first_name: "María",
        last_name: "González",
        email: "maria@example.com",
        phone: "+0987654321",
        is_active: true,
        last_visit: "2024-01-18T10:30:00Z"
      }
    ]
  }
};

const mockSuggestions = [
  { text: "limpieza", type: "tratamiento" },
  { text: "ortodoncia", type: "categoria" },
  { text: "Carlos Delgado", type: "paciente" },
  { text: "extracción", type: "tratamiento" },
  { text: "endodoncia", type: "categoria" }
];

const SimpleSearchPage = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    activeOnly: true,
    include: ['categories', 'tratamientos', 'pacientes'],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Simulate search with mock data
  const performSearch = async (searchQuery) => {
    if (!searchQuery?.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Filter mock results based on query
      const filteredResults = {
        ...mockSearchResults,
        results: {}
      };

      const queryLower = searchQuery.toLowerCase();

      // Filter categories
      if (filters.include.includes('categories')) {
        filteredResults.results.categories = mockSearchResults.results.categories.filter(
          cat => cat.name.toLowerCase().includes(queryLower) || 
                 cat.description.toLowerCase().includes(queryLower)
        );
      }

      // Filter treatments
      if (filters.include.includes('tratamientos')) {
        filteredResults.results.tratamientos = mockSearchResults.results.tratamientos.filter(
          treat => treat.name.toLowerCase().includes(queryLower) || 
                   treat.description.toLowerCase().includes(queryLower) ||
                   treat.category.toLowerCase().includes(queryLower)
        );
      }

      // Filter patients
      if (filters.include.includes('pacientes')) {
        filteredResults.results.pacientes = mockSearchResults.results.pacientes.filter(
          patient => `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(queryLower) ||
                     patient.email.toLowerCase().includes(queryLower)
        );
      }

      // Calculate total results
      filteredResults.total_results = 
        (filteredResults.results.categories?.length || 0) +
        (filteredResults.results.tratamientos?.length || 0) +
        (filteredResults.results.pacientes?.length || 0);

      setResults(filteredResults);
      setIsLoading(false);
    }, 800); // Simulate network delay
  };

  // Mock suggestions service
  const getSuggestions = async (searchQuery) => {
    if (!searchQuery?.trim()) return [];
    
    const queryLower = searchQuery.toLowerCase();
    return mockSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(queryLower)
    ).slice(0, 5);
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

  // Navigation handlers
  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    alert(`Navegando a categoría: ${category.name}`);
  };

  const handleTreatmentClick = (treatment) => {
    console.log('Treatment clicked:', treatment);
    alert(`Navegando a tratamiento: ${treatment.name}`);
  };

  const handlePatientClick = (patient) => {
    console.log('Patient clicked:', patient);
    alert(`Navegando a paciente: ${patient.first_name} ${patient.last_name}`);
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
          <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            💡 Modo de desarrollo: Usando datos de prueba. Prueba buscar: "limpieza", "ortodoncia", "Carlos"
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            getSuggestions={getSuggestions}
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
      <QuickHelpModal />
    </div>
  );
};

export default SimpleSearchPage;
