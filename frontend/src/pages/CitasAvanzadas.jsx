import React, { useState, useEffect } from 'react';

/**
 * Advanced Citas Management Page
 * Real appointment scheduling and management functionality
 */
const CitasAvanzadas = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedView, setSelectedView] = useState('day'); // day, week, month
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  
  const [formData, setFormData] = useState({
    paciente_id: '',
    dentista_id: '',
    tratamiento_id: '',
    fecha: '',
    hora: '',
    duracion_estimada: 60,
    tipo_cita: 'consulta',
    motivo_consulta: '',
    observaciones_previas: '',
    requiere_confirmacion: true
  });

  // Mock data
  const mockPatients = [
    { id: '1', nombre_completo: 'María González López', telefono: '+52-555-0123' },
    { id: '2', nombre_completo: 'Carlos Martínez Ruiz', telefono: '+52-555-0125' },
    { id: '3', nombre_completo: 'Ana Rodríguez Hernández', telefono: '+52-555-0127' }
  ];

  const mockDentists = [
    { id: '1', nombre_completo: 'Dr. Juan Pérez', especialidad: 'Odontología General' },
    { id: '2', nombre_completo: 'Dra. Sofia Mendoza', especialidad: 'Endodoncia' },
    { id: '3', nombre_completo: 'Dr. Roberto Sánchez', especialidad: 'Cirugía Oral' }
  ];

  const mockTreatments = [
    { id: '1', nombre: 'Consulta General', duracion_estimada: 60, precio_base: 500 },
    { id: '2', nombre: 'Limpieza Dental', duracion_estimada: 45, precio_base: 800 },
    { id: '3', nombre: 'Empaste', duracion_estimada: 90, precio_base: 1200 },
    { id: '4', nombre: 'Endodoncia', duracion_estimada: 120, precio_base: 3500 },
    { id: '5', nombre: 'Extracción', duracion_estimada: 60, precio_base: 1000 }
  ];

  const mockAppointments = [
    {
      id: '1',
      numero_cita: 'CIT-000001',
      paciente: { nombre_completo: 'María González López' },
      dentista: { nombre_completo: 'Dr. Juan Pérez' },
      tratamiento: { nombre: 'Limpieza Dental' },
      fecha_hora: '2024-06-09T09:00:00',
      duracion_estimada: 45,
      tipo_cita: 'limpieza',
      estado: 'confirmada',
      motivo_consulta: 'Limpieza preventiva anual',
      costo_estimado: 800,
      notas_dentista: ''
    },
    {
      id: '2',
      numero_cita: 'CIT-000002',
      paciente: { nombre_completo: 'Carlos Martínez Ruiz' },
      dentista: { nombre_completo: 'Dra. Sofia Mendoza' },
      tratamiento: { nombre: 'Endodoncia' },
      fecha_hora: '2024-06-09T11:00:00',
      duracion_estimada: 120,
      tipo_cita: 'tratamiento',
      estado: 'programada',
      motivo_consulta: 'Dolor severo en molar superior',
      costo_estimado: 3500,
      notas_dentista: 'Requiere radiografía previa'
    },
    {
      id: '3',
      numero_cita: 'CIT-000003',
      paciente: { nombre_completo: 'Ana Rodríguez Hernández' },
      dentista: { nombre_completo: 'Dr. Roberto Sánchez' },
      tratamiento: { nombre: 'Consulta General' },
      fecha_hora: '2024-06-09T14:30:00',
      duracion_estimada: 60,
      tipo_cita: 'consulta',
      estado: 'en_curso',
      motivo_consulta: 'Revisión rutinaria',
      costo_estimado: 500,
      notas_dentista: ''
    }
  ];

  useEffect(() => {
    setAppointments(mockAppointments);
    setPatients(mockPatients);
    setDentists(mockDentists);
    setTreatments(mockTreatments);
  }, []);

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      apt.fecha_hora.split('T')[0] === date
    ).sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  };

  const getStatusColor = (status) => {
    const colors = {
      'programada': 'bg-blue-100 text-blue-800',
      'confirmada': 'bg-green-100 text-green-800',
      'en_curso': 'bg-yellow-100 text-yellow-800',
      'completada': 'bg-gray-100 text-gray-800',
      'cancelada': 'bg-red-100 text-red-800',
      'no_asistio': 'bg-red-100 text-red-800',
      'reagendada': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió',
      'reagendada': 'Reagendada'
    };
    return labels[status] || status;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update duration when treatment changes
      if (field === 'tratamiento_id') {
        const treatment = treatments.find(t => t.id === value);
        if (treatment) {
          updated.duracion_estimada = treatment.duracion_estimada;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const patient = patients.find(p => p.id === formData.paciente_id);
    const dentist = dentists.find(d => d.id === formData.dentista_id);
    const treatment = treatments.find(t => t.id === formData.tratamiento_id);
    
    const newAppointment = {
      id: Date.now().toString(),
      numero_cita: `CIT-${String(appointments.length + 1).padStart(6, '0')}`,
      paciente: { nombre_completo: patient?.nombre_completo || '' },
      dentista: { nombre_completo: dentist?.nombre_completo || '' },
      tratamiento: { nombre: treatment?.nombre || '' },
      fecha_hora: `${formData.fecha}T${formData.hora}:00`,
      duracion_estimada: formData.duracion_estimada,
      tipo_cita: formData.tipo_cita,
      estado: 'programada',
      motivo_consulta: formData.motivo_consulta,
      costo_estimado: treatment?.precio_base || 0,
      notas_dentista: '',
      observaciones_previas: formData.observaciones_previas,
      requiere_confirmacion: formData.requiere_confirmacion
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setIsCreateModalOpen(false);
    setFormData({
      paciente_id: '',
      dentista_id: '',
      tratamiento_id: '',
      fecha: '',
      hora: '',
      duracion_estimada: 60,
      tipo_cita: 'consulta',
      motivo_consulta: '',
      observaciones_previas: '',
      requiere_confirmacion: true
    });
    alert('Cita programada exitosamente');
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, estado: newStatus }
          : apt
      )
    );
  };

  const getTodayStats = () => {
    const todayAppointments = getAppointmentsForDate(selectedDate);
    return {
      total: todayAppointments.length,
      confirmadas: todayAppointments.filter(apt => apt.estado === 'confirmada').length,
      pendientes: todayAppointments.filter(apt => apt.estado === 'programada').length,
      enCurso: todayAppointments.filter(apt => apt.estado === 'en_curso').length,
      completadas: todayAppointments.filter(apt => apt.estado === 'completada').length
    };
  };

  const stats = getTodayStats();
  const todayAppointments = getAppointmentsForDate(selectedDate);

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const bookedSlots = todayAppointments.map(apt => {
    const time = new Date(apt.fecha_hora);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  });

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda de Citas</h1>
            <p className="text-gray-600">Gestión avanzada de citas y horarios</p>
          </div>
          <Flex gap={3}>
            <Button 
              variant="outline"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Hoy
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nueva Cita
            </Button>
          </Flex>
        </Flex>

        {/* Date Selector and View Controls */}
        <Card>
          <Card.Content className="p-6">
            <Flex justify="space-between" align="center" className="flex-wrap gap-4">
              <Flex gap={4} align="center">
                <Input
                  type="date"
                  label="Fecha"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <div className="flex gap-2">
                  {['day', 'week', 'month'].map(view => (
                    <Button
                      key={view}
                      variant={selectedView === view ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedView(view)}
                    >
                      {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                    </Button>
                  ))}
                </div>
              </Flex>
              
              <Flex gap={2}>
                <Button variant="outline" size="sm">
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  Exportar
                </Button>
              </Flex>
            </Flex>
          </Card.Content>
        </Card>

        {/* Daily Stats */}
        <Grid cols={5} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Total del Día</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-gray-500">Citas programadas</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Confirmadas</h3>
                <div className="text-3xl font-bold text-green-600">{stats.confirmadas}</div>
                <p className="text-sm text-gray-500">Listas para atender</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Pendientes</h3>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendientes}</div>
                <p className="text-sm text-gray-500">Sin confirmar</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">En Curso</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.enCurso}</div>
                <p className="text-sm text-gray-500">Atendiendo ahora</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Completadas</h3>
                <div className="text-3xl font-bold text-gray-600">{stats.completadas}</div>
                <p className="text-sm text-gray-500">Finalizadas</p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Appointments Schedule */}
        <Grid cols={3} gap={6}>
          {/* Available Time Slots */}
          <Card>
            <Card.Header>
              <Card.Title>Horarios Disponibles</Card.Title>
            </Card.Header>
            <Card.Content className="p-4">
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {timeSlots.map(slot => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <div
                      key={slot}
                      className={`p-2 text-center text-sm rounded border ${
                        isBooked 
                          ? 'bg-red-100 text-red-700 border-red-200' 
                          : 'bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200'
                      }`}
                      onClick={() => {
                        if (!isBooked) {
                          setFormData(prev => ({ ...prev, hora: slot }));
                          setIsCreateModalOpen(true);
                        }
                      }}
                    >
                      {slot}
                      {isBooked && (
                        <div className="text-xs mt-1">Ocupado</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {/* Today's Appointments */}
          <Card className="col-span-2">
            <Card.Header>
              <Card.Title>
                Citas del {new Date(selectedDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Card.Title>
            </Card.Header>
            <Card.Content className="p-4">
              <Flex direction="column" gap={3} className="max-h-96 overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay citas programadas para este día</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Programar primera cita
                    </Button>
                  </div>
                ) : (
                  todayAppointments.map(appointment => (
                    <Card key={appointment.id} variant="outlined" className="hover:shadow-md transition-shadow">
                      <Card.Content className="p-4">
                        <Flex justify="space-between" align="start">
                          <Flex direction="column" gap={2} className="flex-1">
                            <Flex align="center" gap={3}>
                              <div className="text-lg font-bold text-blue-600">
                                {new Date(appointment.fecha_hora).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                                {getStatusLabel(appointment.estado)}
                              </span>
                            </Flex>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {appointment.paciente.nombre_completo}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.tratamiento.nombre} • {appointment.duracion_estimada} min
                              </p>
                              <p className="text-sm text-gray-600">
                                Dr. {appointment.dentista.nombre_completo}
                              </p>
                            </div>
                            
                            <div className="text-sm text-gray-700">
                              <p><strong>Motivo:</strong> {appointment.motivo_consulta}</p>
                              {appointment.costo_estimado > 0 && (
                                <p><strong>Costo estimado:</strong> ${appointment.costo_estimado.toLocaleString()}</p>
                              )}
                            </div>
                          </Flex>

                          <Flex direction="column" gap={2}>
                            <Select
                              value={appointment.estado}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                              size="sm"
                            >
                              <option value="programada">Programada</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="en_curso">En Curso</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                              <option value="no_asistio">No Asistió</option>
                            </Select>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              Ver Detalles
                            </Button>
                          </Flex>
                        </Flex>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Create Appointment Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Programar Nueva Cita"
          size="large"
        >
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap={6}>
              <Grid cols={2} gap={4}>
                <Select
                  label="Paciente"
                  value={formData.paciente_id}
                  onChange={(e) => handleInputChange('paciente_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nombre_completo}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Dentista"
                  value={formData.dentista_id}
                  onChange={(e) => handleInputChange('dentista_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar dentista</option>
                  {dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.nombre_completo} - {dentist.especialidad}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Tratamiento"
                  value={formData.tratamiento_id}
                  onChange={(e) => handleInputChange('tratamiento_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar tratamiento</option>
                  {treatments.map(treatment => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.nombre} - ${treatment.precio_base} ({treatment.duracion_estimada} min)
                    </option>
                  ))}
                </Select>

                <Select
                  label="Tipo de Cita"
                  value={formData.tipo_cita}
                  onChange={(e) => handleInputChange('tipo_cita', e.target.value)}
                  required
                >
                  <option value="consulta">Consulta General</option>
                  <option value="tratamiento">Tratamiento</option>
                  <option value="seguimiento">Seguimiento</option>
                  <option value="emergencia">Emergencia</option>
                  <option value="limpieza">Limpieza Dental</option>
                  <option value="revision">Revisión</option>
                </Select>

                <Input
                  type="date"
                  label="Fecha"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  required
                />

                <Input
                  type="time"
                  label="Hora"
                  value={formData.hora}
                  onChange={(e) => handleInputChange('hora', e.target.value)}
                  required
                />

                <Input
                  type="number"
                  label="Duración (minutos)"
                  value={formData.duracion_estimada}
                  onChange={(e) => handleInputChange('duracion_estimada', parseInt(e.target.value))}
                  min="15"
                  max="300"
                  step="15"
                  required
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiere_confirmacion"
                    checked={formData.requiere_confirmacion}
                    onChange={(e) => handleInputChange('requiere_confirmacion', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="requiere_confirmacion" className="text-sm text-gray-700">
                    Requiere confirmación del paciente
                  </label>
                </div>
              </Grid>

              <Textarea
                label="Motivo de la Consulta"
                value={formData.motivo_consulta}
                onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
                placeholder="Describir el motivo principal de la consulta..."
                rows={3}
                required
              />

              <Textarea
                label="Observaciones Previas"
                value={formData.observaciones_previas}
                onChange={(e) => handleInputChange('observaciones_previas', e.target.value)}
                placeholder="Notas adicionales o preparación especial..."
                rows={2}
              />

              <Flex justify="end" gap={3} className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Programar Cita
                </Button>
              </Flex>
            </Flex>
          </form>
        </Modal>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <Modal
            isOpen={!!selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            title={`Cita ${selectedAppointment.numero_cita}`}
            size="large"
          >
            <Flex direction="column" gap={6}>
              <Grid cols={2} gap={6}>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información del Paciente</h4>
                  <div className="space-y-2">
                    <p><strong>Nombre:</strong> {selectedAppointment.paciente.nombre_completo}</p>
                    <p><strong>Tratamiento:</strong> {selectedAppointment.tratamiento.nombre}</p>
                    <p><strong>Motivo:</strong> {selectedAppointment.motivo_consulta}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información de la Cita</h4>
                  <div className="space-y-2">
                    <p><strong>Fecha y Hora:</strong> {new Date(selectedAppointment.fecha_hora).toLocaleString('es-ES')}</p>
                    <p><strong>Duración:</strong> {selectedAppointment.duracion_estimada} minutos</p>
                    <p><strong>Dentista:</strong> {selectedAppointment.dentista.nombre_completo}</p>
                    <p><strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getStatusColor(selectedAppointment.estado)}`}>
                        {getStatusLabel(selectedAppointment.estado)}
                      </span>
                    </p>
                    {selectedAppointment.costo_estimado > 0 && (
                      <p><strong>Costo Estimado:</strong> ${selectedAppointment.costo_estimado.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </Grid>

              {selectedAppointment.observaciones_previas && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Observaciones Previas</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedAppointment.observaciones_previas}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Notas del Dentista</h4>
                <Textarea
                  value={selectedAppointment.notas_dentista}
                  onChange={(e) => {
                    setSelectedAppointment(prev => ({
                      ...prev,
                      notas_dentista: e.target.value
                    }));
                  }}
                  placeholder="Agregar notas del tratamiento..."
                  rows={4}
                />
              </div>

              <Flex justify="end" gap={3} className="pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Cerrar
                </Button>
                <Button variant="secondary">
                  Reagendar
                </Button>
                <Button variant="primary">
                  Guardar Notas
                </Button>
              </Flex>
            </Flex>
          </Modal>
        )}
      </Flex>
    </Container>
  );
};

export default CitasAvanzadas;
