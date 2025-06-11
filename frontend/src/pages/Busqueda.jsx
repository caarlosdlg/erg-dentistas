import React, { useState } from 'react';
import { Container, Card, Input, Button, Flex } from '../components/ui';

/**
 * Busqueda page component
 * Global search functionality for the dental ERP system
 */
const Busqueda = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  // Mock search results
  const mockResults = {
    pacientes: [
      {
        id: 1,
        name: 'María González',
        type: 'paciente',
        email: 'maria@email.com',
        phone: '555-0123',
      },
      {
        id: 2,
        name: 'Ana Martín',
        type: 'paciente',
        email: 'ana@email.com',
        phone: '555-0125',
      },
    ],
    tratamientos: [
      {
        id: 1,
        name: 'Limpieza Dental',
        type: 'tratamiento',
        category: 'Prevención',
        price: '$50',
      },
      {
        id: 2,
        name: 'Blanqueamiento',
        type: 'tratamiento',
        category: 'Estética',
        price: '$200',
      },
    ],
    citas: [
      {
        id: 1,
        patient: 'María González',
        date: '2024-01-22',
        time: '09:00',
        treatment: 'Limpieza dental',
        type: 'cita',
      },
    ],
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    // Simulate API call delay
    setTimeout(() => {
      // Filter mock results based on search term
      const filteredResults = {
        pacientes: mockResults.pacientes.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        tratamientos: mockResults.tratamientos.filter(t =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        citas: mockResults.citas.filter(
          c =>
            c.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.treatment.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      };

      setResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (
      results.pacientes.length +
      results.tratamientos.length +
      results.citas.length
    );
  };

  const renderResultItem = item => {
    const getItemIcon = type => {
      switch (type) {
        case 'paciente':
          return '👤';
        case 'tratamiento':
          return '🦷';
        case 'cita':
          return '📅';
        default:
          return '📄';
      }
    };

    const getItemContent = item => {
      switch (item.type) {
        case 'paciente':
          return (
            <Flex direction="column" gap={1}>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                {item.email} • {item.phone}
              </p>
            </Flex>
          );
        case 'tratamiento':
          return (
            <Flex direction="column" gap={1}>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                {item.category} • {item.price}
              </p>
            </Flex>
          );
        case 'cita':
          return (
            <Flex direction="column" gap={1}>
              <h3 style={{ margin: 0 }}>{item.patient}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                {item.treatment} • {item.date} {item.time}
              </p>
            </Flex>
          );
        default:
          return <span>{item.name}</span>;
      }
    };

    return (
      <Flex
        key={`${item.type}-${item.id}`}
        align="center"
        gap={3}
        style={{
          padding: '1rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#e2e8f0';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>{getItemIcon(item.type)}</span>

        <Flex style={{ flex: 1 }}>{getItemContent(item)}</Flex>

        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
      </Flex>
    );
  };

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <div>
          <h1>Búsqueda Global</h1>
          <p>Busca pacientes, tratamientos, citas y más en todo el sistema</p>
        </div>

        {/* Search Input */}
        <Card>
          <Card.Content>
            <Flex gap={4} align="end">
              <Input
                label="Término de búsqueda"
                placeholder="Buscar pacientes, tratamientos, citas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </Flex>
          </Card.Content>
        </Card>

        {/* Search Results */}
        {isSearching && (
          <Card>
            <Card.Content>
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#64748b',
                }}
              >
                Buscando resultados...
              </div>
            </Card.Content>
          </Card>
        )}

        {results && !isSearching && (
          <>
            {/* Results Summary */}
            <Card>
              <Card.Content>
                <Flex justify="space-between" align="center">
                  <h2 style={{ margin: 0 }}>Resultados para "{searchTerm}"</h2>
                  <span style={{ color: '#64748b' }}>
                    {getTotalResults()} resultado
                    {getTotalResults() !== 1 ? 's' : ''} encontrado
                    {getTotalResults() !== 1 ? 's' : ''}
                  </span>
                </Flex>
              </Card.Content>
            </Card>

            {/* Pacientes Results */}
            {results.pacientes.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>
                    Pacientes ({results.pacientes.length})
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <Flex direction="column" gap={3}>
                    {results.pacientes.map(renderResultItem)}
                  </Flex>
                </Card.Content>
              </Card>
            )}

            {/* Tratamientos Results */}
            {results.tratamientos.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>
                    Tratamientos ({results.tratamientos.length})
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <Flex direction="column" gap={3}>
                    {results.tratamientos.map(renderResultItem)}
                  </Flex>
                </Card.Content>
              </Card>
            )}

            {/* Citas Results */}
            {results.citas.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Citas ({results.citas.length})</Card.Title>
                </Card.Header>
                <Card.Content>
                  <Flex direction="column" gap={3}>
                    {results.citas.map(renderResultItem)}
                  </Flex>
                </Card.Content>
              </Card>
            )}

            {/* No Results */}
            {getTotalResults() === 0 && (
              <Card>
                <Card.Content>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#64748b',
                    }}
                  >
                    <h3>No se encontraron resultados</h3>
                    <p>
                      No se encontraron elementos que coincidan con "
                      {searchTerm}".
                      <br />
                      Prueba con términos de búsqueda diferentes.
                    </p>
                  </div>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {/* Search Tips */}
        {!results && !isSearching && (
          <Card>
            <Card.Header>
              <Card.Title>Consejos de Búsqueda</Card.Title>
            </Card.Header>
            <Card.Content>
              <Flex direction="column" gap={3}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>
                    ¿Qué puedes buscar?
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: '#64748b',
                    }}
                  >
                    <li>Nombres de pacientes y información de contacto</li>
                    <li>Tratamientos y procedimientos dentales</li>
                    <li>Citas programadas y historial</li>
                    <li>Categorías de tratamientos</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>
                    Ejemplos de búsqueda:
                  </h4>
                  <Flex gap={2} style={{ flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchTerm('María')}
                    >
                      María
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchTerm('limpieza')}
                    >
                      limpieza
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchTerm('ortodoncia')}
                    >
                      ortodoncia
                    </span>
                  </Flex>
                </div>
              </Flex>
            </Card.Content>
          </Card>
        )}
      </Flex>
    </Container>
  );
};

export default Busqueda;
