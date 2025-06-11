from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dentista, Especialidad

class EspecialidadSerializer(serializers.ModelSerializer):
    """Serializer para especialidades"""
    
    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion', 'activo']
        read_only_fields = ['id']

class DentistaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Dentista"""
    
    user = serializers.SerializerMethodField()
    especialidades = EspecialidadSerializer(many=True, read_only=True)
    
    class Meta:
        model = Dentista
        fields = [
            'id', 'user', 'cedula_profesional', 'especialidades',
            'universidad', 'anio_graduacion', 'telefono', 'fecha_nacimiento',
            'direccion', 'fecha_ingreso', 'salario', 'horario_inicio',
            'horario_fin', 'dias_laborales', 'activo', 'fecha_registro',
            'biografia', 'foto'
        ]
        read_only_fields = ['id', 'fecha_registro']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
        }

class DentistaRegistroSerializer(serializers.Serializer):
    """Serializer para el registro de nuevos dentistas"""
    
    # Datos del usuario
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=8, required=True)
    first_name = serializers.CharField(max_length=30, required=True)
    last_name = serializers.CharField(max_length=30, required=True)
    
    # Datos del dentista
    cedula_profesional = serializers.CharField(max_length=20, required=True)
    telefono = serializers.CharField(max_length=15, required=True)
    fecha_nacimiento = serializers.DateField(required=True)
    universidad = serializers.CharField(max_length=200, required=True)
    anio_graduacion = serializers.IntegerField(required=True)
    
    # Datos opcionales
    direccion = serializers.CharField(required=False, allow_blank=True)
    biografia = serializers.CharField(required=False, allow_blank=True)
    especialidades = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        allow_empty=True
    )
    fecha_ingreso = serializers.DateField(required=False)
    horario_inicio = serializers.TimeField(required=False)
    horario_fin = serializers.TimeField(required=False)
    dias_laborales = serializers.CharField(max_length=7, required=False)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return value
    
    def validate_cedula_profesional(self, value):
        if Dentista.objects.filter(cedula_profesional=value).exists():
            raise serializers.ValidationError("Esta cédula profesional ya está registrada")
        return value
    
    def validate_anio_graduacion(self, value):
        current_year = 2025
        if value < 1950 or value > current_year:
            raise serializers.ValidationError(f"El año de graduación debe estar entre 1950 y {current_year}")
        return value
