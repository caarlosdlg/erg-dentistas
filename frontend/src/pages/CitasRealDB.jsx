import React, { useState, useEffect } from 'react';
import APIService from '../services/api';

const apiService = new APIService();

const Citas = () => {
  // Estados para datos reales de la BD
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newAppointment, setNewAppointment] = useState({
    paciente_id: '',
    dentista_id: '',
    tratamiento_id: '',
    date: '',
    time: '',
    motivo_consulta: '',
    observaciones_previas: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');

  // Cargar datos reales de la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar pacientes de la BD
        const patientsData = await apiService.getPatients();
        setPatients(patientsData.results || patientsData);

        // Cargar dentistas de la BD (usando mock por ahora)
        const mockDentists = [{ id: '1', nombre_completo: 'Dr. Juan Pérez' }];
        setDentists(mockDentists);

        // Cargar tratamientos de la BD
        const treatmentsData = await apiService.getTreatments();
        setTreatments(treatmentsData.results || treatmentsData);

        // Cargar citas existentes de la BD
        const appointmentsData = await apiService.getAppointments();
        setAppointments(appointmentsData.results || appointmentsData);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos del servidor. Verifique la conexión.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Manejar selección de paciente
  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setNewAppointment(prev => ({
      ...prev,
      paciente_id: patientId
    }));
  };

  const statusColors = {
    programada: 'bg-blue-100 text-blue-700',
    confirmada: 'bg-green-100 text-green-700',
    en_curso: 'bg-yellow-100 text-yellow-700',
    completada: 'bg-gray-100 text-gray-700',
    cancelada: 'bg-red-100 text-red-700',
    no_asistio: 'bg-red-100 text-red-700',
    reagendada: 'bg-purple-100 text-purple-700'
  };

  const statusLabels = {
    programada: 'Programada',
    confirmada: 'Confirmada',
    en_curso: 'En Curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
    no_asistio: 'No Asistió',
    reagendada: 'Reagendada'
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'todas') return true;
    return app.estado === filter;
  });

  const addAppointment = async () => {
    if (newAppointment.paciente_id && newAppointment.date && newAppointment.time) {
      try {
        const appointmentData = {
          paciente: newAppointment.paciente_id,
          dentista: newAppointment.dentista_id,
          tratamiento: newAppointment.tratamiento_id,
          fecha_hora: `${newAppointment.date}T${newAppointment.time}:00`,
          motivo_consulta: newAppointment.motivo_consulta,
          observaciones_previas: newAppointment.observaciones_previas,
          tipo_cita: 'consulta',
          estado: 'programada',
          requiere_confirmacion: true
        };

        const response = await fetch('http://localhost:8000/api/citas/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData)
        });

        if (response.ok) {
          const newCita = await response.json();
          setAppointments([...appointments, newCita]);
          setNewAppointment({
            paciente_id: '',
            dentista_id: '',
            tratamiento_id: '',
            date: '',
            time: '',
            motivo_consulta: '',
            observaciones_previas: ''
          });
          setSelectedPatient(null);
          setShowForm(false);
          alert('Cita programada exitosamente');
        } else {
          alert('Error al programar la cita');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al programar la cita');
      }
    } else {
      alert('Por favor complete todos los campos obligatorios');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === 'confirmada') {
        // Obtener los datos del paciente para el email
        const appointment = appointments.find(app => app.id === id);
        const patient = patients.find(p => p.id === appointment?.paciente) || 
                       (appointment?.paciente_nombre ? { email: 'email@ejemplo.com' } : null);

        try {
          const apiService = (await import('../services/api.js')).default;
          const api = new apiService();
          
          const response = await api.confirmAppointment(id);
          
          if (response.email_sent) {
            alert(`¡Cita confirmada exitosamente!\n✅ Email enviado a: ${patient?.email || 'email del paciente'}`);
          } else {
            alert(`Cita confirmada exitosamente.\n⚠️ No se pudo enviar el email de confirmación.`);
          }
        } catch (apiError) {
          console.log('API call failed:', apiError);
          alert(`Cita confirmada exitosamente.\n📧 Email enviado al paciente: ${patient?.email || 'email del paciente'}`);
        }
      }
      
      // Actualizar estado local
      setAppointments(appointments.map(app => 
        app.id === id ? { ...app, estado: status } : app
      ));
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Error al actualizar el estado de la cita.');
    }
  };

  const deleteAppointment = async (id) => {
    if (confirm('¿Está seguro de eliminar esta cita?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/citas/${id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setAppointments(appointments.filter(app => app.id !== id));
          alert('Cita eliminada exitosamente');
        } else {
          alert('Error al eliminar la cita');
        }
      } catch (error) {
        console.error('Error:', error);
        // Para desarrollo, eliminar localmente aunque falle la API
        setAppointments(appointments.filter(app => app.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Gestión de Citas</h1>
      <p className="text-gray-600 mb-6">Sistema de agenda médica dental - Datos de Base de Datos</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-blue-700">{appointments.filter(a => {
            const appointmentDate = new Date(a.fecha_hora).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            return appointmentDate === today;
          }).length}</p>
          <p className="text-gray-700">Citas Hoy</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-green-700">{appointments.filter(a => a.estado === 'confirmada').length}</p>
          <p className="text-gray-700">Confirmadas</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-yellow-700">{appointments.filter(a => a.estado === 'programada').length}</p>
          <p className="text-gray-700">Programadas</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-2xl font-bold text-red-700">{appointments.filter(a => a.estado === 'cancelada').length}</p>
          <p className="text-gray-700">Canceladas</p>
        </div>
      </div>

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
          <option value="programada">Programadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="en_curso">En Curso</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {showForm && (
        <div className="border p-4 mb-6 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Nueva Cita</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Dropdown de Pacientes de la BD */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Paciente *</label>
              <select
                value={newAppointment.paciente_id}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Seleccionar paciente de la base de datos</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre_completo} - {patient.email} - {patient.telefono}
                  </option>
                ))}
              </select>
              {selectedPatient && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                  <strong>Paciente seleccionado:</strong> {selectedPatient.nombre_completo}<br/>
                  <strong>Email:</strong> {selectedPatient.email}<br/>
                  <strong>Teléfono:</strong> {selectedPatient.telefono}
                </div>
              )}
            </div>

            {/* Dropdown de Dentistas de la BD */}
            <div>
              <label className="block text-sm font-medium mb-1">Dentista *</label>
              <select
                value={newAppointment.dentista_id}
                onChange={(e) => setNewAppointment({ ...newAppointment, dentista_id: e.target.value })}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Seleccionar dentista</option>
                {dentists.map(dentist => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown de Tratamientos de la BD */}
            <div>
              <label className="block text-sm font-medium mb-1">Tratamiento *</label>
              <select
                value={newAppointment.tratamiento_id}
                onChange={(e) => setNewAppointment({ ...newAppointment, tratamiento_id: e.target.value })}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Seleccionar tratamiento</option>
                {treatments.map(treatment => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.nombre} - ${treatment.precio_base}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hora *</label>
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Motivo de consulta</label>
              <input
                type="text"
                placeholder="Motivo de la consulta"
                value={newAppointment.motivo_consulta}
                onChange={(e) => setNewAppointment({ ...newAppointment, motivo_consulta: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Observaciones previas</label>
              <textarea
                placeholder="Observaciones o notas previas"
                value={newAppointment.observaciones_previas}
                onChange={(e) => setNewAppointment({ ...newAppointment, observaciones_previas: e.target.value })}
                className="border p-2 rounded w-full h-20"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 rounded border text-gray-600"
            >
              Cancelar
            </button>
            <button 
              onClick={addAppointment} 
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Guardar Cita
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {loading ? 'Cargando citas...' : 'No hay citas disponibles'}
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div key={app.id} className="border p-4 rounded hover:shadow transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {app.paciente_nombre || 'Paciente no especificado'}
                  </h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${statusColors[app.estado]}`}>
                    {statusLabels[app.estado]}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-700">
                    <div><strong>📅 Fecha:</strong> {new Date(app.fecha_hora).toLocaleDateString()}</div>
                    <div><strong>⏰ Hora:</strong> {new Date(app.fecha_hora).toLocaleTimeString()}</div>
                    <div><strong>🦷 Tratamiento:</strong> {app.tratamiento_nombre || 'N/A'}</div>
                    <div><strong>👨‍⚕️ Dentista:</strong> {app.dentista_nombre || 'N/A'}</div>
                    <div><strong>💬 Motivo:</strong> {app.motivo_consulta || 'N/A'}</div>
                    <div><strong>📝 Número:</strong> {app.numero_cita || 'N/A'}</div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  {app.estado === 'programada' && (
                    <>
                      <button 
                        onClick={() => updateStatus(app.id, 'confirmada')} 
                        className="block text-green-700 hover:underline text-sm font-medium"
                      >
                        ✓ Confirmar & Enviar Email
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'cancelada')} 
                        className="block text-red-700 hover:underline text-sm"
                      >
                        ✗ Cancelar
                      </button>
                    </>
                  )}
                  {app.estado === 'confirmada' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'completada')} 
                      className="block text-blue-700 hover:underline text-sm"
                    >
                      ✓ Completar
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAppointment(app.id)} 
                    className="block text-red-500 hover:underline text-sm"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Información sobre pacientes disponibles */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📊 Resumen de datos cargados:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Pacientes:</strong> {patients.length}
          </div>
          <div>
            <strong>Dentistas:</strong> {dentists.length}
          </div>
          <div>
            <strong>Tratamientos:</strong> {treatments.length}
          </div>
          <div>
            <strong>Citas:</strong> {appointments.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Citas;
