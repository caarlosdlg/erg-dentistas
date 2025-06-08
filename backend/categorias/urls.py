from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views

# Crear router para las APIs
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')

app_name = 'categorias'

urlpatterns = [
    # API REST endpoints
    path('api/', include(router.urls)),
    
    # Endpoints públicos
    path('api/categories/public/tree/', api_views.category_tree_public, name='category-tree-public'),
    path('api/categories/public/stats/', api_views.category_stats_public, name='category-stats-public'),
]
