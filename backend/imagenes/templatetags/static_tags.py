"""
Template tags para la gestión eficiente de archivos estáticos.
Proporciona utilidades para cargar JavaScript y CSS de manera optimizada.
"""
from django import template
from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe
import re

register = template.Library()

@register.simple_tag
def versioned_static(path):
    """
    Devuelve la URL de un archivo estático con versionado.
    
    Args:
        path: Ruta relativa al archivo estático
        
    Returns:
        str: URL versionada del archivo estático
    """
    static_url = static(path)
    
    # Si ya tiene una query string, no añadimos versión
    if '?' in static_url:
        return static_url
    
    # Añadir versión como parámetro de consulta
    version = getattr(settings, 'STATIC_VERSION', '')
    if version:
        return f"{static_url}?v={version}"
    
    return static_url


@register.simple_tag
def javascript_include(path, defer=False, async_load=False, module=False):
    """
    Incluye un archivo JavaScript con los atributos apropiados.
    
    Args:
        path: Ruta al archivo JavaScript
        defer: Si debe cargar en diferido
        async_load: Si debe cargar de forma asíncrona
        module: Si es un módulo ES6
        
    Returns:
        str: Tag de script HTML completo
    """
    script_attrs = []
    
    if defer:
        script_attrs.append('defer')
    if async_load:
        script_attrs.append('async')
    if module:
        script_attrs.append('type="module"')
    
    attrs_str = ' '.join(script_attrs)
    url = versioned_static(path)
    
    return mark_safe(f'<script src="{url}" {attrs_str}></script>')


@register.simple_tag
def stylesheet_include(path, media='all', prefetch=False):
    """
    Incluye un archivo CSS con los atributos apropiados.
    
    Args:
        path: Ruta al archivo CSS
        media: Tipo de medio (all, screen, print, etc.)
        prefetch: Si se debe precargar
        
    Returns:
        str: Tag de link HTML completo
    """
    url = versioned_static(path)
    prefetch_str = 'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"' if prefetch else 'rel="stylesheet"'
    
    return mark_safe(f'<link {prefetch_str} href="{url}" media="{media}">')


@register.simple_tag
def preload_resource(path, resource_type):
    """
    Precargar un recurso para mejorar el rendimiento.
    
    Args:
        path: Ruta al recurso
        resource_type: Tipo de recurso (script, style, font, image)
        
    Returns:
        str: Tag de link HTML para precarga
    """
    url = versioned_static(path)
    return mark_safe(f'<link rel="preload" href="{url}" as="{resource_type}">')


@register.filter
def with_webpack_hash(value):
    """
    Filtro para añadir un hash al nombre de un archivo para Webpack.
    
    Args:
        value: Nombre del archivo
        
    Returns:
        str: Nombre del archivo con hash
    """
    if not settings.DEBUG:
        # En producción, añadir hash usando Webpack
        name, ext = re.match(r"^(.+)(\..+)$", value).groups()
        return f"{name}.{getattr(settings, 'STATIC_VERSION', 'bundle')}{ext}"
    return value
