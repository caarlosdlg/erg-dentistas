from django.shortcuts import render

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Paciente
from .serializers import PacienteSerializer, PacienteCreateSerializer, PacienteUpdateSerializer

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
    
    @action(detail=False, methods=['get'])
    def dropdown(self, request):
        """
        Endpoint optimizado para dropdown de selección de pacientes
        Retorna solo los campos necesarios para el selector
        """
        try:
            # Obtener solo pacientes activos con email válido
            pacientes = Paciente.objects.filter(
                activo=True,
                email__isnull=False
            ).exclude(email='').values(
                'id', 
                'nombre', 
                'apellido_paterno', 
                'apellido_materno',
                'email',
                'telefono',
                'fecha_nacimiento'
            ).order_by('apellido_paterno', 'nombre')

            # Formatear datos para el dropdown
            pacientes_dropdown = []
            for paciente in pacientes:
                nombre_completo = f"{paciente['nombre']} {paciente['apellido_paterno']}"
                if paciente['apellido_materno']:
                    nombre_completo += f" {paciente['apellido_materno']}"
                
                pacientes_dropdown.append({
                    'id': paciente['id'],
                    'nombre_completo': nombre_completo,
                    'email': paciente['email'],
                    'telefono': paciente['telefono'] or '',
                    'fecha_nacimiento': paciente['fecha_nacimiento'],
                    'display_text': f"{nombre_completo} - {paciente['email']}"
                })
            
            return Response({
                'results': pacientes_dropdown,
                'count': len(pacientes_dropdown)
            })
        
        except Exception as e:
            return Response(
                {'error': f'Error al cargar pacientes: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
