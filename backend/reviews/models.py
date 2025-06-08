from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
import uuid


class Review(models.Model):
    """
    Modelo para reseñas/comentarios sobre productos, servicios o cualquier entidad del sistema.
    Usa Generic Foreign Keys para permitir reseñas en múltiples tipos de contenido.
    """
    
    RATING_CHOICES = [
        (1, '1 - Muy malo'),
        (2, '2 - Malo'),
        (3, '3 - Regular'),
        (4, '4 - Bueno'),
        (5, '5 - Excelente'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('moderated', 'En moderación'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('hidden', 'Oculto'),
    ]
    
    # Campos principales
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relación con usuario
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Usuario"
    )
    
    # Generic Foreign Key para permitir reseñas en múltiples modelos
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name="Tipo de contenido"
    )
    object_id = models.CharField(max_length=255, verbose_name="ID del objeto")
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Contenido de la reseña
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(5)],
        verbose_name="Título",
        help_text="Título descriptivo de la reseña (mínimo 5 caracteres)"
    )
    
    content = models.TextField(
        validators=[
            MinLengthValidator(10, "El contenido debe tener al menos 10 caracteres"),
            MaxLengthValidator(2000, "El contenido no puede exceder 2000 caracteres")
        ],
        verbose_name="Contenido",
        help_text="Contenido de la reseña (10-2000 caracteres)"
    )
    
    # Calificación
    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Calificación",
        help_text="Calificación de 1 a 5 estrellas"
    )
    
    # Estado y moderación
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='published',
        verbose_name="Estado"
    )
    
    is_verified_purchase = models.BooleanField(
        default=False,
        verbose_name="Compra verificada",
        help_text="Indica si el usuario realmente adquirió el producto/servicio"
    )
    
    # Campos de utilidad
    is_helpful_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Votos útiles"
    )
    
    is_reported = models.BooleanField(
        default=False,
        verbose_name="Reportado",
        help_text="Indica si la reseña ha sido reportada por otros usuarios"
    )
    
    report_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Número de reportes"
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="Dirección IP"
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de actualización"
    )
    
    # Campos de moderación
    moderated_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de moderación"
    )
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reviews',
        verbose_name="Moderado por"
    )
    moderation_notes = models.TextField(
        blank=True,
        verbose_name="Notas de moderación"
    )
    
    class Meta:
        verbose_name = "Reseña"
        verbose_name_plural = "Reseñas"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['user']),
            models.Index(fields=['rating']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_verified_purchase']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'content_type', 'object_id'],
                name='unique_user_review_per_object'
            )
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username} - {self.rating}★"
    
    def save(self, *args, **kwargs):
        """Actualizar timestamp de moderación cuando cambia el estado"""
        if self.pk:
            try:
                old_review = Review.objects.get(pk=self.pk)
                if old_review.status != self.status and self.status in ['approved', 'rejected']:
                    self.moderated_at = timezone.now()
            except Review.DoesNotExist:
                pass
        super().save(*args, **kwargs)
    
    @property
    def star_display(self):
        """Mostrar calificación como estrellas"""
        return "★" * self.rating + "☆" * (5 - self.rating)
    
    @property
    def is_editable(self):
        """Verificar si la reseña puede ser editada"""
        # Solo editable por el usuario en las primeras 24 horas
        time_limit = timezone.now() - timezone.timedelta(hours=24)
        return self.created_at > time_limit and self.status in ['draft', 'published']
    
    @property
    def content_preview(self):
        """Vista previa del contenido"""
        if len(self.content) <= 100:
            return self.content
        return self.content[:97] + "..."
    
    def can_edit(self, user):
        """Verificar si un usuario puede editar esta reseña"""
        return (
            user == self.user and 
            self.is_editable and 
            self.status in ['draft', 'published']
        )
    
    def can_delete(self, user):
        """Verificar si un usuario puede eliminar esta reseña"""
        return user == self.user or user.is_staff
    
    def mark_helpful(self):
        """Marcar reseña como útil"""
        self.is_helpful_count += 1
        self.save(update_fields=['is_helpful_count'])
    
    def report(self, reason=""):
        """Reportar reseña"""
        self.report_count += 1
        self.is_reported = True
        if self.report_count >= 3:  # Auto-moderación tras 3 reportes
            self.status = 'moderated'
        self.save(update_fields=['report_count', 'is_reported', 'status'])


class ReviewHelpful(models.Model):
    """
    Modelo para rastrear qué usuarios han marcado reseñas como útiles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='helpful_reviews'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Voto útil"
        verbose_name_plural = "Votos útiles"
        unique_together = ['review', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.review.title}"


class ReviewReport(models.Model):
    """
    Modelo para reportes de reseñas
    """
    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('inappropriate', 'Contenido inapropiado'),
        ('fake', 'Reseña falsa'),
        ('offensive', 'Lenguaje ofensivo'),
        ('irrelevant', 'No relevante'),
        ('other', 'Otro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='review_reports'
    )
    reason = models.CharField(
        max_length=20,
        choices=REPORT_REASONS,
        verbose_name="Razón del reporte"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descripción adicional"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Estado del reporte
    is_resolved = models.BooleanField(
        default=False,
        verbose_name="Resuelto"
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de resolución"
    )
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports',
        verbose_name="Resuelto por"
    )
    resolution_notes = models.TextField(
        blank=True,
        verbose_name="Notas de resolución"
    )
    
    class Meta:
        verbose_name = "Reporte de reseña"
        verbose_name_plural = "Reportes de reseñas"
        ordering = ['-created_at']
        unique_together = ['review', 'reporter']
    
    def __str__(self):
        return f"Reporte: {self.review.title} - {self.get_reason_display()}"
    
    def resolve(self, user, notes=""):
        """Marcar reporte como resuelto"""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.resolution_notes = notes
        self.save()


class ReviewMedia(models.Model):
    """
    Modelo para imágenes/archivos adjuntos en reseñas
    """
    MEDIA_TYPES = [
        ('image', 'Imagen'),
        ('video', 'Video'),
        ('document', 'Documento'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='media'
    )
    file = models.FileField(
        upload_to='reviews/media/%Y/%m/',
        verbose_name="Archivo"
    )
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPES,
        verbose_name="Tipo de archivo"
    )
    caption = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Descripción"
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Archivo de reseña"
        verbose_name_plural = "Archivos de reseñas"
        ordering = ['sort_order', 'created_at']
    
    def __str__(self):
        return f"{self.review.title} - {self.get_media_type_display()}"
