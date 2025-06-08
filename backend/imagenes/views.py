from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import render
from django.views.generic import ListView, DetailView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.conf import settings
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
            
            # La generación de versiones optimizadas ocurre automáticamente por la señal post_save
            
            # Devuelve la imagen creada usando el serializer completo
            return Response(
                ImageSerializer(image, context=self.get_serializer_context()).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='optimize')
    def optimize(self, request, pk=None):
        """
        Regenera las versiones optimizadas de una imagen específica.
        Útil si se necesita actualizar thumbnails o cambiar formatos.
        """
        image = self.get_object()
        
        # Forzar la regeneración de todas las versiones
        result = image.generate_optimized_versions(force=True)
        
        if result:
            return Response({
                'status': 'success',
                'message': 'Las versiones optimizadas han sido regeneradas',
                'image': ImageSerializer(image, context=self.get_serializer_context()).data
            })
        else:
            return Response({
                'status': 'error',
                'message': 'No se pudieron generar las versiones optimizadas'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=False, methods=['post'], url_path='batch-optimize')
    def batch_optimize(self, request):
        """
        Regenera las versiones optimizadas de todas las imágenes o un conjunto filtrado.
        """
        # Aplicar filtros si se proporcionan
        content_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        
        queryset = self.get_queryset()
        
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        if object_id:
            queryset = queryset.filter(object_id=object_id)
        
        # Procesar las imágenes
        processed = 0
        errors = 0
        
        for image in queryset:
            try:
                if image.generate_optimized_versions(force=True):
                    processed += 1
            except Exception:
                errors += 1
        
        return Response({
            'status': 'completed',
            'processed': processed,
            'errors': errors,
            'total': processed + errors
        })


class ImageGalleryView(ListView):
    """
    Vista para mostrar una galería de imágenes optimizadas.
    Utiliza caché para mejorar el rendimiento.
    """
    model = Image
    template_name = 'imagenes/gallery.html'
    context_object_name = 'imagenes'
    paginate_by = 12
    
    @method_decorator(cache_page(60 * 15))  # Caché de 15 minutos
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get_queryset(self):
        """Filtrar solo imágenes activas y optimizadas"""
        return Image.objects.filter(is_active=True, optimized=True).order_by('-is_featured', 'order', '-uploaded_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Añadir una única imagen para la demostración individual
        if context['imagenes']:
            context['imagen'] = context['imagenes'][0]
        context['use_cdn'] = getattr(settings, 'USE_CDN', False)
        context['cdn_domain'] = getattr(settings, 'CDN_DOMAIN', '')
        return context


def gallery_demo(request):
    """
    Vista simple para demostrar la galería de imágenes.
    """
    # Obtener imágenes optimizadas
    imagenes = Image.objects.filter(is_active=True, optimized=True).order_by('-is_featured', 'order')[:20]
    
    # Pasar una imagen individual para demostración
    imagen = None
    if imagenes:
        imagen = imagenes[0]
        
    context = {
        'imagenes': imagenes,
        'imagen': imagen,
        'use_cdn': getattr(settings, 'USE_CDN', False),
        'cdn_domain': getattr(settings, 'CDN_DOMAIN', ''),
    }
    
    return render(request, 'imagenes/gallery.html', context)
