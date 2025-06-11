import React, { useState } from 'react';
import resendEmailService from '../services/resendEmailService';

const TestResendEmails = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { type, message, data, timestamp }]);
  };

  const testData = {
    paciente: {
      id: '6818d812-bcaf-4e06-a892-79a728392bf9',
      nombre_completo: 'Gael Costilla Garcia',
      email: 'gaelcostillagarcia@gmail.com',
      numero_expediente: 'EXP-001',
      telefono: '+52 55 1234 5678'
    },
    cita: {
      fecha: '2025-06-12',
      hora: '10:00',
      tipo: 'Consulta General',
      motivo: 'Revisión dental de rutina'
    }
  };

  const testWelcomeEmail = async () => {
    setLoading(true);
    addResult('info', '📧 Enviando email de bienvenida...');

    try {
      const result = await resendEmailService.sendWelcomeEmail(testData.paciente);
      
      if (result.success) {
        addResult('success', `✅ Email de bienvenida enviado exitosamente`, result);
      } else {
        addResult('error', `❌ Error: ${result.error}`, result);
      }
    } catch (error) {
      addResult('error', `❌ Error inesperado: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const testReminderEmail = async () => {
    setLoading(true);
    addResult('info', '📅 Enviando email de recordatorio...');

    try {
      const result = await resendEmailService.sendAppointmentReminderEmail(testData.paciente, testData.cita);
      
      if (result.success) {
        addResult('success', `✅ Email de recordatorio enviado exitosamente`, result);
      } else {
        addResult('error', `❌ Error: ${result.error}`, result);
      }
    } catch (error) {
      addResult('error', `❌ Error inesperado: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const testGeneralEmail = async () => {
    setLoading(true);
    addResult('info', '📨 Enviando email general...');

    try {
      const subject = 'Comunicación desde Clínica Dental';
      const message = `Estimado/a ${testData.paciente.nombre_completo},

Esperamos que se encuentre bien.

Este es un mensaje de prueba del sistema de emails automáticos de nuestra clínica dental.

Gracias por su confianza.

Saludos cordiales,
Equipo de la Clínica Dental`;

      const result = await resendEmailService.sendGeneralInfoEmail(testData.paciente, subject, message);
      
      if (result.success) {
        addResult('success', `✅ Email general enviado exitosamente`, result);
      } else {
        addResult('error', `❌ Error: ${result.error}`, result);
      }
    } catch (error) {
      addResult('error', `❌ Error inesperado: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            📧 Test Sistema de Emails con Resend API
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Control */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-blue-800 mb-4">
                  🎯 Datos de Prueba
                </h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Paciente:</strong> {testData.paciente.nombre_completo}</p>
                  <p><strong>Email:</strong> {testData.paciente.email}</p>
                  <p><strong>Expediente:</strong> {testData.paciente.numero_expediente}</p>
                  <p><strong>Teléfono:</strong> {testData.paciente.telefono}</p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-green-800 mb-4">
                  🧪 Pruebas de Email
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={testWelcomeEmail}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? '⏳ Enviando...' : '📧 Enviar Email de Bienvenida'}
                  </button>
                  
                  <button
                    onClick={testReminderEmail}
                    disabled={loading}
                    className="w-full py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? '⏳ Enviando...' : '📅 Enviar Email de Recordatorio'}
                  </button>
                  
                  <button
                    onClick={testGeneralEmail}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? '⏳ Enviando...' : '📨 Enviar Email General'}
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de Resultados */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    📊 Resultados de Prueba
                  </h2>
                  <button
                    onClick={clearResults}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition"
                  >
                    🗑️ Limpiar
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay resultados aún. Ejecuta una prueba para ver los resultados.
                    </p>
                  ) : (
                    results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md text-sm ${
                          result.type === 'success'
                            ? 'bg-green-100 border border-green-200 text-green-800'
                            : result.type === 'error'
                            ? 'bg-red-100 border border-red-200 text-red-800'
                            : 'bg-blue-100 border border-blue-200 text-blue-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span>{result.message}</span>
                          <span className="text-xs opacity-75 ml-2">{result.timestamp}</span>
                        </div>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs opacity-75">
                              Ver detalles
                            </summary>
                            <pre className="mt-1 text-xs opacity-75 whitespace-pre-wrap">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ℹ️ Información del Sistema
            </h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>API:</strong> Resend (https://api.resend.com/emails)</p>
              <p>• <strong>Email De:</strong> Clínica Dental ERP &lt;onboarding@resend.dev&gt;</p>
              <p>• <strong>Templates:</strong> HTML profesionales con diseño responsive</p>
              <p>• <strong>Tipos:</strong> Bienvenida, Recordatorio, General</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResendEmails;
