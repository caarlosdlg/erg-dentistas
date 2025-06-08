# Pasos para completar la implementación de búsqueda

## Índices para optimización de búsqueda

Hemos añadido los siguientes índices para mejorar el rendimiento de las búsquedas:

### Modelo Category (Categorías)

```python
models.Index(fields=['name'], name='category_name_idx'),
models.Index(fields=['description'], name='category_description_idx'),
models.Index(fields=['meta_title'], name='category_metatitle_idx'),
```

### Modelo Tratamiento (Tratamientos)

```python
models.Index(fields=['nombre'], name='tratamiento_nombre_idx'),
models.Index(fields=['codigo'], name='tratamiento_codigo_idx'),
models.Index(fields=['activo'], name='tratamiento_activo_idx'),
models.Index(fields=['categoria'], name='tratamiento_categoria_idx'),
```

## Generación de migraciones

Una vez que tengas el proyecto configurado con Django, debes ejecutar:

```bash
python manage.py makemigrations categorias tratamientos
python manage.py migrate
```

## Escalando la solución

Actualmente, la implementación utiliza Django Q objects con __icontains para las búsquedas, lo cual es suficiente para bases de datos pequeñas y medianas. Sin embargo, si la base de datos crece significativamente, considera estas opciones:

### 1. Implementar django-haystack con Whoosh

Para una búsqueda más avanzada, puedes instalar:

```bash
pip install django-haystack whoosh
```

Y configurar en settings.py:

```python
INSTALLED_APPS += [
    'haystack',
]

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.whoosh_backend.WhooshEngine',
        'PATH': os.path.join(BASE_DIR, 'whoosh_index'),
    },
}
HAYSTACK_SIGNAL_PROCESSOR = 'haystack.signals.RealtimeSignalProcessor'
```

### 2. Elasticsearch para entornos de producción

Para búsquedas a gran escala, considera Elasticsearch:

```bash
pip install django-haystack elasticsearch
```

Configuración:

```python
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.elasticsearch7_backend.Elasticsearch7SearchEngine',
        'URL': 'http://127.0.0.1:9200/',
        'INDEX_NAME': 'dental_erp',
    },
}
```

## Rendimiento

Para monitorear el rendimiento de las búsquedas, puedes implementar:

1. Logging de tiempos de respuesta
2. Django Debug Toolbar para desarrollo
3. Caché de resultados frecuentes

## Características adicionales

Considera implementar estas características adicionales:

1. Autocompletado mientras el usuario escribe
2. Búsqueda por facetas/filtros 
3. Corrección de errores ortográficos
4. Búsqueda fonética para nombres de pacientes
5. Destacado de términos en los resultados

## Ejemplo de autocompletado AJAX

```javascript
// Agregar este código al search.html
let timeout = null;
searchInput.addEventListener('keyup', function() {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        const query = searchInput.value.trim();
        if (query.length >= 3) {
            fetch(`/api/search/global/?q=${encodeURIComponent(query)}&limit=5`)
                .then(response => response.json())
                .then(data => {
                    // Mostrar sugerencias
                    showSuggestions(data);
                });
        }
    }, 300);
});
```
