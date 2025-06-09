from rest_framework import serializers
from .models import Paciente

class PacienteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    edad = serializers.SerializerMethodField()
    
    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre', 'apellido_paterno', 'apellido_materno', 'nombre_completo',
            'fecha_nacimiento', 'edad', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'numero_expediente', 'fecha_registro', 'activo',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion'
        ]
        read_only_fields = ['id', 'numero_expediente', 'fecha_registro']
    
    def get_edad(self, obj):
        from datetime import date
        if obj.fecha_nacimiento:
            today = date.today()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None

class PacienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion'
        ]
    
    def validate_email(self, value):
        if Paciente.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un paciente con este email.")
        return value

class PacienteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion', 'activo'
        ]
    
    def validate_email(self, value):
        if self.instance and self.instance.email != value:
            if Paciente.objects.filter(email=value).exists():
                raise serializers.ValidationError("Ya existe un paciente con este email.")
        return value
