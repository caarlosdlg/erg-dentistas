from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin
from .models import CategoriaTratamiento, Tratamiento


@admin.register(CategoriaTratamiento)
class CategoriaTratamientoAdmin(DraggableMPTTAdmin):
    """
    Admin con interfaz drag & drop para categorías jerárquicas de tratamientos
    """
    # Campos principales
    list_display = [
        'tree_actions', 'indented_title', 'activo', 
        'treatments_count', 'children_count', 'level', 'orden', 'fecha_creacion'
    ]
    list_display_links = ['indented_title']
    list_filter = ['activo', 'level', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion', 'slug']
    readonly_fields = ['id', 'slug', 'level', 'full_path', 'fecha_creacion', 'fecha_actualizacion']
    prepopulated_fields = {}  # slug se genera automáticamente
    
    # Organización de campos
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'nombre', 'slug', 'descripcion', 'parent')
        }),
        ('Configuración Visual', {
            'fields': ('color', 'icono', 'imagen')
        }),
        ('Configuración', {
            'fields': ('activo', 'orden')
        }),
        ('SEO y Metadata', {
            'fields': ('meta_titulo', 'meta_descripcion'),
            'classes': ('collapse',)
        }),
        ('Jerarquía', {
            'fields': ('level', 'full_path'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def indented_title(self, obj):
        """Título con indentación visual"""
        return f"{'—' * obj.level} {obj.nombre}"
    indented_title.short_description = 'Nombre'
    
    def treatments_count(self, obj):
        """Mostrar número de tratamientos (incluyendo subcategorías)"""
        return obj.get_treatments_count()
    treatments_count.short_description = 'Tratamientos'
    
    def children_count(self, obj):
        """Mostrar número de hijos directos"""
        return obj.get_children_count()
    children_count.short_description = 'Subcategorías'
    
    def get_queryset(self, request):
        """Optimizar consultas con prefetch"""
        return super().get_queryset(request).prefetch_related('children')


@admin.register(Tratamiento)
class TratamientoAdmin(admin.ModelAdmin):
    """
    Administración de tratamientos con soporte para categorías jerárquicas
    """
    list_display = ('codigo', 'nombre', 'categoria_path', 'precio_base', 'duracion_estimada', 'popular', 'activo')
    list_filter = ('activo', 'popular', 'categoria', 'requiere_anestesia', 'sesiones_requeridas')
    search_fields = ('codigo', 'nombre', 'categoria__nombre', 'descripcion')
    readonly_fields = ('id', 'codigo', 'categoria_path', 'categoria_breadcrumbs', 'fecha_creacion', 'fecha_actualizacion')
    autocomplete_fields = ['categoria']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'codigo', 'nombre', 'categoria', 'descripcion')
        }),
        ('Jerarquía', {
            'fields': ('categoria_path', 'categoria_breadcrumbs'),
            'classes': ('collapse',)
        }),
        ('Información Económica', {
            'fields': ('precio_base', 'precio_minimo', 'precio_maximo')
        }),
        ('Información Técnica', {
            'fields': ('duracion_estimada', 'sesiones_requeridas', 'requiere_anestesia')
        }),
        ('Materiales y Medicamentos', {
            'fields': ('materiales_necesarios', 'medicamentos_post'),
            'classes': ('collapse',)
        }),
        ('Restricciones y Advertencias', {
            'fields': ('contraindicaciones', 'advertencias', 'preparacion_previa'),
            'classes': ('collapse',)
        }),
        ('Configuración', {
            'fields': ('activo', 'popular', 'orden_visualizacion')
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def categoria_path(self, obj):
        """Mostrar la ruta completa de la categoría"""
        return obj.get_categoria_path()
    categoria_path.short_description = 'Ruta de Categoría'
    
    def categoria_breadcrumbs(self, obj):
        """Mostrar breadcrumbs de la categoría"""
        breadcrumbs = obj.get_categoria_breadcrumbs()
        return ' > '.join([b['nombre'] for b in breadcrumbs])
    categoria_breadcrumbs.short_description = 'Breadcrumbs'
    
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'categoria',
            'categoria__parent',
            'categoria__parent__parent',
            'categoria__parent__parent__parent'
        )
    
    actions = ['toggle_popular', 'toggle_active']
    
    def toggle_popular(self, request, queryset):
        """Acción para alternar estado popular"""
        updated = 0
        for tratamiento in queryset:
            tratamiento.popular = not tratamiento.popular
            tratamiento.save()
            updated += 1
        
        self.message_user(request, f'{updated} tratamientos actualizados.')
    toggle_popular.short_description = 'Alternar estado popular'
    
    def toggle_active(self, request, queryset):
        """Acción para alternar estado activo"""
        updated = 0
        for tratamiento in queryset:
            tratamiento.activo = not tratamiento.activo
            tratamiento.save()
            updated += 1
        
        self.message_user(request, f'{updated} tratamientos actualizados.')
    toggle_active.short_description = 'Alternar estado activo'
