from django.core.management.base import BaseCommand, CommandError
from imagenes.models import Image
from django.core.files.storage import default_storage
from django.db.models import Q
import os
import time


class Command(BaseCommand):
    help = 'Optimiza las imágenes existentes, generando thumbnails y versiones WebP'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--content-type', 
            dest='content_type',
            help='Filtrar por tipo de contenido (paciente, dentista, etc.)'
        )
        parser.add_argument(
            '--object-id',
            dest='object_id',
            help='Filtrar por ID de objeto'
        )
        parser.add_argument(
            '--force', 
            action='store_true',
            help='Forzar regeneración incluso para imágenes ya optimizadas'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar qué se haría sin hacer cambios'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limitar el número de imágenes a procesar'
        )
    
    def handle(self, *args, **options):
        content_type = options.get('content_type')
        object_id = options.get('object_id')
        force = options.get('force')
        dry_run = options.get('dry_run')
        limit = options.get('limit')
        
        # Construir la consulta base
        query = Q()
        
        # Si no se fuerza la regeneración, solo procesar imágenes no optimizadas
        if not force:
            query &= Q(optimized=False)
        
        # Filtrar por tipo de contenido si se especifica
        if content_type:
            query &= Q(content_type=content_type)
            
        # Filtrar por ID de objeto si se especifica
        if object_id:
            query &= Q(object_id=object_id)
        
        # Obtener las imágenes a procesar
        images = Image.objects.filter(query)
        
        # Limitar si es necesario
        if limit:
            images = images[:limit]
        
        # Contar el total
        total = images.count()
        
        if dry_run:
            self.stdout.write(f"Se procesarían {total} imágenes")
            for img in images:
                self.stdout.write(f"- {img.id}: {img.title or 'Sin título'} ({img.content_type})")
            return
        
        if total == 0:
            self.stdout.write(self.style.WARNING("No se encontraron imágenes para optimizar"))
            return
        
        self.stdout.write(f"Procesando {total} imágenes...")
        
        processed = 0
        errors = 0
        start_time = time.time()
        
        # Procesar cada imagen
        for img in images:
            try:
                self.stdout.write(f"Procesando imagen {img.id}...", ending='')
                
                # Verificar que el archivo existe
                if not default_storage.exists(img.image.name):
                    self.stdout.write(self.style.ERROR(" ERROR: Archivo no encontrado"))
                    errors += 1
                    continue
                
                # Generar versiones optimizadas
                result = img.generate_optimized_versions(force=True)
                
                if result:
                    self.stdout.write(self.style.SUCCESS(" OPTIMIZADA"))
                    processed += 1
                else:
                    self.stdout.write(self.style.ERROR(" ERROR: No se pudo optimizar"))
                    errors += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f" ERROR: {str(e)}"))
                errors += 1
        
        # Calcular tiempo total
        elapsed_time = time.time() - start_time
        
        # Mostrar resumen
        self.stdout.write("\nResumen de optimización:")
        self.stdout.write(f"- Imágenes procesadas: {processed}")
        self.stdout.write(f"- Errores: {errors}")
        self.stdout.write(f"- Tiempo total: {elapsed_time:.2f} segundos")
        
        if processed > 0:
            self.stdout.write(self.style.SUCCESS(f"\nOptimización completada con éxito para {processed} imágenes"))
        else:
            self.stdout.write(self.style.ERROR("\nNo se pudo optimizar ninguna imagen"))
