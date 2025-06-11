from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Usuario personalizado que extiende el modelo de usuario de Django
    para incluir campos específicos de autenticación con Google
    """
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    picture = models.URLField(max_length=500, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email or self.username

    class Meta:
        db_table = 'auth_user_custom'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
