import React, { useState } from 'react';

const FiltrosPacientes = ({ filtros, onFiltroChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFiltros, setLocalFiltros] = useState(filtros);

  const handleFiltroChange = (key, value) => {
    const newFiltros = { ...localFiltros, [key]: value };
    setLocalFiltros(newFiltros);
    onFiltroChange(newFiltros);
  };

  const clearAllFilters = () => {
    const clearedFiltros = {
      activo: null,
      has_alerts: null,
      dentista_filter: 'created',
      edad_min: null,
      edad_max: null,
      fecha_registro_desde: null,
      fecha_registro_hasta: null
    };
    setLocalFiltros(clearedFiltros);
    onFiltroChange(clearedFiltros);
  };

  const hasActiveFilters = Object.entries(localFiltros).some(([key, value]) => {
    if (key === 'dentista_filter') return value !== 'created';
    return value !== null && value !== '';
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      {/* Basic Filters Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
           
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado del Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Paciente
            </label>
            <select
              value={localFiltros.activo || ''}
              onChange={(e) => handleFiltroChange('activo', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {/* Alertas Médicas */}
        

          {/* Filtro por Dentista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relación con Dentista
            </label>
            <select
              value={localFiltros.dentista_filter}
              onChange={(e) => handleFiltroChange('dentista_filter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created">Creados por mí</option>
              <option value="assigned">Asignados a mí</option>
              <option value="both">Ambos</option>
              <option value="all">Todos los pacientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-100 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Filtros Avanzados</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rango de Edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad Mínima
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={localFiltros.edad_min || ''}
                onChange={(e) => handleFiltroChange('edad_min', e.target.value || null)}
                placeholder="Ej: 18"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad Máxima
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={localFiltros.edad_max || ''}
                onChange={(e) => handleFiltroChange('edad_max', e.target.value || null)}
                placeholder="Ej: 65"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Rango de Fechas de Registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registrado Desde
              </label>
              <input
                type="date"
                value={localFiltros.fecha_registro_desde || ''}
                onChange={(e) => handleFiltroChange('fecha_registro_desde', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registrado Hasta
              </label>
              <input
                type="date"
                value={localFiltros.fecha_registro_hasta || ''}
                onChange={(e) => handleFiltroChange('fecha_registro_hasta', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Filtros Rápidos</h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                  handleFiltroChange('fecha_registro_desde', lastMonth.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Último mes
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
                  handleFiltroChange('fecha_registro_desde', lastWeek.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Última semana
              </button>
              
              <button
                onClick={() => {
                  handleFiltroChange('edad_min', 18);
                  handleFiltroChange('edad_max', 35);
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                Adultos jóvenes (18-35)
              </button>
              
              <button
                onClick={() => {
                  handleFiltroChange('edad_min', 65);
                  handleFiltroChange('edad_max', null);
                }}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Adultos mayores (65+)
              </button>
              
              <button
                onClick={() => {
                  handleFiltroChange('has_alerts', 'true');
                }}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
              >
                Con alertas médicas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Filtros activos:</h5>
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              Limpiar todos
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(localFiltros).map(([key, value]) => {
              if (value === null || value === '' || (key === 'dentista_filter' && value === 'created')) return null;
              
              const getFilterLabel = (key, value) => {
                switch (key) {
                  case 'activo':
                    return value === 'true' ? 'Activos' : 'Inactivos';
                  case 'has_alerts':
                    return value === 'true' ? 'Con alertas' : 'Sin alertas';
                  case 'dentista_filter':
                    const labels = {
                      'assigned': 'Asignados a mí',
                      'both': 'Creados y asignados',
                      'all': 'Todos los pacientes'
                    };
                    return labels[value] || value;
                  case 'edad_min':
                    return `Edad mín: ${value}`;
                  case 'edad_max':
                    return `Edad máx: ${value}`;
                  case 'fecha_registro_desde':
                    return `Desde: ${new Date(value).toLocaleDateString()}`;
                  case 'fecha_registro_hasta':
                    return `Hasta: ${new Date(value).toLocaleDateString()}`;
                  default:
                    return `${key}: ${value}`;
                }
              };

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => handleFiltroChange(key, key === 'dentista_filter' ? 'created' : null)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosPacientes;
