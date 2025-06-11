from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

class Cita(models.Model):
    ESTADOS_CITA = [
        ('programada', 'Programada'),
        ('confirmada', 'Confirmada'),
        ('en_curso', 'En Curso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
        ('no_asistio', 'No Asistió'),
        ('reagendada', 'Reagendada'),
    ]
    
    TIPOS_CITA = [
        ('consulta', 'Consulta General'),
        ('tratamiento', 'Tratamiento'),
        ('seguimiento', 'Seguimiento'),
        ('emergencia', 'Emergencia'),
        ('limpieza', 'Limpieza Dental'),
        ('revision', 'Revisión'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='citas')
    dentista = models.ForeignKey('dentistas.Dentista', on_delete=models.CASCADE, related_name='citas')
    tratamiento = models.ForeignKey('tratamientos.Tratamiento', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información de la cita
    fecha_hora = models.DateTimeField()
    duracion_estimada = models.PositiveIntegerField(default=60, help_text="Duración en minutos")
    tipo_cita = models.CharField(max_length=20, choices=TIPOS_CITA, default='consulta')
    estado = models.CharField(max_length=20, choices=ESTADOS_CITA, default='programada')
    
    # Notas y observaciones
    motivo_consulta = models.TextField(help_text="Motivo principal de la consulta")
    notas_dentista = models.TextField(blank=True, help_text="Notas del dentista")
    observaciones_previas = models.TextField(blank=True)
    
    # Información administrativa
    numero_cita = models.CharField(max_length=20, unique=True, blank=True)
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requiere_confirmacion = models.BooleanField(default=True)
    
    # Recordatorios
    recordatorio_enviado = models.BooleanField(default=False)
    fecha_recordatorio = models.DateTimeField(null=True, blank=True)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información de cancelación/reagendado
    fecha_cancelacion = models.DateTimeField(null=True, blank=True)
    motivo_cancelacion = models.TextField(blank=True)
    cita_reagendada = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='cita_original')
    
    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['fecha_hora']
        indexes = [
            models.Index(fields=['fecha_hora']),
            models.Index(fields=['estado']),
            models.Index(fields=['paciente', 'fecha_hora']),
            models.Index(fields=['dentista', 'fecha_hora']),
        ]
    
    def __str__(self):
        return f"Cita {self.numero_cita} - {self.paciente.nombre_completo} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"
    
    def clean(self):
        # Validar que la cita no sea en el pasado (excepto para estados específicos)
        if self.fecha_hora and self.estado == 'programada':
            # Asegurar que ambas fechas tengan timezone para la comparación
            fecha_cita = self.fecha_hora
            if timezone.is_naive(fecha_cita):
                fecha_cita = timezone.make_aware(fecha_cita)
            
            if fecha_cita < timezone.now():
                raise ValidationError("No se puede programar una cita en el pasado")
        
        # Validar conflictos de horario del dentista
        if self.dentista and self.fecha_hora:
            conflictos = Cita.objects.filter(
                dentista=self.dentista,
                fecha_hora__date=self.fecha_hora.date(),
                estado__in=['programada', 'confirmada', 'en_curso']
            ).exclude(pk=self.pk)
            
            for cita in conflictos:
                inicio_existente = cita.fecha_hora
                fin_existente = cita.fecha_hora + timezone.timedelta(minutes=cita.duracion_estimada)
                inicio_nueva = self.fecha_hora
                fin_nueva = self.fecha_hora + timezone.timedelta(minutes=self.duracion_estimada)
                
                if (inicio_nueva < fin_existente and fin_nueva > inicio_existente):
                    raise ValidationError(f"Conflicto de horario con la cita {cita.numero_cita}")
    
    def save(self, *args, **kwargs):
        if not self.numero_cita:
            # Generar número de cita automático
            fecha_str = self.fecha_hora.strftime('%Y%m%d')
            ultimo_numero = Cita.objects.filter(
                fecha_hora__date=self.fecha_hora.date()
            ).count() + 1
            self.numero_cita = f"CITA-{fecha_str}-{ultimo_numero:03d}"
        
        # Si se asigna un tratamiento, copiar la duración estimada
        if self.tratamiento and not self.duracion_estimada != 60:
            self.duracion_estimada = self.tratamiento.duracion_estimada
        
        # Si se asigna un tratamiento, copiar el costo estimado
        if self.tratamiento and not self.costo_estimado:
            self.costo_estimado = self.tratamiento.precio_base
        
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def fecha_fin_estimada(self):
        return self.fecha_hora + timezone.timedelta(minutes=self.duracion_estimada)
    
    def puede_cancelar(self):
        """Verifica si la cita puede ser cancelada"""
        return self.estado in ['programada', 'confirmada']
    
    def puede_reagendar(self):
        """Verifica si la cita puede ser reagendada"""
        return self.estado in ['programada', 'confirmada']
