/**
 * API Service Simple - Sin autenticación para pruebas
 * Maneja comunicación directa con el backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Función helper para requests simples
async function simpleRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🔄 Haciendo request a: ${url}`, config);
    const response = await fetch(url, config);
    
    console.log(`📡 Respuesta del servidor:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📦 Datos recibidos:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error en request a ${url}:`, error);
    throw error;
  }
}

// API Methods
export const apiSimple = {
  // Obtener pacientes para dropdown
  async getPatientsForDropdown() {
    console.log('🔍 Obteniendo pacientes para dropdown...');
    return await simpleRequest('/pacientes/dropdown/');
  },

  // Obtener dentistas disponibles
  async getDentistas() {
    console.log('👨‍⚕️ Obteniendo dentistas...');
    return await simpleRequest('/dentistas/');
  },

  // Crear nuevo paciente
  async createPatient(patientData) {
    console.log('👤 Creando nuevo paciente...', patientData);
    return await simpleRequest('/pacientes/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  // Obtener lista completa de pacientes
  async getPatients() {
    console.log('👥 Obteniendo lista de pacientes...');
    return await simpleRequest('/pacientes/');
  },

  // Crear cita
  async createAppointment(citaData) {
    console.log('📅 Creando cita...', citaData);
    
    // Mapear tipos de cita del frontend al backend
    const tipoMapping = {
      'consulta': 'consulta',
      'limpieza': 'limpieza',
      'extraccion': 'tratamiento',
      'endodoncia': 'tratamiento',
      'ortodoncia': 'tratamiento',
      'cirugia': 'tratamiento',
      'revision': 'revision',
      'urgencia': 'emergencia'
    };
    
    // Transformar los datos al formato esperado por el backend
    const transformedData = {
      paciente: citaData.paciente,
      dentista: citaData.dentista || "62390260-f0e6-46df-8071-6dc53798faa1", // Dentista por defecto
      fecha_hora: citaData.fecha_hora,
      duracion_estimada: parseInt(citaData.duracion_estimada) || 30,
      tipo_cita: tipoMapping[citaData.motivo] || 'consulta', // Mapear correctamente
      estado: citaData.estado || 'programada',
      motivo_consulta: citaData.motivo_consulta || citaData.notas || 'Consulta general', // Campo requerido
      notas_dentista: citaData.notas || '',
      costo_estimado: citaData.costo ? parseFloat(citaData.costo) : null,
      requiere_confirmacion: true
    };
    
    console.log('📋 Datos transformados para backend:', transformedData);
    
    return await simpleRequest('/citas/', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  },

  // Enviar email de confirmación
  async sendConfirmationEmail(citaId) {
    console.log('📧 Enviando email de confirmación para cita...', citaId);
    return await simpleRequest(`/citas/${citaId}/send_confirmation_email/`, {
      method: 'POST',
    });
  },

  // Confirmar cita y enviar email
  async confirmAppointment(citaId) {
    console.log('✅ Confirmando cita y enviando email...', citaId);
    return await simpleRequest(`/citas/${citaId}/confirm/`, {
      method: 'POST',
    });
  },

  // Crear cita con email automático
  async createAppointmentWithEmail(citaData) {
    console.log('📅📧 Creando cita con email automático...', citaData);
    
    try {
      // Primero crear la cita
      const cita = await this.createAppointment(citaData);
      console.log('✅ Cita creada:', cita);

      // Si se solicita envío de email automático
      if (citaData.enviar_email) {
        try {
          // Confirmar la cita y enviar email automáticamente
          const confirmResult = await this.confirmAppointment(cita.id);
          console.log('✅ Cita confirmada y email enviado:', confirmResult);

          return {
            cita,
            email: confirmResult,
            success: true,
            message: 'Cita creada y email enviado exitosamente'
          };
        } catch (emailError) {
          console.error('❌ Error al confirmar y enviar email:', emailError);
          return {
            cita,
            email: null,
            success: true,
            message: 'Cita creada exitosamente, pero falló el envío de email',
            emailError: emailError.message
          };
        }
      } else {
        return {
          cita,
          email: null,
          success: true,
          message: 'Cita creada exitosamente (sin email)'
        };
      }
    } catch (error) {
      console.error('❌ Error al crear cita:', error);
      throw new Error(`Error al crear cita: ${error.message}`);
    }
  },

  // Obtener lista de citas
  async getCitas() {
    console.log('📋 Obteniendo lista de citas...');
    return await simpleRequest('/citas/');
  },

  // Obtener lista completa de pacientes
  async getPatients() {
    console.log('👥 Obteniendo lista completa de pacientes...');
    return await simpleRequest('/pacientes/');
  },

  // Crear nuevo paciente
  async createPatient(patientData) {
    console.log('👤 Creando nuevo paciente...', patientData);
    return await simpleRequest('/pacientes/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  // Actualizar paciente existente
  async updatePatient(patientId, patientData) {
    console.log('✏️ Actualizando paciente...', patientId, patientData);
    return await simpleRequest(`/pacientes/${patientId}/`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  // Eliminar paciente
  async deletePatient(patientId) {
    console.log('🗑️ Eliminando paciente...', patientId);
    return await simpleRequest(`/pacientes/${patientId}/`, {
      method: 'DELETE',
    });
  },

  // Obtener paciente específico
  async getPatient(patientId) {
    console.log('🔍 Obteniendo paciente específico...', patientId);
    return await simpleRequest(`/pacientes/${patientId}/`);
  },

  // Test de conectividad
  async testConnection() {
    console.log('🧪 Probando conexión con el backend...');
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const isConnected = response.status < 500;
      console.log(`🔗 Conexión: ${isConnected ? 'OK' : 'Error'} (${response.status})`);
      return isConnected;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }
};

export default apiSimple;
