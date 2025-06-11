from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .email_service import GeneralEmailService
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_welcome_email(request):
    """
    Vista para enviar email de bienvenida a un paciente.
    """
    try:
        data = request.data
        
        # Validar datos requeridos
        required_fields = ['email', 'nombre_completo']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'El campo {field} es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Preparar datos del paciente
        paciente = {
            'email': data.get('email'),
            'nombre_completo': data.get('nombre_completo'),
            'telefono': data.get('telefono', ''),
        }
        
        # Enviar email
        email_service = GeneralEmailService()
        email_enviado = email_service.send_welcome_email(paciente)
        
        if email_enviado:
            logger.info(f"Welcome email sent successfully to {paciente['email']}")
            return Response({
                'success': True,
                'message': 'Email de bienvenida enviado exitosamente',
                'email_enviado': True,
                'destinatario': paciente['email'],
                'note': 'En modo desarrollo, algunos emails pueden estar limitados por Resend. En producción con dominio verificado, todos los emails funcionarán normalmente.'
            })
        else:
            return Response({
                'success': False,
                'message': 'No se pudo enviar el email',
                'email_enviado': False,
                'error': 'Error en el servicio de email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        return Response({
            'error': f'Error al enviar email: {str(e)}',
            'success': False,
            'email_enviado': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_reminder_email(request):
    """
    Vista para enviar email de recordatorio a un paciente.
    """
    try:
        data = request.data
        
        # Validar datos requeridos
        required_fields = ['email', 'nombre_completo']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'El campo {field} es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Preparar datos del paciente
        paciente = {
            'email': data.get('email'),
            'nombre_completo': data.get('nombre_completo'),
            'telefono': data.get('telefono', ''),
        }
        
        # Preparar datos de la cita (opcional)
        cita = data.get('cita', None)
        
        # Enviar email
        email_service = GeneralEmailService()
        email_enviado = email_service.send_reminder_email(paciente, cita)
        
        if email_enviado:
            logger.info(f"Reminder email sent successfully to {paciente['email']}")
            return Response({
                'success': True,
                'message': 'Email de recordatorio enviado exitosamente',
                'email_enviado': True,
                'destinatario': paciente['email']
            })
        else:
            return Response({
                'success': False,
                'message': 'No se pudo enviar el email',
                'email_enviado': False,
                'error': 'Error en el servicio de email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error sending reminder email: {str(e)}")
        return Response({
            'error': f'Error al enviar email: {str(e)}',
            'success': False,
            'email_enviado': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_general_email(request):
    """
    Vista para enviar email general a un paciente.
    """
    try:
        data = request.data
        
        # Validar datos requeridos
        required_fields = ['email', 'nombre_completo', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'El campo {field} es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Preparar datos del paciente
        paciente = {
            'email': data.get('email'),
            'nombre_completo': data.get('nombre_completo'),
            'telefono': data.get('telefono', ''),
        }
        
        subject = data.get('subject')
        message = data.get('message')
        
        # Enviar email
        email_service = GeneralEmailService()
        email_enviado = email_service.send_general_email(paciente, subject, message)
        
        if email_enviado:
            logger.info(f"General email sent successfully to {paciente['email']}")
            return Response({
                'success': True,
                'message': 'Email enviado exitosamente',
                'email_enviado': True,
                'destinatario': paciente['email']
            })
        else:
            return Response({
                'success': False,
                'message': 'No se pudo enviar el email',
                'email_enviado': False,
                'error': 'Error en el servicio de email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error sending general email: {str(e)}")
        return Response({
            'error': f'Error al enviar email: {str(e)}',
            'success': False,
            'email_enviado': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
