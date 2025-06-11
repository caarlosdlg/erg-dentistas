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
    selectedDentista: ''
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

  // Test de conectividad
  const testConnection = async () => {
    try {
      const isConnected = await apiSimple.testConnection();
      setState(prev => ({ ...prev, connected: isConnected }));
      return isConnected;
    } catch (error) {
      setState(prev => ({ ...prev, connected: false }));
      return false;
    }
  };

  // Cargar pacientes
  const cargarPacientes = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiSimple.getPatientsForDropdown();
      setState(prev => ({
        ...prev,
        pacientes: data.results || [],
        loading: false,
        error: null
      }));
      return data.results || [];
    } catch (error) {
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
    try {
      const data = await apiSimple.getDentistas();
      setState(prev => ({
        ...prev,
        dentistas: data.results || []
      }));
      return data.results || [];
    } catch (error) {
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
      alert('Por favor selecciona un paciente');
      return;
    }

    if (!formData.fecha || !formData.hora) {
      alert('Por favor completa la fecha y hora');
      return;
    }

    if (!formData.motivo_consulta.trim()) {
      alert('Por favor describe el motivo de la consulta');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const citaData = {
        ...formData,
        paciente: state.selectedPaciente,
        dentista: state.selectedDentista || state.dentistas[0]?.id,
        fecha_hora: `${formData.fecha}T${formData.hora}:00`,
      };

      const result = await apiSimple.createAppointmentWithEmail(citaData);
      
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
        selectedDentista: '',
        loading: false
      }));

    } catch (error) {
      setResultado({
        tipo: 'error',
        mensaje: error.message,
        datos: error
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Manejar cambios en el dropdown de paciente
  const handlePacienteChange = (e) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, selectedPaciente: value }));
  };

  // Manejar cambios en el dropdown de dentista
  const handleDentistaChange = (e) => {
    const value = e.target.value;
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
    testConnection().then(connected => {
      if (connected) {
        cargarPacientes();
        cargarDentistas();
      }
    });
  }, []);

  const pacienteSeleccionado = state.pacientes.find(p => p.id === state.selectedPaciente);
  const dentistaSeleccionado = state.dentistas.find(d => d.id === state.selectedDentista);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Elegante */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
            ✨ Gestión de Citas Médicas
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Sistema profesional para agendar citas con notificaciones automáticas
          </p>
        </div>

        {/* Indicadores de Estado Elegantes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`bg-white rounded-2xl p-6 shadow-lg border-t-4 ${
            state.connected ? 'border-emerald-500' : 'border-red-500'
          } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-4 ${
                state.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <div>
                <h3 className="font-bold text-gray-800">Conexión</h3>
                <p className={`text-sm font-medium ${state.connected ? 'text-emerald-600' : 'text-red-600'}`}>
                  {state.connected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg font-bold">{state.pacientes.length}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Pacientes</h3>
                <p className="text-sm font-medium text-blue-600">Disponibles</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg font-bold">{state.dentistas.length}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Dentistas</h3>
                <p className="text-sm font-medium text-purple-600">Activos</p>
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-2xl p-6 shadow-lg border-t-4 ${
            state.selectedPaciente && state.selectedDentista && formData.fecha && formData.hora && formData.motivo_consulta 
              ? 'border-emerald-500' : 'border-gray-300'
          } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                state.selectedPaciente && state.selectedDentista && formData.fecha && formData.hora && formData.motivo_consulta
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}>
                <span className="text-white text-lg">
                  {state.selectedPaciente && state.selectedDentista && formData.fecha && formData.hora && formData.motivo_consulta ? '✓' : '○'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Estado</h3>
                <p className={`text-sm font-medium ${
                  state.selectedPaciente && state.selectedDentista && formData.fecha && formData.hora && formData.motivo_consulta
                    ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {state.selectedPaciente && state.selectedDentista && formData.fecha && formData.hora && formData.motivo_consulta
                    ? 'Listo' : 'Incompleto'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium">Error: {state.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Principal: Formulario */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-indigo-600 mr-3">📋</span>
                Nueva Cita Médica
              </h2>
              
              {/* Dropdown de Pacientes Elegante */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  👤 Seleccionar Paciente
                </label>
                <select
                  value={state.selectedPaciente}
                  onChange={handlePacienteChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gradient-to-r from-gray-50 to-white"
                  disabled={state.loading || state.pacientes.length === 0}
                >
                  <option value="">
                    {state.loading ? 'Cargando pacientes...' : 
                     state.pacientes.length === 0 ? 'No hay pacientes disponibles' :
                     '-- Seleccionar paciente --'}
                  </option>
                  {state.pacientes.map((paciente, index) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.display_text}
                    </option>
                  ))}
                </select>
                
                {/* Info del paciente seleccionado */}
                {pacienteSeleccionado && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Información del Paciente</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nombre:</span>
                        <p className="text-gray-800">{pacienteSeleccionado.nombre_completo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">{pacienteSeleccionado.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Teléfono:</span>
                        <p className="text-gray-800">{pacienteSeleccionado.telefono}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fecha Nac:</span>
                        <p className="text-gray-800">{pacienteSeleccionado.fecha_nacimiento}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown de Dentistas Elegante */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  👨‍⚕️ Seleccionar Dentista
                </label>
                <select
                  value={state.selectedDentista}
                  onChange={handleDentistaChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gradient-to-r from-gray-50 to-white"
                  disabled={state.dentistas.length === 0}
                >
                  <option value="">
                    {state.dentistas.length === 0 ? 'No hay dentistas disponibles' : '-- Seleccionar dentista --'}
                  </option>
                  {state.dentistas.map((dentista, index) => (
                    <option key={dentista.id} value={dentista.id}>
                      {dentista.nombre_completo} - {dentista.user.email}
                    </option>
                  ))}
                </select>
                
                {/* Info del dentista seleccionado */}
                {dentistaSeleccionado && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">Información del Dentista</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nombre:</span>
                        <p className="text-gray-800">{dentistaSeleccionado.nombre_completo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Cédula:</span>
                        <p className="text-gray-800">{dentistaSeleccionado.cedula_profesional}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">{dentistaSeleccionado.user.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Horario:</span>
                        <p className="text-gray-800">{dentistaSeleccionado.horario_inicio} - {dentistaSeleccionado.horario_fin}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha y Hora Elegantes */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">📅 Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">🕐 Hora</label>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Motivo de Consulta */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📝 Motivo de Consulta <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivo_consulta"
                  value={formData.motivo_consulta}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Describe el motivo principal de la consulta..."
                  required
                />
              </div>

              {/* Tipo de Consulta y Duración */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">🦷 Tipo</label>
                  <select
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleFormChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="consulta">Consulta General</option>
                    <option value="limpieza">Limpieza Dental</option>
                    <option value="extraccion">Extracción</option>
                    <option value="endodoncia">Endodoncia</option>
                    <option value="ortodoncia">Ortodoncia</option>
                    <option value="cirugia">Cirugía</option>
                    <option value="revision">Revisión</option>
                    <option value="urgencia">Urgencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">⏱️ Duración (min)</label>
                  <input
                    type="number"
                    name="duracion_estimada"
                    value={formData.duracion_estimada}
                    onChange={handleFormChange}
                    min="15"
                    max="240"
                    step="15"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Costo y Notas */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">💰 Costo Estimado</label>
                    <input
                      type="number"
                      step="0.01"
                      name="costo"
                      value={formData.costo}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">📊 Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleFormChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
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

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">📝 Notas Adicionales</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Observaciones adicionales (opcional)..."
                  />
                </div>
              </div>

              {/* Checkbox de Email Elegante */}
              <div className="mb-8">
                <label className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200">
                  <input
                    type="checkbox"
                    name="enviar_email"
                    checked={formData.enviar_email}
                    onChange={handleFormChange}
                    className="mr-4 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-lg font-bold text-indigo-800">📧 Envío Automático de Email</span>
                    <p className="text-sm text-indigo-600">Se enviará una confirmación automática al paciente</p>
                  </div>
                </label>
              </div>

              {/* Botón de Crear Cita Elegante */}
              <button
                onClick={crearCitaConEmail}
                disabled={
                  !state.selectedPaciente || 
                  !formData.fecha || 
                  !formData.hora || 
                  !formData.motivo_consulta.trim() ||
                  state.loading
                }
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3"
              >
                {state.loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando Cita...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    <span>Crear Cita {formData.enviar_email ? 'con Email' : 'sin Email'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Resultado Elegante */}
            {resultado && (
              <div className={`p-6 rounded-2xl shadow-lg border ${
                resultado.tipo === 'success' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <h3 className={`font-bold text-lg mb-3 flex items-center ${
                  resultado.tipo === 'success' ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  <span className="mr-3 text-xl">
                    {resultado.tipo === 'success' ? '✅' : '❌'}
                  </span>
                  {resultado.mensaje}
                </h3>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 bg-white p-3 rounded-lg">
                    {JSON.stringify(resultado.datos, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Panel Lateral: Información */}
          <div className="space-y-6">
            {/* Pacientes Disponibles */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-blue-600 mr-3">👥</span>
                Pacientes Disponibles ({state.pacientes.length})
              </h2>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {state.pacientes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">👥</div>
                    <p className="text-gray-500">
                      {state.loading ? 'Cargando pacientes...' : 'No hay pacientes cargados'}
                    </p>
                    <button
                      onClick={cargarPacientes}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cargar Pacientes
                    </button>
                  </div>
                ) : (
                  state.pacientes.map((paciente, index) => (
                    <div
                      key={paciente.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        state.selectedPaciente === paciente.id
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                      onClick={() => setState(prev => ({ ...prev, selectedPaciente: paciente.id }))}
                    >
                      <div className="font-bold text-sm text-gray-800">
                        {index + 1}. {paciente.nombre_completo}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{paciente.email}</div>
                      <div className="text-xs text-gray-500">{paciente.telefono}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dentistas Disponibles */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-purple-600 mr-3">👨‍⚕️</span>
                Dentistas Activos ({state.dentistas.length})
              </h2>
              <div className="space-y-2">
                {state.dentistas.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-gray-400 text-3xl mb-2">👨‍⚕️</div>
                    <p className="text-gray-500">No hay dentistas cargados</p>
                    <button
                      onClick={cargarDentistas}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Cargar Dentistas
                    </button>
                  </div>
                ) : (
                  state.dentistas.map((dentista, index) => (
                    <div
                      key={dentista.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        state.selectedDentista === dentista.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                      onClick={() => setState(prev => ({ ...prev, selectedDentista: dentista.id }))}
                    >
                      <div className="font-bold text-sm text-gray-800">
                        {index + 1}. {dentista.nombre_completo}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{dentista.user.email}</div>
                      <div className="text-xs text-gray-500">{dentista.cedula_profesional}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
              <h3 className="font-bold text-indigo-800 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Información del Sistema
              </h3>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Los emails se envían automáticamente con Resend</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Todos los campos marcados con * son obligatorios</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Las citas incluyen confirmación por email</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Los datos se guardan automáticamente en la base de datos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitasElegante;
