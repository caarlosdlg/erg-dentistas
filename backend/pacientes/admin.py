from django.contrib import admin
from .models import Paciente

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('numero_expediente', 'nombre_completo', 'email', 'telefono', 'fecha_registro', 'activo')
    list_filter = ('activo', 'sexo', 'tipo_sangre', 'fecha_registro')
    search_fields = ('nombre', 'apellido_paterno', 'apellido_materno', 'email', 'numero_expediente')
    readonly_fields = ('id', 'numero_expediente', 'fecha_registro')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('id', 'nombre', 'apellido_paterno', 'apellido_materno', 'fecha_nacimiento', 'sexo')
        }),
        ('Información de Contacto', {
            'fields': ('email', 'telefono', 'direccion')
        }),
        ('Información Médica', {
            'fields': ('tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas')
        }),
        ('Contacto de Emergencia', {
            'fields': ('contacto_emergencia_nombre', 'contacto_emergencia_telefono', 'contacto_emergencia_relacion')
        }),
        ('Información Administrativa', {
            'fields': ('numero_expediente', 'fecha_registro', 'activo')
        }),
    )
    
    def nombre_completo(self, obj):
        return obj.nombre_completo
    nombre_completo.short_description = 'Nombre Completo'
