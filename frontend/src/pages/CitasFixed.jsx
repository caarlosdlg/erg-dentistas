import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const CitasFixed = () => {
  console.log('🔍 CitasFixed: Componente iniciando...');
  
  // Estados principales
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientEmail: '',
    date: '',
    time: '',
    service: '',
    dentist: ''
  });

  // Datos mock como respaldo
  const mockAppointments = [
    {
      id: 1,
      patientName: 'Ana García',
      date: '2025-06-10',
      time: '09:00',
      status: 'confirmada',
      service: 'Limpieza dental',
      dentist: 'Dr. Juan Pérez'
    },
    {
      id: 2,
      patientName: 'Carlos López',
      date: '2025-06-10',
      time: '10:30',
      status: 'pendiente',
      service: 'Consulta general',
      dentist: 'Dr. Juan Pérez'
    },
    {
      id: 3,
      patientName: 'María Rodríguez',
      date: '2025-06-10',
      time: '14:00',
      status: 'cancelada',
      service: 'Ortodoncia',
      dentist: 'Dra. Ana Martínez'
    },
    {
      id: 4,
      patientName: 'Luis Hernández',
      date: '2025-06-11',
      time: '11:00',
      status: 'confirmada',
      service: 'Endodoncia',
      dentist: 'Dr. Juan Pérez'
    }
  ];

  // Función para cargar pacientes con manejo robusto de errores
  const loadPatients = async () => {
    console.log('🔍 CitasFixed: Cargando pacientes...');
    setLoadingPatients(true);
    try {
      if (!apiService) {
        throw new Error('API Service no disponible');
      }
      
      const data = await apiService.getPatients();
      const patientsData = data.results || data || [];
      setPatients(patientsData);
      console.log('✅ CitasFixed: Pacientes cargados:', patientsData.length);
    } catch (error) {
      console.error('❌ CitasFixed: Error al cargar pacientes:', error);
      // No mostrar error crítico, solo log
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Función para cargar citas con manejo robusto de errores
  const loadAppointments = async () => {
    console.log('🔍 CitasFixed: Cargando citas...');
    setLoadingAppointments(true);
    try {
      if (!apiService) {
        throw new Error('API Service no disponible');
      }
      
      const data = await apiService.getAppointments();
      const citasFromDB = data.results || data || [];
      
      if (citasFromDB.length > 0) {
        const transformedAppointments = citasFromDB.map(cita => ({
          id: cita.id,
          patientName: cita.paciente_nombre || `Paciente ${cita.paciente}`,
          patientEmail: cita.paciente_email || '',
          date: cita.fecha_hora ? cita.fecha_hora.split('T')[0] : '',
          time: cita.fecha_hora ? cita.fecha_hora.split('T')[1]?.substring(0, 5) : '',
          status: cita.estado || 'pendiente',
          service: cita.tratamiento_nombre || cita.motivo_consulta || 'Consulta general',
          dentist: cita.dentista_nombre || 'Dr. No asignado'
        }));
        
        setAppointments(transformedAppointments);
        console.log('✅ CitasFixed: Citas cargadas desde BD:', transformedAppointments.length);
      } else {
        setAppointments(mockAppointments);
        console.log('ℹ️ CitasFixed: Usando datos mock');
      }
    } catch (error) {
      console.error('❌ CitasFixed: Error al cargar citas:', error);
      setAppointments(mockAppointments);
      console.log('⚠️ CitasFixed: Usando datos mock por error');
    } finally {
      setLoadingAppointments(false);
    }
  };

  // UseEffect con manejo de errores
  useEffect(() => {
    console.log('🔍 CitasFixed: useEffect ejecutándose...');
    
    const initializeData = async () => {
      try {
        // Cargar datos de forma secuencial para evitar problemas de concurrencia
        await loadPatients();
        await loadAppointments();
        console.log('✅ CitasFixed: Inicialización completada');
      } catch (error) {
        console.error('❌ CitasFixed: Error en inicialización:', error);
        // No establecer error crítico, componente sigue funcionando
      }
    };

    initializeData();
  }, []);

  // Función para manejar selección de paciente
  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === parseInt(patientId));
    setSelectedPatient(patient);
    setNewAppointment(prev => ({
      ...prev,
      patientName: patient ? patient.nombre_completo : '',
      patientEmail: patient ? patient.email : ''
    }));
  };

  // Datos para los selects
  const services = ['Limpieza dental', 'Consulta general', 'Ortodoncia', 'Endodoncia', 'Extracción', 'Blanqueamiento', 'Implante'];
  const dentists = ['Dr. Juan Pérez', 'Dra. Ana Martínez', 'Dr. Carlos Sánchez', 'Dra. María González'];

  const statusColors = {
    confirmada: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    cancelada: 'bg-red-100 text-red-700',
    completada: 'bg-blue-100 text-blue-700'
  };

  const statusLabels = {
    confirmada: 'Confirmada',
    pendiente: 'Pendiente',
    cancelada: 'Cancelada',
    completada: 'Completada'
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'todas') return true;
    return app.status === filter;
  });

  console.log('✅ CitasFixed: Renderizando componente...');

  // Mostrar error si existe
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-sm underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Gestión de Citas</h1>
      <p className="text-gray-600 mb-6">Sistema de agenda médica dental</p>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-blue-700">{appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</p>
          <p className="text-gray-700">Citas Hoy</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-green-700">{appointments.filter(a => a.date > new Date().toISOString().split('T')[0]).length}</p>
          <p className="text-gray-700">Próximas</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-yellow-700">{appointments.filter(a => a.status === 'pendiente').length}</p>
          <p className="text-gray-700">Pendientes</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-red-700">{appointments.filter(a => a.status === 'cancelada').length}</p>
          <p className="text-gray-700">Canceladas</p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Nueva Cita
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="todas">Todas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
          <option value="completada">Completadas</option>
        </select>
      </div>

      {/* Formulario simplificado */}
      {showForm && (
        <div className="border p-4 mb-6 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Nueva Cita</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={loadingPatients}
              >
                <option value="">
                  {loadingPatients 
                    ? 'Cargando pacientes...' 
                    : patients.length === 0 
                      ? 'No hay pacientes disponibles'
                      : 'Seleccionar paciente'
                  }
                </option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre_completo} - {patient.email}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              className="border p-2 rounded w-full"
              placeholder="Fecha"
            />
            
            <input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              className="border p-2 rounded w-full"
              placeholder="Hora"
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 rounded border text-gray-600"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                alert('Función de guardar simplificada para debug');
                setShowForm(false);
              }}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {loadingAppointments ? 'Cargando citas...' : 'No hay citas disponibles'}
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div key={app.id} className="border p-4 rounded hover:shadow transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{app.patientName}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-700">
                    <div><strong>📅 Fecha:</strong> {app.date}</div>
                    <div><strong>⏰ Hora:</strong> {app.time}</div>
                    <div><strong>🦷 Servicio:</strong> {app.service}</div>
                    <div><strong>👨‍⚕️ Dentista:</strong> {app.dentist}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estado del sistema */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Pacientes:</strong> {patients.length}
            {loadingPatients && <span className="text-blue-600"> (Cargando...)</span>}
          </div>
          <div>
            <strong>Citas:</strong> {appointments.length}
            {loadingAppointments && <span className="text-blue-600"> (Cargando...)</span>}
          </div>
          <div>
            <strong>Seleccionado:</strong> {selectedPatient?.nombre_completo || 'Ninguno'}
          </div>
          <div>
            <strong>Hoy:</strong> {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
          </div>
        </div>
        
        <div className="mt-3 flex gap-4 text-xs">
          <button 
            onClick={() => {
              loadPatients();
              loadAppointments();
            }}
            className="text-blue-600 hover:underline"
            disabled={loadingPatients || loadingAppointments}
          >
            🔄 {loadingPatients || loadingAppointments ? 'Recargando...' : 'Recargar datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitasFixed;
