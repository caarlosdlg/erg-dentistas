import React, { useState } from 'react'
import { 
  ButtonTW as Button, 
  CardTW as Card, 
  Badge,
  Modal,
  Table,
  Navbar,
  Loading,
  FormInput,
  Select,
  Textarea
} from '../components/ui'

/**
 * Responsive Design Demo Page
 * Demonstrates responsive behavior across all device sizes
 */
const ResponsiveDemo = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Sample data for demonstrations
  const sampleData = [
    { id: 1, patient: 'María García', appointment: '10:00 AM', status: 'confirmed', type: 'Limpieza' },
    { id: 2, patient: 'Carlos López', appointment: '11:30 AM', status: 'pending', type: 'Revisión' },
    { id: 3, patient: 'Ana Martínez', appointment: '2:00 PM', status: 'completed', type: 'Tratamiento' },
    { id: 4, patient: 'Luis Rodríguez', appointment: '3:30 PM', status: 'cancelled', type: 'Consulta' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Responsive Navigation */}
      <Navbar variant="primary" position="sticky">
        <div className="flex items-center justify-between w-full">
          {/* Logo and brand - responsive sizing */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm sm:text-base">D</span>
            </div>
            <span className="text-white font-semibold text-lg sm:text-xl lg:text-2xl">
              DentalERP
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-primary-100 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-white hover:text-primary-100 transition-colors">
              Pacientes
            </a>
            <a href="#" className="text-white hover:text-primary-100 transition-colors">
              Citas
            </a>
            <a href="#" className="text-white hover:text-primary-100 transition-colors">
              Tratamientos
            </a>
            <Button variant="secondary" size="sm">
              Perfil
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-primary-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile sidebar */}
        <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'} mt-4 pb-4 border-t border-primary-400`}>
          <div className="space-y-2 mt-4">
            <a href="#" className="block text-white hover:text-primary-100 py-2 transition-colors">
              Dashboard
            </a>
            <a href="#" className="block text-white hover:text-primary-100 py-2 transition-colors">
              Pacientes
            </a>
            <a href="#" className="block text-white hover:text-primary-100 py-2 transition-colors">
              Citas
            </a>
            <a href="#" className="block text-white hover:text-primary-100 py-2 transition-colors">
              Tratamientos
            </a>
            <div className="pt-2 border-t border-primary-400 mt-4">
              <Button variant="secondary" size="sm" className="w-full">
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </Navbar>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Page Header - Responsive */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900">
                Diseño Responsive
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-neutral-600 mt-1">
                Demostración de adaptabilidad a diferentes tamaños de pantalla
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Ver Código
              </Button>
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                Nuevo Elemento
              </Button>
            </div>
          </div>
        </div>

        {/* Breakpoint Indicator */}
        <Card className="mb-8">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Indicador de Breakpoint Actual</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Badge 
                variant={typeof window !== 'undefined' && window.innerWidth < 640 ? 'primary' : 'secondary'}
                className="block sm:hidden"
              >
                Mobile (&lt;640px)
              </Badge>
              <Badge 
                variant={typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 768 ? 'primary' : 'secondary'}
                className="hidden sm:block md:hidden"
              >
                SM (640px+)
              </Badge>
              <Badge 
                variant={typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024 ? 'primary' : 'secondary'}
                className="hidden md:block lg:hidden"
              >
                MD (768px+)
              </Badge>
              <Badge 
                variant={typeof window !== 'undefined' && window.innerWidth >= 1024 && window.innerWidth < 1280 ? 'primary' : 'secondary'}
                className="hidden lg:block xl:hidden"
              >
                LG (1024px+)
              </Badge>
              <Badge 
                variant={typeof window !== 'undefined' && window.innerWidth >= 1280 ? 'primary' : 'secondary'}
                className="hidden xl:block"
              >
                XL (1280px+)
              </Badge>
            </div>
          </div>
        </Card>

        {/* Responsive Grid - Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card variant="elevated">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    Total Pacientes
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                    2,849
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    +12% este mes
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    Citas Hoy
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-secondary-600">
                    18
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-1">
                    6 completadas
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    Ingresos Mes
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    $45,231
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
                    +8% vs anterior
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">
                    Satisfacción
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                    4.8/5
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-600 mt-1">
                    +0.2 este mes
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Responsive Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          
          {/* Sidebar - Responsive Stack */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Cita
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Nuevo Paciente
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Nuevo Reporte
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium">Cita en 30 min</p>
                      <p className="text-neutral-600">María García - Limpieza</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium">Confirmación pendiente</p>
                      <p className="text-neutral-600">2 citas requieren confirmación</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium">Pago recibido</p>
                      <p className="text-neutral-600">Carlos López - $150</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-xl font-semibold">Agenda del Día</h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Filtrar
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
                      Agregar Cita
                    </Button>
                  </div>
                </div>

                {/* Responsive Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Paciente</Table.HeaderCell>
                        <Table.HeaderCell>Hora</Table.HeaderCell>
                        <Table.HeaderCell>Tipo</Table.HeaderCell>
                        <Table.HeaderCell>Estado</Table.HeaderCell>
                        <Table.HeaderCell align="right">Acciones</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sampleData.map((item) => (
                        <Table.Row key={item.id}>
                          <Table.Cell className="font-medium">{item.patient}</Table.Cell>
                          <Table.Cell>{item.appointment}</Table.Cell>
                          <Table.Cell>{item.type}</Table.Cell>
                          <Table.Cell>
                            <Badge 
                              variant={
                                item.status === 'confirmed' ? 'success' :
                                item.status === 'pending' ? 'warning' :
                                item.status === 'completed' ? 'info' : 'danger'
                              }
                            >
                              {item.status === 'confirmed' ? 'Confirmada' :
                               item.status === 'pending' ? 'Pendiente' :
                               item.status === 'completed' ? 'Completada' : 'Cancelada'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Ver
                              </Button>
                              <Button variant="primary" size="sm">
                                Editar
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>

                {/* Mobile Card Layout */}
                <div className="block sm:hidden space-y-4">
                  {sampleData.map((item) => (
                    <Card key={item.id} variant="outlined">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{item.patient}</h4>
                            <p className="text-neutral-600 text-sm">{item.type}</p>
                          </div>
                          <Badge 
                            variant={
                              item.status === 'confirmed' ? 'success' :
                              item.status === 'pending' ? 'warning' :
                              item.status === 'completed' ? 'info' : 'danger'
                            }
                          >
                            {item.status === 'confirmed' ? 'Confirmada' :
                             item.status === 'pending' ? 'Pendiente' :
                             item.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-primary-600">{item.appointment}</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button variant="primary" size="sm">Editar</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Responsive Form */}
        <Card className="mb-8">
          <div className="p-4 sm:p-6">
            <h3 className="text-xl font-semibold mb-6">Formulario Responsive</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <FormInput
                  label="Nombre Completo"
                  placeholder="Ingrese el nombre"
                  required
                />
                <FormInput
                  type="email"
                  label="Correo Electrónico"
                  placeholder="ejemplo@correo.com"
                  required
                />
                <FormInput
                  type="tel"
                  label="Teléfono"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Select
                  label="Tipo de Tratamiento"
                  options={[
                    { value: '', label: 'Seleccionar...' },
                    { value: 'limpieza', label: 'Limpieza Dental' },
                    { value: 'revision', label: 'Revisión General' },
                    { value: 'tratamiento', label: 'Tratamiento Especializado' },
                  ]}
                />
                <FormInput
                  type="date"
                  label="Fecha Preferida"
                />
              </div>

              <Textarea
                label="Notas Adicionales"
                placeholder="Información adicional sobre el paciente o tratamiento..."
                rows={4}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
                  Cancelar
                </Button>
                <Button variant="primary" className="w-full sm:w-auto order-1 sm:order-2">
                  Guardar Información
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Responsive Features Demo */}
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-xl font-semibold mb-6">Características Responsive</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Breakpoints Tailwind</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>sm:</span>
                    <span className="text-neutral-600">640px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>md:</span>
                    <span className="text-neutral-600">768px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>lg:</span>
                    <span className="text-neutral-600">1024px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>xl:</span>
                    <span className="text-neutral-600">1280px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2xl:</span>
                    <span className="text-neutral-600">1536px+</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Componentes Adaptativos</h4>
                <ul className="space-y-1 text-sm text-neutral-600">
                  <li>• Navegación con hamburger menu</li>
                  <li>• Grids que se colapsan</li>
                  <li>• Tablas → Cards en móvil</li>
                  <li>• Formularios responsivos</li>
                  <li>• Botones de ancho completo</li>
                  <li>• Tipografía escalable</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Mejores Prácticas</h4>
                <ul className="space-y-1 text-sm text-neutral-600">
                  <li>• Mobile-first design</li>
                  <li>• Touch-friendly targets</li>
                  <li>• Readable font sizes</li>
                  <li>• Accessible color contrast</li>
                  <li>• Logical content reflow</li>
                  <li>• Performance optimized</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Responsive Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>
          <h3 className="text-lg sm:text-xl font-semibold">Nueva Cita</h3>
        </Modal.Header>
        <Modal.Content>
          <div className="space-y-4">
            <p className="text-neutral-600">
              Este modal se adapta automáticamente al tamaño de pantalla, 
              siendo de pantalla completa en móviles y centrado en desktop.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Paciente"
                placeholder="Nombre del paciente"
              />
              <FormInput
                type="datetime-local"
                label="Fecha y Hora"
              />
            </div>
            <Select
              label="Tipo de Consulta"
              options={[
                { value: '', label: 'Seleccionar...' },
                { value: 'consulta', label: 'Consulta General' },
                { value: 'limpieza', label: 'Limpieza Dental' },
                { value: 'emergencia', label: 'Emergencia' },
              ]}
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Crear Cita
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ResponsiveDemo
