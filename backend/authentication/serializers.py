from rest_framework import serializers
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class GoogleAuthSerializer(serializers.Serializer):
    """
    Serializer para autenticación con Google OAuth
    """
    token = serializers.CharField(required=True)
    client_id = serializers.CharField(required=False)

    def validate(self, attrs):
        token = attrs.get('token')
        client_id = attrs.get('client_id')

        try:
            # Verificar el token con Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                client_id
            )

            # Verificar que sea de Google
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Token no válido de Google')

            # Extraer información del usuario
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')
            email_verified = idinfo.get('email_verified', False)

            # Buscar o crear usuario
            user, created = User.objects.get_or_create(
                google_id=google_id,
                defaults={
                    'email': email,
                    'username': email,
                    'first_name': name.split(' ')[0] if name else '',
                    'last_name': ' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
                    'picture': picture,
                    'email_verified': email_verified,
                    'is_active': True,
                }
            )

            if not created:
                # Actualizar información del usuario existente
                user.email = email
                user.first_name = name.split(' ')[0] if name else user.first_name
                user.last_name = ' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else user.last_name
                user.picture = picture
                user.email_verified = email_verified
                user.save()

            attrs['user'] = user
            attrs['user_info'] = idinfo

        except ValueError as e:
            logger.error(f"Error validating Google token: {e}")
            raise serializers.ValidationError('Token de Google inválido')
        except Exception as e:
            logger.error(f"Unexpected error during Google auth: {e}")
            raise serializers.ValidationError('Error en la autenticación con Google')

        return attrs

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para información del usuario
    """
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'name', 'first_name', 'last_name',
            'picture', 'email_verified', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']

    def get_name(self, obj):
        """Retorna el nombre completo del usuario"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
