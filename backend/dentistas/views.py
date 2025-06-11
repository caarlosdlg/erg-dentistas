from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import transaction
from .models import Dentista, Especialidad
from .serializers import DentistaRegistroSerializer, DentistaSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def registro_dentista(request):
    """
    Vista para registro de nuevos dentistas
    """
    try:
        with transaction.atomic():
            # Extraer datos del request
            data = request.data
            
            # Validar datos requeridos
            required_fields = ['email', 'password', 'first_name', 'last_name', 'cedula_profesional', 
                             'telefono', 'fecha_nacimiento', 'universidad', 'anio_graduacion']
            
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'error': f'El campo {field} es requerido'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Verificar que el email no esté en uso
            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'error': 'Este email ya está registrado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar que la cédula profesional no esté en uso
            if Dentista.objects.filter(cedula_profesional=data['cedula_profesional']).exists():
                return Response(
                    {'error': 'Esta cédula profesional ya está registrada'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear usuario
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_active=True
            )
            
            # Crear perfil de dentista
            dentista = Dentista.objects.create(
                user=user,
                cedula_profesional=data['cedula_profesional'],
                telefono=data['telefono'],
                fecha_nacimiento=data['fecha_nacimiento'],
                universidad=data['universidad'],
                anio_graduacion=int(data['anio_graduacion']),
                direccion=data.get('direccion', ''),
                fecha_ingreso=data.get('fecha_ingreso', '2025-06-11'),
                horario_inicio=data.get('horario_inicio', '08:00'),
                horario_fin=data.get('horario_fin', '17:00'),
                dias_laborales=data.get('dias_laborales', '12345'),  # Lun-Vie por defecto
                biografia=data.get('biografia', ''),
                activo=True
            )
            
            # Agregar especialidades si se proporcionan
            if data.get('especialidades'):
                especialidades_ids = data['especialidades']
                especialidades = Especialidad.objects.filter(id__in=especialidades_ids)
                dentista.especialidades.set(especialidades)
            
            # Generar tokens JWT para autenticación automática
            refresh = RefreshToken.for_user(user)
            
            # Preparar datos del dentista para la respuesta
            dentista_data = {
                'id': str(dentista.id),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'cedula_profesional': dentista.cedula_profesional,
                'telefono': dentista.telefono,
                'universidad': dentista.universidad,
                'anio_graduacion': dentista.anio_graduacion,
                'fecha_registro': dentista.fecha_registro.isoformat(),
                'activo': dentista.activo
            }
            
            logger.info(f"Nuevo dentista registrado: {user.email}")
            
            return Response({
                'success': True,
                'message': 'Dentista registrado exitosamente',
                'dentista': dentista_data,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'dentist'
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Error en registro de dentista: {e}")
        return Response(
            {'error': 'Error interno del servidor', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_especialidades(request):
    """
    Vista para listar todas las especialidades disponibles
    """
    try:
        especialidades = Especialidad.objects.filter(activo=True).order_by('nombre')
        data = [
            {
                'id': str(esp.id),
                'nombre': esp.nombre,
                'descripcion': esp.descripcion
            }
            for esp in especialidades
        ]
        
        return Response({
            'success': True,
            'especialidades': data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al listar especialidades: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
