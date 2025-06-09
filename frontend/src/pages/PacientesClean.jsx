import React, { useState, useEffect } from 'react';

// Mock functions for demo
const usePatients = () => ({
  patients: [],
  loading: false,
  error: null,
  createPatient: async () => {},
  updatePatient: async () => {},
  deletePatient: async () => {},
  searchPatients: async () => {}
});

const useNotifications = () => ({
  showNotification: (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
});

/**
 * Pacientes page component - Patient management
 * Real functionality for managing dental patients
 */
const Pacientes = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  // Mock data - replace with API calls
  const mockPatients = [
    {
      id: '1',
      numero_expediente: 'PAC-000001',
      nombre: 'María',
      apellido_paterno: 'González',
      apellido_materno: 'López',
      fecha_nacimiento: '1985-03-15',
      sexo: 'F',
      telefono: '+52-555-0123',
      email: 'maria.gonzalez@email.com',
      direccion: 'Av. Reforma 123, Ciudad de México',
      tipo_sangre: 'O+',
      alergias: 'Penicilina',
      medicamentos: 'Ninguno',
      enfermedades_cronicas: '',
      contacto_emergencia_nombre: 'Juan González',
      contacto_emergencia_telefono: '+52-555-0124',
      contacto_emergencia_relacion: 'Esposo',
      fecha_registro: '2024-01-15',
      activo: true
    },
    {
      id: '2',
      numero_expediente: 'PAC-000002',
      nombre: 'Carlos',
      apellido_paterno: 'Martínez',
      apellido_materno: 'Ruiz',
      fecha_nacimiento: '1978-07-22',
      sexo: 'M',
      telefono: '+52-555-0125',
      email: 'carlos.martinez@email.com',
      direccion: 'Calle 5 de Mayo 456, Guadalajara',
      tipo_sangre: 'A+',
      alergias: '',
      medicamentos: 'Aspirina 100mg diario',
      enfermedades_cronicas: 'Hipertensión',
      contacto_emergencia_nombre: 'Ana Martínez',
      contacto_emergencia_telefono: '+52-555-0126',
      contacto_emergencia_relacion: 'Esposa',
      fecha_registro: '2024-02-10',
      activo: true
    },
    {
      id: '3',
      numero_expediente: 'PAC-000003',
      nombre: 'Ana',
      apellido_paterno: 'Rodríguez',
      apellido_materno: 'Hernández',
      fecha_nacimiento: '1992-11-08',
      sexo: 'F',
      telefono: '+52-555-0127',
      email: 'ana.rodriguez@email.com',
      direccion: 'Colonia Roma Norte 789, Ciudad de México',
      tipo_sangre: 'B+',
      alergias: 'Látex',
      medicamentos: 'Anticonceptivos orales',
      enfermedades_cronicas: '',
      contacto_emergencia_nombre: 'Pedro Rodríguez',
      contacto_emergencia_telefono: '+52-555-0128',
      contacto_emergencia_relacion: 'Padre',
      fecha_registro: '2024-03-05',
      activo: true
    }
  ];

  useEffect(() => {
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numero_expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock save - replace with API call
    const newPatient = {
      ...formData,
      id: Date.now().toString(),
      numero_expediente: `PAC-${String(patients.length + 1).padStart(6, '0')}`,
      fecha_registro: new Date().toISOString().split('T')[0],
      activo: true
    };
    
    setPatients(prev => [...prev, newPatient]);
    setIsCreateModalOpen(false);
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
    alert('Paciente registrado exitosamente');
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">Gestión de pacientes del consultorio dental</p>
          </div>
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Paciente
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

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Emergencias</h3>
              <div className="text-3xl font-bold text-red-600">
                {patients.filter(p => p.alergias || p.enfermedades_cronicas).length}
              </div>
              <p className="text-sm text-gray-500">Con alertas médicas</p>
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

        {/* Patients List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {patient.nombre} {patient.apellido_paterno} {patient.apellido_materno}
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
                      <p className="font-medium">{calculateAge(patient.fecha_nacimiento)} años</p>
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
                    onClick={() => handleViewDetails(patient)}
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
          ))}
        </div>

        {/* Create Patient Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Paciente</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                        <input
                          type="text"
                          value={formData.apellido_paterno}
                          onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                        <input
                          type="text"
                          value={formData.apellido_materno}
                          onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={formData.fecha_nacimiento}
                          onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <select
                          value={formData.sexo}
                          onChange={(e) => handleInputChange('sexo', e.target.value)}
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
                          onChange={(e) => handleInputChange('tipo_sangre', e.target.value)}
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
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder="+52-555-0123"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <textarea
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        rows={3}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
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
                      {selectedPatient.nombre} {selectedPatient.apellido_paterno} {selectedPatient.apellido_materno}
                    </h3>
                    <p className="text-gray-600">
                      {calculateAge(selectedPatient.fecha_nacimiento)} años • 
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
      </div>
    </div>
  );
};

export default Pacientes;
