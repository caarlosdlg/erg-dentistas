from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from .models import GoogleProfile
from .serializers import GoogleAuthSerializer, UserSerializer
import logging
import os

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Vista para autenticación con Google OAuth
    """
    serializer = GoogleAuthSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Datos inválidos', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    access_token = serializer.validated_data['access_token']
    
    try:
        # Determinar si estamos en modo desarrollo
        is_development = access_token in ['dev_test_token', 'test_token']
        google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        
        if is_development or not google_client_id:
            # MODO DESARROLLO: Crear usuario de prueba sin verificar token
            logger.info("Ejecutando autenticación en modo desarrollo")
            google_id = 'test_google_id_123'
            email = 'test@example.com'
            first_name = 'Usuario'
            last_name = 'Prueba'
            picture = 'https://via.placeholder.com/150'
            email_verified = True
        else:
            # MODO PRODUCCIÓN: Verificar token real de Google
            logger.info("Ejecutando autenticación en modo producción")
            idinfo = id_token.verify_oauth2_token(
                access_token, 
                requests.Request(),
                audience=google_client_id
            )
            
            # Extraer información del usuario de Google
            google_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            picture = idinfo.get('picture', '')
            email_verified = idinfo.get('email_verified', False)
        
        # Buscar perfil de Google existente
        try:
            google_profile = GoogleProfile.objects.get(google_id=google_id)
            user = google_profile.user
            created = False
        except GoogleProfile.DoesNotExist:
            # Crear nuevo usuario
            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,  # Usar email como username
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )
            
            # Crear perfil de Google
            google_profile = GoogleProfile.objects.create(
                user=user,
                google_id=google_id,
                picture=picture,
                email_verified=email_verified,
            )
            created = True
        
        # Actualizar información del usuario si ya existe
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            
            google_profile.picture = picture
            google_profile.email_verified = email_verified
            google_profile.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token_jwt = refresh.access_token
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(access_token_jwt),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        logger.error(f"Error validando token de Google: {e}")
        return Response(
            {'error': 'Token de Google inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error en autenticación Google: {e}")
        return Response(
            {'error': 'Error interno del servidor', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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
