import React, { useState, useEffect } from 'react';

/**
 * Tratamientos Component - Simple treatment management with backend connection
 */
const Tratamientos = () => {
  const [loading, setLoading] = useState(true);
  const [tratamientos, setTratamientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: '',
    duracion_estimada: '',
    categoria: ''
  });

  // Backend API base URL
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    loadTratamientos();
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE}/categorias-tratamientos/`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTratamientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/tratamientos/`);
      
      if (response.ok) {
        const data = await response.json();
        setTratamientos(Array.isArray(data.results) ? data.results : []);
      } else {
        throw new Error('Error al cargar tratamientos');
      }
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Error al cargar los tratamientos');
      setTratamientos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/tratamientos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio_base: parseFloat(formData.precio_base) || 0,
          duracion_estimada: parseInt(formData.duracion_estimada) || 0,
          categoria: formData.categoria
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          nombre: '',
          descripcion: '',
          precio_base: '',
          duracion_estimada: '',
          categoria: ''
        });
        loadTratamientos();
      } else {
        throw new Error('Error al crear tratamiento');
      }
    } catch (err) {
      console.error('Error creating treatment:', err);
      setError('Error al crear el tratamiento');
    }
  };

  const filteredTratamientos = tratamientos.filter(tratamiento =>
    tratamiento.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tratamiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tratamiento.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando tratamientos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Tratamientos</h1>
          <p className="text-gray-600">Gestiona los tratamientos disponibles en tu clínica</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Nuevo Tratamiento
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Buscar tratamientos por nombre, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-500">⚠️</div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button 
                onClick={loadTratamientos}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treatments Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tratamientos Disponibles ({filteredTratamientos.length})
          </h3>
        </div>
        
        {filteredTratamientos.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🦷</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tratamientos registrados
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza agregando tratamientos a tu catálogo
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Tratamiento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTratamientos.map((tratamiento) => (
              <div key={tratamiento.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tratamiento.nombre}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full`}
                        style={{
                          backgroundColor: tratamiento.categoria?.color + '20',
                          color: tratamiento.categoria?.color || '#374151'
                        }}>
                    {tratamiento.categoria?.nombre || 'Sin categoría'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {tratamiento.descripcion}
                </p>
                
                <div className="space-y-2 text-sm">
                  {tratamiento.precio_base && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precio:</span>
                      <span className="font-medium text-green-600">
                        ${parseFloat(tratamiento.precio_base).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {tratamiento.duracion_estimada && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duración:</span>
                      <span className="font-medium">
                        {tratamiento.duracion_estimada} min
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Editar
                  </button>
                  <button className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Tratamiento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Tratamiento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Limpieza dental, Endodoncia, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del tratamiento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_base}
                    onChange={(e) => setFormData({...formData, precio_base: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duracion_estimada}
                    onChange={(e) => setFormData({...formData, duracion_estimada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Tratamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tratamientos;