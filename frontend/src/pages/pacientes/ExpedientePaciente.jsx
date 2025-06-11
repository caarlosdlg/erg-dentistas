import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';
import NavegacionExpediente from '../../components/pacientes/NavegacionExpediente';
import BitacoraCitas from '../../components/pacientes/BitacoraCitas';
import GestorImagenes from '../../components/pacientes/GestorImagenes';

const ExpedientePaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPacienteById, updatePaciente, loading, error } = usePacientes();
  
  const [paciente, setPaciente] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadPaciente();
    } else if (id === 'undefined' || !id) {
      // Redirect back to patients list if ID is undefined
      navigate('/pacientes');
    }
  }, [id, navigate]);

  const loadPaciente = async () => {
    try {
      const data = await getPacienteById(id);
      setPaciente(data);
      setEditedData(data);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...paciente });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({ ...paciente });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPaciente = await updatePaciente(id, editedData);
      // Ensure we have all required fields before updating state
      if (updatedPaciente && updatedPaciente.nombre_completo) {
        setPaciente(updatedPaciente);
        setIsEditing(false);
      } else {
        // If the response is incomplete, reload the patient data
        await loadPaciente();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading && !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando expediente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el expediente</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/pacientes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Paciente no encontrado</h3>
          <p className="text-gray-600 mb-4">El expediente solicitado no existe o no tienes permisos para verlo.</p>
          <button
            onClick={() => navigate('/pacientes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const edad = calculateAge(paciente.fecha_nacimiento);
  const tieneAlertas = paciente.alergias || paciente.enfermedades_cronicas;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pacientes')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {paciente.nombre_completo ? paciente.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NN'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{paciente.nombre_completo || 'Nombre no disponible'}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono">{paciente.numero_expediente}</span>
                      <span>{edad} años</span>
                      {!paciente.activo && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
                      {tieneAlertas && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Alertas médicas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavegacionExpediente
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pacienteId={id}
        />
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'info' && (
          <PatientInfoTab
            paciente={paciente}
            isEditing={isEditing}
            editedData={editedData}
            onInputChange={handleInputChange}
          />
        )}
        
        {activeTab === 'bitacora' && (
          <BitacoraCitas pacienteId={id} />
        )}
        
        {activeTab === 'imagenes' && (
          <GestorImagenes pacienteId={id} />
        )}
      </div>
    </div>
  );
};

// Patient Info Tab Component
const PatientInfoTab = ({ paciente, isEditing, editedData, onInputChange }) => {
  const expedienteMedico = paciente.expediente_medico;
  
  // For error tracking (can be implemented if needed)
  // const [errors, setErrors] = useState({});

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.nombre || ''}
                onChange={(e) => onInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del paciente"
              />
            ) : (
              <p className="text-gray-900">{paciente.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido Paterno {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.apellido_paterno || ''}
                onChange={(e) => onInputChange('apellido_paterno', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apellido paterno"
              />
            ) : (
              <p className="text-gray-900">{paciente.apellido_paterno}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido Materno
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.apellido_materno || ''}
                onChange={(e) => onInputChange('apellido_materno', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apellido materno"
              />
            ) : (
              <p className="text-gray-900">{paciente.apellido_materno || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editedData.fecha_nacimiento || ''}
                onChange={(e) => onInputChange('fecha_nacimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sexo {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <select
                value={editedData.sexo || ''}
                onChange={(e) => onInputChange('sexo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {paciente.sexo === 'M' ? 'Masculino' : 
                 paciente.sexo === 'F' ? 'Femenino' : 'No especificado'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sangre
            </label>
            {isEditing ? (
              <select
                value={editedData.tipo_sangre || ''}
                onChange={(e) => onInputChange('tipo_sangre', e.target.value)}
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
            ) : (
              <p className="text-gray-900">{paciente.tipo_sangre || 'No especificado'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedData.telefono || ''}
                onChange={(e) => onInputChange('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: +52 55 1234 5678"
              />
            ) : (
              <p className="text-gray-900">{paciente.telefono || 'No especificado'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="correo@ejemplo.com"
              />
            ) : (
              <p className="text-gray-900">{paciente.email || 'No especificado'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            {isEditing ? (
              <textarea
                value={editedData.direccion || ''}
                onChange={(e) => onInputChange('direccion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dirección completa del paciente"
              />
            ) : (
              <p className="text-gray-900">{paciente.direccion || 'No especificado'}</p>
            )}
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
            {isEditing ? (
              <textarea
                value={editedData.alergias || ''}
                onChange={(e) => onInputChange('alergias', e.target.value)}
                rows={2}
                placeholder="Describir alergias conocidas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{paciente.alergias || 'Ninguna alergia conocida'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enfermedades Crónicas
            </label>
            {isEditing ? (
              <textarea
                value={editedData.enfermedades_cronicas || ''}
                onChange={(e) => onInputChange('enfermedades_cronicas', e.target.value)}
                rows={2}
                placeholder="Describir enfermedades crónicas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{paciente.enfermedades_cronicas || 'Ninguna enfermedad crónica conocida'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos Actuales
            </label>
            {isEditing ? (
              <textarea
                value={editedData.medicamentos || ''}
                onChange={(e) => onInputChange('medicamentos', e.target.value)}
                rows={2}
                placeholder="Listar medicamentos actuales..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">{paciente.medicamentos || 'No toma medicamentos actualmente'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Record Details */}
      {expedienteMedico && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expediente Médico</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Expediente Médico
              </label>
              <p className="text-gray-900 font-mono">{expedienteMedico.numero_expediente}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Creación
              </label>
              <p className="text-gray-900">{new Date(expedienteMedico.fecha_creacion).toLocaleDateString()}</p>
            </div>

            {expedienteMedico.motivo_consulta && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Consulta Inicial
                </label>
                <p className="text-gray-900">{expedienteMedico.motivo_consulta}</p>
              </div>
            )}

            {expedienteMedico.diagnostico_inicial && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico Inicial
                </label>
                <p className="text-gray-900">{expedienteMedico.diagnostico_inicial}</p>
              </div>
            )}

            {expedienteMedico.plan_tratamiento && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Tratamiento
                </label>
                <p className="text-gray-900">{expedienteMedico.plan_tratamiento}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proveedor</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creado por
            </label>
            <p className="text-gray-900">
              {paciente.creado_por_info ? 
                `Dr. ${paciente.creado_por_info.nombre_completo}` : 
                'No disponible'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dentista Asignado
            </label>
            <p className="text-gray-900">
              {paciente.dentista_asignado_info ? 
                `Dr. ${paciente.dentista_asignado_info.nombre_completo}` : 
                'No asignado'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Registro
            </label>
            <p className="text-gray-900">{new Date(paciente.fecha_registro).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Última Actualización
            </label>
            <p className="text-gray-900">{new Date(paciente.fecha_actualizacion).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedientePaciente;
