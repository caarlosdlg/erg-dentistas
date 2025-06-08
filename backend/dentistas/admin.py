from django.contrib import admin
from .models import Especialidad, Dentista

@admin.register(Especialidad)
class EspecialidadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)
    readonly_fields = ('id',)

@admin.register(Dentista)
class DentistaAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'cedula_profesional', 'telefono', 'fecha_ingreso', 'activo')
    list_filter = ('activo', 'especialidades', 'fecha_ingreso')
    search_fields = ('user__first_name', 'user__last_name', 'cedula_profesional', 'telefono')
    readonly_fields = ('id', 'fecha_registro')
    filter_horizontal = ('especialidades',)
    
    fieldsets = (
        ('Usuario', {
            'fields': ('id', 'user')
        }),
        ('Información Profesional', {
            'fields': ('cedula_profesional', 'especialidades', 'universidad', 'anio_graduacion')
        }),
        ('Información Personal', {
            'fields': ('telefono', 'fecha_nacimiento', 'direccion', 'foto')
        }),
        ('Información Laboral', {
            'fields': ('fecha_ingreso', 'salario', 'horario_inicio', 'horario_fin', 'dias_laborales')
        }),
        ('Información Adicional', {
            'fields': ('biografia', 'activo', 'fecha_registro')
        }),
    )
    
    def nombre_completo(self, obj):
        return obj.nombre_completo
    nombre_completo.short_description = 'Nombre Completo'
