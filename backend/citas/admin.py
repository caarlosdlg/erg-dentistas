from django.contrib import admin
from .models import Cita

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('numero_cita', 'paciente', 'dentista', 'fecha_hora', 'tipo_cita', 'estado')
    list_filter = ('estado', 'tipo_cita', 'fecha_hora', 'dentista', 'requiere_confirmacion')
    search_fields = ('numero_cita', 'paciente__nombre', 'paciente__apellido_paterno', 'dentista__user__first_name', 'dentista__user__last_name')
    readonly_fields = ('id', 'numero_cita', 'fecha_creacion', 'fecha_actualizacion', 'fecha_fin_estimada')
    date_hierarchy = 'fecha_hora'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'numero_cita', 'paciente', 'dentista', 'tratamiento')
        }),
        ('Detalles de la Cita', {
            'fields': ('fecha_hora', 'duracion_estimada', 'fecha_fin_estimada', 'tipo_cita', 'estado')
        }),
        ('Información Clínica', {
            'fields': ('motivo_consulta', 'notas_dentista', 'observaciones_previas')
        }),
        ('Información Administrativa', {
            'fields': ('costo_estimado', 'requiere_confirmacion', 'creado_por')
        }),
        ('Recordatorios', {
            'fields': ('recordatorio_enviado', 'fecha_recordatorio')
        }),
        ('Cancelación/Reagendado', {
            'fields': ('fecha_cancelacion', 'motivo_cancelacion', 'cita_reagendada')
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion')
        }),
    )
    
    def fecha_fin_estimada(self, obj):
        return obj.fecha_fin_estimada
    fecha_fin_estimada.short_description = 'Hora Estimada de Fin'
