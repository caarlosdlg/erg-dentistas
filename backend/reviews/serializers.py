from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from .models import Review, ReviewHelpful, ReviewReport, ReviewMedia


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para usuario en reseñas"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id', 'username', 'first_name', 'last_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class ReviewMediaSerializer(serializers.ModelSerializer):
    """Serializer para archivos multimedia de reseñas"""
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ReviewMedia
        fields = [
            'id', 'file', 'file_url', 'file_size', 'media_type', 
            'caption', 'sort_order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'file_url', 'file_size']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            try:
                return obj.file.size
            except:
                return None
        return None


class ReviewReportSerializer(serializers.ModelSerializer):
    """Serializer para reportes de reseñas"""
    reporter = UserBasicSerializer(read_only=True)
    resolved_by = UserBasicSerializer(read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    
    class Meta:
        model = ReviewReport
        fields = [
            'id', 'reason', 'reason_display', 'description', 
            'reporter', 'created_at', 'is_resolved', 'resolved_at',
            'resolved_by', 'resolution_notes'
        ]
        read_only_fields = [
            'id', 'reporter', 'created_at', 'is_resolved', 
            'resolved_at', 'resolved_by', 'resolution_notes'
        ]
    
    def create(self, validated_data):
        # El reporter se establece automáticamente desde el request
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    """Serializer para votos útiles"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ReviewListSerializer(serializers.ModelSerializer):
    """Serializer para listado de reseñas (vista compacta)"""
    user = UserBasicSerializer(read_only=True)
    star_display = serializers.CharField(read_only=True)
    content_preview = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    content_object_name = serializers.SerializerMethodField()
    helpful_count = serializers.IntegerField(source='is_helpful_count', read_only=True)
    media_count = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'title', 'content_preview', 'rating', 'star_display',
            'status', 'status_display', 'user', 'is_verified_purchase',
            'helpful_count', 'report_count', 'created_at', 'updated_at',
            'content_object_name', 'media_count', 'can_edit', 'can_delete'
        ]
    
    def get_content_object_name(self, obj):
        """Obtener nombre del objeto relacionado"""
        if obj.content_object:
            if hasattr(obj.content_object, 'name'):
                return obj.content_object.name
            elif hasattr(obj.content_object, 'title'):
                return obj.content_object.title
            else:
                return str(obj.content_object)
        return "Objeto eliminado"
    
    def get_media_count(self, obj):
        """Contar archivos multimedia"""
        return obj.media.count()
    
    def get_can_edit(self, obj):
        """Verificar si el usuario actual puede editar"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_edit(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Verificar si el usuario actual puede eliminar"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_delete(request.user)
        return False


class ReviewDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para reseñas"""
    user = UserBasicSerializer(read_only=True)
    moderated_by = UserBasicSerializer(read_only=True)
    star_display = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    content_object_name = serializers.SerializerMethodField()
    media = ReviewMediaSerializer(many=True, read_only=True)
    helpful_votes = ReviewHelpfulSerializer(many=True, read_only=True)
    reports = ReviewReportSerializer(many=True, read_only=True)
    is_editable = serializers.BooleanField(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    user_has_voted_helpful = serializers.SerializerMethodField()
    user_has_reported = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'title', 'content', 'rating', 'star_display',
            'status', 'status_display', 'user', 'content_type', 'object_id',
            'content_object_name', 'is_verified_purchase', 'is_helpful_count',
            'is_reported', 'report_count', 'ip_address', 'user_agent',
            'created_at', 'updated_at', 'moderated_at', 'moderated_by',
            'moderation_notes', 'is_editable', 'media', 'helpful_votes',
            'reports', 'can_edit', 'can_delete', 'user_has_voted_helpful',
            'user_has_reported'
        ]
        read_only_fields = [
            'id', 'user', 'is_helpful_count', 'is_reported', 'report_count',
            'ip_address', 'user_agent', 'created_at', 'updated_at',
            'moderated_at', 'moderated_by', 'moderation_notes'
        ]
    
    def get_content_object_name(self, obj):
        """Obtener nombre del objeto relacionado"""
        if obj.content_object:
            if hasattr(obj.content_object, 'name'):
                return obj.content_object.name
            elif hasattr(obj.content_object, 'title'):
                return obj.content_object.title
            else:
                return str(obj.content_object)
        return "Objeto eliminado"
    
    def get_can_edit(self, obj):
        """Verificar si el usuario actual puede editar"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_edit(request.user)
        return False
    
    def get_can_delete(self, obj):
        """Verificar si el usuario actual puede eliminar"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.can_delete(request.user)
        return False
    
    def get_user_has_voted_helpful(self, obj):
        """Verificar si el usuario actual ya votó como útil"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False
    
    def get_user_has_reported(self, obj):
        """Verificar si el usuario actual ya reportó esta reseña"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reports.filter(reporter=request.user).exists()
        return False


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear y actualizar reseñas"""
    content_type_id = serializers.IntegerField(write_only=True)
    object_id = serializers.CharField(write_only=True)
    media_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Review
        fields = [
            'id', 'title', 'content', 'rating', 'status',
            'content_type_id', 'object_id', 'media_files'
        ]
        read_only_fields = ['id']
    
    def validate_content_type_id(self, value):
        """Validar que el content_type existe"""
        try:
            ContentType.objects.get(id=value)
        except ContentType.DoesNotExist:
            raise serializers.ValidationError("Tipo de contenido no válido")
        return value
    
    def validate_object_id(self, value):
        """Validar formato del object_id"""
        if not value:
            raise serializers.ValidationError("ID del objeto es requerido")
        return value
    
    def validate(self, attrs):
        """Validaciones cruzadas"""
        # Verificar que el objeto existe
        content_type_id = attrs.get('content_type_id')
        object_id = attrs.get('object_id')
        
        if content_type_id and object_id:
            try:
                content_type = ContentType.objects.get(id=content_type_id)
                model_class = content_type.model_class()
                if not model_class.objects.filter(pk=object_id).exists():
                    raise serializers.ValidationError(
                        f"No existe un {content_type.model} con ID {object_id}"
                    )
            except ContentType.DoesNotExist:
                raise serializers.ValidationError("Tipo de contenido no válido")
        
        return attrs
    
    def create(self, validated_data):
        """Crear nueva reseña con archivos multimedia"""
        media_files = validated_data.pop('media_files', [])
        content_type_id = validated_data.pop('content_type_id')
        
        # Establecer content_type y usuario
        validated_data['content_type_id'] = content_type_id
        validated_data['user'] = self.context['request'].user
        
        # Capturar IP y User-Agent del request
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        review = super().create(validated_data)
        
        # Crear archivos multimedia si se proporcionaron
        for i, media_file in enumerate(media_files):
            ReviewMedia.objects.create(
                review=review,
                file=media_file,
                media_type=self.get_media_type(media_file),
                sort_order=i
            )
        
        return review
    
    def update(self, instance, validated_data):
        """Actualizar reseña"""
        # No permitir cambio de content_type u object_id en updates
        validated_data.pop('content_type_id', None)
        validated_data.pop('object_id', None)
        validated_data.pop('media_files', None)  # Los archivos se manejan por separado
        
        # Verificar permisos de edición
        request = self.context.get('request')
        if not instance.can_edit(request.user):
            raise serializers.ValidationError("No tienes permisos para editar esta reseña")
        
        return super().update(instance, validated_data)
    
    def get_client_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_media_type(self, file):
        """Determinar tipo de archivo multimedia"""
        if hasattr(file, 'content_type'):
            content_type = file.content_type.lower()
            if content_type.startswith('image/'):
                return 'image'
            elif content_type.startswith('video/'):
                return 'video'
        return 'document'


class ReviewStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de reseñas"""
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_distribution = serializers.DictField()
    verified_purchases = serializers.IntegerField()
    recent_reviews = serializers.IntegerField()
