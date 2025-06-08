# API de Búsqueda

Este módulo proporciona APIs RESTful para la búsqueda eficiente de contenido en el sistema dental ERP.

## Endpoints de Búsqueda

### 1. Búsqueda de Categorías

```
GET /api/search/categories/
```

Permite buscar categorías por nombre, descripción o metadatos.

**Parámetros:**
- `q`: Término de búsqueda (requerido)
- `active_only`: Filtrar solo categorías activas (default: true)
- `limit`: Número máximo de resultados (default: 20)

**Ejemplo de respuesta:**
```json
{
  "type": "categories",
  "count": 2,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ortodoncia",
      "slug": "ortodoncia",
      "description": "Servicios de ortodoncia",
      "...": "otros campos de la categoría"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Ortodoncia infantil",
      "slug": "ortodoncia-infantil",
      "description": "Servicios de ortodoncia para niños",
      "...": "otros campos de la categoría"
    }
  ]
}
```

### 2. Búsqueda de Tratamientos

```
GET /api/search/tratamientos/
```

Permite buscar tratamientos por nombre, descripción o código.

**Parámetros:**
- `q`: Término de búsqueda (requerido)
- `active_only`: Filtrar solo tratamientos activos (default: true)
- `limit`: Número máximo de resultados (default: 20)

**Ejemplo de respuesta:**
```json
{
  "type": "tratamientos",
  "count": 1,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "nombre": "Brackets metálicos",
      "codigo": "ORT-001",
      "precio_base": "1500.00",
      "categoria": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nombre": "Ortodoncia"
      },
      "duracion_estimada": 60
    }
  ]
}
```

### 3. Búsqueda Global

```
GET /api/search/global/
```

Permite buscar en múltiples tipos de entidades simultáneamente.

**Parámetros:**
- `q`: Término de búsqueda (requerido)
- `active_only`: Filtrar solo entidades activas (default: true)
- `limit`: Número máximo de resultados por tipo (default: 10)
- `include`: Tipos de entidades a incluir, separadas por coma (default: categories,tratamientos,pacientes)

**Ejemplo de respuesta:**
```json
{
  "query": "orto",
  "total_results": 3,
  "results": {
    "categories": {
      "type": "categories",
      "count": 2,
      "results": [ ... ]
    },
    "tratamientos": {
      "type": "tratamientos",
      "count": 1,
      "results": [ ... ]
    }
  }
}
```

## Uso Avanzado

### Ejemplos de búsqueda con cURL

1. Buscar categorías que contengan "dental":
```
curl -X GET "https://tudominio.com/api/search/categories/?q=dental"
```

2. Buscar tratamientos que incluyan "limpieza":
```
curl -X GET "https://tudominio.com/api/search/tratamientos/?q=limpieza"
```

3. Realizar una búsqueda global de "ortodoncia" incluyendo solo categorías y tratamientos:
```
curl -X GET "https://tudominio.com/api/search/global/?q=ortodoncia&include=categories,tratamientos"
```

## Implementación

La búsqueda utiliza Django Q objects para crear consultas eficientes que aprovechan los índices de la base de datos. Para bases de datos más grandes y búsquedas más complejas, se puede escalar a soluciones como django-haystack con Elasticsearch.
