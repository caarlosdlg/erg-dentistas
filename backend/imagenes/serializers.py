from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo de imágenes.
    Incluye validación para tipos de archivos y tamaño máximo.
    """
    image_url = serializers.SerializerMethodField()
    
    # Thumbnail (150px)
    thumbnail_url = serializers.SerializerMethodField()
    thumbnail_webp_url = serializers.SerializerMethodField()
    thumbnail_avif_url = serializers.SerializerMethodField()
    
    # XS (320px)
    xs_url = serializers.SerializerMethodField()
    xs_webp_url = serializers.SerializerMethodField()
    xs_avif_url = serializers.SerializerMethodField()
    
    # Small (480px)
    small_url = serializers.SerializerMethodField()
    small_webp_url = serializers.SerializerMethodField()
    small_avif_url = serializers.SerializerMethodField()
    
    # Medium (768px)
    medium_url = serializers.SerializerMethodField()
    medium_webp_url = serializers.SerializerMethodField()
    medium_avif_url = serializers.SerializerMethodField()
    
    # Large (1024px)
    large_url = serializers.SerializerMethodField()
    large_webp_url = serializers.SerializerMethodField()
    large_avif_url = serializers.SerializerMethodField()
    
    # XL (1440px)
    xl_url = serializers.SerializerMethodField()
    xl_webp_url = serializers.SerializerMethodField()
    xl_avif_url = serializers.SerializerMethodField()
    
    # Metadatos adicionales
    dimensions = serializers.SerializerMethodField()
    srcset = serializers.SerializerMethodField()
    picture_tag = serializers.SerializerMethodField()
    
    class Meta:
        model = Image
        fields = ('id', 'image', 'image_url', 
                  # Thumbnail (150px)
                  'thumbnail_url', 'thumbnail_webp_url', 'thumbnail_avif_url',
                  # XS (320px)
                  'xs_url', 'xs_webp_url', 'xs_avif_url',
                  # Small (480px)
                  'small_url', 'small_webp_url', 'small_avif_url',
                  # Medium (768px)
                  'medium_url', 'medium_webp_url', 'medium_avif_url',
                  # Large (1024px)
                  'large_url', 'large_webp_url', 'large_avif_url',
                  # XL (1440px)
                  'xl_url', 'xl_webp_url', 'xl_avif_url',
                  # Metadatos y campos adicionales
                  'content_type', 'object_id', 
                  'title', 'description', 'uploaded_at', 
                  'is_active', 'is_featured', 'order',
                  'dimensions', 'file_size', 'optimized',
                  'srcset', 'picture_tag')
                  
        read_only_fields = ('id', 'uploaded_at', 'image_url', 
                           # Thumbnail
                           'thumbnail_url', 'thumbnail_webp_url', 'thumbnail_avif_url',
                           # XS
                           'xs_url', 'xs_webp_url', 'xs_avif_url',
                           # Small
                           'small_url', 'small_webp_url', 'small_avif_url',
                           # Medium
                           'medium_url', 'medium_webp_url', 'medium_avif_url',
                           # Large
                           'large_url', 'large_webp_url', 'large_avif_url',
                           # XL
                           'xl_url', 'xl_webp_url', 'xl_avif_url',
                           # Metadatos
                           'dimensions', 'file_size', 'optimized',
                           'srcset', 'picture_tag')
    
    def get_absolute_url(self, url):
        """Convierte URL relativa a absoluta"""
        request = self.context.get('request')
        if url and request:
            return request.build_absolute_uri(url)
        return url
    
    def get_image_url(self, obj):
        """Retorna la URL completa de la imagen original"""
        return self.get_absolute_url(obj.image.url) if obj.image else None
    
    def get_thumbnail_url(self, obj):
        """Retorna la URL completa del thumbnail"""
        return self.get_absolute_url(obj.thumbnail_url) if obj.thumbnail_url else None
    
    def get_thumbnail_webp_url(self, obj):
        """Retorna la URL completa del thumbnail WebP"""
        return self.get_absolute_url(obj.thumbnail_webp_url) if obj.thumbnail_webp_url else None
    
    def get_thumbnail_avif_url(self, obj):
        """Retorna la URL completa del thumbnail en formato AVIF"""
        return self.get_absolute_url(obj.thumbnail_avif_url) if obj.thumbnail_avif_url else None
    
    def get_xs_url(self, obj):
        """Retorna la URL completa de la versión XS"""
        return self.get_absolute_url(obj.xs_url) if obj.xs_url else None
    
    def get_xs_webp_url(self, obj):
        """Retorna la URL completa de la versión XS en WebP"""
        return self.get_absolute_url(obj.xs_webp_url) if obj.xs_webp_url else None
    
    def get_xs_avif_url(self, obj):
        """Retorna la URL completa de la versión XS en AVIF"""
        return self.get_absolute_url(obj.xs_avif_url) if obj.xs_avif_url else None
    
    def get_small_url(self, obj):
        """Retorna la URL completa de la versión Small"""
        return self.get_absolute_url(obj.small_url) if obj.small_url else None
    
    def get_small_webp_url(self, obj):
        """Retorna la URL completa de la versión Small en WebP"""
        return self.get_absolute_url(obj.small_webp_url) if obj.small_webp_url else None
    
    def get_small_avif_url(self, obj):
        """Retorna la URL completa de la versión Small en AVIF"""
        return self.get_absolute_url(obj.small_avif_url) if obj.small_avif_url else None
    
    def get_medium_url(self, obj):
        """Retorna la URL completa de la versión mediana"""
        return self.get_absolute_url(obj.medium_url) if obj.medium_url else None
    
    def get_medium_webp_url(self, obj):
        """Retorna la URL completa de la versión mediana WebP"""
        return self.get_absolute_url(obj.medium_webp_url) if obj.medium_webp_url else None
    
    def get_medium_avif_url(self, obj):
        """Retorna la URL completa de la versión Medium en AVIF"""
        return self.get_absolute_url(obj.medium_avif_url) if obj.medium_avif_url else None
    
    def get_large_url(self, obj):
        """Retorna la URL completa de la versión grande"""
        return self.get_absolute_url(obj.large_url) if obj.large_url else None
    
    def get_large_webp_url(self, obj):
        """Retorna la URL completa de la versión grande WebP"""
        return self.get_absolute_url(obj.large_webp_url) if obj.large_webp_url else None
    
    def get_large_avif_url(self, obj):
        """Retorna la URL completa de la versión Large en AVIF"""
        return self.get_absolute_url(obj.large_avif_url) if obj.large_avif_url else None
    
    def get_xl_url(self, obj):
        """Retorna la URL completa de la versión XL"""
        return self.get_absolute_url(obj.xl_url) if obj.xl_url else None
    
    def get_xl_webp_url(self, obj):
        """Retorna la URL completa de la versión XL en WebP"""
        return self.get_absolute_url(obj.xl_webp_url) if obj.xl_webp_url else None
    
    def get_xl_avif_url(self, obj):
        """Retorna la URL completa de la versión XL en AVIF"""
        return self.get_absolute_url(obj.xl_avif_url) if obj.xl_avif_url else None
    
    def get_dimensions(self, obj):
        """Retorna las dimensiones de la imagen"""
        if obj.width and obj.height:
            return {
                'width': obj.width,
                'height': obj.height,
                'aspect_ratio': round(obj.width / obj.height, 3) if obj.height > 0 else None
            }
        return None
    
    def validate_image(self, value):
        """
        Valida que la imagen tenga un tipo de archivo permitido y un tamaño adecuado
        """
        # Validar tipo de archivo
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        ext = value.name.split('.')[-1].lower()
        
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Formato de archivo no permitido. Los formatos permitidos son: {', '.join(allowed_extensions)}"
            )
        
        # Validar tamaño de archivo (máximo 5MB)
        max_size = 5 * 1024 * 1024  # 5 MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"El archivo es demasiado grande. El tamaño máximo permitido es {max_size / (1024 * 1024)}MB"
            )
        
        return value


class ImageUploadSerializer(serializers.Serializer):
    """
    Serializer simplificado para la subida de imágenes.
    """
    image = serializers.ImageField()
    content_type = serializers.ChoiceField(choices=Image.CONTENT_TYPE_CHOICES)
    object_id = serializers.CharField(max_length=255)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    is_featured = serializers.BooleanField(default=False)
