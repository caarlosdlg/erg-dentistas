from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class FormaPago(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    requiere_referencia = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Forma de Pago"
        verbose_name_plural = "Formas de Pago"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Factura(models.Model):
    ESTADOS_FACTURA = [
        ('borrador', 'Borrador'),
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('parcial', 'Pago Parcial'),
        ('vencida', 'Vencida'),
        ('cancelada', 'Cancelada'),
    ]
    
    TIPOS_FACTURA = [
        ('tratamiento', 'Tratamiento'),
        ('consulta', 'Consulta'),
        ('plan_tratamiento', 'Plan de Tratamiento'),
        ('emergencia', 'Emergencia'),
        ('otros', 'Otros'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    paciente = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE, related_name='facturas')
    cita = models.ForeignKey('citas.Cita', on_delete=models.SET_NULL, null=True, blank=True, related_name='facturas')
    
    # Información de la factura
    numero_factura = models.CharField(max_length=20, unique=True, blank=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento = models.DateField()
    tipo_factura = models.CharField(max_length=20, choices=TIPOS_FACTURA, default='tratamiento')
    estado = models.CharField(max_length=20, choices=ESTADOS_FACTURA, default='borrador')
    
    # Montos
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), validators=[MinValueValidator(Decimal('0.00'))])
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    saldo_pendiente = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Notas y observaciones
    notas = models.TextField(blank=True)
    observaciones_internas = models.TextField(blank=True)
    
    # Metadatos
    creado_por = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"
        ordering = ['-fecha_emision']
        indexes = [
            models.Index(fields=['numero_factura']),
            models.Index(fields=['estado']),
            models.Index(fields=['paciente', 'fecha_emision']),
        ]
    
    def __str__(self):
        return f"Factura {self.numero_factura} - {self.paciente.nombre_completo}"
    
    def save(self, *args, **kwargs):
        if not self.numero_factura:
            # Generar número de factura automático
            año_actual = self.fecha_emision.year
            ultimo_numero = Factura.objects.filter(
                fecha_emision__year=año_actual
            ).count() + 1
            self.numero_factura = f"FAC-{año_actual}-{ultimo_numero:06d}"
        
        # Calcular total
        self.total = self.subtotal - self.descuento + self.impuestos
        
        # Actualizar saldo pendiente si es una factura nueva
        if not self.pk:
            self.saldo_pendiente = self.total
        
        super().save(*args, **kwargs)
    
    def calcular_totales(self):
        """Recalcula los totales basado en las líneas de factura"""
        lineas = self.lineas.all()
        self.subtotal = sum(linea.total for linea in lineas)
        self.total = self.subtotal - self.descuento + self.impuestos
        self.save()
    
    def marcar_como_pagada(self):
        """Marca la factura como pagada"""
        self.estado = 'pagada'
        self.saldo_pendiente = Decimal('0.00')
        self.save()

class LineaFactura(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='lineas')
    tratamiento = models.ForeignKey('tratamientos.Tratamiento', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información del item
    descripcion = models.CharField(max_length=200)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    descuento_linea = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Línea de Factura"
        verbose_name_plural = "Líneas de Factura"
        ordering = ['fecha_creacion']
    
    def __str__(self):
        return f"{self.descripcion} - ${self.total}"
    
    def save(self, *args, **kwargs):
        # Calcular total de la línea
        subtotal_linea = self.cantidad * self.precio_unitario
        self.total = subtotal_linea - self.descuento_linea
        super().save(*args, **kwargs)
        
        # Recalcular totales de la factura
        self.factura.calcular_totales()

class Pago(models.Model):
    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('procesando', 'Procesando'),
        ('completado', 'Completado'),
        ('fallido', 'Fallido'),
        ('cancelado', 'Cancelado'),
        ('reembolsado', 'Reembolsado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='pagos')
    forma_pago = models.ForeignKey(FormaPago, on_delete=models.CASCADE)
    
    # Información del pago
    numero_pago = models.CharField(max_length=20, unique=True, blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    fecha_pago = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='completado')
    
    # Información adicional del pago
    referencia = models.CharField(max_length=100, blank=True, help_text="Número de referencia bancaria o de tarjeta")
    notas = models.TextField(blank=True)
    comprobante = models.FileField(upload_to='pagos/comprobantes/', blank=True, null=True)
    
    # Metadatos
    registrado_por = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['-fecha_pago']
        indexes = [
            models.Index(fields=['numero_pago']),
            models.Index(fields=['factura', 'fecha_pago']),
        ]
    
    def __str__(self):
        return f"Pago {self.numero_pago} - ${self.monto}"
    
    def save(self, *args, **kwargs):
        if not self.numero_pago:
            # Generar número de pago automático
            fecha_str = self.fecha_pago.strftime('%Y%m%d')
            ultimo_numero = Pago.objects.filter(
                fecha_pago__date=self.fecha_pago.date()
            ).count() + 1
            self.numero_pago = f"PAG-{fecha_str}-{ultimo_numero:04d}"
        
        super().save(*args, **kwargs)
        
        # Actualizar saldo de la factura
        if self.estado == 'completado':
            self.actualizar_saldo_factura()
    
    def actualizar_saldo_factura(self):
        """Actualiza el saldo pendiente de la factura"""
        total_pagos = self.factura.pagos.filter(estado='completado').aggregate(
            total=models.Sum('monto')
        )['total'] or Decimal('0.00')
        
        self.factura.saldo_pendiente = self.factura.total - total_pagos
        
        # Actualizar estado de la factura
        if self.factura.saldo_pendiente <= 0:
            self.factura.estado = 'pagada'
        elif self.factura.saldo_pendiente < self.factura.total:
            self.factura.estado = 'parcial'
        else:
            self.factura.estado = 'pendiente'
        
        self.factura.save()
