from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    permisos = models.TextField(help_text="Lista de permisos separados por comas")
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Rol"
        verbose_name_plural = "Roles"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class PerfilUsuario(models.Model):
    TIPOS_USUARIO = [
        ('administrador', 'Administrador'),
        ('dentista', 'Dentista'),
        ('recepcionista', 'Recepcionista'),
        ('asistente', 'Asistente Dental'),
        ('contador', 'Contador'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Información adicional
    telefono = models.CharField(max_length=15, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.TextField(blank=True)
    foto = models.ImageField(upload_to='usuarios/fotos/', blank=True, null=True)
    
    # Información laboral
    tipo_usuario = models.CharField(max_length=20, choices=TIPOS_USUARIO, default='recepcionista')
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_ingreso = models.DateField(null=True, blank=True)
    empleado_activo = models.BooleanField(default=True)
    
    # Configuraciones de la aplicación
    tema_preferido = models.CharField(
        max_length=10,
        choices=[('claro', 'Claro'), ('oscuro', 'Oscuro'), ('auto', 'Automático')],
        default='claro'
    )
    idioma = models.CharField(
        max_length=5,
        choices=[('es', 'Español'), ('en', 'English')],
        default='es'
    )
    zona_horaria = models.CharField(max_length=50, default='America/Mexico_City')
    
    # Notificaciones
    notificaciones_email = models.BooleanField(default=True)
    notificaciones_sms = models.BooleanField(default=False)
    notificaciones_citas = models.BooleanField(default=True)
    notificaciones_pagos = models.BooleanField(default=True)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"
        ordering = ['user__last_name', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_tipo_usuario_display()})"
    
    @property
    def nombre_completo(self):
        return self.user.get_full_name() or self.user.username
    
    @property
    def es_dentista(self):
        return self.tipo_usuario == 'dentista'
    
    @property
    def es_administrador(self):
        return self.tipo_usuario == 'administrador'
    
    @property
    def puede_gestionar_citas(self):
        return self.tipo_usuario in ['administrador', 'recepcionista', 'dentista']
    
    @property
    def puede_gestionar_pacientes(self):
        return self.tipo_usuario in ['administrador', 'recepcionista', 'dentista', 'asistente']
    
    @property
    def puede_gestionar_facturacion(self):
        return self.tipo_usuario in ['administrador', 'contador', 'recepcionista']

@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    """Crear perfil de usuario automáticamente cuando se crea un nuevo usuario"""
    if created:
        PerfilUsuario.objects.create(user=instance)

@receiver(post_save, sender=User)
def guardar_perfil_usuario(sender, instance, **kwargs):
    """Guardar perfil de usuario cuando se guarda el usuario"""
    if hasattr(instance, 'perfil'):
        instance.perfil.save()

class SesionUsuario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sesiones')
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    activa = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Sesión de Usuario"
        verbose_name_plural = "Sesiones de Usuario"
        ordering = ['-fecha_inicio']
    
    def __str__(self):
        return f"Sesión de {self.usuario.username} - {self.fecha_inicio}"

class ConfiguracionSistema(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    clave = models.CharField(max_length=100, unique=True)
    valor = models.TextField()
    descripcion = models.TextField(blank=True)
    tipo_valor = models.CharField(
        max_length=20,
        choices=[
            ('string', 'Texto'),
            ('integer', 'Número Entero'),
            ('decimal', 'Número Decimal'),
            ('boolean', 'Verdadero/Falso'),
            ('json', 'JSON'),
        ],
        default='string'
    )
    modificable = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Configuración del Sistema"
        verbose_name_plural = "Configuraciones del Sistema"
        ordering = ['clave']
    
    def __str__(self):
        return f"{self.clave}: {self.valor}"
