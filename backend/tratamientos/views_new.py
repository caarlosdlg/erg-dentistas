from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Tratamiento, CategoriaTratamiento
from .serializers import (
    TratamientoSerializer,
    TratamientoListSerializer, 
    TratamientoCreateSerializer,
    TratamientoDetailSerializer,
    CategoriaTratamientoSerializer,
    CategoriaTratamientoTreeSerializer,
    CategoriaTratamientoCreateSerializer
)


class TratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing treatments (Tratamientos)
    Provides CRUD operations and additional functionality with hierarchical filtering
    """
    queryset = Tratamiento.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['categoria', 'activo', 'requiere_anestesia', 'sesiones_requeridas', 'popular']
    search_fields = ['nombre', 'descripcion', 'codigo', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio_base', 'duracion_estimada', 'fecha_creacion', 'orden_visualizacion']
    ordering = ['categoria__tree_id', 'categoria__lft', 'orden_visualizacion', 'nombre']

    def get_serializer_class(self):
        if self.action == 'list':
            return TratamientoListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TratamientoCreateSerializer
        elif self.action == 'retrieve':
            return TratamientoDetailSerializer
        return TratamientoSerializer

    def get_queryset(self):
        queryset = Tratamiento.objects.select_related('categoria').prefetch_related(
            'categoria__parent',
            'categoria__parent__parent',
            'categoria__parent__parent__parent'
        )
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        # Hierarchical category filtering
        categoria_id = self.request.query_params.get('categoria', None)
        include_subcategorias = self.request.query_params.get('include_subcategorias', 'true')
        
        if categoria_id:
            try:
                categoria = CategoriaTratamiento.objects.get(id=categoria_id)
                if include_subcategorias.lower() in ['true', '1', 'yes']:
                    # Include treatments from this category and all its descendants
                    descendant_ids = categoria.get_descendants(include_self=True).values_list('id', flat=True)
                    queryset = queryset.filter(categoria__id__in=descendant_ids)
                else:
                    # Only this specific category
                    queryset = queryset.filter(categoria=categoria)
            except CategoriaTratamiento.DoesNotExist:
                pass
        
        # Filter by price range
        precio_min = self.request.query_params.get('precio_min', None)
        precio_max = self.request.query_params.get('precio_max', None)
        
        if precio_min:
            try:
                queryset = queryset.filter(precio_base__gte=float(precio_min))
            except ValueError:
                pass
                
        if precio_max:
            try:
                queryset = queryset.filter(precio_base__lte=float(precio_max))
            except ValueError:
                pass
        
        # Filter by duration range
        duracion_min = self.request.query_params.get('duracion_min', None)
        duracion_max = self.request.query_params.get('duracion_max', None)
        
        if duracion_min:
            try:
                queryset = queryset.filter(duracion_estimada__gte=int(duracion_min))
            except ValueError:
                pass
                
        if duracion_max:
            try:
                queryset = queryset.filter(duracion_estimada__lte=int(duracion_max))
            except ValueError:
                pass
        
        # Filter by category level
        categoria_level = self.request.query_params.get('categoria_level', None)
        if categoria_level:
            try:
                queryset = queryset.filter(categoria__level=int(categoria_level))
            except ValueError:
                pass
        
        return queryset

    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Get all treatment categories with hierarchical structure"""
        categorias = CategoriaTratamiento.objects.filter(activo=True)
        
        # Option to get only root categories
        only_roots = request.query_params.get('only_roots', 'false')
        if only_roots.lower() in ['true', '1', 'yes']:
            categorias = categorias.filter(level=0)
        
        data = [{
            'id': str(cat.id),
            'nombre': cat.nombre,
            'descripcion': cat.descripcion,
            'color': cat.color,
            'icono': cat.icono,
            'level': cat.level,
            'full_path': cat.get_full_path(),
            'total_tratamientos': cat.get_treatments_count(),
            'parent_id': str(cat.parent.id) if cat.parent else None
        } for cat in categorias]
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def categorias_tree(self, request):
        """Get treatment categories as a tree structure"""
        root_categories = CategoriaTratamiento.objects.filter(level=0, activo=True)
        serializer = CategoriaTratamientoTreeSerializer(root_categories, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_categoria(self, request):
        """Get treatments grouped by categories (up to 4 levels deep)"""
        categoria_id = request.query_params.get('categoria', None)
        max_level = int(request.query_params.get('max_level', 4))
        
        if not categoria_id:
            return Response({'error': 'categoria parameter is required'}, status=400)
        
        try:
            categoria = CategoriaTratamiento.objects.get(id=categoria_id)
        except CategoriaTratamiento.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        
        # Get all subcategories up to specified level
        descendant_categories = categoria.get_descendants(include_self=True).filter(
            level__lte=categoria.level + max_level
        )
        
        result = {}
        for cat in descendant_categories:
            treatments = Tratamiento.objects.filter(categoria=cat, activo=True)
            serializer = TratamientoListSerializer(treatments, many=True, context={'request': request})
            result[str(cat.id)] = {
                'categoria': CategoriaTratamientoSerializer(cat, context={'request': request}).data,
                'tratamientos': serializer.data
            }
        
        return Response(result)

    @action(detail=False, methods=['get'])
    def search_by_subcategory(self, request):
        """Search treatments with advanced subcategory filtering"""
        search_term = request.query_params.get('q', '')
        categoria_level_1 = request.query_params.get('nivel_1', None)
        categoria_level_2 = request.query_params.get('nivel_2', None)
        categoria_level_3 = request.query_params.get('nivel_3', None)
        categoria_level_4 = request.query_params.get('nivel_4', None)
        
        queryset = Tratamiento.objects.filter(activo=True)
        
        # Apply hierarchical category filters
        if categoria_level_4:
            queryset = queryset.filter(categoria__id=categoria_level_4)
        elif categoria_level_3:
            cat = CategoriaTratamiento.objects.get(id=categoria_level_3)
            descendant_ids = cat.get_descendants(include_self=True).values_list('id', flat=True)
            queryset = queryset.filter(categoria__id__in=descendant_ids)
        elif categoria_level_2:
            cat = CategoriaTratamiento.objects.get(id=categoria_level_2)
            descendant_ids = cat.get_descendants(include_self=True).values_list('id', flat=True)
            queryset = queryset.filter(categoria__id__in=descendant_ids)
        elif categoria_level_1:
            cat = CategoriaTratamiento.objects.get(id=categoria_level_1)
            descendant_ids = cat.get_descendants(include_self=True).values_list('id', flat=True)
            queryset = queryset.filter(categoria__id__in=descendant_ids)
        
        # Apply text search
        if search_term:
            queryset = queryset.filter(
                Q(nombre__icontains=search_term) |
                Q(descripcion__icontains=search_term) |
                Q(codigo__icontains=search_term) |
                Q(categoria__nombre__icontains=search_term)
            )
        
        serializer = TratamientoListSerializer(
            queryset.select_related('categoria'), 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get treatment statistics"""
        total_tratamientos = Tratamiento.objects.filter(activo=True).count()
        total_categorias = CategoriaTratamiento.objects.filter(activo=True).count()
        
        precio_promedio = Tratamiento.objects.filter(activo=True).aggregate(
            promedio=Avg('precio_base')
        )['promedio'] or 0
        
        duracion_promedio = Tratamiento.objects.filter(activo=True).aggregate(
            promedio=Avg('duracion_estimada')
        )['promedio'] or 0
        
        # Treatments by category level
        by_level = {}
        for level in range(5):  # Up to 4 levels (0-4)
            count = Tratamiento.objects.filter(
                activo=True, 
                categoria__level=level
            ).count()
            by_level[f'nivel_{level}'] = count
        
        return Response({
            'total_tratamientos': total_tratamientos,
            'total_categorias': total_categorias,
            'precio_promedio': round(float(precio_promedio), 2),
            'duracion_promedio': round(float(duracion_promedio), 2),
            'por_nivel_categoria': by_level
        })

    @action(detail=True, methods=['post'])
    def toggle_popular(self, request, pk=None):
        """Toggle popular status of a treatment"""
        tratamiento = self.get_object()
        tratamiento.popular = not tratamiento.popular
        tratamiento.save()
        
        serializer = self.get_serializer(tratamiento)
        return Response(serializer.data)


class CategoriaTratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing treatment categories with hierarchical structure
    """
    queryset = CategoriaTratamiento.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activo', 'level', 'parent']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'orden', 'level']
    ordering = ['tree_id', 'lft']

    def get_serializer_class(self):
        if self.action == 'tree':
            return CategoriaTratamientoTreeSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CategoriaTratamientoCreateSerializer
        return CategoriaTratamientoSerializer

    def get_queryset(self):
        queryset = CategoriaTratamiento.objects.all()
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level is not None:
            try:
                queryset = queryset.filter(level=int(level))
            except ValueError:
                pass
        
        return queryset

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get categories as a tree structure"""
        root_categories = CategoriaTratamiento.objects.filter(level=0, activo=True)
        serializer = CategoriaTratamientoTreeSerializer(root_categories, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roots(self, request):
        """Get only root categories"""
        roots = CategoriaTratamiento.objects.filter(level=0, activo=True)
        serializer = CategoriaTratamientoSerializer(roots, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """Get direct children of a category"""
        categoria = self.get_object()
        children = categoria.get_children().filter(activo=True)
        serializer = CategoriaTratamientoSerializer(children, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def descendants(self, request, pk=None):
        """Get all descendants of a category"""
        categoria = self.get_object()
        max_depth = request.query_params.get('max_depth', None)
        
        descendants = categoria.get_descendants().filter(activo=True)
        if max_depth:
            try:
                max_level = categoria.level + int(max_depth)
                descendants = descendants.filter(level__lte=max_level)
            except ValueError:
                pass
        
        serializer = CategoriaTratamientoSerializer(descendants, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ancestors(self, request, pk=None):
        """Get ancestors (breadcrumbs) of a category"""
        categoria = self.get_object()
        ancestors = categoria.get_ancestors()
        serializer = CategoriaTratamientoSerializer(ancestors, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tratamientos(self, request, pk=None):
        """Get all treatments for this category and its subcategories"""
        categoria = self.get_object()
        include_subcategorias = request.query_params.get('include_subcategorias', 'true')
        
        if include_subcategorias.lower() in ['true', '1', 'yes']:
            # Include treatments from subcategories
            descendant_ids = categoria.get_descendants(include_self=True).values_list('id', flat=True)
            tratamientos = Tratamiento.objects.filter(categoria__id__in=descendant_ids, activo=True)
        else:
            # Only this category
            tratamientos = categoria.tratamientos.filter(activo=True)
        
        serializer = TratamientoListSerializer(tratamientos, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Move a category to a different position in the tree"""
        categoria = self.get_object()
        target_id = request.data.get('target')
        position = request.data.get('position', 'last-child')
        
        if not target_id:
            return Response({'error': 'target parameter is required'}, status=400)
        
        try:
            target = CategoriaTratamiento.objects.get(id=target_id)
        except CategoriaTratamiento.DoesNotExist:
            return Response({'error': 'Target category not found'}, status=404)
        
        # Prevent moving to self or descendants
        if target in categoria.get_descendants(include_self=True):
            return Response({'error': 'Cannot move to self or descendant'}, status=400)
        
        try:
            if position == 'first-child':
                categoria.move_to(target, 'first-child')
            elif position == 'last-child':
                categoria.move_to(target, 'last-child')
            elif position == 'left':
                categoria.move_to(target, 'left')
            elif position == 'right':
                categoria.move_to(target, 'right')
            else:
                return Response({'error': 'Invalid position'}, status=400)
            
            serializer = self.get_serializer(categoria)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
