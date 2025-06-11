from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Cita
from pacientes.models import Paciente
from dentistas.models import Dentista
from tratamientos.models import Tratamiento

class CitaSerializer(serializers.ModelSerializer):
    """
    Serializer completo para citas
    """
    paciente_nombre = serializers.SerializerMethodField()
    paciente_email = serializers.SerializerMethodField()
    dentista_nombre = serializers.SerializerMethodField()
    tratamiento_nombre = serializers.SerializerMethodField()
    duracion_formateada = serializers.SerializerMethodField()
    fecha_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'paciente', 'dentista', 'tratamiento',
            'paciente_nombre', 'paciente_email', 'dentista_nombre', 'tratamiento_nombre',
            'fecha_hora', 'fecha_formateada', 'duracion_estimada', 'duracion_formateada',
            'tipo_cita', 'estado', 'motivo_consulta', 'notas_dentista',
            'observaciones_previas', 'numero_cita', 'costo_estimado',
            'requiere_confirmacion', 'recordatorio_enviado', 'fecha_recordatorio',
            'fecha_creacion', 'fecha_actualizacion', 'creado_por',
            'fecha_cancelacion', 'motivo_cancelacion', 'cita_reagendada'
        ]
        read_only_fields = [
            'id', 'numero_cita', 'fecha_creacion', 'fecha_actualizacion',
            'paciente_nombre', 'paciente_email', 'dentista_nombre', 'tratamiento_nombre',
            'duracion_formateada', 'fecha_formateada'
        ]
    
    def get_paciente_nombre(self, obj):
        """Retorna el nombre completo del paciente"""
        if obj.paciente:
            return f"{obj.paciente.nombre} {obj.paciente.apellido_paterno} {obj.paciente.apellido_materno or ''}".strip()
        return None
    
    def get_paciente_email(self, obj):
        """Retorna el email del paciente"""
        if obj.paciente:
            return obj.paciente.email
        return None
    
    def get_dentista_nombre(self, obj):
        """Retorna el nombre completo del dentista"""
        if obj.dentista:
            return obj.dentista.nombre_completo
        return None
    
    def get_tratamiento_nombre(self, obj):
        """Retorna el nombre del tratamiento"""
        if obj.tratamiento:
            return obj.tratamiento.nombre
        return None
    
    def get_duracion_formateada(self, obj):
        """Retorna la duración en formato legible"""
        if obj.duracion_estimada:
            horas = obj.duracion_estimada // 60
            minutos = obj.duracion_estimada % 60
            if horas > 0:
                return f"{horas}h {minutos}m" if minutos > 0 else f"{horas}h"
            return f"{minutos}m"
        return None
    
    def get_fecha_formateada(self, obj):
        """Retorna la fecha en formato legible"""
        if obj.fecha_hora:
            return obj.fecha_hora.strftime('%d/%m/%Y %H:%M')
        return None
    
    def validate_fecha_hora(self, value):
        """Validar que la cita no sea en el pasado para citas programadas"""
        if value < timezone.now() and not self.instance:
            raise serializers.ValidationError("No se puede programar una cita en el pasado.")
        return value
    
    def validate(self, data):
        """Validaciones adicionales"""
        # Validar conflictos de horario del dentista
        if 'dentista' in data and 'fecha_hora' in data and 'duracion_estimada' in data:
            dentista = data['dentista']
            fecha_hora = data['fecha_hora']
            duracion = data['duracion_estimada']
            
            # Excluir la cita actual si estamos editando
            exclude_id = self.instance.pk if self.instance else None
            
            conflictos = Cita.objects.filter(
                dentista=dentista,
                fecha_hora__date=fecha_hora.date(),
                estado__in=['programada', 'confirmada', 'en_curso']
            )
            
            if exclude_id:
                conflictos = conflictos.exclude(pk=exclude_id)
            
            for cita in conflictos:
                inicio_existente = cita.fecha_hora
                fin_existente = inicio_existente + timedelta(minutes=cita.duracion_estimada)
                inicio_nueva = fecha_hora
                fin_nueva = fecha_hora + timedelta(minutes=duracion)
                
                if (inicio_nueva < fin_existente and fin_nueva > inicio_existente):
                    raise serializers.ValidationError(
                        f"Conflicto de horario con la cita {cita.numero_cita} "
                        f"del {inicio_existente.strftime('%d/%m/%Y %H:%M')}"
                    )
        
        return data
    
    def create(self, validated_data):
        """Generar número de cita automático"""
        if not validated_data.get('numero_cita'):
            # Generar número de cita: CITA-YYYYMMDD-XXXX
            from datetime import date
            today = date.today()
            prefix = f"CITA-{today.strftime('%Y%m%d')}"
            
            # Obtener el último número del día
            ultima_cita = Cita.objects.filter(
                numero_cita__startswith=prefix
            ).order_by('-numero_cita').first()
            
            if ultima_cita:
                try:
                    ultimo_num = int(ultima_cita.numero_cita[-4:])
                    nuevo_num = ultimo_num + 1
                except ValueError:
                    nuevo_num = 1
            else:
                nuevo_num = 1
            
            validated_data['numero_cita'] = f"{prefix}-{nuevo_num:04d}"
        
        return super().create(validated_data)

class CitaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de citas
    """
    paciente_nombre = serializers.SerializerMethodField()
    paciente_email = serializers.SerializerMethodField()
    dentista_nombre = serializers.SerializerMethodField()
    tratamiento_nombre = serializers.SerializerMethodField()
    fecha_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'numero_cita', 'paciente_nombre', 'paciente_email', 'dentista_nombre',
            'tratamiento_nombre', 'fecha_hora', 'fecha_formateada', 'tipo_cita', 'estado',
            'motivo_consulta', 'duracion_estimada', 'costo_estimado'
        ]
    
    def get_paciente_nombre(self, obj):
        """Retorna el nombre completo del paciente"""
        if obj.paciente:
            return f"{obj.paciente.nombre} {obj.paciente.apellido_paterno} {obj.paciente.apellido_materno or ''}".strip()
        return None
    
    def get_paciente_email(self, obj):
        """Retorna el email del paciente"""
        if obj.paciente:
            return obj.paciente.email
        return None
    
    def get_dentista_nombre(self, obj):
        """Retorna el nombre completo del dentista"""
        if obj.dentista:
            return obj.dentista.nombre_completo
        return None
    
    def get_tratamiento_nombre(self, obj):
        """Retorna el nombre del tratamiento"""
        if obj.tratamiento:
            return obj.tratamiento.nombre
        return None
    
    def get_fecha_formateada(self, obj):
        """Retorna la fecha en formato legible"""
        if obj.fecha_hora:
            return obj.fecha_hora.strftime('%d/%m/%Y %H:%M')
        return None

class CitaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear citas con validaciones específicas
    """
    class Meta:
        model = Cita
        fields = [
            'paciente', 'dentista', 'tratamiento', 'fecha_hora',
            'duracion_estimada', 'tipo_cita', 'motivo_consulta',
            'observaciones_previas', 'costo_estimado', 'requiere_confirmacion'
        ]
    
    def validate_paciente(self, value):
        """Validar que el paciente esté activo"""
        if not value.activo:
            raise serializers.ValidationError("No se puede agendar cita para un paciente inactivo.")
        return value
    
    def validate_dentista(self, value):
        """Validar que el dentista esté activo"""
        if not value.activo:
            raise serializers.ValidationError("No se puede agendar cita con un dentista inactivo.")
        return value
    
    def validate(self, data):
        """Validaciones de horario del dentista"""
        fecha_hora = data.get('fecha_hora')
        dentista = data.get('dentista')
        
        if fecha_hora and dentista:
            # Verificar que el dentista trabaje ese día
            dia_semana = str(fecha_hora.weekday() + 1)  # 1=Lunes, 7=Domingo
            if dia_semana not in dentista.dias_laborales:
                dias_nombres = {
                    '1': 'Lunes', '2': 'Martes', '3': 'Miércoles',
                    '4': 'Jueves', '5': 'Viernes', '6': 'Sábado', '7': 'Domingo'
                }
                raise serializers.ValidationError(
                    f"El dentista no trabaja los {dias_nombres.get(dia_semana, 'días')}."
                )
            
            # Verificar que esté en horario laboral
            hora_cita = fecha_hora.time()
            if not (dentista.horario_inicio <= hora_cita <= dentista.horario_fin):
                raise serializers.ValidationError(
                    f"La cita debe estar entre {dentista.horario_inicio} y {dentista.horario_fin}."
                )
        
        return super().validate(data)