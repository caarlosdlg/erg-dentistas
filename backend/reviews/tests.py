from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta

from .models import Review, ReviewHelpful, ReviewReport, ReviewMedia
from categorias.models import Category


class ReviewModelTest(TestCase):
    """Tests para el modelo Review"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Test Category',
            description='Test category for reviews'
        )
        self.content_type = ContentType.objects.get_for_model(Category)
        
    def test_create_review(self):
        """Test crear reseña básica"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Gran categoría',
            content='Esta categoría es muy útil para organizar productos.',
            rating=5
        )
        
        self.assertEqual(review.user, self.user)
        self.assertEqual(review.content_object, self.category)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.status, 'published')
        self.assertEqual(review.star_display, '★★★★★')
        
    def test_review_constraints(self):
        """Test constraint de una reseña por usuario por objeto"""
        # Crear primera reseña
        Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Primera reseña',
            content='Contenido de la primera reseña.',
            rating=4
        )
        
        # Intentar crear segunda reseña del mismo usuario para el mismo objeto
        with self.assertRaises(Exception):
            Review.objects.create(
                user=self.user,
                content_type=self.content_type,
                object_id=str(self.category.id),
                title='Segunda reseña',
                content='Contenido de la segunda reseña.',
                rating=3
            )
    
    def test_review_permissions(self):
        """Test permisos de edición y eliminación"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Test review',
            content='Test content for review.',
            rating=4
        )
        
        # El usuario puede editar su propia reseña
        self.assertTrue(review.can_edit(self.user))
        self.assertTrue(review.can_delete(self.user))
        
        # Otro usuario no puede editar
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        self.assertFalse(review.can_edit(other_user))
        self.assertFalse(review.can_delete(other_user))
        
        # Staff puede eliminar
        staff_user = User.objects.create_user(
            username='staffuser',
            password='testpass123',
            is_staff=True
        )
        self.assertTrue(review.can_delete(staff_user))
    
    def test_review_editable_time_limit(self):
        """Test límite de tiempo para edición"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Test review',
            content='Test content for review.',
            rating=4
        )
        
        # Inicialmente es editable
        self.assertTrue(review.is_editable)
        
        # Simular que pasaron 25 horas
        review.created_at = timezone.now() - timedelta(hours=25)
        review.save()
        
        # Ya no es editable
        self.assertFalse(review.is_editable)
    
    def test_review_helpful_and_report(self):
        """Test funciones de marcar como útil y reportar"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Test review',
            content='Test content for review.',
            rating=4
        )
        
        # Marcar como útil
        review.mark_helpful()
        self.assertEqual(review.is_helpful_count, 1)
        
        # Reportar
        self.assertFalse(review.is_reported)
        review.report('spam')
        self.assertTrue(review.is_reported)
        self.assertEqual(review.report_count, 1)
        self.assertEqual(review.status, 'published')  # Aún no se auto-modera
        
        # Múltiples reportes activan auto-moderación
        review.report('inappropriate')
        review.report('fake')
        self.assertEqual(review.report_count, 3)
        self.assertEqual(review.status, 'moderated')


class ReviewAPITest(APITestCase):
    """Tests para la API de reseñas"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.staff_user = User.objects.create_user(
            username='staffuser',
            email='staff@example.com',
            password='testpass123',
            is_staff=True
        )
        
        self.category = Category.objects.create(
            name='Test Category',
            description='Test category for reviews'
        )
        self.content_type = ContentType.objects.get_for_model(Category)
        
        self.client = APIClient()
    
    def test_create_review_authenticated(self):
        """Test crear reseña como usuario autenticado"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'Excelente categoría',
            'content': 'Esta categoría me ayudó mucho a organizar mis productos dentales.',
            'rating': 5,
            'content_type_id': self.content_type.id,
            'object_id': str(self.category.id)
        }
        
        response = self.client.post('/api/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        review = Review.objects.get(id=response.data['id'])
        self.assertEqual(review.user, self.user)
        self.assertEqual(review.title, data['title'])
        self.assertEqual(review.rating, 5)
    
    def test_create_review_unauthenticated(self):
        """Test crear reseña sin autenticación"""
        data = {
            'title': 'Test review',
            'content': 'Test content',
            'rating': 4,
            'content_type_id': self.content_type.id,
            'object_id': str(self.category.id)
        }
        
        response = self.client.post('/api/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_reviews_public(self):
        """Test listar reseñas públicamente"""
        # Crear categorías adicionales para evitar constraint violations
        category2 = Category.objects.create(
            name='Test Category 2',
            description='Second test category for reviews'
        )
        
        # Crear algunas reseñas
        Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Review 1',
            content='Content 1',
            rating=5,
            status='published'
        )
        
        Review.objects.create(
            user=self.other_user,
            content_type=self.content_type,
            object_id=str(category2.id),  # Different category
            title='Review 2',
            content='Content 2',
            rating=4,
            status='approved'
        )
        
        # Reseña no visible
        Review.objects.create(
            user=self.staff_user,  # Different user
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Hidden Review',
            content='Hidden content',
            rating=3,
            status='hidden'
        )
        
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Solo las visibles
    
    def test_filter_reviews_by_object(self):
        """Test filtrar reseñas por objeto específico"""
        # Crear otra categoría
        other_category = Category.objects.create(
            name='Other Category',
            description='Another test category'
        )
        
        # Crear reseñas para diferentes objetos
        Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Review for category 1',
            content='Content 1',
            rating=5
        )
        
        Review.objects.create(
            user=self.other_user,
            content_type=self.content_type,
            object_id=str(other_category.id),
            title='Review for category 2',
            content='Content 2',
            rating=4
        )
        
        # Filtrar por primera categoría
        response = self.client.get(f'/api/reviews/?content_type={self.content_type.id}&object_id={self.category.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Review for category 1')
    
    def test_mark_review_helpful(self):
        """Test marcar reseña como útil"""
        review = Review.objects.create(
            user=self.other_user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Helpful review',
            content='Very helpful content',
            rating=5
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/reviews/{review.id}/mark_helpful/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['helpful_count'], 1)
        
        # Verificar que se creó el voto
        self.assertTrue(ReviewHelpful.objects.filter(review=review, user=self.user).exists())
    
    def test_mark_own_review_helpful_fails(self):
        """Test que no se puede marcar propia reseña como útil"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='My review',
            content='My content',
            rating=5
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/reviews/{review.id}/mark_helpful/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('No puedes marcar tu propia reseña', response.data['error'])
    
    def test_report_review(self):
        """Test reportar reseña"""
        review = Review.objects.create(
            user=self.other_user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Suspicious review',
            content='Suspicious content',
            rating=5
        )
        
        self.client.force_authenticate(user=self.user)
        data = {
            'reason': 'spam',
            'description': 'This looks like spam to me'
        }
        response = self.client.post(f'/api/reviews/{review.id}/report/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['report_count'], 1)
        
        # Verificar que se creó el reporte
        self.assertTrue(ReviewReport.objects.filter(review=review, reporter=self.user).exists())
    
    def test_review_stats(self):
        """Test endpoint de estadísticas"""
        # Crear categorías adicionales para evitar constraint violations
        categories = [self.category]
        for i in range(4):
            categories.append(Category.objects.create(
                name=f'Test Category {i+2}',
                description=f'Category {i+2} for testing stats'
            ))
        
        users = [self.user, self.other_user, self.staff_user]
        
        # Crear reseñas con diferentes calificaciones
        ratings = [5, 4, 4, 3, 2]
        for i, rating in enumerate(ratings):
            user = users[i % len(users)]
            category = categories[i % len(categories)]
            Review.objects.create(
                user=user,
                content_type=self.content_type,
                object_id=str(category.id),
                title=f'Review {rating}',
                content=f'Content {rating}',
                rating=rating,
                is_verified_purchase=(rating == 5)
            )
        
        # Test stats for all reviews (we'll test with first category)
        response = self.client.get(f'/api/reviews/stats/?content_type={self.content_type.id}&object_id={categories[0].id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        # Should have stats for the review from first category
        self.assertIn('total_reviews', data)
        self.assertIn('average_rating', data)
        self.assertIn('rating_distribution', data)
    
    def test_moderate_review_as_staff(self):
        """Test moderar reseña como staff"""
        review = Review.objects.create(
            user=self.user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Review to moderate',
            content='Content to moderate',
            rating=3,
            status='moderated'
        )
        
        self.client.force_authenticate(user=self.staff_user)
        data = {
            'status': 'approved',
            'moderation_notes': 'Review approved after verification'
        }
        response = self.client.post(f'/api/reviews/{review.id}/moderate/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        review.refresh_from_db()
        self.assertEqual(review.status, 'approved')
        self.assertEqual(review.moderated_by, self.staff_user)
        self.assertIsNotNone(review.moderated_at)
    
    def test_moderate_review_as_regular_user_fails(self):
        """Test que usuario regular no puede moderar"""
        review = Review.objects.create(
            user=self.other_user,
            content_type=self.content_type,
            object_id=str(self.category.id),
            title='Review to moderate',
            content='Content to moderate',
            rating=3
        )
        
        self.client.force_authenticate(user=self.user)
        data = {'status': 'approved'}
        response = self.client.post(f'/api/reviews/{review.id}/moderate/', data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ReviewValidationTest(TestCase):
    """Tests para validaciones de reseñas"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Test Category',
            description='Test category'
        )
        self.content_type = ContentType.objects.get_for_model(Category)
    
    def test_review_content_validation(self):
        """Test validación de contenido de reseña"""
        # Contenido muy corto
        with self.assertRaises(Exception):
            review = Review(
                user=self.user,
                content_type=self.content_type,
                object_id=str(self.category.id),
                title='Short',
                content='Short',  # Menos de 10 caracteres
                rating=5
            )
            review.full_clean()  # Esto triggerea las validaciones
        
        # Título muy corto
        with self.assertRaises(Exception):
            review = Review(
                user=self.user,
                content_type=self.content_type,
                object_id=str(self.category.id),
                title='X',  # Menos de 5 caracteres
                content='This is a valid content with more than 10 characters',
                rating=5
            )
            review.full_clean()  # Esto triggerea las validaciones
    
    def test_rating_validation(self):
        """Test validación de calificación"""
        # Calificación inválida
        with self.assertRaises(Exception):
            review = Review(
                user=self.user,
                content_type=self.content_type,
                object_id=str(self.category.id),
                title='Test title',
                content='Valid content for testing',
                rating=6  # Fuera del rango 1-5
            )
            review.full_clean()  # Esto triggerea las validaciones
