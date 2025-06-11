import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';

const NuevoPaciente = () => {
  const navigate = useNavigate();
  const { createPaciente, loading, error } = usePacientes();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_sangre: '',
    alergias: '',
    medicamentos: '',
    enfermedades_cronicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido_paterno.trim()) {
      newErrors.apellido_paterno = 'El apellido paterno es requerido';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es requerido';
    }

    if (!formData.contacto_emergencia_nombre.trim()) {
      newErrors.contacto_emergencia_nombre = 'El nombre del contacto de emergencia es requerido';
    }

    if (!formData.contacto_emergencia_telefono.trim()) {
      newErrors.contacto_emergencia_telefono = 'El teléfono del contacto de emergencia es requerido';
    }

    if (!formData.contacto_emergencia_relacion.trim()) {
      newErrors.contacto_emergencia_relacion = 'La relación del contacto de emergencia es requerida';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newPaciente = await createPaciente(formData);
      navigate(`/pacientes/${newPaciente.id}/expediente`);
    } catch (error) {
      console.error('Error creating patient:', error);
      setErrors({ submit: 'Error al crear el paciente. Por favor intenta de nuevo.' });
    }
  };

  const handleCancel = () => {
    navigate('/pacientes');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Paciente</h1>
            <p className="text-gray-600">Registra un nuevo paciente en el sistema</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del paciente"
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido Paterno <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.apellido_paterno}
                onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.apellido_paterno ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Apellido paterno"
              />
              {errors.apellido_paterno && <p className="mt-1 text-xs text-red-600">{errors.apellido_paterno}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido Materno
              </label>
              <input
                type="text"
                value={formData.apellido_materno}
                onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apellido materno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fecha_nacimiento ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.fecha_nacimiento && <p className="mt-1 text-xs text-red-600">{errors.fecha_nacimiento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sexo}
                onChange={(e) => handleInputChange('sexo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sexo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.sexo && <p className="mt-1 text-xs text-red-600">{errors.sexo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sangre
              </label>
              <select
                value={formData.tipo_sangre}
                onChange={(e) => handleInputChange('tipo_sangre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Información de Contacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.telefono ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: +52 55 1234 5678"
              />
              {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dirección completa del paciente"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Médica</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alergias
              </label>
              <textarea
                value={formData.alergias}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describir alergias conocidas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enfermedades Crónicas
              </label>
              <textarea
                value={formData.enfermedades_cronicas}
                onChange={(e) => handleInputChange('enfermedades_cronicas', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describir enfermedades crónicas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamentos Actuales
              </label>
              <textarea
                value={formData.medicamentos}
                onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Listar medicamentos actuales..."
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contacto de Emergencia</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contacto_emergencia_nombre}
                onChange={(e) => handleInputChange('contacto_emergencia_nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contacto_emergencia_nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del contacto de emergencia"
              />
              {errors.contacto_emergencia_nombre && <p className="mt-1 text-xs text-red-600">{errors.contacto_emergencia_nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contacto_emergencia_telefono}
                onChange={(e) => handleInputChange('contacto_emergencia_telefono', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contacto_emergencia_telefono ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: +52 55 1234 5678"
              />
              {errors.contacto_emergencia_telefono && <p className="mt-1 text-xs text-red-600">{errors.contacto_emergencia_telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contacto_emergencia_relacion}
                onChange={(e) => handleInputChange('contacto_emergencia_relacion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.contacto_emergencia_relacion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Esposo, Padre, Hermano"
              />
              {errors.contacto_emergencia_relacion && <p className="mt-1 text-xs text-red-600">{errors.contacto_emergencia_relacion}</p>}
            </div>
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
        <div className="flex justify-end space-x-4 pb-8">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Crear Paciente
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoPaciente;
