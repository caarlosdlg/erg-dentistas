import React, { useState, useEffect } from 'react';
import CategoryTree from '../components/categories/CategoryTree';
import HierarchicalFilter from '../components/categories/HierarchicalFilter';
import { 
  Search, 
  Plus, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Heart 
} from 'lucide-react';

/**
 * Tratamientos Component - Hierarchical treatment management system
 */
const Tratamientos = () => {
  const [loading, setLoading] = useState(true);
  const [tratamientos, setTratamientos] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Backend API base URL
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTratamientos(),
        loadCategoriesTree()
      ]);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesTree = async () => {
    try {
      const response = await fetch(`${API_BASE}/tratamientos/categorias_tree/`);
      if (response.ok) {
        const data = await response.json();
        setCategoriesTree(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading categories tree:', err);
    }
  };

  const loadTratamientos = async (queryParams = {}) => {
    try {
      setError(null);
      
      // Build query string
      const params = new URLSearchParams();
      
      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Add category filters
      if (selectedCategory) {
        params.append('categoria', selectedCategory.id);
      }
      
      // Add hierarchical filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      // Add additional query params
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = `${API_BASE}/tratamientos/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setTratamientos(Array.isArray(data.results) ? data.results : []);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError('Error al cargar tratamientos: ' + err.message);
      console.error('Error loading treatments:', err);
    }
  };

  // Reload treatments when filters change
  useEffect(() => {
    if (!loading) {
      loadTratamientos();
    }
  }, [searchTerm, selectedCategory, filters]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getBreadcrumbs = () => {
    if (!selectedCategory) return [];
    
    if (selectedCategory.breadcrumbs) {
      return selectedCategory.breadcrumbs;
    }
    
    // Fallback breadcrumb generation
    return [{ 
      id: selectedCategory.id, 
      nombre: selectedCategory.nombre || selectedCategory.name,
      slug: selectedCategory.slug 
    }];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const TreatmentCard = ({ treatment }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Treatment Image */}
      <div className="h-48 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        {treatment.imagen ? (
          <img 
            src={treatment.imagen} 
            alt={treatment.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl text-primary-300">
            {treatment.categoria?.icono || '🦷'}
          </div>
        )}
      </div>

      {/* Treatment Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {treatment.nombre}
            </h3>
            {treatment.codigo && (
              <span className="text-sm text-gray-500">
                Código: {treatment.codigo}
              </span>
            )}
          </div>
          
          {treatment.popular && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <Heart className="w-3 h-3 fill-current" />
              Popular
            </span>
          )}
        </div>

        {/* Category Path */}
        {treatment.categoria_path && (
          <div className="text-sm text-primary-600 mb-3 font-medium">
            {treatment.categoria_path}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {treatment.descripcion}
        </p>

        {/* Treatment Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500 block">Precio:</span>
            <div className="font-semibold text-secondary-600">
              {formatPrice(treatment.precio_base)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 block">Duración:</span>
            <div className="font-semibold text-gray-900">
              {treatment.duracion_estimada} min
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {treatment.requiere_anestesia && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Requiere anestesia
            </span>
          )}
          {treatment.sesiones_requeridas > 1 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {treatment.sesiones_requeridas} sesiones
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium">
            <Eye className="w-4 h-4" />
            Ver Detalles
          </button>
          <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Cargando tratamientos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tratamientos</h1>
            <p className="text-gray-600">Sistema jerárquico de categorías y tratamientos dentales</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nuevo Tratamiento
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {selectedCategory && (
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Todas las categorías
                </button>
              </li>
              {getBreadcrumbs().map((crumb, index) => (
                <li key={crumb.id}>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500 font-medium">
                      {crumb.nombre}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Category Tree */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <CategoryTree
                categories={categoriesTree}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategory?.id}
                searchTerm={searchTerm}
                showTreatmentCount={true}
                maxDepth={4}
                className="sticky top-4"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tratamientos..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                      showFilters 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filtros
                  </button>
                  
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Tratamiento
                  </button>
                </div>
              </div>
            </div>

            {/* Hierarchical Filters */}
            {showFilters && (
              <div className="mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <HierarchicalFilter
                    categories={categoriesTree}
                    onFilterChange={handleFilterChange}
                    initialFilters={filters}
                  />
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 font-medium">
                {tratamientos.length} tratamiento{tratamientos.length !== 1 ? 's' : ''} encontrado{tratamientos.length !== 1 ? 's' : ''}
                {selectedCategory && ` en "${selectedCategory.nombre || selectedCategory.name}"`}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Tabla
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Treatments Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tratamientos.map((treatment) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} />
                ))}
              </div>
            ) : (
              // Table view would go here
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Vista de tabla en desarrollo</h3>
                  <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {tratamientos.length === 0 && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">🦷</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron tratamientos
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategory 
                    ? 'Intenta ajustar los filtros de búsqueda para encontrar los tratamientos que necesitas'
                    : 'Comienza agregando tu primer tratamiento al sistema'
                  }
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Agregar Tratamiento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tratamientos;