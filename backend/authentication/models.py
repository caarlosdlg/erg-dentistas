from django.contrib.auth.models import User
from django.db import models

class GoogleProfile(models.Model):
    """
    Modelo para almacenar información específica de Google OAuth
    que extiende el modelo User existente
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_profile')
    google_id = models.CharField(max_length=255, unique=True)
    picture = models.URLField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    
    # Metadatos adicionales
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Perfil de Google'
        verbose_name_plural = 'Perfiles de Google'
    
    def __str__(self):
        return f"Google Profile for {self.user.username}"
