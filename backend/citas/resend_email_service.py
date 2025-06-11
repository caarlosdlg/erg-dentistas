"""
Resend Email Service for appointments (citas).
Uses Resend API for reliable email delivery.
"""

import logging
from typing import Optional
import resend
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Cita

logger = logging.getLogger(__name__)


class ResendEmailServiceError(Exception):
    """Custom exception for Resend email service errors."""
    pass


class ResendEmailService:
    """
    Service class for handling appointment-related email notifications using Resend.
    
    Features:
    - Modern email delivery via Resend API
    - HTML email templates with professional design
    - Comprehensive error handling and logging
    - Better deliverability than traditional SMTP
    """
    
    def __init__(self):
        # Configure Resend API key
        self.api_key = getattr(settings, 'RESEND_API_KEY', 're_FPCt2fuB_6Fct8cxW19Bct73QqFjZGbEV')
        resend.api_key = self.api_key
        
        self.from_email = getattr(settings, 'RESEND_FROM_EMAIL', 'onboarding@resend.dev')
        self.subject_prefix = getattr(settings, 'EMAIL_SUBJECT_PREFIX', '[Dental ERP] ')
        
    def _send_email(
        self, 
        subject: str, 
        recipient_email: str,
        html_content: str,
        fail_silently: bool = False
    ) -> bool:
        """
        Send an email using Resend API.
        
        Args:
            subject: Email subject line
            recipient_email: Recipient's email address
            html_content: HTML content of the email
            fail_silently: Whether to suppress exceptions
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Send email using Resend
            r = resend.Emails.send({
                "from": self.from_email,
                "to": [recipient_email],
                "subject": f"{self.subject_prefix}{subject}",
                "html": html_content
            })
            
            if r and r.get('id'):
                logger.info(f"Resend email sent successfully to {recipient_email}, ID: {r.get('id')}")
                return True
            else:
                logger.warning(f"Failed to send Resend email to {recipient_email}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending Resend email to {recipient_email}: {str(e)}")
            if not fail_silently:
                raise ResendEmailServiceError(f"Failed to send email via Resend: {str(e)}")
            return False
    
    def send_appointment_confirmation_email(self, cita: Cita) -> bool:
        """
        Send appointment confirmation email to the patient using Resend.
        
        Args:
            cita: The appointment object
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Validate that the appointment has a patient with email
            if not cita.paciente or not cita.paciente.email:
                logger.warning(f"No email address found for appointment {cita.numero_cita}")
                return False
            
            # Prepare context for email template
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'fecha_hora': cita.fecha_hora,
                'numero_cita': cita.numero_cita,
                'tipo_cita': cita.get_tipo_cita_display(),
                'motivo_consulta': cita.motivo_consulta,
                'fecha_confirmacion': timezone.now(),
                'clinica_nombre': 'Clínica Dental ERP',
                'clinica_telefono': '+52 55 1234 5678',
                'clinica_direccion': 'Av. Reforma 123, Ciudad de México',
            }
            
            # Render email template
            html_content = render_to_string('citas/emails/resend_appointment_confirmation.html', context)
            
            # Email subject
            subject = f"Confirmación de Cita - {cita.numero_cita}"
            
            # Send the email
            return self._send_email(
                subject=subject,
                recipient_email=cita.paciente.email,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Error sending appointment confirmation email for {cita.numero_cita}: {str(e)}")
            raise ResendEmailServiceError(f"Failed to send confirmation email: {str(e)}")
    
    def send_appointment_reminder_email(self, cita: Cita) -> bool:
        """
        Send appointment reminder email to the patient using Resend.
        
        Args:
            cita: The appointment object
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Validate that the appointment has a patient with email
            if not cita.paciente or not cita.paciente.email:
                logger.warning(f"No email address found for appointment {cita.numero_cita}")
                return False
            
            # Prepare context for email template
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'fecha_hora': cita.fecha_hora,
                'numero_cita': cita.numero_cita,
                'tipo_cita': cita.get_tipo_cita_display(),
                'motivo_consulta': cita.motivo_consulta,
                'clinica_nombre': 'Clínica Dental ERP',
                'clinica_telefono': '+52 55 1234 5678',
                'clinica_direccion': 'Av. Reforma 123, Ciudad de México',
            }
            
            # Render email template
            html_content = render_to_string('citas/emails/resend_appointment_reminder.html', context)
            
            # Email subject
            subject = f"Recordatorio de Cita - {cita.numero_cita}"
            
            # Send the email
            return self._send_email(
                subject=subject,
                recipient_email=cita.paciente.email,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Error sending appointment reminder email for {cita.numero_cita}: {str(e)}")
            raise ResendEmailServiceError(f"Failed to send reminder email: {str(e)}")
    
    def test_connection(self, test_email: str) -> bool:
        """
        Test the Resend connection by sending a test email.
        
        Args:
            test_email: Email address to send test email to
            
        Returns:
            bool: True if test email was sent successfully
        """
        try:
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Test Email - DentalERP</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 28px;">🧪 Test Email</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">DentalERP - Resend Integration</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #2c5282; margin-top: 0;">¡Conexión Exitosa! 🎉</h2>
                    <p style="color: #4a5568; line-height: 1.6;">
                        Si recibes este email, significa que la integración con Resend está funcionando correctamente.
                    </p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #48bb78;">
                        <strong style="color: #22543d;">✅ Configuración Correcta:</strong>
                        <ul style="margin: 10px 0 0 0; color: #4a5568;">
                            <li>Resend API Key configurada</li>
                            <li>Templates HTML funcionando</li>
                            <li>Emails de confirmación listos</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: #e6fffa; padding: 20px; border-radius: 8px; border-left: 4px solid #38b2ac;">
                    <h3 style="color: #234e52; margin-top: 0;">🚀 Próximos Pasos:</h3>
                    <ul style="color: #285e61; line-height: 1.6;">
                        <li>Los emails de confirmación de citas ya funcionan</li>
                        <li>Puedes confirmar citas desde el frontend</li>
                        <li>Los pacientes recibirán emails automáticamente</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
                    <p><strong>DentalERP</strong> - Sistema de Gestión Dental</p>
                    <p>Email enviado con ❤️ usando Resend</p>
                </div>
            </body>
            </html>
            """
            
            return self._send_email(
                subject="Test de Conexión Resend",
                recipient_email=test_email,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Error testing Resend connection: {str(e)}")
            return False


# Convenience functions for easy usage
def send_appointment_confirmation_email_resend(cita: Cita) -> bool:
    """
    Convenience function to send appointment confirmation email via Resend.
    
    Args:
        cita: The appointment object
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    service = ResendEmailService()
    return service.send_appointment_confirmation_email(cita)


def send_appointment_reminder_email_resend(cita: Cita) -> bool:
    """
    Convenience function to send appointment reminder email via Resend.
    
    Args:
        cita: The appointment object
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    service = ResendEmailService()
    return service.send_appointment_reminder_email(cita)


def test_resend_connection(test_email: str) -> bool:
    """
    Convenience function to test Resend connection.
    
    Args:
        test_email: Email address to send test email to
        
    Returns:
        bool: True if test email was sent successfully
    """
    service = ResendEmailService()
    return service.test_connection(test_email)
