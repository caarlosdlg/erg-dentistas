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
    CategoriaTratamientoSerializer
)


class TratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing treatments (Tratamientos)
    Provides CRUD operations and additional functionality
    """
    queryset = Tratamiento.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['categoria', 'activo', 'requiere_anestesia', 'sesiones_requeridas']
    search_fields = ['nombre', 'descripcion', 'codigo', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio_base', 'duracion_estimada', 'fecha_creacion']
    def get_serializer_class(self):
        if self.action == 'create':
            return TratamientoCreateSerializer
        elif self.action == 'list':
            return TratamientoListSerializer
        return TratamientoSerializer
    
    def get_queryset(self):
        queryset = Tratamiento.objects.select_related('categoria')
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
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
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Get all treatment categories"""
        categorias = CategoriaTratamiento.objects.filter(activo=True)
        data = [{
            'id': str(cat.id),
            'nombre': cat.nombre,
            'descripcion': cat.descripcion,
            'color': cat.color,
            'total_tratamientos': cat.tratamientos.filter(activo=True).count()
        } for cat in categorias]
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get treatment statistics"""
        stats = {
            'total_tratamientos': Tratamiento.objects.count(),
            'tratamientos_activos': Tratamiento.objects.filter(activo=True).count(),
            'precio_promedio': Tratamiento.objects.filter(activo=True).aggregate(
                avg_precio=Avg('precio_base')
            )['avg_precio'] or 0,
            'duracion_promedio': Tratamiento.objects.filter(activo=True).aggregate(
                avg_duracion=Avg('duracion_estimada')
            )['avg_duracion'] or 0,
            'por_categoria': []
        }
        
        # Stats by category
        categorias_stats = CategoriaTratamiento.objects.annotate(
            total=Count('tratamientos', filter=Q(tratamientos__activo=True))
        ).filter(total__gt=0)
        
        for cat in categorias_stats:
            stats['por_categoria'].append({
                'categoria': cat.nombre,
                'total': cat.total,
                'color': cat.color
            })
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle treatment active status"""
        tratamiento = self.get_object()
        tratamiento.activo = not tratamiento.activo
        tratamiento.save()
        
        return Response({
            'message': f'Tratamiento {"activado" if tratamiento.activo else "desactivado"}',
            'activo': tratamiento.activo
        })


class CategoriaTratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing treatment categories
    """
    queryset = CategoriaTratamiento.objects.all()
    serializer_class = CategoriaTratamientoSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre']
    ordering = ['nombre']
    
    def get_queryset(self):
        queryset = CategoriaTratamiento.objects.all()
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def tratamientos(self, request, pk=None):
        """Get all treatments for this category"""
        categoria = self.get_object()
        tratamientos = categoria.tratamientos.filter(activo=True)
        
        data = [{
            'id': str(t.id),
            'nombre': t.nombre,
            'codigo': t.codigo,
            'precio_base': str(t.precio_base),
            'duracion_estimada': t.duracion_estimada
        } for t in tratamientos]
        
        return Response(data)
