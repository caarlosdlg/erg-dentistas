import React, { useState, useEffect } from 'react';
import backendEmailService from '../services/backendEmailService';
import { apiSimple } from '../services/apiSimple';

const TestWelcomeEmail = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await apiSimple.getPatientsForDropdown();
      console.log('👥 Pacientes cargados:', response);
      setPatients(response.pacientes || response.results || response || []);
    } catch (err) {
      console.error('❌ Error al cargar pacientes:', err);
    }
  };

  const sendWelcomeEmail = async () => {
    if (!selectedPatient) {
      alert('Por favor selecciona un paciente');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) {
      alert('Paciente no encontrado');
      return;
    }

    if (!patient.email) {
      alert('Este paciente no tiene email registrado');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('📧 Enviando email de bienvenida a:', patient);
      const result = await backendEmailService.sendWelcomeEmail(patient);
      
      setResult(result);
      
      if (result.success) {
        alert(`✅ Email de bienvenida enviado exitosamente a ${patient.email}`);
      } else {
        alert(`❌ Error al enviar email: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({
        success: false,
        error: error.message
      });
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📧 Test Email de Bienvenida
        </h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Paciente
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.nombre_completo} - {patient.email || 'Sin email'}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Paciente Seleccionado:</h3>
              {(() => {
                const patient = patients.find(p => p.id === selectedPatient);
                return (
                  <div className="mt-2 text-blue-700">
                    <p><strong>Nombre:</strong> {patient?.nombre_completo}</p>
                    <p><strong>Email:</strong> {patient?.email || 'No registrado'}</p>
                    <p><strong>Teléfono:</strong> {patient?.telefono || 'No registrado'}</p>
                  </div>
                );
              })()}
            </div>
          )}

          <button
            onClick={sendWelcomeEmail}
            disabled={loading || !selectedPatient}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? '📧 Enviando Email...' : '📧 Enviar Email de Bienvenida'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Éxito' : '❌ Error'}
              </h3>
              <p className={`mt-2 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.success ? result.message : result.error}
              </p>
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-75">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">ℹ️ Información</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Este test envía emails de bienvenida usando el backend API</li>
              <li>• Los emails se envían a través de Resend desde el servidor (no CORS)</li>
              <li>• Solo pacientes con email registrado pueden recibir emails</li>
              <li>• El email incluye información de bienvenida y servicios de la clínica</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Nota Importante</h3>
            <p className="text-sm text-yellow-700">
              En el entorno de desarrollo, Resend solo puede enviar emails a direcciones de email verificadas.
              Para enviar a cualquier dirección, necesitarías configurar un dominio verificado en Resend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWelcomeEmail;
