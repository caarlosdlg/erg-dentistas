import React, { useState, useEffect } from 'react';

/**
 * Inventario Component - Complete inventory management with backend integration
 */
const Inventario = () => {
  const [loading, setLoading] = useState(true);
  const [inventario, setInventario] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    proveedor: '',
    unidad_medida: 'pieza',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    stock_maximo: '',
    ubicacion: '',
    lote: ''
  });

  // Backend API base URL
  const API_BASE = 'http://localhost:8000/api';

  // Unidades de medida disponibles
  const UNIDADES_MEDIDA = [
    { value: 'pieza', label: 'Pieza' },
    { value: 'caja', label: 'Caja' },
    { value: 'paquete', label: 'Paquete' },
    { value: 'jeringa', label: 'Jeringa' },
    { value: 'cartucho', label: 'Cartucho' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'gr', label: 'Gramo' },
    { value: 'kg', label: 'Kilogramo' },
    { value: 'litro', label: 'Litro' },
    { value: 'unidad', label: 'Unidad' }
  ];

  useEffect(() => {
    loadInventario();
    loadCategorias();
    loadProveedores();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE}/categorias-inventario/`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProveedores = async () => {
    try {
      const response = await fetch(`${API_BASE}/proveedores/`);
      if (response.ok) {
        const data = await response.json();
        setProveedores(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    }
  };

  const loadInventario = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/inventario/`);
      
      if (response.ok) {
        const data = await response.json();
        setInventario(Array.isArray(data.results) ? data.results : []);
      } else {
        throw new Error('Error al cargar inventario');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Error al cargar el inventario');
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.codigo.trim()) {
      setError('El código es requerido');
      return;
    }
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.categoria) {
      setError('La categoría es requerida');
      return;
    }

    try {
      setError(null);
      const submitData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        proveedor: formData.proveedor || null,
        unidad_medida: formData.unidad_medida,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 1,
        stock_maximo: parseInt(formData.stock_maximo) || 100,
        ubicacion: formData.ubicacion.trim(),
        lote: formData.lote.trim()
      };

      console.log('Sending data:', submitData);

      const response = await fetch(`${API_BASE}/inventario/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const newItem = await response.json();
        console.log('Item created successfully:', newItem);
        
        setShowCreateModal(false);
        resetForm();
        loadInventario();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.detail || 'Error al crear item de inventario');
      }
    } catch (err) {
      console.error('Error creating inventory item:', err);
      setError(err.message || 'Error al crear el item de inventario');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      proveedor: '',
      unidad_medida: 'pieza',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
      stock_maximo: '',
      ubicacion: '',
      lote: ''
    });
  };

  const getStockStatus = (item) => {
    if (item.estado_stock === 'critico') {
      return { color: 'bg-red-100 text-red-800', text: 'Stock Crítico' };
    } else if (item.estado_stock === 'bajo') {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Stock Bajo' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'En Stock' };
    }
  };

  const filteredInventario = inventario.filter(item =>
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Administra el inventario de tu clínica dental</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Nuevo Item
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Buscar items por código, nombre, descripción o categoría..."
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
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Items de Inventario ({filteredInventario.length})
          </h3>
        </div>
        
        {filteredInventario.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron items' : 'No hay items en el inventario'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando items a tu inventario'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventario.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.codigo}
                          </div>
                          {item.descripcion && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.categoria?.nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.stock_actual} {item.unidad_medida}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mín: {item.stock_minimo} | Máx: {item.stock_maximo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Compra: ${parseFloat(item.precio_compra || 0).toFixed(2)}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          Venta: ${parseFloat(item.precio_venta || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.proveedor?.nombre || 'Sin proveedor'}
                        </div>
                        {item.ubicacion && (
                          <div className="text-sm text-gray-500">
                            📍 {item.ubicacion}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Item de Inventario</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: MAT-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Composite Dental"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <select
                    value={formData.proveedor}
                    onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <option key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Compra ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({...formData, precio_compra: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({...formData, stock_actual: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Máximo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({...formData, stock_maximo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Estante A-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lote
                  </label>
                  <input
                    type="text"
                    value={formData.lote}
                    onChange={(e) => setFormData({...formData, lote: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: LOT2024001"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
