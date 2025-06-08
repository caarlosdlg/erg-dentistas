from django.contrib import admin
from .models import FormaPago, Factura, LineaFactura, Pago

@admin.register(FormaPago)
class FormaPagoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'requiere_referencia', 'activo')
    list_filter = ('requiere_referencia', 'activo')
    search_fields = ('nombre',)
    readonly_fields = ('id',)

class LineaFacturaInline(admin.TabularInline):
    model = LineaFactura
    extra = 1
    readonly_fields = ('id', 'total')

class PagoInline(admin.TabularInline):
    model = Pago
    extra = 0
    readonly_fields = ('id', 'numero_pago', 'fecha_pago')

@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ('numero_factura', 'paciente', 'fecha_emision', 'total', 'saldo_pendiente', 'estado')
    list_filter = ('estado', 'tipo_factura', 'fecha_emision')
    search_fields = ('numero_factura', 'paciente__nombre', 'paciente__apellido_paterno')
    readonly_fields = ('id', 'numero_factura', 'fecha_emision', 'fecha_actualizacion', 'total')
    inlines = [LineaFacturaInline, PagoInline]
    date_hierarchy = 'fecha_emision'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'numero_factura', 'paciente', 'cita', 'tipo_factura')
        }),
        ('Fechas', {
            'fields': ('fecha_emision', 'fecha_vencimiento', 'fecha_actualizacion')
        }),
        ('Montos', {
            'fields': ('subtotal', 'descuento', 'impuestos', 'total', 'saldo_pendiente')
        }),
        ('Estado y Notas', {
            'fields': ('estado', 'notas', 'observaciones_internas')
        }),
        ('Metadatos', {
            'fields': ('creado_por',)
        }),
    )

@admin.register(LineaFactura)
class LineaFacturaAdmin(admin.ModelAdmin):
    list_display = ('factura', 'descripcion', 'cantidad', 'precio_unitario', 'total')
    list_filter = ('factura__estado', 'tratamiento')
    search_fields = ('descripcion', 'factura__numero_factura')
    readonly_fields = ('id', 'total', 'fecha_creacion')

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('numero_pago', 'factura', 'monto', 'forma_pago', 'fecha_pago', 'estado')
    list_filter = ('estado', 'forma_pago', 'fecha_pago')
    search_fields = ('numero_pago', 'factura__numero_factura', 'referencia')
    readonly_fields = ('id', 'numero_pago', 'fecha_pago', 'fecha_actualizacion')
    date_hierarchy = 'fecha_pago'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'numero_pago', 'factura', 'forma_pago')
        }),
        ('Detalles del Pago', {
            'fields': ('monto', 'fecha_pago', 'estado', 'referencia')
        }),
        ('Documentación', {
            'fields': ('comprobante', 'notas')
        }),
        ('Metadatos', {
            'fields': ('registrado_por', 'fecha_actualizacion')
        }),
    )
