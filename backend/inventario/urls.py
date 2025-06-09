from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'inventario', views.ArticuloInventarioViewSet)
router.register(r'categorias-inventario', views.CategoriaInventarioViewSet)
router.register(r'proveedores', views.ProveedorViewSet)
router.register(r'movimientos-inventario', views.MovimientoInventarioViewSet)
router.register(r'alertas-inventario', views.AlertaInventarioViewSet)

app_name = 'inventario'

urlpatterns = [
    path('api/', include(router.urls)),
]
