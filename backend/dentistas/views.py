from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Dentista, Especialidad
from .serializers import (
    DentistaSerializer, DentistaListSerializer, DentistaCreateSerializer,
    EspecialidadSerializer
)

class EspecialidadViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de especialidades dentales
    """
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre']
    ordering = ['nombre']
    
    def get_queryset(self):
        """Filtra especialidades activas por defecto"""
        queryset = Especialidad.objects.all()
        
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        else:
            # Por defecto, mostrar solo activas
            queryset = queryset.filter(activo=True)
        
        return queryset

class DentistaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de dentistas
    """
    queryset = Dentista.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activo', 'especialidades']
    search_fields = [
        'user__first_name', 'user__last_name', 'user__email',
        'cedula_profesional', 'telefono', 'universidad'
    ]
    ordering_fields = ['user__last_name', 'user__first_name', 'fecha_ingreso']
    ordering = ['user__last_name', 'user__first_name']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return DentistaCreateSerializer
        elif self.action == 'list':
            return DentistaListSerializer
        return DentistaSerializer
    
    def get_queryset(self):
        """Filtra la queryset basada en parámetros"""
        queryset = Dentista.objects.select_related('user').prefetch_related('especialidades')
        
        # Filtro por estado activo
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtro por especialidad
        especialidad = self.request.query_params.get('especialidad', None)
        if especialidad:
            queryset = queryset.filter(especialidades__id=especialidad)
        
        # Búsqueda por texto libre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(cedula_profesional__icontains=search) |
                Q(universidad__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactiva un dentista"""
        dentista = self.get_object()
        dentista.activo = False
        dentista.save()
        
        return Response({
            'message': 'Dentista desactivado exitosamente',
            'dentista_id': str(dentista.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activa un dentista"""
        dentista = self.get_object()
        dentista.activo = True
        dentista.save()
        
        return Response({
            'message': 'Dentista activado exitosamente',
            'dentista_id': str(dentista.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def citas(self, request, pk=None):
        """Obtiene las citas de un dentista"""
        dentista = self.get_object()
        
        # Filtros de fecha
        fecha_inicio = request.query_params.get('fecha_inicio', None)
        fecha_fin = request.query_params.get('fecha_fin', None)
        
        citas = dentista.citas.all()
        
        if fecha_inicio:
            try:
                from datetime import datetime
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                citas = citas.filter(fecha_hora__date__gte=fecha_inicio)
            except ValueError:
                pass
        
        if fecha_fin:
            try:
                from datetime import datetime
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                citas = citas.filter(fecha_hora__date__lte=fecha_fin)
            except ValueError:
                pass
        
        # Importar aquí para evitar imports circulares
        from citas.serializers import CitaListSerializer
        serializer = CitaListSerializer(citas, many=True)
        
        return Response({
            'dentista': dentista.nombre_completo,
            'total_citas': citas.count(),
            'citas': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Obtiene dentistas disponibles para una fecha/hora específica"""
        fecha_hora = request.query_params.get('fecha_hora', None)
        
        if not fecha_hora:
            return Response({
                'error': 'fecha_hora es requerida (formato: YYYY-MM-DD HH:MM)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from datetime import datetime
            fecha_hora_obj = datetime.strptime(fecha_hora, '%Y-%m-%d %H:%M')
        except ValueError:
            return Response({
                'error': 'Formato de fecha inválido. Use: YYYY-MM-DD HH:MM'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener día de la semana (1=Lunes, 7=Domingo)
        dia_semana = str(fecha_hora_obj.weekday() + 1)
        
        # Filtrar dentistas que trabajen ese día y estén en horario
        dentistas_disponibles = Dentista.objects.filter(
            activo=True,
            dias_laborales__contains=dia_semana,
            horario_inicio__lte=fecha_hora_obj.time(),
            horario_fin__gte=fecha_hora_obj.time()
        )
        
        # Excluir dentistas que ya tengan cita en esa hora
        from citas.models import Cita
        from django.utils import timezone
        from datetime import timedelta
        
        citas_conflicto = Cita.objects.filter(
            fecha_hora__date=fecha_hora_obj.date(),
            estado__in=['programada', 'confirmada', 'en_curso']
        )
        
        dentistas_ocupados = []
        for cita in citas_conflicto:
            inicio_cita = cita.fecha_hora
            fin_cita = inicio_cita + timedelta(minutes=cita.duracion_estimada)
            
            if inicio_cita <= fecha_hora_obj <= fin_cita:
                dentistas_ocupados.append(cita.dentista.id)
        
        dentistas_disponibles = dentistas_disponibles.exclude(id__in=dentistas_ocupados)
        
        serializer = DentistaListSerializer(dentistas_disponibles, many=True)
        
        return Response({
            'fecha_hora': fecha_hora,
            'dentistas_disponibles': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de dentistas"""
        total_dentistas = Dentista.objects.count()
        dentistas_activos = Dentista.objects.filter(activo=True).count()
        dentistas_inactivos = total_dentistas - dentistas_activos
        
        # Estadísticas por especialidades
        especialidades_stats = {}
        for especialidad in Especialidad.objects.filter(activo=True):
            count = Dentista.objects.filter(
                especialidades=especialidad,
                activo=True
            ).count()
            especialidades_stats[especialidad.nombre] = count
        
        return Response({
            'total_dentistas': total_dentistas,
            'dentistas_activos': dentistas_activos,
            'dentistas_inactivos': dentistas_inactivos,
            'por_especialidad': especialidades_stats
        }, status=status.HTTP_200_OK)
