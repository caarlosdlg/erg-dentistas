from django.urls import path
from . import views

app_name = 'emails'

urlpatterns = [
    path('api/emails/send-welcome/', views.send_welcome_email, name='send_welcome_email'),
    path('api/emails/send-reminder/', views.send_reminder_email, name='send_reminder_email'),
    path('api/emails/send-general/', views.send_general_email, name='send_general_email'),
]
