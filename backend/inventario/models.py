from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class CategoriaInventario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Categoría de Inventario"
        verbose_name_plural = "Categorías de Inventario"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Proveedor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=200)
    contacto = models.CharField(max_length=200, blank=True)
    telefono = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class ArticuloInventario(models.Model):
    UNIDADES_MEDIDA = [
        ('pieza', 'Pieza'),
        ('caja', 'Caja'),
        ('paquete', 'Paquete'),
        ('jeringa', 'Jeringa'),
        ('cartucho', 'Cartucho'),
        ('ml', 'Mililitro'),
        ('gr', 'Gramo'),
        ('kg', 'Kilogramo'),
        ('litro', 'Litro'),
        ('unidad', 'Unidad'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria = models.ForeignKey(CategoriaInventario, on_delete=models.CASCADE, related_name='articulos')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información de medidas y precios
    unidad_medida = models.CharField(max_length=20, choices=UNIDADES_MEDIDA)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    # Control de stock
    stock_actual = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=1)
    stock_maximo = models.PositiveIntegerField(default=100)
    
    # Información adicional
    ubicacion = models.CharField(max_length=100, blank=True, help_text="Ubicación física del artículo")
    fecha_vencimiento = models.DateField(null=True, blank=True)
    lote = models.CharField(max_length=50, blank=True)
    
    # Estado
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Artículo de Inventario"
        verbose_name_plural = "Artículos de Inventario"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['categoria', 'nombre']),
            models.Index(fields=['stock_actual']),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    @property
    def valor_total(self):
        """Calcula el valor total del stock actual"""
        return self.precio_compra * self.stock_actual
    
    @property
    def estado_stock(self):
        """Determina el estado del stock"""
        if self.stock_actual <= self.stock_minimo * 0.5:
            return 'critico'
        elif self.stock_actual <= self.stock_minimo:
            return 'bajo'
        elif self.stock_actual >= self.stock_maximo * 0.9:
            return 'alto'
        else:
            return 'normal'
    
    @property
    def necesita_reorden(self):
        """Indica si el artículo necesita ser reordenado"""
        return self.stock_actual <= self.stock_minimo
    
    @property
    def esta_por_vencer(self):
        """Indica si el artículo está por vencer en los próximos 3 meses"""
        if not self.fecha_vencimiento:
            return False
        from datetime import date, timedelta
        return self.fecha_vencimiento <= date.today() + timedelta(days=90)

class MovimientoInventario(models.Model):
    TIPOS_MOVIMIENTO = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste de Inventario'),
        ('devolucion', 'Devolución'),
        ('vencimiento', 'Baja por Vencimiento'),
        ('dano', 'Baja por Daño'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    articulo = models.ForeignKey(ArticuloInventario, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=20, choices=TIPOS_MOVIMIENTO)
    cantidad = models.PositiveIntegerField()
    cantidad_anterior = models.PositiveIntegerField()
    cantidad_nueva = models.PositiveIntegerField()
    
    # Información del movimiento
    motivo = models.TextField(help_text="Descripción del motivo del movimiento")
    numero_factura = models.CharField(max_length=50, blank=True, help_text="Número de factura del proveedor")
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Metadatos
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    registrado_por = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Movimiento de Inventario"
        verbose_name_plural = "Movimientos de Inventario"
        ordering = ['-fecha_movimiento']
        indexes = [
            models.Index(fields=['articulo', 'fecha_movimiento']),
            models.Index(fields=['tipo', 'fecha_movimiento']),
        ]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.articulo.nombre} - {self.cantidad}"
    
    def save(self, *args, **kwargs):
        # Actualizar el stock del artículo
        if self.pk is None:  # Solo en creación
            articulo = self.articulo
            self.cantidad_anterior = articulo.stock_actual
            
            if self.tipo == 'entrada':
                articulo.stock_actual += self.cantidad
            elif self.tipo == 'salida':
                articulo.stock_actual = max(0, articulo.stock_actual - self.cantidad)
            elif self.tipo == 'ajuste':
                articulo.stock_actual = self.cantidad
            elif self.tipo in ['devolucion']:
                articulo.stock_actual += self.cantidad
            elif self.tipo in ['vencimiento', 'dano']:
                articulo.stock_actual = max(0, articulo.stock_actual - self.cantidad)
            
            self.cantidad_nueva = articulo.stock_actual
            articulo.save()
        
        super().save(*args, **kwargs)

class AlertaInventario(models.Model):
    TIPOS_ALERTA = [
        ('stock_bajo', 'Stock Bajo'),
        ('stock_critico', 'Stock Crítico'),
        ('vencimiento', 'Próximo a Vencer'),
        ('vencido', 'Vencido'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    articulo = models.ForeignKey(ArticuloInventario, on_delete=models.CASCADE, related_name='alertas')
    tipo = models.CharField(max_length=20, choices=TIPOS_ALERTA)
    mensaje = models.TextField()
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Alerta de Inventario"
        verbose_name_plural = "Alertas de Inventario"
        ordering = ['-fecha_creacion']
        unique_together = ['articulo', 'tipo', 'activa']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.articulo.nombre}"
    
    def resolver(self):
        """Marca la alerta como resuelta"""
        from django.utils import timezone
        self.activa = False
        self.fecha_resolucion = timezone.now()
        self.save()
