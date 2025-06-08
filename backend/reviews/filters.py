import django_filters
from django.db.models import Q
from .models import Review


class ReviewFilter(django_filters.FilterSet):
    """
    Filtros personalizados para reseñas
    """
    # Filtros de calificación
    rating = django_filters.NumberFilter(field_name='rating')
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    
    # Filtros de estado
    status = django_filters.ChoiceFilter(choices=Review.STATUS_CHOICES)
    
    # Filtros de fecha
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Filtros de usuario
    user = django_filters.CharFilter(field_name='user__username', lookup_expr='icontains')
    user_id = django_filters.NumberFilter(field_name='user__id')
    
    # Filtros de contenido
    content_type = django_filters.NumberFilter(field_name='content_type__id')
    object_id = django_filters.CharFilter(field_name='object_id')
    
    # Filtros de verificación
    verified_purchase = django_filters.BooleanFilter(field_name='is_verified_purchase')
    
    # Filtros de moderación
    is_reported = django_filters.BooleanFilter(field_name='is_reported')
    has_media = django_filters.BooleanFilter(method='filter_has_media')
    
    # Filtro de búsqueda combinada
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Review
        fields = [
            'rating', 'rating_min', 'rating_max', 'status',
            'created_after', 'created_before', 'user', 'user_id',
            'content_type', 'object_id', 'verified_purchase',
            'is_reported', 'has_media', 'search'
        ]
    
    def filter_has_media(self, queryset, name, value):
        """Filtrar reseñas que tienen archivos multimedia"""
        if value:
            return queryset.filter(media__isnull=False).distinct()
        else:
            return queryset.filter(media__isnull=True)
    
    def filter_search(self, queryset, name, value):
        """Búsqueda combinada en título, contenido y usuario"""
        if value:
            return queryset.filter(
                Q(title__icontains=value) |
                Q(content__icontains=value) |
                Q(user__username__icontains=value) |
                Q(user__first_name__icontains=value) |
                Q(user__last_name__icontains=value)
            ).distinct()
        return queryset
