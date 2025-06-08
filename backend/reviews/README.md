# Sistema de Reseñas - API Documentation

## Descripción General

El sistema de reseñas permite a los usuarios crear, gestionar y moderar reseñas sobre cualquier entidad del sistema (categorías, productos, tratamientos, etc.) usando Generic Foreign Keys.

## Características Principales

✅ **Reseñas CRUD completas** - Crear, leer, actualizar y eliminar reseñas
✅ **Sistema de calificaciones** - Calificaciones de 1 a 5 estrellas
✅ **Moderación avanzada** - Estados de publicación y moderación
✅ **Votos útiles** - Los usuarios pueden marcar reseñas como útiles
✅ **Sistema de reportes** - Reportar contenido inapropiado
✅ **Multimedia** - Subir imágenes y archivos con las reseñas
✅ **Estadísticas** - Métricas y análisis de reseñas
✅ **Filtros avanzados** - Filtrar por rating, fecha, estado, etc.
✅ **Permisos granulares** - Control de acceso detallado
✅ **Generic Foreign Keys** - Reseñas para cualquier modelo

## Modelos

### Review
- `id` (UUID): Identificador único
- `user` (ForeignKey): Usuario que escribió la reseña
- `content_type/object_id` (GenericForeignKey): Objeto reseñado
- `title` (CharField): Título de la reseña (5-200 caracteres)
- `content` (TextField): Contenido de la reseña (10-2000 caracteres)
- `rating` (PositiveSmallIntegerField): Calificación de 1 a 5
- `status` (CharField): Estado (draft, published, moderated, approved, rejected, hidden)
- `is_verified_purchase` (BooleanField): Compra verificada
- `is_helpful_count` (PositiveIntegerField): Contador de votos útiles
- `report_count` (PositiveIntegerField): Contador de reportes
- `created_at/updated_at` (DateTimeField): Timestamps

### ReviewHelpful
- Relación Many-to-Many entre Review y User para votos útiles

### ReviewReport
- Sistema de reportes con razones categorizadas

### ReviewMedia
- Archivos multimedia asociados a reseñas

## API Endpoints

### Endpoints Públicos

#### `GET /api/reviews/`
Lista todas las reseñas públicas con paginación.

**Parámetros de consulta:**
- `content_type` (int): Filtrar por tipo de contenido
- `object_id` (string): Filtrar por ID del objeto
- `rating` (int): Filtrar por calificación
- `status` (string): Filtrar por estado
- `is_verified_purchase` (bool): Solo compras verificadas
- `search` (string): Búsqueda en título y contenido
- `ordering` (string): Ordenar por campo (ej: `-created_at`)

**Respuesta:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/reviews/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "title": "Excelente producto",
      "content_preview": "Este producto superó mis expectativas...",
      "rating": 5,
      "star_display": "★★★★★",
      "status": "published",
      "user": {
        "id": 1,
        "username": "juan_dentista",
        "full_name": "Dr. Juan Pérez"
      },
      "is_verified_purchase": true,
      "helpful_count": 5,
      "created_at": "2025-06-07T10:30:00Z",
      "can_edit": false,
      "can_delete": false
    }
  ]
}
```

#### `GET /api/reviews/{id}/`
Obtiene una reseña específica con todos los detalles.

**Respuesta:**
```json
{
  "id": "uuid-here",
  "title": "Excelente producto",
  "content": "Este producto superó mis expectativas en todos los aspectos...",
  "rating": 5,
  "star_display": "★★★★★",
  "status": "published",
  "user": {
    "id": 1,
    "username": "juan_dentista",
    "full_name": "Dr. Juan Pérez"
  },
  "content_object_name": "Instrumentos Básicos",
  "is_verified_purchase": true,
  "helpful_count": 5,
  "report_count": 0,
  "created_at": "2025-06-07T10:30:00Z",
  "updated_at": "2025-06-07T10:30:00Z",
  "media": [
    {
      "id": 1,
      "file_url": "http://localhost:8000/media/reviews/image.jpg",
      "media_type": "image",
      "caption": "Imagen del producto"
    }
  ],
  "can_edit": false,
  "can_delete": false,
  "user_has_voted_helpful": false,
  "user_has_reported": false
}
```

#### `GET /api/reviews/stats/`
Obtiene estadísticas de reseñas para un objeto específico.

**Parámetros requeridos:**
- `content_type` (int): ID del tipo de contenido
- `object_id` (string): ID del objeto

**Respuesta:**
```json
{
  "total_reviews": 25,
  "average_rating": 4.2,
  "verified_purchases": 18,
  "rating_distribution": {
    "1": 1,
    "2": 2,
    "3": 4,
    "4": 8,
    "5": 10
  },
  "recent_reviews": 5,
  "helpful_votes": 45
}
```

### Endpoints Autenticados

#### `POST /api/reviews/`
Crea una nueva reseña (requiere autenticación).

**Cuerpo de la solicitud:**
```json
{
  "title": "Título de la reseña",
  "content": "Contenido detallado de la reseña (mínimo 10 caracteres)",
  "rating": 5,
  "content_type_id": 21,
  "object_id": "uuid-del-objeto",
  "media_files": ["archivo1.jpg", "archivo2.png"]
}
```

**Respuesta (201 Created):**
```json
{
  "id": "new-uuid-here",
  "title": "Título de la reseña",
  "content": "Contenido detallado...",
  "rating": 5,
  "status": "published"
}
```

#### `PUT /api/reviews/{id}/`
Actualiza una reseña existente (solo el propietario en las primeras 24 horas).

#### `DELETE /api/reviews/{id}/`
Elimina una reseña (solo el propietario o staff).

#### `GET /api/reviews/my_reviews/`
Obtiene todas las reseñas del usuario autenticado.

#### `POST /api/reviews/{id}/mark_helpful/`
Marca una reseña como útil (no se puede marcar la propia reseña).

**Respuesta:**
```json
{
  "message": "Reseña marcada como útil",
  "helpful_count": 6
}
```

#### `POST /api/reviews/{id}/report/`
Reporta una reseña por contenido inapropiado.

**Cuerpo de la solicitud:**
```json
{
  "reason": "spam",
  "description": "Esta reseña parece ser spam promocional"
}
```

**Opciones de razón:**
- `spam`: Contenido spam
- `inappropriate`: Contenido inapropiado
- `fake`: Reseña falsa
- `offensive`: Contenido ofensivo
- `other`: Otra razón

### Endpoints de Moderación (Solo Staff)

#### `POST /api/reviews/{id}/moderate/`
Modera una reseña (cambiar estado).

**Cuerpo de la solicitud:**
```json
{
  "status": "approved",
  "moderation_notes": "Reseña aprobada tras revisión"
}
```

## Filtros Disponibles

### ReviewFilter
- `content_type`: Filtrar por tipo de contenido
- `object_id`: Filtrar por ID del objeto específico
- `user`: Filtrar por usuario
- `rating`: Filtrar por calificación exacta
- `rating__gte`: Calificación mayor o igual que
- `rating__lte`: Calificación menor o igual que
- `status`: Filtrar por estado
- `is_verified_purchase`: Solo compras verificadas
- `created_at__date`: Filtrar por fecha de creación
- `created_at__gte`: Creadas después de fecha
- `created_at__lte`: Creadas antes de fecha

**Ejemplo de uso:**
```
GET /api/reviews/?rating__gte=4&is_verified_purchase=true&ordering=-created_at
```

## Permisos

### Lectura (Público)
- Cualquier usuario puede leer reseñas publicadas y aprobadas

### Escritura (Autenticado)
- Solo usuarios autenticados pueden crear reseñas
- Un usuario solo puede tener una reseña por objeto
- Solo el propietario puede editar su reseña (dentro de 24 horas)

### Eliminación
- El propietario puede eliminar su reseña
- El staff puede eliminar cualquier reseña

### Moderación (Solo Staff)
- Solo usuarios con `is_staff=True` pueden moderar reseñas
- Pueden cambiar estados y agregar notas de moderación

## Validaciones

### Reseña
- **Título**: 5-200 caracteres
- **Contenido**: 10-2000 caracteres
- **Calificación**: 1-5 (entero)
- **Constraint único**: Un usuario, un review por objeto

### Archivos Multimedia
- **Tipos permitidos**: jpg, jpeg, png, gif, mp4, webm
- **Tamaño máximo**: 10MB por archivo
- **Máximo**: 5 archivos por reseña

## Estados de Moderación

- `draft`: Borrador (no visible públicamente)
- `published`: Publicado (visible públicamente)
- `moderated`: En moderación (oculto temporalmente)
- `approved`: Aprobado por moderador
- `rejected`: Rechazado por moderador
- `hidden`: Oculto por administrador

## Ejemplos de Uso

### 1. Crear una reseña para una categoría
```bash
curl -X POST http://localhost:8000/api/reviews/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Excelente categoría de productos",
    "content": "Esta categoría tiene productos de muy buena calidad para mi consulta dental.",
    "rating": 5,
    "content_type_id": 21,
    "object_id": "category-uuid-here"
  }'
```

### 2. Obtener reseñas de un producto específico
```bash
curl "http://localhost:8000/api/reviews/?content_type=21&object_id=category-uuid&rating__gte=4"
```

### 3. Obtener estadísticas de reseñas
```bash
curl "http://localhost:8000/api/reviews/stats/?content_type=21&object_id=category-uuid"
```

### 4. Marcar reseña como útil
```bash
curl -X POST http://localhost:8000/api/reviews/uuid-here/mark_helpful/ \
  -H "Authorization: Token your-token"
```

### 5. Reportar una reseña
```bash
curl -X POST http://localhost:8000/api/reviews/uuid-here/report/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "spam",
    "description": "Esta reseña parece ser contenido promocional no auténtico"
  }'
```

## Comandos de Management

### Crear datos de ejemplo
```bash
python manage.py create_sample_reviews --count 20 --clear
```

**Opciones:**
- `--count N`: Número de reseñas a crear (default: 20)
- `--clear`: Limpiar reseñas existentes antes de crear nuevas

## Pruebas Unitarias

Ejecutar todas las pruebas del sistema de reseñas:

```bash
python manage.py test reviews -v 2
```

**Cobertura de pruebas:**
- ✅ Modelos y validaciones
- ✅ API endpoints CRUD
- ✅ Permisos y autenticación
- ✅ Filtros y búsquedas
- ✅ Funcionalidades especiales (votos útiles, reportes)
- ✅ Moderación

## Integración con Frontend

El sistema está diseñado para integrarse fácilmente con cualquier frontend:

### React/Vue.js ejemplo
```javascript
// Obtener reseñas de un producto
const reviews = await fetch('/api/reviews/?content_type=21&object_id=product-id')
  .then(res => res.json());

// Crear nueva reseña
const newReview = await fetch('/api/reviews/', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Mi experiencia',
    content: 'Descripción detallada...',
    rating: 5,
    content_type_id: 21,
    object_id: 'product-uuid'
  })
});
```

## Consideraciones de Rendimiento

- **Paginación**: Todas las listas usan paginación (20 elementos por página)
- **Índices de BD**: Campos principales tienen índices para consultas rápidas
- **Caché**: Considerar implementar caché para estadísticas frecuentes
- **Archivos**: Los archivos multimedia se sirven desde MEDIA_ROOT

## Seguridad

- **CSRF Protection**: Habilitado para formularios web
- **Rate Limiting**: Recomendado implementar para evitar spam
- **Validación de archivos**: Tipos y tamaños validados
- **Sanitización**: Contenido de reseñas debe sanitizarse en frontend
- **Permisos granulares**: Control de acceso por operación

---

## Support & Maintenance

Para soporte técnico o consultas sobre la implementación, contactar al equipo de desarrollo del ERP Dental.

**Versión**: 1.0.0  
**Última actualización**: Junio 2025  
**Estado**: Producción ready ✅
