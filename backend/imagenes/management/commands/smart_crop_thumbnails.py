"""
Management command to apply smart cropping to existing images.
"""

from django.core.management.base import BaseCommand
from django.db.models import Q
from imagenes.models import Image
from PIL import Image as PILImage
from imagenes.smart_crop import smart_crop_and_resize
import io
import os
import time
from concurrent.futures import ThreadPoolExecutor
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Applies intelligent cropping to existing image thumbnails'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            dest='force',
            help='Force processing of all images, even if already optimized',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit the number of images to process',
        )

    def handle(self, *args, **options):
        start_time = time.time()
        force = options['force']
        limit = options.get('limit')
        
        # Query for images
        query = Q()
        if not force:
            # Only process images that are already optimized but need smart thumbnails
            query &= Q(optimized=True)
            
        images = Image.objects.filter(query)
        if limit:
            images = images[:limit]
            
        total_images = images.count()
        self.stdout.write(f"Applying smart cropping to {total_images} images...")
        
        # Process images
        processed = 0
        errors = 0
        
        def process_image(image):
            try:
                # Open the original image
                with PILImage.open(image.image.path) as img:
                    # Create thumbnail with smart cropping
                    thumbnail_size = (150, 150)
                    thumbnail_img = smart_crop_and_resize(img, thumbnail_size)
                    
                    # Save thumbnail
                    name, ext = os.path.splitext(image.filename)
                    thumbnail_path = os.path.join(os.path.dirname(image.image.path), 
                                              f"{name}_thumbnail{ext}")
                    
                    # Save the new thumbnail
                    thumbnail_img.save(thumbnail_path)
                    
                    # Update the image model
                    # Get relative path for URLs
                    rel_path = os.path.relpath(thumbnail_path, settings.MEDIA_ROOT)
                    url_path = os.path.join(settings.MEDIA_URL, rel_path).replace('\\', '/')
                    image.thumbnail_url = url_path
                    image.save(update_fields=['thumbnail_url'])
                    
                return True
            except Exception as e:
                logger.error(f"Error processing image {image.id}: {e}")
                return False
        
        # Process images in parallel
        with ThreadPoolExecutor() as executor:
            results = list(executor.map(process_image, images))
            
        # Count results
        processed = sum(1 for r in results if r)
        errors = sum(1 for r in results if not r)
        
        elapsed_time = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(
            f"Processed {processed} images in {elapsed_time:.2f} seconds "
            f"({errors} errors)"
        ))
