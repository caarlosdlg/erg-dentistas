from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Rol, PerfilUsuario, SesionUsuario, ConfiguracionSistema

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre',)
    readonly_fields = ('id',)

class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    verbose_name_plural = 'Perfil'

class UserAdmin(BaseUserAdmin):
    inlines = (PerfilUsuarioInline,)

# Re-register UserAdmin
# admin.site.unregister(User)
# admin.site.register(User, UserAdmin)

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'tipo_usuario', 'empleado_activo', 'fecha_ingreso')
    list_filter = ('tipo_usuario', 'empleado_activo', 'tema_preferido', 'idioma')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'telefono')
    readonly_fields = ('id', 'fecha_creacion', 'fecha_actualizacion', 'ultimo_acceso')
    
    fieldsets = (
        ('Usuario', {
            'fields': ('id', 'user')
        }),
        ('Información Personal', {
            'fields': ('telefono', 'fecha_nacimiento', 'direccion', 'foto')
        }),
        ('Información Laboral', {
            'fields': ('tipo_usuario', 'rol', 'fecha_ingreso', 'empleado_activo')
        }),
        ('Configuraciones', {
            'fields': ('tema_preferido', 'idioma', 'zona_horaria')
        }),
        ('Notificaciones', {
            'fields': ('notificaciones_email', 'notificaciones_sms', 'notificaciones_citas', 'notificaciones_pagos')
        }),
        ('Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion', 'ultimo_acceso')
        }),
    )

@admin.register(SesionUsuario)
class SesionUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'fecha_inicio', 'fecha_fin', 'ip_address', 'activa')
    list_filter = ('activa', 'fecha_inicio')
    search_fields = ('usuario__username', 'ip_address')
    readonly_fields = ('id', 'fecha_inicio')
    date_hierarchy = 'fecha_inicio'

@admin.register(ConfiguracionSistema)
class ConfiguracionSistemaAdmin(admin.ModelAdmin):
    list_display = ('clave', 'valor', 'tipo_valor', 'modificable')
    list_filter = ('tipo_valor', 'modificable')
    search_fields = ('clave', 'descripcion')
    readonly_fields = ('id', 'fecha_creacion', 'fecha_actualizacion')
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(self.readonly_fields)
        if obj and not obj.modificable:
            readonly_fields.extend(['clave', 'valor', 'tipo_valor'])
        return readonly_fields
