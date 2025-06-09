from rest_framework import serializers
from .models import Cita
from pacientes.serializers import PacienteListSerializer
from dentistas.serializers import DentistaListSerializer
from datetime import datetime, timedelta
from django.utils import timezone

class CitaSerializer(serializers.ModelSerializer):
    """
    Serializer completo para citas
    """
    paciente_info = PacienteListSerializer(source='paciente', read_only=True)
    dentista_info = DentistaListSerializer(source='dentista', read_only=True)
    duracion_horas = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    tipo_cita_display = serializers.CharField(source='get_tipo_cita_display', read_only=True)
    
    class Meta:
        model = Cita
        fields = [
            'id', 'paciente', 'paciente_info', 'dentista', 'dentista_info',
            'tratamiento', 'fecha_hora', 'fecha_hora_fin', 'duracion_estimada',
            'duracion_horas', 'tipo_cita', 'tipo_cita_display', 'estado',
            'estado_display', 'motivo_consulta', 'notas_dentista',
            'observaciones_previas', 'numero_cita', 'costo_estimado',
            'requiere_confirmacion', 'recordatorio_enviado', 'fecha_recordatorio',
            'fecha_creacion', 'fecha_actualizacion', 'creado_por',
            'fecha_cancelacion', 'motivo_cancelacion', 'cita_reagendada'
        ]
        read_only_fields = [
            'id', 'numero_cita', 'fecha_creacion', 'fecha_actualizacion',
            'recordatorio_enviado', 'fecha_recordatorio', 'fecha_cancelacion'
        ]
    
    def get_duracion_horas(self, obj):
        """Convierte duración de minutos a horas:minutos"""
        if obj.duracion_estimada:
            horas = obj.duracion_estimada // 60
            minutos = obj.duracion_estimada % 60
            if horas > 0:
                return f"{horas}h {minutos}m"
            return f"{minutos}m"
        return None
    
    def get_fecha_hora_fin(self, obj):
        """Calcula la fecha/hora de fin de la cita"""
        if obj.fecha_hora and obj.duracion_estimada:
            fecha_fin = obj.fecha_hora + timedelta(minutes=obj.duracion_estimada)
            return fecha_fin
        return None
    
    def validate_fecha_hora(self, value):
        """Validar que la cita no sea en el pasado"""
        if value < timezone.now():
            raise serializers.ValidationError(
                "No se puede programar una cita en el pasado."
            )
        return value
    
    def validate(self, attrs):
        """Validaciones a nivel de objeto"""
        fecha_hora = attrs.get('fecha_hora')
        dentista = attrs.get('dentista')
        duracion_estimada = attrs.get('duracion_estimada', 60)
        
        if fecha_hora and dentista:
            # Validar horario laboral del dentista
            dia_semana = str(fecha_hora.weekday() + 1)
            if dia_semana not in dentista.dias_laborales:
                raise serializers.ValidationError(
                    f"El dentista no trabaja los {fecha_hora.strftime('%A')}"
                )
            
            # Validar horario de trabajo
            hora_cita = fecha_hora.time()
            if not (dentista.horario_inicio <= hora_cita <= dentista.horario_fin):
                raise serializers.ValidationError(
                    f"La cita debe estar dentro del horario laboral del dentista "
                    f"({dentista.horario_inicio} - {dentista.horario_fin})"
                )
            
            # Validar conflictos de horario (solo para citas nuevas o cambios de fecha/dentista)
            if not self.instance or (
                self.instance.fecha_hora != fecha_hora or 
                self.instance.dentista != dentista
            ):
                conflictos = Cita.objects.filter(
                    dentista=dentista,
                    fecha_hora__date=fecha_hora.date(),
                    estado__in=['programada', 'confirmada', 'en_curso']
                )
                
                if self.instance:
                    conflictos = conflictos.exclude(pk=self.instance.pk)
                
                for cita in conflictos:
                    inicio_existente = cita.fecha_hora
                    fin_existente = inicio_existente + timedelta(minutes=cita.duracion_estimada)
                    inicio_nueva = fecha_hora
                    fin_nueva = fecha_hora + timedelta(minutes=duracion_estimada)
                    
                    if (inicio_nueva < fin_existente and fin_nueva > inicio_existente):
                        raise serializers.ValidationError(
                            f"Conflicto de horario con la cita {cita.numero_cita} "
                            f"del {inicio_existente.strftime('%d/%m/%Y %H:%M')}"
                        )
        
        return attrs
    
    def create(self, validated_data):
        """Generar número de cita automático"""
        if not validated_data.get('numero_cita'):
            fecha = validated_data['fecha_hora'].date()
            fecha_str = fecha.strftime('%Y%m%d')
            
            # Buscar el último número de cita del día
            ultimo_numero = Cita.objects.filter(
                numero_cita__startswith=f'C{fecha_str}'
            ).order_by('-numero_cita').first()
            
            if ultimo_numero:
                try:
                    ultimo_num = int(ultimo_numero.numero_cita[-3:])
                    nuevo_num = ultimo_num + 1
                except ValueError:
                    nuevo_num = 1
            else:
                nuevo_num = 1
            
            validated_data['numero_cita'] = f'C{fecha_str}{nuevo_num:03d}'
        
        return super().create(validated_data)

class CitaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de citas
    """
    paciente_nombre = serializers.SerializerMethodField()
    dentista_nombre = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    tipo_cita_display = serializers.CharField(source='get_tipo_cita_display', read_only=True)
    duracion_horas = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'numero_cita', 'paciente', 'paciente_nombre',
            'dentista', 'dentista_nombre', 'fecha_hora', 'duracion_estimada',
            'duracion_horas', 'tipo_cita', 'tipo_cita_display', 'estado',
            'estado_display', 'motivo_consulta', 'costo_estimado'
        ]
    
    def get_paciente_nombre(self, obj):
        """Nombre completo del paciente"""
        return f"{obj.paciente.nombre} {obj.paciente.apellido_paterno}"
    
    def get_dentista_nombre(self, obj):
        """Nombre completo del dentista"""
        return obj.dentista.nombre_completo
    
    def get_duracion_horas(self, obj):
        """Convierte duración de minutos a formato legible"""
        if obj.duracion_estimada:
            horas = obj.duracion_estimada // 60
            minutos = obj.duracion_estimada % 60
            if horas > 0:
                return f"{horas}h {minutos}m"
            return f"{minutos}m"
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
    
    def validate_fecha_hora(self, value):
        """Validar que la cita sea al menos 1 hora en el futuro"""
        minimo_tiempo = timezone.now() + timedelta(hours=1)
        if value < minimo_tiempo:
            raise serializers.ValidationError(
                "La cita debe programarse al menos 1 hora en el futuro."
            )
        return value

class CitaCalendarioSerializer(serializers.ModelSerializer):
    """
    Serializer especial para vista de calendario
    """
    title = serializers.SerializerMethodField()
    start = serializers.DateTimeField(source='fecha_hora')
    end = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'title', 'start', 'end', 'color', 'estado',
            'tipo_cita', 'paciente', 'dentista'
        ]
    
    def get_title(self, obj):
        """Título para mostrar en el calendario"""
        return f"{obj.paciente.nombre} {obj.paciente.apellido_paterno} - {obj.get_tipo_cita_display()}"
    
    def get_end(self, obj):
        """Fecha/hora de fin para el calendario"""
        if obj.fecha_hora and obj.duracion_estimada:
            return obj.fecha_hora + timedelta(minutes=obj.duracion_estimada)
        return None
    
    def get_color(self, obj):
        """Color según el estado de la cita"""
        colores = {
            'programada': '#3B82F6',  # Azul
            'confirmada': '#10B981',  # Verde
            'en_curso': '#F59E0B',    # Amarillo
            'completada': '#6B7280',  # Gris
            'cancelada': '#EF4444',   # Rojo
            'no_asistio': '#DC2626',  # Rojo oscuro
            'reagendada': '#8B5CF6',  # Morado
        }
        return colores.get(obj.estado, '#6B7280')
