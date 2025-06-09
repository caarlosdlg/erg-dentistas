from django.contrib import admin
from .models import (
    CategoriaInventario, 
    Proveedor, 
    ArticuloInventario, 
    MovimientoInventario, 
    AlertaInventario
)


@admin.register(CategoriaInventario)
class CategoriaInventarioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('id', 'fecha_creacion')


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'contacto', 'telefono', 'email', 'activo', 'fecha_registro')
    list_filter = ('activo', 'fecha_registro')
    search_fields = ('nombre', 'contacto', 'email', 'telefono')
    readonly_fields = ('id', 'fecha_registro')


@admin.register(ArticuloInventario)
class ArticuloInventarioAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'proveedor', 'stock_actual', 'stock_minimo', 'estado_stock', 'activo')
    list_filter = ('activo', 'categoria', 'proveedor', 'fecha_creacion')
    search_fields = ('codigo', 'nombre', 'categoria__nombre', 'proveedor__nombre')
    readonly_fields = ('id', 'fecha_creacion', 'fecha_actualizacion', 'valor_total', 'estado_stock')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'codigo', 'nombre', 'descripcion', 'categoria', 'proveedor')
        }),
        ('Precios', {
            'fields': ('precio_compra', 'precio_venta')
        }),
        ('Control de Stock', {
            'fields': ('stock_actual', 'stock_minimo', 'stock_maximo', 'unidad_medida')
        }),
        ('Información Adicional', {
            'fields': ('ubicacion', 'fecha_vencimiento', 'lote')
        }),
        ('Estado', {
            'fields': ('activo', 'fecha_creacion', 'fecha_actualizacion')
        }),
        ('Calculados', {
            'fields': ('valor_total', 'estado_stock'),
            'classes': ('collapse',)
        })
    )


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ('articulo', 'tipo', 'cantidad', 'cantidad_anterior', 'cantidad_nueva', 'fecha_movimiento', 'registrado_por')
    list_filter = ('tipo', 'fecha_movimiento', 'registrado_por')
    search_fields = ('articulo__nombre', 'articulo__codigo', 'motivo')
    readonly_fields = ('id', 'fecha_movimiento')
    date_hierarchy = 'fecha_movimiento'


@admin.register(AlertaInventario)
class AlertaInventarioAdmin(admin.ModelAdmin):
    list_display = ('articulo', 'tipo', 'activa', 'fecha_creacion', 'fecha_resolucion')
    list_filter = ('tipo', 'activa', 'fecha_creacion')
    search_fields = ('articulo__nombre', 'articulo__codigo', 'mensaje')
    readonly_fields = ('id', 'fecha_creacion')
    date_hierarchy = 'fecha_creacion'
