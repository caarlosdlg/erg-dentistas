from django.db import models
from django.contrib.auth.models import User
import uuid

class Especialidad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Especialidad"
        verbose_name_plural = "Especialidades"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Dentista(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dentista')
    
    # Información profesional
    cedula_profesional = models.CharField(max_length=20, unique=True)
    especialidades = models.ManyToManyField(Especialidad, blank=True)
    universidad = models.CharField(max_length=200)
    anio_graduacion = models.PositiveIntegerField()
    
    # Información personal adicional
    telefono = models.CharField(max_length=15)
    fecha_nacimiento = models.DateField()
    direccion = models.TextField()
    
    # Información laboral
    fecha_ingreso = models.DateField()
    salario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    horario_inicio = models.TimeField()
    horario_fin = models.TimeField()
    dias_laborales = models.CharField(
        max_length=7,
        default='1234567',  # 1=Lunes, 2=Martes, ..., 7=Domingo
        help_text="Días laborales: 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb, 7=Dom"
    )
    
    # Estado
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    # Información adicional
    biografia = models.TextField(blank=True)
    foto = models.ImageField(upload_to='dentistas/fotos/', blank=True, null=True)
    
    class Meta:
        verbose_name = "Dentista"
        verbose_name_plural = "Dentistas"
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
    
    @property
    def nombre_completo(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
    
    @property
    def especialidades_nombres(self):
        return ", ".join([esp.nombre for esp in self.especialidades.all()])
