from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from mptt.templatetags.mptt_tags import cache_tree_children
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from .models import Category, CategoryAttribute
from .serializers import (
    CategoryTreeSerializer,
    CategoryListSerializer,
    CategoryDetailSerializer,
    CategoryCreateUpdateSerializer,
    CategoryBreadcrumbSerializer,
    CategoryStatsSerializer
)

# Nueva vista para la interfaz de búsqueda
def search_interface(request):
    """
    Vista para renderizar la interfaz de búsqueda del sistema.
    
    Esta página permite realizar búsquedas en categorías, tratamientos
    y pacientes (si el usuario tiene permisos) desde una interfaz amigable.
    """
    return render(request, 'categorias/search.html')


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para el manejo de categorías jerárquicas.
    
    Proporciona operaciones CRUD completas y acciones adicionales
    para navegación y consulta del árbol de categorías.
    """
    queryset = Category.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'parent', 'level']
    search_fields = ['name', 'description', 'meta_title']
    ordering_fields = ['name', 'sort_order', 'created_at', 'level']
    ordering = ['tree_id', 'lft']
    
    def get_serializer_class(self):
        """Seleccionar el serializer apropiado según la acción"""
        if self.action == 'list':
            return CategoryListSerializer
        elif self.action == 'retrieve':
            return CategoryDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CategoryCreateUpdateSerializer
        elif self.action == 'tree':
            return CategoryTreeSerializer
        elif self.action == 'breadcrumbs':
            return CategoryBreadcrumbSerializer
        return CategoryListSerializer
    
    def get_queryset(self):
        """Personalizar queryset según la acción"""
        queryset = Category.objects.select_related('parent', 'created_by')
        
        if self.action == 'tree':
            # Para el árbol, traer solo categorías activas
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """
        Endpoint para obtener el árbol completo de categorías.
        
        GET /api/categories/tree/
        
        Parámetros opcionales:
        - root_only: bool - Solo categorías raíz
        - max_depth: int - Profundidad máxima
        """
        root_only = request.query_params.get('root_only', 'false').lower() == 'true'
        max_depth = request.query_params.get('max_depth')
        
        if root_only:
            # Solo categorías raíz
            categories = Category.objects.filter(
                parent=None, 
                is_active=True
            ).order_by('sort_order', 'name')
        else:
            # Árbol completo optimizado
            categories = Category.objects.filter(is_active=True)
            if max_depth:
                try:
                    max_depth = int(max_depth)
                    categories = categories.filter(level__lte=max_depth)
                except ValueError:
                    pass
            
            # Optimizar consultas con cache_tree_children
            categories = cache_tree_children(categories)
            categories = [c for c in categories if c.is_root_node()]
        
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """
        Obtener hijos directos de una categoría.
        
        GET /api/categories/{id}/children/
        """
        category = self.get_object()
        children = category.get_children().filter(is_active=True)
        serializer = CategoryListSerializer(children, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def descendants(self, request, pk=None):
        """
        Obtener todos los descendientes de una categoría.
        
        GET /api/categories/{id}/descendants/
        """
        category = self.get_object()
        max_depth = request.query_params.get('max_depth')
        
        descendants = category.get_descendants().filter(is_active=True)
        
        if max_depth:
            try:
                max_depth = int(max_depth)
                descendants = descendants.filter(level__lte=category.level + max_depth)
            except ValueError:
                pass
        
        serializer = CategoryListSerializer(descendants, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ancestors(self, request, pk=None):
        """
        Obtener ancestros de una categoría.
        
        GET /api/categories/{id}/ancestors/
        """
        category = self.get_object()
        ancestors = category.get_ancestors()
        serializer = CategoryListSerializer(ancestors, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def siblings(self, request, pk=None):
        """
        Obtener hermanos de una categoría.
        
        GET /api/categories/{id}/siblings/
        
        Parámetros opcionales:
        - include_self: bool - Incluir la categoría actual
        """
        category = self.get_object()
        include_self = request.query_params.get('include_self', 'false').lower() == 'true'
        
        siblings = category.get_siblings(include_self=include_self).filter(is_active=True)
        serializer = CategoryListSerializer(siblings, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def breadcrumbs(self, request, pk=None):
        """
        Obtener breadcrumbs de una categoría.
        
        GET /api/categories/{id}/breadcrumbs/
        """
        category = self.get_object()
        breadcrumbs = category.get_ancestors(include_self=True)
        serializer = CategoryBreadcrumbSerializer(breadcrumbs, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """
        Mover una categoría a una nueva posición en el árbol.
        
        POST /api/categories/{id}/move/
        
        Body:
        {
            "target": "category_id",  # ID de la categoría objetivo
            "position": "first-child|last-child|left|right"
        }
        """
        category = self.get_object()
        target_id = request.data.get('target')
        position = request.data.get('position', 'last-child')
        
        if not target_id:
            return Response(
                {'error': 'El campo target es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target = Category.objects.get(id=target_id)
        except Category.DoesNotExist:
            return Response(
                {'error': 'Categoría objetivo no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar que no se cree una referencia circular
        if target in category.get_descendants() or target == category:
            return Response(
                {'error': 'No se puede mover a una categoría descendiente o a sí misma'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category.move_to(target, position)
            serializer = CategoryDetailSerializer(category, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Error al mover la categoría: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def roots(self, request):
        """
        Obtener todas las categorías raíz.
        
        GET /api/categories/roots/
        """
        roots = Category.get_root_categories()
        serializer = CategoryListSerializer(roots, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Obtener estadísticas del árbol de categorías.
        
        GET /api/categories/stats/
        """
        total_categories = Category.objects.count()
        root_categories = Category.objects.filter(parent=None).count()
        active_categories = Category.objects.filter(is_active=True).count()
        inactive_categories = total_categories - active_categories
        
        # Calcular profundidad máxima
        max_depth = Category.objects.aggregate(
            max_level=models.Max('level')
        ).get('max_level', 0) or 0
        
        # Categorías con hijos
        categories_with_children = Category.objects.annotate(
            children_count=Count('children')
        ).filter(children_count__gt=0).count()
        
        # Categorías hoja (sin hijos)
        leaf_categories = total_categories - categories_with_children
        
        stats_data = {
            'total_categories': total_categories,
            'root_categories': root_categories,
            'max_depth': max_depth,
            'active_categories': active_categories,
            'inactive_categories': inactive_categories,
            'categories_with_children': categories_with_children,
            'leaf_categories': leaf_categories,
        }
        
        serializer = CategoryStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Búsqueda avanzada de categorías.
        
        GET /api/categories/search/?q=término&level=1&parent=id
        """
        query = request.query_params.get('q', '')
        level = request.query_params.get('level')
        parent_id = request.query_params.get('parent')
        
        queryset = Category.objects.filter(is_active=True)
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(meta_title__icontains=query)
            )
        
        if level:
            try:
                queryset = queryset.filter(level=int(level))
            except ValueError:
                pass
        
        if parent_id:
            try:
                queryset = queryset.filter(parent_id=parent_id)
            except ValueError:
                pass
        
        # Paginación
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CategoryListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = CategoryListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

@login_required
def search_page(request):
    """
    Vista para la página de búsqueda en el sistema.
    
    Muestra un formulario de búsqueda y permite buscar
    categorías, tratamientos y pacientes desde la interfaz web.
    """
    return render(request, 'categorias/search.html')
