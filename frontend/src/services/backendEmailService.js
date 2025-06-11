/**
 * Backend Email Service
 * Uses backend API endpoints to send emails (no CORS issues)
 */

const API_BASE = 'http://localhost:8000/api';

class BackendEmailService {
  
  /**
   * Envía un email de bienvenida usando el backend
   */
  async sendWelcomeEmail(paciente) {
    try {
      console.log('📧 Enviando email de bienvenida vía backend...', paciente);

      const response = await fetch(`${API_BASE}/emails/send-welcome/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: paciente.email,
          nombre_completo: paciente.nombre_completo,
          telefono: paciente.telefono || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email de bienvenida enviado exitosamente:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'Email de bienvenida enviado correctamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía un email de recordatorio usando el backend
   */
  async sendReminderEmail(paciente, cita = null) {
    try {
      console.log('📧 Enviando email de recordatorio vía backend...', paciente);

      const requestBody = {
        email: paciente.email,
        nombre_completo: paciente.nombre_completo,
        telefono: paciente.telefono || ''
      };

      // Agregar información de la cita si está disponible
      if (cita) {
        requestBody.cita = {
          fecha_hora: cita.fecha_hora,
          tratamiento: cita.tratamiento_descripcion || cita.tratamiento,
          dentista: cita.dentista_nombre || cita.dentista
        };
      }

      const response = await fetch(`${API_BASE}/emails/send-reminder/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email de recordatorio enviado exitosamente:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'Email de recordatorio enviado correctamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error enviando email de recordatorio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía un email general usando el backend
   */
  async sendGeneralEmail(paciente, subject, message) {
    try {
      console.log('📧 Enviando email general vía backend...', paciente);

      const response = await fetch(`${API_BASE}/emails/send-general/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: paciente.email,
          nombre_completo: paciente.nombre_completo,
          telefono: paciente.telefono || '',
          subject: subject,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email general enviado exitosamente:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'Email enviado correctamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error enviando email general:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envía email usando una cita existente (para confirmaciones)
   */
  async sendAppointmentEmail(citaId) {
    try {
      console.log('📧 Enviando email de confirmación de cita vía backend...', citaId);

      const response = await fetch(`${API_BASE}/citas/${citaId}/send_confirmation_email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email de cita enviado exitosamente:', result);
      
      return {
        success: result.email_enviado || true,
        message: result.message || 'Email enviado correctamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error enviando email de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Crear instancia única del servicio
const backendEmailService = new BackendEmailService();

export default backendEmailService;
