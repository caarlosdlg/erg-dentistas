from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Cita
from .serializers import CitaSerializer, CitaListSerializer, CitaCreateSerializer
from .email_service import AppointmentEmailService
import logging

logger = logging.getLogger(__name__)

class CitaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments (Citas)
    Provides CRUD operations and additional functionality
    """
    queryset = Cita.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'tipo_cita', 'dentista', 'paciente', 'fecha_hora']
    search_fields = ['numero_cita', 'paciente__nombre', 'paciente__apellido_paterno', 'motivo_consulta']
    ordering_fields = ['fecha_hora', 'fecha_creacion', 'estado']
    ordering = ['fecha_hora']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CitaCreateSerializer
        elif self.action == 'list':
            return CitaListSerializer
        return CitaSerializer
    
    def get_queryset(self):
        queryset = Cita.objects.all()
        
        # Filter by date range
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            try:
                fecha_desde_dt = datetime.fromisoformat(fecha_desde).date()
                queryset = queryset.filter(fecha_hora__date__gte=fecha_desde_dt)
            except ValueError:
                pass
                
        if fecha_hasta:
            try:
                fecha_hasta_dt = datetime.fromisoformat(fecha_hasta).date()
                queryset = queryset.filter(fecha_hora__date__lte=fecha_hasta_dt)
            except ValueError:
                pass
        
        # Filter by specific date
        fecha = self.request.query_params.get('fecha', None)
        if fecha:
            try:
                fecha_dt = datetime.fromisoformat(fecha).date()
                queryset = queryset.filter(fecha_hora__date=fecha_dt)
            except ValueError:
                pass
        
        return queryset.select_related('paciente', 'dentista', 'tratamiento')

    def create(self, request, *args, **kwargs):
        """
        Create appointment
        """
        try:
            # Create appointment using serializer
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            cita = serializer.save()
            
            # Auto-generate appointment number if not exists
            if not cita.numero_cita:
                cita.numero_cita = f"CIT-{cita.id.hex[:8].upper()}"
                cita.save()
            
            response_data = CitaSerializer(cita).data
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating appointment: {str(e)}")
            return Response(
                {'error': f'Error creating appointment: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmar cita y enviar email automáticamente"""
        cita = self.get_object()
        if cita.estado not in ['programada']:
            return Response(
                {'error': 'Solo se pueden confirmar citas programadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Cambiar estado a confirmada
            cita.estado = 'confirmada'
            cita.save()
            
            # Enviar email de confirmación
            email_service = AppointmentEmailService()
            email_enviado = email_service.send_appointment_confirmation_email(cita)
            
            return Response({
                'message': 'Cita confirmada exitosamente',
                'estado': cita.estado,
                'email_enviado': email_enviado,
                'paciente_email': cita.paciente.email if cita.paciente else None
            })
            
        except Exception as e:
            logger.error(f"Error confirmando cita {cita.numero_cita}: {str(e)}")
            return Response(
                {'error': f'Error al confirmar la cita: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def send_confirmation_email(self, request, pk=None):
        """
        Enviar email de confirmación manualmente
        """
        cita = self.get_object()
        
        try:
            email_service = AppointmentEmailService()
            email_enviado = email_service.send_appointment_confirmation_email(cita)
            
            if email_enviado:
                return Response({
                    'message': 'Email de confirmación enviado exitosamente',
                    'email_enviado': True,
                    'destinatario': cita.paciente.email
                })
            else:
                return Response({
                    'message': 'No se pudo enviar el email',
                    'email_enviado': False,
                    'error': 'Error en el servicio de email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error enviando email para cita {cita.numero_cita}: {str(e)}")
            return Response({
                'error': f'Error al enviar email: {str(e)}',
                'email_enviado': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        cita = self.get_object()
        motivo = request.data.get('motivo', '')
        
        if cita.estado in ['completada', 'cancelada']:
            return Response(
                {'error': 'No se puede cancelar esta cita'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cita.estado = 'cancelada'
        cita.motivo_cancelacion = motivo
        cita.fecha_cancelacion = timezone.now()
        cita.save()
        
        return Response({
            'message': 'Cita cancelada exitosamente',
            'estado': cita.estado
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark appointment as completed"""
        cita = self.get_object()
        notas = request.data.get('notas_dentista', '')
        
        if cita.estado != 'confirmada':
            return Response(
                {'error': 'Solo se pueden completar citas confirmadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cita.estado = 'completada'
        if notas:
            cita.notas_dentista = notas
        cita.save()
        
        return Response({
            'message': 'Cita completada exitosamente',
            'estado': cita.estado
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's appointments"""
        today = timezone.now().date()
        citas = self.get_queryset().filter(fecha_hora__date=today)
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        now = timezone.now()
        citas = self.get_queryset().filter(
            fecha_hora__gte=now,
            estado__in=['programada', 'confirmada']
        )[:10]
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)
