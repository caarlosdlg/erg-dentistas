from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dentista, Especialidad

class EspecialidadSerializer(serializers.ModelSerializer):
    """
    Serializer para especialidades dentales
    """
    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'descripcion', 'activo']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para información básica del usuario
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class DentistaSerializer(serializers.ModelSerializer):
    """
    Serializer completo para dentistas
    """
    user = UserSerializer(read_only=True)
    especialidades = EspecialidadSerializer(many=True, read_only=True)
    especialidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Especialidad.objects.all(),
        many=True,
        write_only=True,
        source='especialidades'
    )
    nombre_completo = serializers.SerializerMethodField()
    especialidades_nombres = serializers.SerializerMethodField()
    
    class Meta:
        model = Dentista
        fields = [
            'id', 'user', 'nombre_completo', 'cedula_profesional',
            'especialidades', 'especialidades_ids', 'especialidades_nombres',
            'universidad', 'anio_graduacion', 'telefono', 'fecha_nacimiento',
            'direccion', 'fecha_ingreso', 'salario', 'horario_inicio',
            'horario_fin', 'dias_laborales', 'activo', 'fecha_registro',
            'biografia', 'foto'
        ]
        read_only_fields = ['id', 'fecha_registro', 'nombre_completo', 'especialidades_nombres']
    
    def get_nombre_completo(self, obj):
        """Retorna el nombre completo del dentista"""
        return obj.nombre_completo
    
    def get_especialidades_nombres(self, obj):
        """Retorna los nombres de las especialidades"""
        return obj.especialidades_nombres
    
    def validate_cedula_profesional(self, value):
        """Validar que la cédula profesional sea única"""
        if self.instance:
            if Dentista.objects.filter(cedula_profesional=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Ya existe un dentista con esta cédula profesional.")
        else:
            if Dentista.objects.filter(cedula_profesional=value).exists():
                raise serializers.ValidationError("Ya existe un dentista con esta cédula profesional.")
        return value
    
    def validate_anio_graduacion(self, value):
        """Validar que el año de graduación sea razonable"""
        from datetime import date
        current_year = date.today().year
        
        if value > current_year:
            raise serializers.ValidationError("El año de graduación no puede ser futuro.")
        
        if value < 1950:
            raise serializers.ValidationError("El año de graduación debe ser posterior a 1950.")
        
        return value

class DentistaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de dentistas
    """
    user = UserSerializer(read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    especialidades_nombres = serializers.SerializerMethodField()
    
    class Meta:
        model = Dentista
        fields = [
            'id', 'user', 'nombre_completo', 'especialidades_nombres',
            'telefono', 'activo', 'horario_inicio', 'horario_fin'
        ]
    
    def get_nombre_completo(self, obj):
        """Retorna el nombre completo del dentista"""
        return obj.nombre_completo
    
    def get_especialidades_nombres(self, obj):
        """Retorna los nombres de las especialidades"""
        return obj.especialidades_nombres

class DentistaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear dentistas con información de usuario
    """
    user_data = UserSerializer()
    especialidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Especialidad.objects.all(),
        many=True,
        source='especialidades'
    )
    
    class Meta:
        model = Dentista
        fields = [
            'user_data', 'cedula_profesional', 'especialidades_ids',
            'universidad', 'anio_graduacion', 'telefono', 'fecha_nacimiento',
            'direccion', 'fecha_ingreso', 'salario', 'horario_inicio',
            'horario_fin', 'dias_laborales', 'biografia'
        ]
    
    def create(self, validated_data):
        """Crear usuario y dentista"""
        user_data = validated_data.pop('user_data')
        especialidades = validated_data.pop('especialidades', [])
        
        # Crear usuario
        user = User.objects.create_user(
            username=user_data['email'],
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )
        
        # Crear dentista
        dentista = Dentista.objects.create(user=user, **validated_data)
        
        # Asignar especialidades
        if especialidades:
            dentista.especialidades.set(especialidades)
        
        return dentista
