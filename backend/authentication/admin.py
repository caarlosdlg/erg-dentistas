from django.contrib import admin
from django.contrib.auth.models import User
from .models import GoogleProfile

@admin.register(GoogleProfile)
class GoogleProfileAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo GoogleProfile
    """
    
    # Campos que se muestran en la lista
    list_display = [
        'user_email', 
        'user_name', 
        'google_id', 
        'email_verified',
        'created_at'
    ]
    
    # Campos por los que se puede filtrar
    list_filter = [
        'email_verified',
        'created_at'
    ]
    
    # Campos por los que se puede buscar
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'google_id']
    
    # Campos de solo lectura
    readonly_fields = ['google_id', 'created_at', 'updated_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    user_name.short_description = 'Nombre'
