"""
Script de ejemplo para mostrar cómo interactuar con la API de imágenes optimizadas.

Este script muestra:
1. Cómo subir imágenes al sistema
2. Cómo obtener imágenes con sus diferentes versiones optimizadas
   - Múltiples tamaños (thumbnail, xs, small, medium, large, xl)
   - Múltiples formatos (original, WebP, AVIF)
3. Cómo regenerar versiones optimizadas de imágenes existentes
4. Cómo trabajar con imágenes responsivas en el frontend
"""

import requests
import os
import uuid
import argparse
from pprint import pprint

# URL base de la API (ajustar a la URL real en producción)
API_BASE = "http://localhost:8000/api/images"

def upload_image(image_path, content_type, object_id, title=None, description=None, token=None):
    """
    Sube una imagen a la API.
    
    Args:
        image_path (str): Ruta al archivo de imagen
        content_type (str): Tipo de contenido (paciente, dentista, etc.)
        object_id (str): ID del objeto relacionado (UUID)
        title (str, optional): Título de la imagen
        description (str, optional): Descripción de la imagen
        token (str, optional): Token de autenticación si es necesario
    
    Returns:
        dict: Respuesta de la API como diccionario con todas las versiones optimizadas
    """
    # Verificar que el archivo existe
    if not os.path.exists(image_path):
        print(f"Error: El archivo {image_path} no existe")
        return None
    
    # Preparar encabezados con token si se proporciona
    headers = {}
    if token:
        headers['Authorization'] = f'Token {token}'
    
    # Preparar datos para la subida
    data = {
        'content_type': content_type,
        'object_id': object_id,
    }
    
    if title:
        data['title'] = title
    
    if description:
        data['description'] = description
    
    # Preparar el archivo
    files = {
        'image': (os.path.basename(image_path), open(image_path, 'rb'))
    }
    
    try:
        # Realizar la solicitud POST a /api/images/upload/
        response = requests.post(
            f"{API_BASE}/upload/",
            data=data,
            files=files,
            headers=headers
        )
        
        # Cerrar el archivo
        files['image'][1].close()
        
        # Verificar si la solicitud fue exitosa
        if response.status_code == 201:  # 201 Created
            print("Imagen subida exitosamente!")
            return response.json()
        else:
            print(f"Error al subir la imagen. Código: {response.status_code}")
            print(f"Mensaje: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        return None

def get_images(content_type=None, object_id=None, token=None):
    """
    Obtiene imágenes de la API, opcionalmente filtradas por tipo o ID de objeto.
    
    Args:
        content_type (str, optional): Filtrar por tipo de contenido
        object_id (str, optional): Filtrar por ID de objeto
        token (str, optional): Token de autenticación si es necesario
        
    Returns:
        list: Lista de imágenes
    """
    # Construir URL con parámetros de consulta
    url = API_BASE
    params = {}
    
    if content_type:
        params['content_type'] = content_type
    
    if object_id:
        params['object_id'] = object_id
    
    # Preparar encabezados con token si se proporciona
    headers = {}
    if token:
        headers['Authorization'] = f'Token {token}'
    
    try:
        # Realizar la solicitud GET
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error al obtener imágenes. Código: {response.status_code}")
            print(f"Mensaje: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        return None

def optimize_image(image_id, token=None):
    """
    Solicita la regeneración de versiones optimizadas para una imagen específica.
    
    Args:
        image_id (str): ID de la imagen (UUID)
        token (str, optional): Token de autenticación si es necesario
        
    Returns:
        dict: Resultado de la operación
    """
    # Preparar encabezados con token si se proporciona
    headers = {}
    if token:
        headers['Authorization'] = f'Token {token}'
    
    try:
        # Realizar la solicitud POST a /api/images/{id}/optimize/
        response = requests.post(
            f"{API_BASE}/{image_id}/optimize/",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error al optimizar la imagen. Código: {response.status_code}")
            print(f"Mensaje: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        return None

def batch_optimize_images(content_type=None, object_id=None, token=None):
    """
    Solicita la regeneración de versiones optimizadas para un conjunto de imágenes.
    
    Args:
        content_type (str, optional): Filtrar por tipo de contenido
        object_id (str, optional): Filtrar por ID de objeto
        token (str, optional): Token de autenticación si es necesario
        
    Returns:
        dict: Estadísticas de la operación
    """
    # Preparar encabezados con token si se proporciona
    headers = {}
    if token:
        headers['Authorization'] = f'Token {token}'
    
    # Preparar datos para la solicitud
    data = {}
    if content_type:
        data['content_type'] = content_type
    if object_id:
        data['object_id'] = object_id
    
    try:
        # Realizar la solicitud POST a /api/images/batch-optimize/
        response = requests.post(
            f"{API_BASE}/batch-optimize/",
            json=data,
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error al optimizar las imágenes. Código: {response.status_code}")
            print(f"Mensaje: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error durante la solicitud: {e}")
        return None

# Ejemplo de uso
if __name__ == "__main__":
    # Configuración del parser para línea de comandos
    parser = argparse.ArgumentParser(description="Cliente para la API de imágenes del ERP Dental")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")
    
    # Comando para subir una imagen
    upload_parser = subparsers.add_parser("upload", help="Subir una imagen")
    upload_parser.add_argument("--file", "-f", required=True, help="Ruta al archivo de imagen")
    upload_parser.add_argument("--type", "-t", required=True, choices=['paciente', 'dentista', 'tratamiento', 'equipo', 'documento', 'otro'], help="Tipo de contenido")
    upload_parser.add_argument("--id", required=True, help="ID del objeto relacionado (UUID)")
    upload_parser.add_argument("--title", help="Título de la imagen")
    upload_parser.add_argument("--description", help="Descripción de la imagen")
    upload_parser.add_argument("--token", help="Token de autenticación")
    
    # Comando para listar imágenes
    list_parser = subparsers.add_parser("list", help="Listar imágenes")
    list_parser.add_argument("--type", "-t", help="Filtrar por tipo de contenido")
    list_parser.add_argument("--id", help="Filtrar por ID de objeto")
    list_parser.add_argument("--token", help="Token de autenticación")
    
    # Comando para optimizar una imagen
    optimize_parser = subparsers.add_parser("optimize", help="Optimizar una imagen")
    optimize_parser.add_argument("--id", required=True, help="ID de la imagen (UUID)")
    optimize_parser.add_argument("--token", help="Token de autenticación")
    
    # Comando para optimizar múltiples imágenes
    batch_parser = subparsers.add_parser("batch-optimize", help="Optimizar múltiples imágenes")
    batch_parser.add_argument("--type", "-t", help="Filtrar por tipo de contenido")
    batch_parser.add_argument("--id", help="Filtrar por ID de objeto")
    batch_parser.add_argument("--token", help="Token de autenticación")
    
    # Procesar argumentos
    args = parser.parse_args()
    
    # Ejecutar comando
    if args.command == "upload":
        result = upload_image(
            image_path=args.file,
            content_type=args.type,
            object_id=args.id,
            title=args.title,
            description=args.description,
            token=args.token
        )
        if result:
            print("Imagen subida exitosamente:")
            pprint(result)
    
    elif args.command == "list":
        images = get_images(
            content_type=args.type,
            object_id=args.id,
            token=args.token
        )
        if images:
            print(f"Se encontraron {images['count']} imágenes:")
            for img in images['results']:
                print(f"- {img['id']}: {img.get('title', 'Sin título')} ({img['content_type']})")
    
    elif args.command == "optimize":
        result = optimize_image(
            image_id=args.id,
            token=args.token
        )
        if result:
            print("Imagen optimizada exitosamente:")
            pprint(result)
    
    elif args.command == "batch-optimize":
        result = batch_optimize_images(
            content_type=args.type,
            object_id=args.id,
            token=args.token
        )
        if result:
            print(f"Proceso de optimización completado:")
            pprint(result)
    
    else:
        # Este bloque se ejecuta si no se especifica un comando
        # Para utilizar este script de forma tradicional, necesitarás:
        # 1. Un token de autenticación (o comentar la línea si no es necesario)
        # 2. Una imagen local para subir
        # 3. Un UUID válido de un objeto existente (paciente, dentista, etc.)
    
    # Ejemplo de subida de imagen de paciente
    token = "tu_token_aqui"  # Obtener de la API de autenticación
    
    # UUID del paciente al que se asociará la imagen
    paciente_id = str(uuid.uuid4())  # Reemplazar con un UUID real
    
    # Ruta a una imagen de ejemplo
    image_path = "ruta/a/imagen/ejemplo.jpg"  # Reemplazar con ruta real
    
    # Subir la imagen
    result = upload_image(
        image_path=image_path,
        content_type='paciente',
        object_id=paciente_id,
        title="Radiografía dental",
        description="Radiografía panorámica tomada el 7 de junio de 2025",
        token=token
    )
    
    if result:
        print(f"ID de la imagen: {result['id']}")
        print(f"URL original: {result['image_url']}")
        
        print("\n--- Versiones optimizadas ---")
        
        # Thumbnail (150px)
        print(f"\nThumbnail (150px):")
        print(f"  - Original: {result['thumbnail_url']}")
        print(f"  - WebP: {result['thumbnail_webp_url']}")
        print(f"  - AVIF: {result.get('thumbnail_avif_url', 'No disponible')}")
        
        # XS (320px - móviles pequeños)
        print(f"\nXS (320px - móviles pequeños):")
        print(f"  - Original: {result.get('xs_url', 'No disponible')}")
        print(f"  - WebP: {result.get('xs_webp_url', 'No disponible')}")
        print(f"  - AVIF: {result.get('xs_avif_url', 'No disponible')}")
        
        # Small (480px - móviles)
        print(f"\nSmall (480px - móviles):")
        print(f"  - Original: {result.get('small_url', 'No disponible')}")
        print(f"  - WebP: {result.get('small_webp_url', 'No disponible')}")
        print(f"  - AVIF: {result.get('small_avif_url', 'No disponible')}")
        
        # Medium (768px - tablets)
        print(f"\nMedium (768px - tablets):")
        print(f"  - Original: {result['medium_url']}")
        print(f"  - WebP: {result['medium_webp_url']}")
        print(f"  - AVIF: {result.get('medium_avif_url', 'No disponible')}")
        
        # Large (1024px - escritorios pequeños)
        print(f"\nLarge (1024px - escritorios pequeños):")
        print(f"  - Original: {result['large_url']}")
        print(f"  - WebP: {result['large_webp_url']}")
        print(f"  - AVIF: {result.get('large_avif_url', 'No disponible')}")
        
        # XL (1440px - escritorios grandes)
        print(f"\nXL (1440px - escritorios grandes):")
        print(f"  - Original: {result.get('xl_url', 'No disponible')}")
        print(f"  - WebP: {result.get('xl_webp_url', 'No disponible')}")
        print(f"  - AVIF: {result.get('xl_avif_url', 'No disponible')}")
        
        # Información del srcset
        if 'srcset' in result:
            print("\n--- Atributo srcset para HTML responsivo ---")
            print(f"Original: {result['srcset']['original']}")
            print(f"WebP: {result['srcset']['webp']}")
            if 'avif' in result['srcset']:
                print(f"AVIF: {result['srcset']['avif']}")
        
        # Etiqueta picture generada
        if 'picture_tag' in result:
            print("\n--- Etiqueta HTML <picture> generada ---")
            print(result['picture_tag'])
        
        # Metadatos
        print("\n--- Metadatos ---")
        if 'dimensions' in result:
            print(f"Dimensiones: {result['dimensions']['width']}x{result['dimensions']['height']} px")
        if 'file_size' in result:
            print(f"Tamaño: {result['file_size']} bytes ({round(result['file_size']/1024, 2)} KB)")
        print(f"Optimizada: {'Sí' if result.get('optimized') else 'No'}")
    
    # Obtener todas las imágenes de un paciente
    images = get_images(content_type='paciente', object_id=paciente_id, token=token)
    
    if images:
        print(f"Se encontraron {len(images['results'])} imágenes para el paciente")
    
    print("\n=== Cómo implementar imágenes responsivas en HTML/JS ===")
    print("""
# Ejemplo HTML con <picture> para imágenes responsivas

```html
<!-- Imagen responsiva básica con formatos modernos -->
<picture>
    <!-- AVIF para navegadores modernos -->
    <source type="image/avif" 
            srcset="imagen_small.avif 480w,
                   imagen_medium.avif 768w,
                   imagen_large.avif 1024w" 
            sizes="(max-width: 768px) 100vw, 50vw">
    
    <!-- WebP para navegadores compatibles -->
    <source type="image/webp" 
            srcset="imagen_small.webp 480w,
                   imagen_medium.webp 768w,
                   imagen_large.webp 1024w" 
            sizes="(max-width: 768px) 100vw, 50vw">
    
    <!-- Formato tradicional para compatibilidad -->
    <img src="imagen_medium.jpg" 
         srcset="imagen_small.jpg 480w,
                imagen_medium.jpg 768w,
                imagen_large.jpg 1024w" 
         sizes="(max-width: 768px) 100vw, 50vw"
         alt="Descripción de la imagen"
         loading="lazy"
         width="800" height="600">
</picture>
```

# Ejemplo React para mostrar imágenes optimizadas

```jsx
const ResponsiveImage = ({ image, alt, className }) => {
  if (!image || !image.optimized) {
    // Fallback para imágenes sin optimizar
    return (
      <img 
        src={image?.image_url} 
        alt={alt || image?.title || 'Imagen'} 
        className={className} 
      />
    );
  }

  return (
    <picture>
      {/* AVIF format */}
      {image.medium_avif_url && (
        <source 
          type="image/avif"
          srcSet={`${image.small_avif_url} 480w, 
                  ${image.medium_avif_url} 768w, 
                  ${image.large_avif_url} 1024w`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
      
      {/* WebP format */}
      {image.medium_webp_url && (
        <source 
          type="image/webp"
          srcSet={`${image.small_webp_url} 480w, 
                  ${image.medium_webp_url} 768w, 
                  ${image.large_webp_url} 1024w`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
      
      {/* Original format */}
      <img
        src={image.medium_url || image.image_url}
        srcSet={`${image.small_url} 480w, 
                ${image.medium_url} 768w, 
                ${image.large_url} 1024w`}
        sizes="(max-width: 768px) 100vw, 50vw"
        alt={alt || image.title || 'Imagen'}
        className={className}
        loading="lazy"
        width={image.dimensions?.width}
        height={image.dimensions?.height}
      />
    </picture>
  );
};
```

# Usando los template tags de Django

```django
{% load image_tags %}

<!-- Imagen individual responsiva -->
{% responsive_image imagen alt_text="Descripción" css_class="img-fluid" %}

<!-- Galería de imágenes responsiva -->
{% image_gallery imagenes alt_prefix="Imagen" css_class="gallery-img" cols=4 %}
```
    """)
