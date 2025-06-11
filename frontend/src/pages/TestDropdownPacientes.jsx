import React, { useState, useEffect } from 'react';
import { apiSimple } from '../services/apiSimple';

const CitasElegante = () => {
  const [state, setState] = useState({
    pacientes: [],
    dentistas: [],
    loading: false,
    error: null,
    connected: false,
    selectedPaciente: '',
    selectedDentista: '',
    logs: []
  });

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    motivo: 'consulta',
    estado: 'programada',
    notas: '',
    motivo_consulta: '',
    costo: '',
    duracion_estimada: 30,
    enviar_email: true
  });

  const [resultado, setResultado] = useState(null);

  // Helper para agregar logs
  const addLog = (tipo, mensaje, datos = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { tipo, mensaje, datos, timestamp };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs.slice(0, 19)] // Mantener solo los últimos 20 logs
    }));
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`, datos);
  };

  // Test de conectividad
  const testConnection = async () => {
    addLog('info', 'Probando conexión con backend...');
    try {
      const isConnected = await apiSimple.testConnection();
      setState(prev => ({ ...prev, connected: isConnected }));
      addLog(isConnected ? 'success' : 'error', `Conexión: ${isConnected ? 'Exitosa' : 'Fallida'}`);
      return isConnected;
    } catch (error) {
      addLog('error', 'Error al probar conexión', error.message);
      setState(prev => ({ ...prev, connected: false }));
      return false;
    }
  };

  // Cargar pacientes
  const cargarPacientes = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    addLog('info', 'Iniciando carga de pacientes...');

    try {
      const data = await apiSimple.getPatientsForDropdown();
      addLog('success', `Pacientes cargados exitosamente: ${data.count} encontrados`);
      
      setState(prev => ({
        ...prev,
        pacientes: data.results || [],
        loading: false,
        error: null
      }));

      return data.results || [];
    } catch (error) {
      addLog('error', 'Error al cargar pacientes', error.message);
      setState(prev => ({
        ...prev,
        pacientes: [],
        loading: false,
        error: error.message
      }));
      return [];
    }
  };

  // Cargar dentistas
  const cargarDentistas = async () => {
    addLog('info', 'Iniciando carga de dentistas...');

    try {
      const data = await apiSimple.getDentistas();
      addLog('success', `Dentistas cargados exitosamente: ${data.results?.length || 0} encontrados`);
      
      setState(prev => ({
        ...prev,
        dentistas: data.results || []
      }));

      return data.results || [];
    } catch (error) {
      addLog('error', 'Error al cargar dentistas', error.message);
      setState(prev => ({
        ...prev,
        dentistas: []
      }));
      return [];
    }
  };

  // Crear cita con email
  const crearCitaConEmail = async () => {
    if (!state.selectedPaciente) {
      addLog('error', 'No se ha seleccionado un paciente');
      alert('Por favor selecciona un paciente');
      return;
    }

    if (!formData.fecha || !formData.hora) {
      addLog('error', 'Faltan datos obligatorios: fecha y hora');
      alert('Por favor completa la fecha y hora');
      return;
    }

    const pacienteSeleccionado = state.pacientes.find(p => p.id === state.selectedPaciente);
    const dentistaSeleccionado = state.dentistas.find(d => d.id === state.selectedDentista);
    
    addLog('info', `Creando cita para: ${pacienteSeleccionado?.nombre_completo}`, {
      paciente: pacienteSeleccionado,
      dentista: dentistaSeleccionado,
      formData
    });

    try {
      const citaData = {
        ...formData,
        paciente: state.selectedPaciente,
        dentista: state.selectedDentista || state.dentistas[0]?.id, // Usar primer dentista si no hay selección
        fecha_hora: `${formData.fecha}T${formData.hora}:00`,
        motivo_consulta: formData.motivo_consulta || formData.notas || `Consulta: ${formData.motivo}`,
      };

      const result = await apiSimple.createAppointmentWithEmail(citaData);
      
      addLog('success', 'Cita creada exitosamente', result);
      setResultado({
        tipo: 'success',
        mensaje: result.message,
        datos: result
      });

      // Limpiar formulario
      setFormData({
        fecha: '',
        hora: '',
        motivo: 'consulta',
        estado: 'programada',
        notas: '',
        motivo_consulta: '',
        costo: '',
        duracion_estimada: 30,
        enviar_email: true
      });
      setState(prev => ({ 
        ...prev, 
        selectedPaciente: '',
        selectedDentista: ''
      }));

    } catch (error) {
      addLog('error', 'Error al crear cita', error.message);
      setResultado({
        tipo: 'error',
        mensaje: error.message,
        datos: error
      });
    }
  };

  // Probar envío de email manual
  const probarEnvioEmail = async () => {
    try {
      // Obtener una cita existente para probar
      const citas = await apiSimple.getCitas();
      if (citas.results && citas.results.length > 0) {
        const cita = citas.results[0];
        addLog('info', `Probando envío de email para cita: ${cita.id}`);
        
        const result = await apiSimple.sendConfirmationEmail(cita.id);
        addLog('success', 'Email de prueba enviado', result);
        
        setResultado({
          tipo: 'success',
          mensaje: 'Email de prueba enviado exitosamente',
          datos: result
        });
      } else {
        addLog('error', 'No hay citas disponibles para probar');
        alert('No hay citas disponibles para probar el envío de email');
      }
    } catch (error) {
      addLog('error', 'Error al probar envío de email', error.message);
      setResultado({
        tipo: 'error',
        mensaje: `Error al probar email: ${error.message}`,
        datos: error
      });
    }
  };

  // Manejar cambios en el dropdown de paciente
  const handlePacienteChange = (e) => {
    const value = e.target.value;
    const paciente = state.pacientes.find(p => p.id === value);
    addLog('info', `Paciente seleccionado: ${paciente ? paciente.nombre_completo : 'Ninguno'}`, {
      id: value,
      paciente
    });
    setState(prev => ({ ...prev, selectedPaciente: value }));
  };

  // Manejar cambios en el dropdown de dentista
  const handleDentistaChange = (e) => {
    const value = e.target.value;
    const dentista = state.dentistas.find(d => d.id === value);
    addLog('info', `Dentista seleccionado: ${dentista ? dentista.nombre_completo : 'Ninguno'}`, {
      id: value,
      dentista
    });
    setState(prev => ({ ...prev, selectedDentista: value }));
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // Efecto inicial
  useEffect(() => {
    addLog('info', 'Componente iniciado');
    testConnection().then(connected => {
      if (connected) {
        cargarPacientes();
        cargarDentistas();
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Elegante */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ✨ Gestión de Citas
            </h1>
            <p className="text-lg text-gray-600">
              Sistema profesional para agendar citas médicas con notificaciones automáticas
            </p>
          </div>

          {/* Indicadores de Estado Elegantes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className={`bg-white rounded-xl p-4 shadow-lg border-l-4 ${
              state.connected ? 'border-green-500' : 'border-red-500'
            } hover:shadow-xl transition-shadow`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  state.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Conexión</h3>
                  <p className={`text-xs ${state.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {state.connected ? 'Conectado' : 'Desconectado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">{state.pacientes.length}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Pacientes</h3>
                  <p className="text-xs text-blue-600">Disponibles</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-sm font-bold">{state.dentistas.length}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Dentistas</h3>
                  <p className="text-xs text-purple-600">Activos</p>
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-xl p-4 shadow-lg border-l-4 ${
              state.loading ? 'border-yellow-500' : 'border-gray-300'
            } hover:shadow-xl transition-shadow`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  state.loading ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {state.loading ? (
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-gray-600 text-sm">✓</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Estado</h3>
                  <p className={`text-xs ${state.loading ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {state.loading ? 'Cargando...' : 'Listo'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-xl p-4 shadow-lg border-l-4 ${
              state.selectedPaciente && state.selectedDentista ? 'border-green-500' : 'border-gray-300'
            } hover:shadow-xl transition-shadow`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  state.selectedPaciente && state.selectedDentista ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <span className={`text-sm ${
                    state.selectedPaciente && state.selectedDentista ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {state.selectedPaciente && state.selectedDentista ? '✓' : '○'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Selección</h3>
                  <p className={`text-xs ${
                    state.selectedPaciente && state.selectedDentista ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {state.selectedPaciente && state.selectedDentista ? 'Completa' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Botones de Control */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              🔗 Test Conexión
            </button>
            <button
              onClick={cargarPacientes}
              disabled={state.loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
            >
              🔄 Recargar Pacientes
            </button>
            <button
              onClick={cargarDentistas}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              👨‍⚕️ Recargar Dentistas
            </button>
            <button
              onClick={probarEnvioEmail}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
            >
              📧 Probar Email Manual
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, logs: [] }))}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              🗑️ Limpiar Logs
            </button>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">❌ Error: {state.error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel Izquierdo: Formulario */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📋 Formulario de Cita</h2>
                
                {/* Dropdown de Pacientes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Paciente
                  </label>
                  <select
                    value={state.selectedPaciente}
                    onChange={handlePacienteChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={state.loading || state.pacientes.length === 0}
                  >
                    <option value="">
                      {state.loading ? 'Cargando pacientes...' : 
                       state.pacientes.length === 0 ? 'No hay pacientes disponibles' :
                       'Seleccionar paciente...'}
                    </option>
                    {state.pacientes.map((paciente, index) => (
                      <option key={paciente.id} value={paciente.id}>
                        {`${index + 1}. ${paciente.display_text}`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Info del paciente seleccionado */}
                  {state.selectedPaciente && (
                    <div className="mt-2 p-3 bg-blue-50 rounded border">
                      {(() => {
                        const paciente = state.pacientes.find(p => p.id === state.selectedPaciente);
                        return paciente ? (
                          <div className="text-sm">
                            <p><strong>ID:</strong> {paciente.id}</p>
                            <p><strong>Nombre:</strong> {paciente.nombre_completo}</p>
                            <p><strong>Email:</strong> {paciente.email}</p>
                            <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                          </div>
                        ) : (
                          <p className="text-red-600">❌ Paciente no encontrado</p>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Dropdown de Dentistas */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👨‍⚕️ Dentista
                  </label>
                  <select
                    value={state.selectedDentista}
                    onChange={handleDentistaChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={state.dentistas.length === 0}
                  >
                    <option value="">
                      {state.dentistas.length === 0 ? 'No hay dentistas disponibles' : 'Seleccionar dentista...'}
                    </option>
                    {state.dentistas.map((dentista, index) => (
                      <option key={dentista.id} value={dentista.id}>
                        {`${index + 1}. ${dentista.nombre_completo} - ${dentista.user.email}`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Info del dentista seleccionado */}
                  {state.selectedDentista && (
                    <div className="mt-2 p-3 bg-green-50 rounded border">
                      {(() => {
                        const dentista = state.dentistas.find(d => d.id === state.selectedDentista);
                        return dentista ? (
                          <div className="text-sm">
                            <p><strong>ID:</strong> {dentista.id}</p>
                            <p><strong>Nombre:</strong> {dentista.nombre_completo}</p>
                            <p><strong>Email:</strong> {dentista.user.email}</p>
                            <p><strong>Cédula:</strong> {dentista.cedula_profesional}</p>
                            <p><strong>Horario:</strong> {dentista.horario_inicio} - {dentista.horario_fin}</p>
                          </div>
                        ) : (
                          <p className="text-red-600">❌ Dentista no encontrado</p>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📅 Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🕐 Hora</label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Motivo y Estado */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🦷 Motivo</label>
                    <select
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="consulta">Consulta</option>
                      <option value="limpieza">Limpieza</option>
                      <option value="extraccion">Extracción</option>
                      <option value="endodoncia">Endodoncia</option>
                      <option value="ortodoncia">Ortodoncia</option>
                      <option value="cirugia">Cirugía</option>
                      <option value="revision">Revisión</option>
                      <option value="urgencia">Urgencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📊 Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="programada">Programada</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="no_asistio">No Asistió</option>
                    </select>
                  </div>
                </div>

                {/* Motivo de Consulta (Campo Requerido) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Motivo de Consulta <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="motivo_consulta"
                    value={formData.motivo_consulta}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe el motivo principal de la consulta..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este campo es requerido por el sistema
                  </p>
                </div>

                {/* Costo y Duración */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">💰 Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      name="costo"
                      value={formData.costo}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">⏱️ Duración (min)</label>
                    <input
                      type="number"
                      name="duracion_estimada"
                      value={formData.duracion_estimada}
                      onChange={handleFormChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Notas */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Notas</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Checkbox de Email */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enviar_email"
                      checked={formData.enviar_email}
                      onChange={handleFormChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      📧 Enviar email de confirmación automáticamente
                    </span>
                  </label>
                </div>

                {/* Botón de Crear Cita */}
                <button
                  onClick={crearCitaConEmail}
                  disabled={
                    !state.selectedPaciente || 
                    !formData.fecha || 
                    !formData.hora || 
                    !formData.motivo_consulta.trim()
                  }
                  className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
                >
                  📅📧 Crear Cita {formData.enviar_email ? 'con Email' : 'sin Email'}
                </button>
              </div>

              {/* Resultado */}
              {resultado && (
                <div className={`p-4 rounded-lg ${
                  resultado.tipo === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                  'bg-red-50 border-l-4 border-red-400'
                }`}>
                  <h3 className={`font-semibold ${
                    resultado.tipo === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {resultado.mensaje}
                  </h3>
                  <pre className="mt-2 text-sm text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(resultado.datos, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Panel Derecho: Logs y Pacientes */}
            <div className="space-y-6">
              {/* Logs */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📊 Logs del Sistema</h2>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {state.logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay logs aún...</p>
                  ) : (
                    state.logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm border-l-4 ${
                          log.tipo === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                          log.tipo === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                          'bg-blue-50 border-blue-400 text-blue-800'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{log.mensaje}</span>
                          <span className="text-xs opacity-70">{log.timestamp}</span>
                        </div>
                        {log.datos && (
                          <pre className="mt-1 text-xs opacity-80 overflow-auto">
                            {typeof log.datos === 'string' ? log.datos : JSON.stringify(log.datos, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lista de Pacientes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">
                  👥 Pacientes Disponibles ({state.pacientes.length})
                </h2>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {state.pacientes.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {state.loading ? 'Cargando pacientes...' : 'No hay pacientes cargados'}
                    </p>
                  ) : (
                    state.pacientes.map((paciente, index) => (
                      <div
                        key={paciente.id}
                        className={`p-3 rounded border cursor-pointer transition ${
                          state.selectedPaciente === paciente.id
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setState(prev => ({ ...prev, selectedPaciente: paciente.id }))}
                      >
                        <div className="font-medium text-sm">
                          {index + 1}. {paciente.nombre_completo}
                        </div>
                        <div className="text-xs text-gray-600">{paciente.email}</div>
                        <div className="text-xs text-gray-500">{paciente.telefono}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitasElegante;
