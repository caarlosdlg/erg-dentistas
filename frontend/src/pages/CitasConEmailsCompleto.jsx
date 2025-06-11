import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Página completa de Citas con funcionalidad de emails automáticos
 * Incluye selector de pacientes optimizado y envío automático de emails
 */
const CitasConEmailsCompleto = () => {
  // Estados principales
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Estados de carga
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDentists, setLoadingDentists] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  
  // Estados de UI
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado del formulario de nueva cita
  const [appointmentForm, setAppointmentForm] = useState({
    paciente: '',
    dentista: '',
    tratamiento: '',
    fecha: '',
    hora: '',
    tipo_cita: 'consulta',
    motivo_consulta: '',
    observaciones_previas: '',
    duracion_estimada: 60,
    enviar_email: true // Por defecto enviar email
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadPatientsForDropdown(),
        loadDentists(),
        loadTreatments(),
        loadAppointments()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      alert('Error al cargar datos. Por favor, recarga la página.');
    }
  };

  // Cargar pacientes optimizado para dropdown
  const loadPatientsForDropdown = async () => {
    setLoadingPatients(true);
    try {
      const data = await apiService.getPatientsForDropdown();
      const patientsData = data.results || data || [];
      setPatients(patientsData);
      console.log('✅ Pacientes cargados para dropdown:', patientsData.length);
      
      if (patientsData.length === 0) {
        console.warn('⚠️ No hay pacientes con email disponibles');
      }
    } catch (error) {
      console.error('❌ Error cargando pacientes:', error);
      setPatients([]);
      // Mostrar mensaje de error al usuario
      alert('Error al cargar pacientes. Verifique que el servidor esté funcionando.');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Cargar dentistas
  const loadDentists = async () => {
    setLoadingDentists(true);
    try {
      const data = await apiService.getDentists();
      const dentistsData = data.results || data || [];
      setDentists(dentistsData);
    } catch (error) {
      console.error('❌ Error cargando dentistas:', error);
      setDentists([]);
    } finally {
      setLoadingDentists(false);
    }
  };

  // Cargar tratamientos
  const loadTreatments = async () => {
    setLoadingTreatments(true);
    try {
      const data = await apiService.getTreatments();
      const treatmentsData = data.results || data || [];
      setTreatments(treatmentsData);
    } catch (error) {
      console.error('❌ Error cargando tratamientos:', error);
      setTreatments([]);
    } finally {
      setLoadingTreatments(false);
    }
  };

  // Cargar citas
  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await apiService.getAppointments();
      const appointmentsData = data.results || data || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Manejar selección de paciente
  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setAppointmentForm(prev => ({
      ...prev,
      paciente: patientId
    }));
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Crear nueva cita
  const createAppointment = async () => {
    if (!appointmentForm.paciente || !appointmentForm.dentista || !appointmentForm.fecha || !appointmentForm.hora) {
      alert('❌ Por favor completa todos los campos obligatorios');
      return;
    }

    setCreatingAppointment(true);
    try {
      const citaData = {
        paciente: appointmentForm.paciente,
        dentista: appointmentForm.dentista,
        tratamiento: appointmentForm.tratamiento,
        fecha_hora: `${appointmentForm.fecha}T${appointmentForm.hora}:00`,
        tipo_cita: appointmentForm.tipo_cita,
        motivo_consulta: appointmentForm.motivo_consulta,
        observaciones_previas: appointmentForm.observaciones_previas,
        duracion_estimada: appointmentForm.duracion_estimada,
        estado: 'programada',
        requiere_confirmacion: true
      };

      let response;
      if (appointmentForm.enviar_email) {
        // Crear cita con envío automático de email
        response = await apiService.createAppointmentWithEmail(citaData);
        
        if (response.email_enviado) {
          alert(`✅ Cita creada exitosamente!\n📧 Email enviado a: ${selectedPatient?.email}`);
        } else {
          alert(`✅ Cita creada exitosamente!\n⚠️ Email no pudo ser enviado: ${response.email_error || 'Error desconocido'}`);
        }
      } else {
        // Crear cita sin email
        response = await apiService.createAppointment(citaData);
        alert('✅ Cita creada exitosamente!');
      }

      // Recargar citas y limpiar formulario
      await loadAppointments();
      resetForm();

    } catch (error) {
      console.error('Error creando cita:', error);
      alert(`❌ Error al crear la cita: ${error.message}`);
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Confirmar cita y enviar email
  const confirmAppointment = async (appointmentId) => {
    try {
      const response = await apiService.confirmAppointment(appointmentId);
      
      if (response.email_enviado) {
        alert(`✅ Cita confirmada!\n📧 Email enviado a: ${response.paciente_email}`);
      } else {
        alert('✅ Cita confirmada!\n⚠️ Email no pudo ser enviado.');
      }
      
      await loadAppointments();
    } catch (error) {
      console.error('Error confirmando cita:', error);
      alert(`❌ Error al confirmar la cita: ${error.message}`);
    }
  };

  // Enviar email manualmente
  const sendEmailManually = async (appointmentId) => {
    try {
      const response = await apiService.sendConfirmationEmail(appointmentId);
      
      if (response.email_enviado) {
        alert(`📧 Email enviado exitosamente a: ${response.destinatario}`);
      } else {
        alert('⚠️ No se pudo enviar el email.');
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      alert(`❌ Error al enviar email: ${error.message}`);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setAppointmentForm({
      paciente: '',
      dentista: '',
      tratamiento: '',
      fecha: '',
      hora: '',
      tipo_cita: 'consulta',
      motivo_consulta: '',
      observaciones_previas: '',
      duracion_estimada: 60,
      enviar_email: true
    });
    setSelectedPatient(null);
    setShowCreateForm(false);
  };

  // Filtrar pacientes para búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefono?.includes(searchTerm)
  );

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'todas') return true;
    return appointment.estado === filter;
  });

  // Colores para estados
  const statusColors = {
    programada: 'bg-blue-100 text-blue-700',
    confirmada: 'bg-green-100 text-green-700',
    en_curso: 'bg-yellow-100 text-yellow-700',
    completada: 'bg-gray-100 text-gray-700',
    cancelada: 'bg-red-100 text-red-700',
    no_asistio: 'bg-red-100 text-red-700',
    reagendada: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🦷 Gestión de Citas con Emails</h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de citas médicas con envío automático de correos electrónicos
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ➕ Nueva Cita
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
            <p className="text-gray-600">Pacientes Disponibles</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter(a => a.estado === 'confirmada').length}
            </p>
            <p className="text-gray-600">Citas Confirmadas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {appointments.filter(a => a.estado === 'programada').length}
            </p>
            <p className="text-gray-600">Citas Programadas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-3xl font-bold text-purple-600">{appointments.length}</p>
            <p className="text-gray-600">Total de Citas</p>
          </div>
        </div>

        {/* Modal de crear cita */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📅 Nueva Cita Médica</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Selector de Paciente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Paciente *
                  </label>
                  <select
                    value={appointmentForm.paciente}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingPatients}
                  >
                    <option value="">
                      {loadingPatients 
                        ? 'Cargando pacientes...' 
                        : 'Seleccionar paciente'
                      }
                    </option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.display_text}
                      </option>
                    ))}
                  </select>
                  
                  {selectedPatient && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900">Paciente Seleccionado:</h4>
                      <p className="text-blue-800">
                        <strong>Nombre:</strong> {selectedPatient.nombre_completo}
                      </p>
                      <p className="text-blue-800">
                        <strong>Email:</strong> {selectedPatient.email}
                      </p>
                      <p className="text-blue-800">
                        <strong>Teléfono:</strong> {selectedPatient.telefono || 'No especificado'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid de campos principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dentista */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👨‍⚕️ Dentista *
                    </label>
                    <select
                      value={appointmentForm.dentista}
                      onChange={(e) => handleFormChange('dentista', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingDentists}
                    >
                      <option value="">Seleccionar dentista</option>
                      {dentists.map(dentist => (
                        <option key={dentist.id} value={dentist.id}>
                          {dentist.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tratamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🩺 Tratamiento
                    </label>
                    <select
                      value={appointmentForm.tratamiento}
                      onChange={(e) => handleFormChange('tratamiento', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingTreatments}
                    >
                      <option value="">Seleccionar tratamiento</option>
                      {treatments.map(treatment => (
                        <option key={treatment.id} value={treatment.id}>
                          {treatment.nombre} - ${treatment.precio_base}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📅 Fecha *
                    </label>
                    <input
                      type="date"
                      value={appointmentForm.fecha}
                      onChange={(e) => handleFormChange('fecha', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏰ Hora *
                    </label>
                    <input
                      type="time"
                      value={appointmentForm.hora}
                      onChange={(e) => handleFormChange('hora', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tipo de cita */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📋 Tipo de Cita
                    </label>
                    <select
                      value={appointmentForm.tipo_cita}
                      onChange={(e) => handleFormChange('tipo_cita', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="consulta">Consulta General</option>
                      <option value="tratamiento">Tratamiento</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="emergencia">Emergencia</option>
                      <option value="limpieza">Limpieza Dental</option>
                      <option value="revision">Revisión</option>
                    </select>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⏱️ Duración (minutos)
                    </label>
                    <input
                      type="number"
                      value={appointmentForm.duracion_estimada}
                      onChange={(e) => handleFormChange('duracion_estimada', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="15"
                      max="300"
                      step="15"
                    />
                  </div>
                </div>

                {/* Motivo de consulta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Motivo de Consulta
                  </label>
                  <textarea
                    value={appointmentForm.motivo_consulta}
                    onChange={(e) => handleFormChange('motivo_consulta', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el motivo principal de la consulta..."
                  />
                </div>

                {/* Observaciones previas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Observaciones Previas
                  </label>
                  <textarea
                    value={appointmentForm.observaciones_previas}
                    onChange={(e) => handleFormChange('observaciones_previas', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones especiales o preparación necesaria..."
                  />
                </div>

                {/* Checkbox para envío de email */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <input
                    type="checkbox"
                    id="enviar_email"
                    checked={appointmentForm.enviar_email}
                    onChange={(e) => handleFormChange('enviar_email', e.target.checked)}
                    className="w-5 h-5 text-green-600"
                  />
                  <label htmlFor="enviar_email" className="text-green-800 font-medium">
                    📧 Enviar email de confirmación automáticamente al paciente
                  </label>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createAppointment}
                    disabled={creatingAppointment}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creatingAppointment ? (
                      <>
                        ⏳ Creando cita...
                      </>
                    ) : (
                      <>
                        💾 Crear Cita {appointmentForm.enviar_email && '+ Enviar Email'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros de citas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <h3 className="text-lg font-semibold text-gray-900">Filtrar Citas:</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las citas</option>
              <option value="programada">Programadas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button
              onClick={loadAppointments}
              disabled={loadingAppointments}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loadingAppointments ? '⏳ Cargando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        {/* Lista de citas */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              📅 Lista de Citas ({filteredAppointments.length})
            </h3>
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                {loadingAppointments ? '⏳ Cargando citas...' : '📅 No hay citas disponibles'}
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {appointment.paciente_nombre?.charAt(0) || appointment.numero_cita?.slice(-1) || '?'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {appointment.paciente_nombre || 'Paciente no especificado'}
                          </h4>
                          <p className="text-gray-600">
                            Cita #{appointment.numero_cita} • {appointment.dentista_nombre}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">📅 Fecha y Hora</p>
                          <p className="font-medium">
                            {new Date(appointment.fecha_hora).toLocaleDateString()} a las{' '}
                            {new Date(appointment.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">🩺 Tratamiento</p>
                          <p className="font-medium">{appointment.tratamiento_nombre || appointment.tipo_cita}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">📋 Motivo</p>
                          <p className="font-medium">{appointment.motivo_consulta || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.estado] || 'bg-gray-100 text-gray-700'}`}>
                        {appointment.estado}
                      </span>
                      
                      <div className="flex gap-2">
                        {appointment.estado === 'programada' && (
                          <button
                            onClick={() => confirmAppointment(appointment.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            ✓ Confirmar & Email
                          </button>
                        )}
                        
                        <button
                          onClick={() => sendEmailManually(appointment.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          📧 Enviar Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitasConEmailsCompleto;
