from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import models
from .models import Category
from .serializers import CategoryTreeSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def category_tree_public(request):
    """
    Endpoint público para obtener el árbol de categorías
    """
    categories = Category.objects.filter(parent=None, is_active=True).order_by('sort_order', 'name')
    serializer = CategoryTreeSerializer(categories, many=True, context={'request': request})
    return Response({
        'count': len(serializer.data),
        'results': serializer.data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def category_stats_public(request):
    """
    Endpoint público para estadísticas básicas de categorías
    """
    stats = {
        'total_categories': Category.objects.count(),
        'active_categories': Category.objects.filter(is_active=True).count(),
        'root_categories': Category.objects.filter(parent=None).count(),
        'max_depth': Category.objects.aggregate(max_level=models.Max('level')).get('max_level', 0) or 0,
    }
    return Response(stats)
