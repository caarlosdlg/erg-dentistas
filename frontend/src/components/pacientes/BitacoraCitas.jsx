import React, { useState, useEffect } from 'react';
import { useBitacora } from '../../hooks/useBitacora';
import FormularioEntradaBitacora from './FormularioEntradaBitacora';

const BitacoraCitas = ({ pacienteId }) => {
  const { 
    entradas, 
    loading, 
    error, 
    fetchBitacora, 
    createEntrada, 
    updateEntrada, 
    deleteEntrada 
  } = useBitacora(pacienteId);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_cita: '',
    estado: ''
  });

  useEffect(() => {
    if (pacienteId) {
      fetchBitacora({ paciente: pacienteId, ...filtros });
    }
  }, [pacienteId, filtros]);

  // Show floating button when scrolling and there are entries
  useEffect(() => {
    const handleScroll = () => {
      if (entradas.length > 3) {
        setShowFloatingButton(window.scrollY > 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [entradas.length]);

  const handleCreateEntry = async (data) => {
    try {
      await createEntrada({ ...data, paciente: pacienteId });
      setShowForm(false);
      fetchBitacora({ paciente: pacienteId, ...filtros });
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleUpdateEntry = async (data) => {
    try {
      console.log('Updating entry with data:', data);
      console.log('Editing entry ID:', editingEntry.id);
      
      // Ensure paciente field is included for updates
      const updateData = {
        ...data,
        paciente: pacienteId // Add paciente ID to update data
      };
      
      console.log('Final update data:', updateData);
      
      await updateEntrada(editingEntry.id, updateData);
      setEditingEntry(null);
      fetchBitacora({ paciente: pacienteId, ...filtros });
    } catch (error) {
      console.error('Error updating entry:', error);
      // Show user-friendly error message
      alert(`Error al actualizar la entrada: ${error.message}`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
      try {
        await deleteEntrada(entryId);
        fetchBitacora({ paciente: pacienteId, ...filtros });
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      tipo_cita: '',
      estado: ''
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada':
        return 'bg-blue-100 text-blue-800';
      case 'en_curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'reprogramada':
        return 'bg-purple-100 text-purple-800';
      case 'no_asistio':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoConsultaIcon = (tipo) => {
    switch (tipo) {
      case 'consulta':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'limpieza':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'endodoncia':
      case 'extraccion':
      case 'cirugia':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'emergencia':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'revision':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'ortodoncia':
      case 'implante':
      case 'protesis':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
          </svg>
        );
      case 'blanqueamiento':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
          </svg>
        );
    }
  };

  if (loading && entradas.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando bitácora...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bitácora de Citas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {entradas.length === 0 
              ? 'No hay registros médicos aún' 
              : `${entradas.length} entrada${entradas.length !== 1 ? 's' : ''} registrada${entradas.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Entrada
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {Object.values(filtros).some(v => v !== '') && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta
            </label>
            <select
              value={filtros.tipo_cita}
              onChange={(e) => handleFiltroChange('tipo_cita', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="consulta">Consulta General</option>
              <option value="limpieza">Limpieza Dental</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="extraccion">Extracción</option>
              <option value="ortodoncia">Ortodoncia</option>
              <option value="cirugia">Cirugía Oral</option>
              <option value="implante">Implante</option>
              <option value="blanqueamiento">Blanqueamiento</option>
              <option value="protesis">Prótesis</option>
              <option value="emergencia">Emergencia</option>
              <option value="revision">Revisión</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="programada">Programada</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="reprogramada">Reprogramada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar la bitácora</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {entradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entradas en la bitácora</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Aún no se han registrado consultas o tratamientos para este paciente. 
              Comienza agregando la primera entrada médica.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Primera Entrada
              </button>
              <p className="text-xs text-gray-400">
                También puedes usar el botón "Nueva Entrada" en la parte superior
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {entradas.map((entrada, index) => (
                  <li key={`entrada-${entrada.id}-${index}`}>
                    <div className="relative pb-8">
                      {index !== entradas.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            entrada.estado === 'completada' ? 'bg-green-500' :
                            entrada.estado === 'cancelada' ? 'bg-red-500' :
                            entrada.estado === 'en_curso' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          } text-white`}>
                            {getTipoConsultaIcon(entrada.tipo_cita || 'consulta')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900 capitalize">
                                  {entrada.tipo_cita ? entrada.tipo_cita.replace('_', ' ') : 'Sin tipo'}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(entrada.estado)}`}>
                                  {entrada.estado ? entrada.estado.replace('_', ' ') : 'Sin estado'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setEditingEntry(entrada)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entrada.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-500 space-y-2">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                                  </svg>
                                  {entrada.fecha_hora ? new Date(entrada.fecha_hora).toLocaleDateString() : 'Sin fecha'}
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {entrada.fecha_hora ? new Date(entrada.fecha_hora).toLocaleTimeString() : 'Sin hora'}
                                </span>
                                {entrada.duracion_estimada && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {entrada.duracion_estimada} min
                                  </span>
                                )}
                              </div>

                              {entrada.motivo_consulta && (
                                <div>
                                  <p className="font-medium text-gray-700">Motivo:</p>
                                  <p>{entrada.motivo_consulta}</p>
                                </div>
                              )}

                              {entrada.diagnostico && (
                                <div>
                                  <p className="font-medium text-gray-700">Diagnóstico:</p>
                                  <p>{entrada.diagnostico}</p>
                                </div>
                              )}

                              {entrada.tratamiento_realizado && (
                                <div>
                                  <p className="font-medium text-gray-700">Tratamiento:</p>
                                  <p>{entrada.tratamiento_realizado}</p>
                                </div>
                              )}

                              {entrada.observaciones_dentista && (
                                <div>
                                  <p className="font-medium text-gray-700">Observaciones:</p>
                                  <p>{entrada.observaciones_dentista}</p>
                                </div>
                              )}

                              {entrada.proxima_cita_fecha && (
                                <div>
                                  <p className="font-medium text-gray-700">Próxima cita:</p>
                                  <p>{entrada.proxima_cita_fecha ? new Date(entrada.proxima_cita_fecha).toLocaleDateString() : 'Fecha no disponible'}</p>
                                </div>
                              )}

                              {entrada.costo_tratamiento && (
                                <div>
                                  <p className="font-medium text-gray-700">Costo:</p>
                                  <p>${entrada.costo_tratamiento && !isNaN(parseFloat(entrada.costo_tratamiento)) ? parseFloat(entrada.costo_tratamiento).toFixed(2) : '0.00'}</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 text-xs text-gray-400">
                              {entrada.dentista_nombre && (
                                <span>Dr. {entrada.dentista_nombre}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <FormularioEntradaBitacora
          onSubmit={handleCreateEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingEntry && (
        <FormularioEntradaBitacora
          initialData={editingEntry}
          onSubmit={handleUpdateEntry}
          onCancel={() => setEditingEntry(null)}
          isEditing={true}
        />
      )}

      {/* Floating Action Button */}
      {showFloatingButton && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 z-50"
          title="Agregar nueva entrada"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default BitacoraCitas;
