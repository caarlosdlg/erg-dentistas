"""
Configuraciones avanzadas para el cacheo de archivos estáticos y técnicas de cache busting.
Proporciona utilidades para optimizar la entrega de archivos estáticos en producción.
"""
from django.templatetags.static import static
from django.utils.crypto import get_random_string
import re
from functools import lru_cache
from django.conf import settings

# Cache versioning - regenerado en cada deploy
STATIC_VERSION = getattr(settings, 'STATIC_VERSION', get_random_string(6))

# Patterns para identificar tipos de archivos
CSS_PATTERN = re.compile(r'\.css$', re.IGNORECASE)
JS_PATTERN = re.compile(r'\.js$', re.IGNORECASE)
IMAGE_PATTERN = re.compile(r'\.(jpe?g|gif|png|svg|webp|avif|ico)$', re.IGNORECASE)
FONT_PATTERN = re.compile(r'\.(woff2?|ttf|eot)$', re.IGNORECASE)

# Tiempos de caché por tipo de archivo (en segundos)
CACHE_TIMES = {
    'css': 60 * 60 * 24 * 30,    # 30 días para CSS
    'js': 60 * 60 * 24 * 30,     # 30 días para JS
    'image': 60 * 60 * 24 * 90,  # 90 días para imágenes
    'font': 60 * 60 * 24 * 365,  # 1 año para fuentes
    'default': 60 * 60 * 24 * 7  # 7 días por defecto
}


@lru_cache(maxsize=100)
def get_versioned_static_url(path):
    """
    Obtiene la URL versionada para un archivo estático.
    Usa el sistema de cache busting incorporado en Django.
    
    Args:
        path: Ruta relativa al archivo estático
        
    Returns:
        str: URL versionada del archivo estático
    """
    return static(path)


def get_cache_time_for_file(file_path):
    """
    Determina el tiempo de caché apropiado según el tipo de archivo.
    
    Args:
        file_path: Ruta al archivo
        
    Returns:
        int: Tiempo de caché en segundos
    """
    if CSS_PATTERN.search(file_path):
        return CACHE_TIMES['css']
    elif JS_PATTERN.search(file_path):
        return CACHE_TIMES['js']
    elif IMAGE_PATTERN.search(file_path):
        return CACHE_TIMES['image']
    elif FONT_PATTERN.search(file_path):
        return CACHE_TIMES['font']
    else:
        return CACHE_TIMES['default']


def get_cache_headers(file_path):
    """
    Genera los encabezados de caché apropiados para un archivo.
    
    Args:
        file_path: Ruta al archivo
        
    Returns:
        dict: Encabezados HTTP para caché
    """
    cache_time = get_cache_time_for_file(file_path)
    headers = {
        'Cache-Control': f'public, max-age={cache_time}, immutable',
        'Vary': 'Accept-Encoding'
    }
    
    if FONT_PATTERN.search(file_path):
        # Permitir CORS para fuentes web
        headers['Access-Control-Allow-Origin'] = '*'
    
    return headers
