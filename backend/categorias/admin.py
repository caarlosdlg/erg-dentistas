from django.contrib import admin
from mptt.admin import MPTTModelAdmin, DraggableMPTTAdmin
from .models import Category, CategoryAttribute


class CategoryAttributeInline(admin.TabularInline):
    """Inline para atributos de categoría"""
    model = CategoryAttribute
    extra = 0
    fields = ['name', 'value', 'attribute_type', 'is_required', 'sort_order']


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    """
    Admin con interfaz drag & drop para categorías jerárquicas
    """
    inlines = [CategoryAttributeInline]
    
    # Campos principales
    list_display = [
        'tree_actions', 'indented_title', 'is_active', 
        'children_count', 'level', 'sort_order', 'created_at'
    ]
    list_display_links = ['indented_title']
    list_filter = ['is_active', 'level', 'created_at']
    search_fields = ['name', 'description', 'slug']
    readonly_fields = ['id', 'level', 'full_path', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    
    # Organización de campos
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'name', 'slug', 'description', 'parent')
        }),
        ('Configuración', {
            'fields': ('is_active', 'sort_order', 'image')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('level', 'full_path', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Configuración del drag & drop
    mptt_level_indent = 20
    
    def children_count(self, obj):
        """Mostrar número de hijos directos"""
        return obj.get_children_count()
    children_count.short_description = "Hijos"
    
    def indented_title(self, obj):
        """Título con indentación visual"""
        return f"{'—' * obj.level} {obj.name}"
    indented_title.short_description = "Categoría"
    
    def save_model(self, request, obj, form, change):
        """Asignar usuario actual al crear"""
        if not change:  # Solo en creación
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CategoryAttribute)
class CategoryAttributeAdmin(admin.ModelAdmin):
    """Admin para atributos de categorías"""
    list_display = ['category', 'name', 'attribute_type', 'is_required', 'sort_order']
    list_filter = ['attribute_type', 'is_required', 'category']
    search_fields = ['name', 'value', 'category__name']
    ordering = ['category', 'sort_order', 'name']
    
    fieldsets = (
        (None, {
            'fields': ('category', 'name', 'value', 'attribute_type')
        }),
        ('Configuración', {
            'fields': ('is_required', 'sort_order')
        }),
    )
