from django.db import models
import uuid
import os


def get_file_path(instance, filename):
    """
    Genera un path único para cada imagen subida.
    El path incluye el tipo de objeto (paciente, dentista, etc.) y un UUID único.
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join(f"{instance.content_type}", filename)


class Image(models.Model):
    """
    Modelo para manejar imágenes asociadas a diferentes entidades del sistema.
    Permite almacenar imágenes para: pacientes, dentistas, tratamientos, etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to=get_file_path, verbose_name="Imagen")
    
    # Define las opciones para los tipos de contenido
    CONTENT_TYPE_CHOICES = (
        ('paciente', 'Imagen de Paciente'),
        ('dentista', 'Imagen de Dentista'),
        ('tratamiento', 'Imagen de Tratamiento'),
        ('equipo', 'Imagen de Equipo'),
        ('documento', 'Documento'),
        ('otro', 'Otro'),
    )
    
    content_type = models.CharField(
        max_length=20, 
        choices=CONTENT_TYPE_CHOICES,
        default='otro',
        verbose_name="Tipo de contenido"
    )
    
    # Relaciones genéricas: permite asociar la imagen a cualquier modelo
    # Necesitamos el ID del objeto relacionado y nombres descriptivos
    object_id = models.CharField(max_length=255)  # UUID como string
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Metadatos
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    @property
    def filename(self):
        return os.path.basename(self.image.name)
    
    @property
    def filesize(self):
        if self.image and hasattr(self.image, 'size'):
            return self.image.size
        return 0
    
    def __str__(self):
        return f"Imagen {self.id} - {self.content_type} ({self.title})"

    class Meta:
        verbose_name = "Imagen"
        verbose_name_plural = "Imágenes"
        ordering = ['content_type', 'order', '-uploaded_at']
