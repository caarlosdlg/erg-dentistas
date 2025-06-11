import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const CitasConSeleccionPacientes = () => {
  // Estados principales
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [dentists, setDentists] = useState([]);
  const [loadingDentists, setLoadingDentists] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);

  // Estado para nueva cita simplificado
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Carga inicial
    Promise.all([
      loadPatients(),
      loadAppointments(),
      loadDentists(),
      loadTreatments()
    ]).catch(error => {
      console.error('Error en la carga inicial:', error);
      alert('❌ Error cargando datos iniciales. Por favor, intente recargar la página.');
    });
  }, []);

  // Función para cargar pacientes
  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await apiService.getPatients();
      const patientsData = data.results || data || [];
      if (patientsData.length === 0) {
        console.warn('⚠️ No hay pacientes registrados');
      }
      setPatients(patientsData);
      console.log('✅ Pacientes cargados:', patientsData.length);
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);
      setPatients([]);
      throw error; // Re-throw para manejo superior
    } finally {
      setLoadingPatients(false);
    }
  };

  // Función para cargar citas
  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
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
      }
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Función para cargar dentistas disponibles
  const loadDentists = async () => {
    setLoadingDentists(true);
    try {
      const data = await apiService.getDentists();
      const dentistsData = data.results || data || [];
      if (!dentistsData.length) {
        console.warn('⚠️ No hay dentistas disponibles');
      }
      setDentists(dentistsData);
    } catch (error) {
      console.error('❌ Error cargando dentistas:', error);
      setDentists([]);
    } finally {
      setLoadingDentists(false);
    }
  };

  // Función para cargar tratamientos
  const loadTreatments = async () => {
    try {
      const data = await apiService.getTreatments();
      const treatmentsData = data.results || data || [];
      if (!treatmentsData.length) {
        console.warn('⚠️ No hay tratamientos disponibles');
      }
      setTreatments(treatmentsData);
    } catch (error) {
      console.error('❌ Error cargando tratamientos:', error);
      setTreatments([]);
    }
  };

  // Validar horario del dentista
  const validateDentistSchedule = (date, time, dentist) => {
    if (!date || !time || !dentist) return false;

    // Convertir fecha y hora a un objeto Date
    const appointmentDate = new Date(`${date}T${time}`);
    const dayOfWeek = appointmentDate.getDay() + 1; // 1=Lunes, 7=Domingo

    // Verificar si el dentista trabaja ese día
    if (!dentist.dias_laborales?.includes(String(dayOfWeek))) {
      const dias = {
        1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
        4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
      };
      alert(`⚠️ El dentista no trabaja los ${dias[dayOfWeek]}`);
      return false;
    }

    // Verificar horario
    const appointmentTime = time.split(':').map(Number);
    const startTime = dentist.horario_inicio?.split(':').map(Number);
    const endTime = dentist.horario_fin?.split(':').map(Number);

    if (!startTime || !endTime) {
      console.error('Horario del dentista no disponible');
      return false;
    }

    const appointment = appointmentTime[0] * 60 + appointmentTime[1];
    const start = startTime[0] * 60 + startTime[1];
    const end = endTime[0] * 60 + endTime[1];

    if (appointment < start || appointment > end) {
      alert(`⚠️ El horario de atención del dentista es de ${dentist.horario_inicio} a ${dentist.horario_fin}`);
      return false;
    }

    return true;
  };

  // Función para crear cita rápida
  const createQuickAppointment = async (patient) => {
    try {
      if (!patient || !newAppointment.date || !newAppointment.time || !selectedDentist) {
        alert('❌ Se requiere seleccionar paciente, fecha, hora y dentista');
        return;
      }

      // Validar horario del dentista
      if (!validateDentistSchedule(newAppointment.date, newAppointment.time, selectedDentist)) {
        return;
      }

      // Obtener el primer tratamiento disponible
      const defaultTreatment = treatments[0];
      if (!defaultTreatment) {
        alert('❌ Error: No hay tratamientos disponibles. Por favor, configure los tratamientos primero.');
        return;
      }

      const citaData = {
        paciente: patient.id,
        dentista: selectedDentist.id,
        tipo_cita: 'consulta',
        estado: 'programada',
        fecha_hora: `${newAppointment.date}T${newAppointment.time}:00`,
        duracion_estimada: defaultTreatment.duracion_estimada || 30,
        motivo_consulta: 'Consulta general programada',
        notas_dentista: '',
        observaciones_previas: '',
        costo_estimado: defaultTreatment.precio_base || 500,
        requiere_confirmacion: true,
        tratamiento: defaultTreatment.id
      };

      try {
        const response = await apiService.createAppointment(citaData);
        console.log('✅ Cita creada:', response);
        alert('✅ Cita creada exitosamente');
        
        // Recargar citas
        await loadAppointments();

        // Limpiar formulario
        setNewAppointment({
          date: '',
          time: ''
        });
        setSelectedDentist(null);

      } catch (error) {
        if (error.message.includes('UUID')) {
          alert('❌ Error: Formato de ID inválido. Por favor contacte al administrador.');
        } else {
          alert(`❌ Error al crear la cita: ${error.message}`);
        }
        console.error('Error details:', error);
      }

    } catch (error) {
      console.error('Error general:', error);
      alert('❌ Error al procesar la solicitud');
    }
  };

  // Filtrar pacientes por búsqueda
  const filteredPatients = patients.filter(patient => 
    patient.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefono?.includes(searchTerm)
  );

  // Filtrar citas
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'todas') return true;
    return app.status === filter;
  });

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        👥 Asignación Rápida de Citas
      </h1>
      <p className="text-gray-600 mb-6">
        Selecciona un paciente y asigna una fecha para crear una cita instantáneamente
      </p>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-blue-700">{patients.length}</p>
          <p className="text-gray-700">Total Pacientes</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-green-700">
            {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
          </p>
          <p className="text-gray-700">Citas Hoy</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {appointments.filter(a => a.status === 'pendiente').length}
          </p>
          <p className="text-gray-700">Pendientes</p>
        </div>
        <div className="bg-purple-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-purple-700">
            {appointments.length}
          </p>
          <p className="text-gray-700">Total Citas</p>
        </div>
      </div>

      {/* Controles principales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-semibold">Configurar Nueva Cita</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">📅 Fecha:</label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                className="border rounded px-3 py-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">⏰ Hora:</label>
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                className="border rounded px-3 py-1"
              />
            </div>

            {/* Dentista seleccionado */}
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">👨‍⚕️ Dentista:</label>
              <select
                value={selectedDentist?.id || ''}
                onChange={(e) => {
                  const dentist = dentists.find(d => d.id === parseInt(e.target.value));
                  setSelectedDentist(dentist);
                }}
                className="border rounded px-3 py-1"
                disabled={loadingDentists}
              >
                {loadingDentists ? (
                  <option value="">Cargando dentistas...</option>
                ) : dentists.length === 0 ? (
                  <option value="">No hay dentistas disponibles</option>
                ) : (
                  dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.nombre_completo || dentist.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <button
              onClick={() => setShowPatientsList(!showPatientsList)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                showPatientsList 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showPatientsList ? '❌ Ocultar Pacientes' : '👥 Mostrar Pacientes'}
            </button>
          </div>
        </div>

        {(newAppointment.date && newAppointment.time) && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              ✅ Cita configurada para: {newAppointment.date} a las {newAppointment.time}
            </p>
            <p className="text-green-600 text-sm">
              Ahora selecciona un paciente de la lista para asignar la cita
            </p>
          </div>
        )}
      </div>

      {/* Lista de pacientes */}
      {showPatientsList && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h3 className="text-lg font-semibold">
                📋 Lista de Pacientes ({filteredPatients.length})
              </h3>
              
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="🔍 Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-2 w-64"
                />
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingPatients ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">🔄 Cargando pacientes...</div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">
                  {searchTerm ? '🔍 No se encontraron pacientes' : '👥 No hay pacientes disponibles'}
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPatients.map(patient => (
                  <div 
                    key={patient.id} 
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {patient.nombre_completo?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {patient.nombre_completo || 'Nombre no disponible'}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📧 {patient.email || 'Email no disponible'}</p>
                              <p>📞 {patient.telefono || 'Teléfono no disponible'}</p>
                              {patient.fecha_nacimiento && (
                                <p>🎂 {new Date(patient.fecha_nacimiento).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => createQuickAppointment(patient)}
                          disabled={!newAppointment.date || !newAppointment.time}
                          className={`px-4 py-2 rounded font-medium transition-colors ${
                            newAppointment.date && newAppointment.time
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {newAppointment.date && newAppointment.time 
                            ? '➕ Asignar Cita' 
                            : '⏰ Configura fecha/hora'}
                        </button>
                        
                        {/* Mostrar citas existentes del paciente */}
                        {appointments.filter(apt => apt.patientEmail === patient.email).length > 0 && (
                          <div className="text-xs text-blue-600">
                            {appointments.filter(apt => apt.patientEmail === patient.email).length} cita(s) existente(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de citas existentes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg font-semibold">📅 Citas Programadas</h3>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="todas">Todas las citas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loadingAppointments ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">🔄 Cargando citas...</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">📅 No hay citas disponibles</div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                          {appointment.patientName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {appointment.patientName}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📧 {appointment.patientEmail}</p>
                            <p>📅 {appointment.date} ⏰ {appointment.time}</p>
                            <p>🦷 {appointment.service}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                      </span>
                      <div className="text-xs text-gray-500">
                        ID: {appointment.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>📋 Pacientes cargados:</strong> {patients.length}
            {loadingPatients && <span className="text-blue-600"> (Cargando...)</span>}
          </div>
          <div>
            <strong>📅 Citas totales:</strong> {appointments.length}
            {loadingAppointments && <span className="text-blue-600"> (Cargando...)</span>}
          </div>
          <div>
            <strong>⚙️ Nueva cita:</strong> {newAppointment.date && newAppointment.time ? '✅ Configurada' : '⏰ Pendiente'}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <button 
            onClick={() => {
              loadPatients();
              loadAppointments();
            }}
            className="text-blue-600 hover:underline text-sm"
            disabled={loadingPatients || loadingAppointments}
          >
            🔄 {loadingPatients || loadingAppointments ? 'Recargando...' : 'Recargar datos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitasConSeleccionPacientes;
