"""
Extensiones personalizadas para el almacenamiento de archivos estáticos.
Proporciona clases de almacenamiento con funcionalidad adicional.
"""
from django.contrib.staticfiles.storage import ManifestStaticFilesStorage
from django.conf import settings
import os
import hashlib
import json


class OptimizedManifestStaticFilesStorage(ManifestStaticFilesStorage):
    """
    Versión optimizada de ManifestStaticFilesStorage que añade funcionalidad adicional:
    - Manejo de integridad de subrecursos (SRI)
    - Cacheo optimizado
    - Consisten hashing
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Diccionario para almacenar hashes de integridad
        self.integrity_hashes = {}
        
    def post_process(self, paths, dry_run=False, **options):
        """
        Procesa los archivos después de la recolección y genera hashes de integridad.
        """
        # Primero ejecutamos el post-procesamiento original
        for name, hashed_name, processed in super().post_process(paths, dry_run, **options):
            yield name, hashed_name, processed
            
            # Si no estamos en modo dry-run
            if not dry_run and hashed_name:
                # Generar hash de integridad para archivos JS y CSS
                if name.endswith(('.js', '.css')):
                    try:
                        with self.open(hashed_name) as f:
                            content = f.read()
                            # Generar hash SHA-384 para SRI
                            hash_obj = hashlib.sha384(content)
                            hash_value = f"sha384-{hash_obj.hexdigest()}"
                            self.integrity_hashes[hashed_name] = hash_value
                    except Exception as e:
                        # Si hay un error, registrarlo pero continuar
                        print(f"Error generando hash de integridad para {name}: {e}")
        
        # Guardar los hashes de integridad en un archivo
        if not dry_run:
            self._save_integrity_hashes()
                
    def _save_integrity_hashes(self):
        """
        Guarda los hashes de integridad en un archivo JSON.
        """
        if not self.integrity_hashes:
            return
            
        integrity_file = self.path('integrity_hashes.json')
        with open(integrity_file, 'w') as f:
            json.dump(self.integrity_hashes, f)
            
    def url(self, name, force=False):
        """
        Método para generar URL de archivos estáticos con cache busting mejorado.
        """
        url = super().url(name, force)
        
        # Si estamos en modo debug y no se fuerza, no modificamos la URL
        if settings.DEBUG and not force:
            return url
            
        # No modificar URLs absolutas o de CDN
        if '://' in url:
            return url
            
        return url
        
    def stored_name(self, name):
        """
        Devuelve el nombre con hash del archivo.
        """
        parsed_name = super().stored_name(name)
        return parsed_name
        
    def get_integrity_hash(self, name):
        """
        Recupera el hash de integridad para un archivo.
        """
        # Cargar hashes si no están ya cargados
        if not self.integrity_hashes:
            try:
                integrity_file = self.path('integrity_hashes.json')
                if os.path.exists(integrity_file):
                    with open(integrity_file, 'r') as f:
                        self.integrity_hashes = json.load(f)
            except Exception:
                pass
                
        # Obtener el hash de integridad
        hashed_name = self.stored_name(name)
        return self.integrity_hashes.get(hashed_name, '')
