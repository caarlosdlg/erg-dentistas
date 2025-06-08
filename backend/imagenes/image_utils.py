"""
Utilidades para el procesamiento y optimización de imágenes.

Este módulo proporciona funciones para:
- Redimensionar imágenes a diferentes tamaños para distintos usos
- Convertir imágenes a formatos WebP y AVIF para mejor compresión
- Generar thumbnails
- Optimizar imágenes para web (tamaño y calidad)
- Soporte para lazy loading y responsive images
"""
import os
import io
from PIL import Image, ImageOps
import time
import logging
from concurrent.futures import ThreadPoolExecutor
from django.conf import settings
from django.core.files.base import ContentFile
import uuid
from pathlib import Path
from functools import lru_cache

# Importar funcionalidad de recorte inteligente
try:
    from imagenes.smart_crop import smart_crop_and_resize, process_smart_thumbnail
    SMART_CROP_SUPPORT = True
except ImportError:
    SMART_CROP_SUPPORT = False
    logging.warning("El recorte inteligente no está disponible. Instala las dependencias necesarias para habilitarlo.")

# Configuración de logging
logger = logging.getLogger(__name__)

# Intentar importar soporte para AVIF si está disponible
try:
    from pillow_avif import AvifImagePlugin
    AVIF_SUPPORT = True
except ImportError:
    AVIF_SUPPORT = False
    logger.warning("El soporte para AVIF no está disponible. Instala pillow-avif-plugin para habilitarlo.")


@lru_cache(maxsize=32)
def get_image_format_options():
    """
    Obtiene las opciones de formato de imagen con soporte en caché.
    
    Returns:
        dict: Diccionario con las opciones de formatos disponibles y su configuración
    """
    formats = {
        'JPEG': {'quality': 85, 'optimize': True},
        'PNG': {'optimize': True},
        'WEBP': {'quality': 80, 'method': 6, 'lossless': False},
    }
    
    if AVIF_SUPPORT:
        formats['AVIF'] = {'quality': 70, 'speed': 6}
        
    return formats


def create_resized_image(img, output_size, format_name='JPEG', quality=None):
    """
    Crea una versión redimensionada de la imagen con optimizaciones.
    
    Args:
        img (PIL.Image): Imagen de origen
        output_size (tuple): Tamaño deseado (ancho, alto) o (ancho, None) para mantener proporción
        format_name (str): Formato de salida ('JPEG', 'PNG', 'WEBP', 'AVIF', etc.)
        quality (int): Calidad de compresión (1-100), anula la configuración por defecto
    
    Returns:
        io.BytesIO: Imagen redimensionada como objeto BytesIO
    """
    width, height = output_size
    
    # Si solo se proporciona ancho, calcular alto proporcionalmente
    if height is None:
        ratio = width / img.width
        height = int(img.height * ratio)
    
    # Redimensionar la imagen
    resized_img = img.copy()
    resized_img = ImageOps.exif_transpose(resized_img)  # Preservar orientación EXIF
    resized_img = resized_img.resize((width, height), Image.Resampling.LANCZOS)
    
    # Convertir a RGB si es RGBA y el formato de salida necesita RGB
    if format_name in ('JPEG', 'AVIF') and resized_img.mode == 'RGBA':
        resized_img = resized_img.convert('RGB')
    
    # Obtener opciones de formato
    format_options = get_image_format_options().get(format_name, {}).copy()
    if quality is not None:
        format_options['quality'] = quality
    
    # Guardar la imagen en memoria
    output_io = io.BytesIO()
    resized_img.save(output_io, format=format_name, **format_options)
    output_io.seek(0)
    
    # Liberar memoria
    resized_img.close()
    
    return output_io


def convert_to_webp(img, quality=80):
    """
    Convierte una imagen a formato WebP.
    
    Args:
        img (PIL.Image): Imagen de origen
        quality (int): Calidad de compresión (1-100)
    
    Returns:
        io.BytesIO: Imagen convertida como objeto BytesIO
    """
    # Guardar en formato WebP
    output_io = io.BytesIO()
    
    # WebP puede manejar transparencia, no es necesario convertir de RGBA a RGB
    img.save(output_io, format='WEBP', quality=quality, method=6)
    output_io.seek(0)
    
    return output_io


def convert_to_avif(img, quality=70):
    """
    Convierte una imagen a formato AVIF si está soportado.
    
    Args:
        img (PIL.Image): Imagen de origen
        quality (int): Calidad de compresión (1-100)
    
    Returns:
        io.BytesIO: Imagen convertida como objeto BytesIO, o None si AVIF no está soportado
    """
    if not AVIF_SUPPORT:
        return None
    
    # El modo RGB es obligatorio para AVIF
    if img.mode == 'RGBA':
        img = img.convert('RGB')
        
    output_io = io.BytesIO()
    img.save(output_io, format='AVIF', quality=quality, speed=6)
    output_io.seek(0)
    
    return output_io


def process_variation(params):
    """
    Función auxiliar para procesar una variación de imagen en paralelo.
    
    Args:
        params (dict): Parámetros para procesar la variación
            {
                'img': Imagen PIL,
                'size': Tamaño destino (ancho, alto),
                'original_format': Formato original de la imagen,
                'base_path': Directorio base para guardar,
                'filename': Nombre de archivo base,
                'variation_name': Nombre de la variación (thumbnail, medium, etc.)
            }
    
    Returns:
        dict: Diccionario con las rutas resultantes para esta variación
    """
    img = params['img']
    size = params['size']
    original_format = params['original_format']
    base_path = params['base_path']
    filename = params['filename']
    variation_name = params['variation_name']
    extension = params['extension']
    
    result = {}
    
    # Generar versión original redimensionada
    resized_io = create_resized_image(img, size, format_name=original_format)
    variation_path = os.path.join(base_path, f"{filename}_{variation_name}{extension}")
    with open(variation_path, 'wb') as f:
        f.write(resized_io.getvalue())
    result[variation_name] = variation_path
    
    # Generar versión WebP
    webp_io = convert_to_webp(ImageOps.exif_transpose(img.resize(size, Image.Resampling.LANCZOS)))
    webp_path = os.path.join(base_path, f"{filename}_{variation_name}.webp")
    with open(webp_path, 'wb') as f:
        f.write(webp_io.getvalue())
    result[f'{variation_name}_webp'] = webp_path
    
    # Generar versión AVIF si está soportada
    if AVIF_SUPPORT:
        avif_io = convert_to_avif(ImageOps.exif_transpose(img.resize(size, Image.Resampling.LANCZOS)))
        if avif_io:
            avif_path = os.path.join(base_path, f"{filename}_{variation_name}.avif")
            with open(avif_path, 'wb') as f:
                f.write(avif_io.getvalue())
            result[f'{variation_name}_avif'] = avif_path
    
    return result


def generate_image_variations(original_image_path):
    """
    Genera diferentes variaciones de una imagen (thumbnails, WebP, AVIF, etc.) en paralelo.
    
    Args:
        original_image_path (str): Ruta a la imagen original
    
    Returns:
        dict: Diccionario con rutas a las diferentes variaciones
    """
    start_time = time.time()
    
    # Cargar la imagen con PIL
    img = Image.open(original_image_path)
    
    # Obtener información de la ruta
    path = Path(original_image_path)
    directory = path.parent
    filename = path.stem
    extension = path.suffix.lower()
    
    # Definir los tamaños para diferentes variaciones
    variations = {
        'thumbnail': (150, None),      # Ancho de 150px, altura proporcional 
        'xs': (320, None),             # Móviles pequeños
        'small': (480, None),          # Móviles
        'medium': (768, None),         # Tablets/móviles grandes
        'large': (1024, None),         # Escritorios pequeños/tablets horizontales
        'xl': (1440, None),            # Escritorios grandes (opcional)
    }
    
    # Resultado inicial
    result_paths = {'original': original_image_path}
    
    # Preparar parámetros para procesamiento en paralelo
    params_list = []
    for variation_name, size in variations.items():
        params = {
            'img': img,
            'size': size,
            'original_format': img.format,
            'base_path': directory,
            'filename': filename,
            'variation_name': variation_name,
            'extension': extension
        }
        params_list.append(params)
    
    # Procesar en paralelo
    with ThreadPoolExecutor() as executor:
        results = executor.map(process_variation, params_list)
    
    # Combinar resultados
    for result in results:
        result_paths.update(result)
    
    # Cerrar la imagen para liberar memoria
    img.close()
    
    logger.debug(f"Generadas {len(variations)} variaciones en {time.time() - start_time:.2f} segundos")
    
    return result_paths


def process_image(image_field, instance=None, commit=True):
    """
    Procesa una imagen cargada en un ImageField, generando versiones optimizadas.
    
    Args:
        image_field (ImageField): El campo de imagen de Django
        instance (Model): Instancia del modelo (opcional)
        commit (bool): Si guardar los cambios a la base de datos
    
    Returns:
        dict: Diccionario con información de las imágenes generadas
    """
    if not image_field:
        return None
    
    start_time = time.time()
    
    # Guardar temporalmente si es un campo no guardado
    if not image_field.name:
        if instance:
            instance.save()
        else:
            return None
    
    # Abrir la imagen original con PIL
    image_path = image_field.path
    img = Image.open(image_path)
    
    # Definir tamaños para las diferentes variaciones
    variations = {
        'thumbnail': (150, None),      # Ancho de 150px, altura proporcional 
        'xs': (320, None),             # Móviles pequeños
        'small': (480, None),          # Móviles
        'medium': (768, None),         # Tablets/móviles grandes
        'large': (1024, None),         # Escritorios pequeños/tablets horizontales
        'xl': (1440, None),            # Escritorios grandes (opcional)
    }
    
    # Obtener información del archivo
    filename = os.path.basename(image_field.name)
    name, ext = os.path.splitext(filename)
    base_path = os.path.dirname(image_field.name)
    
    # Preparar diccionario de resultados
    result = {'original': image_field.url}
    
    # Lista para almacenar tareas
    tasks = []
    
    # Preparar tareas para procesamiento paralelo
    for variation_name, size in variations.items():
        # Obtener rutas relativas para las variaciones
        resized_filename = f"{name}_{variation_name}{ext}"
        webp_filename = f"{name}_{variation_name}.webp"
        avif_filename = f"{name}_{variation_name}.avif"
        
        resized_relative_path = os.path.join(base_path, resized_filename)
        webp_relative_path = os.path.join(base_path, webp_filename)
        avif_relative_path = os.path.join(base_path, avif_filename)
        
        # Generar rutas absolutas para guardar los archivos
        resized_abs_path = os.path.join(settings.MEDIA_ROOT, resized_relative_path)
        webp_abs_path = os.path.join(settings.MEDIA_ROOT, webp_relative_path)
        avif_abs_path = os.path.join(settings.MEDIA_ROOT, avif_relative_path)
        
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(resized_abs_path), exist_ok=True)
        
        tasks.append({
            'variation_name': variation_name,
            'size': size,
            'img': img,
            'format': img.format.upper(),
            'resized_abs_path': resized_abs_path,
            'webp_abs_path': webp_abs_path,
            'avif_abs_path': avif_abs_path,
            'resized_url': os.path.join(settings.MEDIA_URL, resized_relative_path).replace('\\', '/'),
            'webp_url': os.path.join(settings.MEDIA_URL, webp_relative_path).replace('\\', '/'),
            'avif_url': os.path.join(settings.MEDIA_URL, avif_relative_path).replace('\\', '/'),
        })
    
    # Procesar las tareas en paralelo
    def process_task(task):
        # Generar versión redimensionada
        resized_io = create_resized_image(task['img'], task['size'], format_name=task['format'])
        with open(task['resized_abs_path'], 'wb') as f:
            f.write(resized_io.getvalue())
        
        # Generar versión WebP
        webp_io = convert_to_webp(ImageOps.exif_transpose(task['img'].resize(task['size'], Image.Resampling.LANCZOS)))
        with open(task['webp_abs_path'], 'wb') as f:
            f.write(webp_io.getvalue())
        
        # Generar versión AVIF si está soportada
        if AVIF_SUPPORT:
            avif_io = convert_to_avif(ImageOps.exif_transpose(task['img'].resize(task['size'], Image.Resampling.LANCZOS)))
            if avif_io:
                with open(task['avif_abs_path'], 'wb') as f:
                    f.write(avif_io.getvalue())
                return {
                    'variation_name': task['variation_name'],
                    'url': task['resized_url'],
                    'webp_url': task['webp_url'],
                    'avif_url': task['avif_url'],
                }
        
        return {
            'variation_name': task['variation_name'],
            'url': task['resized_url'],
            'webp_url': task['webp_url'],
        }
    
    # Ejecutar tareas en paralelo
    with ThreadPoolExecutor() as executor:
        task_results = list(executor.map(process_task, tasks))
    
    # Actualizar resultado con las URLs
    for task_result in task_results:
        variation_name = task_result['variation_name']
        result[variation_name] = task_result['url']
        result[f'{variation_name}_webp'] = task_result['webp_url']
        if 'avif_url' in task_result:
            result[f'{variation_name}_avif'] = task_result['avif_url']
    
    # Cerrar la imagen para liberar memoria
    img.close()
    
    logger.debug(f"Procesadas {len(variations)} variaciones en {time.time() - start_time:.2f} segundos")
    
    return result


def smart_thumbnail_process(image_field, instance=None, commit=True, target_size=(150, 150)):
    """
    Procesa una imagen cargada en un ImageField, generando una versión optimizada con recorte inteligente.
    
    Args:
        image_field (ImageField): El campo de imagen de Django
        instance (Model): Instancia del modelo (opcional)
        commit (bool): Si guardar los cambios a la base de datos
        target_size (tuple): Tamaño objetivo para la miniatura (ancho, alto)
    
    Returns:
        str: URL de la imagen generada, o None si no se pudo procesar
    """
    if not image_field:
        return None
    
    start_time = time.time()
    
    # Guardar temporalmente si es un campo no guardado
    if not image_field.name:
        if instance:
            instance.save()
        else:
            return None
    
    # Abrir la imagen original con PIL
    image_path = image_field.path
    img = Image.open(image_path)
    
    # Obtener información del archivo
    filename = os.path.basename(image_field.name)
    name, ext = os.path.splitext(filename)
    base_path = os.path.dirname(image_field.name)
    
    # Ruta para la imagen con recorte inteligente
    smart_thumbnail_path = os.path.join(base_path, f"{name}_smart_thumbnail{ext}")
    smart_thumbnail_webp_path = os.path.join(base_path, f"{name}_smart_thumbnail.webp")
    smart_thumbnail_avif_path = os.path.join(base_path, f"{name}_smart_thumbnail.avif")
    
    # Asegurar que el directorio existe
    os.makedirs(os.path.dirname(smart_thumbnail_path), exist_ok=True)
    
    # Procesar con recorte inteligente
    if SMART_CROP_SUPPORT:
        try:
            # Usar recorte inteligente y redimensionar
            img_cropped = smart_crop_and_resize(img, target_size[0], target_size[1])
            
            # Guardar imagen recortada en formato original
            img_cropped.save(smart_thumbnail_path, format=img.format)
            
            # Guardar imagen recortada en formato WebP
            webp_io = convert_to_webp(img_cropped)
            with open(smart_thumbnail_webp_path, 'wb') as f:
                f.write(webp_io.getvalue())
            
            # Guardar imagen recortada en formato AVIF si está soportado
            if AVIF_SUPPORT:
                avif_io = convert_to_avif(img_cropped)
                if avif_io:
                    with open(smart_thumbnail_avif_path, 'wb') as f:
                        f.write(avif_io.getvalue())
            
            # Cerrar imágenes para liberar memoria
            img_cropped.close()
            
            logger.debug(f"Generada miniatura con recorte inteligente en {time.time() - start_time:.2f} segundos")
            
            return {
                'original': image_field.url,
                'smart_thumbnail': smart_thumbnail_path,
                'smart_thumbnail_webp': smart_thumbnail_webp_path,
                'smart_thumbnail_avif': smart_thumbnail_avif_path,
            }
        except Exception as e:
            logger.error(f"Error al procesar recorte inteligente: {e}")
            return None
    
    return None
