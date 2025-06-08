"""
Middleware para configurar encabezados HTTP específicos para archivos estáticos.
Este middleware establece Cache-Control y otros encabezados para optimizar el rendimiento.
"""

import re
from django.conf import settings
from pathlib import Path

# Importar configuraciones de caché
try:
    from dental_erp.cache_settings import get_cache_headers, get_cache_time_for_file
except ImportError:
    # Fallback si no existe el módulo
    def get_cache_time_for_file(file_path):
        return getattr(settings, 'STATIC_FILES_CACHE_TIMEOUT', 31536000)  # 1 año por defecto
    
    def get_cache_headers(file_path):
        cache_time = get_cache_time_for_file(file_path)
        return {
            'Cache-Control': f'public, max-age={cache_time}, immutable',
            'Vary': 'Accept-Encoding'
        }


class StaticFilesHeadersMiddleware:
    """
    Middleware que añade encabezados HTTP apropiados para archivos estáticos.
    
    Los encabezados incluyen:
    - Cache-Control: Para controlar el tiempo de caché en el navegador
    - Content-Disposition: Para gestionar la descarga de archivos
    - Vary: Para gestionar la variación de la caché según encabezados
    - ETag: Para validación condicional
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Compilar expresiones regulares para identificar tipos de archivos
        static_url_pattern = settings.STATIC_URL.lstrip('/')
        if static_url_pattern.startswith('http'):
            # Si STATIC_URL es una URL completa (CDN/S3), extraer solo el path
            static_url_pattern = Path(static_url_pattern.split('://', 1)[1].split('/', 1)[1]).parts[0]
            
        self.is_static_file = re.compile(
            r'^%s.*\.(css|js|jpe?g|gif|png|svg|webp|avif|ico|woff2?|ttf|eot|map|json)$' % static_url_pattern
        )
        self.is_image = re.compile(r'\.(jpe?g|gif|png|svg|webp|avif|ico)$', re.IGNORECASE)
        self.is_font = re.compile(r'\.(woff2?|ttf|eot)$', re.IGNORECASE)
        self.is_css_or_js = re.compile(r'\.(css|js|map)$', re.IGNORECASE)
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Solo aplicar a archivos estáticos y solo en producción
        if not settings.DEBUG and hasattr(request, 'path'):
            path = request.path.lstrip('/')
            
            # Verificar si es un archivo estático
            if self.is_static_file.match(path):
                # Obtener y aplicar encabezados de caché optimizados
                cache_headers = get_cache_headers(path)
                for header, value in cache_headers.items():
                    response[header] = value
                
                # Configurar Content-Disposition según el tipo de archivo
                if self.is_image.search(path):
                    # Las imágenes se muestran directamente
                    response['Content-Disposition'] = 'inline'
                elif self.is_font.search(path):
                    # Las fuentes también se muestran inline
                    response['Content-Disposition'] = 'inline'
                    response['Access-Control-Allow-Origin'] = '*'  # CORS para fuentes
                elif self.is_css_or_js.search(path):
                    # CSS y JS se incluyen, no se descargan
                    response['Content-Disposition'] = 'inline'
                    
                # Añadir el ETag si no existe uno
                if 'ETag' not in response:
                    response['ETag'] = f'W/"{hash(path)}"'
                    
                # Encabezados de seguridad para archivos estáticos
                if self.is_css_or_js.search(path):
                    # Politica de seguridad para JS
                    if path.endswith('.js'):
                        # Solo permitir ejecución si el hash coincide con el esperado
                        response.setdefault('Content-Security-Policy', "script-src 'self'")
                
                # Agregar Feature-Policy para limitar API del navegador
                response.setdefault('Feature-Policy', "accelerometer 'none'; camera 'none'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; payment 'none'; usb 'none'")
                
                # X-Content-Type-Options para prevenir MIME type sniffing
                response['X-Content-Type-Options'] = 'nosniff'
        
        return response
