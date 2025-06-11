import React, { useState } from 'react';
import { Container, Card, Grid, Button, Flex } from '../components';

/**
 * Citas page component
 * Manage appointments in the dental ERP system
 */
const Citas = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const mockAppointments = [
    {
      id: 1,
      time: '09:00',
      patient: 'María González',
      treatment: 'Limpieza dental',
      duration: '30 min',
      status: 'confirmada',
    },
    {
      id: 2,
      time: '10:00',
      patient: 'Carlos López',
      treatment: 'Consulta inicial',
      duration: '45 min',
      status: 'pendiente',
    },
    {
      id: 3,
      time: '11:30',
      patient: 'Ana Martín',
      treatment: 'Empaste',
      duration: '60 min',
      status: 'en-curso',
    },
    {
      id: 4,
      time: '14:00',
      patient: 'Pedro Sánchez',
      treatment: 'Extracción',
      duration: '45 min',
      status: 'confirmada',
    },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'confirmada':
        return '#009951';
      case 'pendiente':
        return '#f59e0b';
      case 'en-curso':
        return '#0066cc';
      case 'completada':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'en-curso':
        return 'En Curso';
      case 'completada':
        return 'Completada';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <div>
            <h1>Agenda de Citas</h1>
            <p>Gestión de citas y horarios del consultorio</p>
          </div>
          <Button variant="primary" size="lg">
            Nueva Cita
          </Button>
        </Flex>

        {/* Date Selector and Quick Stats */}
        <Grid cols={4} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Hoy</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#0066cc',
                  }}
                >
                  {mockAppointments.length}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Citas programadas
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Pendientes</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                  }}
                >
                  {
                    mockAppointments.filter(apt => apt.status === 'pendiente')
                      .length
                  }
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Sin confirmar
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>En Curso</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#0066cc',
                  }}
                >
                  {
                    mockAppointments.filter(apt => apt.status === 'en-curso')
                      .length
                  }
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Atendiendo ahora
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Disponibles</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#009951',
                  }}
                >
                  4
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Horarios libres
                </p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Date Selector */}
        <Card>
          <Card.Content>
            <Flex gap={4} align="center">
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Fecha:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <Button variant="outline">Vista Semanal</Button>
              <Button variant="outline">Vista Mensual</Button>
            </Flex>
          </Card.Content>
        </Card>

        {/* Appointments List */}
        <Card>
          <Card.Header>
            <Card.Title>Citas del Día</Card.Title>
          </Card.Header>
          <Card.Content>
            <Flex direction="column" gap={3}>
              {mockAppointments.map(appointment => (
                <Flex
                  key={appointment.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <Flex align="center" gap={4}>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#0066cc',
                        minWidth: '60px',
                      }}
                    >
                      {appointment.time}
                    </div>

                    <Flex direction="column" gap={1}>
                      <h3 style={{ margin: 0 }}>{appointment.patient}</h3>
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '0.875rem',
                        }}
                      >
                        {appointment.treatment} • {appointment.duration}
                      </p>
                    </Flex>
                  </Flex>

                  <Flex align="center" gap={3}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(appointment.status)}20`,
                        color: getStatusColor(appointment.status),
                      }}
                    >
                      {getStatusText(appointment.status)}
                    </span>

                    <Flex gap={2}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="primary" size="sm">
                        Atender
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card.Content>
        </Card>
      </Flex>
    </Container>
  );
};

export default Citas;
