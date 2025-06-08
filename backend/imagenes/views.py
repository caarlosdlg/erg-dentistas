from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Image
from .serializers import ImageSerializer, ImageUploadSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """
    API para gestionar imágenes en el sistema.
    Permite cargar, listar, actualizar y borrar imágenes.
    También ofrece endpoints para filtrar imágenes por tipo o por objeto relacionado.
    """
    queryset = Image.objects.all().order_by('content_type', 'order', '-uploaded_at')
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def get_permissions(self):
        """Define permisos específicos según la acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Filtra las imágenes según parámetros de la URL.
        Permite filtrar por content_type y object_id.
        """
        queryset = super().get_queryset()
        
        content_type = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        is_active = self.request.query_params.get('is_active')
        is_featured = self.request.query_params.get('is_featured')
        
        if content_type:
            queryset = queryset.filter(content_type=content_type)
            
        if object_id:
            queryset = queryset.filter(object_id=object_id)
            
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
            
        if is_featured is not None:
            is_featured_bool = is_featured.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured_bool)
            
        return queryset
    
    def get_serializer_class(self):
        """
        Utiliza un serializer específico para la subida de imágenes
        """
        if self.action == 'upload_image':
            return ImageUploadSerializer
        return super().get_serializer_class()
    
    def get_serializer_context(self):
        """
        Incluye el request en el contexto del serializer para generar URLs absolutas
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_image(self, request):
        """
        Endpoint dedicado para subir imágenes.
        Simplifica el proceso de subida separándolo del CRUD estándar.
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            image_data = serializer.validated_data
            
            # Crea la imagen
            image = Image.objects.create(
                image=image_data['image'],
                content_type=image_data['content_type'],
                object_id=image_data['object_id'],
                title=image_data.get('title', ''),
                description=image_data.get('description', ''),
                is_featured=image_data.get('is_featured', False)
            )
            
            # Devuelve la imagen creada usando el serializer completo
            return Response(
                ImageSerializer(image, context=self.get_serializer_context()).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
