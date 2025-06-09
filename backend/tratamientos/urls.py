from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tratamientos', views.TratamientoViewSet)
router.register(r'categorias-tratamientos', views.CategoriaTratamientoViewSet)

app_name = 'tratamientos'

urlpatterns = [
    path('api/', include(router.urls)),
]
