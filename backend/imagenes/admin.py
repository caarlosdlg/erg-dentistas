from django.contrib import admin
from .models import Image


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_type', 'title', 'uploaded_at', 'is_active', 'is_featured')
    list_filter = ('content_type', 'is_active', 'is_featured', 'uploaded_at')
    search_fields = ('title', 'description', 'object_id')
    readonly_fields = ('uploaded_at', 'updated_at', 'filename', 'filesize')
    fieldsets = (
        ('Imagen', {
            'fields': ('image', 'title', 'description')
        }),
        ('Relación', {
            'fields': ('content_type', 'object_id')
        }),
        ('Opciones', {
            'fields': ('is_active', 'is_featured', 'order')
        }),
        ('Información', {
            'fields': ('uploaded_at', 'updated_at', 'filename', 'filesize'),
            'classes': ('collapse',),
        })
    )
