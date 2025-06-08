"""
Middleware para optimizar la salida HTML en producción.
Elimina espacios innecesarios, comentarios y realiza otras optimizaciones.
"""
import re
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class HTMLMinifyMiddleware(MiddlewareMixin):
    """
    Middleware para minificar el HTML en respuestas.
    Solo se aplica en modo producción (DEBUG=False) y solo para respuestas HTML.
    """
    
    def __init__(self, get_response=None):
        self.get_response = get_response
        # Patrones de minificación
        self.patterns = [
            (re.compile(r'>\s+<'), '><'),                      # Eliminar espacios entre tags
            (re.compile(r'\s{2,}'), ' '),                      # Reducir múltiples espacios a uno
            (re.compile(r'\n'), ''),                          # Eliminar saltos de línea
            (re.compile(r'<!--(?!<!)[^\[>].*?-->'), ''),      # Eliminar comentarios, preservar condicionales
            (re.compile(r'>\s+'), '>'),                       # Eliminar espacios después de tags
            (re.compile(r'\s+<'), '<'),                       # Eliminar espacios antes de tags
        ]
        
        # Exclusiones - no minificar estos paths
        self.exclusions = [
            re.compile(r'^/admin/'),         # Excluir admin
            re.compile(r'^/static/'),        # Excluir archivos estáticos
            re.compile(r'^/media/'),         # Excluir media
            re.compile(r'\.txt$'),           # Excluir archivos .txt
            re.compile(r'\.xml$'),           # Excluir archivos XML
            re.compile(r'\.json$'),          # Excluir JSON
        ]
        
        # Considerar solo estas Content-Types
        self.html_types = [
            'text/html', 
            'application/xhtml+xml'
        ]
        
    def process_response(self, request, response):
        """
        Procesa la respuesta para minificar el HTML.
        Solo aplica a respuestas HTML en modo producción.
        """
        # No minificar en modo debug
        if settings.DEBUG:
            return response
            
        # Verificar si el path está excluido
        path = request.path_info
        if any(pattern.search(path) for pattern in self.exclusions):
            return response
            
        # Verificar si es una respuesta HTML
        content_type = response.get('Content-Type', '')
        if not any(html_type in content_type for html_type in self.html_types):
            return response
            
        # Si el status no es 200, no minificar
        if response.status_code != 200:
            return response

        # Minificar el contenido
        if hasattr(response, 'content') and isinstance(response.content, bytes):
            try:
                content = response.content.decode('utf-8')
                for pattern, replacement in self.patterns:
                    content = pattern.sub(replacement, content)
                response.content = content.encode('utf-8')
                
                # Actualizar Content-Length
                response['Content-Length'] = str(len(response.content))
            except (UnicodeDecodeError, AttributeError):
                # Si no se puede decodificar, dejar el contenido original
                pass
                
        return response
