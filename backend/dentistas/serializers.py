from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dentista, Especialidad

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion']

class DentistaSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    especialidades = EspecialidadSerializer(many=True)
    nombre_completo = serializers.CharField(read_only=True)

    class Meta:
        model = Dentista
        fields = [
            'id', 'user', 'cedula_profesional', 'especialidades',
            'telefono', 'fecha_nacimiento', 'direccion',
            'fecha_ingreso', 'horario_inicio', 'horario_fin',
            'dias_laborales', 'activo', 'nombre_completo'
        ]
