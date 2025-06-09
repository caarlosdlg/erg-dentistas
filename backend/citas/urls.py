from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CitaViewSet

# Crear router para ViewSets
router = DefaultRouter()
router.register(r'citas', CitaViewSet, basename='cita')

urlpatterns = [
    path('api/', include(router.urls)),
]