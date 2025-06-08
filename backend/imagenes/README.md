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
- `image`: Campo para el archivo de imagen original
- `content_type`: Tipo de contenido ('paciente', 'dentista', 'tratamiento', etc.)
- `object_id`: ID del objeto relacionado
- `title`: Título opcional
- `description`: Descripción opcional
- `uploaded_at`: Fecha y hora de subida
- `updated_at`: Fecha y hora de última actualización
- `is_active`: Indica si la imagen está activa
- `is_featured`: Indica si la imagen es destacada
- `order`: Orden de visualización

### Campos para Optimización de Imágenes

La versión optimizada del modelo incluye campos adicionales:

- `thumbnail_url`: URL del thumbnail (150px de ancho)
- `thumbnail_webp_url`: URL del thumbnail en formato WebP
- `medium_url`: URL de la versión mediana (400px de ancho)
- `medium_webp_url`: URL de la versión mediana en formato WebP
- `large_url`: URL de la versión grande (800px de ancho)
- `large_webp_url`: URL de la versión grande en formato WebP
- `width`: Ancho de la imagen original en píxeles
- `height`: Alto de la imagen original en píxeles
- `file_size`: Tamaño del archivo en bytes
- `optimized`: Indica si la imagen ha sido optimizada

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

### 6. Optimizar una Imagen

**Endpoint**: `POST /api/images/{id}/optimize/`

Este endpoint permite regenerar las versiones optimizadas de una imagen específica. Es útil si se necesitan actualizar los thumbnails o si la imagen fue subida antes de implementar la optimización.

- Requiere permisos de administrador
- No requiere parámetros

**Ejemplo de respuesta**:
```json
{
  "status": "success",
  "message": "Las versiones optimizadas han sido regeneradas",
  "image": {
    // Datos completos de la imagen con URLs actualizadas
  }
}
```

### 7. Optimización por Lotes

**Endpoint**: `POST /api/images/batch-optimize/`

Este endpoint permite regenerar las versiones optimizadas de un conjunto de imágenes.

- Requiere permisos de administrador

**Parámetros opcionales**:
- `content_type`: Filtrar por tipo de contenido
- `object_id`: Filtrar por ID de objeto

**Ejemplo de respuesta**:
```json
{
  "status": "completed",
  "processed": 15,
  "errors": 0,
  "total": 15
}
```

## Validación de Imágenes

La API valida automáticamente:

1. **Formatos de archivo permitidos**:
   - jpg/jpeg
   - png
   - gif
   - webp

2. **Tamaño máximo**: 5 MB

## Optimización de Imágenes

El sistema optimiza automáticamente las imágenes subidas:

1. **Generación de versiones redimensionadas**:
   - Thumbnail (150px de ancho)
   - Medio (400px de ancho)
   - Grande (800px de ancho)

2. **Conversión a formato WebP** para mejor compresión y rendimiento

3. **Almacenamiento de metadatos** como dimensiones y tamaño para ayudar al frontend a mostrar la imagen correctamente

## Uso en Aplicaciones Cliente

Para integrar esta API en aplicaciones cliente:

### React/JavaScript:

```javascript
// Función para subir una imagen
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

// Componente de imagen optimizada con soporte para imágenes WebP y fallback
const OptimizedImage = ({ image, alt, className }) => {
  // Verificar soporte de WebP en el navegador
  const supportsWebP = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };
  
  // Si la imagen no está optimizada, usar la imagen original
  if (!image || !image.optimized) {
    return <img src={image?.image_url} alt={alt || image?.title} className={className} />;
  }

  // Seleccionar el tamaño adecuado según el contexto
  // Aquí puedes implementar la lógica para elegir entre thumbnail, medium o large
  const getResponsiveSources = () => {
    const hasWebP = supportsWebP();
    
    return {
      small: hasWebP ? image.thumbnail_webp_url : image.thumbnail_url,
      medium: hasWebP ? image.medium_webp_url : image.medium_url,
      large: hasWebP ? image.large_webp_url : image.large_url,
      original: image.image_url
    };
  };
  
  const sources = getResponsiveSources();
  
  // Usar picture para ofrecer las versiones WebP con fallback a formatos tradicionales
  return (
    <picture>
      {/* Fuente WebP para navegadores que lo soportan */}
      {supportsWebP() && (
        <>
          <source
            media="(max-width: 400px)"
            srcSet={image.thumbnail_webp_url}
            type="image/webp"
          />
          <source
            media="(max-width: 800px)"
            srcSet={image.medium_webp_url}
            type="image/webp"
          />
          <source
            srcSet={image.large_webp_url}
            type="image/webp"
          />
        </>
      )}
      
      {/* Fallback para navegadores que no soportan WebP */}
      <source media="(max-width: 400px)" srcSet={image.thumbnail_url} />
      <source media="(max-width: 800px)" srcSet={image.medium_url} />
      <source srcSet={image.large_url} />
      
      {/* Imagen final de fallback */}
      <img
        src={image.image_url}
        alt={alt || image.title}
        className={className}
        width={image.dimensions?.width}
        height={image.dimensions?.height}
        loading="lazy"
      />
    </picture>
  );
};
```

### Python:

Ver el archivo de ejemplo `example_image_upload.py` incluido en el proyecto.
