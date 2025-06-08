from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.db import models
from datetime import timedelta
import random

from reviews.models import Review, ReviewHelpful, ReviewReport
from categorias.models import Category


class Command(BaseCommand):
    help = 'Crear reseñas de ejemplo para testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Número de reseñas a crear'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar reseñas existentes antes de crear nuevas'
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Limpiando reseñas existentes...')
            Review.objects.all().delete()
            ReviewHelpful.objects.all().delete()
            ReviewReport.objects.all().delete()
        
        # Obtener o crear usuarios de ejemplo
        users = []
        for i in range(5):
            user, created = User.objects.get_or_create(
                username=f'reviewer{i+1}',
                defaults={
                    'email': f'reviewer{i+1}@example.com',
                    'first_name': f'Reviewer',
                    'last_name': f'{i+1}',
                    'is_active': True
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)
        
        # Obtener categorías existentes
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write(self.style.WARNING('No hay categorías disponibles. Creando algunas...'))
            # Crear categorías de ejemplo si no existen
            categories = [
                Category.objects.create(
                    name='Instrumentos Básicos',
                    description='Instrumentos dentales básicos'
                ),
                Category.objects.create(
                    name='Equipos de Rayos X',
                    description='Equipos para radiografías dentales'
                ),
                Category.objects.create(
                    name='Materiales de Restauración',
                    description='Materiales para restauraciones dentales'
                )
            ]
        
        content_type = ContentType.objects.get_for_model(Category)
        
        # Títulos y contenidos de ejemplo
        sample_reviews = [
            {
                'title': 'Excelente calidad de productos',
                'content': 'Esta categoría tiene productos de muy buena calidad. Los instrumentos son duraderos y funcionan perfectamente en mi consulta dental. Muy recomendado para colegas dentistas.',
                'rating': 5
            },
            {
                'title': 'Buena relación calidad-precio',
                'content': 'Los productos de esta categoría ofrecen una buena relación calidad-precio. No son los más baratos del mercado, pero la calidad justifica el costo. Los he estado usando por 6 meses sin problemas.',
                'rating': 4
            },
            {
                'title': 'Productos confiables',
                'content': 'He comprado varios productos de esta categoría y todos han cumplido con mis expectativas. La entrega fue rápida y el empaque muy cuidadoso. Definitivamente volveré a comprar.',
                'rating': 4
            },
            {
                'title': 'Cumple expectativas básicas',
                'content': 'Los productos funcionan bien para uso básico. No son extraordinarios pero cumplen su función. Para un consultorio que está iniciando puede ser una buena opción por el precio.',
                'rating': 3
            },
            {
                'title': 'Excelente para profesionales',
                'content': 'Como dentista con 15 años de experiencia, puedo decir que estos productos son de calidad profesional. La precisión y durabilidad son excepcionales. Totalmente recomendados.',
                'rating': 5
            },
            {
                'title': 'Buena experiencia de compra',
                'content': 'La categoría está bien organizada y es fácil encontrar lo que necesitas. Los productos llegaron en perfecto estado y funcionan como se describe. Buen servicio al cliente.',
                'rating': 4
            },
            {
                'title': 'Productos innovadores',
                'content': 'Me gusta que esta categoría incluye productos con tecnología moderna. He probado algunos equipos nuevos y la diferencia en eficiencia es notable. Vale la pena la inversión.',
                'rating': 5
            },
            {
                'title': 'Regular, podría mejorar',
                'content': 'Los productos son decentes pero he visto mejor calidad en otras marcas por el mismo precio. El servicio post-venta también podría ser mejor. No es malo, pero tampoco excepcional.',
                'rating': 3
            },
            {
                'title': 'Muy satisfecho con la compra',
                'content': 'Compré varios instrumentos de esta categoría para equipar mi nueva clínica y estoy muy contento. La calidad es consistente y el precio competitivo. Excelente atención al cliente.',
                'rating': 4
            },
            {
                'title': 'Productos de alta gama',
                'content': 'Esta categoría definitivamente está orientada a profesionales que buscan lo mejor. Los materiales son premium y los resultados en mis pacientes han sido excelentes. Lo recomiendo 100%.',
                'rating': 5
            }
        ]
        
        self.stdout.write(f'Creando {options["count"]} reseñas de ejemplo...')
        
        created_reviews = []
        for i in range(options['count']):
            try:
                # Seleccionar datos aleatorios
                user = random.choice(users)
                category = random.choice(categories)
                review_data = random.choice(sample_reviews)
                
                # Verificar que el usuario no tenga ya una reseña para esta categoría
                existing_review = Review.objects.filter(
                    user=user,
                    content_type=content_type,
                    object_id=str(category.id)
                ).first()
                
                if existing_review:
                    continue  # Saltar si ya existe
                
                # Crear reseña
                review = Review.objects.create(
                    user=user,
                    content_type=content_type,
                    object_id=str(category.id),
                    title=review_data['title'],
                    content=review_data['content'],
                    rating=review_data['rating'],
                    status=random.choice(['published', 'approved', 'published', 'approved']),  # Más probabilidad de aprobadas
                    is_verified_purchase=random.choice([True, False, True]),  # Más probabilidad de verificadas
                    created_at=timezone.now() - timedelta(days=random.randint(1, 90))
                )
                
                created_reviews.append(review)
                
                # Agregar algunos votos "útil" aleatorios
                if random.choice([True, False]):
                    helpful_users = random.sample(
                        [u for u in users if u != review.user],
                        k=random.randint(1, min(3, len(users)-1))
                    )
                    for helpful_user in helpful_users:
                        ReviewHelpful.objects.get_or_create(
                            review=review,
                            user=helpful_user
                        )
                        review.is_helpful_count += 1
                    review.save(update_fields=['is_helpful_count'])
                
                # Agregar algunos reportes aleatorios (pocos)
                if random.randint(1, 10) == 1:  # 10% de probabilidad
                    reporter = random.choice([u for u in users if u != review.user])
                    ReviewReport.objects.get_or_create(
                        review=review,
                        reporter=reporter,
                        defaults={
                            'reason': random.choice(['spam', 'inappropriate', 'fake']),
                            'description': 'Reporte generado automáticamente para testing'
                        }
                    )
                    review.report_count += 1
                    review.is_reported = True
                    review.save(update_fields=['report_count', 'is_reported'])
                
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Error creando reseña {i+1}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Se crearon {len(created_reviews)} reseñas de ejemplo exitosamente.'
            )
        )
        
        # Mostrar estadísticas
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(
            avg_rating=models.Avg('rating')
        )['avg_rating']
        
        self.stdout.write(f'Total de reseñas en el sistema: {total_reviews}')
        self.stdout.write(f'Calificación promedio: {avg_rating:.2f}' if avg_rating else 'N/A')
        
        # Mostrar distribución por categoría
        self.stdout.write('\nDistribución por categoría:')
        for category in categories:
            count = Review.objects.filter(
                content_type=content_type,
                object_id=str(category.id)
            ).count()
            if count > 0:
                self.stdout.write(f'  {category.name}: {count} reseñas')
