"""
Utilidades para el recorte inteligente de imágenes usando detección de objetos.

Este módulo proporciona funciones para:
- Detectar regiones de interés en imágenes
- Realizar recortes inteligentes preservando el sujeto principal
- Optimizar miniaturas para distintos formatos (cuadrado, panorámico, etc.)
"""
import io
import numpy as np
from PIL import Image, ImageOps
import logging
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor

# Intentar importar OpenCV para detección avanzada
try:
    import cv2
    OPENCV_SUPPORT = True
except ImportError:
    OPENCV_SUPPORT = False
    logging.warning("OpenCV no está disponible. Se usará recorte simple basado en entropía.")

# Intentar importar face_recognition para detección facial
try:
    import face_recognition
    FACE_DETECTION = True
except ImportError:
    FACE_DETECTION = False
    logging.warning("La biblioteca face_recognition no está disponible. No se detectarán rostros.")

logger = logging.getLogger(__name__)


def calculate_entropy(img_array):
    """
    Calcula la entropía de una región de imagen utilizando histograma.
    Regiones con más información (detalles) tienen mayor entropía.
    
    Args:
        img_array: Array NumPy representando la imagen en escala de grises
        
    Returns:
        float: Valor de entropía
    """
    histogram = np.histogram(img_array, bins=256, range=(0, 256))[0]
    histogram_length = sum(histogram)
    
    samples_probability = [float(h) / histogram_length for h in histogram]
    entropy = -sum([p * np.log2(p) for p in samples_probability if p != 0])
    
    return entropy


def find_best_crop(img, target_width, target_height):
    """
    Encuentra el mejor recorte para una imagen en base a entropía y detección de objetos.
    
    Args:
        img: Imagen PIL
        target_width: Ancho objetivo del recorte
        target_height: Alto objetivo del recorte
        
    Returns:
        tuple: Coordenadas del recorte (left, top, right, bottom)
    """
    img_width, img_height = img.size
    
    # Si la imagen es más pequeña que el objetivo, no recortamos
    if img_width <= target_width and img_height <= target_height:
        return (0, 0, img_width, img_height)
    
    # Calcular relación de aspecto
    target_ratio = target_width / target_height
    img_ratio = img_width / img_height
    
    # Detectar rostros si está disponible
    face_locations = []
    if FACE_DETECTION:
        try:
            # Convertir a RGB si es necesario
            if img.mode != 'RGB':
                rgb_img = img.convert('RGB')
            else:
                rgb_img = img
                
            # Convertir a NumPy array
            img_array = np.array(rgb_img)
            
            # Reducir tamaño para acelerar la detección
            scale = min(1.0, 640 / max(img_width, img_height))
            if scale < 1.0:
                small_img = cv2.resize(img_array, (0, 0), fx=scale, fy=scale)
            else:
                small_img = img_array
                
            # Detectar rostros
            face_locations = face_recognition.face_locations(small_img)
            
            # Ajustar coordenadas al tamaño original
            if scale < 1.0:
                face_locations = [(int(top/scale), int(right/scale),
                                  int(bottom/scale), int(left/scale))
                                  for top, right, bottom, left in face_locations]
                                  
            logger.debug(f"Detectados {len(face_locations)} rostros en la imagen")
        except Exception as e:
            logger.error(f"Error en la detección de rostros: {e}")
            face_locations = []
    
    # Si encontramos rostros, priorizamos esa área
    if face_locations:
        # Calcular un recuadro que incluya todos los rostros con margen
        margin = 0.2  # 20% de margen
        
        # Extraer coordenadas de todos los rostros
        tops = [loc[0] for loc in face_locations]
        rights = [loc[1] for loc in face_locations]
        bottoms = [loc[2] for loc in face_locations]
        lefts = [loc[3] for loc in face_locations]
        
        # Calcular el área que contiene todos los rostros
        face_left = max(0, min(lefts) - int(img_width * margin))
        face_top = max(0, min(tops) - int(img_height * margin))
        face_right = min(img_width, max(rights) + int(img_width * margin))
        face_bottom = min(img_height, max(bottoms) + int(img_height * margin))
        
        # Calcular centro de interés
        center_x = (face_left + face_right) // 2
        center_y = (face_top + face_bottom) // 2
    else:
        # Si no hay rostros, usar OpenCV para detectar otros objetos
        if OPENCV_SUPPORT:
            try:
                # Convertir a escala de grises
                if img.mode != 'RGB':
                    rgb_img = img.convert('RGB')
                else:
                    rgb_img = img
                    
                # Convertir a NumPy array
                img_array = np.array(rgb_img)
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                
                # Detectar bordes
                edges = cv2.Canny(gray, 100, 200)
                
                # Encontrar contornos
                contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                
                # Filtrar contornos pequeños
                significant_contours = [c for c in contours if cv2.contourArea(c) > 100]
                
                if significant_contours:
                    # Crear una máscara para los contornos
                    mask = np.zeros_like(gray)
                    cv2.drawContours(mask, significant_contours, -1, 255, -1)
                    
                    # Calcular momentos y centro de masa
                    M = cv2.moments(mask)
                    if M["m00"] != 0:
                        center_x = int(M["m10"] / M["m00"])
                        center_y = int(M["m01"] / M["m00"])
                    else:
                        # Fallback al centro de la imagen
                        center_x, center_y = img_width // 2, img_height // 2
                else:
                    # Fallback al centro de la imagen
                    center_x, center_y = img_width // 2, img_height // 2
            except Exception as e:
                logger.error(f"Error en la detección de objetos: {e}")
                # Fallback al centro de la imagen
                center_x, center_y = img_width // 2, img_height // 2
        else:
            # Si no está disponible OpenCV, usar método basado en entropía por regiones
            # Convertir imagen a escala de grises
            gray_img = img.convert('L')
            gray_array = np.array(gray_img)
            
            # Dividir la imagen en una cuadrícula 3x3
            h_step, v_step = img_width // 3, img_height // 3
            regions = []
            
            for i in range(3):
                for j in range(3):
                    left = i * h_step
                    top = j * v_step
                    right = left + h_step
                    bottom = top + v_step
                    
                    # Extraer región
                    region = gray_array[top:bottom, left:right]
                    entropy = calculate_entropy(region)
                    
                    regions.append((left, top, entropy))
            
            # Encontrar región con mayor entropía
            best_region = max(regions, key=lambda r: r[2])
            
            # Centro de la región más interesante
            center_x = best_region[0] + h_step // 2
            center_y = best_region[1] + v_step // 2
    
    # Calcular las dimensiones del recorte
    if target_ratio > img_ratio:
        # El recorte es más ancho que la imagen original
        crop_height = int(img_width / target_ratio)
        # Centrar verticalmente alrededor del punto de interés
        crop_top = center_y - crop_height // 2
        # Ajustar si se sale de los límites
        if crop_top < 0:
            crop_top = 0
        elif crop_top + crop_height > img_height:
            crop_top = img_height - crop_height
            
        return (0, crop_top, img_width, crop_top + crop_height)
    else:
        # El recorte es más alto que la imagen original
        crop_width = int(img_height * target_ratio)
        # Centrar horizontalmente alrededor del punto de interés
        crop_left = center_x - crop_width // 2
        # Ajustar si se sale de los límites
        if crop_left < 0:
            crop_left = 0
        elif crop_left + crop_width > img_width:
            crop_left = img_width - crop_width
            
        return (crop_left, 0, crop_left + crop_width, img_height)


def smart_crop_and_resize(img, output_size):
    """
    Recorta inteligentemente una imagen y luego la redimensiona.
    
    Args:
        img: Imagen PIL
        output_size: Tupla (ancho, alto) para el tamaño final
        
    Returns:
        PIL.Image: Imagen recortada y redimensionada
    """
    target_width, target_height = output_size
    
    # Obtener el mejor recorte
    crop_box = find_best_crop(img, target_width, target_height)
    
    # Recortar la imagen
    cropped_img = img.crop(crop_box)
    
    # Redimensionar la imagen recortada
    resized_img = cropped_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    return resized_img


def process_smart_thumbnail(img, size, format_name='JPEG', quality=None):
    """
    Crea un thumbnail inteligente preservando la región de interés.
    
    Args:
        img: Imagen PIL
        size: Tamaño deseado (ancho, alto)
        format_name: Formato de salida
        quality: Calidad de compresión
        
    Returns:
        io.BytesIO: Imagen procesada como objeto BytesIO
    """
    from imagenes.image_utils import get_image_format_options
    
    # Asegurar que tenemos tupla de tamaño
    if isinstance(size, int):
        size = (size, size)
        
    # Recortar y redimensionar
    processed_img = smart_crop_and_resize(img, size)
    
    # Preservar la orientación EXIF
    processed_img = ImageOps.exif_transpose(processed_img)
    
    # Convertir a RGB si es RGBA y el formato lo requiere
    if format_name in ('JPEG', 'AVIF') and processed_img.mode == 'RGBA':
        processed_img = processed_img.convert('RGB')
    
    # Obtener opciones de formato
    format_options = get_image_format_options().get(format_name, {}).copy()
    if quality is not None:
        format_options['quality'] = quality
    
    # Guardar la imagen en memoria
    output_io = io.BytesIO()
    processed_img.save(output_io, format=format_name, **format_options)
    output_io.seek(0)
    
    # Liberar memoria
    processed_img.close()
    
    return output_io


def batch_smart_crop(image_paths, output_sizes, output_dir=None):
    """
    Procesa un lote de imágenes con recorte inteligente.
    
    Args:
        image_paths: Lista de rutas a imágenes
        output_sizes: Diccionario de tamaños {nombre: (ancho, alto)}
        output_dir: Directorio de salida (opcional)
        
    Returns:
        dict: Resultados del procesamiento
    """
    results = {}
    
    # Procesar cada imagen
    for img_path in image_paths:
        try:
            img = Image.open(img_path)
            img_name = img_path.split("/")[-1].split(".")[0]
            
            # Procesar cada tamaño
            img_results = {}
            for name, size in output_sizes.items():
                output_io = process_smart_thumbnail(img, size)
                
                # Si se proporcionó un directorio de salida, guardar allí
                if output_dir:
                    output_path = f"{output_dir}/{img_name}_{name}.jpg"
                    with open(output_path, "wb") as f:
                        f.write(output_io.getvalue())
                    img_results[name] = output_path
                else:
                    img_results[name] = output_io
            
            results[img_path] = img_results
            img.close()
        except Exception as e:
            logger.error(f"Error procesando {img_path}: {e}")
            results[img_path] = {"error": str(e)}
    
    return results
