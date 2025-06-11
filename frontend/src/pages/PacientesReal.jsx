import React, { useState, useEffect } from 'react';
import { apiSimple } from '../services/apiSimple';

/**
 * Pacientes Component - Real API connection (Sin autenticación)
 * Connects to actual backend API for patient management without GitHub auth
 */
const PacientesReal = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando pacientes sin autenticación...');
      const data = await apiSimple.getPatients();
      console.log('Pacientes cargados:', data);
      setPatients(data.results || data);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar los pacientes: ' + err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiSimple.createPatient(formData);
      setShowCreateModal(false);
      setFormData({
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
      loadPatients(); // Recargar la lista
    } catch (err) {
      console.error('Error creating patient:', err);
      setError('Error al crear el paciente: ' + err.message);
    }
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

  const filteredPatients = patients.filter(patient =>
    patient.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numero_expediente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefono?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando pacientes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra la información de los pacientes del consultorio</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Paciente
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Total Pacientes</h3>
            <div className="text-3xl font-bold text-blue-600">
              {patients.length}
            </div>
            <p className="text-sm text-gray-500">Registrados</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Activos</h3>
            <div className="text-3xl font-bold text-green-600">
              {patients.filter(p => p.activo).length}
            </div>
            <p className="text-sm text-gray-500">Con estado activo</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Con Alertas</h3>
            <div className="text-3xl font-bold text-red-600">
              {patients.filter(p => p.alergias || p.enfermedades_cronicas).length}
            </div>
            <p className="text-sm text-gray-500">Con alertas médicas</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Este Mes</h3>
            <div className="text-3xl font-bold text-purple-600">
              {patients.filter(p => {
                const registroDate = new Date(p.fecha_registro);
                const now = new Date();
                return registroDate.getMonth() === now.getMonth() && 
                       registroDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-sm text-gray-500">Nuevos registros</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            placeholder="Buscar por nombre, expediente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Filtros Avanzados
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Exportar
          </button>
        </div>
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
                onClick={loadPatients}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patients.length === 0 ? 'No hay pacientes registrados' : 'No se encontraron pacientes'}
            </h3>
            <p className="text-gray-500">
              {patients.length === 0 ? 'Comienza agregando tu primer paciente' : 'Intenta con otro término de búsqueda'}
            </p>
            {patients.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Paciente
              </button>
            )}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {patient.nombre_completo}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {patient.numero_expediente}
                    </span>
                    {(patient.alergias || patient.enfermedades_cronicas) && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        ⚠️ Alerta Médica
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Edad</p>
                      <p className="font-medium">{patient.edad} años</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{patient.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Sangre</p>
                      <p className="font-medium">{patient.tipo_sangre || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Registro</p>
                      <p className="font-medium">{new Date(patient.fecha_registro).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        patient.activo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {patient.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    Ver Detalles
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Editar
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Nueva Cita
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Expediente: {selectedPatient.numero_expediente}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedPatient.nombre_completo}
                  </h3>
                  <p className="text-gray-600">
                    {selectedPatient.edad} años • 
                    {selectedPatient.sexo === 'M' ? ' Masculino' : ' Femenino'} • 
                    Tipo de sangre: {selectedPatient.tipo_sangre || 'No especificado'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Teléfono:</span> {selectedPatient.telefono}</p>
                      <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                      <p><span className="font-medium">Dirección:</span> {selectedPatient.direccion}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contacto de Emergencia</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Nombre:</span> {selectedPatient.contacto_emergencia_nombre}</p>
                      <p><span className="font-medium">Teléfono:</span> {selectedPatient.contacto_emergencia_telefono}</p>
                      <p><span className="font-medium">Relación:</span> {selectedPatient.contacto_emergencia_relacion}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información Médica</h4>
                  <div className="space-y-3">
                    {selectedPatient.alergias && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">⚠️ Alergias:</p>
                        <p className="text-red-700">{selectedPatient.alergias}</p>
                      </div>
                    )}
                    {selectedPatient.medicamentos && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium text-blue-800">💊 Medicamentos:</p>
                        <p className="text-blue-700">{selectedPatient.medicamentos}</p>
                      </div>
                    )}
                    {selectedPatient.enfermedades_cronicas && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="font-medium text-yellow-800">🏥 Enfermedades Crónicas:</p>
                        <p className="text-yellow-700">{selectedPatient.enfermedades_cronicas}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Editar Información
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Nueva Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Patient Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Paciente</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                      <input
                        type="text"
                        value={formData.apellido_paterno}
                        onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                      <input
                        type="text"
                        value={formData.apellido_materno}
                        onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                      <select
                        value={formData.sexo}
                        onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sangre</label>
                      <select
                        value={formData.tipo_sangre}
                        onChange={(e) => setFormData({...formData, tipo_sangre: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <textarea
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información Médica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                      <textarea
                        value={formData.alergias}
                        onChange={(e) => setFormData({...formData, alergias: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos Actuales</label>
                      <textarea
                        value={formData.medicamentos}
                        onChange={(e) => setFormData({...formData, medicamentos: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enfermedades Crónicas</label>
                      <textarea
                        value={formData.enfermedades_cronicas}
                        onChange={(e) => setFormData({...formData, enfermedades_cronicas: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contacto de Emergencia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.contacto_emergencia_nombre}
                        onChange={(e) => setFormData({...formData, contacto_emergencia_nombre: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.contacto_emergencia_telefono}
                        onChange={(e) => setFormData({...formData, contacto_emergencia_telefono: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
                      <input
                        type="text"
                        value={formData.contacto_emergencia_relacion}
                        onChange={(e) => setFormData({...formData, contacto_emergencia_relacion: e.target.value})}
                        placeholder="Ej: Esposo, Padre, Hermano"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacientesReal;
