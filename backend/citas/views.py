from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import Cita
from .serializers import CitaSerializer, CitaListSerializer, CitaCreateSerializer

class CitaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de citas
    """
    queryset = Cita.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'tipo_cita', 'dentista', 'paciente']
    search_fields = [
        'numero_cita', 'motivo_consulta', 'paciente__nombre',
        'paciente__apellido_paterno', 'dentista__user__first_name',
        'dentista__user__last_name'
    ]
    ordering_fields = ['fecha_hora', 'fecha_creacion', 'estado']
    ordering = ['fecha_hora']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return CitaCreateSerializer
        elif self.action == 'list':
            return CitaListSerializer
        return CitaSerializer
    
    def get_queryset(self):
        """Filtra la queryset basada en parámetros"""
        queryset = Cita.objects.select_related('paciente', 'dentista__user', 'tratamiento')
        
        # Filtro por fecha
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_hora__date__gte=fecha_inicio)
            except ValueError:
                pass
        
        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_hora__date__lte=fecha_fin)
            except ValueError:
                pass
        
        # Filtro por hoy
        if self.request.query_params.get('hoy', None) == 'true':
            queryset = queryset.filter(fecha_hora__date=date.today())
        
        # Filtro por próximas (futuras)
        if self.request.query_params.get('proximas', None) == 'true':
            queryset = queryset.filter(fecha_hora__gte=timezone.now())
        
        # Filtro por dentista
        dentista_id = self.request.query_params.get('dentista_id', None)
        if dentista_id:
            queryset = queryset.filter(dentista__id=dentista_id)
        
        # Filtro por paciente
        paciente_id = self.request.query_params.get('paciente_id', None)
        if paciente_id:
            queryset = queryset.filter(paciente__id=paciente_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Asignar usuario creador al crear cita"""
        serializer.save(creado_por=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Confirma una cita"""
        cita = self.get_object()
        
        if cita.estado != 'programada':
            return Response({
                'error': 'Solo se pueden confirmar citas programadas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cita.estado = 'confirmada'
        cita.save()
        
        return Response({
            'message': 'Cita confirmada exitosamente',
            'cita_id': str(cita.id),
            'numero_cita': cita.numero_cita
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancela una cita"""
        cita = self.get_object()
        motivo = request.data.get('motivo_cancelacion', '')
        
        if cita.estado in ['completada', 'cancelada']:
            return Response({
                'error': 'No se puede cancelar una cita que ya está completada o cancelada'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cita.estado = 'cancelada'
        cita.fecha_cancelacion = timezone.now()
        cita.motivo_cancelacion = motivo
        cita.save()
        
        return Response({
            'message': 'Cita cancelada exitosamente',
            'cita_id': str(cita.id),
            'numero_cita': cita.numero_cita
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """Marca una cita como completada"""
        cita = self.get_object()
        notas = request.data.get('notas_dentista', '')
        
        if cita.estado not in ['confirmada', 'en_curso']:
            return Response({
                'error': 'Solo se pueden completar citas confirmadas o en curso'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cita.estado = 'completada'
        if notas:
            cita.notas_dentista = notas
        cita.save()
        
        return Response({
            'message': 'Cita completada exitosamente',
            'cita_id': str(cita.id),
            'numero_cita': cita.numero_cita
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def reagendar(self, request, pk=None):
        """Reagenda una cita"""
        cita_original = self.get_object()
        nueva_fecha = request.data.get('nueva_fecha_hora')
        motivo = request.data.get('motivo_reagendado', '')
        
        if not nueva_fecha:
            return Response({
                'error': 'nueva_fecha_hora es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            nueva_fecha_obj = datetime.fromisoformat(nueva_fecha.replace('Z', '+00:00'))
        except ValueError:
            return Response({
                'error': 'Formato de fecha inválido. Use ISO 8601'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear nueva cita
        nueva_cita = Cita.objects.create(
            paciente=cita_original.paciente,
            dentista=cita_original.dentista,
            tratamiento=cita_original.tratamiento,
            fecha_hora=nueva_fecha_obj,
            duracion_estimada=cita_original.duracion_estimada,
            tipo_cita=cita_original.tipo_cita,
            motivo_consulta=cita_original.motivo_consulta,
            observaciones_previas=cita_original.observaciones_previas,
            costo_estimado=cita_original.costo_estimado,
            creado_por=request.user
        )
        
        # Marcar cita original como reagendada
        cita_original.estado = 'reagendada'
        cita_original.cita_reagendada = nueva_cita
        cita_original.motivo_cancelacion = motivo
        cita_original.fecha_cancelacion = timezone.now()
        cita_original.save()
        
        serializer = CitaSerializer(nueva_cita)
        return Response({
            'message': 'Cita reagendada exitosamente',
            'cita_original': str(cita_original.id),
            'nueva_cita': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def agenda_dentista(self, request):
        """Obtiene la agenda de un dentista para un día específico"""
        dentista_id = request.query_params.get('dentista_id')
        fecha = request.query_params.get('fecha')
        
        if not dentista_id or not fecha:
            return Response({
                'error': 'dentista_id y fecha son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        citas = Cita.objects.filter(
            dentista__id=dentista_id,
            fecha_hora__date=fecha_obj
        ).exclude(estado__in=['cancelada', 'reagendada']).order_by('fecha_hora')
        
        serializer = CitaListSerializer(citas, many=True)
        
        return Response({
            'fecha': fecha,
            'dentista_id': dentista_id,
            'total_citas': citas.count(),
            'citas': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Retorna estadísticas de citas"""
        # Estadísticas generales
        total_citas = Cita.objects.count()
        
        # Estadísticas por estado
        estados_stats = {}
        for estado, nombre in Cita.ESTADOS_CITA:
            count = Cita.objects.filter(estado=estado).count()
            estados_stats[estado] = {'nombre': nombre, 'count': count}
        
        # Citas de hoy
        hoy = date.today()
        citas_hoy = Cita.objects.filter(fecha_hora__date=hoy).count()
        
        # Citas próximas (próximos 7 días)
        proximos_7_dias = hoy + timedelta(days=7)
        citas_proximas = Cita.objects.filter(
            fecha_hora__date__range=[hoy, proximos_7_dias],
            estado__in=['programada', 'confirmada']
        ).count()
        
        # Citas por tipo
        tipos_stats = {}
        for tipo, nombre in Cita.TIPOS_CITA:
            count = Cita.objects.filter(tipo_cita=tipo).count()
            tipos_stats[tipo] = {'nombre': nombre, 'count': count}
        
        return Response({
            'total_citas': total_citas,
            'citas_hoy': citas_hoy,
            'citas_proximas_7_dias': citas_proximas,
            'por_estado': estados_stats,
            'por_tipo': tipos_stats
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def horarios_disponibles(self, request):
        """Obtiene horarios disponibles para un dentista en una fecha"""
        dentista_id = request.query_params.get('dentista_id')
        fecha = request.query_params.get('fecha')
        duracion = int(request.query_params.get('duracion', 60))  # Duración en minutos
        
        if not dentista_id or not fecha:
            return Response({
                'error': 'dentista_id y fecha son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from dentistas.models import Dentista
            dentista = Dentista.objects.get(id=dentista_id, activo=True)
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except (Dentista.DoesNotExist, ValueError):
            return Response({
                'error': 'Dentista no válido o fecha inválida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que el dentista trabaje ese día
        dia_semana = str(fecha_obj.weekday() + 1)
        if dia_semana not in dentista.dias_laborales:
            return Response({
                'horarios_disponibles': [],
                'mensaje': 'El dentista no trabaja este día'
            }, status=status.HTTP_200_OK)
        
        # Obtener citas existentes del día
        citas_dia = Cita.objects.filter(
            dentista=dentista,
            fecha_hora__date=fecha_obj,
            estado__in=['programada', 'confirmada', 'en_curso']
        ).order_by('fecha_hora')
        
        # Generar horarios disponibles
        horarios_disponibles = []
        hora_inicio = datetime.combine(fecha_obj, dentista.horario_inicio)
        hora_fin = datetime.combine(fecha_obj, dentista.horario_fin)
        
        # Intervalos de 30 minutos
        intervalo = timedelta(minutes=30)
        duracion_td = timedelta(minutes=duracion)
        
        hora_actual = hora_inicio
        while hora_actual + duracion_td <= hora_fin:
            # Verificar si hay conflicto con citas existentes
            conflicto = False
            for cita in citas_dia:
                inicio_cita = cita.fecha_hora
                fin_cita = inicio_cita + timedelta(minutes=cita.duracion_estimada)
                
                if (hora_actual < fin_cita and hora_actual + duracion_td > inicio_cita):
                    conflicto = True
                    break
            
            if not conflicto:
                horarios_disponibles.append(hora_actual.strftime('%H:%M'))
            
            hora_actual += intervalo
        
        return Response({
            'fecha': fecha,
            'dentista': dentista.nombre_completo,
            'duracion_consulta': duracion,
            'horarios_disponibles': horarios_disponibles
        }, status=status.HTTP_200_OK)
