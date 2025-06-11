import React, { useState, useEffect } from 'react';
import { apiSimple } from '../services/apiSimple';

const Citas = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newAppointment, setNewAppointment] = useState({
    paciente: '',
    patientName: '',
    date: '',
    time: '',
    service: '',
    dentist: '',
    dentista: '',
    motivo_consulta: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);

  const services = ['Limpieza dental', 'Consulta general', 'Ortodoncia', 'Endodoncia', 'Extracción', 'Blanqueamiento', 'Implante'];

  const statusColors = {
    programada: 'bg-blue-100 text-blue-700',
    confirmada: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    cancelada: 'bg-red-100 text-red-700',
    completada: 'bg-purple-100 text-purple-700'
  };

  const statusLabels = {
    programada: 'Programada',
    confirmada: 'Confirmada',
    pendiente: 'Pendiente',
    cancelada: 'Cancelada',
    completada: 'Completada'
  };

  // Load data from API
  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDentists();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiSimple.getCitas();
      console.log('📅 Citas cargadas:', response);
      
      // Transform API data to component format
      const transformedAppointments = response.map(cita => ({
        id: cita.id,
        patientName: cita.paciente_nombre || cita.paciente?.nombre_completo || 'Paciente no disponible',
        patientEmail: cita.paciente_email || cita.paciente?.email || null,
        date: cita.fecha_hora ? cita.fecha_hora.split('T')[0] : '',
        time: cita.fecha_hora ? cita.fecha_hora.split('T')[1]?.substring(0, 5) : '',
        status: cita.estado || 'pendiente',
        service: cita.tratamiento_nombre || cita.motivo_consulta || 'Consulta general',
        dentist: cita.dentista_nombre || cita.dentista?.nombre_completo || 'No asignado',
        numero_cita: cita.numero_cita,
        motivo_consulta: cita.motivo_consulta,
        costo_estimado: cita.costo_estimado,
        duracion_estimada: cita.duracion_estimada
      }));
      
      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('❌ Error al cargar citas:', err);
      setError('Error al cargar las citas: ' + err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await apiSimple.getPatientsForDropdown();
      console.log('👥 Pacientes cargados:', response);
      setPatients(response.pacientes || response || []);
    } catch (err) {
      console.error('❌ Error al cargar pacientes:', err);
    }
  };

  const loadDentists = async () => {
    try {
      const response = await apiSimple.getDentistas();
      console.log('👨‍⚕️ Dentistas cargados:', response);
      setDentists(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('❌ Error al cargar dentistas:', err);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'todas') return true;
    return app.status === filter;
  });

  const addAppointment = async () => {
    if (newAppointment.paciente && newAppointment.date && newAppointment.time && newAppointment.motivo_consulta) {
      try {
        setLoading(true);
        
        // Prepare data for API
        const citaData = {
          paciente: newAppointment.paciente,
          dentista: newAppointment.dentista || dentists[0]?.id, // Use first dentist if none selected
          fecha_hora: `${newAppointment.date}T${newAppointment.time}:00`,
          motivo_consulta: newAppointment.motivo_consulta,
          tipo_cita: 'consulta',
          estado: 'programada',
          duracion_estimada: 30,
          costo_estimado: 0
        };

        console.log('📅 Creando nueva cita:', citaData);
        const response = await apiSimple.createAppointment(citaData);
        console.log('✅ Cita creada:', response);

        // Reload appointments to get fresh data
        await loadAppointments();
        
        // Reset form
        setNewAppointment({ 
          paciente: '',
          patientName: '',
          date: '',
          time: '',
          service: '',
          dentist: '',
          dentista: '',
          motivo_consulta: ''
        });
        setShowForm(false);
        
      } catch (err) {
        console.error('❌ Error al crear cita:', err);
        setError('Error al crear la cita: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Por favor complete todos los campos requeridos (Paciente, Fecha, Hora, Motivo)');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // Find the appointment and update its status
      const appointment = appointments.find(app => app.id === id);
      if (!appointment) return;

      console.log(`🔄 Actualizando estado de cita ${id} a ${status}`);
      
      // For now, update locally - could implement actual API call if needed
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, status } : app
      ));
      
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      setError('Error al actualizar el estado: ' + err.message);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cita?')) {
      try {
        console.log(`🗑️ Eliminando cita ${id}`);
        
        // For now, remove from local state - could implement actual API delete if needed
        setAppointments(appointments.filter(app => app.id !== id));
        
      } catch (err) {
        console.error('❌ Error al eliminar cita:', err);
        setError('Error al eliminar la cita: ' + err.message);
      }
    }
  };

  const sendEmailToPatient = async (appointmentId, patientEmail) => {
    if (!patientEmail) {
      alert('Este paciente no tiene email registrado');
      return;
    }

    try {
      console.log(`📧 Enviando email de confirmación para cita ${appointmentId}`);
      
      // You can implement the actual email sending API call here
      const response = await apiSimple.sendConfirmationEmail(appointmentId);
      console.log('✅ Email enviado:', response);
      
      alert(`Email enviado exitosamente a ${patientEmail}`);
      
    } catch (err) {
      console.error('❌ Error al enviar email:', err);
      alert('Error al enviar el email: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Gestión de Citas</h1>
      <p className="text-gray-600 mb-6">Sistema de agenda médica dental - Datos en tiempo real</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      )}

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
          <p className="text-2xl font-bold text-yellow-700">{appointments.filter(a => a.status === 'pendiente' || a.status === 'programada').length}</p>
          <p className="text-gray-700">Pendientes</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-red-700">{appointments.filter(a => a.status === 'cancelada').length}</p>
          <p className="text-gray-700">Canceladas</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          ➕ Nueva Cita
        </button>
        <div className="flex gap-2 items-center">
          <button
            onClick={loadAppointments}
            className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
            disabled={loading}
          >
            🔄 Actualizar
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="todas">Todas</option>
            <option value="programada">Programadas</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
            <option value="completada">Completadas</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="border p-4 mb-6 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Nueva Cita</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={newAppointment.paciente}
              onChange={(e) => {
                const selectedPatient = patients.find(p => p.id === e.target.value);
                setNewAppointment({ 
                  ...newAppointment, 
                  paciente: e.target.value,
                  patientName: selectedPatient ? selectedPatient.nombre_completo : ''
                });
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.info_display || patient.nombre_completo}
                </option>
              ))}
            </select>
            <select
              value={newAppointment.dentista}
              onChange={(e) => setNewAppointment({ ...newAppointment, dentista: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccionar dentista</option>
              {dentists.map(dentist => (
                <option key={dentist.id} value={dentist.id}>
                  {dentist.nombre_completo}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
            <select
              value={newAppointment.service}
              onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccionar servicio</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea
              placeholder="Motivo de consulta (requerido)"
              value={newAppointment.motivo_consulta}
              onChange={(e) => setNewAppointment({ ...newAppointment, motivo_consulta: e.target.value })}
              className="border p-2 rounded w-full"
              rows="2"
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              onClick={addAppointment} 
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p>Cargando citas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay citas disponibles</p>
            {filter !== 'todas' && (
              <p className="text-sm mt-2">Prueba cambiando el filtro o crear una nueva cita</p>
            )}
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div key={app.id} className="border p-4 rounded hover:shadow transition bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{app.patientName}</h3>
                    {app.patientEmail && (
                      <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <span>📧</span>
                        <a href={`mailto:${app.patientEmail}`} className="hover:underline">
                          {app.patientEmail}
                        </a>
                      </div>
                    )}
                    <span className={`text-sm px-2 py-1 rounded-full ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    {app.numero_cita && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {app.numero_cita}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700">
                    <div><strong>📅 Fecha:</strong> {app.date || 'No especificada'}</div>
                    <div><strong>⏰ Hora:</strong> {app.time || 'No especificada'}</div>
                    <div><strong>🦷 Servicio:</strong> {app.service || 'Consulta general'}</div>
                    <div><strong>👨‍⚕️ Dentista:</strong> {app.dentist || 'No asignado'}</div>
                  </div>
                  {app.motivo_consulta && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>📝 Motivo:</strong> {app.motivo_consulta}
                    </div>
                  )}
                  {(app.duracion_estimada || app.costo_estimado) && (
                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                      {app.duracion_estimada && (
                        <span>⏱️ Duración: {app.duracion_estimada} min</span>
                      )}
                      {app.costo_estimado && (
                        <span>💰 Costo: ${app.costo_estimado}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-right ml-4">
                  {app.patientEmail && (
                    <button 
                      onClick={() => sendEmailToPatient(app.id, app.patientEmail)} 
                      className="text-blue-700 hover:underline text-sm whitespace-nowrap"
                      title={`Enviar email a ${app.patientEmail}`}
                    >
                      📧 Enviar Email
                    </button>
                  )}
                  {(app.status === 'pendiente' || app.status === 'programada') && (
                    <>
                      <button 
                        onClick={() => updateStatus(app.id, 'confirmada')} 
                        className="text-green-700 hover:underline text-sm whitespace-nowrap"
                      >
                        ✓ Confirmar
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'cancelada')} 
                        className="text-red-700 hover:underline text-sm whitespace-nowrap"
                      >
                        ✗ Cancelar
                      </button>
                    </>
                  )}
                  {app.status === 'confirmada' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'completada')} 
                      className="text-blue-700 hover:underline text-sm whitespace-nowrap"
                    >
                      ✓ Completar
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAppointment(app.id)} 
                    className="text-red-500 hover:underline text-sm whitespace-nowrap"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Citas;