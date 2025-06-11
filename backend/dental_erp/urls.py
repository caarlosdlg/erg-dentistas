"""
URL configuration for dental_erp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('authentication.urls')),  # URLs de autenticación
    path('', include('categorias.urls')),
    path('', include('reviews.urls')),
    path('', include('imagenes.urls')),
    path('', include('pacientes.urls')),  # URLs de pacientes
    path('', include('citas.urls')),      # URLs de citas
    path('', include('tratamientos.urls')),  # URLs de tratamientos
    path('', include('inventario.urls')), # URLs de inventario
    path('', include('dentistas.urls')),  # URLs de dentistas
    path('', include('emails.urls')),     # URLs de emails
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
