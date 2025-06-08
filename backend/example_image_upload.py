import requests
import os
import uuid

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
        dict: Respuesta de la API como diccionario
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

# Ejemplo de uso
if __name__ == "__main__":
    # Para utilizar este script, necesitarás:
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
        print(f"URL: {result['image_url']}")
    
    # Obtener todas las imágenes de un paciente
    images = get_images(content_type='paciente', object_id=paciente_id, token=token)
    
    if images:
        print(f"Se encontraron {len(images['results'])} imágenes para el paciente")
