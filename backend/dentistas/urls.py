from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DentistaViewSet, EspecialidadViewSet

# Crear router para ViewSets
router = DefaultRouter()
router.register(r'dentistas', DentistaViewSet, basename='dentista')
router.register(r'especialidades', EspecialidadViewSet, basename='especialidad')

urlpatterns = [
    path('', include(router.urls)),
]
