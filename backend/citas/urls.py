from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'citas', views.CitaViewSet)

app_name = 'citas'

urlpatterns = [
    path('api/', include(router.urls)),
]
