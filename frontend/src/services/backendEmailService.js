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
      // Since the backend doesn't have a specific welcome email endpoint,
      // we'll use the general email service with welcome content
      const emailData = {
        to_email: paciente.email,
        subject: `¡Bienvenido/a a nuestra Clínica Dental, ${paciente.nombre_completo}!`,
        patient_name: paciente.nombre_completo,
        message: `Estimado/a ${paciente.nombre_completo},

¡Bienvenido/a a nuestra clínica dental!

Nos complace enormemente darle la bienvenida a nuestra familia de pacientes. En nuestra clínica dental, nos comprometemos a brindarle la mejor atención y cuidado para su salud bucal.

Sus datos de paciente:
- Nombre: ${paciente.nombre_completo}
- Número de Expediente: ${paciente.numero_expediente || 'Se asignará en su primera visita'}
- Email: ${paciente.email}
${paciente.telefono ? `- Teléfono: ${paciente.telefono}` : ''}

Nuestros servicios incluyen:
• Consultas Generales y Diagnóstico
• Limpieza Dental Profesional
• Tratamientos de Ortodoncia
• Endodoncia (Tratamiento de Conducto)
• Implantes Dentales
• Blanqueamiento Dental
• Cirugía Oral
• Odontología Preventiva

Información de contacto:
📞 Teléfono: +52 55 1234 5678
📧 Email: info@clinicadental.com
📍 Dirección: Av. Principal #123, Col. Centro
⏰ Horarios: Lun-Vie 9:00-18:00, Sáb 9:00-14:00

Si tiene alguna pregunta o necesita agendar una cita, no dude en contactarnos. Estamos aquí para ayudarle a mantener su sonrisa saludable y brillante.

¡Esperamos verle pronto en nuestra clínica!

Saludos cordiales,
Equipo de la Clínica Dental`
      };

      console.log('📧 Enviando email de bienvenida vía backend...', emailData);

      const response = await fetch(`${API_BASE}/emails/send-confirmation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email de bienvenida enviado exitosamente:', result);
      
      return {
        success: true,
        message: 'Email de bienvenida enviado correctamente',
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
      const emailData = {
        to_email: paciente.email,
        subject: `Recordatorio de Cita - ${paciente.nombre_completo}`,
        patient_name: paciente.nombre_completo,
        message: `Estimado/a ${paciente.nombre_completo},

Le recordamos que tiene una cita próxima en nuestra clínica dental.

Por favor confirme su asistencia respondiendo este email o llamando a nuestro consultorio.

Información del paciente:
- Expediente: ${paciente.numero_expediente}
- Teléfono de contacto: ${paciente.telefono || 'No registrado'}

${cita ? `Detalles de la cita:
- Fecha: ${cita.fecha || 'Por confirmar'}
- Hora: ${cita.hora || 'Por confirmar'}
- Tipo: ${cita.tipo || 'Consulta'}
- Motivo: ${cita.motivo || 'Consulta general'}` : ''}

Por favor, llegue 15 minutos antes de su cita para completar cualquier papeleo necesario.

Si necesita cancelar o reprogramar, contáctenos con al menos 24 horas de anticipación.

Gracias por su preferencia.

Saludos cordiales,
Equipo de la Clínica Dental`
      };

      console.log('📧 Enviando email de recordatorio vía backend...', emailData);

      const response = await fetch(`${API_BASE}/emails/send-confirmation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email de recordatorio enviado exitosamente:', result);
      
      return {
        success: true,
        message: 'Email de recordatorio enviado correctamente',
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
      const emailData = {
        to_email: paciente.email,
        subject: subject,
        patient_name: paciente.nombre_completo,
        message: message
      };

      console.log('📧 Enviando email general vía backend...', emailData);

      const response = await fetch(`${API_BASE}/emails/send-confirmation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email general enviado exitosamente:', result);
      
      return {
        success: true,
        message: 'Email enviado correctamente',
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
