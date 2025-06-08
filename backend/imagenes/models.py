from django.db import models
import uuid
import os
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    
    # Campos para imágenes optimizadas y thumbnails
    # Thumbnail (150px)
    thumbnail_url = models.CharField(max_length=255, blank=True, null=True)
    thumbnail_webp_url = models.CharField(max_length=255, blank=True, null=True)
    thumbnail_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # XS (320px - móviles pequeños)
    xs_url = models.CharField(max_length=255, blank=True, null=True)
    xs_webp_url = models.CharField(max_length=255, blank=True, null=True)
    xs_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # Small (480px - móviles)
    small_url = models.CharField(max_length=255, blank=True, null=True)
    small_webp_url = models.CharField(max_length=255, blank=True, null=True)
    small_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # Medium (768px - tablets/móviles grandes)
    medium_url = models.CharField(max_length=255, blank=True, null=True)
    medium_webp_url = models.CharField(max_length=255, blank=True, null=True)
    medium_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # Large (1024px - escritorios pequeños/tablets horizontales)
    large_url = models.CharField(max_length=255, blank=True, null=True)
    large_webp_url = models.CharField(max_length=255, blank=True, null=True)
    large_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # XL (1440px - escritorios grandes)
    xl_url = models.CharField(max_length=255, blank=True, null=True)
    xl_webp_url = models.CharField(max_length=255, blank=True, null=True)
    xl_avif_url = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadatos técnicos
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # En bytes
    optimized = models.BooleanField(default=False)
    
    @property
    def filename(self):
        return os.path.basename(self.image.name)
    
    @property
    def filesize(self):
        if self.image and hasattr(self.image, 'size'):
            return self.image.size
        return 0
    
    def generate_optimized_versions(self, force=False):
        """
        Genera versiones optimizadas de la imagen si no existen o si se fuerza
        
        Args:
            force (bool): Si es True, regenera las imágenes aunque ya existan
        """
        from .image_utils import process_image
        import logging
        
        logger = logging.getLogger(__name__)
        
        if self.image and (not self.optimized or force):
            try:
                # Procesar la imagen para generar versiones optimizadas
                result = process_image(self.image, self)
                
                if result:
                    # Actualizar URLs para todas las variaciones
                    # Thumbnail (150px)
                    self.thumbnail_url = result.get('thumbnail', '')
                    self.thumbnail_webp_url = result.get('thumbnail_webp', '')
                    self.thumbnail_avif_url = result.get('thumbnail_avif', '')
                    
                    # XS (320px)
                    self.xs_url = result.get('xs', '')
                    self.xs_webp_url = result.get('xs_webp', '')
                    self.xs_avif_url = result.get('xs_avif', '')
                    
                    # Small (480px)
                    self.small_url = result.get('small', '')
                    self.small_webp_url = result.get('small_webp', '')
                    self.small_avif_url = result.get('small_avif', '')
                    
                    # Medium (768px)
                    self.medium_url = result.get('medium', '')
                    self.medium_webp_url = result.get('medium_webp', '')
                    self.medium_avif_url = result.get('medium_avif', '')
                    
                    # Large (1024px)
                    self.large_url = result.get('large', '')
                    self.large_webp_url = result.get('large_webp', '')
                    self.large_avif_url = result.get('large_avif', '')
                    
                    # XL (1440px)
                    self.xl_url = result.get('xl', '')
                    self.xl_webp_url = result.get('xl_webp', '')
                    self.xl_avif_url = result.get('xl_avif', '')
                    
                    # Actualizar metadatos
                    from PIL import Image
                    with Image.open(self.image.path) as img:
                        self.width = img.width
                        self.height = img.height
                    
                    self.file_size = os.path.getsize(self.image.path)
                    self.optimized = True
                    self.save()
                    
                return result
            except Exception as e:
                logger.error(f"Error optimizando imagen {self.id}: {str(e)}", exc_info=True)
                return None
        return None
    
    def __str__(self):
        return f"Imagen {self.id} - {self.content_type} ({self.title})"

    class Meta:
        verbose_name = "Imagen"
        verbose_name_plural = "Imágenes"
        ordering = ['content_type', 'order', '-uploaded_at']


@receiver(post_save, sender=Image)
def optimize_image_after_save(sender, instance, created, **kwargs):
    """
    Procesa automáticamente las imágenes después de guardar para crear versiones optimizadas.
    Solo lo hace si la imagen es nueva o si ha cambiado.
    """
    if created or not instance.optimized:
        instance.generate_optimized_versions()
