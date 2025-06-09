from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GoogleProfile

class GoogleProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de Google"""
    
    class Meta:
        model = GoogleProfile
        fields = ['google_id', 'picture', 'email_verified', 'created_at', 'updated_at']
        read_only_fields = ['google_id', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de usuario"""
    
    google_profile = GoogleProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'date_joined',
            'is_active',
            'google_profile'
        ]
        read_only_fields = ['id', 'date_joined']

class GoogleAuthSerializer(serializers.Serializer):
    """Serializer para validar el token de Google OAuth"""
    
    access_token = serializers.CharField(required=True)
    
    def validate_access_token(self, value):
        if not value:
            raise serializers.ValidationError("El token de acceso es requerido")
        return value
