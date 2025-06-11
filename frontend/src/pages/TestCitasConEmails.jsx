import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Componente de prueba para demostrar la funcionalidad completa
 * de citas con emails automáticos
 */
const TestCitasConEmails = () => {
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Estados para el formulario de prueba
  const [testForm, setTestForm] = useState({
    paciente: '',
    dentista: '',
    tratamiento: '',
    fecha: '',
    hora: '',
    motivo_consulta: 'Prueba del sistema de emails automáticos',
    enviar_email: true
  });

  const addTestResult = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { type, message, timestamp }]);
  };

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    setLoading(true);
    addTestResult('info', 'Iniciando carga de datos...');

    try {
      // Cargar pacientes con dropdown optimizado
      const patientsData = await apiService.getPatientsForDropdown();
      const patientsResults = patientsData.results || patientsData || [];
      setPatients(patientsResults);
      addTestResult('success', `✅ ${patientsResults.length} pacientes cargados para dropdown`);

      // Cargar dentistas
      const dentistsData = await apiService.getDentists();
      const dentistsResults = dentistsData.results || dentistsData || [];
      setDentists(dentistsResults);
      addTestResult('success', `✅ ${dentistsResults.length} dentistas cargados`);

      // Cargar tratamientos
      const treatmentsData = await apiService.getTreatments();
      const treatmentsResults = treatmentsData.results || treatmentsData || [];
      setTreatments(treatmentsResults);
      addTestResult('success', `✅ ${treatmentsResults.length} tratamientos cargados`);

      addTestResult('success', '🎉 Todos los datos cargados exitosamente');

    } catch (error) {
      addTestResult('error', `❌ Error cargando datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setTestForm(prev => ({ ...prev, paciente: patientId }));
    
    if (patient) {
      addTestResult('info', `👤 Paciente seleccionado: ${patient.nombre_completo} (${patient.email})`);
    }
  };

  const testCreateAppointment = async () => {
    if (!testForm.paciente || !testForm.dentista || !testForm.fecha || !testForm.hora) {
      addTestResult('error', '❌ Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    addTestResult('info', '🔄 Creando cita de prueba...');

    try {
      const citaData = {
        paciente: testForm.paciente,
        dentista: testForm.dentista,
        tratamiento: testForm.tratamiento || treatments[0]?.id,
        fecha_hora: `${testForm.fecha}T${testForm.hora}:00`,
        tipo_cita: 'consulta',
        motivo_consulta: testForm.motivo_consulta,
        duracion_estimada: 60,
        estado: 'programada',
        requiere_confirmacion: true
      };

      let response;
      if (testForm.enviar_email) {
        addTestResult('info', '📧 Creando cita con envío automático de email...');
        response = await apiService.createAppointmentWithEmail(citaData);
      } else {
        addTestResult('info', '📝 Creando cita sin email...');
        response = await apiService.createAppointment(citaData);
      }

      addTestResult('success', `✅ Cita creada exitosamente (ID: ${response.id})`);

      if (response.email_enviado) {
        addTestResult('success', `📧 Email enviado automáticamente a: ${selectedPatient?.email}`);
      } else if (testForm.enviar_email) {
        addTestResult('warning', `⚠️ Email no pudo ser enviado: ${response.email_error || 'Error desconocido'}`);
      }

      // Limpiar formulario
      setTestForm({
        paciente: '',
        dentista: '',
        tratamiento: '',
        fecha: '',
        hora: '',
        motivo_consulta: 'Prueba del sistema de emails automáticos',
        enviar_email: true
      });
      setSelectedPatient(null);

    } catch (error) {
      addTestResult('error', `❌ Error creando cita: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Prueba de Sistema de Citas con Emails
          </h1>
          <p className="text-gray-600">
            Componente de prueba para verificar la funcionalidad completa del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formulario de Prueba */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Crear Cita de Prueba</h2>
            
            <div className="space-y-4">
              {/* Selector de Paciente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Paciente
                </label>
                <select
                  value={testForm.paciente}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Cargando pacientes...' : 'Seleccionar paciente'}
                  </option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.display_text}
                    </option>
                  ))}
                </select>
                
                {selectedPatient && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Seleccionado:</strong> {selectedPatient.nombre_completo}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Email:</strong> {selectedPatient.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Selector de Dentista */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨‍⚕️ Dentista
                </label>
                <select
                  value={testForm.dentista}
                  onChange={(e) => setTestForm(prev => ({ ...prev, dentista: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Seleccionar dentista</option>
                  {dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Tratamiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🩺 Tratamiento (Opcional)
                </label>
                <select
                  value={testForm.tratamiento}
                  onChange={(e) => setTestForm(prev => ({ ...prev, tratamiento: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Seleccionar tratamiento</option>
                  {treatments.map(treatment => (
                    <option key={treatment.id} value={treatment.id}>
                      {treatment.nombre} - ${treatment.precio_base}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Fecha
                  </label>
                  <input
                    type="date"
                    value={testForm.fecha}
                    onChange={(e) => setTestForm(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⏰ Hora
                  </label>
                  <input
                    type="time"
                    value={testForm.hora}
                    onChange={(e) => setTestForm(prev => ({ ...prev, hora: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Motivo de Consulta
                </label>
                <textarea
                  value={testForm.motivo_consulta}
                  onChange={(e) => setTestForm(prev => ({ ...prev, motivo_consulta: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkbox Email */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  id="enviar_email_test"
                  checked={testForm.enviar_email}
                  onChange={(e) => setTestForm(prev => ({ ...prev, enviar_email: e.target.checked }))}
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="enviar_email_test" className="text-green-800 font-medium">
                  📧 Enviar email automáticamente
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={testCreateAppointment}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Procesando...' : '🧪 Crear Cita de Prueba'}
                </button>
                <button
                  onClick={loadTestData}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  🔄 Recargar
                </button>
              </div>
            </div>
          </div>

          {/* Resultados de Prueba */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📊 Resultados de Prueba</h2>
              <button
                onClick={clearResults}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                🗑️ Limpiar
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay resultados aún. Ejecuta una prueba para ver los resultados.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      result.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                      result.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                      result.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                      'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span>{result.message}</span>
                      <span className="text-xs opacity-75 ml-2">{result.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas de Datos */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Estadísticas de Datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
              <p className="text-blue-800">Pacientes con Email</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{dentists.length}</p>
              <p className="text-green-800">Dentistas Disponibles</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{treatments.length}</p>
              <p className="text-purple-800">Tratamientos Activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCitasConEmails;
