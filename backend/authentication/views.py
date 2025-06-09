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
