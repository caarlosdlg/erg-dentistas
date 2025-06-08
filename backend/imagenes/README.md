# API de Imágenes - Dental ERP

Este documento describe cómo utilizar la API de imágenes del sistema Dental ERP.

## Configuración

La API de imágenes ya está configurada con:

1. **MEDIA_ROOT y MEDIA_URL** en `settings.py`
   ```python
   MEDIA_URL = '/media/'
   MEDIA_ROOT = BASE_DIR / 'media'
   ```

2. **URLs para servir archivos media en desarrollo**
   ```python
   # Servir archivos media en desarrollo
   if settings.DEBUG:
       urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
   ```

## Modelo de Imágenes

El modelo `Image` tiene los siguientes campos:

- `id` (UUID): Identificador único de la imagen
- `image`: Campo para el archivo de imagen
- `content_type`: Tipo de contenido ('paciente', 'dentista', 'tratamiento', etc.)
- `object_id`: ID del objeto relacionado
- `title`: Título opcional
- `description`: Descripción opcional
- `uploaded_at`: Fecha y hora de subida
- `updated_at`: Fecha y hora de última actualización
- `is_active`: Indica si la imagen está activa
- `is_featured`: Indica si la imagen es destacada
- `order`: Orden de visualización

## Endpoints de la API

### 1. Listado de Imágenes

**Endpoint**: `GET /api/images/`

**Parámetros de consulta**:
- `content_type`: Filtrar por tipo de contenido
- `object_id`: Filtrar por ID de objeto
- `is_active`: Filtrar por estado activo/inactivo
- `is_featured`: Filtrar por estado destacado

**Ejemplo de respuesta**:
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "image": "/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
      "image_url": "http://localhost:8000/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
      "content_type": "paciente",
      "object_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Radiografía",
      "description": "Radiografía panorámica",
      "uploaded_at": "2025-06-07T14:30:00Z",
      "is_active": true,
      "is_featured": false,
      "order": 0
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "image": "/media/paciente/550e8400-e29b-41d4-a716-446655440001.jpg",
      "image_url": "http://localhost:8000/media/paciente/550e8400-e29b-41d4-a716-446655440001.jpg",
      "content_type": "paciente",
      "object_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Foto frontal",
      "description": "Foto frontal del paciente",
      "uploaded_at": "2025-06-07T14:35:00Z",
      "is_active": true,
      "is_featured": true,
      "order": 1
    }
  ]
}
```

### 2. Detalle de una Imagen

**Endpoint**: `GET /api/images/{id}/`

**Ejemplo de respuesta**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "image": "/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
  "image_url": "http://localhost:8000/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
  "content_type": "paciente",
  "object_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Radiografía",
  "description": "Radiografía panorámica",
  "uploaded_at": "2025-06-07T14:30:00Z",
  "is_active": true,
  "is_featured": false,
  "order": 0
}
```

### 3. Subir una Imagen

**Endpoint**: `POST /api/images/upload/`

**Formato de la petición**:
- Debe ser `multipart/form-data`
- Requiere autenticación

**Campos**:
- `image`: Archivo de imagen (requerido)
- `content_type`: Tipo de contenido (requerido)
- `object_id`: ID del objeto relacionado (requerido)
- `title`: Título (opcional)
- `description`: Descripción (opcional)
- `is_featured`: Si es destacada (opcional, por defecto `false`)

**Ejemplo de petición cURL**:
```bash
curl -X POST \
  -H "Authorization: Token YOUR_AUTH_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "content_type=paciente" \
  -F "object_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "title=Radiografía" \
  -F "description=Radiografía panorámica" \
  -F "is_featured=false" \
  http://localhost:8000/api/images/upload/
```

**Ejemplo de respuesta** (código 201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "image": "/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
  "image_url": "http://localhost:8000/media/paciente/550e8400-e29b-41d4-a716-446655440000.jpg",
  "content_type": "paciente",
  "object_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Radiografía",
  "description": "Radiografía panorámica",
  "uploaded_at": "2025-06-07T14:30:00Z",
  "is_active": true,
  "is_featured": false,
  "order": 0
}
```

### 4. Actualizar una Imagen

**Endpoint**: `PUT /api/images/{id}/`

**Formato de la petición**:
- Debe ser `multipart/form-data`
- Requiere permisos de administrador

**Campos**:
- `image`: Archivo de imagen (opcional)
- `content_type`: Tipo de contenido (opcional)
- `object_id`: ID del objeto relacionado (opcional)
- `title`: Título (opcional)
- `description`: Descripción (opcional)
- `is_active`: Estado activo (opcional)
- `is_featured`: Estado destacado (opcional)
- `order`: Orden de visualización (opcional)

### 5. Eliminar una Imagen

**Endpoint**: `DELETE /api/images/{id}/`

- Requiere permisos de administrador

## Validación de Imágenes

La API valida automáticamente:

1. **Formatos de archivo permitidos**:
   - jpg/jpeg
   - png
   - gif
   - webp

2. **Tamaño máximo**: 5 MB

## Uso en Aplicaciones Cliente

Para integrar esta API en aplicaciones cliente:

### React/JavaScript:

```javascript
const uploadImage = async (imageFile, contentType, objectId, title, description) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('content_type', contentType);
  formData.append('object_id', objectId);
  
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  
  try {
    const response = await fetch('http://localhost:8000/api/images/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error uploading image:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
```

### Python:

Ver el archivo de ejemplo `example_image_upload.py` incluido en el proyecto.
