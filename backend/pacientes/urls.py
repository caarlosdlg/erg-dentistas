from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'expedientes-medicos', views.ExpedienteMedicoViewSet)
router.register(r'bitacora-citas', views.BitacoraCitaViewSet)
router.register(r'imagenes-medicas', views.ImagenMedicaViewSet)

app_name = 'pacientes'

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/stats/', views.PacienteStatsView.as_view(), name='stats'),
    path('api/search/', views.PacienteSearchView.as_view(), name='search'),
]
