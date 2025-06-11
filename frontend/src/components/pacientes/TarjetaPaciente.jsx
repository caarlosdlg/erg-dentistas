import React, { useState } from 'react';
import emailService from '../../services/emailService';

const TarjetaPaciente = ({ paciente, onVerExpediente, onDeletePaciente, onSendEmail }) => {
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const {
    id,
    nombre_completo,
    numero_expediente,
    email,
    telefono,
    fecha_nacimiento,
    activo,
    alergias,
    enfermedades_cronicas,
    dentista_asignado_info
  } = paciente;

  // Calculate age
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

  const edad = calculateAge(fecha_nacimiento);
  const tieneAlertas = alergias || enfermedades_cronicas;

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al paciente ${nombre_completo}? Esta acción no se puede deshacer.`)) {
      try {
        await onDeletePaciente(id);
      } catch (error) {
        alert('Error al eliminar el paciente. Por favor intenta de nuevo.');
        console.error('Error deleting patient:', error);
      }
    }
  };

  const handleSendEmail = () => {
    if (!email) {
      alert('Este paciente no tiene email registrado');
      return;
    }
    
    if (onSendEmail) {
      onSendEmail(paciente);
    } else {
      // Usar el nuevo servicio de emails
      try {
        emailService.enviarEmailPersonalizado(paciente);
      } catch (error) {
        alert('Error al preparar el email: ' + error.message);
      }
    }
  };

  const handleEmailOption = async (tipo) => {
    setShowEmailOptions(false);
    
    if (!email) {
      alert('Este paciente no tiene email registrado');
      return;
    }

    try {
      switch (tipo) {
        case 'general':
          await emailService.enviarEmailPersonalizado(paciente);
          break;
        case 'recordatorio':
          await emailService.enviarRecordatorioCita(paciente);
          break;
        case 'seguimiento':
          await emailService.enviarSeguimientoMedico(paciente);
          break;
        case 'manual':
          emailService.abrirEmailManual(email, nombre_completo);
          break;
        default:
          await emailService.enviarEmailPersonalizado(paciente);
      }
    } catch (error) {
      alert('Error al preparar el email: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {nombre_completo}
              </h3>
              {!activo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactivo
                </span>
              )}
              {tieneAlertas && (
                <div className="relative group">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Tiene alertas médicas
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-mono">{numero_expediente}</p>
          </div>
          
          {/* Patient Avatar */}
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-6 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
          </svg>
          <span>{edad} años</span>
        </div>

        {email && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{email}</span>
          </div>
        )}

        {telefono && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{telefono}</span>
          </div>
        )}

        {dentista_asignado_info && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Dr. {dentista_asignado_info.nombre_completo}</span>
          </div>
        )}
      </div>

      {/* Medical Alerts */}
      {tieneAlertas && (
        <div className="px-6 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h4 className="text-xs font-medium text-yellow-800">Alertas Médicas</h4>
                <div className="mt-1 text-xs text-yellow-700">
                  {alergias && <p>• Alergias: {alergias}</p>}
                  {enfermedades_cronicas && <p>• Enfermedades crónicas: {enfermedades_cronicas}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex gap-2">
          <button
            onClick={() => onVerExpediente(id)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ver Expediente
          </button>
          {email && (
            <div className="relative">
              <button
                onClick={() => setShowEmailOptions(!showEmailOptions)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                title={`Enviar email a ${email}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown de opciones de email */}
              {showEmailOptions && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleEmailOption('general')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email General
                    </button>
                    <button
                      onClick={() => handleEmailOption('recordatorio')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recordatorio de Cita
                    </button>
                    <button
                      onClick={() => handleEmailOption('seguimiento')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Seguimiento Médico
                    </button>
                    <button
                      onClick={() => handleEmailOption('manual')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Email Personalizado
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Borrar
          </button>
        </div>

        {/* Overlay para cerrar dropdown */}
        {showEmailOptions && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowEmailOptions(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TarjetaPaciente;
