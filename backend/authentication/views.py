from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.conf import settings
from .serializers import UserSerializer
import logging
import os

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Vista para cerrar sesión
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {'success': True, 'message': 'Sesión cerrada exitosamente'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error al cerrar sesión: {e}")
        return Response(
            {'error': 'Error al cerrar sesión'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Vista para obtener el perfil del usuario autenticado
    """
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def github_auth(request):
    """
    Vista para autenticación con GitHub OAuth
    """
    import requests as http_requests
    from django.conf import settings
    
    code = request.data.get('code')
    
    if not code:
        return Response(
            {'error': 'Código de autorización requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Determinar si estamos en modo desarrollo
        is_development = code in ['dev_test_code', 'test_code']
        github_client_id = getattr(settings, 'GITHUB_CLIENT_ID', None)
        github_client_secret = getattr(settings, 'GITHUB_CLIENT_SECRET', None)
        
        if is_development or not github_client_id:
            # MODO DESARROLLO: Crear usuario de prueba sin verificar código
            logger.info("Ejecutando autenticación GitHub en modo desarrollo")
            github_id = 'test_github_id_123'
            email = 'dev@github.com'
            login = 'github-dev'
            name = 'GitHub Developer'
            avatar_url = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        else:
            # MODO PRODUCCIÓN: Intercambiar código por token de acceso
            logger.info("Ejecutando autenticación GitHub en modo producción")
            
            # Intercambiar código por token de acceso
            token_response = http_requests.post('https://github.com/login/oauth/access_token', {
                'client_id': github_client_id,
                'client_secret': github_client_secret,
                'code': code
            }, headers={'Accept': 'application/json'})
            
            if token_response.status_code != 200:
                return Response(
                    {'error': 'Error al obtener token de acceso de GitHub'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token_data = token_response.json()
            access_token = token_data.get('access_token')
            
            if not access_token:
                return Response(
                    {'error': 'Token de acceso no válido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener información del usuario desde GitHub
            user_response = http_requests.get('https://api.github.com/user', {
                'headers': {'Authorization': f'token {access_token}'}
            })
            
            if user_response.status_code != 200:
                return Response(
                    {'error': 'Error al obtener información del usuario de GitHub'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_data = user_response.json()
            github_id = str(user_data.get('id'))
            login = user_data.get('login')
            name = user_data.get('name', login)
            email = user_data.get('email')
            avatar_url = user_data.get('avatar_url')
            
            # Si no hay email público, intentar obtenerlo de la API de emails
            if not email:
                email_response = http_requests.get('https://api.github.com/user/emails', {
                    'headers': {'Authorization': f'token {access_token}'}
                })
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary_email = next((e for e in emails if e.get('primary')), None)
                    if primary_email:
                        email = primary_email.get('email')
            
            if not email:
                email = f"{login}@github.local"  # Email por defecto si no se encuentra
        
        # Buscar o crear usuario
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': name.split()[0] if name and ' ' in name else (name or login),
                'last_name': ' '.join(name.split()[1:]) if name and ' ' in name else '',
                'is_active': True,
            }
        )
        
        # Crear o actualizar perfil de GitHub (necesitaremos crear este modelo)
        # Por ahora, almacenaremos la información en el usuario
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Preparar datos del usuario para la respuesta
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'github_id': github_id,
            'github_profile': {
                'login': login,
                'avatar_url': avatar_url,
                'html_url': f'https://github.com/{login}'
            }
        }
        
        logger.info(f"Autenticación GitHub exitosa para usuario: {email}")
        
        return Response({
            'success': True,
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en autenticación GitHub: {e}")
        return Response(
            {'error': 'Error interno del servidor', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_email_only(request):
    """
    Vista para autenticación de dentistas solo con email
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuario dentista por email
        user = User.objects.get(email=email.strip())
        
        # Verificar que el usuario esté activo
        if not user.is_active:
            return Response(
                {'error': 'Usuario inactivo'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Preparar datos del usuario para la respuesta
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'tipo': 'dentista'
        }
        
        # Intentar obtener información adicional del dentista si existe
        try:
            if hasattr(user, 'dentista'):
                dentista = user.dentista
                user_data['dentista_info'] = {
                    'especialidad': getattr(dentista, 'especialidad', ''),
                    'telefono': getattr(dentista, 'telefono', ''),
                    'cedula': getattr(dentista, 'cedula', '')
                }
        except Exception:
            pass  # Si no tiene relación con dentista, continuamos
        
        logger.info(f"Login con email exitoso para dentista: {email}")
        
        return Response({
            'success': True,
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Dentista no encontrado con este email'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error en login con email: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
