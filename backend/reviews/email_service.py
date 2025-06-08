"""
Email service module for the reviews app.
Handles all email notifications related to reviews functionality.
"""

import logging
from typing import List, Optional, Dict, Any
from django.conf import settings
from django.core.mail import send_mail, send_mass_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from .models import Review, ReviewReport

logger = logging.getLogger(__name__)


class EmailServiceError(Exception):
    """Custom exception for email service errors."""
    pass


class EmailService:
    """
    Service class for handling all email notifications in the reviews system.
    
    Features:
    - Review notifications (new reviews, moderation, etc.)
    - Template-based emails with HTML/text versions
    - Bulk email sending
    - Error handling and logging
    - Rate limiting and spam prevention
    """
    
    def __init__(self):
        self.from_email = getattr(settings, 'NOTIFICATION_EMAIL_FROM', settings.DEFAULT_FROM_EMAIL)
        self.admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')
        self.subject_prefix = getattr(settings, 'EMAIL_SUBJECT_PREFIX', '[Dental ERP] ')
        
    def _send_email(
        self, 
        subject: str, 
        message: str, 
        recipient_list: List[str],
        html_message: Optional[str] = None,
        fail_silently: bool = False
    ) -> bool:
        """
        Internal method to send email with error handling.
        
        Args:
            subject: Email subject
            message: Plain text message
            recipient_list: List of recipient emails
            html_message: Optional HTML version of the message
            fail_silently: Whether to suppress email errors
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            if not recipient_list:
                logger.warning("No recipients provided for email")
                return False
                
            # Add subject prefix
            full_subject = f"{self.subject_prefix}{subject}"
            
            # Send email
            if html_message:
                email = EmailMultiAlternatives(
                    subject=full_subject,
                    body=message,
                    from_email=self.from_email,
                    to=recipient_list
                )
                email.attach_alternative(html_message, "text/html")
                result = email.send(fail_silently=fail_silently)
            else:
                result = send_mail(
                    subject=full_subject,
                    message=message,
                    from_email=self.from_email,
                    recipient_list=recipient_list,
                    fail_silently=fail_silently,
                    html_message=html_message
                )
            
            logger.info(f"Email sent successfully to {len(recipient_list)} recipients: {subject}")
            return bool(result)
            
        except Exception as e:
            logger.error(f"Failed to send email '{subject}': {str(e)}")
            if not fail_silently:
                raise EmailServiceError(f"Failed to send email: {str(e)}")
            return False
    
    def _render_email_template(
        self, 
        template_name: str, 
        context: Dict[str, Any]
    ) -> tuple[str, str]:
        """
        Render email template to HTML and text versions.
        
        Args:
            template_name: Template name without extension
            context: Template context variables
            
        Returns:
            tuple: (html_content, text_content)
        """
        try:
            # Add common context variables
            context.update({
                'site_name': 'Dental ERP',
                'site_url': 'http://localhost:8000',  # TODO: Make this configurable
                'current_year': timezone.now().year,
            })
            
            # Render HTML version
            html_content = render_to_string(f'emails/{template_name}.html', context)
            
            # Generate text version from HTML
            text_content = strip_tags(html_content)
            
            return html_content, text_content
            
        except Exception as e:
            logger.error(f"Failed to render email template '{template_name}': {str(e)}")
            raise EmailServiceError(f"Template rendering failed: {str(e)}")
    
    def send_new_review_notification(self, review: Review) -> bool:
        """
        Send notification when a new review is created.
        
        Args:
            review: The newly created review
            
        Returns:
            bool: True if notification was sent successfully
        """
        if not getattr(settings, 'SEND_REVIEW_NOTIFICATIONS', True):
            logger.info("Review notifications are disabled")
            return False
            
        try:
            # Get recipients (admins and content object owner if applicable)
            recipients = []
            
            # Add admin email
            if self.admin_email:
                recipients.append(self.admin_email)
            
            # TODO: Add content object owner email if applicable
            # For example, if reviewing a dentist, notify the dentist
            
            if not recipients:
                logger.warning(f"No recipients found for new review notification: {review.id}")
                return False
            
            # Prepare context
            context = {
                'review': review,
                'user': review.user,
                'content_object': review.content_object,
                'rating_stars': '★' * review.rating + '☆' * (5 - review.rating),
            }
            
            # Render email
            html_content, text_content = self._render_email_template('new_review_notification', context)
            
            # Send email
            subject = f"Nueva reseña: {review.title}"
            return self._send_email(
                subject=subject,
                message=text_content,
                recipient_list=recipients,
                html_message=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send new review notification for review {review.id}: {str(e)}")
            return False
    
    def send_review_moderation_notification(self, review: Review, old_status: str) -> bool:
        """
        Send notification when a review's moderation status changes.
        
        Args:
            review: The review that was moderated
            old_status: Previous status of the review
            
        Returns:
            bool: True if notification was sent successfully
        """
        if not getattr(settings, 'SEND_MODERATION_NOTIFICATIONS', True):
            logger.info("Moderation notifications are disabled")
            return False
            
        try:
            # Notify the review author
            recipients = [review.user.email] if review.user.email else []
            
            if not recipients:
                logger.warning(f"No email found for review author: {review.user.username}")
                return False
            
            # Prepare context
            context = {
                'review': review,
                'user': review.user,
                'old_status': old_status,
                'new_status': review.status,
                'status_display': review.get_status_display(),
            }
            
            # Render email based on new status
            if review.status == 'approved':
                template_name = 'review_approved'
                subject = "Tu reseña ha sido aprobada"
            elif review.status == 'rejected':
                template_name = 'review_rejected'
                subject = "Tu reseña ha sido rechazada"
            else:
                template_name = 'review_status_changed'
                subject = f"Estado de tu reseña actualizado: {review.get_status_display()}"
            
            html_content, text_content = self._render_email_template(template_name, context)
            
            # Send email
            return self._send_email(
                subject=subject,
                message=text_content,
                recipient_list=recipients,
                html_message=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send moderation notification for review {review.id}: {str(e)}")
            return False
    
    def send_review_report_notification(self, report: ReviewReport) -> bool:
        """
        Send notification when a review is reported.
        
        Args:
            report: The review report
            
        Returns:
            bool: True if notification was sent successfully
        """
        try:
            # Notify admins
            recipients = [self.admin_email] if self.admin_email else []
            
            if not recipients:
                logger.warning("No admin email configured for report notifications")
                return False
            
            # Prepare context
            context = {
                'report': report,
                'review': report.review,
                'reporter': report.user,
                'reported_user': report.review.user,
            }
            
            # Render email
            html_content, text_content = self._render_email_template('review_reported', context)
            
            # Send email
            subject = f"Reseña reportada: {report.review.title}"
            return self._send_email(
                subject=subject,
                message=text_content,
                recipient_list=recipients,
                html_message=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send report notification for report {report.id}: {str(e)}")
            return False
    
    def send_helpful_vote_notification(self, review: Review, voter: User) -> bool:
        """
        Send notification when someone marks a review as helpful.
        
        Args:
            review: The review that was marked helpful
            voter: The user who voted
            
        Returns:
            bool: True if notification was sent successfully
        """
        if not getattr(settings, 'SEND_HELPFUL_NOTIFICATIONS', False):
            logger.info("Helpful vote notifications are disabled")
            return False
            
        try:
            # Notify the review author
            recipients = [review.user.email] if review.user.email else []
            
            if not recipients:
                logger.warning(f"No email found for review author: {review.user.username}")
                return False
            
            # Don't notify if the voter is the same as the review author
            if voter == review.user:
                return False
            
            # Prepare context
            context = {
                'review': review,
                'review_author': review.user,
                'voter': voter,
                'helpful_count': review.helpful_count,
            }
            
            # Render email
            html_content, text_content = self._render_email_template('helpful_vote', context)
            
            # Send email
            subject = "Tu reseña fue marcada como útil"
            return self._send_email(
                subject=subject,
                message=text_content,
                recipient_list=recipients,
                html_message=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send helpful vote notification for review {review.id}: {str(e)}")
            return False
    
    def send_bulk_notification(
        self, 
        subject: str, 
        message: str,
        recipient_list: List[str],
        html_message: Optional[str] = None
    ) -> int:
        """
        Send bulk notification to multiple recipients.
        
        Args:
            subject: Email subject
            message: Plain text message
            recipient_list: List of recipient emails
            html_message: Optional HTML version
            
        Returns:
            int: Number of emails sent successfully
        """
        try:
            if not recipient_list:
                logger.warning("No recipients provided for bulk notification")
                return 0
            
            # Chunk recipients to avoid overwhelming the email server
            chunk_size = 50
            total_sent = 0
            
            for i in range(0, len(recipient_list), chunk_size):
                chunk = recipient_list[i:i + chunk_size]
                
                if self._send_email(
                    subject=subject,
                    message=message,
                    recipient_list=chunk,
                    html_message=html_message,
                    fail_silently=True
                ):
                    total_sent += len(chunk)
            
            logger.info(f"Bulk notification sent to {total_sent}/{len(recipient_list)} recipients")
            return total_sent
            
        except Exception as e:
            logger.error(f"Failed to send bulk notification: {str(e)}")
            return 0
    
    def send_weekly_review_digest(self) -> bool:
        """
        Send weekly digest of reviews to administrators.
        
        Returns:
            bool: True if digest was sent successfully
        """
        try:
            # Get reviews from the last week
            week_ago = timezone.now() - timedelta(days=7)
            recent_reviews = Review.objects.filter(
                created_at__gte=week_ago
            ).select_related('user').order_by('-created_at')
            
            if not recent_reviews.exists():
                logger.info("No recent reviews for weekly digest")
                return True
            
            # Prepare context
            context = {
                'reviews': recent_reviews,
                'week_start': week_ago,
                'week_end': timezone.now(),
                'total_reviews': recent_reviews.count(),
                'average_rating': recent_reviews.aggregate(
                    avg_rating=models.Avg('rating')
                )['avg_rating'] or 0,
            }
            
            # Render email
            html_content, text_content = self._render_email_template('weekly_digest', context)
            
            # Send to admins
            recipients = [self.admin_email] if self.admin_email else []
            
            if not recipients:
                logger.warning("No admin email configured for weekly digest")
                return False
            
            subject = f"Resumen semanal de reseñas - {recent_reviews.count()} nuevas reseñas"
            return self._send_email(
                subject=subject,
                message=text_content,
                recipient_list=recipients,
                html_message=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send weekly review digest: {str(e)}")
            return False


# Global instance
email_service = EmailService()
