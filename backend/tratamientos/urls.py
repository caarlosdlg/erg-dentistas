from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TratamientoViewSet, CategoriaTratamientoViewSet

router = DefaultRouter()
router.register(r'tratamientos', TratamientoViewSet, basename='tratamiento')
router.register(r'categorias-tratamiento', CategoriaTratamientoViewSet, basename='categoria-tratamiento')

urlpatterns = [
    path('', include(router.urls)),
]
