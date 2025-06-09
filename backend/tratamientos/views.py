from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Min, Max
from .models import Tratamiento, CategoriaTratamiento
from .serializers import (
    TratamientoSerializer, TratamientoListSerializer,
    CategoriaTratamientoSerializer
)

class CategoriaTratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de categorías de tratamientos
    """
    queryset = CategoriaTratamiento.objects.all()
    serializer_class = CategoriaTratamientoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre']
    ordering = ['nombre']
    
    def get_queryset(self):
        """Filtra categorías activas por defecto"""
        queryset = CategoriaTratamiento.objects.all()
        
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        else:
            # Por defecto, mostrar solo activas
            queryset = queryset.filter(activo=True)
        
        return queryset

class TratamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de tratamientos
    """
    queryset = Tratamiento.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'activo', 'requiere_anestesia', 'sesiones_requeridas']
    search_fields = ['nombre', 'codigo', 'descripcion', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio_base', 'duracion_estimada', 'fecha_creacion']
    ordering = ['nombre']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'list':
            return TratamientoListSerializer
        return TratamientoSerializer
    
    def get_queryset(self):
        """Filtra la queryset basada en parámetros"""
        queryset = Tratamiento.objects.select_related('categoria')
        
        # Filtro por estado activo
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtro por rango de precios
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
        
        # Filtro por duración
        duracion_max = self.request.query_params.get('duracion_max', None)
        if duracion_max:
            try:
                queryset = queryset.filter(duracion_estimada__lte=int(duracion_max))
            except ValueError:
                pass
        
        # Búsqueda por texto libre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(codigo__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(categoria__nombre__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactiva un tratamiento"""
        tratamiento = self.get_object()
        tratamiento.activo = False
        tratamiento.save()
        
        return Response({
            'message': 'Tratamiento desactivado exitosamente',
            'tratamiento_id': str(tratamiento.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activa un tratamiento"""
        tratamiento = self.get_object()
        tratamiento.activo = True
        tratamiento.save()
        
        return Response({
            'message': 'Tratamiento activado exitosamente',
            'tratamiento_id': str(tratamiento.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def actualizar_precio(self, request, pk=None):
        """Actualiza el precio de un tratamiento"""
        tratamiento = self.get_object()
        nuevo_precio = request.data.get('nuevo_precio')
        
        if not nuevo_precio:
            return Response({
                'error': 'nuevo_precio es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            nuevo_precio = float(nuevo_precio)
            if nuevo_precio <= 0:
                raise ValueError("El precio debe ser mayor a 0")
        except ValueError:
            return Response({
                'error': 'nuevo_precio debe ser un número válido mayor a 0'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        precio_anterior = tratamiento.precio_base
        tratamiento.precio_base = nuevo_precio
        tratamiento.save()
        
        return Response({
            'message': 'Precio actualizado exitosamente',
            'precio_anterior': precio_anterior,
            'precio_nuevo': nuevo_precio,
            'tratamiento': tratamiento.nombre
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        """Obtiene tratamientos agrupados por categoría"""
        categoria_id = request.query_params.get('categoria_id')
        
        if categoria_id:
            try:
                categoria = CategoriaTratamiento.objects.get(id=categoria_id)
                tratamientos = Tratamiento.objects.filter(
                    categoria=categoria,
                    activo=True
                ).order_by('nombre')
                
                serializer = TratamientoListSerializer(tratamientos, many=True)
                
                return Response({
                    'categoria': CategoriaTratamientoSerializer(categoria).data,
                    'tratamientos': serializer.data
                }, status=status.HTTP_200_OK)
                
            except CategoriaTratamiento.DoesNotExist:
                return Response({
                    'error': 'Categoría no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Si no se especifica categoría, agrupar todos
        categorias = CategoriaTratamiento.objects.filter(activo=True).prefetch_related('tratamientos')
        resultado = []
        
        for categoria in categorias:
            tratamientos = categoria.tratamientos.filter(activo=True).order_by('nombre')
            resultado.append({
                'categoria': CategoriaTratamientoSerializer(categoria).data,
                'tratamientos': TratamientoListSerializer(tratamientos, many=True).data
            })
        
        return Response(resultado, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def mas_populares(self, request):
        """Obtiene los tratamientos más populares basado en citas"""
        from citas.models import Cita
        
        # Obtener tratamientos más utilizados en citas
        tratamientos_populares = Tratamiento.objects.filter(
            activo=True,
            citas__isnull=False
        ).annotate(
            total_citas=Count('citas')
        ).order_by('-total_citas')[:10]
        
        serializer = TratamientoListSerializer(tratamientos_populares, many=True)
        
        # Agregar información de popularidad
        resultado = []
        for i, tratamiento_data in enumerate(serializer.data):
            tratamiento_obj = tratamientos_populares[i]
            tratamiento_data['total_citas'] = tratamiento_obj.total_citas
            tratamiento_data['ranking'] = i + 1
            resultado.append(tratamiento_data)
        
        return Response({
            'tratamientos_populares': resultado
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de tratamientos"""
        total_tratamientos = Tratamiento.objects.count()
        tratamientos_activos = Tratamiento.objects.filter(activo=True).count()
        tratamientos_inactivos = total_tratamientos - tratamientos_activos
        
        # Estadísticas de precios
        precios_stats = Tratamiento.objects.filter(activo=True).aggregate(
            precio_promedio=Avg('precio_base'),
            precio_min=Min('precio_base'),
            precio_max=Max('precio_base')
        )
        
        # Estadísticas por categoría
        categorias_stats = []
        for categoria in CategoriaTratamiento.objects.filter(activo=True):
            count = Tratamiento.objects.filter(categoria=categoria, activo=True).count()
            categorias_stats.append({
                'categoria': categoria.nombre,
                'total_tratamientos': count,
                'color': categoria.color
            })
        
        # Distribución por duración
        duracion_stats = {
            'cortos_30min': Tratamiento.objects.filter(
                activo=True, duracion_estimada__lte=30
            ).count(),
            'medios_30_60min': Tratamiento.objects.filter(
                activo=True, duracion_estimada__gt=30, duracion_estimada__lte=60
            ).count(),
            'largos_60min': Tratamiento.objects.filter(
                activo=True, duracion_estimada__gt=60
            ).count()
        }
        
        return Response({
            'total_tratamientos': total_tratamientos,
            'tratamientos_activos': tratamientos_activos,
            'tratamientos_inactivos': tratamientos_inactivos,
            'precios': precios_stats,
            'por_categoria': categorias_stats,
            'por_duracion': duracion_stats
        }, status=status.HTTP_200_OK)
