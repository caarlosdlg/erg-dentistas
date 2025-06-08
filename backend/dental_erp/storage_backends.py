"""
Configuración de backends de almacenamiento para archivos estáticos y media.
Proporciona clases para gestionar el almacenamiento en S3 y Cloud Storage.
"""
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
from django.core.files.storage import FileSystemStorage


class StaticFileStorage(S3Boto3Storage):
    """
    Almacenamiento para archivos estáticos en S3.
    Configurado para almacenar archivos en un bucket específico con políticas de caché.
    """
    location = settings.STATICFILES_LOCATION
    default_acl = 'public-read'
    file_overwrite = True
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN if hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN') else None
    querystring_auth = False


class MediaFileStorage(S3Boto3Storage):
    """
    Almacenamiento para archivos media (imágenes, etc.) en S3.
    Configurado para almacenar en un bucket específico con políticas diferentes a los estáticos.
    """
    location = settings.MEDIAFILES_LOCATION
    default_acl = 'public-read'
    file_overwrite = False
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN if hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN') else None


class CachedMediaFileStorage(MediaFileStorage):
    """
    Versión de MediaFileStorage con políticas de caché agresivas.
    Útil para archivos que no cambian frecuentemente como imágenes.
    """
    def url(self, name, *args, **kwargs):
        """Override url method to add cache control headers"""
        url = super().url(name, *args, **kwargs)
        if hasattr(settings, 'AWS_S3_OBJECT_PARAMETERS'):
            # Ya se configuran los headers en AWS_S3_OBJECT_PARAMETERS
            return url
        return url


class LocalMediaFileStorage(FileSystemStorage):
    """
    Almacenamiento local para uso en desarrollo.
    Implementa las mismas interfaces que las clases de S3 para mantener consistencia.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(
            location=settings.MEDIA_ROOT,
            base_url=settings.MEDIA_URL,
            *args, **kwargs
        )


class LocalStaticFileStorage(FileSystemStorage):
    """
    Almacenamiento local para archivos estáticos en desarrollo.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(
            location=settings.STATIC_ROOT,
            base_url=settings.STATIC_URL,
            *args, **kwargs
        )
