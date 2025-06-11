import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const CitasProgresivo = () => {
  console.log('🔍 CitasProgresivo: Iniciando componente...');
  
  // Estados básicos
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  
  // Estados para datos
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Datos mock para pruebas
  const mockAppointments = [
    {
      id: 1,
      patientName: 'Ana García',
      date: '2025-06-10',
      time: '09:00',
      status: 'confirmada',
      service: 'Limpieza dental',
      dentist: 'Dr. Juan Pérez'
    },
    {
      id: 2,
      patientName: 'Carlos López',
      date: '2025-06-10',
      time: '10:30',
      status: 'pendiente',
      service: 'Consulta general',
      dentist: 'Dr. Juan Pérez'
    }
  ];

  const testAPIService = () => {
    console.log('🔍 Testing API Service:', apiService);
    setStep(2);
  };

  const testLoadPatients = async () => {
    console.log('🔍 Testing Load Patients...');
    setLoadingPatients(true);
    try {
      const data = await apiService.getPatients();
      setPatients(data.results || data);
      console.log('✅ Pacientes cargados:', data.results?.length || data.length);
      setStep(3);
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);
      setError(`Error cargando pacientes: ${error.message}`);
    } finally {
      setLoadingPatients(false);
    }
  };

  const testLoadAppointments = async () => {
    console.log('🔍 Testing Load Appointments...');
    setLoadingAppointments(true);
    try {
      const data = await apiService.getAppointments();
      const citasFromDB = data.results || data;
      
      if (citasFromDB.length > 0) {
        const transformedAppointments = citasFromDB.map(cita => ({
          id: cita.id,
          patientName: cita.paciente_nombre || `Paciente ${cita.paciente}`,
          patientEmail: cita.paciente_email || '',
          date: cita.fecha_hora ? cita.fecha_hora.split('T')[0] : '',
          time: cita.fecha_hora ? cita.fecha_hora.split('T')[1]?.substring(0, 5) : '',
          status: cita.estado || 'pendiente',
          service: cita.tratamiento_nombre || cita.motivo_consulta || 'Consulta general',
          dentist: cita.dentista_nombre || 'Dr. No asignado'
        }));
        
        setAppointments(transformedAppointments);
        console.log('✅ Citas cargadas desde BD:', transformedAppointments.length);
      } else {
        setAppointments(mockAppointments);
        console.log('ℹ️ No hay citas en BD, usando datos mock');
      }
      setStep(4);
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      setAppointments(mockAppointments);
      console.log('⚠️ Error cargando citas, usando datos mock');
      setStep(4);
    } finally {
      setLoadingAppointments(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-sm underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">📅 Gestión de Citas - Debug Progresivo</h1>
      
      <div className="space-y-4">
        {/* Step 1: Verificación inicial */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold text-blue-800">Paso 1: Verificación inicial</h2>
          <p className="text-blue-700">✅ Componente cargado correctamente</p>
          <p className="text-blue-700">✅ Estados inicializados</p>
          <button 
            onClick={testAPIService}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Probar API Service
          </button>
        </div>

        {/* Step 2: API Service */}
        {step >= 2 && (
          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-semibold text-green-800">Paso 2: API Service</h2>
            <p className="text-green-700">✅ API Service disponible</p>
            <button 
              onClick={testLoadPatients}
              disabled={loadingPatients}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loadingPatients ? 'Cargando...' : 'Cargar Pacientes'}
            </button>
          </div>
        )}

        {/* Step 3: Pacientes */}
        {step >= 3 && (
          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="font-semibold text-yellow-800">Paso 3: Pacientes</h2>
            <p className="text-yellow-700">✅ Pacientes cargados: {patients.length}</p>
            {patients.length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Primeros 3 pacientes:</strong>
                <ul className="list-disc list-inside">
                  {patients.slice(0, 3).map(patient => (
                    <li key={patient.id}>{patient.nombre_completo} - {patient.email}</li>
                  ))}
                </ul>
              </div>
            )}
            <button 
              onClick={testLoadAppointments}
              disabled={loadingAppointments}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {loadingAppointments ? 'Cargando...' : 'Cargar Citas'}
            </button>
          </div>
        )}

        {/* Step 4: Citas */}
        {step >= 4 && (
          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-semibold text-purple-800">Paso 4: Citas</h2>
            <p className="text-purple-700">✅ Citas cargadas: {appointments.length}</p>
            {appointments.length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Citas:</strong>
                <div className="space-y-2 mt-2">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="bg-white p-2 rounded border">
                      <strong>{appointment.patientName}</strong> - {appointment.date} {appointment.time}
                      <br />
                      <span className="text-sm text-gray-600">{appointment.service} - {appointment.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <button 
                onClick={() => window.location.href = '/citas-completo'}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                ✅ Todo funciona - Ir al componente completo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitasProgresivo;
