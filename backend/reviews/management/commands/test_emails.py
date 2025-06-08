"""
Management command to test email functionality.
"""

import logging
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.conf import settings
from reviews.email_service import email_service, EmailServiceError
from reviews.models import Review
from categorias.models import Category

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test email functionality for the reviews system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['new_review', 'approved', 'rejected', 'reported', 'helpful', 'test'],
            default='test',
            help='Type of email to test'
        )
        parser.add_argument(
            '--recipient',
            type=str,
            help='Email recipient (defaults to settings.ADMIN_EMAIL)'
        )
        parser.add_argument(
            '--create-sample',
            action='store_true',
            help='Create sample review data for testing'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🧪 Testing email functionality...')
        )

        # Check email configuration
        self._check_email_config()

        email_type = options['type']
        recipient = options['recipient'] or getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')

        try:
            if email_type == 'test':
                self._test_basic_email(recipient)
            elif email_type == 'new_review':
                self._test_new_review_email(options.get('create_sample', False))
            elif email_type == 'approved':
                self._test_approved_email()
            elif email_type == 'rejected':
                self._test_rejected_email()
            elif email_type == 'reported':
                self._test_reported_email()
            elif email_type == 'helpful':
                self._test_helpful_email()

            self.stdout.write(
                self.style.SUCCESS('✅ Email test completed successfully!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Email test failed: {str(e)}')
            )
            raise CommandError(f'Email test failed: {str(e)}')

    def _check_email_config(self):
        """Check email configuration."""
        self.stdout.write('📧 Checking email configuration...')
        
        email_backend = getattr(settings, 'EMAIL_BACKEND', 'Not set')
        self.stdout.write(f'   EMAIL_BACKEND: {email_backend}')
        
        if 'console' in email_backend.lower():
            self.stdout.write(
                self.style.WARNING('   ⚠️  Using console backend - emails will be printed to console')
            )
        elif 'smtp' in email_backend.lower():
            host = getattr(settings, 'EMAIL_HOST', 'Not set')
            port = getattr(settings, 'EMAIL_PORT', 'Not set')
            self.stdout.write(f'   EMAIL_HOST: {host}:{port}')
        
        default_from = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not set')
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'Not set')
        
        self.stdout.write(f'   DEFAULT_FROM_EMAIL: {default_from}')
        self.stdout.write(f'   ADMIN_EMAIL: {admin_email}')

    def _test_basic_email(self, recipient):
        """Test basic email sending."""
        self.stdout.write(f'📨 Testing basic email to {recipient}...')
        
        try:
            success = email_service._send_email(
                subject='Test Email - Dental ERP',
                message='This is a test email from the Dental ERP reviews system.',
                recipient_list=[recipient],
                html_message='<h2>Test Email</h2><p>This is a <strong>test email</strong> from the Dental ERP reviews system.</p>'
            )
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ Basic email sent successfully to {recipient}')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('   ❌ Failed to send basic email')
                )
                
        except EmailServiceError as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Email service error: {str(e)}')
            )

    def _test_new_review_email(self, create_sample=False):
        """Test new review notification email."""
        self.stdout.write('📝 Testing new review notification...')
        
        try:
            # Get or create a review for testing
            review = self._get_or_create_review(create_sample)
            
            success = email_service.send_new_review_notification(review)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ New review notification sent successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  New review notification was not sent (may be disabled)')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to send new review notification: {str(e)}')
            )

    def _test_approved_email(self):
        """Test review approved notification."""
        self.stdout.write('✅ Testing review approved notification...')
        
        try:
            review = self._get_or_create_review()
            review.status = 'approved'
            
            success = email_service.send_review_moderation_notification(review, 'published')
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Review approved notification sent successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Review approved notification was not sent')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to send approved notification: {str(e)}')
            )

    def _test_rejected_email(self):
        """Test review rejected notification."""
        self.stdout.write('❌ Testing review rejected notification...')
        
        try:
            review = self._get_or_create_review()
            review.status = 'rejected'
            
            success = email_service.send_review_moderation_notification(review, 'published')
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Review rejected notification sent successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Review rejected notification was not sent')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to send rejected notification: {str(e)}')
            )

    def _test_reported_email(self):
        """Test review reported notification."""
        self.stdout.write('🚨 Testing review reported notification...')
        
        try:
            from reviews.models import ReviewReport
            
            review = self._get_or_create_review()
            user = self._get_or_create_user()
            
            # Create a fake report object for testing
            class FakeReport:
                def __init__(self, review, user):
                    self.id = 1
                    self.review = review
                    self.user = user
                    self.reason = 'inappropriate'
                    self.description = 'Test report for email functionality'
                    self.created_at = review.created_at
                
                def get_reason_display(self):
                    return 'Contenido inapropiado'
            
            fake_report = FakeReport(review, user)
            
            success = email_service.send_review_report_notification(fake_report)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Review reported notification sent successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Review reported notification was not sent')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to send reported notification: {str(e)}')
            )

    def _test_helpful_email(self):
        """Test helpful vote notification."""
        self.stdout.write('👍 Testing helpful vote notification...')
        
        try:
            review = self._get_or_create_review()
            voter = self._get_or_create_user(username='voter_test')
            
            success = email_service.send_helpful_vote_notification(review, voter)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Helpful vote notification sent successfully')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('   ⚠️  Helpful vote notification was not sent (may be disabled)')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to send helpful vote notification: {str(e)}')
            )

    def _get_or_create_review(self, create_new=False):
        """Get or create a review for testing."""
        try:
            if not create_new:
                review = Review.objects.filter(status='published').first()
                if review:
                    return review
            
            # Create a new review for testing
            user = self._get_or_create_user()
            category = self._get_or_create_category()
            
            review = Review.objects.create(
                user=user,
                content_object=category,
                title='Test Review for Email',
                content='This is a test review created for email testing purposes. It contains enough content to test the email templates properly.',
                rating=4,
                status='published'
            )
            
            self.stdout.write(f'   📝 Created test review: {review.id}')
            return review
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to get/create review: {str(e)}')
            )
            raise

    def _get_or_create_user(self, username='test_reviewer'):
        """Get or create a user for testing."""
        try:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'first_name': 'Test',
                    'last_name': 'Reviewer'
                }
            )
            
            if created:
                self.stdout.write(f'   👤 Created test user: {user.username}')
            
            return user
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to get/create user: {str(e)}')
            )
            raise

    def _get_or_create_category(self):
        """Get or create a category for testing."""
        try:
            category, created = Category.objects.get_or_create(
                name='Test Category for Email',
                defaults={
                    'description': 'Category created for email testing'
                }
            )
            
            if created:
                self.stdout.write(f'   📁 Created test category: {category.name}')
            
            return category
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to get/create category: {str(e)}')
            )
            raise
