"""
Procesadores de contexto personalizados para variables estáticas.
Proporciona variables útiles para plantillas relacionadas con archivos estáticos.
"""
from django.conf import settings
import datetime
import os

def static_context(request):
    """
    Añade variables de contexto relacionadas con archivos estáticos.
    
    Args:
        request: Objeto de solicitud HTTP
        
    Returns:
        dict: Diccionario con variables de contexto para archivos estáticos
    """
    # Obtener la versión estática o generarla si no existe
    static_version = getattr(settings, 'STATIC_VERSION', '')
    
    # Obtener el modo (desarrollo o producción)
    is_debug = settings.DEBUG
    
    # Añadir timestamp para desarrollo
    timestamp = int(datetime.datetime.now().timestamp()) if is_debug else ''
    
    # Construir la URL base para archivos estáticos
    static_base_url = settings.STATIC_URL
    
    # Determinar si se está usando CDN
    using_cdn = False
    cdn_domain = ''
    if hasattr(settings, 'USE_CDN') and settings.USE_CDN:
        using_cdn = True
        cdn_domain = getattr(settings, 'CDN_DOMAIN', '')
    
    # Devolver el contexto
    return {
        'STATIC_VERSION': static_version,
        'STATIC_TIMESTAMP': timestamp,
        'IS_DEBUG': is_debug,
        'STATIC_BASE_URL': static_base_url,
        'USING_CDN': using_cdn,
        'CDN_DOMAIN': cdn_domain,
    }
