"""
Management command for sending bulk email notifications.
"""

import logging
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from reviews.email_service import email_service
from reviews.models import Review

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send bulk email notifications for reviews system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['weekly_digest', 'bulk_notification', 'reminder'],
            default='weekly_digest',
            help='Type of bulk email to send'
        )
        parser.add_argument(
            '--subject',
            type=str,
            help='Subject for bulk notification (required for bulk_notification type)'
        )
        parser.add_argument(
            '--message',
            type=str,
            help='Message for bulk notification (required for bulk_notification type)'
        )
        parser.add_argument(
            '--recipients',
            type=str,
            nargs='+',
            help='List of email recipients (for bulk_notification type)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Perform a dry run without actually sending emails'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('📧 Starting bulk email operation...')
        )

        email_type = options['type']
        dry_run = options.get('dry_run', False)

        if dry_run:
            self.stdout.write(
                self.style.WARNING('🔍 DRY RUN MODE - No emails will be sent')
            )

        try:
            if email_type == 'weekly_digest':
                self._send_weekly_digest(dry_run)
            elif email_type == 'bulk_notification':
                self._send_bulk_notification(options, dry_run)
            elif email_type == 'reminder':
                self._send_reminders(dry_run)

            self.stdout.write(
                self.style.SUCCESS('✅ Bulk email operation completed successfully!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Bulk email operation failed: {str(e)}')
            )
            raise CommandError(f'Bulk email operation failed: {str(e)}')

    def _send_weekly_digest(self, dry_run=False):
        """Send weekly digest to administrators."""
        self.stdout.write('📊 Preparing weekly digest...')
        
        try:
            # Get reviews from the last week
            week_ago = timezone.now() - timedelta(days=7)
            recent_reviews = Review.objects.filter(
                created_at__gte=week_ago
            ).select_related('user')
            
            total_reviews = recent_reviews.count()
            
            if total_reviews == 0:
                self.stdout.write(
                    self.style.WARNING('   ℹ️  No reviews found for the last week - digest not sent')
                )
                return
            
            self.stdout.write(f'   📈 Found {total_reviews} reviews from the last week')
            
            # Calculate statistics
            approved_reviews = recent_reviews.filter(status='approved').count()
            pending_reviews = recent_reviews.filter(status='published').count()
            
            # Show statistics
            self.stdout.write(f'   ✅ Approved: {approved_reviews}')
            self.stdout.write(f'   ⏳ Pending: {pending_reviews}')
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING('   🔍 DRY RUN - Weekly digest would be sent to administrators')
                )
            else:
                success = email_service.send_weekly_review_digest()
                if success:
                    self.stdout.write(
                        self.style.SUCCESS('   ✅ Weekly digest sent successfully')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR('   ❌ Failed to send weekly digest')
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Error preparing weekly digest: {str(e)}')
            )
            raise

    def _send_bulk_notification(self, options, dry_run=False):
        """Send bulk notification to specified recipients."""
        self.stdout.write('📢 Preparing bulk notification...')
        
        subject = options.get('subject')
        message = options.get('message')
        recipients = options.get('recipients', [])
        
        if not subject:
            raise CommandError('Subject is required for bulk notification')
        if not message:
            raise CommandError('Message is required for bulk notification')
        if not recipients:
            raise CommandError('Recipients list is required for bulk notification')
        
        self.stdout.write(f'   📧 Subject: {subject}')
        self.stdout.write(f'   📝 Message: {message[:100]}...')
        self.stdout.write(f'   👥 Recipients: {len(recipients)} emails')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'   🔍 DRY RUN - Bulk notification would be sent to {len(recipients)} recipients')
            )
            for recipient in recipients:
                self.stdout.write(f'     - {recipient}')
        else:
            sent_count = email_service.send_bulk_notification(
                subject=subject,
                message=message,
                recipient_list=recipients
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'   ✅ Bulk notification sent to {sent_count}/{len(recipients)} recipients')
            )

    def _send_reminders(self, dry_run=False):
        """Send reminders to users with pending actions."""
        self.stdout.write('⏰ Preparing reminder emails...')
        
        try:
            # Find users with reviews in draft status for more than 7 days
            week_ago = timezone.now() - timedelta(days=7)
            
            draft_reviews = Review.objects.filter(
                status='draft',
                created_at__lte=week_ago
            ).select_related('user')
            
            # Group by user
            users_with_drafts = {}
            for review in draft_reviews:
                user_email = review.user.email
                if user_email:
                    if user_email not in users_with_drafts:
                        users_with_drafts[user_email] = []
                    users_with_drafts[user_email].append(review)
            
            if not users_with_drafts:
                self.stdout.write(
                    self.style.WARNING('   ℹ️  No users with pending draft reviews found')
                )
                return
            
            self.stdout.write(f'   👥 Found {len(users_with_drafts)} users with draft reviews')
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING('   🔍 DRY RUN - Reminders would be sent to:')
                )
                for email, reviews in users_with_drafts.items():
                    self.stdout.write(f'     - {email} ({len(reviews)} draft reviews)')
            else:
                sent_count = 0
                for email, reviews in users_with_drafts.items():
                    try:
                        # Create reminder message
                        subject = "Tienes reseñas pendientes por completar"
                        message = f"""
Hola,

Tienes {len(reviews)} reseña(s) en borrador que han estado pendientes por más de una semana:

{chr(10).join([f"- {review.title}" for review in reviews])}

Te invitamos a completar y publicar tus reseñas para que otros usuarios puedan beneficiarse de tu experiencia.

Saludos,
Equipo de Dental ERP
                        """.strip()
                        
                        success = email_service._send_email(
                            subject=subject,
                            message=message,
                            recipient_list=[email]
                        )
                        
                        if success:
                            sent_count += 1
                            
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'     ❌ Failed to send reminder to {email}: {str(e)}')
                        )
                
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ Reminders sent to {sent_count}/{len(users_with_drafts)} users')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Error preparing reminders: {str(e)}')
            )
            raise
