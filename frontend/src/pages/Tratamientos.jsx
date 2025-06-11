import React, { useState } from 'react';
import { Container, Card, Grid, Button, Input, Flex } from '../components/ui';

/**
 * Tratamientos page component
 * Manage treatments and procedures in the dental ERP system
 */
const Tratamientos = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockTreatments = [
    {
      id: 1,
      name: 'Limpieza Dental',
      category: 'Prevención',
      duration: '30 min',
      price: '$50',
      description: 'Limpieza profesional y profilaxis dental',
    },
    {
      id: 2,
      name: 'Empaste',
      category: 'Restauración',
      duration: '45-60 min',
      price: '$80-120',
      description: 'Restauración de caries con composite o amalgama',
    },
    {
      id: 3,
      name: 'Extracción Simple',
      category: 'Cirugía',
      duration: '30 min',
      price: '$100',
      description: 'Extracción de pieza dental simple',
    },
    {
      id: 4,
      name: 'Corona Dental',
      category: 'Prótesis',
      duration: '2 sesiones',
      price: '$300',
      description: 'Corona de porcelana o metal-porcelana',
    },
    {
      id: 5,
      name: 'Blanqueamiento',
      category: 'Estética',
      duration: '60 min',
      price: '$200',
      description: 'Blanqueamiento dental profesional en consultorio',
    },
    {
      id: 6,
      name: 'Ortodoncia',
      category: 'Ortodoncia',
      duration: '18-24 meses',
      price: '$2000-3000',
      description: 'Tratamiento ortodóntico con brackets o alineadores',
    },
  ];

  const categories = [
    'Todos',
    'Prevención',
    'Restauración',
    'Cirugía',
    'Prótesis',
    'Estética',
    'Ortodoncia',
  ];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredTreatments = mockTreatments.filter(treatment => {
    const matchesSearch =
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' || treatment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = category => {
    const colors = {
      Prevención: '#009951',
      Restauración: '#0066cc',
      Cirugía: '#dc2626',
      Prótesis: '#7c3aed',
      Estética: '#db2777',
      Ortodoncia: '#ea580c',
    };
    return colors[category] || '#64748b';
  };

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <div>
            <h1>Tratamientos</h1>
            <p>Catálogo de tratamientos y procedimientos dentales</p>
          </div>
          <Button variant="primary" size="lg">
            Nuevo Tratamiento
          </Button>
        </Flex>

        {/* Quick Stats */}
        <Grid cols={4} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Total</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#0066cc',
                  }}
                >
                  {mockTreatments.length}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Tratamientos disponibles
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Más Solicitado</h3>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#009951',
                  }}
                >
                  Limpieza
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  45% del total
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Promedio</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                  }}
                >
                  $150
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Precio promedio
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content>
              <Flex direction="column" gap={2}>
                <h3>Duración</h3>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#8b5cf6',
                  }}
                >
                  45m
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Duración promedio
                </p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Search and Filters */}
        <Card>
          <Card.Content>
            <Flex direction="column" gap={4}>
              <Flex gap={4} align="center">
                <Input
                  label="Buscar tratamientos"
                  placeholder="Nombre del tratamiento o descripción..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ flex: 1 }}
                />
              </Flex>

              {/* Category Filters */}
              <Flex gap={2} style={{ flexWrap: 'wrap' }}>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? 'primary' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </Flex>
            </Flex>
          </Card.Content>
        </Card>

        {/* Treatments Grid */}
        <Grid cols={2} gap={4} responsive>
          {filteredTreatments.map(treatment => (
            <Card key={treatment.id} variant="outlined">
              <Card.Header>
                <Flex justify="space-between" align="center">
                  <Card.Title>{treatment.name}</Card.Title>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: `${getCategoryColor(treatment.category)}20`,
                      color: getCategoryColor(treatment.category),
                    }}
                  >
                    {treatment.category}
                  </span>
                </Flex>
              </Card.Header>

              <Card.Content>
                <Flex direction="column" gap={3}>
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                    {treatment.description}
                  </p>

                  <Flex justify="space-between" align="center">
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          color: '#64748b',
                        }}
                      >
                        Duración: <strong>{treatment.duration}</strong>
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#0066cc',
                        }}
                      >
                        {treatment.price}
                      </p>
                    </div>

                    <Flex gap={2}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="primary" size="sm">
                        Programar
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Card.Content>
            </Card>
          ))}
        </Grid>

        {filteredTreatments.length === 0 && (
          <Card>
            <Card.Content>
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#64748b',
                }}
              >
                No se encontraron tratamientos que coincidan con los filtros
                seleccionados.
              </div>
            </Card.Content>
          </Card>
        )}
      </Flex>
    </Container>
  );
};

export default Tratamientos;
