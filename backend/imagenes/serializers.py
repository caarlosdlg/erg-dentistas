from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo de imágenes.
    Incluye validación para tipos de archivos y tamaño máximo.
    """
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Image
        fields = ('id', 'image', 'image_url', 'content_type', 'object_id', 
                  'title', 'description', 'uploaded_at', 'is_active',
                  'is_featured', 'order')
        read_only_fields = ('id', 'uploaded_at', 'image_url')
    
    def get_image_url(self, obj):
        """Retorna la URL completa de la imagen"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
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
