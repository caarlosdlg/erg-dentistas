import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePacientes } from '../../hooks/usePacientes';
import TarjetaPaciente from '../../components/pacientes/TarjetaPaciente';
import FiltrosPacientes from '../../components/pacientes/FiltrosPacientes';

const Pacientes = () => {
  const navigate = useNavigate();
  const { pacientes, loading, error, fetchPacientes, deletePaciente } = usePacientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    activo: null,
    has_alerts: null,
    dentista_filter: 'created'
  });
  const [sortBy, setSortBy] = useState('fecha_registro');
  const [sortOrder, setSortOrder] = useState('desc');

  // Cargar pacientes cuando el componente se monta
  useEffect(() => {
    fetchPacientes(filtros);
  }, []);

  // Filter and sort patients
  const pacientesFiltrados = pacientes
    .filter(paciente => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
          (paciente.nombre_completo || '').toLowerCase().includes(search) ||
          (paciente.numero_expediente || '').toLowerCase().includes(search) ||
          (paciente.email || '').toLowerCase().includes(search) ||
          (paciente.telefono || '').includes(search)
        );
        if (!matchesSearch) return false;
      }
      
      /* Filtros avanzados comentados temporalmente
      // Alertas médicas filter
      if (filtros.has_alerts === 'true') {
        // Verificar si el paciente tiene alergias o enfermedades crónicas
        const tieneAlerta = Boolean(
          (paciente.alergias && paciente.alergias.trim().length > 0) || 
          (paciente.enfermedades_cronicas && paciente.enfermedades_cronicas.trim().length > 0) ||
          paciente.tiene_alertas_medicas
        );
        if (!tieneAlerta) return false;
      } else if (filtros.has_alerts === 'false') {
        // Verificar que el paciente NO tenga alergias ni enfermedades crónicas
        const tieneAlerta = Boolean(
          (paciente.alergias && paciente.alergias.trim().length > 0) || 
          (paciente.enfermedades_cronicas && paciente.enfermedades_cronicas.trim().length > 0) ||
          paciente.tiene_alertas_medicas
        );
        if (tieneAlerta) return false;
      }
      
      // Estado del paciente (activo/inactivo)
      if (filtros.activo === 'true') {
        if (paciente.activo !== true) return false;
      } else if (filtros.activo === 'false') {
        if (paciente.activo !== false) return false;
      }
      */
      
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date fields
      if (sortBy === 'fecha_registro' || sortBy === 'fecha_nacimiento') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleFiltroChange = (newFiltros) => {
    setFiltros(newFiltros);
    fetchPacientes(newFiltros);
  };

  const handleVerExpediente = (pacienteId) => {
    navigate(`/pacientes/${pacienteId}/expediente`);
  };

  const handleDeletePaciente = async (pacienteId) => {
    try {
      await deletePaciente(pacienteId);
      // Recargar la lista para actualizar las estadísticas
      fetchPacientes(filtros);
    } catch (error) {
      console.error('Error deleting patient:', error);
      // El error ya se maneja en el componente TarjetaPaciente
    }
  };

  const handleSendEmail = async (paciente) => {
    if (!paciente.email) {
      alert('Este paciente no tiene email registrado');
      return;
    }

    try {
      // Crear un email personalizado para el paciente
      const subject = `Comunicación desde Clínica Dental - ${paciente.nombre_completo}`;
      const body = `Estimado/a ${paciente.nombre_completo},

Esperamos que se encuentre bien. Nos ponemos en contacto desde la clínica dental para...

Datos del paciente:
- Expediente: ${paciente.numero_expediente}
- Email: ${paciente.email}
- Teléfono: ${paciente.telefono || 'No registrado'}

Saludos cordiales,
Equipo de la Clínica Dental`;

      // Abrir el cliente de email con el contenido predefinido
      const mailto = `mailto:${paciente.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailto);

      console.log(`📧 Abriendo email para paciente: ${paciente.nombre_completo} (${paciente.email})`);
      
    } catch (error) {
      console.error('Error al preparar email:', error);
      alert('Error al abrir el cliente de email');
    }
  };

  const handleNuevoPaciente = () => {
    navigate('/pacientes/nuevo');
  };

  const estadisticas = {
    total: pacientes.length,
    activos: pacientes.filter(p => p.activo).length,
    conAlertas: pacientes.filter(p => p.alergias || p.enfermedades_cronicas).length,
    nuevosEsteMes: pacientes.filter(p => {
      const fechaRegistro = new Date(p.fecha_registro);
      const ahora = new Date();
      return fechaRegistro.getMonth() === ahora.getMonth() && 
             fechaRegistro.getFullYear() === ahora.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
            <p className="text-gray-600">Administra la información de los pacientes del consultorio</p>
          </div>
          <button 
            onClick={handleNuevoPaciente}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Paciente
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.activos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Alertas Médicas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.conAlertas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nuevos Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.nuevosEsteMes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, expediente, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fecha_registro">Fecha de Registro</option>
                <option value="apellido_paterno">Apellido</option>
                <option value="nombre">Nombre</option>
                <option value="edad">Edad</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Component */}
        <FiltrosPacientes 
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando pacientes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar pacientes</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pacientesFiltrados.map((paciente) => (
              <TarjetaPaciente
                key={paciente.id}
                paciente={paciente}
                onVerExpediente={handleVerExpediente}
                onDeletePaciente={handleDeletePaciente}
                onSendEmail={handleSendEmail}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pacientesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filtros).some(v => v !== null) 
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Comienza agregando tu primer paciente.'
              }
            </p>
            {!searchTerm && !Object.values(filtros).some(v => v !== null) && (
              <div className="mt-6">
                <button
                  onClick={handleNuevoPaciente}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Agregar Primer Paciente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
