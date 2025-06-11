/**
 * Servicio de Emails usando Resend API
 * Para envío directo de emails a pacientes
 */

const RESEND_API_KEY = "re_YRUU68B1_HyGarVc5YRKFsPcrbrVF1WQ4";
const RESEND_API_URL = "https://api.resend.com/emails";

class EmailService {
  
  /**
   * Envía un email de bienvenida al paciente
   */
  async sendWelcomeEmail(paciente) {
    const emailData = {
      from: "Clínica Dental ERP <onboarding@resend.dev>",
      to: paciente.email,
      subject: `¡Bienvenido/a a nuestra Clínica Dental, ${paciente.nombre_completo}!`,
      html: this.generateWelcomeEmailHTML(paciente)
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Envía un email de recordatorio de cita
   */
  async sendAppointmentReminderEmail(paciente, cita) {
    const emailData = {
      from: "Clínica Dental ERP <onboarding@resend.dev>",
      to: paciente.email,
      subject: `Recordatorio de Cita - ${paciente.nombre_completo}`,
      html: this.generateReminderEmailHTML(paciente, cita)
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Envía un email informativo general
   */
  async sendGeneralInfoEmail(paciente, subject, message) {
    const emailData = {
      from: "Clínica Dental ERP <onboarding@resend.dev>",
      to: paciente.email,
      subject: subject,
      html: this.generateGeneralEmailHTML(paciente, subject, message)
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Función base para enviar emails usando Resend API
   */
  async sendEmail(emailData) {
    try {
      console.log('📧 Enviando email:', emailData);
      
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log('✅ Email enviado exitosamente:', result);
      
      return {
        success: true,
        id: result.id,
        message: 'Email enviado correctamente'
      };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Genera HTML para email de bienvenida
   */
  generateWelcomeEmailHTML(paciente) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a nuestra Clínica Dental!</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            .content { 
                padding: 40px 30px; 
            }
            .welcome-message {
                background: #f8f9ff;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
            }
            .patient-info {
                background: #f0f9ff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .patient-info h3 {
                margin-top: 0;
                color: #1e40af;
            }
            .services-list {
                background: #ecfdf5;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .services-list h3 {
                margin-top: 0;
                color: #065f46;
            }
            .services-list ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .services-list li {
                margin: 5px 0;
            }
            .contact-info {
                background: #fef3c7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer { 
                text-align: center; 
                padding: 30px;
                background: #f8f9fa;
                color: #666;
                font-size: 14px;
            }
            .emoji {
                font-size: 24px;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🦷 Clínica Dental ERP</h1>
                <p>Su salud dental es nuestra prioridad</p>
            </div>
            
            <div class="content">
                <div class="welcome-message">
                    <h2>¡Bienvenido/a ${paciente.nombre_completo}! 🎉</h2>
                    <p>Nos complace enormemente darle la bienvenida a nuestra familia de pacientes. En nuestra clínica dental, nos comprometemos a brindarle la mejor atención y cuidado para su salud bucal.</p>
                </div>

                <div class="patient-info">
                    <h3>📋 Sus Datos de Paciente</h3>
                    <p><strong>Nombre:</strong> ${paciente.nombre_completo}</p>
                    <p><strong>Número de Expediente:</strong> ${paciente.numero_expediente || 'Se asignará en su primera visita'}</p>
                    <p><strong>Email:</strong> ${paciente.email}</p>
                    ${paciente.telefono ? `<p><strong>Teléfono:</strong> ${paciente.telefono}</p>` : ''}
                </div>

                <div class="services-list">
                    <h3>🦷 Nuestros Servicios</h3>
                    <ul>
                        <li>Consultas Generales y Diagnóstico</li>
                        <li>Limpieza Dental Profesional</li>
                        <li>Tratamientos de Ortodoncia</li>
                        <li>Endodoncia (Tratamiento de Conducto)</li>
                        <li>Implantes Dentales</li>
                        <li>Blanqueamiento Dental</li>
                        <li>Cirugía Oral</li>
                        <li>Odontología Preventiva</li>
                    </ul>
                </div>

                <div class="contact-info">
                    <h3>📞 Información de Contacto</h3>
                    <p><strong>Teléfono:</strong> +52 55 1234 5678</p>
                    <p><strong>Email:</strong> info@clinicadental.com</p>
                    <p><strong>Dirección:</strong> Av. Principal #123, Col. Centro</p>
                    <p><strong>Horarios:</strong> Lun-Vie 9:00-18:00, Sáb 9:00-14:00</p>
                </div>

                <div style="text-align: center;">
                    <a href="#" class="button">Agendar Mi Primera Cita</a>
                </div>

                <p>Si tiene alguna pregunta o necesita agendar una cita, no dude en contactarnos. Estamos aquí para ayudarle a mantener su sonrisa saludable y brillante.</p>
                
                <p><strong>¡Esperamos verle pronto en nuestra clínica!</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2025 Clínica Dental ERP - Sistema de Gestión Dental</p>
                <p>Este email fue enviado automáticamente. Por favor no responder a esta dirección.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
   
  async enviarRecordatorioCita(paciente) {
    const asunto = `Recordatorio de Cita - ${paciente.nombre_completo}`;
    const mensaje = `Estimado/a ${paciente.nombre_completo},

Le recordamos que tiene una cita próxima en nuestra clínica dental.

Por favor confirme su asistencia respondiendo este email o llamando a nuestro consultorio.

Información del paciente:
- Expediente: ${paciente.numero_expediente}
- Teléfono de contacto: ${paciente.telefono || 'No registrado'}

Gracias por su preferencia.

Saludos cordiales,
Equipo de la Clínica Dental`;

    return this.enviarEmailPersonalizado(paciente, asunto, mensaje);
  }

  /**
   * Envía un email de seguimiento médico
   * @param {Object} paciente - Objeto del paciente
   * @returns {Promise<boolean>}
   */
  async enviarSeguimientoMedico(paciente) {
    const asunto = `Seguimiento Médico - ${paciente.nombre_completo}`;
    const mensaje = `Estimado/a ${paciente.nombre_completo},

Esperamos que se encuentre bien después de su última visita.

Nos gustaría conocer cómo se siente y si tiene alguna molestia o duda sobre su tratamiento.

Si necesita programar una cita de seguimiento o tiene alguna consulta, no dude en contactarnos.

Información del paciente:
- Expediente: ${paciente.numero_expediente}
- Email: ${paciente.email}
- Teléfono: ${paciente.telefono || 'No registrado'}

Estamos aquí para ayudarle.

Saludos cordiales,
Equipo de la Clínica Dental`;

    return this.enviarEmailPersonalizado(paciente, asunto, mensaje);
  }

  /**
   * Abre el cliente de email para envío manual completamente personalizado
   * @param {string} email - Dirección de email
   * @param {string} nombre - Nombre del destinatario (opcional)
   */
  abrirEmailManual(email, nombre = '') {
    if (!email) {
      throw new Error('Email requerido');
    }

    const asunto = nombre ? `Comunicación para ${nombre}` : 'Comunicación desde Clínica Dental';
    const mensaje = nombre ? `Estimado/a ${nombre},\n\n` : 'Estimado/a paciente,\n\n';

    const mailto = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
    window.open(mailto);
  }

  /**
   * Valida si un email es válido
   * @param {string} email 
   * @returns {boolean}
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Obtiene estadísticas de emails de pacientes
   * @param {Array} pacientes - Lista de pacientes
   * @returns {Object} - Estadísticas
   */
  obtenerEstadisticasEmail(pacientes) {
    const total = pacientes.length;
    const conEmail = pacientes.filter(p => p.email && this.validarEmail(p.email)).length;
    const sinEmail = total - conEmail;
    const porcentajeConEmail = total > 0 ? Math.round((conEmail / total) * 100) : 0;

    return {
      total,
      conEmail,
      sinEmail,
      porcentajeConEmail
    };
  }
}

// Crear instancia única del servicio
const emailService = new EmailService();

export default emailService;
