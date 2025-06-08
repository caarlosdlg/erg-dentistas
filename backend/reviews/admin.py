from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Review, ReviewHelpful, ReviewReport, ReviewMedia


class ReviewMediaInline(admin.TabularInline):
    """Inline para archivos multimedia de reseñas"""
    model = ReviewMedia
    extra = 0
    fields = ['file', 'media_type', 'caption', 'sort_order']
    readonly_fields = ['created_at']


class ReviewHelpfulInline(admin.TabularInline):
    """Inline para votos útiles"""
    model = ReviewHelpful
    extra = 0
    readonly_fields = ['user', 'created_at']


class ReviewReportInline(admin.TabularInline):
    """Inline para reportes"""
    model = ReviewReport
    extra = 0
    readonly_fields = ['reporter', 'reason', 'description', 'created_at']
    fields = ['reporter', 'reason', 'description', 'is_resolved', 'created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin para reseñas con funcionalidades avanzadas"""
    list_display = [
        'title_truncated', 'user', 'rating_stars', 'status_colored',
        'content_object_link', 'is_verified_purchase', 'helpful_count',
        'report_count', 'created_at'
    ]
    list_filter = [
        'status', 'rating', 'is_verified_purchase', 'is_reported',
        'created_at', 'content_type', 'moderated_at'
    ]
    search_fields = [
        'title', 'content', 'user__username', 'user__email',
        'user__first_name', 'user__last_name'
    ]
    readonly_fields = [
        'id', 'content_object_link', 'star_display', 'content_preview',
        'is_helpful_count', 'report_count', 'created_at', 'updated_at',
        'ip_address', 'user_agent'
    ]
    fieldsets = (
        ('Información básica', {
            'fields': (
                'id', 'user', 'title', 'content', 'rating', 'star_display'
            )
        }),
        ('Objeto relacionado', {
            'fields': ('content_type', 'object_id', 'content_object_link')
        }),
        ('Estado y moderación', {
            'fields': (
                'status', 'is_verified_purchase', 'moderated_at',
                'moderated_by', 'moderation_notes'
            )
        }),
        ('Estadísticas', {
            'fields': (
                'is_helpful_count', 'is_reported', 'report_count'
            ),
            'classes': ['collapse']
        }),
        ('Metadata', {
            'fields': (
                'ip_address', 'user_agent', 'created_at', 'updated_at'
            ),
            'classes': ['collapse']
        })
    )
    inlines = [ReviewMediaInline, ReviewHelpfulInline, ReviewReportInline]
    
    # Configuración de listado
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    # Acciones personalizadas
    actions = ['approve_reviews', 'reject_reviews', 'mark_as_moderated']
    
    def title_truncated(self, obj):
        """Título truncado para el listado"""
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_truncated.short_description = 'Título'
    
    def rating_stars(self, obj):
        """Mostrar calificación como estrellas"""
        return obj.star_display
    rating_stars.short_description = 'Calificación'
    
    def status_colored(self, obj):
        """Estado con colores"""
        colors = {
            'published': 'green',
            'approved': 'blue',
            'draft': 'orange',
            'moderated': 'purple',
            'rejected': 'red',
            'hidden': 'gray'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'Estado'
    
    def content_object_link(self, obj):
        """Link al objeto relacionado"""
        if obj.content_object:
            if hasattr(obj.content_object, 'get_absolute_url'):
                url = obj.content_object.get_absolute_url()
                return format_html(
                    '<a href="{}" target="_blank">{}</a>',
                    url,
                    str(obj.content_object)
                )
            else:
                return str(obj.content_object)
        return "Objeto eliminado"
    content_object_link.short_description = 'Objeto relacionado'
    
    def helpful_count(self, obj):
        """Contador de votos útiles"""
        return obj.is_helpful_count
    helpful_count.short_description = 'Votos útiles'
    
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'user', 'content_type', 'moderated_by'
        ).prefetch_related('media', 'helpful_votes', 'reports')
    
    def save_model(self, request, obj, form, change):
        """Personalizar guardado"""
        if change and 'status' in form.changed_data:
            if obj.status in ['approved', 'rejected'] and not obj.moderated_by:
                obj.moderated_by = request.user
                obj.moderated_at = timezone.now()
        super().save_model(request, obj, form, change)
    
    # Acciones personalizadas
    def approve_reviews(self, request, queryset):
        """Aprobar reseñas seleccionadas"""
        updated = queryset.update(
            status='approved',
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f'{updated} reseñas aprobadas.')
    approve_reviews.short_description = 'Aprobar reseñas seleccionadas'
    
    def reject_reviews(self, request, queryset):
        """Rechazar reseñas seleccionadas"""
        updated = queryset.update(
            status='rejected',
            moderated_by=request.user,
            moderated_at=timezone.now()
        )
        self.message_user(request, f'{updated} reseñas rechazadas.')
    reject_reviews.short_description = 'Rechazar reseñas seleccionadas'
    
    def mark_as_moderated(self, request, queryset):
        """Marcar como en moderación"""
        updated = queryset.update(status='moderated')
        self.message_user(request, f'{updated} reseñas marcadas para moderación.')
    mark_as_moderated.short_description = 'Marcar para moderación'


@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    """Admin para reportes de reseñas"""
    list_display = [
        'review_title', 'reason', 'reporter', 'created_at',
        'is_resolved', 'resolved_by'
    ]
    list_filter = [
        'reason', 'is_resolved', 'created_at', 'resolved_at'
    ]
    search_fields = [
        'review__title', 'reporter__username', 'description'
    ]
    readonly_fields = [
        'id', 'review', 'reporter', 'created_at'
    ]
    fieldsets = (
        ('Información del reporte', {
            'fields': ('id', 'review', 'reporter', 'reason', 'description', 'created_at')
        }),
        ('Resolución', {
            'fields': ('is_resolved', 'resolved_at', 'resolved_by', 'resolution_notes')
        })
    )
    
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    actions = ['mark_as_resolved']
    
    def review_title(self, obj):
        """Título de la reseña reportada"""
        return obj.review.title[:50] + '...' if len(obj.review.title) > 50 else obj.review.title
    review_title.short_description = 'Reseña'
    
    def save_model(self, request, obj, form, change):
        """Personalizar guardado de resolución"""
        if change and 'is_resolved' in form.changed_data and obj.is_resolved:
            if not obj.resolved_by:
                obj.resolved_by = request.user
                obj.resolved_at = timezone.now()
        super().save_model(request, obj, form, change)
    
    def mark_as_resolved(self, request, queryset):
        """Marcar reportes como resueltos"""
        updated = queryset.filter(is_resolved=False).update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{updated} reportes marcados como resueltos.')
    mark_as_resolved.short_description = 'Marcar como resueltos'


@admin.register(ReviewMedia)
class ReviewMediaAdmin(admin.ModelAdmin):
    """Admin para archivos multimedia"""
    list_display = ['review_title', 'media_type', 'caption', 'sort_order', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['review__title', 'caption']
    readonly_fields = ['id', 'created_at']
    
    def review_title(self, obj):
        """Título de la reseña"""
        return obj.review.title[:30] + '...' if len(obj.review.title) > 30 else obj.review.title
    review_title.short_description = 'Reseña'


@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    """Admin para votos útiles"""
    list_display = ['review_title', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['review__title', 'user__username']
    readonly_fields = ['id', 'created_at']
    
    def review_title(self, obj):
        """Título de la reseña"""
        return obj.review.title[:30] + '...' if len(obj.review.title) > 30 else obj.review.title
    review_title.short_description = 'Reseña'
