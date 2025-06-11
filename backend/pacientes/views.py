from django.shortcuts import render

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Paciente, ExpedienteMedico, BitacoraCita, ImagenMedica
from .serializers import (PacienteSerializer, PacienteCreateSerializer, 
                         PacienteUpdateSerializer, ExpedienteMedicoSerializer,
                         ExpedienteMedicoCreateSerializer, BitacoraCitaSerializer,
                         BitacoraCitaCreateSerializer, BitacoraCitaUpdateSerializer,
                         ImagenMedicaSerializer, ImagenMedicaCreateSerializer)
from dentistas.models import Dentista

class PacienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patients (Pacientes)
    Provides CRUD operations and additional functionality
    """
    queryset = Paciente.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PacienteCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PacienteUpdateSerializer
        return PacienteSerializer
    
    def get_queryset(self):
        queryset = Paciente.objects.all()
        
        # Filter by dentist if authenticated
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
                # Filter patients created by or assigned to this dentist
                dentista_filter = self.request.query_params.get('dentista_filter', 'created')
                if dentista_filter == 'assigned':
                    queryset = queryset.filter(dentista_asignado=dentista)
                elif dentista_filter == 'all':
                    queryset = queryset.filter(Q(creado_por=dentista) | Q(dentista_asignado=dentista))
                else:  # default: 'created'
                    queryset = queryset.filter(creado_por=dentista)
            except Dentista.DoesNotExist:
                pass
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(apellido_paterno__icontains=search) |
                Q(apellido_materno__icontains=search) |
                Q(numero_expediente__icontains=search) |
                Q(email__icontains=search) |
                Q(telefono__icontains=search)
            )
        
        # Filter by medical alerts (allergies or chronic diseases)
        has_alerts = self.request.query_params.get('has_alerts', None)
        if has_alerts is not None:
            alerts_bool = has_alerts.lower() in ['true', '1', 'yes']
            if alerts_bool:
                queryset = queryset.filter(
                    Q(alergias__isnull=False, alergias__gt='') |
                    Q(enfermedades_cronicas__isnull=False, enfermedades_cronicas__gt='')
                )
        
        return queryset.order_by('-fecha_registro')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated dentist as creator"""
        creado_por = None
        
        # Try to get authenticated dentist
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                creado_por = Dentista.objects.get(user=self.request.user)
            except Dentista.DoesNotExist:
                pass
        
        # Fallback: get first dentist (for development)
        if not creado_por:
            creado_por = Dentista.objects.first()
        
        if creado_por:
            serializer.save(creado_por=creado_por)
        else:
            # This should rarely happen, but just in case
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle patient active status"""
        paciente = self.get_object()
        paciente.activo = not paciente.activo
        paciente.save()
        
        serializer = self.get_serializer(paciente)
        return Response({
            'message': f'Estado del paciente {"activado" if paciente.activo else "desactivado"}',
            'paciente': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def medical_history(self, request, pk=None):
        """Get patient medical history summary"""
        paciente = self.get_object()
        
        # This would normally fetch related medical records
        # For now, we'll return the basic medical information
        medical_data = {
            'paciente_id': paciente.id,
            'nombre_completo': paciente.nombre_completo,
            'alergias': paciente.alergias,
            'medicamentos': paciente.medicamentos,
            'enfermedades_cronicas': paciente.enfermedades_cronicas,
            'tipo_sangre': paciente.tipo_sangre,
            'contacto_emergencia': {
                'nombre': paciente.contacto_emergencia_nombre,
                'telefono': paciente.contacto_emergencia_telefono,
                'relacion': paciente.contacto_emergencia_relacion
            }
        }
        
        return Response(medical_data)

class PacienteStatsView(APIView):
    """
    API view for patient statistics
    """
    
    def get(self, request):
        now = timezone.now()
        
        # Basic counts
        total_pacientes = Paciente.objects.count()
        pacientes_activos = Paciente.objects.filter(activo=True).count()
        
        # This month registrations
        first_day_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        nuevos_este_mes = Paciente.objects.filter(
            fecha_registro__gte=first_day_month
        ).count()
        
        # Patients with medical alerts
        pacientes_con_alertas = Paciente.objects.filter(
            Q(alergias__isnull=False, alergias__gt='') |
            Q(enfermedades_cronicas__isnull=False, enfermedades_cronicas__gt='')
        ).count()
        
        # Age distribution
        today = timezone.now().date()
        age_groups = {
            'menores_18': 0,
            'adultos_18_65': 0,
            'mayores_65': 0
        }
        
        for paciente in Paciente.objects.filter(activo=True):
            if paciente.fecha_nacimiento:
                age = today.year - paciente.fecha_nacimiento.year
                if age < 18:
                    age_groups['menores_18'] += 1
                elif age <= 65:
                    age_groups['adultos_18_65'] += 1
                else:
                    age_groups['mayores_65'] += 1
        
        # Gender distribution
        distribucion_genero = Paciente.objects.filter(activo=True).values('sexo').annotate(
            count=Count('sexo')
        )
        
        stats = {
            'total_pacientes': total_pacientes,
            'pacientes_activos': pacientes_activos,
            'nuevos_este_mes': nuevos_este_mes,
            'pacientes_con_alertas': pacientes_con_alertas,
            'distribucion_edad': age_groups,
            'distribucion_genero': {item['sexo']: item['count'] for item in distribucion_genero},
            'fecha_actualizacion': now.isoformat()
        }
        
        return Response(stats)

class PacienteSearchView(APIView):
    """
    Advanced search for patients
    """
    
    def get(self, request):
        query = request.query_params.get('q', '')
        filters = {}
        
        # Extract filters from query params
        sexo = request.query_params.get('sexo', None)
        if sexo:
            filters['sexo'] = sexo
            
        tipo_sangre = request.query_params.get('tipo_sangre', None)
        if tipo_sangre:
            filters['tipo_sangre'] = tipo_sangre
            
        activo = request.query_params.get('activo', None)
        if activo is not None:
            filters['activo'] = activo.lower() in ['true', '1', 'yes']
        
        # Build queryset
        queryset = Paciente.objects.all()
        
        # Apply text search
        if query:
            queryset = queryset.filter(
                Q(nombre__icontains=query) |
                Q(apellido_paterno__icontains=query) |
                Q(apellido_materno__icontains=query) |
                Q(numero_expediente__icontains=query) |
                Q(email__icontains=query) |
                Q(telefono__icontains=query)
            )
        
        # Apply filters
        queryset = queryset.filter(**filters)
        
        # Pagination
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        results = queryset[start:end]
        
        serializer = PacienteSerializer(results, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'results': serializer.data
        })

class ExpedienteMedicoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medical records (Expedientes Médicos)
    """
    queryset = ExpedienteMedico.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpedienteMedicoCreateSerializer
        return ExpedienteMedicoSerializer
    
    def get_queryset(self):
        queryset = ExpedienteMedico.objects.all()
        
        # Filter by dentist if authenticated
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
                queryset = queryset.filter(dentista_responsable=dentista)
            except Dentista.DoesNotExist:
                pass
        
        # Filter by patient
        paciente_id = self.request.query_params.get('paciente', None)
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        
        # Filter by active status
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_bool = activo.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activo=activo_bool)
        
        return queryset.order_by('-fecha_apertura')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated dentist as responsible"""
        dentista_responsable = None
        
        # Try to get authenticated dentist
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista_responsable = Dentista.objects.get(user=self.request.user)
            except Dentista.DoesNotExist:
                pass
        
        # Fallback: get first dentist (for development)
        if not dentista_responsable:
            dentista_responsable = Dentista.objects.first()
        
        if dentista_responsable:
            serializer.save(dentista_responsable=dentista_responsable)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def close_record(self, request, pk=None):
        """Close a medical record"""
        expediente = self.get_object()
        
        if not expediente.activo:
            return Response(
                {'error': 'El expediente ya está cerrado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        motivo_cierre = request.data.get('motivo_cierre', '')
        
        # Get authenticated dentist
        cerrado_por = None
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                cerrado_por = Dentista.objects.get(user=request.user)
            except Dentista.DoesNotExist:
                cerrado_por = Dentista.objects.first()
        else:
            cerrado_por = Dentista.objects.first()
        
        expediente.activo = False
        expediente.cerrado_fecha = timezone.now()
        expediente.cerrado_por = cerrado_por
        expediente.motivo_cierre = motivo_cierre
        expediente.save()
        
        serializer = self.get_serializer(expediente)
        return Response({
            'message': 'Expediente cerrado exitosamente',
            'expediente': serializer.data
        })

class BitacoraCitaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bitácora de citas (appointment logs)
    """
    queryset = BitacoraCita.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BitacoraCitaCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BitacoraCitaUpdateSerializer
        return BitacoraCitaSerializer
    
    def get_queryset(self):
        queryset = BitacoraCita.objects.all()
        
        # Filter by patient
        paciente_id = self.request.query_params.get('paciente', None)
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        
        # Filter by dentist if authenticated
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
                queryset = queryset.filter(dentista=dentista)
            except Dentista.DoesNotExist:
                pass
        
        # Filter by date range
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
        if fecha_inicio:
            queryset = queryset.filter(fecha_hora__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_hora__lte=fecha_fin)
        
        # Filter by appointment type
        tipo_cita = self.request.query_params.get('tipo_cita', None)
        if tipo_cita:
            queryset = queryset.filter(tipo_cita=tipo_cita)
        
        # Filter by status
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        return queryset.order_by('-fecha_hora')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated dentist"""
        dentista = None
        
        # Try to get authenticated dentist
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
            except Dentista.DoesNotExist:
                pass
        
        # Fallback: get first dentist (for development)
        if not dentista:
            dentista = Dentista.objects.first()
        
        if dentista:
            serializer.save(dentista=dentista)
        else:
            serializer.save()

    def perform_update(self, serializer):
        """Ensure dentist is preserved during updates"""
        instance = self.get_object()
        
        # Always preserve the existing dentist for updates
        # The dentist should not change during an appointment update
        serializer.save(dentista=instance.dentista)

class ImagenMedicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medical images
    """
    queryset = ImagenMedica.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ImagenMedicaCreateSerializer
        return ImagenMedicaSerializer
    
    def get_queryset(self):
        queryset = ImagenMedica.objects.all()
        
        # Filter by patient
        paciente_id = self.request.query_params.get('paciente', None)
        if paciente_id:
            queryset = queryset.filter(paciente_id=paciente_id)
        
        # Filter by dentist if authenticated
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
                queryset = queryset.filter(dentista_responsable=dentista)
            except Dentista.DoesNotExist:
                pass
        
        # Filter by image type
        tipo_imagen = self.request.query_params.get('tipo_imagen', None)
        if tipo_imagen:
            queryset = queryset.filter(tipo_imagen=tipo_imagen)
        
        # Filter by active status
        activa = self.request.query_params.get('activa', None)
        if activa is not None:
            activa_bool = activa.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(activa=activa_bool)
        
        # Filter by bitácora entry
        bitacora_id = self.request.query_params.get('bitacora', None)
        if bitacora_id:
            queryset = queryset.filter(bitacora_cita_id=bitacora_id)
        
        return queryset.order_by('-fecha_toma')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated dentist and process image"""
        dentista = None
        
        # Try to get authenticated dentist
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            try:
                dentista = Dentista.objects.get(user=self.request.user)
            except Dentista.DoesNotExist:
                pass
        
        # Fallback: get first dentist (for development)
        if not dentista:
            dentista = Dentista.objects.first()
        
        if dentista:
            serializer.save(dentista_responsable=dentista)
        else:
            serializer.save()
