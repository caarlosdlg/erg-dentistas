from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    Administrador personalizado para el modelo de usuario
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'email_verified', 'is_active', 'date_joined')
    list_filter = ('is_active', 'email_verified', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'google_id')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información de Google', {
            'fields': ('google_id', 'picture', 'email_verified')
        }),
    )
    
    readonly_fields = ('google_id', 'date_joined', 'last_login')
