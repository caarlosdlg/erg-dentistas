import React from 'react';
import { Container, Card, Grid, Button, Flex } from '../components';

/**
 * Dashboard page component
 * Main landing page with overview of the dental ERP system
 */
const Dashboard = () => {
  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general del sistema dental ERP</p>
        </div>

        {/* Quick Stats Grid */}
        <Grid cols={4} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Pacientes</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#0066cc',
                  }}
                >
                  145
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Total registrados
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Citas Hoy</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#009951',
                  }}
                >
                  12
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Programadas
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Tratamientos</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                  }}
                >
                  8
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  En progreso
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Ingresos</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#8b5cf6',
                  }}
                >
                  $15.2K
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Este mes
                </p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <Card.Title>Acciones Rápidas</Card.Title>
          </Card.Header>
          <Card.Content>
            <Grid cols={3} gap={4} responsive>
              <Button variant="primary" size="lg" fullWidth>
                Nueva Cita
              </Button>

              <Button variant="secondary" size="lg" fullWidth>
                Nuevo Paciente
              </Button>

              <Button variant="outline" size="lg" fullWidth>
                Ver Agenda
              </Button>
            </Grid>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <Card.Title>Actividad Reciente</Card.Title>
          </Card.Header>
          <Card.Content>
            <Flex direction="column" gap={3}>
              <Flex
                justify="space-between"
                align="center"
                style={{ padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}
              >
                <div>
                  <p style={{ fontWeight: '500' }}>
                    Cita completada - María González
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Limpieza dental - 14:30
                  </p>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Hace 2 horas
                </span>
              </Flex>

              <Flex
                justify="space-between"
                align="center"
                style={{ padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}
              >
                <div>
                  <p style={{ fontWeight: '500' }}>
                    Nuevo paciente registrado - Carlos López
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Primera consulta programada
                  </p>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Hace 4 horas
                </span>
              </Flex>

              <Flex
                justify="space-between"
                align="center"
                style={{ padding: '1rem 0' }}
              >
                <div>
                  <p style={{ fontWeight: '500' }}>
                    Pago procesado - Ana Martín
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Tratamiento de ortodoncia - $450
                  </p>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Hace 1 día
                </span>
              </Flex>
            </Flex>
          </Card.Content>
        </Card>
      </Flex>
    </Container>
  );
};

export default Dashboard;
