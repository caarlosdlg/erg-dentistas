from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    ArticuloInventario, 
    CategoriaInventario, 
    Proveedor, 
    MovimientoInventario, 
    AlertaInventario
)
from .serializers import (
    ArticuloInventarioSerializer,
    ArticuloInventarioListSerializer,
    ArticuloInventarioCreateSerializer,
    CategoriaInventarioSerializer,
    ProveedorSerializer,
    MovimientoInventarioSerializer,
    MovimientoInventarioCreateSerializer,
    AlertaInventarioSerializer,
    InventarioStatsSerializer
)


class ArticuloInventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory items (Artículos de Inventario)
    Provides CRUD operations and additional functionality
    """
    queryset = ArticuloInventario.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['categoria', 'proveedor', 'activo']
    search_fields = ['codigo', 'nombre', 'descripcion', 'categoria__nombre', 'proveedor__nombre']
    ordering_fields = ['nombre', 'codigo', 'stock_actual', 'precio_venta', 'fecha_creacion']
    ordering = ['categoria__nombre', 'nombre']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ArticuloInventarioCreateSerializer
        elif self.action == 'list':
            return ArticuloInventarioListSerializer
        return ArticuloInventarioSerializer
    
    def get_queryset(self):
        queryset = ArticuloInventario.objects.select_related('categoria', 'proveedor')
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status', None)
        if stock_status == 'bajo':
            queryset = queryset.filter(stock_actual__lte=F('stock_minimo'))
        elif stock_status == 'critico':
            queryset = queryset.filter(stock_actual__lte=F('stock_minimo') * 0.5)
        elif stock_status == 'alto':
            queryset = queryset.filter(stock_actual__gte=F('stock_maximo') * 0.9)
        
        # Filter by expiration date
        por_vencer = self.request.query_params.get('por_vencer', None)
        if por_vencer == 'true':
            fecha_limite = timezone.now().date() + timedelta(days=90)
            queryset = queryset.filter(
                fecha_vencimiento__isnull=False,
                fecha_vencimiento__lte=fecha_limite
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get inventory statistics"""
        total_articulos = ArticuloInventario.objects.filter(activo=True).count()
        articulos_criticos = ArticuloInventario.objects.filter(
            activo=True,
            stock_actual__lte=F('stock_minimo') * 0.5
        ).count()
        articulos_bajo_stock = ArticuloInventario.objects.filter(
            activo=True,
            stock_actual__lte=F('stock_minimo')
        ).count()
        
        valor_total = ArticuloInventario.objects.filter(activo=True).aggregate(
            total=Sum(F('stock_actual') * F('precio_compra'))
        )['total'] or 0
        
        stats = {
            'total_articulos': total_articulos,
            'articulos_criticos': articulos_criticos,
            'articulos_bajo_stock': articulos_bajo_stock,
            'valor_total_inventario': float(valor_total),
            'alertas_activas': AlertaInventario.objects.filter(activa=True).count()
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def movimientos(self, request, pk=None):
        """Get movements for this inventory item"""
        articulo = self.get_object()
        movimientos = MovimientoInventario.objects.filter(
            articulo=articulo
        ).order_by('-fecha_movimiento')[:20]
        
        serializer = MovimientoInventarioSerializer(movimientos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        """Adjust stock for this item"""
        articulo = self.get_object()
        cantidad_nueva = request.data.get('cantidad_nueva')
        motivo = request.data.get('motivo', 'Ajuste manual')
        
        if cantidad_nueva is None:
            return Response(
                {'error': 'Se requiere cantidad_nueva'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cantidad_nueva = int(cantidad_nueva)
        except ValueError:
            return Response(
                {'error': 'cantidad_nueva debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create movement record
        MovimientoInventario.objects.create(
            articulo=articulo,
            tipo='ajuste',
            cantidad=abs(cantidad_nueva - articulo.stock_actual),
            cantidad_anterior=articulo.stock_actual,
            cantidad_nueva=cantidad_nueva,
            motivo=motivo,
            registrado_por=request.user
        )
        
        # Update stock
        articulo.stock_actual = cantidad_nueva
        articulo.save()
        
        return Response({
            'message': 'Stock ajustado exitosamente',
            'stock_anterior': articulo.stock_actual,
            'stock_nuevo': cantidad_nueva
        })


class CategoriaInventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory categories
    """
    queryset = CategoriaInventario.objects.all()
    serializer_class = CategoriaInventarioSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'fecha_creacion']
    ordering = ['nombre']


class ProveedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing suppliers (Proveedores)
    """
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre', 'contacto', 'email', 'telefono']
    ordering_fields = ['nombre', 'fecha_registro']
    ordering = ['nombre']
    
    @action(detail=True, methods=['get'])
    def articulos(self, request, pk=None):
        """Get all items from this supplier"""
        proveedor = self.get_object()
        articulos = proveedor.articulo_set.filter(activo=True)
        
        serializer = ArticuloInventarioListSerializer(articulos, many=True)
        return Response(serializer.data)


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory movements
    """
    queryset = MovimientoInventario.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tipo', 'articulo', 'registrado_por']
    search_fields = ['articulo__nombre', 'articulo__codigo', 'motivo']
    ordering_fields = ['fecha_movimiento']
    ordering = ['-fecha_movimiento']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MovimientoInventarioCreateSerializer
        return MovimientoInventarioSerializer
    
    def get_queryset(self):
        queryset = MovimientoInventario.objects.select_related(
            'articulo', 'registrado_por'
        )
        
        # Filter by date range
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            try:
                fecha_desde_dt = datetime.fromisoformat(fecha_desde).date()
                queryset = queryset.filter(fecha_movimiento__date__gte=fecha_desde_dt)
            except ValueError:
                pass
                
        if fecha_hasta:
            try:
                fecha_hasta_dt = datetime.fromisoformat(fecha_hasta).date()
                queryset = queryset.filter(fecha_movimiento__date__lte=fecha_hasta_dt)
            except ValueError:
                pass
        
        return queryset


class AlertaInventarioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for inventory alerts (read-only)
    """
    queryset = AlertaInventario.objects.all()
    serializer_class = AlertaInventarioSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['tipo', 'activa', 'articulo']
    ordering_fields = ['fecha_creacion']
    ordering = ['-fecha_creacion']
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark alert as resolved"""
        alerta = self.get_object()
        alerta.activa = False
        alerta.fecha_resolucion = timezone.now()
        alerta.save()
        
        return Response({
            'message': 'Alerta marcada como resuelta',
            'activa': alerta.activa
        })
