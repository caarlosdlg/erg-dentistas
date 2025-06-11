from django.contrib import admin
from .models import CategoriaTratamiento, Tratamiento

@admin.register(CategoriaTratamiento)
class CategoriaTratamientoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'color', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)
    readonly_fields = ('id',)

@admin.register(Tratamiento)
class TratamientoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'precio_base', 'duracion_estimada', 'activo')
    list_filter = ('activo', 'categoria', 'requiere_anestesia', 'sesiones_requeridas')
    search_fields = ('codigo', 'nombre', 'categoria__nombre')
    readonly_fields = ('id', 'codigo', 'fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'codigo', 'nombre', 'categoria', 'descripcion')
        }),
        ('Información Económica', {
            'fields': ('precio_base', 'precio_minimo', 'precio_maximo')
        }),
        ('Información Técnica', {
            'fields': ('duracion_estimada', 'sesiones_requeridas', 'requiere_anestesia')
        }),
        ('Materiales y Medicamentos', {
            'fields': ('materiales_necesarios', 'medicamentos_post')
        }),
        ('Restricciones y Advertencias', {
            'fields': ('contraindicaciones', 'advertencias', 'preparacion_previa')
        }),
        ('Metadatos', {
            'fields': ('activo', 'fecha_creacion', 'fecha_actualizacion')
        }),
    )
