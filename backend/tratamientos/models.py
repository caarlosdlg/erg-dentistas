from django.db import models
import uuid

class CategoriaTratamiento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007bff', help_text="Color en formato hexadecimal")
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Categoría de Tratamiento"
        verbose_name_plural = "Categorías de Tratamientos"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Tratamiento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Información básica
    nombre = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20, unique=True)
    categoria = models.ForeignKey(CategoriaTratamiento, on_delete=models.CASCADE, related_name='tratamientos')
    descripcion = models.TextField()
    
    # Información económica
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    precio_minimo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_maximo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Información técnica
    duracion_estimada = models.PositiveIntegerField(help_text="Duración en minutos")
    sesiones_requeridas = models.PositiveIntegerField(default=1)
    requiere_anestesia = models.BooleanField(default=False)
    
    # Materiales y medicamentos
    materiales_necesarios = models.TextField(blank=True, help_text="Lista de materiales necesarios")
    medicamentos_post = models.TextField(blank=True, help_text="Medicamentos post-tratamiento")
    
    # Restricciones y advertencias
    contraindicaciones = models.TextField(blank=True)
    advertencias = models.TextField(blank=True)
    preparacion_previa = models.TextField(blank=True, help_text="Preparación requerida antes del tratamiento")
    
    # Estado
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tratamiento"
        verbose_name_plural = "Tratamientos"
        ordering = ['categoria__nombre', 'nombre']
        indexes = [
            models.Index(fields=['nombre'], name='tratamiento_nombre_idx'),
            models.Index(fields=['codigo'], name='tratamiento_codigo_idx'),
            models.Index(fields=['activo'], name='tratamiento_activo_idx'),
            models.Index(fields=['categoria'], name='tratamiento_categoria_idx'),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def save(self, *args, **kwargs):
        if not self.codigo:
            # Generar código automático
            categoria_codigo = self.categoria.nombre[:3].upper()
            ultimo_tratamiento = Tratamiento.objects.filter(
                categoria=self.categoria
            ).order_by('fecha_creacion').last()
            
            if ultimo_tratamiento and ultimo_tratamiento.codigo:
                try:
                    numero = int(ultimo_tratamiento.codigo.split('-')[-1]) + 1
                except:
                    numero = 1
            else:
                numero = 1
            
            self.codigo = f"{categoria_codigo}-{numero:03d}"
        super().save(*args, **kwargs)
