from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Paciente
from .serializers import PacienteSerializer, PacienteListSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de pacientes
    Proporciona operaciones CRUD completas
    """
    queryset = Paciente.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sexo', 'tipo_sangre', 'activo']
    search_fields = ['nombre', 'apellido_paterno', 'apellido_materno', 'email', 'numero_expediente', 'telefono']
    ordering_fields = ['nombre', 'apellido_paterno', 'fecha_nacimiento', 'fecha_registro']
    ordering = ['apellido_paterno', 'nombre']
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción
        """
        if self.action == 'list':
            return PacienteListSerializer
        return PacienteSerializer
    
    def get_queryset(self):
        """
        Filtra la queryset basada en parámetros de consulta
        """
        queryset = Paciente.objects.all()
        
        # Filtro por estado activo
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Búsqueda por texto libre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(apellido_paterno__icontains=search) |
                Q(apellido_materno__icontains=search) |
                Q(email__icontains=search) |
                Q(numero_expediente__icontains=search) |
                Q(telefono__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """
        Desactiva un paciente
        """
        paciente = self.get_object()
        paciente.activo = False
        paciente.save()
        
        return Response({
            'message': 'Paciente desactivado exitosamente',
            'paciente_id': str(paciente.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """
        Activa un paciente
        """
        paciente = self.get_object()
        paciente.activo = True
        paciente.save()
        
        return Response({
            'message': 'Paciente activado exitosamente',
            'paciente_id': str(paciente.id)
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Retorna estadísticas de pacientes
        """
        total_pacientes = Paciente.objects.count()
        pacientes_activos = Paciente.objects.filter(activo=True).count()
        pacientes_inactivos = total_pacientes - pacientes_activos
        
        # Estadísticas por sexo
        pacientes_masculinos = Paciente.objects.filter(sexo='M', activo=True).count()
        pacientes_femeninos = Paciente.objects.filter(sexo='F', activo=True).count()
        
        # Estadísticas por grupo de edad
        from datetime import date, timedelta
        today = date.today()
        
        menores_18 = Paciente.objects.filter(
            fecha_nacimiento__gt=today - timedelta(days=18*365),
            activo=True
        ).count()
        
        entre_18_65 = Paciente.objects.filter(
            fecha_nacimiento__lte=today - timedelta(days=18*365),
            fecha_nacimiento__gt=today - timedelta(days=65*365),
            activo=True
        ).count()
        
        mayores_65 = Paciente.objects.filter(
            fecha_nacimiento__lte=today - timedelta(days=65*365),
            activo=True
        ).count()
        
        return Response({
            'total_pacientes': total_pacientes,
            'pacientes_activos': pacientes_activos,
            'pacientes_inactivos': pacientes_inactivos,
            'por_sexo': {
                'masculinos': pacientes_masculinos,
                'femeninos': pacientes_femeninos
            },
            'por_edad': {
                'menores_18': menores_18,
                'entre_18_65': entre_18_65,
                'mayores_65': mayores_65
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def buscar_por_expediente(self, request):
        """
        Buscar paciente por número de expediente
        """
        numero_expediente = request.query_params.get('numero_expediente', None)
        
        if not numero_expediente:
            return Response({
                'error': 'Número de expediente requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            paciente = Paciente.objects.get(numero_expediente=numero_expediente)
            serializer = PacienteSerializer(paciente)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Paciente.DoesNotExist:
            return Response({
                'error': 'Paciente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
