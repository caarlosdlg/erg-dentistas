"""
Django signals for automatic email notifications in the reviews app.
"""

import logging
from django.db.models.signals import post_save, pre_save, m2m_changed
from django.dispatch import receiver
from django.conf import settings
from .models import Review, ReviewReport, ReviewHelpful
from .email_service import email_service

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Review)
def handle_review_created(sender, instance, created, **kwargs):
    """
    Send notification when a new review is created.
    """
    if created:
        try:
            # Only send notification for non-draft reviews
            if instance.status != 'draft':
                email_service.send_new_review_notification(instance)
                logger.info(f"New review notification sent for review {instance.id}")
        except Exception as e:
            logger.error(f"Failed to send new review notification for {instance.id}: {str(e)}")


@receiver(pre_save, sender=Review)
def handle_review_status_change(sender, instance, **kwargs):
    """
    Capture the old status before saving to detect status changes.
    """
    if instance.pk:  # Only for existing objects
        try:
            old_instance = Review.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Review.DoesNotExist:
            instance._old_status = None


@receiver(post_save, sender=Review)
def handle_review_moderation(sender, instance, created, **kwargs):
    """
    Send notification when a review's moderation status changes.
    """
    if not created and hasattr(instance, '_old_status'):
        old_status = instance._old_status
        new_status = instance.status
        
        # Check if status actually changed and it's a moderation change
        if (old_status != new_status and 
            old_status in ['draft', 'published', 'moderated'] and
            new_status in ['approved', 'rejected', 'hidden']):
            
            try:
                email_service.send_review_moderation_notification(instance, old_status)
                logger.info(f"Moderation notification sent for review {instance.id}: {old_status} -> {new_status}")
            except Exception as e:
                logger.error(f"Failed to send moderation notification for {instance.id}: {str(e)}")


@receiver(post_save, sender=ReviewReport)
def handle_review_reported(sender, instance, created, **kwargs):
    """
    Send notification when a review is reported.
    """
    if created:
        try:
            email_service.send_review_report_notification(instance)
            logger.info(f"Report notification sent for review {instance.review.id}")
        except Exception as e:
            logger.error(f"Failed to send report notification for {instance.id}: {str(e)}")


@receiver(m2m_changed, sender=ReviewHelpful)
def handle_helpful_vote(sender, instance, action, pk_set, **kwargs):
    """
    Send notification when someone marks a review as helpful.
    """
    if action == 'post_add' and pk_set:
        try:
            from django.contrib.auth.models import User
            for user_id in pk_set:
                voter = User.objects.get(pk=user_id)
                email_service.send_helpful_vote_notification(instance, voter)
                logger.info(f"Helpful vote notification sent for review {instance.id}")
        except Exception as e:
            logger.error(f"Failed to send helpful vote notification: {str(e)}")


# Email test signal for debugging
@receiver(post_save, sender=Review)
def debug_email_signal(sender, instance, created, **kwargs):
    """
    Debug signal to test email functionality.
    Only active in DEBUG mode.
    """
    if getattr(settings, 'DEBUG', False) and created:
        logger.debug(f"DEBUG: Review created signal fired for {instance.id}")
        logger.debug(f"Email notifications enabled: {getattr(settings, 'SEND_REVIEW_NOTIFICATIONS', True)}")
        logger.debug(f"Email backend: {getattr(settings, 'EMAIL_BACKEND', 'Not set')}")
