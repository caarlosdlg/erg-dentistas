import React, { useState } from 'react';
import {
  ButtonTW,
  CardTW,
  Modal,
  ConfirmDialog,
  Loading,
  Spinner,
  Skeleton,
  PageLoading,
  Table,
  Navbar,
  FormInput,
  Textarea,
  Select,
  Badge,
  Alert,
} from '../components/ui';

/**
 * Design System Demo Page
 * Página de demostración del sistema de diseño DentalERP
 */
const DesignSystemDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample data for table
  const samplePatients = [
    { id: 1, name: 'Juan Pérez', age: 32, lastVisit: '2025-06-01', status: 'active' },
    { id: 2, name: 'María García', age: 28, lastVisit: '2025-05-28', status: 'pending' },
    { id: 3, name: 'Carlos López', age: 45, lastVisit: '2025-05-25', status: 'inactive' },
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <Navbar
        brand={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DE</span>
            </div>
            <span className="font-bold text-lg text-primary-600">DentalERP</span>
          </div>
        }
      >
        <Navbar.Link href="#" active>Inicio</Navbar.Link>
        <Navbar.Link href="#">Pacientes</Navbar.Link>
        <Navbar.Link href="#">Citas</Navbar.Link>
        <Navbar.Dropdown trigger="Más">
          <Navbar.DropdownItem href="#">Tratamientos</Navbar.DropdownItem>
          <Navbar.DropdownItem href="#">Facturación</Navbar.DropdownItem>
          <Navbar.DropdownItem href="#">Reportes</Navbar.DropdownItem>
        </Navbar.Dropdown>
      </Navbar>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Sistema de Diseño DentalERP
          </h1>
          <p className="text-neutral-600">
            Demostración de componentes reutilizables con Tailwind CSS
          </p>
        </div>

        <div className="space-y-12">
          {/* Buttons Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Botones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CardTW>
                <h3 className="text-lg font-medium mb-4">Variantes</h3>
                <div className="space-y-3">
                  <ButtonTW variant="primary">Primario</ButtonTW>
                  <ButtonTW variant="secondary">Secundario</ButtonTW>
                  <ButtonTW variant="outline">Outline</ButtonTW>
                  <ButtonTW variant="ghost">Ghost</ButtonTW>
                  <ButtonTW variant="danger">Peligro</ButtonTW>
                </div>
              </CardTW>

              <CardTW>
                <h3 className="text-lg font-medium mb-4">Tamaños</h3>
                <div className="space-y-3">
                  <ButtonTW size="xs">Extra Pequeño</ButtonTW>
                  <ButtonTW size="sm">Pequeño</ButtonTW>
                  <ButtonTW size="md">Mediano</ButtonTW>
                  <ButtonTW size="lg">Grande</ButtonTW>
                </div>
              </CardTW>

              <CardTW>
                <h3 className="text-lg font-medium mb-4">Estados</h3>
                <div className="space-y-3">
                  <ButtonTW loading onClick={handleLoadingDemo}>
                    Cargando
                  </ButtonTW>
                  <ButtonTW disabled>Deshabilitado</ButtonTW>
                  <ButtonTW fullWidth>Ancho Completo</ButtonTW>
                </div>
              </CardTW>
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Tarjetas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardTW variant="default">
                <h3 className="text-lg font-medium mb-2">Tarjeta Por Defecto</h3>
                <p className="text-neutral-600">
                  Esta es una tarjeta básica con estilo por defecto.
                </p>
              </CardTW>

              <CardTW variant="elevated">
                <h3 className="text-lg font-medium mb-2">Tarjeta Elevada</h3>
                <p className="text-neutral-600">
                  Tarjeta con mayor elevación y sombra.
                </p>
              </CardTW>

              <CardTW variant="outlined">
                <h3 className="text-lg font-medium mb-2">Tarjeta Outlined</h3>
                <p className="text-neutral-600">
                  Tarjeta con borde prominente.
                </p>
              </CardTW>

              <CardTW 
                interactive
                header={<h3 className="text-lg font-medium">Tarjeta Interactiva</h3>}
                footer={
                  <div className="flex gap-2">
                    <ButtonTW size="sm" variant="outline">Cancelar</ButtonTW>
                    <ButtonTW size="sm">Aceptar</ButtonTW>
                  </div>
                }
              >
                <p className="text-neutral-600">
                  Tarjeta con header, footer y efectos hover.
                </p>
              </CardTW>
            </div>
          </section>

          {/* Form Elements Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Elementos de Formulario</h2>
            <CardTW>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormInput
                    label="Nombre del Paciente"
                    placeholder="Ingrese el nombre completo"
                    required
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    placeholder="paciente@ejemplo.com"
                    helperText="Será usado para notificaciones"
                  />
                  <FormInput
                    label="Teléfono"
                    placeholder="Número de contacto"
                    error="Este campo es requerido"
                  />
                </div>
                
                <div className="space-y-4">
                  <Select
                    label="Tipo de Tratamiento"
                    placeholder="Seleccione un tratamiento"
                    required
                  >
                    <option value="limpieza">Limpieza Dental</option>
                    <option value="endodoncia">Endodoncia</option>
                    <option value="ortodoncia">Ortodoncia</option>
                    <option value="cirugia">Cirugía</option>
                  </Select>
                  
                  <Textarea
                    label="Observaciones"
                    placeholder="Notas adicionales sobre el paciente..."
                    rows={4}
                  />
                </div>
              </div>
            </CardTW>
          </section>

          {/* Badges and Alerts Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Badges y Alertas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardTW>
                <h3 className="text-lg font-medium mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Activo</Badge>
                  <Badge variant="secondary">Pendiente</Badge>
                  <Badge variant="success">Completado</Badge>
                  <Badge variant="warning">En Espera</Badge>
                  <Badge variant="error">Cancelado</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </CardTW>

              <CardTW>
                <h3 className="text-lg font-medium mb-4">Alertas</h3>
                <div className="space-y-3">
                  <Alert variant="success" title="Éxito">
                    Paciente registrado correctamente.
                  </Alert>
                  <Alert variant="warning" title="Advertencia">
                    La cita necesita confirmación.
                  </Alert>
                  <Alert variant="error" title="Error">
                    No se pudo procesar la solicitud.
                  </Alert>
                </div>
              </CardTW>
            </div>
          </section>

          {/* Table Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Tablas</h2>
            <CardTW>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Paciente</Table.HeaderCell>
                    <Table.HeaderCell>Edad</Table.HeaderCell>
                    <Table.HeaderCell>Última Visita</Table.HeaderCell>
                    <Table.HeaderCell>Estado</Table.HeaderCell>
                    <Table.HeaderCell align="right">Acciones</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {samplePatients.map((patient) => (
                    <Table.Row key={patient.id} clickable>
                      <Table.Cell>{patient.name}</Table.Cell>
                      <Table.Cell>{patient.age} años</Table.Cell>
                      <Table.Cell>{patient.lastVisit}</Table.Cell>
                      <Table.Cell>
                        <Badge 
                          variant={
                            patient.status === 'active' ? 'success' : 
                            patient.status === 'pending' ? 'warning' : 'error'
                          }
                        >
                          {patient.status === 'active' ? 'Activo' : 
                           patient.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <div className="flex gap-2 justify-end">
                          <ButtonTW size="sm" variant="outline">Editar</ButtonTW>
                          <ButtonTW size="sm" variant="danger">Eliminar</ButtonTW>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </CardTW>
          </section>

          {/* Loading States Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Estados de Carga</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardTW>
                <h3 className="text-lg font-medium mb-4">Spinners</h3>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" className="text-primary-500" />
                  <Spinner size="md" className="text-secondary-500" />
                  <Spinner size="lg" className="text-neutral-500" />
                </div>
              </CardTW>

              <CardTW>
                <h3 className="text-lg font-medium mb-4">Skeleton</h3>
                <div className="space-y-3">
                  <Skeleton height="h-6" width="w-3/4" />
                  <Skeleton height="h-4" />
                  <Skeleton height="h-4" width="w-1/2" />
                </div>
              </CardTW>

              <CardTW>
                <h3 className="text-lg font-medium mb-4">Loading con Texto</h3>
                <Loading 
                  variant="spinner" 
                  text="Cargando datos..." 
                  centered 
                />
              </CardTW>
            </div>
          </section>

          {/* Modal Section */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Modales</h2>
            <CardTW>
              <div className="flex gap-4">
                <ButtonTW onClick={() => setModalOpen(true)}>
                  Abrir Modal
                </ButtonTW>
                <ButtonTW 
                  variant="danger" 
                  onClick={() => setConfirmOpen(true)}
                >
                  Confirmar Acción
                </ButtonTW>
              </div>
            </CardTW>
          </section>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Paciente"
        size="lg"
        footer={
          <>
            <ButtonTW variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </ButtonTW>
            <ButtonTW onClick={() => setModalOpen(false)}>
              Guardar
            </ButtonTW>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Nombre Completo" placeholder="Ingrese el nombre" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Teléfono" placeholder="Número de contacto" />
            <FormInput label="Email" type="email" placeholder="correo@ejemplo.com" />
          </div>
          <Textarea 
            label="Observaciones" 
            placeholder="Información adicional del paciente..."
            rows={3}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => console.log('Acción confirmada')}
        title="¿Eliminar Paciente?"
        message="Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este paciente?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {loading && <PageLoading message="Cargando sistema..." />}
    </div>
  );
};

export default DesignSystemDemo;
