import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import CategoryTree from '../components/categories/CategoryTree';
import HierarchicalFilter from '../components/categories/HierarchicalFilter';
import CategoryBreadcrumb from '../components/categories/CategoryBreadcrumb';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * TreatmentCard Component - Individual treatment card
 */
const TreatmentCard = ({ treatment, onEdit, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {treatment.nombre}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Código: {treatment.codigo}
          </p>
          {treatment.descripcion && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {treatment.descripcion}
            </p>
          )}
        </div>
        {treatment.popular && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Popular
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio:</span>
          <span className="font-semibold text-green-600">
            ${treatment.precio_base?.toLocaleString() || 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Duración:</span>
          <span className="text-sm text-gray-900">
            {treatment.duracion_estimada || 'N/A'} min
          </span>
        </div>

        {treatment.categoria && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Categoría:</span>
            <span className="text-sm text-blue-600">
              {treatment.categoria.nombre}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(treatment)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Ver Detalles
        </button>
        <button
          onClick={() => onEdit(treatment)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
};

/**
 * TreatmentTable Component - Table view for treatments
 */
const TreatmentTable = ({ treatments, onEdit, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tratamiento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {treatments.map((treatment) => (
            <tr key={treatment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {treatment.nombre}
                    </div>
                    {treatment.popular && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {treatment.codigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {treatment.categoria?.nombre || 'Sin categoría'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${treatment.precio_base?.toLocaleString() || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {treatment.duracion_estimada || 'N/A'} min
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onView(treatment)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(treatment)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Tratamientos Component - Main hierarchical treatments management page
 */
const Tratamientos = () => {
  const [treatments, setTreatments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Load categories tree
  useEffect(() => {
    loadCategories();
  }, []);

  // Load treatments when filters change
  useEffect(() => {
    loadTreatments();
  }, [searchTerm, selectedCategory, filters, pagination.page]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tratamientos/categorias_tree/`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error al cargar las categorías');
    }
  };

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        ...filters
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('categoria', selectedCategory.id);

      const response = await fetch(`${API_BASE_URL}/api/tratamientos/?${params}`);
      if (!response.ok) throw new Error('Error al cargar tratamientos');
      
      const data = await response.json();
      setTreatments(data.results || []);
      setPagination({
        page: pagination.page,
        totalPages: Math.ceil(data.count / 20),
        totalItems: data.count
      });
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleTreatmentView = (treatment) => {
    console.log('View treatment:', treatment);
    // TODO: Implement treatment view modal or navigation
  };

  const handleTreatmentEdit = (treatment) => {
    console.log('Edit treatment:', treatment);
    // TODO: Implement treatment edit modal or navigation
  };

  const handleAddTreatment = () => {
    console.log('Add new treatment');
    // TODO: Implement add treatment modal or navigation
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Tratamientos
              </h1>
              <p className="mt-2 text-gray-600">
                Sistema jerárquico de categorías y tratamientos dentales
              </p>
            </div>
            <button
              onClick={handleAddTreatment}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Tratamiento
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {selectedCategory && (
          <div className="mb-6">
            <CategoryBreadcrumb 
              category={selectedCategory}
              onCategoryClick={handleCategorySelect}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Category Tree */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Categorías
              </h2>
              <CategoryTree
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategory?.id}
                searchTerm={searchTerm}
                showTreatmentCount={true}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tratamientos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2 rounded-md border transition-colors ${
                    showFilters
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtros
                </button>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4 mr-1" />
                    Tarjetas
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TableCellsIcon className="h-4 w-4 mr-1" />
                    Tabla
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <HierarchicalFilter
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                  />
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? (
                  'Cargando...'
                ) : (
                  `Mostrando ${treatments.length} de ${pagination.totalItems} tratamientos`
                )}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar filtro de categoría
                </button>
              )}
            </div>

            {/* Treatments Display */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando tratamientos...</p>
              </div>
            ) : treatments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No se encontraron tratamientos que coincidan con los criterios de búsqueda.
                </p>
                <button
                  onClick={handleAddTreatment}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Crear primer tratamiento
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {treatments.map((treatment) => (
                      <TreatmentCard
                        key={treatment.id}
                        treatment={treatment}
                        onEdit={handleTreatmentEdit}
                        onView={handleTreatmentView}
                      />
                    ))}
                  </div>
                ) : (
                  <TreatmentTable
                    treatments={treatments}
                    onEdit={handleTreatmentEdit}
                    onView={handleTreatmentView}
                  />
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tratamientos;
