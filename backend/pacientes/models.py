from django.db import models
import uuid
import os
from django.core.validators import RegexValidator
from django.conf import settings

class Paciente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones con dentistas
    creado_por = models.ForeignKey(
        'dentistas.Dentista', 
        on_delete=models.PROTECT, 
        related_name='pacientes_creados',
        help_text="Dentista que registró al paciente"
    )
    dentista_asignado = models.ForeignKey(
        'dentistas.Dentista', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='pacientes_asignados',
        help_text="Dentista asignado para atender al paciente"
    )
    
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
            # Generar número de expediente por dentista (formato: DEN{dentista_id[:3]}-PAC-{numero})
            if self.creado_por:
                dentista_codigo = str(self.creado_por.id).replace('-', '')[:3].upper()
                # Contar pacientes creados por este dentista
                pacientes_del_dentista = Paciente.objects.filter(creado_por=self.creado_por).count()
                numero = pacientes_del_dentista + 1
                self.numero_expediente = f"DEN{dentista_codigo}-PAC-{numero:06d}"
            else:
                # Fallback al sistema anterior si no hay dentista
                ultimo_paciente = Paciente.objects.order_by('fecha_registro').last()
                if ultimo_paciente:
                    numero = int(ultimo_paciente.numero_expediente.split('-')[-1]) + 1
                else:
                    numero = 1
                self.numero_expediente = f"PAC-{numero:06d}"
        
        # Si no hay dentista asignado, asignar automáticamente al que lo creó
        if not self.dentista_asignado and self.creado_por:
            self.dentista_asignado = self.creado_por
            
        super().save(*args, **kwargs)


class ExpedienteMedico(models.Model):
    """
    Modelo para gestionar expedientes médicos separados de la información básica del paciente.
    Cada expediente tiene un ID único y está asociado a un paciente y dentista.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    paciente = models.OneToOneField(
        Paciente, 
        on_delete=models.CASCADE, 
        related_name='expediente_medico'
    )
    dentista_responsable = models.ForeignKey(
        'dentistas.Dentista',
        on_delete=models.PROTECT,
        related_name='expedientes_responsables',
        help_text="Dentista responsable del expediente médico"
    )
    
    # Información del expediente
    numero_expediente_medico = models.CharField(max_length=30, unique=True)
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)
    
    # Información médica detallada
    antecedentes_familiares = models.TextField(
        blank=True, 
        help_text="Antecedentes médicos familiares relevantes"
    )
    antecedentes_personales = models.TextField(
        blank=True, 
        help_text="Antecedentes médicos personales"
    )
    historial_dental = models.TextField(
        blank=True, 
        help_text="Historial dental previo del paciente"
    )
    
    # Estado del expediente
    activo = models.BooleanField(default=True)
    cerrado_fecha = models.DateTimeField(null=True, blank=True)
    cerrado_por = models.ForeignKey(
        'dentistas.Dentista',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expedientes_cerrados'
    )
    motivo_cierre = models.TextField(blank=True)
    
    # Notas adicionales
    observaciones_generales = models.TextField(
        blank=True,
        help_text="Observaciones generales del expediente"
    )
    
    class Meta:
        verbose_name = "Expediente Médico"
        verbose_name_plural = "Expedientes Médicos"
        ordering = ['-fecha_apertura']
        
    def __str__(self):
        return f"Expediente {self.numero_expediente_medico} - {self.paciente.nombre_completo}"
    
    def save(self, *args, **kwargs):
        if not self.numero_expediente_medico:
            # Generar número de expediente médico único
            # Formato: EXP-{dentista_codigo}-{año}-{número}
            from datetime import datetime
            año_actual = datetime.now().year
            dentista_codigo = str(self.dentista_responsable.id).replace('-', '')[:3].upper()
            
            # Contar expedientes del dentista en el año actual
            expedientes_año = ExpedienteMedico.objects.filter(
                dentista_responsable=self.dentista_responsable,
                fecha_apertura__year=año_actual
            ).count()
            
            numero = expedientes_año + 1
            self.numero_expediente_medico = f"EXP-{dentista_codigo}-{año_actual}-{numero:04d}"
        
        super().save(*args, **kwargs)


class BitacoraCita(models.Model):
    """
    Modelo para registrar el historial de citas y procedimientos de cada paciente.
    Funciona como una bitácora médica completa.
    """
    TIPO_CITA_CHOICES = [
        ('consulta', 'Consulta General'),
        ('limpieza', 'Limpieza Dental'),
        ('endodoncia', 'Endodoncia'),
        ('extraccion', 'Extracción'),
        ('ortodoncia', 'Ortodoncia'),
        ('cirugia', 'Cirugía Oral'),
        ('implante', 'Implante'),
        ('blanqueamiento', 'Blanqueamiento'),
        ('protesis', 'Prótesis'),
        ('emergencia', 'Emergencia'),
        ('revision', 'Revisión'),
        ('otro', 'Otro')
    ]
    
    ESTADO_CHOICES = [
        ('programada', 'Programada'),
        ('en_curso', 'En Curso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
        ('reprogramada', 'Reprogramada'),
        ('no_asistio', 'No Asistió')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.CASCADE,
        related_name='bitacora_citas'
    )
    dentista = models.ForeignKey(
        'dentistas.Dentista',
        on_delete=models.PROTECT,
        related_name='bitacora_atendida'
    )
    expediente_medico = models.ForeignKey(
        ExpedienteMedico,
        on_delete=models.CASCADE,
        related_name='entradas_bitacora',
        null=True,
        blank=True
    )
    
    # Información de la cita
    fecha_hora = models.DateTimeField(help_text="Fecha y hora de la cita")
    tipo_cita = models.CharField(max_length=20, choices=TIPO_CITA_CHOICES)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='programada')
    duracion_estimada = models.PositiveIntegerField(default=60, help_text="Duración en minutos")
    
    # Información médica
    motivo_consulta = models.TextField(help_text="Razón de la consulta")
    diagnostico = models.TextField(blank=True, help_text="Diagnóstico del dentista")
    tratamiento_realizado = models.TextField(blank=True, help_text="Descripción del tratamiento realizado")
    observaciones_dentista = models.TextField(blank=True, help_text="Observaciones y notas del dentista")
    plan_tratamiento = models.TextField(blank=True, help_text="Plan de tratamiento recomendado")
    
    # Información administrativa
    costo_tratamiento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pagado = models.BooleanField(default=False)
    metodo_pago = models.CharField(max_length=50, blank=True)
    
    # Próxima cita
    proxima_cita_fecha = models.DateTimeField(null=True, blank=True, help_text="Fecha recomendada para próxima cita")
    proxima_cita_motivo = models.CharField(max_length=200, blank=True, help_text="Motivo de la próxima cita")
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Entrada de Bitácora"
        verbose_name_plural = "Entradas de Bitácora"
        ordering = ['-fecha_hora']
        
    def __str__(self):
        return f"Bitácora {self.paciente.nombre_completo} - {self.fecha_hora.strftime('%d/%m/%Y')}"


class ImagenMedica(models.Model):
    """
    Modelo para gestionar imágenes médicas de pacientes (radiografías, fotos intraorales, etc.)
    """
    TIPO_IMAGEN_CHOICES = [
        ('radiografia_panoramica', 'Radiografía Panorámica'),
        ('radiografia_periapical', 'Radiografía Periapical'),
        ('radiografia_bite_wing', 'Radiografía Bite-Wing'),
        ('foto_intraoral', 'Fotografía Intraoral'),
        ('foto_extraoral', 'Fotografía Extraoral'),
        ('foto_sonrisa', 'Fotografía de Sonrisa'),
        ('scan_3d', 'Escaneo 3D'),
        ('documento', 'Documento Médico'),
        ('consentimiento', 'Consentimiento Informado'),
        ('receta', 'Receta Médica'),
        ('otro', 'Otro')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.CASCADE,
        related_name='imagenes_medicas'
    )
    bitacora_cita = models.ForeignKey(
        BitacoraCita,
        on_delete=models.SET_NULL,
        related_name='imagenes_asociadas',
        null=True,
        blank=True,
        help_text="Cita relacionada con esta imagen"
    )
    dentista_responsable = models.ForeignKey(
        'dentistas.Dentista',
        on_delete=models.PROTECT,
        related_name='imagenes_tomadas'
    )
    
    # Información de la imagen
    archivo = models.ImageField(
        upload_to='imagenes_medicas/%Y/%m/',
        help_text="Archivo de imagen médica"
    )
    miniatura = models.ImageField(
        upload_to='imagenes_medicas/thumbnails/%Y/%m/',
        blank=True,
        null=True,
        help_text="Miniatura generada automáticamente"
    )
    tipo_imagen = models.CharField(max_length=30, choices=TIPO_IMAGEN_CHOICES)
    titulo = models.CharField(max_length=200, help_text="Título descriptivo de la imagen")
    descripcion = models.TextField(blank=True, help_text="Descripción detallada")
    
    # Metadatos técnicos
    tamaño_archivo = models.PositiveIntegerField(null=True, blank=True, help_text="Tamaño en bytes")
    resolucion_x = models.PositiveIntegerField(null=True, blank=True)
    resolucion_y = models.PositiveIntegerField(null=True, blank=True)
    formato = models.CharField(max_length=10, blank=True)
    
    # Información médica
    diente_especifico = models.CharField(max_length=10, blank=True, help_text="Número de diente específico")
    cuadrante = models.CharField(max_length=20, blank=True, help_text="Cuadrante dental")
    observaciones_medicas = models.TextField(blank=True, help_text="Observaciones médicas sobre la imagen")
    
    # Metadatos de tiempo
    fecha_toma = models.DateTimeField(help_text="Fecha y hora cuando se tomó la imagen")
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Estado
    activa = models.BooleanField(default=True)
    confidencial = models.BooleanField(default=True, help_text="Marca si la imagen contiene información sensible")
    
    class Meta:
        verbose_name = "Imagen Médica"
        verbose_name_plural = "Imágenes Médicas"
        ordering = ['-fecha_toma']
        
    def __str__(self):
        return f"{self.titulo} - {self.paciente.nombre_completo}"
    
    def save(self, *args, **kwargs):
        # Guardar primero para obtener el archivo
        super().save(*args, **kwargs)
        
        # Generar miniatura automáticamente si no existe
        if self.archivo and not self.miniatura:
            self.generar_miniatura()
        
        # Actualizar metadatos del archivo si es necesario
        if self.archivo and not self.tamaño_archivo:
            self.actualizar_metadatos()
    
    def generar_miniatura(self):
        """Genera una miniatura de la imagen médica"""
        try:
            from PIL import Image, ImageOps
            import os
            from django.core.files.base import ContentFile
            from io import BytesIO
            
            # Abrir la imagen original
            with Image.open(self.archivo.path) as img:
                # Convertir a RGB si es necesario
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Crear miniatura manteniendo proporción
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
                # Guardar en BytesIO
                output = BytesIO()
                img.save(output, format='JPEG', quality=85, optimize=True)
                output.seek(0)
                
                # Generar nombre para la miniatura
                nombre_base = os.path.splitext(os.path.basename(self.archivo.name))[0]
                nombre_miniatura = f"{nombre_base}_thumb.jpg"
                
                # Guardar miniatura
                self.miniatura.save(
                    nombre_miniatura,
                    ContentFile(output.getvalue()),
                    save=False
                )
                
                # Actualizar sin llamar save() nuevamente para evitar recursión
                ImagenMedica.objects.filter(id=self.id).update(miniatura=self.miniatura)
                
        except Exception as e:
            print(f"Error generando miniatura para imagen {self.id}: {e}")
    
    def actualizar_metadatos(self):
        """Actualiza los metadatos técnicos de la imagen"""
        try:
            from PIL import Image
            import os
            
            if self.archivo and hasattr(self.archivo, 'path'):
                # Obtener tamaño del archivo
                self.tamaño_archivo = os.path.getsize(self.archivo.path)
                
                # Obtener dimensiones de la imagen
                with Image.open(self.archivo.path) as img:
                    self.resolucion_x = img.width
                    self.resolucion_y = img.height
                    self.formato = img.format.upper() if img.format else 'UNKNOWN'
                
                # Actualizar sin llamar save() nuevamente
                ImagenMedica.objects.filter(id=self.id).update(
                    tamaño_archivo=self.tamaño_archivo,
                    resolucion_x=self.resolucion_x,
                    resolucion_y=self.resolucion_y,
                    formato=self.formato
                )
                
        except Exception as e:
            print(f"Error actualizando metadatos para imagen {self.id}: {e}")
    
    @property
    def nombre_archivo(self):
        """Retorna el nombre del archivo sin la ruta"""
        if self.archivo:
            return os.path.basename(self.archivo.name)
        return None
    
    @property
    def url_completa(self):
        """Retorna la URL completa del archivo"""
        if self.archivo:
            return self.archivo.url
        return None
    
    @property
    def miniatura_url(self):
        """Retorna la URL de la miniatura"""
        if self.miniatura:
            return self.miniatura.url
        return None
