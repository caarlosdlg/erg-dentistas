from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views, search_views

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
    
    # Endpoints de búsqueda
    path('api/search/categories/', search_views.search_categories, name='search-categories'),
    path('api/search/tratamientos/', search_views.search_tratamientos, name='search-tratamientos'),
    path('api/search/global/', search_views.search_global, name='search-global'),
    
    # Interfaz web de búsqueda
    path('search/', views.search_interface, name='search-interface'),
]
