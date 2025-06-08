"""
Template tags para implementar Subresource Integrity (SRI) en recursos externos.
Proporciona utilidades para generar etiquetas de script y link con atributos de integridad.
"""
from django import template
from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe
from django.contrib.staticfiles.storage import staticfiles_storage
import hashlib
import requests

register = template.Library()

@register.simple_tag
def sri_static(path, attr='defer'):
    """
    Genera una etiqueta script con SRI para un archivo JavaScript local.
    
    Args:
        path: Ruta al archivo JavaScript
        attr: Atributos adicionales (defer, async)
        
    Returns:
        str: Etiqueta script con atributo integrity
    """
    url = static(path)
    
    # Intentar obtener el hash de integridad del almacenamiento
    integrity = ""
    if hasattr(staticfiles_storage, 'get_integrity_hash'):
        integrity = staticfiles_storage.get_integrity_hash(path)
    
    # Si no se pudo obtener del almacenamiento y estamos en producción
    if not integrity and not settings.DEBUG:
        try:
            # Para archivos locales, calcular el hash directamente
            if hasattr(staticfiles_storage, 'path'):
                try:
                    with open(staticfiles_storage.path(path), 'rb') as f:
                        content = f.read()
                        integrity = f"sha384-{hashlib.sha384(content).hexdigest()}"
                except (FileNotFoundError, ValueError):
                    pass
        except Exception:
            pass
    
    integrity_attr = f'integrity="{integrity}" crossorigin="anonymous"' if integrity else ''
    return mark_safe(f'<script src="{url}" {attr} {integrity_attr}></script>')


@register.simple_tag
def sri_stylesheet(path, media="all"):
    """
    Genera una etiqueta link con SRI para un archivo CSS local.
    
    Args:
        path: Ruta al archivo CSS
        media: Tipo de medio (all, screen, print, etc.)
        
    Returns:
        str: Etiqueta link con atributo integrity
    """
    url = static(path)
    
    # Intentar obtener el hash de integridad del almacenamiento
    integrity = ""
    if hasattr(staticfiles_storage, 'get_integrity_hash'):
        integrity = staticfiles_storage.get_integrity_hash(path)
    
    # Si no se pudo obtener del almacenamiento y estamos en producción
    if not integrity and not settings.DEBUG:
        try:
            # Para archivos locales, calcular el hash directamente
            if hasattr(staticfiles_storage, 'path'):
                try:
                    with open(staticfiles_storage.path(path), 'rb') as f:
                        content = f.read()
                        integrity = f"sha384-{hashlib.sha384(content).hexdigest()}"
                except (FileNotFoundError, ValueError):
                    pass
        except Exception:
            pass
    
    integrity_attr = f'integrity="{integrity}" crossorigin="anonymous"' if integrity else ''
    return mark_safe(f'<link rel="stylesheet" href="{url}" media="{media}" {integrity_attr}>')


@register.simple_tag
def sri_external(url, resource_type='script', attr='defer'):
    """
    Genera una etiqueta con SRI para un recurso externo (CDN).
    
    Args:
        url: URL completa del recurso externo
        resource_type: Tipo de recurso ('script' o 'style')
        attr: Atributos adicionales para scripts
        
    Returns:
        str: Etiqueta HTML con atributo integrity
    """
    # Intentar obtener el contenido para calcular el hash
    try:
        response = requests.get(url)
        if response.status_code == 200:
            content = response.content
            integrity = f"sha384-{hashlib.sha384(content).hexdigest()}"
            
            if resource_type == 'script':
                return mark_safe(f'<script src="{url}" {attr} integrity="{integrity}" crossorigin="anonymous"></script>')
            elif resource_type == 'style':
                return mark_safe(f'<link rel="stylesheet" href="{url}" integrity="{integrity}" crossorigin="anonymous">')
    except Exception:
        # En caso de error, devolver la etiqueta sin SRI
        pass
    
    # Fallback sin atributo integrity
    if resource_type == 'script':
        return mark_safe(f'<script src="{url}" {attr}></script>')
    elif resource_type == 'style':
        return mark_safe(f'<link rel="stylesheet" href="{url}">')
    
    return ''
