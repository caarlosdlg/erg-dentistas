from django.urls import path
from . import views

app_name = 'dentistas'

urlpatterns = [
    path('api/dentistas/registro/', views.registro_dentista, name='registro_dentista'),
    path('api/especialidades/', views.listar_especialidades, name='listar_especialidades'),
]
