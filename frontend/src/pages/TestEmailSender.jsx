import React, { useState } from 'react';
import { apiSimple } from '../services/apiSimple';

const TestEmailSender = () => {
  const [estado, setEstado] = useState({
    citaId: '',
    resultado: null,
    loading: false,
    logs: []
  });

  const addLog = (tipo, mensaje, datos = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { tipo, mensaje, datos, timestamp };
    setEstado(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs.slice(0, 9)] // Mantener últimos 10 logs
    }));
  };

  const enviarEmailManual = async () => {
    if (!estado.citaId.trim()) {
      alert('Por favor ingresa un ID de cita válido');
      return;
    }

    setEstado(prev => ({ ...prev, loading: true, resultado: null }));
    addLog('info', `Enviando email para cita: ${estado.citaId}`);

    try {
      const result = await apiSimple.sendConfirmationEmail(estado.citaId);
      addLog('success', 'Email enviado exitosamente', result);
      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'success', data: result },
        loading: false 
      }));
    } catch (error) {
      addLog('error', 'Error al enviar email', error.message);
      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'error', data: error.message },
        loading: false 
      }));
    }
  };

  const confirmarCita = async () => {
    if (!estado.citaId.trim()) {
      alert('Por favor ingresa un ID de cita válido');
      return;
    }

    setEstado(prev => ({ ...prev, loading: true, resultado: null }));
    addLog('info', `Confirmando cita y enviando email: ${estado.citaId}`);

    try {
      const result = await apiSimple.confirmAppointment(estado.citaId);
      addLog('success', 'Cita confirmada y email enviado', result);
      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'success', data: result },
        loading: false 
      }));
    } catch (error) {
      addLog('error', 'Error al confirmar cita', error.message);
      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'error', data: error.message },
        loading: false 
      }));
    }
  };

  const crearCitaPruebaGael = async () => {
    setEstado(prev => ({ ...prev, loading: true, resultado: null }));
    addLog('info', 'Creando cita de prueba para Gael Costilla Garcia...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);

    const citaData = {
      paciente: '6818d812-bcaf-4e06-a892-79a728392bf9', // ID de Gael
      dentista: '62390260-f0e6-46df-8071-6dc53798faa1', // Dr. Juan Pérez
      fecha_hora: tomorrow.toISOString(),
      motivo: 'consulta',
      motivo_consulta: 'Cita de prueba desde el frontend',
      estado: 'programada',
      notas: 'Cita creada automáticamente para prueba de emails',
      costo: '500',
      duracion_estimada: 45,
      enviar_email: true
    };

    try {
      const result = await apiSimple.createAppointmentWithEmail(citaData);
      addLog('success', 'Cita creada y email enviado automáticamente', result);
      
      // Actualizar el campo con el ID de la cita creada
      if (result.cita && result.cita.id) {
        setEstado(prev => ({ ...prev, citaId: result.cita.id }));
      }

      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'success', data: result },
        loading: false 
      }));
    } catch (error) {
      addLog('error', 'Error al crear cita con email', error.message);
      setEstado(prev => ({ 
        ...prev, 
        resultado: { tipo: 'error', data: error.message },
        loading: false 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            📧 Test Sistema de Emails
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Control */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  🎯 Crear Cita de Prueba para Gael
                </h2>
                <p className="text-sm text-blue-600 mb-4">
                  Crea automáticamente una cita para <strong>gaelcostila@gmail.com</strong> y envía el email de confirmación
                </p>
                <button
                  onClick={crearCitaPruebaGael}
                  disabled={estado.loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                >
                  {estado.loading ? '⏳ Creando...' : '📅 Crear Cita + Email Automático'}
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">
                  ⚡ Envío Manual de Emails
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Cita
                  </label>
                  <input
                    type="text"
                    value={estado.citaId}
                    onChange={(e) => setEstado(prev => ({ ...prev, citaId: e.target.value }))}
                    placeholder="c662b91b-04f8-4597-b4fe-7b681365dcdc"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID de ejemplo: c662b91b-04f8-4597-b4fe-7b681365dcdc
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={enviarEmailManual}
                    disabled={estado.loading || !estado.citaId.trim()}
                    className="py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    📧 Enviar Email Solo
                  </button>
                  <button
                    onClick={confirmarCita}
                    disabled={estado.loading || !estado.citaId.trim()}
                    className="py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition"
                  >
                    ✅ Confirmar Cita + Email
                  </button>
                </div>
              </div>

              {/* Resultado */}
              {estado.resultado && (
                <div className={`p-4 rounded-lg ${
                  estado.resultado.tipo === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold ${
                    estado.resultado.tipo === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {estado.resultado.tipo === 'success' ? '✅ Éxito' : '❌ Error'}
                  </h3>
                  <pre className="mt-2 text-sm overflow-auto max-h-40">
                    {JSON.stringify(estado.resultado.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Panel de Logs */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📋 Logs del Sistema</h2>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {estado.logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay logs aún...</p>
                  ) : (
                    estado.logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded text-sm border-l-4 ${
                          log.tipo === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                          log.tipo === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                          'bg-blue-50 border-blue-400 text-blue-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
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
                
                <button
                  onClick={() => setEstado(prev => ({ ...prev, logs: [] }))}
                  className="mt-4 w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm"
                >
                  🗑️ Limpiar Logs
                </button>
              </div>

              {/* Información */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 Información</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Los emails se envían a <strong>gaelcostila@gmail.com</strong></li>
                  <li>• El sistema usa Resend para el envío</li>
                  <li>• Verifica tu bandeja de entrada y spam</li>
                  <li>• Los emails incluyen detalles completos de la cita</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmailSender;
