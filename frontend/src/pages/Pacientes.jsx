import React, { useState } from 'react';

/**
 * Pacientes page component
 * Manage patients in the dental ERP system with Tailwind CSS
 */
const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock patients data
  const mockPatients = [
    {
      id: 1,
      numeroExpediente: 'PAC-000001',
      nombre: 'María González López',
      telefono: '555-0123',
      email: 'maria@email.com',
      fechaNacimiento: '1985-03-15',
      edad: 38,
      tipoSangre: 'O+',
      ultimaVisita: '2024-01-15',
      proximaCita: '2024-01-22',
      activo: true,
      alergias: 'Penicilina',
      medicamentos: 'Ninguno'
    },
    {
      id: 2,
      numeroExpediente: 'PAC-000002',
      nombre: 'Carlos Martínez Ruiz',
      telefono: '555-0124',
      email: 'carlos@email.com',
      fechaNacimiento: '1978-07-22',
      edad: 45,
      tipoSangre: 'A+',
      ultimaVisita: '2024-01-10',
      proximaCita: '2024-01-25',
      activo: true,
      alergias: '',
      medicamentos: 'Aspirina 100mg'
    },
    {
      id: 3,
      numeroExpediente: 'PAC-000003',
      nombre: 'Ana Rodríguez Hernández',
      telefono: '555-0125',
      email: 'ana@email.com',
      fechaNacimiento: '1992-11-08',
      edad: 31,
      tipoSangre: 'B+',
      ultimaVisita: '2024-01-08',
      proximaCita: null,
      activo: true,
      alergias: 'Látex',
      medicamentos: 'Anticonceptivos'
    },
  ];

  const filteredPatients = mockPatients.filter(
    patient =>
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.numeroExpediente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600 mt-1">Gestión de pacientes del consultorio dental</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            Nuevo Paciente
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Pacientes</h3>
            <div className="text-3xl font-bold text-blue-600">{mockPatients.length}</div>
            <p className="text-sm text-gray-500">Registrados</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activos</h3>
            <div className="text-3xl font-bold text-green-600">
              {mockPatients.filter(p => p.activo).length}
            </div>
            <p className="text-sm text-gray-500">Con estado activo</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Este Mes</h3>
            <div className="text-3xl font-bold text-purple-600">2</div>
            <p className="text-sm text-gray-500">Nuevos registros</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alertas Médicas</h3>
            <div className="text-3xl font-bold text-red-600">
              {mockPatients.filter(p => p.alergias || p.medicamentos !== 'Ninguno').length}
            </div>
            <p className="text-sm text-gray-500">Con alertas</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <input
                  type="text"
                  placeholder="Buscar por nombre, expediente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                Filtros Avanzados
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="flex flex-col gap-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{patient.nombre}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {patient.numeroExpediente}
                      </span>
                      {(patient.alergias || patient.medicamentos !== 'Ninguno') && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          ⚠️ Alerta Médica
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Edad / Tipo de Sangre</p>
                        <p className="font-medium">{patient.edad} años • {patient.tipoSangre}</p>
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
                        <p className="text-sm text-gray-500">Última Visita</p>
                        <p className="font-medium">{new Date(patient.ultimaVisita).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Próxima Cita</p>
                        <p className="font-medium">
                          {patient.proximaCita ? new Date(patient.proximaCita).toLocaleDateString() : 'No programada'}
                        </p>
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

                    {/* Medical Alerts */}
                    {(patient.alergias || patient.medicamentos !== 'Ninguno') && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Información Médica:</p>
                        {patient.alergias && (
                          <p className="text-sm text-yellow-700">• Alergias: {patient.alergias}</p>
                        )}
                        {patient.medicamentos !== 'Ninguno' && (
                          <p className="text-sm text-yellow-700">• Medicamentos: {patient.medicamentos}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      Ver Detalles
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                      Editar
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                      Nueva Cita
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Create Patient Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Paciente</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCreateModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <form className="p-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="date"
                        placeholder="Fecha de nacimiento"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tipo de sangre</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Dirección completa"
                      rows={3}
                      className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Medical Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información Médica</h3>
                    <div className="space-y-4">
                      <textarea
                        placeholder="Alergias conocidas"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Medicamentos actuales"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Enfermedades crónicas o condiciones médicas"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Relación (ej: Esposo, Padre)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCreateModal(false);
                      alert('Paciente registrado exitosamente');
                    }}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Expediente: {selectedPatient.numeroExpediente}
                </h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedPatient(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPatient.nombre}</h3>
                    <p className="text-gray-600">
                      {selectedPatient.edad} años • Tipo de sangre: {selectedPatient.tipoSangre}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Teléfono:</span> {selectedPatient.telefono}</p>
                        <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                        <p><span className="font-medium">Fecha de nacimiento:</span> {new Date(selectedPatient.fechaNacimiento).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Historial de Citas</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Última visita:</span> {new Date(selectedPatient.ultimaVisita).toLocaleDateString()}</p>
                        <p><span className="font-medium">Próxima cita:</span> {selectedPatient.proximaCita ? new Date(selectedPatient.proximaCita).toLocaleDateString() : 'No programada'}</p>
                        <p><span className="font-medium">Estado:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                            selectedPatient.activo 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedPatient.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </p>
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
                      {selectedPatient.medicamentos && selectedPatient.medicamentos !== 'Ninguno' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-blue-800">💊 Medicamentos:</p>
                          <p className="text-blue-700">{selectedPatient.medicamentos}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Cerrar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                    Editar Información
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
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
