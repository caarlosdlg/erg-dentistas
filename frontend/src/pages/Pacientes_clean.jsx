import React, { useState, useEffect } from 'react';

/**
 * Pacientes page component - Patient management
 * Complete patient management system for dental clinic
 */
const Pacientes = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock patient data
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

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const handleNewPatient = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra la información de los pacientes</p>
        </div>
        <button 
          onClick={handleNewPatient}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Paciente
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-700">Total Pacientes</h3>
            <div className="text-3xl font-bold text-blue-600">
              {patients.length}
            </div>
            <p className="text-sm text-gray-500">Registrados</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-700">Pacientes Activos</h3>
            <div className="text-3xl font-bold text-green-600">
              {patients.filter(p => p.activo).length}
            </div>
            <p className="text-sm text-gray-500">Con estado activo</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-700">Registros este Mes</h3>
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
            <h3 className="text-lg font-semibold text-gray-700">Alertas Médicas</h3>
            <div className="text-3xl font-bold text-red-600">
              {patients.filter(p => p.alergias || p.enfermedades_cronicas).length}
            </div>
            <p className="text-sm text-gray-500">Con condiciones especiales</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre, expediente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
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

              <div className="flex flex-col gap-2 ml-6">
                <button 
                  onClick={() => handleViewDetails(patient)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Expediente: {selectedPatient.numero_expediente}
                </h2>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Paciente</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🦷</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Formulario de Registro
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta funcionalidad estará disponible próximamente
                </p>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pacientes;
