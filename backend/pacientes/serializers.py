from rest_framework import serializers
from .models import Paciente
from datetime import date

class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Paciente
    """
    edad = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre', 'apellido_paterno', 'apellido_materno',
            'nombre_completo', 'fecha_nacimiento', 'edad', 'sexo',
            'telefono', 'email', 'direccion', 'tipo_sangre',
            'alergias', 'medicamentos', 'enfermedades_cronicas',
            'numero_expediente', 'fecha_registro', 'activo',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono',
            'contacto_emergencia_relacion'
        ]
        read_only_fields = ['id', 'numero_expediente', 'fecha_registro', 'edad', 'nombre_completo']
    
    def get_edad(self, obj):
        """Calcula la edad del paciente"""
        if obj.fecha_nacimiento:
            today = date.today()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None
    
    def get_nombre_completo(self, obj):
        """Retorna el nombre completo del paciente"""
        nombres = [obj.nombre, obj.apellido_paterno]
        if obj.apellido_materno:
            nombres.append(obj.apellido_materno)
        return ' '.join(nombres)
    
    def validate_email(self, value):
        """Validar que el email sea único (excluyendo el propio objeto en edición)"""
        if self.instance:
            if Paciente.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Ya existe un paciente con este email.")
        else:
            if Paciente.objects.filter(email=value).exists():
                raise serializers.ValidationError("Ya existe un paciente con este email.")
        return value
    
    def validate_fecha_nacimiento(self, value):
        """Validar que la fecha de nacimiento no sea futura"""
        if value > date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede ser futura.")
        return value
    
    def create(self, validated_data):
        """Generar número de expediente automático al crear"""
        if not validated_data.get('numero_expediente'):
            # Generar número de expediente basado en iniciales y fecha
            iniciales = f"{validated_data['nombre'][0]}{validated_data['apellido_paterno'][0]}"
            if validated_data.get('apellido_materno'):
                iniciales += validated_data['apellido_materno'][0]
            
            # Obtener el último número de expediente
            ultimo_paciente = Paciente.objects.filter(
                numero_expediente__startswith=iniciales.upper()
            ).order_by('-numero_expediente').first()
            
            if ultimo_paciente:
                try:
                    ultimo_num = int(ultimo_paciente.numero_expediente[-4:])
                    nuevo_num = ultimo_num + 1
                except ValueError:
                    nuevo_num = 1
            else:
                nuevo_num = 1
            
            validated_data['numero_expediente'] = f"{iniciales.upper()}{nuevo_num:04d}"
        
        return super().create(validated_data)

class PacienteListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de pacientes
    """
    nombre_completo = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()
    
    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre_completo', 'email', 'telefono',
            'fecha_nacimiento', 'edad', 'numero_expediente',
            'fecha_registro', 'activo'
        ]
    
    def get_nombre_completo(self, obj):
        """Retorna el nombre completo del paciente"""
        nombres = [obj.nombre, obj.apellido_paterno]
        if obj.apellido_materno:
            nombres.append(obj.apellido_materno)
        return ' '.join(nombres)
    
    def get_edad(self, obj):
        """Calcula la edad del paciente"""
        if obj.fecha_nacimiento:
            today = date.today()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None
