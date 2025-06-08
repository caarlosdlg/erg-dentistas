from django.db import models
import uuid
from django.core.validators import RegexValidator

class Paciente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Información personal
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)
    fecha_nacimiento = models.DateField()
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Femenino')])
    
    # Información de contacto
    telefono = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Número de teléfono inválido")]
    )
    email = models.EmailField(unique=True)
    direccion = models.TextField()
    
    # Información médica
    tipo_sangre = models.CharField(
        max_length=3,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        blank=True
    )
    alergias = models.TextField(blank=True, help_text="Alergias conocidas del paciente")
    medicamentos = models.TextField(blank=True, help_text="Medicamentos que toma actualmente")
    enfermedades_cronicas = models.TextField(blank=True, help_text="Enfermedades crónicas")
    
    # Información administrativa
    numero_expediente = models.CharField(max_length=20, unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    # Contacto de emergencia
    contacto_emergencia_nombre = models.CharField(max_length=200)
    contacto_emergencia_telefono = models.CharField(max_length=15)
    contacto_emergencia_relacion = models.CharField(max_length=50)
    
    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['apellido_paterno', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido_paterno} {self.apellido_materno}".strip()
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido_paterno} {self.apellido_materno}".strip()
    
    def save(self, *args, **kwargs):
        if not self.numero_expediente:
            # Generar número de expediente automático
            ultimo_paciente = Paciente.objects.order_by('fecha_registro').last()
            if ultimo_paciente:
                numero = int(ultimo_paciente.numero_expediente.split('-')[-1]) + 1
            else:
                numero = 1
            self.numero_expediente = f"PAC-{numero:06d}"
        super().save(*args, **kwargs)
