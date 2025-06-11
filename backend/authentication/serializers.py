from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de usuario"""
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'date_joined',
            'is_active'
        ]
        read_only_fields = ['id', 'date_joined']
