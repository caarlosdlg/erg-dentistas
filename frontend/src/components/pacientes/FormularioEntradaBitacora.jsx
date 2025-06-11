import React, { useState } from 'react';

const FormularioEntradaBitacora = ({ initialData = {}, onSubmit, onCancel, isEditing = false }) => {
  // Parse initial data for editing - convert backend format to form format
  const parseInitialData = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return {
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        tipo_consulta: 'consulta',
        estado: 'programada',
        motivo_consulta: '',
        diagnostico: '',
        tratamiento_realizado: '',
        plan_tratamiento: '',
        observaciones: '',
        proxima_cita: '',
        proxima_cita_motivo: '',
        duracion_minutos: '',
        costo: ''
      };
    }

    // Parse fecha_hora if it exists
    let fecha = '';
    let hora = '';
    if (data.fecha_hora) {
      const dateTime = new Date(data.fecha_hora);
      fecha = dateTime.toISOString().split('T')[0];
      hora = dateTime.toTimeString().slice(0, 5); // HH:MM format
    }

    // Parse proxima_cita_fecha if it exists
    let proxima_cita = '';
    if (data.proxima_cita_fecha) {
      const nextDate = new Date(data.proxima_cita_fecha);
      proxima_cita = nextDate.toISOString().split('T')[0];
    }

    return {
      fecha: fecha || data.fecha || new Date().toISOString().split('T')[0],
      hora: hora || data.hora || '',
      tipo_consulta: data.tipo_cita || data.tipo_consulta || 'consulta',
      estado: data.estado || 'programada',
      motivo_consulta: data.motivo_consulta || '',
      diagnostico: data.diagnostico || '',
      tratamiento_realizado: data.tratamiento_realizado || '',
      plan_tratamiento: data.plan_tratamiento || '',
      observaciones: data.observaciones_dentista || data.observaciones || '',
      proxima_cita: proxima_cita || data.proxima_cita || '',
      proxima_cita_motivo: data.proxima_cita_motivo || '',
      duracion_minutos: data.duracion_estimada?.toString() || data.duracion_minutos || '',
      costo: data.costo_tratamiento?.toString() || data.costo || ''
    };
  };

  const [formData, setFormData] = useState(parseInitialData(initialData));

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const tiposConsulta = [
    { value: 'consulta', label: 'Consulta General' },
    { value: 'limpieza', label: 'Limpieza Dental' },
    { value: 'endodoncia', label: 'Endodoncia' },
    { value: 'extraccion', label: 'Extracción' },
    { value: 'ortodoncia', label: 'Ortodoncia' },
    { value: 'cirugia', label: 'Cirugía Oral' },
    { value: 'implante', label: 'Implante' },
    { value: 'blanqueamiento', label: 'Blanqueamiento' },
    { value: 'protesis', label: 'Prótesis' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'revision', label: 'Revisión' },
    { value: 'otro', label: 'Otro' }
  ];

  const estados = [
    { value: 'programada', label: 'Programada' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_asistio', label: 'No Asistió' },
    { value: 'reprogramada', label: 'Reprogramada' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.tipo_consulta) {
      newErrors.tipo_consulta = 'El tipo de consulta es requerido';
    }

    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
    }

    if (!formData.motivo_consulta.trim()) {
      newErrors.motivo_consulta = 'El motivo de consulta es requerido';
    }

    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = 'El costo debe ser un número válido';
    }

    if (formData.duracion_minutos && (isNaN(parseInt(formData.duracion_minutos)) || parseInt(formData.duracion_minutos) <= 0)) {
      newErrors.duracion_minutos = 'La duración debe ser un número positivo';
    }

    if (formData.proxima_cita && new Date(formData.proxima_cita) <= new Date(formData.fecha)) {
      newErrors.proxima_cita = 'La próxima cita debe ser posterior a la fecha actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Map frontend fields to backend fields
      const backendData = {
        fecha_hora: `${formData.fecha}T${formData.hora || '09:00'}:00.000Z`,
        tipo_cita: formData.tipo_consulta,
        estado: formData.estado,
        duracion_estimada: parseInt(formData.duracion_minutos) || 60,
        motivo_consulta: formData.motivo_consulta,
        diagnostico: formData.diagnostico || '',
        tratamiento_realizado: formData.tratamiento_realizado || '',
        observaciones_dentista: formData.observaciones || '',
        plan_tratamiento: formData.plan_tratamiento || '',
        costo_tratamiento: formData.costo ? parseFloat(formData.costo) : null,
        proxima_cita_fecha: formData.proxima_cita ? `${formData.proxima_cita}T09:00:00.000Z` : null,
        proxima_cita_motivo: formData.proxima_cita_motivo || ''
      };

      // Clean up empty values
      const cleanedData = Object.entries(backendData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Submitting data:', cleanedData);
      console.log('Is editing?', isEditing);

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al guardar la entrada. Por favor intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Editar Entrada de Bitácora' : 'Nueva Entrada de Bitácora'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fecha ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleInputChange('hora', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duracion_minutos}
                  onChange={(e) => handleInputChange('duracion_minutos', e.target.value)}
                  placeholder="Ej: 30"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duracion_minutos ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.duracion_minutos && <p className="mt-1 text-xs text-red-600">{errors.duracion_minutos}</p>}
              </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipo_consulta}
                  onChange={(e) => handleInputChange('tipo_consulta', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tipo_consulta ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {tiposConsulta.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_consulta && <p className="mt-1 text-xs text-red-600">{errors.tipo_consulta}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.estado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                {errors.estado && <p className="mt-1 text-xs text-red-600">{errors.estado}</p>}
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Consulta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.motivo_consulta}
                  onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
                  rows={3}
                  placeholder="Describe el motivo de la consulta..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.motivo_consulta ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.motivo_consulta && <p className="mt-1 text-xs text-red-600">{errors.motivo_consulta}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnostico}
                  onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                  rows={3}
                  placeholder="Diagnóstico encontrado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento Realizado
                </label>
                <textarea
                  value={formData.tratamiento_realizado}
                  onChange={(e) => handleInputChange('tratamiento_realizado', e.target.value)}
                  rows={3}
                  placeholder="Describe el tratamiento realizado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Tratamiento
                </label>
                <textarea
                  value={formData.plan_tratamiento}
                  onChange={(e) => handleInputChange('plan_tratamiento', e.target.value)}
                  rows={3}
                  placeholder="Plan de tratamiento recomendado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima Cita
                </label>
                <input
                  type="date"
                  value={formData.proxima_cita}
                  onChange={(e) => handleInputChange('proxima_cita', e.target.value)}
                  min={formData.fecha}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.proxima_cita ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.proxima_cita && <p className="mt-1 text-xs text-red-600">{errors.proxima_cita}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo Próxima Cita
                </label>
                <input
                  type="text"
                  value={formData.proxima_cita_motivo}
                  onChange={(e) => handleInputChange('proxima_cita_motivo', e.target.value)}
                  placeholder="Ej: Revisión de tratamiento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo}
                  onChange={(e) => handleInputChange('costo', e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.costo ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.costo && <p className="mt-1 text-xs text-red-600">{errors.costo}</p>}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioEntradaBitacora;
