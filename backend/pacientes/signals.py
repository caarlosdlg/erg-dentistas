from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ImagenMedica

@receiver(post_save, sender=ImagenMedica)
def procesar_imagen_medica(sender, instance, created, **kwargs):
    """
    Signal para procesar automáticamente las imágenes médicas después de ser guardadas
    """
    if created and instance.archivo:
        # Generar miniatura y actualizar metadatos de forma asíncrona
        try:
            instance.actualizar_metadatos()
            instance.generar_miniatura()
        except Exception as e:
            print(f"Error procesando imagen {instance.id}: {e}")
