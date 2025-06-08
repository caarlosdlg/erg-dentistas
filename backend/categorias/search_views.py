"""
Vistas de búsqueda para el sistema dental ERP.

Este módulo proporciona vistas API para:
- Búsqueda de categorías
- Búsqueda de tratamientos
- Búsqueda global

Cada API de búsqueda permite filtrado flexible y ordenación de resultados.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q

from .models import Category
from .serializers import CategoryTreeSerializer
from tratamientos.models import Tratamiento, CategoriaTratamiento
from pacientes.models import Paciente

# Importamos el serializador existente para categorías
# Para tratamientos y pacientes necesitaríamos crear serializadores si no existen ya

class SearchResult:
    """Clase auxiliar para formatear resultados de búsqueda"""
    
    @staticmethod
    def format_category_results(queryset, request):
        """Formatea resultados de categorías"""
        serializer = CategoryTreeSerializer(queryset, many=True, context={'request': request})
        return {
            'type': 'categories',
            'count': len(serializer.data),
            'results': serializer.data
        }
    
    @staticmethod
    def format_tratamiento_results(queryset, request):
        """Formatea resultados de tratamientos"""
        results = []
        for tratamiento in queryset:
            results.append({
                'id': str(tratamiento.id),
                'nombre': tratamiento.nombre,
                'codigo': tratamiento.codigo,
                'precio_base': str(tratamiento.precio_base),
                'categoria': {
                    'id': str(tratamiento.categoria.id),
                    'nombre': tratamiento.categoria.nombre
                },
                'duracion_estimada': tratamiento.duracion_estimada
            })
        
        return {
            'type': 'tratamientos',
            'count': len(results),
            'results': results
        }
    
    @staticmethod
    def format_paciente_results(queryset, request):
        """Formatea resultados de pacientes"""
        results = []
        for paciente in queryset:
            results.append({
                'id': str(paciente.id),
                'nombre_completo': f"{paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}".strip(),
                'email': paciente.email,
                'telefono': paciente.telefono,
                'numero_expediente': paciente.numero_expediente
            })
        
        return {
            'type': 'pacientes',
            'count': len(results),
            'results': results
        }


@api_view(['GET'])
@permission_classes([AllowAny])
def search_categories(request):
    """
    Busca categorías por nombre, descripción, etc.
    
    Parameters:
        q (str): Término de búsqueda
        active_only (bool): Filtrar solo categorías activas (default: True)
        limit (int): Número máximo de resultados (default: 20)
    """
    # Obtener parámetros
    query = request.GET.get('q', '').strip()
    active_only = request.GET.get('active_only', 'true').lower() == 'true'
    limit = int(request.GET.get('limit', 20))
    
    if not query:
        return Response({'error': 'Se requiere un término de búsqueda'}, status=400)
    
    # Construir consulta
    filters = Q(name__icontains=query) | Q(description__icontains=query) | Q(meta_title__icontains=query)
    
    # Aplicar filtros adicionales
    if active_only:
        filters &= Q(is_active=True)
    
    # Ejecutar consulta
    categories = Category.objects.filter(filters).distinct().order_by('name')[:limit]
    
    # Formatear y devolver resultados
    return Response(SearchResult.format_category_results(categories, request))


@api_view(['GET'])
@permission_classes([AllowAny])
def search_tratamientos(request):
    """
    Busca tratamientos por nombre, descripción, código, etc.
    
    Parameters:
        q (str): Término de búsqueda
        active_only (bool): Filtrar solo tratamientos activos (default: True)
        limit (int): Número máximo de resultados (default: 20)
    """
    # Obtener parámetros
    query = request.GET.get('q', '').strip()
    active_only = request.GET.get('active_only', 'true').lower() == 'true'
    limit = int(request.GET.get('limit', 20))
    
    if not query:
        return Response({'error': 'Se requiere un término de búsqueda'}, status=400)
    
    # Construir consulta
    filters = Q(nombre__icontains=query) | Q(descripcion__icontains=query) | Q(codigo__icontains=query)
    
    # Aplicar filtros adicionales
    if active_only:
        filters &= Q(activo=True)
    
    # Ejecutar consulta
    tratamientos = Tratamiento.objects.filter(filters).distinct().order_by('nombre')[:limit]
    
    # Formatear y devolver resultados
    return Response(SearchResult.format_tratamiento_results(tratamientos, request))


@api_view(['GET'])
@permission_classes([AllowAny])
def search_global(request):
    """
    Busca en todas las entidades principales del sistema:
    - Categorías
    - Tratamientos
    - Pacientes (si el usuario tiene permiso)
    
    Parameters:
        q (str): Término de búsqueda
        active_only (bool): Filtrar solo entidades activas (default: True)
        limit (int): Número máximo de resultados por tipo (default: 10)
        include (str, optional): Tipos de entidades a incluir, separadas por coma
                              (categories,tratamientos,pacientes)
    """
    # Obtener parámetros
    query = request.GET.get('q', '').strip()
    active_only = request.GET.get('active_only', 'true').lower() == 'true'
    limit = int(request.GET.get('limit', 10))
    include_param = request.GET.get('include', 'categories,tratamientos,pacientes')
    include_types = [t.strip() for t in include_param.split(',')]
    
    if not query:
        return Response({'error': 'Se requiere un término de búsqueda'}, status=400)
    
    results = {}
    
    # Buscar categorías
    if 'categories' in include_types:
        filters = Q(name__icontains=query) | Q(description__icontains=query)
        if active_only:
            filters &= Q(is_active=True)
        categories = Category.objects.filter(filters).distinct().order_by('name')[:limit]
        results['categories'] = SearchResult.format_category_results(categories, request)
    
    # Buscar tratamientos
    if 'tratamientos' in include_types:
        filters = Q(nombre__icontains=query) | Q(descripcion__icontains=query) | Q(codigo__icontains=query)
        if active_only:
            filters &= Q(activo=True)
        tratamientos = Tratamiento.objects.filter(filters).distinct().order_by('nombre')[:limit]
        results['tratamientos'] = SearchResult.format_tratamiento_results(tratamientos, request)
    
    # Buscar pacientes (solo si el usuario tiene permisos)
    if 'pacientes' in include_types and request.user and request.user.has_perm('pacientes.view_paciente'):
        filters = (
            Q(nombre__icontains=query) | 
            Q(apellido_paterno__icontains=query) | 
            Q(apellido_materno__icontains=query) | 
            Q(email__icontains=query) |
            Q(numero_expediente__icontains=query)
        )
        if active_only:
            filters &= Q(activo=True)
        pacientes = Paciente.objects.filter(filters).distinct().order_by('apellido_paterno', 'nombre')[:limit]
        results['pacientes'] = SearchResult.format_paciente_results(pacientes, request)
    
    # Formatear respuesta global
    response = {
        'query': query,
        'total_results': sum(r.get('count', 0) for r in results.values()),
        'results': results
    }
    
    return Response(response)
