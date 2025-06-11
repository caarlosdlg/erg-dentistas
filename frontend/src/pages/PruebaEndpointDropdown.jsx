import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const PruebaEndpointDropdown = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [cita, setCita] = useState({
    fecha: '',
    hora: '',
    motivo: 'consulta',
    estado: 'programada',
    notas: '',
    costo: '',
    duracion_estimada: 30
  });
  const [crearCitaLoading, setCrearCitaLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPatientsForDropdown();
      console.log('Pacientes cargados:', data);
      setPacientes(data.results || []);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCitaChange = (e) => {
    const { name, value } = e.target;
    setCita(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const crearCitaConEmail = async () => {
    if (!selectedPaciente) {
      alert('Por favor selecciona un paciente');
      return;
    }

    if (!cita.fecha || !cita.hora) {
      alert('Por favor completa la fecha y hora');
      return;
    }

    setCrearCitaLoading(true);
    setResultado(null);
    
    try {
      const citaData = {
        ...cita,
        paciente: selectedPaciente,
        fecha_hora: `${cita.fecha}T${cita.hora}:00`,
        enviar_email: true
      };

      console.log('Enviando datos de cita:', citaData);
      
      const result = await api.createAppointmentWithEmail(citaData);
      console.log('Resultado:', result);
      
      setResultado({
        tipo: 'success',
        mensaje: 'Cita creada exitosamente',
        datos: result
      });

      // Limpiar formulario
      setCita({
        fecha: '',
        hora: '',
        motivo: 'consulta',
        estado: 'programada',
        notas: '',
        costo: '',
        duracion_estimada: 30
      });
      setSelectedPaciente('');

    } catch (err) {
      console.error('Error al crear cita:', err);
      setResultado({
        tipo: 'error',
        mensaje: err.message,
        datos: err
      });
    } finally {
      setCrearCitaLoading(false);
    }
  };

  const testEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/pacientes/dropdown/');
      const data = await response.json();
      console.log('Respuesta directa del endpoint:', data);
      setResultado({
        tipo: 'info',
        mensaje: 'Test directo del endpoint exitoso',
        datos: data
      });
    } catch (err) {
      console.error('Error en test directo:', err);
      setResultado({
        tipo: 'error',
        mensaje: 'Error en test directo del endpoint',
        datos: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🧪 Prueba Endpoint Dropdown y Citas con Emails
          </h1>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Pacientes Cargados</h3>
              <p className="text-2xl font-bold text-blue-600">{pacientes.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Estado Backend</h3>
              <p className="text-sm text-green-600">
                {loading ? 'Cargando...' : 'Conectado ✅'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Estado API</h3>
              <p className="text-sm text-purple-600">
                {error ? 'Error ❌' : 'Funcionando ✅'}
              </p>
            </div>
          </div>

          {/* Botones de Prueba */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={cargarPacientes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Recargar Pacientes'}
            </button>
            <button
              onClick={testEndpoint}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Test Directo Endpoint
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error: {error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Cita */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Crear Cita con Email</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de Paciente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente
                </label>
                <select
                  value={selectedPaciente}
                  onChange={(e) => setSelectedPaciente(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.display_text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={cita.fecha}
                  onChange={handleCitaChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  value={cita.hora}
                  onChange={handleCitaChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <select
                  name="motivo"
                  value={cita.motivo}
                  onChange={handleCitaChange}
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

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  name="duracion_estimada"
                  value={cita.duracion_estimada}
                  onChange={handleCitaChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="costo"
                  value={cita.costo}
                  onChange={handleCitaChange}
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={cita.estado}
                  onChange={handleCitaChange}
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

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notas"
                  value={cita.notas}
                  onChange={handleCitaChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <button
              onClick={crearCitaConEmail}
              disabled={crearCitaLoading}
              className="mt-6 w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {crearCitaLoading ? 'Creando Cita y Enviando Email...' : 'Crear Cita con Email Automático'}
            </button>
          </div>

          {/* Resultado */}
          {resultado && (
            <div className={`p-4 rounded-lg mb-6 ${
              resultado.tipo === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
              resultado.tipo === 'error' ? 'bg-red-50 border-l-4 border-red-400' :
              'bg-blue-50 border-l-4 border-blue-400'
            }`}>
              <h3 className={`font-semibold ${
                resultado.tipo === 'success' ? 'text-green-800' :
                resultado.tipo === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {resultado.mensaje}
              </h3>
              <pre className="mt-2 text-sm text-gray-600 overflow-auto">
                {JSON.stringify(resultado.datos, null, 2)}
              </pre>
            </div>
          )}

          {/* Lista de Pacientes */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Pacientes Disponibles ({pacientes.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {pacientes.map((paciente) => (
                <div key={paciente.id} className="p-2 bg-white rounded border text-sm">
                  <div className="font-medium">{paciente.nombre_completo}</div>
                  <div className="text-gray-600">{paciente.email}</div>
                  <div className="text-gray-500 text-xs">{paciente.telefono}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PruebaEndpointDropdown;
