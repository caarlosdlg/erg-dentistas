import React, { useState } from 'react';

const Citas = () => {
  const [appointments, setAppointments] = useState([
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
  ]);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    service: '',
    dentist: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('todas');

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

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'todas') return true;
    return app.status === filter;
  });

  const addAppointment = () => {
    if (newAppointment.patientName && newAppointment.date && newAppointment.time) {
      setAppointments([...appointments, {
        ...newAppointment,
        id: appointments.length + 1,
        status: 'pendiente'
      }]);
      setNewAppointment({ patientName: '', date: '', time: '', service: '', dentist: '' });
      setShowForm(false);
    }
  };

  const updateStatus = (id, status) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, status } : app));
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Gestión de Citas</h1>
      <p className="text-gray-600 mb-6">Sistema de agenda médica dental</p>

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

      {showForm && (
        <div className="border p-4 mb-6 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Nueva Cita</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre del paciente"
              value={newAppointment.patientName}
              onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <select
              value={newAppointment.service}
              onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccionar servicio</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <select
              value={newAppointment.dentist}
              onChange={(e) => setNewAppointment({ ...newAppointment, dentist: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Seleccionar dentista</option>
              {dentists.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded border text-gray-600">Cancelar</button>
            <button onClick={addAppointment} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Guardar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500">No hay citas disponibles</div>
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
                <div className="space-y-1 text-right">
                  {app.status === 'pendiente' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'confirmada')} className="text-green-700 hover:underline text-sm">✓ Confirmar</button>
                      <button onClick={() => updateStatus(app.id, 'cancelada')} className="text-red-700 hover:underline text-sm">✗ Cancelar</button>
                    </>
                  )}
                  {app.status === 'confirmada' && (
                    <button onClick={() => updateStatus(app.id, 'completada')} className="text-blue-700 hover:underline text-sm">✓ Completar</button>
                  )}
                  <button onClick={() => deleteAppointment(app.id)} className="text-red-500 hover:underline text-sm">🗑 Eliminar</button>
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