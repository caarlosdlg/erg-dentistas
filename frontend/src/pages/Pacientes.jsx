import React, { useState } from 'react';

/**
 * Pacientes page component
 * Manage patients in the dental ERP system
 */
const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockPatients = [
    {
      id: 1,
      name: 'María González',
      phone: '555-0123',
      email: 'maria@email.com',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-22',
    },
    {
      id: 2,
      name: 'Carlos López',
      phone: '555-0124',
      email: 'carlos@email.com',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25',
    },
    {
      id: 3,
      name: 'Ana Martín',
      phone: '555-0125',
      email: 'ana@email.com',
      lastVisit: '2024-01-08',
      nextAppointment: null,
    },
  ];

  const filteredPatients = mockPatients.filter(
    patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">Gestión de pacientes del consultorio dental</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Nuevo Paciente
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar pacientes
              </label>
              <input
                type="text"
                placeholder="Nombre, email o teléfono..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Filtros
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Lista de Pacientes ({filteredPatients.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-3">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {patient.email} • {patient.phone}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Última visita: {patient.lastVisit}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                      Ver Historia
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Nueva Cita
                    </button>
                  </div>
                </div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron pacientes que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pacientes;
