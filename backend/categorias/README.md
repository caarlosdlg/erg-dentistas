# API de Categorías Jerárquicas - ERP Dental

## Descripción

La API de categorías proporciona un sistema completo para manejar estructuras jerárquicas de categorías usando MPTT (Modified Preorder Tree Traversal). Permite crear árboles de categorías con niveles ilimitados, similar a sitios como BHphotovideo.com.

## Características Principales

- **Estructura jerárquica ilimitada**: Categorías y subcategorías sin límite de profundidad
- **Operaciones CRUD completas**: Crear, leer, actualizar y eliminar categorías
- **Navegación eficiente**: Métodos optimizados para recorrer el árbol
- **Atributos dinámicos**: Cada categoría puede tener atributos personalizados
- **Breadcrumbs automáticos**: Generación automática de rutas de navegación
- **Operaciones de movimiento**: Reordenar categorías en el árbol
- **Búsqueda avanzada**: Filtrado y búsqueda por múltiples campos

## Endpoints Disponibles

### Endpoints Públicos (No requieren autenticación)

#### `GET /api/categories/public/tree/`
Obtiene el árbol completo de categorías activas.

**Parámetros opcionales:**
- `root_only=true`: Solo categorías raíz
- `max_depth=N`: Limitar profundidad máxima

**Respuesta de ejemplo:**
```json
{
  "count": 3,
  "results": [
    {
      "id": "uuid",
      "name": "Servicios Dentales",
      "slug": "servicios-dentales",
      "description": "Todos los servicios dentales",
      "level": 0,
      "full_path": "Servicios Dentales",
      "children": [
        {
          "id": "uuid",
          "name": "Servicios Preventivos",
          "level": 1,
          "children": [...]
        }
      ]
    }
  ]
}
```

#### `GET /api/categories/public/stats/`
Obtiene estadísticas básicas del árbol de categorías.

**Respuesta de ejemplo:**
```json
{
  "total_categories": 15,
  "active_categories": 15,
  "root_categories": 3,
  "max_depth": 2
}
```

### Endpoints Autenticados (Requieren autenticación)

#### `GET /api/categories/`
Lista todas las categorías con información básica.

**Filtros disponibles:**
- `is_active`: Filtrar por estado activo
- `parent`: Filtrar por categoría padre
- `level`: Filtrar por nivel en el árbol
- `search`: Búsqueda por nombre, descripción

#### `POST /api/categories/`
Crea una nueva categoría.

**Cuerpo de la petición:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción de la categoría",
  "parent": "uuid-del-padre", // opcional
  "is_active": true,
  "sort_order": 1,
  "attributes": [
    {
      "name": "color",
      "value": "azul",
      "attribute_type": "text"
    }
  ]
}
```

#### `GET /api/categories/{id}/`
Obtiene detalles completos de una categoría específica.

#### `PUT/PATCH /api/categories/{id}/`
Actualiza una categoría existente.

#### `DELETE /api/categories/{id}/`
Elimina una categoría (solo si no tiene hijos).

### Acciones Especiales

#### `GET /api/categories/{id}/children/`
Obtiene hijos directos de una categoría.

#### `GET /api/categories/{id}/descendants/`
Obtiene todos los descendientes de una categoría.

**Parámetros opcionales:**
- `max_depth=N`: Limitar profundidad

#### `GET /api/categories/{id}/ancestors/`
Obtiene ancestros de una categoría.

#### `GET /api/categories/{id}/siblings/`
Obtiene hermanos de una categoría.

**Parámetros opcionales:**
- `include_self=true`: Incluir la categoría actual

#### `GET /api/categories/{id}/breadcrumbs/`
Obtiene breadcrumbs de navegación.

#### `POST /api/categories/{id}/move/`
Mueve una categoría a una nueva posición.

**Cuerpo de la petición:**
```json
{
  "target": "uuid-categoria-objetivo",
  "position": "first-child|last-child|left|right"
}
```

#### `GET /api/categories/roots/`
Obtiene todas las categorías raíz.

#### `GET /api/categories/stats/`
Obtiene estadísticas detalladas del árbol.

#### `GET /api/categories/search/`
Búsqueda avanzada de categorías.

**Parámetros:**
- `q`: Término de búsqueda
- `level`: Nivel específico
- `parent`: ID de categoría padre

## Modelos de Datos

### Category
- `id`: UUID único
- `name`: Nombre de la categoría
- `slug`: URL amigable (auto-generado)
- `description`: Descripción detallada
- `parent`: Categoría padre (auto-referencia)
- `is_active`: Estado activo/inactivo
- `sort_order`: Orden de visualización
- `meta_title`: Título para SEO
- `meta_description`: Descripción para SEO
- `image`: Imagen representativa
- `level`: Nivel en el árbol (auto-calculado)
- `created_at/updated_at`: Timestamps
- `created_by`: Usuario creador

### CategoryAttribute
- `id`: UUID único
- `category`: Referencia a la categoría
- `name`: Nombre del atributo
- `value`: Valor del atributo
- `attribute_type`: Tipo (text, number, boolean, date, url, json)
- `is_required`: Si es requerido
- `sort_order`: Orden de visualización

## Casos de Uso

### 1. Crear estructura de servicios dentales
```python
# Categoría raíz
servicios = Category.objects.create(
    name="Servicios Dentales",
    description="Todos los servicios ofrecidos"
)

# Subcategoría
preventivos = Category.objects.create(
    name="Servicios Preventivos",
    parent=servicios
)

# Sub-subcategoría
limpiezas = Category.objects.create(
    name="Limpiezas Dentales",
    parent=preventivos
)
```

### 2. Obtener árbol completo por API
```javascript
fetch('/api/categories/public/tree/')
  .then(response => response.json())
  .then(data => {
    console.log('Árbol de categorías:', data.results);
  });
```

### 3. Buscar categorías específicas
```javascript
fetch('/api/categories/search/?q=limpieza&level=2')
  .then(response => response.json())
  .then(data => {
    console.log('Resultados de búsqueda:', data);
  });
```

### 4. Mover categoría en el árbol
```javascript
fetch('/api/categories/uuid-categoria/move/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token your-token'
  },
  body: JSON.stringify({
    target: 'uuid-categoria-destino',
    position: 'last-child'
  })
});
```

## Ventajas del Diseño

1. **Eficiencia**: MPTT permite consultas muy eficientes del árbol
2. **Flexibilidad**: Niveles ilimitados y atributos dinámicos
3. **Escalabilidad**: Optimizado para grandes volúmenes de datos
4. **Usabilidad**: API RESTful intuitiva con múltiples endpoints
5. **Mantenibilidad**: Código bien estructurado y documentado
6. **Extensibilidad**: Fácil agregar nuevas funcionalidades

## Panel de Administración

El panel de administración de Django incluye:
- Interfaz drag & drop para reordenar categorías
- Vista jerárquica con indentación visual
- Gestión de atributos inline
- Filtros y búsqueda avanzada
- Validaciones de integridad referencial
