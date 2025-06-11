"""
Email service module for the appointments (citas) app.
Handles all email notifications related to appointments functionality.
"""

import logging
import resend
from typing import Optional, Dict, Any
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from .models import Cita

logger = logging.getLogger(__name__)

# Configure Resend API
resend.api_key = "re_FPCt2fuB_6Fct8cxW19Bct73QqFjZGbEV"


class AppointmentEmailServiceError(Exception):
    """Custom exception for appointment email service errors."""
    pass


class AppointmentEmailService:
    """
    Service class for handling all email notifications in the appointments system.
    
    Features:
    - Appointment confirmation emails
    - Template-based emails with HTML/text versions
    - Integration with Resend API
    - Error handling and logging
    """
    
    def __init__(self):
        self.from_email = "DentalERP <onboarding@resend.dev>"
        self.subject_prefix = getattr(settings, 'EMAIL_SUBJECT_PREFIX', '[Dental ERP] ')
        
    def _send_email_with_resend(
        self, 
        to_email: str,
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Internal method to send email using Resend API.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML version of the message
            text_content: Optional plain text version
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            if not to_email:
                logger.warning("No recipient email provided")
                return False
                
            # Add subject prefix
            full_subject = f"{self.subject_prefix}{subject}"
            
            email_data = {
                "from": self.from_email,
                "to": to_email,
                "subject": full_subject,
                "html": html_content
            }
            
            if text_content:
                email_data["text"] = text_content
            
            # Send email using Resend
            response = resend.Emails.send(email_data)
            
            logger.info(f"Email sent successfully to {to_email}: {subject} - ID: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email} with subject '{subject}': {str(e)}")
            return False
    
    def _render_email_template(
        self, 
        template_name: str, 
        context: Dict[str, Any]
    ) -> tuple[str, str]:
        """
        Render email template to HTML and text versions.
        
        Args:
            template_name: Template name without extension
            context: Template context variables
            
        Returns:
            tuple: (html_content, text_content)
        """
        try:
            # Add common context variables
            context.update({
                'site_name': 'Dental ERP',
                'site_url': 'http://localhost:8000',
                'current_year': timezone.now().year,
                'clinica_telefono': '+52-555-123-4567',
                'clinica_email': 'info@dentalerp.com',
            })
            
            # Render HTML version
            html_content = render_to_string(f'emails/{template_name}.html', context)
            
            # Generate text version from HTML
            text_content = strip_tags(html_content)
            
            return html_content, text_content
            
        except Exception as e:
            logger.error(f"Failed to render email template '{template_name}': {str(e)}")
            raise AppointmentEmailServiceError(f"Template rendering failed: {str(e)}")
    
    def send_appointment_confirmation_email(self, cita: Cita) -> bool:
        """
        Send confirmation email when an appointment is created or confirmed.
        
        Args:
            cita: The appointment object
            
        Returns:
            bool: True if email was sent successfully
        """
        try:
            # Check if patient has email
            if not cita.paciente or not cita.paciente.email:
                logger.warning(f"No patient email found for appointment {cita.numero_cita}")
                return False
            
            # Prepare context
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'tratamiento': cita.tratamiento,
            }
            
            # Render email
            html_content, text_content = self._render_email_template('appointment_confirmation', context)
            
            # Send email
            subject = f"Confirmación de Cita - {cita.numero_cita}"
            return self._send_email_with_resend(
                to_email=cita.paciente.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send appointment confirmation for {cita.numero_cita}: {str(e)}")
            return False
    
    def send_appointment_reminder_email(self, cita: Cita) -> bool:
        """
        Send reminder email for upcoming appointment.
        
        Args:
            cita: The appointment object
            
        Returns:
            bool: True if email was sent successfully
        """
        try:
            if not cita.paciente or not cita.paciente.email:
                logger.warning(f"No patient email found for appointment reminder {cita.numero_cita}")
                return False
            
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'is_reminder': True,
            }
            
            html_content, text_content = self._render_email_template('appointment_confirmation', context)
            
            subject = f"Recordatorio de Cita - {cita.numero_cita}"
            return self._send_email_with_resend(
                to_email=cita.paciente.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send appointment reminder for {cita.numero_cita}: {str(e)}")
            return False
    
    def send_appointment_cancellation_email(self, cita: Cita, motivo: str = '') -> bool:
        """
        Send cancellation email when an appointment is cancelled.
        
        Args:
            cita: The cancelled appointment object
            motivo: Reason for cancellation
            
        Returns:
            bool: True if email was sent successfully
        """
        try:
            if not cita.paciente or not cita.paciente.email:
                logger.warning(f"No patient email found for appointment cancellation {cita.numero_cita}")
                return False
            
            context = {
                'cita': cita,
                'paciente': cita.paciente,
                'dentista': cita.dentista,
                'motivo_cancelacion': motivo,
                'is_cancellation': True,
            }
            
            html_content, text_content = self._render_email_template('appointment_confirmation', context)
            
            subject = f"Cita Cancelada - {cita.numero_cita}"
            return self._send_email_with_resend(
                to_email=cita.paciente.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send appointment cancellation for {cita.numero_cita}: {str(e)}")
            return False
