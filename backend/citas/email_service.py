"""
Email service module for appointments (citas).
Handles email notifications for appointment-related events.
"""

import logging
from typing import Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone

from .models import Cita

logger = logging.getLogger(__name__)


class AppointmentEmailServiceError(Exception):
    """Custom exception for appointment email service errors."""
    pass


class AppointmentEmailService:
    """
    Service class for handling appointment-related email notifications.
    
    Features:
    - Appointment confirmation emails
    - Template-based emails with HTML/text versions
    - Comprehensive error handling and logging
    """
    
    def __init__(self):
        self.from_email = getattr(settings, 'NOTIFICATION_EMAIL_FROM', settings.DEFAULT_FROM_EMAIL)
        self.subject_prefix = getattr(settings, 'EMAIL_SUBJECT_PREFIX', '[Dental ERP] ')
        
    def _send_email(
        self, 
        subject: str, 
        recipient_email: str,
        html_content: str,
        text_content: str,
        fail_silently: bool = False
    ) -> bool:
        """
        Send an email with both HTML and text versions.
        
        Args:
            subject: Email subject line
            recipient_email: Recipient's email address
            html_content: HTML version of the email
            text_content: Plain text version of the email
            fail_silently: Whether to suppress exceptions
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Create the email message
            msg = EmailMultiAlternatives(
                subject=f"{self.subject_prefix}{subject}",
                body=text_content,
                from_email=self.from_email,
                to=[recipient_email]
            )
            
            # Attach HTML version
            msg.attach_alternative(html_content, "text/html")
            
            # Send the email
            result = msg.send()
            
            if result == 1:
                logger.info(f"Appointment email sent successfully to {recipient_email}")
                return True
            else:
                logger.warning(f"Failed to send appointment email to {recipient_email}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending appointment email to {recipient_email}: {str(e)}")
            if not fail_silently:
                raise AppointmentEmailServiceError(f"Failed to send email: {str(e)}")
            return False
    
    def send_appointment_confirmation_email(self, cita: Cita) -> bool:
        """
        Send appointment confirmation email to the patient.
        
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
            
            # Prepare context for email templates
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'fecha_hora': cita.fecha_hora,
                'numero_cita': cita.numero_cita,
                'tipo_cita': cita.get_tipo_cita_display(),
                'motivo_consulta': cita.motivo_consulta,
                'fecha_confirmacion': timezone.now(),
            }
            
            # Render email templates
            html_content = render_to_string('citas/emails/appointment_confirmation.html', context)
            text_content = render_to_string('citas/emails/appointment_confirmation.txt', context)
            
            # Email subject
            subject = f"Confirmación de Cita - {cita.numero_cita}"
            
            # Send the email
            return self._send_email(
                subject=subject,
                recipient_email=cita.paciente.email,
                html_content=html_content,
                text_content=text_content
            )
            
        except Exception as e:
            logger.error(f"Error sending appointment confirmation email for {cita.numero_cita}: {str(e)}")
            raise AppointmentEmailServiceError(f"Failed to send confirmation email: {str(e)}")
    
    def send_appointment_reminder_email(self, cita: Cita) -> bool:
        """
        Send appointment reminder email to the patient.
        
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
            
            # Prepare context for email templates
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'fecha_hora': cita.fecha_hora,
                'numero_cita': cita.numero_cita,
                'tipo_cita': cita.get_tipo_cita_display(),
                'motivo_consulta': cita.motivo_consulta,
            }
            
            # Render email templates
            html_content = render_to_string('citas/emails/appointment_reminder.html', context)
            text_content = render_to_string('citas/emails/appointment_reminder.txt', context)
            
            # Email subject
            subject = f"Recordatorio de Cita - {cita.numero_cita}"
            
            # Send the email
            return self._send_email(
                subject=subject,
                recipient_email=cita.paciente.email,
                html_content=html_content,
                text_content=text_content
            )
            
        except Exception as e:
            logger.error(f"Error sending appointment reminder email for {cita.numero_cita}: {str(e)}")
            raise AppointmentEmailServiceError(f"Failed to send reminder email: {str(e)}")


# Convenience function for easy usage
def send_appointment_confirmation_email(cita: Cita) -> bool:
    """
    Convenience function to send appointment confirmation email.
    
    Args:
        cita: The appointment object
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    service = AppointmentEmailService()
    return service.send_appointment_confirmation_email(cita)


def send_appointment_reminder_email(cita: Cita) -> bool:
    """
    Convenience function to send appointment reminder email.
    
    Args:
        cita: The appointment object
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    service = AppointmentEmailService()
    return service.send_appointment_reminder_email(cita)
