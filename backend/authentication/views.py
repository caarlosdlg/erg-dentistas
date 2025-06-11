from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import GoogleAuthSerializer, UserSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Endpoint para autenticación con Google OAuth
    """
    try:
        serializer = GoogleAuthSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user_info = serializer.validated_data['user_info']
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Preparar respuesta
            user_serializer = UserSerializer(user)
            
            response_data = {
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'user': user_serializer.data,
                'message': 'Autenticación exitosa'
            }
            
            logger.info(f"Usuario autenticado exitosamente: {user.email}")
            return Response(response_data, status=status.HTTP_200_OK)
        
        else:
            logger.warning(f"Error en validación de token Google: {serializer.errors}")
            return Response({
                'error': 'Datos de autenticación inválidos',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error inesperado en google_auth: {e}")
        return Response({
            'error': 'Error interno del servidor',
            'message': 'Por favor, inténtalo de nuevo más tarde'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout(request):
    """
    Endpoint para cerrar sesión
    """
    try:
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        return Response({
            'message': 'Sesión cerrada exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error durante logout: {e}")
        return Response({
            'error': 'Error al cerrar sesión'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    """
    Endpoint para obtener el perfil del usuario autenticado
    """
    try:
        user = request.user
        serializer = UserSerializer(user)
        
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error obteniendo perfil de usuario: {e}")
        return Response({
            'error': 'Error obteniendo perfil de usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
