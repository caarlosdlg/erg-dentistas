"""
Template tags para renderizar imágenes responsivas optimizadas.
"""
from django import template
from django.conf import settings
from django.utils.safestring import mark_safe
import logging

register = template.Library()
logger = logging.getLogger(__name__)


@register.simple_tag
def responsive_image(image, alt_text="", css_class="", lazy=True, sizes="100vw"):
    """
    Renderiza una imagen con etiquetas <picture> y <source> para diferentes formatos y tamaños.
    
    Args:
        image: Instancia del modelo Image
        alt_text: Texto alternativo para la imagen
        css_class: Clases CSS adicionales
        lazy: True para usar lazy loading
        sizes: Atributo sizes para srcset (ej: '(max-width: 768px) 100vw, 50vw')
    
    Returns:
        String HTML para la imagen responsiva
    """
    if not image or not hasattr(image, 'image'):
        logger.warning(f"La imagen no existe o no es válida: {image}")
        return ''
    
    # Agregar loading="lazy" si corresponde
    lazy_attr = 'loading="lazy"' if lazy else ''
    
    # Verificar si la imagen está optimizada
    if not image.optimized:
        # Si no está optimizada, devolver la imagen original con lazy loading
        return mark_safe(
            f'<img src="{image.image.url}" alt="{alt_text}" '
            f'class="{css_class}" width="{image.width}" height="{image.height}" {lazy_attr}>'
        )
    
    # Construir srcset para cada formato
    srcsets = {
        'jpg': [],
        'webp': [],
        'avif': []
    }
    
    # Mapeo de tamaños y sus anchos
    sizes_map = {
        'thumbnail': 150,
        'xs': 320,
        'small': 480,
        'medium': 768,
        'large': 1024,
        'xl': 1440
    }
    
    # Construir srcsets para cada formato
    for size_name, width in sizes_map.items():
        # Original format (JPG/PNG)
        url_attr = f"{size_name}_url"
        if hasattr(image, url_attr) and getattr(image, url_attr):
            srcsets['jpg'].append(f"{getattr(image, url_attr)} {width}w")
        
        # WebP format
        webp_attr = f"{size_name}_webp_url"
        if hasattr(image, webp_attr) and getattr(image, webp_attr):
            srcsets['webp'].append(f"{getattr(image, webp_attr)} {width}w")
        
        # AVIF format
        avif_attr = f"{size_name}_avif_url"
        if hasattr(image, avif_attr) and getattr(image, avif_attr):
            srcsets['avif'].append(f"{getattr(image, avif_attr)} {width}w")
    
    # Construir el HTML para la imagen responsiva
    html = f'<picture>'
    
    # AVIF sources
    if srcsets['avif']:
        avif_srcset = ', '.join(srcsets['avif'])
        html += f'<source type="image/avif" srcset="{avif_srcset}" sizes="{sizes}">'
    
    # WebP sources
    if srcsets['webp']:
        webp_srcset = ', '.join(srcsets['webp'])
        html += f'<source type="image/webp" srcset="{webp_srcset}" sizes="{sizes}">'
    
    # Original format fallback
    if srcsets['jpg']:
        jpg_srcset = ', '.join(srcsets['jpg'])
        img_url = image.large_url if image.large_url else image.image.url
        html += (
            f'<img src="{img_url}" srcset="{jpg_srcset}" sizes="{sizes}" '
            f'alt="{alt_text}" class="{css_class}" '
            f'width="{image.width}" height="{image.height}" {lazy_attr}>'
        )
    else:
        # Fallback a la imagen original si no hay srcsets
        html += (
            f'<img src="{image.image.url}" alt="{alt_text}" '
            f'class="{css_class}" width="{image.width}" height="{image.height}" {lazy_attr}>'
        )
        
    html += '</picture>'
    
    return mark_safe(html)


@register.simple_tag
def lazyload_image(image, alt_text="", css_class="", sizes="100vw"):
    """
    Versión simplificada que siempre usa lazy loading.
    
    Args:
        image: Instancia del modelo Image
        alt_text: Texto alternativo para la imagen
        css_class: Clases CSS adicionales
        sizes: Atributo sizes para srcset
    
    Returns:
        String HTML para la imagen con lazy loading
    """
    return responsive_image(image, alt_text, css_class, True, sizes)


@register.simple_tag
def image_gallery(images, alt_prefix="Image", css_class="gallery-img", cols=4):
    """
    Renderiza una galería de imágenes responsivas.
    
    Args:
        images: Lista de instancias del modelo Image
        alt_prefix: Prefijo para los textos alternativos
        css_class: Clase CSS para cada imagen
        cols: Número de columnas para el grid
    
    Returns:
        String HTML para la galería de imágenes
    """
    if not images:
        return ''
    
    gallery_css = f"image-gallery image-gallery-cols-{cols}"
    html = f'<div class="{gallery_css}">'
    
    for i, image in enumerate(images):
        alt = f"{alt_prefix} {i+1}"
        html += f'<div class="gallery-item">'
        html += responsive_image(image, alt, css_class, True)
        html += '</div>'
        
    html += '</div>'
    
    return mark_safe(html)
