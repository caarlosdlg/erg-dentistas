from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from django.db.models import Avg, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from .models import Review, ReviewHelpful, ReviewReport, ReviewMedia
from .serializers import (
    ReviewListSerializer, ReviewDetailSerializer, ReviewCreateUpdateSerializer,
    ReviewReportSerializer, ReviewMediaSerializer, ReviewStatsSerializer
)
from .filters import ReviewFilter
from .permissions import IsOwnerOrReadOnly, IsModeratorOrReadOnly


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de reseñas con operaciones CRUD,
    filtrado, búsqueda, paginación y acciones especiales.
    """
    queryset = Review.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ReviewFilter
    search_fields = ['title', 'content', 'user__username', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'updated_at', 'rating', 'is_helpful_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Seleccionar serializer según la acción"""
        if self.action == 'list':
            return ReviewListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateUpdateSerializer
        else:
            return ReviewDetailSerializer
    
    def get_queryset(self):
        """Filtrar queryset según permisos y parámetros"""
        queryset = Review.objects.select_related(
            'user', 'content_type', 'moderated_by'
        ).prefetch_related(
            'media', 'helpful_votes', 'reports'
        )
        
        # Los usuarios no staff solo ven reseñas publicadas y aprobadas
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                status__in=['published', 'approved']
            )
        
        # Filtrar por tipo de contenido y objeto específico
        content_type_id = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        
        # Filtrar reseñas del usuario actual
        if self.request.query_params.get('my_reviews') == 'true':
            if self.request.user.is_authenticated:
                queryset = queryset.filter(user=self.request.user)
            else:
                queryset = queryset.none()
        
        return queryset
    
    def perform_create(self, serializer):
        """Personalizar creación de reseña"""
        # Verificar que el usuario no tenga ya una reseña para este objeto
        content_type_id = serializer.validated_data.get('content_type_id')
        object_id = serializer.validated_data.get('object_id')
        
        existing_review = Review.objects.filter(
            user=self.request.user,
            content_type_id=content_type_id,
            object_id=object_id
        ).first()
        
        if existing_review:
            raise serializers.ValidationError(
                "Ya tienes una reseña para este elemento. Puedes editarla en su lugar."
            )
        
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_helpful(self, request, pk=None):
        """Marcar reseña como útil"""
        review = self.get_object()
        
        # Verificar que no sea su propia reseña
        if review.user == request.user:
            return Response(
                {'error': 'No puedes marcar tu propia reseña como útil'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que no haya votado antes
        helpful_vote, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user
        )
        
        if not created:
            return Response(
                {'error': 'Ya has marcado esta reseña como útil'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar contador
        review.mark_helpful()
        
        return Response({
            'message': 'Reseña marcada como útil',
            'helpful_count': review.is_helpful_count
        })
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def remove_helpful(self, request, pk=None):
        """Quitar voto de útil"""
        review = self.get_object()
        
        try:
            helpful_vote = ReviewHelpful.objects.get(
                review=review,
                user=request.user
            )
            helpful_vote.delete()
            
            # Actualizar contador
            review.is_helpful_count = max(0, review.is_helpful_count - 1)
            review.save(update_fields=['is_helpful_count'])
            
            return Response({
                'message': 'Voto de útil removido',
                'helpful_count': review.is_helpful_count
            })
            
        except ReviewHelpful.DoesNotExist:
            return Response(
                {'error': 'No has marcado esta reseña como útil'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        """Reportar reseña"""
        review = self.get_object()
        
        # Verificar que no sea su propia reseña
        if review.user == request.user:
            return Response(
                {'error': 'No puedes reportar tu propia reseña'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReviewReportSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Verificar que no haya reportado antes
            existing_report = ReviewReport.objects.filter(
                review=review,
                reporter=request.user
            ).first()
            
            if existing_report:
                return Response(
                    {'error': 'Ya has reportado esta reseña'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(review=review)
            
            # Actualizar contador y estado de la reseña
            review.report()
            
            return Response({
                'message': 'Reseña reportada exitosamente',
                'report_count': review.report_count
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de reseñas"""
        content_type_id = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')
        
        queryset = self.get_queryset()
        
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        
        # Calcular estadísticas
        stats = queryset.aggregate(
            total_reviews=Count('id'),
            average_rating=Avg('rating'),
            verified_purchases=Count('id', filter=Q(is_verified_purchase=True))
        )
        
        # Distribución de calificaciones
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[str(i)] = queryset.filter(rating=i).count()
        
        # Reseñas recientes (últimos 30 días)
        recent_date = timezone.now() - timezone.timedelta(days=30)
        recent_reviews = queryset.filter(created_at__gte=recent_date).count()
        
        stats.update({
            'rating_distribution': rating_distribution,
            'recent_reviews': recent_reviews
        })
        
        # Manejar valores None
        if stats['average_rating'] is None:
            stats['average_rating'] = 0.0
        else:
            stats['average_rating'] = round(stats['average_rating'], 2)
        
        serializer = ReviewStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_reviews(self, request):
        """Obtener reseñas del usuario actual"""
        queryset = Review.objects.filter(user=request.user).select_related(
            'content_type'
        ).prefetch_related('media')
        
        # Aplicar filtros
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ReviewListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ReviewListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def moderate(self, request, pk=None):
        """Moderar reseña (solo admin/staff)"""
        review = self.get_object()
        new_status = request.data.get('status')
        moderation_notes = request.data.get('moderation_notes', '')
        
        if new_status not in ['approved', 'rejected', 'hidden']:
            return Response(
                {'error': 'Estado no válido. Use: approved, rejected, hidden'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        review.status = new_status
        review.moderated_by = request.user
        review.moderated_at = timezone.now()
        review.moderation_notes = moderation_notes
        review.save()
        
        return Response({
            'message': f'Reseña {new_status} exitosamente',
            'status': review.status,
            'moderated_at': review.moderated_at
        })


class ReviewMediaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de archivos multimedia de reseñas"""
    serializer_class = ReviewMediaSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filtrar multimedia por reseña"""
        review_id = self.kwargs.get('review_pk')
        if review_id:
            return ReviewMedia.objects.filter(review_id=review_id)
        return ReviewMedia.objects.none()
    
    def perform_create(self, serializer):
        """Asociar multimedia con reseña"""
        review_id = self.kwargs.get('review_pk')
        review = get_object_or_404(Review, pk=review_id)
        
        # Verificar que el usuario sea el dueño de la reseña
        if review.user != self.request.user:
            raise permissions.PermissionDenied("No tienes permisos para agregar archivos a esta reseña")
        
        serializer.save(review=review)


class ReviewReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para gestión de reportes (solo lectura para admins)"""
    serializer_class = ReviewReportSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['reason', 'is_resolved', 'review__status']
    ordering_fields = ['created_at', 'resolved_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ReviewReport.objects.select_related(
            'review', 'reporter', 'resolved_by'
        )
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolver reporte"""
        report = self.get_object()
        resolution_notes = request.data.get('resolution_notes', '')
        
        if report.is_resolved:
            return Response(
                {'error': 'Este reporte ya está resuelto'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.resolve(user=request.user, notes=resolution_notes)
        
        return Response({
            'message': 'Reporte resuelto exitosamente',
            'resolved_at': report.resolved_at,
            'resolved_by': report.resolved_by.username
        })
