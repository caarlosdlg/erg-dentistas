import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import Table from '../components/ui/Table';
import Navigation from '../components/ui/Navigation';

/**
 * Design System Demo Page
 * Página de demostración del sistema de diseño DentalERP
 */
const DesignSystemDemo = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    priority: '',
    specialty: ''
  });

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Sample data for table
  const tableData = [
    { id: 1, name: 'Dr. Juan Pérez', specialty: 'Ortodoncia', patients: 45, status: 'Activo' },
    { id: 2, name: 'Dra. María González', specialty: 'Endodoncia', patients: 32, status: 'Activo' },
    { id: 3, name: 'Dr. Carlos López', specialty: 'Cirugía Oral', patients: 28, status: 'Vacaciones' },
    { id: 4, name: 'Dra. Ana Martínez', specialty: 'Periodoncia', patients: 38, status: 'Activo' }
  ];

  const tableColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Especialidad', dataIndex: 'specialty', key: 'specialty' },
    { title: 'Pacientes', dataIndex: 'patients', key: 'patients', align: 'center' },
    { 
      title: 'Estado', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Badge variant={status === 'Activo' ? 'success' : 'warning'}>
          {status}
        </Badge>
      )
    }
  ];

  // Navigation items
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      label: 'Pacientes',
      path: '/patients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      children: [
        { label: 'Lista de Pacientes', path: '/patients/list' },
        { label: 'Nuevo Paciente', path: '/patients/new' },
        { label: 'Historial Médico', path: '/patients/history' }
      ]
    },
    {
      label: 'Citas',
      path: '/appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Tratamientos',
      path: '/treatments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Sistema de Diseño DentalERP
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Componentes reutilizables diseñados para crear interfaces coherentes y profesionales 
            en el sistema de gestión dental. Basado en Tailwind CSS con una paleta de colores 
            específica para el sector médico.
          </p>
        </div>

        {/* Color Palette */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Paleta de Colores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Colors */}
            <div>
              <h3 className="text-lg font-medium mb-4">Colores Primarios (Azul Dental)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className={`h-12 rounded-md bg-primary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs mt-1 text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Colors */}
            <div>
              <h3 className="text-lg font-medium mb-4">Colores Secundarios (Verde Médico)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="text-center">
                    <div 
                      className={`h-12 rounded-md bg-secondary-${shade} border border-neutral-200`}
                    />
                    <p className="text-xs mt-1 text-neutral-600">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Typography */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tipografía</h2>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1 - Para títulos principales</h1>
              <p className="text-neutral-600 text-sm mt-1">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2 - Para secciones importantes</h2>
              <p className="text-neutral-600 text-sm mt-1">text-3xl font-semibold</p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Heading 3 - Para subsecciones</h3>
              <p className="text-neutral-600 text-sm mt-1">text-2xl font-medium</p>
            </div>
            <div>
              <p className="text-base">
                Texto normal - Para contenido general y descripciones largas. 
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <p className="text-neutral-600 text-sm mt-1">text-base</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">
                Texto secundario - Para información complementaria y metadatos
              </p>
              <p className="text-neutral-600 text-sm mt-1">text-sm text-neutral-600</p>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Botones</h2>
          
          <div className="space-y-6">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones Primarios</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="sm">Pequeño</Button>
                <Button variant="primary" size="md">Mediano</Button>
                <Button variant="primary" size="lg">Grande</Button>
                <Button variant="primary" size="xl">Extra Grande</Button>
                <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Cargando...' : 'Con Loading'}
                </Button>
                <Button variant="primary" disabled>Deshabilitado</Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones Secundarios</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* State Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones de Estado</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="success">Éxito</Button>
                <Button variant="warning">Advertencia</Button>
                <Button variant="danger">Peligro</Button>
                <Button variant="info">Información</Button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botón de Ancho Completo</h3>
              <Button variant="primary" fullWidth>
                Botón de Ancho Completo
              </Button>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tarjetas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Por Defecto</h3>
              <p className="text-neutral-600 mb-4">
                Contenido de la tarjeta con estilo por defecto.
              </p>
              <Button variant="primary" size="sm">Acción</Button>
            </Card>

            <Card variant="elevated">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Elevada</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con sombra más pronunciada para destacar.
              </p>
              <Button variant="secondary" size="sm">Acción</Button>
            </Card>

            <Card variant="outlined">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Outlined</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con borde marcado y sin sombra.
              </p>
              <Button variant="outline" size="sm">Acción</Button>
            </Card>

            <Card variant="filled">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Filled</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con fondo gris claro.
              </p>
              <Button variant="ghost" size="sm">Acción</Button>
            </Card>

            <Card variant="gradient">
              <h3 className="text-lg font-semibold mb-2">Tarjeta Gradiente</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con gradiente sutil de marca.
              </p>
              <Button variant="primary" size="sm">Acción</Button>
            </Card>

            <Card interactive>
              <h3 className="text-lg font-semibold mb-2">Tarjeta Interactiva</h3>
              <p className="text-neutral-600 mb-4">
                Tarjeta con efectos hover para interacción.
              </p>
              <Button variant="info" size="sm">Acción</Button>
            </Card>
          </div>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Tamaños</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="primary" size="sm">Pequeño</Badge>
                <Badge variant="primary" size="md">Mediano</Badge>
                <Badge variant="primary" size="lg">Grande</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="primary">Primario</Badge>
                <Badge variant="secondary">Secundario</Badge>
                <Badge variant="success">Éxito</Badge>
                <Badge variant="warning">Advertencia</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Información</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Casos de Uso</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span>Estado del paciente:</span>
                  <Badge variant="success">Activo</Badge>
                  <Badge variant="warning">Pendiente</Badge>
                  <Badge variant="error">Inactivo</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span>Prioridad de cita:</span>
                  <Badge variant="error">Urgente</Badge>
                  <Badge variant="warning">Alta</Badge>
                  <Badge variant="info">Normal</Badge>
                  <Badge variant="secondary">Baja</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span>Estado de tratamiento:</span>
                  <Badge variant="primary">En progreso</Badge>
                  <Badge variant="success">Completado</Badge>
                  <Badge variant="warning">Pausado</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Components */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componentes de Formulario</h2>
          
          <div className="space-y-8">
            {/* Input Fields */}
            <div>
              <h3 className="text-lg font-medium mb-4">Campos de Entrada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  placeholder="Ingrese su nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  variant="filled"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />
                <Input
                  label="Teléfono"
                  placeholder="(555) 123-4567"
                  variant="outlined"
                  error={false}
                  helperText="Incluya código de área"
                />
                <Input
                  label="Campo con Error"
                  placeholder="Ejemplo de error"
                  error={true}
                  errorMessage="Este campo es requerido"
                />
              </div>
            </div>

            {/* Textarea */}
            <div>
              <h3 className="text-lg font-medium mb-4">Área de Texto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textarea
                  label="Observaciones"
                  placeholder="Escriba sus observaciones aquí..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                />
                <Textarea
                  label="Notas Adicionales"
                  placeholder="Información adicional..."
                  variant="filled"
                  rows={4}
                  helperText="Máximo 500 caracteres"
                />
              </div>
            </div>

            {/* Select Fields */}
            <div>
              <h3 className="text-lg font-medium mb-4">Campos de Selección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Prioridad"
                  placeholder="Seleccione una prioridad"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  options={[
                    { value: 'low', label: 'Baja' },
                    { value: 'medium', label: 'Media' },
                    { value: 'high', label: 'Alta' },
                    { value: 'urgent', label: 'Urgente' }
                  ]}
                />
                <Select
                  label="Especialidad"
                  placeholder="Seleccione especialidad"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  variant="filled"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  }
                >
                  <option value="orthodontics">Ortodoncia</option>
                  <option value="endodontics">Endodoncia</option>
                  <option value="surgery">Cirugía Oral</option>
                  <option value="periodontics">Periodoncia</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Modal Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente Modal</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Abrir Modal
              </Button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Ejemplo de Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  Este es un ejemplo de modal con el diseño del sistema DentalERP. 
                  Los modales son útiles para formularios, confirmaciones y mostrar información detallada.
                </p>
                
                <div className="space-y-3">
                  <Input
                    label="Nombre del Paciente"
                    placeholder="Ingrese el nombre"
                  />
                  <Select
                    label="Tipo de Cita"
                    placeholder="Seleccione el tipo"
                    options={[
                      { value: 'consultation', label: 'Consulta' },
                      { value: 'cleaning', label: 'Limpieza' },
                      { value: 'treatment', label: 'Tratamiento' }
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary">
                    Guardar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </Card>

        {/* Loading Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Carga</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Variantes de Loading</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <Loading variant="spinner" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Spinner</p>
                </div>
                <div className="text-center">
                  <Loading variant="dots" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Dots</p>
                </div>
                <div className="text-center">
                  <Loading variant="pulse" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Pulse</p>
                </div>
                <div className="text-center">
                  <Loading variant="bars" size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Bars</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Con Texto</h3>
              <div className="flex justify-center">
                <Loading variant="spinner" size="md" text="Cargando datos del paciente..." />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Diferentes Tamaños</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <Loading variant="spinner" size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Pequeño</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="md" />
                  <p className="text-xs text-gray-600 mt-1">Mediano</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="lg" />
                  <p className="text-xs text-gray-600 mt-1">Grande</p>
                </div>
                <div className="text-center">
                  <Loading variant="spinner" size="xl" />
                  <p className="text-xs text-gray-600 mt-1">Extra Grande</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Table Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Tabla</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Tabla de Dentistas</h3>
              <Table
                data={tableData}
                columns={tableColumns}
                variant="default"
                size="md"
                striped={true}
                hoverable={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Tabla Vacía</h3>
              <Table
                data={[]}
                columns={tableColumns}
                emptyMessage="No hay dentistas registrados"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Tabla Cargando</h3>
              <Table
                data={[]}
                columns={tableColumns}
                loading={true}
              />
            </div>
          </div>
        </Card>

        {/* Navigation Component */}
        <Card className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Componente de Navegación</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Navegación Lateral</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <Navigation
                  variant="sidebar"
                  items={navItems}
                  currentPath="/patients"
                  collapsed={false}
                  logo={
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">DE</span>
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">DentalERP</span>
                    </div>
                  }
                  userInfo={{
                    name: "Dr. Juan Pérez",
                    role: "Administrador",
                    avatar: "https://via.placeholder.com/32x32/0066cc/ffffff?text=JP"
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Navegación Superior</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Navigation
                  variant="topbar"
                  items={navItems}
                  currentPath="/dashboard"
                  logo={
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">DE</span>
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">DentalERP</span>
                    </div>
                  }
                  userInfo={{
                    name: "Dr. Juan Pérez",
                    avatar: "https://via.placeholder.com/32x32/0066cc/ffffff?text=JP"
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Guías de Uso</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Colores</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li><strong>Azul Primario:</strong> Para acciones principales y elementos de navegación</li>
                <li><strong>Verde Secundario:</strong> Para confirmaciones y estados positivos</li>
                <li><strong>Rojo:</strong> Para alertas, errores y acciones destructivas</li>
                <li><strong>Amarillo:</strong> Para advertencias y elementos que requieren atención</li>
                <li><strong>Azul Claro:</strong> Para información neutral y elementos informativos</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Tipografía</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li><strong>Inter:</strong> Fuente principal para interfaces y contenido general</li>
                <li><strong>Poppins:</strong> Fuente secundaria para títulos y elementos destacados</li>
                <li>Usar jerarquía clara: H1 para páginas, H2 para secciones, H3 para subsecciones</li>
                <li>Mantener contraste adecuado para accesibilidad</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Espaciado</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Usar escala de espaciado consistente (4, 8, 12, 16, 24, 32px)</li>
                <li>Mayor espaciado entre secciones diferentes</li>
                <li>Espaciado uniforme dentro de grupos relacionados</li>
                <li>Considerar responsive design en todos los breakpoints</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Accesibilidad</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Contraste mínimo 4.5:1 para texto normal</li>
                <li>Contraste mínimo 3:1 para texto grande</li>
                <li>Focus indicators visibles en todos los elementos interactivos</li>
                <li>Uso de atributos ARIA apropiados</li>
                <li>Navegación por teclado en todos los componentes</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo;
