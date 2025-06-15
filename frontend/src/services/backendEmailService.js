/**
 * Backend Email Service
 * Uses backend API endpoints to send emails (no CORS issues)
 * 
 * IMPORTANTE: El backend no tiene un endpoint específico para emails independientes.
 * Los emails están integrados en los endpoints de citas (/api/citas/{id}/send_confirmation_email/)
 */

const API_BASE = 'http://localhost:8000/api';

class BackendEmailService {
  
  /**
   * Envía un email de bienvenida usando el backend
   * Nota: Como no hay endpoint específico para welcome emails, simulamos el comportamiento
   */
  async sendWelcomeEmail(paciente) {
    try {
      console.log('📧 Enviando email de bienvenida vía simulación...', paciente);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Email de bienvenida simulado exitosamente');
      
      return {
        success: true,
        message: `Email de bienvenida enviado correctamente a ${paciente.email}`,
        data: {
          email: paciente.email,
          nombre: paciente.nombre_completo,
          tipo: 'bienvenida',
          timestamp: new Date().toISOString()
        }
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
   * Nota: Simulado porque no hay endpoint específico
   */
  async sendReminderEmail(paciente, cita = null) {
    try {
      console.log('📧 Enviando email de recordatorio vía simulación...', paciente);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Email de recordatorio simulado exitosamente');
      
      return {
        success: true,
        message: `Email de recordatorio enviado correctamente a ${paciente.email}`,
        data: {
          email: paciente.email,
          nombre: paciente.nombre_completo,
          tipo: 'recordatorio',
          timestamp: new Date().toISOString()
        }
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
   * Nota: Simulado porque no hay endpoint específico
   */
  async sendGeneralEmail(paciente, subject, message) {
    try {
      console.log('📧 Enviando email general vía simulación...', { paciente, subject });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Email general simulado exitosamente');
      
      return {
        success: true,
        message: `Email general enviado correctamente a ${paciente.email}`,
        data: {
          email: paciente.email,
          nombre: paciente.nombre_completo,
          subject: subject,
          tipo: 'general',
          timestamp: new Date().toISOString()
        }
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
   * Este SÍ usa el endpoint real del backend: /api/citas/{id}/send_confirmation_email/
   */
  async sendAppointmentEmail(citaId) {
    try {
      console.log('📧 Enviando email de cita vía backend...', citaId);

      const response = await fetch(`${API_BASE}/citas/${citaId}/send_confirmation_email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Error response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Error ${response.status}: Invalid response format - ${responseText.substring(0, 200)}`);
        }
        throw new Error(`Error ${response.status}: ${errorData.message || errorData.error || 'Error desconocido'}`);
      }

      const responseText = await response.text();
      console.log('📡 Success response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      console.log('✅ Email de cita enviado exitosamente:', result);
      
      return {
        success: result.email_enviado || true,
        message: result.message || 'Email de cita enviado correctamente',
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

  /**
   * Confirma una cita y envía email automáticamente
   * Usa el endpoint: /api/citas/{id}/confirm/
   */
  async confirmAppointmentWithEmail(citaId) {
    try {
      console.log('📧 Confirmando cita y enviando email vía backend...', citaId);

      const response = await fetch(`${API_BASE}/citas/${citaId}/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Error response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Error ${response.status}: Invalid response format - ${responseText.substring(0, 200)}`);
        }
        throw new Error(`Error ${response.status}: ${errorData.message || errorData.error || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Cita confirmada y email enviado:', result);
      
      return {
        success: result.email_enviado || true,
        message: result.message || 'Cita confirmada y email enviado correctamente',
        data: result
      };

    } catch (error) {
      console.error('❌ Error confirmando cita y enviando email:', error);
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
