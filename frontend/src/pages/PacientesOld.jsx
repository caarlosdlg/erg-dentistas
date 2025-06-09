import React, { useState, useEffect } from 'react';
// import { usePatients } from '../hooks/useAPI';
// import { useNotifications } from '../contexts/NotificationContext';

// Mock functions for demo
const usePatients = () => ({
  patients: [],
  loading: false,
  error: null,
  createPatient: async () => {},
  updatePatient: async () => {},
  deletePatient: async () => {},
  searchPatients: async () => {}
});

const useNotifications = () => ({
  showNotification: (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
});

/**
 * Pacientes page component - Patient management
 * Real functionality for managing dental patients
 */
const Pacientes = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_sangre: '',
    alergias: '',
    medicamentos: '',
    enfermedades_cronicas: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
  });

  // Mock data - replace with API calls
  const mockPatients = [
    {
      id: '1',
      numero_expediente: 'PAC-000001',
      nombre: 'María',
      apellido_paterno: 'González',
      apellido_materno: 'López',
      fecha_nacimiento: '1985-03-15',
      sexo: 'F',
      telefono: '+52-555-0123',
      email: 'maria.gonzalez@email.com',
      direccion: 'Av. Reforma 123, Ciudad de México',
      tipo_sangre: 'O+',
      alergias: 'Penicilina',
      medicamentos: 'Ninguno',
      enfermedades_cronicas: '',
      contacto_emergencia_nombre: 'Juan González',
      contacto_emergencia_telefono: '+52-555-0124',
      contacto_emergencia_relacion: 'Esposo',
      fecha_registro: '2024-01-15',
      activo: true
    },
    {
      id: '2',
      numero_expediente: 'PAC-000002',
      nombre: 'Carlos',
      apellido_paterno: 'Martínez',
      apellido_materno: 'Ruiz',
      fecha_nacimiento: '1978-07-22',
      sexo: 'M',
      telefono: '+52-555-0125',
      email: 'carlos.martinez@email.com',
      direccion: 'Calle 5 de Mayo 456, Guadalajara',
      tipo_sangre: 'A+',
      alergias: '',
      medicamentos: 'Aspirina 100mg diario',
      enfermedades_cronicas: 'Hipertensión',
      contacto_emergencia_nombre: 'Ana Martínez',
      contacto_emergencia_telefono: '+52-555-0126',
      contacto_emergencia_relacion: 'Esposa',
      fecha_registro: '2024-02-10',
      activo: true
    },
    {
      id: '3',
      numero_expediente: 'PAC-000003',
      nombre: 'Ana',
      apellido_paterno: 'Rodríguez',
      apellido_materno: 'Hernández',
      fecha_nacimiento: '1992-11-08',
      sexo: 'F',
      telefono: '+52-555-0127',
      email: 'ana.rodriguez@email.com',
      direccion: 'Colonia Roma Norte 789, Ciudad de México',
      tipo_sangre: 'B+',
      alergias: 'Látex',
      medicamentos: 'Anticonceptivos orales',
      enfermedades_cronicas: '',
      contacto_emergencia_nombre: 'Pedro Rodríguez',
      contacto_emergencia_telefono: '+52-555-0128',
      contacto_emergencia_relacion: 'Padre',
      fecha_registro: '2024-03-05',
      activo: true
    }
  ];

  useEffect(() => {
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numero_expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock save - replace with API call
    const newPatient = {
      ...formData,
      id: Date.now().toString(),
      numero_expediente: `PAC-${String(patients.length + 1).padStart(6, '0')}`,
      fecha_registro: new Date().toISOString().split('T')[0],
      activo: true
    };
    
    setPatients(prev => [...prev, newPatient]);
    setIsCreateModalOpen(false);
    setFormData({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      sexo: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo_sangre: '',
      alergias: '',
      medicamentos: '',
      enfermedades_cronicas: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      contacto_emergencia_relacion: ''
    });
    alert('Paciente registrado exitosamente');
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">Gestión de pacientes del consultorio dental</p>
          </div>
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Paciente
          </button>
        </div>

        {/* Quick Stats */}
        <Grid cols={4} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Total Pacientes</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {patients.length}
                </div>
                <p className="text-sm text-gray-500">Registrados</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Activos</h3>
                <div className="text-3xl font-bold text-green-600">
                  {patients.filter(p => p.activo).length}
                </div>
                <p className="text-sm text-gray-500">Con estado activo</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Este Mes</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {patients.filter(p => {
                    const registroDate = new Date(p.fecha_registro);
                    const now = new Date();
                    return registroDate.getMonth() === now.getMonth() && 
                           registroDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <p className="text-sm text-gray-500">Nuevos registros</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Emergencias</h3>
                <div className="text-3xl font-bold text-red-600">
                  {patients.filter(p => p.alergias || p.enfermedades_cronicas).length}
                </div>
                <p className="text-sm text-gray-500">Con alertas médicas</p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Search and Filters */}
        <Card>
          <Card.Content className="p-6">
            <Flex gap={4} align="center" className="flex-wrap">
              <Input
                placeholder="Buscar por nombre, expediente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[300px]"
              />
              <Button variant="outline">Filtros Avanzados</Button>
              <Button variant="outline">Exportar</Button>
            </Flex>
          </Card.Content>
        </Card>

        {/* Patients List */}
        <Grid cols={1} gap={4}>
          {filteredPatients.map((patient) => (
            <Card key={patient.id} variant="outlined" className="hover:shadow-lg transition-shadow">
              <Card.Content className="p-6">
                <Flex justify="space-between" align="start">
                  <Flex direction="column" gap={2} className="flex-1">
                    <Flex align="center" gap={4}>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {patient.nombre} {patient.apellido_paterno} {patient.apellido_materno}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {patient.numero_expediente}
                      </span>
                      {(patient.alergias || patient.enfermedades_cronicas) && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          ⚠️ Alerta Médica
                        </span>
                      )}
                    </Flex>
                    
                    <Grid cols={3} gap={4} className="mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Edad</p>
                        <p className="font-medium">{calculateAge(patient.fecha_nacimiento)} años</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{patient.telefono}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Sangre</p>
                        <p className="font-medium">{patient.tipo_sangre || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Registro</p>
                        <p className="font-medium">{new Date(patient.fecha_registro).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          patient.activo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {patient.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </Grid>
                  </Flex>

                  <Flex direction="column" gap={2}>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleViewDetails(patient)}
                    >
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Nueva Cita
                    </Button>
                  </Flex>
                </Flex>
              </Card.Content>
            </Card>
          ))}
        </Grid>

        {/* Create Patient Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Registrar Nuevo Paciente"
          size="large"
        >
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap={6}>
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                <Grid cols={3} gap={4}>
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                  <Input
                    label="Apellido Paterno"
                    value={formData.apellido_paterno}
                    onChange={(e) => handleInputChange('apellido_paterno', e.target.value)}
                    required
                  />
                  <Input
                    label="Apellido Materno"
                    value={formData.apellido_materno}
                    onChange={(e) => handleInputChange('apellido_materno', e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Fecha de Nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                    required
                  />
                  <Select
                    label="Sexo"
                    value={formData.sexo}
                    onChange={(e) => handleInputChange('sexo', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </Select>
                  <Select
                    label="Tipo de Sangre"
                    value={formData.tipo_sangre}
                    onChange={(e) => handleInputChange('tipo_sangre', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </Grid>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <Grid cols={2} gap={4}>
                  <Input
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+52-555-0123"
                    required
                  />
                  <Input
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Textarea
                  label="Dirección"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  rows={3}
                  className="mt-4"
                  required
                />
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Médica</h3>
                <Grid cols={1} gap={4}>
                  <Textarea
                    label="Alergias"
                    value={formData.alergias}
                    onChange={(e) => handleInputChange('alergias', e.target.value)}
                    placeholder="Describir alergias conocidas..."
                    rows={2}
                  />
                  <Textarea
                    label="Medicamentos Actuales"
                    value={formData.medicamentos}
                    onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                    placeholder="Medicamentos que toma actualmente..."
                    rows={2}
                  />
                  <Textarea
                    label="Enfermedades Crónicas"
                    value={formData.enfermedades_cronicas}
                    onChange={(e) => handleInputChange('enfermedades_cronicas', e.target.value)}
                    placeholder="Enfermedades crónicas o condiciones médicas..."
                    rows={2}
                  />
                </Grid>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto de Emergencia</h3>
                <Grid cols={3} gap={4}>
                  <Input
                    label="Nombre Completo"
                    value={formData.contacto_emergencia_nombre}
                    onChange={(e) => handleInputChange('contacto_emergencia_nombre', e.target.value)}
                    required
                  />
                  <Input
                    label="Teléfono"
                    value={formData.contacto_emergencia_telefono}
                    onChange={(e) => handleInputChange('contacto_emergencia_telefono', e.target.value)}
                    required
                  />
                  <Input
                    label="Relación"
                    value={formData.contacto_emergencia_relacion}
                    onChange={(e) => handleInputChange('contacto_emergencia_relacion', e.target.value)}
                    placeholder="Ej: Esposo, Padre, Hermano"
                    required
                  />
                </Grid>
              </div>

              {/* Form Actions */}
              <Flex justify="end" gap={3} className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Registrar Paciente
                </Button>
              </Flex>
            </Flex>
          </form>
        </Modal>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <Modal
            isOpen={!!selectedPatient}
            onClose={() => setSelectedPatient(null)}
            title={`Expediente: ${selectedPatient.numero_expediente}`}
            size="large"
          >
            <Flex direction="column" gap={6}>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedPatient.nombre} {selectedPatient.apellido_paterno} {selectedPatient.apellido_materno}
                </h3>
                <p className="text-gray-600">
                  {calculateAge(selectedPatient.fecha_nacimiento)} años • 
                  {selectedPatient.sexo === 'M' ? ' Masculino' : ' Femenino'} • 
                  Tipo de sangre: {selectedPatient.tipo_sangre || 'No especificado'}
                </p>
              </div>

              <Grid cols={2} gap={6}>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Teléfono:</span> {selectedPatient.telefono}</p>
                    <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                    <p><span className="font-medium">Dirección:</span> {selectedPatient.direccion}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contacto de Emergencia</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedPatient.contacto_emergencia_nombre}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedPatient.contacto_emergencia_telefono}</p>
                    <p><span className="font-medium">Relación:</span> {selectedPatient.contacto_emergencia_relacion}</p>
                  </div>
                </div>
              </Grid>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información Médica</h4>
                <div className="space-y-3">
                  {selectedPatient.alergias && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800">⚠️ Alergias:</p>
                      <p className="text-red-700">{selectedPatient.alergias}</p>
                    </div>
                  )}
                  {selectedPatient.medicamentos && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-800">💊 Medicamentos:</p>
                      <p className="text-blue-700">{selectedPatient.medicamentos}</p>
                    </div>
                  )}
                  {selectedPatient.enfermedades_cronicas && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-yellow-800">🏥 Enfermedades Crónicas:</p>
                      <p className="text-yellow-700">{selectedPatient.enfermedades_cronicas}</p>
                    </div>
                  )}
                </div>
              </div>

              <Flex justify="end" gap={3} className="pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Cerrar
                </Button>
                <Button variant="primary">
                  Editar Información
                </Button>
                <Button variant="secondary">
                  Nueva Cita
                </Button>
              </Flex>
            </Flex>
          </Modal>
        )}
      </Flex>
    </Container>
  );
};

export default Pacientes;
