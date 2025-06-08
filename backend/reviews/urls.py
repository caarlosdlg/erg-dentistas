from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from . import views

# Router principal
router = DefaultRouter()
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'reports', views.ReviewReportViewSet, basename='reviewreport')

# Router anidado para multimedia de reseñas
reviews_router = routers.NestedDefaultRouter(router, r'reviews', lookup='review')
reviews_router.register(r'media', views.ReviewMediaViewSet, basename='review-media')

app_name = 'reviews'

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(reviews_router.urls)),
]
